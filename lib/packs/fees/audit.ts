/**
 * Fee-audit engine — F1a (plan §5 F1 item 4 + items 5/6/7).
 *
 * Runs the codified §20-563.3 predicates (rules.ts) over a parsed
 * {@link MonthlyStatement} and assembles an evidence-cited {@link FeeAuditReport}.
 * Deterministic, $0, zero network / LLM / clock reads — the evaluation date
 * arrives as data (`meta.asOf`) so identical statements give byte-identical
 * reports. Every finding is built through {@link makeFeeFinding} (C2 receipts +
 * the U1 provisional marker on base-derived rules).
 *
 * Statutory logic encoded here:
 *  - CATEGORY LOCK (d-1): a non-refund line whose DECLARED category is not one of
 *    the four legal ones is per se unlawful (catches bundling / promotion-deduction
 *    / relabel-to-nonlegal). An unlawful line has no legal cap to test further.
 *  - PER-ORDER ∨ MONTHLY-AVERAGE (a/b/d): the cap is met if EITHER every order is
 *    within the per-order cap OR the calendar-month average is within cap. Only
 *    when the monthly average ALSO fails is the category over cap — so a per-order
 *    overage the averaging alternative rescues is NOT reported (no overclaim).
 *  - e-1 REFUND SAFE HARBOR (a/b/d only): an over-cap category is a `violation`
 *    only once the 30-day window closes with no covering refund; still-open →
 *    `conditional-pending-refund-window`; refunded-in-window → `cured-by-refund`.
 *  - TRANSACTION FEE (c): a hard 3% per-order cap, NO averaging and NO safe harbor
 *    (verdict is always `violation`). A line above 3% carrying the c-2 pass-through
 *    flag is NOT cleared silently: the flag is asserted by the platform and the
 *    statement cannot verify the fee equals the actual processor charge, so the
 *    reliance is surfaced as a non-gating `asserted-passthrough-unverified` warn
 *    (M2 Codex finding #1, 2026-07-04).
 *  - d-4: an enhanced fee with no basic fee in the statement is disallowed.
 *
 * Plain: read the bill line by line against the legal caps, and say for each catch
 * whether it's a settled violation or still inside the legal refund-grace window —
 * always with the "we assumed this definition of purchase price" asterisk when the
 * call depends on it.
 *
 * HONESTY (C10): the input statements are SIMULATED; only the codified law is real.
 */
import {
  buildFeeReport,
  makeFeeFinding,
  PROVISIONAL_U1,
  type FeeAuditReport,
  type FeeFinding,
  type FeeVerdict,
} from "./finding.ts";
import {
  categoryUnlawful,
  enhancedWithoutBasic,
  FEE_RULE_BY_ID,
  monthlyAverageExceeded,
  perOrderCapExceeded,
  transactionPassthroughAllowed,
} from "./rules.ts";
import {
  ASSUMED_PURCHASE_PRICE_BASE,
  LEGAL_FEE_CATEGORIES,
  type LegalFeeCategory,
  type MonthlyStatement,
  type StatementLine,
} from "./statement.ts";
import type { FeeLineClass } from "./index.ts";

/** Rule-table version pinned into every fee report header (C10). */
export const FEES_SPEC_VERSION =
  "uc1-rule-table-draft/2026-07-03+NYC§20-563.3+LL79-2025+base-U1-unresolved";

/** Honest scope label — the deterministic spine audits categories AS DECLARED. */
export const FEES_CLASSIFICATION_LABEL =
  "as-declared by the platform; deterministic audit; LLM line-item classifier DEFERRED (F1b)";

/** Per-category cap configuration (drives the a/b/d/c logic; ids drift-locked to the twin). */
interface CapConfig {
  readonly perOrderRuleId: string;
  readonly monthlyRuleId?: string; // absent for transaction (c) — no averaging
  readonly capPct: number;
  readonly hasSafeHarbor: boolean;
}

const CAP_CONFIG: Readonly<Record<LegalFeeCategory, CapConfig>> = {
  delivery_fee: { perOrderRuleId: "NYC-563.3-a-1", monthlyRuleId: "NYC-563.3-a-2", capPct: 15, hasSafeHarbor: true },
  basic_service_fee: { perOrderRuleId: "NYC-563.3-b-1", monthlyRuleId: "NYC-563.3-b-2", capPct: 5, hasSafeHarbor: true },
  transaction_fee: { perOrderRuleId: "NYC-563.3-c-1", capPct: 3, hasSafeHarbor: false },
  enhanced_service_fee: { perOrderRuleId: "NYC-563.3-d-2", monthlyRuleId: "NYC-563.3-d-3", capPct: 20, hasSafeHarbor: true },
};

