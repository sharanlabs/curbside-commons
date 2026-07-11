# S6b Design Brief — "Meridian" (plan v3.3 §S6b(a), 2026-07-11)

**Author/route:** Fable (main session) @xhigh, per the plan's route tag. **Consumer:** the
S6b(b) builder (frontend-specialist@opus xhigh) + the Fable-equivalence review + batch C.
**Status:** brief FIRST, build second — this document is the build's spec.

▸ *Plain: this is the written design plan for one new sample web page. It says what we
studied (with dates and licenses), what we decided, exactly how the page must move and
behave, and every honesty rule the page must obey. The sample is a proposal for the owner
to react to — nothing on the live site changes.*

---

## 1. Authority + scope

- Owner direction row (decision-log 2026-07-10, verbatim there; binding floor): **vertical
  direction, not horizontal sliding · gallery pure white premium · animation, interactive,
  intuitive · icons · animations micro and macro · hold-and-release interaction kept ·
  references = Anthropic Fable re-release icon treatment + OpenAI Sol 5.6 hero, studied as
  principles, never copied ("I don't want a copy cat") · modern, away from the traditional
  way · all floors not ceilings — designer judgment and creativity on top.**
- Plan v3.3 §S6b: brief (a) then build (b); **hold-and-release**: the owner-AFK path is
  plan-sanctioned — **we design our own and say so** (§7 below), with a non-pointer/keyboard
  equivalent specified. Fonts decision AP-14 (§8) · canonical fragment matrix AP-15 (§9) ·
  dated adopt/reject source matrix AP-18 (§10).
- **SAMPLE ONLY.** Adoption to the live site is a later owner word. The shipped Oxblood site
  spec remains the live site's record.
- Emil source = the **VENDORED NEUTRALIZED copy only**
  (`~/claude-os/library/_external-skills/emilkowalski-skills/`, pin `b57fc72f`, MIT, vet
  CLOSED-PASS at `docs/reviews/s6a-emil-vet-2026-07-11.md`). Never the quarantine clone,
  never upstream live.

## 2. Reference study (live, dated 2026-07-11 — principles, never copies)

**Anthropic Claude Fable page (`anthropic.com/claude/fable`, fetched live 2026-07-11,
full HTML retrieved):**
- Hero = a *static* serif wordmark + **one animated logomark** (a Lottie vector-animation
  container on the mark itself — class `logo-lottie`); the icon is the single concentrated
  motion moment; the rest of the page is restrained.
- Light ground, strict **vertical axis**, serif display register with sans body, generous
  section rhythm (hero → cards → availability → use-cases → safeguards → proof → FAQ).
- **Principles distilled (adopted):** ① concentrate motion identity into ONE living mark;
  ② serif-display + light-ground = credibility register; ③ vertical rhythm with quiet
  sections between loud ones. **Rejected (not copied):** the Lottie runtime (external JS
  dependency — violates our zero-external floor); the carousel (horizontal — owner excluded
  horizontal sliding).

**OpenAI GPT-5.6 Sol page (`openai.com/index/previewing-gpt-5-6-sol/`) — ACCESS-LIMITED,
recorded honestly:** WebFetch → HTTP 403; direct fetch (both URLs, browser UA) → a 9.7 KB
bot-check shell only; Internet Archive fetch unavailable from this session; the Chrome
extension (live-view path) not connected. Secondary coverage checked (OpenAI community
announcement thread; launch press) carries **no visual-design detail**. → The Sol hero is
studied here only through the owner's own description ("hero design animations") and is
treated as the *named inspiration for hero-scale motion*, *not* as a studied artifact.
**No element below claims Sol derivation. Labeled: UNVERIFIED beyond the owner's naming.**

## 3. 2026 motion sweep (live, dated 2026-07-11 — distilled)

Swept (WebSearch 2026-07-11; sources in §10): Figma resource library "Web Design Trends
2026" · Studio Meyer "Webdesign Trends 2026" (w/ code examples) · UX Pilot "14 Web Design
Trends 2026" · Moburst landing-page trends 2026 · acodez micro-interactions/motion 2026.
Converging principles (all adopted — they agree with the Emil floor):
- **Motion as signage, not decoration** — orient, confirm, guide; minimal and purposeful.
- Scroll-reveal subtle, CSS-first, lazy, degrades gracefully; heavy parallax is out.
- Kinetic/oversized type + generous white space = the 2026 hero register.
- `prefers-reduced-motion` is standard practice, not an extra.
- Micro-interactions (press, hover, focus, state) are expected on professional surfaces.

