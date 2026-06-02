# Plan Reconciliation — Final Pre-Build Decision

Date: 2026-06-01
Author: Claude Code (reconciliation; review only)
Status: **This is the last planning document. After it is decided GO/NO-GO, the review/planning phase is closed.**

This reconciles the Codex reviews (initial + open-source validation) with the Claude governance review into one buildable decision. It is not a fifth review. Where the prior docs analyze, this one decides.

## The core tension, stated plainly

Codex and Claude do not actually disagree about *what* V1 is. They disagree about *sequencing and volume*: Codex's instinct is to write the safety controls down as documents first and gate the build behind them; Claude's is to build the thin slice and express those same controls as code and tests. The reconciliation: **Codex is right about which controls matter; Claude is right about how to sequence them and how little to document.** Accept the controls, reject the doc-gating.

---

## 1. What Codex and Claude agree on

| # | Agreement | Confidence |
|---|-----------|------------|
| 1 | The idea is viable and worth doing as a staged dummy-data simulation. | High |
| 2 | The 20-row CSV cannot support the enterprise workflow as-is (no stable ID, timestamps, contact/consent, owner/review/outreach/outcome state, idempotency, prompt/model metadata, audit). | High |
| 3 | Risk score is deterministic: `2·days + 3·last_login + 10·(5−steps)`; distribution 10 Low / 2 Medium / 8 High (independently re-verified). | High |
| 4 | Correct build order: data → deterministic rules → structured AI draft → human review → simulated send → audit. | High |
| 5 | No live Supabase / n8n / Slack / Resend / Gemini; no real credentials; no real merchant data; no fake business-impact claims — until far later. | High |
| 6 | Non-negotiable safety controls: HITL before any external action, structured JSON + deterministic validation, forbidden-claims check, idempotency / no duplicate send, prompt/model versioning, audit log. | High |
| 7 | "Agentic" overreaches for V1; V1 is a human-led deterministic workflow with bounded LLM drafting. | High |

## 2. What they disagree on

| Topic | Codex position | Claude position | Resolution |
|-------|----------------|-----------------|------------|
| Sequencing | Write governance + acceptance-criteria docs first, as a gate before code (~7 prerequisite docs). | Build the thin slice; express acceptance criteria as tests inline; document as byproduct. | **Claude.** Build-first. |
| V1 data shape | 14-table normalized model (`data-audit.md`). | One richer CSV is enough to start (`product-brief.md` allows it). | **Claude.** One entity file + append-only event logs. |
| Readiness metric | Single blended score (3→4/10). | Retire it; it rose without build progress. | **Claude.** Retired. |
| Where rules live | Prompt-supplied rules; missing "mandatory files" logged as blockers. | Rules must live in the repo; those files are prompt-invented. | **Claude.** One repo rules file. |
| The meta-risk | Not surfaced (Codex was inside the loop). | Central: governance outgrew product; planning has no exit. | **Claude.** This doc closes the loop. |

Note: these are differences of *judgment and emphasis*, not factual conflicts. Codex was not wrong on the facts; it missed the process risk and over-indexed on documentation.

## 3. Recommendations accepted

- Fix the duplicate header → `merchant_name`, `merchant_category`. (Codex)
- Add the required field set to V1 records: stable `merchant_id`; absolute `signup_at` / `last_login_at` (derived from the relative day counts against a fixed as-of date); `primary_contact_email` (safe fake domain); `email_opt_in` / suppression; owner; blocker code + next action; review/approval state; outreach state + cooldown + idempotency key; prompt/model/run metadata; simulated send + outcome; audit fields. (Codex — applied to the slice, not a 14-table schema.)
- Document the risk formula + thresholds + step/blocker taxonomy explicitly (cheap, removes ambiguity). The canonical onboarding step order is already recoverable from the existing nudge messages: **1 business verification → 2 menu upload → 3 photos → 4 business hours → 5 bank verification → final verification.** (Codex gap closed.)
- Deterministic risk/blocker baseline before any model call; structured JSON output + deterministic validation; forbidden-claims validator; idempotency key `merchant_id + blocker_code + template_id + cooldown_window`; a `model_runs` ledger. (Codex)
- Defer all live integrations; drop "agentic" from V1 naming. (Both)
- Build the thin slice now; acceptance criteria as tests inline; retire the blended readiness score; put canonical rules in the repo; stop re-logging prompt-invented missing files. (Claude)

## 4. Recommendations rejected

- **Reject the 7-document prerequisite gate** (`v1-dataset.md` as prose acceptance criteria, `state-model.md`, `workflow-states.md`, `outreach-policy.md`, `v1-evaluation-plan.md`, `session-compliance-template.md`, plus `ALWAYS_READ.md`). The *content* is largely right; the *docs-first-as-a-gate* format is process theater. Fold it into code, tests, one rules file, and one data dictionary.
- **Reject the 14-table normalized schema for V1.** Over-modeled for 20 rows. It is a roadmap item, not V1.
- **Reject creating `ALWAYS_READ.md`, `session-compliance-template.md`, and a retroactive `codex-compliance-audit.md` as blocking prerequisites.** Prompt-invented; not needed to build. Their absence is no longer a blocker.
- **Reject any live external send / Slack / n8n / Supabase / real Gemini call in V1.** (Both agreed; stated here as a hard scope boundary.)
- **Reject the pure "tests, zero docs" extreme** implied by an aggressive reading of the Claude review. A one-page rules file and a one-page data dictionary are genuinely useful and are kept. The rejection is of *volume and gating*, not of all documentation.

