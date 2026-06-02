# T-001 Ground Rules Audit

Audit date: 2026-06-02
Auditor: Claude Code (checkpoint audit — review only; no product build)
Scope: whether work through T-001 followed the project ground rules. Evidence = repo files + the commands below.

## Executive Verdict

**Ground rules were followed. T-001 can be closed — "Yes, with minor follow-ups."** The offline thin slice is implemented, committed, and green (23/23 tests); the original CSV is untouched; the work is fully offline with no live integrations and no secrets; the human-review send-gate and idempotency hold under test. The only issues are documentation/hygiene, none of which break the implemented T-001 guarantees: (a) the state docs had gone stale on git commit state (corrected in this audit); (b) `out/`'s two append-only logs are volatile and the tracking policy is undecided; (c) `docs/v1-slice-plan.md` still lists only T1–T18 (flagged — not editable in this audit).

## Evidence Checked

Read: `RULES.md`, `AGENTS.md`, `CLAUDE.md`, `CODEX.md`, `PROJECT_STATE.md`, `CURRENT_TASK.md`, `HANDOFF.md`, `README.md`, `docs/project-narrative.md`, `docs/v1-data-dictionary.md`, `docs/v1-slice-plan.md`, `docs/review-packets/T-001-review-packet.md`, `docs/task-log.md`, `docs/implementation-journal.md`, `docs/decision-log.md`, `docs/dual-model-workflow.md`, `docs/checklists/prevent-repeat-checklist.md`. Plus `scripts/*`, `tests/*`, `out/*`.

## Commands Run

| Command | Result |
| --- | --- |
| `git status` | Clean **before** this audit (see Git consistency). |
| `git log --oneline -8` | `2ccafce Fix T-001 guardrail and idempotency follow-ups` → `653245b Implement T-001 offline thin slice` → `ecb2de3 Finalize T-001 offline slice plan` → `49408d3 Set up project operating system` → `b57cf2c Initial reviewed planning state`. |
| `python3 -m unittest tests.test_t001 -v` | **23/23 pass** (T1–T18 + P2-1..P2-5). |
| `python3 scripts/run.py --fresh` | 20 merchants, 8 review queue, 12 simulated_sent, 8 held, 0 rejected, 0 skipped. |
| `python3 scripts/run.py` (preserve) | 0 new sends, **12 skipped_duplicate** → app-path idempotency holds. |
| `git ls-files \| grep -E '__pycache__\|\.pyc$'` | **NONE tracked.** |
| `grep -RniE "api[_-]?key\|secret\|token\|AIza\|sk-\|xoxb\|xoxp\|Bearer "` | Matches are all rule text, guardrail *pattern definitions*, doc citations, or the synthetic `growth-team@gmail.com` test fixture. **No real credentials.** |

## Ground Rules Compliance

| Rule | Status | Evidence |
| --- | --- | --- |
| Repo is source of truth; continue from files | Followed | Audit ran from repo + git, not memory. |
| Deterministic before AI; structured before prose | Followed | Risk/blocker deterministic; draft is structured JSON via a stub (no AI). |
| Human approval before risky automation | Followed | Send-gate (T17); High merchants held. |
| No live Supabase/n8n/Slack/Resend/Gemini until offline slice complete | Followed | None exist; `scripts/` is 4 modules + config; stdlib only. |
| Secrets rule (§11) | Followed | No real secrets (grep). |
| Commit hygiene (§12) | Followed | Commits are coherent, message-described, human-made. |
| Public vs internal docs (§8) | Followed | README product-first; Claude/Codex only under "Development Workflow". |
| Definition of done (§9) | Followed | Code + tests + logs + journal + decision-log + handoff all present. |

## T-001 Scope Compliance

In scope and delivered: ingest/normalize → `out/merchants_v1.csv`; deterministic risk (recomputed, validated == source) + carried risk_level; blocker/next-action; review queue; one stubbed structured draft; 6-category guardrail; two append-only logs; idempotent simulated send; tests T1–T18 (+P2-1..P2-5). No scope creep — no integrations, no real send, no 14-table schema, one entity CSV + two logs as planned.

## Offline-Only Compliance

**Fully offline.** `scripts/{config,guardrail,pipeline,run}.py` import only stdlib (`csv, re, json, hashlib, datetime, pathlib`). No network, no API client, no LLM call — the draft generator is a deterministic stub. Tests run offline; `run.py` prints "no integrations". Q2 ✅.

## Data Safety and Original CSV Check

