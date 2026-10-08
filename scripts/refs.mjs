// Builds the reference pool for the /start/ visual selector from the inspo archive
// (https://inspomcp.dev): a hand-picked list per business category, each saved as a desktop
// "card" (the 1440px fold) and a "full" strip (the page, scrolled on hover), plus tags and
// nearest design neighbours so picks can pull in similar sites.
//   node scripts/refs.mjs
import { mkdir, writeFile, rm } from 'node:fs/promises';
import sharp from 'sharp';

const ENDPOINT = 'https://inspomcp.dev/api/mcp';
const W = 520; // stored width; cards render at ~160–330px, so this stays sharp on 2× screens
const MAX_H = 3400; // the scroll strip stops after roughly the first few sections

// Picked by hand for craft and reputation. The first category listed is where a site shows first.
const curated = {
  saas: ['linear-app', 'framer-com', 'raycast-com', 'arc-net', 'vercel-com', 'figma-com', 'superhuman-com', 'pitch-com', 'cron-com', 'amie-so', 'mintlify-com', 'warp-net', 'modal-com'],
  creative: ['pentagram-com', 'locomotive-ca', 'lusion-co', 'instrument-com', 'basement-studio', 'area17-com', 'exoape-com', 'humaan-com', 'buck-co', 'generalcondition-com', 'madebyanalogue-co-uk'],
  services: ['work-co', 'everlaw-com', 'deel-com', 'idyllic-co-nz', 'designstudio-com', 'synapserstudio-com', 'handhold-io', 'letude-group'],
  ecommerce: ['glossier-com', 'everlane-com', 'warbyparker-com', 'nike-com', 'bellroy-com', 'casper-com', 'fellowproducts-com', 'parachutehome-com', 'snowpeak-com', 'rapha-cc', 'louispoulsen-com', 'flos-com', 'hay-com', 'knoll-com'],
  hospitality: ['belmond-com', 'standardhotels-com', 'lyfehotels-com', 'explorajourneys-com', 'atomixnyc-com', 'mirazur-fr', 'dinnerbyheston-com', 'deathandcompany-com', 'finethought-com-au'],
  architecture: ['herzogdemeuron-com', 'snohetta-com', 'big-dk', 'normarchitects-com', 'works-studio', 'kkaa-co-jp', 'nbstudio-co-uk', 'houseofhoney-com', 'knoll-com', 'louispoulsen-com', 'flos-com', 'hay-com'],
  health: ['ritual-com', 'functionhealth-com', 'headspace-com', 'menkind-co', 'bevel-health', 'frequencybreathwork-com', 'peloton-com', 'fitbod-me', 'psyche-co'],
  fashion: ['ssense-com', 'maisonmargiela-com', 'marni-com', 'karenwalker-com', 'chloe-com', 'buly1803-com', 'cuyana-com', 'grailed-com', 'glossier-com', 'everlane-com'],
  culture: ['moma-org', 'guggenheim-org', 'whitney-org', 'serpentinegalleries-org', 'newmuseum-org', 'pacegallery-com', 'lissongallery-com', 'thecreativeindependent-com', 'apartamentomagazine-com', 'are-na', 'xlrecordings-com', 'thirdmanrecords-com'],
  food: ['graza-co', 'omsom-com', 'bluebottlecoffee-com', 'onyxcoffeelab-com', 'mooala-com', 'magicspoon-com', 'goodeggs-com', 'atomixnyc-com', 'mirazur-fr'],
  finance: ['stripe-com', 'mercury-com', 'wise-com', 'family-co', 'plaid-com', 'brex-com', 'alloy-com', 'stash-com', 'ethereum-org', 'uniswap-org'],
  personal: ['rauno-me', 'emilkowal-ski', 'maggieappleton-com', 'wattenberger-com', 'jhey-dev', 'julian-com', 'frankchimero-com', 'vanschneider-com', 'craigmod-com', 'maxsiedentopf-com', 'ozgur-design', 'aristidebenoist-com'],
};

async function call(name, args) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json, text/event-stream' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name, arguments: args } }),
      });
      const json = await res.json();
      const text = json.result?.content?.find((c) => c.type === 'text')?.text;
      return text ? JSON.parse(text) : null;
    } catch {}
  }
  return null;
}

// slug → categories, in the order listed
const cats = new Map();
for (const [cat, slugs] of Object.entries(curated)) for (const s of slugs) cats.set(s, [...(cats.get(s) ?? []), cat]);
const slugs = [...cats.keys()];

// Editor-curated issues get a small boost.
const editorial = new Set();
for (const issue of (await call('list_collections', {}))?.issues ?? []) for (const s of issue.screens) editorial.add(s.slug);

await rm('public/refs', { recursive: true, force: true });
await mkdir('public/refs', { recursive: true });

const refs = [];
const skipped = [];
async function build(slug) {
  const s = await call('get_screen', { slug });
  if (!s?.fullPage) return skipped.push(slug);
  const raw = Buffer.from(await (await fetch(s.fullPage)).arrayBuffer());
  const { data: img, info } = await sharp(raw).resize({ width: W }).toBuffer({ resolveWithObject: true });
  const h = Math.min(MAX_H, info.height);
  const fold = Math.round((W * 10) / 16); // 16:10, a 1440×900 desktop fold
  await sharp(img).extract({ left: 0, top: 0, width: W, height: Math.min(fold, h) }).webp({ quality: 72 }).toFile(`public/refs/${slug}.webp`);
  await sharp(img).extract({ left: 0, top: 0, width: W, height: h }).webp({ quality: 62 }).toFile(`public/refs/${slug}.full.webp`);
  const near = await call('find_similar', { slug, limit: 16, detail: 'concise', maxTokens: 3000 });
  refs.push({
    slug,
    title: s.title,
    url: s.sourceUrl,
    cats: cats.get(slug),
    mode: s.mode,
    styles: s.tags?.style ?? [],
    vibes: s.tags?.vibe ?? [],
    structure: s.macrostructure?.slug,
    northstar: s.northstar,
    palette: (s.palette ?? []).slice(0, 4),
    h, // full strip height at W px wide
    original: s.fullPage, // 1440px full page, for the expanded view
    editorial: editorial.has(slug),
    _near: (near?.results ?? []).map((r) => r.slug),
  });
}

// a few at a time
for (let i = 0; i < slugs.length; i += 6) {
  await Promise.all(slugs.slice(i, i + 6).map((slug) => build(slug).catch((e) => skipped.push(`${slug} (${e.message})`))));
  process.stdout.write(`\r${Math.min(i + 6, slugs.length)}/${slugs.length}`);
}

// stable order, ids, and neighbours limited to the pool
refs.sort((a, b) => slugs.indexOf(a.slug) - slugs.indexOf(b.slug));
const inPool = new Set(refs.map((r) => r.slug));
refs.forEach((r, i) => (r.id = String(i + 1).padStart(3, '0')));
const idOf = Object.fromEntries(refs.map((r) => [r.slug, r.id]));
for (const r of refs) {
  r.similar = r._near.filter((s) => inPool.has(s) && s !== r.slug).map((s) => idOf[s]);
  delete r._near;
}
await writeFile('src/data/references.json', JSON.stringify(refs.map(({ id, ...r }) => ({ id, ...r })), null, 2) + '\n');
console.log(`\n${refs.length} references → src/data/references.json${skipped.length ? `\nskipped (no capture): ${skipped.join(', ')}` : ''}`);
