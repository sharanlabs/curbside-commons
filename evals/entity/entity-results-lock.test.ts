/**
 * E4 — RESULTS EVAL-LOCK (R-DHON-4 precedent): re-derives every headline
 * number in the pre-registration's RESULTS section from the COMMITTED raw
 * records — never re-running the matcher over the (now exposed) test split —
 * and pins the deferred-label verdict plus the ties-the-baseline conclusion.
 *
 * Plain: the scoreboard is re-added-up from the committed per-pair records
 * on every test run; nobody can quietly improve the grade or un-publish the
 * "no better than exact matching" finding.
 */
import { describe, expect, it } from "vitest";

import raws from "./results/raw-pairs.json" with { type: "json" };
import summary from "./results/results-summary.json" with { type: "json" };
import thresholds from "./gold/thresholds.json" with { type: "json" };

interface Row { id: string; label: string; trap: boolean; score: number; verdict: string; baseline: string; }
const run1 = raws.run1 as Row[];
const run2 = raws.run2 as Row[];

function rederive(verdictOf: (r: Row) => string) {
  let proposed = 0;
  let truly = 0;
  let sameTotal = 0;
  let caught = 0;
  let trapMerges = 0;
  let trapTotal = 0;
  let ambigTotal = 0;
  let ambigAbst = 0;
  let abstains = 0;
  for (const r of run1) {
    const v = verdictOf(r);
    if (v === "ABSTAIN") abstains += 1;
    if (r.label === "SAME") {
      sameTotal += 1;
      if (v === "SAME") caught += 1;
    }
    if (r.trap) {
      trapTotal += 1;
      if (v === "SAME") trapMerges += 1;
    }
    if (v === "SAME") {
      proposed += 1;
      if (r.label === "SAME") truly += 1;
    }
    if (r.label === "AMBIGUOUS") {
      ambigTotal += 1;
      if (v === "ABSTAIN") ambigAbst += 1;
    }
  }
  return { proposed, truly, sameTotal, caught, trapMerges, trapTotal, ambigTotal, ambigAbst, abstains };
}

describe("E4 results lock — re-derived from committed raws", () => {
  it("covers the full frozen test split (87 pairs, both determinism runs)", () => {
    expect(run1.length).toBe(87);
    expect(run2.length).toBe(87);
  });

  it("M5: the two runs are byte-identical (determinism held)", () => {
    expect(JSON.stringify(run1)).toBe(JSON.stringify(run2));
  });

  it("ensemble: M1 18/18 · M2 18/35 (0.514 < 0.80 -> the registered MISS) · M3 0/10 · M4 9/10 + volume 11/87", () => {
    const m = rederive((r) => r.verdict);
    expect(m.truly).toBe(18);
    expect(m.proposed).toBe(18);
    expect(m.caught).toBe(18);
    expect(m.sameTotal).toBe(35);
    expect(m.caught / m.sameTotal).toBeLessThan(0.8);
    expect(m.trapMerges).toBe(0);
    expect(m.trapTotal).toBe(10);
    expect(m.ambigAbst).toBe(9);
    expect(m.ambigTotal).toBe(10);
    expect(m.abstains).toBe(11);
    expect(m.abstains / run1.length).toBeLessThanOrEqual(0.3);
  });

  it("baseline ties the ensemble on M1/M2/M3 -> the protected default ships (anti-theater conclusion pinned)", () => {
    const e = rederive((r) => r.verdict);
    const b = rederive((r) => r.baseline);
    expect(b.truly).toBe(e.truly);
    expect(b.caught).toBe(e.caught);
    expect(b.trapMerges).toBe(e.trapMerges);
    expect(b.abstains).toBe(0); // the baseline never abstains
    expect(summary.beatsBaseline).toBe(false);
    expect(summary.decision.shippedDefault).toContain("normalized-exact");
  });

  it("the verdict is pinned: label DEFERS, thresholds are the frozen ones, split marked exposed", () => {
    expect(summary.decision.labelEarned).toBe(false);
    expect(summary.decision.label).toContain("floors not met");
    expect(summary.thresholds.tMatch).toBe(thresholds.tMatch);
    expect(summary.thresholds.tAbstain).toBe(thresholds.tAbstain);
    expect(thresholds.tMatch).toBe(0.999);
    expect(thresholds.tAbstain).toBe(0.849);
    expect(summary.testExposed).toBe(true);
    expect(summary.allFloors).toBe(false);
    expect(summary.floors.m2).toBe(false); // the ONE missed floor
    expect(summary.floors.m1 && summary.floors.m3 && summary.floors.m4 && summary.floors.m5).toBe(true);
  });
});
