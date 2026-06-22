# Spec — Calibrated Semantic Faithfulness Judge

**Status:** P0 deliverable (2026-06-22). Derived from the APPROVED plan `docs/plan-semantic-judge-and-deepening.md`. EARS-form requirements + acceptance tests. Build runs P0→P4; P3 live spend is owner-gated.

This spec is the contract. The plan is the rationale + research grounding; if they ever disagree on a *requirement*, this spec wins for what gets built and how it's accepted.

---

## 1. Goal (DONE looks like)

A **reference-grounded, per-claim entailment** judge that flags an *undeclared* factual assertion in a draft's prose that is not supported by the merchant's structured data — the exact gap `lib/agents/gatekeeper.ts:9-12` documents the deterministic forward-checker cannot cover. It runs as a **SECONDARY control AFTER** the deterministic gatekeeper, feeds the existing human gate (never auto-sends/auto-blocks beyond what's specified), is **measured** against a labeled gold set (precision/recall/F1 + Cohen's κ + test-retest flip-rate), **eval-locked**, **key-gated** for any spend, and **cross-model reviewed (Codex)** before any "built + calibrated" claim ships.

**The capability this substantiates (goal-lock 2026-06-22):** verification rigor — per-claim faithfulness of AI output against the **structured source of truth (the data row), not retrieved RAG context**. Honesty framing is binding: "we verify AI claims against the source of truth," never "no one automates this."

## 2. Scope

**In:** the judge module (mock + live-gated), its Zod contract, wiring as a secondary control, the gold set, the metrics harness, the eval-lock, three demo surfaces, the calibration report fixture, honest docs.

**Out (unchanged):** `lib/core/*` and the differential oracle stay UNTOUCHED. No new runtime persistence, no live public endpoint (public demo stays REPLAY/$0). No deploy. No scope beyond the plan.

## 3. Architecture (binding decisions)

- **R-ARCH-1 (Ubiquitous):** The judge SHALL accept a draft's customer-facing prose (subject + body) plus the merchant's structured facts and return, under a Zod schema, `{ claims: [{ text, supported: boolean, evidence_field: string|null }], any_unsupported: boolean }`. The per-claim list IS the audit trail surfaced to the human reviewer.
- **R-ARCH-2 (Ubiquitous):** The judge SHALL ground entailment on the SAME `CLAIMABLE_FIELDS` set the gatekeeper trusts (`lib/agents/gatekeeper.ts`). It SHALL NOT define its own ground-truth schema. The shared field set MUST be exported from one source of truth (mirroring how `lib/agents/state-consistency.ts` is shared by the eval + the gate) — extract `CLAIMABLE_FIELDS` to a shared module both import.
- **R-ARCH-3 (Ubiquitous) — CROSS-FAMILY judge via a provider-agnostic boundary (decision 2026-06-22, refines plan row 56):** The judge SHALL run behind a single provider-agnostic boundary (mirroring `lib/agents/gemini.ts`: resolve model from one source · preflight · budget-wrap · injected `generate` for tests). The DEFAULT live judge SHALL be **Groq `openai/gpt-oss-120b` in strict structured-output mode** (constrained decoding → 100% schema adherence), resolved via `JUDGE_PROVIDER` (default `groq`) + `JUDGE_MODEL` (default `openai/gpt-oss-120b`), keyed on `GROQ_API_KEY`. Rationale, against the owner's quality/structured/enterprise criteria: (a) **cross-family** — a Groq-hosted model judging Gemini-Flash drafts is the research-backed gold-standard self-preference mitigation (the "maker ≠ judge" law at the model layer), strictly stronger than the same-family Flash-Lite-judges-Flash of row 56; (b) **structured** — strict constrained decoding guarantees schema-valid per-claim JSON (Gemini's observed parse-failure rate is non-zero: 1/6 in `live-samples.snapshot.json`); (c) **enterprise** — verifier independent of maker + no single-vendor lock-in + free ($0, so the calibration is spend-free). Gemini Flash-Lite SHALL remain a configurable alternative via the same env (so the boundary is swappable, not locked). The model id + Groq strict-mode behavior SHALL be re-verified at use-time (RULES §6). **Build-time check (P1):** confirm the AI SDK Groq provider (`@ai-sdk/groq`) drives `generateObject` with the gpt-oss strict schema cleanly; if strict mode isn't exposed through `generateObject`, fall back to best-effort + the mock/fallback path (the judge already needs one, R-ARCH-6) — never a blocker.
- **R-ARCH-4 (Event-driven):** WHEN `runGatekeeper` returns `approvedForHumanReview = true` for a draft, the judge SHALL run as a secondary control on that draft. WHILE `approvedForHumanReview = false` (the draft is already BLOCKED), the judge SHALL NOT run (the deterministic gate already rejected it; the judge measures the *residual* — drafts that pass the gate but still carry unsupported prose).
- **R-ARCH-5 (Event-driven):** WHEN the judge reports `any_unsupported = true`, the system SHALL mark the draft WARN/hold for the human reviewer (recall-favoring: a human reviews downstream, so a false flag is cheap and a missed fabrication is the costly miss). The judge SHALL NOT auto-reject a draft. The exact decision rule + threshold are set during calibration (P3) and recorded.
- **R-ARCH-6 (Ubiquitous, deterministic-first):** The judge SHALL mirror `lib/agents/draft.ts`: a deterministic **mock judge** (fixed verdicts) is the test path + the offline plumbing; the **live judge** is `ENABLE_LIVE_AI`-gated; all cost flows through the existing `lib/agents/budget.ts` ledger (no-ledger live call ⇒ fail closed). Untrusted free text (merchant_name, draft prose authored by the model) is data, never instructions — carry the injection posture of `draft.ts`.

