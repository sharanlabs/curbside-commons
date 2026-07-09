import { describe, expect, it } from "vitest";
import { DeterministicBaselineClassifier, TRUE_CATEGORY_LABELS } from "@/lib/packs/fees";
import { FEE_LINES_GOLD_RETRY } from "@/evals/gold/fee-lines-gold-retry";
import { accuracy, perClassReport, type LabeledClassification } from "@/evals/gold/metrics";

/**
 * RETRY BASELINE MEASUREMENT — offline, $0, PINNED BEFORE the 2026-07-08 owner-armed
 * live recalibration run (pre-registration: docs/fee-classifier-recalibration-status.md;
 * the fee-baseline-measurement.test.ts pattern applied to the FRESH held-out split).
 *
 * MEASURED MECHANICALLY 2026-07-08 (measure-then-pin, same as the original):
 * **19/21 — IDENTICAL to the original split's pinned baseline**, and the two misses
 * are the exact analogues of the original's two (a relabeling and a bundling item —
 * the non-keyword-resolvable strata). This is the construction-rule mirror landing
 * where it should: the retry split is demonstrably neither easier nor harder for
 * the deterministic baseline than the exposed split was — the no-rigged-exam
 * property, machine-checked.
 *
 * The live floor therefore stays effectively ≥ 20/21 (the pre-registered rule is
 * the STRICTER of the absolute ≥20/21 bar and strictly-beating this pin).
 */

function toLabeled(items: readonly (typeof FEE_LINES_GOLD_RETRY)[number][]): LabeledClassification[] {
  return items.map((g) => ({
    id: g.id,
    predicted: DeterministicBaselineClassifier.classify(g.input).predicted,
    actual: g.trueCategory,
  }));
}

describe("F1b deterministic baseline — pinned measurement on the RETRY held-out split", () => {
  const labeled = toLabeled(FEE_LINES_GOLD_RETRY);

  it("overall accuracy on retry (n=21): pinned at 19/21 — identical to the original split's pin", () => {
    expect(labeled.length).toBe(21);
    expect(accuracy(labeled)).toBeCloseTo(19 / 21, 10);
  });

  it("per-category matrices — pinned snapshot (retry split)", () => {
    const expected: Record<string, { tp: number; fp: number; tn: number; fn: number }> = {
      delivery_fee: { tp: 4, fp: 2, tn: 15, fn: 0 },
      basic_service_fee: { tp: 3, fp: 0, tn: 18, fn: 0 },
      transaction_fee: { tp: 4, fp: 0, tn: 17, fn: 0 },
      enhanced_service_fee: { tp: 3, fp: 0, tn: 17, fn: 1 },
      "not-a-permitted-fee": { tp: 5, fp: 0, tn: 15, fn: 1 },
    };
    for (const cat of TRUE_CATEGORY_LABELS) {
      const r = perClassReport(labeled, cat);
      expect(r.matrix, `${cat} matrix`).toEqual(expected[cat]);
      expect(r.recallCi95[0]).toBeLessThanOrEqual(r.recall);
      expect(r.recallCi95[1]).toBeGreaterThanOrEqual(r.recall);
    }
  });

  it("the exact misses are the analogues of the original split's honest anti-theater gap", () => {
    const misses = labeled.filter((l) => l.predicted !== l.actual).map((l) => l.id).sort();
    expect(misses).toEqual(["bundle-retry-2", "relabel-retry-2"]);
  });
});
