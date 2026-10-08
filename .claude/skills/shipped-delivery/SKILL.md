---
name: shipped-delivery
description: Turns a /start/ brief into what Shipped delivers. Use when a brief arrives or a test client is run: the client brief PDF, the internal notes, a prototype site built from the brief, or a private preview link.
---

# Shipped delivery

Shipped is RemotoLabs' productized web studio: fixed-price websites (Landing $1,750 · Website $4,000 · Website+ from $8,500), live in 5–20 business days. The client fills the brief at `/start/`; everything after that is ours. The goal of this pipeline is that a complete brief alone produces the site the client imagined, with no corrections from the team. Every correction the owner makes is a **lesson**: it goes into [`LESSONS.md`](LESSONS.md) and into the script or rule that caused it.

Each client gets a folder (tests live in `../_tests/<client>/`):

```
brief.json        what /start/ sent (schema: docs/build-flow.md)
story.json        the PDF's creative lines, in the client's language
source/           their current site: copy, fonts, colours, images
refs/             design systems of the references they picked
direction.md      the design decisions, each with its source
report/           client PDF + internal.md
site/             the prototype
```

Read `LESSONS.md` before step 1. It is short and every line in it was a real correction.

## Steps

1. **Intake.** Get `brief.json`. Scrape the client's current site into `source/`: all visible copy, product or service data, computed fonts and colours, logo, images. Done when `source/` holds their real copy, their typefaces and their colours, and every image the site will use is on disk.
2. **Read the references.** Run `node pipeline/ref-systems.mjs <folder>`, then read `refs/summary.md` and the closest reference's full `refs/<slug>.md`. Write `direction.md`: display face, text face, type scale, weight, radius, palette, density, motion, the one signature moment, each line naming its source (closest ref, a slider, the type choice, a locked asset, their current brand). Done when no decision in `direction.md` is unsourced. Rules: [`SITE.md`](SITE.md).
3. **Client PDF.** Write `story.json` in the client's language, then run `node pipeline/make-client-pdf.mjs <folder>`. Render every page and look at it. Done when no page is near-empty except the back cover, no card or row is cut across a page, and nothing internal appears. Rules: [`PDF.md`](PDF.md).
4. **Site.** Build from `direction.md` with the client's real content. Done when every page renders at 1440px and in a 390px frame with no horizontal overflow, the signature moment works, and every image and price is theirs. Rules: [`SITE.md`](SITE.md).
5. **Deliver.** Deploy a private preview (below) and hand over the links: site, PDF. Keep `internal.md` for the team.
6. **Lessons.** For each correction the owner gives: fix the cause (script, rule, data), then add one line to `LESSONS.md` saying what to do, in the positive.

## Private preview

Prototypes carry real brands, so they stay behind Vercel login: put the sites and PDFs in one folder with an index page, `robots.txt` (`Disallow: /`) and `noindex` on every page, run `vercel deploy --yes` from it, then `vercel alias rm <project>.vercel.app --yes` so only the protected deployment URL remains. Check with `curl -o /dev/null -w "%{http_code}"`: the deployment URL answers 302, the bare project domain 404.
