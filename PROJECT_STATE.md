# Project State

Last updated: 2026-06-01 (operating-system setup)

> Date note: prior sessions are dated 2026-06-02; the current date is 2026-06-01. The folder is not under version control, so there is no reliable chronology to arbitrate. Treat session ordering as: (1) Codex initial review, (2) Codex open-source validation, (3) Claude governance review, (4) Claude plan reconciliation.

## Current Phase

Planning is **closing**. Codex and Claude findings have been reconciled into one buildable decision in `docs/plan-reconciliation.md`. The only remaining planning step is a user **GO / NO-GO** on that document.

No production build has started.

## Decision Status (2026-06-01)

The governance review found the dominant risk was process, not data: ~12 review/audit docs, zero runnable code, no planning exit. `docs/plan-reconciliation.md` resolves that — it accepts Codex's safety controls, rejects the documentation gate and the 14-table V1 schema, fixes the V1 scope, sets a one-line planning exit condition, and names the first implementation task. **The next move is the user's GO/NO-GO decision — not another document.**

## Operating System (2026-06-01)

The project operating system is now in place so any tool/account can continue from the repo, not from memory: `RULES.md` (constitution; it wins on any conflict), `CLAUDE.md` / `CODEX.md` (roles), `CURRENT_TASK.md` + `HANDOFF.md` (continuity), `docs/dual-model-workflow.md` (verified Codex commands), `docs/project-narrative.md` (public methodology), `docs/implementation-journal.md`, `docs/decision-log.md`, `docs/checklists/prevent-repeat-checklist.md`, `docs/prompts/*`, and `docs/visuals/*`. This is operating infrastructure, not product — no product code, schema, or integration was created.

## Current Evidence

- Project folder originally contained one merchant CSV file before documentation scaffolding was added.
- CSV file found: `DoorDash Merchant Nudge Engine - Merchant Directory.csv`
- Parsed merchant records: 20
- CSV header issue: first two columns are both named `Merchant Name`; second column values indicate merchant category/type.
- Risk score is synthetic and matches the inferred formula across all rows.
- Git repository: **initialized** (initial commit `b57cf2c "Initial reviewed planning state"`). Operating-system files are currently uncommitted pending review.
- Files named "required"/"mandatory" by past prompts but never defined in the repo: `ALWAYS_READ.md`, `docs/audits/codex-compliance-audit.md`, `docs/audits/session-compliance-template.md`. Recorded as evidence of the rules-live-in-prompts problem (see Current Blockers), not as standing build blockers.

## What The Prior Validation Session Did (open-source validation, Session 2)

- Read the current validation work order.
- Read mandatory project files in order where present.
- Recorded missing mandatory files.
- Re-validated the CSV facts.
- Checked current official/open sources for AI workflow design, structured outputs, n8n, Slack, Resend, Supabase, Google Sheets, and agentic security.
- Audited the prior Codex initial review.
- Created an open-source validation review.
- Created this session's compliance audit.
- Updated task log and open questions.

## Sources Checked

- Anthropic agent/workflow guidance.
- OpenAI agent, guardrail, tracing, and eval guidance.
- Gemini structured output documentation.
- n8n error handling, webhook, and human-in-the-loop docs.
- Slack request verification, interactivity, and message docs.
- Resend send email, webhook, and event docs.
- Supabase security and Row Level Security docs.
- Google Sheets API usage limits.
- OWASP LLM and MCP security guidance.
- Recent public research on agentic workflow injection and AI coding-tool engineering pitfalls.

## Current Readiness Score

The single blended "readiness" number should be retired. It drifted from 3/10 (build, Session 1) to 4/10 ("overall", Session 2) without any build progress — it rose because more review docs were written, which rewards documenting over shipping. Track two diverging numbers instead:

- Shippable/build readiness (can a reviewer run anything?): ~0/10 — no schema, script, or test exists.
- Planning completeness (volume): high, but unanchored — the canonical rules are not in the repo, so even this is overstated.

The gap between these two is the finding.

## Current Blockers

The one real blocker now is the **GO/NO-GO decision** on `docs/plan-reconciliation.md`. The earlier blockers are resolved by that document:

- Planning had no exit → exit condition is now defined (GO/NO-GO on the reconciliation; §8).
- Rules lived in prompts → on GO, a one-page repo `RULES.md` becomes the canonical source (§7).
- Prompt-invented "mandatory files" → explicitly de-scoped; their absence is no longer a blocker (§4).
- V1 data shape ambiguous → resolved to one entity file + append-only event logs, not 14 tables (§5).
- "Agentic" naming → dropped for V1 (§3).

On GO, the remaining pre-build item (§7) is `docs/v1-data-dictionary.md` (the focus of T-001). Git is already initialized, `RULES.md` already exists, and the as-of date is set to June 1, 2026 — none of those are open steps anymore. The data-model gaps (IDs, timestamps, contact/consent, etc.) are now *built into* the slice, not pre-documented.

## Current Next Step

Decide **GO / NO-GO** on `docs/plan-reconciliation.md`. Then:

- GO → **T-001: offline thin slice planning + data dictionary** (`CURRENT_TASK.md`). Write `docs/v1-data-dictionary.md` and a short slice plan, run a Codex adversarial review, and get human approval. No product code in T-001. (Git is already initialized and `RULES.md` already exists, so neither is a step.) Implementation — ingest/normalize → `merchants_v1.csv` with tests — is a separate later task.
- NO-GO → declare this a docs-only artifact in the README and stop.