## 4. Craft floor (Emil vendored copy, MIT @ b57fc72f — the neutralized copy only)

Binding values for the build (from `review-animations/STANDARDS.md` +
`animation-vocabulary/SKILL.md`):
- **Frequency table:** frequently-repeated UI = no/near-no animation; occasional = standard;
  rare/first-time = may delight. Never animate keyboard-shortcut-class actions.
- **Easing:** enter/exit `ease-out`; on-screen movement `ease-in-out`; hover `ease`;
  constant motion `linear`. Never `ease-in` on UI. Strong curves:
  `cubic-bezier(0.23,1,0.32,1)` (out) · `cubic-bezier(0.77,0,0.175,1)` (in-out).
- **Durations:** press 100–160ms · tooltips 125–200ms · dropdowns 150–250ms · modals/reveals
  200–500ms · UI stays <300ms; marketing/explanatory may run longer.
- **Physicality:** never `scale(0)` — enter from `scale(0.95–0.97)+opacity 0`; press
  feedback `scale(0.97)` ~160ms.
- **Performance:** animate `transform`/`opacity` only; CSS over rAF for predetermined
  motion; transitions (interruptible) over keyframes for anything retriggered.
- **Hold interactions:** `clip-path: inset()` overlay fill; **asymmetric timing** — slow,
  deliberate fill while pressing; fast `ease-out` retreat on release.
- **Stagger:** 30–80ms between items; decorative only, never blocking.
- **Reduced motion = fewer and gentler, not zero** — keep opacity/comprehension transitions,
  drop positional movement. Gate hover motion behind `(hover:hover) and (pointer:fine)`.

## 5. Concept — **Meridian**

File: **`mockups/meridian-2026-07-11.html`** (single self-contained HTML; zero external
requests).

