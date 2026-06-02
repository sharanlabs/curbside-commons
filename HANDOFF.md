# HANDOFF.md

Point-in-time handoff for the next session. Overwrite the top block each time a session ends or pauses; keep the standing procedures at the bottom.

## Latest handoff

- **Last session tool:** Claude Code (Opus 4.8)
- **Account / session:** account 1 (mithulshyam4@gmail.com)
- **Task ID:** T-001 (offline thin slice — planning + data dictionary). Status: **plan revised after Codex round-1 (both findings fixed); ready for human GO.**
- **What was done:** Wrote the V1 plan — `docs/v1-data-dictionary.md` (entity schema, derived fields, risk/blocker rules, review queue, stubbed draft schema, guardrail checks, `model_runs` + `audit_log`, idempotency), `docs/v1-slice-plan.md` (steps, tests T1–T18, edge cases, scope, GO/NO-GO), and `docs/review-packets/T-001-review-packet.md` (for Codex/ChatGPT). Key honesty decisions: recompute + validate `risk_score` (genuine); **carry source `risk_level`** (thresholds under-constrained → documented assumption; T5 is consistency-only, not a correctness claim); synthetic ineligibility lives in **test fixtures, not product output**; guardrail also tested over the 20 real source nudges (over-flagging check).
- **Files changed:** Created `docs/v1-data-dictionary.md`, `docs/v1-slice-plan.md`, `docs/review-packets/T-001-review-packet.md`. Updated `CURRENT_TASK.md`, `PROJECT_STATE.md`, `HANDOFF.md`, `docs/task-log.md`, `docs/decision-log.md`.
- **Checks run:** Re-verified from the source CSV — risk formula holds on all 20 rows; step order recovered from the nudges; both Medium rows = 69 (threshold gap). No code (planning only).
- **Git status at handoff:** Repository initialized (commit `b57cf2c`). Planning docs + prior OS files are **uncommitted** on disk; committing is the human owner's call (`RULES.md` §12).
- **Important context:** The plan is in review state. Next gate = Codex adversarial review of the plan → human approval → a separate implementation task. Framing: human-led, AI-assisted, professionally reviewed.
- **What not to do:** Do not write product code, scripts, schemas, or integrations. Do not modify the source CSV. Do not call Gemini. Do not begin implementation until Codex review + human GO.
- **Codex review (result checked):** job `review-mpw2j628-ncd4my`, verdict **needs-attention / NO-SHIP**. [high] review-required merchants could reach `simulated_send` with no approval gate; [medium] guardrail tests only covered over-flagging + one planted case. Q1/Q4/Q5/Q6 confirmed as-planned. **Revision applied 2026-06-01:** added `contact_eligible`/`send_eligible`/`approval_state` send-gate + test T17; expanded guardrail to 6 categories with one negative fixture each + test T18 and fenced (de-ambiguated) regex bound to revenue/performance context so the 20 progress nudges still pass T11. Acceptance is now **T1–T18**.
- **Next step:** human **GO** on the revised plan (GO/NO-GO criteria in `docs/v1-slice-plan.md`); then a separate implementation task. A second Codex pass is optional, not required.
- **If unsure, stop and ask.**

## Standing continuity procedures

### If Claude Code account 1 hits usage mid-task

1. Stop.
2. Update `CURRENT_TASK.md`.
3. Update this `HANDOFF.md`.
4. Update `PROJECT_STATE.md`.
5. Update `docs/task-log.md`.
6. List uncommitted changes (`git status`).
7. Do not start a new task.

### When Claude Code account 2 (or the CLI) starts

1. Read `RULES.md`.
2. Read `PROJECT_STATE.md`.
3. Read `CURRENT_TASK.md`.
4. Read `HANDOFF.md`.
5. Read `docs/task-log.md`.
6. Run `git status`.
7. Summarize current phase, active task, changed files, unfinished work, risks, and the next safest step.
8. Wait for human approval before continuing.

### Background Codex jobs

When a Codex job runs in the background, record its purpose and whether its result was checked here or in `docs/task-log.md`. Poll with `/codex:status`; fetch with `/codex:result`; cancel with `/codex:cancel`.
