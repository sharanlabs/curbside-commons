# Codex changed-files review — A3-6 (integrated multi-agent orchestrator wired + $0 trajectory fixture)

**Date:** 2026-06-28 · **Reviewer:** Codex (config default `gpt-5.5` @ `xhigh`), read-only, via `~/claude-os/bin/codex-guarded` · **Target:** the A3-6 diff (4 modified) · **Reconciliation:** primary-model-final (Opus 4.8).

## Status: SEAT-BLOCKED — DATED OBLIGATION (now batched as the THIRD of three: A3-4 round-3 + A3-5 + A3-6); proceeding TEST-VERIFIED

The Codex seat is still **usage-limited** (raw error surfaced verbatim, no retry per owner doctrine):

> `ERROR: You've hit your usage limit … try again at 7:25 PM.`

Per the autopilot doctrine (**Codex-down ≠ gate-waived** — record the dated obligation, let reversible internal work proceed, hold the irreversible/promotion step until the seat runs) + owner doctrine (surface raw · no retry/downgrade/switch), the A3-6 review is a **dated obligation (~7:25 PM ET)**, to be run in **one batch** with the still-open A3-4 round-3 re-confirm (`codex-2026-06-28-a3-4-domain-critic.md`) and the A3-5 review (`codex-2026-06-28-a3-5-router.md`) when the seat resets.

## What ships (A3-6 — re-derive via `git diff`)

A3-6 is **wiring, not new modules** (the agents were built in A3-2/A3-4/A3-5). The integrated multi-agent loop is now the orchestrator DEFAULT:

- **`lib/agents/loop/orchestrator.ts`** — the `recommend` default is now `strategistRecommend` (was `defaultRecommend`) and the `reflect` default is now `routerReflect` (was the interim `defaultReflect`, **removed as dead code**). Same pattern as the A3-3 Gemini Drafter default: OFFLINE (live off, no DI) each branches to its STRONG DETERMINISTIC baseline (`strongRecommend`/`strongReflection`, $0); LIVE each hits Groq behind the A3-7 cross-family gate. `defaultRecommend` + `buildReflection` stay exported as the documented A2 baselines + the Strategist/Router evals' RED comparators.
- **`lib/agents/loop/trajectory.ts`** — `A2_HONESTY_NOTE` rewritten for the integrated system with the **honest label framing**: "1 earned (Drafter) + 3 deterministic-tied components wired through the agent seams, NOT 'four agents reasoning'"; the deferred agents are decidable only at the owner-gated A3-7 live run.
- **`lib/agents/loop/snapshot.ts`** — the $0 SCRIPTED fixture note reframed: the Strategist plan / Router reflect / Domain critic shown are their deterministic baselines; the seams are wired but the LLM agents + the live cross-family trajectory are frozen at A3-7.
- **`evals/agent-loop.test.ts`** — +1 A3-6 INTEGRATION PROOF: with NO recommend/reflect injected (the integrated defaults run), assert the plan rationale carries `risk=`/`tenure=` (strongRecommend, NOT defaultRecommend) AND the reflect instruction surfaces `no_over_promise` (strongReflection reading the domain critic, which domain-blind buildReflection structurally CANNOT) — $0; labels still defer (strategist/router/domain_critic ABSENT).

## Targets for the batched re-confirm

1. **No invariant regression from the swap (THE crux):** the recommend-not-decide firewall (`assertEligibilityUntouched`, R-LOOP-8b), the cross-family gate, and the phase/agent trajectory mappings all pass UNCHANGED — confirm the integration changed only *content* (richer strategy/reflection), never an invariant. `npm run verify` 296+5 + 4 e2e all green; the 20 agent-loop invariant tests pass untouched.
2. **Offline $0 is real:** the integrated defaults are deterministic offline (strongRecommend/strongReflection), so the loop stays $0 with no key — the A3-6 integration test asserts `costUsd === 0`. Live (A3-7) hits Groq behind the cross-family gate.
3. **Tool-until-earned holds end-to-end:** wiring the agents as defaults did NOT flip any trajectory label — strategist/router/domain_critic stay ABSENT; only the Drafter earns. The fixture note is honest ("1 earned + 3 deterministic-tied", not "four agents reasoning").
4. **Dead-code hygiene:** `defaultReflect` removed (superseded); `defaultRecommend` + `buildReflection` retained because they are still used (the Strategist/Router evals' RED baselines).
5. **No import cycle:** orchestrator now imports `strategistRecommend`/`routerReflect` (values) while strategist/router import orchestrator types (type-only back-edges, erased at runtime) — tsc clean.

## Test-verified basis

`npm run verify` exit 0 — **296 passed | 5 skipped** + **4 e2e passed** (`verify:full` green); typecheck/lint/build green; differential lane (`lib/core` + `out/` oracle + `evals/gold` + frozen `*.snapshot.json`) **UNTOUCHED** (`git diff --name-only` confirms). The integration is proven by content, not assumed (the A3-6 test distinguishes strongRecommend/strongReflection from the naive stand-ins). Raw evidence: `docs/reviews/a3-6-verify-evidence.log`. The batched Codex re-confirm before any irreversible step (push / A3-7 live) is recorded here.

## Strategic note (advisor, 2026-06-28)

**A3-6 is the TERMINAL offline slice.** Three of four agents DEFER their labels; whether they beat their deterministic baselines is decidable ONLY at the owner-gated A3-7 live run (real Gemini prose + cross-family Groq judge). Autopilot stops at the A3-7 owner-gate (live spend) regardless — A3-6's completion is the decision point, not a waypoint to more offline polish.
