# Shipped: company & website strategy

"Shipped" is a working name. Change it in `src/data/site.ts` (`brand.name`). The homepage copy itself lives in the built site (`src/components/*` and `src/data/site.ts`); this document covers the thinking behind it plus everything that isn't a web page.

---

## A. Brand positioning

| | |
|---|---|
| **Category** | Productized website studio. Fixed website projects, bought like products. |
| **Positioning** | Agency-quality websites without the agency process. |
| **Customer** | Founders, SMBs and creative businesses who need a serious website and don't want to run a 3-month vendor project to get one. Budget $2–10K. Usually redesigning, or launching something with a date attached. |
| **Promise** | Custom website. Fixed price. Known launch date. |
| **Enemy** | The *process* around websites: proposals, discovery phases, status meetings, handoffs, hourly change orders, moving launch dates. Not agencies themselves. |
| **Value proposition** | Everything an agency does that makes the site good (strategy, copy, design, build, senior taste), with none of the overhead that makes it slow and expensive. |
| **Differentiation** | vs. agencies: price, speed, certainty. vs. freelancers: a system, a team, design + dev + copy together, reliability. vs. DIY/templates: custom, strategic, done for you. vs. subscriptions (DesignJoy): you buy an outcome with an end date, not a queue. |

**Reasons to believe**
1. The price, scope and timeline are public. Nobody hides what they can deliver.
2. The build calendar is real and visible.
3. Portfolio with package and timeline printed on every project.
4. One team designs and builds in the same tool, so there's no handoff.
5. A project dashboard proves "async" works before they buy (shown on the homepage).
6. Senior creative sign-off on every project.

---

## B. Taglines

Top five, ranked:

1. **Your new website. Without the agency.** Clear category, clear enemy, works as the hero.
2. **The process is repeatable. The website isn't.** Answers the "template?" objection in seven words.
3. **Built fast. Not made cheap.** Answers the "fast = bad" objection.
4. **Come with a business. Leave with a website.** Warm, memorable, good closer.
5. **Custom website. Fixed price. Known launch date.** The offer in nine words; great for ads.

The rest:

6. Websites without the agency.
7. A better way to buy a website.
8. Great websites shouldn't take three months.
9. Fast doesn't mean rushed. Fast means systematic.
10. Send brief. We build. You launch.
11. No proposals. No hourly billing. No meetings required.
12. Websites, shipped.
13. Strategy. Copy. Design. Build. One price.
14. Buy a website like you buy software.
15. The website. Minus the project management.
16. Your website is ten days away.
17. Design and development. Same team, same week.
18. Configure it. Don't negotiate it.
19. AI speed. Human taste. *(use sparingly, internal or in the FAQ only)*
20. All of the craft. None of the calendar invites.
21. Pick a week. We'll handle the rest.
22. Agency quality, productized.

---

## C. Homepage

### Hero options

| | Headline | Sub |
|---|---|---|
| **Chosen** | Your new website. *Without the agency.* | Strategy, copy, design and build for one fixed price. Choose it online, brief us in 20 minutes, launch in 5–20 business days. |
| Alt 1 | Great websites shouldn't take *three months.* | Ours take ten days. Custom-designed, written and built for one fixed price. |
| Alt 2 | A better way to *buy a website.* | Pick a package. Pick a week. Launch on a date you know before you pay. |
| Alt 3 | Come with a business. *Leave with a website.* | Fixed scope, fixed price, no meetings required. |
| Alt 4 | Your website is *ten days away.* | Strategy, copy, design and development, from $4,000. Next build: Oct 19. |

Hero microcopy: status chip `● 2 October build slots open · next start Oct 19`; CTAs **Start your website** / **See packages**; proof line `No proposals / No hourly billing / No meetings required / From $1,750`.

### Section order, and why it differs from the brief

| # | Section | Job |
|---|---|---|
| 1 | Hero + live slot chip + media marquee | Promise, urgency, "these people make nice things" |
| 2 | Facts strip | The offer in four words |
| 3 | Selected work | Kill "is it a template?" before price is seen |
| 4 | Packages + compare table | Price early; most visitors are already shopping |
| 5 | Why this exists + agency comparison | Justify the model for the sceptics |
| 6 | Process + dashboard mock | Make "async" tangible |
| 7 | Why we're fast + quality | Answer "fast = bad?" |
| 8 | Add-ons | Handle "but I also need…" |
| 9 | Testimonials | Social proof right before commitment |
| 10 | Build calendar | Turn intent into a date |
| 11 | FAQ | Mop up objections |
| 12 | Final CTA | Close |

