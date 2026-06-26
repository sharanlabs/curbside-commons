# Domain Judge — B1 Calibration Status

**Status (2026-06-26): the LIVE calibration RAN ($0, cross-family Groq `openai/gpt-oss-120b`), the HELD-OUT (test) split CLEARED all seven pre-registered thresholds, AND the mandatory Codex cross-model gate has now RUN** (gpt-5.5 @ xhigh over the full B1 diff → **2 P2 code findings, 0 P0/P1, both fixed + reconciled primary-model-final + test-locked** — `docs/reviews/codex-2026-06-26-b1-domain-judge.md`). Per **R-DHON-3** (metrics exist + clear the pre-registered bar + the Codex gate cleared) the **METHODOLOGY is now CALIBRATED**; per **R-DHON-1** the **METRIC stays DIRECTIONAL** — the gold set is *synthetic* and the held-out n=18 sits below the ~100 validation floor. So the honest label is **"calibrated — directional, pending the ~100 validation floor"**, NEVER a bare "calibrated." The pass/fail **bar was PRE-REGISTERED below BEFORE any live number was read** (R-DCAL-7), and the held-out split was committed in the gold set before the run — so clearing it is honest pre-registration, not goalpost-moving. The result is **eval-locked** (`evals/domain-calibration.lock.test.ts` asserts the frozen `lib/data/domain-calibration.snapshot.json` clears the bar; it makes NO live call — R-DHON-4). **Scope note (do not over-read the gate):** `codex review` audits *code*, not prose claims — it discharged the gate as "ran + no blocking findings"; the word "calibrated" is carried by the bar-clearance + eval-lock + the independent **acceptance-gate** + the documented **R-DARCH-2 leak-check**, not by Codex's silence on the docs.

This is the **Effective**-axis analogue of the faithfulness judge's `docs/judge-calibration-status.md`.

## What is built (offline, $0, committed)

- **Rubric** (`lib/domain/effective-rubric.ts`) — the 3 dimensions under calibration (matched-to-blocker · engagement-appropriate · no-over-promise) as a KB-cited STANDARD; `domainSituation()` surfaces the situation WITHOUT leaking the answer (R-DARCH-2). `docs/spec-domain-judge.md` = the spec.
- **Judge** (`lib/agents/domain-judge.ts`) — per-dimension Zod verdict; deterministic mock (stub baseline, $0); live cross-family Groq `gpt-oss-120b` via DI, budget-guarded + fail-closed.
- **Gold set** (`evals/gold/domain-gold.ts`) — 24 single-dimension synthetic positives (8 per dimension) + 12 clean negatives; every positive is a matched draft with only its body swapped, so it is gate-passing + faithful by construction (the labels are objective).
- **Harness + offline test** (`evals/gold/domain-harness.ts`, `evals/domain-calibration.test.ts`) — reuses `lib/evals/judge-metrics.ts`; **R-DCAL-1 enforced LIVE** (every item run through the real `runGatekeeper` + the faithfulness mock — this already caught + fixed one mis-constructed gold item where "once you're live" tripped `state_mismatch`); per-dimension reporting; the mock is run ONLY as a labeled stub baseline, never gated.
- **Live runner** (`evals/domain-calibration.live.test.ts`) — key-gated, auto-skips offline.

## The PRE-REGISTERED bar (pinned BEFORE the run, on the held-out **test** split — R-DCAL-7)

Recall-favoring (a false flag just sends a fine draft to a human; a missed bad-practice draft is the costly miss). Reported on the **territory** (gate-passing + faithful) subset (R-DCAL-1).

| Metric | Bar | Note |
| --- | --- | --- |
| **Aggregate held-out recall** | **≥ 0.80** | ≥ 10/12 domain-defective test drafts caught |
| **Aggregate held-out precision** | **≥ 0.70** | reported at that operating point |
| **Per-dimension recall — matched_to_blocker** | **≥ 0.75** | ≥ 3/4 (the clean, `diagnose()`-anchored core) |
| **Per-dimension recall — engagement_appropriate** | **≥ 0.75** | ≥ 3/4 (the clean, `diagnose()`-anchored core) |
| **Per-dimension recall — no_over_promise (§4.2)** | **≥ 0.50** | ≥ 2/4; the fuzziest dimension, softer floor (see caveat 2) |
| **Cohen's κ (judge vs gold, territory subset)** | **≥ 0.60** | substantial agreement (Landis–Koch) |
| **Test-retest flip-rate (K=3, temp 0)** | **≤ 0.15** | a flippy judge corrupts the regression lock |

