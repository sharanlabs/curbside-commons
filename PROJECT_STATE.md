# Project State

Last updated: 2026-06-02 (Codex adversarial review of the roadmap applicability packet returned **needs-revision**; this revision pass applied the four findings; **eval-first T-002 = Offline Evaluation and Regression Harness is now ratified in `docs/decision-log.md`**; roadmap still not written; prior governance batch committed through `cb80286`; T-001 closed — 23/23 pass)

> Date note: the folder's earlier docs are dated 2026-06-02 while the current date is 2026-06-01; Git is now initialized (commit `b57cf2c`) so chronology is tracked going forward. Step order: (1) Codex initial review, (2) Codex open-source validation, (3) Claude governance review, (4) Claude plan reconciliation, (5) operating-system setup, (6) operating-system cleanup, (7) T-001 planning.

## Current Phase

**Stage 1 (T-001) is implemented, Codex-reviewed (twice), and green.** The offline pipeline (`scripts/`), tests (`tests/`, **23/23 pass** = T1–T18 + P2-1..P2-5), and generated artifacts (`out/`) exist. Canonical run: 20 merchants → 8 review queue (High, held), 12 simulated_sent, 0 rejected; source CSV byte-identical; send gate verified (T17); app re-run dedups (P2-1). Two Codex review rounds returned 4 + 2 × P2, **all fixed** (no P0/P1). Stdlib only — no network, no AI call, no integrations.

**Git state (re-derived 2026-06-02):** `HEAD = cb80286 "Clarify source openness and sync project state"` — the T-001.7 audit + Source Openness/Cross-Verification/Synthesis clarification + Codex-flagged continuity correction are **committed**; tree was **clean** before this review. **Uncommitted now:** `docs/review-packets/roadmap-lifecycle-applicability-review.md` (revised) + the five state/decision-doc updates from this revision (`CURRENT_TASK.md`, `HANDOFF.md`, `PROJECT_STATE.md`, `docs/task-log.md`, `docs/decision-log.md`). No `out/` logs dirty; product code/tests/CSV/`out`/integrations unchanged.

**T-001.5 (2026-06-02):** the **Enterprise Delivery Playbook** (`docs/enterprise-delivery-playbook.md`) codifies the professional delivery standard (traceability spine, lightweight-vs-full, source tiers, freshness, artifact policy, stage closure, failure taxonomy, public-claim control, handoff-proof, living-standard) with a Universal vs ActivationOps-specific split. **Mandatory Startup Contract** now enforces it at session start (`RULES.md` §15; `CLAUDE.md`; `CODEX.md` process-finding rule; task/review templates; checklist), with an anti-bloat one-line allowance for trivial edits.

## Decision Status (historical — 2026-06-01)

The governance review found the dominant risk was process, not data: ~12 review/audit docs, zero runnable code, no planning exit. `docs/plan-reconciliation.md` resolved that — it accepted Codex's safety controls, rejected the documentation gate and the 14-table V1 schema, fixed the V1 scope, set a one-line planning exit condition, and named the first implementation task. **This GO/NO-GO is now historical: the owner gave GO, and T-001 (the offline thin slice) was built, tested (23/23), and audited — closed with minor follow-ups. See Current Readiness / Current Next Step below.**

## Operating System (2026-06-01)

The project operating system is now in place so any tool/account can continue from the repo, not from memory: `RULES.md` (constitution; it wins on any conflict), `CLAUDE.md` / `CODEX.md` (roles), `CURRENT_TASK.md` + `HANDOFF.md` (continuity), `docs/dual-model-workflow.md` (verified Codex commands), `docs/project-narrative.md` (public methodology), `docs/implementation-journal.md`, `docs/decision-log.md`, `docs/checklists/prevent-repeat-checklist.md`, `docs/prompts/*`, and `docs/visuals/*`. This is operating infrastructure, not product — no product code, schema, or integration was created.

## Current Evidence

