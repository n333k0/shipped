// The brief as the client receives it (PDF), plus the internal notes we keep (internal.md).
//   node pipeline/make-client-pdf.mjs <client-folder>   (folder has brief.json and story.json)
// Client PDF: their brief told back as a story. No build spec, no flags, no internals.
import { readFileSync, writeFileSync, mkdirSync, existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import sharp from 'sharp';
import { execFileSync } from 'node:child_process';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SHIPPED = fileURLToPath(new URL('..', import.meta.url)).replace(/\/$/, ''); // this repo
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const dir = resolve(process.argv[2] ?? '.');
const b = JSON.parse(readFileSync(join(dir, 'brief.json'), 'utf8'));
const story = existsSync(join(dir, 'story.json')) ? JSON.parse(readFileSync(join(dir, 'story.json'), 'utf8')) : {};
const refs = JSON.parse(readFileSync(`${SHIPPED}/src/data/references.json`, 'utf8'));
const site = readFileSync(`${SHIPPED}/src/data/site.ts`, 'utf8');

const packages = {
  landing: { name: 'Landing', price: 1750, days: 5, pages: 1, blocks: 8, deposit: 100 },
  website: { name: 'Website', price: 4000, days: 10, pages: 5, blocks: 30, deposit: 50 },
  websiteplus: { name: 'Website+', price: 8500, days: 20, pages: 12, blocks: 70, deposit: 50 },
};
const pkg = packages[b.project.product] ?? packages.website;
const usd = (n) => 'USD ' + n.toLocaleString('es-AR');
const esc = (v) => String(v ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const host = (u) => { try { return new URL(u.startsWith('http') ? u : 'https://' + u).hostname.replace(/^www\./, ''); } catch { return u; } };
const list = (a) => (a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' y ' + a.at(-1));

// Next open build week
const booked = Object.fromEntries([...site.matchAll(/'(\d{4}-\d{2}-\d{2})':\s*(\d)/g)].map((m) => [m[1], +m[2]]));
const slots = +(site.match(/slotsPerWeek = (\d+)/)?.[1] ?? 2);
const lead = +(site.match(/leadDays = (\d+)/)?.[1] ?? 3);
const start = new Date(b.created_at);
start.setUTCDate(start.getUTCDate() + lead);
start.setUTCDate(start.getUTCDate() + ((8 - start.getUTCDay()) % 7));
while ((booked[start.toISOString().slice(0, 10)] ?? 0) >= slots) start.setUTCDate(start.getUTCDate() + 7);
const fmtDate = (d) => d.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', timeZone: 'UTC' });
const week = fmtDate(start);
const launch = new Date(start);
for (let left = pkg.days - 1; left > 0; ) { launch.setUTCDate(launch.getUTCDate() + 1); if (launch.getUTCDay() % 6) left--; }

const es = {
  goal: { buy: 'vender online', book_call: 'conseguir llamadas y reuniones', contact: 'generar contactos', understand: 'explicar lo que hacen', sign_up: 'sumar registros', visit: 'llevar gente a su lugar', other: 'cumplir su objetivo principal' },
  sliders: { dark_light: ['Claro', 'Oscuro'], minimal_expressive: ['Minimal', 'Expresivo'], editorial_digital: ['Editorial', 'Digital'], serious_playful: ['Serio', 'Lúdico'], quiet_bold: ['Sereno', 'Audaz'], classic_experimental: ['Clásico', 'Experimental'] },
  push: [[20, 'Seguro y probado: estructuras que sus clientes ya saben usar.'], [40, 'Familiar, con algunos toques propios.'], [60, 'Equilibrado: fácil de usar, con una o dos ideas que se recuerdan.'], [80, 'Con ideas que se recuerdan. Algo los va a sorprender.'], [101, 'Todo adentro: cosas que no vieron en otros sitios.']],
  motion: { still: 'Casi sin animación: el contenido hace el trabajo.', subtle: 'Animación sutil: transiciones suaves entre páginas y al pasar el mouse.', dynamic: 'Dinámica: las cosas aparecen y se mueven mientras se scrollea.', wild: 'Intensa: piezas interactivas que responden al mouse.' },
  type: { serif: 'Serif clásica', sans: 'Sans limpia', mix: 'Serif + sans, tono revista', geometric: 'Geométrica', mono: 'Técnica', display: 'Expresiva', you_pick: 'La elegimos nosotros' },
  traits: { Typography: 'la tipografía', Layout: 'la estructura', Colours: 'el color', Motion: 'el movimiento', Photography: 'la fotografía', Simplicity: 'la simpleza', Density: 'la densidad', Navigation: 'la navegación', 'Overall feeling': 'la sensación general' },
  block: { hero: 'Portada', logo_cloud: 'Logos', intro: 'Introducción', services: 'Servicios', features: 'Destacados', how_it_works: 'Cómo funciona', case_studies: 'Casos', testimonials: 'Testimonios', gallery: 'Galería', team: 'Equipo', pricing: 'Precios', faq: 'Preguntas', cta: 'Llamado a la acción', contact: 'Contacto', footer: 'Pie', custom: 'A medida' },
  feature: { forms: 'Formulario de contacto', newsletter: 'Newsletter', booking: 'Agenda de reuniones', whatsapp: 'WhatsApp', cms: 'Gestor de contenido', blog: 'Blog', ecommerce: 'Tienda online', payments: 'Pagos', login: 'Acceso de clientes', multilingual: 'Sitio en varios idiomas', search: 'Buscador', maps: 'Mapa', analytics: 'Analítica', crm: 'CRM', custom: 'Integración a medida' },
  asset: { logo: 'Logo', guidelines: 'Manual de marca', fonts: 'Tipografías', palette: 'Paleta de color', photography: 'Fotografía', product: 'Fotos de producto', illustrations: 'Ilustraciones', videos: 'Videos', copy: 'Textos' },
  copy: { final: 'Los textos los traen ustedes, finales.', rough: 'Ustedes traen borradores; nosotros los pulimos.', info: 'Ustedes traen la información; nosotros la escribimos.', nothing: 'Escribimos todo desde cero, a partir de una charla.' },
};

// nth business day from a Monday (1 = that Monday)
const bday = (from, n) => { const d = new Date(from); for (let left = n - 1; left > 0; ) { d.setUTCDate(d.getUTCDate() + 1); if (d.getUTCDay() % 6) left--; } return d; };
const short = (d) => d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', timeZone: 'UTC' }).replace('.', '');
const D = pkg.days, planEnd = Math.max(1, Math.round(D * 0.2)), buildEnd = Math.floor(D * 0.7);
const span = (a, z) => (a === z ? `Día ${a} · ${short(bday(start, a))}` : `Días ${a}–${z} · ${short(bday(start, a))} → ${short(bday(start, z))}`);
const paidNow = b.start?.mode === 'pay';
const today = paidNow ? b.start.today : Math.round((pkg.price * pkg.deposit) / 100);
const finalPrice = paidNow ? b.start.total : pkg.price;

// Line art, drawn for this client: their pages as a stack of sheets, and the launch as a box
const iso = 'matrix(0.866 0.5 -0.866 0.5 0 0)';
function siteStack(list, { ink, hi, w = 600, h = 480 }) {
  const n = list.length, gap = n > 1 ? Math.min(44, 260 / (n - 1)) : 0, W = 270, H = 202, x = 215, base = h / 2 + ((n - 1) * gap) / 2;
  const sheet = (p, i) => {
    const top = i === 0, y = base - (n - 1 - i) * gap;
    const marks = p.blocks.slice(0, top ? 9 : 4).map((blk, k) => `<line x1="${-W / 2 + 22}" y1="${-H / 2 + 30 + k * 13}" x2="${-W / 2 + 22 + (blk.type === 'hero' ? 128 : blk.type === 'cta' ? 64 : 88 + ((k * 23) % 56))}" y2="${-H / 2 + 30 + k * 13}" stroke="${blk.type === 'cta' || top && k === 0 ? hi : ink}" stroke-width="${top && k === 0 ? 4 : 2}" stroke-linecap="round" opacity="${top ? 1 : .55}"/>`).join('');
    return `<g transform="translate(${x} ${y}) ${iso}"><rect x="${-W / 2}" y="${-H / 2}" width="${W}" height="${H}" rx="9" fill="${top ? hi : 'none'}" fill-opacity="${top ? .18 : 0}" stroke="${top ? ink : ink}" stroke-width="${top ? 2.4 : 1.4}"/><line x1="${-W / 2}" y1="${-H / 2 + 16}" x2="${W / 2}" y2="${-H / 2 + 16}" stroke="${ink}" stroke-width="1.2" opacity=".6"/>${marks}</g>`;
  };
  const labels = list.slice(0, 12).map((p, i) => `<text x="${w - 128}" y="${40 + i * 24}" font-family="JetBrains Mono" font-size="11" fill="${ink}" opacity="${i ? .7 : 1}">${String(i + 1).padStart(2, '0')} ${esc(p.name.length > 11 ? p.name.slice(0, 10) + '…' : p.name)}<tspan x="${w - 4}" text-anchor="end">${p.blocks.length}</tspan></text>`).join('');
  return `<svg viewBox="0 0 ${w} ${h}" width="100%">${list.map(sheet).reverse().join('')}${labels}</svg>`;
}
function box(stroke, hi, s = 60) {
  const c = s * 0.866, pts = (a) => a.map(([x, y]) => `${x},${y}`).join(' ');
  return `<svg viewBox="${-c - 6} ${-s / 2 - 22} ${2 * c + 12} ${2 * s + 30}" width="100%"><g fill="none" stroke="${stroke}" stroke-width="2" stroke-linejoin="round">
    <polygon points="${pts([[-c, 0], [0, s / 2], [0, s * 1.5], [-c, s]])}"/><polygon points="${pts([[c, 0], [0, s / 2], [0, s * 1.5], [c, s]])}"/>
    <polygon points="${pts([[-c, 0], [-c - 4, -16], [-4, s / 2 - 16], [0, s / 2]])}"/><polygon points="${pts([[c, 0], [c + 4, -16], [4, s / 2 - 16], [0, s / 2]])}"/>
    <line x1="${-c / 2}" y1="${s / 4}" x2="${-c / 2}" y2="${s * 1.25}" stroke="${hi}" stroke-width="5"/></g>
    <circle cx="0" cy="${-s / 2 - 6}" r="7" fill="${hi}"/></svg>`;
}

const v = b.visual;
const picked = v.references.map((r) => refs.find((x) => x.id === r.id)).filter(Boolean);
const closest = picked.find((r) => r.id === v.closest) ?? picked[0];
const words = Object.entries(v.sliders).filter(([k]) => es.sliders[k]).map(([k, n]) => (n <= 40 ? es.sliders[k][0] : n >= 60 ? es.sliders[k][1] : null)).filter(Boolean).slice(0, 4);
const pushLine = es.push.find(([max]) => (v.sliders.safe_experimental ?? 50) < max)[1];
const pages = b.sitemap.pages;
const blocks = pages.reduce((n, p) => n + p.blocks.length, 0);
const files = Object.entries(b.brand.files ?? {});
const fileCount = files.reduce((n, [, f]) => n + f.length, 0) + (b.copy.files?.length ?? 0) + pages.flatMap((p) => p.blocks.flatMap((x) => x.assets ?? [])).length;
const feats = Object.keys(b.functional);
const C = b.project.company;

const weHandle = [
  'Diseño de cada página, en escritorio y celular',
  b.copy.status === 'final' ? 'Corrección y armado de sus textos' : b.copy.status === 'rough' ? 'Pulido de todos los textos' : 'Escritura de todos los textos',
  'Desarrollo, pruebas y publicación',
  ...feats.map((f) => es.feature[f]).filter(Boolean),
  b.technical.domain ? `Conexión del dominio ${b.technical.domain}` : 'Ayuda con el dominio',
  ...(b.brand.logo_upgrade ? ['Una propuesta para mejorar su logo (opcional, aparte)'] : []),
  ...(b.technical.seo_keep === 'Yes' ? ['Redirecciones para no perder lo ganado en Google'] : []),
];
const theyBring = [
  ...(b.brand.has ?? []).filter((a) => a !== 'nothing').map((a) => {
    const n = (b.brand.files?.[a] ?? []).length;
    return `${es.asset[a] ?? a}${n ? ` · ${n} archivo${n > 1 ? 's' : ''}` : ''}`;
  }),
  ...(b.brand.font_names ? [`Tipografías: ${b.brand.font_names}`] : []),
  es.copy[b.copy.status],
];
const pending = (b.missing ?? []).map((m) => (/logo/i.test(m) ? 'el archivo del logo' : m.toLowerCase()));

const swatches = (b.brand.palette_hex ?? '').match(/#[0-9a-f]{6}/gi) ?? [];
const refFig = (r) => `<figure class="ref${r === closest ? ' closest' : ''}"><div class="bar"><i></i><i></i><i></i><span>${esc(host(r.url))}</span></div><img src="file://${SHIPPED}/public/refs/${r.slug}.webp"><figcaption>${r === closest ? '<b>La más cercana.</b> ' : ''}${esc(r.northstar ?? '')}</figcaption></figure>`;

const pageCard = (p) => `<div class="page-card"><header><h3>${esc(p.name)}</h3><span class="label">${esc(p.path)} · ${p.blocks.length} bloque${p.blocks.length === 1 ? '' : 's'}</span></header>
    ${p.blocks.map((x) => `<div class="blk"><span class="n">${String(x.n).padStart(2, '0')}</span><span class="t">${es.block[x.type] ?? x.type}</span><span class="h">${esc(x.headline ?? (x.notes ? x.notes : 'Lo escribimos nosotros.'))}</span></div>`).join('')}
  </div>`;

const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${esc(C)} · Brief del sitio · ${b.id}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
  @page { size: A4; margin: 18mm 17mm 18mm; }
  @page :first { margin: 0; }
  @page closing { margin: 0; }
  @page bleed { margin: 0; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  :root { --ink: #0b0b0b; --paper: #f3f1ea; --line: #dcd8cc; --mute: #6b685f; --spark: #d8ff85; }
  html { background: #fff; }
  body { font: 400 10.6pt/1.55 'Inter Tight', sans-serif; color: var(--ink); -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .label { font: 500 7.4pt/1 'JetBrains Mono', monospace; text-transform: uppercase; letter-spacing: .15em; color: var(--mute); }
  .accent { font-family: 'Instrument Serif', serif; font-style: italic; font-weight: 400; letter-spacing: -.01em; }
  h2 { font: 500 25pt/1.02 'Inter Tight'; letter-spacing: -.03em; margin: 3mm 0 5mm; break-after: avoid; }
  h3 { font: 600 11pt/1.3 'Inter Tight'; break-after: avoid; }
  p + p { margin-top: 3mm; }
  section { margin-top: 15mm; }
  section > .label { display: block; break-after: avoid; }
  .avoid, figure, .card, .step, .blk, ul.check li, .kv dt, .kv dd { break-inside: avoid; }
  .page-card header { break-after: avoid; }

  .cover { height: 297mm; padding: 20mm 18mm 16mm; background: var(--ink); color: var(--paper); display: flex; flex-direction: column; break-after: page; }
  .cover .label { color: rgba(243,241,234,.5); }
  .logo { font: 600 17pt 'Inter Tight'; letter-spacing: -.03em; } .logo i { display: inline-block; width: .24em; height: .24em; border-radius: 50%; background: var(--spark); margin-left: .03em; }
  .cover h1 { font: 500 60pt/.95 'Inter Tight'; letter-spacing: -.04em; margin-top: 52mm; } .cover h1 .accent { color: var(--spark); display: block; }
  .cover .sub { margin-top: 9mm; max-width: 125mm; font-size: 14pt; line-height: 1.45; color: rgba(243,241,234,.78); }
  .cover .facts { display: grid; grid-template-columns: repeat(4, 1fr); gap: 3mm; margin-top: auto; }
  .cover .facts div { border-top: 1px solid rgba(243,241,234,.18); padding-top: 3mm; }
  .cover .facts b { display: block; font: 500 15pt/1.15 'Inter Tight'; margin-top: 2mm; letter-spacing: -.01em; }

  .lede { font-size: 15pt; line-height: 1.42; letter-spacing: -.01em; }
  .quote { font: 400 19pt/1.3 'Instrument Serif', serif; font-style: italic; border-left: 2px solid var(--ink); padding-left: 6mm; margin: 6mm 0; }
  .kv { display: grid; grid-template-columns: 30mm 1fr; border-top: 1px solid var(--line); }
  .kv > * { padding: 2.6mm 0; border-bottom: 1px solid var(--line); } .kv dt { color: var(--mute); }
  .words { font: 500 30pt/1 'Inter Tight'; letter-spacing: -.035em; margin: 2mm 0 6mm; } .words span { color: var(--mute); font-weight: 400; }
  .refs { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4mm; margin: 5mm 0; }
  .ref { border-radius: 3mm; overflow: hidden; border: 1px solid var(--line); background: #fff; }
  .card, .page-card { background: var(--paper) !important; border-color: transparent !important; }
  .ref.closest { outline: 2.5px solid var(--ink); outline-offset: -1px; }
  .ref .bar { display: flex; align-items: center; gap: 1mm; height: 5mm; padding: 0 2mm; border-bottom: 1px solid var(--line); font: 6.5pt 'JetBrains Mono'; color: var(--mute); }
  .ref .bar i { width: 1.4mm; height: 1.4mm; border-radius: 50%; background: var(--line); } .ref .bar span { margin-left: 1.5mm; }
  .ref img { display: block; width: 100%; aspect-ratio: 16/10; object-fit: cover; object-position: top; }
  .ref figcaption { padding: 2.2mm 2.4mm 2.6mm; font-size: 7.8pt; line-height: 1.4; color: var(--mute); } .ref figcaption b { color: var(--ink); }
  .cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3.5mm; margin-top: 5mm; }
  .card { background: #fff; border: 1px solid var(--line); border-radius: 3.5mm; padding: 4.5mm; }
  .card .label { margin-bottom: 2.5mm; display: block; }
  .card b { display: block; font: 500 13pt/1.2 'Inter Tight'; letter-spacing: -.01em; margin-bottom: 1.5mm; }
  .card p { font-size: 9pt; color: #3a3833; }
  .meter { position: relative; height: 1.4mm; border-radius: 2mm; background: var(--line); margin: 2mm 0 3mm; } .meter i { position: absolute; top: 50%; width: 3.6mm; height: 3.6mm; border-radius: 50%; background: var(--ink); transform: translate(-50%,-50%); box-shadow: 0 0 0 1.3mm var(--spark); }
  .two { display: grid; grid-template-columns: 1fr 1fr; gap: 7mm; }
  .page-card { border: 1px solid var(--line); border-radius: 3.5mm; background: #fff; padding: 3.8mm 5mm; margin-bottom: 3mm; }
  .page-card header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 2mm; } .page-card h3 { font-size: 13pt; }
  .blk { display: grid; grid-template-columns: 6mm 28mm 1fr; gap: 3mm; padding: 1.55mm 0; border-top: 1px solid var(--line); font-size: 8.8pt; }
  .opener { break-inside: avoid; }
  .blk .n { font: 500 7.5pt 'JetBrains Mono'; color: var(--mute); padding-top: .6mm; } .blk .t { font-weight: 600; } .blk .h { color: #3a3833; }
  ul.check { list-style: none; } ul.check li { padding: 2.2mm 0 2.2mm 6mm; border-top: 1px solid var(--line); position: relative; } ul.check li::before { content: ''; position: absolute; left: 0; top: 3.6mm; width: 2.4mm; height: 2.4mm; border-radius: 50%; background: var(--spark); box-shadow: inset 0 0 0 .5mm var(--ink); }
  .steps { display: grid; grid-template-columns: repeat(4, 1fr); gap: 3mm; margin-top: 5mm; }
  .step { border-top: 2px solid var(--ink); padding-top: 3mm; } .step .label { color: var(--ink); } .step b { display: block; font: 500 12pt/1.2 'Inter Tight'; margin: 2mm 0 1.2mm; } .step p { font-size: 8.8pt; color: #3a3833; }
  .price { display: flex; justify-content: space-between; align-items: center; gap: 6mm; background: var(--ink); color: var(--paper); border-radius: 4mm; padding: 6mm 7mm; margin-top: 7mm; }
  .price b { font: 500 22pt/1 'Inter Tight'; letter-spacing: -.02em; } .price .accent { color: var(--spark); }
  .price p { font-size: 9pt; color: rgba(243,241,234,.7); max-width: 80mm; }
  .swatches { display: flex; gap: 2mm; margin-top: 2mm; } .swatches i { width: 7mm; height: 7mm; border-radius: 50%; border: 1px solid var(--line); }
  .note { margin-top: 4mm; font-size: 9pt; color: var(--mute); }
  .bleed { page: bleed; break-before: page; break-after: page; height: 297mm; padding: 18mm 17mm 16mm; display: flex; flex-direction: column; position: relative; overflow: hidden; }
  .cover { position: relative; overflow: hidden; }
  .cover .dot { position: absolute; right: -24mm; top: 134mm; width: 106mm; height: 106mm; border-radius: 50%; background: var(--spark); }
  .cover .dot + * { position: relative; }
  .cover > * { position: relative; }
  section { position: relative; }
  section > h2 { max-width: 138mm; }
  .who-list ul.check li { padding: 1.5mm 0 1.5mm 6mm; font-size: 9.6pt; } .who-list ul.check li::before { top: 2.7mm; }
  .num { position: absolute; right: 0; top: -4mm; font: 600 58pt/1 'Inter Tight'; letter-spacing: -.05em; color: transparent; -webkit-text-stroke: 1px var(--ink); opacity: .9; }
  .manifesto { background: var(--spark); color: var(--ink); }
  .manifesto .big { font: 500 50pt/.93 'Inter Tight'; letter-spacing: -.045em; margin-top: 8mm; }
  .manifesto .big .accent { font-size: 1.08em; }
  .manifesto .art { margin: auto -6mm 0; }
  .manifesto .foot { display: flex; justify-content: space-between; border-top: 1.5px solid var(--ink); padding-top: 3mm; margin-top: 4mm; }
  .manifesto .label { color: var(--ink); }
  .road { background: var(--ink); color: var(--paper); }
  .road .label { color: rgba(243,241,234,.5); }
  .road h2 { font-size: 34pt; color: var(--paper); margin-bottom: 2mm; } .road h2 .accent { color: var(--spark); }
  .road .intro { font-size: 10.5pt; color: rgba(243,241,234,.7); max-width: 150mm; }
  .track { position: relative; margin-top: 7mm; padding-left: 9mm; }
  .track::before { content: ''; position: absolute; left: 2.2mm; top: 2mm; bottom: 8mm; width: 1.2mm; border-radius: 1mm; background: linear-gradient(var(--spark), var(--spark) 70%, rgba(216,255,133,.25)); }
  .stop { position: relative; display: grid; grid-template-columns: 34mm 1fr 1fr; gap: 0 5mm; padding: 0 0 5.2mm; break-inside: avoid; }
  .stop::before { content: ''; position: absolute; left: -9mm; top: .6mm; width: 5.6mm; height: 5.6mm; border-radius: 50%; background: var(--ink); border: 1.3mm solid var(--spark); }
  .stop.now::before { background: var(--spark); }
  .stop .when { font: 500 7.4pt/1.35 'JetBrains Mono'; text-transform: uppercase; letter-spacing: .08em; color: var(--spark); padding-top: 1.2mm; }
  .stop h3 { grid-column: 2 / 4; font: 500 15pt/1.15 'Inter Tight'; letter-spacing: -.02em; color: var(--paper); margin-bottom: 1.4mm; }
  .stop .who { margin-top: 0 !important; font-size: 8.6pt; line-height: 1.45; color: rgba(243,241,234,.72); } .stop .who b { display: block; font: 500 6.6pt 'JetBrains Mono'; letter-spacing: .14em; text-transform: uppercase; color: rgba(243,241,234,.42); margin-bottom: .6mm; }
  .stop .who:nth-of-type(1) { grid-column: 2; } .stop .who:nth-of-type(2) { grid-column: 3; }
  .pay { grid-column: 2 / 4; justify-self: start; margin-top: 1.8mm; font: 500 7.2pt 'JetBrains Mono'; letter-spacing: .06em; text-transform: uppercase; color: var(--ink); background: var(--spark); border-radius: 9mm; padding: 1.1mm 2.6mm; }
  .road .end { display: grid; grid-template-columns: 30mm 1fr auto; gap: 6mm; align-items: center; margin-top: auto; border-top: 1px solid rgba(243,241,234,.16); padding-top: 5mm; }
  .road .end b { font: 500 21pt/1 'Inter Tight'; letter-spacing: -.02em; white-space: nowrap; } .road .end .accent { color: var(--spark); }
  .road .end p { margin: 0; font-size: 8.6pt; color: rgba(243,241,234,.68); max-width: 64mm; }
  .thanks { page: closing; break-before: page; height: 297mm; padding: 20mm 18mm 16mm; background: var(--spark); color: var(--ink); display: flex; flex-direction: column; justify-content: flex-end; }
  .thanks h2 { font-size: 52pt; line-height: .96; } .thanks h2 .accent { display: block; }
  .thanks p { max-width: 130mm; font-size: 12.5pt; color: rgba(11,11,11,.75); } .thanks .label { color: rgba(11,11,11,.6); }
  .thanks .logo i { background: var(--ink); }
  /* tighter densities, used when the last white page would be nearly empty */
  .d1 section { margin-top: 11mm; } .d1 .blk { padding: 1.1mm 0; font-size: 8.4pt; } .d1 .page-card { padding: 3mm 4.5mm; margin-bottom: 2.4mm; } .d1 .who-list ul.check li { padding: 1.1mm 0 1.1mm 6mm; }
  .d2 section { margin-top: 8mm; } .d2 .blk { padding: .7mm 0; font-size: 8.2pt; } .d2 .page-card { padding: 2.6mm 4mm; margin-bottom: 2mm; } .d2 .quote { font-size: 16pt; margin: 4mm 0; } .d2 .card { padding: 3.5mm; } .d2 .who-list ul.check li { padding: .9mm 0 .9mm 6mm; font-size: 9pt; }
</style></head><body>

<div class="cover">
  <i class="dot"></i>
  <div style="display:flex;justify-content:space-between;align-items:center"><span class="logo">shipped<i></i></span><span class="label">Brief del sitio · ${b.id}</span></div>
  <h1>${esc(story.coverTitle ?? C + ',')}<span class="accent">${esc(story.coverAccent ?? 'empieza acá.')}</span></h1>
  <p class="sub">${esc(story.coverLine ?? `Esto es lo que escuchamos de ${C}. Revisalo con calma: es la base de cada decisión de diseño que vamos a tomar.`)}</p>
  <div class="facts">
    <div><span class="label">Formato</span><b>${pkg.name}</b></div>
    <div><span class="label">Recorrido</span><b>${pages.length} páginas · ${blocks} bloques</b></div>
    <div><span class="label">Sensación</span><b>${words.slice(0, 3).join(' · ') || 'Equilibrada'}</b></div>
    <div><span class="label">Semana de build</span><b>Desde el ${week}</b></div>
  </div>
  <p class="label" style="margin-top:8mm">Preparado para ${esc(b.contact.name)} · ${fmtDate(new Date(b.created_at))}</p>
</div>

<div class="bleed manifesto">
  <div style="display:flex;justify-content:space-between"><span class="label">Su sitio, en piezas</span><span class="label">${b.id}</span></div>
  <p class="big">${esc(C)}.<br>${pages.length} página${pages.length === 1 ? '' : 's'}, ${blocks} bloques.<br>${D} días hábiles.<br><span class="accent">Un solo precio.</span></p>
  <div class="art">${siteStack(pages, { ink: '#0b0b0b', hi: '#0b0b0b' })}</div>
  <div class="foot"><span class="label">${pkg.name} · ${esc(words.slice(0, 3).join(' · ') || 'Equilibrado')}</span><span class="label">Hecho a medida, no de plantilla</span></div>
</div>

<section style="margin-top:0">
  <span class="num" aria-hidden="true">01</span>
  <span class="label">01 — Lo que escuchamos</span>
  <h2>${esc(story.heardTitle ?? `${C}, en sus palabras.`)}</h2>
  <p class="quote">“${esc(b.project.describe)}”</p>
  <dl class="kv avoid">
    <dt>Lo que ofrecen</dt><dd>${esc(b.project.selling)}</dd>
    <dt>Para quién</dt><dd>${esc(b.project.audience)}</dd>
  </dl>
  <p class="lede" style="margin-top:6mm">Por eso el sitio va a tener un solo trabajo: <b>${es.goal[b.project.goal]}</b>. Cada página, cada bloque y cada botón empujan hacia ahí.</p>
</section>

<section>
  <span class="num" aria-hidden="true">02</span>
  <span class="label">02 — Cómo se va a sentir</span>
  <h2>${esc(story.feelTitle ?? 'La dirección,')} <span class="accent">${esc(story.feelAccent ?? 'en una línea.')}</span></h2>
  <p class="words">${words.map((w, i) => (i ? `<span> · </span>${w}` : w)).join('') || 'Equilibrado'}</p>
  <p>${story.feelLine ? esc(story.feelLine) + ' ' : ''}Eligieron ${picked.length} referencias${closest ? `, y la más cercana es ${esc(host(closest.url))}` : ''}. De ellas tomamos ${list(v.reference_traits.map((t) => es.traits[t] ?? t))}: el nivel y el tono, no la marca. Lo que vamos a diseñar va a ser de ${esc(C)}.</p>
  <div class="refs">${picked.map(refFig).join('')}</div>
  <div class="cards">
    <div class="card"><span class="label">Creatividad · ${v.sliders.safe_experimental}/100</span><div class="meter"><i style="left:${v.sliders.safe_experimental}%"></i></div><p>${pushLine}</p></div>
    <div class="card"><span class="label">Movimiento</span><b>${esc({ still: 'Quieto', subtle: 'Sutil', dynamic: 'Dinámico', wild: 'Intenso' }[v.motion] ?? '—')}</b><p>${es.motion[v.motion] ?? ''}</p></div>
    <div class="card"><span class="label">Tipografía</span><b>${esc(es.type[v.typeface] ?? 'La elegimos nosotros')}</b><p>${v.typeface && v.typeface !== 'you_pick' ? 'El tono que marca todo antes de que alguien lea una palabra.' : 'Proponemos dos opciones en el plan de construcción.'}</p></div>
  </div>
  ${(v.aspirational?.length || v.competitors?.length || v.anti_references?.length) ? `<div class="two avoid" style="margin-top:6mm">
    <div>${v.aspirational?.length ? `<h3>El ideal</h3><p>Quieren sentirse como ${list(v.aspirational.map(host))}. Es la vara: el cuidado, no la copia.</p>` : ''}${v.competitors?.length ? `<h3 style="margin-top:4mm">Frente a quién</h3><p>Al lado de ${list(v.competitors.map(host))}, ${esc(C)} tiene que reconocerse en un segundo.</p>` : ''}</div>
    <div>${v.anti_references?.length ? `<h3>Lo que vamos a evitar</h3><p class="quote" style="font-size:13pt;margin:2mm 0 0">“${esc(v.anti_why)}”</p>` : ''}${swatches.length ? `<h3 style="margin-top:4mm">Su paleta</h3><div class="swatches">${swatches.map((h) => `<i style="background:${h}"></i>`).join('')}</div>` : ''}</div>
  </div>` : ''}
</section>

<section class="avoid">
  <span class="num" aria-hidden="true">03</span>
  <span class="label">03 — Quién trae qué</span>
  <h2>Ustedes traen la marca. <span class="accent">Nosotros, el resto.</span></h2>
  <div class="two who-list avoid">
    <div><h3>Lo que traen${fileCount ? ` · ${fileCount} archivos` : ''}</h3><ul class="check">${theyBring.map((t) => `<li>${esc(t)}</li>`).join('')}${b.brand.locked?.length ? `<li>No se toca: ${esc(b.brand.locked.join(', ').toLowerCase())}</li>` : ''}</ul></div>
    <div><h3>De lo que nos ocupamos</h3><ul class="check">${weHandle.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></div>
  </div>
  ${pending.length ? `<p class="note">Para arrancar solo nos falta ${list(pending)}. Lo pedimos junto con el plan.</p>` : ''}
</section>

<section>
  <div class="opener">
  <span class="num" aria-hidden="true">04</span>
  <span class="label">04 — El recorrido</span>
  <h2>${pages.length} páginas, <span class="accent">${blocks} bloques.</span></h2>
  <p style="margin-bottom:5mm">${esc(story.mapLine ?? `Así se recorre el sitio de ${C}, de la portada al contacto. Todo dentro de lo que incluye ${pkg.name}.`)}</p>
  ${pageCard(pages[0])}
  </div>
  ${pages.slice(1).map(pageCard).join('')}
</section>

<div class="bleed road">
  <span class="label">05 — El camino</span>
  <h2 style="margin-top:3mm">Del brief a online, <span class="accent">paso a paso.</span></h2>
  <p class="intro">Su parte ya está casi hecha. De acá en adelante trabajamos nosotros y ustedes deciden: cada etapa tiene una fecha, un responsable y un momento para opinar. Nada queda fijo hasta que lo aprueban.</p>
  <div class="track">
    <div class="stop now"><span class="when">Hoy<br>${short(new Date(b.created_at))}</span><h3>Brief recibido</h3>
      <p class="who"><b>Nosotros</b>Lo leímos completo y armamos este documento.</p><p class="who"><b>Ustedes</b>Lo revisan. Si algo no los representa, nos lo dicen.</p></div>
    <div class="stop"><span class="when">Antes del<br>${short(start)}</span><h3>Charla de arranque</h3>
      <p class="who"><b>Nosotros</b>Repasamos el brief juntos y respondemos todo. Cualquier cosa se puede cambiar acá.</p><p class="who"><b>Ustedes</b>Traen sus dudas${pending.length ? ` y ${esc(list(pending))}` : ''}.</p>
      <span class="pay">${paidNow ? `Reserva pagada · ${b.start.off_pct}% off` : `Reserva · ${pkg.deposit}% · ${usd(today)}`}</span></div>
    <div class="stop"><span class="when">${span(1, planEnd)}</span><h3>Plan del sitio</h3>
      <p class="who"><b>Nosotros</b>Una página con el posicionamiento, el mapa, los textos y la dirección visual.</p><p class="who"><b>Ustedes</b>La aprueban con un click, o piden cambios.</p></div>
    <div class="stop"><span class="when">${span(planEnd + 1, buildEnd)}</span><h3>Construcción</h3>
      <p class="who"><b>Nosotros</b>Diseño y desarrollo a la vez, sobre el sitio real${v.motion && v.motion !== 'still' ? ', con el movimiento que eligieron' : ''}.</p><p class="who"><b>Ustedes</b>Miran el avance cuando quieran.</p></div>
    <div class="stop"><span class="when">${span(buildEnd + 1, D)}</span><h3>Revisión</h3>
      <p class="who"><b>Nosotros</b>Les damos el link en vivo y resolvemos los cambios en un día.</p><p class="who"><b>Ustedes</b>Comentan sobre la página misma, en celular y escritorio. Revisiones ilimitadas en esta ventana.</p></div>
    <div class="stop"><span class="when">~${short(launch)}</span><h3>Lanzamiento</h3>
      <p class="who"><b>Nosotros</b>Control final, dominio${b.technical.domain ? ` ${esc(b.technical.domain)}` : ''}, analítica y un video corto para manejarlo.</p><p class="who"><b>Ustedes</b>Le dan el ok. Es suyo: sitio, textos, diseño y dominio.</p>
      ${pkg.deposit < 100 ? `<span class="pay">Segunda mitad · ${usd(finalPrice - today)} · cuando ya lo vieron funcionando</span>` : ''}</div>
  </div>
  <div class="end"><div style="width:26mm">${box('#f3f1ea', '#d8ff85')}</div>
    <div><span class="label">${pkg.name} · precio fijo</span><br><b>${usd(finalPrice)} <span class="accent">y nada más.</span></b></div>
    <p>${paidNow ? `Incluye el ${b.start.off_pct}% por pagar al enviar el brief.` : `${pkg.deposit}% para reservar la semana${pkg.deposit < 100 ? `, ${100 - pkg.deposit}% antes de publicar` : ''}.`} Sin horas facturadas ni sorpresas. Reembolso completo hasta 7 días antes de su semana.</p></div>
</div>

<div class="thanks">
  <h2>Gracias, ${esc(C)}. <span class="accent">${esc(story.closing ?? 'Ahora nos toca a nosotros.')}</span></h2>
  <p>Si algo de lo que leyeron no los representa, respondan el email y lo corregimos antes de empezar. Si todo está bien, lo próximo que van a recibir es su plan de construcción.</p>
  <p style="margin-top:14mm;display:flex;justify-content:space-between;align-items:center"><span class="logo">shipped<i></i></span><span class="label">${b.id} · un estudio de RemotoLabs</span></p>
</div>
</body></html>`;

// ---- Internal notes (never sent): what to check, and the build spec for the team ----
const flags = [];
if (pages.length > pkg.pages || blocks > pkg.blocks) flags.push(`Scope: over ${pkg.name} (${pages.length}/${pkg.pages} pages, ${blocks}/${pkg.blocks} blocks). Quote extras.`);
if (b.functional.ecommerce) flags.push(`Commerce: platform "${b.functional.ecommerce.platform?.join(', ')}", today ${b.technical.current_cms}. Decide custom front + existing checkout vs. theme. Shop add-on from $1,500.`);
if (b.technical.seo_keep === 'Yes') flags.push('SEO: keep ranking URLs, plan 301s.');
if (b.brand.locked?.length) flags.push(`Locked: ${b.brand.locked.join(', ')}.`);
if ((v.sliders.safe_experimental ?? 50) >= 60 && picked.every((r) => r.vibes?.includes('calm') || r.vibes?.includes('serious'))) flags.push(`Taste: push ${v.sliders.safe_experimental}/100 with calm references. One signature moment, the rest quiet.`);
for (const m of b.missing ?? []) flags.push(`Missing: ${m}.`);
if (b.brand.logo_upgrade || !(b.brand.has ?? []).includes('logo')) flags.push(`Upsell: ${b.brand.logo_upgrade ? 'asked to improve their logo' : 'no logo on file'}. Offer the brand identity sprint (+$2,500) in the build plan.`);
if (b.functional.multilingual) flags.push('Multilingual: confirm languages and who translates.');
const spec = [
  `Build ${b.id} for ${C} (${pkg.name}, industry ${b.project.industry}). Goal: ${b.project.goal}.`,
  `${pages.length} pages / ${blocks} blocks as approved. Direction: ${words.join(', ') || 'balanced'}; motion ${v.motion}; type ${v.typeface ?? 'tbd'}.`,
  `References: ${picked.map((r) => host(r.url)).join(', ')} (closest ${closest ? host(closest.url) : '—'}) for ${v.reference_traits.join(', ')}, not branding.`,
  `Ideal (sets the level, can seed v1's layout): ${v.aspirational?.map(host).join(', ') || `none given, closest reference sets it`}${v.ideal_why ? ` — they love: "${v.ideal_why}"` : ''}. Competitors (stand apart from what they share): ${v.competitors?.map(host).join(', ') || 'none given'}${v.competitors_diff ? ` — they reject: "${v.competitors_diff}"` : ''}.${existsSync(join(dir, 'captures', 'summary.md')) ? ' Measured: captures/summary.md.' : ' Run pipeline/capture-brief.mjs.'}`,
  `Preserve: ${b.brand.locked?.join(', ') || 'nothing'}. Copy ${b.copy.status}. Integrations: ${feats.join(', ')}. Domain ${b.technical.domain} on ${b.technical.hosting}.`,
].join('\n');
const internal = `# ${b.id} · ${C} · internal\n\nNever sent to the client.\n\n## Check before the build plan\n${flags.map((f) => `- ${f}`).join('\n') || '- Nothing flagged.'}\n\n## Build spec\n\n\`\`\`\n${spec}\n\`\`\`\n\n## Commercial\n- ${pkg.name} ${usd(pkg.price)}, ${pkg.deposit}% deposit. Next open week ${week}.\n- ${b.start?.mode === 'pay' ? `Chose to pay now, ${b.start.off_pct}% off: ${usd(b.start.today)} today, ${usd(b.start.rest)} before launch (total ${usd(b.start.total)}${b.start.from_price ? ', from-price: confirm scope on the kickoff call' : ''}). Check the payment arrived, then book the kickoff call.` : 'Chose to talk first: book the 15-min call, then send the build plan.'}\n`;

mkdirSync(join(dir, 'report'), { recursive: true });
const out = join(dir, 'report', `${b.id}.html`);
writeFileSync(join(dir, 'report', 'internal.md'), internal);
const pdf = join(dir, 'report', `${C.replace(/\W+/g, '-')}-brief-${b.id}.pdf`);
const print = (density) => {
  writeFileSync(out, html.replace('<body>', `<body class="d${density}">`));
  execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--no-pdf-header-footer', '--virtual-time-budget=10000', `--print-to-pdf=${pdf}`, `file://${out}`], { stdio: 'ignore' });
};
// How full the last white page is (the one before the roadmap), and the page count
async function measure() {
  const tmp = mkdtempSync(join(tmpdir(), 'pdf-'));
  const n = Number(execFileSync('swift', [join(SHIPPED, 'pipeline/render-pdf.swift'), pdf, join(tmp, 'p')]).toString().match(/pages: (\d+)/)[1]);
  const { data, info } = await sharp(join(tmp, `p-${n - 2}.jpg`)).greyscale().raw().toBuffer({ resolveWithObject: true });
  let last = 0;
  for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) if (data[y * info.width + x] < 236) { last = y; break; }
  rmSync(tmp, { recursive: true, force: true });
  return { n, fill: last / info.height };
}
// Print, and tighten when a few rows spill onto an otherwise empty page
let best;
for (let density = 0; density < 3; density++) {
  print(density);
  const m = { ...(await measure()), density };
  if (!best || m.n < best.n || (m.n === best.n && m.fill > best.fill + 0.05)) best = m;
  if (m.fill > 0.35) break;
}
if (best.density !== 2 || best.fill <= 0.35) print(best.density);
console.log(`${pdf}  (${best.n} pages, density ${best.density}, last white page ${Math.round(best.fill * 100)}% full)`);