**Decision rule.** IF the held-out split clears ALL of the above → eval-lock (freeze `lib/data/domain-calibration.snapshot.json`; add an offline regression test asserting the FROZEN fixture, never a live re-run — R-DHON-4) + flip the docs from "designed rubric" → "built + calibrated, metrics = X" (R-DHON-3) + the Codex gate. ELSE → tune the prompt/threshold on the **tune** split + re-run; **never tune on the test split.**

## The run + results (2026-06-26) — held-out CLEARED all seven (directional)

Live cross-family judge: Groq `openai/gpt-oss-120b`, strict structured outputs, `reasoningEffort:"low"`, temp 0, **K=3 reps/item over the 36-item gold set**. **$0** (free tier). **36/36 real `LIVE_JUDGE` verdicts, 0 fallbacks.** Snapshot: `lib/data/domain-calibration.snapshot.json` (frozen; eval-locked by `evals/domain-calibration.lock.test.ts`).

**Aggregate (territory subset, R-DCAL-1):**

| Split | n | Recall | Precision | F1 | Matrix (tp/fp/tn/fn) |
|---|---|---|---|---|---|
| **Held-out (test) — THE bar** | 18 | **1.000** (CI95 0.76–1.0) | **1.000** | 1.000 | 12 / 0 / 6 / 0 |
| Tune | 18 | 1.000 | 1.000 | 1.000 | 12 / 0 / 6 / 0 |
| Overall | 36 | 1.000 | 1.000 | 1.000 | 24 / 0 / 12 / 0 |

- Cohen's κ (judge vs gold, territory subset): **1.000**. Test-retest flip-rate (K=3): **0.000**.

**Per-dimension held-out (test) recall (R-DCAL-2):**

| Dimension | Recall | Precision | Note |
|---|---|---|---|
| matched_to_blocker | **1.000** (4/4) | 1.000 | clean |
| engagement_appropriate | **1.000** (4/4) | **0.500** | precision dragged by cross-dim bleed — caveat 7 |
| no_over_promise (§4.2) | **1.000** (4/4) | 1.000 | clean |

**Verdict: the held-out split CLEARS all seven pre-registered thresholds** — recall 1.0 ≥ 0.80; precision 1.0 ≥ 0.70; per-dim recall 1.0 ≥ {0.75, 0.75, 0.50}; κ 1.0 ≥ 0.60; flip 0.0 ≤ 0.15.

**No-answer-leakage verified (R-DARCH-2 — the make-or-break property).** The perfect-but-stable κ=1.0 / flip=0.0 signature was scrutinised (it is also what a tautology/wrapper would show): `domainSituation()` withholds `diagnose().play` / `.root_cause_hypothesis` (the answer); the live runner never passes the gold `dimension`/`failureMode`/label into the prompt; and the recorded rationales reason situation→draft *cold* (quoting the offending phrase) and **isolate the correct dimension** — e.g. on an engagement-defective ghosted draft the judge PASSES matched + over-promise and FAILS only engagement, which a label-fed wrapper could not do selectively. The engagement cross-dim bleed (caveat 7) is itself the fingerprint of independent reasoning, not leakage.

## Honest caveats (NOT buried)

1. **All gold positives are SYNTHETIC/planted** (R-DCAL-4): the recorded live Flash drafts are matched + well-grounded, so organic domain-defects ≈ 0. Metrics are measured on synthetic domain-defects; docs say so. Directional until the ~100 validation floor (R-DHON-1).
2. **The over-promise dimension (§4.2) has only PARTIAL marginal value vs the LIVE faithfulness judge.** Its positives dodge the deterministic guardrail (verified) and the faithfulness *mock*, but an implied-typicality benefit ("stores like yours become favorites") can be borderline-unsupported, so the live faithfulness judge may also flag some. That is why §4.2 is isolated + reported per-dimension with a softer floor; **dimensions 1 (matched) + 2 (engagement) are the cleanly-marginal core** (a generic-but-truthful draft, or a bare nudge to a ghosted merchant, is invisible to BOTH the gate and faithfulness — only the domain judge catches it).
3. **Platform-side escalation is DEFERRED, not faked** (R-DCAL-3): `lib/domain/diagnosis.ts` emits only `merchant_side`; calibrating platform-side would require fabricating data the synthetic model does not carry. Documented rubric rule; revisit at B2 with a real `blocker_source` signal.
4. **Researched, not credentialed** (R-DHON-2 / AM-7): the rubric is researched + source-cited (the B0 KB) + owner judgment, never a marketplace-insider's expertise.
5. **Small held-out N** (4 test positives/dimension): per-dimension recall is granular (0/.25/.5/.75/1.0). The ~100 floor is the later validation; B1's numbers are directional.
6. **Difficulty / realism gap — where the directional number is WEAKEST.** The positives are hand-authored to be *cleanly* defective ("Complete your setup!"); a real Gemini drafter rarely emits something that obvious, so live recall on these synthetic positives may **overstate** recall on subtle real-world defects. And in production most drafts are *good*, so the judge's **precision on realistic clean drafts is the production-critical number** — yet the gold set has only **2 real-supply clean negatives** (the rest are deterministic mock-clean). Growing real-supply negatives + subtler positives is a priority for the ~100 floor.
7. **engagement_appropriate per-dim PRECISION = 0.5 (a measured result, not a flaw hidden).** The judge flags the generic `matched_to_blocker` (D1) drafts as ALSO engagement-inappropriate (a generic draft fits no engagement state well — a reasoned, debatable stance, NOT answer-leakage). This drags engagement per-dim precision to 0.5 but does NOT dent aggregate precision (those drafts are true positives at the draft level). The pre-registered bar carries no per-dim precision floor; the question of whether `engagement_appropriate` should fire on generic drafts is carried explicitly to the **B2 §4.2 / dimension-redundancy decision** (Forward-decision section below). The eval-lock asserts this precision is `< 1` so the nuance stays visible, never silently blessed.

