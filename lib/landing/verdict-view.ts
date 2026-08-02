/**
 * THE VERDICT SLAB'S VIEW MODEL (walkthrough redesign, 2026-08-02).
 *
 * ONE SHAPE, TWO SOURCES. The slab renders the bundled pair's committed report
 * before a reader has run anything, and their own run's report afterwards.
 * Those arrive by different routes — the first is read from the golden on the
 * server, the second is computed in the browser — so they converge HERE, on one
 * function. A second, hand-written idle rendering is how a page ends up
 * describing the bundled run in words the live run would never produce.
 *
 * WHAT A RECEIPT MAY CONTAIN. Only what the engine's own `Finding` carries: the
 * claim id and field, the value as served, the reference row it was checked
 * against, the rule that was applied, and the engine's plain-words line. The
 * slab does not compute arithmetic of its own — the finding is the evidence, and
 * anything added beside it would be the page's assertion rather than the
 * engine's.
 */

/** Structural shape of a finding — satisfied by the engine's `Finding` and by
 *  the committed golden JSON alike, so one function serves both. */
export interface VerdictFindingLike {
  readonly claim: { readonly id: string; readonly field: string; readonly value: unknown };
  readonly referenceRowId: string;
  readonly ruleId: string;
  readonly severity: string;
  readonly plainLine?: string;
}

export interface VerdictReportLike {
  readonly ok: boolean;
  readonly findings: readonly VerdictFindingLike[];
}

export interface VerdictReceipt {
  readonly claimId: string;
  readonly field: string;
  /** The value as served, rendered exactly as the report holds it. */
  readonly asserted: string;
  readonly referenceRowId: string;
  readonly ruleId: string;
  readonly severity: string;
  /** The engine's plain-words line for this finding. */
  readonly plain: string;
  /** Where the cited rule is documented on this site. */
  readonly ruleHref: string;
}

export interface VerdictView {
  readonly fail: boolean;
  readonly findings: number;
  readonly errors: number;
  readonly warnings: number;
  readonly rows: number;
  readonly feedSide: string;
  readonly recordSide: string;
  /** The two findings rendered as full receipts. */
  readonly receipts: readonly VerdictReceipt[];
  /**
   * EVERY finding, in the engine's own order.
   *
   * The slab leads with two receipts because two is what a reader can take in —
   * but the previous surface listed the whole set, and dropping that would mean
   * a reader who audits their OWN feed can no longer see what was found in it.
   * ("See a full worked report" goes to /report, which renders the BUNDLED run,
   * not theirs.) A verdict that names a tally it will not itemise is the shape
   * this product exists to catch, so the complete list stays — folded away, not
   * removed.
   */
  readonly all: readonly VerdictReceipt[];
}

/**
 * Where a rule is documented. A PREDICATE on the rule's own family, not a
 * lookup table: a table would need a new row for every rule the packs add, and
 * would silently drop the chip's link the day one arrived without it.
 */
export function ruleHrefFor(ruleId: string): string {
  return ruleId.startsWith("NYC-") ? "/fees" : "/report";
}

export interface VerdictInputs {
  readonly report: VerdictReportLike;
  readonly rows: number;
  readonly feedSide: string;
  readonly recordSide: string;
  /** How many findings become receipts on the slab. */
  readonly receiptCount?: number;
  /** Display cleaner, applied only where it is honest to do so. */
  readonly clean?: (s: string) => string;
}

export function toVerdictView({
  report,
  rows,
  feedSide,
  recordSide,
  receiptCount = 2,
  clean = (s) => s,
}: VerdictInputs): VerdictView {
  let errors = 0;
  let warnings = 0;
  for (const f of report.findings) {
    if (f.severity === "error") errors += 1;
    else if (f.severity === "warn") warnings += 1;
  }

  const toReceipt = (f: VerdictFindingLike): VerdictReceipt => ({
    claimId: f.claim.id,
    field: f.claim.field,
    asserted: JSON.stringify(f.claim.value),
    referenceRowId: f.referenceRowId,
    ruleId: f.ruleId,
    severity: f.severity,
    plain: clean(f.plainLine ?? ""),
    ruleHref: ruleHrefFor(f.ruleId),
  });

  // Errors lead: the receipts are the two findings a reader most needs to see,
  // and a warning shown above an error would misrepresent the run's weight.
  // `all` keeps the ENGINE's order — the order a downloaded report has.
  const ordered = [...report.findings].sort(
    (a, b) => Number(b.severity === "error") - Number(a.severity === "error"),
  );

  return {
    all: report.findings.map(toReceipt),
    fail: !report.ok,
    findings: report.findings.length,
    errors,
    warnings,
    rows,
    feedSide,
    recordSide,
    receipts: ordered.slice(0, receiptCount).map(toReceipt),
  };
}
