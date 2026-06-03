# CURRENT_TASK.md

The single active task. Update this whenever the active task changes or pauses.

- **Task ID:** REVIEW — Roadmap / Lifecycle / Build-Phase Applicability Review
- **Task name:** Discover + classify roadmap/lifecycle/build-phase terminology by fit for ActivationOps AI (terminology applicability review, not the roadmap itself)
- **Current stage:** **Codex adversarial review complete (needs-revision); this revision pass applied the four findings; eval-first T-002 ratified in `docs/decision-log.md`.** Pending owner approval before any roadmap. No roadmap written; T-002 not started.
- **Mode / risk:** full-but-narrow · medium (weak terminology can make a roadmap look fake/overbuilt) · review/planning only.
- **Owner:** Claude Code (reviewer); the human owner decides on commit, the roadmap, and T-002.
- **Goal:** find what roadmap/lifecycle/build-phase/evaluation/delivery/AI-governance/portfolio terminology should apply — searching broadly first (named frameworks = candidates, not commands), then classifying each by fit. Produce the applicability packet only.
- **Allowed scope (this task):** create `docs/review-packets/roadmap-lifecycle-applicability-review.md`; update state docs `CURRENT_TASK.md`, `HANDOFF.md`, `PROJECT_STATE.md`, `docs/task-log.md`.
- **Out of scope (do not touch):** `docs/roadmap.md` (**do not create yet**); `docs/decision-log.md` (**no entry** until the owner ratifies eval-first T-002); product code (`scripts/`), tests (`tests/`), the source CSV, `out/`, integrations (Supabase/n8n/Slack/Resend/Gemini), plugins, hooks, Obsidian global linking, and T-002.
- **Key outputs / verdict:** use industry terms **selectively, as honest mapping, not as phase names**; product-named phases (offline vertical slice → offline evaluation & regression harness → bounded LLM drafting → persistence & provenance → HITL delivery → orchestration & monitoring); `RULES.md` §3 order-of-operations = the lifecycle spine. **T-002 = "Offline Evaluation and Regression Harness"** (evaluation-first) — a `plan-reconciliation.md` §6 reorder, **now owner-ratified in `docs/decision-log.md` (2026-06-02)**. **Avoid** SRE/SLO/error-budget, DORA-as-current-claim, agentic, "production-grade/deployed-to-production/enterprise-scale." Codex adversarial review done (needs-revision); findings applied; roadmap stays product-first with no framework-mapping section by default.
- **Acceptance criteria:** the packet exists with the required structure; every candidate term classified (use-now/later/reference/reject) with adapt + risk; no roadmap written; no product/test/CSV/`out`/integration change; no `decision-log` entry; nothing installed/adopted.
- **Commit decision:** owner decides — recommended **after** owner approval of this revised packet (packet + four state-doc syncs + the new `docs/decision-log.md` eval-first entry; no `roadmap.md`).

## Completed stage (historical) — T-001 offline thin slice

- **T-001 is implemented, tested, and closed with minor follow-ups.** Offline pipeline (`scripts/`) normalizes the 20-row CSV → `out/merchants_v1.csv`, computes deterministic risk/blocker, builds a review queue, generates one stubbed guardrailed draft, gates simulated sends behind approval, writes two append-only logs. **23/23 tests pass** (T1–T18 + P2-1..P2-5). Source CSV byte-identical; send gate verified (T17); app re-run dedups. No integrations, no AI call. Audited twice (`docs/audits/T-001-ground-rules-audit.md`, `docs/audits/post-playbook-alignment-audit.md`).
- **How to run (reference):** app `python3 scripts/run.py` (preserve history) or `--fresh` (reset); tests `python3 -m unittest tests.test_t001 -v`.
- **Hygiene / decision follow-ups (non-blocking):** (a) restore or decide the `out/` generated-log policy (`git checkout -- out/audit_log.csv out/model_runs.csv`); (b) ratify the eval-first T-002 ordering in `docs/decision-log.md`; (c) decide whether CSV-immutability / secrets-blocking hooks should become a future approved task.

## Status / continuity

- **Git (re-derived 2026-06-02):** `HEAD = cb80286 "Clarify source openness and sync project state"`; the prior governance batch is **committed**. Uncommitted now = the revised review packet + five state/decision-doc updates (`CURRENT_TASK`, `HANDOFF`, `PROJECT_STATE`, `docs/task-log`, `docs/decision-log`). No `out/` logs dirty; product code/tests/CSV/`out`/integrations unchanged.
- **Next safe step:** owner approval of this revised packet → **then** write `docs/roadmap.md` (product-first, short; no framework-mapping section by default). Eval-first T-002 is already ratified in `docs/decision-log.md`. Do not start the roadmap or T-002 before owner approval.
