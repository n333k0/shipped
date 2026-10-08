// Pulls inspo's canonical reference components (hero, nav, cta, footer, pricing… archetypes, React +
// Tailwind source, MIT) into library/inspo-components/<type>/<id>.jsx, with an index of when to use each.
//   node pipeline/pull-inspo-components.mjs
import { mkdirSync, writeFileSync } from 'node:fs';

const ENDPOINT = 'https://inspomcp.dev/api/mcp';
const call = async (name, args) => {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json, text/event-stream' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name, arguments: args } }),
  });
  return (await res.json()).result?.content?.filter((c) => c.type === 'text').map((c) => c.text).join('\n') ?? '';
};

const index = JSON.parse(await call('find_reference_components', {})).components;
const out = 'library/inspo-components';
const rows = [];
for (let i = 0; i < index.length; i += 6) {
  await Promise.all(index.slice(i, i + 6).map(async (c) => {
    const src = await call('get_reference_jsx', { type: c.type, id: c.id });
    let code = src;
    try { const j = JSON.parse(src); code = j.source ?? src; if (j.tokens) code += `\n\n/* tokens\n${JSON.stringify(j.tokens, null, 2)}\n*/`; } catch { code = src.match(/```(?:jsx|tsx)?\n([\s\S]*?)```/)?.[1] ?? src; }
    mkdirSync(`${out}/${c.type}`, { recursive: true });
    writeFileSync(`${out}/${c.type}/${c.id}.jsx`, `// ${c.label} (${c.type}) · ${c.macro}\n// ${c.about}\n// Source: inspo reference components (https://github.com/Nutlope/inspo, MIT)\n\n${code.trim()}\n`);
    rows.push(c);
  }));
  process.stdout.write(`\r${Math.min(i + 6, index.length)}/${index.length}`);
}
rows.sort((a, b) => a.type.localeCompare(b.type) || a.id.localeCompare(b.id));
const md = `# inspo reference components\n\n${rows.length} archetypes, React + Tailwind. Read them for structure and states even when writing plain HTML.\n\n| Type | Component | Use when |\n|---|---|---|\n${rows.map((c) => `| ${c.type} | [${c.label}](${c.type}/${c.id}.jsx) | ${c.note.replace(/\|/g, '/')} |`).join('\n')}\n`;
writeFileSync(`${out}/README.md`, md);
console.log(`\n${rows.length} components → ${out}`);
