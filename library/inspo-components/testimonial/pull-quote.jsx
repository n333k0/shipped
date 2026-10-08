// Pull quote (testimonial) · Single voice
// undefined
// Source: inspo reference components (https://github.com/Nutlope/inspo, MIT)

/* inspo-reference-component
 * type= testimonial | genre= editorial | theme= Inspo-paper
 * archetype= Pull quote | diversification= single voice, generous air
 * states= default (static)
 * contrast= pass (46-50)
 *
 * Note - placeholder voice, marked as such. No invented
 * customer metrics; the quote here is a generic about-craft placeholder
 * the developer should replace with a real attributed quote before ship.
 */

export function TestimonialPullQuote() {
  return (
    <section className="border rule bg-[var(--color-bg)] px-8 py-24 sm:px-14 sm:py-28">
      <figure className="mx-auto max-w-4xl text-center">
        <p
          className="font-display leading-[1.05] text-balance"
          style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
        >
          <span aria-hidden className="text-[var(--color-accent)]">&ldquo;</span>
          The reference layer I wish I&rsquo;d had when I was learning
          this craft.
          <span aria-hidden className="text-[var(--color-accent)]">&rdquo;</span>
        </p>

        <figcaption className="mt-12 flex items-center justify-center gap-3 text-meta normal-case tracking-normal text-[var(--color-fg-muted)]">
          {/* Honest placeholder - labelled, not invented. */}
          <span className="font-mono text-meta">-</span>
          <span>
            <span className="text-[var(--color-fg)]">[Attribution]</span> ·
            replace before publishing
          </span>
        </figcaption>
      </figure>
    </section>
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
