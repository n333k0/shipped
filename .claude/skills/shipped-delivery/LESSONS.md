# Lessons

One line per correction from the owner, written as what to do. Newest at the bottom. When a lesson is fully absorbed into a script or rule, delete it here.

## PDF
- The PDF is client-facing: build spec, flags, "template" and add-on maths live in `internal.md`.
- Tell the brief back as a story that makes the client feel understood and makes Shipped look valuable.
- Flow sections one after another; only the brand pages (cover, "en piezas", roadmap, back cover) get their own page.
- The PDF also sells: it carries the roadmap (dates, who does what, when they pay) and branded pages with "más locura" than a plain report.

## Site
- Use the client's typefaces (a lighting brand on Raleway got serif-italic and hated it). Shipped's serif-italic accent reads as our brand.
- Product brands: the product photo's background fills the hero, product large, interaction on top (a light switch on a lamp brand: loved).
- "Serif and modern, not rounded": light-weight modern serif, square corners everywhere, 1px rules.
- Find the real logo before building: when the main site's is broken, their app or another subdomain often has it.
- Hero headlines stay within three lines on desktop; set the breaks by hand.
- Pages felt too simple: ship three variations, more imagery, more motion and transitions, top quality by default.
- Stores sell first: v1 of an e-commerce site is the safe, calm store; experiments go to v2/v3 and never hide products or prices.
- The phone hero copy should read as a shape (Shipped's subtitle stacks into a three-line triangle); set phone line breaks on purpose.

## References
- Once a category is picked, every reference comes from it, filters and "more like" included. Basics text reorders inside it.
- inspo tags most Swiss-minimal sites "brutalism"; read expressiveness from maximalism, playful, loud.
- Lighting and furniture brands (Louis Poulsen, Flos, HAY, Knoll) count as e-commerce references too.
- The owner hides references with `npm run curate` (local, 127.0.0.1); `src/data/ref-exclude.json` is theirs.
- Internal tools run locally, never as pages of the public site.
- Only the best show, and the best of the chosen category lead: inspo's homepage and editorial collections are the bar (`scripts/ref-quality.json`); inspo sites join the pool only on the bar or near it (`refs-universe` → `refs-quality` → `refs-discover` → `refs.mjs`), each ref carries `q`, and the brief ranks by it inside the category.
- Thin categories (services, hospitality, food, health) get hand-picked sites: `scripts/refs-manual-urls.json` → `scripts/refs-add.mjs`.

- The aesthetic ideal and competitors drive the direction, not only the picked references: capture them (`capture-brief.mjs`) and name the bar and the field in `direction.md`.

## Brief UI
- The "Your site" panel is a small symbolic object (isometric page stack), not a detailed wireframe list.

## Gotchas
- Tiendanube's CDN throttles non-browser downloads (~200 B/s): fetch images through the browser and post them to a local receiver.
- Lovable and other SPA sites render client-side: read them with `chrome --headless=new --dump-dom`.
- A Vercel project's first deploy is production and public on `<project>.vercel.app`: remove that alias.
- Headless Chrome windows can't go below ~500px wide; review phones through the DevTools protocol (`review-site.mjs`) or a 390px iframe.
- The shipped repo is public: client prototypes, photos and briefs live in the private `../remoto-studio/clients/`.
- Some brand sites (Aesop, Vitra) sit behind a bot wall and capture as "Just a moment...": take them from inspo `get_screen` or the client's screenshots.
