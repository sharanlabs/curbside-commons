import { describe, expect, it } from "vitest";
import {
  accuracy,
  cohenKappa,
  confusionMatrix,
  f1,
  flipRate,
  metricReport,
  multiClassFlipRate,
  perClassReport,
  precision,
  recall,
  tnr,
  wilsonInterval,
  type LabeledClassification,
  type LabeledPrediction,
} from "@/evals/gold/metrics";

/**
 * Metric-math unit tests — PORTED from
 * `legacy/activation/evals/judge-calibration.test.ts` (the "judge-metrics — math",
 * "cohenKappa", "flipRate" describe blocks) at commit 896ab59. The hand-computed
 * confusion matrices and worked examples are carried VERBATIM (only the
 * `LabeledPrediction` literals drop the dropped `gatekeeperApproved` field). The
 * legacy suite stays frozen and still runs the originals under `npm run test:legacy`.
 *
 * These assert the MATH is correct, INDEPENDENT of any classifier — a real
 * classifier's quality is an owner-gated live output; there is none here.
 */

// A fixed, hand-labeled prediction set — the metric math's ground truth (independent of any model).
// 3 TP, 1 FN, 1 FP, 2 TN  → precision 3/4, recall 3/4, f1 3/4, tnr 2/3.
const FIXED: LabeledPrediction[] = [
  { id: "a", predicted: true, actual: true }, // TP
  { id: "b", predicted: true, actual: true }, // TP
  { id: "c", predicted: true, actual: true }, // TP
  { id: "d", predicted: false, actual: true }, // FN
  { id: "e", predicted: true, actual: false }, // FP
  { id: "f", predicted: false, actual: false }, // TN
  { id: "g", predicted: false, actual: false }, // TN
];

describe("metrics — math against hand-computed matrices (independent of any classifier)", () => {
  it("confusion matrix counts TP/FP/TN/FN correctly", () => {
    expect(confusionMatrix(FIXED)).toEqual({ tp: 3, fp: 1, tn: 2, fn: 1 });
  });

  it("precision / recall / F1 / TNR match hand computation", () => {
    const cm = confusionMatrix(FIXED);
    expect(precision(cm)).toBeCloseTo(3 / 4, 10);
    expect(recall(cm)).toBeCloseTo(3 / 4, 10);
    expect(f1(cm)).toBeCloseTo(3 / 4, 10); // 2pr/(p+r) = 2(.75)(.75)/1.5
    expect(tnr(cm)).toBeCloseTo(2 / 3, 10);
  });

  it("degenerate matrices do not divide by zero", () => {
    expect(precision({ tp: 0, fp: 0, tn: 5, fn: 0 })).toBe(0);
    expect(recall({ tp: 0, fp: 0, tn: 5, fn: 0 })).toBe(0);
    expect(f1({ tp: 0, fp: 0, tn: 5, fn: 0 })).toBe(0);
  });

  it("Wilson recall CI brackets the point estimate and stays in [0,1]", () => {
    const [lo, hi] = wilsonInterval(3, 4); // recall 0.75, n=4
    expect(lo).toBeGreaterThanOrEqual(0);
    expect(hi).toBeLessThanOrEqual(1);
    expect(lo).toBeLessThan(0.75);
    expect(hi).toBeGreaterThan(0.75);
    expect(wilsonInterval(0, 0)).toEqual([0, 0]); // empty ⇒ no interval
  });

  it("metricReport wires the matrix, point estimates, TPR===recall, and the Wilson CI together", () => {
    const r = metricReport(FIXED);
    expect(r.matrix).toEqual({ tp: 3, fp: 1, tn: 2, fn: 1 });
    expect(r.recall).toBeCloseTo(3 / 4, 10);
    expect(r.tpr).toBe(r.recall);
    expect(r.n).toBe(7);
    expect(r.recallCi95[0]).toBeLessThan(r.recall);
    expect(r.recallCi95[1]).toBeGreaterThan(r.recall);
  });
});

describe("cohenKappa — chance-corrected agreement against known inputs", () => {
  it("perfect agreement ⇒ κ = 1", () => {
    expect(cohenKappa([true, false, true, false], [true, false, true, false])).toBeCloseTo(1, 10);
  });
  it("a classic worked example ⇒ κ ≈ 0.4", () => {
    // 2x2: both-yes=20, A-yes/B-no=5, A-no/B-yes=10, both-no=15 (n=50). po=.70, pe=.50 ⇒ κ=.40
    const a: boolean[] = [];
    const b: boolean[] = [];
    const push = (n: number, av: boolean, bv: boolean) => {
      for (let i = 0; i < n; i++) {
        a.push(av);
        b.push(bv);
      }
    };
    push(20, true, true);
    push(5, true, false);
    push(10, false, true);
    push(15, false, false);
    expect(cohenKappa(a, b)).toBeCloseTo(0.4, 10);
  });
  it("at-chance agreement ⇒ κ ≈ 0; mismatched lengths throw", () => {
    expect(cohenKappa([true, true, false, false], [true, false, true, false])).toBeCloseTo(0, 10);
    expect(() => cohenKappa([true], [true, false])).toThrow();
  });
});

