# F1b — LLM line-item classifier: design + judge-recalibration plan

**Status (2026-07-04): DESIGN ONLY — no live classifier is wired. This document is
the pre-registration; nothing here is a "calibrated" claim. The classifier seam
(`lib/packs/fees/classifier.ts`) exists and is measured against the deterministic
baseline (`evals/gold/fee-baseline-measurement.test.ts`); the live lane described
below requires an explicit **owner GO** before any provider call happens.**
▸ *Plain: this page is the recipe for the AI version of the fee-line classifier —
written down and agreed on BEFORE anyone runs it, so nobody can move the goalposts
after seeing the score. Nothing here has actually called an AI model yet.*

**Plan:** `docs/plan-truth-audit-execution.md` §5 F1, C8 · **Precedent:** the domain
judge's R-DHON-3 pre-registration (`docs/domain-calibration-status.md`) and the
faithfulness judge's calibration harness (`legacy/activation/evals/judge-calibration.test.ts`,
`legacy/activation/lib/evals/judge-metrics.ts`) · **Register note:** professional
register leads; plain-English lines are marked ▸ (per `docs/documentation-standard.md`).

---

## 1 · Scope and honesty framing (AM-7)

The F1a deterministic spine audits a fee statement **as declared** by the platform.
The classifier answers a different question: **what is this line really?** — so a
mislabeled charge (marketing dressed as delivery, a lumped bundle, a promo
deduction wearing a legal-sounding name) can be surfaced even though its DECLARED
category alone gives the deterministic engine nothing to flag.

**The anti-theater floor (AM-7 precedent — the same bar the semantic/domain judges
cleared before earning "calibrated"):** an LLM classifier earns the "calibrated"
label **only** by beating the deterministic baseline
(`DeterministicBaselineClassifier`, `lib/packs/fees/classifier.ts`) on **held-out**
gold, in an **owner-gated live run**. Until that happens:

