// Search-first (nav) · N9 Search-first
// Search-first nav - instead of a row of links, the wordmark sits next to a wide search input that does everything (browse, paste a URL, run a command). Common in archives, catalogues, and ⌘K-led products. The few links it does carry sit to the far right as quiet captions.
// Source: inspo reference components (https://github.com/Nutlope/inspo, MIT)

/* inspo-reference-component
 * type= nav | genre= editorial | theme= Inspo-paper
 * archetype= N9 Search-first | diversification= the search input *is*
 *   the nav row - every action funnels through it
 * states= default · hover · focus-within
 * contrast= pass (46-50)
 */

/**
 * Search-first nav - instead of a row of links, the wordmark sits
 * next to a wide search input that does everything (browse, paste a
 * URL, run a command). Common in archives, catalogues, and ⌘K-led
 * products. The few links it does carry sit to the far right as
 * quiet captions.
 */
export function NavSearchFirst() {
  return (
    <header className="border-y rule bg-[var(--color-bg)] px-8 py-4 sm:px-14">
      <div className="flex items-center gap-6">
        <a href="#" className="font-display text-2xl tracking-tight shrink-0">
          Inspo<span className="text-[var(--color-accent)]">.</span>
        </a>

        <form
          role="search"
          className="group flex flex-1 items-center gap-3 px-4 py-2.5 border-b border-[var(--color-border)]/60 transition-colors hover:border-[var(--color-fg)]/40 focus-within:border-[var(--color-accent)]"
        >
          <span
            aria-hidden
            className="shrink-0 inline-flex text-[var(--color-fg-muted)] transition-colors group-focus-within:text-[var(--color-accent)]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </span>
          <input
            type="search"
            placeholder="search the catalogue - or paste a URL"
            className="flex-1 min-w-0 bg-transparent outline-none font-mono text-sm placeholder:text-[var(--color-fg-muted)]"
          />
          <kbd className="text-meta hidden text-[var(--color-fg-muted)] sm:inline-block">⌘K</kbd>
        </form>

        <nav className="hidden items-center gap-5 lg:flex">
          <a href="#" className="text-meta hover:text-[var(--color-accent)]">MCP</a>
          <a href="#" className="text-meta hover:text-[var(--color-accent)]">About</a>
        </nav>
      </div>
    </header>
  );
}


/* tokens
{
  "needs": [
    "--color-accent",
    "--color-bg",
    "--color-border",
    "--color-fg",
    "--color-fg-muted"
  ],
  "aliasBlock": "/* Paste into :root if your tokens are named for their roles. */\n:root {\n  --color-bg: var(--color-paper);\n  --color-border: var(--color-rule);\n  --color-fg: var(--color-ink);\n  --color-fg-muted: var(--color-muted);\n}"
}
*/
