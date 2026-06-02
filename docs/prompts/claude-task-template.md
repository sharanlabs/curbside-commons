# Claude Task Template

Copy this to brief Claude Code on a task. Fill every section; delete none.

---

**Files to read first**
- `RULES.md`, `PROJECT_STATE.md`, `CURRENT_TASK.md`, `HANDOFF.md`, `docs/task-log.md`
- (task-specific files: …)

**Relevant skills check**
- Task type:
- Relevant skill(s):
- Why they apply:
- Any conflict with `RULES.md`? (RULES.md wins) :

**Task**
- (one or two sentences: what to accomplish)

**Allowed files**
- (explicit list — only these may be created/edited)

**Out-of-scope files**
- (explicit list — do not touch; always include the source CSV and any integration code)

**Acceptance criteria**
- (write as tests/checks where possible)

**Planning step**
- Produce a focused plan first. Send it to Codex for adversarial review (`/codex:adversarial-review`). Revise once. Get human approval before building.

**Stop condition**
- (when to stop and hand off — e.g., "stop after Stage 1 and update handoff"; also stop if blocked or unsure)

**Documentation updates required**
- `docs/task-log.md` (always); `docs/implementation-journal.md` (if meaningful); `docs/decision-log.md` (if scope/architecture changed); `HANDOFF.md` (always); `CURRENT_TASK.md` (if the active task changed).

**Codex review requirement**
- Changed-files review via `/codex:review` before commit, or an explicit written reason for deferring.
