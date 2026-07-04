/**
 * Fee-pack finding + report model — F1a (plan §5 F1 items 5–7).
 *
 * A {@link FeeFinding} is a verifier-core {@link Finding} (all four C2 receipts,
 * built through the ONLY sanctioned constructor `makeFinding`) EXTENDED with the
 * fee-domain state the report needs:
 *  - a {@link FeeVerdict} (the §20-563.3(e) refund-window verdict state — a state,
 *    not prose);
 *  - the plan §7 fee-line class it belongs to;
 *  - a PROVISIONAL marker array — {@link makeFeeFinding} REQUIRES the U1 marker on
 *    any finding from a base-derived rule, so a base-derived over-cap can never be
 *    rendered as an unqualified violation;
 *  - both registers (professional + plain), per the two-register doc standard.
 *
 * Plain: a caught fee problem with its receipts, PLUS whether it's a settled
 * violation or still inside the legal refund-grace window, PLUS an honest asterisk
 * whenever the call depends on the still-unresolved definition of "purchase price".
 */
import type { Finding, Severity } from "../../verifier-core/index.ts";
import { makeFinding } from "../../verifier-core/guard.ts";
import type { FeeLineClass } from "./index.ts";
import { BASE_DERIVED_RULE_IDS } from "./rules.ts";
import { ASSUMED_PURCHASE_PRICE_BASE } from "./statement.ts";

/** The U1 provisional marker — one string, so resolving U1 later is a one-place flip. */
export const PROVISIONAL_U1 = "U1-base" as const;

/**
 * The §20-563.3(e) verdict state of an over-cap finding, ENCODED (never prose):
 *  - `violation` — settled: over cap and (for a/b/d) the 30-day refund window
 *    closed with no covering refund, or (for c) no safe harbor exists at all;
 *  - `conditional-pending-refund-window` — over cap on a/b/d but the 30-day
 *    window is still open (not yet a violation — the statute defers the verdict);
 *  - `cured-by-refund` — over cap on a/b/d, fully refunded within the window (not
 *    a violation).
 * Non-over-cap findings (category lock, enhanced-without-basic) are always
 * `violation`.
 */
export type FeeVerdict =
  | "violation"
  | "conditional-pending-refund-window"
  | "cured-by-refund";

export const FEE_VERDICTS: readonly FeeVerdict[] = [
  "violation",
  "conditional-pending-refund-window",
  "cured-by-refund",
] as const;

/** A fee finding: a C2-valid core Finding + fee-domain state (both registers). */
export interface FeeFinding extends Finding {
  /** The §20-563.3(e) verdict state (a state, not prose). */
  readonly verdict: FeeVerdict;
  /** Plan §7 fee-line class this finding belongs to. */
  readonly feeClass: FeeLineClass;
  /** Provisional markers (e.g. {@link PROVISIONAL_U1}); required on base-derived rules. */
  readonly provisional: readonly string[];
  /** Professional-register line (leads; two-register doc standard). */
  readonly professionalLine: string;
  /** Plain-register line (paired, same breath). Always present on a fee finding. */
  readonly plainLine: string;
}

/** Raw input to {@link makeFeeFinding} — validated + frozen on the way out. */
export interface FeeFindingInput {
  readonly claim: Finding["claim"];
  readonly referenceRowId: string;
  readonly ruleId: string;
  readonly severity: Severity;
  readonly verdict: FeeVerdict;
  readonly feeClass: FeeLineClass;
  readonly provisional?: readonly string[];
  readonly professionalLine: string;
  readonly plainLine: string;
}

/** Thrown when a base-derived finding omits the mandatory U1 provisional marker. */
export class MissingProvisionalMarkerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MissingProvisionalMarkerError";
  }
}

/**
 * The ONLY sanctioned fee-finding constructor. Wraps verifier-core `makeFinding`
 * (so the four C2 receipts are validated exactly as every other pack's findings
 * are), then enforces the U1 rule: any finding from a base-derived rule MUST
 * carry {@link PROVISIONAL_U1}, or this throws — a base-derived over-cap cannot
 * exist as an unqualified violation.
 */
