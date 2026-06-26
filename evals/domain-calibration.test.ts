/**
 * OFFLINE calibration test for the domain-quality judge (Track B1, B1c) — $0, no network.
 *
 * What it locks (mirrors the faithfulness calibration test, adapted for the Effective axis):
 *  1. GOLD-SET VALIDITY (R-DCAL-5) — the held-out floor: ≥4 test positives PER dimension, each positive
 *     fails exactly one labeled dimension, both splits populated.
 *  2. R-DCAL-1 ENFORCED LIVE (the teeth, advisor #2) — every gold item is run through the REAL
 *     `runGatekeeper` AND the faithfulness `mockJudge`; a label/actual mismatch FAILS the build. This is
 *     what proves the domain catch is a pure residual (gate-passing + faithful), not an upstream re-catch.
 *  3. MOCK BASELINE (R-DCAL-1 mock-not-gated) — the deterministic mock is run ONLY as a labeled stub
 *     baseline; NO threshold is asserted on its numbers. The calibrated bar is the LIVE judge (B1d).
 *
 * The pure metric math (precision/recall/F1/κ/flip-rate) is already unit-tested in
 * `evals/judge-calibration.test.ts` against hand-computed matrices — the SAME axis-agnostic module is
 * reused here, so it is not re-tested.
 */
import { describe, it, expect } from "vitest";
import { runGatekeeper } from "@/lib/agents/gatekeeper";
import { mockJudge } from "@/lib/agents/semantic-judge";
import { DOMAIN_DIMENSIONS } from "@/lib/domain/effective-rubric";
import {
  DOMAIN_GOLD_SET,
  DOMAIN_GOLD_POSITIVES,
  DOMAIN_GOLD_NEGATIVES,
  DOMAIN_JUDGE_TERRITORY_POSITIVES,
} from "@/evals/gold/domain-gold";
import {
  runDomainCalibration,
  domainTerritoryViolations,
  splitDomainPredictions,
  mockDomainVerdictOf,
} from "@/evals/gold/domain-harness";

describe("domain gold-set validity (R-DCAL-5)", () => {
  it("meets the size floor and stratification", () => {
    expect(DOMAIN_GOLD_SET.length).toBeGreaterThanOrEqual(30);
    expect(DOMAIN_GOLD_POSITIVES.length).toBeGreaterThanOrEqual(12);
    expect(DOMAIN_GOLD_NEGATIVES.length).toBeGreaterThanOrEqual(10);
    expect(DOMAIN_GOLD_SET.some((g) => g.split === "tune")).toBe(true);
    expect(DOMAIN_GOLD_SET.some((g) => g.split === "test")).toBe(true);
  });

  it("carries ≥4 TEST-split positives per calibrated dimension (the held-out floor)", () => {
    for (const dim of DOMAIN_DIMENSIONS) {
      const testPos = DOMAIN_GOLD_POSITIVES.filter((g) => g.dimension === dim && g.split === "test");
      expect(testPos.length, `dimension "${dim}" has ${testPos.length} test positives (need ≥4)`).toBeGreaterThanOrEqual(4);
    }
  });

  it("every positive is labeled with exactly one dimension; every negative with none", () => {
    for (const p of DOMAIN_GOLD_POSITIVES) {
      expect(p.draftDefective).toBe(true);
      expect(p.dimension, `positive ${p.id} must name one dimension`).not.toBeNull();
      expect(p.source).toBe("planted"); // all positives SYNTHETIC + labeled (R-DCAL-4)
    }
    for (const n of DOMAIN_GOLD_NEGATIVES) {
      expect(n.draftDefective).toBe(false);
      expect(n.dimension).toBeNull();
    }
  });
});

describe("R-DCAL-1 — marginal value enforced LIVE against the real gatekeeper + faithfulness", () => {
  it("no gold item's actual gatekeeper/faithful status disagrees with its label (the teeth)", () => {
    const violations = domainTerritoryViolations();
    expect(violations, `R-DCAL-1 violations: ${JSON.stringify(violations)}`).toEqual([]);
  });

  it("EVERY domain-defective positive is pure residual — passes the gate AND is faithful (none gate-caught)", () => {
    // For the domain judge, the R-DCAL-1 partition is the WHOLE positive set by design: every defect is
    // constructed to survive the deterministic gate + faithfulness (the seam the domain judge uniquely fills).
    expect(DOMAIN_JUDGE_TERRITORY_POSITIVES.length).toBe(DOMAIN_GOLD_POSITIVES.length);
    for (const p of DOMAIN_GOLD_POSITIVES) {
      expect(runGatekeeper(p.draft, p.merchant).approvedForHumanReview, `${p.id} must pass the gate`).toBe(true);
      expect(mockJudge(p.draft, p.merchant).any_unsupported, `${p.id} must be faithful`).toBe(false);
    }
  });

  it("clean negatives also pass the gate and are faithful", () => {
    for (const n of DOMAIN_GOLD_NEGATIVES) {
      expect(runGatekeeper(n.draft, n.merchant).approvedForHumanReview, `${n.id}`).toBe(true);
      expect(mockJudge(n.draft, n.merchant).any_unsupported, `${n.id}`).toBe(false);
    }
  });
});

describe("harness — mock baseline run (STUB BASELINE, NOT a calibration result; R-DCAL-1 mock-not-gated)", () => {
  const run = runDomainCalibration(mockDomainVerdictOf);

  it("produces a structurally valid aggregate + per-dimension report over the judge-territory subset", () => {
    // All items are judge-territory (no gate-caught items), so the headline subset = the full set.
    expect(run.aggregate.headline.n).toBe(DOMAIN_GOLD_SET.length);
    expect(run.aggregate.headline.recall).toBeGreaterThanOrEqual(0);
    expect(run.aggregate.headline.recall).toBeLessThanOrEqual(1);
    for (const dim of DOMAIN_DIMENSIONS) {
      expect(run.perDimension[dim], `report for ${dim}`).toBeDefined();
      expect(run.perDimension[dim].n).toBe(DOMAIN_GOLD_SET.length);
    }
    // NB: intentionally NO threshold assertion on the mock's recall/precision — it is a deterministic
    // stub baseline, not the calibrated detector. The bar is the LIVE cross-family judge (B1d).
  });

  it("splits predictions into populated tune and test partitions (R-DCAL-5/7)", () => {
    const { tune, test } = splitDomainPredictions(run.aggregate.predictions);
    expect(tune.length).toBeGreaterThan(0);
    expect(test.length).toBeGreaterThan(0);
    expect(tune.length + test.length).toBe(DOMAIN_GOLD_SET.length);
  });
});
