# Wave 2 lane contract (2026-10-31) — every lane reads this first

**Plain English:** you are one of several builders working at the same time on separate copies of this repo. This page is the set of rules that lets you work fast without stepping on anyone else, and lets the lead pick up your work if you stop mid-way.

You are one build lane of the Menu Integrity Crew Wave 2, running as a fresh-context subagent in a git worktree under `.worktrees/<lane>/` on branch `wave2/<lane>`. The orchestrator (Fable 5.1, main session, 2026-10-31 overnight run) reviews your diff and merges; you never touch `main`.

## 0 · Startup, in order, before any edit

1. `cd` into your worktree. `git status --short` and `git log --oneline -3` — expect a clean tree at `cd0d347` (or your lane's own later commit, if you are resuming).
2. Read `RULES.md` (it wins over everything, including this page), then the plan sections your packet names in `docs/plan-menu-integrity-crew-2026-10-09.md`, then `docs/plan-wave2-gap-sheet-2026-10-12.md`, then `docs/reviews/codex-2026-10-12-plan-xcheck.md` §§ 2–4 (binding amendments, adopted in the 2026-10-14 decision-log row), then that decision-log row (`docs/decision-log.md`, "2026-10-14 — Codex cross-check applied").
3. If you write any document a reader sees: `docs/documentation-standard.md`. If you touch any page or stylesheet: `DESIGN.md`.
4. Do **not** read `CURRENT_TASK.md`, `HANDOFF.md`, `PROJECT_STATE.md` in full — the orchestrator holds that context. Your packet is complete.

## 1 · Worktree rules (break one and you break every other lane)

- `node_modules` in your worktree is a **symlink to main's install**. Never run `npm install`, `npm ci`, `npm uninstall`, `npm update`, `npx playwright install`, or anything else that writes `node_modules`. If your packet lets you change `package.json`, edit it by hand; the orchestrator regenerates the lockfile on `main` at merge.
- Write only inside your own worktree. Reading files in `main`'s working tree or another worktree is fine; editing them is not.
- Do not run `npm run build` or `next build` in the worktree unless your packet names it. `node scripts/build-offline.mjs` is allowed when named.
- No background processes. Every command runs in the foreground and its exit code is captured for the return packet.

## 2 · Build discipline (the repo's standing rules, unchanged)

- **Tests first.** Prove each new test bites with a recorded mutation: the mutation, its red, and the restore go in the test file header **and** in your return packet.
- `lib/verifier-core/**` is untouched unless your packet names a file in it.
- **Every figure a reader sees is derived by code** and held equal to an engine run by a test. Never type one.
- **Production register:** no "sample" / "demo" / "example" captioning on anything a reader sees ("synthetic", "bundled", "constructed" are the words).
- **RULES §4 on every sentence:** synthetic data always; platform-shaped inputs are "shaped like the public integration docs, not from the platform"; no affiliation, endorsement, access, partnership or real-impact claim; platform names are nominative references to public documentation only.
- Freeze-locked fixtures regenerate only through their generator; a golden that changes is explained **line by line** in the return packet.
- **Allowed files are a hard boundary.** If the work needs a file outside them, stop, write the need under OPEN in your packet, commit, return.

## 3 · Resumability (the subagent pool has died twice on usage limits; assume it can again)

- Commit WIP on your branch at **every red → green checkpoint**: `git add -A && git commit -m "wip(<lane>): <what turned green>"`. Small and frequent. Never amend, never rebase, never force.
- Before returning, write your return packet to **`docs/returns/2026-10-31-<lane>.md`** and commit it. Sections (plan § 13): `SLICE` · `GIT` (`git status --short`, `git log --oneline -6`) · `CHANGED` (each file, one line) · `TESTS` (count before → after, every new test accounted, the mutation that proved each red) · `COMMANDS` (each with exit code) · `DEVIATIONS` (anything outside the packet, with reason) · `OPEN` · `NOT DONE` (explicit) · `MODEL` (which model you are; two lines on how your work would differ from an Opus 5.5 build, if at all: edge cases checked, judgment calls, stops honoured).
- Do **not** edit `docs/task-log.md`, `CURRENT_TASK.md`, `HANDOFF.md`, `PROJECT_STATE.md`, `docs/decision-log.md`, or the plan's § 12 markers — the orchestrator writes those from your packet at merge.
- On a usage-limit or tool failure you cannot recover from: commit what exists, write the packet with `NOT DONE` filled honestly, return.

## 4 · Verify before returning (exit codes in the packet)

`npx tsc --noEmit` · `npx eslint . --max-warnings=0` · `npx vitest run` (the full suite; count before → after, fully accounted) · the suites your packet names · `npx vitest run evals/packs/honesty-c10.test.ts` whenever your packet mentions C10 or you created any file a reader sees. Baseline on `cd0d347`: tsc 0 · eslint 0 · vitest **1821 passed + 8 skipped** (135 files).

## 5 · Hard stops (never, on any lane)

No commit to `main` · no push · no deploy · no change to `vercel.json` `git.deploymentEnabled` · no live model call (no key is present; `ENABLE_LIVE_AI` stays unset) · no send of anything · no new dependency · no change to a `DESIGN.md` owner-fixed decision · no reuse of an exposed gold split · no edit to the prompt pins in `evals/crew/l1-*-lock.test.ts` · no edit to `evals/crew/crew-composition-lock.test.ts`.

## 6 · Stop and return with `OPEN` filled when

a golden must change for a reason you cannot explain line by line · the suite count moves by more than your new tests · a dependency change looks required · a credential is needed · two readings of your slice diverge materially · roughly ninety minutes pass without a green checkpoint (`date` at start and at each checkpoint).

## 7 · Codex

Codex review is **deferred this run** (owner word 2026-10-31: usage limits; "skip codex, log it"). Do not call Codex. Every owed gate is logged in the decision-log row of 2026-10-31 and runs when the owner's limits reset.
