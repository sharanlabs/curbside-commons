# Spec — Calibrated Domain-Quality ("Effective"-axis) Judge

**Track B1** of the 2026-06-25 multi-agent pivot (`docs/plan-multi-agent-execution.md` §7). The
**Effective**-axis analogue of the P3 Faithfulness judge (`docs/spec-semantic-judge.md`): where the
faithfulness judge asks *"is every claim true to the data?"*, this judge asks *"is this draft good
merchant-activation practice?"* Together they are the two ship-bar axes — **SC-1 Faithful** (0
unsupported claims reach "approved") **AND SC-2 Effective** (domain quality ≥ a calibrated threshold).

Source of the rubric: the cited, source-backed KB `knowledge/domain/merchant-activation-kb.md` (Track
B0, commit `2cc4a2d`) — **researched, not credentialed** (AM-7; see R-DHON-2). This spec mirrors the
faithfulness spec's structure and rule discipline; rule prefixes are **R-DARCH / R-DCAL / R-DHON**.

Advisor-shaped (2026-06-26, before any code): the five constraints below are folded into the rules and
flagged inline — (1) situation-in-not-answer-in, (2) live per-item marginal-value enforcement, (3) §4.2
isolated + per-dimension recall, (4) platform-side deferred not fabricated, (5) a held-out floor.

## 1. Goal (DONE looks like)

A **calibrated, cross-family** domain-quality judge that scores a gate-passing, faithful outreach draft
on whether it is **good domain practice** across three rubric dimensions — **matched-to-blocker**,
**engagement-appropriate**, **no-over-promise** — and is measured with precision / recall / F1 (+ recall
CI) + Cohen's κ + test-retest flip-rate on a **held-out** gold split, **per dimension and aggregate**,
then **eval-locked**. The live calibration is owner-gated on a free `GROQ_API_KEY` + a fresh daily token
window ($0); the offline machinery is buildable now at $0.

## 2. Scope

**In (B1):** the rubric module (from KB §2.1 / §3 / §4.2), the stratified gold set, the calibration
harness + metrics (reusing `lib/evals/judge-metrics.ts`), the deterministic **mock** judge + the
**live** Groq judge (wired, key-gated), the offline calibration test, and the key-gated live test.

**Out (B1) — deferred, named not dropped:** wiring the judge into agents + the ship gate (**B2**);
**platform-side** escalation calibration (R-DCAL-3 — deferred, needs the `blocker_source` instrumentation
signal `diagnosis.ts` does not emit; documented rubric rule only); the A3 multi-agent split.

## 3. Architecture (binding decisions)

- **R-DARCH-1 (Ubiquitous):** The judge SHALL accept a draft's customer-facing prose (subject + body)
  plus the merchant **situation** and return, under a Zod schema,
  `{ dimensions: [{ dimension, pass: boolean, rationale: string }], domain_defective: boolean }`. The
  per-dimension list IS the audit trail surfaced to the human reviewer. `domain_defective` SHALL ALWAYS
  be recomputed from the per-dimension `pass` flags (`= dimensions.some(d => !d.pass)`) — never trust a
  model's own aggregate (mirrors `semantic-judge.ts` recomputing `any_unsupported`).
