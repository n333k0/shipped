# Build your site (/start/)

The checkout is a six-stage brief: **01 Basics → 02 Direction → 03 Content → 04 Pages → 05 Features → 06 Review**.
It should feel like configuring a website, not filling in an agency form. It ends with "Send brief"; we reply with a
build plan (final scope, fixed price, open build weeks). Payment moved out of this page.

| File | What it holds |
| --- | --- |
| `src/pages/start.astro` | Markup for every stage, the live "Your site" panel, the thumb bar |
| `src/scripts/brief.ts` | State (saved to `localStorage` under `shipped:brief:v1`), rendering, completeness, the JSON brief |
| `src/data/brief.ts` | Every question, option, block type, template and feature follow-up; `briefEndpoint` |
| `src/data/references.json` + `public/refs/` | The 36-site reference pool (3 per category), built by `node scripts/refs.mjs` from the inspo archive |

## Connecting the database

Set `briefEndpoint` in `src/data/brief.ts`. On send, the page POSTs the brief below as JSON. Until it's set, the brief
stays in the visitor's browser and the confirmation offers a JSON download (marked as a demo).
File contents are kept in memory (`fileStore` in `brief.ts`); the JSON only carries file names. Uploading them to
storage is the TODO in `send()`.

## The brief (what the endpoint receives)

```
id, created_at
contact      name, email
project      product (landing|website|websiteplus|unsure), product_note, industry, company, current_site,
             socials, describe, selling, audience, goal, preferred_week
visual       references [{id, slug, url}], closest, reference_traits[], sliders {dark_light, minimal_expressive,
             editorial_digital, serious_playful, quiet_bold, classic_experimental, safe_experimental} (0–100),
             motion (still|subtle|dynamic|wild), typeface (serif|sans|mix|geometric|mono|display|you_pick),
             competitors[] (max 3), aspirational[], reference_filters[]
             Sliders start from the picked references until the visitor moves one (slidersTouched).
brand        has[], palette_hex, palette_from_site, font_names, locked[], locked_note, files {logo: [...], ...}
copy         status (final|rough|info|nothing), permission_to_rewrite, story, files[]
sitemap      mode (builder|dump), approved, pages [{name, path, blocks [{n, type, headline, copy, cta, cta_url,
             notes, assets[]}]}]
dump         files[], notes                     (only when mode = dump)
functional   {forms: {...}, booking: {url}, multilingual: {primary, more[]}, ...}  (pre-ticked from goal + industry)
technical    domain_own, domain, hosting, current_cms, seo_keep, seo_urls
inferred     signals[] (from Basics text), three_d {suggested, why[]}, imagery (photo-led|type-led),
             line_art, variations
completeness 0–100, missing[]
```

From this we generate the build spec, e.g. *"Build SHP-K3F9QX. Use Template Architecture-03 as the structural start.
Preserve the uploaded brand system. Follow the selected references for density and typography, not branding.
Sitemap approved. Use supplied copy where locked; rewrite rough copy where permitted. Assets are mapped to blocks."*

## Original brief (2026-10-08)

1. **Choose what you're building.** Landing / Website, plus "Not sure? Tell us what you're building → we'll recommend
   the right format." (We kept the site's three packages: Landing, Website, Website+.)
2. **Business type.** 10–12 macro categories + Other. It changes which references show next.
3. **Tell us about it.** Name, current site, socials, what you do, what you sell, who it's for, and *"When this website
   works, what happens?"* (book a call / buy / understand us / contact / sign up / visit / other). That sets the
   conversion hierarchy.
4. **Visual selector.** 24–36 tagged master references; each client sees 9–12 relevant ones. Pick up to 3, then
   "which feels closest?", then what they like (typography, layout, colours, motion, photography, simplicity, density,
   navigation, overall feeling).
5. **Taste calibration.** Sliders after the references: light/dark, minimal/expressive, editorial/digital,
   serious/playful, quiet/bold, classic/experimental, and on its own: *how far can we push it?* (safe ↔ experimental).
6. **Brand assets.** What do you already have (logo, guidelines, fonts, palette, photography, product images,
   illustrations, videos, copy, nothing yet), each with an upload. Plus "anything we absolutely cannot change?"
7. **Architecture, two paths.** *I know what I want*: add pages, add blocks (hero, logo cloud, intro, services,
   features, how it works, case studies, testimonials, gallery, team, pricing, FAQ, CTA, contact, footer, custom);
   each block is a mini form (headline, supporting copy, CTA + URL, assets, notes; move, duplicate, delete).
   *I have no idea*: "the dump" (drag everything here + a big messy text box), then a recommended structure to approve.
8. **Copy.** Final / rough (polish it) / information (turn it into copy) / nothing (help me create it).
9. **Functional requirements.** Conditional checklist: each item opens only its own questions.
10. **Motion.** Still / Subtle / Dynamic / Wild, each card with a small live demo.
11. **Competitors** and **who you wish you felt like** (non-competitors).
12. **Anti-references.** What should this NOT look like, and why.
13. **Technical.** Domain, hosting, CMS, analytics, SEO/existing URLs. No passwords during onboarding.
14. **Final check.** A summary with completeness %, missing items with links back, then send.
