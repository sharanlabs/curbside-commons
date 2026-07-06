/**
 * Classification metrics — the PURE math (precision / recall / F1, Wilson score
 * interval, Cohen's κ, test-retest flip-rate) F1b measures the fee-line classifier
 * against.
 *
 * PROVENANCE (conscious migration, W0-ledger style): the binary confusion-matrix
 * core below is PORTED VERBATIM from
 *   `legacy/activation/lib/evals/judge-metrics.ts`
 * as it stood at commit 896ab59 (the F1a spine). The legacy file stays FROZEN and
 * RUNNABLE — it is NOT modified, and `npm run test:legacy` keeps exercising it via
 * `legacy/activation/evals/judge-calibration.test.ts`. This is a copy, not a move.
 *
 * WHAT WAS PORTED (reusable pure math, verbatim):
 *   ratio · ConfusionMatrix · confusionMatrix · precision · recall · tnr · f1 ·
 *   wilsonInterval · metricReport · cohenKappa · flipRate.
 *
 * WHAT WAS LEFT BEHIND (semantic-judge-specific, NOT reusable here):
 *   - `LabeledPrediction.gatekeeperApproved` — the deterministic-gatekeeper flag
 *     that scopes the semantic judge's headline to its gate-passing residual
 *     (R-CAL-1). The fee classifier has no upstream gatekeeper, so the field is
 *     dropped and the binary `LabeledPrediction` here carries only id + the two
 *     boolean labels.
 *   - `gatekeeperPassingSubset()` and `headlineReport()` — both are pure R-CAL-1
 *     partitioning over that flag; they have no analogue in the classifier setting
 *     and are intentionally NOT carried over.
 *
 * WHAT WAS ADDED (F1b multi-class extension — NOT from legacy):
 *   the fee classifier is MULTI-CLASS (five true-category labels), whereas the
 *   legacy judge is binary (fabricated vs clean). {@link perClassReport} reduces
 *   the multi-class problem to the ported binary core via a one-vs-rest partition
 *   per label, so the per-category precision/recall/F1 + Wilson CI the C8 criterion
 *   asks for reuse the exact same hand-checked math, never a re-derivation.
 *
 * These are PURE functions over labels/predictions — no classifier, no model, no
 * network. The math is unit-tested (`metrics.test.ts`, ported from the legacy
 * calibration suite) against hand-computed confusion matrices, INDEPENDENT of any
 * classifier's quality (a real classifier's quality is an owner-gated live output;
 * there is no live classifier here).
 */

/** A binary prediction vs. label for one item. predicted/actual = "is this the positive class?" */
export interface LabeledPrediction {
  id: string;
  predicted: boolean;
  actual: boolean;
}

export interface ConfusionMatrix {
  /** predicted positive & actually positive */
  tp: number;
  /** predicted positive & actually negative */
  fp: number;
  /** predicted negative & actually negative */
  tn: number;
  /** predicted negative & actually positive (a MISSED positive) */
  fn: number;
}

export interface MetricReport {
  matrix: ConfusionMatrix;
  precision: number;
  recall: number;
  f1: number;
  /** TPR === recall; surfaced explicitly. */
  tpr: number;
  tnr: number;
  /** 95% Wilson score interval on recall (TPR), reported because N is small + imbalanced. */
  recallCi95: [number, number];
  /** Total items scored (the size of the subset the report covers). */
  n: number;
}

const ratio = (num: number, den: number): number => (den === 0 ? 0 : num / den);

export function confusionMatrix(preds: LabeledPrediction[]): ConfusionMatrix {
  const cm: ConfusionMatrix = { tp: 0, fp: 0, tn: 0, fn: 0 };
  for (const p of preds) {
    if (p.actual && p.predicted) cm.tp++;
    else if (!p.actual && p.predicted) cm.fp++;
    else if (!p.actual && !p.predicted) cm.tn++;
    else cm.fn++;
  }
  return cm;
}

export const precision = (cm: ConfusionMatrix): number => ratio(cm.tp, cm.tp + cm.fp);
export const recall = (cm: ConfusionMatrix): number => ratio(cm.tp, cm.tp + cm.fn);
export const tnr = (cm: ConfusionMatrix): number => ratio(cm.tn, cm.tn + cm.fp);
export function f1(cm: ConfusionMatrix): number {
  const p = precision(cm);
  const r = recall(cm);
  return p + r === 0 ? 0 : (2 * p * r) / (p + r);
}

/**
 * Wilson score interval for a binomial proportion — robust for small N and proportions near 0/1
 * (where the normal approximation breaks). successes/total = recall's tp/(tp+fn). z=1.96 ⇒ 95%.
 */
