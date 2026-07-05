/**
 * Seeded fee-statement generator — F1a (plan §5 F1 item 2; §8 seeded/deterministic).
 *
 * Produces the frozen fee corpus: a FAITHFUL statement (all compliant) and three
 * DRIFTED statements that plant the plan §7 fee-line classes, plus a machine
 * ANSWER KEY that labels every planted violation with its class, expected rule id,
 * expected verdict, and detection mode (deterministic vs deferred-to-classifier).
 *
 * DETERMINISM: the builder is a pure function of the pinned seed; the seed pins
 * provenance/reproducibility, while the fee AMOUNTS are fixed by design — each
 * plants an EXACT, answer-keyed violation at a known cap boundary (random amounts
 * would make boundary-exact planting fragile). A freeze-integrity eval byte-locks
 * the committed fixtures to this builder.
 *
 * IMPORTANT (U1, structural): the ASSUMED purchase-price base convention is a
 * NAMED parameter, recorded in the answer-key meta AND every statement's meta, so
 * the gold labels are internally consistent with one stated base.
 *
 * Everything is SIMULATED and labeled so (C10): no real platform, merchant, or
 * fee data — synthetic statements audited against REAL codified law (NYC §20-563.3).
 *
 * Plain: the recipe that builds the fake delivery bills — one honest bill and
 * three rigged ones — plus the answer key saying exactly which cheats are planted
 * and which our deterministic checker can (and can't yet) catch.
 */
import { auditStatement, FEES_SPEC_VERSION } from "./audit.ts";
import type { FeeAuditReport, FeeVerdict } from "./finding.ts";
import type { FeeLineClass } from "./index.ts";
import {
  ASSUMED_PURCHASE_PRICE_BASE,
  type MonthlyStatement,
  type StatementLine,
} from "./statement.ts";

export const FEES_CORPUS_SEED = 20260703;
const CORPUS_MONTH = "2026-06";
const AS_OF_CLOSED = "2026-08-15"; // after the §20-563.3(e) window (closes 2026-07-30)
const AS_OF_OPEN = "2026-07-10"; // inside the window
const MERCHANT = "Curbside Commons Test Kitchen (simulated)";

const GENERATOR = { name: "synthetic-fee-statements", seed: FEES_CORPUS_SEED, version: "1.0.0" } as const;

/** Detection mode recorded per planted violation (measured honestly by C6). */
export type FeeDetectionMode = "deterministic" | "deferred-to-classifier";

/** One answer-key entry — ground truth for a planted line/aggregate. */
export interface FeeAnswerKeyEntry {
  readonly id: string;
  readonly feeClass: FeeLineClass;
  readonly detection: FeeDetectionMode;
  /** The exact claim.id the engine emits for this catch (null iff deferred). */
  readonly expectedClaimId: string | null;
  /** The rule id the engine cites (null iff deferred). */
  readonly expectedRuleId: string | null;
  /** The verdict state the engine assigns (null iff deferred). */
  readonly expectedVerdict: FeeVerdict | null;
  /** The order(s) the planted line rides on — for readability. */
  readonly targetOrderId: string;
  readonly note: string;
}

/** The full answer key for the fee corpus (per statement file). */
export interface FeeAnswerKey {
  readonly simulated: true;
  readonly seed: number;
  readonly asOf: { readonly closed: string; readonly open: string };
  /** The single ASSUMED base convention every gold label is consistent with (U1). */
  readonly purchasePriceBaseConvention: string;
  readonly statements: Readonly<Record<string, { readonly entries: readonly FeeAnswerKeyEntry[] }>>;
}

// ── builders ──────────────────────────────────────────────────────────────────

function meta(month: string, asOf: string): MonthlyStatement["meta"] {
  return {
    simulated: true,
    generator: GENERATOR,
    merchant: MERCHANT,
    month,
    currency: "USD",
    asOf,
    purchasePriceBaseConvention: ASSUMED_PURCHASE_PRICE_BASE,
  };
}

function line(
  orderId: string,
  declaredCategory: string,
  label: string,
  amountCents: number,
  orderPurchasePriceCents: number,
  extra: Partial<StatementLine> = {},
): StatementLine {
  return {
    orderId,
    month: CORPUS_MONTH,
    declaredCategory,
    label,
    amountCents,
    orderPurchasePriceCents,
    isRefund: false,
    passthroughDocumented: false,
    ...extra,
  };
}

