# Codex changed-files review — A3-7 LIVE cross-family run (2026-06-28)

- **Reviewer:** Codex `gpt-5.5` @ `xhigh`, read-only, via `~/claude-os/bin/codex-guarded` (session `019f1111…`).
- **Diff reviewed:** `evals/agent-loop.live.test.ts` (the live harness — R-A3-9 K methodology + the Router
  ablation), `lib/data/agent-loop.snapshot.json` (the frozen live evidence), `docs/a3-7-live-run-status.md`
  (freshness + pre-registration + RESULTS + the 3 label decisions). Cross-checked against
  `orchestrator.ts`/`draft.ts`/`router.ts`/`strategist.ts`/`domain-judge.ts`/`env-flags.ts`/the gold set/§11.
- **VERDICT: BLOCK** — *but* Codex independently **CONFIRMED all three labels should DEFER** ("I found no
  evidence that Strategist, Domain Critic, or Router should earn"). The BLOCK is about **honesty precision**
  in the harness + status doc, not the decision. Reconciliation is **primary-model-final**.

## What Codex independently CONFIRMED (no finding)
- The `allVerifiesLive` faithfulness-tool filter (excluding the A3-4 domain verify step) is **correct**.
- The "6 two-iteration false-but-verified cases imply a non-live redraft fallback" logic is **sound**.
- **Router defer is sound.**
- The **$5-cap assertion is NON-VACUOUS** (the outer ledger accrues `result.costUsd` across items, since the
  orchestrator clones the budget internally).
- The **Gemini 2.5 Flash freshness** (pricing + 2026-10-16 shutdown) checked against the official pricing +
  deprecations pages.

## Findings + reconciliation (all 4 ACCEPTED, primary-model-final)

### F1 — P1 (REAL BUG) — `selfCorrected` could OVERCOUNT 3-iteration items
`liveRedraft` used `.some(redraft && LIVE_AI)`, so a 3-iteration item with an EARLY live redraft + a LATER
deterministic-fallback final redraft would be counted as a "genuine live self-correction." 5 of the 16 items
are 3-iteration, so the reported 9/16 (and 5/9, K=5) were an UPPER BOUND, not authoritative.
- **ACCEPTED.** The gate earned its keep — a genuine correctness defect in the strict metric. Fixed
  `evals/agent-loop.live.test.ts`: `selfCorrected` now requires the **FINAL** recorded redraft (the one that
  produced the converged draft) to be `LIVE_AI` (`liveFinalRedraft`), not merely SOME live redraft. ALSO
  added per-item instrumentation (`finalRedraftMode`, the full `redrafts[]` with mode+summary, `domainMode`)
  + a `live_redraft_audit` block — closing the instrumentation gap so the fallback claim is snapshot-proven.
  Then **RE-RAN the live harness** for authoritative numbers (the prior run's trajectories were not persisted,
  so a recount required a re-run; it is a gate-mandated correctness re-run, not a blind retry — the
  instrumentation makes it self-diagnosing). Note: the labels DEFER regardless of the exact rate (a lower
  self-correction rate only STRENGTHENS the defer), so the decision was never at risk.

### F2 — P2 — "Domain Critic ran live cleanly" not proven (provider≠mode)
The harness asserted `domainProvider==="groq"` but a `judgeDomain` fallback can return provider `groq` with
mode `FAILED_TO_FALLBACK` — so "ran live cleanly" was unproven.
- **ACCEPTED.** Added per-item `domainMode` + a `domain_critic_audit` block; the status-doc claim is reworded
  to the snapshot-proven mode (LIVE_JUDGE vs fallback), not "ran live cleanly" by provider alone.

### F3 — P2 — "all three DEFER … VALIDATED by live evidence" overclaims
The three defers rest on DIFFERENT bases: Router (live-confirmed), Strategist (by construction — output
unconsumed), Domain Critic (policy-capped by R-A3-8). The summary line conflated them.
- **ACCEPTED.** Reworded the summary to distinguish the three bases (the per-agent bullets already did; the
  summary now matches them).

### F4 — P2 — "Fresh split" overstated
The split is the **existing** disjoint semantic-judge tune/test partitions run under the live A3 loop — not a
newly-constructed A3 held-out set.
- **ACCEPTED.** Reworded to "existing disjoint semantic-judge tune/test partitions, run under the live A3 loop
  (a new error distribution)." (The advisor already ruled disjointness-under-the-live-loop satisfies R-A3-9's
  binding invariant; building Gemini-specific gold is a noted future hardening, not an A3-7 requirement.)

