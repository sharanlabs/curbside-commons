# A2 Slice Record — agent-crew orchestration harness (offline)

**Date:** 2026-07-07 · **Plan:** `docs/plan-agentic-extension.md` v1.0 §5 row A2, §6 · **Pre-registration:** committed FIRST at `9130a6c` (case schema + 20 cases + recorded turns + per-member floors, `docs/plan-a2-trajectory-floors.md`) — before any crew implementation entered history.

## 1 · Deviation on record (decision-log entry at wrap)

The dispatched opus builder died at launch on the subagent seat limit (raw verbatim: **"You've hit your session limit · resets 7:20pm (America/New_York)"**). The owner's `resume` consumed the single confirmed retry; the reset was ~3 hours out, so the slice converted to **INLINE execution on the Fable seat** under the standing NO-WAIT rule (W1/F1b/Pub precedent). **Maker=judge mitigation:** the per-slice cross-model Codex changed-files review (below) + the AM module ceremony (batched Codex + independent acceptance-gate) must explicitly enumerate A2 as inline-built.

## 2 · What was built

- `lib/crew/types.ts` — committed vocabulary: `RECOMMENDATION_CLASSES` enum, JSON-level `parseReportCanonical` (loud on shape surprises), `deriveRecommendationClass` (deterministic, never model-decided), `makeRecommendation` (fabricated-reference constructor throw), trajectory step/record types, `CrewCase` schema type.
- `lib/crew/model.ts` — the model seam: typed closed-vocabulary decisions (`IntakeDecision`, `ReviewerDecision`), `quarantineExcerpt` (artifact content = DATA under an explicit untrusted marker), `RecordedModel` (committed turns; unknown key throws — no defaults). Live wiring = L-1, owner-gated, NOT here.
- `lib/crew/orchestrator.ts` — `runCase`: the containment contract. Tool requests checked against the case contract AT THE CALL SITE (a steered model is blocked, recorded, and forces escalation); `assertDecisionGrade` refuses demo-only/advisory results as verdicts; anomalies force `escalate-to-human` even over a model "approve" (`forced_escalation` step); every branch emits a typed step; exactly two lawful terminals. `argsDigest`/`reportHash` (sha256, canonical JSON).
- `lib/crew/render.ts` — AC-7 two-register rendering, byte-frozen goldens.
- `lib/crew/classification.ts` — the committed per-member workflows-vs-agents table (Intake/Reviewer = model-directed steps; Audit/Evidence = deterministic workflows) with label semantics restated.
- `evals/crew/harness.ts` — replay + per-case evaluation mapping 1:1 to the floors doc §3 invariants; matrix serializer.
- `evals/crew/*.test.ts` — composition lock (pinned ids, 5/member, injection/refusal minimums, schema validity) · replay floors (per-member 100% safety + ≥90% class-match; matrix byte-frozen) · safety/containment teeth (AC-6 byte-identity across the FULL replay, fabricated-ref, demo/advisory refusal, blocked-call escalation, forced escalation, lawful terminals) · import walk (direct boundary + transitive $0 + committed negative fixtures `evals/crew/fixtures/negative/*.src.txt` + clean-source non-trivially-firing check) · render goldens.
- `evals/crew/gold/` — `member-case-matrix.golden.json` (20 rows, 0 failures) + 2 render goldens. Regen path: plain `node --experimental-strip-types` over `evals/crew/harness.ts` exports (harness uses relative imports for exactly this reason).
- Docs: PLAIN-ENGLISH row + 4 GLOSSARY entries (same breath).

## 3 · Result + label (binding semantics)

**Matrix: 20/20 cases — 0 safety violations, 0 class mismatches; every per-member floor passed.** Per `docs/plan-a2-trajectory-floors.md` §4 this earns **"orchestration harness passed"** and nothing more: the surface is labeled **"workflow with mocked agent-trajectory replay."** No member holds the "agent" label; that requires the owner-gated live L-1 run on a held-out split with its own committed pre-registration.

## 4 · Escalations (inline builder = Fable; recorded for the Codex pass)

- E-1: `expectedGateState` vocabulary fixed to exactly `approve-recommendation | escalate-to-human` (the plan §6 wording), mapped to the two terminals — the draft type briefly admitted a third value; corrected before tests.
- E-2: `evals/crew/harness.ts` uses RELATIVE imports (not `@/`) so golden regeneration runs under plain node where the vitest alias doesn't exist — documented in the file header.
- E-3: on intake `reject`, the run escalates WITHOUT consulting the reviewer (no recorded reviewer turn exists for `int-reject-malformed` — by design: an unroutable ask has nothing to review). All other paths always consult the reviewer, then containment may override.
- E-4: RG-2's revert used exact-string restore instead of `git checkout` (the file was still untracked at mutation time) — noted honestly in the evidence log.

## 5 · Verification

- Crew suite: **36 passed (36)**; full verify + legacy tails in `a2-verify-evidence.log` addendum below the RG cycles.
- RED-GREEN ×5 executed with real failure counts (containment gate · fabricated-ref · recorded-turn flip caught by floors+freeze · forced-escalation removal · import boundary) — `docs/reviews/a2-verify-evidence.log`.

## 6 · Codex changed-files review + reconciliation

**Verdict: FINDINGS — 1 P1 + 2 P2, no P0** (raw: `codex-2026-07-07-a2-crew-raw.md`); Codex was explicitly briefed this slice was inline-built and reviewed at maximum skepticism. **All three accepted and fixed same-session** (independent actual⊆engine reference floor + consumedFindingIds on the record; param-level pre-execution containment + L-1 arming requirement in the floors doc §6 strengthening addendum; import boundary restricted to registry.ts/types.ts). Post-fix: crew suite **38 passed**, matrix + render goldens byte-unchanged, full reconciliation in the evidence log addendum.
