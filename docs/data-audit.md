# CSV Data Audit

Audit date: 2026-06-01

## Source File

- File: `DoorDash Merchant Nudge Engine - Merchant Directory.csv`
- Parsed records: 20 merchant rows
- Parsed header columns: 9
- Data type: CSV text
- Context: dummy/simulated merchant onboarding data

## Headers Observed

The raw header row is:

```text
Merchant Name,Merchant Name,Days Since Signup,Steps Completed,Last Login (days ago),Risk Score,Risk Level,AI Nudge Message,Estimated Time Saved (min)
```

## Immediate Schema Issue

The first two columns are both named `Merchant Name`.

Observed values show the first column is the merchant display name, while the second column is actually merchant type/category:

- `Restaurant`
- `Grocery`
- `Convenience`
- `Retail`

Recommended rename:

- First column: `merchant_name`
- Second column: `merchant_category`

## Observed Value Summary

| Field | Observed summary |
| --- | --- |
| Merchant display name | 20 non-empty values, no duplicate merchant names observed |
| Merchant category | 4 categories: Restaurant 11, Retail 4, Grocery 3, Convenience 2 |
| Days Since Signup | Range 1 to 28 days, average 10.05 |
| Steps Completed | Range 0 to 5, average 2.55 |
| Last Login (days ago) | Range 0 to 21 days, average 6.40 |
| Risk Score | Range 2 to 159, average 63.80 |
| Risk Level | Low Risk 10, Medium Risk 2, High Risk 8 |
| AI Nudge Message | 20 unique generated messages |
| Estimated Time Saved (min) | Always 15 |

## Representative Rows

| Merchant | Category | Days | Steps | Last login days ago | Risk score | Risk level |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| Fresh Market Co | Grocery | 1 | 5 | 0 | 2 | Low Risk |
| Golden Dragon | Restaurant | 7 | 1 | 5 | 69 | Medium Risk |
| Metro Pharmacy | Retail | 28 | 1 | 21 | 159 | High Risk |
| Sports Gear Pro | Retail | 9 | 0 | 7 | 89 | High Risk |
| Taco Express | Restaurant | 6 | 5 | 1 | 15 | Low Risk |

## Inferred Risk Score Formula

The CSV does not include a formula, score version, threshold definition, or scoring explanation. However, every row matches this inferred formula:

```text
risk_score = (2 * days_since_signup) + (3 * last_login_days_ago) + (10 * (5 - steps_completed))
```

This inference was verified against all 20 parsed rows.

Likely risk level thresholds, inferred from rows:

- Low Risk: scores below 50
- Medium Risk: scores around 50 to 79
- High Risk: scores 80 and above

The threshold inference is weaker than the formula inference because the CSV contains only two medium-risk examples and no explicit threshold documentation.

## What The Current CSV Supports

The CSV supports a simple simulated dashboard or deterministic prototype for:

- Basic stalled merchant detection using days since signup, steps completed, and last login recency.
- A rough synthetic risk score.
- Simple segmentation by merchant category.
- Basic next-step copy generation if the missing onboarding step is inferred from `Steps Completed`.
- A lightweight demonstration of merchant-specific outreach drafts.

## What The Current CSV Does Not Support

The current CSV does not support a reliable enterprise workflow because it lacks:

- Stable merchant IDs.
- Account IDs or external system IDs.
- Contact names.
- Email addresses.
- Phone numbers.
- Contact eligibility or consent fields.
- Unsubscribe, suppression, bounce, or complaint state.
- Merchant owner or account manager fields.
- Region, market, timezone, or locale.
- Signup timestamp as an actual timestamp.
- Last login timestamp as an actual timestamp.
- Per-step onboarding statuses.
- Per-step completion timestamps.
- Current blocker code.
- Blocker severity.
- Blocker source.
- Human review status.
- Approval owner.
- Approval timestamp.
- Outreach status.
- Last outreach timestamp.
- Message template ID.
- Prompt version.
- Model version.
- Generated output ID.
- Send attempt ID.
- Delivery event history.
- Outcome events after outreach.
- Cost tracking fields.
- Audit log fields.