- the offline **mock oracle** (`makeMockOracleClassifier`) is a wiring stub — it
  reads the intended answer and returns it, so it structurally cannot "beat" or
  "lose to" anything; it exists only to prove the advisory seam can surface a
  candidate (F1b deliverable 7's wiring proof);
- the deterministic baseline is the **floor being measured**, not a result to beat
  itself — it is honestly imperfect (misses genuine relabeling/bundling that
  keyword rules cannot resolve from label text alone; see the pinned baseline
  measurement for the exact misses);
- **no code path in this repo calls a live model for this classifier.**
  `LIVE_CLASSIFIER_DESIGN.wired === false` is machine-asserted
  (`evals/packs/fees-classifier.test.ts`).

▸ *Plain: the "dumb keyword rules" floor is deliberately not very smart — that's the
whole point. The AI version only gets to call itself good once it actually beats
that floor on examples it has never seen, in a real run the owner explicitly
approves. Right now, nothing has run for real.*

---

## 2 · Live classifier design

### 2.1 Model lane

| Lane | Model | Cost | Status |
| --- | --- | --- | --- |
| **Primary** | Groq free tier, `openai/gpt-oss-120b` class (the same cross-family model already calibrated for the domain judge — `docs/domain-calibration-status.md`) | $0 | Precedent, not yet run for F1b |
| **Secondary / demo color** | Gemini, current production model, freshness-checked at time of use | ≤ $5 hard cap (project-wide; F1b shares the same budget, never a separate allowance) | Demo-scoped only — never load-bearing for the C8 claim |

▸ *Plain: the free AI lane (Groq) does the real work; the paid one (Gemini) never
does more than $5 total across the whole project and is never the thing the "it
beat the floor" claim depends on.*

### 2.2 Typed prompt-input contract — NO ground-truth leakage

The classifier — mock, baseline, or a future live provider — sees **only**
`ClassifierInput` (`lib/packs/fees/classifier.ts`):

```
{
  label: string;                              // the platform's free-text line label
  declaredCategory: DeclaredCategory;          // what the platform claims
  amountCents: number;
  orderPurchasePriceCents: number;
  isRefund: boolean;
  passthroughDocumented: boolean;
  siblingDeclaredCategories: DeclaredCategory[]; // benign statement context
}
```

This shape carries **no** `trueCategory`, no answer-key reference, and nothing
derived from either. A live prompt is built from these fields and these fields
only — `toClassifierInput()` is the single, audited constructor of this contract,
and `evals/packs/fees-classifier.test.ts` asserts its key set has no ground-truth
field. The answer key (`evals/gold/fee-lines-gold.ts`) never enters a live prompt.

### 2.3 Structured output shape

```
{ predicted: TrueCategoryLabel, rationale: string }
```

`TrueCategoryLabel` = one of the four legal categories (`delivery_fee` ·
`basic_service_fee` · `transaction_fee` · `enhanced_service_fee`) or the catch-all
`"not-a-permitted-fee"`. A live implementation MUST validate the parsed output
against this exact 5-member vocabulary before use (schema-checked, not
trust-parsed) — the same discipline the domain judge's Zod-verdict pattern uses.

### 2.4 Failure / fallback semantics — the FAILED_TO_FALLBACK precedent

Following the established pattern (`legacy/activation/lib/agents/domain-judge.ts`,
`draft.ts`): on any parse failure, schema-validation failure, timeout, or budget
exhaustion, the live classifier degrades to **`FAILED_TO_FALLBACK`** — it defers to
the deterministic baseline's prediction for that line and labels the result as a
fallback, honestly. It **never** silently invents a label and never presents a
fallback result as a live one. A cumulative-budget guard mirrors the existing
`lib/agents/budget.ts` pattern (fail-closed at the $5 project cap).

### 2.5 Cross-family judge note

The classifier and any future confirming judge must be **cross-family** (maker ≠
judge, `RULES.md` — the same principle already applied: Groq for the primary
classifier, a different-vendor model if a second opinion is ever needed). No model
grades its own classification.

---

## 3 · Judge-recalibration plan (R-DHON-3)

### 3.1 The PRE-REGISTERED bar — pinned BEFORE any live run, on the held-out (test) split

Per R-DHON-3 (`docs/spec-domain-judge.md`; "no 'built/calibrated' claim ships until
the metrics exist AND clear the pre-registered bar"), the floors below are fixed
**now**, against the gold set already committed
(`evals/gold/fee-lines-gold.ts` — 21 tune + 21 test items, 3 per §7 class per
split + 3 clean per split). Recall-favoring, matching the domain-judge precedent's
rationale: a false relabeling candidate just adds one human-reviewed advisory line;
a missed one lets a real mislabel stand.

| Metric | Floor | Note |
| --- | --- | --- |
| **Overall held-out accuracy** | **≥ 0.90** | the deterministic baseline already measures 19/21 = 0.905 on this split — the live classifier must be AT LEAST this good, ideally strictly better |
| **Overall held-out precision (macro, across the 5 labels)** | **≥ 0.85** | macro-averaged across `delivery_fee / basic_service_fee / transaction_fee / enhanced_service_fee / not-a-permitted-fee` |
| **Per-class recall — every one of the 5 labels** | **≥ 0.70** | the binding per-class floor; a class the live run cannot resolve at all fails outright, not silently averaged away |
| **Per-class recall — `enhanced_service_fee` and `not-a-permitted-fee` specifically** | **≥ 0.80** | these are the two classes carrying the genuine relabeling/bundling drift the baseline MISSES (`relabel-test-2`, `bundle-test-2`) — the live run must show it actually resolves the cases the floor cannot, not just match it elsewhere |
| **Test-retest flip-rate (K=3, temp 0)** | **≤ 0.15** | a flippy classifier corrupts the regression lock (ported `flipRate`, `evals/gold/metrics.ts`) |
| **Cohen's κ (classifier vs gold label, per-class one-vs-rest, macro)** | **≥ 0.60** | substantial agreement (Landis–Koch), same bar the domain judge used |

**Non-vacuous K rule (the established pattern, `docs/a3-7-live-run-status.md`):**
every per-class recall floor above is measured against a denominator (true count of
that class in the held-out split) that is **already ≥ 3** by the gold set's own
pinned composition (`fee-lines-gold-composition.test.ts` enforces 3 per class per
split) — so no per-class recall can vacuously "pass" on a 0/0 or 1/1 denominator.
If any future gold-set edit ever drops a class below 3 held-out instances, the
composition test fails first and the recalibration run does not proceed.

### 3.2 Decision rule

IF the live run (Groq, held-out/test split, K=3 reps/item, temp 0) clears **every**
floor above → eval-lock the run (freeze the live-classifier snapshot; add an
offline regression test asserting the frozen fixture only, never a live re-run —
the R-DHON-4 pattern) + flip this doc and the slice record from "designed, not
earned" → **"calibrated — [directional/validated], metrics = X"** (R-DHON-3),
citing the exact gold-set size as the honesty caveat (this gold set is small and
synthetic — see §4). ELSE → tune the prompt/threshold on the **tune** split only
and re-run; **never tune on the test split** (tune-on-tune/report-on-test
discipline, unchanged from every prior calibration in this repo).

### 3.3 Groq daily-window pacing lesson (carried forward)

A prior live run in this repo (`docs/a3-7-live-run-status.md`) depleted the Groq
free-tier **daily token window (TPD, not a per-call cap)** partway through a single
run, degrading the tail. **Sizing lesson applied here:** the F1b gold set is 42
items total (21 held-out); at K=3 reps/item that is ≤126 classifier calls — small
relative to the domain-judge's 36-item×K=3 run that completed within one window —
but the run must still be scheduled as **one paced pass**, never assumed
re-runnable same-day if it fails partway, and the daily-window state must be
checked (`groq-preflight` equivalent) immediately before starting.

### 3.4 Cost estimate

$0 (Groq free tier covers the full 42-item × K=3 run). No Gemini spend is required
for the C8 claim; Gemini stays reserved for demo color elsewhere in the project,
under the existing project-wide $5 cap.

### 3.5 The OWNER GATE (binding, restated)

**No live run happens without the owner's explicit word.** No "calibrated" claim —
partial or full — ships below the floors in §3.1. If the owner declines or defers
the live run, the classifier stays permanently in "designed, not earned" status and
the deterministic baseline remains the only measured artifact; that is an honest,
shippable end state, not a blocker on anything else in the project.

---

## 4 · What this gold set can and cannot support

The 42-item gold set (`evals/gold/fee-lines-gold.ts`) is **small and entirely
synthetic** — realistic platform wording, but invented, not mined from real
statements. It is sufficient to:

- run the offline deterministic-baseline measurement (done, this slice);
- give a future live run a pre-registered floor to clear.

It is **not** sufficient to claim statistical adequacy for a production deployment
claim, and no document in this project may say otherwise. Any future scale-up of
the gold set (more items per class, real-world label-text mining) is a distinct,
separately-scoped task, not implied by this design.

▸ *Plain: this answer key is a solid small test, not a big proof. It's enough to
grade a first real attempt fairly — it is not enough to say "this works in the real
world" no matter what the first attempt scores.*

---

## 5 · Cross-references

- Classifier seam: `lib/packs/fees/classifier.ts`
- Advisory wiring: `lib/packs/fees/classified-audit.ts`
- Gold set + composition test: `evals/gold/fee-lines-gold.ts`, `evals/gold/fee-lines-gold-composition.test.ts`
- Metrics (ported): `evals/gold/metrics.ts`, `evals/gold/metrics.test.ts`
- Baseline measurement (pinned): `evals/gold/fee-baseline-measurement.test.ts`
- Slice record: `docs/reviews/f1b-slice-record.md`
