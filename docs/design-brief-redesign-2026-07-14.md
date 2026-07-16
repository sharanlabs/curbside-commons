# Design Brief — Curbside Commons full-site redesign + Vercel deploy (2026-07-14)

**Status:** ACTIVE build brief. Source of truth for the redesign lane. Owner-directed, ultracode session (Opus primary + gpt-5.6-sol cross-model, standing in for the Fable judge per [[fable-equivalence-review-bar]] / decision-log 2026-07-14).

**BUILD PROGRESS (2026-07-14, live):** A (understand) ✓ · **B1 (tokens + self-hosted Newsreader/Nunito/JetBrains) ✓** (verified: typecheck/lint/honesty-c10 green, build exit 0) · **D (disclaimer-free shell — footer credit + build-provenance, mobile nav, report/demo banners removed, frozen honesty tests rewritten red-green, BANNED_CLAIMS still bites) ✓** · **C-redo (faithful landing to sol's blueprint — the "Correspondence Field" hero background + Evidence Bench + Method + Coverage + Limits + Close, grounded in committed numbers, honesty-clean 0 banned words) ✓** (verified live + Playwright visual: vitest 1177 pass / 7 skip · e2e artifact 17 pass · build exit 0 · zero console errors · landing looks premium + honest). **E (de-jargon + polish report/demo/playground/eval/metrics/cost/legacy/404 — CLI/repo keeps honest labels) → IN PROGRESS.** THEN: F (anti-slop + QA + sol/Codex batch + acceptance-gate) → G (clean-room PRE-GATE → RELEASE GATE) → H (Vercel deploy, project `curbside-commons` on team `team_JFEjWZeHLROwGXXC755erEXl`, + install sol's GitHub hub README from `docs/redesign-copy-2026-07-14.md` + hand the owner the end-to-end test-run guide). The sol blueprint = `docs/redesign-blueprint-2026-07-14.md`. Hero was iterated by owner word to a SUBTLE background ("Correspondence Field"), replacing the earlier flanking lattice. Design source (read-only, untouched): `mockups/proof-theatre-proof-thread-3d-story-2026-07-14.html`.

**Goal (DONE looks like):** the `proof-theatre-proof-thread-3d-story` design language becomes the REAL, deployed Curbside Commons site — full-site restyle across all 17 routes, a new flanking-3D hero, WCAG-2.2 Pause control, responsive, honesty-clean (disclaimer-free but no false claims), professional copy by sol, shipped to **Vercel**, and the owner walked through an end-to-end test run ([[e2e-test-run-guide-deliverable]]).

**Verify:** clean-room PRE-GATE build (immutable `out/`) → RELEASE GATE (acceptance-gate SHIP + no-build battery: typecheck/lint/vitest/legacy/e2e-artifact/C10) → deploy → all routes 200 → owner test-run.

---

## Owner directives (verbatim, 2026-07-14, in order)

1. "lets proceed to build" → then confirmed intent to reach deploy.
2. "use sol and your judgement if needed as we are using opus model. so to compensate the fable judgement." → sol = cross-model judge + my judgement discharge the Fable-equivalence bar; primary-model-final holds.
3. Scope = **Full-site restyle** (all 30/17 routes), Motion = **Add a Pause control** (WCAG 2.2), Host = **Vercel** ("vercel is already there connect it").
4. "dont use word synthetic, test, doordash all those keep information in the background repo. So make it proper deployed website."
5. "dont mention it is fine i will explicitly state it and for the content language flow simple overall arc, use sol 5.6 to write it."
6. "make it professional dont mention example audit, that i will explicitly mention it. vercel is already there connect it." + effort=ultracode.
7. "and also guide me to do test run once done end to end. remember it." → [[e2e-test-run-guide-deliverable]].
8. "Use sol to write the github for curbside hub." → sol drafts the GitHub repo README/hub.
9. Hero: "replace the 3d hero animation… keep the centre hero content with ultra modern minimalist, live 3D animation in both side of the hero not rings and bills. let claude and sol choose which apt one."
10. "https://github.com/material-components refer to repos here as well this is google along with our capabilities." → Material 3 as an ADAPTED reference.
11. "have highest pixel quality 4k resolution." → canvas at full DPR, 4K-crisp.

## The honesty line (non-negotiable, RULES §4/§6 — wins over all)

