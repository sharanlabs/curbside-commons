# Codex Changed-Files Review Template

For reviewing a built slice. `/codex:review` reviews local git state natively (no focus text). If you need extra framing or specific concerns, use `/codex:adversarial-review` with the notes below. Prefer `--background` for anything larger than 1–2 files.

---

**Changed files**
- (run `git status` / `git diff --stat` and list them, or let `/codex:review` scope automatically)

**Review for:**
- Git diff review — read the actual diff, not just file names.
- Correctness — does it do what the task said?
- Edge cases — empty rows, bad values, re-runs, boundary scores.
- Tests — are the acceptance criteria actually covered? Any missing?
- Security / privacy — secrets, eligibility, data exposure, log contents.
- Duplicate-send risk — is the idempotency key real and enforced? Does a re-run double anything?
- Documentation — were task-log, journal, decision-log, and handoff updated per the definition of done?

**Process / playbook compliance (`RULES.md` §15 + `docs/enterprise-delivery-playbook.md`)**
- Did Claude follow the Enterprise Delivery Playbook + Mandatory Startup Contract for a meaningful task?
- Is the task classification correct, and is lightweight/full mode chosen for the right reason?
- Are source / framework / tool rationale sufficient; assumptions, risks, validation, and artifacts handled?
- Any **silent scope expansion**? Are handoff and **git state** accurate (re-derived, not assumed)?
- If the playbook/contract was skipped for a meaningful task → raise a **process finding**. (Don't penalize a trivial low-risk edit with a one-line process block.)

**Recommendation**
- A clear **ship / no-ship** call, with the must-fix items separated from the nice-to-haves.
