# Reading the brief into a site

The client already told us what they want; the job is to read it precisely and then go further than they would dare alone. Each brief field maps to decisions:

| Brief | Decides | How |
|---|---|---|
| Closest reference | Type scale, weight, radius, density, layout rhythm | Measured from `refs/<slug>.md`, adapted: their system, not their brand |
| Other references + traits | What else to borrow | Only the traits they ticked (typography, photography…) |
| Sliders | Mode, contrast, colour and type contrast | ≤40 leans left, ≥60 leans right, between is balanced |
| Creativity (`safe_experimental`) | How far the signature moment and v2/v3 go | Always one signature moment; above 60 it can be unusual |
| Motion | Amount of animation | still · subtle (fades, hover) · dynamic (scroll) · wild (interactive) |
| Type choice | Display/text pairing | Inside their own brand's type genre |
| Locked assets | What stays exactly as is | Logo, colours, typography, messaging |
| Goal | What every page ends on | The primary CTA, repeated |
| `inferred.imagery` | Photo-led or type-led | Photo-led: their photos full-bleed, large. Type-led: big type, line art, generative canvas |
| `inferred.line_art` | Hairline figures | Techie briefs get Hairline in at least one version |
| `inferred.three_d` | One 3D object | Through `img2threejs`, in v2 or v3 only |

## Typography

Start from the client's own typefaces (`source/`, `font_names`). When upgrading, stay in their genre (a grotesk brand gets a better grotesk). Shipped's pairing (Inter Tight + Instrument Serif italic) belongs to Shipped.

## Quality floor (every prototype, every version)

- Animated phone menu (`library/components/mobile-menu`), header that changes on scroll, hover states on every link and button.
- An entrance on the hero (lines rise, image settles) and reveals as sections arrive; `prefers-reduced-motion` handled.
- Hero headline three lines at most on desktop: write the line breaks; shrink or rebalance before letting it wrap.
- Imagery large: at least one full-bleed image or generative visual above the fold in v1 or v2.
- Logos and images keep their ratio: when CSS sets only height on an `<img>` with width/height attributes, add `width: auto`.
- Real content only: their copy (polished), products, prices, photos. Numbers and claims come only from the client; illustrative widgets say "ejemplo" and carry no invented figures.

## Variations

Three versions of the home page, linked by the Shipped dot switcher:

- **v1 · the brief, read straight:** what the answers literally ask for. All pages.
- **v2 · immersive:** more image, more motion, the client's own type genre; full-screen sections, parallax, a living background.
- **v3 · the bold idea:** one concept taken all the way (the cursor is the lamp; a terminal; Hairline line art for techie brands; a 3D object when `inferred.three_d`).

Each version must look like it could win on its own, not like v1 with a filter.

## Build and check

- Static HTML/CSS/JS from a `build-site.mjs` in the client folder; variations as `site/v2/index.html`, `site/v3/index.html`; page JS in a module or IIFE.
- `node pipeline/review-site.mjs <folder>/site` checks overflow, headline lines, broken and stretched images, our own fonts, tap targets, the phone menu and console errors at 1440px and on a 390px touch phone. All clear, then look yourself.
- Heroes: cap `min-height` (e.g. `min(100svh, 900px)`).