Disclaimer-free is ALLOWED; **false claims are not.** Concretely:
- **Remove:** the SIMULATED banners, the S2 footer disclosure paragraph, all dev-jargon (`test`, `fixtures`, `synthetic`, `golden`, `corpus`, `stub`, `REPLAY`, `the repo`, repo file paths, raw shell commands), and **all real-brand names** (DoorDash / Square / Uber Eats / Grubhub / DataSF). Once brands are gone, the non-affiliation disclaimer is moot.
- **Keep true by construction:** no affirmative false claims (the C10 `BANNED_CLAIMS` grep-gate STAYS GREEN — it bans `no AI was used`, `connected to DoorDash`, `real … platform data`, etc.; it does NOT require a disclaimer). The engine output shown is a genuine computation on illustrative input; the site never asserts live platform data or real business impact. No fabricated metrics/testimonials.
- **Mechanism:** removing the frozen S2 footer contract + SIMULATED banner parity + demo-label + report-view print block + the e2e honesty assertions requires a **recorded FREEZE-REVERSAL row** in `docs/decision-log.md` (the S2 precedent at decision-log 2026-07-10), each removed test rewritten to the new honest state WITH a red-green bite, under a covering sol/Codex batch. Owner word for this is on record (directives 4–6).
- Owner owns the external "this is a demonstration" framing.

## Design identity (from the adopted mockup, FIXED)

