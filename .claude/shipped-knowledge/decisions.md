# Decisions

Why the standards and the production system are the way they are. Newest at the bottom. Open decisions are listed last.

| Date | Decision | Why |
|---|---|---|
| 2026-10-08 | Client material lives in a private repo (`remoto-studio`), the pipeline in the public `shipped` repo | The shipped repo is public; real brands, photos and briefs must not be published |
| 2026-10-08 | The aesthetic ideal and competitors weigh more than any single reference | The owner: their data must drive the direction and the template choice |
| 2026-10-08 | References: only inspo's homepage/editorial bar and sites near it, best of the chosen category first | The owner liked inspo's featured sites and wanted that level in every category |
| 2026-10-08 | Three variations per prototype (v1 brief, v2 immersive, v3 bold idea) | First prototypes felt too simple; one version hid the range |
| 2026-10-09 | One production system in three layers: workflow (`skills/shipped-production`), agents (`.claude/agents/`), shared knowledge (`.claude/shipped-knowledge/`) | Each layer can be improved alone; agents stay short and point to knowledge instead of copying it |
| 2026-10-09 | The orchestrator is the main session running the skill, not a subagent | Only the main session can dispatch subagents and talk to the owner; subagents return to it |
| 2026-10-09 | State in a JSON file per project (`production.json`) driven by a small script, no database or dashboard | Resumable, inspectable and diffable; enough for one project at a time |
| 2026-10-09 | Per-project folders give isolation; no git worktrees for builds | Each project writes only inside its own folder in remoto-studio; parallel agents write to different files |
| 2026-10-09 | A lead's brief may be planned (proposal, PDF) but not built until the project is authorized | No payment confirmation exists yet; production must never treat an inquiry as an order |
| 2026-10-09 | Human gates: plan approval before build, creative approval before delivery | `strategy.md` §N: strategy sign-off and the pre-review pass are human |
| 2026-10-09 | At most three correction rounds per review, then escalate | Prevents fix loops that never converge |

## Open

- **Delivery tool:** Framer (`strategy.md` §R) or the static build the pipeline produces.
- **Payment confirmation:** which provider, and whether its webhook should authorize a project automatically.
- **Brief intake:** `briefEndpoint` is empty; briefs arrive as JSON files.
- **Typeface "mix" preview** in the brief (`src/data/brief.ts` typefaces) is drawn in Instrument Serif italic, Shipped's own accent, which client sites never use. Change the preview or accept the mismatch.
- **Restaurant goal:** the goal list has no "reserve a table"; restaurants pick "Get calls and bookings" (`book_call`), which the profiles read as reservations. Add a goal or keep the mapping.
