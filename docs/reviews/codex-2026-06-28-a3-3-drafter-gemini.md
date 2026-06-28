# Codex changed-files review — A3-3 (Drafter→Gemini cross-family OFFLINE machinery + §4.2 prevention)

**Date:** 2026-06-28 · **Reviewer:** Codex (config default `gpt-5.5` @ `xhigh`), read-only, via `~/claude-os/bin/codex-guarded` (`gsd-code-review` skill + 2 read-only subagents) · **Target:** the uncommitted A3-3 diff (7 code/test files + 2 status docs) · **Reconciliation:** primary-model-final (Opus 4.8).

## Verdict: BLOCK → ALL 6 reconciled primary-model-final + fixed + re-verified green → confirming re-pass = SHIP (round-2 below); gate FULLY DISCHARGED

`npm run verify` green on the maker side throughout: **279 passed | 5 skipped** + typecheck/lint/build. Differential lane (`lib/core`, the `out/` oracle, `evals/gold/`, the frozen `*.snapshot.json`) **UNTOUCHED**.

The BLOCK challenged **no** part of the A3-3 direction (cross-family swap + §4.2). Every finding was an integrity/honesty condition — two of them (the P1s) the kind a green CI cannot catch because the live harness auto-skips offline. The gate earned its keep.

## Findings (6: 2 P1 · 2 P2 · 2 P3) — all ACCEPTED + fixed

| # | Sev | Finding | Resolution (primary-model-final) |
|---|-----|---------|----------------------------------|
| 1 | **P1** | The A3 "Gemini drafter + Groq judge" gate was **not Groq-specific**: `judgeLiveEnabled()` is satisfied by `JUDGE_PROVIDER=gemini` + `GEMINI_API_KEY`, so a misconfig could run **Gemini-drafts-Gemini-judges (same-family)** while the code claimed cross-family. | **Accepted.** The loop's `live` default is now `liveAiEnabled() && groqLiveEnabled() && resolvedJudgeProvider() === "groq"` (`orchestrator.ts`), and the live harness gate matches **and asserts `result.finalVerify.judge?.provider === "groq"` per item** + folds `crossFamilyJudge` into the `selfCorrected` criteria (`agent-loop.live.test.ts`). A non-Groq judge config now opts the live loop **out** (the spec's Gemini-judge alt is not the A3 cross-family loop) — cross-family is true by construction. |
| 2 | **P1** | The A3-7 harness's cumulative **$5 ledger was vacuous**: the orchestrator **clones** the budget per run, so the harness's outer `budget.spentUsd` never saw the Gemini spend and `cost_usd` could report `0`. | **Accepted.** The harness now accrues `budget.spentUsd += result.costUsd` after each item, carrying the running total into the next run and making the cap assertion + the reported cost **real** (`agent-loop.live.test.ts`). The orchestrator clone stays (no caller mutation); cross-run accumulation is correctly the harness's job. |
| 3 | **P2** | Paid **judge** spend was returned in `totalCostUsd` but **not accrued into `budget.spentUsd`** — a configured Gemini judge could let a later budget check undercount. | **Accepted.** `orchestrator.ts` now does `budget.spentUsd += judge.costUsd` after the judge call (Groq judge → `$0` no-op; a configured Gemini judge accrues). The ledger now tracks **all** metered spend. |
| 4 | **P2** | The harness claimed K is re-pinned on a **fresh A3-7 split** but still used the old P3 `GOLD_JUDGE_TERRITORY_POSITIVES` test split. | **Accepted.** Reworded the `HELD_OUT`/`K` comments, the header, and the report `note` to label the split a **PLACEHOLDER reusing the existing P3 split**, with the fresh Gemini-sized split + K re-pin called out as a remaining **A3-7** task (R-A3-9). |
| 5 | **P3** | `docs/domain-calibration-status.md` said "this Domain Critic" checks in A3-3, but Domain-Critic wiring is **A3-4**. | **Accepted.** Reworded: this domain judge becomes the loop's Domain Critic only at A3-4 (not wired in A3-3); its directional label is not upgraded either way. |
| 6 | **P3** | Stale "GENERATED Groq path" comment in `evals/agent-loop.test.ts:401` — the redraft is now Gemini. | **Accepted.** Now "GENERATED Drafter (Gemini) path." |

## Confirmed by Codex (round 1, independent)

- The loop drafter is genuinely `draftOutreach` (Gemini), not `draftOutreachGroq`.
- The §4.2 `DOMAIN_HONESTY_RULES` block is **static + outside the per-merchant `FACTS`** object (no RAG on the facts) — R-A3-5 holds.
- Recommend-not-decide is still structurally preserved (clone isolation + `simulateSend` + `assertEligibilityUntouched`) — R-A3-3.

## Self-review additions (maker-side, before/with the review)

Caught + fixed several stale "free Groq / no Gemini / Groq drafter / same-family draft" comments across the 7 files (orchestrator interface docs, `groq-draft.ts` header marking it the retained-but-unwired A2 reference, `trajectory.ts`, `snapshot.ts`).

## Confirming re-pass (round 2) — SHIP

Read-only re-pass on the FIXED diff via `codex-guarded` (background). Verbatim: **"No blocking findings on the fixed diff. VERDICT: SHIP."** All 6 confirmed resolved:
1. Cross-family live gate now requires Gemini-live + Groq-live + `resolvedJudgeProvider()==="groq"` in BOTH the orchestrator and the live harness; the harness also asserts the Groq judge per item.
2. The live harness cumulative ledger now accrues `budget.spentUsd += result.costUsd` → report/cap no longer vacuous.
3. The orchestrator accrues `judge.costUsd` into the in-run ledger after judge calls.
4. Held-out/K wording honest: placeholder P3 split; the fresh Gemini-sized split + K re-pin deferred to A3-7.
5. The domain-calibration doc now says Domain-Critic wiring starts at A3-4, not A3-3.
6. The stale "GENERATED Groq path" comment is now "GENERATED Drafter (Gemini) path."

Earlier-confirmed items still hold (drafter = `draftOutreach`/Gemini; §4.2 static + outside `FACTS`; recommend-not-decide via clone + `simulateSend` + `assertEligibilityUntouched`; differential lane shows no modified `lib/core` · `out` · `evals/gold` · `*.snapshot.json`). Codex did not re-run `npm run verify` (read-only sandbox; `next build` writes artifacts) — it reviewed the fixed diff statically against the maker-side green result (279+5).

**The A3-3 Codex gate is FULLY DISCHARGED** (BLOCK → 6 reconciled primary-model-final + test-locked → confirming re-pass SHIP, 2 rounds).
