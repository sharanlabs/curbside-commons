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
