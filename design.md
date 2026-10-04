# Design direction

Visual reference: superside.com (dark pine + spark lime, big type, rounded media tiles). We borrow the mood, not the brand. Name, logo, copy, layout and imagery are our own: all work shown is in-house concept sites (`mockups/sites.html`).

## Principles

1. **The site is the portfolio.** Every section should look like something a client would pay for.
2. **Operational info looks operational.** Prices, days, slots and status are set in mono caps with status dots, like a product UI, not an ad.
3. **One idea per section.** A headline you can read in 2 seconds, one supporting paragraph, then proof.
4. **Calm confidence.** Restraint over decoration. Motion is there to reward attention, not demand it.
5. **No fake urgency.** Scarcity is the real calendar, nothing else.

## Colour

| Token | Hex | Use |
|---|---|---|
| `pine-900` | `#0a211f` | Page background |
| `pine-950` | `#061412` | Alternate dark bands (process, calendar, footer) |
| `pine-800` | `#0e2d2a` | Cards on dark |
| `spark` | `#d8ff85` | Primary CTA, accents, "available" dots |
| `paper` | `#f3f1ea` | Text on dark; light editorial bands (packages, add-ons) |
| `ink` | `#0b1513` | Text on light |
| `booked` | `#ff8a65` | "Booked" status and placeholder tags only |

Dark and light bands alternate to pace the scroll: dark (promise, proof) → light (price) → dark (story, process) → light (add-ons) → dark (trust, calendar, FAQ) → spark (close).

## Type

- **Inter Tight** 500, tight tracking (−3.5%), 0.95 line-height for display headlines.
- **Instrument Serif Italic** for the second half of headlines: the human, editorial voice next to the product voice. One accent phrase per headline, max.
- **JetBrains Mono** 11px caps, +14% tracking, for labels, prices, timelines and statuses.

## Layout

- 1280px max container, 16px gutters on mobile.
- Headlines left-aligned (hero centred). Generous vertical rhythm: 96–128px between sections.
- 22–28px radii on cards and media; pill buttons.

## UI components

- **Status chip**: pulsing spark dot + mono caps (`2 OCTOBER BUILD SLOTS OPEN`).
- **Price card**: name, one-line pitch, price, mono timeline, CTA, then the checklist. The featured card is inverted (dark on light band) and slightly taller.
- **Week tile**: booked = struck through, coral dot, dimmed; available = spark dot; next open week = spark outline.
- **Dashboard mock**: shows the async promise rather than describing it.

## Motion

- Hero media marquee (60s loop, pauses on hover).
- Scroll reveals: 24px rise + fade, 0.8s ease-out. Content is visible without JS.
- Pulse on availability dots only.
- Everything respects `prefers-reduced-motion`.

## Imagery direction (for the real launch)

Real client sites shown on real devices in warm, natural light, plus close crops of interactions. Avoid stock "team high-fiving" photography and abstract AI gradients. If there's no portfolio yet, build 3 self-initiated concept sites and label them as concepts.
