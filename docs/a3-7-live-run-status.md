# A3-7 — Live Cross-Family Run: status + PRE-REGISTERED bars

**Owner-authorized** (GO 2026-06-28). The live, metered Gemini-Drafter ⊥ Groq-judges run — the ONLY
place the three deferred agent labels (Strategist · Domain Critic · Router) are decidable. This doc pins
the methodology + the label-decision criteria **BEFORE any live number is read** (the B1 / A3-2b
pre-registration discipline, R-DCAL-7 / R-HON-3 analogue). Numbers are appended in a clearly-marked
RESULTS section only after the run.

Owner-gated stops (unchanged): `git push` (HELD — no remote), deploy, public posting, **spend > $5**.

---

## 1. Freshness check (RULES §6) — dated 2026-06-28

- **Model:** `gemini-2.5-flash` — still listed/available on the official Gemini API pricing page; the
  planned/calibrated default. **Shutdown scheduled 2026-10-16** (future) ⇒ a documented upgrade trigger,
  NOT a blocker today. `gemini-2.0-flash` was retired 2026-06-01; `gemini-3.5-flash` released 2026-05-19
  (a newer option, but switching is a consequential owner+Codex pick — not assumed here).
- **Pricing (paid tier, per 1M tokens):** input **$0.30** (text/image/video; audio $1.00 — N/A, text only),
  output **$2.50**. This **matches** the pinned `lib/agents/pricing.ts` table (`gemini-2.5-flash`:
  0.30 / 2.50, PRICING_VERSION 2026-06-18) exactly — **no table change**, date re-anchored to 2026-06-28.
- **Sources:** official https://ai.google.dev/gemini-api/docs/pricing (Tier-1) + corroboration
  (HN thread news.ycombinator.com/item?id=48197727 + aggregators). ≥2 independent, ≥1 primary.
- **Provider gate defaults (read from code, not `.env`):** `resolvedJudgeProvider()` and
  `resolvedDomainJudgeProvider()` both default to `"groq"`; all Groq calls use `reasoningEffort:"low"`.

## 2. Cost sizing vs the $5 hard cap

The Drafter (Gemini) is the only metered agent and bills **only on re-drafts** (iteration ≥ 1; iteration-0
is the seeded planted draft, no model call). Worst case ≈ 16 items × `maxIterations`(3) Gemini calls ×
~(1.5k in + 0.3k out) ≈ **< $0.05 total**. The $5 cap is enormous relative to this; the binding constraint
is the **Groq daily-token window (200k/day)**, NOT the cap. Run once, paced, `reasoningEffort:"low"`. The
harness's outer cumulative ledger asserts `budget.spentUsd <= $5` per item; STOP + surface if spend
approaches $5 (it will not).

## 3. K re-pin methodology (R-A3-9) — PRE-REGISTERED

The current harness hardcodes `K=7` over the 9 **test**-split planted positives (a PLACEHOLDER reusing the
P3 split). R-A3-9 requires K re-pinned on a **fresh held-out split** under the stronger Gemini drafter
(a new error distribution), **never tuned on the test split**.

- **Fresh split = the disjoint TUNE split.** `GOLD_JUDGE_TERRITORY_POSITIVES` = 16 (7 **tune** + 9 **test**),
  both covering all 4 failure modes (timeline / entity / capability / specific). Both are "fresh" in
  R-A3-9's sense (run under the live Gemini drafter = new distribution); disjointness gives
  "never tuned on test" for free.
- **K rule (pinned before numbers):** run the live loop on the **7 tune** items → observe the live
  self-correction rate `r_tune = (#self-corrected)/7` → set **`K = floor(r_tune × 9)`** → **confirm** the
  **9 test** items self-correct **≥ K**. K is recorded; it is derived ONLY from the disjoint tune split.
- "Self-corrected" keeps the existing strict definition (the auditable live-only conjunction in the
  harness): a genuine LIVE_JUDGE seed-catch on iteration-0 + every verify LIVE_JUDGE + a LIVE_AI redraft +
  a LIVE_JUDGE final + cross-family (`judge.provider==="groq"`) + converged. No fallback work counts.

## 4. Label decision — PRE-REGISTERED criteria (each agent earns ONLY on a genuine, non-circular axis)

