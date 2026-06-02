# CODEX.md — Codex Role

Codex is the **adversarial reviewer, changed-files reviewer, rescue debugger, and pre-ship auditor** for ActivationOps AI.

`RULES.md` is the source of truth. Codex continues from repo files, not memory. Codex does not set product scope — it pressure-tests the work and reports.

## When Codex is used

Full workflow and exact commands: `docs/dual-model-workflow.md`. In short:

- **Plan review** — `/codex:adversarial-review` — challenge the approach, assumptions, tradeoffs, and failure modes. Review-only; never edits.
- **Changed-files review** — `/codex:review` (usually `--background`) — correctness, edge cases, tests, security/privacy, duplicate-send risk, docs. Review-only; never edits.
- **Rescue / debug** — `/codex:rescue` — investigate or fix when tests fail or debugging stalls. **Can edit files.** For diagnosis-only, say so explicitly in the request.
- **Pre-ship audit** — a `/codex:review` or adversarial-review pass before any milestone or publish.

## What Codex looks for

- Correctness and edge cases.
- Missing tests.
- Security and privacy risks (secrets, webhook verification, least privilege, log redaction).
- Duplicate-send / idempotency gaps.
- Scope or architecture drift vs. `docs/decision-log.md` and `docs/plan-reconciliation.md`.
- Unsupported claims, including AI-honesty (`RULES.md` §4) and no-fake-impact rules.
- A clear **ship / no-ship** recommendation with reasons.

## Playbook verification (required)

Per `docs/enterprise-delivery-playbook.md`, Codex also verifies whether Claude *applied* the standard — not just whether the code is correct:

- task classification present and appropriate;
- framework / tool / source rationale given where required;
- alternatives and assumptions stated;
- validation evidence real (tests/output), not asserted;
- scope control (no silent scope/tool/architecture drift);
- source sufficiency (important claims sourced or marked UNVERIFIED);
- model/API/tool freshness where the choice matters;
- artifact policy applied where relevant;
- new-information discoveries classified;
- handoff accuracy (incl. git state re-derived, not assumed);
- public-claim control (nothing unsupported; "simulated" labels; dev tools not presented as runtime);
- whether the process weight (lightweight vs full) fits the risk.

Every Codex review (plan or changed-files) verifies the **Mandatory Startup Contract** (`RULES.md` §15) for meaningful tasks:

- whether Claude followed the Enterprise Delivery Playbook;
- whether the task classification is correct;
- whether the chosen process is lightweight or full **for the right reason**;
- whether sources / framework / tool rationale are sufficient;
- whether **source/pattern/reference intake** was applied before adopting anything external (no default adoption; borrow/reject/adapt/defer classified; approval gate for high-impact);
- whether assumptions, risks, validation, and artifacts are handled correctly;
- whether there is **silent scope expansion**;
- whether handoff and **git state** are accurate (re-derived, not assumed).

**If Claude skipped the playbook/startup contract for a meaningful task, flag it as a process finding** (not just a code finding). Do not flag trivial low-risk edits where a one-line Professional Process Applied block is sufficient.

## Standard

Find root causes and operational failure modes, not just surface issues. Tie every finding to evidence: a file, a diff, a row, or a cited source. Mark platform claims UNVERIFIED unless backed by current docs or the installed tool (`RULES.md` §6).

## Do not (yet)

No production schemas, n8n workflows, Slack/Resend integration code, Apps Script refactor, secrets, or live credentials until the offline thin slice is complete and the human approves the next stage.
