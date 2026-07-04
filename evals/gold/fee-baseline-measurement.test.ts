import { describe, expect, it } from "vitest";
import { DeterministicBaselineClassifier, TRUE_CATEGORY_LABELS } from "@/lib/packs/fees";
import { FEE_LINES_GOLD, FEE_LINES_GOLD_TEST, FEE_LINES_GOLD_TUNE } from "@/evals/gold/fee-lines-gold";
import { accuracy, perClassReport, type LabeledClassification } from "@/evals/gold/metrics";

/**
 * BASELINE MEASUREMENT (deliverable 5, C8) — offline, $0. Runs the DETERMINISTIC
 * baseline classifier ({@link DeterministicBaselineClassifier}) over the F1b gold
 * set and computes per-category precision/recall/F1 + Wilson 95% CIs via the ported
 * metrics ({@link perClassReport}). Results are asserted as a PINNED snapshot — a
 * regression in `BASELINE_RULES` (classifier.ts) fails this test loudly.
 *
 * ── HONESTY (AM-7 / C8) ─────────────────────────────────────────────────────
 * This is the DETERMINISTIC BASELINE on a SMALL, SYNTHETIC gold set — NOT the C8
 * "held-out LLM classifier" claim. That claim requires an owner-gated LIVE run
 * (docs/plan-f1b-classifier.md) measured against these SAME pre-registered floors;
 * nothing here is a "calibrated" claim about any model. The headline split is TEST
 * (held-out) — the same split any future live run must be scored on, so the
 * baseline and the live run are compared on the identical footing.
 *
 * The misses below are exactly the cases keyword rules cannot resolve: a genuine
 * relabeling (label still reads "delivery" even though the true charge is now the
 * enhanced tier) and a genuine bundling (label reads like a marketing/enhanced
 * extra even though it truly lumps >1 charge). This is the intended anti-theater
 * gap — the floor an LLM classifier must beat, not a floor it is assumed to beat.
 */

function toLabeled(items: readonly (typeof FEE_LINES_GOLD)[number][]): LabeledClassification[] {
  return items.map((g) => ({
    id: g.id,
    predicted: DeterministicBaselineClassifier.classify(g.input).predicted,
    actual: g.trueCategory,
  }));
}

describe("F1b deterministic baseline — pinned measurement on the HELD-OUT (test) split", () => {
  const labeled = toLabeled(FEE_LINES_GOLD_TEST);

  it("baseline classifier never claims to be earned/calibrated", () => {
    expect(DeterministicBaselineClassifier.earnsLabel).toBe(false);
  });

  it("overall accuracy on test (n=21): pinned at 19/21 = 0.9047619...", () => {
    expect(labeled.length).toBe(21);
    expect(accuracy(labeled)).toBeCloseTo(19 / 21, 10);
  });

  it("per-category precision/recall/F1 + Wilson CI — pinned snapshot (test split)", () => {
    const expected: Record<string, { tp: number; fp: number; tn: number; fn: number; precision: number; recall: number; f1: number }> = {
      delivery_fee: { tp: 4, fp: 1, tn: 16, fn: 0, precision: 0.8, recall: 1, f1: 8 / 9 },
      basic_service_fee: { tp: 3, fp: 0, tn: 18, fn: 0, precision: 1, recall: 1, f1: 1 },
      transaction_fee: { tp: 4, fp: 0, tn: 17, fn: 0, precision: 1, recall: 1, f1: 1 },
      enhanced_service_fee: { tp: 3, fp: 1, tn: 16, fn: 1, precision: 0.75, recall: 0.75, f1: 0.75 },
      "not-a-permitted-fee": { tp: 5, fp: 0, tn: 15, fn: 1, precision: 1, recall: 5 / 6, f1: 10 / 11 },
    };
    for (const cat of TRUE_CATEGORY_LABELS) {
      const r = perClassReport(labeled, cat);
      const exp = expected[cat];
      expect(r.matrix, `${cat} matrix`).toEqual({ tp: exp.tp, fp: exp.fp, tn: exp.tn, fn: exp.fn });
      expect(r.precision, `${cat} precision`).toBeCloseTo(exp.precision, 10);
      expect(r.recall, `${cat} recall`).toBeCloseTo(exp.recall, 10);
      expect(r.f1, `${cat} f1`).toBeCloseTo(exp.f1, 10);
      // Wilson CI brackets the point estimate (or collapses to a point at n=0/1 boundary cases).
      expect(r.recallCi95[0]).toBeLessThanOrEqual(r.recall);
      expect(r.recallCi95[1]).toBeGreaterThanOrEqual(r.recall);
    }
  });

  it("the exact misses are the honest anti-theater gap (relabeling + bundling — not keyword-resolvable)", () => {
    const misses = labeled.filter((l) => l.predicted !== l.actual).map((l) => l.id).sort();
    expect(misses).toEqual(["bundle-test-2", "relabel-test-2"]);
  });
});

describe("F1b deterministic baseline — tune split + full gold set (context, not the headline)", () => {
  it("tune split accuracy: pinned at 18/21 = 0.8571428...", () => {
    const labeled = toLabeled(FEE_LINES_GOLD_TUNE);
    expect(accuracy(labeled)).toBeCloseTo(18 / 21, 10);
    const misses = labeled.filter((l) => l.predicted !== l.actual).map((l) => l.id).sort();
    expect(misses).toEqual(["bundle-tune-3", "misclass-tune-3", "relabel-tune-1"]);
  });

  it("full-gold-set accuracy: pinned at 37/42 = 0.8809523...", () => {
    const labeled = toLabeled(FEE_LINES_GOLD);
    expect(labeled.length).toBe(42);
    expect(accuracy(labeled)).toBeCloseTo(37 / 42, 10);
  });

  it("tune is measured but is NOT the reported headline (test is) — R-DHON-3 tune/test discipline", () => {
    // This test exists to make the discipline explicit and machine-checked: any
    // future live-classifier tuning happens against `FEE_LINES_GOLD_TUNE`, and the
    // reported floor-beating claim is always scored on `FEE_LINES_GOLD_TEST`.
    expect(FEE_LINES_GOLD_TUNE.length).toBe(FEE_LINES_GOLD_TEST.length);
  });
});
