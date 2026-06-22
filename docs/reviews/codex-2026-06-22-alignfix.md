# Codex adversarial review — 2026-06-22 alignment-audit fix slices

Cross-model gate (gpt-5.5 @ xhigh, via `~/claude-os/bin/codex-guarded`) on `git diff af3680e..HEAD`
— the honesty/accuracy + no-leakage-grader + a11y + traceability fix slices. Findings transcribed
from the run; raw tee at the session's `/tmp/codex-verdict-activationops-alignfix.md`.

## Findings

- **[P1] lib/agents/live-batch.ts** — `no-leakage` failures were scored in the eval but NOT enforced; a live draft could have `evalScore.pass === false` yet keep a gatekeeper `PASS/WARN`, so consumption via `approvedForHumanReview` could pass merchant-facing leaks. → **Fix:** make no-leakage part of `runGatekeeper()` (or fail closed on `!evalScore.pass`).
- **[P1] app/layout.tsx** — the global footer still said REPLAY runs over "public business-record names," contradicting the fictional-display fix. → **Fix:** fictional display names + synthetic state; public records only as adapter capability.
- **[P1] README.md / docs/WHY.md / docs/ENTERPRISE-READINESS.md** — "caught no bad-but-parseable draft" became FALSE once the no-leakage grader catches 3 parseable live drafts. → **Fix:** say it caught register leaks in 3 parseable drafts; keep the semantic judge unbuilt.
- **[P2] lib/evals/draft-quality.ts** — the generic lowercase snake_case regex could false-POSITIVE (`tacos_to_go`) and false-NEGATIVE (`CURRENT_BLOCKER_CODE`, `currentBlockerCode`, `risk: High`). → **Fix:** explicit denylist/normalizer from schema/core tokens + allow/deny tests.
- **[P2] evals/live-samples.test.ts** — verified leaky names but not that fixture `eval` values match leak status (3/4 vs 4/4 could drift). → **Fix:** assert leaky=3/4, clean=4/4.
- **[P2] app/page.tsx / docs/WHY.md / docs/ENTERPRISE-READINESS.md** — three grader-list surfaces still listed only structure·state-consistency·policy. → **Fix:** add no-leakage.
- **[P2] docs/reviews/codex-2026-06-19-*.md** — recovered review docs had trailing whitespace (`git diff --check` failed). → **Fix:** strip trailing whitespace.

**Confirmed:** the live re-score is correct (Fog City/Bayview/Mission Masa = 3/4; Marina/Sunset/Embarcadero = 4/4); `$0.004203`→`$0.0042`; `5 LIVE_AI / 1 FAILED_TO_FALLBACK`; `npm test` = 157 passed | 1 skipped; `lib/core/*` + `evals/core-differential.test.ts` untouched.

**VERDICT: BLOCK**

## Reconciliation (slice 6)

All 11 findings reconciled:
- **Enforcement (P1):** `registerLeakFailures` moved to the shared `lib/agents/state-consistency.ts` and wired into BOTH the eval grader AND `runGatekeeper` (a register leak is now a BLOCKING failure → `approvedForHumanReview=false`); gatekeeper teeth test added.
- **Detector hardening (P2):** replaced the generic snake_case regex with a PRECISE denylist built from `STEP_MAP` (blocker codes + actions) + internal field names, normalized to catch snake/camel/UPPER forms of KNOWN tokens while never false-flagging an arbitrary `tacos_to_go`; risk regex broadened (`risk: High`, `flagged … risk`).
- **Copy (P1):** footer → fictional display; README/WHY/ENTERPRISE → "caught register leaks in 3 parseable drafts; semantic judge unbuilt."
- **Locks (P2):** live-samples test asserts eval==leak status; the 3 grader-list surfaces add no-leakage; recovered review docs stripped of trailing whitespace.

Verified: `npm run verify` green; **159 tests + 1 skipped** (the +2 = gate teeth + eval-match lock). A confirming Codex pass on this reconciliation is the last recommended step before T13.