export function wilsonInterval(successes: number, total: number, z = 1.96): [number, number] {
  if (total === 0) return [0, 0];
  const phat = successes / total;
  const z2 = z * z;
  const denom = 1 + z2 / total;
  const center = (phat + z2 / (2 * total)) / denom;
  const margin = (z * Math.sqrt((phat * (1 - phat)) / total + z2 / (4 * total * total))) / denom;
  return [Math.max(0, center - margin), Math.min(1, center + margin)];
}

export function metricReport(preds: LabeledPrediction[]): MetricReport {
  const matrix = confusionMatrix(preds);
  const r = recall(matrix);
  return {
    matrix,
    precision: precision(matrix),
    recall: r,
    f1: f1(matrix),
    tpr: r,
    tnr: tnr(matrix),
    recallCi95: wilsonInterval(matrix.tp, matrix.tp + matrix.fn),
    n: preds.length,
  };
}

/**
 * Cohen's κ for two binary raters — chance-corrected agreement, the honest answer to "agreement
 * under rare positives" (raw agreement misleads when one class dominates). κ = (po - pe) / (1 - pe).
 * Returns 1 for perfect agreement; ≤0 for at-or-below-chance.
 */
export function cohenKappa(raterA: boolean[], raterB: boolean[]): number {
  if (raterA.length !== raterB.length) {
    throw new Error("cohenKappa: rater arrays must be equal length");
  }
  const n = raterA.length;
  if (n === 0) return 0;
  let agree = 0;
  let aPos = 0;
  let bPos = 0;
  for (let i = 0; i < n; i++) {
    if (raterA[i] === raterB[i]) agree++;
    if (raterA[i]) aPos++;
    if (raterB[i]) bPos++;
  }
  const po = agree / n;
  // expected agreement by chance: P(both positive) + P(both negative)
  const pe = (aPos / n) * (bPos / n) + (1 - aPos / n) * (1 - bPos / n);
  if (pe === 1) return 1; // both raters constant & identical ⇒ perfect, by convention
  return (po - pe) / (1 - pe);
}

/**
 * Test-retest flip-rate: over K repeated judgments of each item (a live model is NOT
 * bit-deterministic at temp 0), the fraction of items whose verdict is not unanimous across the K
 * runs. A flippy classifier silently corrupts a regression lock, so this is a calibration gate in
 * its own right. `verdictsPerItem[i]` = the K boolean verdicts for item i.
 */
export function flipRate(verdictsPerItem: boolean[][]): number {
  if (verdictsPerItem.length === 0) return 0;
  let flipped = 0;
  for (const runs of verdictsPerItem) {
    if (runs.length <= 1) continue;
    const first = runs[0];
    if (runs.some((v) => v !== first)) flipped++;
  }
  return flipped / verdictsPerItem.length;
}

// ── F1b multi-class extension (NOT ported — built on the binary core above) ────

/** One multi-class prediction: the string label predicted vs. the true string label. */
export interface LabeledClassification<L extends string = string> {
  id: string;
  predicted: L;
  actual: L;
}

/**
 * Reduce a multi-class result set to the binary confusion matrix for ONE target
 * label (one-vs-rest: positive ≙ "== target"), then run the ported binary
 * {@link metricReport}. This is how per-category precision/recall/F1 + Wilson CI
 * (C8) are computed — every number flows through the hand-checked binary math.
 */
export function perClassReport<L extends string>(
  items: readonly LabeledClassification<L>[],
  target: L,
): MetricReport {
  const binary: LabeledPrediction[] = items.map((it) => ({
    id: it.id,
    predicted: it.predicted === target,
    actual: it.actual === target,
  }));
  return metricReport(binary);
}

/** Overall multi-class accuracy — the fraction of items whose predicted label equals the true label. */
export function accuracy<L extends string>(items: readonly LabeledClassification<L>[]): number {
  if (items.length === 0) return 0;
  let correct = 0;
  for (const it of items) if (it.predicted === it.actual) correct++;
  return correct / items.length;
}

/**
 * Multi-class test-retest flip-rate: the fraction of items whose K repeated predicted
 * LABELS are not unanimous. The typed multi-class analogue of the ported boolean
 * {@link flipRate} (same semantics — "any rep differs from rep-0 ⇒ flipped"); a separate
 * function rather than a string-through-boolean coercion so the ported binary core stays
 * verbatim (frontier-advisor ruling, 2026-07-05). `labelsPerItem[i]` = item i's K labels.
 */
export function multiClassFlipRate<L extends string>(labelsPerItem: readonly (readonly L[])[]): number {
  if (labelsPerItem.length === 0) return 0;
  let flipped = 0;
  for (const runs of labelsPerItem) {
    if (runs.length <= 1) continue;
    const first = runs[0];
    if (runs.some((v) => v !== first)) flipped++;
  }
  return flipped / labelsPerItem.length;
}