- **Ground:** pure white gallery, generous whitespace, minimalist. (Mockup uses `--paper #ffffff`; the current site is off-white #FBFBFD — redesign moves to pure white; recompute all per-token WCAG ratios against #fff.)
- **Accents (four-hue, sparing):** ember `#e9472d` / gold `#e0a23f` / azure `#4f9cc7` / violet `#6758d9` (+ deep pairs). Severity stays shape+word, far from accents.
- **Type (three-voice):** serif DISPLAY (headings) + rounded SANS body (Nunito) + mono microtype (uppercase eyebrows/labels). **Self-host** both via next/font — the mockup's "New York" serif is Apple-only; pick a licensable editorial serif (e.g. Newsreader / Fraunces) for cross-OS consistency; Nunito via next/font/google (drop the 140KB inline data-URI).
- **Motion:** calm, structural. Material-adapted timing (see below). All motion inside `prefers-reduced-motion: no-preference` with an explicit reduce-kill. WCAG 2.2 Pause control on continuous hero motion.
- **Rendering quality:** full device-pixel-ratio, pixel budget raised to cover 4K (3840×2160), crisp vector drawing (owner: "highest pixel quality 4k").

## Hero — "Claim ↔ Record proof lattice" (Claude ⋂ sol, both picked #1)

Center 46–50% = copy + CTAs (untouched reading zone). Two narrow Canvas2D **flank** regions, clipped so geometry never crosses text. Dependency-free projected-3D (no Three.js).
- **Left "CLAIM SURFACE":** 12 hollow wafer-thin 3D glyphs on a shared 3×4 grid across 3 shallow depth planes, slightly displaced + independently rotated; faint incomplete graphite construction lines (unverified).
- **Right "MERCHANT RECORD":** the SAME 12 seeded glyphs locked to canonical coords; sparse orthogonal evidence lines; the resolved glyph gets a two-corner proof bracket (not a checkmark).
- **Motion:** seamless 14–16s deterministic loop. Left bounded drift (≤6px, 3–4°); right structurally stable. Every 3–4s one left glyph turns → 120ms later its right counterpart settles into depth, evidence segments draw, proof bracket appears. Never dissolves/"un-verifies" the right lattice.
- **Timing (one family):** ~600ms spatial settle, ~240ms color/opacity, 60–80ms choreography offsets; arrivals `cubic-bezier(0,0,0.2,1)`, in-field movement `cubic-bezier(0.4,0,0.2,1)` (Material spatial-vs-effect distinction, branded not app-like).
- **Color:** ≥90% pale graphite; ONE correspondence lit at a time — ember (active claim) → gold (comparison trace) → azure (matched record) → tiny violet (proof bracket). No gradients/bloom/fog.
- **Pause + reduced-motion:** one quiet outlined "Pause motion / Play motion" control lower-right, freezes/resumes both flanks on one timeline; `prefers-reduced-motion` loads a composed static frame (left displaced, right aligned, one correspondence lit) + "Play motion" opt-in. WCAG 2.2 SC 2.2.2 satisfied.
- **Risk guard (sol):** hollow glyphs + seeded topology both sides + low element count + orthogonal geometry + restrained color + exact cadence → "verification instrument, not ambient crypto/AI animation."
- **React port:** client component, imperative vanilla engine in a useEffect (idempotent teardown for StrictMode double-mount), IntersectionObserver + visibilitychange + resize + pointer + reduceMotion listeners, `userPaused` flag honored by the render gate, non-clearing freeze (keep last frame), SSR renders the static frame.

## Material 3 adaptation (borrow the invisible infrastructure, reject the visible skin)

- **BORROW:** duration scale (calm 150–350ms band), easing tokens (asymmetric enter/exit), reduced-motion discipline, 8px spacing grid, a11y floors (≥44–48px targets, 4.5:1 text / 3:1 non-text), per-component state discipline. **HCT tone-math** to guarantee gold/azure clear 4.5:1 on pure white (gold likely needs darkening for text).
- **ADAPT:** 3-tier token architecture (primitive four-hue+neutrals → semantic roles named for the gallery, NOT `primary/secondary` → component vars); type-scale role taxonomy re-derived in our serif+sans; state-layer mechanism using low-opacity ACCENT tint (not Material on-color math); elevation → near-flat hairline rules, no shadow.
- **REJECT (would read as stock Material):** ripple ink, filled-tonal buttons/FABs/chrome, Material color-role theming, the 0–5dp elevation ladder, Roboto.
- **License:** principles are not copyrightable; Apache-2.0 binds only if code is copied (we copy none). Optional courtesy credit only.

## Site structure (17 routes) — full-site restyle

Landing (`/`) is a fresh build to the new language + the flanking-3D hero. Landing section arc (adapted from the mockup, honesty-clean, sol writes copy): **Hero → 01 the shown catch (a claim checked against the record) → 02 the problem (schema-valid ≠ true) → 03 how it works (the checking flow) → 04 what it covers (measured, not inflated) → 05 honest limits (in the interface, not a hidden disclaimer) → closing CTA.** Data surfaces (`/report /demo /playground /eval /metrics /cost`) + legacy module (`/legacy/*`) + redirect stubs + 404 all inherit the new tokens/type/motion via `:root` (remember `.rpt-wrap` redeclares local tokens 1522–1544 → edit in lockstep) and get de-jargoned copy per the inventory. **Responsive is net-new** (mockup is desktop-only min-width 1120px) — build mobile/tablet layouts for every surface.

## Copy plan (routed to gpt-5.6-sol, adjudicated primary-model-final)

- Simple language, one clean overall arc (owner directive 5). Honesty-clean: no dev-jargon, no real-brand names, no false claims.
- sol deliverables: (a) the landing arc copy, (b) de-jargon rewrites for the 24 dev-jargon strings + softened capability claims (10) keeping repo-backed facts, (c) the **GitHub hub README** (directive 8). I adjudicate against the honesty line + C10.
- Inventory: `~95` strings — 41 honesty-critical, 24 dev-jargon-remove, 20 product, 10 capability-claim-needs-source (full map in the Phase-A workflow journal).

## Build phases

- **A · Understand** — DONE (app/mockup/honesty/copy maps + Material intake; this brief).
- **B · Design system + copy** — token layer (Material-adapted, HCT-verified contrast), type (self-hosted serif+Nunito), motion scale; sol writes landing copy + GitHub README.
- **C · Landing + hero** — new landing + the Claim↔Record flanking-3D hero (Pause, reduced-motion, 4K, responsive).
- **D · Shell + honesty freeze-reversal** — Nav/footer/layout retheme; decision-log freeze-reversal + rewrite the frozen honesty tests to the disclaimer-free honest state (each red-green).
- **E · Site-wide** — restyle + de-jargon /report /demo /playground /eval /metrics /cost /legacy/* + stubs + 404; responsive.
- **F · QA + adversarial review** — axe/a11y across breakpoints, e2e rewritten, visual QA; **ANTI-AI-SLOP / AUTHENTICITY AUDIT (owner word 2026-07-14: "have anti ai agent checks … do claudeos capabilities run through it")** run through claude-os capabilities — copy via `de-slop` / `humanizer` / `clarity-editor` / `anti-ai-slop-authenticity-reviewer`; design via `design-critique` / `adversarial-ux-test` / `screenshot-critique`; catch + fix AI-tells (generic phrasing, buzzword filler, uniform AI structure, generic-SaaS/gradient/particle UI, fake confidence) so the site reads human-premium, not AI-generated. Then the sol/Codex cross-model batch + the independent `acceptance-gate` (its 5 ship-gates already include a dedicated anti-slop gate). The whole build runs through claude-os capabilities: specialist subagents (frontend/research), gpt-5.6-sol cross-model, the Workflow engine, skills, and the gate panel.
- **G · Gates** — clean-room PRE-GATE build → RELEASE GATE.
- **H · Deploy** — Vercel (team `team_JFEjWZeHLROwGXXC755erEXl`, new project `curbside-commons`, target production) + the owner end-to-end test-run guide.

## Hard stops / guardrails (unchanged)

Deploy stays the owner's explicit word. No new live AI arming. No classifier re-run. C10 `BANNED_CLAIMS` green at all times. Honesty freeze changes only via recorded reversal + red-green + covering batch. Do NOT touch the other seat's uncommitted sample-lane mockups.
