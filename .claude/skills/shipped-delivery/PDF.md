# The client brief PDF

The PDF is part of the experience: the first thing the client receives after sending the brief, and the proof that we listened. It is written for them, in their language, and it makes Shipped look careful and valuable. Generator: `pipeline/make-client-pdf.mjs`; the creative lines come from `story.json`.

## What it is

A story in five beats, then a back cover:

1. **Lo que escuchamos** · their business in their own words (a pull quote), what they sell, for whom, and the one job the site has.
2. **Cómo se va a sentir** · the direction as three or four words, the references with what we take from each, creativity / motion / type cards, their ideal and their competitors.
3. **El recorrido** · every page and block, with their headlines.
4. **Quién trae qué** · what they bring, what we handle.
5. **Lo que sigue** · brief → build plan → build week → launch, and the fixed price.

## story.json

```json
{ "coverTitle": "Hikari Studio,", "coverAccent": "en su mejor luz.",
  "coverLine": "...", "heardTitle": "...", "feelTitle": "...", "feelAccent": "...",
  "feelLine": "...", "mapLine": "...", "closing": "..." }
```

Write these like a studio that already understands the brand: specific to their product, their voice, their goal (`"Papel, hierro, bambú y paciencia."`, `"Dos frentes, un solo equipo."`). Spanish for Argentine clients (voseo), the client's language otherwise.

## What stays internal

The build spec, the flags, scope arithmetic, add-on prices and the word "template" go to `report/internal.md`, never the PDF. The PDF names their price once, as a fixed price.

## Layout

- Cover and back cover are full-bleed dark pages; everything between flows continuously on white, with paper-coloured cards.
- Rows, cards, steps and figures never split across pages; long page lists split between rows.
- After generating, render each page with `swift pipeline/render-pdf.swift <pdf> <prefix>` and look. A page that is mostly empty, or a card cut in half, is a bug in the generator: fix the CSS there.
