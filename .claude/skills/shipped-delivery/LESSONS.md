# Lessons

One line per correction from the owner, written as what to do. Newest at the bottom. When a lesson is fully absorbed into a script or rule, delete it here.

## PDF
- The PDF is client-facing: build spec, flags, "template" and add-on maths live in `internal.md`.
- Tell the brief back as a story that makes the client feel understood and makes Shipped look valuable.
- Flow sections one after another; only the cover and back cover get their own page.

## Site
- Use the client's typefaces (a lighting brand on Raleway got serif-italic and hated it). Shipped's serif-italic accent reads as our brand.
- Product brands: the product photo's background fills the hero, product large, interaction on top (a light switch on a lamp brand: loved).
- "Serif and modern, not rounded": light-weight modern serif, square corners everywhere, 1px rules.
- Find the real logo before building: when the main site's is broken, their app or another subdomain often has it.
- Hero headlines stay within three lines on desktop; set the breaks by hand.
- Pages felt too simple: ship three variations, more imagery, more motion and transitions, top quality by default.

## References
- Once a category is picked, every reference comes from it, filters and "more like" included. Basics text reorders inside it.
- inspo tags most Swiss-minimal sites "brutalism"; read expressiveness from maximalism, playful, loud.
- Lighting and furniture brands (Louis Poulsen, Flos, HAY, Knoll) count as e-commerce references too.
- The owner hides references at `/curate/`; `src/data/ref-exclude.json` is theirs.

## Brief UI
- The "Your site" panel is a small symbolic object (isometric page stack), not a detailed wireframe list.

## Gotchas
- Tiendanube's CDN throttles non-browser downloads (~200 B/s): fetch images through the browser and post them to a local receiver.
- Lovable and other SPA sites render client-side: read them with `chrome --headless=new --dump-dom`.
- A Vercel project's first deploy is production and public on `<project>.vercel.app`: remove that alias.
- Headless Chrome windows can't go below ~500px wide; review phones through the DevTools protocol (`review-site.mjs`) or a 390px iframe.
- The shipped repo is public: client prototypes, photos and briefs stay in `../_tests/`, never in the repo.
