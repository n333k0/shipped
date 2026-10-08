// Adds hand-picked sites to the reference pool for categories the inspo archive covers thinly.
// Captures each URL at 1440px like inspo does: the fold card, the scroll strip, and a large
// capture for the viewer, plus mode and palette measured from the page.
//   node scripts/refs-add.mjs [urls.json] [--redo]   default list: scripts/refs-manual-urls.json { category: [url…] }
//   --redo recaptures sites already in the pool
// Writes public/refs/<slug>.{webp,full.webp,orig.webp} and scripts/refs-manual.json; then run refs.mjs.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import sharp from 'sharp';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const W = 520, MAX_H = 3400, ORIG_W = 1200, ORIG_MAX = 7000, SHOT_MAX = 8400;
const args = process.argv.slice(2);
const redo = args.includes('--redo');
const lists = JSON.parse(readFileSync(args.find((a) => a.endsWith('.json')) ?? 'scripts/refs-manual-urls.json', 'utf8'));
const manual = JSON.parse(existsSync('scripts/refs-manual.json') ? readFileSync('scripts/refs-manual.json', 'utf8') : '[]');
const pool = JSON.parse(readFileSync('src/data/references.json', 'utf8'));
const hostOf = (u) => new URL(u).hostname.replace(/^www\./, '');
const slugOf = (u) => hostOf(u).replace(/\./g, '-');
const known = new Set([...pool, ...manual].map((r) => hostOf(r.url)));
const WALL = /just a moment|attention required|access denied|verify you are human|forbidden|not found|404/i;

const jobs = [];
for (const [cat, urls] of Object.entries(lists)) for (const url of urls) {
  const m = manual.find((r) => hostOf(r.url) === hostOf(url));
  if (m && redo) { if (!jobs.some((j) => hostOf(j.url) === hostOf(url))) jobs.push({ cat, url, cats: m.cats }); continue; }
  if (m) { if (!m.cats.includes(cat)) m.cats.push(cat); continue; }
  if (known.has(hostOf(url))) continue;
  known.add(hostOf(url));
  jobs.push({ cat, url });
}
console.log(`${jobs.length} to capture`);