/** FAITHFUL: every line within cap, monthly averages within, basic present (no d-4). */
export function buildFaithfulStatement(): MonthlyStatement {
  return {
    meta: meta(CORPUS_MONTH, AS_OF_CLOSED),
    lines: [
      line("ORD-1", "delivery_fee", "Delivery fee", 300, 2000), // 15% exactly
      line("ORD-1", "basic_service_fee", "Basic service fee", 100, 2000), // 5%
      line("ORD-1", "transaction_fee", "Card processing", 60, 2000), // 3%
      line("ORD-1", "enhanced_service_fee", "Premium placement", 400, 2000), // 20%
      line("ORD-2", "delivery_fee", "Delivery fee", 300, 3000), // 10%
      line("ORD-2", "basic_service_fee", "Basic service fee", 90, 3000), // 3%
    ],
  };
}

/**
 * DRIFTED: plants the six §7 classes. Delivery is systematically over 15% so the
 * MONTHLY AVERAGE fails (not just per-order); a transaction fee is over the hard
 * 3%; two lines use non-permitted categories (bundling + promotion-deduction);
 * an enhanced fee rides with no basic (d-4). Two ORD-5 lines are within-cap under
 * legal categories — bundling/relabeling only a classifier can unmask (deferred).
 */
export function buildDriftedStatement(): MonthlyStatement {
  return {
    meta: meta(CORPUS_MONTH, AS_OF_CLOSED),
    lines: [
      line("ORD-1", "delivery_fee", "Delivery fee", 360, 2000), // 18% (over 15%)
      line("ORD-1", "transaction_fee", "Card processing", 160, 2000), // 8% (over 3%)
      line("ORD-2", "delivery_fee", "Delivery fee", 360, 2000), // 18%
      line("ORD-2", "enhanced_service_fee", "Premium placement", 200, 2000), // 10% (within, but no basic → d-4)
      line("ORD-3", "delivery_fee", "Delivery fee", 360, 2000), // 18%
      line("ORD-3", "service_and_delivery", "Combined service + delivery bundle", 150, 2000), // d-1 bundling
      line("ORD-4", "delivery_fee", "Delivery fee", 360, 2000), // 18%
      line("ORD-4", "promotion_deduction", "Promo recovery charge", 120, 2000), // d-1 promotion-deduction
      line("ORD-5", "transaction_fee", "Fees (service + processing bundle)", 20, 1000), // 2% (within) — deferred bundling
      line("ORD-5", "enhanced_service_fee", "Marketing (formerly delivery)", 150, 1000), // 15% (within) — deferred relabeling
    ],
  };
}

/** CURED: a delivery over-cap fully refunded within the §20-563.3(e) window. */
export function buildCuredStatement(): MonthlyStatement {
  return {
    meta: meta(CORPUS_MONTH, AS_OF_CLOSED),
    lines: [
      line("ORD-C1", "delivery_fee", "Delivery fee", 360, 2000), // 18%
      line("ORD-C2", "delivery_fee", "Delivery fee", 360, 2000), // 18% → monthly over by $1.20
      line("ORD-C1", "delivery_fee", "Refund: delivery over-cap correction", 120, 2000, {
        isRefund: true,
        refundedAtDate: "2026-07-15", // within the window (closes 2026-07-30)
      }),
    ],
  };
}

/** CONDITIONAL: the same delivery over-cap, evaluated while the window is still open. */
export function buildConditionalStatement(): MonthlyStatement {
  return {
    meta: meta(CORPUS_MONTH, AS_OF_OPEN),
    lines: [
      line("ORD-K1", "delivery_fee", "Delivery fee", 360, 2000), // 18%
      line("ORD-K2", "delivery_fee", "Delivery fee", 360, 2000), // 18% → monthly over
    ],
  };
}

