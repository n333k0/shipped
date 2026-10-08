// Internal, local only: the owner hides references that should never show as examples in the brief.
// Serves on 127.0.0.1 (never deployed) and saves straight into src/data/ref-exclude.json.
//   npm run curate        → http://127.0.0.1:4330
// After saving, commit and push so the live brief stops showing them.
import { createServer } from 'node:http';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';

const PORT = Number(process.env.PORT ?? 4330);
const EXCLUDE = 'src/data/ref-exclude.json';
const industries = [...readFileSync('src/data/brief.ts', 'utf8').matchAll(/\{ id: '(\w+)', name: '([^']+)' \}/g)]
  .map(([, id, name]) => ({ id, name })).filter((c) => c.id !== 'other');
const esc = (v) => String(v ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const host = (u) => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return u; } };

function page() {
  const refs = JSON.parse(readFileSync('src/data/references.json', 'utf8'));
  const hidden = JSON.parse(readFileSync(EXCLUDE, 'utf8'));
  const count = (f) => refs.filter(f).length;
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Curar referencias · local</title>
<style>
  :root { --ink: #0b0b0b; --paper: #f3f1ea; --spark: #d8ff85; --booked: #ff8a65; }
  * { box-sizing: border-box; } body { margin: 0; background: var(--ink); color: var(--paper); font: 15px/1.5 'Inter Tight', system-ui, sans-serif; }
  main { max-width: 1400px; margin: 0 auto; padding: 48px 20px 120px; }
  .label { font: 500 11px/1 ui-monospace, monospace; letter-spacing: .14em; text-transform: uppercase; color: var(--spark); }
  h1 { font-size: clamp(36px, 5vw, 56px); letter-spacing: -.035em; line-height: 1; margin: 12px 0; } h1 i { color: var(--spark); font-family: 'Instrument Serif', serif; font-weight: 400; }
  p.lead { max-width: 640px; color: rgb(243 241 234 / .6); margin: 0; }
  #tabs { display: flex; flex-wrap: wrap; gap: 8px; margin: 28px 0 20px; }
  .chip { min-height: 38px; padding: 0 15px; border-radius: 99px; border: 1px solid rgb(255 255 255 / .15); background: none; color: rgb(243 241 234 / .8); font: inherit; font-size: 14px; cursor: pointer; }
  .chip[aria-pressed="true"] { background: var(--spark); border-color: var(--spark); color: var(--ink); }
  #grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 14px; }
  .strip { display: block; aspect-ratio: 16/10; overflow: hidden; border-radius: 12px; background: rgb(255 255 255 / .04); }
  .strip img { display: block; width: 100%; transition: transform .6s ease; }
  .strip:hover img { transform: translateY(calc(var(--shift) * -1)); transition: transform 7s linear; }
  .row { display: flex; justify-content: space-between; gap: 8px; margin-top: 8px; } .row b { display: block; font-size: 14px; font-weight: 500; } .row small { color: rgb(243 241 234 / .45); font-size: 12px; }
  .tog { flex: none; align-self: start; border-radius: 99px; border: 1px solid rgb(255 255 255 / .15); background: none; color: var(--paper); font: inherit; font-size: 12px; padding: 4px 12px; cursor: pointer; }
  .cur.off img { opacity: .25; filter: grayscale(1); } .cur.off .tog { background: var(--booked); border-color: var(--booked); color: var(--ink); }
  .cur[hidden] { display: none; }
  .bar { position: fixed; inset: auto 0 0; display: flex; gap: 12px; align-items: center; justify-content: flex-end; padding: 12px 20px; background: rgb(11 11 11 / .9); backdrop-filter: blur(12px); border-top: 1px solid rgb(255 255 255 / .1); }
  .bar p { margin: 0 auto 0 0; color: rgb(243 241 234 / .6); font-size: 14px; } .bar b { color: var(--paper); }
  #save { min-height: 44px; padding: 0 22px; border: 0; border-radius: 99px; background: var(--spark); color: var(--ink); font: 600 14px 'Inter Tight', system-ui; cursor: pointer; } #save:disabled { opacity: .4; cursor: default; }
</style></head><body><main>
<p class="label">Local · uso interno</p>
<h1>Referencias <i>que mostramos.</i></h1>
<p class="lead">Ocultá las que no querés que aparezcan como ejemplo en el formulario. "Guardar" escribe ${EXCLUDE}; después commit y push para que el sitio deje de mostrarlas.</p>
<div id="tabs">
  <button class="chip" data-tab="all" aria-pressed="true">Todas · ${refs.length}</button>
  ${industries.map((c) => `<button class="chip" data-tab="${c.id}" aria-pressed="false">${esc(c.name)} · ${count((r) => r.cats.includes(c.id))}</button>`).join('')}
  <button class="chip" data-tab="manual" aria-pressed="false">Capturadas por nosotros · ${count((r) => r.manual)}</button>
  <button class="chip" data-tab="hidden" aria-pressed="false">Ocultas · <span id="n-hidden">0</span></button>
</div>
<div id="grid">${refs.map((r) => `<article class="cur" data-slug="${r.slug}" data-cats="${r.cats.join(' ')}${r.manual ? ' manual' : ''}">
  <a class="strip" href="${esc(r.url)}" target="_blank" rel="noopener" style="--shift:${Math.max(0, ((r.h - 325) / r.h) * 100).toFixed(1)}%"><img src="/refs/${r.slug}.full.webp" loading="lazy" width="520" height="${r.h}" alt=""></a>
  <div class="row"><div><b>${esc(host(r.url))}</b><small>${r.cats.join(' · ')} · ${r.mode}</small></div><button class="tog" data-slug="${r.slug}">Ocultar</button></div>
</article>`).join('')}</div>
</main>
<div class="bar"><p><b id="n-hidden-2">0</b> ocultas · <span id="n-changed">sin cambios</span></p><button id="save" disabled>Guardar</button></div>
<script>
  let saved = ${JSON.stringify(hidden)};
  const hidden = new Set(saved);
  let tab = 'all';
  const cards = [...document.querySelectorAll('.cur')];
  const render = () => {
    for (const c of cards) {
      const off = hidden.has(c.dataset.slug);
      c.classList.toggle('off', off);
      c.querySelector('.tog').textContent = off ? 'Oculta · mostrar' : 'Ocultar';
      c.hidden = tab === 'hidden' ? !off : tab !== 'all' && !c.dataset.cats.split(' ').includes(tab);
    }
    const n = [...hidden].filter((s) => cards.some((c) => c.dataset.slug === s)).length;
    document.getElementById('n-hidden').textContent = n;
    document.getElementById('n-hidden-2').textContent = n;
    const changed = [...hidden].filter((s) => !saved.includes(s)).length + saved.filter((s) => !hidden.has(s)).length;
    document.getElementById('n-changed').textContent = changed ? changed + ' cambio' + (changed > 1 ? 's' : '') + ' sin guardar' : 'sin cambios';
    document.getElementById('save').disabled = !changed;
  };
  document.getElementById('grid').addEventListener('click', (e) => {
    const b = e.target.closest('.tog'); if (!b) return;
    hidden.has(b.dataset.slug) ? hidden.delete(b.dataset.slug) : hidden.add(b.dataset.slug);
    render();
  });
  document.getElementById('tabs').addEventListener('click', (e) => {
    const b = e.target.closest('[data-tab]'); if (!b) return;
    tab = b.dataset.tab;
    document.querySelectorAll('[data-tab]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    render();
  });
  document.getElementById('save').addEventListener('click', async (e) => {
    const list = [...hidden].sort();
    const res = await fetch('/save', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(list) });
    if (res.ok) { saved = list; render(); e.target.textContent = 'Guardado ✓'; setTimeout(() => (e.target.textContent = 'Guardar'), 2000); }
    else e.target.textContent = 'No se pudo guardar';
  });
  render();
</script></body></html>`;
}

const types = { '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg' };
createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/save') {
    let body = '';
    req.on('data', (c) => (body += c));
    req.on('end', () => {
      try {
        const list = JSON.parse(body);
        if (!Array.isArray(list) || !list.every((s) => typeof s === 'string' && /^[\w.-]+$/.test(s))) throw new Error('bad list');
        writeFileSync(EXCLUDE, JSON.stringify(list, null, 2) + '\n');
        console.log(`saved ${list.length} hidden → ${EXCLUDE}`);
        res.writeHead(200).end('ok');
      } catch { res.writeHead(400).end('bad request'); }
    });
    return;
  }
  if (req.url.startsWith('/refs/')) {
    const file = normalize(join('public', decodeURIComponent(req.url.split('?')[0])));
    if (!file.startsWith('public/refs/') || !existsSync(file)) return res.writeHead(404).end();
    return res.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream' }).end(readFileSync(file));
  }
  if (req.url === '/' || req.url.startsWith('/?')) return res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }).end(page());
  res.writeHead(404).end();
}).listen(PORT, '127.0.0.1', () => console.log(`curate → http://127.0.0.1:${PORT}  (local only; Ctrl+C to stop)`));
