// Checks that every internal href and src in a built site resolves to a file.
//   node pipeline/check-links.mjs <project>/site
// Exit 1 when anything is missing; external links (http, mailto, tel, wa.me) are listed, not fetched.
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname, resolve, relative } from 'node:path';

const root = resolve(process.argv[2] ?? 'site');
const pages = [];
const walk = (d) => { for (const f of readdirSync(d)) { const p = join(d, f); if (statSync(p).isDirectory()) walk(p); else if (f.endsWith('.html')) pages.push(p); } };
walk(root);

const missing = [], external = new Set();
for (const page of pages) {
  const html = readFileSync(page, 'utf8');
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  for (const [, attr, raw] of html.matchAll(/\s(href|src)="([^"]*)"/g)) {
    const url = raw.trim();
    if (!url || url.startsWith('data:') || url.startsWith('javascript:')) continue;
    if (/^(https?:|mailto:|tel:|\/\/)/.test(url)) { external.add(url); continue; }
    const [path, hash] = url.split('#');
    if (!path) { if (hash && !ids.has(hash)) missing.push(`${relative(root, page)}: #${hash} (no element with that id)`); continue; }
    const target = path.startsWith('/') ? join(root, path) : join(dirname(page), path.split('?')[0]);
    const file = existsSync(target) && statSync(target).isDirectory() ? join(target, 'index.html') : target;
    if (!existsSync(file)) missing.push(`${relative(root, page)}: ${attr}="${url}"`);
  }
}
console.log(`${pages.length} pages · ${missing.length} missing · ${external.size} external links`);
for (const m of missing) console.log(`  missing  ${m}`);
for (const e of external) console.log(`  external ${e}`);
process.exit(missing.length ? 1 : 0);
