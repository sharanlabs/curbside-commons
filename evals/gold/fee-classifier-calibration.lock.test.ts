import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { accuracy, multiClassFlipRate, perClassReport, type LabeledClassification } from "@/evals/gold/metrics";
import { TRUE_CATEGORY_LABELS, type TrueCategoryLabel } from "@/lib/packs/fees";

/**
 * EVAL-LOCK for the F1b live-classifier calibration run #2 (2026-07-05) — the
 * R-DHON-4 pattern: this test reads the FROZEN snapshot
 * (`lib/data/fee-classifier-calibration.snapshot.json`) and asserts (a) its
 * internal consistency (every headline number recomputes from the per-item
 * records through the same ported math) and (b) the run's HONEST verdict state:
 * clean integrity, floors NOT all cleared, **the label DEFERS**.
 *
 * It makes NO live call and can never change the result — it exists so the frozen
 * record cannot silently drift (an edit to the snapshot that improves any number
 * without the per-item records to back it goes RED here) and so the DEFER state
 * cannot quietly become a "calibrated" claim without a new, owner-gated,
 * separately pre-registered run replacing this lock consciously.
 */

interface SnapshotItem {
  id: string;
  split: "tune" | "test";
  trueCategory: TrueCategoryLabel;
  reps: TrueCategoryLabel[];
  predicted: TrueCategoryLabel;
}

interface Snapshot {
  model: string;
  K: number;
  heldOut: {
    n: number;
    correct: number;
    macroPrecision: number;
    macroKappa: number;
    flipRate: number;
    items: SnapshotItem[];
  };
  floors: Record<string, { pass: boolean }>;
  floorsCleared: boolean;
  runIntegrity: { degraded: boolean };
  misses: { id: string; predicted: string; actual: string }[];
}

const snapshot = JSON.parse(
  readFileSync("lib/data/fee-classifier-calibration.snapshot.json", "utf8"),
) as Snapshot;

describe("F1b calibration eval-lock — the frozen run #2 record (R-DHON-4)", () => {
  const labeled: LabeledClassification<TrueCategoryLabel>[] = snapshot.heldOut.items.map((r) => ({
    id: r.id,
    predicted: r.predicted,
    actual: r.trueCategory,
  }));

  it("run integrity: authoritative (not degraded), 21 held-out items, K=3 complete, rep-0 is the prediction of record", () => {
    expect(snapshot.runIntegrity.degraded).toBe(false);
    expect(snapshot.heldOut.n).toBe(21);
    expect(snapshot.heldOut.items).toHaveLength(21);
    expect(snapshot.K).toBe(3);
    for (const item of snapshot.heldOut.items) {
      expect(item.reps).toHaveLength(3);
      expect(item.predicted).toBe(item.reps[0]);
    }
  });

  it("headline accuracy recomputes from the per-item records: 20/21", () => {
    const correct = labeled.filter((it) => it.predicted === it.actual).length;
    expect(correct).toBe(20);
    expect(correct).toBe(snapshot.heldOut.correct);
    expect(accuracy(labeled)).toBeCloseTo(20 / 21, 10);
  });

  it("the floor pattern recomputes: 5 of 6 pass; enhanced_service_fee recall 3/4 = 0.75 is the single miss", () => {
    const enhanced = perClassReport(labeled, "enhanced_service_fee");
    expect(enhanced.matrix).toEqual({ tp: 3, fp: 0, tn: 17, fn: 1 });
    expect(enhanced.recall).toBeCloseTo(0.75, 10);
    const napf = perClassReport(labeled, "not-a-permitted-fee");
    expect(napf.recall).toBeCloseTo(1, 10);
    // Every label's ≥0.70 floor holds; the ≥0.80 two-class floor fails ONLY on enhanced.
    for (const label of TRUE_CATEGORY_LABELS) {
      expect(perClassReport(labeled, label).recall, label).toBeGreaterThanOrEqual(0.7);
    }
    expect(snapshot.floors.perClassRecallBaselineMissed.pass).toBe(false);
    const passCount = Object.values(snapshot.floors).filter((f) => f.pass).length;
    expect(passCount).toBe(5);
  });

  it("macro precision + flip-rate recompute and clear their floors", () => {
    const macroP =
      TRUE_CATEGORY_LABELS.reduce((sum, label) => sum + perClassReport(labeled, label).precision, 0) /
      TRUE_CATEGORY_LABELS.length;
    expect(macroP).toBeCloseTo(snapshot.heldOut.macroPrecision, 10);
    expect(macroP).toBeGreaterThanOrEqual(0.85);
    const flip = multiClassFlipRate(snapshot.heldOut.items.map((r) => r.reps));
    expect(flip).toBe(0);
    expect(flip).toBe(snapshot.heldOut.flipRate);
  });

  it("THE VERDICT STATE IS LOCKED: floorsCleared=false — the label DEFERS; the single miss is relabel-test-2, unanimous", () => {
    expect(snapshot.floorsCleared).toBe(false);
    expect(snapshot.misses).toEqual([
      { id: "relabel-test-2", predicted: "not-a-permitted-fee", actual: "enhanced_service_fee" },
    ]);
    const miss = snapshot.heldOut.items.find((r) => r.id === "relabel-test-2");
    expect(miss?.reps).toEqual(["not-a-permitted-fee", "not-a-permitted-fee", "not-a-permitted-fee"]);
  });
});
