// Stitches the queued. banner work (shipped OldWay) into one image strip per lane, so each lane
// is a single <img> instead of a row of them. Sources live in assets/queued-works (not deployed).
// Run after changing a lane: `node scripts/lanes.mjs`
import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';

export const lanes = [
  ['sublim', 'perfectbody', 'shift', 'antler', 'ledgerly', 'calder'],
  ['onered', 'aether', 'mira', 'wilson', 'solace', 'tokni'],
]
const H = 420; // 1.5× the tallest on-screen lane (280px)
const GAP = 21, R = 27; // 14px gap and 18px corners on screen, baked in with transparency
const sizes = [];
for (const [i, lane] of lanes.entries()) {
  const tiles = await Promise.all(lane.map(async (n) => {
    const { data, info } = await sharp(`assets/queued-works/${n}.webp`).resize({ height: H }).toBuffer({ resolveWithObject: true });
    const mask = Buffer.from(`<svg width="${info.width}" height="${H}"><rect width="${info.width}" height="${H}" rx="${R}" ry="${R}"/></svg>`);
    const rounded = await sharp(data).ensureAlpha().composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer();
    return { data: rounded, w: info.width };
  }));
  // every tile is followed by the gap (the last one too), so the loop seam spaces like the rest
  const width = tiles.reduce((s, t) => s + t.w + GAP, 0);
  let left = 0;
  const composite = tiles.map((t) => { const c = { input: t.data, left, top: 0 }; left += t.w + GAP; return c; });
  await sharp({ create: { width, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } }).composite(composite).webp({ quality: 74, alphaQuality: 90 }).toFile(`public/placeholder/queued/lane-${i}.webp`);
  sizes.push({ w: width, h: H });
}
await writeFile('src/data/queued-lanes.json', JSON.stringify(sizes, null, 1) + '\n');
console.log(sizes);