One continuous **vertical meridian line** runs down the page spine — the plumb line the
story hangs from (the oldest instrument for checking truth against gravity: on-theme for a
verifier, and structurally the owner's vertical axis). Sections attach to the line at
**stations** — monoline icon nodes (the site's existing 20×20 currentColor icon language,
extended). Scrolling descends the meridian; each station's content reveals as it enters.

- **Ground:** pure white `#FFFFFF` (owner word; standing no-dark-background rule). Ink:
  near-black warm ink. Accent: ONE wine/burgundy accent in the shipped site's family
  (continuity with the live identity; builder tunes exact value, every text/ground pair
  ≥4.5:1). Severity is always **shape + word, never color alone** (standing rule).
- **Hero (macro motion #1):** oversized serif headline (the committed landing's H1 story) +
  **the Verifier Seal** — OUR one living mark (Fable-icon *principle*: one animated emblem,
  everything else quiet). A monoline SVG seal (shield + check, circular "MERIDIAN ·
  VERIFIED AGAINST THE RECORD" ring text optional) that **draws itself in** (SVG
  stroke-dashoffset line-drawing, ~1.2s, strong ease-out, once on load), settles, then a
  slow idle pulse (opacity 1→0.92, ~6s alternate). Reduced-motion: rendered fully drawn,
  no pulse. No Lottie, no runtime dep — hand-authored CSS/SVG.
- **Meridian draw (macro motion #2):** the spine line scales/extends downward tied to
  scroll (CSS scroll-driven `animation-timeline: scroll()` inside `@supports`; fallback =
  line fully drawn). Stations pop in (scale .95→1 + fade, 300ms ease-out, stagger 50ms)
  via IntersectionObserver; **no-JS and reduced-motion = everything visible, statically.**
- **Micro motion:** press `scale(0.97)` 160ms on all pressables · hover underline/lift
  gated `(hover:hover) and (pointer:fine)` · visible non-animated `:focus-visible` rings ·
  the hold overlay (§7). Nothing animates on keyboard shortcuts; nothing blocks reading.
- **Section map (vertical, in order):** `#top` hero+seal → `#catch` the Hold-to-Verify
  moment (§7) → `#problem` conformant-is-not-true → `#how` five stations (the committed
  five-stage flow: record → copies → comparison gate → receipts gate → human gate) →
  `#modules` three modules → `#evidence` labels-are-earned → `#honesty` simulated-prototype
  close + legacy lineage line + footer fragment.
- **Copy:** REUSE the committed landing's copy (`app/page.tsx`, S1-register, C10-green) —
  verbatim or tightened; **no new claims may be authored**. Figures mirror committed values
  exactly: golden tally **16 findings · 11 error / 5 warn · verdict FAIL (`ok:false`)** from
  `fixtures/synthetic-restaurant/expected-report.acp.json`; 78 pinned UCP schemas; 17 fee
  rules = 11 predicates + 6 registered non-checkable; 21/21 retry after the public 20/21
  DEFER; L-1 20/20. Real finding rows shown in §7's verdict card must mirror the golden
  by `claim.id` + `ruleId` + `plainLine` (id/rule-exact, like every prior sample).

## 6. What the sample is NOT
No horizontal sliding/carousels · no dark ground · no gradients-as-decoration · no
parallax depth stacks · no external fonts/scripts/images (§8) · no autoplaying attention
loops beyond the seal's idle pulse · no fabricated metrics, dates, or testimonials.

## 7. Hold-and-release — **designed our own, and saying so**

Per the plan's sanctioned owner-AFK path: **no external reference is copied here; this
interaction is ours.** Design registered as: **"Hold to verify"** — press and hold the
verdict seal-button; a wine-colored **`clip-path: inset()` overlay fills upward**
(bottom→top — the vertical axis again) over **1.4s linear** (slow, deliberate — the check
should feel weighed); releasing early retreats the fill in **200ms strong ease-out**
(asymmetric timing per §4); holding to completion **reveals the verdict card** — the
golden's real FAIL verdict, tally, and 2–3 real findings with receipts — with a 320ms
ease-out entrance. A subtle progress semantics cue ("hold…") appears while filling.

**Non-pointer / keyboard equivalent (specified, per plan):**
- The trigger is a real `<button>`; **holding Space or Enter** (keydown starts the fill,
  keyup releases — key-repeat handled) drives the *same* progress and release semantics.
- **No-hold path:** a visible plain control ("Reveal without holding") completes the same
  reveal instantly — one click/Enter, zero timing demand.
- **Reduced-motion path:** the hold fill is replaced by an immediate state change with an
  opacity-only confirmation; content identical.
- **No-JS path:** the verdict card's full content ALSO exists as a native
  `<details><summary>` disclosure in markup — readable and operable with JS disabled;
  the scripted hold interaction progressively enhances it.

## 8. Fonts — AP-14 decision

**Zero external requests; system stacks only. No exception needed, none recorded.**
- Display serif: `"Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif`
- Body sans: `system-ui, -apple-system, "Segoe UI", sans-serif`
- Mono (receipts/ids): `ui-monospace, "SF Mono", Menlo, Consolas, monospace`

## 9. Canonical fragment matrix — AP-15

Canonical in-page anchors (plain `<a href="#…">` links — operable no-JS): `#top` ·
`#catch` · `#problem` · `#how` · `#modules` · `#evidence` · `#honesty`. The five that
exist on the live landing (`#problem #how #modules #evidence #honesty`) use the SAME ids
(parity with `app/page.tsx`; the parent explorations' incompatible `#main/#top/#verify`
sets are superseded by this matrix). A skip-link (`<a href="#top">`… "Skip to content")
leads the tab order.

## 10. Source matrix — AP-18 (dated 2026-07-11; adopt/reject + licenses)

| Source | Date | License/access | Disposition |
|---|---|---|---|
| anthropic.com/claude/fable (live HTML) | 2026-07-11 | public page; studied as data | **ADAPT** — principles ① ② ③ (§2); Lottie runtime + carousel REJECTED |
| openai.com GPT-5.6 Sol page | 2026-07-11 | access-blocked (403/bot-shell); archive + Chrome paths unavailable | **DEFER/UNVERIFIED** — inspiration named by owner only; nothing derived (§2) |
| emilkowalski/skills, vendored @ b57fc72f | vet closed 2026-07-11 | MIT (notice retained; VENDORED.md) | **ADOPT as craft floor** (§4) — values cited, prose not copied |
| Figma "Web Design Trends 2026" | 2026-07-11 | public article | **ADOPT** principle: motion as core competency, purposeful |
| Studio Meyer "Webdesign Trends 2026" | 2026-07-11 | public article (code examples) | **ADOPT** principle: CSS-first, graceful degradation |
| UX Pilot "14 Web Design Trends 2026" | 2026-07-11 | public article | **ADOPT** principle: kinetic type + reduced-motion standard |
| Moburst "Landing Page Design Trends 2026" | 2026-07-11 | public article | **ADOPT** principle: hero = mini-product, trust-first; heavy parallax REJECTED |
| acodez "Micro-Interactions & Motion 2026" | 2026-07-11 | public article | **ADOPT** principle: subtle functional micro-interactions |
| easing.dev / easings.co (via Emil STANDARDS) | 2026-07-11 | referenced, not fetched | **ADOPT** the two named curves only (§4) |
| Prior repo mockup generations (mockups/) | committed | ours | **CONTEXT** — anchor-id incompatibility superseded by §9 |

## 11. Honesty invariants (machine-checked)

1. **SIMULATED banner byte-verbatim** vs `components/report/ReportView.tsx` (the sample
   renders golden findings → the banner is required): *"Synthetic test data — an invented
   restaurant, invented menu, invented prices. Not real DoorDash / Square / Uber&nbsp;Eats /
   Grubhub data, access, or business impact. The verification rules and the pinned
   data-format standard are real; the restaurant, its menu, and its records are invented."*
   (with the `SIMULATED` tag element).
2. Non-affiliation + "simulated prototype, run on demand — not a live service" register in
   the footer fragment; no affirmative real-platform/no-AI claims anywhere (C10
   BANNED_CLAIMS scan covers `mockups/**` recursively and will pick this file up
   automatically — the build proves that red-green).
3. Every figure mirrors a committed artifact (§5 list); no invented numbers; no
   "calibrated" claims beyond the earned label wording.
4. Brand names appear ONLY inside the banner/disclaimer mirrors above (S4 inventory rule).

## 12. Build gates — ADJUDICATED (2026-07-11, Fable-equivalence review + batch-C
## reconciliation; each item passed with the evidence noted — the batch-C P3
## against the unchecked list is discharged here)

- [x] Single self-contained HTML at `mockups/meridian-2026-07-11.html`; inline JS
      `node --check`-clean (extracted script, exit 0).
- [x] **Zero external requests** — grep over `src=|href=http|url(|@import|<link`:
      zero loaded-resource hits.
- [x] `prefers-reduced-motion` honored — seal fully drawn/no pulse; hold = instant
      opacity-only confirmation; reveals static; smooth-scroll gated to `auto`
      (elevation fix applied in review).
- [x] Contrast — every pair recomputed incl. composited tints: minimum **5.80:1**
      (`--error-ink` on its tint); ink 18.1:1, body 11.0:1, wine 8.9:1.
- [x] **No-JS readability** — `.js` hook is script-added only; the verdict card ships
      as a native `<details>` in markup; all stations visible statically.
- [x] **Keyboard** — hold path: Space/Enter keydown starts / keyup releases,
      key-repeat guarded, blur = release; no-hold reveal control; skip-link first;
      visible `:focus-visible` rings.
- [x] Semantic markup — landmarks, one `<h1>`, ordered headings, `role="list"` on
      styled lists, `aria-pressed`-free toggle design w/ `aria-expanded` synced on
      BOTH reveal controls (batch-C P2 fix), icons `aria-hidden` beside text.
- [x] Anchor matrix per §9 — all 7 ids present; the 5 shared ids parity-match
      `app/page.tsx` (batch-C confirmed).
- [x] Figures + finding rows — machine-verified claim.id + ruleId + plainLine EXACT
      vs the committed golden (3 rows incl. values `"2150"`/`in_stock`); tally
      16 · 11/5 · 0 info · `ok:false`.
- [x] Banner + honesty fragments — SIMULATED banner rendered-text machine-EQUAL to
      ReportView (entity-decoded compare); non-affiliation + not-a-live-service in
      the footer fragment; zero BANNED_CLAIMS.
- [x] `mockups/README.md` inventory updated (both 2026-07-11 artifacts = current/new,
      count 54→56) and **C10 pickup proven red-green** (planted overclaim → the scan
      FAILED naming this file → restored → 103/103 green).
- **Copy correction (batch-C P2, fixed):** the hold instruction originally said
  "Release completes it" while the code completes at the 1.4s mark and cancels on
  early release — reworded to "Hold until it completes … releasing early cancels."
