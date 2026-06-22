[P0] `lib/agents/draft.ts:228`, `lib/agents/gemini.ts:150`, `lib/agents/pricing.ts:57`, `lib/agents/live-batch.ts:61` — billed live failures or missing usage can be recorded as `$0`, so the cumulative cap is not fail-closed. The installed AI SDK’s `NoObjectGeneratedError` can carry `usage`, but the catch path drops it; successful calls with omitted usage also price as zero.
Fix: price SDK parse/schema/no-object errors from `err.usage`; if usage is missing after an attempted live call, stop the batch and record an `UNKNOWN_USAGE` failure rather than continuing. Add tests for SDK-style thrown usage and missing usage.

[P1] `lib/agents/live-batch.ts:55` — live batch returns raw `LIVE_AI` drafts without running gatekeeper/eval. The current test fixture returns one action/claim for every merchant, yet the batch still reports success.
Fix: make batch rows include `gatekeeper`, `evalScore`, and `approvedForHumanReview`; block or mark failed rows before any replay/live-run fixture can consume them.

[P1] `lib/agents/draft.ts:219` — `{{MERCHANT}}` substitution is happy-path only. Missing, partial, misplaced, or invented-name outputs still return `LIVE_AI`; only exact tokens in subject/body are replaced.
Fix: post-parse validate placeholder usage: require the exact token where expected, reject unresolved/partial placeholders anywhere, reject raw real-name appearances before substitution, and test missing/partial/repeated/non-body placeholders.

[P1] `lib/domain/diagnosis.ts:63`, `docs/ENTERPRISE-READINESS.md:8` — `blocker_source` is presented as merchant-side vs platform-side, but no platform-side classifier exists and every implemented blocker is `merchant_side`.
Fix: either implement a real instrumentation-backed platform-side path with a fixture, or downgrade docs/UI to “current demo emits merchant-side only; platform-side is a named target signal.”

[P2] `lib/domain/diagnosis.ts:128` — inactive merchants past step 1 fall through to `progressing`; in the current corpus several merchants with `last_login_days_ago >= 7` are labeled progressing.
Fix: add a `dormant/stale_stuck` state or broaden `ghosted`, and test inactive merchants at steps 2-5.

[P2] `README.md:13`, `app/page.tsx:35`, `app/eval/page.tsx:19`, `docs/ENTERPRISE-READINESS.md:51` — some surfaces still say “every claim” / “only says things that are true,” while the gatekeeper only verifies declared claims plus regex/state patterns.
Fix: consistently say “declared claims” and note semantic prose-to-claim coverage is not built yet.

Confirmed: `lib/core/*` and `evals/core-differential.test.ts` are untouched in `f1d1d4a..HEAD`. No edits made.

VERDICT: BLOCK