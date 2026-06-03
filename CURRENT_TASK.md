# CURRENT_TASK.md

The single active task. Update this whenever the active task changes or pauses.

- **Task ID:** DOC — `docs/roadmap.md` (product-first roadmap)
- **Task name:** Create the product-first ActivationOps AI roadmap from the ratified applicability review
- **Current stage:** **`docs/roadmap.md` created + Codex-reviewed + corrected** — product-first, a governance **Foundation** (done) + **7 build phases**: Offline Vertical Slice **done**; **Offline Evaluation and Regression Harness = T-002 (Phase 2), next**; Bounded LLM Drafting → Persistence → HITL Delivery → Orchestration → Public Demo planned. Applicability review + Codex revision **committed at `78dc694`**. **T-002 not started.**
- **Mode / risk:** lightweight · low-medium · documentation only.
- **Owner:** Claude Code (author); the human owner decides on commit and on starting T-002.
- **Goal:** a short, product-first roadmap that reflects what is built (T-001 green, 23/23) and the ratified next order (T-002 eval-first, before Gemini) — layperson-legible, no framework theater, no unproven public claims.
- **Allowed scope (this task):** create `docs/roadmap.md`; update state docs `CURRENT_TASK.md`, `HANDOFF.md`, `PROJECT_STATE.md`, `docs/task-log.md`.
- **Out of scope (do not touch):** `docs/decision-log.md` (no new decision); product code (`scripts/`), tests (`tests/`), the source CSV, `out/`, integrations (Supabase/n8n/Slack/Resend/Gemini), plugins, hooks, Obsidian global linking, and **T-002 implementation** (the roadmap names it; it does not start it).
- **Key output:** `docs/roadmap.md` — Current Status; Product Lifecycle (Discover → Source Intake → Plan → Build → Validate → Review → Document → Handoff → Decide Next Stage); a governance Foundation + 7 product-first Build Phases; a plain "Why T-002 Comes Before Gemini"; per-phase goal / build / validation / out-of-scope / trigger; a tiny Terminology note (no framework-mapping section); a "What Not To Do Yet" list. Honest framing: simulation on dummy data; CSV protected; fully offline.
- **Acceptance criteria:** `docs/roadmap.md` exists, product-first, with the required structure; ratified T-002 name used; no forbidden public-claim terms; no product/test/CSV/`out`/integration change; no `decision-log` entry; T-002 not started.
- **Commit decision:** owner decides — the roadmap batch (`docs/roadmap.md` + four state-doc syncs) is a coherent slice; recommended after owner review.

## Completed stage (historical) — T-001 offline thin slice

- **T-001 is implemented, tested, and closed with minor follow-ups.** Offline pipeline (`scripts/`) normalizes the 20-row CSV → `out/merchants_v1.csv`, computes deterministic risk/blocker, builds a review queue, generates one stubbed guardrailed draft, gates simulated sends behind approval, writes two append-only logs. **23/23 tests pass** (T1–T18 + P2-1..P2-5). Source CSV byte-identical; send gate verified (T17); app re-run dedups. No integrations, no AI call. Audited twice (`docs/audits/T-001-ground-rules-audit.md`, `docs/audits/post-playbook-alignment-audit.md`).
- **How to run (reference):** app `python3 scripts/run.py` (preserve history) or `--fresh` (reset); tests `python3 -m unittest tests.test_t001 -v`.
- **Hygiene / decision follow-ups (non-blocking):** (a) restore or decide the `out/` generated-log policy (`git checkout -- out/audit_log.csv out/model_runs.csv`); (b) decide whether CSV-immutability / secrets-blocking hooks should become a future approved task. *(The eval-first T-002 ordering is already ratified in `docs/decision-log.md`.)*

## Status / continuity

- **Git (re-derived 2026-06-02):** `HEAD = 78dc694 "Revise roadmap applicability review after Codex"`; the applicability review + Codex revision are **committed**; tree was clean before this task. Uncommitted now = `docs/roadmap.md` (new) + four state-doc syncs (`CURRENT_TASK`, `HANDOFF`, `PROJECT_STATE`, `docs/task-log`). No `decision-log` change; product code/tests/CSV/`out`/integrations unchanged.
- **Next safe step:** owner reviews + approves `docs/roadmap.md` (and commits this batch); then **scope T-002 — Offline Evaluation and Regression Harness** as a separate task. Do not start T-002 before owner approval.
