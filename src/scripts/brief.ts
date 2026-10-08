// /start/ — "Build your site". One brief, six stages, saved on this device as you go.
import { basket, elevator, exploded, laptop, loupe, patch, phone, query, settle, sieve, slow, stack, terrain, drawer } from '@lucasmarkes/hairline';
import { packages, addOns, extraPageSections, type PackageId } from '../data/site';
import {
  stages, refs, maxRefs, neighbours, industries, goals, sliders, pushSlider, motionLevels, assets,
  copyStatus, blockTypes, templates, goalBlock, features, briefEndpoint, type BlockType,
} from '../data/brief';
import { url } from '../lib/url';

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

type FileMeta = { name: string; size: number; type: string };
interface Block { id: string; type: BlockType; headline?: string; copy?: string; cta?: string; cta_url?: string; notes?: string }
interface Page { id: string; name: string; blocks: Block[] }
interface State {
  v: 1;
  ref: string; // brief reference, e.g. SHP-K3F9QX
  stage: number;
  f: Record<string, string | string[]>; // every [data-k] field
  refs: string[];
  closest: string;
  lists: Record<string, string[]>; // competitors, aspirational, anti
  pages: Page[];
  pagesEdited: boolean;
  recoApproved: boolean;
  files: Record<string, FileMeta[]>; // 'asset:logo', 'dump', 'block:<id>'
  week?: string;
  sent?: string;
}

const KEY = 'shipped:brief:v1';
const uid = () => Math.random().toString(36).slice(2, 8);
const fresh = (): State => ({ v: 1, ref: 'SHP-' + uid().toUpperCase(), stage: 0, f: {}, refs: [], closest: '', lists: {}, pages: [], pagesEdited: false, recoApproved: false, files: {} });

let s: State = fresh();
try {
  const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
  if (saved?.v === 1 && !saved.sent) s = { ...fresh(), ...saved };
} catch {}
// File contents can't live in localStorage; they're kept here until the brief is sent.
const fileStore: Record<string, File[]> = {};

let saveTimer = 0;
function save() {
  clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => {
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {}
  }, 200);
}

const $ = <T extends HTMLElement = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel)!;
const $$ = <T extends HTMLElement = HTMLElement>(sel: string, root: ParentNode = document) => [...root.querySelectorAll<T>(sel)];
const esc = (v: unknown) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
const money = (n: number) => '$' + n.toLocaleString('en-US');
const str = (k: string) => (typeof s.f[k] === 'string' ? (s.f[k] as string).trim() : '');
const arr = (k: string) => (Array.isArray(s.f[k]) ? (s.f[k] as string[]) : []);
const host = (u: string) => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return u; } };
const emailOk = () => /^\S+@\S+\.\S+$/.test(str('email'));

const form = $<HTMLFormElement>('#brief');

// Preselect from links around the site: /start/?package=landing&week=2026-10-19
const params = new URLSearchParams(location.search);
const pkgParam = params.get('package');
if (pkgParam && (packages.some((p) => p.id === pkgParam)) && !str('product')) s.f.product = pkgParam;
if (params.get('week')) s.week = params.get('week')!;

const pkg = () => packages.find((p) => p.id === str('product'));
const limits = () => {
  const p = pkg() ?? packages.find((x) => x.id === 'website')!;
  return { pages: p.pages, blocks: p.sections, landing: p.id === 'landing' };
};

// ---------------------------------------------------------------------------
// Fields: every [data-k] input reads from and writes to s.f
// ---------------------------------------------------------------------------

const exclusive: Record<string, string> = { assets: 'nothing', features: 'none' };

function readField(el: HTMLInputElement | HTMLTextAreaElement) {
  const k = el.dataset.k!;
  if (el instanceof HTMLInputElement && el.type === 'checkbox') {
    const solo = exclusive[k];
    if (solo && el.checked) {
      // "Nothing yet" / "None of these" clears the rest, and the other way round
      $$<HTMLInputElement>(`input[data-k="${k}"]`).forEach((o) => { if (o !== el && (el.value === solo || o.value === solo)) o.checked = false; });
    }
    s.f[k] = $$<HTMLInputElement>(`input[data-k="${k}"]:checked`).map((o) => o.value);
  } else if (el instanceof HTMLInputElement && el.type === 'radio') {
    if (el.checked) s.f[k] = el.value;
  } else {
    s.f[k] = el.value;
  }
  if (el instanceof HTMLInputElement && el.type === 'range') el.style.setProperty('--v', el.value + '%');
}

function writeFields() {
  $$<HTMLInputElement>('[data-k]').forEach((el) => {
    const v = s.f[el.dataset.k!];
    if (el.type === 'checkbox') el.checked = Array.isArray(v) && v.includes(el.value);
    else if (el.type === 'radio') el.checked = v === el.value;
    else if (typeof v === 'string') el.value = v;
    if (el.type === 'range') el.style.setProperty('--v', el.value + '%');
  });
}

// data-show="key=value" (equals) or "key~value" (array includes)
function applyShows() {
  $$('[data-show]').forEach((el) => {
    const rule = el.dataset.show!;
    const [k, v] = rule.split(/[=~]/);
    const on = rule.includes('~') ? arr(k).includes(v) : s.f[k] === v;
    el.hidden = !on;
  });
}

form.addEventListener('input', (e) => {
  const el = e.target as HTMLInputElement;
  if (el.dataset.k) { readField(el); onChange(el.dataset.k); }
  if (el.dataset.bf) editBlockField(el);
  if (el.dataset.li !== undefined) editList(el);
});
form.addEventListener('change', (e) => {
  const el = e.target as HTMLInputElement;
  if (el.dataset.k && (el.type === 'checkbox' || el.type === 'radio')) { readField(el); onChange(el.dataset.k); }
  if (el.dataset.files && el.files?.length) { addFiles(el.dataset.files, [...el.files]); el.value = ''; }
});

