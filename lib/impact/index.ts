/**
 * Impact seat arithmetic — S2-impact (plan §§ 5, 12; Codex cross-check § 2 B,
 * adopted 2026-10-14). Pure, deterministic, egress-free: plain JSON shapes in,
 * plain figures out. Imports nothing (no lib/packs, no lib/verifier-core, no
 * node:fs), so it cannot reach a network, a clock or a model.
 *
 * Plain: given what the checker found and a list of invented orders, how many
 * orders touched a wrong row, how much did menu-caused refunds cost, and how
 * much is exposed the next time. Every figure is simulated; none is a
 * prevention or a saving.
 *
 * TOUCH CONVENTION (name: "variation-or-option-id"). A finding TOUCHES an order
 * line when any of these holds:
 *   1. line.variation_id === finding.referenceRowId;
 *   2. finding.referenceRowId is in line.modifier_option_ids;
 *   3. finding.id follows the claim-id convention `<row>#modifier.<optionId>`
 *      (lib/packs/listings/modifiers.ts) and <optionId> is in
 *      line.modifier_option_ids.
 * A null referenceRowId matches only by rule 3. A line touched by several
 * findings is touched ONCE; an order with several touched lines counts ONCE.
 *
 * WINDOW. Only orders with placed_at within `windowDays` of the LATEST
 * placed_at in the input (inclusive) contribute anything.
 *
 * FIGURES (all integer cents except the count):
 * - ordersAtRiskDistinct: distinct in-window orders with >= 1 touched line.
 * - observedMenuRefundCents: sum of refund_allocation entries (explicit; never
 *   order-level refund_cents divided or prorated) on touched lines of in-window
 *   orders whose reason is "menu". OBSERVED — money already refunded.
 * - prospectiveExposureCents: sum of unit_price_cents_charged x qty over touched
 *   lines of in-window FULFILLED orders. PROSPECTIVE — what is exposed next
 *   time; association, not prevention, not a saving.
 * - agentCancelExposureCents: line value of touched lines of in-window "agent"
 *   channel orders (any status) touching a finding whose ruleId starts with
 *   LST-AVAIL- (the availability family).
 * - errorChargeExposureCents: round(observedMenuRefundCents x errorChargeShare);
 *   the share is a declared assumption echoed in `assumptions`.
 */

export interface ImpactFinding {
  id: string;
  ruleId: string;
  category: string;
  referenceRowId: string | null;
}
export interface OrderLine {
  variation_id: string;
  modifier_option_ids: string[];
  qty: number;
  unit_price_cents_charged: number;
}
export interface OrderRecord {
  order_id: string;
  placed_at: string;
  channel: "app" | "agent";
  lines: OrderLine[];
  status: "fulfilled" | "refunded" | "cancelled";
  refund_cents: number;
  refund_allocation: { variation_id: string; cents: number }[];
  reason: "menu" | "other" | "none";
}
export interface ImpactInput {
  findings: ImpactFinding[];
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

/** Thrown for any malformed input; `code` names the check that failed. */
export class ImpactInputError extends Error {
  readonly code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = "ImpactInputError";
    this.code = code;
  }
}

export const TOUCH_CONVENTION = "variation-or-option-id";
export const AVAILABILITY_RULE_PREFIX = "LST-AVAIL-";
const DAY_MS = 86_400_000;
const MODIFIER_ID = /#modifier\.(.+)$/;

function isCents(n: unknown): n is number {
  return typeof n === "number" && Number.isInteger(n) && n >= 0;
}

