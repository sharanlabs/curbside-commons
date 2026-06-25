# Codex Adversarial Cross-Check — Multi-Agent Pivot (Phase 0 · P0-1)

- **Date:** 2026-06-25
- **Reviewer:** Codex `gpt-5.5` @ `xhigh`, read-only sandbox, via `~/claude-os/bin/codex-guarded` (session `019f0025-…`)
- **Subject:** the 2026-06-25 pivot — elevate the near-ship workflow into a bounded, HITL, multi-agent **verify-and-self-correct** system.
- **Inputs reviewed:** `docs/plan-multi-agent-execution.md`, `HANDOFF.md` (top block), `~/.claude/plans/read-last-handoff-and-snappy-ripple.md`, `docs/decision-log.md`, `lib/core/{pipeline,guardrail}.ts`, `lib/agents/{gatekeeper,semantic-judge}.ts`, `lib/replay/run.ts`, `docs/judge-calibration-status.md`.
- **Raw verdict:** `/tmp/codex-verdict-activationops-pivot.md`. **Full transcript:** scratchpad `codex-pivot-review.stdout.log`.
- **Method:** the adversarial brief is in `scratchpad/codex-pivot-review-prompt.txt` (8 attack points, repo-cited, position-forcing).

## Verdict: **BLOCK** (9 findings) → reconciled under primary-model-final

