# V1 Data Dictionary

Status: **plan / not yet implemented.** This defines the V1 offline thin-slice data contract for ActivationOps AI. It is the schema the future ingest/normalize task must satisfy. No code or output files exist yet.

Dummy data only. No real DoorDash access, no real merchants, no real impact. All seeded values are labeled synthetic.

As-of date: **2026-06-01** (fixed reference for deriving timestamps; owner may change).

## 1. Source CSV issues found

Source: `DoorDash Merchant Nudge Engine - Merchant Directory.csv` (20 rows, 9 columns). Verified by direct inspection.

| # | Issue | Evidence | V1 handling |
| --- | --- | --- | --- |
| 1 | Duplicate header — columns 1 and 2 are both `Merchant Name` | raw header row | Rename col 1 → `merchant_name`, col 2 → `merchant_category` |
| 2 | Column 2 is actually category, not name | values: Restaurant/Retail/Grocery/Convenience | Map to `merchant_category` enum |
| 3 | No stable identifier | no ID column; names could collide/change | Assign `merchant_id` (`M001`–`M020`) |
| 4 | Relative day counts, not timestamps | `Days Since Signup`, `Last Login (days ago)` | Derive `signup_at` / `last_login_at` from as-of date |
| 5 | Integer fields stored as decimals | `3.00`, `2.00`, `42.00` | Parse to integers |
| 6 | Risk score has no documented formula/version | only the number | Recompute + version the formula (see §6) |
| 7 | Risk level thresholds undocumented and under-constrained | only 2 Medium rows, both = 69; gaps 48→69 and 69→89 | Carry source `risk_level` as authoritative; thresholds are an **assumption** (see §6) |
| 8 | `Estimated Time Saved (min)` constant = 15 | all 20 rows | Exclude from decisioning; mark simulated; out of scope (§16) |
| 9 | `AI Nudge Message` already generated with no provenance | no prompt/model/guardrail record | Do not reuse as truth; regenerate via stubbed generator with provenance (§13–14) |
| 10 | No contact, owner, consent, review, send, outcome, or audit state | absent | Seed labeled-synthetic contact defaults; add state columns (§3–§11) |

## 2. Normalized output files

V1 storage = **one entity table + two append-only event logs** (not a 14-table schema; not a database). Proposed location `out/` to keep generated artifacts separate from the read-only source.

| File | Kind | Purpose |
| --- | --- | --- |
| `out/merchants_v1.csv` | entity table | One row per merchant; normalized + derived + state fields |
| `out/model_runs.csv` | append-only log | One row per draft generation (provenance/audit of AI output) |
| `out/audit_log.csv` | append-only log | One row per workflow event, including simulated sends (a send is an audit event) |

The original CSV is read-only and must be byte-identical before and after any run.

## 3. `merchants_v1.csv` — required columns

Types: `string`, `integer`, `date` (ISO-8601 `YYYY-MM-DD`), `datetime` (ISO-8601), `boolean`, `enum`, `list<string>` (semicolon-separated in CSV).

### Identity & profile

| Column | Type | Allowed values | Sample | Validation |
| --- | --- | --- | --- | --- |
| `merchant_id` | string | `M001`–`M020` | `M007` | unique; non-null; matches `^M\d{3}$` |
| `merchant_name` | string | free text (from source col 1) | `Golden Dragon` | non-empty |
| `merchant_category` | enum | `Restaurant`,`Retail`,`Grocery`,`Convenience` | `Restaurant` | in enum |
| `source_row_index` | integer | 1–20 | 2 | unique; 1-based source order |

### Timestamps (derived)

| Column | Type | Allowed values | Sample | Validation |
| --- | --- | --- | --- | --- |
| `as_of_date` | date | constant `2026-06-01` | `2026-06-01` | equals configured as-of date |
| `days_since_signup` | integer | 0–365 (source 1–28) | 7 | from source; ≥0 |
| `last_login_days_ago` | integer | 0–365 (source 0–21) | 5 | from source; ≥0 |
| `signup_at` | date | derived | `2026-05-25` | `= as_of_date − days_since_signup` |
| `last_login_at` | date | derived | `2026-05-27` | `= as_of_date − last_login_days_ago`; `≥ signup_at` |