describe("flipRate — test-retest stability against known inputs", () => {
  it("unanimous runs ⇒ 0; one flipping item of two ⇒ 0.5", () => {
    expect(flipRate([[true, true, true], [false, false, false]])).toBe(0);
    expect(flipRate([[true, false, true], [false, false, false]])).toBe(0.5);
    expect(flipRate([])).toBe(0);
    expect(flipRate([[true]])).toBe(0); // single run can't flip
  });
});

describe("multi-class extension (F1b) — one-vs-rest reduces to the ported binary math", () => {
  type Cat = "delivery_fee" | "transaction_fee" | "not-a-permitted-fee";
  // 4 delivery (3 predicted delivery, 1 mispredicted), 3 transaction (all correct), 1 not-permitted.
  const items: LabeledClassification<Cat>[] = [
    { id: "1", predicted: "delivery_fee", actual: "delivery_fee" },
    { id: "2", predicted: "delivery_fee", actual: "delivery_fee" },
    { id: "3", predicted: "delivery_fee", actual: "delivery_fee" },
    { id: "4", predicted: "transaction_fee", actual: "delivery_fee" }, // a delivery missed
    { id: "5", predicted: "transaction_fee", actual: "transaction_fee" },
    { id: "6", predicted: "transaction_fee", actual: "transaction_fee" },
    { id: "7", predicted: "transaction_fee", actual: "transaction_fee" },
    { id: "8", predicted: "not-a-permitted-fee", actual: "not-a-permitted-fee" },
  ];

  it("per-class delivery: 3 TP, 0 FP, 1 FN ⇒ recall 3/4, precision 1", () => {
    const r = perClassReport(items, "delivery_fee");
    expect(r.matrix).toEqual({ tp: 3, fp: 0, tn: 4, fn: 1 });
    expect(r.precision).toBeCloseTo(1, 10);
    expect(r.recall).toBeCloseTo(3 / 4, 10);
  });

  it("per-class transaction: the mispredicted delivery is a false positive here", () => {
    const r = perClassReport(items, "transaction_fee");
    expect(r.matrix).toEqual({ tp: 3, fp: 1, tn: 4, fn: 0 });
    expect(r.precision).toBeCloseTo(3 / 4, 10);
    expect(r.recall).toBeCloseTo(1, 10);
  });

  it("accuracy is the fraction of exactly-correct labels", () => {
    expect(accuracy(items)).toBeCloseTo(7 / 8, 10);
    expect(accuracy([])).toBe(0);
  });
});

describe("multiClassFlipRate — the typed multi-class analogue of the ported boolean flipRate", () => {
  it("hand-computed: 1 flippy item of 4 ⇒ 0.25 (unanimity per item, rep-0 as reference)", () => {
    const runs: string[][] = [
      ["delivery_fee", "delivery_fee", "delivery_fee"], // unanimous
      ["transaction_fee", "transaction_fee", "transaction_fee"], // unanimous
      ["not-a-permitted-fee", "delivery_fee", "not-a-permitted-fee"], // FLIPPY
      ["basic_service_fee", "basic_service_fee", "basic_service_fee"], // unanimous
    ];
    expect(multiClassFlipRate(runs)).toBeCloseTo(1 / 4, 10);
  });

  it("edge conventions match the ported binary flipRate: empty ⇒ 0; K=1 items can never flip", () => {
    expect(multiClassFlipRate([])).toBe(0);
    expect(multiClassFlipRate([["delivery_fee"], ["transaction_fee"]])).toBe(0);
  });

  it("agrees with the ported boolean flipRate on a binary-encodable case (same semantics, typed lane)", () => {
    const asLabels: string[][] = [
      ["pos", "pos", "pos"],
      ["pos", "neg", "pos"],
      ["neg", "neg", "neg"],
    ];
    const asBools: boolean[][] = asLabels.map((runs) => runs.map((v) => v === "pos"));
    expect(multiClassFlipRate(asLabels)).toBeCloseTo(flipRate(asBools), 10);
  });
});