const dollars = (cents: number): string => `$${(cents / 100).toFixed(2)}`;
const pctOf = (feeCents: number, baseCents: number): string =>
  `${((feeCents / baseCents) * 100).toFixed(1)}%`;

/** The §20-563.3(e) window close: 30 days after the month's final day (pure date math, no clock). */
function refundWindowClose(month: string): string {
  const [y, m] = month.split("-").map(Number);
  const last = new Date(Date.UTC(y, m, 0));
  return new Date(last.getTime() + 30 * 86_400_000).toISOString().slice(0, 10);
}

/**
 * Distinct-order purchase sum for the month (dedupe by orderId — no double count).
 *
 * DOCUMENTED LIMITATION (elevation, 2026-07-04): the statutory monthly-average
 * base is the purchase price of ALL online orders in the calendar month, but a
 * statement only shows orders that carry at least one fee line — an order with
 * zero fees is invisible here, so this denominator can UNDERCOUNT the statutory
 * base and bias the average HIGH (toward flagging). Unlike U1 this bias runs
 * against the platform, which is why every monthly-average finding is already
 * U1-provisional and never an unqualified verdict. §20-563.3(h) makes the gap
 * narrow in practice (every transaction must be itemized), and the seeded corpus
 * gives every order a fee line, so goldens are unaffected.
 */
function sumDistinctOrderPurchase(lines: readonly StatementLine[]): number {
  const byOrder = new Map<string, number>();
  for (const l of lines) if (!byOrder.has(l.orderId)) byOrder.set(l.orderId, l.orderPurchasePriceCents);
  let sum = 0;
  for (const v of byOrder.values()) sum += v;
  return sum;
}

/** The provisional over-cap qualifier phrase (item 5(iii)) — never an unqualified violation. */
function provisionalQualifier(): string {
  return `over-cap under the ASSUMED base "${ASSUMED_PURCHASE_PRICE_BASE}" — PROVISIONAL (U1)`;
}

function verdictPhrase(verdict: FeeVerdict, windowClose: string): string {
  switch (verdict) {
    case "violation":
      return "violation (the 30-day refund window has closed with no covering refund)";
    case "conditional-pending-refund-window":
      return `conditional — pending the 30-day refund window (closes ${windowClose})`;
    case "cured-by-refund":
      return "cured by a refund within the 30-day window (not a violation)";
    case "asserted-passthrough-unverified":
      return "not verifiable from the statement — the pass-through exception is asserted, not proven";
  }
}

/**
 * Audit one parsed monthly statement. Pure in (statement); no clock, no network,
 * no LLM. Returns the machine-readable, evidence-cited fee report.
 */
/**
 * Escape the claim-id separator in ARBITRARY statement strings (`orderId`,
 * `declaredCategory`): '%' → '%25', '#' → '%23'. Keeps `id.split("#")`
 * unambiguous while staying byte-identity on every committed corpus value
 * (no fixture contains '#' or '%' — goldens unchanged). Reversible.
 * Closes the M2 gate-4 advisory nit (2026-07-04 gate record, gate 4).
 */
