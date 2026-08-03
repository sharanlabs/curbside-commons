# Design System — Curbside Commons

**This file documents the design system that SHIPS. It is a record, not a proposal.**
Created 2026-07-31 (session 41) by reading `app/globals.css`, `app/layout.tsx` and
`docs/design-direction-2026-07-31.md` — every value below is transcribed from the
stylesheet, not invented. The design is owner-fixed; see "Settled by owner word" before
changing anything.

`RULES.md` remains the constitution. Where this file and `RULES.md` disagree, `RULES.md` wins.

## Product context

- **What this is:** a browser-side audit instrument. It checks a delivery-marketplace feed
  against the merchant's own records, applies NYC fee-cap law, and returns a verdict with the
  arithmetic attached.
- **Who it's for:** someone who needs to verify a claim, not admire a page. The primary
  action is uploading two files and getting a report.
- **Register:** premium-modern-futuristic-2026. An evidence instrument, not a SaaS landing page.
- **The honesty bar is a design constraint, not a footnote.** The data is simulated. Copy may
  never imply real platform access, a real merchant relationship, or real business impact
  (`RULES.md` §4). The C10 `BANNED_CLAIMS` gate enforces this, and the `/docs` "what is real,
  what is invented" statement must stay reachable from every footer.

## Settled by owner word — do not reopen without a new one

| Decision | Date | Note |
|---|---|---|
| **Onest** sitewide, display and body | 2026-07-31 | Reverses the 2026-07-28 Nunito pick. Confirmed by structured ask. |
| **Original colors** — ultramarine accent, the lamp scheme | 2026-07-31 | R-6 (H1 gradient recolor) refused; R-7 (palette inventory) dead. |
| **No instrument fonts on headings** | 2026-07-31 | Mono is for DATA. A mono nameplate shipped briefly and was reverted. |
| **Production register** — no "example/sample" captioning | 2026-07-31 | Words stating what the data *is* became "bundled" (still true). |
| **Workbench-first landing** | 2026-07-28, **re-confirmed 2026-07-31** | The hero fork is closed by owner word, not by inference. The measurement agrees: the v8 hero's `min-height: calc(100vh - 68px)` = 832px at 1280×900 cannot satisfy the 900px fold contract. |
| **The nav pill targets `/#audit`, not `/`** | 2026-07-31 | The bar's one emphasized action was a no-op on the landing page. It now points at the instrument. `aria-current` follows the ROUTE (`match: "/"`), never the href — `usePathname()` has no hash. |
| **Two schemes** — light and dark, viewer's choice | 2026-08-02 | Owner: *"also dark mode for it"*. This REVERSES the "Light only" record by the mechanism this table exists to require. Same roles, re-derived values — the palette and the lamp scheme are unchanged in light; see "Two schemes" under Color for the dark table and the accent role split. |
| **The walkthrough landing** — six stations, end to end | 2026-08-02 | Owner reopened layout/sections/motion ("whole layout … from dropping files till slack email"; palette explicitly unchanged). INPUTS · RUN · VERDICT · FEES · DELIVERY · PROOF, bound by a process strip; run control never disabled and on screen one; DELIVERY renders the real Slack/email payloads BUILT NOT SENT. Source of truth: `mockups/walkthrough-one-run-2026-08-02.html`, rendered + fold-verified. |

## Typography

**Two voices. Onest carries display and body; JetBrains Mono carries data.**

```
--ff-sans: var(--font-sans), "Onest", system-ui, -apple-system, "Segoe UI", sans-serif
--ff-mono: var(--font-mono), ui-monospace, SFMono-Regular, "JetBrains Mono", Menlo, monospace
```

Both self-hosted via `next/font/google` (fetched at build, served from our origin — the
runtime makes no off-origin font request). Onest is variable, `wght` 100–900. JetBrains Mono
is variable, `wght` 100–800. Neither has an `opsz` axis, so `font-optical-sizing` is inert.

**Mono is for data, never for prose or headings:** ledger numerals, field keys, verdict
labels, rule IDs, uppercase eyebrows. Ledger columns depend on its tabular figures.

### The weight ladder, and the rule that governs it

