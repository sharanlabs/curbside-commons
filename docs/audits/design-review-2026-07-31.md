# /design-review — measured design audit, 2026-07-31

**Skill:** `/design-review` · **Seat:** Opus 5, high effort · **Branch:** `main`, tree clean at start
**Mode:** source-measured. Every number below is computed, not eyeballed.

## Harness limits, stated first

The skill's Phases 1–5 (first impression, live extraction, per-page screenshots, interaction flow) require the `browse` binary. It could not be built: **`bun` is absent and `bun.sh` returns `000`** under the sandbox allowlist. The Codex design voice is likewise unavailable (`chatgpt.com` → `000`, settled earlier this session).

**So there are no rendered screenshots and no `getComputedStyle` numbers in this pass.** What replaced them: the clamp arithmetic below is *computed at each breakpoint* rather than sampled, which is stronger than a single screenshot width — but it cannot see cascade, overflow, or paint. The Claude design subagent (the skill's second outside voice) runs locally and was dispatched.

Grades are therefore withheld. A letter grade implies rendered evidence this pass does not have.

---

## What is measurably GOOD — stated so the findings are not read as a verdict on everything

**The type hierarchy is correct at every desktop width.** Session 37 fixed an inversion where H2 rendered larger than H1; verified fixed by computing the clamps:

| selector | clamp | 1280 | 1440 | 1728 |
|---|---|---:|---:|---:|
| `.home-lead .cs-h1` | `clamp(33px, 3.3vw, 46px)` | 42.2 | 46.0 | 46.0 |
| `.lp-h2` | `clamp(25px, 2.5vw, 35px)` | 32.0 | 35.0 | 35.0 |
| `.scene-h2` | `clamp(26px, 2.2vw, 34px)` | 28.2 | 31.7 | 34.0 |

H1 > H2 > scene-H2 at 1280, 1440 and 1728. **No inversion. Do not "fix" this.**

**The numbers on `/report` are engine-derived and internally consistent** — executed, not read: `errors=11 warns=5 sum=16 findingTotal=16 served=2150`. `specimen.ts:33` throws if a finding is absent, so they cannot drift from the engine.

**The nav is present on every route.** `layout.tsx:105` renders `<Nav>` outside `{children}`; `Nav.tsx:36` maps "Audit" → `/`. The owner's screenshot was taken scrolled past it.

**AI-slop blacklist: clean on 9 of 10.** No purple gradients, no 3-column icon-circle feature grid, no decorative blobs, no emoji, no colored left-border cards, no generic "Welcome to…" hero copy, no system-ui as primary. The one hit is D-5 below.

---

## Findings

### R-1 (HIGH) — the first screen has three alignment systems, and one rule causes it

Measured: **`.cs-copy` is the only `text-align: center` in the landing chain.** `.home-lead`, `.sect-tool`, `.tool-h2`, `.tool-foot` and `.lp-h2` all carry no `text-align` and inherit left.

So the page opens with a centred 62ch column, then immediately switches to a left-aligned H2 (`Audit a feed.`), then to a full-width two-card grid spanning `.ds-wrap` (1180–1720px). **Three alignment behaviours in the first viewport.**

This is the single highest-leverage finding: it is one property, and it explains both the "empty top" and the "unpolished" read better than any individual element does. Centred display type earns its space when it owns the screen — the session-37 fix correctly removed `.cs-hero { min-height: 100vh }` so the tool could reach the fold, but left the hero's centred composition behind without the viewport that justified it.

**Fix:** commit to one spine. Left-align the lead to match the tool below it (recommended — the page is a workbench, not a poster), or restore enough vertical space for the centred block to read as a deliberate composition. Do not do both.

### R-2 (HIGH) — the spacing scale exists and is 92% unused

Counted across `app/globals.css`:

| | count |
|---|---:|
| `var(--s*)` token uses | **56** |
| hand-typed px in padding/margin/gap | **639** |

**92% of spacing decisions bypass the scale.** Session 36 flagged this narrowly ("`var(--s*)` used twice in ~60 rules"); measured sheet-wide it is systemic.

The visible symptom is the section rhythm on the landing page:

```
.home-lead   padding: clamp(20px, 3vh, 38px) 0 0
.sect-tool   padding: clamp(30px, 4vh, 46px) 0 0
.sect        padding: 100px 0 0          <- flat, 2-3x the first two
```

The two sections a reader meets first are the most compressed on the page, while everything below them breathes 2–3× more. That inverts the rhythm exactly where first impressions form.

### R-3 (MEDIUM) — a third of the stylesheet is dead

**268 of 768 class selectors (34%) defined in `globals.css` have zero references in any `.tsx`.** Worst clusters: `.cc-*` (a retired chapter/limits layout), `.cp-*`, `.ch-links`, `.asof`, `.c3`.

This is not cosmetic. It is why the sheet is ~7,000 lines, why the specificity is hard to reason about, and why session 36's "six `.pg-*` rules with zero references" recurred — that was the same defect found narrowly. **Same accretion pattern this session found in the state docs (1.31 MB) and the mutation harness.**

### R-4 (MEDIUM) — the scene band keeps hero-scale rhythm it no longer needs, and clips a label

`.sect-scene { padding-bottom: 0 }` plus `.sect { padding: 100px 0 0 }` gives the band large dead vertical space around the artwork (visible in the owner's image 2). The band was the hero in session 36; as an explanatory figure it should not carry hero rhythm.

Separately, `CommonsScene.tsx:412` sets the status text `THE AGENT PLACES THE ORDER`, which renders **clipped at the left viewport edge** (starts x≈27px, leading bullet cut). `.cs-status` is at `globals.css:4724`.

### R-5 (MEDIUM) — the page's primary action is disabled by default, with its instruction as a caption

`Run the audit` renders greyed with *"Add a feed to run the audit — the record side is optional"* set beside it. The most important control on the page is in its weakest visual state at first paint, and its instruction reads as a caption rather than the next step. The empty-state copy is correct and specific; the composition undersells it.

### R-6 (LOW) — gradient text is the one AI-slop tell present

**6 `background-clip: text` rules.** The H1's second line renders blue → lighter blue → brown across `What the agent read needs proof.` At display size the colour shift mid-sentence draws attention to the treatment rather than the claim — and this is an evidence product where the sentence is the point. It is also the only gradient text on the site, so it reads as an exception rather than a system.

### R-7 (LOW) — 54 unique hex colors

Above the skill's ≤12 non-gray threshold. Some are legitimately semantic (error/warn/pass lamps are a documented, deliberate system from session 29). Worth an inventory pass to separate the ledger palette from accumulated one-offs, but **not** a blind reduction — the lamp scheme is owner-fixed.

---

## Typography — the owner's "sophisticated, premium" ask

Current: **Nunito** (variable 200–1000, self-hosted via `next/font/google`) + **JetBrains Mono** for ledger numerals. Owner-picked in session 37 from six candidates rendered in the site's own copy.

The gap is real and not taste: Nunito has rounded terminals and open, generous bowls — a *friendly, approachable* voice. The subject is feed-vs-record arithmetic, findings with rule ids, and NYC fee-cap law. **The type says "app"; the content says "evidence."**

Owner chose to see candidates rendered first — the method that picked Nunito, and the only one that does not guess. Four directions to render in the site's own H1, lede and a ledger row:

| direction | why it fits this product |
|---|---|
| editorial serif display + neutral sans body | print/legal authority; the strongest shift, and the register an audit report actually lives in |
| one precise geometric sans | keeps single-family simplicity, loses the roundness; lowest risk |
| transitional serif throughout | closest to a document/record voice; risks feeling dated if mis-set |
| high-contrast display + grotesque body | the "expensive" look; highest risk of overdesigning an evidence tool |

Binding constraints from the repo's own record: self-hosted via `next/font/google`, weights verified against the **installed** font manifest (session 37 caught weights outside a family's real axis), zero external runtime requests, and **JetBrains Mono retained** — the ledger's column alignment depends on tabular numerals.

---

## Recommended order

1. **R-1 + R-2 together.** One problem: the first screen has no spine and no rhythm. Fixing either alone leaves the other visible.
2. **Typography.** Render the slate → owner picks → apply. After R-1/R-2, so candidates are judged in the corrected composition.
3. **R-4, R-5.** Independent, small.
4. **R-3.** Dead-CSS removal wants a reachability proof (session 30's method: real graph + build-hash comparison), not a grep — deferrable, and safest done alone.
5. **R-6, R-7.** Polish.

Nothing here touches the engine, the honesty gates, or the reported numbers.

---

## Addendum — `/interaction-design` motion + state audit (same day)

**Trigger:** owner invoked `/interaction-design` after the design review. Same measured method; the independent design subagent died on a seat error (*"Not logged in · Please run /login"*, raw on record, not retried) so this ran inline.

### The motion layer is largely healthy — measured, and worth saying plainly

| check | result | verdict |
|---|---|---|
| `transition: all` | **0** uses | clean — properties are always listed |
| bare `outline: none` | **0** | clean — focus is never destroyed |
| `focus-visible` rules | 22 | present across controls |
| `prefers-reduced-motion` blocks | 16, **global animation kill confirmed** | every one of the 17 keyframes has a reduced-motion story |
| easing | one 5-token family (`--ease`, `-arrival`, `-field`, `-enter`, `-exit`) | systematic, Material-adapted |
| durations | dominated by 0.12–0.5s | inside the 100–500ms guideline band |
| `will-change` | 0 | correctly absent (no speculative promotion) |
| disabled primary button | bg + color + border + `cursor: not-allowed` | correct pattern |

This layer does **not** have R-2's problem: motion went through a design pass (session 29's storyboard work) and it shows. No fixes recommended here for their own sake.

### I-1 (MEDIUM) — "Choose a file" has no pointer hover cue

`.fd-cta` (the primary affordance of each upload slot) lights up on **keyboard** focus (`globals.css:3439`, via the input's `focus-visible`) but has **no `:hover`** — while its two sibling controls do (`.fd-sample:hover` 3467, `.fd-dl:hover` 3734). A mouse user pointing at the most important control in each slot gets no feedback; the *less* important controls respond. Inverted affordance weight. One rule fixes it (underline shift or the same color lift `.fd-sample` uses).

*Process note, recorded because the method is the message: my first grep reported all four controls hover-less — a mis-built pattern. Verified before claiming; three of the four "missing" states exist. A finding that survives its own re-check is the only kind worth shipping.*

### I-2 (LOW) — duplicate `@keyframes stamp-neq`

Defined byte-identically at `globals.css:6014` and `:7584` (jewel vs fjewel copies). Not a behavior bug — identical stops — but it is R-3's dead-weight class inside the motion layer. Fold into the R-3 cleanup.

### I-3 (LOW) — the section rule animates `width`

`globals.css:1744`: `.ds-reveal.in .lp-sec-rule { transition: width 0.42s }` on a 44px hairline. Layout-property animation; paint cost trivial at this size, but `transform: scaleX()` is the idiomatic form and the sheet's only layout-prop transition. One-line change whenever the file is next open.

### Deliberately NOT recommended

- **No spinner/skeleton for the audit run.** The run is synchronous and in-tab; parsing measured 50–203ms even at 22 MB (the vuln-scan's own numbers). A loading state for a sub-250ms operation is motion for its own sake.
- **No entrance choreography for the workbench.** The tool is the page's job; making a reader wait through a reveal to reach an input would spend goodwill on decoration.
