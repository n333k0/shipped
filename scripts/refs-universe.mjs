// Gathers every inspo site we could show, for picking the best by eye: the whole archive of our
// industries (each industry swept across all facets), inspo's homepage features and editorial
// collections (the quality bar), and sites similar to those. Writes scripts/refs-universe.json
// { slug, url, thumb, industries, cats, seed }; then grade with scripts/refs-sheets.mjs → scripts/ref-quality.json.
//   node scripts/refs-universe.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { fromInspo, catsFor } from './inspo-cats.mjs';

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
const facets = {
  style: ['minimalism', 'editorial', 'brutalism', 'glassmorphism', 'swiss', 'maximalism', 'playful', 'dark-mode', 'monochrome', 'vintage', 'futurist'],
  vibe: ['calm', 'loud', 'playful', 'serious', 'luxe', 'raw', 'soft', 'technical', 'warm', 'cold'],
  mode: ['light', 'dark'],
  color: ['warm', 'cool', 'monochrome', 'neon', 'earthy', 'pastel', 'saturated', 'muted', 'high-contrast'],
  displayClass: ['grotesk-sans', 'geometric-sans', 'roman-serif', 'italic-serif', 'slab-serif', 'mono', 'display-condensed-bold', 'display-heavy'],
  macrostructure: ['bento-grid', 'long-document', 'marquee-hero', 'stat-led', 'manifesto', 'photographic', 'specimen', 'catalogue', 'index-first', 'split-studio', 'feature-stack', 'portfolio-grid', 'ecosystem-index'],
};

const all = new Map(); // slug → row
const add = (r, seed = false) => {
  if (!r?.slug || r.slug.includes('--')) return;
  const row = all.get(r.slug) ?? { slug: r.slug, url: r.sourceUrl, thumb: r.thumb, industries: [], seed: false };
  if (r.tags?.industry) row.industries = r.tags.industry;
  row.seed ||= seed;
  all.set(r.slug, row);
};

// 1. the archive, per industry
for (const industry of Object.keys(fromInspo)) {
  const runs = [{}, ...Object.entries(facets).flatMap(([k, vs]) => vs.map((v) => ({ [k]: v })))];
  for (let i = 0; i < runs.length; i += 6) {
    const batch = await Promise.all(runs.slice(i, i + 6).map((f) => call('search_screens', { industry, limit: 20, detail: 'concise', maxTokens: 4000, ...f })));
    for (const res of batch) for (const r of res?.results ?? []) { add(r); const row = all.get(r.slug); if (row && !row.industries.includes(industry)) row.industries.push(industry); }
  }
  process.stdout.write(`${industry} `);
}

// 2. the bar: inspo's homepage features and editorial collections
const home = [...(await (await fetch('https://inspomcp.dev/')).text()).matchAll(/captures\/([a-z0-9-]+)\/hero/g)].map((m) => m[1]);
const editorial = ((await call('list_collections', {}))?.issues ?? []).flatMap((i) => i.screens.map((s) => s.slug));
const seeds = [...new Set([...home, ...editorial])].filter((s) => !s.includes('--'));
for (const slug of seeds) add(await call('get_screen', { slug }), true);

// 3. what looks like the bar
for (const slug of seeds) for (const r of (await call('find_similar', { slug, limit: 20, detail: 'concise' }))?.results ?? []) add(r);

// industries for rows that came without tags
const untagged = [...all.values()].filter((r) => !r.industries.length);
for (let i = 0; i < untagged.length; i += 6) await Promise.all(untagged.slice(i, i + 6).map(async (row) => { const s = await call('get_screen', { slug: row.slug }); row.industries = s?.tags?.industry ?? []; row.thumb ??= s?.thumb; row.url ??= s?.sourceUrl; }));

const rows = [...all.values()].map((r) => ({ ...r, cats: catsFor(r.industries) })).filter((r) => r.cats.length && r.thumb);
writeFileSync('scripts/refs-universe.json', JSON.stringify({ home, editorial, rows }, null, 1) + '\n');
const per = {}; for (const r of rows) for (const c of r.cats) per[c] = (per[c] ?? 0) + 1;
console.log(`\n${rows.length} sites in our categories (${seeds.length} seeds) ${JSON.stringify(per)}`);
