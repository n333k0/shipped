# inspo reference components

68 archetypes, React + Tailwind. Read them for structure and states even when writing plain HTML.

| Type | Component | Use when |
|---|---|---|
| cta | [Banded](cta/banded.jsx) | Full-bleed accent ribbon with one action. Earns its loudness by being the only one on the page. |
| cta | [Form-led](cta/form-led.jsx) | The input is the action. Single email field with inline submit and a real success state. |
| cta | [Inverted](cta/inverted.jsx) | Black ground, paper button. The contrast does the work - no accent, no gradient, no chrome. |
| cta | [Marquee](cta/marquee.jsx) | A single phrase scrolls on infinite loop; the whole strip is clickable. Pauses on hover. |
| cta | [Quiet](cta/quiet.jsx) | A typographic appeal, not a button. Reads as the end of an article. |
| cta | [Sticky compact](cta/sticky-compact.jsx) | Low-contrast strip that floats at the foot; single short action. |
| cta | [Two-button](cta/two-button.jsx) | Primary action + a quiet secondary. Don't add a third - the page becomes a comparison, not a conversion. |
| faq | [Accordion](faq/accordion.jsx) | Native HTML, single-open behaviour. Affordance is a typographic + / -, not a chevron. |
| faq | [Category tabs](faq/category-tabs.jsx) | Questions sliced by audience (Designers, Engineers, Curators). Useful when the FAQ serves multiple roles. |
| faq | [Compact](faq/compact.jsx) | Q-only by default; click expands A inline. Dense scanning for short answers. |
| faq | [Numbered](faq/numbered.jsx) | Asked, briefly answered. Numbered prefix in mono - reads as a list of arguments. |
| faq | [Search-led](faq/search-led.jsx) | Search beats accordion when the FAQ runs long. Filtered, empty, and focus states all handled. |
| faq | [Two-column](faq/two-column.jsx) | Every Q&A on display. Reads as a magazine interview, not a help-desk index. |
| faq | [FAQ + CTA](faq/with-cta.jsx) | Three Q&A rows followed by a quiet conversion strip. Converts readers who got most of the way through. |
| features | [Alternating](features/alternating.jsx) | Three feature rows alternating side per row. The shape comes from the alternation. |
| features | [Bento](features/bento.jsx) | Six tiles, irregular spans. The largest carries the lead idea; smaller ones extend it. |
| features | [Compare](features/compare.jsx) | Capability comparison framed categorically (before / with) - no competitor names. |
| features | [Icon trio](features/icon-trio.jsx) | Three features each carrying a typographic mark inside a hairline square. No SVG iconography. |
| features | [Long-form](features/long-form.jsx) | Features written as paragraphs with marginal headings. Read, not scanned. |
| features | [Numbered triplet](features/numbered-triplet.jsx) | Three equal columns prefaced by big mono ordinals. Variety comes from type, not layout. |
| features | [Workbench](features/workbench.jsx) | Explanatory copy left, working demo right. Real strings, no faux chrome. |
| footer | [Address card](footer/address.jsx) | Real-world contact info - postal, email, hours. No social row, no link map. |
| footer | [Colophon](footer/colophon.jsx) | Magazine end-credit. Typefaces, stack, owner - set in mono so it reads as metadata, not body copy. |
| footer | [Index](footer/list.jsx) | Hand-set table of contents. Reads as back-matter - numbered, mono, no underlines. |
| footer | [Long copy](footer/long-copy.jsx) | Closes the page with a small essay rather than a link map. Voice as last word. |
| footer | [Newsletter](footer/newsletter.jsx) | Subscribe is the only action that earns a row. Three minimal links underneath, not a four-column map. |
| footer | [Sitemap](footer/sitemap.jsx) | 4-column link map. The most-AI-recognised footer shape; reserve for genuine docs roots or hubs. |
| footer | [Statement](footer/statement.jsx) | One big sentence, one quiet sign-off. Lands the brand's last word on the page. |
| hero | [Documentary](hero/documentary.jsx) | Headline reads as the caption of a missing photograph; documentary credit sits in the margin. |
| hero | [Manifesto](hero/manifesto.jsx) | Dark ground, single declaration, one phrase punched in accent. The voice carries the brand. |
| hero | [Marquee](hero/marquee.jsx) | One thought set big, with a mono dateline as the editorial anchor. No imagery - the type is the design. |
| hero | [Question](hero/question.jsx) | Hero asks rather than tells. Useful when the brief is invitational; the answer is the rest of the page. |
| hero | [Split-screen](hero/split-screen.jsx) | Typography on one half, atmospheric pure-CSS panel on the other. No image placeholder. |
| hero | [Stat-Led](hero/stat-led.jsx) | The figure leads. Supporting copy pulls weight from the number. Use when the brief has a real number. |
| hero | [Word-as-art](hero/word-as-art.jsx) | One word, set to fill the viewport width. The page leads with a noun, not a sentence. |
| logo-cloud | [Credits list](logo-cloud/credits.jsx) | Partner roster as a vertical list with roles. Reads like film end-credits, not a logo wall. |
| logo-cloud | [Grid](logo-cloud/grid.jsx) | Twelve marks in a hairline-ruled grid. Reads as a contact sheet, not a trust strip. |
| logo-cloud | [Marquee](logo-cloud/marquee.jsx) | Auto-scrolling wordmark loop with mask-faded edges. Pauses on hover, respects reduced-motion. |
| logo-cloud | [Pill chips](logo-cloud/pill-chips.jsx) | Each wordmark in its own rounded chip. Denser than a strip; works at high partner counts. |
| logo-cloud | [Sectioned](logo-cloud/sectioned.jsx) | Logos grouped by relationship (Partners, Featured in) - honest labels, not invented tiers. |
| logo-cloud | [Strip](logo-cloud/strip.jsx) | Wordmark logos in a typographic row, opacity-muted. No invented "trusted by" framing. |
| nav | [Breadcrumb-led](nav/breadcrumb.jsx) | Path is the primary nav. For deep hierarchies - docs, atlases, catalogue subsections. |
| nav | [Floating pill](nav/floating-pill.jsx) | Centred pill nav that doesn't sit on a full-width band. Good over full-bleed heroes. |
| nav | [Inline minimal](nav/inline.jsx) | Wordmark left, links inline, utilities right. Utility cluster sits tighter than the nav links. |
| nav | [Marginal](nav/marginal.jsx) | Vertical index in the left margin. Reads like a table-of-contents pulled into the chrome. |
| nav | [Mega menu](nav/mega.jsx) | Top-level links reveal a multi-column panel on hover. For deep sites where flyouts get unwieldy. |
| nav | [Off-canvas](nav/off-canvas.jsx) | Page leads with the wordmark and a menu affordance; full nav slides in from the right. |
| nav | [Search-first](nav/search-first.jsx) | The search input IS the nav row. Common in archives and ⌘K-led products. |
| pricing | [Enterprise](pricing/enterprise.jsx) | No prices visible. What's covered, what's negotiable, where to reach. |
| pricing | [Per-use](pricing/per-use.jsx) | Pay-per-call menu rather than tiered plans. Reads as a menu, not a comparison. |
| pricing | [Single plan](pricing/single-plan.jsx) | One plan, no comparison. The page IS the plan. Reads as a brochure. |
| pricing | [Comparison table](pricing/table.jsx) | Tabular spec sheet. Thin rules, no zebra striping, hover lift to track across rows. |
| pricing | [Three-card](pricing/three-card.jsx) | Classic three tiers. The recommended one raised by a thin accent rule - no "Most popular" badge. |
| pricing | [Tier bento](pricing/tier-bento.jsx) | Lead tier spans 2×2; supporting tiers smaller. Visual hierarchy expresses the recommendation. |
| pricing | [Toggle](pricing/toggle.jsx) | Bipolar choice with monthly/annual flip. Segmented control with radio semantics. |
| stat | [Annotated](stat/annotated.jsx) | Each figure carries a superscript footnote naming its source. Invites "according to what?" |
| stat | [Bar chart](stat/bar-chart.jsx) | Numbers shown as relative magnitudes, not isolated figures. Pure CSS, no chart library. |
| stat | [Before / after](stat/before-after.jsx) | Shows movement, not just magnitude. Real numbers from the project - banner-killer impact. |
| stat | [Stat grid](stat/grid.jsx) | Three columns of two stats each. Denser than the row; carries editorial captions. |
| stat | [Stat row](stat/row.jsx) | Four real catalogue numbers, tabular-nums. No invented stats - these are real. |
| stat | [Single hero](stat/single-hero.jsx) | One number, set as large as the page allows. For when the strongest claim is countable and singular. |
| testimonial | [Cinematic](testimonial/cinematic.jsx) | Dark ground, single quote, attribution as film-credit row. Invites verbatim quotation. |
| testimonial | [Conversation](testimonial/conversation.jsx) | Three lines of dialogue. Invites the reader to overhear rather than be sold to. |
| testimonial | [Mosaic](testimonial/mosaic.jsx) | Four cards, hover-lifted. Density that reads as range without picking one voice over another. |
| testimonial | [Press quote](testimonial/press.jsx) | Single press mention with byline + outlet. Placeholder slots - never invent press. |
| testimonial | [Pull quote](testimonial/pull-quote.jsx) | One huge quote, single attribution. Voice as marketing. Placeholder slots - quotes are never invented. |
| testimonial | [Reviews row](testimonial/reviews-row.jsx) | Three star reviews with one-line quotes. Counts placeholdered - no invented review totals. |
| testimonial | [Single portrait](testimonial/single-portrait.jsx) | One face, one voice. Portrait slot is bordered placeholder; replace with real photograph. |