The honest bar (AM-7): a deferred agent's label flips to its name ONLY if it **beats** its strong
deterministic baseline on an axis that is (a) genuinely open-ended and (b) scored independently. A tie or a
loss → it STAYS deferred (a "tool"), and the count is updated honestly. "Confirmed deferred" is an
explicitly-valid outcome — A3-7 brings live evidence to the existing structural conclusion; it does NOT
exist to manufacture an earn.

- **Strategist → DEFER, settled BY CONSTRUCTION (not by a live metric).** The orchestrator records the
  Strategist's `Recommendation { route, strategy, tone, rationale }` in the trajectory/audit but **never
  feeds `strategy`/`tone`/`rationale` to the Drafter** (`draftOutreach` receives only the Router's
  `instruction`; `buildPrompt` never sees them) and `route` is recommend-only (never gates the send). With
  its output **unconsumed downstream**, the Strategist **cannot** change any draft or decision ⇒ it cannot
  beat `strongRecommend` on any loop-observable axis, live or not. The label DEFERS regardless of the run.
  *(BLINDSPOT to flag honestly: §11.2's "Strategist → Drafter: strategy/tone" data contract is NOT wired
  in the implementation — a spec-vs-impl gap. NOT fixed in A3-7 [it is a loop-behavior change = its own
  gated slice]; surfaced to the owner.)*
- **Domain Critic → DEFER, capped by R-A3-8 + the ~100 floor (R-DHON-1).** The live Groq Domain Critic
  runs live in the loop (advisory, never gates). Even if it **diverges** from `mockDomainJudge` on live
  Gemini prose, R-A3-8 forbids upgrading the "calibrated — directional, pending the ~100 floor" label on
  loop-run evidence, and the synthetic-gold ceiling stands. So the ceiling here is "directional divergence"
  — which is NOT an earn. The label DEFERS; any divergence is recorded as evidence/blindspot only.
- **Router → DEFER expected; tested by a FREE ablation.** The Router's `instruction` IS consumed (it drives
  the re-draft), so its label is live-decidable. At each reflect step the harness will record BOTH
  `routerReflect`'s live instruction/mode AND the **deterministic `strongReflection`** instruction on the
  **same** `(gate, judge, domain, merchant)` context (strongReflection is $0 / zero Groq tokens — the
  baseline arm is FREE). **Earn criterion (pinned):** the Router earns ONLY if its live revision is
  materially MORE targeted than `strongReflection`'s on the multi-failure cases AND that yields a
  convergence the baseline would miss. **Expected TIE → DEFER:** `strongReflection` already names the exact
  failing claim and is a strict SUPERSET of `buildReflection`, so the finite axes (which-fix-first / route /
  domain-coverage) are reproduced by construction. The live side-by-side confirms the tie with data rather
  than theory.

## 5. Pre-registered expected outcome

**"1 earned (Drafter) + 3 deferred (Strategist · Domain Critic · Router)."** A3-7's job is to either
confirm this with live evidence or, if a genuine earn appears, flip exactly the label that earned and
correct the count honestly. Both are valid (anti-theater, AM-7).

---

## ⚠️ RESULTS BELOW ARE SUPERSEDED — see "RESULTS (AUTHORITATIVE, run #3)" further down

