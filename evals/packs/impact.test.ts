/**
 * Impact arithmetic — S2-impact CP1 (lib/impact/index.ts).
 *
 * Every figure below is a HAND-DERIVED literal (worked in the comments next to
 * the fixture), never produced by calling sizeImpact twice. Tests:
 *  - COUNT ONCE   an order touched by two findings on two lines counts once.
 *  - WINDOW       an order outside windowDays of the latest placed_at adds nothing.
 *  - ALLOCATE     observed refunds read the explicit allocation, never prorate
 *                 the order-level refund_cents.
 *  - OBSERVED/PROSPECTIVE are separate figures; refunded orders are not "exposed".
 *  - TOUCH        modifier findings touch by `<row>#modifier.<optionId>`.
 *  - REFUSE       NaN, negative cents and allocation sums that do not match throw
 *                 a typed ImpactInputError.
 *  - SAFE         the module's import closure is empty of Node builtins and
 *                 network capability (the import-walk egress tooth).
 *
 * MUTATION PROOFS (each applied to lib/impact/index.ts, test run, restored):
 *  M1 remove the distinct (count touched LINES, not orders) -> RED
 *  M2 prorate order-level refund_cents by line value instead of the allocation -> RED
 *  M3 drop the window (floor = -Infinity) -> RED
 *  (results recorded in docs/returns/2026-10-31-s2-impact.md)
 */
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { walkImports } from "../lib/import-walk.ts";
import {
  ImpactInputError,
  sizeImpact,
  type ImpactFinding,
  type ImpactInput,
  type OrderRecord,
} from "@/lib/impact/index.ts";

const F_PRICE: ImpactFinding = { id: "v1#price", ruleId: "LST-PRICE-VALUE", category: "price", referenceRowId: "v1" };
const F_AVAIL: ImpactFinding = { id: "v2#existence", ruleId: "LST-AVAIL-STATE", category: "availability", referenceRowId: "v2" };
const F_MOD: ImpactFinding = { id: "v3#modifier.o9", ruleId: "LST-MOD-MISSING", category: "modifier", referenceRowId: null };

const order = (o: Partial<OrderRecord> & Pick<OrderRecord, "order_id" | "lines">): OrderRecord => ({
  placed_at: "2026-10-28T12:00:00Z",
  channel: "app",
  status: "fulfilled",
  refund_cents: 0,
  refund_allocation: [],
  reason: "none",
  ...o,
});
const line = (variation_id: string, qty: number, unit: number, mods: string[] = []) => ({
  variation_id,
  modifier_option_ids: mods,
  qty,
  unit_price_cents_charged: unit,
});

// Latest placed_at is order L (2026-10-30T12:00Z); windowDays 7 => floor 2026-10-23T12:00Z.
const ORDERS: OrderRecord[] = [
  // A: both lines touched (v1 by F_PRICE, v2 by F_AVAIL). Counts ONCE. Prospective 2*1000 + 1*500 = 2500.
  order({ order_id: "A", lines: [line("v1", 2, 1000), line("v2", 1, 500)] }),
  // B: refunded for the menu. Refund 1200 allocated v1 900 + v4 300. Only v1 is touched => observed 900.
  // (Proration by line value would give 1200*1000/1700 = 705.88, so a prorating impl cannot pass.)
  order({
    order_id: "B",
    status: "refunded",
    reason: "menu",
    refund_cents: 1200,
    refund_allocation: [
      { variation_id: "v1", cents: 900 },
      { variation_id: "v4", cents: 300 },
    ],
    lines: [line("v1", 1, 1000), line("v4", 1, 700)],
  }),
  // C: agent order on the availability-finding row. Agent-cancel 3*500 = 1500; prospective 1500.
  order({ order_id: "C", channel: "agent", lines: [line("v2", 3, 500)] }),
  // D: touched only through the modifier option o9. Prospective 300.
  order({ order_id: "D", lines: [line("v5", 1, 300, ["o9"])] }),
  // E: refunded menu order touching v1 but 10 days before the latest => contributes nothing.
  order({
    order_id: "E",
    placed_at: "2026-10-20T12:00:00Z",
    status: "refunded",
    reason: "menu",
    refund_cents: 1000,
    refund_allocation: [{ variation_id: "v1", cents: 1000 }],
    lines: [line("v1", 1, 1000)],
  }),
  // F: refunded, reason "other", touches v1 => at risk, but not an observed MENU refund.
  order({
    order_id: "F",
    status: "refunded",
    reason: "other",
    refund_cents: 400,
    refund_allocation: [{ variation_id: "v1", cents: 400 }],
    lines: [line("v1", 1, 1000)],
  }),
  // G: touches nothing.
  order({ order_id: "G", lines: [line("v9", 5, 100)] }),
  // L: the latest placed_at; untouched.
  order({ order_id: "L", placed_at: "2026-10-30T12:00:00Z", lines: [line("v9", 1, 100)] }),
];

const BASE: ImpactInput = {
  findings: [F_PRICE, F_AVAIL, F_MOD],
  orders: ORDERS,
  windowDays: 7,
  errorChargeShare: 0.25,
};

