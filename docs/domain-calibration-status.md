# Domain Judge — B1 Calibration Status

**Status (2026-06-26): the OFFLINE machinery is DONE + green; the LIVE calibration run has NOT been run yet.** It is **owner-gated** on a free `GROQ_API_KEY` + a fresh Groq daily token window ($0). The pass/fail **bar is PRE-REGISTERED below, BEFORE any live number is read** (R-DCAL-7 / R-DHON-1) — so clearing it later is honest pre-registration, not goalpost-moving.

This is the **Effective**-axis analogue of the faithfulness judge's `docs/judge-calibration-status.md`.

## What is built (offline, $0, committed)

- **Rubric** (`lib/domain/effective-rubric.ts`) — the 3 calibrated dimensions (matched-to-blocker · engagement-appropriate · no-over-promise) as a KB-cited STANDARD; `domainSituation()` surfaces the situation WITHOUT leaking the answer (R-DARCH-2). `docs/spec-domain-judge.md` = the spec.
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

## Honest caveats (NOT buried)

1. **All gold positives are SYNTHETIC/planted** (R-DCAL-4): the recorded live Flash drafts are matched + well-grounded, so organic domain-defects ≈ 0. Metrics are measured on synthetic domain-defects; docs say so. Directional until the ~100 validation floor (R-DHON-1).
2. **The over-promise dimension (§4.2) has only PARTIAL marginal value vs the LIVE faithfulness judge.** Its positives dodge the deterministic guardrail (verified) and the faithfulness *mock*, but an implied-typicality benefit ("stores like yours become favorites") can be borderline-unsupported, so the live faithfulness judge may also flag some. That is why §4.2 is isolated + reported per-dimension with a softer floor; **dimensions 1 (matched) + 2 (engagement) are the cleanly-marginal core** (a generic-but-truthful draft, or a bare nudge to a ghosted merchant, is invisible to BOTH the gate and faithfulness — only the domain judge catches it).
3. **Platform-side escalation is DEFERRED, not faked** (R-DCAL-3): `lib/domain/diagnosis.ts` emits only `merchant_side`; calibrating platform-side would require fabricating data the synthetic model does not carry. Documented rubric rule; revisit at B2 with a real `blocker_source` signal.
4. **Researched, not credentialed** (R-DHON-2 / AM-7): the rubric is researched + source-cited (the B0 KB) + owner judgment, never a marketplace-insider's expertise.
5. **Small held-out N** (4 test positives/dimension): per-dimension recall is granular (0/.25/.5/.75/1.0). The ~100 floor is the later validation; B1's numbers are directional.

## How to run (owner-gated — fresh Groq daily window only)

```
# 1) put a free GROQ_API_KEY in the gitignored .env (editor, never chat)
# 2) re-verify the model is current (RULES §6): gpt-oss-120b non-deprecated + Groq strict-output on
# 3) run (≈36 items × 3 reps, ~14s pacing ≈ 25–30 min, ~100K tokens of the 200K/day budget, $0):
node --env-file=.env node_modules/.bin/vitest run evals/domain-calibration.live.test.ts
# 4) read lib/data/domain-calibration.snapshot.json → compare held-out + per-dimension to the bar above
```

Do not run a heavy Groq job on another project concurrently (the 200K/day window is shared).

## Remaining B1 work after the run

- IF the bar clears → eval-lock + the Codex cross-model gate on the calibration honesty → flip the docs. THEN **B2** (wire the KB into the agents + the domain judge into the ship gate).
- IF not → tune on the tune split + re-run.
