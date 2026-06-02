# Implementation Journal

The engineering record. Every **meaningful** task gets an entry: meaningful decisions, failures, tradeoffs, and corrections.

- Small edits → `docs/task-log.md` instead.
- Major architecture decisions → also `docs/decision-log.md`.

Newest entries on top.

## Entry template

```
## [YYYY-MM-DD] [Task ID] — [short title]

- What changed:
- Why it changed:
- Challenge or failure that appeared:
- Why it happened:
- How it was diagnosed:
- Options considered:
- Final fix:
- Why this fix:
- How it was implemented:
- How it was verified:
- Prevention step for the future:
- Files changed:
- Reviewer notes (Codex / human):
- Human decision:
```

---

## 2026-06-01 OS-SETUP — Project operating system

- What changed: Created the project's operating-system files (rules, role files, continuity/handoff, dual-model workflow, narrative, journals/logs, checklist, prompt templates, first-pass visuals).
- Why it changed: Work spans multiple tools and accounts (Claude account 1/2, Claude CLI, Codex) plus a human owner. Without repo-resident rules and handoff, each session re-derived context and re-received instructions. The fix is to make the repo the source of truth.
- Challenge or failure that appeared: The dual-model doc had to cite specific Codex plugin commands, but documenting platform behavior from memory would violate the new source-verification rule.
- Why it happened: Command names and flags are easy to misremember and change between plugin versions.
- How it was diagnosed: Inspected the installed plugin command definitions directly.
- Options considered: (a) document from memory; (b) mark everything UNVERIFIED; (c) read the installed command files and cite them.
- Final fix: Read `~/.claude/plugins/cache/openai-codex/codex/1.0.4/commands/` and documented the verified command surface with a cited source and version.
- Why this fix: It satisfies the source-verification rule and gives the next session accurate commands.
- How it was implemented: Wrote `docs/dual-model-workflow.md` with a verified command table; cross-referenced from `CODEX.md`.
- How it was verified: Command names, flags, and the review-only-vs-edits distinction were taken verbatim from the installed command files.
- Prevention step for the future: Re-verify the command table after any Codex plugin update; keep the version + path citation current.
- Files changed: see the OS-SETUP entry in `docs/task-log.md`.
- Reviewer notes (Codex / human): Codex review of these files is optional and may be deferred (docs-only, no product code).
- Human decision: Pending — the human owner decides GO / NO-GO on the build (`docs/plan-reconciliation.md`).
