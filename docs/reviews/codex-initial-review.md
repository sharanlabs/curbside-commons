# Codex Initial Review

## Executive Assessment

ActivationOps AI is technically plausible as a dummy-data simulation, but it is not build-ready as an enterprise-style automation system. The current folder contains only a prototype CSV before this documentation pass. The CSV can support a simple risk/nudge demo, but it cannot safely support workflow orchestration, human approval, email sending, delivery tracking, outcome learning, or auditability.

Build readiness: 3/10.

The next step should be data model hardening, not workflow implementation.

## Current Folder Assessment

Before this review pass, the project folder contained one file:

- `DoorDash Merchant Nudge Engine - Merchant Directory.csv`

No local `AGENTS.md`, README, project state file, docs folder, schema files, scripts, tests, package files, workflows, Supabase configuration, n8n exports, Slack code, Resend code, or Gemini integration code were present.

The folder is not currently a Git repository.

## CSV Data Audit

The CSV has 20 parsed merchant records and 9 header columns.

Raw headers:

```text
Merchant Name,Merchant Name,Days Since Signup,Steps Completed,Last Login (days ago),Risk Score,Risk Level,AI Nudge Message,Estimated Time Saved (min)
```

Critical issue: the first two columns are both named `Merchant Name`. Observed values show the second column is merchant category/type, not merchant name.

Observed category distribution:

- Restaurant: 11
- Retail: 4
- Grocery: 3
- Convenience: 2

Observed risk level distribution:

- Low Risk: 10
- Medium Risk: 2
- High Risk: 8

The risk score appears to be a deterministic synthetic score. Every row matches this inferred formula:

```text
risk_score = (2 * days_since_signup) + (3 * last_login_days_ago) + (10 * (5 - steps_completed))
```

No source formula, score version, score rationale, or threshold documentation exists.

## What the Current CSV Supports

The CSV supports:

- A simple simulated dashboard.
- Basic stalled-merchant detection from relative day counts and completion count.
- A deterministic risk score demonstration.
- Basic segmentation by merchant category.
- A toy next-step nudge message demo.
- A lightweight discussion of onboarding blockers if blockers are inferred from `Steps Completed`.

## What the Current CSV Does Not Support Yet

The CSV does not support:

- Enterprise CRM state.
- Stable unique merchant identity.
- Contact eligibility.
- Human approval workflows.
- Slack routing.
- Resend delivery tracking.
- Duplicate-send prevention.
- Prompt/model auditability.
- Post-outreach outcome learning.
- Cost tracking.
- Security or privacy controls.
- Reliable blocker diagnosis.
- Reliable next-best-action routing beyond toy examples.

## Required Data Model Additions

Minimum additions before implementation:

- `merchant_id`
- `merchant_category`
- `source_system`
- `source_record_id`
- `signup_at`
- `last_login_at`
- `owner_user_id`
- `owner_team`
- `primary_contact_name`
- `primary_contact_email`
- `email_opt_in_status`
- `unsubscribe_status`
- `suppression_reason`
- `current_onboarding_step`
- `current_blocker_code`
- `blocker_detected_at`
- `risk_score`
- `risk_score_version`
- `risk_score_reason_codes`
- `next_best_action`
- `review_required`
- `review_status`
- `reviewer_user_id`
- `review_decision`
- `review_decided_at`
- `outreach_status`
- `last_outreach_at`
- `email_cooldown_until`
- `prompt_version`
- `model_version`
- `model_run_id`
- `send_attempt_id`
- `delivery_status`
- `outcome_type`
- `outcome_at`
- `audit_event_id`

## Architecture Assessment

The planned stack is reasonable only if staged carefully. Supabase/Postgres can serve as the source of truth, n8n can orchestrate multi-app workflow, Slack can handle human approval, Resend can send approved email, and Gemini can produce structured reasoning or draft copy.

The risk is sequencing. If n8n, Slack, Resend, and Gemini are built before state, idempotency, audit logs, and approval rules exist, the system will be brittle and hard to trust.

Current official references checked for integration constraints:

