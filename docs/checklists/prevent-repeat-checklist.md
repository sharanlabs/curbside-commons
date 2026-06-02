# Prevent-Repeat Checklist

Run this before closing any task that hit a problem. The point is simple: a failure should never cost us twice. If a box can't be checked, say why in the task entry.

- [ ] Did anything fail during this task?
- [ ] Was the failure documented? (`docs/implementation-journal.md`)
- [ ] Was the root cause identified — not just the symptom?
- [ ] Was the fix verified? (test run, check, or observed behavior)
- [ ] Was a test added, if practical?
- [ ] Was a rule updated, if the issue was process-related? (`RULES.md`)
- [ ] Was a data validation added, if the issue was data-related?
- [ ] Was a guardrail added, if the issue was AI-output-related?
- [ ] Was the handoff updated so the next session does not repeat it? (`HANDOFF.md`)
- [ ] Was the implementation journal updated? (`docs/implementation-journal.md`)

If the issue changed scope or architecture, also log it in `docs/decision-log.md`.

## Playbook / process checks (every meaningful task)

From `docs/enterprise-delivery-playbook.md`. Keep this lightweight — for low-risk offline work most answers are one word.

- [ ] Did we run the **Mandatory Startup Contract** (`RULES.md` §15 — read the startup files + playbook) and show a **Professional Process Applied** block (proportional to risk) before meaningful work?
- [ ] Did we **re-derive Git state** from `git status` and `git log --oneline -8` (never from memory)?
- [ ] Did we **classify task type and risk level**?
- [ ] Did we use **lightweight or full mode** appropriately for that risk?
- [ ] Did we **record the source basis** when the task needed it (and mark UNVERIFIED otherwise)?
- [ ] Did we **explain why the selected approach fits** (and note alternatives considered)?
- [ ] Did we **classify generated artifacts** where relevant (commit / regenerate / ignore / examples / internal)?
- [ ] Did we **check model/API/tool freshness** where the choice matters?
- [ ] Did we **define stage-closure criteria** before claiming a stage closed?
- [ ] Did we **capture reusable lessons or blind spots** (without inventing a new permanent file)?
- [ ] Did we **avoid adding a new standing log** unnecessarily?