### Onboarding & blocker diagnosis

| Column | Type | Allowed values | Sample | Validation |
| --- | --- | --- | --- | --- |
| `steps_completed` | integer | 0–5 | 1 | from source; 0≤x≤5 |
| `total_steps` | integer | constant `5` | 5 | = 5 |
| `current_blocker_code` | enum | see §5 | `menu_upload_needed` | matches step mapping (§5) |
| `next_best_action` | enum | see §5 | `upload_menu` | 1:1 with blocker (§5) |

### Risk (see §6)

| Column | Type | Allowed values | Sample | Validation |
| --- | --- | --- | --- | --- |
| `risk_score` | integer | 0–200 | 69 | **recomputed**; must equal source `Risk Score` (genuine check) |
| `risk_score_formula_version` | string | `risk.v1` | `risk.v1` | constant |
| `risk_level` | enum | `Low`,`Medium`,`High` | `Medium` | **carried from source** (authoritative) |
| `risk_level_source` | string | `source_csv` | `source_csv` | constant — records that the label is carried, not asserted |
| `risk_reason_codes` | list<string> | `tenure_pressure`,`inactivity`,`low_completion` | `inactivity;low_completion` | derived (§6); each in enum |

### Contact & eligibility (labeled synthetic — see §note)

| Column | Type | Allowed values | Sample | Validation |
| --- | --- | --- | --- | --- |
| `contact_email` | string | `<slug>@example.com` | `golden-dragon@example.com` | matches `@example.com$`; derived from name slug |
| `contact_is_synthetic` | boolean | constant `true` | `true` | = true (no real contacts exist) |
| `email_opt_in_status` | enum | `unknown` (V1 default) | `unknown` | V1: `unknown` for all real rows — **no invented opt-in/out** |
| `suppression_reason` | string | empty in product output | `` | null/empty for all real rows |
| `contact_eligible` | boolean | `true`,`false` (derived) | `true` | `= valid_email_format AND email_opt_in_status != opted_out AND suppression_reason is empty` |

> Note (honesty): the source has no contact or consent data. `merchants_v1.csv` is an **honest normalization** — it does not invent opted-out or suppressed merchants to populate the review queue. Eligibility/suppression *routing logic* is exercised by separate test fixtures (§ tests T15), not by fabricating facts in the product output.
>
> `contact_eligible` is about **reachability**, not approval — it is deliberately separate from `send_eligible` (see Approval & send gating). Consent simplification (labeled): in this simulation, `email_opt_in_status = unknown` is treated as permitted for `contact_eligible` so the happy-path send can be demonstrated on the real rows; a production system must require explicit opt-in, making `unknown` ineligible. All contact values are synthetic.

### Review queue state (see §7)

| Column | Type | Allowed values | Sample | Validation |
| --- | --- | --- | --- | --- |
| `review_required` | boolean | `true`,`false` | `true` | `true` iff `risk_level=High` OR `contact_eligible=false` |
| `review_reason` | string | e.g. `high_risk`,`ineligible_contact` | `high_risk` | non-empty when `review_required=true` |

### Approval & send gating (see §7.1 — separates contact-eligibility from send-eligibility)

| Column | Type | Allowed values | Sample | Validation |
| --- | --- | --- | --- | --- |
| `approval_state` | enum | `not_required`,`pending_review`,`approved`,`rejected` | `pending_review` | `not_required` when `review_required=false`; `pending_review` when `review_required=true`; `approved`/`rejected` only from a synthetic approval fixture (no human UI in V1) |
| `send_eligible` | boolean | `true`,`false` (derived) | `false` | `= contact_eligible AND (review_required = false OR approval_state = approved)` |

### Outreach / send state (see §10)

