// S2-crew stub — replaced by the S2-impact lane at merge
/**
 * STUB of the Impact seat's arithmetic module. It exists only so the S2-crew
 * lane can wire `size_impact` into the registry against the contract both
 * lanes were given (packet 2026-10-31); the real module lives on the
 * S2-impact branch. Every export below is exactly that contract. `sizeImpact`
 * THROWS, so no figure can ever come from this file.
 *
 * Plain: a placeholder with the right shape and no insides — ask it for a
 * number and it refuses, loudly.
 */

export interface OrderRecord {
  order_id: string;
  placed_at: string;
  channel: "app" | "agent";
  lines: { variation_id: string; modifier_option_ids: string[]; qty: number; unit_price_cents_charged: number }[];
  status: "fulfilled" | "refunded" | "cancelled";
  refund_cents: number;
  refund_allocation: { variation_id: string; cents: number }[];
  reason: "menu" | "other" | "none";
}

export interface ImpactInput {
  findings: { id: string; ruleId: string; category: string; referenceRowId: string | null }[];
  orders: OrderRecord[];
  windowDays: number;
  errorChargeShare: number;
}

export interface ImpactResult {
  ordersAtRiskDistinct: number;
  observedMenuRefundCents: number;
  prospectiveExposureCents: number;
  agentCancelExposureCents: number;
  errorChargeExposureCents: number;
  assumptions: { name: string; value: number | string }[];
  label: "simulated";
}

export function sizeImpact(input: ImpactInput): ImpactResult {
  void input;
  throw new Error("impact: not built in this lane");
}