function onChange(k: string) {
  if (k === 'industry') renderRefs();
  if (k === 'product' || k === 'goal') { reseedIfUntouched(); renderPages(); renderReco(); }
  if (k === 'pages_mode' && str('pages_mode') === 'builder' && !s.pages.length) { seedPages(); renderPages(); }
  if (k === 'assets') renderFiles();
  applyShows();
  renderPanel();
  save();
}

// ---------------------------------------------------------------------------
// References
// ---------------------------------------------------------------------------

function refPool() {
  const ind = str('industry');
  if (!ind || ind === 'other') {
    // one per category, cycling so light/dark mix
    const cats = industries.map((i) => i.id).filter((i) => i !== 'other');
    return cats.map((c, i) => refs.filter((r) => r.category === c)[i % 3]).filter(Boolean);
  }
  const pool = refs.filter((r) => r.category === ind);
  const near = neighbours[ind] ?? [];
  for (let round = 0; pool.length < 12 && round < 3; round++) {
    for (const c of near) {
      const r = refs.filter((x) => x.category === c)[round];
      if (r && pool.length < 12 && !pool.includes(r)) pool.push(r);
    }
  }
  return pool;
}

function renderRefs() {
  const pool = refPool();
  // keep earlier picks visible even if the category changed
  const picked = s.refs.map((id) => refs.find((r) => r.id === id)!).filter(Boolean);
  const list = [...picked.filter((r) => !pool.includes(r)), ...pool];
  const full = s.refs.length >= maxRefs;
  $('#refs').innerHTML = list
    .map((r) => {
      const on = s.refs.includes(r.id);
      return `<button type="button" class="ref${full && !on ? ' dim' : ''}" data-ref="${r.id}" aria-pressed="${on}" aria-label="${esc(host(r.url))}">
        <img src="${url(`/refs/${r.slug}.webp`)}" alt="" loading="lazy" decoding="async" width="384" height="512" />
        <span class="n">${on ? s.refs.indexOf(r.id) + 1 : ''}</span>
        <span class="flex items-center justify-between gap-2 px-2.5 py-2 text-left text-[12px] text-paper/60"><span class="truncate">${esc(host(r.url))}</span><span class="label shrink-0 text-paper/30">${esc(r.mode)}</span></span>
      </button>`;
    })
    .join('');
  $('#ref-count').textContent = s.refs.length ? `${s.refs.length} of ${maxRefs}${full ? ' · tap one to swap it out' : ''}` : '';
  if (s.closest && !s.refs.includes(s.closest)) s.closest = '';
  $$('[data-need-refs]').forEach((el) => (el.hidden = !s.refs.length));
  $('#closest').innerHTML = s.refs
    .map((id) => {
      const r = refs.find((x) => x.id === id)!;
      const on = s.closest === id || s.refs.length === 1;
      return `<button type="button" class="ref w-1/3 max-w-[140px]" data-closest="${id}" aria-pressed="${on}"><img src="${url(`/refs/${r.slug}.webp`)}" alt="${esc(host(r.url))}" /><span class="n">✓</span></button>`;
    })
    .join('');
}

$('#refs').addEventListener('click', (e) => {
  const b = (e.target as HTMLElement).closest<HTMLElement>('[data-ref]');
  if (!b) return;
  const id = b.dataset.ref!;
  if (s.refs.includes(id)) s.refs = s.refs.filter((x) => x !== id);
  else if (s.refs.length < maxRefs) s.refs.push(id);
  else return; // full: they need to unpick one first
  renderRefs(); renderPanel(); save();
});
$('#closest').addEventListener('click', (e) => {
  const b = (e.target as HTMLElement).closest<HTMLElement>('[data-closest]');
  if (!b) return;
  s.closest = b.dataset.closest!;
  renderRefs(); renderPanel(); save();
});

// ---------------------------------------------------------------------------
// URL lists (competitors, aspirational, anti-references): always one empty row at the end
// ---------------------------------------------------------------------------

function renderList(el: HTMLElement) {
  const key = el.dataset.list!;
  const rows = [...(s.lists[key] ?? []).filter(Boolean), ''];
  el.innerHTML = rows
    .map((v, i) => `<input data-li="${key}" data-i="${i}" type="url" inputmode="url" value="${esc(v)}" placeholder="${i ? 'Another one' : 'https://'}" class="mt-2 h-12 w-full rounded-xl border border-transparent bg-white/[0.04] px-4 text-[16px] outline-none transition placeholder:text-paper/30 focus:border-spark" />`)
    .join('');
}
function editList(el: HTMLInputElement) {
  const key = el.dataset.li!;
  const list = [...(s.lists[key] ?? [])];
  list[Number(el.dataset.i)] = el.value;
  s.lists[key] = list;
  const wrap = el.parentElement!;
  // grow a fresh empty row once the last one gets typed into
  if (Number(el.dataset.i) === wrap.children.length - 1 && el.value) {
    wrap.insertAdjacentHTML('beforeend', el.outerHTML.replace(/data-i="\d+"/, `data-i="${wrap.children.length}"`).replace(/value="[^"]*"/, 'value=""').replace(/placeholder="[^"]*"/, 'placeholder="Another one"'));
  }
  save();
}

// ---------------------------------------------------------------------------
// Files
// ---------------------------------------------------------------------------

