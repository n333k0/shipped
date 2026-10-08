// Finds more reference candidates per business category in the inspo archive, beyond the
// hand-picked list in refs.mjs. Sweeps each inspo industry across every facet (style, vibe, mode,
// colour, type, structure) so the whole archive for that industry surfaces; results carry the
// industry tag, so nothing from another category gets in. Merges into scripts/refs-candidates.json;
// refs.mjs adds them after the curated ones, and the owner prunes the pool with `npm run curate` (local).
//   node scripts/refs-discover.mjs [target per category, default 60]
import { readFileSync, writeFileSync } from 'node:fs';
import { fromInspo } from './inspo-cats.mjs';

const ENDPOINT = 'https://inspomcp.dev/api/mcp';
const TARGET = Number(process.argv[2] ?? 60);
const facets = {
  style: ['minimalism', 'editorial', 'brutalism', 'glassmorphism', 'swiss', 'maximalism', 'playful', 'dark-mode', 'monochrome', 'vintage', 'futurist'],
  vibe: ['calm', 'loud', 'playful', 'serious', 'luxe', 'raw', 'soft', 'technical', 'warm', 'cold'],
  mode: ['light', 'dark'],
  color: ['warm', 'cool', 'monochrome', 'neon', 'earthy', 'pastel', 'saturated', 'muted', 'high-contrast'],
  displayClass: ['grotesk-sans', 'geometric-sans', 'roman-serif', 'italic-serif', 'slab-serif', 'mono', 'display-condensed-bold', 'display-heavy'],
  macrostructure: ['bento-grid', 'long-document', 'marquee-hero', 'stat-led', 'manifesto', 'photographic', 'specimen', 'catalogue', 'index-first', 'split-studio', 'feature-stack', 'portfolio-grid', 'ecosystem-index'],
};

async function search(args) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json, text/event-stream' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name: 'search_screens', arguments: { limit: 20, detail: 'concise', maxTokens: 4000, ...args } } }),
      });
      const t = (await res.json()).result?.content?.find((c) => c.type === 'text')?.text;
      return t ? JSON.parse(t).results ?? [] : [];
    } catch { await new Promise((r) => setTimeout(r, 800)); }
  }
  return [];
}

const refs = JSON.parse(readFileSync('src/data/references.json', 'utf8'));
const prev = JSON.parse(readFileSync('scripts/refs-candidates.json', 'utf8').toString() || '{}');
const exclude = new Set(JSON.parse(readFileSync('src/data/ref-exclude.json', 'utf8')));
const hostOf = (u) => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return u; } };
const haveHost = new Map(refs.map((r) => [hostOf(r.url), r.slug]));

// slug → { hits, industries }
const seen = new Map();
for (const industry of Object.keys(fromInspo)) {
  const runs = [{}, ...Object.entries(facets).flatMap(([k, vs]) => vs.map((v) => ({ [k]: v })))];
  for (let i = 0; i < runs.length; i += 6) {
    const batch = await Promise.all(runs.slice(i, i + 6).map((f) => search({ industry, ...f })));
    for (const r of batch.flat()) {
      if (r.slug.includes('--') || exclude.has(r.slug)) continue;
      const known = haveHost.get(hostOf(r.sourceUrl));
      if (known && known !== r.slug) continue; // same site under another slug
      const e = seen.get(r.slug) ?? { hits: 0, industries: new Set() };
      e.hits++; e.industries.add(industry);
      seen.set(r.slug, e);
    }
  }
  process.stdout.write(`${industry} `);
}
console.log(`\n${seen.size} sites tagged with our industries`);

const out = {};
for (const cat of [...new Set(Object.values(fromInspo).flat())]) {
  const inPool = refs.filter((r) => r.cats.includes(cat)).map((r) => r.slug);
  const fresh = [...seen].filter(([slug, e]) => !inPool.includes(slug) && [...e.industries].some((i) => fromInspo[i].includes(cat)))
    .sort((a, b) => b[1].hits - a[1].hits).map(([slug]) => slug);
  const kept = (prev[cat] ?? []).filter((s) => !exclude.has(s));
  out[cat] = [...new Set([...kept, ...fresh])].slice(0, Math.max(kept.length, TARGET - inPool.length + kept.filter((s) => inPool.includes(s)).length));
  console.log(cat.padEnd(13), `${inPool.length} in pool, ${fresh.length} new found → ${out[cat].length} candidates`);
}
writeFileSync('scripts/refs-candidates.json', JSON.stringify(out, null, 2) + '\n');
