# Codex changed-files review — A3-2a (Strategist agent + anti-theater eval)

**Date:** 2026-06-28 · **Reviewer:** Codex (config default `gpt-5.5` @ `xhigh`), read-only, via `~/claude-os/bin/codex-guarded` · **Target:** the uncommitted A3-2a diff · **Reconciliation:** primary-model-final (Opus 4.8).

## Scope reviewed
- `lib/agents/strategist.ts` (NEW) — `strongRecommend` deterministic anti-theater baseline + envelope helpers (`allowedRoute`/`clampRouteToEnvelope`) + the LLM `strategistRecommend` (Groq `gpt-oss-120b`).
- `lib/agents/loop/orchestrator.ts` — `RecommendFn` sync-or-async; the loop `await`s `recommend`.
- `evals/strategist.test.ts` (NEW) — `strongRecommend` unit tests + the anti-theater eval harness.

`npm run verify` green at review time: 270 passed + 4 skipped. `lib/core/*`, the oracle, the gold sets, and the frozen snapshots UNTOUCHED (differential 20/20).

## Verdict (round 1): **BLOCK** — 4 findings (1 P1 · 2 P2 · 1 P3)

| # | Sev | Finding | Reconciliation (primary-model-final) |
|---|-----|---------|--------------------------------------|
| F1 | **P1** | Strategist live gate used `judgeLiveEnabled()`, which reads `JUDGE_PROVIDER` — a `JUDGE_PROVIDER=gemini` override would misroute the always-Groq Strategist's liveness to `GEMINI_API_KEY`. Same bug class as the `domainJudgeLiveEnabled()` split (Codex B1 P2-2). | **ACCEPTED + FIXED.** Added `groqLiveEnabled()` (`ENABLE_LIVE_AI && GROQ_API_KEY`, no provider switch) in `lib/server/env-flags.ts`; `strategist.ts` uses it at both sites. **Also** swapped `lib/agents/groq-draft.ts` (the adjacent A2 drafter with the identical latent coupling + an inaccurate comment) — surfaced explicitly, same one-line fix; both are Groq-only agents; default config (`JUDGE_PROVIDER` unset/groq) is behavior-identical. Test-locked by 4 env-routing tests incl. the `JUDGE_PROVIDER=gemini` non-misroute case. |
| F2 | **P2** | The plan trajectory hardcoded `modelMode: "DETERMINISTIC_RULES"`; a wired LLM Strategist returning `LIVE_AI`/`FAILED_TO_FALLBACK` would make the trajectory lie (while `agent` correctly stays `tool`). | **ACCEPTED + FIXED.** Base `Recommendation` gained optional `mode?`/`errorClass?`; the plan step records `recommendation.mode ?? "DETERMINISTIC_RULES"` and appends the fallback reason to the verdict summary. `agent` stays `tool` (tool-until-earned). `defaultRecommend` (no mode) still reads DETERMINISTIC_RULES. |
| F3 | **P2** | The DI eval injected `caution` directly; the mock never read the prompt, so dropping `risk_level`/tenure/engagement from `buildStrategistPrompt()` would NOT fail a test — the prompt wiring was not regression-locked. | **ACCEPTED + FIXED.** Exported `buildStrategistPrompt`; added regression tests asserting each discriminating fact (risk_level, review_required, tenure, engagement_state, blocker_label, blocker_code, root_cause) is present via its rendered fact-line, AND the raw `merchant_name` is absent (also locks the injection-surface claim from probe C). |
| F4 | **P3** | The mutable loop merchant was passed to `recommend`; the eligibility invariant was only checked at the end. A bad recommender can't force a send (the post-check throws + `simulate_send` is pure) but should be caught earlier. | **ACCEPTED + FIXED by isolation.** The orchestrator now passes a defensive shallow clone `recommend({ ...merchant }, diagnosis)` — a recommend impl physically cannot touch the loop's merchant (recommend-only by construction); `assertEligibilityUntouched` stays as the belt. New regression: an async recommender that mutates `send_eligible`/`review_required` leaves the loop merchant unchanged and never sends (passes ONLY with the clone). |

### Probe confirmations (round 1, carried forward)
- **A — route-clamp separation:** correct; advisory `route` never feeds `simulate_send`; the send recomputes deterministic eligibility. No send gap.
- **B — eval non-vacuous:** the anti-theater eval is a genuine structural FLOOR — naive baselines (`diagnose().play`, `defaultRecommend`) and a risk-blind mock FAIL; `strongRecommend` + a risk-aware mock PASS. Caveat noted: the normalized High-risk pair also flips `review_required`, so it is "differs on `source_risk_level` (and the review it induces)", not "only risk" — test comment corrected.
- **C — Strategist honesty:** mode/cost labeling correct; injected mocks reading `LIVE_AI` follows the existing DI convention (not a real live verdict).
- **D — async change:** awaiting a sync `defaultRecommend` does not change A2 behavior.
- **E — note:** `HANDOFF.md` was stale ("NO test yet, NO LLM yet") — re-synced at slice close; untracked tooling dirs stay out of the commit (explicit paths).

## Post-fix state
`npm run verify` green: **277 passed + 4 skipped** (+7 regression tests: 4 env-routing, 2 prompt-wiring, 1 mutating-recommender). Each finding is test-locked. Differential lane still UNTOUCHED.

## Verdict (round 2 — confirming re-pass on the FIXED diff): **SHIP** — no blocking residuals

Read-only re-pass via `codex-guarded` (background; the first foreground attempt exceeded the 10-min limit). Verbatim confirmations:
- **F1 resolved:** `groqLiveEnabled()` is `ENABLE_LIVE_AI && GROQ_API_KEY` with no provider switch (`lib/server/env-flags.ts`); the Strategist uses it (`strategist.ts:211/:218`); the Groq drafter uses it (`groq-draft.ts:84/:92`). The `JUDGE_PROVIDER=gemini` misroute is closed.
- **F2 resolved:** `Recommendation.mode/errorClass` exist (`orchestrator.ts`); the plan step records `recommendation.mode ?? "DETERMINISTIC_RULES"` + the fallback detail; `agent` stays `"tool"`.
- **F3 resolved:** `buildStrategistPrompt` carries the discriminating fact lines; tests assert risk, review flag, tenure, engagement, blocker label/code, root cause + merchant-name absence (`strategist.test.ts`).
- **F4 resolved:** `recommend({ ...merchant }, diagnosis)` isolates the eligibility fields; the async mutating-recommender regression is non-vacuous (`agent-loop.test.ts`).
- **Prior probes hold:** advisory route does not feed `simulate_send`; the anti-theater eval is non-vacuous; no send gap; tool-until-earned intact (no `strategist`/`router`/`domain_critic` labels in the loop). Differential lane untouched (no changes under `lib/core`, `evals/gold`, `eval/`, `lib/data/*snapshot*`).

Codex did not re-run `npm run verify` (read-only sandbox); it reviewed the fixed diff statically against the maker-side green result (277+4).

**A3-2a Codex gate = FULLY DISCHARGED** (BLOCK → 4 reconciled primary-model-final + test-locked → confirming **SHIP**). Reconciliation files (`groqLiveEnabled` in env-flags.ts + groq-draft.ts) covered by the confirming pass. Raw verdicts: `/tmp/codex-verdict-activationops-a3-2a.txt` (round 1) + `/tmp/codex-verdict-activationops-a3-2a-confirm.txt` (round 2).