The first results block (immediately below) used the **pre-Codex-fix** `selfCorrected` definition (the `.some()`
overcount, Codex A3-7 P1) and is retained only as lineage. The AUTHORITATIVE numbers are from the corrected,
instrumented harness (run #3) and are in the later section. Run #3 was additionally provider-degraded
(detection 11/16; Groq-window depletion on the final test items) — read both honestly.

## RESULTS — A3-7 LIVE RUN #1 (SUPERSEDED — pre-fix metric), 2026-06-28

Run: `ENABLE_LIVE_AI=true node --env-file=.env node_modules/.bin/vitest run evals/agent-loop.live.test.ts`
(live armed via CLI override only — `.env` never edited). Duration ~23.8 min, exit 0 (test passed).
Frozen evidence: `lib/data/agent-loop.snapshot.json` (this overwrote the prior A2 same-family snapshot,
which is preserved in git history at `7d3d8b5`). Raw log: scratchpad `a3-7-live-run.log`.

**Provenance (verified per item):** drafter `gemini-2.5-flash`; faithfulness judge + Domain Critic BOTH
`groq` `openai/gpt-oss-120b` on **all 16 items** (cross-family R-A3-2 enforced + asserted). **Cost = $0.0168756**
(« the $5 cap; the per-item cap assertion held). `assertEligibilityUntouched` never threw (no ineligible send).

**Detection: 16/16 seeds caught live** by the Groq judge (`seedCatchLive=true` on every item) — perfect
cross-family fabrication detection on the planted positives.

### K re-pin (R-A3-9) — done honestly
| split | n | live self-corrected | rate | K |
|---|---|---|---|---|
| **tune** (set K) | 7 | 4 | 0.571 | **K = floor(0.571 × 9) = 5** |
| **test** (confirm) | 9 | 5 | 0.556 | **5 ≥ 5 ✓ meets floor** |

K = 5 is a LOW floor reflecting a ~57% live self-correction rate — **materially lower than A2's same-family
8/9.** This is the pre-registered rule working as designed (K reflects observed capability), NOT a strong
self-correction result. The self-referential K (set on tune, confirmed on test) is a **consistency check
WITH TEETH** — had test self-corrected 4, the `≥ K` assertion would have FAILED; it is not a rubber stamp,
but it is NOT a capability bar either. Honest headline: "the cross-family loop self-corrects ~57% live,
holds the rest, K re-pinned at 5 and met" — not "great self-correction."

### Why ~57% (decomposition of the 16 — two DISTINCT mechanisms, do not bundle)
- **9/16 genuine live self-corrections** (live Gemini redraft authored the fix + all-live verifies + converged).
- **6/16 converged via the DETERMINISTIC FALLBACK redraft** (`stopReason:verified`, sent a clean grounded
  stub): tune P-timeline-1/P-specific-1/P-specific-3, test P-timeline-2/P-capability-2/P-entity-3. The
  mechanism is **DETERMINED, not hypothesized**: all six have `iterations:2`, so their only verifies are
  iter-0 (the seed catch) and iter-1 (= finalVerify), and BOTH are LIVE_JUDGE (`seedCatchLive=true` +
  `finalVerifyMode=LIVE_JUDGE`) ⇒ `allVerifiesLive` is necessarily TRUE ⇒ the only term that can make
  `selfCorrected=false` is `liveRedraft=FALSE` — i.e. the iter-1 Gemini redraft **definitively fell back to
  the deterministic stub** (this also rules out any mid-run judge-fallback — a 2-iteration item has no middle
  verify). This is a **draft-validation fallback at the redraft stage** (injection-cut or parse). The sent
  drafts are clean + faithful (the stub), so this is NOT a send-safety issue — only a live-redraft
  RELIABILITY finding. **Only the fallback's `errorClass` is uninstrumented** (the `{{MERCHANT}}`-placeholder
  fidelity failure is *a candidate* cause, not asserted).
- **1/16 HELD, never sent** (P-timeline-4: `max_iterations`, `finalAnyUnsupported:true` → `drafted`) — the
  recommend-not-decide firewall correctly holding a genuinely non-converging case (the judge KEPT flagging
  across re-drafts). This is the ONE item where the Router's claim-reintroducing replacement prose plausibly
  bites (it surfaces as a persistent judge flag, NOT a draft-validation fallback) — see the Router bullet.
