// /start/ — "Build your site". One brief, six stages, saved on this device as you go.
import { basket, elevator, exploded, laptop, loupe, patch, phone, query, settle, sieve, slow, stack, terrain, drawer } from '@lucasmarkes/hairline';
import { packages, addOns, extraPageSections, type PackageId } from '../data/site';
import {
  stages, refs, maxRefs, refsPerPage, refFilters, neighbours, industries, goals, sliders, pushSlider, pushCopy, motionLevels, assets,
  typefaces, suggestFeatures, refSignals, goalSignals, productStructures,
  copyStatus, blockTypes, templates, goalBlock, features, briefEndpoint, type BlockType, type Reference,
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
  refFilters?: string[];
  closest: string;
  lists: Record<string, string[]>; // competitors, aspirational
  pages: Page[];
  pagesEdited: boolean;
  slidersTouched?: boolean; // once they move a fine-tune slider, picks stop setting them
  featuresSeeded?: boolean;
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
// Picks from an older reference pool don't exist any more.
s.refs = s.refs.filter((id) => refs.some((r) => r.id === id));
if (!s.refs.includes(s.closest)) s.closest = '';

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
  if (el instanceof HTMLInputElement && el.type === 'range') {
    el.style.setProperty('--v', el.value + '%');
    if (k !== `slider_${pushSlider.id}`) s.slidersTouched = true;
  }
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
    const on = rule.includes('~') ? arr(k).includes(v) : v.split('|').includes(s.f[k] as string);
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
  if (k === 'industry') {
    // picks from another category don't belong in this brief any more
    const scope = new Set(refScope().map((r) => r.id));
    s.refs = s.refs.filter((id) => scope.has(id));
    if (!s.refs.includes(s.closest)) s.closest = '';
  }
  if (k === 'industry' || k === 'goal' || k === 'product') renderRefs();
  if (k === 'product') { reseedIfUntouched(); renderPages(); }
  if (k === 'product' || k === 'goal') { s.recoApproved = false; renderReco(); }
  if (k === 'pages_mode' && str('pages_mode') === 'builder' && !s.pages.length) { seedPages(); renderPages(); }
  if (k === 'assets') renderFiles();
  if (k === `slider_${pushSlider.id}`) renderPush();
  if (k === 'palette_hex') renderSwatches();
  applyShows();
  renderPanel();
  save();
}

// ---------------------------------------------------------------------------
// References: desktop captures that scroll through the page, ranked for the visitor
// ---------------------------------------------------------------------------

const byId = (id: string) => refs.find((r) => r.id === id)!;
// Position inside its first category, so an unranked list deals one site per category in turn.
const deal = new Map(refs.map((r) => [r.id, refs.filter((x) => x.cats[0] === r.cats[0]).indexOf(r)]));
let refLimit = refsPerPage;
const shownRefs = new Set<string>();

// What Basics tells us, turned into boosts for the reference grid (and the chips that explain it)
function basicsSignals() {
  const text = ' ' + ['describe', 'selling', 'audience', 'industry_other', 'unsure_note', 'company'].map(str).join(' ').toLowerCase() + ' ';
  // short words (ia, ai, bar, app) must match whole words, or 'familia' reads as AI
  const has = (w: string) => (w.trim().length <= 3 ? new RegExp(`(^|[^a-záéíóúñ])${w.trim()}([^a-záéíóúñ]|$)`).test(text) : text.includes(w));
  const hits = refSignals.filter((sig) => sig.words.some(has));
  const goal = goalSignals[str('goal')];
  return { hits, goal, structures: productStructures[str('product')] ?? [] };
}

// The references they may see: only their category once they've picked one. Basics text, goal,
// format and style filters reorder inside it; they never bring in sites from other categories.
function refScope() {
  const ind = str('industry');
  return ind && ind !== 'other' ? refs.filter((r) => r.cats.includes(ind)) : refs;
}

