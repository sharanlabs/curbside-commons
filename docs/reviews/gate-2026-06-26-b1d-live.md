# Gate record — Track B1d LIVE calibration (domain-quality "Effective"-axis judge)

**Date:** 2026-06-26 · **Scope:** the LIVE Groq `openai/gpt-oss-120b` domain-judge calibration run + eval-lock (commit `1fcb492`) · **Artifact framing:** a calibration result that **RAN + CLEARED the pre-registered bar (DIRECTIONAL)** — NOT yet "calibrated" (that label waits for the Codex gate, R-DHON-3, + the ~100 floor, R-DHON-1).

## 1. The run

- Live cross-family judge: Groq `openai/gpt-oss-120b`, strict structured outputs, `reasoningEffort:"low"`, temp 0, **K=3 reps/item over the 36-item synthetic gold set**, **$0** (free tier), **36/36 real `LIVE_JUDGE`, 0 fallbacks**. ~27 min at 14s pacing. Budget-protected by a 1-call smoke first (advisor) — the strict-output→fallback-while-billing failure mode was ruled out before the ~100K-token run.
- **Result (held-out / test split — the ship number, R-DCAL-7):** recall **1.00** (CI95 [0.76, 1.00], n=18: 12 pos / 6 neg) · precision **1.00** · F1 **1.00**. Per-dim held-out recall: matched 1.00 · engagement 1.00 · over_promise 1.00. **κ 1.00 · flip 0.00.** Draft-level CM: TP 24 / FP 0 / TN 12 / FN 0.
- **Clears ALL SEVEN** pre-registered thresholds (`docs/domain-calibration-status.md`). Frozen + eval-locked: `lib/data/domain-calibration.snapshot.json` + `evals/domain-calibration.lock.test.ts` (R-DHON-4; no live call).

## 2. No-answer-leakage VERIFIED (R-DARCH-2 — the make-or-break property)

κ=1.0 + flip=0.0 is also the signature a tautology/wrapper would show, so it was scrutinised (advisor-prompted), not trusted:
- `domainSituation()` (`lib/domain/effective-rubric.ts:122-136`) withholds `diagnose().play` / `.root_cause_hypothesis` (the answer); the live runner never passes the gold `dimension`/`failureMode`/label into the prompt.
- Recorded rationales reason situation→draft **cold** (quote the offending phrase) and **isolate the correct dimension** — e.g. on an engagement-defective ghosted draft the judge PASSES matched + over-promise, FAILS only engagement; a label-fed wrapper could not do that selectively.
- The `engagement_appropriate` per-dim **precision 0.5** (the judge also flags generic D1 drafts as engagement-inappropriate) is itself the fingerprint of independent reasoning — carried to the **B2 §4.2 / dimension-redundancy decision**, not a bar item.

## 3. `acceptance-gate` (independent, read-only) → BLOCK → RECONCILED

The five-gate panel ran on the B1d calibration. **Engineering cleared adversarial review** on all four stress targets: leakage/tautology (genuine cold reasoning), non-vacuity (TP24/FP0/TN12/FN0, 36/36 LIVE_JUDGE — not always-flag/mock), eval-lock soundness (locks floors not exact numbers; keeps the engagement quirk visible via `precision < 1`), metric math (Wilson/κ/flip verified). enterprise+elegance = PASS; anti-slop = PASS (advisory nits only).

**The BLOCK was a single narrow honesty issue, independent of Codex:** the eval-lock *result* was committed (`1fcb492`) **before** the claiming docs were flipped, so the committed repo momentarily told two stories — `docs/domain-calibration-status.md` still said "the LIVE run has NOT been run yet" next to a committed snapshot + lock test asserting it ran and cleared. Violates RULES §1 (repo = source of truth) + the R-DHON-3/R-DCAL-7 "flip the docs" rule.

**Reconciliation (this commit):** flipped `docs/domain-calibration-status.md` to "RAN + CLEARED (directional); calibrated pending Codex" (kept the pre-registered bar table + all caveats visible, mirroring `docs/judge-calibration-status.md`); synced `PROJECT_STATE.md` / `CURRENT_TASK.md` / `HANDOFF.md` to one story; aligned the lock test's "SHIPPED RESULT" wording → "cleared the bar; calibrated pending Codex"; recorded the run in `docs/task-log.md` + `docs/implementation-journal.md`. **Lesson:** flip the claiming docs in the SAME commit as the result. Re-gate requested from the same acceptance-gate agent on the reconciled docs.

## 4. Codex cross-model gate → SEAT-BLOCKED (dated obligation, NOT waived)

Attempted `~/claude-os/bin/codex-guarded review --base 07e9a55` (gpt-5.5 @ xhigh, the whole B1 diff) at ~18:33 UTC. Raw error, surfaced verbatim (owner doctrine: no retry/downgrade/switch — the seat is an owner action):

```
ERROR: You've hit your usage limit. Upgrade to Pro … or try again at 3:27 PM.
codex
Review was interrupted. Please re-run /review and wait for it to complete.
```

**Disposition:** Codex-down ≠ gate-waived (R-DHON-3). B1d proceeds **test-verified + acceptance-gate-cleared (engineering)**; the Codex cross-model gate is a **DATED OBLIGATION (≈3:27 PM 2026-06-26)** — it also discharges the B1-offline Codex obligation (`gate-2026-06-26-b1-offline.md`), since `--base 07e9a55` covers the full B1 diff. Re-run on a fresh seat; reconcile primary-model-final; **only then** flip "directional" → "calibrated." No "calibrated, Codex-approved" claim ships before that.

## Net

**B1d = RAN + CLEARED the pre-registered bar (directional) + eval-locked + acceptance-gate engineering-SHIP (doc-coherence reconciled).** The ONE open gate is the Codex cross-model review (dated obligation ≈3:27 PM). `verify` green: 243 + 4 skipped. `lib/core` + the differential oracle + the faithfulness gold UNTOUCHED. Owner-gated stops unchanged (deploy · public posting · spend > $5 · git push).
