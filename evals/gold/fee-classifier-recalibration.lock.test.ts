import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { accuracy, cohenKappa, multiClassFlipRate, perClassReport, type LabeledClassification } from "@/evals/gold/metrics";
import { TRUE_CATEGORY_LABELS, type TrueCategoryLabel } from "@/lib/packs/fees";
import { FEE_LINES_GOLD_RETRY } from "@/evals/gold/fee-lines-gold-retry";

/**
 * EVAL-LOCK for the F1b live RECALIBRATION run (2026-07-09, owner-armed retry —
 * `docs/fee-classifier-recalibration-status.md`; the R-DHON-4 pattern, sibling of
 * `fee-classifier-calibration.lock.test.ts`, which locks the 2026-07-05 DEFER and
 * stays untouched). This test reads the FROZEN retry snapshot and asserts (a)
 * internal consistency — every headline recomputes from the per-item records
 * through the same ported math — and (b) the verdict state: clean integrity,
 * ALL SIX floors cleared, **the label is CALIBRATED (earned 2026-07-09)**, scored
 * on exactly the committed retry split.
 *
 * It makes NO live call and can never change the result — an edit to the snapshot
 * that shifts any number without per-item records to back it goes RED here, and
 * the CALIBRATED state cannot quietly grow (or lose) scope without consciously
 * replacing this lock.
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
  readFileSync("lib/data/fee-classifier-recalibration.snapshot.json", "utf8"),
) as Snapshot;

describe("F1b RECALIBRATION eval-lock — the frozen 2026-07-09 retry record (R-DHON-4)", () => {
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

  it("the scored items are EXACTLY the committed retry split (ids + ground truth), nothing swapped", () => {
    const scored = new Map(snapshot.heldOut.items.map((r) => [r.id, r.trueCategory]));
    expect(scored.size).toBe(FEE_LINES_GOLD_RETRY.length);
    for (const gold of FEE_LINES_GOLD_RETRY) {
      expect(scored.get(gold.id), `scored ground truth for ${gold.id}`).toBe(gold.trueCategory);
    }
  });

  it("headline accuracy recomputes from the per-item records: 21/21", () => {
    const correct = labeled.filter((it) => it.predicted === it.actual).length;
    expect(correct).toBe(21);
    expect(correct).toBe(snapshot.heldOut.correct);
    expect(accuracy(labeled)).toBeCloseTo(1, 10);
  });

  it("every per-class recall and precision recomputes to 1 — all six floors recompute as cleared", () => {
    for (const label of TRUE_CATEGORY_LABELS) {
      const r = perClassReport(labeled, label);
      expect(r.recall, `${label} recall`).toBeCloseTo(1, 10);
      expect(r.precision, `${label} precision`).toBeCloseTo(1, 10);
    }
    const macroP =
      TRUE_CATEGORY_LABELS.reduce((sum, label) => sum + perClassReport(labeled, label).precision, 0) /
      TRUE_CATEGORY_LABELS.length;
    expect(macroP).toBeCloseTo(snapshot.heldOut.macroPrecision, 10);
    const macroK =
      TRUE_CATEGORY_LABELS.reduce(
        (sum, label) =>
          sum +
          cohenKappa(
            labeled.map((it) => it.predicted === label),
            labeled.map((it) => it.actual === label),
          ),
        0,
      ) / TRUE_CATEGORY_LABELS.length;
    expect(macroK).toBeCloseTo(snapshot.heldOut.macroKappa, 10);
    expect(Object.values(snapshot.floors).every((f) => f.pass)).toBe(true);
  });

  it("flip-rate recomputes: exactly one non-unanimous item, whose rep-0 (prediction of record) is correct", () => {
    const flip = multiClassFlipRate(snapshot.heldOut.items.map((r) => r.reps));
    expect(flip).toBeCloseTo(1 / 21, 10);
    expect(flip).toBeCloseTo(snapshot.heldOut.flipRate, 10);
    const nonUnanimous = snapshot.heldOut.items.filter((r) => new Set(r.reps).size > 1);
    expect(nonUnanimous).toHaveLength(1);
    expect(nonUnanimous[0].reps[0]).toBe(nonUnanimous[0].trueCategory);
  });

  it("THE VERDICT STATE IS LOCKED: floorsCleared=true, zero misses — the label is CALIBRATED (earned 2026-07-09)", () => {
    expect(snapshot.floorsCleared).toBe(true);
    expect(snapshot.misses).toEqual([]);
  });
});
