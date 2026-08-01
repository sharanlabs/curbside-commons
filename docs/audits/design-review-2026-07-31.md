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

---

## Orchestrator review of the Fable redesign pass (same day) — VERDICT: SHIP

Nine commits (`37323e7` → `bc6bab7`), reviewed against the Fable-equivalence bar. Gates re-run by this seat, not trusted: **tsc 0 · eslint 0 · vitest 1457 + 8 skipped** (honesty-c10 excluded — needs a network build, standing disclosure).

**Invariants verified measurably:** `app/layout.tsx` untouched (fonts) · every added hex pre-exists in the sheet (`#2438d6` = the brand ultramarine reused for N-1's action fill; `#ecedf0` 3→4 occurrences — reuse, not a new hue) · "Nothing you load leaves this page" present verbatim, retired phrase count 0 · all five pinned H2 texts byte-identical · nav labels/hrefs untouched (N-1 is a className only) · type hierarchy recomputed: H1 48.6/54/54 vs H2 32/35/35 at 1280/1440/1728 — the research's oversized-type license taken WITHOUT re-inverting session 37's fix.

**A reviewer false-alarm worth keeping:** the pinned text "A claim is checked before the order is placed." matched nothing in a line-grep — because it is split across a `<span>`. Session 38's split-node lesson, recurring on the REVIEWER'S side. The text is byte-identical; the rail holds. A finding that dies under its own re-check is the process working.

**Litmus 7/7 YES** (brand in first screen · one anchor — the centred hero-object · scannable by the five-H2 narrative · one job per section after D-6/S2 · cards = the interaction itself · motion serves hierarchy, no theatrics · premium on hairlines, shadows only where elevation is meant). **Hard-rejection sweep: none apply** — and N-1+S3 close the one that loomed ("strong headline with no clear action").

**The pass's own honest misses, accepted as recorded:** the stacked sample/download pair tops out at ~32px hit area without recomposing the slot (recorded, not faked) · `.cs-pause` at 38px near-miss · R-3 correctly deferred to a reachability-proofed pass · fold verified by arithmetic only (zones ≈802px at 1280×900, run-gap ≈81px < 200 — **stale, corrected 2026-07-31**: 81px omits `.fd-paste`, and cannot explain the one rendered fact on record (button top 970.5 vs zone bottom 871.7 = **98.8px**, `canonical.spec.ts:136`)) — **the e2e suite must confirm on the next network-capable run.**

**Process finding adopted as a rail (the agent's HIGH):** `canonical.spec.ts` pins the five-H2 sequence AND the nav labels with `toEqual` — any future redesign brief must list these as rails first. Neither input audit had flagged it.

**Still open after this pass:** e2e + honesty-c10 on a network-capable build · R-3 purge (268 orphans + `.cs-acc`) · the three-"or"s copy nit · deploy (owner word).

---

## Addendum — session 41 re-evaluation (Onest reversal + `/interaction-design`, same day)

**Trigger:** owner, after the deploy — *"invoke all the design plugins, skills and subagents to reevaluate it, blindspots, gaps, passes"*, then `/interaction-design`. Two independent read-only agents plus an inline motion pass. No browser rendered: Chromium is Mach-port denied and ports are EPERM in this sandbox (raw on record, four approaches tried).

### The finding that reverses a claim I had recorded

I warned in the handoff that the Onest swap endangered the fold, because 58 `max-width: *ch` boxes resolve against the font's own `'0'` advance and I believed Onest's was narrower. **Measured, it is the opposite.** Both variable TTFs were parsed directly (`hmtx` + `HVAR` delta-sets), cross-checked against Next's bundled capsize table to within 0.1%:

| | Nunito | Onest | Δ |
|---|---|---|---|
| `'0'` advance @ wght 460 (**the `ch` unit**) | 0.6000 em | **0.6640 em** | **+10.7%** |
| frequency-weighted average advance | 0.4633 em | 0.4790 em | +3.4% |
| avg ÷ `'0'` | 0.7722 | **0.7214** | **−6.6%** |

Every `ch` box grows 10.7% while the text inside grows 3.4%, so roughly **6.6% more characters fit per line**. No `ch`-capped box gains a line; `.cs-lede` *loses* one (3 → 2, −28.9px). **The swap moves the fold in the safe direction.**

**And the "28px of margin" I was protecting does not exist.** That figure (`canonical.spec.ts:127`, 871.7 ≤ 900) was recorded on 2026-07-29 against a layout containing a `.cs-copy` wrapper and a 78ch instruction wall — both deleted by S1 earlier today. Computed headroom on the current tree is ~127–146px. *A geometry contract's recorded number expires when the geometry changes; the comment survives the layout it measured.*

### The hero fork, resolved on arithmetic rather than taste

One branch cannot be built without abandoning what defines it. The v8 hero is `<CommonsScene>`, and `.cs-hero` carries `min-height: calc(100vh - 68px)` — **832px consumed at 1280×900** against a 900px fold ceiling that `canonical.spec.ts:104-137` pins. Message-first-as-v8-hero cannot satisfy a contract the direction doc lists as untouchable.

Two supporting facts. The workbench-first demand was stated twice in the owner's own words *with a diagnosis attached* ("the website looks like a display piece with numbers … I want ready to use website to upload test files") and then encoded as a regression test; the v8 repost carries no instruction. And **the H1 is byte-identical in both versions** — what the owner was admiring in that screenshot already ships, at 48.64px rather than v8's 42.24px. What v8 had that screen one lacks is the scene artwork as an anchor, and the scene still exists; it moved, it did not die.

### Interaction + state findings (ranked, all unrendered)

1. **The instrument arrives without its verb.** At 1280×900 the first screen shows two empty dashed boxes; the run control (`AuditWorkbench.tsx:256`) is `disabled` at first paint *and* below the fold (button-top ≈970 vs zone-bottom ≈872 on the old measurement), and the sentence explaining why — *"Add a feed to run the audit"* — sits below the fold with it. For a tool whose stated purpose is uploading test files, the missing word on arrival is "run." Reclaiming ~20–40px above the zones (any two of: `.home-lead` padding-top −18px, `.wb` margin-top −8px, `.fd-zone` padding −32px) puts the whole instrument on screen one. **Not applied — it is the owner's first screen.**
2. **The nav's one emphasized action is a no-op on `/`.** `Nav.tsx:168` marks `href === "/"` as the filled ultramarine pill, so on the landing the most visually dominant control on the page navigates nowhere, while also carrying `aria-current="page"`. **Not applied:** `canonical.spec.ts:274-276` pins `a[href="/"]` for the `aria-current` contract, so retargeting it to `/#audit` is a test-touching change and belongs with the owner's fork decision.
3. **`.fd-hint` is the fragile above-fold box, and no `ch` analysis would find it** — `globals.css:3433` sets no max-width, so it fills its cell (496px) and the record hint measures 426.8px = **86.1%** under Onest. A few more characters wraps it and pushes both drop zones down ~21px. The one above-fold text box with no `ch` cap at all.
4. **`tabular-nums` on sans-set figures is an untested inheritance.** `.fd-status` and `.wb-tally` assert changing counts "hold column"; those were authored and checked under Nunito and have never rendered under Onest, and whether Onest ships `tnum` is not determinable from this seat. Check after rebuild: render the tally at 1 / 8 / 11 / 88 and confirm the digits do not shift.
5. **`.lp-h2` carries the file's tightest tracking (−0.038em) at its smallest display tier.** Approved under Onest at 42px; since then the size was cut to `clamp(25px,2.5vw,35px)` and the weight raised, so the same number now lands ~10px smaller and 60 heavier than when anyone last looked at it. Tighter tracking hurts more as size drops — the likeliest place the restored face reads wrong.
6. **`/docs` sits outside the weight pass entirely** — `.docs-main h1` and `.docs-main .sect h2` are both **560** against 680/660 everywhere else. The "too thin" complaint that produced the weight pass was made *against Onest*, and the fix never reached this page, so restoring Onest restores that exact thinness. Pre-existing, not caused by the reversal.
7. **Two chrome elements sit below the 12px caption floor** — `.nav-case` 10.5px, `.fd-sample` 11.5px. Both clear contrast; noted because `.fd-sample` ("USE THE BUNDLED FEED") is the fastest path a first-time visitor has to a verdict.

### Checked and cleared, so they are not re-raised

`@keyframes stamp-neq` is defined **once** — a `grep -o` counted the comment asserting that as a second definition, and the duplicate was a false positive; session 40's I-2 holds. **118 transition/animation declarations animate zero layout properties** (no width/height/top/left/margin/padding), so I-3 holds. **24 `prefers-reduced-motion` blocks.** Zero keyframes referenced-but-undefined, zero defined-but-unreferenced. Weight reversal proven complete 1:1 against `85cba2e` (nine weights added, nine reversed). No synthesized-weight risk (all declared weights inside both axes). Slashed-zero unaffected (all six selectors resolve to JetBrains Mono).

### Corrected in the file as a result

The landing's tracking comment argued for `-0.028em` on Nunito grounds that are now false on every clause; the value is kept on the better ground that /proof and /docs carry the same figure *from the Onest era*, and `-0.034em` is recorded as unvalidated rather than retired. `font-optical-sizing: auto` is labelled inert — neither face has an `opsz` axis, so it has never done anything and must not be counted as a lever. The file header's "rounded-sans" descriptor now reads "neutral grotesque."

---

## SYNTHESIS — five reporting passes collapsed into one resolution list (session 41 close)

Owner: *"complete all the plugins have reported their results synthesize together … resolve it."*
Reporting sources: session-40 design review (R-1…R-7) · `/interaction-design` · the landing
end-to-end UX agent · the Onest-reversal blindspot audit · `/ce-frontend-design` Module C litmus.

**Mode, established before any opinion was applied:** `/ce-frontend-design` Layer 0 returns
**Existing system** on 7 of 7 signal categories (116 design tokens · a two-voice self-hosted
font system · 11 motion tokens · a 10-step spacing scale · DESIGN.md · 8 pinned design e2e
specs · 8 shared components). Under that skill's own authority hierarchy its aesthetic
opinions **yield** to the established system; only Module C (make it belong), the copy,
accessibility and verification layers apply. No aesthetic direction was imposed.

### Two things reported as signals that are NOT findings — recorded so they are not re-raised

1. **"36 interactive elements, 23 focus rules" is a false alarm.** `globals.css:800` carries a
   bare `:focus-visible { outline: 2px solid var(--signal) }`, which applies to every element
   in the document. The floor is met by construction, not by enumeration.
2. **The cards litmus ("22 card radii, 1 interactive") used a bad denominator.** `--r-card` is
   a *radius token*, not a card treatment, and this product's panels are report surfaces, not
   clickable units. The real question — would removing a panel's border and shadow hurt
   comprehension — is a judgment call on about three surfaces, not an audit of 22. No card
   audit was opened on that number.

### The strongest finding is the one that surfaced TWICE, independently

**The instrument arrives without its verb.** Session 40's R-5 recorded it as *"the page's
primary action is disabled by default, with its instruction as a caption."* Today's landing
agent re-derived it from geometry without seeing R-5: at 1280×900 the run control is `disabled`
at first paint **and** below the fold, together with the sentence explaining why. Two
passes hours apart on the SAME DAY by different methods, same defect (an earlier draft said 'months apart' — false; every session-40 commit is dated 2026-07-31). That is much stronger
evidence than either alone, and it is why this sits at the top of the owner-gated list rather
than in the deferred pile.

### Resolution

**Applied this session (all verified: tsc 0 · eslint 0 · vitest 1610 + 8 skipped):**
Onest restored with weights reversed −60/−40 · production register across 12 files ·
`viewport.themeColor` + `colorScheme` · two-column `/report` masthead at ≥1080px ·
the three-"or" stack reduced to one · three false statements corrected in `globals.css`
(the Nunito-grounded tracking argument, the inert `font-optical-sizing` claim, the
"rounded-sans" descriptor) · the dead display-tier block deleted as a live trap.

**Owner-gated — deliberately NOT applied.** Every one touches the first screen or a pinned
contract, and the owner owns both:
1. The fold reclaim that would put the run verb on screen one (~20–40px above the zones).
2. The nav's emphasized action, which is a no-op on `/` (`canonical.spec.ts:274-276` pins
   `a[href="/"]` for the `aria-current` contract, so retargeting is test-touching).
3. The hero fork — **resolved on arithmetic, awaiting the word**: workbench-first wins because
   the v8 branch cannot satisfy the 900px fold ceiling (`.cs-hero` alone consumes 832px).

**Deferred with a stated reason:** R-3 dead-CSS (a build-hash proof is meaningless while the
chrome is being rewritten) · `/docs` headings at 560 (pre-existing, outside the reversal's
scope) · `.lp-h2` tracking and `tabular-nums` under Onest (both need a render this seat cannot
produce) · the unvalidated `-0.034em` landing alternative.

**No further code changes in this pass, and that is the correct outcome** — the synthesis was
the deliverable. What remains is a render, and three decisions that are the owner's.
