# Codex changed-files review — A3-5 (Router/Conductor agent + reflect seam, recommend-only)

> **✅ DISCHARGED 2026-06-28 (batched on the reset seat) — VERDICT SHIP; the 1 P2 (Router prompt "no injection surface" overclaim) was fixed (`{{MERCHANT}}` injection-cut on the unsupported-claim texts + regression) + confirmed primary-model-final. Canonical record: [codex-2026-06-28-a3-batch-confirm.md](codex-2026-06-28-a3-batch-confirm.md). The SEAT-BLOCKED / dated-obligation status below is now historical.**

**Date:** 2026-06-28 · **Reviewer:** Codex (config default `gpt-5.5` @ `xhigh`), read-only, via `~/claude-os/bin/codex-guarded` · **Target:** the uncommitted/just-committed A3-5 diff (2 modified + 2 new) · **Reconciliation:** primary-model-final (Opus 4.8).

## Status: SEAT-BLOCKED — DATED OBLIGATION (batched with the A3-4 round-3 re-confirm); proceeding TEST-VERIFIED

The Codex seat is **usage-limited** (raw error surfaced verbatim, twice, no retry per owner doctrine):

> `ERROR: You've hit your usage limit … try again at 7:25 PM.`

Per owner doctrine (surface raw · no retry/downgrade/switch — the seat is an owner action · **Codex-down ≠ gate-waived**), the A3-5 changed-files review is a **dated obligation (~7:25 PM ET)**, to be run **in one batch with the still-open A3-4 round-3 re-confirm** (`docs/reviews/codex-2026-06-28-a3-4-domain-critic.md`) when the seat resets.

## What ships (A3-5 — re-derive via `git diff`)

- **`lib/agents/router.ts` (NEW)** — the Router/Conductor:
  - `strongReflection(ctx)` — the STRONG deterministic reflection: reads BOTH critics, prioritizes faithfulness (gating) then surfaces the advisory domain dimensions in the same revision. It is the anti-theater FLOOR **and** the demotion fallback **and** a strict superset of the domain-blind `buildReflection` (mirrors `strongRecommend`).
  - `routerReflect(ctx, opts)` — the LLM Router on Groq `gpt-oss-120b` (DI/mock, $0 default): recommend-only (`route` clamped via `clampRouteToEnvelope`, never trusted), honest `FAILED_TO_FALLBACK`, prompt withholds the raw merchant_name (no injection surface), `signals` recomputed structurally from inputs (never the model's word).
  - `criticSignals(ctx)` — the structural coverage discriminator the eval grades.
- **`lib/agents/loop/orchestrator.ts` (MOD)** — added `RevisionPlan`/`RouterFn`/`CriticSignal` types + a `reflect?: RouterFn` seam (default = `defaultReflect`, the domain-blind A2 reflection — **no loop behavior change this slice**); exported `buildReflection` as the eval's RED baseline; the reflect step now calls the seam with a **defensive merchant clone** and records `plan.route`/`holdForHuman` ADVISORY (recommend-only — RECORDED, never wired). Reflect step stays `agent: "tool"` (label DEFERS).
- **`evals/router.test.ts` (NEW)** — the anti-theater eval (8 tests): RED `buildReflection` is domain-blind · GREEN `strongReflection` covers both critics (strict superset) · DEFER the mock Router ties `strongReflection` structurally · recommend-only clamp · honest fallback · deterministic default.
- **`evals/agent-loop.test.ts` (MOD)** — +2: the Router firewall (a reflect seam recommending "send anyway" on an ineligible merchant is RECORDED, never sent) + reflect-seam mutation-isolation (clone).

## Targets for the batched re-confirm (the load-bearing claims to probe)

1. **Recommend-only on the Router (THE crux):** does anything let `plan.route`/`holdForHuman` reach `outreachStatus`/eligibility/the send? (Design: the post-loop route flows ONLY through `simulate_send` + `assertEligibilityUntouched`; the reflect plan's route is recorded in the trajectory only.) Red-green proven: removing the reflect-call clone makes the mutation-isolation test trip `R-LOOP-1b violation`.
2. **The anti-theater DEFER is honest + structurally forced:** confirm the mock Router ties `strongReflection` on the structural axis (no manufactured close-reading to fake a tie OR a win); confirm the "OFFLINE the Router cannot earn — needs a cross-family Gemini judge ⇒ A3-7" reasoning is sound, not an excuse.
3. **The seam is real (non-vacuous):** `strongReflection` is a strict SUPERSET of `buildReflection` (same faithfulness text + the domain addendum), so "reading both critics matters" is provable structurally, not a reword.
4. **No behavior change this slice:** the orchestrator default stays `defaultReflect` (domain-blind buildReflection); all prior trajectory/phase/agent assertions hold (verify 295+5).
5. **Cross-family + tool-until-earned intact:** `router` stays ABSENT from the trajectory; the count correction is "1 earned (Drafter) + 3 deferred".

## Test-verified basis (the 2026-06-20 / alignfix precedent)

`npm run verify` exit 0 — **295 passed | 5 skipped** (+10 over A3-4); typecheck/lint/build green; differential lane (`lib/core` + `out/` oracle + `evals/gold` + frozen `*.snapshot.json`) **UNTOUCHED** (`git diff --name-only` confirms). The two load-bearing behaviors are red-green encoded: the recommend-only clone (above) and the anti-theater RED (buildReflection domain-blind) vs GREEN (strongReflection covers domain). The batched Codex re-confirm before any irreversible step (push / A3-7 live) is recorded here.