/** The machine answer key — ground truth for the whole corpus. */
export function buildFeeAnswerKey(): FeeAnswerKey {
  return {
    simulated: true,
    seed: FEES_CORPUS_SEED,
    asOf: { closed: AS_OF_CLOSED, open: AS_OF_OPEN },
    purchasePriceBaseConvention: ASSUMED_PURCHASE_PRICE_BASE,
    statements: {
      "statement.faithful.json": { entries: [] },
      "statement.drifted.json": {
        entries: [
          { id: "fee-drift-001", feeClass: "over-cap", detection: "deterministic", expectedClaimId: `${CORPUS_MONTH}#delivery_fee`, expectedRuleId: "NYC-563.3-a-2", expectedVerdict: "violation", targetOrderId: "ORD-1..ORD-4", note: "delivery fees average 16% of monthly purchases — over the 15% cap even on the monthly-average alternative; window closed, no refund" },
          { id: "fee-drift-002", feeClass: "processing-fee-base-inflation", detection: "deterministic", expectedClaimId: "ORD-1#transaction_fee#L1", expectedRuleId: "NYC-563.3-c-1", expectedVerdict: "violation", targetOrderId: "ORD-1", note: "transaction fee 8% > hard 3% cap, not documented as a pass-through (c-2); no safe harbor for c" },
          { id: "fee-drift-003", feeClass: "bundling", detection: "deterministic", expectedClaimId: "ORD-3#service_and_delivery#L5", expectedRuleId: "NYC-563.3-d-1", expectedVerdict: "violation", targetOrderId: "ORD-3", note: "a lumped line under a non-permitted category label — caught by the d-1 category lock" },
          { id: "fee-drift-004", feeClass: "promotion-deduction-mischaracterization", detection: "deterministic", expectedClaimId: "ORD-4#promotion_deduction#L7", expectedRuleId: "NYC-563.3-d-1", expectedVerdict: "violation", targetOrderId: "ORD-4", note: "a charge dressed as a 'promotion deduction' is not a permitted fee category — d-1" },
          { id: "fee-drift-005", feeClass: "misclassification", detection: "deterministic", expectedClaimId: `${CORPUS_MONTH}#enhanced-without-basic`, expectedRuleId: "NYC-563.3-d-4", expectedVerdict: "violation", targetOrderId: "ORD-2", note: "enhanced service fee charged with no basic service fee in the statement — d-4 gating clause" },
          { id: "fee-drift-006", feeClass: "bundling", detection: "deferred-to-classifier", expectedClaimId: null, expectedRuleId: null, expectedVerdict: null, targetOrderId: "ORD-5", note: "a within-cap line under a LEGAL category that actually bundles service + processing — unbundling needs the F1b line-item classifier; the deterministic spine sees only a compliant transaction fee" },
          { id: "fee-drift-007", feeClass: "relabeling", detection: "deferred-to-classifier", expectedClaimId: null, expectedRuleId: null, expectedVerdict: null, targetOrderId: "ORD-5", note: "an enhanced fee relabeled from delivery across periods; pure cross-month relabeling needs multi-month data + fee-change-notice records (g-1-iv is non-statement-checkable) — deferred" },
        ],
      },
      "statement.cured.json": {
        entries: [
          { id: "fee-cure-001", feeClass: "over-cap", detection: "deterministic", expectedClaimId: `${CORPUS_MONTH}#delivery_fee`, expectedRuleId: "NYC-563.3-a-2", expectedVerdict: "cured-by-refund", targetOrderId: "ORD-C1,ORD-C2", note: "delivery over-cap fully refunded within the §20-563.3(e) 30-day window — not a violation" },
        ],
      },
      "statement.conditional.json": {
        entries: [
          { id: "fee-cond-001", feeClass: "over-cap", detection: "deterministic", expectedClaimId: `${CORPUS_MONTH}#delivery_fee`, expectedRuleId: "NYC-563.3-a-2", expectedVerdict: "conditional-pending-refund-window", targetOrderId: "ORD-K1,ORD-K2", note: "delivery over-cap evaluated while the 30-day window is still open — not yet a violation" },
        ],
      },
    },
  };
}

/** Golden reports for the corpus (byte-frozen by the freeze-integrity eval). */
export function buildCorpusReports(): Readonly<Record<string, FeeAuditReport>> {
  return {
    "statement.faithful.json": auditStatement(buildFaithfulStatement()),
    "statement.drifted.json": auditStatement(buildDriftedStatement()),
    "statement.cured.json": auditStatement(buildCuredStatement()),
    "statement.conditional.json": auditStatement(buildConditionalStatement()),
  };
}

/** Re-exported for the fixture generator's report headers. */
export { FEES_SPEC_VERSION };
