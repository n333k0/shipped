# Library

Proven code to build client sites from, so every build starts from work that already looks right. Read the
row that matches the brief, open the file, adapt it. When a new pattern lands well with the owner, add it here.

## Components (drop in as-is)

| File | What | Use |
|---|---|---|
| `components/mobile-menu/mobile-menu.js` | Burger that unfolds a full-screen panel from its corner; links rise in | Every prototype. Builds itself from the header nav. Colours via `--mm-*` |
| `components/variant-switcher/variants.js` | Shipped dot (bottom-left) that opens the list of design variations; `V` toggles it | Every prototype with variations. Needs a `variants-config.js` beside it |

## Patterns (standalone demos, generic content)

| File | What | Brief signals that call for it |
|---|---|---|
| `patterns/light-switch-hero.html` | Product photo's background fills the hero; a switch turns the room on | Product with an on/off state (lighting, screens), product photos on light and dark |
| `patterns/cursor-light-reveal.html` | Dark page, the cursor is the light; "lights on" toggle | Lighting, nightlife, galleries; creativity ≥ 60, motion dynamic/wild |
| `patterns/stacked-panels.html` | Full-screen panels that slide over each other (sticky, no JS) | Few hero products or services; photography uploaded |
| `patterns/ai-answer-typing.html` | A question and an AI answer that types itself and names the brand | AI, search, SEO/AEO, assistants |
| `patterns/signal-field.html` | Canvas of drifting dots that link and light up near the pointer | Tech, data, networks; dark leaning; push ≥ 60 |
| `patterns/headline-rise.html` | Hero headline rising line by line, lines set by hand | Default entrance for large type |
| `patterns/count-and-draw.html` | Real numbers count up once; a trend line draws | Only with numbers the client gave |

## Line art

- **Hairline** (`@lucasmarkes/hairline`, in the shipped repo): 33 isometric line figures that answer the pointer. Plain JS: `import { router } from '@lucasmarkes/hairline'` or from `https://cdn.jsdelivr.net/npm/@lucasmarkes/hairline@0.5.0/dist/index.js`. Theme with `--hairline-plate/hi/edge/mid/lo`. Techie briefs: `router`, `hub`, `relay`, `terminal`, `plot`, `branches`.
- `src/components/PackageArt.astro`: one page / five pages / sitemap line drawings that animate on hover.
- `siteObject()` in `src/scripts/brief.ts`: a site as a floating isometric stack of pages.

## Reference systems

- `inspo-components/`: 68 canonical archetypes (hero, nav, CTA, footer, pricing, FAQ, features, stats, testimonials, logo clouds) from inspo, React + Tailwind, each with when to use it. Refresh: `node pipeline/pull-inspo-components.mjs`.
- `design-md/`: DESIGN.md files of 74 well-known brands (Stripe, Linear, Apple, Nike, Airbnb, Vercel…). Use when a client's references or ideal name one of them. From awesome-design-md, MIT.
- Per brief: `node pipeline/ref-systems.mjs <client>` writes the design systems of the references the client picked.
