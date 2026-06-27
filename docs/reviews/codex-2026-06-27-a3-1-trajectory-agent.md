# Codex cross-model review — A3-1 (trajectory `agent` attribution, R-A3-6)

**Date:** 2026-06-27 · **Reviewer:** Codex (config default `gpt-5.5` @ `xhigh`), read-only, via `~/claude-os/bin/codex-guarded` · **Target:** the uncommitted A3-1 changed-files diff (`lib/agents/loop/trajectory.ts`, `lib/agents/loop/orchestrator.ts`, `evals/agent-loop.test.ts`) · **Reconciliation:** primary-model-final (Opus 4.8).

A3-1 adds an `agent` attribution to `TrajectoryStep` (R-A3-6) so a future "watch the four agents reason" view can show which specialist produced each step. The design decision under review is **tool-until-earned** (AM-2 "no agent costumes on pipeline stages" + R-A3-1): a step earns a role label only in the slice that wires that agent's LLM AND clears its anti-theater seam-eval; until then it is `tool`.

## Verdict: **BLOCK → reconciled** (2 findings — 1 P1 + 1 P2 — both ACCEPTED + fixed + re-verified green + test-locked; 0 P0)

The BLOCK challenged **no** part of the design — both findings were *applications* of the tool-until-earned rule the slice introduces, to a sub-branch the maker missed. The gate earned its keep on the exact honesty axis the slice is about.

## Findings — primary-model-final disposition

**Finding 1 — P1 — `lib/agents/loop/orchestrator.ts` (the `seedDraft` branch).** The iteration-0 `seedDraft` branch records `agent: "drafter"` while it is a **fed-in fixture** (`modelMode: "REPLAY"`, `toolCalls: [{ tool: "seed_draft" }]`, no generative call). That is not a Drafter-produced step — it is a deterministic/test-fixture feed (R-LOOP-10 seeding). Labeling it `drafter` is the exact costume AM-2 forbids.
- **Disposition: ACCEPTED + FIXED.** Correct under the slice's own rule — only a genuinely-*generated* draft/redraft earns `drafter`. The seed branch now records **`agent: "tool"`** with a comment citing the rule. The generated draft/redraft steps stay `drafter` (unchanged). I missed the seed sub-branch when attributing the 6 `record()` sites; Codex is right.

**Finding 2 — P2 — `evals/agent-loop.test.ts` (R-A3-6 test branch-incompleteness).** The R-A3-6 test is not vacuous (it locks the *generated* sequence `["tool","drafter","tool","tool","drafter","tool","tool"]` and would catch a plan/verify/reflect/route mislabel) — but it exercises only the `draftGenerate` path, never the `seedDraft` branch, i.e. exactly the branch F1 mislabeled. So the test could not have caught F1.
- **Disposition: ACCEPTED + FIXED.** Added a **seeded-trajectory test** that drives the `seedDraft` branch (fed-in planted draft → injected judge flags it → generated clean redraft → converge) and asserts: the iteration-0 step `toolCalls[0].tool === "seed_draft"`, `modelMode === "REPLAY"`, **`agent === "tool"`**; the generated `redraft` step `agent === "drafter"`; and `strategist`/`router`/`domain_critic` remain **absent**. F1's fix is now red-green-lockable (revert F1 → this test fails).

## Codex clean confirmations (not findings)

- `agent` is **required** on `TrajectoryStep` (`lib/agents/loop/trajectory.ts`), and `record(step: TrajectoryStep)` enforces presence — so `tsc` flags any un-attributed `record()` site.
- `plan`/`verify`/`reflect`/`route` are correctly `tool`; the normal Groq **generated** draft/redraft as `drafter` is honest.
- **No diff under `lib/core`, the gold/oracle files, or frozen snapshots** (the untouched-invariant holds; differential stays 20/20).
- `npx tsc --noEmit` passed in the sandbox. (Full `npm run typecheck` could not run read-only — it writes `tsconfig.tsbuildinfo` — but the maker-side `npm run verify` ran it green; see below.)

## Verification after the fixes (raw, maker-side)

- **`npm run verify`** → `Test Files 22 passed | 4 skipped (26)`; `Tests 257 passed | 4 skipped (261)` (was 256+4 before F2; the seeded test is the +1); typecheck clean; lint clean; `next build` compiled successfully + prerendered all routes. The agent-loop file alone: `12 passed`.
- `lib/core` + oracle + gold + frozen snapshots **UNTOUCHED** (`git diff --name-only` = only the 3 A3-1 files).

## Net + open obligation

**A3-1 Codex gate = RAN (BLOCK) → both findings reconciled primary-model-final → fixed + re-verified + test-locked → CONFIRMING re-pass SHIP (2026-06-27).** The confirming re-pass on the FIXED diff (read-only, via `codex-guarded`) returned **SHIP, "Confirmed clean"** — all 5 points verified: (1) P1 fixed (seed branch `agent:"tool"` @ `orchestrator.ts:289`; generated draft/redraft `agent:"drafter"` @ `:310`); (2) the honesty rule holds across ALL `record()` sites (`tool` @ `:258/:289/:355/:379/:492`; only the generated drafter @ `:310`) — no unearned agent recorded; (3) the seeded test is non-vacuous (drives `seedDraft`, asserts seed→`tool`/`REPLAY`, redraft→`drafter`); (4) the served-snapshot test locks the agent sequence; (5) no new issue — recommend-not-decide intact via `simulate_send` + `assertEligibilityUntouched`. **The A3-1 Codex gate is FULLY DISCHARGED.** `lib/core`+oracle+gold+frozen snapshots UNTOUCHED. UNCOMMITTED; commit owner-gated.

## Appendix — Codex verdict, verbatim

```
VERDICT: BLOCK

1. [P1] Seeded draft steps are mislabeled as `drafter`.
In orchestrator.ts, the `seedDraft` branch copies a fed-in draft, sets `draftMode = "REPLAY"`,
but records `agent: "drafter"` with `tool: "seed_draft"`. That is a deterministic/test-fixture
feed, not a Drafter-produced step. Fix: make this branch `agent: "tool"`; keep generated
draft/redraft steps as `drafter`.

2. [P2] The R-A3-6 test is not vacuous, but it is branch-incomplete.
The test locks the normal generated sequence and would catch plan/verify/reflect/route mislabels
in that path. It does not exercise `seedDraft`, the exact branch currently mislabeled. Fix: add a
seeded trajectory test asserting `seed_draft` is `tool`, the later generated `redraft` is
`drafter`, and `strategist`/`router`/`domain_critic` remain absent.

Clean confirmations: `agent` is required on `TrajectoryStep`, and `record(step: TrajectoryStep)`
enforces it. Plan/verify/reflect/route are `tool`; normal Groq draft/redraft as `drafter` is
honest. No diff under `lib/core`, gold/oracle files, or frozen snapshots. `npx tsc --noEmit`
passed; full `npm run typecheck` could not run in this read-only sandbox because it tries to
write `tsconfig.tsbuildinfo`.
```