- Supabase documents that Row Level Security should be enabled on exposed Data API tables and views: [Securing your API](https://supabase.com/docs/guides/api/securing-your-api/).
- n8n supports error workflows for failed executions, which should be designed before live orchestration: [Error handling](https://docs.n8n.io/flow-logic/error-handling/).
- Slack requires request signature verification with the app signing secret: [Verifying requests from Slack](https://api.slack.com/docs/verifying-requests-from-slack).
- Slack interactive payloads require a timely acknowledgement response: [Handling user interaction](https://docs.slack.dev/interactivity/handling-user-interaction/).
- Resend webhook requests include `svix-id`, which should be used for duplicate handling: [Managing Webhooks](https://resend.com/docs/dashboard/webhooks/body-parameters).
- Gemini supports structured outputs with a subset of JSON Schema: [Structured Outputs](https://ai.google.dev/gemini-api/docs/structured-output).
- Google Sheets API has quota and payload guidance, so Sheets should not be treated as an unbounded orchestration state layer: [Usage limits](https://developers.google.com/workspace/sheets/api/limits).

Recommended sequencing:

1. Fix and expand dummy data.
2. Define canonical state model.
3. Define deterministic risk/blocker logic.
4. Add review queue and audit log.
5. Add structured AI draft generation.
6. Add Slack approval.
7. Add email send simulation.
8. Add Resend only after contact eligibility and duplicate-send controls exist.
9. Add outcome learning only after outcome events are captured.

## Strong Parts of the Plan

- The project separates Google Sheets visibility from a planned database source of truth.
- Human-in-the-loop review is included, which is necessary for high-risk outreach.
- The plan recognizes delivery events, outcomes, prompt versions, guardrails, and cost tracking.
- The dummy-data framing avoids pretending there is real DoorDash access.
- The split between implementation agent and review agent can work if project state is kept current.

## Blind Spots

1. The current data has no stable merchant ID.
2. The second CSV column is mislabeled.
3. There is no contact or consent state.
4. There is no owner/account manager state.
5. There is no event history.
6. There is no approval state.
7. There is no duplicate-send state.
8. There is no score version or threshold documentation.
9. There is no prompt/model versioning.
10. There is no cost budget or model-run ledger.
11. There is no security model for credentials or webhook access.
12. There is no clear V1 boundary.
13. There is no test plan.
14. There is no definition of activation success.
15. There is no explicit suppression or unsubscribe handling.

## Overengineering Risks

The plan risks overbuilding too early by combining CRM, AI reasoning, workflow automation, Slack approval, email delivery, webhooks, outcome learning, audits, guardrails, and cost tracking before the underlying data model is credible.

V1 should avoid:

- Autonomous multi-step agent behavior.
- Live outbound email.
- Complex learning loops.
- Multi-channel routing.
- Real-time webhook dependency.
- Sophisticated scoring beyond transparent deterministic rules.

The simplest useful V1 is a deterministic review queue plus AI-assisted draft generation with simulated sends.

## Automation Failure Modes

- Workflow runs without a stable merchant ID and updates the wrong record.
- Relative day counts become stale because no timestamps exist.
- n8n retries create duplicate review requests or duplicate sends.
- A merchant changes status after a workflow starts, but the workflow sends stale outreach.
- Slack approval is clicked after the merchant is no longer eligible.
- Email is generated from incomplete or incorrect blocker inference.
- A model output invents unsupported claims.
- Delivery webhooks cannot be joined to a merchant because send attempt IDs are missing.
- Manual edits in Google Sheets diverge from Supabase state.

## Duplicate-Send Risks

The current CSV has no fields for:

- Last send timestamp.
- Send attempt ID.
- Idempotency key.
- Cooldown window.
- Outreach status.
- Approval status.
- Suppression status.
- Delivery status.

This means duplicate sends are likely if workflow retries, manual reruns, or parallel triggers are introduced.

Before email automation, define:

```text
idempotency_key = merchant_id + blocker_code + outreach_template_id + cooldown_window
```

## Human-in-the-Loop Risks

The plan mentions Slack approval, but the current data cannot support it.

Missing pieces:

- Reviewer assignment.
- Approval state.
- Approval expiration.
- Rejection reason.
- Escalation path.
- Audit log of who approved what and when.
- Snapshot of the exact message approved.
- Rule for when high-risk accounts must not be automated.

Slack should be added only after a review object exists in the data model.

## Guardrail and Responsible AI Gaps

Current AI nudge messages are already generated, but there is no metadata or guardrail evidence.

Missing controls:

- Prompt version.
- Model version.
- Structured output schema.
- Source fields used by the prompt.
- Forbidden claims.
- Tone constraints.
- Validation checks.
- Human approval state.
- Regeneration reason.
- Cost per generation.
- Hallucination/error review.

For V1, Gemini should produce structured JSON with fields such as `risk_explanation`, `blocker_summary`, `next_best_action`, `draft_subject`, `draft_body`, and `guardrail_flags`. Deterministic validation should run before any review or send step.

## Supabase/Postgres Readiness

Not ready.

No schema files exist. The current CSV lacks the identifiers, timestamps, state transitions, audit fields, and event tables needed for Postgres to act as a source of truth.

If Supabase Data API access is used later, exposed tables/views need explicit grants and Row Level Security. Supabase's API security docs warn that any granted table without RLS can be accessed by roles with matching Data API grants.

Build the schema only after the dummy data model is approved.

## Slack Integration Readiness

Not ready.

Slack approval requires review records, reviewer identity, expiration, message snapshotting, callback verification, and approval audit logging. None of those fields exist yet.

Slack request signing and interactive acknowledgement timing are integration requirements, not optional polish. Approval handling should acknowledge quickly, verify the request, enforce approver authorization, and process state changes asynchronously.

## n8n Workflow Readiness

Not ready.

n8n can be useful for multi-app orchestration, but introducing it now would hide unresolved state-model problems behind workflow nodes. First define triggers, inputs, state transitions, idempotency keys, failure handling, and dry-run payloads.

n8n error workflows should be part of the design before live sends or approvals are connected.

## Resend Integration Readiness

Not ready.

The CSV has no email addresses, contact eligibility, suppression state, unsubscribe state, delivery event mapping, or send attempt IDs. Resend should be deferred until these are modeled and validated with simulated sends.

Resend webhook duplicate handling should key off provider webhook identifiers such as `svix-id` and internal `send_attempt_id` values.

## Gemini Agent Design Risks

The current plan says "agentic AI workflow automation," but the CSV only supports deterministic logic. A broad Gemini agent would be unnecessary and risky for V1.

Specific risks:

- Invented blocker diagnoses.
- Personalized copy based on insufficient data.
- Unstable outputs without schema validation.
- Cost growth from repeated generations.
- Lack of prompt/version auditability.
- No evaluation set for draft quality or routing accuracy.

Use Gemini narrowly for structured draft generation and explanation after deterministic fields are established.

Gemini structured outputs can be useful here, but the official docs describe JSON Schema subset support. The application still needs deterministic validation against merchant state, allowed blocker codes, allowed next actions, and forbidden claims.

## Cost-Control Gaps

Missing:

- Per-run model cost estimates.
- Budget caps.
- Max generations per merchant.
- Retry limits.
- Cached generation reuse.
- Prompt/model version ledger.
- Alert threshold for abnormal volume.

V1 should include a `model_runs` ledger before repeated AI generation is allowed.

## Security and Privacy Risks

Current data is simulated, but the planned workflow would touch sensitive surfaces once integrated.

Risks:

- Secrets stored in workflow nodes or docs.
- Webhook endpoints without verification.
- Slack callbacks without signature validation.
- Resend webhooks without signature validation.
- Logs containing email addresses or message bodies.
- Excessive service-role access to Supabase.
- Google Sheet sharing exposing merchant/contact data.
- Model prompts sending unnecessary contact or account data.

Use least privilege, separate environments, verified webhooks, and secret managers before any live integration.

## Documentation Gaps

Before this pass, the project lacked:

- README.
- Project state.
- Agent instructions.
- Product brief.
- Data audit.
- Open questions.
- Architecture decision.
- Task log.
- Initial review.

This pass creates those scaffolding files, but implementation docs, schemas, runbooks, test plans, and workflow specs still need to be written after data decisions are made.

## Recommended V1 Scope

V1 should include:

- Corrected dummy data with stable IDs and timestamps.
- Merchant/contact/owner/review/outreach fields.
- Deterministic risk score with documented formula and thresholds.
- Blocker taxonomy and next-best-action mapping.
- Review queue for high-risk or uncertain accounts.
- AI-generated outreach drafts only, not live sends.
- Human approval state stored in the data model.
- Simulated send attempts and outcomes.
- Audit log and model-run log.
- Duplicate-send prevention rule.

## Recommended Roadmap Scope

Defer:

- Live Resend delivery.
- Slack callback automation.
- Full n8n orchestration.
- Autonomous agent decision loops.
- Outcome-learning model updates.
- Multi-channel outreach.
- Production monitoring.
- Advanced personalization.
- Real-time webhook processing.

## Specific Fixes Before Build

1. Rename the second CSV header from `Merchant Name` to `merchant_category`.
2. Add stable `merchant_id` values.
3. Replace relative day fields with timestamps or add timestamps beside them.
4. Add contact and email eligibility fields.
5. Add owner/account manager fields.
6. Add explicit onboarding step status fields.
7. Add blocker codes and next action codes.
8. Document the risk formula and thresholds.
9. Add review and approval state.
10. Add outreach cooldown and idempotency fields.
11. Add prompt/model metadata fields.
12. Add simulated delivery and outcome event tables or tabs.
13. Define a test plan before automation.

## Readiness Score out of 10

3/10.

The project idea is viable as a staged simulation, but the current data and repo structure are not ready for the planned automation stack.

## Final Recommendation

Do not build the production workflow yet. Create a V1-ready dummy dataset and data model first, then validate deterministic routing, approval state, idempotency, and audit logging. Add AI generation and workflow orchestration only after the state model can prove who should be contacted, why, with what approved message, and under what cooldown/suppression rules.
