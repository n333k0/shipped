// Builds the reference pool for the /start/ visual selector from the inspo archive
// (https://inspomcp.dev): a hand-picked list per business category, each saved as a desktop
// "card" (the 1440px fold) and a "full" strip (the page, scrolled on hover), plus tags and
// nearest design neighbours so picks can pull in similar sites.
//   node scripts/refs.mjs
import { mkdir, writeFile, readFile, access } from 'node:fs/promises';
import sharp from 'sharp';
import { catsFor } from './inspo-cats.mjs';

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
  // inspo drops requests under load: retry with growing pauses, and treat an empty answer as a failure
  for (let attempt = 0; attempt < 6; attempt++) {
    if (attempt) await new Promise((r) => setTimeout(r, 700 * attempt));
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json, text/event-stream' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name, arguments: args } }),
      });
      const json = await res.json();
      const text = json.result?.content?.find((c) => c.type === 'text')?.text;
      if (text) return JSON.parse(text);
    } catch {}
  }
  return null;
}

// Discovered candidates (scripts/refs-discover.mjs) follow the curated ones; the owner's exclusions
// (src/data/ref-exclude.json, edited with `npm run curate`) never make it in.
const candidates = JSON.parse(await readFile('scripts/refs-candidates.json', 'utf8').catch(() => '{}'));
const excluded = new Set(JSON.parse(await readFile('src/data/ref-exclude.json', 'utf8').catch(() => '[]')));
const exists = (f) => access(f).then(() => true, () => false);

// slug → categories, in the order listed
const cats = new Map();
for (const [cat, slugs] of Object.entries(curated)) for (const s of slugs) cats.set(s, [...(cats.get(s) ?? []), cat]);
for (const [cat, slugs] of Object.entries(candidates)) for (const s of slugs) if (!cats.get(s)?.includes(cat)) cats.set(s, [...(cats.get(s) ?? []), cat]);
// excluded sites stay in the pool file so the curate tool can bring them back; the brief filters them out
void excluded;
const slugs = [...cats.keys()];

// Editor-curated issues get a small boost.
const editorial = new Set();
for (const issue of (await call('list_collections', {}))?.issues ?? []) for (const s of issue.screens) editorial.add(s.slug);

await mkdir('public/refs', { recursive: true });

const previous = new Map(JSON.parse(await readFile('src/data/references.json', 'utf8').catch(() => '[]')).filter((r) => !r.manual).map(({ id, similar, ...r }) => [r.slug, r]));
// quality: on inspo's homepage 3, in its editorial collections 2.6, near several bar sites 2, near one 1.2, hand-picked 1.5, hand-captured 1
const { home = [], bar = [], near = {} } = JSON.parse(await readFile('scripts/ref-quality.json', 'utf8').catch(() => '{}'));
const handPicked = new Set(Object.values(curated).flat());
const quality = (slug, manual) => Math.max(home.includes(slug) ? 3 : bar.includes(slug) ? 2.6 : near[slug] > 1 ? 2 : near[slug] ? 1.2 : 0, handPicked.has(slug) ? 1.5 : 0, manual ? 1 : 0);
const refs = [];
const skipped = [];
const offCategory = [];
const curatedCats = new Map();
for (const [cat, list] of Object.entries(curated)) for (const s of list) curatedCats.set(s, [...(curatedCats.get(s) ?? []), cat]);
async function build(slug) {
  const s = await call('get_screen', { slug });
  if (!s?.fullPage) {
    // inspo didn't answer: keep the entry from the last validated build rather than losing the site
    const old = previous.get(slug);
    if (old && (await exists(`public/refs/${slug}.full.webp`))) {
      const keep = old.cats.filter((c) => cats.get(slug).includes(c));
      if (keep.length) return refs.push({ ...old, cats: keep, _near: [] });
    }
    return skipped.push(slug);
  }
  // discovered sites keep only the categories their inspo industry tag supports; hand-picked ones keep theirs
  const tagged = catsFor(s.tags?.industry);
  const keep = cats.get(slug).filter((c) => curatedCats.get(slug)?.includes(c) || tagged.includes(c));
  if (!keep.length) return offCategory.push(`${slug} (${(s.tags?.industry ?? []).join('/') || 'untagged'})`);
  cats.set(slug, keep);
  let h;
  if (await exists(`public/refs/${slug}.full.webp`)) {
    h = (await sharp(`public/refs/${slug}.full.webp`).metadata()).height; // already captured
  } else {
    const raw = Buffer.from(await (await fetch(s.fullPage)).arrayBuffer());
    const { data: img, info } = await sharp(raw).resize({ width: W }).toBuffer({ resolveWithObject: true });
    h = Math.min(MAX_H, info.height);
    const fold = Math.round((W * 10) / 16); // 16:10, a 1440×900 desktop fold
    await sharp(img).extract({ left: 0, top: 0, width: W, height: Math.min(fold, h) }).webp({ quality: 72 }).toFile(`public/refs/${slug}.webp`);
    await sharp(img).extract({ left: 0, top: 0, width: W, height: h }).webp({ quality: 62 }).toFile(`public/refs/${slug}.full.webp`);
  }
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
for (let i = 0; i < slugs.length; i += 4) {
  await Promise.all(slugs.slice(i, i + 4).map((slug) => build(slug).catch((e) => skipped.push(`${slug} (${e.message})`))));
  process.stdout.write(`\r${Math.min(i + 4, slugs.length)}/${slugs.length}`);
}

// Sites we captured ourselves (scripts/refs-add.mjs) for categories inspo covers thinly
const manual = JSON.parse(await readFile('scripts/refs-manual.json', 'utf8').catch(() => '[]'));
for (const m of manual) if (!refs.some((r) => r.slug === m.slug)) refs.push({ ...m, _near: [] });
for (const r of refs) r.q = quality(r.slug, r.manual);

// stable order; ids stay with their slug across rebuilds (saved briefs refer to them)
// hand-picked first, then hand-captured, then discovered
const curatedSlugs = new Set(Object.values(curated).flat());
const order = [...slugs.filter((x) => curatedSlugs.has(x)), ...manual.map((m) => m.slug), ...slugs.filter((x) => !curatedSlugs.has(x))];
refs.sort((a, b) => order.indexOf(a.slug) - order.indexOf(b.slug));
const inPool = new Set(refs.map((r) => r.slug));
const oldIds = Object.fromEntries(JSON.parse(await readFile('src/data/references.json', 'utf8').catch(() => '[]')).map((r) => [r.slug, r.id]));
let nextId = Math.max(0, ...Object.values(oldIds).map(Number));
for (const r of refs) r.id = oldIds[r.slug] ?? String(++nextId).padStart(3, '0');
const idOf = Object.fromEntries(refs.map((r) => [r.slug, r.id]));
for (const r of refs) {
  r.similar = r._near.filter((s) => inPool.has(s) && s !== r.slug).map((s) => idOf[s]);
  delete r._near;
}
await writeFile('src/data/references.json', JSON.stringify(refs.map(({ id, ...r }) => ({ id, ...r })), null, 2) + '\n');
const per = {};
for (const r of refs) for (const c of r.cats) per[c] = (per[c] ?? 0) + (excluded.has(r.slug) ? 0 : 1);
console.log(`\n${refs.length} references → src/data/references.json${skipped.length ? `\nskipped (no capture): ${skipped.join(', ')}` : ''}${offCategory.length ? `\ndropped (industry tag outside its category): ${offCategory.join(', ')}` : ''}\nshown per category: ${JSON.stringify(per)}`);