| Column | Type | Allowed values | Sample | Validation |
| --- | --- | --- | --- | --- |
| `outreach_status` | enum | `none`,`drafted`,`draft_rejected`,`simulated_sent` | `simulated_sent` | in enum; `simulated_sent` allowed **only if `send_eligible=true`**; review-held merchants stay at `drafted` (a draft is generated for them so a human has something to approve, but it is not sent) |
| `last_outreach_at` | date | derived or empty | `2026-06-01` | set when a draft/send occurs |
| `idempotency_key` | string | see §10 | `M007:menu_upload_needed:blocker_nudge.v1:2026-06-01` | set on `simulated_sent`; unique per send |
| `cooldown_window` | string | `= as_of_date` | `2026-06-01` | discrete bucket (not a duration) |

### Provenance

| Column | Type | Sample | Validation |
| --- | --- | --- | --- |
| `normalized_at` | datetime | `2026-06-01T12:00:00Z` | set at normalization |

## 4. Derived fields (summary)

- `signup_at`, `last_login_at` — from as-of date and source day counts.
- `current_blocker_code`, `next_best_action` — from `steps_completed` (§5).
- `risk_score` — recomputed from formula (§6).
- `risk_reason_codes` — from formula components (§6).
- `contact_eligible` — from email validity + opt-in + suppression (§3).
- `review_required`, `review_reason` — from risk level + `contact_eligible` (§7).
- `approval_state` — `not_required`/`pending_review` by default; `approved`/`rejected` only via synthetic fixture (§7.1).
- `send_eligible` — `contact_eligible AND (review_required=false OR approval_state=approved)` (§7.1).
- `idempotency_key` — composed at send time (§10).

## 5. Blocker diagnosis rules

The canonical step order is recovered from the source nudge messages (verified across all 20 rows). The blocker is the **next incomplete step**.

| `steps_completed` | `current_blocker_code` | `next_best_action` |
| --- | --- | --- |
| 0 | `business_verification_needed` | `verify_business` |
| 1 | `menu_upload_needed` | `upload_menu` |
| 2 | `photos_needed` | `add_photos` |
| 3 | `business_hours_needed` | `set_business_hours` |
| 4 | `bank_verification_needed` | `verify_bank` |
| 5 | `final_verification_needed` | `complete_final_verification` |

Validation: for every row, blocker/action must equal this mapping.

## 6. Risk scoring (fields + the threshold assumption)

**Formula (recompute and validate — genuine):**

```
risk_score = 2*days_since_signup + 3*last_login_days_ago + 10*(5 - steps_completed)
```

Verified to reproduce the source `Risk Score` on all 20 rows. The 20 rows over-determine this 3-coefficient formula, so the match is a real validation.

**Reason codes (derived from components):** flag a component when it is a material contributor.
- `low_completion` when `steps_completed ≤ 2`.
- `inactivity` when `last_login_days_ago ≥ 7`.
- `tenure_pressure` when `days_since_signup ≥ 14`.
(Thresholds for reason codes are descriptive labels, not gating logic.)

**Risk level — carried from source, NOT asserted by us.** The source labels imply only: Low ≤ 48, Medium = {69, 69}, High ≥ 89. The gaps (48→69, 69→89) mean the true boundaries are **unconstrained** by 20 rows. Therefore:
- `merchants_v1.csv.risk_level` = the source label (authoritative).
- A documented assumption set `risk_level_thresholds = {Low: <50, Medium: 50–79, High: ≥80}` (version `thresholds.v1`) is recorded for classifying *future/unseen* merchants and for a consistency check only.
- The consistency check (test T5) confirms these thresholds do not contradict the 20 source labels. **It does not prove the thresholds are correct** — any boundary inside the gaps would also pass. This distinction is deliberate and must not be overstated.

## 7. Review queue fields

The review queue is a filtered view of `merchants_v1.csv` where `review_required = true`. Drivers:
- `risk_level = High` (real signal — 8 of 20 rows), OR
- `contact_eligible = false` (invalid/suppressed/opted-out contact — exercised via fixtures in V1, since product data has none).

Output columns for the queue view: `merchant_id`, `merchant_name`, `merchant_category`, `risk_level`, `risk_score`, `current_blocker_code`, `next_best_action`, `review_reason`, `approval_state`.

