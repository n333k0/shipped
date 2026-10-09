# Anti-patterns

What we avoid, each with the positive move to make instead. Sources: owner corrections ([project-learnings.md](project-learnings.md)), `design.md`, `strategy.md` §Q.

## Design

| Avoid | Do instead |
|---|---|
| The interchangeable AI landing: centred hero, gradient blob, three rounded feature cards, logo row, testimonial carousel | Compose from the brand: its product, its type, its photography, the ideal's rhythm |
| Large radii and soft shadows on everything | Radius and depth chosen from the closest reference and the client's brand ("serif and modern, not rounded" means square corners and 1px rules) |
| Effects without a reason (parallax, particles, glass) | One signature moment tied to the brand or goal; everything else quiet |
| Shipped's own type pairing (Inter Tight + Instrument Serif italic) on a client site | The client's typefaces, or a better one in the same genre |
| Headlines wrapping to 4–5 lines | Three lines maximum on desktop, breaks set by hand |
| Small imagery in a photo-led brand | Their photography large and full-bleed |
| Effects that hide products or prices on a selling site | A calm v1 store; experiments in v2/v3 with products one tap away |
| Copying the ideal's look | Borrowing its level and rhythm, rebuilt in the client's brand |

## Content

| Avoid | Do instead |
|---|---|
| Invented testimonials, numbers, credentials, client logos | Client-supplied facts only; mark proposals as proposals |
| Empty superlatives ("cutting-edge", "world-class", "seamless") | Concrete statements in the client's voice |
| "Lorem ipsum" left anywhere | Real copy, or a labelled placeholder that names what is missing |

## Build and operations

| Avoid | Do instead |
|---|---|
| Declaring a check passed without running it | Run it; quote the output |
| Silently simplifying a design because it is hard to build | Document the limitation in `review/` or `direction/tech.md` and propose an alternative |
| Loops of fixes that never converge | Three correction rounds, then escalate to the owner with the evidence |
| Client material in the public repo | `../remoto-studio/clients/` only |
| Internal tools as pages of the public site | Local scripts (e.g. `npm run curate`) |
| Treating a lead's brief as a paid order | Build starts only on an authorized project (`production.json`) |
