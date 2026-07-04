import { describe, expect, it } from "vitest";
import {
  FEE_LINES_GOLD,
  FEE_LINES_GOLD_TEST,
  FEE_LINES_GOLD_TUNE,
  GOLD_STRATA,
  type FeeLineGoldItem,
} from "@/evals/gold/fee-lines-gold";

/**
 * COMPOSITION unit test (the slice-2 close-out pattern) for the F1b fee-lines gold
 * set: counts per class per split, tune/test disjointness, and pinned-ID equality —
 * so a silent change to the gold set's stratification is loud, not a vibe.
 *
 * HONESTY: this asserts the gold set's INTERNAL composition, never its adequacy for
 * a statistical claim — 3 per class per split is a small, synthetic, feasibility
 * floor (recorded in the gold-set file header and the slice record), not a
 * sufficiency claim.
 */

const PINNED_TUNE_IDS = [
  "overcap-tune-1", "overcap-tune-2", "overcap-tune-3",
  "misclass-tune-1", "misclass-tune-2", "misclass-tune-3",
  "relabel-tune-1", "relabel-tune-2", "relabel-tune-3",
  "bundle-tune-1", "bundle-tune-2", "bundle-tune-3",
  "promo-tune-1", "promo-tune-2", "promo-tune-3",
  "procfee-tune-1", "procfee-tune-2", "procfee-tune-3",
  "clean-tune-1", "clean-tune-2", "clean-tune-3",
];

const PINNED_TEST_IDS = [
  "overcap-test-1", "overcap-test-2", "overcap-test-3",
  "misclass-test-1", "misclass-test-2", "misclass-test-3",
  "relabel-test-1", "relabel-test-2", "relabel-test-3",
  "bundle-test-1", "bundle-test-2", "bundle-test-3",
  "promo-test-1", "promo-test-2", "promo-test-3",
  "procfee-test-1", "procfee-test-2", "procfee-test-3",
  "clean-test-1", "clean-test-2", "clean-test-3",
];

describe("F1b fee-lines gold set — composition", () => {
  it("pinned total size: 42 items (21 tune + 21 test)", () => {
    expect(FEE_LINES_GOLD.length).toBe(42);
    expect(FEE_LINES_GOLD_TUNE.length).toBe(21);
    expect(FEE_LINES_GOLD_TEST.length).toBe(21);
  });

  it("every §7 class + the clean stratum has exactly 3 tune + 3 test items", () => {
    for (const stratum of GOLD_STRATA) {
      const tuneCount = FEE_LINES_GOLD_TUNE.filter((g) => g.stratum === stratum).length;
      const testCount = FEE_LINES_GOLD_TEST.filter((g) => g.stratum === stratum).length;
      expect(tuneCount, `stratum "${stratum}" tune count`).toBe(3);
      expect(testCount, `stratum "${stratum}" test count`).toBe(3);
    }
    // Sanity: GOLD_STRATA itself is the 6 §7 classes + "clean" (7 strata).
    expect(GOLD_STRATA.length).toBe(7);
  });

  it("tune and test are DISJOINT (no id appears in both splits)", () => {
    const tuneIds = new Set(FEE_LINES_GOLD_TUNE.map((g) => g.id));
    const testIds = new Set(FEE_LINES_GOLD_TEST.map((g) => g.id));
    for (const id of tuneIds) expect(testIds.has(id), `id "${id}" leaked into both splits`).toBe(false);
    // Every item has exactly one split value (partition, not just non-overlap).
    for (const g of FEE_LINES_GOLD) expect(["tune", "test"]).toContain(g.split);
  });

  it("pinned-ID equality: the exact tune/test id sets match the recorded manifest", () => {
    const tuneIds = FEE_LINES_GOLD_TUNE.map((g) => g.id).sort();
    const testIds = FEE_LINES_GOLD_TEST.map((g) => g.id).sort();
    expect(tuneIds).toEqual([...PINNED_TUNE_IDS].sort());
    expect(testIds).toEqual([...PINNED_TEST_IDS].sort());
  });

  it("every id is unique across the whole gold set", () => {
    const ids = FEE_LINES_GOLD.map((g) => g.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every item's declaredCategory + label + amounts are non-empty and every rationale is non-empty", () => {
    const nonEmpty = (s: string) => s.trim().length > 0;
    for (const g of FEE_LINES_GOLD as readonly FeeLineGoldItem[]) {
      expect(nonEmpty(g.input.label), `${g.id}: empty label`).toBe(true);
      expect(nonEmpty(g.input.declaredCategory), `${g.id}: empty declaredCategory`).toBe(true);
      expect(nonEmpty(g.rationale), `${g.id}: empty rationale`).toBe(true);
      expect(g.input.amountCents).toBeGreaterThan(0);
      expect(g.input.orderPurchasePriceCents).toBeGreaterThan(0);
    }
  });
});