export const claimIdPart = (s: string): string => s.replace(/%/g, "%25").replace(/#/g, "%23");

/**
 * Statement-position tagger — makes per-line claim ids unique when the same order
 * carries repeated lines of one category (C2 traceability; M2 Codex finding #4).
 * The map is OBJECT-IDENTITY keyed, so a line not a member of `statement.lines`
 * throws loudly instead of rendering a silent "Lundefined" (M2 gate-4 advisory;
 * unreachable via the parser — a defensive contract for direct constructors).
 */
export function makeLineTagger(statement: MonthlyStatement): (l: StatementLine) => string {
  const index = new Map<StatementLine, number>(statement.lines.map((l, i) => [l, i]));
  return (l) => {
    const i = index.get(l);
    if (i === undefined) {
      throw new Error(`fees audit: line "${l.label}" (order ${l.orderId}) is not a member of statement.lines — the statement-position tag is object-identity based`);
    }
    return `L${i}`;
  };
}

export function auditStatement(statement: MonthlyStatement): FeeAuditReport {
  const findings: FeeFinding[] = [];
  const month = statement.meta.month;
  const asOf = statement.meta.asOf;
  const windowClose = refundWindowClose(month);
  const nonRefund = statement.lines.filter((l) => !l.isRefund);
  const lineTag = makeLineTagger(statement);

  // ── d-1 category lock: unlawful DECLARED categories (per-line) ──────────────
  const d1 = FEE_RULE_BY_ID.get("NYC-563.3-d-1")!;
  for (const line of nonRefund) {
    if (!categoryUnlawful(line.declaredCategory)) continue;
    const feeClass: FeeLineClass = classifyUnlawful(line.declaredCategory);
    findings.push(
      makeFeeFinding({
        claim: { id: `${claimIdPart(line.orderId)}#${claimIdPart(line.declaredCategory)}#${lineTag(line)}`, source: "fee-statement", field: "declaredCategory", value: line.declaredCategory },
        referenceRowId: d1.sourceClause,
        ruleId: d1.id,
        severity: "error",
        verdict: "violation",
        feeClass,
        professionalLine: `Line "${line.label}" is charged under the non-permitted category "${line.declaredCategory}" (${dollars(line.amountCents)} on order ${line.orderId}) — §20-563.3(d) permits only the four categories; any other fee is unlawful.`,
        plainLine: `The bill charges ${dollars(line.amountCents)} as "${line.declaredCategory}" — that isn't one of the four fee types the law allows, so it's not permitted no matter what it's called.`,
      }),
    );
  }

  // ── d-4 enhanced-without-basic (statement-level) ────────────────────────────
  if (enhancedWithoutBasic(statement)) {
    const d4 = FEE_RULE_BY_ID.get("NYC-563.3-d-4")!;
    findings.push(
      makeFeeFinding({
        claim: { id: `${month}#enhanced-without-basic`, source: "fee-statement", field: "declaredCategory", value: "enhanced_service_fee" },
        referenceRowId: d4.sourceClause,
        ruleId: d4.id,
        severity: "error",
        verdict: "violation",
        feeClass: "misclassification",
        professionalLine: "An enhanced service fee is charged but the statement carries no basic service fee — §20-563.3(d) permits the enhanced tier only for a platform that also offers (and charges a basic service fee for) the basic service.",
        plainLine: "They billed an 'extras' fee without ever offering the plain basic plan — the law only allows the extras fee if the basic plan exists too.",
      }),
    );
  }

  // ── per-category cap checks (a/b/d monthly-average ∨ per-order; c per-order) ──
  const sumPurchaseAll = sumDistinctOrderPurchase(nonRefund);
  for (const category of LEGAL_FEE_CATEGORIES) {
    const cfg = CAP_CONFIG[category];
    const catLines = nonRefund.filter((l) => l.declaredCategory === category);
    if (catLines.length === 0) continue;

    if (category === "transaction_fee") {
      // c-1: hard 3% per order, NO averaging, NO safe harbor; c-2 exception.
      const c1 = FEE_RULE_BY_ID.get("NYC-563.3-c-1")!;
      const c2 = FEE_RULE_BY_ID.get("NYC-563.3-c-2")!;
      for (const line of catLines) {
        if (!perOrderCapExceeded(line.amountCents, line.orderPurchasePriceCents, cfg.capPct)) continue;
        if (transactionPassthroughAllowed(line)) {
          // c-2 exception — but the flag is ASSERTED by the platform; the statement
          // cannot verify the fee equals the actual processor charge (§20-563.3(c)(i)–(ii)
          // requires exactly that). Never clear silently: surface the reliance as a
          // non-gating warn (M2 Codex finding #1). `ok` is unaffected (not a violation).
          findings.push(
            makeFeeFinding({
              claim: { id: `${claimIdPart(line.orderId)}#transaction_fee#${lineTag(line)}`, source: "fee-statement", field: "passthroughDocumented", value: true },
              referenceRowId: c2.sourceClause,
              ruleId: c2.id,
              severity: "warn",
              verdict: "asserted-passthrough-unverified",
              feeClass: "processing-fee-base-inflation",
              provisional: [PROVISIONAL_U1],
              professionalLine: `Transaction fee ${dollars(line.amountCents)} on order ${line.orderId} is ${pctOf(line.amountCents, line.orderPurchasePriceCents)} of the purchase price — above the 3% cap, relying on the §20-563.3(c)(i)–(ii) pass-through exception AS ASSERTED by the platform's passthroughDocumented flag. The statement cannot verify the fee equals the actual processor charge; ${provisionalQualifier()}. Not counted as a violation; flagged for evidence-backed verification outside the statement.`,
              plainLine: `The card-processing fee here is ${pctOf(line.amountCents, line.orderPurchasePriceCents)} — over the 3% limit, but the platform says it's just passing through the real card cost. This bill alone can't prove that, so we flag it instead of clearing it or calling it a violation. (Also depends on the open "purchase price" question, U1.)`,
            }),
          );
          continue;
        }
        findings.push(
          makeFeeFinding({
            claim: { id: `${claimIdPart(line.orderId)}#transaction_fee#${lineTag(line)}`, source: "fee-statement", field: "amountCents", value: line.amountCents },
            referenceRowId: c1.sourceClause,
            ruleId: c1.id,
            severity: "error",
            verdict: "violation", // c has NO refund safe harbor (subd. e excludes it)
            feeClass: "processing-fee-base-inflation",
            provisional: [PROVISIONAL_U1],
            professionalLine: `Transaction fee ${dollars(line.amountCents)} on order ${line.orderId} is ${pctOf(line.amountCents, line.orderPurchasePriceCents)} of the purchase price — over the hard 3% cap, not documented as a pass-through (§20-563.3(c)); ${provisionalQualifier()}. No refund safe harbor applies to the transaction fee.`,
            plainLine: `The card-processing fee here is ${pctOf(line.amountCents, line.orderPurchasePriceCents)} — over the flat 3% limit, with no proof it's just passing through the real card cost. (This depends on what "purchase price" includes — still an open question, U1.)`,
          }),
        );
      }
      continue;
    }

    // a/b/d: category is over cap only if the monthly average ALSO fails.
    const sumFees = catLines.reduce((s, l) => s + l.amountCents, 0);
    if (!monthlyAverageExceeded(sumFees, sumPurchaseAll, cfg.capPct)) continue; // averaging alternative met

    const monthly = FEE_RULE_BY_ID.get(cfg.monthlyRuleId!)!;
    const verdict = e1Verdict(category, cfg.capPct, sumFees, sumPurchaseAll, month, asOf, windowClose, statement.lines);
    findings.push(
      makeFeeFinding({
        claim: { id: `${month}#${category}`, source: "fee-statement", field: "monthlyAverage", value: { sumFeesCents: sumFees, sumPurchasePriceCents: sumPurchaseAll, capPct: cfg.capPct } },
        referenceRowId: monthly.sourceClause,
        ruleId: monthly.id,
        severity: "error",
        verdict,
        feeClass: "over-cap",
        provisional: [PROVISIONAL_U1],
        professionalLine: `${labelFor(category)} total ${dollars(sumFees)} on ${dollars(sumPurchaseAll)} of monthly purchases = ${pctOf(sumFees, sumPurchaseAll)} vs the ${cfg.capPct}% cap (${monthly.id}); ${provisionalQualifier()}; ${verdictPhrase(verdict, windowClose)}.`,
        plainLine: `Across the month, ${labelFor(category).toLowerCase()} came to ${pctOf(sumFees, sumPurchaseAll)} of order value — over the ${cfg.capPct}% limit even on the monthly average. ${plainVerdict(verdict, windowClose)} (Depends on the still-open definition of "purchase price", U1.)`,
      }),
    );
  }

  return buildFeeReport(findings, {
    specVersion: FEES_SPEC_VERSION,
    classification: FEES_CLASSIFICATION_LABEL,
  });
}

/** e-1 verdict for an over-cap a/b/d category. Refunds must be dated within the window. */
function e1Verdict(
  category: LegalFeeCategory,
  capPct: number,
  sumFeesCents: number,
  sumPurchaseAllCents: number,
  month: string,
  asOf: string,
  windowClose: string,
  allLines: readonly StatementLine[],
): FeeVerdict {
  const excessScaled = sumFeesCents * 100 - capPct * sumPurchaseAllCents; // > 0 (caller checked)
  const refundedInWindow = allLines
    .filter(
      (l) =>
        l.isRefund &&
        l.declaredCategory === category &&
        l.month === month &&
        l.refundedAtDate !== undefined &&
        l.refundedAtDate <= windowClose,
    )
    .reduce((s, l) => s + l.amountCents, 0);
  if (refundedInWindow * 100 >= excessScaled) return "cured-by-refund";
  if (asOf <= windowClose) return "conditional-pending-refund-window";
  return "violation";
}

/** Report-grouping class for a d-1 (unlawful category) finding — a display hint. */
function classifyUnlawful(declared: string): FeeLineClass {
  const d = declared.toLowerCase();
  if (d.includes("promo")) return "promotion-deduction-mischaracterization";
  if (d.includes("bundle") || (d.includes("service") && d.includes("delivery"))) return "bundling";
  return "misclassification";
}

function labelFor(category: LegalFeeCategory): string {
  switch (category) {
    case "delivery_fee": return "Delivery fees";
    case "basic_service_fee": return "Basic service fees";
    case "transaction_fee": return "Transaction fees";
    case "enhanced_service_fee": return "Enhanced service fees";
  }
}

function plainVerdict(verdict: FeeVerdict, windowClose: string): string {
  switch (verdict) {
    case "violation": return "The 30-day window to refund the overcharge has closed with no refund, so this is a violation.";
    case "conditional-pending-refund-window": return `It's not a violation yet — the platform still has until ${windowClose} to refund the excess.`;
    case "cured-by-refund": return "The excess was refunded in time, so this is not a violation.";
    case "asserted-passthrough-unverified": return "The platform says this is a straight pass-through of the card processor's charge — this bill alone can't prove or disprove that.";
  }
}