function validate(input: ImpactInput): number[] {
  const { windowDays, errorChargeShare } = input;
  if (typeof windowDays !== "number" || !Number.isFinite(windowDays) || windowDays <= 0) {
    throw new ImpactInputError("window", `windowDays must be a positive finite number, got ${String(windowDays)}`);
  }
  if (typeof errorChargeShare !== "number" || !Number.isFinite(errorChargeShare) || errorChargeShare < 0 || errorChargeShare > 1) {
    throw new ImpactInputError("share", `errorChargeShare must be within [0, 1], got ${String(errorChargeShare)}`);
  }
  return input.orders.map((o) => {
    const t = Date.parse(o.placed_at);
    if (Number.isNaN(t)) throw new ImpactInputError("placed_at", `order ${o.order_id}: placed_at is not a date`);
    for (const l of o.lines) {
      if (!isCents(l.unit_price_cents_charged)) {
        throw new ImpactInputError("cents", `order ${o.order_id}: unit_price_cents_charged must be a non-negative integer`);
      }
      if (!Number.isInteger(l.qty) || l.qty <= 0) {
        throw new ImpactInputError("qty", `order ${o.order_id}: qty must be a positive integer`);
      }
    }
    if (!isCents(o.refund_cents)) {
      throw new ImpactInputError("cents", `order ${o.order_id}: refund_cents must be a non-negative integer`);
    }
    let sum = 0;
    for (const a of o.refund_allocation) {
      if (!isCents(a.cents)) throw new ImpactInputError("cents", `order ${o.order_id}: allocation cents must be a non-negative integer`);
      if (!o.lines.some((l) => l.variation_id === a.variation_id)) {
        throw new ImpactInputError("allocation-target", `order ${o.order_id}: allocation names ${a.variation_id}, which is not a line`);
      }
      sum += a.cents;
    }
    if (o.status === "refunded" ? sum !== o.refund_cents : o.refund_cents !== 0 || sum !== 0) {
      throw new ImpactInputError(
        "allocation-sum",
        `order ${o.order_id}: refund allocation sums to ${sum}, refund_cents is ${o.refund_cents} (status ${o.status})`,
      );
    }
    return t;
  });
}

function touches(f: ImpactFinding, l: OrderLine): boolean {
  if (f.referenceRowId !== null) {
    if (l.variation_id === f.referenceRowId) return true;
    if (l.modifier_option_ids.includes(f.referenceRowId)) return true;
  }
  const m = MODIFIER_ID.exec(f.id);
  return m !== null && l.modifier_option_ids.includes(m[1]);
}

const lineValue = (l: OrderLine): number => l.unit_price_cents_charged * l.qty;

export function sizeImpact(input: ImpactInput): ImpactResult {
  const times = validate(input);
  const latest = times.length === 0 ? 0 : Math.max(...times);
  const floor = latest - input.windowDays * DAY_MS;

  let atRisk = 0;
  let observed = 0;
  let prospective = 0;
  let agentCancel = 0;

  input.orders.forEach((o, i) => {
    if (times[i] < floor) return;
    const touched = o.lines.filter((l) => input.findings.some((f) => touches(f, l)));
    if (touched.length === 0) return;
    atRisk += 1;
    if (o.reason === "menu") {
      const vars = new Set(touched.map((l) => l.variation_id));
      for (const a of o.refund_allocation) if (vars.has(a.variation_id)) observed += a.cents;
    }
    if (o.status === "fulfilled") for (const l of touched) prospective += lineValue(l);
    if (o.channel === "agent") {
      const avail = input.findings.filter((f) => f.ruleId.startsWith(AVAILABILITY_RULE_PREFIX));
      for (const l of o.lines) if (avail.some((f) => touches(f, l))) agentCancel += lineValue(l);
    }
  });

  return {
    ordersAtRiskDistinct: atRisk,
    observedMenuRefundCents: observed,
    prospectiveExposureCents: prospective,
    agentCancelExposureCents: agentCancel,
    errorChargeExposureCents: Math.round(observed * input.errorChargeShare),
    assumptions: [
      { name: "windowDays", value: input.windowDays },
      { name: "errorChargeShare", value: input.errorChargeShare },
      { name: "touchConvention", value: TOUCH_CONVENTION },
    ],
    label: "simulated",
  };
}