function rankedRefs() {
  const ind = str('industry');
  const near = neighbours[ind] ?? [];
  const on = refFilters.filter((f) => (s.refFilters ?? []).includes(f.id));
  const { hits, goal, structures } = basicsSignals();
  const score = (r: Reference) => {
    let sc = 0;
    if (ind && ind !== 'other') {
      // their category comes first, all of it, before any neighbour
      const i = r.cats.indexOf(ind);
      if (i === 0) sc += 30;
      else if (i > 0) sc += 28;
      else {
        const n = near.findIndex((c) => r.cats.includes(c));
        if (n > -1) sc += 4 - n * 0.5;
      }
    }
    for (const h of hits) {
      if (h.slugs?.includes(r.slug)) sc += 9;
      if (h.cats?.some((c) => r.cats.includes(c))) sc += 5;
      if (h.tags?.some((t) => r.vibes.includes(t) || r.styles.includes(t))) sc += 2;
    }
    if (goal?.cats?.some((c) => r.cats.includes(c))) sc += 3;
    if (r.structure && goal?.structures?.includes(r.structure)) sc += 2;
    if (r.structure && structures.includes(r.structure)) sc += 1.5;
    sc += 12 * on.filter((f) => f.test(r)).length; // style filters lead
    if (r.editorial) sc += 0.5;
    return sc;
  };
  return refScope().sort((a, b) => score(b) - score(a) || deal.get(a.id)! - deal.get(b.id)!);
}

function renderWhy() {
  const el = document.getElementById('ref-why');
  if (!el) return;
  const { hits, goal } = basicsSignals();
  const ind = industries.find((i) => i.id === str('industry'));
  const chips = [ind && ind.id !== 'other' ? ind.name : '', ...hits.map((h) => h.label), goal?.label ?? ''].filter(Boolean);
  el.innerHTML = chips.length
    ? `<span class="text-paper/45">Picked for what you told us:</span> ${chips.map((c) => `<span class="rounded-full border border-white/12 px-2.5 py-0.5 text-paper/70">${esc(c)}</span>`).join(' ')}`
    : '<span class="text-paper/45">Tell us about the business in Basics and these get more specific.</span>';
}

// How close a site is to what they've picked: inspo's neighbours, then shared tags.
const overlap = (a: string[], b: string[]) => (a.length && b.length ? a.filter((x) => b.includes(x)).length / new Set([...a, ...b]).size : 0);
function likeness(r: Reference) {
  return s.refs.reduce((sc, id) => {
    const p = byId(id);
    return sc + (p.similar.includes(r.id) || r.similar.includes(p.id) ? 4 : 0) + 2 * overlap(p.styles, r.styles) + 2 * overlap(p.vibes, r.vibes)
      + (p.mode === r.mode ? 1 : 0) + (p.structure === r.structure ? 1 : 0) + (p.cats.some((c) => r.cats.includes(c)) ? 1.5 : 0);
  }, 0);
}

const refImg = (r: Reference, full = false) => url(`/refs/${r.slug}${full ? '.full' : ''}.webp`);
function refCard(r: Reference) {
  const on = s.refs.includes(r.id);
  const h = esc(host(r.url));
  return `<div class="ref" data-ref="${r.id}" aria-pressed="${on}">
    <div class="ref-bar" aria-hidden="true"><i></i><i></i><i></i><span>${h}</span></div>
    <div class="ref-view"><img src="${refImg(r)}" data-full="${refImg(r, true)}" data-h="${r.h}" alt="" loading="lazy" decoding="async" width="520" height="325" /></div>
    <button type="button" class="ref-hit" data-pick="${r.id}" aria-pressed="${on}" aria-label="Pick ${h}"></button>
    <span class="n">${on ? s.refs.indexOf(r.id) + 1 : ''}</span>
    <button type="button" class="ref-open" data-open="${r.id}" aria-label="Open ${h} full size"><svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M8.5 1.5h4v4M5.5 12.5h-4v-4M12.5 1.5 8 6M1.5 12.5 6 8" stroke="currentColor" stroke-width="1.4"/></svg></button>
  </div>`;
}

