# CURRENT_TASK.md

The single active task. Update this whenever the active task changes or pauses.

- **Task ID:** T-001
- **Task name:** Offline thin slice — planning + data dictionary
- **Current stage:** Not started — **awaiting human GO / NO-GO** on `docs/plan-reconciliation.md`.
- **Owner:** Claude Code (planner); the human owner approves GO and the plan.
- **Goal:** Produce the plan for the V1 offline thin slice and write `docs/v1-data-dictionary.md`. **No product code yet.** The data dictionary defines: the V1 field list; the deterministic risk formula and thresholds; the onboarding step order and blocker taxonomy; and the duplicate-send idempotency key. The plan defines the slice stages and the acceptance tests for each.
- **Allowed files:** `docs/v1-data-dictionary.md` (new), a short slice-plan doc such as `docs/v1-slice-plan.md` (new), `docs/task-log.md`, `docs/implementation-journal.md`, `docs/decision-log.md`, `HANDOFF.md`, `PROJECT_STATE.md`, `CURRENT_TASK.md`.
- **Files NOT to touch:** `DoorDash Merchant Nudge Engine - Merchant Directory.csv` (read-only source). `scripts/` and any product code (this task is planning only). Any integration code or schemas (Supabase / n8n / Slack / Resend / Gemini are out of scope).
- **Acceptance criteria:**
  - `docs/v1-data-dictionary.md` covers fields, risk formula + thresholds, step/blocker taxonomy, and the idempotency-key definition;
  - the slice plan lists stages and the acceptance tests for each;
  - the plan passes a Codex adversarial review (`/codex:adversarial-review`);
  - the human owner approves the plan before any implementation task starts.
- **As-of date:** **June 1, 2026** (2026-06-01) — the fixed reference for deriving timestamps from the relative day counts. Change only if the human owner says so.
- **Current status:** Operating-system cleanup complete (2026-06-01). Planning not started.
- **Last known progress:** Plan reconciled (`docs/plan-reconciliation.md`); operating system in place and cleaned up; Git initialized (commit `b57cf2c`). Awaiting human GO.
- **Unfinished work:** All of T-001.
- **Known risks:** temptation to over-model V1 — keep to one entity CSV + append-only event logs (reconciliation §5); temptation to jump straight to code — this task is planning + data dictionary only.
- **Next safe step:** obtain human GO, then write `docs/v1-data-dictionary.md` and the slice plan, run a Codex adversarial review, and get human approval. Implementation (ingest/normalize + tests) is a separate later task.
