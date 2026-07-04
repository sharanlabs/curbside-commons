/**
 * Fee-statement schema — F1a (UC-1 deterministic spine, plan §5 F1 / §7).
 *
 * The typed model of a THIRD-PARTY DELIVERY PLATFORM's monthly itemized fee
 * statement, as the codified rule table's statement-input contract requires
 * (docs/research/uc1-rule-table.md § "JSON schema"; NYC §20-563.3(h) guarantees
 * such a per-transaction itemized list exists). Every money value is INTEGER
 * CENTS — no float money, ever. The statement is SIMULATED: a mandatory
 * `simulated: true` marker rides on the wrapper (C10), and no field claims real
 * platform data.
 *
 * TWO SEAMS modeled now (F1b fills the classifier between them):
 *  - `declaredCategory` is what the PLATFORM CLAIMS a line is — it may be one of
 *    the four legal categories OR an arbitrary/other label the platform invented.
 *  - the TRUE category (what the charge actually is) is the F1b line-item
 *    classifier's job; it lives ONLY in the generator's answer key, NEVER in the
 *    statement. The deterministic spine audits the statement AS DECLARED.
 *
 * Plain: a fake-but-realistic monthly delivery bill, in the shape the law says
 * the platform owes the restaurant — every fee line, in whole cents, labeled
 * simulated. What each fee is CALLED is on the bill; what it REALLY is is the
 * classifier's job (a later slice), kept out of the bill on purpose.
 */

/** The four fee categories NYC §20-563.3(d) permits — the category-lock whitelist. */
export type LegalFeeCategory =
  | "delivery_fee"
  | "basic_service_fee"
  | "transaction_fee"
  | "enhanced_service_fee";

/** Ordered legal categories — runtime export so rules/evals can enumerate them. */
export const LEGAL_FEE_CATEGORIES: readonly LegalFeeCategory[] = [
  "delivery_fee",
  "basic_service_fee",
  "transaction_fee",
  "enhanced_service_fee",
] as const;

/** True iff `v` is one of the four legally permitted fee categories. */
export function isLegalFeeCategory(v: string): v is LegalFeeCategory {
  return (LEGAL_FEE_CATEGORIES as readonly string[]).includes(v);
}

/**
 * The platform's DECLARED category for a line. A legal category is a
 * {@link LegalFeeCategory}; anything else is an arbitrary/other label the
 * platform used (e.g. "promotion_deduction", "service_and_delivery") — the
 * distinction between declared and TRUE category is F1b's job. Kept as a bare
 * `string` so an arbitrary label is representable without loss.
 */
export type DeclaredCategory = string;

/** One fee line of the monthly itemized statement (per §20-563.3(h)). */
export interface StatementLine {
  /** The online order this fee was charged against. */
  readonly orderId: string;
  /** Calendar month of the charge, "YYYY-MM" (drives the monthly-average + e-1 window). */
  readonly month: string;
  /** What the PLATFORM claims this line is — legal category OR arbitrary label. */
  readonly declaredCategory: DeclaredCategory;
  /** The platform's free-text line label as printed on the statement. */
  readonly label: string;
  /** The charged amount, INTEGER cents (never a float; >= 0). */
  readonly amountCents: number;
  /**
   * The order's purchase price, INTEGER cents (> 0) — the cap base. Its exact
   * inclusions/exclusions are UNRESOLVED (U1); see PURCHASE_PRICE_BASE_STATUS.
   */
  readonly orderPurchasePriceCents: number;
  /** True iff this line is a refund/credit (relevant to the §20-563.3(e) safe harbor). */
  readonly isRefund: boolean;
  /**
   * True iff the platform documents this charge as an exact processor pass-through
   * (the §20-563.3(c)(i)–(ii) exception to the 3% transaction-fee cap). An
   * asserted flag — the audit cannot verify the underlying processor charge.
   */
  readonly passthroughDocumented: boolean;
  /**
   * ISO date "YYYY-MM-DD" the refund was issued — present iff {@link isRefund}.
   * Used to test the §20-563.3(e) 30-day window; a refund with no date cannot
   * satisfy the safe harbor.
   */
  readonly refundedAtDate?: string;
}

/** Generator provenance — the statement corpus is seeded/deterministic (plan §8). */
export interface StatementGenerator {
  readonly name: string;
  readonly seed: number;
  readonly version: string;
}

/** Statement-level metadata + the MANDATORY simulated marker (C10). */
export interface StatementMeta {
  /** Honesty label — always true for this corpus (C10). */
  readonly simulated: true;
  readonly generator: StatementGenerator;
  /** The restaurant the statement is addressed to (simulated). */
  readonly merchant: string;
  /** The statement's calendar month, "YYYY-MM". */
  readonly month: string;
  /** ISO-4217 currency for every amount. */
  readonly currency: "USD";
  /**
   * The evaluation date, "YYYY-MM-DD" — DATA, never a clock read (determinism).
   * The §20-563.3(e) refund window is resolved against this, so identical inputs
   * always yield byte-identical verdicts.
   */
  readonly asOf: string;
  /**
   * The ASSUMED purchase-price base convention this statement's amounts follow
   * (U1 is unresolved — see PURCHASE_PRICE_BASE_STATUS). Declared explicitly so
   * the answer-key gold labels are internally consistent with a stated base.
   */
  readonly purchasePriceBaseConvention: string;
}

/** A merchant's monthly itemized fee statement — the audit's minimum input. */
export interface MonthlyStatement {
  readonly meta: StatementMeta;
  readonly lines: readonly StatementLine[];
}

/**
 * U1 PROVISIONALITY, in ONE place (plan F1a item 5). The statutory cap base
 * ("purchase price of each online order") is quoted verbatim but its
 * inclusions/exclusions (tax / tip / pre- vs post-discount subtotal) are
 * UNVERIFIED (source-memo U1). Every base-derived verdict is provisional until
 * this flips; resolving U1 later is a one-constant edit.
 */
export const PURCHASE_PRICE_BASE_STATUS = "unresolved-U1" as const;

/**
 * The ASSUMED base convention the F1a corpus + audit operate under while U1 is
 * unresolved. Rendered into every base-derived verdict so a reader always sees
 * the assumption behind an over-cap call (plan F1a item 5(iii)).
 */
export const ASSUMED_PURCHASE_PRICE_BASE =
  "order item subtotal before discounts, excluding tax and tip (ASSUMED — U1 unresolved)";