function addFiles(key: string, files: File[]) {
  fileStore[key] = [...(fileStore[key] ?? []), ...files];
  s.files[key] = [...(s.files[key] ?? []), ...files.map((f) => ({ name: f.name, size: f.size, type: f.type }))];
  renderFiles(); renderPanel(); save();
}
const kb = (n: number) => (n > 1e6 ? (n / 1e6).toFixed(1) + ' MB' : Math.max(1, Math.round(n / 1e3)) + ' KB');
function renderFiles() {
  $$('[data-files-list]').forEach((ul) => {
    const key = ul.dataset.filesList!;
    ul.innerHTML = (s.files[key] ?? [])
      .map((f, i) => `<li class="flex items-center gap-3 rounded-xl bg-white/[0.04] py-1.5 pl-3 pr-1.5 text-[14px]"><span class="min-w-0 flex-1 truncate">${esc(f.name)}</span><span class="label shrink-0 text-paper/40">${kb(f.size)}</span><button type="button" data-unfile="${esc(key)}" data-i="${i}" class="grid size-9 shrink-0 place-items-center rounded-full text-paper/50 hover:bg-white/10 hover:text-paper" aria-label="Remove ${esc(f.name)}">×</button></li>`)
      .join('');
  });
}
document.addEventListener('click', (e) => {
  const b = (e.target as HTMLElement).closest<HTMLElement>('[data-unfile]');
  if (!b) return;
  const key = b.dataset.unfile!;
  const i = Number(b.dataset.i);
  s.files[key]?.splice(i, 1);
  fileStore[key]?.splice(i, 1);
  renderFiles(); renderPanel(); save();
});
// drag and drop onto any .drop zone
document.addEventListener('dragover', (e) => {
  const z = (e.target as HTMLElement).closest('.drop');
  if (!z) return;
  e.preventDefault();
  z.classList.add('over');
});
document.addEventListener('dragleave', (e) => (e.target as HTMLElement).closest('.drop')?.classList.remove('over'));
document.addEventListener('drop', (e) => {
  const z = (e.target as HTMLElement).closest('.drop');
  if (!z) return;
  e.preventDefault();
  z.classList.remove('over');
  const key = z.querySelector<HTMLInputElement>('[data-files]')?.dataset.files;
  if (key && e.dataTransfer?.files.length) addFiles(key, [...e.dataTransfer.files]);
});

// ---------------------------------------------------------------------------
// Pages & blocks
// ---------------------------------------------------------------------------

const typeName = (t: string) => blockTypes.find((b) => b.id === t)?.name ?? t;
const tplKey = (): PackageId | 'unsure' => (pkg()?.id ?? 'unsure');

function structure(key: PackageId | 'unsure') {
  return templates[key].map((p) => ({ id: uid(), name: p.page, blocks: p.blocks.map((type) => ({ id: uid(), type })) }));
}
// A first guess for "I have no idea": the package's structure, closed by the goal's block.
function recommended(): Page[] {
  const pages = structure(tplKey());
  const want = goalBlock[str('goal')];
  const home = pages[0];
  if (want && !home.blocks.some((b) => b.type === want)) home.blocks.push({ id: uid(), type: want });
  return pages;
}
function seedPages() {
  s.pages = structure(tplKey());
  s.pagesEdited = false;
}
function reseedIfUntouched() {
  if (s.pages.length && !s.pagesEdited) seedPages();
  s.recoApproved = false;
}
const blockCount = (pages = s.pages) => pages.reduce((n, p) => n + p.blocks.length, 0);

function extras() {
  const l = limits();
  const pages = s.pages.length;
  const extraPages = l.landing ? 0 : Math.max(0, pages - l.pages);
  const blocks = blockCount();
  const extraBlocks = Math.max(0, blocks - l.blocks - extraPages * extraPageSections);
  const pagePrice = addOns.find((a) => a.id === 'page')!.price;
  const sectionPrice = addOns.find((a) => a.id === 'section')!.price;
  return { extraPages, extraBlocks, cost: extraPages * pagePrice + extraBlocks * sectionPrice, landingOver: l.landing && pages > 1 };
}

const ctl = 'grid size-10 shrink-0 place-items-center rounded-full text-paper/55 transition hover:bg-white/10 hover:text-paper disabled:opacity-25';
const inp = 'mt-1.5 h-11 w-full rounded-xl border border-transparent bg-white/[0.05] px-3.5 text-[16px] outline-none transition placeholder:text-paper/30 focus:border-spark';
const txt = 'mt-1.5 w-full resize-y rounded-xl border border-transparent bg-white/[0.05] px-3.5 py-2.5 text-[16px] outline-none transition placeholder:text-paper/30 focus:border-spark';
let openBlock = '';
let pickerFor = '';

function renderPages() {
  const el = $('#pages');
  if (!el) return;
  el.innerHTML = s.pages
    .map((p, pi) => `
    <div class="rounded-[22px] border border-white/10 p-2.5 sm:p-4" data-page="${p.id}">
      <div class="flex items-center gap-1 pl-1.5">
        <input data-act="rename" value="${esc(p.name)}" aria-label="Page name" class="min-w-0 flex-1 rounded-lg bg-transparent py-1 text-[19px] font-semibold tracking-tight outline-none focus:bg-white/[0.05]" />
        <span class="label mr-1 shrink-0 text-paper/40">${p.blocks.length} block${p.blocks.length === 1 ? '' : 's'}</span>
        <button type="button" data-act="page-up" class="${ctl}" ${pi === 0 ? 'disabled' : ''} aria-label="Move page up">↑</button>
        <button type="button" data-act="page-del" class="${ctl}" aria-label="Delete page">×</button>
      </div>
      <ol class="mt-2 space-y-1.5">${p.blocks.map((b, bi) => blockCard(b, bi, p.blocks.length)).join('')}</ol>
      ${pickerFor === p.id
        ? `<div class="mt-2 rounded-2xl bg-white/[0.03] p-2.5"><p class="label px-1 pb-2 text-paper/45">Add a block</p><div class="grid grid-cols-2 gap-1.5 sm:grid-cols-4">${blockTypes.map((t) => `<button type="button" data-act="pick" data-type="${t.id}" class="flex min-h-12 items-center gap-2.5 rounded-xl bg-white/[0.05] px-3 text-left text-[14px] transition hover:bg-spark hover:text-ink">${glyph(t.g, true)}<span>${t.name}</span></button>`).join('')}</div><button type="button" data-act="add-block" class="label mt-2 w-full py-2 text-paper/45">Close</button></div>`
        : `<button type="button" data-act="add-block" class="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-white/20 text-[15px] text-paper/70 transition hover:border-spark hover:text-paper">+ Add block</button>`}
    </div>`)
    .join('');

  const l = limits();
  const blocks = blockCount();
  const x = extras();
  $('#b-count').textContent = String(blocks);
  $('#b-limit').textContent = String(l.blocks);
  $('#p-count').textContent = String(s.pages.length);
  $('#p-limit').textContent = String(l.pages);
  $('#b-bar').style.width = Math.min(100, (blocks / l.blocks) * 100) + '%';
  const msg = x.landingOver
    ? 'Landing is one page. More pages? Switch to Website in Basics.'
    : x.cost
      ? `Over the package: ${[x.extraPages && `${x.extraPages} extra page${x.extraPages > 1 ? 's' : ''}`, x.extraBlocks && `${x.extraBlocks} extra block${x.extraBlocks > 1 ? 's' : ''}`].filter(Boolean).join(' + ')} · +${money(x.cost)}`
      : '';
  $('#b-extra').textContent = msg;
  $('#b-extra').classList.toggle('hidden', !msg);
}

