# Business

## What we sell

Sources: `src/data/site.ts` (`packages`, `addOns`, `faq`, `process`), `strategy.md` §A, §D–F.

| Package | Price | Time | Scope | Payment |
|---|---|---|---|---|
| Landing | $1,750 | 5 business days | 1 page, up to 8 sections | 100% upfront |
| Website | $4,000 | 10 business days | up to 5 pages, 30 sections, CMS, forms + 2 integrations, copy first draft by us | 50% / 50% before launch |
| Website+ | from $8,500 | 15–20 business days | up to 12 pages, 70 sections, positioning, full copy, art direction, design system, advanced motion and CMS, 30 days support | 50% / 50% |

- A **section** is one full-width block on a page; header and footer do not count (the package sitemaps in `site.ts` list 8 sections for Landing without them; inferred, not stated).
- Copy: Landing includes copy assistance (we draft from the client's information), Website a first draft by us, Website+ full copywriting. The copy stage always runs; the package sets how much we write.
- Extra page +$400 (6 sections), extra section +$150. Other add-ons (copy, CMS, integrations, shop, brand sprint, signature motion/3D, rush) are priced in `addOns`.
- **Paying as the brief is sent takes 10% off** (`checkout.payNowOff`); today they pay the package deposit, add-ons ride on the second payment.
- Customer: founders, SMBs and creative businesses, budget $2–10K, usually redesigning or launching against a date (`strategy.md` §A).

## Promises already public (never contradict them)

From the FAQ and process in `site.ts`:

- Fixed price; anything extra is quoted before it is done.
- Day 1–2: a one-page plan (positioning, sitemap, copy, visual direction), approved with one click, before design.
- Unlimited revisions inside the review window (2 / 3 / 5 business days) and within the approved direction.
- The second half is paid from the review link, after the client has seen the site working.
- Full refund up to 7 days before the build week; one free move to another open week after that.
- The client owns the site, content, design files and domain.
- No passwords during onboarding.

## How a project flows

1. Brief at `/start/` (six stages: Basics, Direction, Content, Pages, Features, Review), ending in **pay now (10% off)** or **send and book a call**. Schema: `docs/build-flow.md`.
2. The client receives the brief PDF (their brief told back as a story, with the roadmap).
3. Build week: plan → design and build together → review link → launch.
4. Human checkpoints (`strategy.md` §N): reading the brief, strategy sign-off, creative direction, copy edit, pre-review pass, feedback interpretation, scope calls, launch go/no-go.

## Rules that protect the business (`strategy.md` §Q)

- Scope is the package checklist; anything else becomes an add-on, quoted the same day.
- The build week starts only from a complete brief; timelines are business days from a complete brief.
- Revisions stay within the direction approved on day 2.
- E-commerce add-on: up to 25 products; larger catalogues, subscriptions or custom checkout are scoped separately or referred out.
- Never present concept sites as client work; never ship placeholder testimonials.

## Open decisions

- **Payment provider and booking link** are not connected (`checkout.links` and `brand.callLink` are empty): until they are, no brief is a paid order by itself.
- **Brief storage**: `briefEndpoint` is empty; briefs arrive as downloaded JSON.
