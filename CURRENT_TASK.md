# CURRENT_TASK.md

The single active task. Update this whenever the active task changes or pauses.

- **Task ID:** DOC-SYNC (post-T-001.7) — Source Openness clarification + Codex-requested continuity doc-sync
- **Task name:** Source Openness, Cross-Verification, and Synthesis clarification, plus the continuity doc-sync Codex flagged (refresh stale `PROJECT_STATE.md` / `CURRENT_TASK.md` state and scope wording)
- **Current stage:** continuity correction **complete; pending owner review + commit.** The Open Source Discovery rule wording was added and **Codex-reviewed** (verdict: rule sound — preserves source quality while removing artificial source boundaries; needs-revision was only about two stale state docs). This pass corrected those two docs.
- **Mode / risk:** lightweight · low risk · documentation/governance only.
- **Owner:** Claude Code (builder); the human owner decides on commit and the next task.
- **Goal:** make the source-discovery rules explicit (named sources are *seeds, not boundaries*; preserve official-source authority for factual claims; community = field-signal not proof; research proportional to risk, not endless) and keep the continuity docs accurate — with **no product, scope, or tool change**.
- **Allowed scope (this task):** documentation and state files only — `docs/enterprise-delivery-playbook.md`, `RULES.md`, `CLAUDE.md`, `CODEX.md`, `docs/prompts/*`, `docs/checklists/prevent-repeat-checklist.md`, `CURRENT_TASK.md`, `HANDOFF.md`, `PROJECT_STATE.md`, `docs/task-log.md`.
- **Out of scope (do not touch):** product code (`scripts/`), tests (`tests/`), the original `DoorDash Merchant Nudge Engine - Merchant Directory.csv`, `out/`, integrations (Supabase/n8n/Slack/Resend/Gemini/Apps Script), plugins, hooks, Obsidian global linking, the roadmap, and T-002.
- **Acceptance criteria:** stale T-001 pre-build/planning language removed from the state docs; active-task scope reads docs-only; the source-openness rule wording remains intact; `git diff` shows no product/test/CSV/`out/` code changes; roadmap and T-002 not started.
- **Commit decision:** remains with the human owner (do not auto-commit).

## Completed stage (historical) — T-001 offline thin slice

- **T-001 is implemented, tested, and closed with minor follow-ups.** The offline pipeline (`scripts/`) normalizes the 20-row CSV → `out/merchants_v1.csv`, computes deterministic risk/blocker, builds a review queue, generates one stubbed guardrailed draft, gates simulated sends behind approval, and writes two append-only logs. **23/23 tests pass** (T1–T18 + P2-1..P2-5). Source CSV byte-identical; send gate verified (T17); app re-run dedups (12 send → 12 skipped_duplicate). No integrations, no AI call. Audited twice (`docs/audits/T-001-ground-rules-audit.md`, `docs/audits/post-playbook-alignment-audit.md`).
- **How to run (reference):** app `python3 scripts/run.py` (preserve history) or `--fresh` (reset); tests `python3 -m unittest tests.test_t001 -v`.
- **Hygiene / decision follow-ups (non-blocking):** (a) restore or decide the `out/` generated-log policy (`git checkout -- out/audit_log.csv out/model_runs.csv`); (b) ratify the eval-first T-002 ordering in `docs/decision-log.md`; (c) decide whether CSV-immutability / secrets-blocking hooks should become a future approved task.

## Status / continuity

- **Git (re-derived 2026-06-02):** `HEAD = 63e3332 "Complete T-001.6 source intake correction"`. Uncommitted working tree = the T-001.7 audit + doc-sync, the Source Openness / Cross-Verification / Synthesis clarification wording, this continuity correction, and the two regenerated `out/` logs. Product code/tests/CSV unchanged.
- **Known risks:** the hardest invariants (CSV-immutability, no-secrets) are still prompt-only "requests" — official docs say must-hold rules should be hooks; an enforcement-hooks task is a documented, human-approval-gated option. The governance surface is large for a one-slice product — keep new standards integrated and proportional.
- **Next safe step:** owner reviews + commits the pending work. Then the **roadmap / lifecycle applicability review**, then **owner ratification of eval-first T-002** before any T-002 work. Do not start the roadmap or T-002 before that.
