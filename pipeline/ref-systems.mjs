// Reads the real design system of every reference the client picked, so the build follows
// measured type, radius, spacing and colour instead of a guess from a thumbnail.
//   node pipeline/ref-systems.mjs <client-folder>
// Writes <folder>/refs/<slug>.md (inspo DESIGN.md + page autopsy) and <folder>/refs/summary.md.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ENDPOINT = 'https://inspomcp.dev/api/mcp';
const dir = resolve(process.argv[2] ?? '.');
const b = JSON.parse(readFileSync(join(dir, 'brief.json'), 'utf8'));

async function call(name, args) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json, text/event-stream' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name, arguments: args } }),
  });
  const json = await res.json();
  return json.result?.content?.filter((c) => c.type === 'text').map((c) => c.text).join('\n') ?? '';
}

mkdirSync(join(dir, 'refs'), { recursive: true });
const rows = [];
for (const r of b.visual.references) {
  const [ds, screen] = await Promise.all([call('get_design_system', { slug: r.slug, live: false }), call('get_screen', { slug: r.slug })]);
  let autopsy = '';
  try { autopsy = JSON.parse(screen).autopsy ?? ''; } catch {}
  writeFileSync(join(dir, 'refs', `${r.slug}.md`), `${ds}\n\n## Page autopsy\n\n${autopsy}\n`);
  const row = (role) => ds.match(new RegExp(`\\| ${role} \\| ([^|]+) \\| (\\d+)px \\| (\\d+) \\| ([^|]+) \\| ([^|]+) \\|`));
  const h1 = row('h1');
  const body = row('body');
  rows.push({
    slug: r.slug,
    closest: r.id === b.visual.closest,
    faces: ds.match(/Detected typefaces: (.+)/)?.[1]?.replace(/\*/g, '') ?? '—',
    h1: h1 ? `${h1[1].trim()} ${h1[2]}px w${h1[3]} lh ${h1[4].trim()} ls ${h1[5].trim()}` : '—',
    body: body ? `${body[1].trim()} ${body[2]}px w${body[3]}` : '—',
    radius: ds.match(/## Border radius\s+([^\n]+)/)?.[1] ?? '—',
    mode: ds.match(/\*\*Mode:\*\* (\w+)/)?.[1] ?? '—',
  });
}
const summary = `# References · ${b.project.company} (${b.id})

Picked for: ${b.visual.reference_traits.join(', ')}. Closest weighs most.

| Ref | Mode | Typefaces | h1 | Body | Radius |
|---|---|---|---|---|---|
${rows.map((r) => `| ${r.closest ? '**' + r.slug + '** (closest)' : r.slug} | ${r.mode} | ${r.faces} | ${r.h1} | ${r.body} | ${r.radius} |`).join('\n')}

Sliders: ${Object.entries(b.visual.sliders).map(([k, v]) => `${k} ${v}`).join(' · ')}
Motion: ${b.visual.motion} · Type: ${b.visual.typeface ?? '—'} · Locked: ${b.brand.locked?.join(', ') || '—'}
`;
writeFileSync(join(dir, 'refs', 'summary.md'), summary);
console.log(summary);
