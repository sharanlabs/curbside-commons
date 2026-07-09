# Plan — Whole-site redesign implementation ("Oxblood" system)

**Status:** owner decisions FIXED 2026-07-08 (decision-log row this date); NOT yet built.
**Stage:** DESIGN → IMPLEMENTATION (gated product-code build).
**Owner-fixed inputs (AskUserQuestion, verbatim selections):**
1. **Direction = "Oxblood v2 (burgundy)"** — `mockups/ultra-modern-2026-07-08/whole-site-gallery-v2.html`.
2. **Identity = one common name sitewide — "Curbside Commons"** (owner word 2026-07-08, verbatim: "lets have a common name curbside commons" — SUPERSEDES the same-day AskUserQuestion pick "Unify → Commerce Truth Audit"; decision-log row this date). Retire page-title "ActivationOps" and the "Commerce Truth Audit" wordmark from the site; "Curbside Commons" (already `lib/product.ts:13` `PLATFORM_NAME`, no-collision screen 2026-06-20) becomes the one name. Simulated/prototype framing stays byte-frozen so the name never implies a real operated platform. Repo name / README / S-11 real-brand adoption = separate owner acts.
3. **TOTAL_STEPS = 5** — landing pipeline copy correct as built.

## Spec sources (the mockup IS the spec — read these, don't re-derive)
- **Design system / tokens:** `whole-site-gallery-v2.html` (`:root` + top comment) — premium off-white `#FBFBFD`, warm near-black ink `#1A1712`, ONE burgundy accent `#8A2233` (wine hover `#6E1423`), severity kept perceptually far from brand (error `#D92D20`, warn `#B54708`, pass `#067647`), serif-display (`ui-serif`/New York/Georgia) + system-sans + mono, 16 custom monoline inline SVG icons, scroll-reveal motion (`prefers-reduced-motion`-gated), **grid removed, 0 gradients**.
- **Content:** `whole-site-copy-deck.md` (every line file:line-cited) + `whole-site-story-arc.md` (7-movement spine + per-surface samples). Honesty self-audited.
- **Anti-slop bans (research-forced):** no blue→purple/indigo, no gradient-clip headlines, no glow/orbs, no `01/02/03` numbered markers, no `rounded-2xl shadow-lg`-on-everything, no glassmorphism, no cardocalypse, no colored left-border strips, no icon-in-rounded-square tiles, no worn Lucide (Sparkles/Zap/ArrowRight), no emoji, no cream/beige, not Inter-as-the-whole-system. Radii ≤ ~12px (one family per view). Motion structural-only.

## Ground reconciliation ruling (surfaced, not silent)
The whole-site rewrite **supersedes** the interim Ledger `/report` styling. Sitewide ground = **`#FBFBFD`** (v2 research pick). This changes the already-implemented `/report` + `/demo` from the committed Ledger `--paper #FFFFFF` — that is intended (the whole-site system replaces it). If the owner instead wants the sitewide ground held at `#FFFFFF`, that is a one-token override at planning — flag before S1.

## What is FROZEN vs what CHANGES (critical honesty distinction)
Unlike the Ledger `/report` restyle (which was CONTENT-FROZEN), this redesign **changes content** (story-arc narrative) per the owner's "layout + content" directive. But the **honesty invariants stay byte-frozen**:
- **SIMULATED banner** sentence — byte-verbatim from `components/report/ReportView.tsx`.
- **Footer honesty paragraph** — byte-verbatim sitewide.
- **Fixture tally** — 16 findings, 11 error / 5 warn / 0 info (from `fixtures/synthetic-restaurant/expected-report.acp.json`); the real 16 findings, plain-line-first + 4 receipts.
- **No fabricated metrics** — every number traces to repo/fixture; dashboard sample figures labeled illustrative-sample-data; never claim real DoorDash/Square/Uber Eats/Grubhub data/access/impact; "Simulated prototype, run on demand — not a live service."
- The **C10 honesty grep-gate** must pass over the NEW prose (it has bitten its own author before — keep it, reword prose if it fires).

