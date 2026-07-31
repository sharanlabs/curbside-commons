# State-doc archive — 2026-07-31 (session 40)

The closed-session narrative from the four startup-contract state docs, moved here
byte-exact. **Nothing was edited, summarised, or deleted.**

## What moved, and what it cost to read before

| Live doc | Before | After | Archived to |
|---|---:|---:|---|
| `PROJECT_STATE.md` | 307,284 B | 3,732 B | `PROJECT_STATE-sessions-01-37.md` |
| `CURRENT_TASK.md` | 170,991 B | 5,619 B | `CURRENT_TASK-sessions-01-37.md` |
| `HANDOFF.md` | 421,747 B | 14,992 B | `HANDOFF-sessions-01-37.md` |
| `docs/task-log.md` | 352,062 B | 34,790 B | `task-log-2026-06-02--2026-07-15.md` |
| **total** | **1,252,084 B** | **59,133 B** | **−95%** |

The "after" column is measured **at the moment of the split**. The live docs grow
again as each session appends its block — that is normal and expected; the point
of the split was to reset the floor, not to freeze it. What must not happen is
the floor never being reset again. With session 40's own entries added, the full
`AGENTS.md`:7 read list (these four **plus `RULES.md`**) measures **~86 KB**.

### Second pass — the other two `RULES.md` §10 recording surfaces

| Live doc | Before | After | Archived to |
|---|---:|---:|---|
| `docs/decision-log.md` | 373,019 B | 117,655 B | `decision-log-pre-2026-07-21.md` |
| `docs/implementation-journal.md` | 146,837 B | 79,070 B | `implementation-journal-pre-2026-07-08.md` |
| **total** | **519,856 B** | **196,725 B** | **−62%** |

Neither is in the `AGENTS.md`:7 startup list, so neither caused the dead gate
runs — they were on the same trajectory. Both are appended **out of chronological
order**, so the split parses the date on each row/entry rather than cutting by
line position; a positional cut would have mis-sorted them.

## Why

`docs/assessment-2026-07-30-estate-revaluation.md` finding 2. `AGENTS.md`:7 and
`RULES.md` §15 order **every** agent — Codex reviewers included — to read these
docs before doing anything. **Three cross-model gate runs died on that instruction**
(sessions 34, 36, 38); session 38's burned 20+ minutes at `xhigh` and returned a log
containing only the echoed prompt.

The instruction was the trigger. The volume was the cause, so the volume is what
moved. `RULES.md` §15 is deliberately **unchanged** — its read list is still
literally correct, and now it is cheap. Editing the constitution would have been a
scope change requiring the owner's sign-off; archiving is not.

## What was kept live

Each doc keeps its header plus the newest still-operative material:

- `PROJECT_STATE.md` — session 38 block
- `CURRENT_TASK.md` — sessions 38–39
- `HANDOFF.md` — the latest handoff + resume prompt, **and** the standing
  continuity procedures at the bottom (those are procedure, not history)
- `docs/task-log.md` — the five most recent entries

## Losslessness — proved, not asserted

The split was executed by script and verified **against `git show HEAD:`**, not
against the script's own bookkeeping:

```
live_kept_lines + archived_lines  ==  original file at HEAD
```

All four reconstruct exactly. The single difference is one blank markdown
separator line in `PROJECT_STATE.md` and `CURRENT_TASK.md`, absorbed where the
kept block met the archived one. **Zero narrative bytes lost.**

Provenance: the pre-archive originals are in git history at `858fb17` and earlier.

## How to read this

Read the archive for **provenance** — why a decision was made, what a prior
session measured, what was refuted. Do **not** read it as current state; the live
docs carry that.

Note that these files quote retired public wording verbatim — including the
"no network requests" claim session 38 corrected. That is historical record of a
defect being fixed, not a live claim. Nothing scans this directory: both honesty
suites (`evals/packs/honesty-c10.test.ts`, `fees-honesty-c10.test.ts`) walk
**explicit file lists**, never a recursive `docs/` glob. Verified before the move.
