// Finds more reference candidates per business category in the inspo archive, beyond the
// hand-picked list in refs.mjs. Writes scripts/refs-candidates.json; refs.mjs adds them after the
// curated ones, and the owner prunes the pool at /curate/.
//   node scripts/refs-discover.mjs [target per category, default 22]
import { readFileSync, writeFileSync } from 'node:fs';

const ENDPOINT = 'https://inspomcp.dev/api/mcp';
const TARGET = Number(process.argv[2] ?? 22);

// inspo industry → our categories
const fromInspo = {
  agency: ['creative'], ai: ['saas'], architecture: ['architecture'], 'consumer-tech': ['ecommerce'], creator: ['personal'],
  crypto: ['finance'], culture: ['culture'], 'developer-tools': ['saas'], ecommerce: ['ecommerce'], education: ['services'],
  fashion: ['fashion', 'ecommerce'], fintech: ['finance'], 'food-beverage': ['food'], furniture: ['architecture', 'ecommerce'],
  health: ['health'], media: ['culture'], music: ['culture'], 'non-profit': ['services'], portfolio: ['personal', 'creative'],
  saas: ['saas'], travel: ['hospitality'], 'type-foundry': ['creative'],
};
// Searches per category: inspo industries plus plain-language queries
const searches = {
  saas: [{ industry: 'saas' }, { industry: 'ai' }, { industry: 'developer-tools' }, { query: 'product launch landing page software' }],
  creative: [{ industry: 'agency' }, { query: 'design studio portfolio award winning' }, { query: 'creative agency case studies' }],
  services: [{ query: 'consulting firm' }, { query: 'law firm' }, { query: 'professional services b2b' }, { query: 'marketing agency growth' }, { industry: 'education' }],
  ecommerce: [{ industry: 'ecommerce' }, { industry: 'consumer-tech' }, { query: 'direct to consumer brand store' }, { industry: 'furniture' }],
  hospitality: [{ industry: 'travel' }, { query: 'hotel' }, { query: 'restaurant' }, { query: 'resort travel experience' }],
  architecture: [{ industry: 'architecture' }, { industry: 'furniture' }, { query: 'interior design studio' }, { query: 'real estate development' }],
  health: [{ industry: 'health' }, { query: 'wellness' }, { query: 'clinic healthcare' }, { query: 'skincare' }],
  fashion: [{ industry: 'fashion' }, { query: 'fashion brand lookbook' }, { query: 'beauty brand' }, { query: 'jewelry' }],
  culture: [{ industry: 'culture' }, { industry: 'media' }, { industry: 'music' }, { query: 'museum gallery' }],
  food: [{ industry: 'food-beverage' }, { query: 'coffee' }, { query: 'restaurant fine dining' }, { query: 'beverage brand' }],
  finance: [{ industry: 'fintech' }, { industry: 'crypto' }, { query: 'bank' }, { query: 'investment' }],
  personal: [{ industry: 'portfolio' }, { industry: 'creator' }, { query: 'personal website designer' }, { query: 'photographer portfolio' }],
};
const styles = ['minimalism', 'editorial', 'dark-mode', 'playful', 'swiss', 'maximalism'];

async function search(args) {
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json, text/event-stream' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name: 'search_screens', arguments: { limit: 20, detail: 'concise', maxTokens: 6000, ...args } } }),
    });
    const t = (await res.json()).result?.content?.find((c) => c.type === 'text')?.text;
    return t ? JSON.parse(t).results ?? [] : [];
  } catch { return []; }
}

const refs = JSON.parse(readFileSync('src/data/references.json', 'utf8'));
const have = new Set(refs.map((r) => r.slug));
const exclude = new Set(JSON.parse(readFileSync('src/data/ref-exclude.json', 'utf8')));
const hostOf = (u) => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return u; } };
const haveHosts = new Set(refs.map((r) => hostOf(r.url)));
const out = {};

for (const [cat, list] of Object.entries(searches)) {
  const hits = new Map(); // slug → times found
  const runs = [...list, ...list.slice(0, 2).flatMap((q) => styles.map((style) => ({ ...q, style })))];
  for (const q of runs) {
    for (const r of await search(q)) {
      if (r.slug.includes('--') || have.has(r.slug) || exclude.has(r.slug) || haveHosts.has(hostOf(r.sourceUrl))) continue;
      hits.set(r.slug, (hits.get(r.slug) ?? 0) + 1);
    }
  }
  const already = refs.filter((r) => r.cats.includes(cat)).length;
  out[cat] = [...hits].sort((a, b) => b[1] - a[1]).slice(0, Math.max(0, TARGET - already)).map(([slug]) => slug);
  console.log(cat.padEnd(13), `${already} curated + ${out[cat].length} new  (${hits.size} candidates)`);
}
writeFileSync('scripts/refs-candidates.json', JSON.stringify(out, null, 2) + '\n');
