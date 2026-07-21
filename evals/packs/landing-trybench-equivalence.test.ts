import { describe, expect, it } from "vitest";
import { checkServedPrice } from "@/components/landing/TryBench";
import { SAMPLE_FEED, verifyAcpFeed } from "@/components/playground/verify-in-browser";
import { ARITH } from "@/lib/landing/specimen";

/**
 * TRYBENCH ↔ ENGINE EQUIVALENCE (build piece 1, 2026-07-20): the Home page's
 * "Break the feed yourself" bench claims "the real rule arithmetic, run
 * locally". Its check is a one-value mirror of the engine's price rules — this
 * pack pins every verdict class the bench can produce to what the REAL
 * verifier (the same runListingsVerification composition the playground
 * ships) says about the same served value on the same row. If the mirror ever
 * drifts from the engine, this fails — the page's claim never ships stale.
 *
 * Method: take the committed sample feed, rewrite the price-specimen row's
 * served value, run the real engine against the committed SOR, and read the
 * findings attached to that one claim id.
 */

const PRICE_CLAIM_ID = "item-001-v1#price.amount";

type FeedRow = { item_id: string; price: string };

function engineFindingsFor(served: string): readonly string[] {
  const feed = structuredClone(SAMPLE_FEED) as unknown as { items: FeedRow[] };
  const row = feed.items.find((r) => r.item_id === "item-001-v1");
  if (!row) throw new Error("price specimen row missing from the sample feed");
  row.price = served;
  const report = verifyAcpFeed(feed as unknown as typeof SAMPLE_FEED);
  return report.findings
    .filter((f) => f.claim.id === PRICE_CLAIM_ID)
    .map((f) => f.ruleId);
}

describe("TryBench verdicts are pinned to the real engine's rulings", () => {
  it("the feed's claim (cents-as-decimal): engine holds it; the bench holds it ×100 with the signature line", () => {
    const rules = engineFindingsFor(String(ARITH.served)); // "2150"
    expect(rules).toContain("LST-PRICE-CENTS-AS-DECIMAL");

    const bench = checkServedPrice(String(ARITH.served), ARITH.recordCents);
    expect(bench.state).toBe("held");
    expect(bench.chip).toBe("HELD ×100");
    expect(bench.lines.some((l) => l.includes("cents-as-decimal signature"))).toBe(true);
  });

  it("the true price: engine attaches no price finding; the bench passes", () => {
    const rules = engineFindingsFor(ARITH.recordDollars); // "21.50"
    expect(rules).toHaveLength(0);

    const bench = checkServedPrice(ARITH.recordDollars, ARITH.recordCents);
    expect(bench.state).toBe("pass");
    expect(bench.chip).toBe("PASS");
  });

  it("a plain mismatch: engine flags the price value; the bench holds without the ×N chip", () => {
    const rules = engineFindingsFor("24.00");
    expect(rules).toContain("LST-PRICE-VALUE");
    expect(rules).not.toContain("LST-PRICE-CENTS-AS-DECIMAL");

    const bench = checkServedPrice("24.00", ARITH.recordCents);
    expect(bench.state).toBe("held");
    expect(bench.chip).toBe("HELD");
  });

  it("an exact ×2 multiple: bench arithmetic matches the engine's held ruling and names the multiple", () => {
    const doubled = ((ARITH.recordCents * 2) / 100).toFixed(2); // "43.00"
    const rules = engineFindingsFor(doubled);
    expect(rules.length).toBeGreaterThan(0); // the engine holds a wrong price

    const bench = checkServedPrice(doubled, ARITH.recordCents);
    expect(bench.state).toBe("held");
    expect(bench.chip).toBe("HELD ×2");
  });

  it("non-numeric input: the bench refuses a verdict (the engine's schema would reject the row upstream)", () => {
    const bench = checkServedPrice("abc", ARITH.recordCents);
    expect(bench.state).toBe("invalid");
    expect(bench.chip).toBe("NOT A PRICE");
    expect(bench.lines.some((l) => /plain decimal amount/.test(l))).toBe(true);
  });

  it("determinism: same input, same verdict, byte-for-byte", () => {
    const a = JSON.stringify(checkServedPrice("2150", ARITH.recordCents));
    const b = JSON.stringify(checkServedPrice("2150", ARITH.recordCents));
    expect(a).toBe(b);
  });
});