### 7.1 Send gating (the human-review control this slice must prove)

`review_required` and `send_eligible` are **distinct**. A merchant being contact-reachable is not permission to send. The V1 send rule is:

```
send_eligible = contact_eligible AND (review_required = false OR approval_state = "approved")
simulated_send occurs  ⇔  send_eligible = true
```

Consequences (these are guarantees, enforced by tests T8/T15/T17):
- Every High-risk merchant (`review_required=true`) is **held** with `approval_state=pending_review` and is **never auto-sent**. A draft is generated for it (so a human has something to approve), but `outreach_status` does not reach `simulated_sent`.
- The only way a held merchant becomes sent in V1 is via an explicit **synthetic approval fixture** that sets `approval_state=approved` (there is no human approval UI in V1).
- Contact-ineligible merchants are never sent regardless of risk.

This proves human-review gating in V1 without live Slack or any UI.

## 8. Structured outreach draft (stubbed) — output schema

`schema_version = draft.v1`. Generated by a **stubbed deterministic generator** (no LLM call in V1). Stored in `model_runs.output_json`.

| Field | Type | Validation |
| --- | --- | --- |
| `merchant_id` | string | matches the row |
| `risk_explanation` | string | non-empty; no forbidden claims |
| `blocker_summary` | string | references `current_blocker_code` |
| `next_best_action` | enum | **must equal** the row's `next_best_action` (state consistency) |
| `draft_subject` | string | non-empty |
| `draft_body` | string | non-empty; passes guardrails (§9) |
| `guardrail_flags` | list<string> | empty = clean |
| `prompt_version` | string | `prompt.v1` |
| `model_version` | string | `stub-deterministic.v1` |
| `schema_version` | string | `draft.v1` |

## 9. Guardrail fields & checks

The guardrail runs on every draft and returns `guardrail_flags` (empty = pass). Fail (reject draft, set `outreach_status=draft_rejected`, log) if any flag is present.

Categories (one flag each):

| Flag | Meaning |
| --- | --- |
| `forbidden_revenue_claim` | revenue/sales/order/earnings promise or guarantee |
| `unsupported_metric` | specific numeric performance promise not derivable from merchant state |
| `false_impact_claim` | claims official DoorDash endorsement or real business-impact figures |
| `pii_or_secret` | any email other than the merchant's own `contact_email`; any token/secret-like string |
| `aggressive_urgency` | misleading or high-pressure urgency (false deadlines, account-loss threats) |
| `state_mismatch` | draft `next_best_action` ≠ computed value, or claims a not-yet-completed step is done |

Detection patterns are kept in a code block (not a Markdown table) so the alternation `|` is never miscopied as literal `\|`. All patterns are case-insensitive. **Numeric/percentage patterns are deliberately bound to revenue/performance context** so legitimate onboarding-progress text ("60% complete", "80% done", "20% of the way there") does NOT flag — this is what lets the 20 real nudges pass T11.

```regex
# forbidden_revenue_claim
\bguarantee(d|s)?\b
\byou(?:'ll| will)?\s+earn\b
\bearn\s+\$?\d+
\$\s?\d+
\b(increase|boost|double|triple|grow)\b.{0,20}\b(sales|revenue|orders|income|profit|earnings)\b
\b\d+\s?%\s*(more|increase)\b.{0,20}\b(sales|revenue|orders|income|customers)\b

# unsupported_metric  (numbers tied to performance, NOT bare "% complete/done/of")
\b\d+\s?%\b.{0,15}\b(more|increase|boost|growth)\b
\b\d+\s?x\b.{0,15}\b(more|sales|revenue|orders|income|customers)\b

# false_impact_claim
\bofficial(ly)?\b.{0,15}\bdoordash\b
\bdoordash\b.{0,15}\b(guarantee|endorses|recommends|partner of the year)\b
\b(proven|guaranteed)\b.{0,15}\b(results|growth|sales)\b

# pii_or_secret
[A-Za-z0-9._%+-]+@(?!example\.com)[A-Za-z0-9.-]+\.[A-Za-z]{2,}
\b(sk|pk|api[_-]?key|token|secret|bearer)[-_]?[A-Za-z0-9]{8,}\b

# aggressive_urgency
\bact now\b
\blast chance\b
\b(or )?(you(?:'ll| will)? )?lose (your )?(account|listing|spot|ranking)\b
\bfinal (notice|warning)\b
\b(respond|act|sign up)\s+(immediately|right now)\b
```

