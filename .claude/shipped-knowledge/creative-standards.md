# Creative standards

What separates a Shipped site from generic website output. Sources: the former `shipped-delivery/SITE.md` (owner corrections on real test briefs), `design.md` principles, `strategy.md` §N–O. Category specifics live in [website-archetypes/](website-archetypes/README.md); what to avoid in [anti-patterns.md](anti-patterns.md).

## The standard

Working documents (`direction/`, `review/`) are written in English for the team; anything the client will read (copy, PDF) is in the client's language. Sources are tagged inline as `[source: brief.visual.sliders]`, `[source: ideal]`, `[source: archetype food]`, `[source: own knowledge]`.

The client already told us what they want; the job is to read it precisely and then go further than they would dare alone. Every site is specific to one business: a lighting brand, an architecture practice and an AI tool never look like variations of one template. Reuse infrastructure, never the look. Every visual decision names its source (the brief, a reference, the ideal, their brand, a category profile); "it looked nice" is not a source.

## Reading the brief into decisions

| Brief field | Decides | How |
|---|---|---|
| Aesthetic ideal (`visual.aspirational`, `ideal_why`) | The bar: craft, image size, pacing, type scale | Measured in `captures/ideal-*`; `ideal_why` says what to match first; outranks references when they disagree |
| Competitors (`competitors`, `competitors_diff`) | The field to stand apart from | What they share is what v1 visibly avoids in the first screen |
| Closest reference | Type scale, weight, radius, density, rhythm | Measured from `refs/<slug>.md`; their system, not their brand |
| Other references + traits | What else to borrow | Only the traits they ticked |
| Sliders | Mode, contrast, colour and type contrast | ≤40 leans left, ≥60 right, between is balanced |
| Creativity (`safe_experimental`) | How far the signature moment and v2/v3 go | Always one signature moment; above 60 it can be unusual |
| Motion | Amount of animation | still · subtle (fades, hover, at most one scroll-linked change) · dynamic (scroll-driven scenes) · wild (interactive) |
| Typeface choice + their fonts | Display/text pairing | Inside their own brand's type genre |
| Locked assets | What stays exactly as is | Logo, colours, typography, messaging |
| Goal | What every page ends on | The primary CTA, repeated |
| `inferred.imagery` | Photo-led or type-led | Photo-led: their photos full-bleed. Type-led: big type, line art, generative canvas |
| `inferred.line_art` / `three_d` | Hairline figures / one 3D object | Techie briefs get Hairline in one version; 3D only in v2 or v3 |

## Ideal and competitors

- **The bar.** Keep the ideal's `desktop.png` and `tokens.md` open while designing. Its h1 and body size, section heights, image-to-text ratio and white space are the floor. The brand stays the client's.
- **Seeding.** When the ideal's layout fits the sitemap, v1 may start from its section order and rhythm, rebuilt in our own code with the client's type, colour, copy and imagery. No copied text, images, logos or signature illustrations.
- **The field.** Name what the competitors share; v1 differs in at least one thing visible in the first screen.
- **When captures failed.** A row marked NOT CAPTURED in `captures/summary.md`: read the site another way (WebFetch on the URL or its current domain, inspo `get_screen` when available, your own knowledge), say which evidence you used, and list the dead URL as a question for the client.
- **No ideal and no references.** The category profile and the sliders set the bar; propose a concrete type scale and spacing and mark them for the owner to confirm at plan approval.
- **Template choice.** Ideal photo-led and spacious → large imagery, few blocks per screen. Type-led → typographic hero, line art or a generative visual. One long scroll scene → v2 takes that structure. No ideal → the closest reference is the bar.

## Typography

Start from the client's own typefaces (`source/`, `brand.font_names`). When upgrading, stay in their genre (a grotesk brand gets a better grotesk). Shipped's pairing (Inter Tight + Instrument Serif italic) belongs to Shipped and never appears on a client site. With no fonts and no logo to read a genre from, choose from the category profile, the sliders and the brief's typeface choice (`mix` means a serif with a sans in the client's register, not Shipped's pair), and name the faces for plan approval.

## Quality floor (every version)

- Animated phone menu, a header that changes on scroll, hover states on every link and button.
- A hero entrance and section reveals; `prefers-reduced-motion` respected.
- Hero headline at most three lines on desktop, breaks set by hand; phone line breaks set on purpose.
- Imagery large: at least one full-bleed image or generative visual above the fold in v1 or v2.
- Logos and images keep their ratio.
- Real content only. Numbers, claims, testimonials and credentials come only from the client; illustrative widgets say so and carry no invented figures.

## Variations

Three home pages linked by the Shipped dot switcher (on a Landing, three versions of the one page):

- **v1 · the brief, read straight** (all pages).
- **v2 · immersive:** more image, more motion, full-screen sections, a living background.
- **v3 · the bold idea:** one concept taken all the way.

Each must look like it could win on its own, not v1 with a filter. Selling sites keep v1 calm (see the e-commerce profile).

## Colour and contrast

Check the palette's contrast before giving colours roles: body text needs 4.5:1, large text (≥ 24px, or ≥ 19px bold) and UI elements 3:1. A brand colour that fails for small text becomes a fill for large labels, an underline or an accent, never small text.

## Motion

Motion rewards attention; it never stands between the visitor and the content. Each effect has a reason tied to the brand or the goal, and an off switch under reduced motion.