- Project folder originally contained one merchant CSV file before documentation scaffolding was added.
- CSV file found: `DoorDash Merchant Nudge Engine - Merchant Directory.csv`
- Parsed merchant records: 20
- CSV header issue: first two columns are both named `Merchant Name`; second column values indicate merchant category/type.
- Risk score is synthetic and matches the inferred formula across all rows.
- Git repository: **initialized** (initial commit `b57cf2c "Initial reviewed planning state"`). The operating system, Enterprise Delivery Playbook, Mandatory Startup Contract, source-intake standards, and the Source Openness / state-sync batch are **committed** (OS setup at `49408d3`; latest committed `HEAD = cb80286`). The only uncommitted work is **this Codex-review revision batch** — the roadmap-lifecycle applicability packet plus the state/decision-doc updates (`CURRENT_TASK.md`, `HANDOFF.md`, `PROJECT_STATE.md`, `docs/task-log.md`, `docs/decision-log.md`). **No `out/` logs are dirty in this batch.** T-002 has not started.
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

The single blended "readiness" number is retired (earlier it rose as more review docs were written — rewarding documenting over shipping). Current state, two tracks:

- Shippable/build readiness: **T-001 (offline thin slice) is implemented, tested, and audited.** A reviewer can run `python3 scripts/run.py` and `python3 -m unittest tests.test_t001 -v` → **23/23 pass.** T-001 is **closed with minor follow-ups**.
- Standards/governance completeness: high and now **anchored in the repo** — `RULES.md`, the Enterprise Delivery Playbook, the Mandatory Startup Contract, and the Source Intake + Open Source Discovery rules were applied to T-001 without retroactively breaking it.

The discipline now is to build the next capability *under* these standards, not to add more of them.

## Current Blockers

**No build blockers.** T-001 is shipped and green; the prior pre-build blockers were all resolved *before* T-001 was built (historical record in `docs/plan-reconciliation.md` and `docs/task-log.md`):

- Planning had no exit → resolved (the owner gave GO and the slice was built).
- Rules lived in prompts → resolved (`RULES.md` is the canonical in-repo source).
- Prompt-invented "mandatory files" → de-scoped.
- V1 data shape ambiguous → resolved to one entity file + append-only event logs, not 14 tables.
- "Agentic" naming → dropped for V1.

The only open items are hygiene/decision follow-ups (see Current Next Step); none block work.

## Current Next Step

1. ~~Implement T-001 → Codex review rounds → fix P2 → commit → ground-rules audit → T-001.7 post-playbook alignment audit~~ — **done**; 23/23 pass; T-001 **closed with minor follow-ups** (`docs/audits/post-playbook-alignment-audit.md`).
2. **Owner: review + commit the uncommitted work** — this Codex-review **revision batch**: the revised roadmap applicability packet, the new `docs/decision-log.md` eval-first ratification, and the four state-doc syncs. (The prior T-001.7 + Source Openness batch is already committed at `cb80286`.) The commit decision stays with the owner.
3. **Hygiene / decision follow-ups (non-blocking):**
   1. restore or decide the `out/` generated-log tracking policy (`git checkout -- out/audit_log.csv out/model_runs.csv`, or gitignore the two volatile logs);
   2. ratify the **eval-first T-002 ordering** in `docs/decision-log.md` (deviates from `plan-reconciliation.md` §6, which puts Gemini next);
   3. decide whether **enforcement hooks** for CSV-immutability / secrets-blocking should become a future approved task.
4. **Roadmap / lifecycle applicability review — done + Codex-reviewed + revised** (`docs/review-packets/roadmap-lifecycle-applicability-review.md`): verdict = use industry terms as **honest mapping, not phase names**; product-named phases (vertical slice → offline evaluation & regression harness → bounded LLM → persistence → HITL delivery → orchestration); `RULES.md` §3 = lifecycle spine; **T-002 = Offline Evaluation and Regression Harness** (evaluation-first), **eval-first now owner-ratified in `docs/decision-log.md` (2026-06-02)**. Codex verdict was needs-revision; the four findings are applied (stale state-doc line, governance-section de-bloat, EDD source downgrade, ratification timing). **Next:** owner approval of the revised packet → **then** write `docs/roadmap.md` (product-first, short). **T-002 / roadmap have not started.**

Off the table until far later: live Supabase, n8n, Slack, Resend, or real Gemini calls; real credentials; any real merchant data; live outbound email.

## Files Created Or Updated This Session

