[P1] `lib/agents/state-consistency.ts:20-37` weakens real state-overclaim coverage. It now misses claims like “business verification has been completed,” “bank verification has been completed,” “your business hours are set,” and curly-apostrophe “you’re now live.” Because both `lib/agents/gatekeeper.ts:91-97` and `lib/evals/draft-quality.ts:70-75` use this helper, true overclaims can pass both runtime gate and eval. Fix: expand tense-aware patterns for `has been completed`, `completed`, `hours are/were set`, and `you(?:'|’)re`, while keeping imperative TODO phrasing allowed.

[P1] `lib/agents/draft.ts:175` treats partial provider usage as known usage. If only `inputTokens` or only `outputTokens` arrives, missing output/input prices as `$0`, avoids `UNKNOWN_USAGE`, and the batch can continue undercounting spend. Fix: require both finite non-negative input and output tokens for `known=true`; otherwise charge `estimatedNextUsd` and return `UNKNOWN_USAGE`.

[P1] `lib/agents/live-batch.ts:60-64` / `lib/agents/draft.ts:201` can bypass `ENABLE_LIVE_AI` when a caller passes `live: true`. The smoke test is gated, but the provider boundary is not. Fix: when `generate` is not injected, enforce `liveAiEnabled()` before any real provider call.

[P1] `lib/data/live-samples.snapshot.json:7-15`, `PROJECT_STATE.md:3`, `HANDOFF.md:7` conflict on the live-run facts. Fixture says `4 LIVE_AI / 2 FAILED_TO_FALLBACK`, `3 WARN / 3 PASS`, `$0.003568`; state/handoff say `5 LIVE_AI / 1 FAILED_TO_FALLBACK`, `1 BLOCKED`, `$0.0037`. Fix: pick the canonical recorded run and sync fixture, state, handoff, and public copy from it.

[P2] `evals/gatekeeper.test.ts:84-101` and `evals/draft-quality.test.ts:56-60` do not lock the new state checker broadly enough. Fix: add a shared table for business/bank/menu/photos/hours/live overclaims and imperative allowed cases, asserting both gatekeeper and eval behavior.

[P2] Stale honesty copy remains after the recorded live run: `app/eval/page.tsx:30-34`, `README.md:24-25`, `README.md:58`, `docs/ENTERPRISE-READINESS.md:33`, `docs/WHY.md:57`. Fix: distinguish “public demo does not make live calls” from “recorded live Gemini fixture exists.”

[P2] “truthful next message/nudge” overstates what is proven in `README.md:3`, `app/page.tsx:53-56`, `app/metrics/page.tsx:29-32`. Fix: use “claim-checked” / “data-constrained”; the system verifies declared claims and policy patterns, not all prose truth semantically.

[P2] `lib/agents/budget.ts:52-56` rejects non-finite `spent/next` but not negative spend/estimate or invalid caps. Fix: reject negative values, non-finite caps, and `capUsd <= 0`.

Confirmed non-findings: `lib/core/*` and `evals/core-differential.test.ts` are unchanged; `scanText` still preserves forbidden-claim/PII coverage; `evals/live-smoke.test.ts` skips unless both `ENABLE_LIVE_AI` and `GEMINI_API_KEY` are present; no hardcoded secrets found in the reviewed diff; the live fixture uses public DataSF trade names with private fields excluded.

Validation note: review was read-only. `git diff --check f1d1d4a..HEAD` returned clean apart from sandbox `xcrun` cache warnings; Vitest was not run because the read-only sandbox blocks temp-file creation.

VERDICT: BLOCK