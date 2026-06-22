# Build Plan — Calibrated Semantic LLM-Judge + Production Roadmap

**Status:** APPROVED direction (owner, 2026-06-22 — "deepen the AI now + roadmap production"). Build runs in a **fresh session** (this plan is the committed handoff). Research-grounded (digest below is cited, not memory).

**Goal (DONE looks like):** a **calibrated, reference-grounded semantic faithfulness judge** that flags any *undeclared* factual assertion in a draft's prose not supported by the merchant's structured data — the documented Phase-B gap the deterministic forward-checker (`lib/agents/gatekeeper.ts:11-12`) cannot cover — running as a SECONDARY control into the existing human gate, **measured** (precision/recall/F1 + κ + test-retest) against a labeled gold set, **eval-locked**, key-gated, and **cross-model reviewed before ship**. Plus a production roadmap with triggers (the "full-scale" half).

**Standing constraints (unchanged):** free-first; Gemini is the only paid model, **<$5 total**; deterministic-first → bounded-LLM (RULES §3); eval-first; prototype-not-service (public demo stays REPLAY/$0); honesty (no claim it's "built" until calibrated + passing); `lib/core/*` + the differential oracle stay UNTOUCHED.

---

## Part 1 — The calibrated semantic judge (build now)

### Architecture (research-recommended)
- **Reference-grounded, per-claim entailment in ONE structured Gemini call.** Input = draft prose (subject + body) + the merchant's structured facts; output (Zod) = `{ claims: [{ text, supported: boolean, evidence_field: string|null }], any_unsupported: boolean }`. Score = supported/total; the per-claim list IS the audit trail the human reviewer needs.
- **Ground it on the SAME `CLAIMABLE_FIELDS`** the forward-checker already trusts (`gatekeeper.ts`) — one source of truth, mirroring how `lib/agents/state-consistency.ts` is shared by the eval + the gatekeeper. The judge must not invent its own ground-truth schema.
- **Judge model = `gemini-2.5-flash-lite`** while the drafter is Flash. This is BOTH the cost win (~5–6×) AND the primary practical mitigation for self-preference bias (Flash judging Flash). Secondary structural mitigation: the judgment is *objective entailment* ("supported by these facts?"), which can't be style-gamed the way a quality score can.
- **Secondary control, not primary.** Runs AFTER the deterministic gatekeeper passes; an unsupported claim → WARN/hold for the human (recall-favoring; a human reviews downstream, so a false flag is cheap, a missed fabrication is the costly miss). Decision rule + threshold set during calibration.
- **Deterministic-first build:** mirror `lib/agents/draft.ts` — a deterministic **mock judge** (fixed verdicts) is the test path + the offline plumbing; the **live judge** is `ENABLE_LIVE_AI`-gated; cost flows through the existing `lib/agents/budget.ts` ledger.

### Calibration protocol (the core deliverable — what makes it "calibrated")
1. **Gold set — stratified, ~30 to start → ~100+ to validate.** Start ~30, iterate the judge prompt until no NEW failure mode emerges (saturation), then grow toward ~100+ as the validation floor. The binding constraint is **positives-per-failure-mode**, not total N (a fabrication detector is class-imbalanced).
2. **Positives = planted fabrications across the modes the forward-checker misses:** invented numbers ("you're 80% set up"), unsupported capability/benefit claims, fabricated timelines ("by Friday"), fabricated entities/integrations, plausible-but-absent specifics. **Also mine real negatives from `lib/data/live-samples.snapshot.json`** (6 real Flash drafts) so the distribution matches production hallucinations — hand-synthesized fabrications are often too easy.
3. **Labels = binary** (supported/unsupported per claim + draft-level clean/fabricated), one domain expert (the owner/Claude-as-author with adjudication), **each label carries a written critique** detailed enough to drop into a few-shot judge prompt. LLM-assisted pre-labeling is OK **with human adjudication** — never let the generating model family be the sole labeler of its own fabrications (preference leakage).
4. **Metrics to report (all four — raw accuracy is misleading under imbalance):**
   - **Precision / Recall / F1 on the fabrication class** (primary) + a **CI on recall**.
   - **TPR / TNR on a held-out test set** (never the tuning set).
   - **Cohen's κ** (judge vs the expert) — chance-corrected, the honest answer to "agreement under rare positives." Target a κ clearing a comparable bar to GPT-4-judge-vs-human (>80% raw agreement in Zheng et al.).
   - **Test-retest flip-rate:** run the judge K=3–5× @ temp 0; report the fraction of items whose verdict changes. Gemini is not bit-deterministic at temp 0 — a flippy judge silently corrupts the regression lock.
5. **Threshold, honestly:** tune for **high recall on fabrications**, report the **precision cost** at that operating point (PR curve), **pick the operating point on held-out data and report performance THERE.** Regression-lock the threshold + gold set in the eval harness so judge quality can't drift.

### Failure-modes → mitigations (build these in)
| Mode | Risk here | Mitigation |
|---|---|---|
| Self-preference (Flash judges Flash) | **live** | objective entailment (can't style-game) + judge on Flash-Lite |
| Verbosity/position bias | low (pointwise, binary) | structured per-claim bool; pointwise not pairwise |
| Miscalibration / over-leniency | waves through plausible fabrications | rubric + few-shot the expert critiques + CoT-then-verdict; calibrate threshold on held-out for recall |
| Prompt sensitivity / criteria drift | verdicts flip; criteria rot over time | version the judge prompt; test-retest flip-rate gate; treat the validator as itself needing validation (EvalGen) |
| Lab-vs-prod gap | glowing eval hides breakage | negatives mined from real Flash output; metrics on a held-out prod-like set |

### Tooling (Source-Intake decision at build time — evaluate, don't default-adopt)
- **Recommended:** **promptfoo** (MIT, TypeScript/Node-native, first-class Gemini provider; its `context-faithfulness` assertion IS this architecture) as the judge-prompt iteration + grading harness; **adapt RAGAS's** claim-decomposition *method* (Apache-2.0, Python — reference/sidecar only, no TS runtime dep); reject Python tools as runtime deps. Keep the **gold set + the final regression lock in the repo's existing Vitest suite** (`evals/`) for continuity with the current harness.
- **Gates (RULES §6):** re-verify promptfoo's license posture (OpenAI acquired it Mar 2026; **still MIT** as of 2026-06-22) and re-verify Gemini Flash-Lite pricing at build time. Set promptfoo's grader model **explicitly** to the Gemini provider (its default may be an OpenAI model).

### Phases (each shippable + gated; commit per clean green step)
- **P0 — research refresh + intake (½ day):** re-verify the digest's freshness items (promptfoo license, Gemini Flash-Lite pricing); decide promptfoo-vs-vitest harness; write the spec (success criteria + acceptance tests, EARS form). *No spend.*
- **P1 — judge + mock path (offline, no spend):** `lib/agents/semantic-judge.ts` (Zod schema, prompt, mock + live(gated) like `draft.ts`); wire as the SECONDARY control after the gatekeeper; budget-ledgered; unit tests on the mock path. `lib/core` untouched.
- **P2 — gold set + harness (offline, no spend):** build the stratified gold set (planted per-mode + mined from the live snapshot); the metrics harness (precision/recall/F1/κ/flip-rate); validate the whole pipeline on the mock judge. Commit the gold set + harness.
- **P3 — live calibration (OWNER-GATED: key + <$5):** run the live Flash-Lite judge over the gold set; compute the metrics; tune the prompt + threshold to the recall bar on held-out data; record the calibration report (confusion matrix, PR curve, κ, flip-rate) as a frozen fixture (like the live-samples snapshot). Re-verify pricing at use-time.
- **P4 — eval-lock + gate + docs:** regression-lock the threshold + gold set in `evals/`; key-gated (public demo stays REPLAY); **cross-model Codex review** (changed-files + the calibration honesty); flip the docs from "designed boundary" → "built + calibrated, metrics = X" (README/WHY/ENTERPRISE-READINESS) — only once the metrics clear the bar.

**Acceptance gate (ship bar):** the judge clears the stated recall bar on held-out data with reported precision cost; κ above target; flip-rate below target; eval-locked; Codex gate APPROVE; docs honest (no "built" claim until metrics exist). Run the five EVAL-RUBRIC gates.

**Owner-gated stops:** the P3 live calibration spend (key + <$5) · any public posting · the deploy. Everything else proceeds autonomously, committing each clean green slice.

---

## Part 2 — Production roadmap (the "full-scale" half — roadmap now, build on trigger)

Keeps the prototype-not-service identity; this is the **documented path + triggers** to a real operated product (sharpens `docs/ENTERPRISE-READINESS.md`'s expansion section into trigger-bound stages). Each stage builds only when its trigger fires (owner decision).

| Stage | What | Trigger |
|---|---|---|
| **0 (now)** | Prototype: Next.js + Vercel free tier + Gemini ≤$5 + the calibrated judge | — |
| **1 — Persistence + observability** | Managed Postgres (durable merchant/audit state) + append-only audit + metrics (model-failure/fallback rate, gatekeeper-block rate, judge-flag rate, approval latency) | first real adopter pilot / >1 run/day |
| **2 — Identity + tenancy** | SSO, RBAC, multi-tenant boundaries | >1 user or any real merchant data |
| **3 — Real integrations** | Slack/email/CRM behind explicit adapters with permission + data-classification + redaction; real (not simulated) sends behind the human gate | a partner wants live outreach |
| **4 — Live AI at scale** | Rate limiting + managed secret store + the budget hard-stop + a security-specialist pass on the deployed app; promote Gemini from episodic to managed | live AI enabled in prod |
| **5 — HA / compliance** | HA infra, SOC2-style controls, DPA/PII handling | enterprise procurement |

Cost posture: free-first holds through Stage 0; Stages 1+ introduce paid managed infra **only when a trigger fires** — an explicit owner cost decision, not a default. Same architecture scaled, not a rewrite.

---

## Research digest (grounding — 2026-06-22, cited)
Full cited digest in this session's research-specialist output. Load-bearing, cross-verified sources:
- Zheng et al., *Judging LLM-as-a-Judge (MT-Bench/Chatbot Arena)*, arXiv 2306.05685 (2023-06) — biases + >80% judge-human agreement.
- Liu et al., *G-Eval*, arXiv 2303.16634 (2023-03) — CoT rubric (use selectively; graded-quality, not binary).
- *A Survey on LLM-as-a-Judge*, arXiv 2411.15594 (2024-11) — bias taxonomy + mitigations.
- Shankar et al., *Who Validates the Validators? (EvalGen)*, arXiv 2404.12272 — the validator needs validating; criteria drift.
- *Quantifying & Mitigating Self-Preference Bias*, arXiv 2604.22891 (2026) — same-family judge inflates recall (preference leakage).
- Husain & Shankar, *LLM-as-a-Judge guide* + *evals-faq*, hamel.dev (2026-01-15) — start ~30→saturate, ~100+ validation floor, TPR/TNR, "raw agreement misleads."
- Gemini pricing, ai.google.dev/gemini-api/docs/pricing (page 2026-06-18) — Flash $0.30/$2.50 per 1M; Flash-Lite $0.10/$0.40.
- promptfoo (MIT, Node, Gemini provider, `context-faithfulness`); RAGAS faithfulness (Apache-2.0, Python); DeepEval (Python).

**Freshness obligations at build time (RULES §6):** re-verify promptfoo license (post-OpenAI-acquisition) + Gemini Flash-Lite pricing + the model id before any live spend.
