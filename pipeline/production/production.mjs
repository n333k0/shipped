// Production state for one project: which stage is done, what it produced, who approved what.
// Lives in <project>/production.json, so an interrupted job resumes from `next`.
//   node pipeline/production/production.mjs <command> <project-folder> [args]
//   init                      normalize brief.json → project.json, create production.json
//   status                    stage table
//   next                      stages that can start now (dependencies done, gates satisfied)
//   start <stage>             mark in progress (refuses if dependencies or gates are not met)
//   done <stage> [artifact…]  mark done; every listed artifact must exist (defaults to the stage's outputs)
//   fail <stage> "<reason>"   a review failed: opens a correction round; after 3 rounds → escalated
//   authorize --by <name> [--note "<text>"]   the owner confirms this is a paid/approved order
//   approve <gate> --by <name> [--note "<text>"]   human gate: plan-approval | creative-approval
//   reopen <stage> --by <name>  the owner takes back an escalated stage (rounds start again)
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalize } from './normalize-brief.mjs';

export const MAX_ROUNDS = 3;

// The pipeline. `agent` is who does the work (orchestrator = the main session running the skill).
export const STAGES = [
  { id: 'intake', agent: 'orchestrator', deps: [], outputs: ['project.json'] },
  { id: 'strategy', agent: 'creative-director', deps: ['intake'], outputs: ['direction/strategy.md'] },
  { id: 'ux', agent: 'ux-architect', deps: ['strategy'], outputs: ['direction/ux.md'] },
  { id: 'copy', agent: 'copywriter', deps: ['strategy'], outputs: ['direction/copy.md'] },
  { id: 'visual', agent: 'ui-designer', deps: ['ux'], outputs: ['direction/visual.md'] },
  { id: 'tech', agent: 'lead-developer', deps: ['ux'], outputs: ['direction/tech.md'] },
  { id: 'plan-approval', agent: 'owner', deps: ['visual', 'tech', 'copy'], gate: true, outputs: [] },
  { id: 'build', agent: 'frontend-builder', deps: ['plan-approval'], needsAuth: true, outputs: ['site/index.html'] },
  { id: 'visual-qa', agent: 'visual-qa', deps: ['build'], review: true, outputs: ['review/visual.md'] },
  { id: 'technical-qa', agent: 'technical-qa', deps: ['build'], review: true, outputs: ['review/technical.md'] },
  { id: 'release-review', agent: 'release-reviewer', deps: ['build'], review: true, outputs: ['review/release.md'] },
  { id: 'creative-approval', agent: 'owner', deps: ['visual-qa', 'technical-qa', 'release-review'], gate: true, outputs: [] },
  { id: 'deliver', agent: 'orchestrator', deps: ['creative-approval'], needsAuth: true, outputs: ['delivery.md'] },
];
const byId = Object.fromEntries(STAGES.map((s) => [s.id, s]));
const now = () => new Date().toISOString();

export function create(project) {
  return {
    project: project.id,
    company: project.customer.company,
    created_at: now(),
    // A brief is a lead until the owner authorizes it. checkout.mode "pay" is intent, not a payment.
    authorization: { status: 'lead', checkout_intent: project.checkout?.mode ?? 'call' },
    stages: Object.fromEntries(STAGES.map((s) => [s.id, { status: 'pending', rounds: 0, artifacts: [], history: [] }])),
    escalations: [],
  };
}

const log = (st, event) => st.history.push({ at: now(), ...event });

export function blockedBy(state, id) {
  const s = byId[id];
  if (!s) return [`unknown stage "${id}"`];
  const why = [];
  for (const d of s.deps) if (state.stages[d].status !== 'done') why.push(`${d} is ${state.stages[d].status}`);
  if (s.needsAuth && state.authorization.status !== 'authorized') why.push('project is a lead: the owner must authorize it (production.mjs authorize)');
  if (state.stages[id].status === 'escalated') why.push(`${id} is escalated to the owner`);
  return why;
}

export function next(state) {
  return STAGES.filter((s) => ['pending', 'changes-requested'].includes(state.stages[s.id].status) && !s.gate && blockedBy(state, s.id).length === 0).map((s) => s.id)
    .concat(STAGES.filter((s) => s.gate && state.stages[s.id].status === 'pending' && blockedBy(state, s.id).length === 0).map((s) => `${s.id} (waiting for the owner)`));
}

export function start(state, id) {
  const why = blockedBy(state, id);
  if (byId[id]?.gate) why.push(`${id} is a human gate: use approve`);
  if (why.length) throw new Error(`cannot start ${id}: ${why.join('; ')}`);
  state.stages[id].status = 'in-progress';
  log(state.stages[id], { event: 'start' });
}

export function done(state, id, artifacts, dir) {
  const s = byId[id];
  if (!s) throw new Error(`unknown stage "${id}"`);
  if (s.gate) throw new Error(`${id} is a human gate: use approve`);
  if (state.stages[id].status !== 'in-progress') throw new Error(`${id} is ${state.stages[id].status}, not in progress`);
  const list = artifacts.length ? artifacts : s.outputs;
  const missing = list.filter((a) => dir && !existsSync(join(dir, a)));
  if (missing.length) throw new Error(`${id} cannot be done: missing ${missing.join(', ')}`);
  state.stages[id].status = 'done';
  state.stages[id].artifacts = list;
  log(state.stages[id], { event: 'done', artifacts: list });
}

