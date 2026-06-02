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

## 2026-06-02 T-001 — Offline thin slice implementation

- What changed: Implemented the V1 offline pipeline (`scripts/config.py`, `scripts/guardrail.py`, `scripts/pipeline.py`, `scripts/run.py`), tests `tests/test_t001.py` (T1–T18, all passing), fixtures, and generated `out/` artifacts. Stdlib only; no network, no AI call, no integrations; source CSV read-only (hash-verified unchanged).
- Why it changed: human GO on the revised T-001 plan.
- Challenges / failures that appeared (caught by the tests):
  1. **risk_level enum mismatch.** Source CSV uses `Low Risk`/`Medium Risk`/`High Risk`; the data-dictionary enum is `Low`/`Medium`/`High`. The pipeline failed validation on row 1 until normalization stripped `" Risk"`.
  2. **Guardrail regex bug — `%\b`.** `unsupported_metric` used `\b\d+\s?%\b`; `\b` after `%` can't match before a space ("30% more"), so the category never fired. Fixed to `\b\d+\s?%` (still context-bound).
  3. **Guardrail regex bug — trailing `\b` on inflected verbs.** `false_impact_claim` used `\b(guarantee|endorses|…)\b`, which fails on "guarantee**s**" (s is a word char). Fixed to `(guarantee[sd]?|endorse[sd]?|recommend[sd]?|…)`.
- How diagnosed: T16 surfaced (1); T18 (under-flag coverage) surfaced (2) and (3) — exactly the test Codex asked for. Verified (2)/(3) with a one-off `re.search` probe before fixing.
- Options considered: loosen the tests (rejected — per RULES/advisor, fix the logic) vs. fix the code (chosen).
- Final fix: as above. Re-ran the full suite → 18/18 pass; canonical `out/` shows 12 simulated_sent, 8 High held, 0 rejected, source unchanged.
- Prevention: T18 now permanently guards every guardrail category against under-flagging; T16 guards the row schema/enum.
- **Doc-sync needed (out of scope this task — data dictionary not in allowed files):** `docs/v1-data-dictionary.md` should be updated in a docs-allowed task to (a) note the source `… Risk` → enum normalization in §1/§3, and (b) carry the corrected §9 regex for `unsupported_metric` and `false_impact_claim`. The code matches the documented *intent*; the doc has the same two regex typos. Flagged for the next Codex review.
- Files changed: see the 2026-06-02 task-log entry.
- Reviewer notes: ready for `/codex:review` of the changed files.
- Human decision: GO was given; commit is still the human owner's call (not committed).

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