Off the table regardless until far later: live Supabase, n8n, Slack, Resend, or real Gemini calls; real credentials; any real merchant data; live outbound email.

## Files Created Or Updated This Session

Operating-system setup (latest):

- Created: `RULES.md`, `CURRENT_TASK.md`, `HANDOFF.md`, `docs/dual-model-workflow.md`, `docs/project-narrative.md`, `docs/implementation-journal.md`, `docs/decision-log.md`, `docs/checklists/prevent-repeat-checklist.md`, `docs/prompts/*` (4), `docs/visuals/*` (4).
- Updated: `CLAUDE.md`, `CODEX.md`, `PROJECT_STATE.md`, `docs/task-log.md`, `docs/open-questions.md`.

Plan-reconciliation step (earlier, same session):

- `docs/plan-reconciliation.md` (created)

Governance-review step (earlier, same session):

- `docs/reviews/claude-governance-and-idea-review.md`, `docs/audits/claude-governance-compliance-audit.md` (created)

## Open Questions

See `docs/open-questions.md`.

Most prior meta-questions now have proposed answers in `docs/plan-reconciliation.md` (scope, V1 shape, rules location, naming, exit condition), pending user ratification via GO/NO-GO. Genuinely still open:

- GO or NO-GO on the reconciliation?
- Definition of "done" / audience for the project overall (the reconciliation sets a DoD for the *V1 slice*, not the portfolio goal).

Resolved in the 2026-06-01 cleanup: as-of date set to **June 1, 2026** (default, owner may change); Git initialized; rules location is `RULES.md`.

## Claude Suggestions Before Execution

Honest answers, per the project's "be critical, do not flatter" standard.

> Update (2026-06-01 cleanup): several suggestions below are now actioned — the secrets rule (`RULES.md` §11), commit-hygiene rule (§12), and lightweight-vs-full workflow rule (§13) are in `RULES.md`; Git is initialized; the as-of date is set to June 1, 2026; AGENTS.md and README.md are reconciled. The remaining open items are workflow discipline (don't over-document small slices) and the project-level definition of done.

- **Are any rules missing?** Two worth adding: (1) a **secrets rule** — no secrets in code, docs, prompts, logs, Sheets, or n8n nodes (currently only implied); (2) a **commit-hygiene rule** — what may be committed and when, with the human approving commits. Otherwise the 20 rules cover enough; the gap is enforcement, not coverage.
- **Are any files unnecessary?** For a pre-build, single-owner project, this is a lot of scaffolding for a 20-row CSV. `implementation-journal.md` and `decision-log.md` overlap (both capture "why"); `task-log.md` overlaps with the journal for small entries; the four prompt templates could be one file. None are harmful, but several will drift if maintained separately. Treat journal + decision-log + task-log as one habit with three views; merge the prompt templates if upkeep slips.
- **Is the workflow too heavy?** For high-risk stages (live sends, Supabase writes) it is appropriate. For the offline thin slice it is heavier than ~50 lines of deterministic Python warrants. Right-size it (see split below).
- **Is the handoff system clear?** Yes — `CURRENT_TASK.md` + `HANDOFF.md` + the standing procedures are the strongest part of this setup and directly solve the multi-account continuity problem.
- **Is the dual-model Codex usage practical?** Yes, and now accurate (verified against installed plugin v1.0.4). The one real footgun is `/codex:rescue` editing files by default — flagged in three places. Keep the review-gate off by default as specified.
- **Is anything likely to slow down flow state?** The five-file documentation burden in the definition of done. Mitigation: for small offline slices, make only `task-log.md` + `HANDOFF.md` mandatory; journal/decision-log only when something meaningful or architectural happened.
- **What should be simplified before building?** (1) Adopt a **lightweight vs full workflow split**: full loop (plan review + changed-files review + journal + decision-log + checklist) for risky/integration work; lightweight loop (build + one Codex review + task-log) for offline deterministic work. (2) Confirm the as-of date (proposed 2026-06-01) so T-001 is not blocked mid-task. (3) Optionally fold the four prompt templates into one. Add no more process before the first slice exists.
- **What is the safest first execution task?** T-001: write `docs/v1-data-dictionary.md` and a short slice plan (no code), then get a Codex adversarial review and human approval. It is zero-risk and forces the data decisions everything else depends on. Implementation (ingest/normalize → `merchants_v1.csv` with tests, fully offline, original CSV untouched) follows as a separate task.

## Handoff Notes

Next session: `docs/plan-reconciliation.md` is the authoritative pre-build decision — read it, not the older review docs, for what to build. Do not write another review/governance document; planning is closed once GO/NO-GO is given. Do not re-log the prompt-invented "mandatory files" as blockers. On GO, start **T-001: offline thin slice planning + data dictionary** (`CURRENT_TASK.md`) — write `docs/v1-data-dictionary.md` and the slice plan, get a Codex adversarial review and human approval; do not write product code in T-001. Implementation (ingest/normalize → `merchants_v1.csv` with tests) follows the §5 definition of done as a later task. Live integrations (Supabase, n8n, Slack, Resend, Gemini), real credentials, and real data remain out of scope.

