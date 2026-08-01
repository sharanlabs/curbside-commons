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
| **Workbench-first landing** | 2026-07-28 | Restated by measurement 2026-07-31: the v8 hero cannot satisfy the fold contract. |

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

**Light only.** `color-scheme: light` is declared in CSS and as `viewport.colorScheme`, plus
`themeColor: #ffffff` so browser chrome matches rather than tinting its own dark band.

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

The workbench drop zones must sit **entirely above a 900px fold at 1280px** width
(`evals/e2e/canonical.spec.ts`). The run control deliberately follows below. Any change to
first-screen spacing, type size, or face must be re-measured against this — it is a pinned
regression test, not a guideline.

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

1. **The instrument arrives without its verb** — at 1280×900 the run control is `disabled` at
   first paint *and* below the fold, along with the sentence explaining why.
2. **The nav's one emphasized action is a no-op on `/`** — `Nav.tsx` marks `href === "/"` as the
   filled pill. Retargeting it touches a pinned `aria-current` contract.
3. **`.fd-hint` has no `ch` cap** and runs at ~86% of its cell; a few more characters wraps it
   and pushes both drop zones down ~21px.
4. **`tabular-nums` on sans-set figures** (`.fd-status`, `.wb-tally`) was calibrated under
   Nunito and has never rendered under Onest.
5. **`/docs` sits outside the weight pass** — its headings are 560 against 680/660 elsewhere.
6. **`.lp-h2` tracking** (`-0.038em`) was approved at 42px and now renders ~10px smaller and
   60 heavier.
7. **Dead CSS** — 268 orphan candidates await a real reachability proof (never a grep).

## Decisions log

| Date | Decision | Rationale |
|---|---|---|
| 2026-07-31 | DESIGN.md created | The system lived only in 9,200 lines of CSS and a dated review doc; every session re-derived it. |
| 2026-07-31 | Onest restored, weights recalibrated −60/−40 | Owner word. Numbers do not travel with a face. |
| 2026-07-31 | Production register adopted | Owner word; "sample" kept as "bundled" wherever it stated fact. |
| 2026-07-31 | Two-column `/report` masthead ≥1080px | Masthead filled half the column while the figure below filled all of it. |
| 2026-07-28 | De-numbered sitewide, workbench-first landing | Owner: "looks like a display piece with numbers … I want ready to use website to upload test files". |
| 2026-07-20 | `RULES.md` §4 amended | Honesty carried by the C10 gate + a permanent `/docs` statement, not by repeating "simulated" everywhere. |