The original `DoorDash Merchant Nudge Engine - Merchant Directory.csv` is **untouched**. T1 (`source_unchanged`) passes (sha256 before/after a run); `git diff` against it is empty; the pipeline opens it read-only. Q1 ✅.

## Human-Review and Send-Gate Compliance

`contact_eligible` (reachability) and `send_eligible` are **distinct**; `send_eligible = contact_eligible AND (review_required=false OR approval_state=approved)` (data-dictionary §7.1, `pipeline.compute_send_eligible`). Canonical run: the 8 High merchants are held (`pending_review`, `drafted`, not sent); only the 12 contact-eligible Low/Medium send. T17 proves no High/review-required merchant reaches `simulated_send` without an explicit synthetic approval, and that approving one (M006) sends exactly that one. Q6, Q7 ✅.

## Guardrail Compliance

Both directions covered: **over-flagging** — T11 runs all 6 guardrail categories over the 20 real source nudges → 0 flags (progress percentages like "60% complete" do not trip it). **Under-flagging** — T18 (one negative fixture per category), T10 (planted bad vs clean), P2-4 (keyword-first prose claim), P2-5 (verb-first prose claim "We've added your photos"), with a clean-draft negative control. Honest caveat preserved: with a stub generator the guardrail passes by construction; real adversarial cases belong to the future live-Gemini step. Q10 ✅.

## Idempotency and Audit Log Compliance

Idempotency holds through the **documented `scripts/run.py` path** (P2-1 fix): `--fresh` → 12 `simulated_send`; second `preserve` run → 0 new sends + 12 `skipped_duplicate`. `audit_log.csv` keeps exactly one `simulated_send` per merchant (T13). Provenance: `model_run_id` is offset by existing row count, so appended runs get unique IDs (P2-3: two runs → 40 rows / 40 unique IDs). Q8, Q9 ✅.

## Claude + Codex Workflow Compliance

Claude planned/built; Codex was used **at gates, not constantly**: plan adversarial review (1), changed-files review after the build (1), final changed-files review (1) — each producing P2 findings that were fixed. The stop-time review gate was never left on. Claude/Codex appear only as a "Development Workflow" note in public docs, never in the runtime stack. Q4, Q5 ✅.

## Documentation Quality Check