function renderRefs() {
  const ranked = rankedRefs();
  const visible = ranked.slice(0, refLimit);
  // earlier picks stay on screen even if the category or filters moved them down
  const missing = s.refs.map(byId).filter((r) => r && !visible.includes(r));
  const list = [...missing, ...visible];
  shownRefs.clear();
  list.forEach((r) => shownRefs.add(r.id));
  $('#refs').innerHTML = list.map(refCard).join('');
  const left = refScope().filter((r) => !shownRefs.has(r.id)).length;
  $('#refs-more').hidden = left <= 0;
  $('#refs-more').textContent = `Show ${Math.min(refsPerPage, left)} more`;
  $$<HTMLButtonElement>('[data-filter]').forEach((b) => b.setAttribute('aria-pressed', String((s.refFilters ?? []).includes(b.dataset.filter!))));
  wireCards($('#refs'));
  renderWhy();
  renderPicks();
}

// Picking only updates state in place, so a card that's mid-scroll keeps moving.
function renderPicks() {
  const full = s.refs.length >= maxRefs;
  $$('.ref[data-ref]').forEach((el) => {
    const id = el.dataset.ref!;
    const on = s.refs.includes(id);
    el.setAttribute('aria-pressed', String(on));
    el.classList.toggle('dim', full && !on);
    el.querySelector('.ref-hit')!.setAttribute('aria-pressed', String(on));
    el.querySelector('.n')!.textContent = on ? String(s.refs.indexOf(id) + 1) : '';
  });
  $('#ref-count').textContent = s.refs.length ? `${s.refs.length} of ${maxRefs}${full ? ' · tap a pick to swap it out' : ''}` : '';
  if (s.closest && !s.refs.includes(s.closest)) s.closest = '';
  $$('[data-need-refs]').forEach((el) => (el.hidden = !s.refs.length));
  $('#closest').innerHTML = s.refs
    .map((id) => {
      const r = byId(id);
      const on = s.closest === id || s.refs.length === 1;
      return `<button type="button" class="mini" data-closest="${id}" aria-pressed="${on}" aria-label="${esc(host(r.url))}"><img src="${refImg(r)}" alt="" /><span class="n">✓</span></button>`;
    })
    .join('');
  renderLike();
}

function renderLike() {
  const row = $('#refs-like-row');
  const like = s.refs.length ? refScope().filter((r) => !s.refs.includes(r.id) && !shownRefs.has(r.id)).map((r) => [r, likeness(r)] as const).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([r]) => r) : [];
  const key = like.map((r) => r.id).join();
  $('#refs-like').hidden = !like.length;
  if (row.dataset.key === key) return;
  row.dataset.key = key;
  row.innerHTML = like.map(refCard).join('');
  wireCards(row);
}

function togglePick(id: string) {
  if (!refs.some((r) => r.id === id)) return false;
  if (s.refs.includes(id)) s.refs = s.refs.filter((x) => x !== id);
  else if (s.refs.length < maxRefs) s.refs.push(id);
  else {
    const c = $('#ref-count');
    c.animate([{ opacity: 1 }, { opacity: 0.2 }, { opacity: 1 }], { duration: 500, iterations: 2 });
    return false;
  }
  seedSliders();
  renderPicks(); renderPanel(); save();
  return true;
}

document.addEventListener('click', (e) => {
  const t = e.target as HTMLElement;
  const pick = t.closest<HTMLElement>('[data-pick]');
  if (pick) togglePick(pick.dataset.pick!);
  const open = t.closest<HTMLElement>('[data-open]');
  if (open) openViewer(open.dataset.open!);
});
$('#ref-filters').addEventListener('click', (e) => {
  const b = (e.target as HTMLElement).closest<HTMLElement>('[data-filter]');
  if (!b) return;
  const id = b.dataset.filter!;
  const list = s.refFilters ?? [];
  s.refFilters = list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
  refLimit = refsPerPage;
  renderRefs(); save();
});
$('#refs-more').addEventListener('click', () => {
  const first = refLimit;
  refLimit += refsPerPage;
  renderRefs();
  $$('#refs .ref')[first]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
});
$('#closest').addEventListener('click', (e) => {
  const b = (e.target as HTMLElement).closest<HTMLElement>('[data-closest]');
  if (!b) return;
  s.closest = b.dataset.closest!;
  renderPicks(); renderPanel(); save();
});

// Scrolling a card through its page: on hover with a mouse, on its own on touch screens.
const canHover = matchMedia('(hover: hover)').matches;
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
const motion = new WeakMap<HTMLElement, Animation>();
const wanted = new WeakSet<HTMLElement>();