## Status
Reconciled primary-model-final; harness fixed (F1 correctness + F1/F2 instrumentation); doc reworded
(F2/F3/F4). Re-ran the live harness with the fixed definition for authoritative numbers (below).

### Re-run outcome (fixed harness) + ARTIFACT-CURRENCY note
- **Re-run #2 FAILED** on an over-strict per-item assert: `expect(result.finalVerify.domain?.provider).toBe("groq")`
  threw `undefined` for an item whose live final redraft produced a gatekeeper-BLOCKED draft (the Domain Critic
  runs only on a gate-APPROVED draft, R-DARCH-4, so `finalVerify.domain===null`). **Fixed** (post-review):
  the domain provider is asserted only when the Domain Critic actually ran.
- **Re-run #3 produced AUTHORITATIVE-metric but PROVIDER-DEGRADED numbers** (see `docs/a3-7-live-run-status.md`
  → "RESULTS (AUTHORITATIVE) — run #3"). The corrected `selfCorrected` (final-redraft) + the degradation
  collapsed the numbers: **detection 11/16** (Groq-window depletion on the final 4 test items), **12/16
  Gemini redrafts parse-failed** (`"No object generated: could not parse the response"` — a DRAFTER problem,
  independent of the Groq tail; ~75%), tune 1/7 → **K=1 (VACUOUS)**. So **deliverable #2 (K/convergence) is
  INCOMPLETE**, while **deliverable #1 (the 3 labels) is DONE + CLEAN** — all DEFER, run-independent (the F1 fix
  did NOT change the labels; Codex confirmed the direction). The two `live_redraft_audit` / `domain_critic_audit`
  blocks F1/F2 asked for are now in the snapshot.
- **⚠️ CODEX CURRENCY (process honesty):** Codex reviewed **run #1's snapshot + the `.some()` harness**. The
  COMMITTED artifact is **run #3's snapshot + the post-review conditional-assert fix** — which Codex did NOT
  see. The label DIRECTION Codex confirmed still holds, but this artifact is **NOT** "Codex-confirmed SHIP" on
  its face. Resolution: a **Codex confirming pass on the FINAL diff** is run before commit (or committed
  test-verified with the re-pass as a dated obligation — push is HELD, so reversible). Recorded here so the
  BLOCK→reconcile is not misread as a clean gate on an artifact it did not cover.
- `npm run verify` re-green (offline; the live suite skips): 297 passed + 5 skipped + build.

## Codex CONFIRMING pass on the FINAL diff (2026-06-28, session `019f1111…` round 2)
Read-only confirming pass over the changed artifact (run-#3 snapshot + harness + the reframed docs). **VERDICT:
BLOCK — no P0/P1; F1–F4 CONFIRMED clean** ("F1 final-redraft metric is fixed; F2 domain `mode` instrumentation
is real; F3 two-deliverable/defer-basis framing is mostly honest; F4 acceptable") — **2 residual P2 honesty
defects, BOTH reconciled primary-model-final:**
- **C-P2-1 (snapshot still reads as a K pass standalone):** the frozen snapshot's `_provenance.note` said
  "confirmed on TEST" and `k_repin.test_meets_floor:true` presented the vacuous K=1 as confirmed without a
  caveat. **ACCEPTED + FIXED:** added a top-level `_caveat` (PROVIDER-DEGRADED DIAGNOSTIC / K vacuous / NOT a
  convergence pass / deliverable #2 INCOMPLETE / see the status doc), `_provenance.detection` (`11/16`) +
  `degraded:true`, reworded the note ("COMPARED on TEST", not "confirmed"), and added `k_repin.interpretation`
  ("NOT A CONVERGENCE PASS — provider-degraded and/or K vacuous"). Applied to BOTH the committed run-#3
  snapshot (framing-only; NO run data changed) AND the harness generator (so future runs are honest by
  construction, via a computed `degraded = detection < 16/16` flag).
- **C-P2-2 (headline reversed the finding):** the status-doc one-line headline said the Gemini redraft
  "parses ~75%" — should be "fails to parse ~75%." Already corrected by a concurrent edit (the confirming pass
  read the pre-edit text); verified the current headline reads "fails to parse ~75%."
- Codex's gate condition — "committing degraded run #3 is acceptable ONLY after the snapshot provenance is
  corrected" — is now satisfied. No P0/P1 across either round; the 3 DEFER labels stand, Codex-confirmed.

**Net:** the A3-7 Codex gate is DISCHARGED (BLOCK round-1 → 4 reconciled → confirming BLOCK round-2 → 2 P2
reconciled → clean). The artifact is honest on its own surfaces.
