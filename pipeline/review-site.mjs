// Reviews a prototype the way the owner does, before anyone sees it: every page at 1440px, 768px and on a
// real 390px phone (touch, device pixel ratio 3). The check is the truth: a red line here beats any 'looks fine'. Writes <folder>/review.md; exits 1 on any failure.
//   node pipeline/review-site.mjs <site-folder> [page.html …]     (default: every .html in the folder, and v*/index.html)
import { createServer } from 'node:http';
import { readFileSync, readdirSync, existsSync, writeFileSync, statSync } from 'node:fs';
import { join, resolve, extname } from 'node:path';
import { spawn } from 'node:child_process';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const dir = resolve(process.argv[2] ?? '.');
const pages = process.argv.slice(3).length ? process.argv.slice(3) : [
  ...readdirSync(dir).filter((f) => f.endsWith('.html') && !f.startsWith('_')),
  ...readdirSync(dir).filter((d) => /^v\d+$/.test(d) && existsSync(join(dir, d, 'index.html'))).map((d) => `${d}/index.html`),
];
const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900, mobile: false, dpr: 1, maxH1: 3 },
  { name: 'tablet', width: 768, height: 1024, mobile: true, dpr: 2, maxH1: 4 },
  { name: 'phone', width: 390, height: 844, mobile: true, dpr: 3, maxH1: 5 },
];

// static server for the folder
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.avif': 'image/avif', '.gif': 'image/gif', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.woff': 'font/woff', '.mp4': 'video/mp4', '.webm': 'video/webm', '.txt': 'text/plain', '.xml': 'application/xml' };
const server = createServer((req, res) => {
  const p = join(dir, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!p.startsWith(dir) || !existsSync(p) || statSync(p).isDirectory()) { res.writeHead(404).end(); return; }
  res.writeHead(200, { 'content-type': types[extname(p)] ?? 'application/octet-stream' }).end(readFileSync(p));
}).listen(0);
const base = `http://127.0.0.1:${server.address().port}/`;