- **BLINDSPOT (instrumentation gap):** this run did NOT record per-redraft `mode`/`errorClass`, so the
  6 fallbacks' exact `errorClass` is unknown (the fallback *fact* is determined above; only the *reason* is
  uninstrumented). Close this in any future live run. NOT re-run now (the Groq daily-token window was largely
  consumed by this run; re-running risks mid-run fallbacks that would corrupt the data, and the mechanism did
  not need a re-run — only the errorClass forensics would — doctrine: don't burn the window / no blind retry).

### Label decisions — all three DEFER (SUPERSEDED framing; see the AUTHORITATIVE section for the corrected per-basis distinction — Router live-confirmed / Strategist by-construction / Domain Critic policy-capped)
- **Strategist → DEFER** (by construction — output unconsumed; settled before the run, §4 above). The live
  Strategist ran (Groq) but its recommendation never reaches the Drafter, so it cannot affect any draft.
- **Domain Critic → DEFER** (R-A3-8 cap). It ran live cleanly (`domainProvider:groq` on all 16, advisory,
  never gated); the directional label is held per R-A3-8 — loop-run evidence cannot upgrade it.
- **Router → DEFER, decisively, live-confirmed.** 23 reflect steps, 23 live Router calls. **STRUCTURAL
  signals IDENTICAL to `strongReflection` on 23/23** (`signals_differ=0`) — the finite-axis tie confirmed
  with live data. Instructions differ on 23/23 but **only in prose**: the live Router emits verbose
  *replacement* suggestions (e.g. "replace with 'you can update your business hours in the DoorDash merchant
  dashboard'") that can THEMSELVES re-introduce unsupported claims, whereas `strongReflection`'s "remove them
  — no merchant field supports them" is a safer pure-removal.
  - **Pre-registered-vs-measured reconciliation (stated before the reviewer):** the pinned earn-criterion
    was a CONJUNCTION — "materially more targeted AND yields a convergence the baseline would miss." This run
    measured the **first conjunct** (the instruction comparison: ties on structure, prose differs but is not
    a helpful improvement) and did **NOT** run the counterfactual `strongReflection`-through-the-loop arm (the
    second conjunct — it would roughly double live cost). The DEFER is **over-determined**: a FAILED first
    conjunct is by itself sufficient to defer (the Router cannot beat a baseline it ties on structure), so the
    convergence counterfactual is unnecessary for the decision and was deliberately not run.
  - **Regression-risk scope:** the claim-reintroducing replacement prose plausibly bites on exactly ONE item
    — **P-timeline-4** (the held, max-iterations case, where the judge KEPT flagging). It does NOT explain the
    6 fallbacks (those are draft-validation fallbacks, a separate mechanism). So: a structural TIE + a prose
    regression-risk on the one persistent-flag case ⇒ the Router label DEFERS (a stronger defer than the
    a-priori argument, but scoped honestly).

### Realized earned-agent ledger (live-confirmed)
**"1 earned (Drafter) + 3 deferred (Strategist · Domain Critic · Router)."** A3-7 confirmed the offline
conclusion with live evidence — the anti-theater bar (AM-7) working exactly as designed. No trajectory label
flips; the offline build's conservative labeling needs no change.

### Carried forward / flagged to owner
- **§11.2 spec-vs-impl gap (Strategist → Drafter strategy/tone NOT wired):** surfaced; a behavior-changing
  fix = its own gated slice, not A3-7.
- **Live Gemini redraft reliability:** a real quality finding — see the AUTHORITATIVE section below.
- **gemini-2.5-flash shutdown 2026-10-16:** documented upgrade trigger.

---

## RESULTS (AUTHORITATIVE) — run #3, corrected metric + full instrumentation, 2026-06-28

> Run: `ENABLE_LIVE_AI=true node --env-file=.env node_modules/.bin/vitest run evals/agent-loop.live.test.ts`
> (the same invocation; live armed via CLI override only). Frozen evidence: `lib/data/agent-loop.snapshot.json`
> (run #3 — corrected `selfCorrected` [final-redraft, Codex P1] + per-redraft/domain-mode instrumentation).
> **This run is a PROVIDER-DEGRADED DIAGNOSTIC, committed as such — NOT "the A3-7 result."** Read the two
> deliverables separately. (Run #2 failed on an over-strict per-item assert — a gate-BLOCKED final draft has
> `finalVerify.domain===null`; fixed to assert the domain provider only when the Domain Critic ran.)

A3-7 has **two distinct deliverables** — and they have **opposite outcomes**:

### Deliverable #1 — DECIDE THE 3 DEFERRED LABELS → ✅ DONE, CLEAN (run-independent)
This is the core A3-7 ask, and it does **NOT** depend on the (degraded) self-correction numbers:
- **Strategist → DEFER, by construction** — its output never reaches the Drafter prompt (run-independent).
- **Domain Critic → DEFER, policy-capped** by R-A3-8 (loop-run evidence cannot upgrade the "directional" label).
- **Router → DEFER** — the ablation's **`signals_differ=0` held in BOTH runs** (run #1: 23/23; run #3: 21/21
  live comparisons — all structurally identical to `strongReflection`), plus the finite-axis argument. Robust
  to the degradation. (Earn criterion was a conjunction; the failed first conjunct alone is sufficient to defer.)
- **Realized ledger: "1 earned (Drafter) + 3 deferred (Strategist · Domain Critic · Router)"** — Codex
  independently confirmed all three DEFER. The anti-theater bar (AM-7) working as designed; offline labeling
  needs no change. **This is the clean A3-7 win.**

### Deliverable #2 — K RE-PIN / CONVERGENCE PROOF (R-A3-9) → ⚠️ INCOMPLETE (provider-degraded)
- **DO NOT read run #3's `test_meets_floor: true` (exit-0/green) as a pass — it is VACUOUS.** The corrected
  metric + the degradation collapsed the tune rate to 1/7 → **K = floor(0.143×9) = 1**, so "test 1/9 ≥ 1" is
  an empty floor. Honest status: **the convergence measurement is INCOMPLETE; K is vacuous; an authoritative
  run is deferred** (it is NOT "K re-pinned, floor met").
- **Dominant finding — the live Gemini redraft is UNRELIABLE (~75%), independent of any Groq depletion:**
  **12/16 redrafts failed** with `"No object generated: could not parse the response"` (the AI SDK
  structured-output parse failure) — and these hit items 1/2/3 at iteration-1 **while Groq was still healthy**
  (`domainMode: LIVE_JUDGE`), same error string across all 12. So this is a **drafter** problem, NOT the Groq
  tail-depletion. Only **3/16** had a live FINAL redraft; genuine live self-correction was ~2/16. **That is
  "the loop under a drafter that fails to parse ~75% of redrafts" — NOT the loop's ceiling.**
  - **Hypothesis (TO VERIFY, not asserted):** `MAX_LIVE_OUTPUT_TOKENS = 2000` (`lib/agents/gemini.ts:108`)
    on the **thinking model** `gemini-2.5-flash` — reasoning tokens can exhaust the combined cap before the
    JSON completes → truncation → parse failure. **Verify by capturing `finishReason` on the failed redraft
    calls** (=== "length" confirms truncation). `finishReason` was NOT surfaced to this run's snapshot, so the
    cause is a hypothesis, not established.
- **Separate effect — Groq-window depletion on the FINAL 4 test items** (P-timeline-4/P-entity-3/
  P-capability-4/P-specific-4): both the Groq faithfulness judge AND the domain critic fell back
  (`FAILED_TO_FALLBACK`) → detection 11/16 (the other miss is P-specific-3, where the seed passed the live
  judge at iter-0 — 1 genuine detection miss). This is why run #3 is a degraded diagnostic, not clean.
- **Safety HELD throughout:** parse-failed redrafts fell back to the clean deterministic stub (sent only when
  send-eligible); non-converging items were HELD (`max_iterations` → `drafted`, never improperly sent);
  `assertEligibilityUntouched` never threw. The loop is SAFE even when the live drafter is unreliable.

### Honest one-line headline
**A3-7 decided the 3 labels (all DEFER — the clean win) and the loop's SAFETY posture held under this
degraded run (non-converging items HELD, no ineligible send, `assertEligibilityUntouched` never threw — the
latter provable only by the green run); but the live convergence/K measurement is INCOMPLETE — the Gemini
redraft fails to parse ~75% of the time, and the run was Groq-window-degraded — so an authoritative K awaits a
drafter fix + a fresh-window re-run.**

### Next steps (SEQUENCED — order matters)
1. **FIRST: fix the Gemini redraft reliability** (its own gated slice, NOT A3-7) — investigate/raise
   `MAX_LIVE_OUTPUT_TOKENS` and/or configure the `gemini-2.5-flash` thinking budget for structured output;
   capture `finishReason` to confirm the truncation hypothesis; (separately) harden `{{MERCHANT}}` fidelity.
2. **THEN: the clean R-A3-9 re-run** on a fresh Groq daily window. *A re-run alone (without #1) reproduces the
   parse failures* — so the drafter fix must precede it.
3. **Codex currency:** Codex reviewed run #1's snapshot + the `.some()` harness; the committed artifact is
   run #3's snapshot + the post-review conditional-assert fix — so the final diff needs a Codex confirming
   pass (or is committed test-verified with the re-pass as a dated obligation; push is HELD = reversible).
