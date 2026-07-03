# Acceptance-gate record — W1 wedge (commit 5a81440) — 2026-07-03

**Context:** NAMED OBLIGATION discharge (decision-log 2026-07-03). W1 was built INLINE on the
Fable seat (builder subagent seat-limited twice; NO-WAIT) → maker=judge deviation → this
independent acceptance-gate pass is the recorded mitigation. Gate ran as a fresh-context
independent subagent (read-only) at 2026-07-03 ~11:00–11:30 ET, after the owner confirmed the
subagent seat reset. First launch attempt at 10:55 ET died on the seat limit (raw verbatim:
"You've hit your session limit · resets 3:10pm (America/New_York)"); the owner confirmed the
reset ("resume limits resetted") and the relaunch completed. `advisor` unavailable again
(7th consecutive session — raw: "The advisor tool is unavailable.").

## Verdict arc

**Initial verdict: BLOCK — narrow, two flip conditions (P2-1, P2-2). Both discharged same
session (below) → this record FLIPS TO SHIP, conditional on the M1 batched Codex review
(gate-2, S-4 module-boundary policy — named, dated, never skipped).**

The gate's own summary: "the engineering core is strong … comparator, guard, injector, and
eval design are at the fable-equivalence bar." All six tasked claims confirmed at file:line
level; the RED-GREEN ×4 log authenticated by independent failure-count reconciliation.

## Full gate verdict (verbatim from the independent judge)

GATE: W1 wedge — deterministic listings verifier (commit 5a81440, diff da1e2e7..5a81440) — 2026-07-03
PROVENANCE: independent-context judge, fresh session, no part in the build — BUT same model
family as the maker. This pass mitigates maker=judge; it does NOT mitigate family bias.
Gate 2 (cross-model) remains the load-bearing independence check.

1. grill — FAIL (one specific overclaim; all six tasked claims otherwise CONFIRMED)
   (a) C2 evidence guard real: lib/verifier-core/guard.ts:47-70 (makeFinding throws on missing
       claim.id/referenceRowId/ruleId/invalid severity; single sanctioned constructor;
       verify.ts:66 routes every detector emission through it; buildReport re-asserts C2).
   (b) One-command CLI exit semantics 0/1/2: bin/check.mjs:41-69; exercised as a REAL child
       process in evals/packs/cli-c1.test.ts:35-80 incl. byte-equality to goldens.
   (c) $0-LLM structural proof: cli-c1.test.ts:82-127 walks the transitive import graph from
       bin/check.mjs (static + dynamic imports), bans lib/agents//@ai-sdk/ai/node:http(s)/
       undici/groq|gemini, floors the walk at >10 modules against vacuous traversal.
   (d) C3 one comparator, two adapters: ONE runListingsVerification (run.ts:114) serves both
       surfaces; listings-differential-c3.test.ts asserts all 11 "both"-surface manifest
       entries caught on BOTH, 4 acp-only on ACP, ucp skew on UCP only; matchingMode labeled
       in both reports. ID-mismatch = drift-010 (LST-IDENT-ID-MISMATCH via entity resolution
       run.ts:49-70); modifier-ambiguity = drift-011 (LST-IDENT-MODIFIER-AMBIG,
       detectors.ts:217-234); both asserted on both surfaces (listings-wedge.test.ts:109-121).
   (e) C6 measured: listings-coverage-c6.test.ts computes injected/caught from manifest + live
       reports, asserts 8/8 + 8/8; "all edge cases" ban is a real grep.
   (f) RED-GREEN ×4 authentic: failure counts in docs/reviews/w1-verify-evidence.log
       independently reconciled against static recounts of the suites (RG-1 3/12, RG-3 2/5,
       RG-4 17/89 exact; RG-2 19≈18 within modeling error).
   THE FAIL: fixtures/synthetic-restaurant/README.md:24-25,29-30 claimed "no hand-tampering
   is possible without CI catching it" while ucp-catalog-response.{faithful,drifted}.json and
   the manifest's ucpVersionSkew block were NOT freeze-locked (the faithful UCP fixture was
   exercised by zero tests). An honesty-surface violation by this repo's own C10 standard.

2. codex cross-model — DEFERRED-TO-M1 (named, dated 2026-07-03) per plan §5 S-4 policy; this
   verdict is CONDITIONAL on that batch running. Codex handoff text recorded in the gate
   transcript: refute comparator correctness, C2 guard completeness, $0-LLM proof, C3 claim
   over lib/verifier-core/, lib/packs/listings/, bin/check.mjs, fixtures/synthetic-restaurant/,
   evals/{core,packs}/.