- **R-DARCH-2 (Ubiquitous) — SITUATION-IN, NOT ANSWER-IN (advisor #1, make-or-break):** The judge SHALL
  receive the merchant **situation** (`engagement_state`, `current_blocker_code` + label,
  `merchant_category`, `steps_completed`/`total_steps`, `risk_level`) and the KB-derived rubric
  **standard**, and SHALL reason about strategy-fit **cold**. It SHALL NOT be given the pre-computed
  "correct play" (`diagnose(m).play.action` / `.touch`). Feeding the answer in would reduce calibration
  to a near-deterministic string-compare — a wrapper, not a judge. *Situation in; the judge infers fit
  from the rubric.* (The gold-set LABELS are objective by construction per R-DCAL-4; that is separate
  from — and must not leak into — the judge's runtime input.)
- **R-DARCH-3 (Ubiquitous) — CROSS-FAMILY judge, provider-agnostic boundary:** The default live judge
  SHALL be **Groq `openai/gpt-oss-120b`** in strict structured-output mode, behind the same boundary
  shape as `semantic-judge.ts` (resolve model from one place via `DOMAIN_JUDGE_PROVIDER` /
  `DOMAIN_JUDGE_MODEL`, defaulting groq / `openai/gpt-oss-120b`, keyed on `GROQ_API_KEY`; budget-wrapped;
  injected `generate` for tests; mock fallback). Cross-family vs the Gemini-Flash drafter restores the
  "maker ≠ judge" independence at the model layer (R-ARCH-3 / R-LOOP-5). The model id + Groq strict-mode
  SHALL be re-verified at use-time (RULES §6).
- **R-DARCH-4 (Event-driven):** WHEN `runGatekeeper` returns `approvedForHumanReview = true`, the domain
  judge SHALL run as a secondary control. It measures the **residual** — drafts that pass the
  deterministic gate AND are faithful but are still poor domain practice. WHEN it reports
  `domain_defective = true`, the system SHALL mark the draft WARN/hold for the human (recall-favoring; a
  false flag is cheap, a missed bad-practice send is the costly miss). The judge SHALL NOT auto-reject.
- **R-DARCH-5 (Ubiquitous, deterministic-first):** A deterministic **mock** judge (fixed, inspectable
  verdicts from `diagnose()` + a regex over over-promise phrasing) is the $0 test + REPLAY path; the
  **live** judge is key-gated; all cost flows through `lib/agents/budget.ts` (no-ledger live call ⇒ fail
  closed). Untrusted free text (merchant name, model-authored prose) is data, never instructions.

## 4. Calibration protocol (what makes it "calibrated")

- **R-DCAL-1 (headline + marginal value — advisor #1 + #2):** The HEADLINE metric SHALL be **recall on
  the judge-territory subset** — positives that **(a) pass the real `runGatekeeper`** AND **(b) are
  faithful** (the faithfulness `mockJudge` finds no unsupported claim). The harness SHALL ENFORCE both,
  **live, per gold item** (not assert them in a comment): a positive the gatekeeper blocks, or that the
  faithfulness check flags, is recorded as **caught upstream** and excluded from the domain judge's
  numerator (it tests an upstream control, not this judge). This proves the catch is a **pure domain
  residual** — and, as at P2, will surface any defective gold item that fails the partition.
- **R-DCAL-2 (per-dimension reporting — advisor #3):** Metrics SHALL be reported **per dimension**
  (matched / engagement / over-promise) **and** aggregate. The over-promise dimension (§4.2) is the
  fuzziest and most contestable; isolating its recall prevents it silently dragging or inflating the
  aggregate κ.
- **R-DCAL-3 (the three calibrated dimensions + objective anchors):**
  1. **matched-to-blocker** (KB §2.1) — does the message address the merchant's actual blocker, vs a
     generic "complete your signup"? Objective anchor: `current_blocker_code`.
  2. **engagement-appropriate** (KB §3) — actively-stuck → step nudge; ghosted/dormant → re-prove value
     FIRST; new → light welcome. Objective anchor: `engagementState(m)`.
  3. **no-over-promise** (KB §4.2) — restricted to **implied / typicality** phrasing that DODGES the
     deterministic regex (e.g. "stores like yours become neighborhood favorites"), i.e. §4.2's genuine
     residual beyond the guardrail + faithfulness. Revenue/%/urgency/completion over-promises are caught
     upstream by the guardrail and are R-DCAL-1-excluded.
  **Platform-side escalation** (KB §1.3 B6 / §2.1 last row) is a documented rubric rule but **DEFERRED
  from calibration (advisor #4):** `diagnosis.ts` emits only `merchant_side`, so calibrating it would
  require fabricating data the synthetic model does not carry — a violation of the KB honesty banner +
  the "enterprise-claims-must-be-researched" rule. Revisit at B2 with a real `blocker_source` signal.
- **R-DCAL-4 (objective-by-construction labels):** Every positive SHALL be authored from a **matched,
  gate-passing `mockDraft`** with its BODY swapped for a generic / mismatched / implied-over-promise
  variant; the label (`domain_defective = true` + the violated dimension) follows from the construction,
  not subjective taste. Each carries a written critique (few-shot material). **All positives are
  SYNTHETIC / planted + labeled** (the recorded live drafts are matched + well-grounded → organic
  domain-defects ≈ 0); the calibration report + docs SHALL say the metrics are measured on synthetic
  domain-defects (mirrors R-CAL-4 / the binding honesty reframe).
- **R-DCAL-5 (gold size + held-out floor — advisor #5):** The gold set SHALL carry **≥4 test-split
  positives PER calibrated dimension** (so test-split per-dimension recall is never computed on ~3
  items). Start stratified at ~30–40 and grow toward the ~100 validation floor; the binding constraint is
  **positives-per-dimension**, not total N. A tune/test split SHALL be declared per item.
- **R-DCAL-6 (metrics — all four; raw accuracy misleads under imbalance):** The harness SHALL report
  precision / recall / F1 (+ Wilson recall CI) on the domain-defective class; TPR / TNR on a HELD-OUT
  test set; Cohen's κ (judge vs label); and test-retest flip-rate over K = 3–5 reps @ temp 0. Reuse
  `lib/evals/judge-metrics.ts` unchanged (the metric math is axis-agnostic and already unit-tested).
- **R-DCAL-7 (threshold + PRE-REGISTERED bar — like P3):** The operating point SHALL be tuned for high
  recall on the **tune** split; the recall floor + acceptable precision (per dimension) SHALL be
  **pre-registered in `docs/domain-calibration-status.md` BEFORE the held-out test split is read**; and
  performance SHALL be reported on held-out. The threshold + gold set SHALL be regression-locked in
  `evals/` so domain-judge quality cannot drift.

## 5. Failure-modes → mitigations (build these in)

| Failure mode | Where | Mitigation |
| --- | --- | --- |
| **Tautology** (judge fed the answer) | design | R-DARCH-2: situation-in only; the judge infers fit from the rubric, never receives `diagnose().play` |
| **Redundant with upstream** (re-catches gate/faithfulness) | calibration | R-DCAL-1: live per-item partition — positives must pass the gate AND be faithful, else excluded |
| **Subjectivity inflates κ** | labels | R-DCAL-4: objective-by-construction labels; §4.2 isolated (R-DCAL-2); per-dimension recall |
| **Self-preference** (model judges its own family) | live | R-DARCH-3: cross-family Groq judges the Gemini-Flash drafter |
| **Fabricated domain coverage** | gold | R-DCAL-3: platform-side DEFERRED, not faked; all positives synthetic + labeled (R-DCAL-4) |
| **Lab-vs-prod gap / overclaim** | docs | R-DHON-1/3: directional + CIs until the held-out floor clears the pre-registered bar; Codex gate |
| **Flippy judge corrupts the lock** | live | R-DCAL-6 flip-rate + R-DHON-4 frozen fixture (never a live re-run) |

## 6. Honesty + eval-lock constraints (hold the line)

- **R-DHON-1:** Docs SHALL NOT flip from "designed rubric" to "built + calibrated, F1 = X" off the small
  set. Report estimates with CIs and call them **directional** until the held-out floor clears the
  pre-registered bar (mirrors R-HON-1).
- **R-DHON-2 (AM-7):** The rubric SHALL be framed as **researched + source-cited (the B0 KB) + owner
  judgment**, NEVER a credentialed practitioner's or marketplace-insider's expertise. Every rubric rule
  SHALL cite a KB section; the rubric module SHALL carry the honesty banner.
- **R-DHON-3:** No "built / calibrated" claim ships until the metrics exist AND clear the pre-registered
  bar AND the Codex gate APPROVEs.
- **R-DHON-4 (eval-lock):** The regression test SHALL assert against a FROZEN judge fixture (one temp-0
  recorded sample), NEVER a live re-run — mirror `evals/live-samples.test.ts`. The flip-rate is the
  honest disclosure that a re-run could differ.

## 7. Phases (each shippable + gated; commit per clean green step)

- **B1a — rubric + spec (offline, $0).** This spec + `lib/domain/effective-rubric.ts` (the KB-cited
  standard + the situation extractor; R-DARCH-2 / R-DHON-2).
- **B1b — the judge (offline, $0).** `lib/agents/domain-judge.ts` — mock + live Groq (DI for tests),
  per-dimension Zod schema, situation-in prompt, budget-guarded, fail-closed (R-DARCH-1/3/5).
- **B1c — gold + harness + offline calibration (offline, $0).** `evals/gold/domain-gold.ts`,
  `evals/gold/domain-harness.ts`, `evals/domain-calibration.test.ts` — metric math vs hand-computed
  matrices; R-DCAL-1 enforced LIVE; mock = labeled stub baseline, never gated; per-dimension recall.
- **B1d — live calibration (OWNER-GATED on `GROQ_API_KEY` + a fresh daily window, $0).**
  `evals/domain-calibration.live.test.ts` (auto-skips offline) + `docs/domain-calibration-status.md`
  (pre-registered bar BEFORE the run). One clean run → held-out per-dimension metrics → eval-lock IF the
  bar clears, else tune on the tune split + re-run.
- **B1 gate.** grill → Codex (`~/claude-os/bin/codex-guarded`, verdict in `docs/reviews/`) → `verify` →
  acceptance-gate. Then **B2** (wire the KB into agents + the domain judge into the ship gate).

## 8. Owner-gated stops (do not bypass)

The **live Groq calibration run** (fresh daily window) · any spend beyond $0 · commits/pushes (autopilot
commit-each-green is the active mode for reversible $0 slices; **push** stays owner-only) · wiring the
judge into the runtime ship gate (B2) · public posting · anything irreversible/external.
