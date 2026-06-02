# CURRENT_TASK.md

The single active task. Update this whenever the active task changes or pauses.

- **Task ID:** T-001
- **Task name:** Offline thin slice — planning + data dictionary
- **Current stage:** Planning docs **revised after Codex round-1** (both findings fixed) — **ready for human GO**; no implementation yet.
- **Owner:** Claude Code (planner); the human owner approves GO and the plan.
- **Goal:** Produce the plan for the V1 offline thin slice and write `docs/v1-data-dictionary.md`. **No product code yet.** The data dictionary defines: the V1 field list; the deterministic risk formula and thresholds; the onboarding step order and blocker taxonomy; and the duplicate-send idempotency key. The plan defines the slice stages and the acceptance tests for each.
- **Allowed files:** `docs/v1-data-dictionary.md` (new), a short slice-plan doc such as `docs/v1-slice-plan.md` (new), `docs/task-log.md`, `docs/implementation-journal.md`, `docs/decision-log.md`, `HANDOFF.md`, `PROJECT_STATE.md`, `CURRENT_TASK.md`.
- **Files NOT to touch:** `DoorDash Merchant Nudge Engine - Merchant Directory.csv` (read-only source). `scripts/` and any product code (this task is planning only). Any integration code or schemas (Supabase / n8n / Slack / Resend / Gemini are out of scope).
- **Acceptance criteria:**
  - `docs/v1-data-dictionary.md` covers fields, risk formula + thresholds, step/blocker taxonomy, and the idempotency-key definition;
  - the slice plan lists stages and the acceptance tests for each;
  - the plan passes a Codex adversarial review (`/codex:adversarial-review`) — **done 2026-06-01; round-1 findings resolved**;
  - the human owner approves the plan before any implementation task starts (**outstanding**).
- **As-of date:** **June 1, 2026** (2026-06-01) — the fixed reference for deriving timestamps from the relative day counts. Change only if the human owner says so.
- **Current status:** Planning docs created and **revised after Codex round-1** (2026-06-01): `docs/v1-data-dictionary.md`, `docs/v1-slice-plan.md`, `docs/review-packets/T-001-review-packet.md`. Defines the entity schema, risk/blocker rules, review queue, **contact-vs-send eligibility + `approval_state` gate**, stubbed draft + 6-category guardrail, two append-only logs, idempotency, and acceptance tests **T1–T18**.
- **Last known progress:** Codex adversarial review (job `review-mpw2j628-ncd4my`) returned NO-SHIP with 2 findings; both fixed (send-gate + guardrail under-flag coverage). Awaiting human GO.
- **Unfinished work:** human approval (GO) of the revised plan. Then implementation (separate later task): `scripts/` + `tests/` (+ `tests/fixtures/`) producing `out/merchants_v1.csv` and the two logs, satisfying T1–T18.
- **Known risks:** thresholds under-constrained (carried source label; T5 consistency-only — do not overclaim); stubbed generator means the guardrail passes by construction (T11 + T18 bound its coverage); temptation to over-model V1 — keep to one entity CSV + two append-only logs.
- **Next safe step:** human GO on the revised plan (GO/NO-GO criteria in `docs/v1-slice-plan.md`). Then implementation. A second Codex pass is optional, not required. Do not write product code until human GO.