Codex-review revision pass (latest, 2026-06-02, lightweight): applied the four Codex adversarial-review findings to `docs/review-packets/roadmap-lifecycle-applicability-review.md` (eval-first ratified + named **Offline Evaluation and Regression Harness**; no framework-mapping section in the roadmap by default; EDD downgraded to preprint/practice reference; product-first roadmap guidance) and added a top revision note; recorded the **eval-first T-002 ratification** in `docs/decision-log.md`; corrected the stale `PROJECT_STATE.md` git/current-state lines; synced `CURRENT_TASK.md` / `HANDOFF.md` / `docs/task-log.md`. **No `docs/roadmap.md`; no new files; no product code/tests/CSV/`out`/integration change; nothing installed/adopted; no commit (owner decides).**

Roadmap / Lifecycle / Build-Phase Applicability Review (2026-06-02, review/planning only): created `docs/review-packets/roadmap-lifecycle-applicability-review.md` (broad source discovery across NIST AI RMF + GenAI Profile + SSDF, DORA, Google SRE, MLOps/LLMOps, LLM eval / golden-dataset / regression / evaluation-driven development, HITL gates, walking-skeleton/tracer-bullet/vertical-slice, provenance/lineage, portfolio red-flags; each term classified use-now/later/reference/reject). Verdict: industry terms as honest mapping not phase names; product-named phases; RULES §3 = lifecycle spine; **T-002 = Offline Evaluation Harness** (evaluation-first), eval-before-Gemini justified but a §6 reorder needing owner ratification; recommend Codex review before any roadmap. Updated `CURRENT_TASK.md` / `HANDOFF.md` / `PROJECT_STATE.md` / `docs/task-log.md`. **No roadmap written; no `decision-log` entry; no code/tests/CSV/`out`/integration change; nothing installed/adopted.**

Source Openness Clarification Pass (2026-06-02, lightweight, wording-only): added an **Open Source Discovery** rule (named sources/frameworks/repos/vendors/communities/examples = candidates and seeds, not boundaries; search broadly incl. Reddit/forums/YouTube/SO as field-signals; **tiers judge quality, not restrict discovery**; *maximum useful research ≠ endless*; community = signal not proof unless corroborated). Edited `docs/enterprise-delivery-playbook.md` (new subsection in the Source-Backed Research Standard), `RULES.md` §14, `CLAUDE.md`, `CODEX.md` (8 flag conditions), `docs/prompts/claude-task-template.md`, `docs/prompts/codex-plan-review-template.md`, `docs/prompts/codex-changed-files-review-template.md`, `docs/checklists/prevent-repeat-checklist.md`; updated `CURRENT_TASK.md` / `HANDOFF.md` / `PROJECT_STATE.md` / `docs/task-log.md`. No restrictive wording existed to remove (grep = false positives only); no new standing files; no decision-log entry (no decision made); no product code/tests/CSV/`out`/integration/scope change.

T-001.7 post-playbook alignment audit (2026-06-02): created `docs/audits/post-playbook-alignment-audit.md`; fixed the known-stale `docs/v1-slice-plan.md` (test list → T1–T18 + P2-1..P2-5 = 23; `--fresh` note; status → implemented); corrected state-doc git-state. Vault read-only-inspected (exemplary boundary). Verdict: T-001 closed with minor follow-ups; next stage = offline eval harness (not Gemini). No product code/tests/CSV changes.

T-001.6 source-intake CORRECTION (2026-06-02): rewrote `docs/research/source-intake-review.md` from direct sources — read 3 PDFs directly, web-inspected all 5 GitHub repos, re-checked live official Claude Code docs (best-practices/features-overview/hooks/sub-agents); added explicit source-status separation + honest gaps (55 MB architect guide not loaded; model docs/changelog not fetched; GPT-5.5 UNVERIFIED). Updated `CURRENT_TASK.md` / `HANDOFF.md` / `PROJECT_STATE.md` / `docs/task-log.md`. Nothing adopted; no governance edit. No product code/tests/CSV/`out`/integration changes.

T-001.6 source-intake review (2026-06-02): created `docs/research/source-intake-review.md` (summary-only basis; superseded by the correction above).

