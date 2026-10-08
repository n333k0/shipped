// Captures every site a brief names: the client's current site, their aesthetic ideal(s) and competitors,
// then lays their measured systems side by side so the direction can take the ideal's level and step
// away from the competitors.
//   node pipeline/capture-brief.mjs <client-folder>
// Writes <folder>/captures/<role>-<host>/ (see capture-site.mjs) and <folder>/captures/summary.md
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const folder = resolve(process.argv[2] ?? '');
const brief = JSON.parse(readFileSync(join(folder, 'brief.json'), 'utf8'));
const here = dirname(fileURLToPath(import.meta.url));
const capDir = join(folder, 'captures');
mkdirSync(capDir, { recursive: true });

const fix = (u) => (/^https?:\/\//.test(u) ? u : `https://${u}`);
const host = (u) => new URL(fix(u)).hostname.replace(/^www\./, '');
const targets = [
  ...(brief.visual?.aspirational ?? []).map((u) => ({ role: 'ideal', url: fix(u) })),
  ...(brief.visual?.competitors ?? []).map((u) => ({ role: 'competitor', url: fix(u) })),
  ...(brief.project?.current_site ? [{ role: 'current', url: fix(brief.project.current_site) }] : []),
];

const rows = [];
for (const t of targets) {
  const dir = join(capDir, `${t.role}-${host(t.url)}`);
  const wall = /just a moment|attention required|access denied|verify you are human/i;
  if (!existsSync(join(dir, 'tokens.json')) || wall.test(JSON.parse(readFileSync(join(dir, 'tokens.json'), 'utf8')).title)) {
    try { execFileSync('node', [join(here, 'capture-site.mjs'), t.url, dir], { stdio: 'inherit', timeout: 150000 }); }
    catch { console.warn(`could not capture ${t.url}`); continue; }
  }
  const k = JSON.parse(readFileSync(join(dir, 'tokens.json'), 'utf8'));
  const blocked = wall.test(k.title);
  const bg = k.backgrounds.find(([c]) => !/rgba\(.*, 0\.\d+\)/.test(c))?.[0] ?? 'rgb(255, 255, 255)';
  const lum = (bg.match(/\d+/g) ?? [255, 255, 255]).slice(0, 3).reduce((a, n) => a + Number(n), 0) / 3;
  rows.push({ ...t, dir: `${t.role}-${host(t.url)}`, k, blocked, mode: lum < 90 ? 'dark' : 'light' });
}

const type = (r, weight) => (r ? `${r.family.split(',')[0].replace(/"/g, '')} ${r.size}${weight ? ` w${r.weight}` : ''}` : '—');
const line = ({ role, url, dir, k, blocked, mode }) => blocked
  ? `| ${role} | ${host(url)} | bot wall: use inspo get_screen or client screenshots | | | | |`
  : `| ${role} | [${host(url)}](${dir}/desktop.png) | ${type(k.roles.h1 ?? k.roles.h2, true)} | ${type(k.roles.body)} | ${mode} | ${k.radii.slice(0, 2).map(([r]) => r).join(' ') || '0'} | ${Object.entries(k.motion).filter(([, v]) => v).map(([m]) => m).join(' ') || '—'} |`;

writeFileSync(join(capDir, 'summary.md'), `# Captured sites: ${brief.project?.company ?? ''}

| Role | Site | Display | Body | Mode | Radius | Motion |
|---|---|---|---|---|---|---|
${rows.map(line).join('\n')}

How these weigh in \`direction.md\` (rules: SITE.md "Ideal and competitors"):
- **ideal** sets the level: its type scale, density, image size and pacing are the bar. Its \`page.html\` opens with its own assets and can seed v1's layout, then diverge into the client's brand.
- **competitor** is the field to stand out from: name what they all share and make at least one deliberate difference in v1.
- **current** is the brand to keep or upgrade: their fonts, colours, logo, copy.

Each folder: desktop.png, phone.png, page.html, tokens.md (type roles, colours, radii, gaps, heading outline).
`);
console.log(`captured ${rows.length}/${targets.length} → ${join(capDir, 'summary.md')}`);