async function browser(port) {
  const proc = spawn(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', `--remote-debugging-port=${port}`, `--user-data-dir=${join(tmpdir(), `refs-add-${port}`)}`, 'about:blank'], { stdio: 'ignore' });
  let ws;
  for (let i = 0; i < 50 && !ws; i++) { await new Promise((r) => setTimeout(r, 200)); try { const u = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find((t) => t.type === 'page')?.webSocketDebuggerUrl; if (u) ws = new WebSocket(u); } catch {} }
  await new Promise((r) => ws.addEventListener('open', r, { once: true }));
  let id = 0; const wait = new Map();
  ws.addEventListener('message', (e) => { const m = JSON.parse(e.data); if (m.id && wait.has(m.id)) { wait.get(m.id)(m.result ?? m.error); wait.delete(m.id); } });
  const send = (method, params = {}) => new Promise((r) => { const i = ++id; wait.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); setTimeout(() => wait.has(i) && (wait.delete(i), r({})), 45000); });
  await send('Page.enable'); await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  return { send, close: () => { ws.close(); proc.kill(); } };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const hex = (rgb) => '#' + (rgb.match(/\d+/g) ?? []).slice(0, 3).map((n) => Number(n).toString(16).padStart(2, '0')).join('');

async function capture(b, { cat, url }) {
  const { send } = b;
  await send('Page.navigate', { url });
  await sleep(7000);
  const ev = async (expression, awaitPromise = false) => (await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise }))?.result?.value;
  const title = (await ev('document.title')) ?? '';
  // some sites scroll inside a full-screen container: unfold it so the page has its real height
  const height = await ev(`(() => {
    const de = document.documentElement;
    if (de.scrollHeight > innerHeight + 300) return de.scrollHeight;
    let best = null, bh = 0;
    for (const e of document.querySelectorAll('body *')) {
      const o = getComputedStyle(e).overflowY;
      if ((o === 'auto' || o === 'scroll') && e.clientHeight > innerHeight * 0.6 && e.scrollHeight > Math.max(bh, e.clientHeight + 300)) { best = e; bh = e.scrollHeight; }
    }
    for (let n = best; n && n !== de; n = n.parentElement) for (const [k, v] of [['height', 'auto'], ['max-height', 'none'], ['overflow', 'visible']]) n.style.setProperty(k, v, 'important');
    for (const n of [de, document.body]) { n.style.setProperty('height', 'auto', 'important'); n.style.setProperty('overflow', 'visible', 'important'); }
    return de.scrollHeight;
  })()`);
  if (!height || height < 2000 || WALL.test(title)) return { fail: `${url} (${title || 'no page'}, ${height}px)` };
  // lazy images in, cookie and chat overlays out of the picture
  await ev(`(async () => { for (let y = 0; y < Math.min(document.body.scrollHeight, ${SHOT_MAX}); y += 700) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 200)); } scrollTo(0, 0);
    const s = document.createElement('style'); s.textContent = '#onetrust-consent-sdk,#didomi-host,#CybotCookiebotDialog,#usercentrics-root,#truste-consent-track,.truste_box_overlay,[id^=sp_message],#ketch-consent,.osano-cm-window,#hs-eu-cookie-confirmation,#termly-code-snippet-support,.cc-window,#cmpbox,.qc-cmp2-container,#axeptio_overlay,#tarteaucitronRoot,.fc-consent-root,#credential_picker_container,[id*=intercom],[class*=newsletter-popup i]{display:none!important}'; document.head.append(s);
    // the picture keeps the page and its top header; every other fixed layer (consent dialogs, bars, backdrops, chat, promos) goes,
    // and keeps going while late ones appear
    const sweep = () => { for (const e of document.querySelectorAll('body *')) { if (getComputedStyle(e).position !== 'fixed') continue;
      const r = e.getBoundingClientRect(); if (r.top <= 5 && r.height < 200) continue; e.style.setProperty('display', 'none', 'important'); } };
    sweep(); setInterval(sweep, 250);
    document.documentElement.style.overflow = 'visible'; document.body.style.overflow = 'visible'; })()`, true);
  await sleep(1500);
  const meta = await ev(`(() => {
    const els = [...document.querySelectorAll('body *')].filter((e) => e.offsetParent).slice(0, 4000);
    const count = (f) => { const m = new Map(); els.forEach((e) => { const v = f(e); if (v) m.set(v, (m.get(v) || 0) + (e.getBoundingClientRect().width * e.getBoundingClientRect().height > 40000 ? 5 : 1)); }); return [...m].sort((a, b) => b[1] - a[1]).map(([v]) => v); };
    const bgs = count((e) => { const c = getComputedStyle(e).backgroundColor; return /rgba\\(.*, 0\\)/.test(c) || c === 'transparent' ? null : c; });
    const body = getComputedStyle(document.body).backgroundColor;
    return { bg: !/rgba\\(.*, 0\\)/.test(body) ? body : bgs[0] || 'rgb(255, 255, 255)', colors: [...count((e) => getComputedStyle(e).color).slice(0, 3), ...bgs.slice(0, 3)], h: Math.min(document.documentElement.scrollHeight, ${SHOT_MAX}) };
  })()`);
  const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width: 1440, height: meta.h, scale: 1 } });
  if (!shot?.data) return { fail: `${url} (screenshot)` };
  const raw = Buffer.from(shot.data, 'base64');
  const slug = slugOf(url);
  const small = await sharp(raw).resize({ width: W }).toBuffer({ resolveWithObject: true });
  const h = Math.min(MAX_H, small.info.height);
  const fold = Math.round((W * 10) / 16);
  await sharp(small.data).extract({ left: 0, top: 0, width: W, height: Math.min(fold, h) }).webp({ quality: 72 }).toFile(`public/refs/${slug}.webp`);
  await sharp(small.data).extract({ left: 0, top: 0, width: W, height: h }).webp({ quality: 62 }).toFile(`public/refs/${slug}.full.webp`);
  const big = await sharp(raw).resize({ width: ORIG_W }).toBuffer({ resolveWithObject: true });
  await sharp(big.data).extract({ left: 0, top: 0, width: ORIG_W, height: Math.min(ORIG_MAX, big.info.height) }).webp({ quality: 60 }).toFile(`public/refs/${slug}.orig.webp`);
  const lum = (meta.bg.match(/\d+/g) ?? [255, 255, 255]).slice(0, 3).reduce((a, n) => a + Number(n), 0) / 3;
  const mode = lum < 100 ? 'dark' : 'light';
  return {
    ref: {
      slug, title: title.split(/\s[|–—-]\s/)[0].trim().slice(0, 60) || hostOf(url), url, cats: [cat], mode,
      styles: mode === 'dark' ? ['dark-mode'] : [], vibes: [], structure: undefined, northstar: '',
      palette: [...new Set(meta.colors.map(hex))].slice(0, 4), h, original: `refs/${slug}.orig.webp`, editorial: false, manual: true,
    },
  };
}

const failed = [];
const workers = 3;
await Promise.all(Array.from({ length: workers }, async (_, w) => {
  const b = await browser(9500 + w + Math.floor(Math.random() * 300));
  for (let i = w; i < jobs.length; i += workers) {
    const r = await capture(b, jobs[i]).catch((e) => ({ fail: `${jobs[i].url} (${e.message})` }));
    if (r.ref) { if (jobs[i].cats) r.ref.cats = jobs[i].cats; const at = manual.findIndex((x) => x.slug === r.ref.slug); if (at >= 0) manual[at] = r.ref; else manual.push(r.ref); console.log(`+ ${jobs[i].cat.padEnd(12)} ${r.ref.slug}`); } else { failed.push(r.fail); console.log(`- ${r.fail}`); }
    writeFileSync('scripts/refs-manual.json', JSON.stringify(manual, null, 2) + '\n');
  }
  b.close();
}));
console.log(`\n${manual.length} hand-picked in pool${failed.length ? `; failed: ${failed.length}` : ''}`);
