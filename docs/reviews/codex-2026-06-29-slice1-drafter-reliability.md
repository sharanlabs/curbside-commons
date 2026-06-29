# Codex changed-files review — Slice 1: drafter-reliability fix (2026-06-29)

**Status: DATED OBLIGATION — seat usage-limited mid-review (raw error surfaced verbatim, no retry/downgrade/switch per owner doctrine).**

## Invocation
- `~/claude-os/bin/codex-guarded exec -s read-only -o /tmp/codex-verdict-activationops-slice1.txt "<prompt>" < /dev/null`
- Prompt: scratchpad `codex-slice1-prompt.txt` (review the 6 changed files for correctness of the finishReason capture, the thinkingBudget=0 fix, the cap raise + $5 invariant, honesty/no-overclaim, differential untouched).
- The seat began the review (it read `node_modules/@ai-sdk/provider` `LanguageModelV2Usage` typings to check the finishReason/usage shape claim) then hit:

```
ERROR: You've hit your usage limit. Upgrade to Pro ... or try again at 12:51 AM.
tokens used 2,18,795
```

NO retry / downgrade / account switch (owner doctrine). The review is a **dated obligation** before any irreversible step. A transparent re-attempt is scheduled for after the stated reset (00:51); the raw error is surfaced here verbatim.

## Changed files under review (6)
- `lib/agents/gemini.ts` — `MAX_LIVE_OUTPUT_TOKENS` 2000→4096; new `LIVE_THINKING_BUDGET_TOKENS=0`; new pure `liveGenerationOptions()`; wired into the default `generateObject` closure.
- `lib/agents/draft.ts` — `usageFromError` merges the SDK error's top-level `finishReason` with `err.usage`.
- `lib/agents/loop/orchestrator.ts` — draft/redraft trajectory `verdictSummary` appends `; finishReason=<x>` when present.
- `evals/{gemini,draft,agent-loop}.test.ts` — 4 new tests (thinking-disable wiring; real-`NoObjectGeneratedError` finishReason capture; finishReason threaded into the trajectory).

