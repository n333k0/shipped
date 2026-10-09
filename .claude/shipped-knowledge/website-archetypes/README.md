# Website archetypes

One shared production flow; each category adds a short profile of structure, conversion, content, design language, technical needs and QA. The categories are the brief's own (`src/data/brief.ts` `industries`); `other` uses the closest profile named in `direction/strategy.md`. Packages (Landing, Website, Website+) set the scope; the category sets the shape.

| id | Profile | Job of the site |
|---|---|---|
| `saas` | [SaaS / AI / Tech](saas.md) | Explain the product in one screen and earn a sign-up or demo. |
| `creative` | [Creative / Studio / Agency](creative.md) | Show the work at full size and make the studio's point of view felt. |
| `services` | [Professional services](services.md) | Make an expert credible and easy to contact. |
| `ecommerce` | [E-commerce / Product](ecommerce.md) | Sell: products, prices and the buy button calm and visible on every screen. |
| `hospitality` | [Hospitality](hospitality.md) | Make a place felt, then make booking effortless. |
| `architecture` | [Architecture / Real estate](architecture.md) | Let the projects speak at full scale. |
| `health` | [Health / Wellness](health.md) | Build trust and make the first appointment or purchase easy. |
| `fashion` | [Fashion / Beauty](fashion.md) | Sell a look and a feeling, with products one tap away. |
| `culture` | [Culture / Art / Media](culture.md) | Make the programme or the publication easy to explore. |
| `food` | [Food / Beverage](food.md) | Make it look delicious and make the next step obvious (buy, find, book). |
| `finance` | [Finance / Web3](finance.md) | Earn trust fast and explain clearly. |
| `personal` | [Personal brand](personal.md) | Put a person and their work forward. |

Mapping of common requests: portfolios → `personal` or `creative`; wellness and beauty → `health` or `fashion`; editorial publications → `culture`; landing pages and launches → the Landing package inside any category; Shopify experiences → `ecommerce` or `fashion`.

**Adding a category:** add it to `industries` in `src/data/brief.ts` (and references for it, see project-learnings "References"), add `<id>.md` here from any existing profile, and a row above.
