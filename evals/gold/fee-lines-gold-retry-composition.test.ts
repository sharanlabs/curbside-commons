import { describe, expect, it } from "vitest";
import { FEE_LINES_GOLD, GOLD_STRATA } from "@/evals/gold/fee-lines-gold";
import { FEE_LINES_GOLD_RETRY } from "@/evals/gold/fee-lines-gold-retry";
import { TRUE_CATEGORY_LABELS } from "@/lib/packs/fees";

/**
 * COMPOSITION LOCK for the 2026-07-08 RETRY held-out split (the fee-lines-gold
 * composition-test pattern). The retry split exists because the original test
 * split was EXPOSED by the 2026-07-05 scored run; these locks make the fresh
 * split's structure — and its disjointness from EVERYTHING previously committed —
 * machine-checked forever. Pre-registration: docs/fee-classifier-recalibration-status.md.
 */
describe("fee-lines-gold-retry — composition lock (2026-07-08 pre-registration)", () => {
  it("21 items: exactly 3 per stratum across all six §7 classes + clean", () => {
    expect(FEE_LINES_GOLD_RETRY.length).toBe(21);
    for (const stratum of GOLD_STRATA) {
      const n = FEE_LINES_GOLD_RETRY.filter((g) => g.stratum === stratum).length;
      expect(n, `stratum ${stratum}`).toBe(3);
    }
  });

  it("every item is held-out (split 'test') — the retry set has no tune half", () => {
    expect(FEE_LINES_GOLD_RETRY.every((g) => g.split === "test")).toBe(true);
  });

  it("per-label denominators MIRROR the original test split exactly (non-vacuous ≥3 inherited)", () => {
    const expected: Record<string, number> = {
      delivery_fee: 4,
      basic_service_fee: 3,
      transaction_fee: 4,
      enhanced_service_fee: 4,
      "not-a-permitted-fee": 6,
    };
    for (const label of TRUE_CATEGORY_LABELS) {
      const denom = FEE_LINES_GOLD_RETRY.filter((g) => g.trueCategory === label).length;
      expect(denom, `denominator for ${label}`).toBe(expected[label]);
      expect(denom).toBeGreaterThanOrEqual(3);
    }
  });

  it("DISJOINT from the original 42 by id AND by label text (a genuinely fresh split)", () => {
    const priorIds = new Set(FEE_LINES_GOLD.map((g) => g.id));
    const priorLabels = new Set(FEE_LINES_GOLD.map((g) => g.input.label));
    for (const g of FEE_LINES_GOLD_RETRY) {
      expect(priorIds.has(g.id), `id collision: ${g.id}`).toBe(false);
      expect(priorLabels.has(g.input.label), `label collision: ${g.input.label}`).toBe(false);
    }
    // Internal uniqueness too.
    expect(new Set(FEE_LINES_GOLD_RETRY.map((g) => g.id)).size).toBe(21);
    expect(new Set(FEE_LINES_GOLD_RETRY.map((g) => g.input.label)).size).toBe(21);
  });

  it("pinned-ID equality — the exact 21 ids are frozen (any edit fails loudly)", () => {
    const PINNED = [
      "overcap-retry-1", "overcap-retry-2", "overcap-retry-3",
      "misclass-retry-1", "misclass-retry-2", "misclass-retry-3",
      "relabel-retry-1", "relabel-retry-2", "relabel-retry-3",
      "bundle-retry-1", "bundle-retry-2", "bundle-retry-3",
      "promo-retry-1", "promo-retry-2", "promo-retry-3",
      "procfee-retry-1", "procfee-retry-2", "procfee-retry-3",
      "clean-retry-1", "clean-retry-2", "clean-retry-3",
    ].sort();
    expect(FEE_LINES_GOLD_RETRY.map((g) => g.id).slice().sort()).toEqual(PINNED);
  });
});
