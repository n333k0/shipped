# Shipped knowledge

The shared ground every production agent stands on. Facts here come from the repository; each section names its source. Anything not established in a source is marked **Assumption** or **Open decision**. Owner: the founder (creative authority). Agents read these files; they never rewrite them without approval (see "Changing the system" below).

| File | What it holds |
|---|---|
| [business.md](business.md) | What Shipped sells, to whom, at what price and pace, and the promises already made publicly |
| [creative-standards.md](creative-standards.md) | What premium means here: the quality floor, how a brief becomes a direction, typography, ideal and competitors, variations |
| [technical-standards.md](technical-standards.md) | Stack, folder layout, scripts, checks, deployment and safety rules |
| [website-archetypes/](website-archetypes/README.md) | One profile per business category of the brief: structure, conversion, content, design language, QA |
| [approved-patterns.md](approved-patterns.md) | Proven components, patterns and effects to start from |
| [anti-patterns.md](anti-patterns.md) | Decisions we avoid in design, build and communication |
| [project-learnings.md](project-learnings.md) | Corrections from the owner, one line each, newest last |
| [decisions.md](decisions.md) | Why the important standards and architecture were chosen, and what is still open |

## In one paragraph

Shipped is RemotoLabs' productized website studio: custom websites bought like products, with a public price, fixed scope and a known launch date (Landing $1,750 / 5 business days, Website $4,000 / 10, Website+ from $8,500 / 15–20). The client configures the site in a six-stage brief at `/start/`; everything after that is ours, asynchronous by default, with a call only when it helps. AI does the repeatable production work; a human owns creative direction, strategy sign-off, the pre-review pass and launch go/no-go. Sources: `strategy.md` §A, §N; `src/data/site.ts` `packages`.

## Changing the system

Agents may **propose** changes to knowledge, agent instructions or the workflow; they never apply them to their own rules. A proposal goes to `proposals/<date>-<topic>.md` in this folder: what to change, the evidence (the project, the correction, the screenshot), and the exact diff. The owner accepts it (the change is applied and a line goes to [decisions.md](decisions.md) or [project-learnings.md](project-learnings.md)) or rejects it (the file is deleted). `/shipped-production refine` drafts proposals from recent projects.