`state_mismatch` is a **structural check, not a regex**: compare the draft's `next_best_action` to the row's computed value, and verify the draft does not claim a step beyond `steps_completed` is complete.

**Honesty caveat:** with a stubbed deterministic generator, clean drafts pass **by construction**. The guardrail is only as strong as the cases fed to it. V1 therefore tests it against (a) **one negative fixture per category** (test T18), (b) a planted bad draft (T10), and (c) the 20 real source nudge messages (T11) to confirm no over-flagging. Real adversarial cases are required when live Gemini replaces the stub.

## 10. Audit / model-run fields & idempotency

### `model_runs.csv`

| Column | Type | Sample |
| --- | --- | --- |
| `model_run_id` | string | `MR-T001-007` |
| `task_id` | string | `T-001` |
| `merchant_id` | string | `M007` |
| `generator` | string | `stub` |
| `prompt_version` | string | `prompt.v1` |
| `model_version` | string | `stub-deterministic.v1` |
| `schema_version` | string | `draft.v1` |
| `input_summary` | string | `steps=1;blocker=menu_upload_needed;risk=69/Medium` |
| `output_json` | string (JSON) | the §8 object |
| `validation_result` | enum | `pass`,`fail` |
| `guardrail_flags` | list<string> | `` |
| `cost_estimate_usd` | number | `0` (stub) |
| `created_at` | datetime | `2026-06-01T12:00:00Z` |

### `audit_log.csv`

| Column | Type | Sample |
| --- | --- | --- |
| `audit_event_id` | string | `AE-000123` |
| `task_id` | string | `T-001` |
| `merchant_id` | string (nullable) | `M007` |
| `event_type` | enum | `source_read`,`normalized`,`risk_scored`,`blocker_diagnosed`,`review_queued`,`draft_generated`,`draft_rejected`,`simulated_send`,`skipped_duplicate` |
| `actor` | string | `system` |
| `idempotency_key` | string (nullable) | set on `simulated_send`/`skipped_duplicate` |
| `details` | string | `risk=69 level=Medium` |
| `created_at` | datetime | `2026-06-01T12:00:00Z` |

### Idempotency key (discrete bucket)

```
idempotency_key = merchant_id + ":" + current_blocker_code + ":" + template_id + ":" + cooldown_window
template_id   = "blocker_nudge.v1"
cooldown_window = as_of_date (ISO date string, e.g. "2026-06-01")   # discrete, not a duration
```

On a simulated send: if an `audit_log` row with the same `idempotency_key` already exists, do nothing except append a `skipped_duplicate` event. Re-running the send step must not create a second `simulated_send` for the same key.

## 11. Validation rules (consolidated)

Beyond per-column rules above: every `merchants_v1.csv` row must validate against this dictionary (types, enums, allowed values, derivations). Append-only logs must never be rewritten in place. The source CSV must be unchanged. All outputs must be deterministic (no randomness, no wall-clock-dependent values except explicit `created_at`/`normalized_at`, which tests compare on stable fields only).

## 12. Out-of-scope fields/data for V1

Deferred to roadmap (do **not** add in V1): real external account IDs; phone numbers; region/market/timezone/locale; per-step statuses and per-step timestamps; owner/account-manager hierarchy; real consent/unsubscribe/bounce/complaint history; `delivery_status` and webhook events; outcome/learning fields (`activated_after_outreach`, `merchant_replied`, etc.); real cost/budget ledgers; `Estimated Time Saved` (excluded from decisioning). These belong to later tables/integrations (Supabase, Resend, n8n) per `docs/plan-reconciliation.md`.