// A failed review sends the build back for a fix. The review and the build reopen; after MAX_ROUNDS the review escalates.
export function fail(state, id, reason) {
  const s = byId[id];
  if (!s?.review) throw new Error(`${id} is not a review stage`);
  const st = state.stages[id];
  st.rounds += 1;
  log(st, { event: 'fail', reason, round: st.rounds });
  if (st.rounds >= MAX_ROUNDS) {
    st.status = 'escalated';
    state.escalations.push({ at: now(), stage: id, reason: `${MAX_ROUNDS} correction rounds did not pass: ${reason}` });
    return 'escalated';
  }
  st.status = 'changes-requested';
  state.stages.build.status = 'changes-requested'; // the builder fixes, then every review runs again
  for (const r of STAGES.filter((x) => x.review && x.id !== id)) if (state.stages[r.id].status === 'done') state.stages[r.id].status = 'pending';
  log(state.stages.build, { event: 'fix-requested', by: id, reason, round: st.rounds });
  return 'fix';
}

// The owner takes an escalated stage back: new rounds, same stage
export function reopen(state, id, by, note) {
  if (!by) throw new Error('reopen needs --by <name>');
  const st = state.stages[id];
  if (!st) throw new Error(`unknown stage "${id}"`);
  st.status = byId[id].review ? 'changes-requested' : 'pending';
  st.rounds = 0;
  if (byId[id].review) state.stages.build.status = 'changes-requested';
  log(st, { event: 'reopened', by, note });
}

export function authorize(state, by, note) {
  if (!by) throw new Error('authorize needs --by <name>');
  state.authorization = { ...state.authorization, status: 'authorized', by, note, at: now() };
}

export function approve(state, gate, by, note) {
  const s = byId[gate];
  if (!s?.gate) throw new Error(`${gate} is not a human gate`);
  if (!by) throw new Error('approve needs --by <name>');
  const why = blockedBy(state, gate);
  if (why.length) throw new Error(`cannot approve ${gate}: ${why.join('; ')}`);
  state.stages[gate].status = 'done';
  log(state.stages[gate], { event: 'approved', by, note });
}

function table(state) {
  const rows = STAGES.map((s) => {
    const st = state.stages[s.id];
    return `${s.id.padEnd(18)} ${st.status.padEnd(18)} ${s.agent.padEnd(18)} ${st.rounds ? `round ${st.rounds}/${MAX_ROUNDS}` : ''}`;
  });
  return [`${state.company} · ${state.project} · ${state.authorization.status}${state.authorization.by ? ` by ${state.authorization.by}` : ''}`, '', ...rows,
    ...(state.escalations.length ? ['', 'Escalations:', ...state.escalations.map((e) => `- ${e.stage}: ${e.reason}`)] : []),
    '', `Next: ${next(state).join(', ') || 'nothing (blocked or finished)'}`].join('\n');
}

// ---- CLI ----
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [cmd, folder, ...rest] = process.argv.slice(2);
  const dir = resolve(folder ?? '.');
  const file = join(dir, 'production.json');
  const flag = (name) => { const i = rest.indexOf(`--${name}`); return i >= 0 ? rest[i + 1] : undefined; };
  const save = (st) => writeFileSync(file, JSON.stringify(st, null, 2) + '\n');
  try {
    if (cmd === 'init') {
      const project = normalize(JSON.parse(readFileSync(join(dir, 'brief.json'), 'utf8')));
      writeFileSync(join(dir, 'project.json'), JSON.stringify(project, null, 2) + '\n');
      if (existsSync(file)) { console.log('production.json exists: kept (resume with `next`)'); }
      else save(create(project));
      const st = JSON.parse(readFileSync(file, 'utf8'));
      if (project.intake.blockers.length) console.log(`intake blockers: ${project.intake.blockers.join('; ')}`);
      console.log(table(st));
    } else {
      const st = JSON.parse(readFileSync(file, 'utf8'));
      if (cmd === 'status') console.log(table(st));
      else if (cmd === 'next') console.log(next(st).join('\n') || 'nothing (blocked or finished)');
      else if (cmd === 'start') { start(st, rest[0]); save(st); console.log(`${rest[0]} in progress`); }
      else if (cmd === 'done') { done(st, rest[0], rest.slice(1).filter((a) => !a.startsWith('--')), dir); save(st); console.log(`${rest[0]} done · next: ${next(st).join(', ') || '—'}`); }
      else if (cmd === 'fail') { const r = fail(st, rest[0], rest[1] ?? 'no reason given'); save(st); console.log(r === 'escalated' ? `${rest[0]} escalated to the owner after ${MAX_ROUNDS} rounds` : `${rest[0]} failed: build reopened for a fix (round ${st.stages[rest[0]].rounds}/${MAX_ROUNDS})`); }
      else if (cmd === 'reopen') { reopen(st, rest[0], flag('by'), flag('note')); save(st); console.log(`${rest[0]} reopened by ${flag('by')}`); }
      else if (cmd === 'authorize') { authorize(st, flag('by'), flag('note')); save(st); console.log(`authorized by ${flag('by')}`); }
      else if (cmd === 'approve') { approve(st, rest[0], flag('by'), flag('note')); save(st); console.log(`${rest[0]} approved by ${flag('by')}`); }
      else throw new Error(`unknown command "${cmd}"`);
    }
  } catch (e) { console.error(e.message); process.exit(1); }
}
