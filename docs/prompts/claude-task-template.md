# Claude Task Template

Copy this to brief Claude Code on a task. Fill every section; delete none.

---

**Mandatory Startup Contract** (`RULES.md` §15) — do these first
- Read: `RULES.md`, `CLAUDE.md`, `PROJECT_STATE.md`, `CURRENT_TASK.md`, `HANDOFF.md`, `docs/enterprise-delivery-playbook.md` (+ task-specific files: …)
- Run: `git status` and `git log --oneline -8` (re-derive git state, never assume).

**Professional Process Applied** (show before meaningful work; one line is fine for trivial low-risk edits)
- task type:
- stage:
- risk level:
- lightweight or full mode:
- framework/principle/tool basis:
- source requirement:
- validation method:
- artifact policy (if relevant):
- documentation required:
- Codex review needed?:
- human approval needed?:

> Stop condition: if task type, risk level, validation method, or lightweight/full mode is unclear, **stop and ask the human owner** before acting.

**Relevant skills check**
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
