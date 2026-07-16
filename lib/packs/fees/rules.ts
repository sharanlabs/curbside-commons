/**
 * Codified NYC §20-563.3 fee-cap rules — F1a (plan §5 F1 item 4).
 *
 * The 17 rules of the VERIFIED-primary rule table (docs/research/uc1-rule-table.md
 * + its JSON twin uc1-rule-table.draft.json) expressed as TYPED TS PREDICATES over
 * a parsed {@link MonthlyStatement} — NOT a runtime interpreter of the JSON twin.
 * The JSON twin is the AUTHORITY the DRIFT-LOCK eval wires against: every twin
 * rule id is EITHER implemented here as a predicate whose cap_pct / base /
 * drift_classes match the twin 1:1, OR registered in {@link NON_STATEMENT_CHECKABLE}
 * with a written reason. A rule that is neither fails the drift-lock; a TS rule
 * absent from the twin fails it too (set-equality, both directions).
 *
 * Plain: the legal fee caps turned into exact yes/no tests in code, each pinned
 * to the same rulebook row a human can read — and a guard test that makes it
 * impossible for the code and the rulebook to silently drift apart.
 */
import type { FeeLineClass } from "./index.ts";
import { isLegalFeeCategory, type MonthlyStatement, type StatementLine } from "./statement.ts";

/** Kinds of rule (verbatim from the twin's `kind` vocabulary). */
export type FeeRuleKind =
  | "per_order_cap"
  | "monthly_average_cap"
  | "passthrough_exception"
  | "category_whitelist"
  | "eligibility_gate"
  | "over_cap_refund_safe_harbor";

/** One codified rule — metadata mirrors the JSON twin field-for-field (drift-lock). */
export interface FeeRule {
  /** Twin `id`, e.g. "NYC-563.3-a-1". */
  readonly id: string;
  /** Twin `source_clause` verbatim — cited as the reference-row id (C2). */
  readonly sourceClause: string;
  /** Twin `kind`. */
  readonly kind: FeeRuleKind;
  /** Twin `cap_pct` (percent, where numeric); undefined when the twin omits it. */
  readonly capPct?: number;
  /**
   * Twin `base` verbatim (where numeric); PRESENCE of this field is what makes a
   * rule "base-derived" (U1-provisional). Undefined when the twin omits it.
   */
  readonly base?: string;
  /** Twin `drift_classes`, normalized to the {@link FeeLineClass} enum (1:1). */
  readonly driftClasses: readonly FeeLineClass[];
}

/**
 * Normalize a JSON-twin drift-class string (which uses spaces in the two
 * compound classes) to the plan §7 {@link FeeLineClass} enum (hyphenated). The
 * drift-lock eval compares a rule's {@link FeeRule.driftClasses} against the twin
 * entry through this map, so "1:1 match" is exact post-normalization.
 */
const DRIFT_CLASS_FROM_TWIN: Readonly<Record<string, FeeLineClass>> = {
  "over-cap": "over-cap",
  misclassification: "misclassification",
  relabeling: "relabeling",
  bundling: "bundling",
  "promotion-deduction mischaracterization": "promotion-deduction-mischaracterization",
  "processing-fee base inflation": "processing-fee-base-inflation",
};

/** Normalize a twin drift_classes array to the enum (throws on an unknown label). */
export function normalizeTwinDriftClasses(twin: readonly string[]): readonly FeeLineClass[] {
  return twin.map((c) => {
    const mapped = DRIFT_CLASS_FROM_TWIN[c];
    if (mapped === undefined) {
      throw new Error(`rules: unknown twin drift-class "${c}" — update DRIFT_CLASS_FROM_TWIN`);
    }
    return mapped;
  });
}

/**
 * The rules implemented as statement predicates. cap_pct / base / drift_classes
 * are transcribed VERBATIM from the JSON twin so the drift-lock can assert 1:1.
 */
export const FEE_RULES: readonly FeeRule[] = [
  { id: "NYC-563.3-a-1", sourceClause: "§ 20-563.3(a)", kind: "per_order_cap", capPct: 15, base: "purchase_price_per_online_order", driftClasses: ["over-cap", "misclassification"] },
  { id: "NYC-563.3-a-2", sourceClause: "§ 20-563.3(a) (averaging clause)", kind: "monthly_average_cap", capPct: 15, base: "sum_purchase_price_all_orders_in_calendar_month", driftClasses: ["over-cap", "relabeling"] },
  { id: "NYC-563.3-b-1", sourceClause: "§ 20-563.3(b)", kind: "per_order_cap", capPct: 5, base: "purchase_price_per_online_order", driftClasses: ["over-cap", "misclassification"] },
  { id: "NYC-563.3-b-2", sourceClause: "§ 20-563.3(b) (averaging clause)", kind: "monthly_average_cap", capPct: 5, base: "sum_purchase_price_all_orders_in_calendar_month", driftClasses: ["over-cap", "relabeling"] },
  { id: "NYC-563.3-c-1", sourceClause: "§ 20-563.3(c)", kind: "per_order_cap", capPct: 3, base: "purchase_price_per_online_order", driftClasses: ["over-cap", "processing-fee-base-inflation"] },
  { id: "NYC-563.3-c-2", sourceClause: "§ 20-563.3(c)(i)-(ii)", kind: "passthrough_exception", driftClasses: ["processing-fee-base-inflation", "over-cap"] },
  { id: "NYC-563.3-d-1", sourceClause: "§ 20-563.3(d) (category lock)", kind: "category_whitelist", driftClasses: ["misclassification", "relabeling", "promotion-deduction-mischaracterization", "bundling"] },
  { id: "NYC-563.3-d-2", sourceClause: "§ 20-563.3(d)", kind: "per_order_cap", capPct: 20, base: "purchase_price_per_online_order", driftClasses: ["over-cap"] },
  { id: "NYC-563.3-d-3", sourceClause: "§ 20-563.3(d) (averaging clause)", kind: "monthly_average_cap", capPct: 20, base: "sum_purchase_price_all_orders_in_calendar_month", driftClasses: ["over-cap", "relabeling"] },
  { id: "NYC-563.3-d-4", sourceClause: "§ 20-563.3(d) (gating clause)", kind: "eligibility_gate", driftClasses: ["misclassification"] },
  { id: "NYC-563.3-e-1", sourceClause: "§ 20-563.3(e)", kind: "over_cap_refund_safe_harbor", driftClasses: ["over-cap", "promotion-deduction-mischaracterization"] },
] as const;