describe("sizeImpact — hand-derived figures", () => {
  const r = sizeImpact(BASE);

  it("counts an order once however many of its lines or findings touch it (A,B,C,D,F = 5; E is out of window)", () => {
    expect(r.ordersAtRiskDistinct).toBe(5);
  });
  it("observed menu refunds read the explicit allocation on touched lines (900), not the prorated or the order-level figure", () => {
    expect(r.observedMenuRefundCents).toBe(900);
  });
  it("prospective exposure is touched lines of fulfilled in-window orders only: A 2500 + C 1500 + D 300", () => {
    expect(r.prospectiveExposureCents).toBe(4300);
  });
  it("agent-cancel exposure is agent-channel lines touching an LST-AVAIL-* finding: C only, 1500", () => {
    expect(r.agentCancelExposureCents).toBe(1500);
  });
  it("error-charge exposure is round(900 x 0.25) = 225, and the share is a declared assumption", () => {
    expect(r.errorChargeExposureCents).toBe(225);
    expect(r.assumptions).toEqual([
      { name: "windowDays", value: 7 },
      { name: "errorChargeShare", value: 0.25 },
      { name: "touchConvention", value: "variation-or-option-id" },
    ]);
  });
  it("is labeled simulated", () => {
    expect(r.label).toBe("simulated");
  });
});

describe("sizeImpact — focused behaviours", () => {
  it("a multi-line order touched by two findings counts once and prices each touched line once", () => {
    const r = sizeImpact({
      ...BASE,
      findings: [F_PRICE, { ...F_PRICE, id: "v1#other", ruleId: "LST-PRICE-SALE-GT" }, F_AVAIL],
      orders: [order({ order_id: "A", lines: [line("v1", 2, 1000), line("v2", 1, 500)] })],
    });
    expect(r.ordersAtRiskDistinct).toBe(1);
    expect(r.prospectiveExposureCents).toBe(2500); // 2000 + 500, the doubly-found v1 line not doubled
  });

  it("an order outside the window contributes nothing at all", () => {
    const r = sizeImpact({ ...BASE, orders: [ORDERS[4], ORDERS[7]] });
    expect(r.ordersAtRiskDistinct).toBe(0);
    expect(r.observedMenuRefundCents).toBe(0);
    expect(r.prospectiveExposureCents).toBe(0);
    expect(r.errorChargeExposureCents).toBe(0);
  });

  it("a wider window (30 days) admits E: 6 orders at risk, observed 900 + 1000 = 1900", () => {
    const r = sizeImpact({ ...BASE, windowDays: 30 });
    expect(r.ordersAtRiskDistinct).toBe(6);
    expect(r.observedMenuRefundCents).toBe(1900);
  });

  it("a modifier finding touches by option id from its claim id even when it has no referenceRowId", () => {
    const r = sizeImpact({ ...BASE, findings: [F_MOD], orders: [ORDERS[3], ORDERS[6], ORDERS[7]] });
    expect(r.ordersAtRiskDistinct).toBe(1);
    expect(r.prospectiveExposureCents).toBe(300);
  });

  it("an empty input is all zeros", () => {
    const r = sizeImpact({ ...BASE, orders: [], findings: [] });
    expect([r.ordersAtRiskDistinct, r.observedMenuRefundCents, r.prospectiveExposureCents, r.agentCancelExposureCents]).toEqual([0, 0, 0, 0]);
  });
});

describe("sizeImpact — typed refusal of malformed input", () => {
  const bad = (orders: OrderRecord[], over: Partial<ImpactInput> = {}) => () =>
    sizeImpact({ ...BASE, orders, ...over });
  const refunded = (alloc: number, refund = 900): OrderRecord =>
    order({
      order_id: "R",
      status: "refunded",
      reason: "menu",
      refund_cents: refund,
      refund_allocation: [{ variation_id: "v1", cents: alloc }],
      lines: [line("v1", 1, 1000)],
    });

  it("a refunded order whose allocation does not sum to refund_cents throws", () => {
    expect(bad([refunded(800)])).toThrow(ImpactInputError);
    expect(bad([refunded(800)])).toThrow(/allocation sums to 800/);
  });
  it("a consistent refunded order does not throw", () => {
    expect(bad([refunded(900)])).not.toThrow();
  });
  it("NaN and negative cents throw", () => {
    expect(bad([order({ order_id: "N", lines: [line("v1", 1, Number.NaN)] })])).toThrow(ImpactInputError);
    expect(bad([order({ order_id: "N", lines: [line("v1", 1, -5)] })])).toThrow(ImpactInputError);
    expect(bad([refunded(-900, -900)])).toThrow(ImpactInputError);
  });
  it("a refund on a non-refunded order, a bad qty, a bad date, a bad share and a bad window throw", () => {
    expect(bad([order({ order_id: "X", refund_cents: 100, lines: [line("v1", 1, 1)] })])).toThrow(ImpactInputError);
    expect(bad([order({ order_id: "X", lines: [line("v1", 0, 1)] })])).toThrow(ImpactInputError);
    expect(bad([order({ order_id: "X", placed_at: "not a date", lines: [line("v1", 1, 1)] })])).toThrow(ImpactInputError);
    expect(bad([], { errorChargeShare: 1.5 })).toThrow(ImpactInputError);
    expect(bad([], { errorChargeShare: Number.NaN })).toThrow(ImpactInputError);
    expect(bad([], { windowDays: 0 })).toThrow(ImpactInputError);
  });
  it("an allocation naming a variation that is not a line throws", () => {
    const o = refunded(900);
    o.refund_allocation = [{ variation_id: "zzz", cents: 900 }];
    expect(bad([o])).toThrow(/not a line/);
  });
});

describe("lib/impact is pure and egress-free (import-walk tooth)", () => {
  it("its real import closure has no violation and reaches no Node builtin or package", () => {
    const entry = join(process.cwd(), "lib", "impact", "index.ts");
    const { violations, seen } = walkImports(entry, { root: process.cwd() });
    expect(violations).toEqual([]);
    expect([...seen].filter((s) => !s.endsWith("lib/impact/index.ts"))).toEqual([]);
  });
});