## Data Quality Issues

1. Duplicate header name prevents clean import into many structured systems.
2. The second column is mislabeled and should be a category/type field.
3. Numeric fields are stored with decimal formatting even where integer semantics are expected.
4. `Days Since Signup` and `Last Login (days ago)` are relative values, not stable timestamps.
5. `Risk Score` appears deterministic but has no documented formula or score version.
6. `Risk Level` thresholds are not documented.
7. `Estimated Time Saved (min)` is constant at 15 for all rows, so it should be labeled simulated or removed from decisioning.
8. AI nudge messages are already generated, but no prompt, model, source fields, validation state, or approval state exists.
9. There is no event history, so the workflow cannot learn from post-outreach behavior.
10. There are no fields to prevent duplicate sends or enforce cooldowns.

## Duplicate And Identifier Review

- Duplicate merchant display names observed: none.
- Stable unique identifiers present: none.
- Enterprise readiness impact: high. Merchant name is not a safe primary key because names can change, collide, or contain punctuation.

Required V1 fields:

- `merchant_id`
- `merchant_name`
- `merchant_category`
- `created_at`
- `updated_at`
- `source_system`
- `source_record_id`

## Timestamp Review

The CSV uses relative day counts instead of timestamps.

Required V1 fields:

- `signup_at`
- `last_login_at`
- `last_onboarding_event_at`
- `last_outreach_at`
- `last_reviewed_at`
- `activated_at`

Relative day values can be derived from timestamps during analysis, but they should not be the only stored state.

## Owner And Human Review Review

No owner, queue, reviewer, or approval fields exist.

Required V1 fields:

- `owner_user_id`
- `owner_team`
- `review_required`
- `review_reason`
- `review_status`
- `reviewer_user_id`
- `review_decision`
- `review_decided_at`
- `review_notes`

## Contact And Email Automation Review

No contact fields exist.

Required V1 fields:

- `primary_contact_name`
- `primary_contact_email`
- `email_valid`
- `email_opt_in_status`
- `unsubscribe_status`
- `suppression_reason`
- `last_email_sent_at`
- `email_cooldown_until`
- `resend_contact_id` or simulated equivalent

Without these fields, Resend integration should not be built because the system cannot prove eligibility, avoid suppressed contacts, or track delivery state.

## Blocker Diagnosis Review

The current CSV implies blockers through `Steps Completed`, but does not identify the actual blocker.

Required V1 fields:

- `current_onboarding_step`
- `current_blocker_code`
- `current_blocker_label`
- `blocker_source`
- `blocker_detected_at`
- `blocker_severity`
- `next_required_action`

Example blocker codes:

- `business_verification_needed`
- `menu_upload_needed`
- `photos_needed`
- `business_hours_needed`
- `bank_verification_needed`
- `final_verification_needed`

## Outcome Learning Review

No outcome data exists.

Required V1 fields:

- `outcome_event_id`
- `outcome_type`
- `outcome_at`
- `step_completed_after_outreach`
- `activated_after_outreach`
- `merchant_replied`
- `human_intervention_needed`
- `outreach_effective`

Until these fields exist, the system cannot honestly claim it learns from post-outreach merchant behavior.

## Recommended V1 Dataset Shape

Use separate tables or sheet tabs for:

1. `merchants`
2. `merchant_contacts`
3. `onboarding_steps`
4. `merchant_onboarding_status`
5. `risk_scores`
6. `blocker_diagnoses`
7. `outreach_drafts`
8. `human_reviews`
9. `send_attempts`
10. `delivery_events`
11. `outcome_events`
12. `audit_logs`
13. `prompt_versions`
14. `model_runs`

For the first implementation stage, a single richer CSV is acceptable if it includes the V1 fields above and keeps simulated values clearly labeled.

## Data Audit Conclusion

The CSV is good enough to demonstrate a toy nudge engine, but not enough to support a reliable agentic operations workflow. The next step should be to create a V1-ready dummy dataset and explicit data model before building Supabase, n8n, Slack, Resend, or Gemini components.