// headless Chrome over the DevTools protocol
const port = 9300 + Math.floor(Math.random() * 500);
const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', `--remote-debugging-port=${port}`, '--user-data-dir=' + join(process.env.TMPDIR ?? '/tmp', `review-${port}`), 'about:blank'], { stdio: 'ignore' });
let wsUrl;
for (let i = 0; i < 50 && !wsUrl; i++) {
  await new Promise((r) => setTimeout(r, 200));
  try { wsUrl = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find((t) => t.type === 'page')?.webSocketDebuggerUrl; } catch {}
}
const ws = new WebSocket(wsUrl);
await new Promise((r) => ws.addEventListener('open', r, { once: true }));
let id = 0;
const waiting = new Map();
const errors = [];
ws.addEventListener('message', (e) => {
  const m = JSON.parse(e.data);
  if (m.id && waiting.has(m.id)) { waiting.get(m.id)(m.result ?? m.error); waiting.delete(m.id); }
  if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception?.description?.split('\n')[0] ?? m.params.exceptionDetails.text);
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push(m.params.args.map((a) => a.value ?? a.description).join(' '));
});
const send = (method, params = {}) => new Promise((r) => { const i = ++id; waiting.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
await send('Runtime.enable');
await send('Page.enable');

// what each page is checked for, run inside the page
const check = (maxH1) => `(() => {
  const out = [];
  const vw = innerWidth;
  if (document.documentElement.scrollWidth > vw + 1) out.push(['fail', 'Horizontal overflow: page is ' + document.documentElement.scrollWidth + 'px wide']);
  document.querySelectorAll('h1').forEach((h) => {
    const cs = getComputedStyle(h); const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.2;
    const lines = Math.round(h.getBoundingClientRect().height / lh);
    if (lines > ${maxH1}) out.push(['fail', 'Headline runs ' + lines + ' lines (max ${maxH1}): "' + h.textContent.trim().slice(0, 60) + '"']);
  });
  document.querySelectorAll('img').forEach((img) => {
    const name = (img.currentSrc || img.src).split('/').pop();
    if (img.complete && img.naturalWidth === 0 && img.loading !== 'lazy') out.push(['fail', 'Broken image: ' + name]);
    const r = img.getBoundingClientRect(); const fit = getComputedStyle(img).objectFit;
    if (img.naturalWidth && r.width > 4 && r.height > 4 && fit === 'fill') {
      const drift = Math.abs(r.width / r.height - img.naturalWidth / img.naturalHeight) / (img.naturalWidth / img.naturalHeight);
      if (drift > 0.04) out.push(['fail', 'Stretched image (' + Math.round(drift * 100) + '% off its ratio): ' + name]);
    }
  });
  const ours = [...document.querySelectorAll('h1,h2,h3,p,a,button')].find((e) => /Instrument Serif|Inter Tight/.test(getComputedStyle(e).fontFamily));
  if (ours) out.push(['fail', "Uses Shipped's own typeface (" + getComputedStyle(ours).fontFamily.split(',')[0] + ') on a client site']);
  if (vw < 600) {
    const small = [...document.querySelectorAll('a.btn, button, .btn, nav a')].filter((e) => { if (e.closest('.shv-dot, .shv-pop')) return false; const r = e.getBoundingClientRect(); return r.width && r.height && r.height < 36 && getComputedStyle(e).display !== 'inline'; });
    if (small.length) out.push(['warn', small.length + ' tap targets under 36px tall']);
    const nav = document.querySelector('header nav, .nav');
    const menu = document.querySelector('button[aria-expanded], .menu, .burger, .menu-btn');
    if (nav && getComputedStyle(nav).display === 'none' && !menu) out.push(['fail', 'Navigation hidden on phones with no menu button']);
  }
  const sheets = [...document.styleSheets].map((s) => { try { return [...s.cssRules].map((r) => r.cssText).join(' '); } catch { return ''; } }).join(' ') + [...document.querySelectorAll('style')].map((s) => s.textContent).join(' ');
  if (!/prefers-reduced-motion/.test(sheets)) out.push(['warn', 'No prefers-reduced-motion rules']);
  if (!/transition|animation/.test(sheets)) out.push(['warn', 'No transitions or animations at all']);
  return out;
})()`;

const report = [];
let failed = 0;
for (const vp of VIEWPORTS) {
  await send('Emulation.setDeviceMetricsOverride', { width: vp.width, height: vp.height, deviceScaleFactor: vp.dpr, mobile: vp.mobile });
  await send('Emulation.setTouchEmulationEnabled', { enabled: vp.mobile, maxTouchPoints: vp.mobile ? 5 : 0 });
  for (const page of pages) {
    errors.length = 0;
    await send('Page.navigate', { url: base + page });
    await new Promise((r) => setTimeout(r, 3200)); // let entrance animations finish
    const res = await send('Runtime.evaluate', { expression: check(vp.maxH1), returnByValue: true });
    // sticky bars and late content can overflow only after scrolling: check again at the bottom
    const bottom = await send('Runtime.evaluate', { expression: `(async () => { scrollTo(0, document.body.scrollHeight); await new Promise((r) => setTimeout(r, 600)); return document.documentElement.scrollWidth > innerWidth + 1 ? document.documentElement.scrollWidth : 0; })()`, awaitPromise: true, returnByValue: true });
    if (bottom?.result?.value) (res.result.value ??= []).push(['fail', 'Horizontal overflow after scrolling to the bottom: ' + bottom.result.value + 'px wide']);
    const items = [...(res?.result?.value ?? []), ...[...new Set(errors)].map((e) => ['fail', 'Console error: ' + e])];
    failed += items.filter(([k]) => k === 'fail').length;
    report.push(`### ${page} · ${vp.name}\n` + (items.length ? items.map(([k, t]) => `- ${k === 'fail' ? '✗' : '⚠'} ${t}`).join('\n') : '- ✓ clean'));
  }
}
ws.close();
chrome.kill();
server.close();
const md = `# Review · ${dir.split('/').slice(-2).join('/')}\n\n${failed ? `**${failed} failures**` : '**All clear**'} across ${pages.length} pages × ${VIEWPORTS.length} viewports.\n\n${report.join('\n\n')}\n`;
writeFileSync(join(dir, '..', 'review.md'), md);
console.log(md);
process.exit(failed ? 1 : 0);
