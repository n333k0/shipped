// The quality bar is what inspo itself features: its homepage grid and editorial collections.
// A site is as good as its closeness to that bar: featured (bar), or returned as similar to bar sites
// (near, counted per bar site that lists it). Writes scripts/ref-quality.json { home: [slug], bar: [slug], near: { slug: n } };
// refs-discover.mjs picks candidates by it and refs.mjs stores each site's score as `q`.
//   node scripts/refs-quality.mjs
import { writeFileSync } from 'node:fs';

const ENDPOINT = 'https://inspomcp.dev/api/mcp';
async function call(name, args) {
  for (let attempt = 0; attempt < 6; attempt++) {
    if (attempt) await new Promise((r) => setTimeout(r, 700 * attempt));
    try {
      const res = await fetch(ENDPOINT, { method: 'POST', headers: { 'content-type': 'application/json', accept: 'application/json, text/event-stream' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name, arguments: args } }) });
      const t = (await res.json()).result?.content?.find((c) => c.type === 'text')?.text;
      if (t) return JSON.parse(t);
    } catch {}
  }
  return null;
}

const home = [...(await (await fetch('https://inspomcp.dev/')).text()).matchAll(/captures\/([a-z0-9-]+)\/hero/g)].map((m) => m[1]);
const editorial = ((await call('list_collections', {}))?.issues ?? []).flatMap((i) => i.screens.map((s) => s.slug));
const bar = [...new Set([...home, ...editorial])].filter((s) => !s.includes('--'));

const near = {};
for (let i = 0; i < bar.length; i += 4) {
  await Promise.all(bar.slice(i, i + 4).map(async (slug) => {
    for (const r of (await call('find_similar', { slug, limit: 20, detail: 'concise' }))?.results ?? []) {
      if (r.slug.includes('--') || bar.includes(r.slug)) continue;
      near[r.slug] = (near[r.slug] ?? 0) + 1;
    }
  }));
}
writeFileSync('scripts/ref-quality.json', JSON.stringify({ home: home.filter((s) => !s.includes('--')), bar, near }, null, 1) + '\n');
console.log(`${bar.length} bar sites, ${Object.keys(near).length} near them (${Object.values(near).filter((n) => n > 1).length} near several)`);