## Real app surface tree (translate mockup → Next.js component tree; preserve data wiring)
Routes: `/` · `/console` · `/report` · `/demo` · `/eval` · `/metrics` · `/audit` · `/cost` · `/merchant/[id]`.
Components: `app/layout.tsx` · `app/globals.css` (1,720 lines) · `components/Nav.tsx` · `components/landing/{CatchPanel,Reveal}.tsx` · `components/report/ReportView.tsx` · `components/demo/DemoView.tsx`.
**Do not hardcode data** the real pages compute/load (e.g. `/report` renders the real fixture) — re-skin, keep the wiring.

## Slice DAG (each slice = full per-slice gate)
- **S1 — Foundation / shared shell** (blocks all): rewrite `app/globals.css` to the Oxblood token system + base/type/motion/icon primitives + shared utilities; `app/layout.tsx`; `components/Nav.tsx` (nav + honesty pill "Prototype · REPLAY · $0.00" + global footer with the verbatim honesty paragraph); unify brand → **"Curbside Commons"** (amended identity, decision-log 2026-07-08). **Keep the existing `.rpt-wrap` report/demo rules working** (additive site-token layer) so verify stays green until S3 supersedes them — OR bundle report/demo styling into S3 consciously. Gate: verify 947+6, test:legacy 306+5, red-green, Codex changed-files.
- **S2 — Landing:** `app/page.tsx` + `CatchPanel.tsx` + `Reveal.tsx` — editorial scroll-story: hero thesis, the **5-step** pipeline as a hairline-connected flow (gate step emphasized, NOT numbered cards), the "caught" moment, honest CTA. Content from copy-deck/story-arc.
- **S3 — Report + Demo (honesty-critical):** `report/page.tsx` + `ReportView.tsx`, `demo/page.tsx` + `DemoView.tsx` — re-skin to Oxblood, **supersede the Ledger styling**, reconcile ground to `#FBFBFD`; preserve SIMULATED banner byte-verbatim + footer + 16 findings 11/5/0 + the print stylesheet; **consciously update the +3 print-fidelity assertions + report/demo view tests red-green** (they were written for the Ledger system).
- **S4 — Data surfaces:** `/console` · `/eval` · `/metrics` · `/audit` · `/cost` · `/merchant/[id]` — compact density; ONLY repo/fixture-grounded numbers (honor the writer's `[VERIFY]` marks); dashboard figures labeled illustrative-sample-data; no fabricated series.

## Per-slice gate (RULES §13 full loop — this is high-risk product code)
Delegate build to `frontend-specialist@opus` (owner design-quality standard 2026-07-08) → **Fable-equivalence review** (line-level diff · live `npm run verify` re-run · red-green demanded) → elevation pass (same-breath PLAIN-ENGLISH/GLOSSARY) → **ONE Codex changed-files review** via `~/claude-os/bin/codex-guarded` (xhigh) → **acceptance-gate** on ship-gating slices / at module close. Floors every slice: **verify green ≥ 947+6**, **test:legacy 306+5**, engine untouched, zero external requests, `<title>` present, reduced-motion honored, contrast ≥ 4.5:1 recomputed on `#FBFBFD`.

## Routing (doctrine 2026-07-03)
FABLE seat = orchestrator/FINAL JUDGE; try harness `advisor()` first (down 18 straight — surface), then **`frontier-advisor` at the pre-approach commitment boundary** of the build session; Codex = adversarial input, reconciled primary-model-final. Seat-limit deaths: raw verbatim; one owner-confirmed retry; then NO-WAIT inline.

## Held / hard stops (unchanged)
Deploy stays a SEPARATE owner act AFTER the design lands (design-first ruling 2026-07-03) · live spend arming · public flip · S-11 name adoption (the "real" brand pick — Plumbline frontrunner — is separate from this in-site unify-to-"Curbside Commons") · classifier retry (new pre-registration + word). Pushes of authorized commits to the private origin are routine.