function blockCard(b: Block, i: number, n: number) {
  const open = openBlock === b.id;
  const t = blockTypes.find((x) => x.id === b.type)!;
  return `<li class="rounded-2xl ${open ? 'bg-white/[0.06]' : 'bg-white/[0.035]'} transition" data-block="${b.id}">
    <div class="flex items-center gap-1 py-1 pl-2.5 pr-1">
      <button type="button" data-act="toggle" class="flex min-h-11 min-w-0 flex-1 items-center gap-3 text-left" aria-expanded="${open}">
        ${glyph(t.g, true)}
        <span class="min-w-0"><span class="block text-[15px] font-medium">${esc(t.name)}</span>${b.headline ? `<span class="block truncate text-[13px] text-paper/45">${esc(b.headline)}</span>` : ''}</span>
      </button>
      <button type="button" data-act="up" class="${ctl}" ${i === 0 ? 'disabled' : ''} aria-label="Move up">↑</button>
      <button type="button" data-act="down" class="${ctl}" ${i === n - 1 ? 'disabled' : ''} aria-label="Move down">↓</button>
    </div>
    ${open ? `<div class="grid gap-3 px-3 pb-3 sm:grid-cols-2">
      <label class="block sm:col-span-2"><span class="label text-paper/45">Headline</span><input data-bf="headline" value="${esc(b.headline)}" class="${inp}" placeholder="Leave empty and we’ll write it" /></label>
      <label class="block sm:col-span-2"><span class="label text-paper/45">Supporting copy</span><textarea data-bf="copy" rows="3" class="${txt}">${esc(b.copy)}</textarea></label>
      <label class="block"><span class="label text-paper/45">CTA</span><input data-bf="cta" value="${esc(b.cta)}" class="${inp}" placeholder="Book a visit" /></label>
      <label class="block"><span class="label text-paper/45">CTA link</span><input data-bf="cta_url" value="${esc(b.cta_url)}" type="url" inputmode="url" class="${inp}" placeholder="/contact" /></label>
      <div class="sm:col-span-2"><span class="label text-paper/45">Assets for this block</span>
        <label class="drop mt-1.5 flex min-h-14 cursor-pointer items-center justify-center rounded-xl border border-dashed border-white/20 px-4 text-[14px] text-paper/60 transition hover:border-spark"><input type="file" multiple accept="image/*,video/*,.pdf" data-files="block:${b.id}" class="sr-only" />Drop images or video here</label>
        <ul class="mt-1.5 space-y-1" data-files-list="block:${b.id}"></ul>
      </div>
      <label class="block sm:col-span-2"><span class="label text-paper/45">Notes for us</span><textarea data-bf="notes" rows="2" class="${txt}">${esc(b.notes)}</textarea></label>
      <div class="flex gap-2 sm:col-span-2">
        <button type="button" data-act="dup" class="btn-ghost h-11 flex-1 border-white/15 text-[14px]">Duplicate</button>
        <button type="button" data-act="del" class="btn-ghost h-11 flex-1 border-white/15 text-[14px] hover:border-booked hover:text-booked">Delete</button>
      </div>
    </div>` : ''}
  </li>`;
}

function findBlock(id: string) {
  for (const p of s.pages) {
    const i = p.blocks.findIndex((b) => b.id === id);
    if (i > -1) return { page: p, i };
  }
}
function editBlockField(el: HTMLInputElement) {
  const id = el.closest<HTMLElement>('[data-block]')!.dataset.block!;
  const hit = findBlock(id);
  if (!hit) return;
  (hit.page.blocks[hit.i] as any)[el.dataset.bf!] = el.value;
  s.pagesEdited = true;
  renderPanel(); save();
}
const move = <T,>(list: T[], i: number, d: number) => {
  const j = i + d;
  if (j < 0 || j >= list.length) return;
  [list[i], list[j]] = [list[j], list[i]];
};