async function playCard(card: HTMLElement) {
  wanted.add(card);
  const img = card.querySelector<HTMLImageElement>('.ref-view img')!;
  if (img.dataset.full && !img.src.endsWith(img.dataset.full)) {
    const pre = new Image();
    pre.src = img.dataset.full;
    await pre.decode().catch(() => {});
    if (!wanted.has(card)) return;
    img.src = img.dataset.full;
  }
  const view = img.parentElement!;
  const dist = (view.clientWidth * Number(img.dataset.h)) / 520 - view.clientHeight;
  if (dist <= 0) return;
  motion.get(card)?.cancel();
  const duration = (dist / (canHover ? 220 : 120)) * 1000;
  const frames = [{ transform: 'translateY(0)' }, { transform: `translateY(${-dist}px)` }];
  motion.set(card, canHover
    ? img.animate(frames, { duration, easing: 'cubic-bezier(.45,0,.4,1)', fill: 'forwards' })
    : img.animate(frames, { duration, easing: 'ease-in-out', direction: 'alternate', iterations: Infinity, delay: 500, endDelay: 1400 }));
}
function stopCard(card: HTMLElement) {
  wanted.delete(card);
  const a = motion.get(card);
  if (!a) return;
  const img = card.querySelector<HTMLImageElement>('.ref-view img')!;
  const now = getComputedStyle(img).transform;
  a.cancel();
  motion.set(card, img.animate([{ transform: now === 'none' ? 'translateY(0)' : now }, { transform: 'translateY(0)' }], { duration: 700, easing: 'cubic-bezier(.2,.7,.2,1)' }));
}
const autoplay = new IntersectionObserver((entries) => {
  for (const e of entries) (e.isIntersecting ? playCard : stopCard)(e.target as HTMLElement);
}, { threshold: 0.6 });
function wireCards(root: HTMLElement) {
  if (calm) return;
  $$('.ref', root).forEach((card) => {
    if (canHover) {
      card.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') playCard(card); });
      card.addEventListener('pointerleave', () => stopCard(card));
    } else autoplay.observe(card);
  });
}

// Full-size viewer: the 1440px capture, scrollable, with pick and next/prev
let viewing = '';
const viewerList = () => [...shownRefs, ...$$('#refs-like-row .ref').map((el) => el.dataset.ref!)];
function openViewer(id: string) {
  viewing = id;
  const r = byId(id);
  const img = $<HTMLImageElement>('#viewer-img');
  img.src = refImg(r, true); // the local strip shows at once; the full capture swaps in when it lands
  const big = new Image();
  big.src = r.original;
  big.decode().then(() => { if (viewing === id) img.src = r.original; }).catch(() => {});
  $('#viewer-host').textContent = host(r.url);
  $<HTMLAnchorElement>('#viewer-visit').href = r.url;
  $('#viewer-pick').textContent = s.refs.includes(id) ? 'Picked ✓ · tap to remove' : 'Pick this one';
  $('#viewer-scroll').scrollTop = 0;
  const v = $('#viewer');
  v.classList.remove('hidden');
  v.classList.add('flex');
  document.documentElement.style.overflow = 'hidden';
  $('#viewer-close').focus();
}
function closeViewer() {
  const v = $('#viewer');
  v.classList.add('hidden');
  v.classList.remove('flex');
  document.documentElement.style.overflow = '';
  document.querySelector<HTMLElement>(`[data-open="${viewing}"]`)?.focus();
  viewing = '';
}
function stepViewer(d: number) {
  const list = viewerList();
  const i = list.indexOf(viewing);
  openViewer(list[(i + d + list.length) % list.length]);
}
$('#viewer-close').addEventListener('click', closeViewer);
$('#viewer-prev').addEventListener('click', () => stepViewer(-1));
$('#viewer-next').addEventListener('click', () => stepViewer(1));
$('#viewer-pick').addEventListener('click', () => {
  if (togglePick(viewing)) $('#viewer-pick').textContent = s.refs.includes(viewing) ? 'Picked ✓ · tap to remove' : 'Pick this one';
});
document.addEventListener('keydown', (e) => {
  if (!viewing) return;
  if (e.key === 'Escape') closeViewer();
  if (e.key === 'ArrowRight') stepViewer(1);
  if (e.key === 'ArrowLeft') stepViewer(-1);
});