## 4. Calibration protocol (what makes it "calibrated")

- **R-CAL-1 (headline metric — advisor constraint #1):** The reported HEADLINE metric SHALL be **recall on the gatekeeper-PASSING subset** of drafts, not raw recall in a vacuum. The judge's real-world input is the residual that clears the deterministic gate; recall-on-the-passing-subset is the number that substantiates the positioning. Every gold-set POSITIVE SHALL first be run through the real `runGatekeeper`; IF the gatekeeper already BLOCKS it, THEN that item is recorded as "caught by the deterministic gate" and excluded from the judge's marginal-value numerator (it tests the gate, not the judge). Items SHALL be stratified by gatekeeper-pass.
- **R-CAL-2 (gold set):** The gold set SHALL start stratified at ~30 (iterate the judge prompt until no NEW failure mode emerges — saturation) and grow toward ~100+ as the validation floor. The binding constraint is **positives-per-failure-mode**, not total N.
- **R-CAL-3 (positives):** Planted positives SHALL cover the modes the forward-checker misses: invented numbers, unsupported capability/benefit claims, fabricated timelines ("by Friday"), fabricated entities/integrations, plausible-but-absent specifics. Each planted positive's design SHALL note whether it survives the guardrail scan (e.g. a percentage/impact claim like "80% set up" likely trips the guardrail and never reaches the judge — exclude or relabel; "by Friday" likely survives — genuine judge territory).
- **R-CAL-4 (real-supply probe — advisor constraint #2):** Before finalizing the gold set (P2), the build SHALL empirically probe the count of REAL mineable fabrications from `lib/data/live-samples.snapshot.json` (6 drafts) by re-running each through the CURRENT gatekeeper + inspecting prose. Initial inspection (2026-06-22) indicates the 6 drafts are well-grounded (real *fabrications* ≈ 0; the observed issues are leaks, already caught by the gate). IF real positives are scarce, THEN the calibration report + docs SHALL label the metrics as measured on **synthetic** fabrications (the binding honesty reframe applied to our own deliverable).
- **R-CAL-5 (labels — advisor constraint #3):** Labels SHALL be **objective field-entailment**, not subjective quality: for each prose assertion, name the supporting `CLAIMABLE_FIELDS` field, or mark it unsupported. Binary per-claim (supported/unsupported) + draft-level (clean/fabricated). Each label SHALL carry a written critique detailed enough to drop into a few-shot judge prompt. LLM-assisted pre-labeling is allowed ONLY with human adjudication; the Gemini family SHALL NOT be the sole labeler of its own fabrications (preference leakage). This objective rubric is what makes κ credible here (vs the subjective-quality judges in the cited papers).
- **R-CAL-6 (metrics — all four; raw accuracy is misleading under class imbalance):** The harness SHALL report (a) Precision / Recall / F1 on the fabrication class with a CI on recall; (b) TPR / TNR on a HELD-OUT test set (never the tuning set); (c) Cohen's κ (judge vs expert), targeting a bar comparable to GPT-4-judge-vs-human (>80% raw agreement, Zheng et al.); (d) test-retest flip-rate over K=3–5 runs @ temp 0 (Gemini is not bit-deterministic at temp 0; a flippy judge corrupts the regression lock).
- **R-CAL-7 (threshold, honestly):** The operating point SHALL be tuned for high recall on fabrications, with the precision cost reported at that point (PR curve), and **picked on held-out data with performance reported THERE**. The threshold + gold set SHALL be regression-locked in `evals/` so judge quality can't drift.

## 5. Failure-modes → mitigations (build these in)

| Mode | Risk | Mitigation (binding) |
|---|---|---|
| Self-preference (model judges its own family) | live | **cross-family** judge — Groq gpt-oss judges Gemini drafts (gold-standard mitigation, R-ARCH-3) + objective entailment (can't style-game) |
| Verbosity/position bias | low | structured per-claim bool; pointwise not pairwise |
| Miscalibration / over-leniency | waves through plausible fabrications | rubric + few-shot the expert critiques + CoT-then-verdict; calibrate threshold on held-out for recall |
| Prompt sensitivity / criteria drift | verdicts flip; criteria rot | version the judge prompt; test-retest flip-rate gate; treat the validator as itself needing validation |
| Lab-vs-prod gap | glowing eval hides breakage | negatives from real Flash output where available; metrics on a held-out prod-like set; synthetic-label disclosure (R-CAL-4) |

## 6. Demo surfaces (SHOWABLE — REPLAY-safe, $0)

All three render from a **recorded judge fixture** (frozen during P3, exactly like `live-samples.snapshot.json`) so the public REPLAY demo shows REAL per-claim verdicts at zero spend.

- **R-DEMO-1 (Merchant Detail — the centerpiece):** A "Faithfulness check" panel, a new step in the why-chain right after the gatekeeper, rendering the judge's per-claim verdicts on that merchant's draft — each prose sentence ✓ supported (→ the backing field) / ✗ unsupported.
- **R-DEMO-2 (Eval page — calibration dashboard):** precision / recall / F1, confusion matrix, Cohen's κ, test-retest flip-rate from the calibration run — so "calibrated" is visible and credible, not asserted.
- **R-DEMO-3 ("catch in action" exhibit):** one draft containing a real/planted fabrication shown being flagged. IF the shown fabrication is planted (not an organic Flash fabrication), THEN it SHALL be labeled as such; the credible organic version may require a few more live drafts (owner-gated spend) and SHALL be flagged to the owner rather than shipped as if organic.
- **R-DEMO-4 (Design rule):** The live judge runs only behind the key (P3); the public demo renders the recorded fixture (REPLAY, $0) — same honesty posture as today ("recorded run" labeled).

## 7. Honesty + eval-lock constraints (hold the line)

- **R-HON-1:** Docs SHALL NOT flip from "designed boundary" to "built + calibrated, F1=X" off the ~30 saturation set. Report estimates with CIs and call them **directional** until the held-out ~100+ floor (P3/P4) clears the stated threshold.
- **R-HON-2 (eval-lock semantics):** The regression test SHALL assert equality only against the FROZEN judge fixture (one temp-0 recorded sample), NEVER a live re-run — mirror `evals/live-samples.test.ts` exactly. The flip-rate is the honest disclosure that a re-run could differ.
- **R-HON-3:** No "built" claim ships until the metrics exist AND clear the bar AND the Codex gate APPROVEs.

## 8. Source-Intake decisions (P0 — surfaced, not silent)

**(a) Harness — native Vitest, not promptfoo (as a dep):** build the judge + gold set + metrics harness **natively in TypeScript/Vitest** (continuity with `evals/`, zero new dev/test dependency, free-first). Treat promptfoo's `context-faithfulness` assertion as a **reference pattern, not an adopted dependency**. Rationale: κ and flip-rate are not promptfoo's strengths; our grounding is the structured data row, not retrieved RAG context (promptfoo's `context-faithfulness` assumes retrieved context), so it isn't a clean fit; the metrics + gold set live in Vitest regardless. Easy to add promptfoo's iteration UI later (owner flag).

**(b) Judge provider — Groq (new runtime provider), cross-family, free (decision 2026-06-22; owner raised Groq + asked "which is best for quality/structured/enterprise"):** adopt the **Groq API** as the default judge provider (`@ai-sdk/groq`, `openai/gpt-oss-120b`, strict structured output, free tier). This is a NEW runtime model provider — surfaced + decision-logged (no silent tool change; RULES §8). It does NOT change the project's paid-runtime posture (Gemini stays the only *paid* runtime model; Groq is free). The drafter stays Gemini Flash. Intake verdict: ADOPT for the judge (cross-family independence + strict schema + $0 beat the same-family Flash-Lite of plan row 56); Gemini Flash-Lite kept as a configurable alternative behind the same boundary.

**Freshness (RULES §6, dated 2026-06-22 — re-verify again immediately before any live run, P3):**
- promptfoo remains open source under the current **MIT** license post-OpenAI-acquisition (OpenAI announcement).
- **Groq free tier** (no card): explored the current lineup (owner ask 2026-06-22). **Deprecation check (RULES §6, the real risk):** on **2026-06-17** Groq deprecated `llama-3.1-8b-instant` + `llama-3.3-70b-versatile` (→ migrate to gpt-oss), and `moonshotai/kimi-k2` was deprecated 2026-03-23 (→ gpt-oss-120b) — so a Llama/Kimi judge would be stale. **Best current free judge = `openai/gpt-oss-120b`:** the gpt-oss family is the one supporting **strict JSON-schema** (constrained decoding, 100% adherence), 120B is the strongest free reasoner, cross-family from Gemini, and it's Groq's own recommended (non-deprecated) model; free-tier ≈ 30 RPM / 1K req-day / 200K tok-day — ample for a paced ~100-item × 3–5-rep calibration. `gpt-oss-20b` = the lighter/faster strict-JSON fallback. (console.groq.com/docs/models, /docs/deprecations, /docs/structured-outputs, /docs/rate-limits.)
- Gemini (the drafter + the configurable alt judge): `gemini-2.5-flash` = $0.30/$2.50 per 1M; `gemini-2.5-flash-lite` = $0.10/$0.40 (ai.google.dev/gemini-api/docs/pricing).
- **Privacy:** judge inputs are synthetic/de-identified merchant facts + model-authored prose (fictional names) — no real PII crosses to Groq, same posture as the existing Gemini boundary.

## 9. Phases (each shippable + gated; commit per clean green step)

- **P0 — research refresh + intake + this spec.** *(done: freshness verified, harness decided, spec written.)* No spend.
- **P1 — judge + mock path + the visible panel (offline, no spend).** `lib/agents/semantic-judge.ts` (Zod schema, prompt, mock + live(gated) like `draft.ts`); wire as the SECONDARY control after the gatekeeper; budget-ledgered; unit tests on the mock path. Build the Merchant-Detail "Faithfulness check" panel rendering mock verdicts so it's showable from day one. `lib/core` untouched.
- **P2 — gold set + harness (offline, no spend).** Build the stratified gold set (planted per-mode, each verified against the real gatekeeper per R-CAL-1; real-supply probe per R-CAL-4); the metrics harness (precision/recall/F1/κ/flip-rate, R-CAL-6); validate the whole pipeline on the mock judge. Commit the gold set + harness.
- **P3 — live calibration (OWNER-GATED: provide a free `GROQ_API_KEY`; $0 spend).** Re-verify Groq strict-mode + model id. Run the live cross-family judge (Groq gpt-oss-120b) over the gold set; compute metrics; tune prompt + threshold to the recall bar on held-out data; record the calibration report (confusion matrix, PR curve, κ, flip-rate) + the recorded judge fixture (frozen, like live-samples). *(Groq is free, so this is key-provisioning-gated, not spend-gated — but it's still an owner action: the key, like any credential, is provided by the owner via the gitignored `.env`, never in chat.)*
- **P4 — eval-lock + SHOWABLE surfaces + gate + docs.** Regression-lock the threshold + gold set; freeze the judge fixture; wire the three demo surfaces to recorded verdicts (REPLAY/$0); cross-model Codex review (changed files + calibration honesty); flip the docs only once metrics clear the bar.

## 10. Acceptance gate (ship bar)

The judge ships only when ALL hold: clears the stated **recall bar on held-out data** with reported precision cost; **κ above target**; **flip-rate below target**; **eval-locked**; **Codex gate APPROVE**; **docs honest** (no "built" claim before metrics exist + clear the bar). Run the five EVAL-RUBRIC gates (grill → codex devil's-advocate → verify-correctness → enterprise+elegance → anti-slop).

## 11. Owner-gated stops (do not bypass)

P3 live calibration — owner provides a free `GROQ_API_KEY` ($0 spend, but a credential is an owner action) · any public posting · the deploy. Everything else proceeds autonomously, committing each clean green slice.