Changes from the brief: the two portfolio sections are merged into one, and so are the two pricing sections. Repeating them lengthens the page without adding proof. Price moves up to position 4 because transparency *is* the product: hiding price below the fold would contradict the pitch. Build-slot availability shows up three times (hero chip, header, calendar section) instead of as its own section near the top.

### CTA system

- **Primary (everywhere):** Start your website → `/start`
- **Secondary:** See packages → `#packages`
- **Package cards:** Choose Landing / Choose Website / Choose Website+ → `/start?package=…`
- **Calendar:** Reserve Oct 19 → `/start?week=…`
- **Low-intent escape hatch:** Book a 15-min call (FAQ, footer, process; never in the hero)

"See our work" is dropped as a CTA. The work is section 3, so the user scrolls into it anyway.

---

## D. Packages

| | Landing | **Website** | Website+ |
|---|---|---|---|
| Price | $1,750 | **$4,000** | from $8,500 |
| Timeline | 5 business days | **10 business days** | 15–20 business days |
| Pages | 1 | Up to 5 | Up to 12 |
| Revisions | 1 round | 2 rounds | 3 rounds |
| Support | 7 days | 14 days | 30 days |
| Payment | 100% upfront | 50 / 50 | 50 / 50 |

**Why $4,000 rather than $3,500 for Website:** the gap to Landing then reads as "4 more pages, CMS, real copywriting" rather than a discount tier, and it leaves room for one add-on to land around $5K. $3,500 is fine if you need early volume; raise it after 5 projects.

**Rough economics** (assumes a blended internal cost of about $75/hr including the senior director):

| | Hours | Cost | Price | Margin |
|---|---|---|---|---|
| Landing | 12–16 | ~$1,050 | $1,750 | ~40% |
| Website | 28–35 | ~$2,400 | $4,000 | ~40% |
| Website+ | 55–70 | ~$4,700 | $8,500 | ~45% |

Automation is where margin grows, by cutting research, setup, first-draft copy and QA hours. Don't spend that gain on volume. At 2 slots a week (about 8 a month, mix-weighted) revenue is roughly $30–40K a month.

---

## E. Add-ons

Kept to nine, in four groups, so the menu fits on one screen:

| Group | Add-on | Price | Time |
|---|---|---|---|
| Content | Extra page | +$400 | +1 day |
| | Full copywriting | +$1,200 | — |
| | Second language | +$900 | +2 days |
| Features | Advanced CMS | +$750 | — |
| | Integration (booking, CRM, newsletter, payments) | +$250 each | — |
| | Shop (≤25 products) | from +$1,500 | +5 days |
| Brand & motion | Brand identity sprint | +$2,500 | +5 days |
| | Signature motion / 3D | +$1,200 | +2 days |
| Timing | Rush (~40% faster) | +$1,000 | −40% |

Not on the menu: SEO content and custom development. These are scoped separately, because pricing them in a checkbox invites the wrong projects. After launch, Care plans start at $300/month.

---

## F. Process (customer-facing)

This is implemented on the homepage. In short:

1. **Tell us about your business** (Day 0). A 20-minute guided brief. No meeting.
2. **We figure out the website** (Days 1–2). A one-page strategy (positioning, sitemap, copy direction) that you approve with one click.
3. **We build it** (Days 3–7). Designed and built together, in the real thing.
4. **You review** (Day 8). A working site with comments left in place. One consolidated round.
5. **We launch** (Days 9–10). QA, domain, analytics, handover video. Live.

---

## G. Comparison table

Implemented on the homepage ("Why this exists"):

| | Traditional agency | Us |
|---|---|---|
| How you start | Request a proposal | Choose online |
| Price | Find out in 2 weeks | On the page. Fixed. |
| Timeline | 2–4 months | 5–20 business days |
| Meetings | Weekly, minimum | None required |
| Who you talk to | An account manager | The people building it |
| Design → development | Handoff, then wait | Same team, same week |
| Changes | Billed hourly | Clear add-ons, priced upfront |
| Launch date | "Q3, hopefully" | Known before you pay |
| Scope | Grows with every call | Written down on day one |

---

## H. Availability system

- **Unit:** a *build week* starting on a Monday. Capacity is 2 starts per week (edit `buildWeeks` in `site.ts`).
- **A Website+ project** takes one start slot and implicitly blocks capacity for 3–4 weeks. Track this internally, and reduce the following weeks' `slots` to 1 when a Website+ is booked.
- **Surfaces:** header (`● Next build: Oct 19`), hero chip (`2 October build slots open`), calendar section (6 weeks, booked ones struck through), and checkout week picker.
- **Copy rules:** state facts, never pressure. "1 slot left" is allowed because it's true. No timers, no "X people viewing", no "prices go up Friday".
- **When full:** show "Next available: Nov 2" and a "Get notified when a week opens" email capture. Don't hide the calendar.
- **Later:** drive the calendar from a database (Airtable/Supabase) that the Stripe webhook decrements, so it's always honest.