export function makeFeeFinding(input: FeeFindingInput): FeeFinding {
  // C2 first — reuse the single core guard (throws on any missing receipt).
  const core = makeFinding({
    claim: input.claim,
    referenceRowId: input.referenceRowId,
    ruleId: input.ruleId,
    severity: input.severity,
    category: input.feeClass,
    plainLine: input.plainLine,
  });
  const provisional = input.provisional ?? [];
  if (BASE_DERIVED_RULE_IDS.has(input.ruleId) && !provisional.includes(PROVISIONAL_U1)) {
    throw new MissingProvisionalMarkerError(
      `U1 violated: base-derived rule ${input.ruleId} requires the "${PROVISIONAL_U1}" provisional marker (over-cap depends on the unresolved purchase-price base)`,
    );
  }
  if (!input.professionalLine.trim() || !input.plainLine.trim()) {
    throw new MissingProvisionalMarkerError(
      `fee finding for ${input.ruleId} requires both a professional and a plain line (two-register standard)`,
    );
  }
  return Object.freeze({
    ...core,
    verdict: input.verdict,
    feeClass: input.feeClass,
    provisional: Object.freeze([...provisional]),
    professionalLine: input.professionalLine,
    plainLine: input.plainLine,
  });
}

/** Machine-readable fee-audit report (CI-usable) — verifier-core report pattern. */
export interface FeeAuditReport {
  /** Rule-table version pinned in the header of every report (C10). */
  readonly specVersion: string;
  /** True — this corpus is always simulated (C10 honesty surface). */
  readonly simulated: true;
  /**
   * Honest scope label: the deterministic spine audits categories AS DECLARED by
   * the platform; the LLM line-item classifier is DEFERRED to F1b.
   */
  readonly classification: string;
  /** The assumed purchase-price base every base-derived verdict is provisional against (U1). */
  readonly assumedPurchasePriceBase: string;
  /** All evidence-cited fee findings, deterministically ordered. */
  readonly findings: readonly FeeFinding[];
  /** Verdict tally — counts by {@link FeeVerdict}. */
  readonly verdictTally: Readonly<Record<FeeVerdict, number>>;
  /** Overall pass/fail: false iff any finding has verdict `violation` (drives exit 1). */
  readonly ok: boolean;
}

/**
 * Deterministic finding order: feeClass, then ruleId, then claim id. Stable
 * ordering is what makes the frozen golden report byte-comparable.
 */
export function sortFeeFindings(findings: readonly FeeFinding[]): readonly FeeFinding[] {
  return [...findings].sort(
    (a, b) =>
      a.feeClass.localeCompare(b.feeClass) ||
      a.ruleId.localeCompare(b.ruleId) ||
      a.claim.id.localeCompare(b.claim.id),
  );
}

/** Assemble the machine-readable fee-audit report. `ok` is false iff any `violation`. */
export function buildFeeReport(
  findings: readonly FeeFinding[],
  opts: { readonly specVersion: string; readonly classification: string },
): FeeAuditReport {
  const sorted = sortFeeFindings(findings);
  const verdictTally: Record<FeeVerdict, number> = {
    violation: 0,
    "conditional-pending-refund-window": 0,
    "cured-by-refund": 0,
  };
  for (const f of sorted) verdictTally[f.verdict] += 1;
  return Object.freeze({
    specVersion: opts.specVersion,
    simulated: true,
    classification: opts.classification,
    assumedPurchasePriceBase: ASSUMED_PURCHASE_PRICE_BASE,
    findings: sorted,
    verdictTally: Object.freeze(verdictTally),
    ok: verdictTally.violation === 0,
  });
}

/** Canonical serialization — the single stringifier (byte-identity is meaningful). */
export function serializeFeeReport(report: FeeAuditReport): string {
  return `${JSON.stringify(report, null, 2)}\n`;
}
