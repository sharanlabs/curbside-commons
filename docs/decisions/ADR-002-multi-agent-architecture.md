# ADR-002: Bounded Multi-Agent, Verify-and-Self-Correct Architecture

Date: 2026-06-25

## Status

Accepted (owner-approved pivot, 2026-06-25) — gated by the mandatory cross-model review (`docs/reviews/codex-2026-06-25-multiagent-pivot.md`, BLOCK → all 9 findings reconciled). Supersedes the target-level framing of the 2026-06-09 "north-star = agentic" decision-log row at the **build** level; supersedes ADR-001 only where ADR-001 deferred agentic behavior (ADR-001's deterministic-first staging is **kept**).

## Context

ActivationOps AI is a **portfolio/capability showcase** (goal-locked 2026-06-22), not a venture or an operated service. The near-ship product — a deterministic core (differential-locked to a Python oracle) + a bounded Gemini drafter + a claims-gatekeeper + a cross-family Groq semantic judge + an eval harness + hybrid data + a REPLAY snapshot — is, by Anthropic's taxonomy, a **workflow, not an agent** (two sequential LLM calls inside deterministic plumbing). The owner asked to elevate it into a genuine, recommendation-grade **multi-agent** AI product that solves merchant activation end-to-end, on a free/free-tier industry-standard stack, with researched domain expertise grounding *and* evaluating the content — quality over tokens/speed.

The differentiator is preserved and moved to the center of the loop: **per-claim verification against the merchant's structured data row (not RAG)** becomes the agent's **self-correction signal** (verifier-in-the-loop / reflexion).

## Decision

Build a **bounded, human-in-the-loop, eval-gated multi-agent system** running a **verify-and-self-correct loop**, with a strict **agent/tool line**:

- **Agents (genuine LLM judgment over real ambiguity):** Strategist/Planner · Drafter · Domain Critic · Router/Conductor.
- **Deterministic TOOLS (source of facts + safety — NOT agents; promoted from existing code, not rewritten):** triage/risk (`lib/core/pipeline.ts`), Diagnostician (`lib/domain/diagnosis.ts`), Faithfulness-forward (`lib/agents/gatekeeper.ts`), Faithfulness-reverse (`lib/agents/semantic-judge.ts`, a bounded LLM tool), idempotent-send (`computeSendEligible` + core send loop), audit.
- **The line (anti-theater):** a component earns the name *agent* only where judgment is real; anything wrapping a deterministic check is a **tool**. Facts and safety stay deterministic (`RULES.md` §3 held).
- **Models:** Groq `gpt-oss-120b` (free) drives the in-loop reasoning + both critics; **Gemini Flash (<$5) is reserved for the A3 final draft only** — keeps the loop free and under the $5 cap.
- **Two-axis ship bar:** ship only if **Faithful** (every claim verified vs the data row) **AND Effective** (domain judge ≥ calibrated threshold, Track B).
- **Public posture:** the deliverable is a **REPLAY-only** ($0, no-keys) portfolio artifact showing the full agent trajectory + a recorded live-flow walkthrough; live integrations (A5) are a **transient demo**, never standing infra.
- **Sequencing:** **A1** (tool-ify the core; differential parity) → **A2** (single-agent reflexion spike — the **early owner go/no-go**) → **A3** (the multi-agent team + cross-family verify) → A4 (observability/demo) → A5 (transient live rails); **Track B** (domain KB + domain judge) in parallel. Convergence at Phase 6 (eval-lock → `acceptance-gate` → deploy).

### Binding conditions from the cross-model gate (these are part of the decision)

1. **A2 is a single-agent spike, not multi-agent** — "multi-agent" claims begin at A3 (AM-2).
2. **The agent recommends; deterministic tools decide facts/safety** — `send_eligible`/approval/the send transition are tool-derived and **test-locked the agent cannot override** (AM-4 / R-LOOP-1b / R-LOOP-8b).
3. **A2's same-family verify (Groq drafts, Groq judges) proves control-flow convergence only** — calibrated faithfulness requires A3 cross-family (AM-3).
4. **Committed near-term scope = P3-calibration + A1 + A2**; A3/A4/A5/Track B are roadmap, re-decided at the A2 go/no-go (AM-6).
5. **A Groq availability rail** (headroom ledger + preflight + fixture fallback) guards the shared 200K-tokens/day window (AM-5).
6. **Honesty language** — "bounded verifier-loop prototype," "researched domain rubric," "self-corrects planted cases in eval"; metrics labeled simulated; "domain expert" = researched + source-cited, not credentialed (AM-7).

## Options Considered

### Option 1 — Ship the existing workflow as-is (no pivot)
Rejected. It is honest and green, but it is a workflow with two LLM calls; it does not demonstrate agentic capability, and the owner asked for a genuine, defensible AI build.

### Option 2 — Full autonomous multi-agent system (unbounded)
Rejected. Violates `RULES.md` §3 (deterministic-first), the honesty posture (autonomy overclaim), the free-first/$5 cap, and the prototype-not-service identity; also un-evaluable and unsafe for a public artifact.

### Option 3 — Bounded, HITL, eval-gated multi-agent with a strict agent/tool line  **(Accepted)**
The defensible, bounded version of multi-agent: real agency only where judgment is real, deterministic everywhere facts and safety live, every artifact eval-gated and gate-reviewed, public surface REPLAY-only. Reuses the built core as tools (promotion, not rewrite).

### Option 4 — LangGraph.js vs the Vercel AI SDK for orchestration
**Deferred to a spike (A2-D0).** The `ai` SDK is already a dependency (reuse/start-simple weight); LangGraph.js only if a criterion fails. Settled by the spike + a Codex cross-check, recorded in the decision-log.

## Consequences

**Positive:** demonstrates a genuine, bounded agentic capability; keeps the verification-rigor differentiator central; preserves deterministic-first, the $5 cap, and human-approval-before-send; promotes (not rewrites) the green built core; staged so the A2 go/no-go is a real off-ramp before the expensive A3–A5 + Track B work.

**Trade-offs / costs:** larger surface than a workflow; new orchestration dependency (TBD); A2's same-family verify is weaker than A3's cross-family (documented, not hidden); the public REPLAY artifact won't host the live A5 rails (only a recorded walkthrough — an owner cost/value call at A4→A5); the shared Groq day-window is a real operational constraint.

**Reversibility:** every phase exits through `acceptance-gate`; the A2 go/no-go can stop the build with a shippable single-agent artifact; framework choice is env/dependency-scoped.

## Validation Needed

Before A2's live milestone may be **run or claimed**:

- **The paused P3 judge calibration MUST complete and clear the held-out bar** (recall/precision/F1 + κ + flip-rate, R-CAL-7) and be eval-locked — the "self-correcting" payoff is **contingent** on a calibrated detector existing (AM-1; `docs/judge-calibration-status.md`). Until then A2 = offline loop-machinery only (R-LOOP-8).
- **R-LOOP-8b passes:** a test proves the agent cannot send to a `send_eligible:false` merchant (deterministic-first invariant, AM-4).
- **A2 offline machinery green** (R-LOOP-8/9), **trajectory frozen + $0 REPLAY-renderable** (R-LOOP-6), `verify:full` green, the same-family caveat documented (AM-3), and **a Codex changed-files review reconciled + `acceptance-gate` SHIP** (spec §6.6).

Before A1 build starts: Phase 0 cleared (this ADR + the 3 decision-log reversals + state sync + owner `/autopilot` GO). No "built + calibrated / multi-agent / self-correcting" public claim ships before its evidence exists and a Codex gate approves (R-HON-3).
