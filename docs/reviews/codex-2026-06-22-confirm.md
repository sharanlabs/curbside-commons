# Codex confirming pass — 2026-06-22 (on the slice-6 reconciliation)

Cross-model gate (gpt-5.5 @ xhigh) on `git diff af3680e..HEAD` after slice 6. Confirms the prior
11 findings are closed, then surfaces 4 second-order items. Raw tee at the session's
`/tmp/codex-verdict-activationops-confirm.md`.

## Verified closed (no regression)

Shared `registerLeakFailures` used by both `gradeNoLeakage` and `runGatekeeper`; the exact recorded
leaks are caught; the gatekeeper blocks register leaks with `approvedForHumanReview=false`; the clean
deterministic corpus still passes; grader surfaces include `no-leakage`; live-samples locks leaky 3/4
vs clean 4/4; `lib/core/*` + `evals/core-differential.test.ts` untouched; the snapshot gate gap is
honestly fixed-forward. Validation: typecheck/lint/test green (159 passed / 1 skipped at the time);
`next build --webpack` passed (the default Turbopack build only failed on a sandbox port-bind panic,
not a code diagnostic — it builds green in the dev environment).

## New findings

- **[P1] lib/agents/state-consistency.ts** — hyphenated known identifiers (`bank-verification-needed`) were split before denylist normalization, so the gate could still approve them. → **Fixed (slice 7):** include hyphens in the token regex + the identifier-shape filter (the precise denylist keeps benign hyphenated words like `sign-up` safe).
- **[P1] lib/agents/state-consistency.ts** — the risk regex missed direct forms `risk is high` / `risk=high`. → **Fixed (slice 7):** broadened to cover `risk is|was|:|=` level disclosures.
- **[P1] README.md / docs/WHY.md / docs/ENTERPRISE-READINESS.md** — "3 of the 6 parseable real drafts" was imprecise (the fixture has 5 parsed LIVE_AI + 1 FAILED_TO_FALLBACK fallback). → **Fixed (slice 7):** "3 of the 5 parsed live drafts."
- **[P2] tests** — the allow/deny edge cases (Tacos_To_Go, snake/camel/UPPER/kebab known identifiers, risk phrasing variants) were not committed as regression tests. → **Fixed (slice 7):** added an explicit `registerLeakFailures` allow/deny describe block.

**VERDICT: BLOCK** (4 second-order items) → all reconciled in slice 7; `npm run verify` green, **161 tests + 1 skipped**. A final confirming pass closes the loop.
