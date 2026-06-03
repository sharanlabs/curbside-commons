# HANDOFF.md

Point-in-time handoff for the next session. Overwrite the top block each time a session ends or pauses; keep the standing procedures at the bottom.

## Latest handoff

- **Last session tool:** Claude Code (Opus 4.8)
- **Account / session:** account 1 (mithulshyam4@gmail.com)
- **Task ID:** Roadmap applicability review → **Codex adversarial review (needs-revision) → one revision pass applied (this session)**. Pending owner approval before any roadmap. Prior governance batch (T-001.7 audit + Source Openness clarification + continuity correction) is **committed at `cb80286`**.
- **What was done (this session, full-but-narrow):** broad source discovery (NIST AI RMF + GenAI Profile + SSDF; DORA; Google SRE; MLOps/LLMOps; LLM eval / golden-dataset / regression / **evaluation-driven development**; HITL workflow/approval gates; walking-skeleton/tracer-bullet/**vertical slice**; provenance/lineage/audit-trail; AI-portfolio red-flags), each term classified **use-now / later / reference / reject**; produced `docs/review-packets/roadmap-lifecycle-applicability-review.md`. **No roadmap written; no `decision-log` entry; no code/tests/CSV/`out`/integration touched; nothing installed/adopted.**
- **Verdict:** use industry terms **selectively, as honest mapping** — plainest term a layperson understands, each tied to a real artifact; product-named phases (**offline vertical slice → offline evaluation harness → bounded LLM drafting → persistence & provenance → HITL delivery → orchestration & monitoring**); `RULES.md` §3 order-of-operations = the lifecycle spine. **Use now:** vertical/thin slice, HITL approval gate, deterministic guardrails, provenance + audit trail, idempotency, offline evaluation harness / golden labels / regression testing, evaluation-driven. **Avoid:** SRE/SLO/error-budget, DORA-as-current-claim, MLOps training, **agentic**, **"production-grade / deployed to production / enterprise-scale."** NIST RMF/GenAI/SSDF + DORA = **internal reference only (not a roadmap section by default)**, never phase names or compliance claims.
- **T-002 (ratified):** **"Offline Evaluation and Regression Harness"** (evaluation-first) — golden labels + guardrail regression set + metrics, fully offline. Offline eval before Gemini is **justified on four independent grounds** (RULES §3; the by-construction guardrail caveat in data-dictionary §9; EDD as a field signal; the "improvement-without-a-baseline" portfolio red-flag). The **reorder of `plan-reconciliation.md` §6** (which lists live-Gemini before the larger eval set) is **now owner-ratified in `docs/decision-log.md` (2026-06-02)**. (TEVV kept only as a background reference term, not the title.)
- **Git state (re-derived 2026-06-02):** `HEAD = cb80286 "Clarify source openness and sync project state"` (the prior batch is committed). **Uncommitted now:** the revised `docs/review-packets/roadmap-lifecycle-applicability-review.md` + five state/decision-doc updates (`CURRENT_TASK.md`, `HANDOFF.md`, `PROJECT_STATE.md`, `docs/task-log.md`, `docs/decision-log.md`). No `out/` logs dirty; product code/tests/CSV/`out`/integrations unchanged.
- **What not to do:** do not write `docs/roadmap.md` before owner approval; do not start T-002; do not jump to Gemini before the eval harness + secrets + offline mock; do not add integrations/plugins/hooks; do not link the vault globally; do not commit unless the owner says so. (Eval-first T-002 is already ratified in `docs/decision-log.md` — no further ratification needed.)
- **Next step:** owner approval of this revised packet → **then** write `docs/roadmap.md` (product-first, short; no framework-mapping section by default). Eval-first T-002 already ratified in `docs/decision-log.md`. Tests still green: `python3 -m unittest tests.test_t001 -v`.
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