- README and `project-narrative.md` are product-first (problem → V1 → runtime stack → roadmap; dev workflow is a short section). Q14 ✅.
- `v1-data-dictionary.md` matches the code (regex + risk_level normalization synced earlier). ✅.
- Tests capture every Codex finding (P2-1..P2-5 map 1:1). Q11 ✅.
- Failures/root-cause/fix/prevention are recorded per finding in `implementation-journal.md`. Q12 ✅.
- **Stale:** the three state docs lagged git commit state (see below; corrected here). `v1-slice-plan.md` still lists only T1–T18 and lacks the `--fresh` vs preserve note — flagged (not in this audit's editable set). The `PROJECT_STATE.md` "date note" line ("current date is 2026-06-01") is also stale (now 2026-06-02) — cosmetic. Q15.

## Failure / Fix / Prevention Check

All defects found across the two Codex rounds + the build were fixed in **logic, not tests**, and recorded: risk_level enum normalization; two guardrail regex bugs (`%\b`, inflected-verb `\b`); the 4 P2s (run.py idempotency, fractional ints, model-run IDs, prose state_mismatch); the verb-first state_mismatch. Each has a journal entry with prevention. Q12 ✅. **One prevention is not sticking** — see "What We Should Not Repeat".

## Git and Handoff Consistency

**This was the main finding (now corrected).** Before this audit: `HEAD = 2ccafce "Fix T-001 guardrail and idempotency follow-ups"` and the working tree was clean — i.e., the implementation **and** all P2 fixes/hygiene are committed. But `PROJECT_STATE.md` / `CURRENT_TASK.md` / `HANDOFF.md` still said "implementation committed at 653245b; P2-fix/hygiene **uncommitted**." That is the **third** time these git-state lines have gone stale between turns. Corrected in this audit.

Accurate current state: `HEAD = 2ccafce`; the only working-tree delta is `out/audit_log.csv` and `out/model_runs.csv`, **regenerated by this audit's prescribed `run.py` commands** (not a code/logic change). The deterministic snapshots `out/merchants_v1.csv` and `out/review_queue.csv` are **identical to HEAD** (determinism holds). Q13 — was inconsistent, now corrected.

## Secrets and Repository Hygiene Check

- **No secrets.** Every grep hit is a rule sentence, a guardrail detection pattern (`scripts/guardrail.py` literally lists `sk|pk|api[_-]?key|token|secret|bearer` as strings to *detect*), a vendor-doc citation, or the intentionally-fake `growth-team@gmail.com` guardrail fixture. No `AIza…`, no `sk-<key>`, no `xoxb/xoxp`, no real API keys. Q17 ✅.
- **No tracked bytecode/clutter.** `git ls-files` shows no `__pycache__`/`*.pyc`; `.gitignore` covers them. Q16 ✅.
- **`out/` (Q18):** tracked as a demo artifact. The committed version is one clean `--fresh` run (20 model_runs, 12 sent, 0 skipped). Its two **append-only logs are volatile** — any re-run dirties them (this audit's second run diverged them to 40/12/12), while the two snapshots stay commit-stable. Tracking volatile logs creates noisy diffs on every run. **Owner decision needed** (see Issues).

## Issues Found

| # | Issue | Class |
| --- | --- | --- |
| 1 | State docs (`PROJECT_STATE`/`CURRENT_TASK`/`HANDOFF`) stale on git commit state (said P2-fix uncommitted; actually committed at `2ccafce`). | **Already resolved** (corrected in this audit). |
| 2 | `out/` append-only logs (`audit_log.csv`, `model_runs.csv`) are volatile and tracked → noisy diffs; this audit's commands left them modified vs HEAD. | **Fix before next stage** (owner decision: restore + adopt a policy). |
| 3 | `docs/v1-slice-plan.md` lists only T1–T18; missing the P2 tests and the `run.py --fresh` vs preserve note. | **Fix before next stage** (docs-allowed task; not editable in this audit). |
| 4 | Recurring git-state staleness — 3rd occurrence; the written prevention did not stick. | **Fix before next stage** (process: make re-deriving git-state a required session-start step). |
| 5 | `PROJECT_STATE.md` "date note" says current date 2026-06-01 (now 2026-06-02). | **Non-blocking improvement.** |

No **Blockers**. No issue breaks an implemented T-001 guarantee.

## Corrections Made During This Audit

- Corrected the git commit-state wording in `PROJECT_STATE.md`, `CURRENT_TASK.md`, `HANDOFF.md` to reflect `HEAD = 2ccafce` and that T-001 (implementation + P2 fixes + hygiene) is committed.
- Recorded this audit in `docs/task-log.md` and a process note in `docs/implementation-journal.md`.
- **Not touched:** product code, tests, the CSV, integration files, and `out/` (the `out/` log delta from the prescribed commands is left for the owner — see Issue 2).

## What We Should Not Repeat

- **Stop writing the handoff/state git-line from assumption.** It has gone stale 3×, and the last journal entry already wrote the "derive it from `git log`/`git status`" prevention — yet it recurred, because intermediate turns edited the docs without re-deriving git state. A fourth "be careful" note is worthless. **Structural fix:** the session-start routine (RULES/CLAUDE already require `git status` on start) and `docs/checklists/prevent-repeat-checklist.md` must make "re-derive the PROJECT_STATE/HANDOFF git-state line from `git log -1` + `git status`" a *required, checked* step, not an intention.
- **Don't commit volatile generated logs without a policy** — decide once whether append-only logs belong in git.

## Ready to Close T-001?

**Yes, with minor follow-ups.** Falsifiable basis: tests 23/23; CSV untouched; offline; no secrets; no tracked clutter; send-gate + idempotency proven under test; all Codex findings fixed and committed. The entire remaining list is three doc/hygiene follow-ups (Issues 2–4), none of which touch the implemented guarantees.

## Recommended Next Stage

*(Recommendation only — not started. The task forbids a new planning loop, so this is not a spec.)*

Close T-001 (commit this audit + the doc corrections; make the `out/` log-policy call), do the small `v1-slice-plan.md` doc-sync, then take **one** narrow increment. **Proposed: T-002 = a small offline evaluation harness** (golden blocker/risk labels for the 20 rows + a guardrail/draft regression set + a metrics summary). Note this **deviates from the documented roadmap**: `docs/plan-reconciliation.md` §6 puts a live Gemini structured-draft step next. The case for evaluation-first is "evaluation before claims" (RULES §13 ordering) and that the stub guardrail's strength is unproven without an eval set — doing it offline de-risks the eventual Gemini swap (which would then be T-003, behind the existing schema/guardrails, with env-var secrets and an offline mock so tests stay offline). **This reorder should be ratified by the human owner** (a `docs/decision-log.md` entry, in a docs-allowed task) before T-002 begins — `decision-log.md` is not in this audit's editable set.
