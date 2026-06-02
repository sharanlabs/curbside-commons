# Codex Rescue Template

For `/codex:rescue` when tests fail or debugging stalls. **`/codex:rescue` can edit files.** Decide up front whether you want a fix or only a diagnosis, and say so explicitly.

---

**Task**
- (what is broken / what to investigate)

**Edit or diagnosis-only?**
- [ ] Codex may edit files to fix it.
- [ ] **Diagnosis only** — include this sentence verbatim in the request: "do not change anything yet, diagnose only."

**Failure context**
- What you expected vs. what happened.
- What you already tried.
- Relevant file(s) and the suspected area.

**Logs / tests**
- (paste the failing test output, stack trace, or error)

**Expected output**
- (a working fix? a ranked list of likely causes? a specific question answered?)

**Run in background?**
- [ ] Yes — add `--background`, then check `/codex:status` and read `/codex:result`. Record the job in `HANDOFF.md` or `docs/task-log.md`.
- [ ] No — run in the foreground.

Reminder: rescue output is a draft. Review it before accepting or committing (`RULES.md` §16–17).
