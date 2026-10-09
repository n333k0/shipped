// Picks which inspo sites join the reference pool: only the best. The bar is what inspo itself
// features (homepage + editorial collections, scripts/ref-quality.json); a site joins when it is on
// the bar or inspo lists it as similar to bar sites. Categories come from industry tags only.
// Run after scripts/refs-universe.mjs (the archive) and scripts/refs-quality.mjs (the bar);
// writes scripts/refs-candidates.json, then build with scripts/refs.mjs. The owner prunes with `npm run curate` (local).
//   node scripts/refs-discover.mjs
import { readFileSync, writeFileSync } from 'node:fs';

const { rows } = JSON.parse(readFileSync('scripts/refs-universe.json', 'utf8'));
const { home = [], bar, near } = JSON.parse(readFileSync('scripts/ref-quality.json', 'utf8'));
const exclude = new Set(JSON.parse(readFileSync('src/data/ref-exclude.json', 'utf8')));
const quality = (slug) => (home.includes(slug) ? 3 : bar.includes(slug) ? 2.6 : near[slug] > 1 ? 2 : near[slug] ? 1.2 : 0);

const out = {};
for (const r of rows) {
  if (exclude.has(r.slug) || !quality(r.slug)) continue;
  for (const c of r.cats) (out[c] ??= []).push(r.slug);
}
for (const c of Object.keys(out)) {
  out[c].sort((a, b) => quality(b) - quality(a) || (near[b] ?? 0) - (near[a] ?? 0));
  out[c] = out[c].slice(0, 60); // the best 60 per category
  console.log(c.padEnd(13), `${out[c].length} at the bar or near it`);
}
writeFileSync('scripts/refs-candidates.json', JSON.stringify(out, null, 2) + '\n');
