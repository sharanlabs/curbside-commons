import { describe, expect, it } from "vitest";
import { StatementParseError, parseStatement } from "@/lib/packs/fees";

/**
 * Parser rejection paths (plan F1a item 3), RED-GREEN: every malformed input
 * throws a typed StatementParseError; the corrected input parses. Nothing is
 * silently defaulted — a statement that does not parse cleanly is never audited
 * on guessed values.
 */

const validLine = {
  orderId: "ORD-1",
  month: "2026-06",
  declaredCategory: "delivery_fee",
  label: "Delivery fee",
  amountCents: 300,
  orderPurchasePriceCents: 2000,
  isRefund: false,
  passthroughDocumented: false,
};

const validStatement = {
  meta: {
    simulated: true,
    generator: { name: "test", seed: 1, version: "1.0.0" },
    merchant: "Test (simulated)",
    month: "2026-06",
    currency: "USD",
    asOf: "2026-08-15",
    purchasePriceBaseConvention: "assumed base",
  },
  lines: [validLine],
};

describe("parser GREEN: a well-formed statement parses", () => {
  it("parses an object and a JSON string identically", () => {
    const fromObj = parseStatement(validStatement);
    const fromStr = parseStatement(JSON.stringify(validStatement));
    expect(fromObj.lines).toHaveLength(1);
    expect(fromStr.lines[0].amountCents).toBe(300);
    expect(fromObj.meta.simulated).toBe(true);
  });
});

describe("parser RED: each malformed input throws StatementParseError", () => {
  const bad: readonly [string, unknown][] = [
    ["non-object top level", 42],
    ["missing lines array", { meta: validStatement.meta }],
    ["lines not an array", { meta: validStatement.meta, lines: {} }],
    ["missing meta", { lines: [validLine] }],
    ["meta.simulated not literal true", { ...validStatement, meta: { ...validStatement.meta, simulated: false } }],
    ["meta.currency not USD", { ...validStatement, meta: { ...validStatement.meta, currency: "EUR" } }],
    ["bad meta.month (2026-6)", { ...validStatement, meta: { ...validStatement.meta, month: "2026-6" } }],
    ["bad meta.asOf (not a date)", { ...validStatement, meta: { ...validStatement.meta, asOf: "2026-08" } }],
    ["float amountCents", { ...validStatement, lines: [{ ...validLine, amountCents: 3.5 }] }],
    ["negative amountCents", { ...validStatement, lines: [{ ...validLine, amountCents: -1 }] }],
    ["zero orderPurchasePriceCents", { ...validStatement, lines: [{ ...validLine, orderPurchasePriceCents: 0 }] }],
    ["non-integer purchase", { ...validStatement, lines: [{ ...validLine, orderPurchasePriceCents: 20.01 }] }],
    ["bad line.month", { ...validStatement, lines: [{ ...validLine, month: "June" }] }],
    ["empty declaredCategory", { ...validStatement, lines: [{ ...validLine, declaredCategory: "" }] }],
    ["non-boolean isRefund", { ...validStatement, lines: [{ ...validLine, isRefund: "yes" }] }],
    ["refund without a date", { ...validStatement, lines: [{ ...validLine, isRefund: true }] }],
    ["refundedAtDate on a non-refund line", { ...validStatement, lines: [{ ...validLine, refundedAtDate: "2026-07-15" }] }],
    // M2 Codex finding #3: a monthly statement must not mix months — a stray-month
    // line would silently corrupt monthly averages and the e-1 refund window.
    ["line.month differs from meta.month", { ...validStatement, lines: [validLine, { ...validLine, orderId: "ORD-2", month: "2026-07" }] }],
  ];

  it.each(bad)("rejects: %s", (_name, input) => {
    expect(() => parseStatement(input)).toThrow(StatementParseError);
  });

  it("a refund WITH a valid date parses (green counterpart)", () => {
    const ok = parseStatement({
      ...validStatement,
      lines: [{ ...validLine, isRefund: true, refundedAtDate: "2026-07-15" }],
    });
    expect(ok.lines[0].isRefund).toBe(true);
    expect(ok.lines[0].refundedAtDate).toBe("2026-07-15");
  });

  it("invalid JSON text throws StatementParseError (not a raw SyntaxError)", () => {
    expect(() => parseStatement("{ not json ")).toThrow(StatementParseError);
  });
});
