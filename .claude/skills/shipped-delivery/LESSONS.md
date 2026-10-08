# Lessons

One line per correction from the owner, written as what to do. Newest at the bottom. When a lesson is fully absorbed into a script or rule, delete it here.

## PDF
- The PDF is client-facing: build spec, flags, "template" and add-on maths live in `internal.md`.
- Tell the brief back as a story that makes the client feel understood and makes Shipped look valuable.
- Flow sections one after another; only the cover and back cover get their own page.

## Site
- Use the client's typefaces (Hikari: Raleway). Shipped's serif-italic accent reads as our brand.
- Product brands: the product photo's background fills the hero, product large, interaction on top (Hikari's light switch: loved, keep this kind of moment).
- "Serif and modern, not rounded" (Bonkers): light-weight modern serif, square corners everywhere, 1px rules.
- Bonkers' current logo URL is broken on their own site: check `source/` for a working logo and ask for it in the build plan.

## References
- Basics text, goal and format rank the reference grid, not only the industry (`refSignals` in `src/data/brief.ts`).
- inspo tags most Swiss-minimal sites "brutalism"; read expressiveness from maximalism, playful, loud.
- Lighting and furniture brands (Louis Poulsen, Flos, HAY, Knoll) count as e-commerce references too.

## Gotchas
- Tiendanube's CDN throttles non-browser downloads (~200 B/s): fetch images through the browser and post them to a local receiver.
- Lovable and other SPA sites render client-side: read them with `chrome --headless=new --dump-dom`.
- A Vercel project's first deploy is production and public on `<project>.vercel.app`: remove that alias.
