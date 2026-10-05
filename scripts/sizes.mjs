// Makes smaller copies of every image in public/ (public/_w/…) and records the
// widths in src/data/image-sizes.json, so <img srcset> can serve the right size.
// Run after adding or replacing an image: `node scripts/sizes.mjs`
import { readdir, mkdir, stat, writeFile } from 'node:fs/promises';
import { join, relative, dirname, extname } from 'node:path';
import sharp from 'sharp';

const PUBLIC = 'public', OUT = 'public/_w', WIDTHS = [480, 640, 800, 960, 1200, 1600];
const manifest = {};

async function* walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) { if (p !== OUT) yield* walk(p); }
    else if (/\.(webp|jpe?g|png)$/i.test(e.name) && !e.name.includes('-poster')) yield p;
  }
}

for await (const file of walk(PUBLIC)) {
  const rel = '/' + relative(PUBLIC, file);
  const { width } = await sharp(file).metadata();
  const widths = WIDTHS.filter((w) => w < width * 0.9);
  for (const w of widths) {
    const out = join(OUT, rel.slice(0, -extname(rel).length) + `-${w}.webp`);
    const done = await stat(out).then((o) => o.mtimeMs, () => 0);
    if (done >= (await stat(file)).mtimeMs) continue; // already up to date
    await mkdir(dirname(out), { recursive: true });
    await sharp(file).resize(w).webp({ quality: 72 }).toFile(out);
  }
  manifest[rel] = { w: width, sizes: widths };
}
await writeFile('src/data/image-sizes.json', JSON.stringify(manifest, null, 1) + '\n');
console.log(`${Object.keys(manifest).length} images sized`);
