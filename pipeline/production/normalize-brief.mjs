// Turns what /start/ sent (brief.json, schema in docs/build-flow.md) into project.json: the one
// normalized brief every production agent reads. Marks each gap as required, optional or inferred.
//   node pipeline/production/normalize-brief.mjs <project-folder>
// Exit code 0 always; required gaps are listed in project.json `intake.blockers`.
import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SHIPPED = fileURLToPath(new URL('../..', import.meta.url));
const site = readFileSync(join(SHIPPED, 'src/data/site.ts'), 'utf8');

// Package scope from src/data/site.ts (single source of truth)
export function packagesFromSite(src = site) {
  const out = {};
  for (const m of src.matchAll(/id: '(landing|website|websiteplus)',\s*name: '([^']+)',\s*price: (\d+),[\s\S]*?days: '([^']+)',[\s\S]*?depositPct: (\d+),[\s\S]*?pages: (\d+),\s*sections: (\d+)/g)) {
    out[m[1]] = { id: m[1], name: m[2], price: +m[3], days: m[4], depositPct: +m[5], pages: +m[6], sections: +m[7] };
  }
  return out;
}

const clean = (v) => (typeof v === 'string' ? v.trim() : v) || undefined;
const list = (v) => (Array.isArray(v) ? v.filter(Boolean) : []);

export function normalize(b, packages = packagesFromSite()) {
  const p = b.project ?? {}, v = b.visual ?? {}, brand = b.brand ?? {}, copy = b.copy ?? {}, sitemap = b.sitemap ?? {};
  const pages = list(sitemap.pages).map((pg) => ({ name: pg.name, path: pg.path, blocks: list(pg.blocks).map((x) => ({ type: x.type, headline: clean(x.headline), copy: clean(x.copy), cta: clean(x.cta), cta_url: clean(x.cta_url), notes: clean(x.notes), assets: list(x.assets) })) }));
  const sections = pages.reduce((n, pg) => n + pg.blocks.length, 0);
  const inferred = {};

  let pkg = packages[p.product];
  if (!pkg && p.product === 'unsure' && pages.length) {
    const guess = pages.length <= 1 && sections <= 8 ? 'landing' : pages.length <= 5 ? 'website' : 'websiteplus';
    inferred.package = { value: guess, why: `${pages.length} pages / ${sections} sections in the sitemap; client chose "not sure"` };
  }

  const required = [
    [p.company, 'project.company (company name)'],
    [b.contact?.email, 'contact.email'],
    [p.industry, 'project.industry (category)'],
    [p.goal, 'project.goal (what should happen on the site)'],
    [p.describe, 'project.describe (what they do)'],
    [pkg || inferred.package, 'project.product (package)'],
  ];
  const optional = [
    [p.audience, 'project.audience'], [p.selling, 'project.selling'], [p.current_site, 'project.current_site'],
    [list(v.references).length, 'visual.references'], [list(v.aspirational).length, 'visual.aspirational (aesthetic ideal)'],
    [list(v.competitors).length, 'visual.competitors'], [list(brand.has).length, 'brand.has (assets)'],
    [pages.length, 'sitemap.pages'], [b.technical?.domain_own, 'technical.domain_own'],
  ];
  const blockers = required.filter(([ok]) => !ok).map(([, k]) => k);
  if (p.product === 'unsure' && inferred.package) blockers.push(`package to confirm with the client (suggested: ${inferred.package.value})`);

  const scopePkg = pkg ?? packages[inferred.package?.value];
  const scope = scopePkg ? { pages: pages.length, sections, included_pages: scopePkg.pages, included_sections: scopePkg.sections, over: pages.length > scopePkg.pages || sections > scopePkg.sections } : { pages: pages.length, sections };

  return {
    id: b.id,
    created_at: b.created_at,
    customer: { name: clean(b.contact?.name), email: clean(b.contact?.email), company: clean(p.company), current_site: clean(p.current_site), socials: clean(p.socials) },
    package: pkg ?? null,
    category: p.industry === 'other' ? { id: 'other', note: clean(p.industry_other) } : { id: p.industry ?? null },
    objectives: { goal: p.goal ?? null, goal_other: clean(p.goal_other), describe: clean(p.describe), selling: clean(p.selling), audience: clean(p.audience) },
    pages,
    scope,
    functionality: Object.keys(b.functional ?? {}),
    functional_detail: b.functional ?? {},
    brand: { has: list(brand.has), locked: list(brand.locked), locked_note: clean(brand.locked_note), palette_hex: clean(brand.palette_hex), palette_from_site: !!brand.palette_from_site, font_names: clean(brand.font_names), logo_upgrade: !!brand.logo_upgrade, files: brand.files ?? {} },
    direction: { references: list(v.references), closest: v.closest ?? null, traits: list(v.reference_traits), sliders: v.sliders ?? {}, motion: v.motion ?? null, typeface: v.typeface ?? null, ideal: list(v.aspirational), ideal_why: clean(v.ideal_why), competitors: list(v.competitors), competitors_diff: clean(v.competitors_diff) },
    content: { copy_status: copy.status ?? null, permission_to_rewrite: copy.permission_to_rewrite ?? null, story: clean(copy.story), files: list(copy.files) },
    technical: b.technical ?? {},
    timeline: { preferred_week: p.preferred_week ?? null, business_days: (pkg ?? scopePkg)?.days ?? null },
    checkout: b.start ?? { mode: 'call' }, // intent only: never a payment confirmation
    special: { notes: clean(b.dump?.notes), product_note: clean(p.product_note) },
    inferred: { ...(b.inferred ?? {}), ...inferred },
    intake: {
      blockers,
      optional_missing: optional.filter(([ok]) => !ok).map(([, k]) => k),
      brief_missing: list(b.missing),
      ready_to_plan: blockers.length === 0,
    },
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const dir = resolve(process.argv[2] ?? '.');
  const project = normalize(JSON.parse(readFileSync(join(dir, 'brief.json'), 'utf8')));
  writeFileSync(join(dir, 'project.json'), JSON.stringify(project, null, 2) + '\n');
  console.log(`project.json · ${project.customer.company ?? '?'} · ${project.package?.name ?? 'package ?'} · ${project.category.id ?? 'category ?'} · ${project.intake.blockers.length ? `blocked: ${project.intake.blockers.join('; ')}` : 'ready to plan'}`);
}
