// Tests for the production state machine and brief normalization.
//   node --test pipeline/production/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { normalize, packagesFromSite } from './normalize-brief.mjs';
import { create, next, start, done, fail, approve, authorize, reopen, blockedBy, MAX_ROUNDS, STAGES } from './production.mjs';

const example = JSON.parse(readFileSync(new URL('./examples/brief.example.json', import.meta.url), 'utf8'));
const project = () => normalize(structuredClone(example));
// a project folder where every stage output exists
function folder() {
  const dir = mkdtempSync(join(tmpdir(), 'prod-'));
  for (const s of STAGES) for (const o of s.outputs) { mkdirSync(join(dir, o, '..'), { recursive: true }); writeFileSync(join(dir, o), 'x'); }
  return dir;
}
const run = (st, id, dir) => { start(st, id); done(st, id, [], dir); };
function throughPlan(st, dir) {
  for (const id of ['intake', 'strategy', 'ux', 'copy', 'visual', 'tech']) run(st, id, dir);
  approve(st, 'plan-approval', 'owner');
}

test('packages come from site.ts', () => {
  const p = packagesFromSite();
  assert.equal(p.landing.price, 1750);
  assert.equal(p.website.pages, 5);
  assert.equal(p.websiteplus.sections, 70);
});

test('a complete brief is ready to plan, with scope measured against the package', () => {
  const p = project();
  assert.deepEqual(p.intake.blockers, []);
  assert.equal(p.package.id, 'landing');
  assert.equal(p.scope.sections, 8);
  assert.equal(p.scope.over, false);
  assert.equal(p.direction.ideal[0], 'https://www.st-john.co.uk');
});

test('missing required fields block intake; "not sure" gets a suggested package to confirm', () => {
  const b = structuredClone(example);
  b.project.company = '';
  b.project.product = 'unsure';
  const p = normalize(b);
  assert.ok(p.intake.blockers.some((x) => x.startsWith('project.company')));
  assert.equal(p.inferred.package.value, 'landing');
  assert.ok(p.intake.blockers.some((x) => x.startsWith('package to confirm')));
  assert.equal(p.intake.ready_to_plan, false);
});

test('a brief starts as a lead, even when the client chose to pay', () => {
  const st = create(project());
  assert.equal(st.authorization.status, 'lead');
  assert.equal(st.authorization.checkout_intent, 'pay');
});

test('stages respect dependencies; ux and copy can run in parallel', () => {
  const dir = folder(); const st = create(project());
  assert.deepEqual(next(st), ['intake']);
  assert.throws(() => start(st, 'strategy'), /intake is pending/);
  run(st, 'intake', dir); run(st, 'strategy', dir);
  assert.deepEqual(next(st).sort(), ['copy', 'ux']);
});

test('done requires the stage outputs to exist', () => {
  const st = create(project());
  start(st, 'intake');
  assert.throws(() => done(st, 'intake', [], mkdtempSync(join(tmpdir(), 'empty-'))), /missing project.json/);
});

test('a lead can be planned but not built; the owner gates plan and creative approval', () => {
  const dir = folder(); const st = create(project());
  for (const id of ['intake', 'strategy', 'ux', 'copy', 'visual', 'tech']) run(st, id, dir);
  assert.ok(next(st).includes('plan-approval (waiting for the owner)'));
  assert.throws(() => start(st, 'plan-approval'), /human gate/);
  approve(st, 'plan-approval', 'owner');
  assert.match(blockedBy(st, 'build').join(), /lead/);
  assert.throws(() => start(st, 'build'), /lead/);
  authorize(st, 'owner', 'paid by transfer');
  assert.deepEqual(next(st), ['build']);
});

test('reviews run in parallel after build; creative approval waits for all three', () => {
  const dir = folder(); const st = create(project());
  throughPlan(st, dir); authorize(st, 'owner'); run(st, 'build', dir);
  assert.deepEqual(next(st).sort(), ['release-review', 'technical-qa', 'visual-qa']);
  run(st, 'visual-qa', dir); run(st, 'technical-qa', dir);
  assert.throws(() => approve(st, 'creative-approval', 'owner'), /release-review/);
  run(st, 'release-review', dir);
  approve(st, 'creative-approval', 'owner');
  assert.deepEqual(next(st), ['deliver']);
});

test('a failed review reopens the build and reruns every review', () => {
  const dir = folder(); const st = create(project());
  throughPlan(st, dir); authorize(st, 'owner'); run(st, 'build', dir);
  run(st, 'technical-qa', dir);
  start(st, 'visual-qa');
  assert.equal(fail(st, 'visual-qa', 'hero headline wraps to 4 lines'), 'fix');
  assert.equal(st.stages.build.status, 'changes-requested');
  assert.equal(st.stages['technical-qa'].status, 'pending');
  assert.deepEqual(next(st), ['build']);
});

test(`after ${MAX_ROUNDS} failed rounds the review escalates instead of looping`, () => {
  const dir = folder(); const st = create(project());
  throughPlan(st, dir); authorize(st, 'owner');
  let result;
  for (let round = 1; round <= MAX_ROUNDS; round++) {
    run(st, 'build', dir);
    start(st, 'visual-qa');
    result = fail(st, 'visual-qa', 'still generic');
  }
  assert.equal(result, 'escalated');
  assert.equal(st.stages['visual-qa'].status, 'escalated');
  assert.equal(st.escalations.length, 1);
  assert.ok(!next(st).includes('visual-qa'));
  reopen(st, 'visual-qa', 'owner', 'new direction for the hero');
  assert.equal(st.stages['visual-qa'].rounds, 0);
  assert.deepEqual(next(st), ['build']);
});

test('state survives a restart: JSON round trip resumes at the same next stage', () => {
  const dir = folder(); const st = create(project());
  run(st, 'intake', dir); run(st, 'strategy', dir); start(st, 'ux');
  const resumed = JSON.parse(JSON.stringify(st));
  assert.deepEqual(next(resumed), ['copy']);
  assert.equal(resumed.stages.ux.status, 'in-progress');
});
