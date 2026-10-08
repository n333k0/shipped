// Builds the reference pool for the /start/ visual selector from the inspo archive
// (https://inspomcp.dev). Three sites per business category, thumbnails saved locally.
//   node scripts/refs.mjs
import { mkdir, writeFile } from 'node:fs/promises';

const ENDPOINT = 'https://inspomcp.dev/api/mcp';
const PER_CATEGORY = 3;
// Off-brief or mis-tagged results we never want to show.
const EXCLUDE = new Set(['anthropic.com', 'gm-meme.com', 'belledonne.com', 'gq.com', 'chickfila.com', 'coinbase.com', 'brandappart.com', 'modernhealth.com', 'amazon.com', 'creators.spotify.com', 'brand.dropbox.com', 'dropbox.com']);

// Our categories (what the visitor picks) → inspo searches, best first.
const categories = {
  saas: [{ query: 'beautiful saas product landing page', industry: 'saas' }, { query: 'ai product launch', industry: 'ai' }, { query: 'developer tool with bold typography', industry: 'developer-tools' }],
  creative: [{ query: 'award winning creative agency', industry: 'agency' }, { query: 'design studio portfolio', style: 'editorial' }, { query: 'experimental studio site', style: 'brutalism' }],
  services: [{ query: 'consulting firm professional services' }, { query: 'law firm advisory' }, { query: 'accounting firm modern' }],
  ecommerce: [{ query: 'premium product brand store', industry: 'ecommerce' }, { query: 'hardware product launch', industry: 'consumer-tech' }, { query: 'playful direct to consumer brand', style: 'playful' }],
  hospitality: [{ query: 'premium hotel with editorial photography' }, { query: 'boutique travel experience', industry: 'travel' }, { query: 'restaurant bar hospitality group' }],
  architecture: [{ query: 'boutique architecture studio portfolio' }, { query: 'real estate development luxury' }, { query: 'furniture design brand', industry: 'furniture' }],
  health: [{ industry: 'health' }],
  fashion: [{ query: 'luxury fashion house', industry: 'fashion' }, { query: 'apothecary beauty brand' }],
  culture: [{ query: 'museum gallery art institution', industry: 'culture' }, { query: 'independent magazine', industry: 'media' }, { query: 'music festival record label', industry: 'music' }],
  food: [{ query: 'coffee brand', industry: 'food-beverage' }, { query: 'fine dining restaurant' }, { query: 'beverage brand playful' }],
  finance: [{ query: 'modern fintech', industry: 'fintech' }, { query: 'crypto web3 protocol', industry: 'crypto' }, { query: 'investment firm serious' }],
  personal: [{ query: 'personal portfolio designer', industry: 'portfolio' }, { query: 'creator newsletter personal brand', industry: 'creator' }, { query: 'photographer portfolio' }],
};

async function search(args) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json, text/event-stream' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name: 'search_screens', arguments: { ...args, limit: 12, detail: 'concise' } } }),
  });
  const json = await res.json();
  const text = json.result?.content?.find((c) => c.type === 'text')?.text;
  return text ? JSON.parse(text).results ?? [] : [];
}

const host = (u) => new URL(u).hostname.replace(/^www\./, '');
const seen = new Set();
const refs = [];

for (const [cat, queries] of Object.entries(categories)) {
  let picked = 0;
  const lists = [];
  for (const q of queries) lists.push(await search(q));
  // round-robin across the queries so each category mixes styles
  const order = [];
  for (let i = 0; i < 12; i++) for (const l of lists) if (l[i]) order.push(l[i]);
  {
    for (const r of order) {
      if (picked >= PER_CATEGORY) break;
      if (r.slug.includes('--') || !r.thumb || seen.has(host(r.sourceUrl)) || EXCLUDE.has(host(r.sourceUrl))) continue;
      seen.add(host(r.sourceUrl));
      const [mode, display, temp] = (r.axes ?? '').split(' / ');
      refs.push({
        id: String(refs.length + 1).padStart(2, '0'),
        slug: r.slug,
        title: r.title,
        url: r.sourceUrl,
        category: cat,
        mode: r.mode ?? mode,
        display,
        temp,
        structure: r.macrostructure?.slug,
        northstar: r.northstar,
        palette: (r.palette ?? []).slice(0, 4),
        _thumb: r.thumb,
        _mobile: r.mobile,
      });
      picked++;
    }
  }
  console.log(cat, picked);
}

await mkdir('public/refs', { recursive: true });
for (const r of refs) {
  const buf = Buffer.from(await (await fetch(r._thumb)).arrayBuffer());
  await writeFile(`public/refs/${r.slug}.webp`, buf);
  delete r._thumb;
  delete r._mobile;
}
await writeFile('src/data/references.json', JSON.stringify(refs, null, 2) + '\n');
console.log(`${refs.length} references → src/data/references.json`);