Source/Pattern/Reference Intake rule (2026-06-02): `docs/enterprise-delivery-playbook.md` (new section), `RULES.md` (§14 bullet), `CLAUDE.md`, `CODEX.md`, `docs/checklists/prevent-repeat-checklist.md`, `docs/decision-log.md` (row); updated `CURRENT_TASK.md` / `HANDOFF.md` / `PROJECT_STATE.md` / `docs/task-log.md`. Integrated into the playbook, no new files. No product code/tests/CSV/`out`/integration changes.

Mandatory Startup Contract enforcement (2026-06-02): `RULES.md` (§15), `CLAUDE.md` (startup section), `CODEX.md` (process-finding rule), `docs/prompts/claude-task-template.md` (Professional Process Applied block), `docs/prompts/codex-changed-files-review-template.md` + `docs/prompts/codex-plan-review-template.md` (process checks), `docs/checklists/prevent-repeat-checklist.md`; updated `CURRENT_TASK.md` / `HANDOFF.md` / `PROJECT_STATE.md` / `docs/task-log.md`. No product code/tests/CSV/`out`/integration changes.

T-001.5 Enterprise Delivery Playbook (2026-06-02): created `docs/enterprise-delivery-playbook.md`; pointer/obligation edits to `RULES.md` (§14), `CLAUDE.md`, `CODEX.md`, `docs/checklists/prevent-repeat-checklist.md`; updated `CURRENT_TASK.md` / `HANDOFF.md` / `PROJECT_STATE.md` / `docs/task-log.md`. Reduced single-doc form (no separate matrix/log files). No product code/tests/CSV/`out`/integration changes.

T-001.5 blindspot review (2026-06-02): created `docs/review-packets/T-001.5-standards-blindspot-review.md`.

T-001 ground-rules audit (2026-06-02): created `docs/audits/T-001-ground-rules-audit.md`; corrected git-state wording in `PROJECT_STATE.md` / `CURRENT_TASK.md` / `HANDOFF.md`; updated `docs/task-log.md` + `docs/implementation-journal.md`. No product code/tests/CSV/integration changes.

T-001 Codex P2 fix pass (2026-06-02):

- Updated: `scripts/run.py` (preserve history; `--fresh`), `scripts/pipeline.py` (reject fractional ints; unique model IDs), `scripts/guardrail.py` (prose state_mismatch), `tests/test_t001.py` (+P2 tests), `tests/fixtures/guardrail_cases.json`; plus `CURRENT_TASK.md`, `HANDOFF.md`, `PROJECT_STATE.md`, `docs/task-log.md`, `docs/implementation-journal.md`. Regenerated `out/`.

Earlier T-001 implementation (2026-06-02): created `scripts/*` (5), `tests/*`, `tests/fixtures/*` (3); generated `out/*` (4). Full per-step history (governance review → reconciliation → OS setup → OS cleanup → T-001 planning → revision → implementation → doc-sync → P2 fixes): see `docs/task-log.md`.

## Open Questions

See `docs/open-questions.md`.

The prior meta-questions in `docs/plan-reconciliation.md` (scope, V1 shape, rules location, naming, exit condition) are **resolved** — the owner gave GO and T-001 shipped. Genuinely still open:

- Definition of "done" / audience for the project overall (the reconciliation set a DoD for the *V1 slice*, not the portfolio goal).
- The three hygiene/decision follow-ups (`out/` log policy; eval-first T-002 ratification; enforcement-hooks decision).

Resolved earlier: as-of date set to **June 1, 2026** (default, owner may change); Git initialized; rules location is `RULES.md`; **GO/NO-GO on the reconciliation (GO — T-001 built)**.

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

Next session: **T-001 (the offline thin slice) is built, green (23/23), and closed with minor follow-ups** — read `docs/v1-slice-plan.md` + `docs/v1-data-dictionary.md` for what V1 is, and `docs/audits/post-playbook-alignment-audit.md` for the closure verdict. The uncommitted work is **this Codex-review revision batch** (the revised applicability packet, the new `docs/decision-log.md` eval-first ratification, and four state-doc syncs) — **pending owner review + commit**. **Eval-first T-002 = Offline Evaluation and Regression Harness is now ratified.** Next step after commit: owner approval of the revised packet → write `docs/roadmap.md` (product-first, short). Do not modify the source CSV. Do not start integrations (Supabase, n8n, Slack, Resend, Gemini), real credentials, or real data — all out of scope. Do not start T-002 or the roadmap before the owner approves the roadmap pass.