| Tier | Weight | Selectors |
|---|---|---|
| H1 / display | **680** | `h1.cs-h1`, `h1.p2-h1`, `h2.scene-h2`, `.lp-main h1`, `.p4-hero .cs-h1` |
| H2 | **660** | `h2.lp-h2`, `.lp-main h2`, `.p2-main h2`, `.p3-main h2` |
| H3 / titles | **700** | `.fm-title`, `.door .d-title`, `.lp-main h3`, `.p2-main h3` |
| Lead paragraph | **660** | `.pr-lead` |
| Body | **460** | `body`, `.cs-lede`, `.lede`, `.lp-foot` |
| Nav | **560** | `.site-navlink` |
| Chrome labels | **590** | `.nav-case`, `.acc`, `.tab2`, `.wb-meta dt` |

**WEIGHT NUMBERS DO NOT TRAVEL WITH A TYPEFACE.** These are calibrated for Onest. When the
site briefly ran Nunito, every display step was **+60** and body **+40**, because Nunito reads
optically lighter at the same numeric value. Swapping the face without re-calibrating produces
either a site that looks thin (the owner's original complaint) or one that looks bloated.
If the face ever changes again, re-derive the ladder — do not carry these forward.

Body sits on `--graphite` (8.31:1), not `--muted` (6.59:1). Thin strokes in light grey read
lighter than the same strokes in near-black, so the contrast lift is part of the weight fix.

### Type scale

Fluid via `clamp()`. Display: `clamp(33px, 5.4vw, 56px)` at the largest, stepping down through
`clamp(34px, 4.4vw, 52px)` and `clamp(28px, 4vw, 42px)`. Section H2: `clamp(25px, 2.5vw, 35px)`.
Body: 17px / 1.7. Chrome labels: 10.5–11.5px.

**Display tracking is per-surface and deliberate**, not global: landing and `/proof` at
`-0.028em`, `/report` at `-0.03em`. `.lp-h2` carries `-0.038em`, the tightest in the file.

## Color

**Ultramarine `#2438d6` on white.** One accent. Color is rare and load-bearing.

### Ink ramp — every step contrast-verified on white

| Token | Hex | Ratio | Role |
|---|---|---|---|
| `--ink` | `#12141c` | 18.38:1 | headings, hard marks |
| `--ink-2` | `#22252f` | 15.29:1 | strong text |
| `--body` | `#3b3f4b` | 10.51:1 | body text |
| `--graphite` | `#4a4e5a` | 8.31:1 | labels, values, icon strokes |
| `--muted` | `#585d69` | 6.59:1 | secondary, 13px nav |
| `--faint` | `#6a6e7a` | 5.09:1 | tertiary (11px consumers) |

Grounds: `--bg #ffffff` · `--bg-2 #fbfbfc` (panels) · `--bg-3 #f3f4f8` (faint cool well).
Hairlines are alpha-based on the ink hue: `--rule` 9%, `--rule-2` 15%, `--rule-3` 24%.

### Accent

`--accent` / `--signal` = `#2438d6` (8.04:1, carries white text). Hover `--accent-hi #25329a`
(10.49:1 — darker, so white text still passes). Tints at 5.5% ground and 22% hairline.

### The lamp system — a documented, deliberate scheme (session 29, D6 ruling)

Status is carried by a small set of fill/mark hues. **Blue is never a lamp** — blue means
interactive, and a blue status light would collide with every control on the page.

| Lamp | Fill hex | Text hex | Meaning |
|---|---|---|---|
| ember | `#b42318` | `#b42318` (6.57:1) | the FAIL verdict, a held claim |
| gold | `#ffb020` | `#9c6208` (5.04:1) | held status |
| azure | `#1f8fff` | `#0a45d6` (7.41:1) | fill/mark only |
| graphite | — | `#4a4e5a` | neutral chrome |

**Bright fills are unusable as text and the tokens say so.** `--gold` is 1.83:1 and `--azure`
is 3.27:1 — each has a separate `-text` token at ≥5:1. Never set type in a fill hue.

Semantic: `--error #d92d20` · `--warn #b54708` · `--ok #067647`, each with a soft ground and a
darker `-ink` variant for text.

### Two schemes (2026-08-02)

This replaces the former **"Light only"** record. It was reversed by the mechanism this file
requires — a new owner word ("also dark mode for it") — not by inference.

**The principle: same roles, re-derived values.** The light system's discipline is that every
ink step has a *verified ratio for the job it does*. The dark scheme mirrors those **role
ratios**; it does not invert hexes. An inverted `#12141c` is `#edebe3`, which is a different
job at a different ratio. Every number below was computed (standard WCAG sRGB), not eyeballed.

| Token | Hex | Ratio on `--bg` | Role |
|---|---|---|---|
| `--bg` | `#0e1016` | — | page ground (blue-black, the light ink ramp's own hue family) |
| `--bg-2` | `#13151d` | — | panels |
| `--bg-3` | `#1a1d27` | — | wells |
| `--ink` | `#f2f3f8` | 17.16:1 | headings, hard marks |
| `--ink-2` | `#e3e5ec` | 15.11:1 | strong text |
| `--body` | `#c5c8d4` | 11.40:1 | body text |
| `--graphite` | `#abafbe` | 8.70:1 | labels, values, icon strokes |
| `--muted` | `#9297a7` | 6.53:1 | secondary |
| `--faint` | `#82879a` | 5.33:1 | tertiary — **lifted** so it still clears 4.5 on `--bg-3` (4.71:1) |

Hairlines keep the same 3-step idiom, now white-alpha: `--rule` 10% · `--rule-2` 16% ·
`--rule-3` 26%, all on `--ink-rgb 242,243,248`.

**The accent role split — the structural point.** On white, ONE ultramarine does both jobs,
because `#2438d6` is 8.04:1 as text *and* carries white at 8.04:1. On near-black that stops
being true: a text accent must be **light**, a filled control must be **dark enough to carry
white**. So the roles are separate tokens **in both schemes** — in light both resolve to
`#2438d6`, which is why nothing about the light scheme moved.

| Token | Light | Dark | Verified |
|---|---|---|---|
| `--accent` (text · mark · focus ring) | `#2438d6` | `#93a2ff` | 8.02:1 on `--bg` |
| `--accent-fill` (filled control) | `#2438d6` | `#4257e8` | 3.40:1 vs ground (≥3 UI); white on it 5.58:1 |
| `--accent-hi` (hover on a fill) | `#25329a` | `#5468f0` | 4.18:1 vs ground; white on it 4.55:1 |
| `--link-hi` (the one link-hover ink) | `#1c2ba8` | `#b8c4ff` | 11.21:1 |

Lamps keep D6 — gold = held, ember = FAIL, **blue is still never a lamp**. Each lamp token is
consumed as *text* far more often than as a fill (`--ember` alone has 11 `color:` sites in the
`.wk-` layer), so in dark the base token takes the text value and the handful of dot/bar fills
simply read brighter: `--ember` `#ff8a7d` (8.32:1) · `--gold-text` `#e8a83c` (9.14:1) ·
`--ok` `#4fc08d` (8.38:1) · `--azure-text` `#7fb0ff` (8.65:1). The gold **BUILT, NOT SENT**
stamp and the ember FAIL both clear 8:1 on every ground they land on.

**Two things a `:root` switch alone does not reach**, and both were the real work:

1. **Element-scoped token blocks.** `.rpt-wrap` (the `/report` ledger) and `.docs-main` declare
   custom properties **on the element**, which beats anything inherited from `:root` regardless
   of specificity. Without their own dark branches they render a fully light document inside a
   dark page. `.rpt-wrap`'s one-token `--paper` design survives untouched, because it is both
   the ledger ground *and* the text on every ink surface — the pair inverts coherently
   (`--paper` on `--ink` is 17.16:1 dark, as it was 18.38:1 light).
2. **Hardcoded literals.** A colour that does not resolve through a token cannot follow the
   scheme. Of the **206 consumer literals** in the stylesheet (the count excludes the `:root`
   ledger, where literals are the point, and the `@media print` block, where white paper is
   correct), **178 were migrated** to role or channel tokens whose light values are
   byte-identical to what they replaced. The **28 that remain are correct as literals**: 18 sit
   on `--panel-dark`, a surface that is dark in *both* schemes (migrating them would invert a
   surface that never inverts); 9 are unreachable `var()` fallbacks; 1 is a bright azure mark
   that reads on either ground. Three more lived in `.tsx` — the `/docs` architecture SVG's
   arrowhead and tear line, and the **brand mark's deep gradient stop**, which was `#2438d6` at
   2.36:1 on the dark ground and which nothing else would have caught: the mark is
   `aria-hidden`, so axe never looks at it.

New role tokens, light values unchanged from the literals they replaced: `--surface` ·
`--surface-raise` (pressed chips inside a `--bg-3` well — separate from `--surface` because in
dark the well is *lighter* than the panel, so pointing them at `--surface` would invert the
raise) · `--panel-dark` · `--glass-rgb` · `--shadow-rgb` · `--edge`/`-2`/`-3` · `--on-accent`
(white in both — the fill beneath it is dark in both) · `--on-ink` (**inverts**, because `--ink`
inverts) · the `*-rgb` channel tokens.

**Elevation is reduced, not inverted.** An ink shadow is invisible on `#0e1016`; depth is
carried by the surface lift plus the white-alpha hairline, with a near-black shadow as a seat
rather than mud.

**Mechanism.** `color-scheme` is declared in CSS and as `viewport.colorScheme: "light dark"`;
`themeColor` is a media **pair** (`#ffffff` / `#0e1016`) so browser chrome tracks the scheme
instead of pinning white. The dark values live in two selectors —
`:root[data-theme="dark"]` (a stored choice, wins in **both** directions) and
`:root:not([data-theme="light"])` inside `@media (prefers-color-scheme: dark)` (no stored
choice → the system decides). The whole section is wrapped in `@media screen`, so printing from
dark mode still prints the light system. The duplication is unavoidable (a custom property
cannot be aliased across two selectors) and therefore **pinned**:
`evals/design/dark-scheme.test.ts` asserts both blocks declare an identical token set at
identical values, and scans for literal leaks.

**The toggle** is one icon button at the right of the nav. Its accessible name is carried by
**CSS, not state**: both labels are rendered and the stylesheet `display: none`s the one that
does not apply (hidden that way, it is excluded from the accessible-name computation), so the
name is correct on the first paint, before hydration, and follows a scheme change with no
re-render. An inline `<head>` script stamps `data-theme` from `localStorage("cc-theme")` before
first paint — it deliberately does **not** resolve the system preference, because the
stylesheet already handles "no stored choice", which keeps the no-JS render correct rather than
silently light.

**The "light is unchanged" claim was verified, not asserted.** After ~200 mechanical
substitutions, construction-by-argument is not evidence. Every new token was inverse-substituted
back to the literal it replaced and the result diffed against `HEAD:app/globals.css` with
comments and whitespace normalised away. The surviving differences are only: the new tokens'
own declarations, the toggle's rules, `#fff` ↔ `#ffffff` spelling, and sites where a literal
became a token **of the same value** (`var(--iris)` = `#3d5ceb`, `var(--gold-text)` = `#9c6208`,
`var(--paper)` = `#fdfcf9`, and so on). No light value moved.

**One deliberate light-scheme change, recorded rather than folded in.** `--ember-tint`,
`--ember-line` and `--ember-ink` were *consumed* by the `.wk-` layer (2026-08-02) and never
declared, so five declarations were invalid at computed-value time — `.wk-verdict-lamp.fail`'s
ring never painted, and `.wk-fee-card.finding` fell through to `currentColor`. They are now
declared at their siblings' values, which means those five surfaces render as designed for the
first time. (`.ds-btn.primary:hover` / `.ds-cta:hover` moved from `#000` to `--ink-hi`, which
*is* `#000` in light — a no-op, listed for completeness.)

## Spacing

Base unit 4px. **Use the scale; 92% of spacing decisions currently bypass it** (an open debt,
recorded in the 2026-07-31 design review as R-2).

```
--s1 4   --s2 8    --s3 12   --s4 16   --s5 24
--s6 32  --s7 48   --s8 64   --s9 88   --s10 120
```

Section rhythm: `.sect` `clamp(72px, 10vh, 100px)`, `.home-lead` `clamp(40px, 6vh, 64px)`,
`.sect-tool` `clamp(28px, 4vh, 44px)`.

## Layout

Grid-disciplined, centred column. `--maxw: 1180px`, stepping to **1420px at ≥2200px** and
**1720px at ≥3400px**. Gutter 32px.

**Text measure is capped in `ch` and that is load-bearing:** headings ~20ch, ledes 62–64ch.
**58 `max-width` caps use `ch` (63 `ch` values in the file overall)** — the two figures count
different things and both have been quoted as "the number", so they are stated apart here.
`1ch` is the advance of "0" **in the rendered face at the rendered weight**, so a font change
silently re-measures the whole site. Onest's "0" is 0.6640em at
wght 460; Nunito's was 0.6000em (+10.7%), while average glyph width differs by only 3.4% —
so the Onest restoration fits ~6.6% *more* characters per line.

**Radii are hierarchical, not uniform:** `--r-card 16px` · `--r-ctrl 12px` · `--r-chip 9px` ·
`--r-pill 999px` (buttons, nav pills, status chips).

### The fold contract

The workbench drop zones **and the run control** must sit entirely above a 900px fold at
1280px width (`evals/e2e/canonical.spec.ts`; strengthened 2026-08-02 — the mockup measured
zones-bottom 560px / run-bottom 626px against the shipped 970px). Any change to first-screen
spacing, type size, or face must be re-measured against this — it is a pinned regression
test, not a guideline.

### The landing is six stations (2026-08-02)

INPUTS (`#audit`) · RUN (ticker) · VERDICT (slab) · FEES · DELIVERY (Slack + email
artifacts, built by `lib/delivery/*` builders, never sent — the SIMULATED banner arrives
from the builder's own first block, never retyped in JSX) · PROOF. A sticky process strip
under the nav carries the sequence in words, never numerals (de-numbered by owner word).
All new classes are `wk-`-prefixed; every station section carries
`scroll-margin-top: 114px` for the sticky chrome. Run state is published on a typed bus
(`components/landing/run-bus.ts`); `AuditWorkbench` stays the single owner of run state.

## Motion

Intentional, never decorative. **118 transition/animation declarations animate zero layout
properties** — transform and opacity only, no width/height/top/left/margin/padding.

```
--ease           cubic-bezier(0.16, 1, 0.3, 1)
--ease-arrival   cubic-bezier(0, 0, 0.2, 1)     enters
--ease-field     cubic-bezier(0.4, 0, 0.2, 1)   in-field movement / exits
--dur-1 150ms   --dur-2 240ms   --dur-3 350ms
--dur-reveal 460ms   --dur-settle 600ms   --dur-hero 620ms
```

24 `prefers-reduced-motion` blocks resolve animated surfaces to their settled state. One
keyframe name has exactly one definition — two definitions of one name is a trap, because an
edit to either silently loses to whichever the cascade reads last.

## Anti-patterns — rejected for this product

Gradient text beyond the single H1 phrase (the one instance is owner-fixed) · gradient buttons ·
glassmorphism as a default surface · uniform border-radius · three-column icon-card feature
rows · numbered chapter chrome (de-numbered 2026-07-28: numerals told visitors this was a
document to read in order) · decorative stats · any copy implying real platform data.

## Known open items (recorded, not fixed)

1. ~~**The instrument arrives without its verb**~~ — **RESOLVED 2026-08-02** by the
   walkthrough redesign: the run control is never disabled ("Run the bundled pair" when
   empty — a click loads the pair and runs it) and sits on screen one.
2. ~~**The nav's one emphasized action is a no-op on `/`**~~ — **RESOLVED 2026-07-31 by owner
   word.** Retargeted to `/#audit`; the pinned `aria-current` contract moved with it and gained
   two teeth. See the settled-by-owner table.
3. **`.fd-hint` has no `ch` cap** and runs at ~86% of its cell; a few more characters wraps it
   and pushes both drop zones down ~21px.
4. **`tabular-nums` on sans-set figures** (`.fd-status`, `.wb-tally`) was calibrated under
   Nunito and has never rendered under Onest.
5. **`/docs` sits outside the weight pass** — its headings are 560 against 680/660 elsewhere.
6. **`.lp-h2` tracking** (`-0.038em`) was approved at 42px and now renders ~10px smaller and
   60 heavier.
7. **Dead CSS** — 268 orphan candidates await a real reachability proof (never a grep).
8. ~~**`#audit` has no `scroll-margin-top`**~~ — **RESOLVED 2026-08-02**: every landing
   station section carries `scroll-margin-top: 114px` (nav 68 + strip 34 + breathing room).
   The cross-route hash path (`/report` → `/#audit`) remains unrendered from this seat.
9. **The walkthrough redesign has never been rendered as the app** (2026-08-02) — the mockup
   was rendered and measured; the Next port is verified by type/lint/unit gates only. First
   network-capable run: `npm run verify && npx playwright test`. `layout-sanity.spec.ts` is a
   plausible first-run red (`MIN_TEXT_WIDTH 120` vs `.wk-tk-id` ≈115px at 12px mono) — read
   it before changing either side.
10. **`.wk-strip { top: 68px }` is a fourth hardcoded copy of the nav height** — matched the
   existing idiom rather than tokenised; a nav-height change now silently overlaps the strip.
11. **The dark scheme has never been rendered** (2026-08-02) — every value was computed and the
    token plumbing is pinned by unit tests against the stylesheet, but Playwright needs a port
    this seat does not have, so the dark axe pass and `theme.spec.ts` ship **authored, not run**.
    First network-capable run: `npm run verify && npx playwright test`. Two things axe cannot
    settle even then: it reports text over a **gradient** as *incomplete* rather than a
    violation, so `--grad-phrase` on the H1, `.wk-slab-top` and the masthead washes are covered
    by computing each stop instead (all ≥8:1 against `--bg`); and it never opens `/report` or
    `/docs` in dark unless the run includes them — `theme.spec.ts` asserts those two computed
    grounds directly for that reason.
12. **`lib/delivery/email-html.ts` stays light on purpose** — an email payload is not site
    chrome, and `evals/delivery/delivery.test.ts` pins it light-locked (no
    `prefers-color-scheme` block). If dark email is ever wanted, that pin is the thing to
    revisit first.

## Decisions log

| Date | Decision | Rationale |
|---|---|---|
| 2026-08-02 | Dark scheme shipped; "Light only" retired; accent split into text and fill roles in BOTH schemes; 275 colour literals migrated to tokens | Owner word: *"also dark mode for it"*. The role split is structural, not cosmetic: one ultramarine can serve text and fill on white and cannot on near-black. The literal migration is the part that makes the switch actually work — a colour outside the token system cannot follow a scheme, and the two element-scoped token blocks (`.rpt-wrap`, `.docs-main`) beat `:root` outright. Pinned by `evals/design/dark-scheme.test.ts` + `evals/e2e/theme.spec.ts` + a dark axe pass. |
| 2026-08-02 | Six-station walkthrough landing; DELIVERY station added; run control never disabled; fold contract strengthened to include the run control | Owner word: reassess the whole layout/UX end to end, "from dropping files till slack email", minimalist premium 2026, palette unchanged. Design authored by the session seat (owner: "Fable as the designer advisor"), rendered + measured before the port; Opus built from the mockup. |
| 2026-07-31 | Nav pill retargeted `/` → `/#audit`; workbench-first confirmed; fold reclaim held | Owner word on all three decision-board forks. The pill was the site's most dominant control and navigated nowhere on the landing page. |
| 2026-07-31 | DESIGN.md created | The system lived only in 9,200 lines of CSS and a dated review doc; every session re-derived it. |
| 2026-07-31 | Onest restored, weights recalibrated −60/−40 | Owner word. Numbers do not travel with a face. |
| 2026-07-31 | Production register adopted | Owner word; "sample" kept as "bundled" wherever it stated fact. |
| 2026-07-31 | Two-column `/report` masthead ≥1080px | Masthead filled half the column while the figure below filled all of it. |
| 2026-07-28 | De-numbered sitewide, workbench-first landing | Owner: "looks like a display piece with numbers … I want ready to use website to upload test files". |
| 2026-07-20 | `RULES.md` §4 amended | Honesty carried by the C10 gate + a permanent `/docs` statement, not by repeating "simulated" everywhere. |