// Creativity slider: say in plain words what the number means
function renderPush() {
  const v = Number(str(`slider_${pushSlider.id}`) || 50);
  const el = document.getElementById('push-copy');
  if (el) el.textContent = pushCopy.find(([max]) => v < max)![1];
}

// Colour preview from pasted hex codes
function renderSwatches() {
  const el = document.getElementById('swatches');
  if (!el) return;
  const hex = [...str('palette_hex').matchAll(/#?([0-9a-f]{6}|[0-9a-f]{3})\b/gi)].map((m) => '#' + m[1]);
  el.innerHTML = hex.map((h) => `<span class="flex items-center gap-2 rounded-full bg-white/[0.05] py-1 pl-1 pr-3 font-mono text-[12px] text-paper/70"><i class="block size-6 rounded-full border border-white/15" style="background:${h}"></i>${h.toUpperCase()}</span>`).join('');
}

// Fine-tune sliders start from what their picks have in common, until they move one themselves.
function seedSliders() {
  if (s.slidersTouched || !s.refs.length) return;
  const picks = s.refs.map(byId);
  const share = (test: (r: Reference) => boolean) => picks.filter(test).length / picks.length;
  const has = (r: Reference, ...v: string[]) => v.some((x) => r.styles.includes(x) || r.vibes.includes(x));
  const at = (x: number) => String(Math.round(Math.min(90, Math.max(10, x))));
  s.f.slider_dark_light = at(15 + 70 * share((r) => r.mode === 'dark'));
  s.f.slider_minimal_expressive = at(25 + 55 * share((r) => has(r, 'maximalism', 'playful', 'loud')));
  s.f.slider_editorial_digital = at(30 + 50 * share((r) => has(r, 'technical', 'futurist')) - 20 * share((r) => has(r, 'editorial')));
  s.f.slider_serious_playful = at(30 + 55 * share((r) => has(r, 'playful')) - 15 * share((r) => has(r, 'serious')));
  s.f.slider_quiet_bold = at(25 + 55 * share((r) => has(r, 'loud', 'raw', 'maximalism')) + 10 * share((r) => r.mode === 'dark'));
  // inspo tags almost every Swiss minimal site 'brutalism', so it doesn't count as expressive here
  s.f.slider_classic_experimental = at(30 + 55 * share((r) => has(r, 'futurist', 'maximalism')));
  writeFields();
}

// Features: tick what earlier answers already tell us, once, and say so
function seedFeatures() {
  const suggested = suggestFeatures(str('goal'), str('industry'));
  if (!s.featuresSeeded && !arr('features').length) {
    s.f.features = suggested;
    s.featuresSeeded = true;
    writeFields(); applyShows(); save();
  }
  $$('[data-sug]').forEach((el) => el.classList.toggle('hidden', !suggested.includes(el.dataset.sug!)));
}

// ---------------------------------------------------------------------------
// URL lists (competitors, aspirational, anti-references): always one empty row at the end
// ---------------------------------------------------------------------------

function renderList(el: HTMLElement) {
  const key = el.dataset.list!;
  const cap = key === 'competitors' ? 3 : 6;
  const filled = (s.lists[key] ?? []).filter(Boolean).slice(0, cap);
  const rows = filled.length < cap ? [...filled, ''] : filled;
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
  const cap = key === 'competitors' ? 3 : 6;
  if (Number(el.dataset.i) === wrap.children.length - 1 && el.value && wrap.children.length < cap) {
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

// Each block drawn as a fine line wireframe: text as single strokes, media as outlined boxes,
// the call to action in the accent.
function glyph(g: string, small = false) {
  const ln = (w: number, extra = '') => `<i class="ln" style="width:${w}%;${extra}"></i>`;
  const bx = (n: number, px: number) => `<span class="row">${`<i class="bx" style="height:${px}px"></i>`.repeat(n)}</span>`;
  const pill = (w: number, extra = '') => `<i class="pill" style="width:${w}%;${extra}"></i>`;
  const inner: Record<string, string> = {
    hero: ln(62) + ln(40, 'margin-top:4px') + pill(20, 'margin-top:5px'),
    logos: `<span class="row">${'<i class="ln"></i>'.repeat(5)}</span>`,
    text: ln(85) + ln(60, 'margin-top:4px'),
    grid2: bx(2, 13),
    grid3: bx(3, 11),
    grid4: bx(4, 9),
    steps: `<span class="row"><i class="bx" style="height:9px"></i><i class="bx dim" style="height:9px"></i><i class="bx dimmer" style="height:9px"></i></span>`,
    quote: ln(80, 'margin:0 auto') + ln(30, 'margin:4px auto 0'),
    gallery: bx(3, 15),
    rows: ln(100) + ln(100, 'margin-top:4px') + ln(100, 'margin-top:4px'),
    cta: ln(50, 'margin:0 auto') + pill(18, 'margin:5px auto 0'),
    form: `<i class="bx" style="height:5px"></i><i class="bx" style="height:5px;margin-top:3px"></i>` + pill(24, 'margin-top:4px'),
    footer: `<span class="row">${'<i class="ln"></i>'.repeat(4)}</span>`,
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

// The site as one small object: each page a floating isometric sheet, stacked, Home on top in the
// accent, a few marks per sheet for its sections. New sheets drift in; nothing to scroll.
let shownPages = 0;
function siteObject(pages: Page[], limit: number) {
  const n = pages.length;
  const gap = n > 1 ? Math.min(22, 92 / (n - 1)) : 0;
  const base = n > 1 ? 150 : 108;
  const iso = 'matrix(0.866 0.5 -0.866 0.5 0 0)';
  const W = 104, H = 78;
  const layer = (pg: Page, i: number) => {
    const top = i === 0;
    const y = base - (n - 1 - i) * gap;
    const marks = pg.blocks.slice(0, top ? 7 : 3).map((b, k) => {
      const len = b.type === 'hero' ? 62 : b.type === 'cta' ? 34 : 48 + ((k * 13) % 30);
      return `<line x1="${-W / 2 + 12}" y1="${-H / 2 + 16 + k * 8.5}" x2="${-W / 2 + 12 + len}" y2="${-H / 2 + 16 + k * 8.5}" class="${b.type === 'cta' ? 'm-hi' : 'm'}" />`;
    }).join('');
    const enter = i >= shownPages && shownPages > 0 ? ' enter' : '';
    return `<g class="sheet${top ? ' home' : ''}${enter}" style="--d:${i * 0.05}s"><g transform="translate(108 ${y}) ${iso}"><rect x="${-W / 2}" y="${-H / 2}" width="${W}" height="${H}" rx="5" class="plate" /><line x1="${-W / 2}" y1="${-H / 2 + 8}" x2="${W / 2}" y2="${-H / 2 + 8}" class="m" />${marks}</g></g>`;
  };
  const layers = pages.map(layer).reverse().join('');
  const shown = pages.slice(0, 6);
  const total = blockCount(pages);
  const list = shown.map((pg, i) => `<text x="214" y="${44 + i * 19}" class="lbl${i === 0 ? ' hi' : ''}">${esc((pg.name || 'Untitled').slice(0, 14))}<tspan class="cnt" x="300" text-anchor="end">${pg.blocks.length}</tspan></text>`).join('')
    + (n > 6 ? `<text x="214" y="${44 + 6 * 19}" class="lbl dim">+${n - 6} more</text>` : '')
    + (total > limit ? `<text x="214" y="${44 + Math.min(n, 7) * 19 + 4}" class="lbl over">${total - limit} over</text>` : '');
  shownPages = n;
  return `<svg class="siteobj" viewBox="0 0 304 200" role="img" aria-label="${n} page${n === 1 ? '' : 's'}, ${total} blocks"><g class="float">${layers}</g>${list}</svg>`;
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

  $('#pn-map').innerHTML = pages.length
    ? (note ? `<p class="label mb-1 text-paper/40">${esc(note)}</p>` : '') + siteObject(pages, l.blocks)
    : '<p class="py-6 text-[14px] text-paper/40">Pick a format and your site takes shape here.</p>';

  const thumbs = s.refs.map(byId).map((r) => `<img src="${refImg(r)}" alt="" class="h-[26px] w-[42px] rounded-md object-cover object-top" />`).join('');
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
    [s.refs.length > 0, 'At least one reference', 1],
    ...(s.refs.length > 1 ? [[!!s.closest, 'The reference that feels closest', 1] as [boolean, string, number]] : []),
    [!!str('motion'), 'How much motion', 1],
    [arr('assets').length > 0, 'What brand assets you have', 2],
    ...arr('assets').filter((a) => a !== 'nothing').map((a): [boolean, string, number] => {
      const name = assets.find((x) => x.id === a)!.name.toLowerCase();
      return [files(`asset:${a}`) || (a === 'palette' && !!str('palette_hex')), `Missing ${name}`, 2];
    }),
    [!!str('copy'), 'Copy situation', 2],
    [str('pages_mode') === 'builder' ? blockCount() > 0 : str('pages_mode') === 'dump' ? files('dump') || !!str('dump_notes') : false, str('pages_mode') === 'dump' ? 'Something in the dump' : 'Pages and blocks', 3],
    ...(str('pages_mode') === 'dump' ? [[s.recoApproved, 'Approve the suggested structure', 3] as [boolean, string, number]] : []),
    [arr('features').length > 0, 'Features (or “None of these”)', 4],
    [!!str('domain_own') && (str('domain_own') === 'no' || !!str('domain')), 'Domain', 4],
    [!!str('name'), 'Your name', 5],
    [emailOk(), 'Email for the build plan', 5],
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
    ['Typography', typefaces.find((t) => t.id === str('typeface'))?.name ?? (str('typeface') === 'you_pick' ? 'You pick' : '—')],
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
  if (stages[s.stage].id === 'features') seedFeatures();
  if (stages[s.stage].id === 'direction') { refLimit = refsPerPage; renderRefs(); }
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
      reference_filters: s.refFilters ?? [],
      sliders: Object.fromEntries([...sliders, pushSlider].map((x) => [x.id, Number(str(`slider_${x.id}`) || 50)])),
      motion: str('motion'),
      competitors: (s.lists.competitors ?? []).filter(Boolean),
      aspirational: (s.lists.aspirational ?? []).filter(Boolean),
      typeface: str('typeface') || undefined,
    },
    brand: {
      has: arr('assets'), palette_hex: str('palette_hex') || undefined, palette_from_site: arr('palette_from_site').includes('yes') || undefined,
      font_names: str('font_names') || undefined,
      locked: arr('locked'), locked_note: str('locked_note') || undefined,
      files: Object.fromEntries(Object.entries(s.files).filter(([k]) => k.startsWith('asset:')).map(([k, v]) => [k.slice(6), v.map((f) => f.name)])),
    },
    copy: { status: str('copy'), permission_to_rewrite: str('copy') !== 'final', story: str('copy_story') || undefined, files: (s.files.copy ?? []).map((f) => f.name) },
    sitemap: {
      mode: str('pages_mode'),
      approved: str('pages_mode') === 'builder' ? true : s.recoApproved,
      pages: pages.map((p) => ({
        name: p.name,
        path: '/' + (p === pages[0] ? '' : p.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')),
        blocks: p.blocks.map((b, i) => ({ n: i + 1, type: b.type, headline: b.headline, copy: b.copy, cta: b.cta, cta_url: b.cta_url, notes: b.notes, assets: (s.files[`block:${b.id}`] ?? []).map((f) => f.name) })),
      })),
    },
    dump: str('pages_mode') === 'dump' ? { files: (s.files.dump ?? []).map((f) => f.name), notes: str('dump_notes') } : undefined,
    functional: Object.fromEntries(arr('features').filter((f) => f !== 'none').map((f) => [f, fieldsOf(f)])),
    technical: { domain_own: str('domain_own'), domain: str('domain'), hosting: str('hosting'), current_cms: str('current_cms'), seo_keep: str('seo_keep'), seo_urls: str('seo_urls') },
    inferred: inferBrief(),
    completeness: pct,
    missing: missing.map((m) => m.label),
  };
}

// What the answers imply without asking: read by the build (see shipped-delivery/SITE.md).
function inferBrief() {
  const { hits } = basicsSignals();
  const labels = hits.map((h) => h.label);
  const ind = str('industry');
  const slider = (k: string) => Number(str(`slider_${k}`) || 50);
  const picks = s.refs.map(byId);
  const techy = ['saas', 'finance'].includes(ind) || labels.includes('Tech & AI');
  const bold = slider('safe_experimental') >= 65 || ['dynamic', 'wild'].includes(str('motion'));
  const experimental = slider('classic_experimental') >= 55 || picks.some((r) => r.styles.includes('futurist'));
  const photos = arr('assets').some((a) => a === 'photography' || a === 'product') || Object.keys(s.files).some((k) => k === 'asset:photography' || k === 'asset:product');
  return {
    signals: labels,
    three_d: { suggested: (techy || ind === 'creative') && bold && experimental, why: [techy && 'tech', bold && 'bold creativity or motion', experimental && 'experimental taste'].filter(Boolean) },
    imagery: photos ? 'photo-led' : 'type-led',
    line_art: techy || slider('editorial_digital') >= 60,
    variations: 3,
  };
}

async function send() {
  const err = $('#form-error');
  const need = !str('name') || !emailOk() || !str('company');
  err.textContent = need ? 'We need your company name (Basics), plus your name and a working email (just above) to send this.' : '';
  err.classList.toggle('hidden', !need);
  if (need) {
    if (!str('company')) err.insertAdjacentHTML('beforeend', ' <button type="button" data-goto="0" class="underline">Go to Basics</button>');
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
    const live = el.hasAttribute('data-live');
    const fig = make(el, {
      play: el.hasAttribute('data-play'),
      intensity: el.dataset.intensity ? Number(el.dataset.intensity) : live ? 0.85 : 0.5,
      theme: 'dark',
      label: '',
    });
    if (live) liveFigure(el, fig);
    if (el.hasAttribute('data-fit')) fit(el);
  }
}, { rootMargin: '120px' });
$$('[data-figure]').forEach((el) => io.observe(el));

// Stage figures: scale the 5:4 box so the drawing itself is --fit-h tall (capped at --fit-w wide),
// and shift it so the empty plate around the drawing spills out instead of taking up room.
const fitted = new Map<HTMLElement, DOMRect>();
function fit(el: HTMLElement) {
  const svg = el.querySelector('svg');
  if (!svg) return;
  let g = fitted.get(el);
  if (!g) {
    g = svg.getBBox();
    if (!g.height) return;
    fitted.set(el, g);
  }
  const wrap = el.parentElement!;
  const cs = getComputedStyle(wrap);
  const h = parseFloat(cs.getPropertyValue('--fit-h'));
  const k = Math.min(h / g.height, parseFloat(cs.getPropertyValue('--fit-w')) / g.width);
  el.style.width = svg.viewBox.baseVal.width * k + 'px';
  el.style.left = -g.x * k + 'px';
  el.style.top = (h - g.height * k) / 2 - g.y * k + 'px';
  wrap.style.width = g.width * k + 'px';
}
let fitTimer = 0;
window.addEventListener('resize', () => { clearTimeout(fitTimer); fitTimer = window.setTimeout(() => fitted.forEach((_, el) => fit(el)), 100); });

// Option cards: the figure acts out its move (the laptop opens and closes…) while the card
// is hovered or picked. On phones there's no hover, so picking it is what sets it going.
function liveFigure(el: HTMLElement, fig: { update: (o: { play?: boolean }) => void }) {
  const card = el.closest<HTMLElement>('.pick');
  const input = card?.querySelector<HTMLInputElement>('input');
  if (!card || !input) return;
  let hover = false;
  const sync = () => fig.update({ play: hover || input.checked });
  card.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') { hover = true; sync(); } });
  card.addEventListener('pointerleave', () => { hover = false; sync(); });
  form.addEventListener('change', sync);
  sync();
}

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
renderPush();
renderSwatches();
renderPanel();
go(location.hash ? stageFromHash() : s.stage, false);
history.replaceState({ stage: s.stage }, '', `#${stages[s.stage].id}`);