## 5. Final V1 scope

A single **runnable, fully offline** code slice (no external services, no credentials; any model call is **stubbed/mocked**). It must:

1. Ingest the 20-row CSV, fix the duplicate header, and write a normalized **`merchants_v1.csv`** (new file — the original CSV is not mutated) carrying the required fields, with missing values seeded as clearly-labeled synthetic data (fake `@example.com` contacts, IDs, timestamps derived from an agreed as-of date).
2. Compute risk deterministically (documented formula + thresholds + reason codes).
3. Map blocker + next-best-action deterministically from `steps_completed` using the step taxonomy above.
4. Emit a **review queue**: high-risk and ineligible/suppressed merchants are flagged for human review; the output marks which require approval before any (simulated) send.
5. Generate **one** structured outreach draft as schema-constrained JSON (`risk_explanation`, `blocker_summary`, `next_best_action`, `draft_subject`, `draft_body`, `guardrail_flags`) via a **stubbed** generator (deterministic/templated, or a mocked Gemini interface — no live key needed to pass). Run a **forbidden-claims validator** (no revenue/earnings guarantees, no unsupported metrics) and a "draft facts must match merchant state" check; reject on violation.
6. Record a **simulated send** (no real email) with an idempotency key, plus an **audit log** and a **`model_runs`** entry (prompt_version, model_version, inputs, outputs, validation result).
7. Ship with **tests = the acceptance criteria**: header fixed; every row has a stable ID; recomputed risk matches; re-running produces **no duplicate send**; the forbidden-claims validator catches a planted bad draft; an ineligible/suppressed merchant is **not** sent.

Storage shape: **one entity file (`merchants_v1.csv`) + append-only event logs** (`audit_log`, `model_runs`, `send_log`). Not 14 normalized tables.

Definition of done: all tests green; runs end-to-end offline; produces a review queue + one validated draft + audit/model-run entries; original CSV untouched.

## 6. Deferred to roadmap

14-table normalized schema; Supabase Postgres + RLS + migrations; n8n orchestration + error workflows; Slack approval callbacks (signature verify, 3s ack, expiry); Resend live send + webhook ingestion (svix-id dedupe, idempotency header, suppression sync); live Gemini (replace the stub); outcome-learning loop; Google Sheets dashboard/eval visibility; larger eval set + golden labels + regression suite; any autonomous/agentic multi-step tool use.

## 7. Files / rules truly required before implementation

Minimal and final. Required:

1. **`git init`** — the project claims "auditable" but has no history; initialize so changes are reviewable. (One command.)
2. **`RULES.md` in the repo (~1 page)** — the canonical non-negotiables, moved out of chat prompts: dummy data only; no real credentials; no live external send in V1; HITL before any external action; structured output + deterministic validation + forbidden-claims check; idempotency / no duplicate send; prompt/model versioning + audit log; no fake business-impact claims; "simulated" label on all metrics. This supersedes scattered prompt rules.
3. **`docs/v1-data-dictionary.md` (~1 page) OR equivalent in-code constants** — V1 field list, risk formula + thresholds, step/blocker taxonomy, idempotency-key definition. Pick one location; do not write both.
4. **An agreed as-of date** for deriving `signup_at` / `last_login_at` from the relative day counts (proposed: 2026-06-01).

Explicitly **NOT** required (excluded from the gate): `ALWAYS_READ.md`, `session-compliance-template.md`, retroactive `codex-compliance-audit.md`, `state-model.md`, `workflow-states.md`, `outreach-policy.md`, `v1-evaluation-plan.md`, and any prose acceptance-criteria doc. Their useful content lives in `RULES.md`, the data dictionary, and the inline tests.

## 8. Exact planning exit condition

**Planning ends the moment the user decides GO or NO-GO on this document.** Single, checkable, no additional artifacts required to exit.

- **GO** → the review/planning phase is closed. No further review/validation/audit/governance documents may be written. The next session produces code. The four items in §7 are the opening steps of that build session, not a separate planning gate.
- **NO-GO** → the project is declared a docs-only judgment artifact; the loop is closed by stating that in the README.

Either outcome terminates planning. The phase may not be reopened to write more review docs.

## 9. First implementation task after planning (on GO)

**Task 1:** `git init`; add `RULES.md` and `docs/v1-data-dictionary.md`; then write the **ingest + normalize** step that reads the 20-row CSV, fixes the header, seeds the required synthetic fields against the as-of date, and writes `merchants_v1.csv`. Commit.

Then proceed in small commits:
- **Task 2:** deterministic risk + blocker/next-action + review queue, with tests.
- **Task 3:** stubbed structured-draft generation + forbidden-claims validator + eligibility/suppression check, with tests.
- **Task 4:** simulated send + idempotency + audit/`model_runs` log, with a re-run test proving no duplicate send.

Stop at the V1 definition of done in §5. Do not start Supabase, n8n, Slack, Resend, or live Gemini.

---

## Bottom line

Codex mapped the controls; Claude flagged that documenting them had become a substitute for building them. The reconciled decision keeps every control that matters, deletes the documentation gate, and sets a one-line exit condition. The correct next action is a **GO**, followed by code — not another document.