The BLOCK challenges **no part of the pivot's direction.** Every finding is a *condition* on honesty, scope-sequencing, deterministic-first, or the Phase-0 paperwork itself. All 9 are accepted (none refuted) — they tighten the plan toward the project's own constraints. They converge with the primary model's pre-review assessment (APPROVE-WITH-CONDITIONS, C1–C6) and the advisor's three sharpenings. **Two findings (#6, #7) caught real gaps the primary under-specified.**

| # | Sev | Finding (Codex) | Disposition (primary-model-final) | Where fixed |
|---|---|---|---|---|
| 1 | **P0** | A2 self-correction depends on the semantic judge, whose calibration is paused (`judge-calibration-status.md:3,27-35`; spec `:64,190-191`). | **ACCEPT → FIX.** Clean P3 calibration becomes a **hard prerequisite** for A2's *live* go/no-go (R-LOOP-10). Until it clears the held-out bar, A2 = loop-machinery only. | spec §6.2/§6.6; ADR-002 "Validation Needed" |
| 2 | P1 | A2 is one orchestrator loop, not "multi-agent" proof; the team appears at A3 (spec `:157-180,226`). | **ACCEPT → FIX.** A2 relabeled a **single-agent reflexion spike**; "multi-agent" reserved for A3+. | spec §6 intro; honesty-language sync |
| 3 | P1 | Same-family A2 verify (Groq drafts + Groq judges) is a dodge if sold as faithfulness (spec `:180-191`; `spec-semantic-judge.md:25,42-45`). | **ACCEPT → FIX.** A2 proves **control-flow convergence ONLY**; faithfulness/self-correction claims require A3 cross-family or an independent judge. | spec R-LOOP-5 (hardened); ADR-002 |
| 4 | P1 | Scope too large for the locked **portfolio** showcase: Promptfoo, Langfuse, Docker, GH Actions, Slack, Resend, n8n, Track B — none in `package.json` yet. | **ACCEPT → FIX as *sequencing*, not cutting.** Committed near-term scope = **P3-calibration + A1 + A2**; A3/A4/A5/Track B stay **roadmap**, re-decided at the A2 go/no-go. Faithful to the owner's full vision *and* the discipline. | spec §6.6/§7 note; ADR-002 |
| 5 | P1 | Overclaim risk: "true multi-agent," "domain-expert," "catch their own mistakes" (`HANDOFF.md:7-13`; spec `:7`) vs RULES eval-before-claims + simulated labels (`RULES.md`). | **ACCEPT → FIX.** Honesty language: "bounded verifier-loop prototype," "researched domain rubric," "self-corrects planted cases in eval." | state-doc sync; ADR-002 honesty clause |
| 6 | P1 | Deterministic-first is preserved in code but **weakened in the plan's routing language** — A2 says the agent "decides contact/hold/suppress" then routes/simulates send (`pipeline.ts:94-99,259-268` vs spec `:166-171`). | **ACCEPT → FIX (sharpened).** The agent **recommends strategy only**; `send_eligible`, hold, approval-state, and the send transition stay **tool-derived + test-locked the agent cannot override**. New EARS invariant + acceptance test. | spec R-LOOP-1b + R-LOOP-8b (new); ADR-002 invariant |
| 7 | P1 | Cost rails cover Gemini (`budget.ts`, `live-batch.ts`) but **not Groq availability** — the 200K/day shared limit already exhausted calibration once (`judge-calibration-status.md:17-25`). | **ACCEPT → FIX (new gap).** Add a **Groq token/headroom ledger + live-run call budget + preflight skip + fixture fallback** before any A2 live demo. | spec R-LOOP-4 (extended) |
| 8 | P2 | Reversal framing should be "unblocked **by** RULES," not "reversing RULES" — §3 blocks integrations only until the offline slice is complete/reviewed (`RULES.md:24`), and it is. | **ACCEPT → FIX.** Reversal (c) reframed: the §3 rule-8 precondition is **satisfied** → scoped unblocking, **not** a constitution reversal. | spec R-P0-2(c); decision-log row (c) |
| 9 | P1 | Phase-0 artifacts absent (only ADR-001; no pivot review file) → the pivot is **not cleared**. | **RESOLVED BY this Phase 0.** This review (P0-1) + ADR-002 (P0-3) + the 3 reversal rows (P0-2) + state sync (P0-4) are being authored now; that **is** the clearance — not a defect in the pivot. | this file + P0-2/3/4 |

### Top-3 risks (Codex) — and how the reconciliation closes them
1. *Ships "self-correcting agents" while the detector is only directional* → **closed by #1** (P3 calibration is a hard A2 prerequisite; no faithfulness claim before the held-out bar clears + a Codex gate, R-HON-3).
2. *Scope balloons and misses the portfolio ship window* → **closed by #4** (committed scope capped at P3+A1+A2; the A2 go/no-go is the genuine off-ramp).
3. *The agent route layer erodes deterministic safety* → **closed by #6** (recommend-not-decide invariant, test-locked).

## Net
**BLOCK → reconciled, governance-only (no `lib/`/`app/`/`evals/` code touched in Phase 0).** Findings **#1 and #6 become binding build preconditions** recorded in ADR-002 + the execution spec and enforced when A1/A2 build. A **confirming Codex pass** on the reconciled artifacts is run next (BLOCK→reconcile→confirm loop); if the seat errors, the test-verified/owner-accepted dated-obligation path (precedent: decision-log 2026-06-20) applies.

## Confirming pass — round 1 (2026-06-25): RESIDUAL → patched

The confirming Codex pass (`/tmp/codex-confirm-activationops-pivot.md`) verified **#1, #2, #3, #4, #6, #7 CLOSED** and flagged **RESIDUAL** on the *propagation* of the amendments into older inline text — the correct standard (a §0 "supersede" clause is not enough for a builder-facing spec; the contradicting inline text must be patched). All addressed:
- **#5** — overclaim words still present (plan summary "catch their own mistakes"; ADR Option 3 "true multi-agent"). → **patched** ("catch the fabrications the verifier flags"; "the defensible, bounded version of multi-agent").
- **#8** — plan R-P0-2(c) still read "genuine reversal of RULES §3 ordering note" (vs AM-8). → **patched** to "scoped unblocking, NOT a reversal of RULES §3."
- **#9** — state sync "incomplete" → **STALE read**: the confirm pass ran *before* P0-4 finished; `git status` confirms all 7 state docs synced. Now complete.
- **new #1** — §6.6 "Blocked by" omitted the P3-calibration prereq → **patched** (the LIVE milestone is additionally blocked by AM-1).
- **new #2** — §6.1 flow said "agent decides" → **patched** to "agent RECOMMENDS … (deterministic eligibility/send unchanged)."
- **new #3** — "supersede clause isn't enough" → **addressed** by patching the specific inline contradictions above (the §0 clause remains a backstop).

A **round-2 confirm** on the patched artifacts is run next.

## Confirming pass — round 2 (2026-06-25): CONFIRMED — Phase 0 reconciliation complete

The round-2 Codex confirm (`/tmp/codex-reconfirm-activationops-pivot.md`) verified **all** round-1 residuals (#5, #8, #9) **and** the 3 new inline issues are **CLOSED** with line-cited evidence, and found **no remaining issue** in `docs/plan-multi-agent-execution.md`, `ADR-002`, or the four 2026-06-25 decision-log rows. The primary model independently re-read the patched §6.1 (line 185, "agent RECOMMENDS … deterministic eligibility/send unchanged"), R-P0-2(c) (line 102, "scoped unblocking, NOT a reversal of `RULES.md` §3"), and §6.6 (line 239, live milestone blocked on P3 calibration) — all read cleanly in context.

**Gate outcome: BLOCK → reconcile → RESIDUAL → patch → CONFIRMED.** The mandatory cross-model gate is satisfied (primary-model-final). **Phase 0 §4.2 acceptance is met on the Claude side** (review reconciled · 3 reversal rows · ADR-002 · state sync · docs-only working tree); the only remaining §4.2 item is the **owner action** — commit approval (RULES §12) + the `/autopilot`+`/goal` toggle.
