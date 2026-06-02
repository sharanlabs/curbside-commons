# Open Questions

## Meta / Governance Decisions — resolved by plan reconciliation (2026-06-01)

`docs/plan-reconciliation.md` proposes answers to the governance-review questions; they take effect on user GO. Resolved (proposed):

- Planning termination → exit condition defined: user GO/NO-GO on the reconciliation; no further review docs (§8).
- Where rules live → one-page repo `RULES.md` on GO; prompt-supplied rules retired (§7).
- V1 size → one entity CSV + append-only event logs, not 14 tables (§5). Supersedes the `product-brief` vs `data-audit` mismatch.
- Naming → drop "agentic" for V1 (§3).
- Readiness metric → blended score retired in favor of separate shippable/planning measures (`PROJECT_STATE.md`).
- Audit trail → `git init` is a required pre-build item (§7).

### Still genuinely open (only the user can decide)

1. **GO or NO-GO** on `docs/plan-reconciliation.md`.
2. **As-of date** for deriving `signup_at` / `last_login_at` from the relative day counts (proposed 2026-06-01).
3. **Project-level definition of done / audience.** The reconciliation sets a DoD for the *V1 slice*; it does not define what "success" means for the project as a portfolio piece (runnable demo vs. docs artifact vs. job exhibit). Answer this to know when to stop building, not just when V1 is done.

## Governance And Compliance

1. What exact rules should `ALWAYS_READ.md` contain?
2. Should `ALWAYS_READ.md` become mandatory before every Claude Code, Codex, and ChatGPT session?
3. Should a missing `ALWAYS_READ.md` block all implementation sessions?
4. Should `docs/audits/session-compliance-template.md` be created before the next session?
5. Should a retroactive `docs/audits/codex-compliance-audit.md` be created for the prior Codex initial review, or should the missing file remain recorded as a gap?
6. What final terminal summary format should every future session use?

## V1 Acceptance Criteria

1. What is the minimum credible dataset size for the first demo: 20 rows, 50 rows, 100 rows, or another number?
2. Which fields are mandatory for a V1-ready dummy merchant record?
3. What CSV/data validation checks must pass before Supabase schema design starts?
4. What acceptance tests must pass before Slack approval is implemented?
5. What acceptance tests must pass before Resend email sending is implemented?
6. What acceptance tests must pass before Gemini output can be used in workflow decisions?

## Architecture Sequencing

1. Should Supabase remain in V1, or should V1 start with a corrected CSV/Google Sheet and add Supabase after dataset validation?
2. Should n8n be introduced before or after a code-based dry-run of the state transitions?
3. Should Slack approval be implemented before Resend email sending, or should both wait until simulated send state is proven?
4. Should Google Sheets remain dashboard-only, or should it also hold evaluation cases and expected labels?
5. Should the V1 name avoid "agentic" until the system has bounded tool-using autonomy?

## Data Model

1. What is the stable merchant identifier: `merchant_id`, external account ID, or another key?
2. What should the second `Merchant Name` column be renamed to: `merchant_type`, `merchant_category`, or `business_type`?
3. What are the canonical onboarding steps and their order?
4. Is `Steps Completed` enough, or should each step have its own status and timestamp?
5. What blocker taxonomy should be used for diagnosis?
6. What fields define activation completion and go-live readiness?

## Ownership And Review

1. Who owns each merchant record: account manager, onboarding specialist, queue, or team?
2. Which risk levels require human approval?
3. What should trigger escalation instead of automated outreach?
4. How should Slack approvals expire, be reassigned, or be overridden?
5. Who can approve final email sends?

## Outreach And Consent

1. What contact fields should exist for merchants?
2. What makes a merchant eligible or ineligible for email outreach?
3. What unsubscribe, suppression, bounce, and complaint rules should apply in the simulation?
4. What cooldown prevents duplicate or too-frequent outreach?
5. Should outreach be email-only in V1, or should Slack/internal notes come first?

## AI And Guardrails

1. Which outputs should Gemini produce: blocker diagnosis, risk explanation, next-best action, email draft, or all of these?
2. What structured output schema should model responses follow?
3. What prompt versions and model versions should be logged?
4. What claims must the outreach generator be forbidden to make?
5. What deterministic checks should run before and after model output?

## Metrics And Learning

1. Which simulated outcomes should be tracked after outreach?
2. What is the evaluation target: activation completion, next step completion, response, or review accuracy?
3. What baseline will prove the automation is better than deterministic rules?
4. How will fake/simulated metrics be labeled to avoid implying real business impact?

## Implementation

1. Should the next step be a richer CSV, a Google Sheet, or a Supabase schema draft?
2. Should n8n be introduced in V1, or should the first workflow be simulated in code or Sheets?
3. What minimum audit log must exist before outbound email is allowed?
4. What environments are needed for local, test, and demo execution?
