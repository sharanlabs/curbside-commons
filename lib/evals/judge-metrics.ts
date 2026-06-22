/**
 * Calibration metrics for the semantic faithfulness judge (spec §4, R-CAL-6).
 *
 * These are PURE functions over labels/predictions — no judge, no model, no network. They are the
 * honest correctness guarantee for P2: the harness's math is unit-tested against hand-computed
 * confusion matrices, INDEPENDENT of any judge's quality. (A real judge's quality is a P3 output —
 * there is no live judge in P2. The deterministic mock judge is only a plumbing stub, never a
 * calibration result.)
 *
 * The positive class is FABRICATED (a draft carrying an unsupported assertion). Under heavy class
 * imbalance raw accuracy is misleading, so we report precision/recall/F1 on the fabrication class,
 * a Wilson CI on recall, chance-corrected agreement (Cohen's κ), and a test-retest flip-rate.
 *
 * R-CAL-1 (headline): the judge's real input is the residual that already CLEARED the deterministic
 * gatekeeper, so the headline metric is recall on the gatekeeper-PASSING subset — not recall in a
 * vacuum. `gatekeeperPassingSubset` enforces that partition before metrics are taken.
 */

/** A draft-level prediction vs. label. predicted/actual = "is this draft FABRICATED?" */
export interface LabeledPrediction {
  id: string;
  predictedFabricated: boolean;
  actualFabricated: boolean;
  /** Did the REAL deterministic gatekeeper approve this draft for human review (so it reaches the judge)? */
  gatekeeperApproved: boolean;
}

export interface ConfusionMatrix {
  /** predicted fabricated & actually fabricated */
  tp: number;
  /** predicted fabricated & actually clean */
  fp: number;
  /** predicted clean & actually clean */
  tn: number;
  /** predicted clean & actually fabricated (a MISSED fabrication — the costly error) */
  fn: number;
}

export interface MetricReport {
  matrix: ConfusionMatrix;
  precision: number;
  recall: number;
  f1: number;
  /** TPR === recall; surfaced explicitly per R-CAL-6. */
  tpr: number;
  tnr: number;
  /** 95% Wilson score interval on recall (TPR), reported because N is small + imbalanced. */
  recallCi95: [number, number];
  /** Total drafts scored (the size of the subset the report covers). */
  n: number;
}

const ratio = (num: number, den: number): number => (den === 0 ? 0 : num / den);

export function confusionMatrix(preds: LabeledPrediction[]): ConfusionMatrix {
  const cm: ConfusionMatrix = { tp: 0, fp: 0, tn: 0, fn: 0 };
  for (const p of preds) {
    if (p.actualFabricated && p.predictedFabricated) cm.tp++;
    else if (!p.actualFabricated && p.predictedFabricated) cm.fp++;
    else if (!p.actualFabricated && !p.predictedFabricated) cm.tn++;
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
 * R-CAL-1: restrict to drafts the REAL gatekeeper approved (the judge's actual input is the
 * residual that cleared the deterministic gate). The headline report is taken on THIS subset.
 * Drafts the gatekeeper already blocked are "caught by the deterministic gate" — they test the
 * gate, not the judge, and must not inflate (or deflate) the judge's marginal-value numerator.
 */
export function gatekeeperPassingSubset(preds: LabeledPrediction[]): LabeledPrediction[] {
  return preds.filter((p) => p.gatekeeperApproved);
}

/** The headline metric (R-CAL-1): the full metric report computed on the gatekeeper-passing subset. */
export function headlineReport(preds: LabeledPrediction[]): MetricReport {
  return metricReport(gatekeeperPassingSubset(preds));
}

/**
 * Cohen's κ for two binary raters (judge vs. expert label) — chance-corrected agreement, the honest
 * answer to "agreement under rare positives" (raw agreement misleads when one class dominates).
 * κ = (po - pe) / (1 - pe). Returns 1 for perfect agreement; ≤0 for at-or-below-chance.
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
 * Test-retest flip-rate: over K repeated judgments of each item (the model is NOT bit-deterministic
 * at temp 0), the fraction of items whose verdict is not unanimous across the K runs. A flippy judge
 * silently corrupts the regression lock, so this is a calibration gate in its own right (R-CAL-6).
 * `verdictsPerItem[i]` = the K boolean verdicts for item i.
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