$('#pages').addEventListener('input', (e) => {
  const el = e.target as HTMLInputElement;
  if (el.dataset.act !== 'rename') return;
  const p = s.pages.find((x) => x.id === el.closest<HTMLElement>('[data-page]')!.dataset.page)!;
  p.name = el.value;
  s.pagesEdited = true;
  renderPanel(); save();
});
$('#pages').addEventListener('click', (e) => {
  const b = (e.target as HTMLElement).closest<HTMLElement>('[data-act]');
  if (!b || b.dataset.act === 'rename') return;
  const page = s.pages.find((x) => x.id === b.closest<HTMLElement>('[data-page]')!.dataset.page)!;
  const blockId = b.closest<HTMLElement>('[data-block]')?.dataset.block;
  const bi = blockId ? page.blocks.findIndex((x) => x.id === blockId) : -1;
  const pi = s.pages.indexOf(page);
  switch (b.dataset.act) {
    case 'toggle': openBlock = openBlock === blockId ? '' : blockId!; break;
    case 'up': move(page.blocks, bi, -1); break;
    case 'down': move(page.blocks, bi, 1); break;
    case 'dup': { const c = { ...page.blocks[bi], id: uid() }; page.blocks.splice(bi + 1, 0, c); openBlock = c.id; break; }
    case 'del': page.blocks.splice(bi, 1); break;
    case 'page-up': move(s.pages, pi, -1); break;
    case 'page-del': s.pages.splice(pi, 1); break;
    case 'add-block': pickerFor = pickerFor === page.id ? '' : page.id; break;
    case 'pick': { const nb = { id: uid(), type: b.dataset.type as BlockType }; page.blocks.push(nb); pickerFor = ''; openBlock = nb.id; break; }
  }
  if (b.dataset.act !== 'toggle' && b.dataset.act !== 'add-block') s.pagesEdited = true;
  renderPages(); renderFiles(); renderPanel(); save();
  if (b.dataset.act === 'pick' || b.dataset.act === 'dup') document.querySelector(`[data-block="${openBlock}"]`)?.scrollIntoView({ block: 'center', behavior: 'smooth' });
});
function addPage() {
  const input = $<HTMLInputElement>('#new-page');
  const name = input.value.trim() || `Page ${s.pages.length + 1}`;
  s.pages.push({ id: uid(), name, blocks: [{ id: uid(), type: 'hero' }] });
  s.pagesEdited = true;
  input.value = '';
  renderPages(); renderPanel(); save();
}
$('#add-page').addEventListener('click', addPage);
$('#new-page').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); addPage(); } });
$('#reset-pages').addEventListener('click', () => { seedPages(); openBlock = ''; renderPages(); renderPanel(); save(); });

