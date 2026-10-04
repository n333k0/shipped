# Shipped by RemotoLabs: productized website studio

Marketing site + checkout demo, built with Astro 7 and Tailwind 4.

```sh
npm install
npm run dev       # http://localhost:4321
npm run build     # static site in dist/
npm run preview   # serve the build
```

## Where things live

| What | File |
|---|---|
| Brand name, prices, add-ons, build weeks, FAQ, work, testimonials | `src/data/site.ts` |
| Homepage sections | `src/components/*.astro`, assembled in `src/pages/index.astro` |
| Checkout / configurator | `src/pages/start.astro` |
| Colours, fonts, shared utilities | `src/styles/global.css` |
| Strategy (positioning, economics, onboarding, risks, MVP) | `strategy.md` |
| Visual direction | `design.md` |
| Original brief | `prompt.md` |
| RemotoLabs logo (mask PNG) | `public/brand/remotolabs.png`, used by `ParentLogo.astro` |
| Concept site mockups (currently unused) | `mockups/sites.html`, render with `./scripts/render-mockups.sh`, show with `Mockup.astro` |

Live: https://n333k0.github.io/shipped/ (deploys on every push to `main` via `.github/workflows/deploy.yml`).

Weekly upkeep: update `booked` in `buildWeeks` (`src/data/site.ts`). The header, hero chip, calendar and checkout all read from it.

## Before going live

- [ ] Swap the placeholder device shots in `public/placeholder/` (from superside.com, layout only) for your own work: hero tiles in `Hero.astro`, projects in `work` (`site.ts`), plus `WhyFast.astro` and `FinalCta.astro`.
- [ ] Replace the placeholder testimonials in `site.ts` with real quotes.
- [ ] Set the real brand name, email and call link in `brand`.
- [ ] Wire "Reserve & pay" in `start.astro` to Stripe (Payment Links or a Checkout Session endpoint).
- [ ] Review the policy commitments in the FAQ (refunds, delays, revision pricing). See strategy.md §I.