---

## I. FAQ

All 31 questions are answered on the site (`faq` in `src/data/site.ts`), grouped as: The work · Platform · Content & copy · Scope & revisions · Working together · Buying · After launch.

Policy decisions baked into those answers (check them before launch, they're commitments):
- Extra revision round: $400 (Landing) / $600 (Website, Website+).
- Client delay: the timeline pauses; after 10 business days paused, the project moves to the next open week.
- Our delay over 5 business days: refund the Rush fee if one was paid, plus a free revision round.
- Refunds: full refund up to 7 days before the build week; after that the deposit is non-refundable, but the week can be moved once for free.
- Hosting is paid by the client directly to Framer.

---

## J. Onboarding flow

The 60-question form becomes **five short chapters, about 20 minutes total**, one question per screen, with progress saved:

1. **The business** (4 min): name, URL, what you sell, who buys it, *the one thing a visitor should do* (this becomes the primary CTA), what's wrong with the current site.
2. **The taste** (3 min): paste 3 sites you love and 3 you don't, each with one optional line on why. Competitors. Three words that should describe the brand.
3. **The assets** (5 min): one drop zone for logo, fonts, colours, photos, video and existing copy. Auto-detect what's missing and say "we'll handle it" or "we'll need this by Day 2".
4. **The site** (4 min): the sitemap is pre-filled from the package ("Home, About, Services, Pricing, Contact"), and they just edit it. Integrations, CMS needs, domain registrar and access as checkboxes.
5. **Anything else** (2 min): deadline, quirks, legal constraints. **Voice-note option** on every free-text field. People say more in 60 seconds than they type in 10 minutes.

Details that make it feel exceptional:
- Pre-fill from their current URL (name, colours, social links, page list) and ask them to *confirm* instead of *type*.
- End with a summary card ("Here's what we heard"). It becomes the strategy doc's first draft.
- Send a nudge email at T−3 days if the brief isn't finished.

---

## K. Checkout flow

Implemented as `/start` (a demo; payment is stubbed):

1. **Choose package**, preselected from `?package=` and defaulting to Website.
2. **Add-ons**: anything already included is greyed out with "Included in this package".
3. **Pick build week**, preselected from `?week=` or the next open week.
4. **Details**: name, work email, company, current URL.
5. **Live summary**: total, due today, timeline in business days, estimated launch date.
6. **Reserve & pay** → Stripe Checkout (to build) → webhook creates the project, decrements the week, sends the receipt and dashboard link.
7. **Confirmation**: "You're booked", with the 5-chapter brief and **Start your brief** as the only CTA.

**Payment structure, and why:**
- **Landing: 100% upfront.** The amount is small, the project is short, and a deposit/balance cycle would be pure admin.
- **Website and Website+: 50% to reserve, 50% before launch.** The balance is charged from the review link, *before* the domain is switched. Clients never pay the second half for something they haven't seen working, and you never launch unpaid.
- **Website+ over $12K with add-ons:** offer 40/30/30 (reserve / strategy approved / pre-launch).

---

## L. Project dashboard

What the client sees (mocked on the homepage):
- Status pill: On track / Waiting on you / Paused.
- Package, start date, launch date, progress bar.
- Timeline checklist with today highlighted.
- **"Waiting on you"** card at the top, only when something is needed, with a due date.
- Latest update: one short human-written note per day.
- Files: brief summary, strategy doc, preview link, final handover.
- Feedback: link to the live preview with comment mode.
- Invoices and receipts.
- Optional "Book a call" button, deliberately small.

Build it with a Notion / Softr / Framer page per client first. Make it a real app only once the process is stable.

---

## M. What to automate

| Stage | Automation |
|---|---|
| Purchase | Stripe webhook → create project record, dashboard, shared folder, Slack channel; decrement calendar; send receipt |
| Onboarding | Brief reminders; asset completeness check; pre-fill from current URL |
| Research | Agent crawls the current site + competitors + reference sites → audit (structure, messaging, SEO, tech) |
| Strategy | First-draft sitemap, messaging hierarchy, page-by-page content requirements |
| Copy | First-pass copy per page in the client's voice (seeded from brief + voice notes) |
| Design system | Starter tokens (type scale, spacing, colour) from brand assets; component library setup in Framer |
| Production | Project scaffolding, CMS collections, form + analytics wiring, redirects map |
| QA | Link check, Lighthouse, accessibility scan, meta/OG tags, form submissions, responsive screenshots at 5 widths, spellcheck/copy-consistency |
| Comms | Daily update drafts from task status, for a human to edit and send |
| Launch | DNS checklist, post-launch monitoring, 7/14/30-day check-in emails, Care plan offer |

---

## N. Where humans are essential

1. **Reading the brief.** Deciding what the site is *for* and which problem it really solves.
2. **Strategy sign-off.** Positioning and sitemap, before any design.
3. **Creative direction.** Concept, type pairing, art direction, layout rhythm, imagery choices. This is the product.
4. **Copy edit.** AI drafts, humans make it sound like a person with taste.
5. **Pre-review pass.** A senior person looks at every page before the client does. Nothing goes out unreviewed.
6. **Feedback interpretation.** Clients say "make it pop". Humans translate that.
7. **Scope calls.** Saying "that's an add-on" kindly and early.
8. **Launch go/no-go.**

---

## O. Visual direction

See `design.md`.

---

## P. Conversion improvements

1. **Real portfolio with package and day count on every project.** The single biggest lever; replace the concept sites as real projects ship.
2. **Loom-style 90-second "watch a project happen" video** on the process section.
3. **Live calendar** connected to real bookings, so it's honest by construction.
4. **"Not sure which package?" quiz** (3 questions → recommendation) on the packages section.
5. **Sample deliverables**: a real (anonymised) strategy doc and dashboard screenshot.
6. **Pay-later option for the 50%** via Stripe (Klarna/Affirm) for SMBs.
7. **Exit-intent email capture** offering the strategy-doc template, not a discount.
8. **Founder face and name** somewhere: "Every site is directed by [name]". Trust jumps when there's a person.
9. **Case-study pages** for clicks deeper, using the same 5-field structure and then the visuals.

---

## Q. Risks and rules

| Risk | Rule |
|---|---|
| **Scope creep** | Scope is the package checklist and nothing more. Anything else becomes an add-on, quoted in the dashboard the same day. "Page" is defined in the FAQ. |
| **Late clients** | The build week starts only once the brief is complete (due T−2 days). The timeline pauses on missing input; after 10 paused business days the project moves to the next open week. |
| **Too many revisions** | Rounds = one consolidated list from one decision-maker. Extra rounds are priced. Comments arrive in the tool, not by email. |
| **Copy delays** | Default to writing the copy ourselves (included in Website). Client copy is due with the brief or we write it. |
| **Technical complexity** | Integrations limited to a known list of tools with native Framer support. Anything needing custom code is scoped separately. |
| **E-commerce** | Max 25 products on the add-on. Larger catalogues, subscriptions or custom checkout get referred out or scoped separately. |
| **Custom development** | Not sold in packages. Ever. Partner with a dev shop and take a referral fee. |
| **Timeline promises** | Promise *business days from a complete brief*, never calendar dates on the marketing site. Keep one buffer day in every package. |
| **Overbooking** | The calendar is capacity. Website+ blocks following weeks. Don't add slots without adding a senior director. |
| **Bad-fit clients** | Allow a refund before the build week starts. The 15-min call is for fit-checking, not selling. |
| **Placeholder content** | Never present concept sites as client work, and never ship the placeholder testimonials. Real quotes and real outcomes only. |

---

## R. MVP: launch in two weeks

**Build:**
1. This homepage, with real work (or 3 labelled concept sites) and real or zero testimonials.
2. Three products as **Stripe Payment Links** (Landing full, Website deposit, Website+ deposit). `/start` posts to them, or swap the summary button for the link.
3. Calendar as a hand-edited `buildWeeks` array. Update it when someone pays.
4. Onboarding: **Tally or Typeform** with the 5 chapters and file upload, linked from the Stripe success page.
5. Dashboard: **one Notion page per client** from a template (status, timeline, updates, links).
6. Production: **Framer** + a reusable component starter file.
7. Workflow: **Zapier/Make**. Stripe paid → create Notion page + Slack channel + email with brief link. Plus a QA checklist template.
8. A Cal.com link for the optional call.

**Don't build yet:**
- A custom client portal/app
- A live calendar database
- Account logins
- A subscription or retainer product (except a simple Care plan invoice)
- A research or copy agent pipeline. Run the prompts by hand until you've done 10 projects and know what's repeatable.
- Webflow/Shopify/Next.js delivery options
- Blog, resources, case-study CMS
- Multiple languages on your own site

Ship the simplest thing that takes money and delivers one great website. Automate the parts you've done five times.