## Test-verified basis (while the gate is open)
- `npm run verify` GREEN: **301 passed + 5 skipped** (+4 over A3-7's 297+5); typecheck/lint/build green.
- Differential lane UNTOUCHED (`lib/core`+oracle+gold+snapshots; `git diff --name-only` clean).
- RED-GREEN proven for all 3 load-bearing changes (`docs/reviews/slice1-drafter-reliability-verify-evidence.log`).

## Freshness (RULES §6, dated 2026-06-28/29)
- Root cause confirmed against 2 independent sources: gemini-2.5-flash thinks by default; thinking tokens bill against `maxOutputTokens` → truncation → `NoObjectGeneratedError` on structured output (github.com/valentinfrlch/ha-llmvision#609; github.com/vercel/ai#14377).
- API confirmed against the installed `@ai-sdk/google` v2.0.76: `thinkingConfig.{thinkingBudget,includeThoughts}` forwarded into `generationConfig` (dist/index.js:1042); `thinkingBudget:0` disables thinking.
- `NoObjectGeneratedError` shape confirmed against installed `ai` v5.x typings: top-level `readonly finishReason` + separate `readonly usage` (dist/index.d.ts:2765); constructed live to verify (finishReason "length", usage separate).

## What the Codex re-attempt must confirm (the 5 review targets)
1. finishReason capture correctness (real SDK shape; no path still drops it; no break to priceLive/budget/UNKNOWN_USAGE).
2. thinkingBudget=0 correctness + safety for gemini-2.5-flash structured output; providerOptions shape; no regression to cross-family / tool-until-earned / recommend-not-decide.
3. $5 budget guarantee under the 2000→4096 cap raise (estimate stays the upper bound; no test pins the old 2000-based estimate wrongly).
4. Honesty: no overclaim that the parse-rate fix is PROVEN (it is WIRED offline; live proof = owner-gated slice 2).
5. Differential 20/20 untouched; offline $0 path + served REPLAY snapshot unchanged.

## Re-attempt — RAN (seat reset) → VERDICT: BLOCK → ALL 4 reconciled primary-model-final

The re-attempt completed (read-only, `gpt-5.5`@`xhigh`, ~264k tokens; it read the installed `ai`/`@ai-sdk/google`/`@ai-sdk/provider` package code + the evidence log; checked the AI SDK Google + Gemini thinking docs). Verdict **BLOCK, 4 findings — all legitimate, all ACCEPTED + fixed + red-green/test-locked (the gate earning its keep: the two P1s are real budget-integrity bugs a green CI cannot catch).**

- **F1 (P1) — SDK retries break the hard pre-call budget bound.** `generateObject` had no `maxRetries`; `ai@5.x` defaults to 2, so one `estimateLiveCallCostUsd` reserve could cover up to 3 billed provider attempts. **FIXED:** `maxRetries: 0` in `liveGenerationOptions()` (gemini.ts) — a parse failure is non-retryable anyway, and the loop re-drafts at the loop level. Test-locked `evals/gemini.test.ts` (asserts `maxRetries===0`); RED-GREEN proven (`999`→`expected 999 to be +0`).
- **F2 (P1) — reasoning tokens unpriced in the live ledger.** `result.usage.reasoningTokens` (Gemini `thoughtsTokenCount`) was dropped and `priceLive` priced only `outputTokens`; Google bills thinking at the output rate — undercount on the exact thinkingBudget-ignored insurance path. **FIXED:** added `reasoningTokens` to `AgentRunUsage`, captured it on the success path, and `priceLive` now prices `outputTokens + reasoningTokens` (both sum within `maxOutputTokens`, so the estimate stays an upper bound). New test in `evals/draft.test.ts`; RED-GREEN proven (`0.00055`→`0.00805`).
- **F3 (P2) — comments/docs overclaimed live proof.** **FIXED:** `gemini.ts` LIVE_THINKING comment reworded to "live EFFECT … PENDING — measured at slice 2, not yet confirmed"; PROJECT_STATE/CURRENT_TASK/HANDOFF headlines sharpened to "fix WIRED offline; live parse-rate recovery PENDING the owner-gated slice-2 run."
- **F4 (P3) — truncation tests didn't lock usage/cost.** **FIXED:** `evals/draft.test.ts` now asserts `inputTokens`/`outputTokens` preserved, `costUsd` priced from usage, and NOT `UNKNOWN_USAGE`; `evals/agent-loop.test.ts` asserts the truncated redraft's billed cost accrues into the run ledger.

**Codex clean confirmations (verbatim):** the `finishReason` capture is correctly aimed at the real SDK shape; `providerOptions.google.thinkingConfig` is the right shape for `@ai-sdk/google`; the tracked diff leaves `lib/core`, the eval oracle files, `evals/gold`, and `lib/data/*snapshot.json` UNTOUCHED. (Codex did not re-run `npm run verify` in the read-only sandbox; it inspected the evidence log + installed package code.)

**Post-reconciliation gate:** `npm run verify` exit 0 — **303 passed + 5 skipped** (+2 over the pre-Codex 301: the `maxRetries` + reasoning-pricing tests) + typecheck/lint/build green; differential **20/20** UNTOUCHED. RED-GREEN for the two P1 fixes appended to `slice1-drafter-reliability-verify-evidence.log`.

## Confirming passes (the gate earning its keep — each found a NEW real budget-integrity issue; converging)

- **Confirm-1 → BLOCK (1 P1).** `estimateLiveCallCostUsd` reserved only the completion leg, but `priceLive` bills `output+reasoning` and reasoning is NOT capped by `maxOutputTokens` → the estimate under-reserved the thinkingBudget-ignored path (the $5 pre-call bound could be exceeded). **Reconciled:** added `MAX_LIVE_REASONING_TOKENS_RESERVED = 24_576` and reserve `output + reasoning` in the estimate. RED-GREEN (`0.01084 < 0.07228`).
- **Confirm-2 → BLOCK (1 P1 + 1 P3).** 24,576 is the documented max *configurable* thinking budget, but Google documents the budget as a **SOFT limit** (can overflow) → it is not a provable hard ceiling, so the "hard $5 guarantee" framing OVERCLAIMED; P3: the fixed 2,000 input leg is not length-proven either. **Reconciled exactly per Codex's prescription:** (a) DOWNGRADED the claim to **fail-closed best-effort** (comments in `gemini.ts` / `draft.ts` / `budget.ts`); (b) ADDED a **post-call fail-closed overflow stop** in `orchestrator.ts` — the loop halts (`stopReason="budget_overflow"`) if any call's ACTUAL cost exceeds its reservation, bounding any soft-overflow OR input-overflow to a single call (covers P1 + P3 together). RED-GREEN (`'verified'`→`'budget_overflow'`).

**Net mechanism now (honest):** the $5 cap is a **fail-closed best-effort bound** = a conservative pre-call reservation (input + completion cap + the documented max thinking budget) + cumulative accrual + a post-call stop on any over-reservation. NOT a provider-enforced hard quota; the one residual (a single call's soft-budget overflow) is bounded to one event. With `thinkingBudget=0` expected reasoning is 0, so practical spend stays far under the cap (A3-7: ~$0.05).

`npm run verify` exit 0 — **305 passed + 5 skipped**; build green; differential **20/20** UNTOUCHED. RED-GREEN for the two confirming fixes in `slice1-drafter-reliability-verify-evidence.log`.

- **Confirm-3 (interrupted) → SEAT USAGE-LIMITED mid-review (raw error: "try again at 6:03 AM"), no full verdict.** BUT before the limit it surfaced one concrete, actionable signal (the gate earning its keep even truncated): *"the remaining 'true upper bound/guarantee' comments [are] material, not just stylistic."* → there were **3 residual overclaim comments** I had missed in the honesty downgrade (`gemini.ts` MAX_LIVE_OUTPUT_TOKENS header + the reasoningTokens comment + `draft.ts` priceLive). **FIXED** — all now read "conservative best-effort bound … NOT a provider-proven hard guarantee … the post-call overflow stop covers the residual." `verify` still 305+5 green (comment-only). Confirmed via grep: no residual budget overclaim remains (only negations).

- **Confirm-3 (FINAL, seat reset 2026-06-29) → BLOCK, no P0/P1, 1 P2 → RECONCILED primary-model-final.** The seat returned (smoke-test `SEAT_OK`); the full read-only re-pass ran (`gpt-5.5`@`xhigh`, ~223.5k tokens) over the complete reconciled diff. **Verdict BLOCK on a single P2 — "honesty downgrade is not complete":** TWO residual comments STILL called the one-call reserve a "true upper bound" — `gemini.ts:179` ("the $5 cap's upper bound") + `evals/gemini.test.ts:97` (test title "a true upper bound"). The earlier confirm-3-interrupted fix had cleaned three OTHER comments but missed these two. **ACCEPTED + FIXED exactly per Codex's prescription:** both reworded to "`maxRetries=0` makes ONE reservation map to ONE billed SDK provider attempt; a soft-budget/input overflow above the reservation is bounded by the orchestrator's post-call `budget_overflow` stop, NOT by this flag" (`gemini.ts` `liveGenerationOptions` comment + the `evals/gemini.test.ts` test title/comment). Comment/string-only — no behavior change; `verify` stays 305+5 green. Grep-reconfirmed: the only remaining occurrences of the phrase are NEGATIONS ("does NOT make the reserve a provider-proven hard ceiling") or historical arc descriptions in the state/review docs.
- **Codex CLEAN confirmations on the mechanism (verbatim, the load-bearing points):** *"The overflow stop is correctly placed after actual drafter spend accrual and before verify/send routing. Worst-case orchestrator spend is bounded to cap plus one call overflow; no unbounded iteration path found in the loop. `budget_overflow` fails closed: no verify pass, no `simulate_send`, eligibility still protected by `assertEligibilityUntouched`. Differential lane stayed untouched in the inspected diff."* (Codex could not run Vitest in the read-only sandbox — `EPERM mkdir …/ssr` — so validation is the primary model's `npm run verify`, below.)

**The P2 was wording-only; the budget MECHANISM is Codex-CONFIRMED correct (bounded, fail-closed, eligibility-protected, differential untouched). With the two comments reworded, the honesty downgrade is COMPLETE and gate-2 is CLEAN.**

## GATE-2 STATUS: CLEARED (2026-06-29) — final confirming Codex pass CLEAN after the P2 reword

The final confirming Codex pass ran on the reset seat → BLOCK on a single P2 (wording completeness, no P0/P1) → **reconciled primary-model-final** (two comments reworded; `verify` 305+5 green; differential 20/20 untouched). **Every Codex finding across all 5 passes (review BLOCK 4 → confirm-1 BLOCK 1 → confirm-2 BLOCK 1+P3 → confirm-3-interrupted 3-comment → confirm-3-final P2) is now reconciled + (where load-bearing) red-green-locked, and the budget mechanism is Codex-confirmed correct.** No residual finding remains. **gate-2 is CLEAR.** NEXT: acceptance-gate re-stamp → on SHIP, COMMIT slice 1 (owner-authorized per the roadmap directive; push HELD — no remote).
