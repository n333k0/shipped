# The client brief PDF

The PDF is part of the experience: the first thing the client receives after sending the brief, and the proof that we listened. It is written for them, in their language, and it makes Shipped look careful and valuable. Generator: `pipeline/make-client-pdf.mjs`; the creative lines come from `story.json`.

## What it is

Brand pages bookend a story in four beats, then the road ahead:

- **Cover** (ink, spark dot) and **"Su sitio, en piezas"** (spark, full bleed): their name, pages, blocks, business days and "un solo precio" in big type, with their own pages drawn as an isometric stack.
1. **Lo que escuchamos** · their business in their own words (a pull quote), what they sell, for whom, and the one job the site has.
2. **Cómo se va a sentir** · the direction as three or four words, the references with what we take from each, creativity / motion / type cards, their ideal and their competitors.
3. **Quién trae qué** · what they bring, what we handle (kept in one piece).
4. **El recorrido** · every page and block, with their headlines (splits between cards, so it fills the last white page).
- **05 El camino** (ink, full bleed): the roadmap with real dates from their build week, scaled to the package (5 / 10 / 20 business days): brief, kickoff call, site plan, build, review, launch. Each stop says what we do and what they do, and the payments sit where they happen. It sells by making the process feel safe: nothing is fixed until they approve, and every promise on it already exists in the site FAQ.
- **Gracias** (spark, full bleed).

## story.json

```json
{ "coverTitle": "Estudio Norte,", "coverAccent": "en su mejor luz.",
  "coverLine": "...", "heardTitle": "...", "feelTitle": "...", "feelAccent": "...",
  "feelLine": "...", "mapLine": "...", "closing": "..." }
```

Write these like a studio that already understands the brand: specific to their product, their voice, their goal (`"Papel, hierro, bambú y paciencia."`, `"Dos frentes, un solo equipo."`). Spanish for Argentine clients (voseo), the client's language otherwise.

## What stays internal

The build spec, the flags, scope arithmetic, add-on prices and the word "template" go to `report/internal.md`, never the PDF. The PDF names their price once, as a fixed price.

## Layout

- Cover and back cover are full-bleed dark pages; everything between flows continuously on white, with paper-coloured cards.
- Rows, cards, steps and figures never split across pages; long page lists split between rows.
- The generator measures the last white page and reprints tighter (densities 0–2) when a few rows would spill onto an empty page; the console line says the density and how full that page is.
- After generating, render each page with `swift pipeline/render-pdf.swift <pdf> <prefix>` and look. A page that is mostly empty, or a card cut in half, is a bug in the generator: fix the CSS there.
