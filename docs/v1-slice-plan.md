# V1 Thin-Slice Plan (T-001)

Status: **implemented (T-001, committed; 23/23 tests pass).** Companion to `docs/v1-data-dictionary.md`. The plan below is the as-built spec; `scripts/` implements it and `out/` holds the artifacts. Keep in sync with `scripts/`/`tests/` on change.

## Problem this slice proves

That the boring, load-bearing parts of an activation workflow work on dummy data **before** any external system is added: stable identity, a clean schema, a transparent risk score, deterministic blocker diagnosis, a human review queue, a structured (guardrailed) draft, a simulated send that cannot duplicate, and an audit trail. If this slice cannot show *who* should be contacted, *why*, with *what* approved message, and *under what* idempotency, no integration will fix that.

## Why offline first

No credentials, no network, no vendor accounts, nothing irreversible. It is fully reproducible from the source CSV + scripts, fast to test, and safe to run repeatedly. It also forces the data-model decisions that every later stage (Supabase, Gemini, Slack, Resend, n8n) depends on. This matches `RULES.md` §3 and `docs/plan-reconciliation.md` §5.

## Inputs

- `DoorDash Merchant Nudge Engine - Merchant Directory.csv` (read-only, 20 rows).
- Config: `as_of_date = 2026-06-01`; `risk.v1` formula; `thresholds.v1` (assumption); `prompt.v1` / `stub-deterministic.v1` / `draft.v1` versions.
- Test fixtures (synthetic) for ineligible contacts and a planted bad draft.

## Outputs

- `out/merchants_v1.csv` (normalized entity table).
- `out/model_runs.csv` (generation provenance log).
- `out/audit_log.csv` (workflow events incl. simulated sends).
- A review-queue view (printed and/or `out/review_queue.csv`).
- Passing test suite.

**Run modes (implemented):** `python3 scripts/run.py` **preserves** the append-only logs by default, so a re-run dedups (emits `skipped_duplicate`, no new `simulated_send`) — this is what makes app-path idempotency real (P2-1). `python3 scripts/run.py --fresh` is the **explicit** reset that clears `out/` and regenerates a clean single-run artifact. `merchants_v1.csv`/`review_queue.csv` are deterministic snapshots; `audit_log.csv`/`model_runs.csv` are append-only and grow on preserve-mode re-runs.

## File structure (proposed)

```
DoorDash Merchant Nudge Engine - Merchant Directory.csv   # source, read-only
out/
  merchants_v1.csv
  model_runs.csv
  audit_log.csv
  review_queue.csv            # optional view
scripts/                      # Python — created in the IMPLEMENTATION task, not now
tests/
  fixtures/                   # synthetic ineligible + bad-draft cases
docs/v1-data-dictionary.md
docs/v1-slice-plan.md
```

## Implementation steps (for the later build task — not now)

1. **Ingest** the source CSV read-only; assert it is unchanged afterward (hash).
2. **Normalize**: fix headers, parse decimals→ints, map category enum, assign `merchant_id`, seed labeled-synthetic contact defaults; write `merchants_v1.csv`.
3. **Derive timestamps** from `as_of_date`.
4. **Risk**: recompute `risk_score` (validate == source); carry source `risk_level`; derive `risk_reason_codes`.
5. **Blocker**: map `steps_completed` → `current_blocker_code` / `next_best_action`.
6. **Review queue & gating**: set `contact_eligible`; set `review_required`/`review_reason` (High-risk OR `contact_eligible=false`); set `approval_state` (`pending_review` if review-required, else `not_required`; `approved`/`rejected` only from a synthetic fixture); compute `send_eligible = contact_eligible AND (review_required=false OR approval_state=approved)`; emit the queue view.
7. **Draft (stub)**: generate one `draft.v1` JSON per non-suppressed merchant — **including review-held ones**, so a human has something to approve; run guardrails; on pass set `outreach_status=drafted`, on fail `draft_rejected`; log to `model_runs`.
8. **Simulated send**: for **`send_eligible=true`** drafted merchants only, append `simulated_send` to `audit_log` with `idempotency_key`; re-run must skip duplicates. Review-held merchants without approval are never sent.
9. **Audit**: append events throughout.
10. Each step is a small, separately-reviewable commit (`RULES.md` §12).

## Tests / checks (these are the acceptance criteria)

