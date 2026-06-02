# Project State

Last updated: 2026-06-01 (T-001 plan revised after Codex review)

> Date note: the folder's earlier docs are dated 2026-06-02 while the current date is 2026-06-01; Git is now initialized (commit `b57cf2c`) so chronology is tracked going forward. Step order: (1) Codex initial review, (2) Codex open-source validation, (3) Claude governance review, (4) Claude plan reconciliation, (5) operating-system setup, (6) operating-system cleanup, (7) T-001 planning.

## Current Phase

**Stage 1 (T-001) planning is drafted, Codex-reviewed, and revised.** The V1 data dictionary, slice plan, and review packet exist (`docs/v1-data-dictionary.md`, `docs/v1-slice-plan.md`, `docs/review-packets/T-001-review-packet.md`). Codex round-1 (NO-SHIP, 2 findings) is resolved: a contact-vs-send eligibility + `approval_state` gate (T17) and 6-category guardrail with per-category fixtures (T18). The next gate is **human GO → a separate implementation task.**

No product code has been written.

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

1. ~~Codex adversarial review of the T-001 plan~~ — **done** (job `review-mpw2j628-ncd4my`, NO-SHIP, 2 findings).
2. ~~Resolve/accept findings~~ — **done** (send-gate + T17; guardrail coverage + T18; fenced regex).
3. **Human approval (GO)** of the revised plan against the GO/NO-GO criteria in `docs/v1-slice-plan.md` — **outstanding (this is the gate).**
4. Then a **separate implementation task**: `scripts/` + `tests/` (+ `tests/fixtures/`) producing `out/merchants_v1.csv` and the two append-only logs, satisfying tests **T1–T18**.

No product code until step 3 clears. A second Codex pass is optional. Off the table until far later: live Supabase, n8n, Slack, Resend, or real Gemini calls; real credentials; any real merchant data; live outbound email.

## Files Created Or Updated This Session

T-001 plan revision after Codex round-1 (latest):

- Updated: `docs/v1-data-dictionary.md` (§3, §7, §7.1, §9 send-gate + guardrail), `docs/v1-slice-plan.md` (steps, T17/T18, edge cases, GO/NO-GO), `docs/review-packets/T-001-review-packet.md` (findings + resolutions), `docs/decision-log.md`, `CURRENT_TASK.md`, `HANDOFF.md`, `PROJECT_STATE.md`, `docs/task-log.md`.

Earlier T-001 planning (same day): created the three planning docs above. Full per-step history (governance review, plan reconciliation, OS setup, OS cleanup, T-001 planning, T-001 revision): see `docs/task-log.md`.

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

Next session: the T-001 plan is **drafted and in review** — read `docs/v1-slice-plan.md` + `docs/v1-data-dictionary.md` (and `docs/review-packets/T-001-review-packet.md`) for what V1 is. The next gate is a Codex `/codex:adversarial-review` of the plan, then human approval, then a **separate implementation task**. Do not write product code, scripts, schemas, or integrations until the plan clears review and the human says GO. Do not modify the source CSV. Do not write another governance/review document. Live integrations (Supabase, n8n, Slack, Resend, Gemini), real credentials, and real data remain out of scope.