## How it was run (2026-06-26) — re-run command (fresh Groq daily window only)

It was run once cleanly on 2026-06-26 (a one-call smoke first, to protect the daily budget against a strict-output/fallback failure, then the full ~100K-token run). To reproduce on a fresh window:

```
# 1) put a free GROQ_API_KEY in the gitignored .env (editor, never chat)
# 2) re-verify the model is current (RULES §6): gpt-oss-120b non-deprecated + Groq strict-output on
# 3) run (≈36 items × 3 reps, ~14s pacing ≈ 25–30 min, ~100K tokens of the 200K/day budget, $0):
node --env-file=.env node_modules/.bin/vitest run evals/domain-calibration.live.test.ts
# 4) read lib/data/domain-calibration.snapshot.json → compare held-out + per-dimension to the bar above
```

Do not run a heavy Groq job on another project concurrently (the 200K/day window is shared).

## Remaining B1 work after the run

The bar cleared AND the Codex gate ran, so B1 is **DONE**:
- **DONE — eval-lock:** `evals/domain-calibration.lock.test.ts` (committed `1fcb492`); `verify` green (now **250 + 4 skipped** after the Codex-fix lock tests); `acceptance-gate` engineering = SHIP (leak / non-vacuity / eval-lock / metric-math all cleared independently); the doc-coherence BLOCK is closed.
- **DONE — Codex cross-model gate:** RAN on a fresh seat (gpt-5.5 @ xhigh, `~/claude-os/bin/codex-guarded review --base 07e9a55`, full B1 diff) → **2 P2 code findings, 0 P0/P1, both fixed + reconciled primary-model-final + test-locked** (`docs/reviews/codex-2026-06-26-b1-domain-judge.md`). Discharges R-DHON-3's gate condition AND the B1-offline obligation (one base covers B1a→B1d).
- **DONE — docs flipped (this update):** "RAN + CLEARED (directional)" → **"calibrated — directional, pending the ~100 floor"** (methodology calibrated; metric directional) — coherently across `PROJECT_STATE` / `CURRENT_TASK` / `HANDOFF` / the eval-lock header / the prior gate records.
- **NEXT — B2:** wire the KB into the agents + the domain judge into the ship gate; settle the §4.2 dimension-redundancy decision below. Then **A3** (4 bounded agents + Gemini Flash drafter ≤ $5 + cross-family judge).
- The **~100 validation floor (R-DHON-1)** keeps the number **directional** regardless — it is the ONLY thing now between this and an unqualified "calibrated."

## Forward decision for B2 — DECIDED (owner, 2026-06-26)

**§4.2 ordering / redundancy — DECISION: keep `no_over_promise` as a gating domain dimension (detection) AND feed KB §4.2 into the A3 Drafter prompt (prevention) = defense in depth.** At runtime the faithfulness judge runs BEFORE the domain judge (R-DARCH-4: gatekeeper → faithfulness → domain). The overlap is only **partial**, not redundant: faithfulness checks per-claim entailment against the merchant's **own data row**, so it structurally **cannot** flag an implied-typicality / general-hype claim ("stores like yours quickly become favorites") — that is not a claim about this merchant's data, so there is no field to entail it against — yet it is a clear over-promise (KB §4.2 rule 1). The dimension is recall-favoring + never auto-rejects, so the marginal cost of keeping it is ~nil (a redundant flag just routes to the human who already reviews). **Owner-approved 2026-06-26 (AskUserQuestion); decision-log 2026-06-26.** The drafter-prompt half lands in **A3** (when the Drafter exists); a **Codex cross-check on the wiring** is due at B2 implementation (consequential-recommendation rule). `matched_to_blocker` + `engagement_appropriate` were never in question — invisible to both the gate and faithfulness, so load-bearing regardless.