| ID | Check |
| --- | --- |
| T1 | Source CSV byte-identical before/after a run (hash) |
| T2 | Header normalized; no duplicate column names |
| T3 | 20 unique `merchant_id` values matching `^M\d{3}$` |
| T4 | Recomputed `risk_score` == source on all 20 rows (genuine formula validation) |
| T5 | `thresholds.v1` consistency: recomputed level == carried source label on all 20 — **consistency only, not a correctness claim** (any boundary in the 48→69 / 69→89 gaps also passes) |
| T6 | `signup_at`/`last_login_at` derive correctly from `as_of_date`; `last_login_at ≥ signup_at` |
| T7 | `current_blocker_code`/`next_best_action` match the step mapping for all rows |
| T8 | Review queue = all `High` (8 rows) ∪ eligibility-failures; counts asserted |
| T9 | Each draft validates against the `draft.v1` schema |
| T10 | Guardrail flags a planted bad draft (revenue guarantee) and passes a clean draft (fixtures) |
| T11 | Guardrail over the 20 real source nudges → **0 forbidden-claim flags** (no over-flagging) |
| T12 | Draft state-consistency: draft `next_best_action` == computed; blocker referenced |
| T13 | Idempotency: send step run twice → exactly one `simulated_send` per merchant; duplicates skipped |
| T14 | Determinism: two full runs → identical `merchants_v1.csv` (compare on stable fields) |
| T15 | Eligibility routing (fixture): synthetic opted-out/suppressed/invalid-email cases route to review and are NOT sent |
| T16 | Every `merchants_v1.csv` row validates against the data dictionary (types/enums/allowed values) |
| T17 | **Send gate:** every `review_required=true`/High merchant produces **no** `simulated_send` unless a synthetic approval fixture sets `approval_state=approved` (with approval + valid contact → exactly one send) |
| T18 | **Guardrail under-flag coverage:** one negative fixture per category (`forbidden_revenue_claim`, `unsupported_metric`, `false_impact_claim`, `pii_or_secret`, `aggressive_urgency`, `state_mismatch`) is flagged |

**Fix-coverage tests added during implementation (from the two Codex review rounds).** The implemented suite is **23 tests = T1–T18 + P2-1..P2-5** (`tests/test_t001.py`):

| ID | Check |
| --- | --- |
| P2-1 | **App-path idempotency:** `python3 scripts/run.py` (preserve-history, default) re-run emits only `skipped_duplicate`, no new `simulated_send`; `--fresh` is an explicit reset |
| P2-2 | `parse_int` rejects fractional values (e.g. `3.50`) instead of truncating |
| P2-3 | `model_run_id` stays unique across appended runs (offset by existing row count) |
| P2-4 | `state_mismatch` flags prose claiming a not-yet-completed step is done (keyword-first) |
| P2-5 | `state_mismatch` also flags verb-first completion prose ("We've added your photos"); clean draft not flagged |

## Edge cases

- `steps_completed = 5` → blocker `final_verification_needed`; still eligible for a "final nudge"; usually Low risk.
- `steps_completed = 0` → `business_verification_needed`; usually High risk.
- Decimal source values (`3.00`) parse to integers; reject non-integer.
- Duplicate merchant names (none in sample) must not break IDs — `merchant_id` is assigned by source order, not derived from name.
- Risk values exactly on a threshold boundary do not occur in the data; the `>=`/`<` behavior is still defined explicitly so it is deterministic.
- High-risk merchant: scored, diagnosed, and a draft is generated, but it is **held** (`approval_state=pending_review`) and never auto-sent.
- Contact-ineligible merchant (fixture): routed to review and never sent regardless of risk.
- Approved-then-eligible (fixture): a held merchant with a synthetic `approval_state=approved` and valid contact becomes `send_eligible` and is sent **exactly once**.
- Guardrail-failed draft is logged (`draft_rejected`) and the merchant is queued; no human-override UI in V1.

## Explicitly out of scope

Live Supabase/n8n/Slack/Resend/Gemini; real credentials; real contacts/consent; real sending; per-step statuses/timestamps; delivery webhooks; outcome learning; cost ledgers; dashboards; the 14-table normalized schema; multi-channel outreach; any autonomous/agentic tool use. (See `docs/plan-reconciliation.md` §6 and data dictionary §12.)

## Codex review focus

1. Are the `thresholds.v1` values defensible as a documented assumption, and is the T5 framing honest (not overclaiming)?
2. Is carrying source `risk_level` while recomputing `risk_score` the right call, or should both be recomputed?
3. Is the `merchant_id` = `M001..M020`-by-row-order strategy stable enough for V1, given the limitation?
4. Is the forbidden-claims list adequate, or naive/over-broad? Will T11 (20 real nudges) actually pass without over-flagging?
5. Is the idempotency key (with `cooldown_window = as_of_date`) sufficient to prevent duplicate sends?
6. Is putting synthetic ineligibility in fixtures (not product data) the right separation?
7. Is two append-only logs + one entity CSV the right store for V1, or is SQLite already warranted?
8. Any scope creep, or missing test?

## GO / NO-GO criteria for implementation

**GO when all are true:**
- This plan and the data dictionary are approved by the human owner.
- Codex `/codex:adversarial-review` has been run and blocking findings are resolved (round 1 done 2026-06-01: the review-gate [high] and guardrail-coverage [medium] findings are addressed by the send-gate model + T17/T18).
- The test list (**T1–T18**, plus the **P2-1..P2-5** fix-coverage tests added during implementation = **23 total**) is the acceptance criteria.
- The as-of date is confirmed (currently `2026-06-01`).

**NO-GO if any:**
- Scope exceeds one entity CSV + two append-only logs.
- The threshold honesty caveat (T5) is removed or the label-match is presented as threshold validation.
- The send gate is missing — i.e., a `review_required=true`/High merchant can reach `simulated_send` without explicit approval (T17 absent or failing).
- Any live integration, real credential, or real-send path is introduced.
- The source CSV would be modified.