// "I have no idea" → a recommended structure they can approve or take over
function renderReco() {
  const el = $('#reco');
  if (!el) return;
  const pages = recommended();
  el.innerHTML = pages
    .map((p) => `<div><p class="text-[15px] font-semibold">${esc(p.name)}</p><div class="mt-1.5 flex flex-wrap gap-1.5">${p.blocks.map((b) => `<span class="rounded-full bg-white/[0.06] px-2.5 py-0.5 text-[12px] text-paper/70">${esc(typeName(b.type))}</span>`).join('')}</div></div>`)
    .join('') + `<p class="label text-paper/40">${blockCount(pages)} / ${limits().blocks} blocks</p>`;
  $('#reco-ok').classList.toggle('hidden', !s.recoApproved);
  $('#approve-reco').textContent = s.recoApproved ? 'Approved ✓' : 'Approve structure';
}
$('#approve-reco').addEventListener('click', () => { s.recoApproved = !s.recoApproved; renderReco(); renderPanel(); save(); });
$('#edit-reco').addEventListener('click', () => {
  s.pages = recommended();
  s.pagesEdited = true;
  s.f.pages_mode = 'builder';
  writeFields(); applyShows(); renderPages(); renderPanel(); save();
  $('#pages').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

// ---------------------------------------------------------------------------
// Live "Your site" panel
// ---------------------------------------------------------------------------

function glyph(g: string, small = false) {
  const h = (px: number) => `height:${px}px`;
  const box = (n: number, px: number) => `<span class="row">${`<i style="${h(px)}"></i>`.repeat(n)}</span>`;
  const sp = 'background:var(--color-spark)';
  const inner: Record<string, string> = {
    hero: `<i style="${h(5)};width:62%"></i><i style="${h(3)};width:40%;margin-top:3px"></i><i style="${h(4)};width:20%;margin-top:4px;${sp}"></i>`,
    logos: box(5, 3),
    text: `<i style="${h(3)};width:85%"></i><i style="${h(3)};width:60%;margin-top:3px"></i>`,
    grid2: box(2, 13),
    grid3: box(3, 11),
    grid4: box(4, 9),
    steps: `<span class="row"><i style="${h(9)}"></i><i style="${h(9)};opacity:.6"></i><i style="${h(9)};opacity:.35"></i></span>`,
    quote: `<i style="${h(3)};width:80%;margin:0 auto"></i><i style="${h(3)};width:30%;margin:3px auto 0"></i>`,
    gallery: box(3, 15),
    rows: `<i style="${h(2)}"></i><i style="${h(2)};margin-top:3px"></i><i style="${h(2)};margin-top:3px"></i>`,
    cta: `<i style="${h(4)};width:50%;margin:0 auto"></i><i style="${h(4)};width:18%;margin:4px auto 0;${sp}"></i>`,
    form: `<i style="${h(4)}"></i><i style="${h(4)};margin-top:3px"></i><i style="${h(4)};width:24%;margin-top:3px;${sp}"></i>`,
    footer: box(4, 2),
  };
  return small
    ? `<span class="blk block w-9 shrink-0 !animate-none" aria-hidden="true">${inner[g] ?? inner.text}</span>`
    : inner[g] ?? inner.text;
}

function previewPages(): { pages: Page[]; note: string } {
  const mode = str('pages_mode');
  if (mode === 'builder' && s.pages.length) return { pages: s.pages, note: '' };
  if (mode === 'dump') return { pages: recommended(), note: s.recoApproved ? 'Approved structure' : 'Suggested · not approved yet' };
  return { pages: structure(tplKey()), note: str('product') ? 'Typical structure' : '' };
}

function tasteWords() {
  const words: string[] = [];
  const w = (k: string, l: string, r: string) => {
    const v = Number(str(`slider_${k}`) || 50);
    if (v <= 35) words.push(l);
    if (v >= 65) words.push(r);
  };
  [...sliders, pushSlider].forEach((x) => w(x.id, x.left, x.right));
  const m = motionLevels.find((x) => x.id === str('motion'));
  if (m) words.push(`${m.name} motion`);
  return words;
}

function renderPanel() {
  const p = pkg();
  const x = extras();
  const isBuilder = str('pages_mode') === 'builder';
  $('#pn-name').textContent = p ? p.name : str('product') === 'unsure' ? 'Not sure yet' : 'Pick a format';
  $('#pn-price').innerHTML = p ? `${p.id === 'websiteplus' ? '<span class="text-[13px] text-paper/45">from </span>' : ''}${money(p.price + (isBuilder ? x.cost : 0))}${isBuilder && x.cost ? `<span class="block text-[12px] font-normal text-spark">incl. +${money(x.cost)} extras</span>` : ''}` : '';
  const l = limits();
  const { pages, note } = previewPages();
  const blocks = blockCount(pages);
  $('#pn-pages').textContent = str('product') || isBuilder ? `${pages.length} / ${l.pages}` : '—';
  $('#pn-blocks').textContent = str('product') || isBuilder ? `${blocks} / ${l.blocks}` : '—';

  let n = 0;
  $('#pn-map').innerHTML = pages.length
    ? (note ? `<p class="label mb-2 text-paper/40">${esc(note)}</p>` : '') +
      pages
        .map((pg) => `<div class="pg"><p class="mb-1.5 flex justify-between text-[13px]"><span class="font-medium">${esc(pg.name || 'Untitled')}</span><span class="text-paper/40">${pg.blocks.length}</span></p>${pg.blocks.map((b) => { n++; return `<div class="blk${n > l.blocks ? ' over' : ''}" title="${esc(typeName(b.type))}">${glyph(blockTypes.find((t) => t.id === b.type)?.g ?? 'text')}</div>`; }).join('')}</div>`)
        .join('')
    : '<p class="text-[14px] text-paper/40">Your pages and blocks show up here as you build.</p>';

  const thumbs = s.refs.map((id) => refs.find((r) => r.id === id)!).map((r) => `<img src="${url(`/refs/${r.slug}.webp`)}" alt="" class="h-9 w-7 rounded-md object-cover object-top" />`).join('');
  $('#pn-taste').innerHTML = thumbs + tasteWords().map((w) => `<span class="rounded-full bg-white/[0.06] px-2.5 py-1 text-[12px] text-paper/70">${esc(w)}</span>`).join('');

  const { pct } = completeness();
  $('#pn-pct').textContent = pct + '%';
  $('#pn-bar').style.width = pct + '%';
  $('#step-pct').textContent = `${pct}% complete`;
  $('#pill-ring').style.setProperty('--p', String(pct));
  $('#pill-text').textContent = p || str('product') === 'unsure'
    ? `${blocks}/${l.blocks} blocks`
    : 'Your site';
  if (s.stage === stages.length - 1) renderReview();
}

// ---------------------------------------------------------------------------
// Completeness & review
// ---------------------------------------------------------------------------

function completeness() {
  const files = (k: string) => (s.files[k] ?? []).length > 0;
  const checks: [boolean, string, number][] = [
    [!!str('product'), 'Pick a format', 0],
    [!!str('industry'), 'Business category', 0],
    [!!str('company'), 'Company name', 0],
    [!!str('describe'), 'What you do', 0],
    [!!(str('selling') && str('audience')), 'What you sell and who it’s for', 0],
    [!!str('goal'), 'What should happen on the site', 0],
    [!!str('name'), 'Your name', 0],
    [emailOk(), 'Contact email', 0],
    [s.refs.length > 0, 'At least one reference', 1],
    ...(s.refs.length > 1 ? [[!!s.closest, 'The reference that feels closest', 1] as [boolean, string, number]] : []),
    [!!str('motion'), 'How much motion', 1],
    [arr('assets').length > 0, 'What brand assets you have', 2],
    ...arr('assets').filter((a) => a !== 'nothing').map((a): [boolean, string, number] => {
      const name = assets.find((x) => x.id === a)!.name.toLowerCase();
      return [files(`asset:${a}`) || (a === 'palette' && !!str('palette_hex')), `Missing ${name}`, 2];
    }),
    [!!str('copy'), 'Copy situation', 2],
    [str('pages_mode') === 'builder' ? blockCount() > 0 : str('pages_mode') === 'dump' ? files('dump') || !!str('dump_notes') || !!str('dump_links') : false, str('pages_mode') === 'dump' ? 'Something in the dump' : 'Pages and blocks', 3],
    ...(str('pages_mode') === 'dump' ? [[s.recoApproved, 'Approve the suggested structure', 3] as [boolean, string, number]] : []),
    [arr('features').length > 0, 'Features (or “None of these”)', 4],
    [!!str('domain_own') && (str('domain_own') === 'no' || !!str('domain')), 'Domain', 4],
  ];
  const done = checks.filter((c) => c[0]).length;
  return { pct: Math.round((done / checks.length) * 100), missing: checks.filter((c) => !c[0]).map(([, label, stage]) => ({ label, stage })) };
}

function renderReview() {
  const p = pkg();
  const { pct, missing } = completeness();
  const { pages } = previewPages();
  const fileCount = Object.values(s.files).reduce((n, l) => n + l.length, 0);
  const label = (list: { id: string; name: string }[], id: string) => list.find((x) => x.id === id)?.name ?? '—';
  const rows: [string, string][] = [
    ['Format', p ? `${p.name} · ${p.id === 'websiteplus' ? 'from ' : ''}${money(p.price + extras().cost)}` : str('product') === 'unsure' ? 'We’ll recommend one' : '—'],
    ['Pages', str('pages_mode') === 'dump' ? `${pages.length} suggested` : String(pages.length)],
    ['Blocks', `${blockCount(pages)} / ${limits().blocks}`],
    ['Direction', tasteWords().join(' / ') || 'Balanced'],
    ['Primary goal', label(goals, str('goal'))],
    ['References', s.refs.length ? `${s.refs.length} selected` : '—'],
    ['Assets uploaded', String(fileCount)],
    ['Copy', label(copyStatus, str('copy'))],
    ['Features', arr('features').filter((f) => f !== 'none').map((f) => features.find((x) => x.id === f)?.name).join(', ') || (arr('features').includes('none') ? 'None' : '—')],
    ['Domain', str('domain_own') === 'yes' ? str('domain') || 'Owned' : str('domain_own') === 'no' ? 'Needs help' : '—'],
    ...(s.week ? [['Preferred week', new Date(s.week + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })] as [string, string]] : []),
  ];
  $('#review').innerHTML = `
    <div class="rounded-[28px] bg-white/[0.03] p-5 sm:p-8">
      <div class="flex items-start justify-between gap-4">
        <div class="min-w-0"><p class="label text-spark">Shipped website brief · ${esc(s.ref)}</p><p class="mt-2 truncate text-[28px] font-semibold tracking-tight sm:text-[34px]">${esc(str('company') || 'Your company')}</p></div>
        <p class="shrink-0 text-right"><span class="block font-mono text-[28px] text-spark sm:text-[34px]">${pct}%</span><span class="label text-paper/40">complete</span></p>
      </div>
      <div class="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10"><div class="h-full rounded-full bg-spark" style="width:${pct}%"></div></div>
      <dl class="mt-6 grid gap-x-8 sm:grid-cols-2">${rows.map(([k, v]) => `<div class="flex justify-between gap-4 border-b border-white/[0.07] py-3 text-[15px]"><dt class="text-paper/50">${k}</dt><dd class="text-right">${esc(v)}</dd></div>`).join('')}</dl>
    </div>
    ${missing.length ? `<div class="mt-4 rounded-[24px] border border-booked/30 p-5 sm:p-6">
      <p class="text-[17px] font-medium">Worth filling before you send</p>
      <p class="mt-1 text-[14px] text-paper/50">You can send it as it is. We’ll just ask about these after.</p>
      <ul class="mt-4 space-y-1.5">${missing.map((m) => `<li><button type="button" data-goto="${m.stage}" class="flex min-h-11 w-full items-center gap-3 rounded-xl bg-white/[0.04] px-3.5 text-left text-[15px] transition hover:bg-white/[0.08]"><span class="text-booked" aria-hidden="true">⚠</span><span class="flex-1">${esc(m.label)}</span><span class="label text-paper/40">${stages[m.stage].name} →</span></button></li>`).join('')}</ul>
    </div>` : `<p class="mt-4 rounded-[24px] bg-spark/10 p-5 text-[15px] text-spark">Everything’s here. Send it and we’ll take it from there.</p>`}`;
}

// ---------------------------------------------------------------------------
// Stages & navigation
// ---------------------------------------------------------------------------

function go(i: number, push = true) {
  s.stage = Math.max(0, Math.min(stages.length - 1, i));
  $$('.stage').forEach((el) => (el.hidden = Number(el.dataset.stage) !== s.stage));
  $$<HTMLElement>('.step').forEach((el) => {
    const n = Number(el.dataset.goto);
    el.dataset.state = n === s.stage ? 'now' : n < s.stage ? 'done' : '';
    if (n === s.stage) el.setAttribute('aria-current', 'step'); else el.removeAttribute('aria-current');
  });
  $('#step-now').textContent = `0${s.stage + 1} ${stages[s.stage].name}`;
  const last = s.stage === stages.length - 1;
  $('#next').textContent = last ? 'Send brief →' : `${stages[s.stage + 1].name} →`;
  $<HTMLButtonElement>('#back').disabled = s.stage === 0;
  $('#bar-hint').textContent = last ? 'Nothing is charged. You’ll get a build plan first.' : `Step ${s.stage + 1} of ${stages.length} · saved on this device`;
  $('#form-error').classList.add('hidden');
  if (last) renderReview();
  if (push) history.pushState({ stage: s.stage }, '', `#${stages[s.stage].id}`);
  window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  sheet(false);
  save();
}
window.addEventListener('popstate', (e) => go(e.state?.stage ?? stageFromHash(), false));
const stageFromHash = () => Math.max(0, stages.findIndex((x) => '#' + x.id === location.hash));

document.addEventListener('click', (e) => {
  const b = (e.target as HTMLElement).closest<HTMLElement>('[data-goto]');
  if (b) go(Number(b.dataset.goto));
});
$('#back').addEventListener('click', () => go(s.stage - 1));
$('#next').addEventListener('click', () => (s.stage === stages.length - 1 ? send() : go(s.stage + 1)));

// Phones: the panel is a bottom sheet behind the pill
function sheet(open: boolean) {
  $('#panel').classList.toggle('open', open);
  $('#scrim').classList.toggle('hidden', !open);
  $('#pill').setAttribute('aria-expanded', String(open));
}
$('#pill').addEventListener('click', () => sheet(!$('#panel').classList.contains('open')));
$('#scrim').addEventListener('click', () => sheet(false));

// ---------------------------------------------------------------------------
// Send
// ---------------------------------------------------------------------------

// The structured brief our build pipeline reads (see docs/build-flow.md).
function briefData() {
  const fieldsOf = (id: string) => Object.fromEntries(Object.entries(s.f).filter(([k]) => k.startsWith(`f_${id}_`)).map(([k, v]) => [k.slice(`f_${id}_`.length), v]));
  const { pages } = previewPages();
  const { pct, missing } = completeness();
  return {
    id: s.ref,
    created_at: new Date().toISOString(),
    contact: { name: str('name'), email: str('email') },
    project: {
      product: str('product'), product_note: str('unsure_note') || undefined,
      industry: str('industry'), industry_other: str('industry_other') || undefined,
      company: str('company'), current_site: str('current_site'), socials: str('socials'),
      describe: str('describe'), selling: str('selling'), audience: str('audience'),
      goal: str('goal'), goal_other: str('goal_other') || undefined,
      preferred_week: s.week,
    },
    visual: {
      references: s.refs.map((id) => { const r = refs.find((x) => x.id === id)!; return { id, slug: r.slug, url: r.url }; }),
      closest: s.closest || (s.refs.length === 1 ? s.refs[0] : undefined),
      reference_traits: arr('traits'),
      sliders: Object.fromEntries([...sliders, pushSlider].map((x) => [x.id, Number(str(`slider_${x.id}`) || 50)])),
      motion: str('motion'),
      competitors: (s.lists.competitors ?? []).filter(Boolean),
      aspirational: (s.lists.aspirational ?? []).filter(Boolean),
      anti_references: (s.lists.anti ?? []).filter(Boolean),
      anti_why: str('anti_why'),
    },
    brand: {
      has: arr('assets'), palette_hex: str('palette_hex') || undefined,
      locked: arr('locked'), locked_note: str('locked_note') || undefined,
      files: Object.fromEntries(Object.entries(s.files).filter(([k]) => k.startsWith('asset:')).map(([k, v]) => [k.slice(6), v.map((f) => f.name)])),
    },
    copy: { status: str('copy'), permission_to_rewrite: str('copy') !== 'final', story: str('copy_story') || undefined },
    sitemap: {
      mode: str('pages_mode'),
      approved: str('pages_mode') === 'builder' ? true : s.recoApproved,
      pages: pages.map((p) => ({
        name: p.name,
        path: '/' + (p === pages[0] ? '' : p.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')),
        blocks: p.blocks.map((b, i) => ({ n: i + 1, type: b.type, headline: b.headline, copy: b.copy, cta: b.cta, cta_url: b.cta_url, notes: b.notes, assets: (s.files[`block:${b.id}`] ?? []).map((f) => f.name) })),
      })),
    },
    dump: str('pages_mode') === 'dump' ? { files: (s.files.dump ?? []).map((f) => f.name), links: str('dump_links').split('\n').map((l) => l.trim()).filter(Boolean), notes: str('dump_notes') } : undefined,
    functional: Object.fromEntries(arr('features').filter((f) => f !== 'none').map((f) => [f, fieldsOf(f)])),
    technical: { domain_own: str('domain_own'), domain: str('domain'), hosting: str('hosting'), current_cms: str('current_cms'), seo_keep: str('seo_keep'), seo_urls: str('seo_urls') },
    completeness: pct,
    missing: missing.map((m) => m.label),
  };
}

async function send() {
  const err = $('#form-error');
  const need = !str('name') || !emailOk() || !str('company');
  err.textContent = need ? 'We need your name, a working email and the company name to send this. They’re in Basics.' : '';
  err.classList.toggle('hidden', !need);
  if (need) {
    err.insertAdjacentHTML('beforeend', ' <button type="button" data-goto="0" class="underline">Go to Basics</button>');
    err.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }
  const data = briefData();
  const btn = $<HTMLButtonElement>('#next');
  if (briefEndpoint) {
    btn.disabled = true;
    btn.textContent = 'Sending…';
    try {
      // TODO: upload fileStore[*] to storage and swap file names for URLs once the database is connected.
      const res = await fetch(briefEndpoint, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error(String(res.status));
    } catch {
      btn.disabled = false;
      btn.textContent = 'Send brief →';
      err.textContent = 'That didn’t go through. Your answers are saved here; try again in a moment.';
      err.classList.remove('hidden');
      return;
    }
  }
  s.sent = data.created_at;
  try { localStorage.setItem(KEY + ':sent', JSON.stringify(data)); localStorage.removeItem(KEY); } catch {}
  const p = pkg();
  $('#done-line').textContent = `${p ? p.name : 'Your website'} for ${str('company')}. We’ll email ${str('email')} your build plan: final scope, fixed price and the open build weeks.`;
  $('#done-demo').classList.toggle('hidden', !!briefEndpoint);
  $('#download').onclick = () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    a.download = `${data.id}.json`;
    a.click();
  };
  $('#flow > .wrap > nav').classList.add('hidden');
  $('#flow > .wrap > .grid').classList.add('hidden');
  $('#thumbbar').classList.add('hidden');
  $('#done').classList.remove('hidden');
  window.scrollTo({ top: 0 });
  $('#done').focus();
}

// ---------------------------------------------------------------------------
// Hairline figures: mounted when they first scroll into view
// ---------------------------------------------------------------------------

const figures = { basket, elevator, exploded, laptop, loupe, patch, phone, query, settle, sieve, slow, stack, terrain, drawer } as const;
const io = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (!e.isIntersecting) continue;
    const el = e.target as HTMLElement;
    io.unobserve(el);
    const make = figures[el.dataset.figure as keyof typeof figures];
    if (!make) continue;
    make(el, {
      play: el.hasAttribute('data-play'),
      intensity: el.dataset.intensity ? Number(el.dataset.intensity) : 0.5,
      theme: 'dark',
      label: '',
    });
  }
}, { rootMargin: '120px' });
$$('[data-figure]').forEach((el) => io.observe(el));

// ---------------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------------

$$('[data-list]').forEach(renderList);
if (str('pages_mode') === 'builder' && !s.pages.length) seedPages();
writeFields();
applyShows();
renderRefs();
renderPages();
renderReco();
renderFiles();
renderPanel();
go(location.hash ? stageFromHash() : s.stage, false);
history.replaceState({ stage: s.stage }, '', `#${stages[s.stage].id}`);
