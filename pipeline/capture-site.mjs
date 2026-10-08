// Captures any live site as reference material: rendered HTML, full-page screenshots (desktop and
// phone) and the tokens it actually uses (type families and sizes, colours, radii, spacing).
// For the client's aesthetic ideal, their competitors and their current site.
//   node pipeline/capture-site.mjs <url> <out-folder>
// Writes <out>/page.html, desktop.png, phone.png, tokens.json, tokens.md
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawn } from 'node:child_process';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const [url, outArg] = process.argv.slice(2);
if (!url || !outArg) { console.error('usage: node pipeline/capture-site.mjs <url> <out-folder>'); process.exit(1); }
const out = resolve(outArg);
mkdirSync(out, { recursive: true });

const port = 9800 + Math.floor(Math.random() * 150);
const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', `--remote-debugging-port=${port}`, '--user-data-dir=' + join(process.env.TMPDIR ?? '/tmp', `capture-${port}`), 'about:blank'], { stdio: 'ignore' });
let wsUrl;
for (let i = 0; i < 50 && !wsUrl; i++) {
  await new Promise((r) => setTimeout(r, 200));
  try { wsUrl = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find((t) => t.type === 'page')?.webSocketDebuggerUrl; } catch {}
}
const ws = new WebSocket(wsUrl);
await new Promise((r) => ws.addEventListener('open', r, { once: true }));
let id = 0;
const waiting = new Map();
ws.addEventListener('message', (e) => { const m = JSON.parse(e.data); if (m.id && waiting.has(m.id)) { waiting.get(m.id)(m.result ?? m.error); waiting.delete(m.id); } });
const send = (method, params = {}) => new Promise((r) => { const i = ++id; waiting.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function shoot(name, width, height, mobile) {
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile });
  await send('Page.navigate', { url });
  await wait(6000); // SPAs, fonts, entrance animations
  // walk the page so lazy images load, then return to the top
  await send('Runtime.evaluate', { expression: `(async () => { for (let y = 0; y < document.body.scrollHeight; y += innerHeight * .8) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 250)); } scrollTo(0, 0); })()`, awaitPromise: true });
  await wait(800);
  const { result } = await send('Runtime.evaluate', { expression: 'Math.min(document.documentElement.scrollHeight, 16000)', returnByValue: true });
  const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width, height: result.value, scale: 1 } });
  writeFileSync(join(out, `${name}.png`), Buffer.from(shot.data, 'base64'));
}

await send('Page.enable');
await send('Runtime.enable');
await shoot('desktop', 1440, 900, false);

const tokens = (await send('Runtime.evaluate', { returnByValue: true, expression: `(() => {
  const els = [...document.querySelectorAll('body *')].filter((e) => e.offsetParent && e.getBoundingClientRect().width);
  const count = (f) => { const m = new Map(); els.forEach((e) => { const v = f(e); if (v) m.set(v, (m.get(v) || 0) + 1); }); return [...m].sort((a, b) => b[1] - a[1]); };
  const role = (sel) => { const e = document.querySelector(sel); if (!e) return null; const c = getComputedStyle(e); return { family: c.fontFamily, size: c.fontSize, weight: c.fontWeight, lineHeight: c.lineHeight, letterSpacing: c.letterSpacing, transform: c.textTransform }; };
  return {
    url: location.href, title: document.title,
    roles: { h1: role('h1'), h2: role('h2'), h3: role('h3'), body: role('p'), button: role('button, a[class*=btn], a[class*=button]'), nav: role('nav a') },
    families: count((e) => getComputedStyle(e).fontFamily.split(',')[0].replace(/["']/g, '')).slice(0, 6),
    sizes: count((e) => getComputedStyle(e).fontSize).slice(0, 10),
    colors: count((e) => getComputedStyle(e).color).slice(0, 8),
    backgrounds: count((e) => { const b = getComputedStyle(e).backgroundColor; return b === 'rgba(0, 0, 0, 0)' ? null : b; }).slice(0, 8),
    radii: count((e) => { const r = getComputedStyle(e).borderRadius; return r === '0px' ? null : r; }).slice(0, 6),
    gaps: count((e) => { const g = getComputedStyle(e).gap; return g === 'normal' ? null : g; }).slice(0, 8),
    outline: [...document.querySelectorAll('h1, h2, h3')].filter((h) => h.offsetParent).slice(0, 40).map((h) => ({ tag: h.tagName.toLowerCase(), y: Math.round(h.getBoundingClientRect().top + scrollY), text: h.textContent.trim().replace(/\\s+/g, ' ').slice(0, 90) })),
    height: document.documentElement.scrollHeight,
    motion: { gsap: !!window.gsap, lenis: !!(window.Lenis || document.querySelector('.lenis')), three: !!window.THREE || !!document.querySelector('canvas'), video: document.querySelectorAll('video').length },
  };
})()` })).result.value;
const html = (await send('Runtime.evaluate', { expression: 'document.documentElement.outerHTML', returnByValue: true })).result.value;
// <base> keeps the original stylesheets, fonts and images loading when page.html is opened locally
writeFileSync(join(out, 'page.html'), `<!-- captured from ${url} on ${new Date().toISOString()} : reference only -->\n${html.replace(/<head([^>]*)>/i, `<head$1><base href="${url}">`)}`);
await shoot('phone', 390, 844, true);
ws.close();
chrome.kill();

writeFileSync(join(out, 'tokens.json'), JSON.stringify(tokens, null, 2));
const row = (r) => (r ? `${r.family.split(',')[0]} ${r.size} w${r.weight} lh ${r.lineHeight} ls ${r.letterSpacing}${r.transform !== 'none' ? ' ' + r.transform : ''}` : '—');
writeFileSync(join(out, 'tokens.md'), `# ${tokens.title}\n\n${url}\n\n| Role | Type |\n|---|---|\n${Object.entries(tokens.roles).map(([k, v]) => `| ${k} | ${row(v)} |`).join('\n')}\n\nFamilies: ${tokens.families.map(([f, n]) => `${f} (${n})`).join(', ')}\nColours: ${tokens.colors.map(([c]) => c).join(', ')}\nBackgrounds: ${tokens.backgrounds.map(([c]) => c).join(', ')}\nRadii: ${tokens.radii.map(([r]) => r).join(', ') || '0'}\nGaps: ${tokens.gaps.map(([g]) => g).join(', ')}\nMotion: ${Object.entries(tokens.motion).filter(([, v]) => v).map(([k, v]) => (v === true ? k : `${k} ${v}`)).join(', ') || 'none detected'}\n\n## Outline (page ${tokens.height}px)\n${tokens.outline.map((h) => `- ${h.tag} @${h.y}px · ${h.text}`).join('\n')}\n`);
// bot walls answer with their own page; say so instead of handing over its tokens
if (/just a moment|attention required|access denied|verify you are human/i.test(tokens.title)) console.warn(`blocked by a bot wall ("${tokens.title}"): use the inspo capture (get_screen) or screenshots the client sends`);
console.log(`captured ${url} → ${out}`);
