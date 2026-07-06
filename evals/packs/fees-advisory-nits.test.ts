import { describe, expect, it } from "vitest";
import {
  auditStatement,
  auditWithClassification,
  claimIdPart,
  makeLineTagger,
  type LineItemClassifier,
  type MonthlyStatement,
  type StatementLine,
} from "@/lib/packs/fees";

/**
 * M2 GATE-4 ADVISORY NITS, closed (gate record docs/reviews/gate-2026-07-04-m2-f1-module.md,
 * gate 4: "recorded for a future slice" — this is that slice, 2026-07-06):
 *
 *  1. `#` inside an arbitrary `declaredCategory` (or `orderId`) made claim ids
 *     unparseable (still unique). Now: the arbitrary components are escaped via
 *     `claimIdPart` ('%'→'%25', '#'→'%23') — identity on every committed corpus
 *     value (no fixture contains '#' or '%'; goldens stay byte-frozen), reversible
 *     via decodeURIComponent-style unescaping, so `id.split("#")` is unambiguous.
 *
 *  2. Object-identity `lineIndex` maps rendered a silent "Lundefined" tag for a
 *     line object that is not a member of `statement.lines`. Now: the shared
 *     `makeLineTagger` throws loudly instead (unreachable via the parser — this is
 *     a defensive contract for direct constructors/refactors, not a behavior change).
 *
 * RED-GREEN: pre-fix, the d-1 claim id for declaredCategory "promo#extra" was
 * "ORD-9#promo#extra#L0" — split("#").length === 4, ambiguous (executed RED,
 * 2026-07-06, docs/reviews/advisory-nits-verify-evidence.log); post-fix it is
 * "ORD-9#promo%23extra#L0" — exactly 3 unambiguous segments.
 */

const unescapePart = (s: string): string => s.replace(/%23/g, "#").replace(/%25/g, "%");

const line = (over: Partial<StatementLine>): StatementLine => ({
  orderId: "ORD-1",
  month: "2026-06",
  declaredCategory: "delivery_fee",
  label: "Delivery fee",
  amountCents: 100,
  orderPurchasePriceCents: 2000,
  isRefund: false,
  passthroughDocumented: false,
  ...over,
});

const statement = (lines: readonly StatementLine[]): MonthlyStatement => ({
  meta: {
    simulated: true,
    generator: { name: "test", seed: 1, version: "1.0.0" },
    merchant: "Test (simulated)",
    month: "2026-06",
    currency: "USD",
    asOf: "2026-08-15",
    purchasePriceBaseConvention: "assumed base",
  },
  lines: [...lines],
});

describe("claimIdPart (nit 3: '#' in arbitrary id components)", () => {
  it("is byte-identity on every committed corpus value shape (no '#'/'%')", () => {
    for (const s of ["ORD-1", "delivery_fee", "promo_fee", "service_and_delivery", "2026-06"]) {
      expect(claimIdPart(s)).toBe(s);
    }
  });

  it("escapes '#' and '%' reversibly (round-trip)", () => {
    for (const s of ["promo#extra", "50%#off", "a%23b", "%", "#"]) {
      expect(unescapePart(claimIdPart(s))).toBe(s);
      expect(claimIdPart(s)).not.toContain("#");
    }
  });

  it("d-1 claim id with '#'-bearing orderId + declaredCategory splits into exactly 3 unambiguous segments", () => {
    const report = auditStatement(statement([line({ orderId: "OR#D-9", declaredCategory: "promo#extra" })]));
    const d1 = report.findings.find((f) => f.ruleId === "NYC-563.3-d-1");
    expect(d1).toBeDefined();
    const segments = d1!.claim.id.split("#");
    expect(segments).toHaveLength(3);
    expect(unescapePart(segments[0])).toBe("OR#D-9");
    expect(unescapePart(segments[1])).toBe("promo#extra");
    expect(segments[2]).toBe("L0");
  });

  it("advisory (classifier) claim id is escaped the same way", () => {
    const mock: LineItemClassifier = {
      name: "test-mock",
      earnsLabel: false,
      classify: () => ({ predicted: "not-a-permitted-fee", rationale: "test" }),
    };
    const report = auditWithClassification(statement([line({ declaredCategory: "promo#extra" })]), mock);
    expect(report.advisoryFindings).toHaveLength(1);
    const segments = report.advisoryFindings[0].claim.id.split("#");
    expect(segments).toHaveLength(4); // orderId # category # L<i> # classifier
    expect(unescapePart(segments[1])).toBe("promo#extra");
    expect(segments[3]).toBe("classifier");
  });
});

describe("makeLineTagger (nit 2: object-identity lineIndex)", () => {
  it("tags member lines by statement position", () => {
    const s = statement([line({ orderId: "ORD-1" }), line({ orderId: "ORD-2" })]);
    const tag = makeLineTagger(s);
    expect(tag(s.lines[0])).toBe("L0");
    expect(tag(s.lines[1])).toBe("L1");
  });

  it("throws LOUDLY on a line object that is not a member of statement.lines (was a silent 'Lundefined')", () => {
    const s = statement([line({})]);
    const tag = makeLineTagger(s);
    const clone = { ...s.lines[0] }; // equal by value, different object identity
    expect(() => tag(clone)).toThrowError(/not a member of statement\.lines/);
  });
});
