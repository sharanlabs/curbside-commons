# Codex review — A3-2b (Strategist live $0 Groq confirmatory eval)

**Date:** 2026-06-28 · **Reviewer:** Codex (config default `gpt-5.5` @ `xhigh`), read-only, via `~/claude-os/bin/codex-guarded` · **Target:** the A3-2b slice (`evals/strategist.live.test.ts`, `docs/strategist-confirmatory-status.md`, `lib/data/strategist-confirmatory.snapshot.json`) · **Reconciliation:** primary-model-final (Opus 4.8). Raw verdict: `/tmp/codex-verdict-activationops-a3-2b.txt`.

## Verdict: **BLOCK** — 2 findings (1 P1 + 1 P3)

| # | Sev | Finding | Reconciliation (primary-model-final) |
|---|-----|---------|--------------------------------------|
| F1 | **P1** | The slice **overclaims `$0`/"free"**. The eval proves `LIVE_AI` and that `budget.spentUsd` stayed 0, but `liveGroqGenerateObject()` only pre-checks the ledger and never prices/increments it, and `strategistRecommend()` discards reported usage — so the assertion is **not an independent cost measurement**. Per RULES §6, Groq's pricing page lists `gpt-oss-120b` at nonzero per-token prices. | **ACCEPTED + FIXED.** **RULES §6 freshness check done (groq.com/pricing, 2026-06-28):** standard pricing **$0.15/M in + $0.60/M out** — NOT a free *model*. "$0" rests on the key being a Groq **free-tier** key (rate-limited; the ~200K-tokens/day cap from B1 is that tier's mechanism), on which no per-token billing is charged. Reframed honestly in `docs/strategist-confirmatory-status.md` (new "Cost honesty" section — `budget.spentUsd==0` = ledger not charged, NOT metered; ≈$0.003 if ever standard-billed; project-wide "free Groq" = "free-tier, not metered"), plus the live test's header/assertion comments + a `cost_basis` provenance field. The pinned pre-registered bar's bare "$0" wording is left intact (pre-registration integrity) and corrected by annotation. |
| F2 | **P3** | `lib/agents/strategist.ts` header comment said the Strategist "must beat / beats `strongRecommend`", inconsistent with the floor-not-ceiling conclusion (a structural TIE). | **ACCEPTED + FIXED.** Reworded to "must at least MATCH `strongRecommend` (the anti-theater FLOOR)" + the explicit floor-not-ceiling note (the structural axis can only tie; the label defers to A3-3). |

### Probe confirmations (carried)
- **A — non-vacuous:** the floor is real (a risk-blind Strategist FAILS F-2; the offline tests prove it). It mainly confirms instruction-following — honestly stated.
- **B — honesty:** no label-earning overclaim — `strategist` deferred to A3-3, plan-step `agent="tool"`, count "3 + a candidate". The `$0` claim was the exception (F1, now fixed).
- **C — eval soundness:** liveness/fallback rejection is real (`FAILED_TO_FALLBACK`/`DETERMINISTIC_RULES` would fail `expect(rec.mode).toBe("LIVE_AI")`). Pair construction valid (`risk_level = source_risk_level`, `pipeline.ts:199`).
- **D — other:** the one internal "DoorDash" mention is in the snapshot prose only; labeled an internal eval artifact, not a public surface.

## Substantive result (unaffected by the findings)
The live floor result stands: 16/16 `LIVE_AI`, Low→`standard` 4/4, High→`elevated` 4/4, no rep flips. **Verdict: viable candidate; the `strategist` label DEFERS to A3-3.** The findings were both **honesty-framing** (the cost claim + a stale comment), not result-validity.

## Post-fix
`npm run verify` green (the live test skips in CI). Reconciliation is **test-verified** (the live result is unchanged; the fixes are wording/freshness, no behavior change). A confirming Codex re-pass is a recommended (non-blocking) obligation — no irreversible step is pending (push is HELD, no remote).
