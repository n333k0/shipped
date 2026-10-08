// Breadcrumb-led (nav) · N8 Breadcrumb
// Breadcrumb-led nav - the page tells you exactly where you are before it tells you where else to go. Reach for it on deep hierarchies (docs, atlases, catalogue subsections). The wordmark stays in the path; actions sit to the right.
// Source: inspo reference components (https://github.com/Nutlope/inspo, MIT)

/* inspo-reference-component
 * type= nav | genre= editorial | theme= Inspo-paper
 * archetype= N8 Breadcrumb-led | diversification= path is the primary
 *   nav, top-level links collapse to actions
 * states= default · hover · focus-visible
 * contrast= pass (46-50)
 */

/**
 * Breadcrumb-led nav - the page tells you exactly where you are
 * before it tells you where else to go. Reach for it on deep
 * hierarchies (docs, atlases, catalogue subsections). The wordmark
 * stays in the path; actions sit to the right.
 */
export function NavBreadcrumb() {
  return (
    <header className="border-y rule bg-[var(--color-bg)] px-8 py-5 sm:px-14">
      <div className="flex flex-wrap items-baseline justify-between gap-y-3 gap-x-6">
        <nav aria-label="Breadcrumb" className="flex items-baseline gap-2 text-meta">
          <a href="#" className="font-display normal-case tracking-tight text-base text-[var(--color-fg)] hover:text-[var(--color-accent)]">
            Inspo<span className="text-[var(--color-accent)]">.</span>
          </a>
          <span aria-hidden className="text-[var(--color-fg-muted)]">/</span>
          <a href="#" className="hover:text-[var(--color-accent)]">
            Components
          </a>
          <span aria-hidden className="text-[var(--color-fg-muted)]">/</span>
          <span className="text-[var(--color-fg)]">Pricing</span>
          <span aria-hidden className="text-[var(--color-fg-muted)]">/</span>
          <span className="text-[var(--color-fg-muted)]">Toggle</span>
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="text-meta border rule px-3 py-1.5 transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
          >
            Copy code
          </button>
          <button
            type="button"
            className="text-meta border rule px-3 py-1.5 transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
          >
            Open in MCP
          </button>
        </div>
      </div>
    </header>
  );
}


/* tokens
{
  "needs": [
    "--color-accent",
    "--color-bg",
    "--color-fg",
    "--color-fg-muted"
  ],
  "aliasBlock": "/* Paste into :root if your tokens are named for their roles. */\n:root {\n  --color-bg: var(--color-paper);\n  --color-fg: var(--color-ink);\n  --color-fg-muted: var(--color-muted);\n}"
}
*/