/** Fast lookup of a rule by id. */
export const FEE_RULE_BY_ID: ReadonlyMap<string, FeeRule> = new Map(
  FEE_RULES.map((r) => [r.id, r]),
);

/**
 * Rule ids the JSON twin defines but the statement schema CANNOT check — each
 * with the written reason it is out of scope (plan F1a item 4: register, don't
 * fake). These need data an itemized fee statement (§20-563.3(h)) does not carry.
 */
export const NON_STATEMENT_CHECKABLE: ReadonlyMap<string, string> = new Map([
  ["NYC-563.3-a-3", "Delivery-service obligation (must serve customers within at least a 1-mile radius of the establishment). A structural service fact, not a fee number — not machine-checkable from a statement alone."],
  ["NYC-563.3-f-1", "Search/discoverability obligation for a paid basic service fee. A serving-surface fact, not numerically auditable from a statement."],
  ["NYC-563.3-l-1", "Commissioner fee-cap report duty (agency reporting). Context only — a city-agency obligation, never a statement fact."],
  ["NYC-563.3-g-1-iv", "Fee-change 30-day-notice rule. Requires fee-change notice records (notice_date + effective_date) that the §20-563.3(h) per-transaction itemized statement does not carry — register, do not fake."],
  ["NYC-563.3-g-3", "Clear-and-conspicuous disclosure duty. A presentation-quality obligation, not a numeric statement field; the bundling teeth it would give live deterministically in d-1 (a non-whitelisted category) instead."],
  ["NYC-563.3-h-1", "Itemization duty. Defines the audit's INPUT contract itself (a monthly per-transaction itemized statement); the audit presupposes a parsed itemized statement, and a bundled/non-itemized charge surfaces via d-1's category lock."],
]);

/**
 * The base-derived rule ids — DERIVED from the twin's `base` field via the
 * registry (not hand-listed), so it cannot drift. Any finding these rules emit
 * MUST carry the U1 provisional marker ({@link makeFeeFinding} enforces it).
 */
export const BASE_DERIVED_RULE_IDS: ReadonlySet<string> = new Set(
  FEE_RULES.filter((r) => r.base !== undefined).map((r) => r.id),
);

// ── Typed predicates (pure, integer-cents; no float money, no clock) ──────────

/**
 * Per-order cap predicate (a-1 / b-1 / c-1 / d-2): the charged amount exceeds
 * capPct% of the order's purchase price. Integer math: amount*100 > capPct*base
 * (equality is AT the cap, i.e. compliant).
 */
export function perOrderCapExceeded(
  amountCents: number,
  purchasePriceCents: number,
  capPct: number,
): boolean {
  return amountCents * 100 > capPct * purchasePriceCents;
}

/**
 * Monthly-average cap predicate (a-2 / b-2 / d-3): the month's summed fees for a
 * category exceed capPct% of the month's summed purchase price across ALL orders
 * (the twin's `sum_purchase_price_all_orders_in_calendar_month` base).
 */
export function monthlyAverageExceeded(
  sumFeesCents: number,
  sumPurchasePriceCents: number,
  capPct: number,
): boolean {
  return sumFeesCents * 100 > capPct * sumPurchasePriceCents;
}

/** Category-lock predicate (d-1): the declared category is NOT one of the four legal ones. */
export function categoryUnlawful(declaredCategory: string): boolean {
  return !isLegalFeeCategory(declaredCategory);
}

/**
 * Enhanced-without-basic predicate (d-4): an enhanced_service_fee is charged but
 * the statement carries no basic_service_fee line — the enhanced tier is only
 * permitted when the platform also offers/charges the basic service.
 */
export function enhancedWithoutBasic(statement: MonthlyStatement): boolean {
  const lines = statement.lines.filter((l) => !l.isRefund);
  const hasEnhanced = lines.some((l) => l.declaredCategory === "enhanced_service_fee");
  const hasBasic = lines.some((l) => l.declaredCategory === "basic_service_fee");
  return hasEnhanced && !hasBasic;
}

/**
 * Transaction-fee passthrough predicate (c-2): a transaction fee above the 3%
 * cap is allowed ONLY when documented as an exact processor pass-through. The
 * audit can only read the asserted `passthroughDocumented` flag (it cannot verify
 * the underlying processor charge — recorded as a limitation).
 */
export function transactionPassthroughAllowed(line: StatementLine): boolean {
  return line.passthroughDocumented === true;
}
