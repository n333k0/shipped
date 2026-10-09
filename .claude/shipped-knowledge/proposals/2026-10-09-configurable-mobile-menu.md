# Proposal: make the library mobile menu configurable

**From:** lead-developer, dry run `dryrun-brasa-norte` (2026-10-09). **Status:** waiting for the owner.

## Evidence

`technical-standards.md` says to use `library/components/mobile-menu` always. For Brasa Norte the UX spec needed things the component cannot do: extra items besides the nav links (a Reservar button, hours, WhatsApp), a breakpoint at 960px (component: 900px), a square button (component: round), a 200ms fade instead of the 750ms circular reveal, a focus trap and an aria-label that changes when open. The lead developer planned a local copy with those changes, which forks the library on every project.

## Proposed change

1. `library/components/mobile-menu/mobile-menu.js` reads options from `data-` attributes on the header: `data-mm-breakpoint`, `data-mm-shape` (round | square), `data-mm-reveal` (circle | fade), and appends any element marked `data-mm-extra` to the panel.
2. Add a focus trap, Esc to close, scroll lock and an open/closed aria-label to the component itself (accessibility belongs in the shared version).
3. `technical-standards.md`: "the mobile menu always, configured to the visual direction; extend it in the library rather than copying it".

## Accept or reject

Accept: the change is made in the library and logged in `decisions.md`. Reject: delete this file.