3. verify — was PENDING-HANDOFF (gate held no Bash; "verify green 409+5" existed only as
   maker prose). Discharged below (P2-2). Gate's own reading of the tests: they encode spec
   behavior (property suite over 12 seeds, faithful⇒clean, planted lies row-pinned), no
   weakened tests found; the one intentionally vacuous branch (listings-property.test.ts:90)
   commented and acceptable. Injector touched-set fix test-locked indirectly (drift.ts:70-78;
   removing line 235 fails listings-differential-c3 per-entry coverage) → P3-2 advisory for a
   direct invariant test.

4. enterprise + taste — PASS. Boundaries genuinely clean (verifier-core owns evidence
   discipline/determinism/report assembly, knows no domain taxonomy; pack owns detectors;
   browser-safe barrel excludes node:fs cli.ts; CLI is a thin arg-parser). Failure modes right
   way round (replaceRow throws on missing target — injection can never silently no-op;
   injector predicates throw if unmatched; CLI maps input errors to exit 2). Determinism
   engineered (sorted findings, asOf is data, single canonical serializer). Naming honest
   (buildUcpResponse labeled constructed simulation; "our interpretation" flags on the ACP
   mapping incl. UNVERIFIED price wire format).

5. anti-slop — PASS with advisories. Simulated labels forced by types and present in every
   synthetic artifact; zero real-platform-access claims (explicit disclaimers ucp.ts:4-16,
   acp-feed.ts:15-26); spec-version pin in every report header (run.ts:23); license = honest
   owner-call label (README:63-68, C9). Advisory: em-dash house style is a known published-
   artifact AI tell — owner note for the Pub slice.

Legacy isolation: zero cross-boundary imports (grep both directions); differential-oracle
tests live only under legacy/activation/evals/; diff-stat proof below.

## Flip conditions — DISCHARGED (2026-07-03, same session, Fable seat, primary-model-final)

**P2-2 (verify handoff) — raw evidence, executed on the repo:**

- `npm run verify` → **exit 0 — Test Files 34 passed | 4 skipped (38); Tests 409 passed |
  5 skipped (414)** (pre-fix baseline, matches the maker's claim exactly)
- `npm run check:fixtures` (drifted corpus) → **exit 1** (drift found; report `"ok": false`)
- `npm run check:fixtures:clean` (faithful corpus) → **exit 0** (report `"ok": true`)
- `git diff da1e2e7..5a81440 --stat` → 38 files changed, 5420 insertions(+), 79 deletions(-);
  `git diff da1e2e7..5a81440 --stat -- legacy/` → **empty (0 lines)** — legacy untouched
- `node --version` → v24.15.0 (≥ 24 requirement met)

**P2-1 (freeze-integrity gap) — FIXED, the strong option (lock extended, claim kept):**
`evals/packs/listings-wedge.test.ts` freeze block extended with two tests:
(1) `ucp-catalog-response.{faithful,drifted}.json` byte-compared against
`buildUcpResponse(...)` at the generator's exact pinned params (faithful:
`[UCP_PINNED_VERSION]` / `sess-sim-faithful-001`; drifted: `["2026-03-01-draft"]` /
`sess-sim-drifted-001`); (2) `drift-manifest.json`'s `ucpVersionSkew` block, `simulated`, and
`asOf` asserted exactly. The README claim now holds for every committed fixture file.

**RED-GREEN executed (raw):** tampered `ucp-catalog-response.faithful.json` (`note` →
"hand-tampered") → `× ucp-catalog-response.{faithful,drifted}.json are exactly
buildUcpResponse(...) at the pinned params` — **1 failed | 13 passed**; restored → **14
passed**. Full suite after fix: **exit 0 — 411 passed | 5 skipped (416)** (+2 = the new locks).

## Final verdict

**SHIP** — conditional on the M1 batched Codex review (gate-2, standing S-4 obligation).
The W1 maker=judge deviation is now mitigated by this independent pass + the flip-condition
evidence above; the cross-model leg lands at M1 as planned.

## P3 advisories (non-blocking — folded into the W2 slice prompt)

- P3-1 derive C6 `injectedClasses` spec-version-skew from the manifest, not hand-added
- P3-2 direct injector invariant test: no two manifest entries share a live target row
- P3-3 tighten guard.ts claim validation to source/field presence
- P3-4 add `"engines": { "node": ">=24" }` to package.json
- P3-5 add source-text scan for bare `fetch(` to the $0-LLM proof (import-graph is module-level)
- P3-6 implement the C10 platform-claims grep-gate eval by M1
- P3-7 fix stale W0 comment in evals/packs/packs-load.test.ts:8
