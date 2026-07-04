import { describe, expect, it } from "vitest";
import {
  auditStatement,
  buildFaithfulStatement,
  type MonthlyStatement,
  type StatementLine,
} from "@/lib/packs/fees";

/**
 * e-1 REFUND-WINDOW AS VERDICT STATE (plan F1a item 6), RED-GREEN: a monthly
 * over-cap on a/b/d is a state, not a fixed verdict — cured-by-refund /
 * conditional-pending-refund-window / violation. The transaction fee (c) gets NO
 * safe harbor (asserted). The faithful statement produces zero findings.
 */

const line = (over: Partial<StatementLine>): StatementLine => ({
  orderId: "ORD-1",
  month: "2026-06",
  declaredCategory: "delivery_fee",
  label: "Delivery fee",
  amountCents: 360,
  orderPurchasePriceCents: 2000,
  isRefund: false,
  passthroughDocumented: false,
  ...over,
});

const meta = (asOf: string): MonthlyStatement["meta"] => ({
  simulated: true,
  generator: { name: "test", seed: 1, version: "1.0.0" },
  merchant: "Test (simulated)",
  month: "2026-06",
  currency: "USD",
  asOf,
  purchasePriceBaseConvention: "assumed base",
});

// Two orders, delivery 18% each → monthly average 18% > 15% → over cap.
const overCapLines: readonly StatementLine[] = [
  line({ orderId: "ORD-1", amountCents: 360, orderPurchasePriceCents: 2000 }),
  line({ orderId: "ORD-2", amountCents: 360, orderPurchasePriceCents: 2000 }),
];
// Excess: 720*100 - 15*4000 = 72000 - 60000 = 12000 → $1.20 excess.

function deliveryVerdict(report: ReturnType<typeof auditStatement>): string | undefined {
  return report.findings.find((f) => f.ruleId === "NYC-563.3-a-2")?.verdict;
}

describe("e-1 verdict states (a/b/d over-cap)", () => {
  it("VIOLATION: window closed (asOf after +30d), no refund", () => {
    const report = auditStatement({ meta: meta("2026-08-15"), lines: [...overCapLines] });
    expect(deliveryVerdict(report)).toBe("violation");
    expect(report.ok).toBe(false);
  });

  it("CONDITIONAL: window still open (asOf inside +30d), no refund → NOT a violation", () => {
    const report = auditStatement({ meta: meta("2026-07-10"), lines: [...overCapLines] });
    expect(deliveryVerdict(report)).toBe("conditional-pending-refund-window");
    expect(report.ok).toBe(true); // conditional is not yet a violation
  });

  it("CURED: excess refunded within the window, evaluated after close → NOT a violation", () => {
    const report = auditStatement({
      meta: meta("2026-08-15"),
      lines: [
        ...overCapLines,
        line({
          orderId: "ORD-1",
          declaredCategory: "delivery_fee",
          label: "Refund",
          amountCents: 120, // covers the $1.20 excess
          isRefund: true,
          refundedAtDate: "2026-07-15", // within window (closes 2026-07-30)
        }),
      ],
    });
    expect(deliveryVerdict(report)).toBe("cured-by-refund");
    expect(report.ok).toBe(true);
  });

  it("a refund DATED AFTER the window does NOT cure (still a violation)", () => {
    const report = auditStatement({
      meta: meta("2026-08-15"),
      lines: [
        ...overCapLines,
        line({
          orderId: "ORD-1",
          label: "Late refund",
          amountCents: 120,
          isRefund: true,
          refundedAtDate: "2026-08-01", // after 2026-07-30
        }),
      ],
    });
    expect(deliveryVerdict(report)).toBe("violation");
  });

  it("a PARTIAL refund (below the excess) does not cure", () => {
    const report = auditStatement({
      meta: meta("2026-08-15"),
      lines: [
        ...overCapLines,
        line({ orderId: "ORD-1", label: "Partial refund", amountCents: 50, isRefund: true, refundedAtDate: "2026-07-15" }),
      ],
    });
    expect(deliveryVerdict(report)).toBe("violation");
  });
});

describe("e-1: transaction fee (c) gets NO safe harbor", () => {
  it("a c over-cap is a VIOLATION even with a refund inside the window", () => {
    const report = auditStatement({
      meta: meta("2026-07-10"), // window open — would be conditional for a/b/d
      lines: [
        line({ orderId: "ORD-1", declaredCategory: "transaction_fee", label: "Card processing", amountCents: 160, orderPurchasePriceCents: 2000 }), // 8% > 3%
        line({ orderId: "ORD-1", declaredCategory: "transaction_fee", label: "Refund", amountCents: 200, isRefund: true, refundedAtDate: "2026-07-15" }),
      ],
    });
    const c = report.findings.find((f) => f.ruleId === "NYC-563.3-c-1");
    expect(c?.verdict).toBe("violation");
    expect(report.ok).toBe(false);
  });

  it("a documented pass-through (c-2) above 3% is NOT flagged", () => {
    const report = auditStatement({
      meta: meta("2026-08-15"),
      lines: [
        line({ orderId: "ORD-1", declaredCategory: "transaction_fee", label: "Card processing (pass-through)", amountCents: 160, orderPurchasePriceCents: 2000, passthroughDocumented: true }),
      ],
    });
    expect(report.findings.some((f) => f.ruleId === "NYC-563.3-c-1")).toBe(false);
  });
});

describe("e-1: the faithful statement is clean", () => {
  it("buildFaithfulStatement() audits to zero findings, ok true", () => {
    const report = auditStatement(buildFaithfulStatement());
    expect(report.findings).toHaveLength(0);
    expect(report.ok).toBe(true);
  });
});
