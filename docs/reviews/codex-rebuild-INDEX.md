# Cross-model (Codex) review record — the Next.js/TS rebuild

Durable evidence for the maker≠judge / cross-model gate (RULES §2, §9) on the **shipped
rebuild artifact** (`lib/**`, `app/**`, the fixtures) — distinct from the plan-stage
`PLAN-REVIEW-LOG.md` (which covered the superseded T-003 plan, not this code).

These verdicts were recovered (2026-06-22) from the ephemeral `/tmp/codex-verdict-*.md`
paths the `~/claude-os/bin/codex-guarded` wrapper writes to, and committed here so the gate
rests on in-repo evidence rather than state-doc narration. Verbatim; no edits.

| File | Date | Scope | Verdict | Reconciliation |
| --- | --- | --- | --- | --- |
| `codex-2026-06-19-rebuild-comprehensive.md` | 2026-06-19 | First comprehensive review of the thin slice (budget cumulative cap · billed-fail $0 · `merchant_name` injection · gatekeeper "every claim" overclaim · personal-name DBA PII · empty-corpus vacuous pass · wall-clock snapshot) | BLOCK | All fixed; see decision-log 2026-06-19 + `PROJECT_STATE.md`. |
| `codex-2026-06-20-batch2.md` | 2026-06-20 | Post-slice batch (P0 cumulative cap not fail-closed on missing usage · live-batch ungated · `{{MERCHANT}}` happy-path-only · `blocker_source` overclaim · dormant-state gap · "every claim" copy) | BLOCK | All fixed + test-covered (commit `c385936`); decision-log 2026-06-20. |
| `codex-2026-06-20-confirming-1.md` | 2026-06-20 | Confirming pass (state-consistency false-negative · partial-usage cost · `live:true` provider bypass · **live-run stat conflict $0.0036/4-2 vs $0.0037/5-1** · stale honesty copy) | BLOCK | Reconciled; the stat conflict's full public-copy sync completed 2026-06-22 (see journal). |
| `codex-2026-06-20-confirming-2.md` | 2026-06-20 | Confirming pass 2 (guardrail-corpus ran 40 of 45 · GR-POS-009 byte-fidelity · live-samples invariant-not-lock · "every claim" copy · stale handoff/preflight copy) | BLOCK | Reconciled (corpus runs all 45, etc.); decision-log 2026-06-20. |
| `codex-2026-06-22-alignfix.md` | 2026-06-22 | Pass on the alignment-audit fix slices (no-leakage scored-but-not-enforced · footer "public business-record names" · "caught nothing" overclaim now false · detector false-pos/neg · eval-value lock · grader-list surfaces · review-doc whitespace) | BLOCK | All 11 reconciled in slice 6 (gatekeeper now enforces no-leakage; precise denylist; copy synced). Confirming pass recommended. |

**Status of the dated confirming-Codex obligation:** the 2026-06-20 decision-log noted the
confirming re-pass was briefly seat-blocked (retry ≈Jun 24). It subsequently ran on the
restored seat — the two `confirming-*` verdicts above are that pass (both BLOCK → reconciled).
The obligation is **satisfied and now evidenced in-repo**. A fresh pre-deploy Codex pass on the
2026-06-22 fix slices (honesty copy · no-leakage grader · a11y) is still recommended before T13.
