---
name: shipped-delivery
description: Turns a /start/ brief into what Shipped delivers. Use when a brief arrives or a test client is run: the client brief PDF, the internal notes, a prototype site and its variations, or a private preview link.
---

# Shipped delivery

Shipped is RemotoLabs' productized web studio: fixed-price websites (Landing $1,750 · Website $4,000 · Website+ from $8,500), live in 5–20 business days. The client fills the brief at `/start/`; everything after that is ours. The goal: a complete brief alone produces a site the client is proud of, complex and specific to them, never generic, with no corrections from the team. Every correction the owner makes is a **lesson**: it goes into [`LESSONS.md`](LESSONS.md) and into the script or rule that caused it.

Each client gets a folder (tests live in `../_tests/<client>/`, outside this public repo):

```
brief.json        what /start/ sent (schema: docs/build-flow.md; read `inferred` first)
story.json        the PDF's creative lines, in the client's language
source/           their current site: copy, fonts, colours, logo, images
refs/             design systems of the references they picked
direction.md      the design decisions, each with its source
report/           client PDF + internal.md
site/             v1 + v2/ + v3/, all reviewed
```

Read `LESSONS.md` before step 1. It is short and every line in it was a real correction.

## Steps

1. **Intake.** Get `brief.json`. Scrape the client's current site into `source/`: all visible copy, product or service data, computed fonts and colours, images, and the **logo** (try the header image, `og:image`, favicon and apple-touch-icon, and their app or other subdomains when the main one is broken). Done when `source/` holds their real copy, typefaces, colours and a working logo file.
2. **Read the references.** Run `node pipeline/ref-systems.mjs <folder>`; read `refs/summary.md` and the closest reference's full `refs/<slug>.md`. Write `direction.md`: display face, text face, type scale, weight, radius, palette, density, motion, imagery, the signature moment, each line naming its source (closest ref, a slider, the type choice, a locked asset, their current brand, `inferred`). Done when no decision is unsourced. Rules: [`SITE.md`](SITE.md).
3. **Client PDF.** Write `story.json`, run `node pipeline/make-client-pdf.mjs <folder>`, render with `swift pipeline/render-pdf.swift`. Done when no page is near-empty except the back cover, nothing is cut across pages, nothing internal appears. Rules: [`PDF.md`](PDF.md).
4. **Site, three ways.** Build v1 from `direction.md` with every page of the sitemap, then v2 and v3 home pages that push further (see "Variations" in `SITE.md`). Start from [`library/`](../../../library/README.md): the mobile menu and variant switcher always, patterns where the brief calls for them. Done when all three exist and the switcher links them.
5. **Review.** Run `node pipeline/review-site.mjs <folder>/site` and look at every page at 1440px and in a 390px frame. Done when the review is all clear and you have seen each page with your own eyes.
6. **Deliver.** Private preview (below); hand over the site link, the PDF, and the variations. `internal.md` stays with the team.
7. **Lessons.** For each owner correction: fix the cause (script, rule, data, library), then add one positive line to `LESSONS.md`.

## Skills to reach for

| Brief says | Skill |
|---|---|
| Any build, before writing CSS | `design-taste-frontend` (anti-generic pass) |
| Push ≥ 60 or the owner asks for "more" | `high-end-visual-design` |
| Minimal + editorial sliders | `minimalist-ui` |
| Technical, data, dashboards, bold + experimental | `industrial-brutalist-ui` |
| They have a site today (almost always) | `redesign-existing-projects` to audit it in step 1 |
| `inferred.three_d.suggested` | `img2threejs` for one 3D object in v2 or v3, never in every version |
| Polish, critique, accessibility | `impeccable` |

## Private preview

Prototypes carry real brands, so they stay behind Vercel login: put the sites and PDFs in one folder with an index page, `robots.txt` (`Disallow: /`) and `noindex` on every page, `vercel deploy --yes` from it, then `vercel alias rm <project>.vercel.app --yes`. Check with `curl -o /dev/null -w "%{http_code}"`: the deployment URL answers 302, the bare project domain 404. The current project is `shipped-concepts`.
