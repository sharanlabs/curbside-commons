/**
 * Report view-model — W3 (plan §5 W3; S-9 "the report IS a document"; C2/C4/C10).
 *
 * A PURE, presentational transform from a machine-readable {@link VerifierReport}
 * to a flat row-model the web report page renders. It is deliberately tiny and
 * dependency-free: NO `node:fs`, NO network, NO LLM, no clock reads — so the
 * report-rendering path is provably $0 and the import-graph eval can prove it.
 *
 * C2 discipline: the transform NEVER synthesizes or drops the four evidence
 * fields. Every finding becomes exactly one row that carries its claim, its
 * reference-row id, its rule/spec-clause id, and its severity verbatim; the
 * plain-words line (C4) leads but is not one of the four (it may be absent on a
 * finding built before W3 — we surface an empty lead rather than invent one).
 *
 * Plain: turns the verifier's JSON result into the exact rows the one-page report
 * shows — plain sentence first, then the receipts — without adding or losing any
 * receipt.
 */
import type { VerifierReport } from "../../verifier-core/report.ts";
import type { Severity } from "../../verifier-core/evidence.ts";
import type { MatchingMode } from "../../verifier-core/reference.ts";

/** One rendered finding row — the four C2 fields plus presentation. */
export interface FindingRow {
  /** Plain-words lead line (C4); "" only if the finding carried none. */
  readonly plainLine: string;
  /** C2 — the claim under audit, identified and shown. */
  readonly claimId: string;
  readonly claimSource: string;
  readonly claimField: string;
  /** The claimed value, deterministically stringified for display. */
  readonly claimValue: string;
  /** C2 — the reference row the claim was checked against. */
  readonly referenceRowId: string;
  /** C2 — the rule / spec-clause id that was violated. */
  readonly ruleId: string;
  /** C2 — how severe the drift is. */
  readonly severity: Severity;
  /** Opaque grouping tag (taxonomy class); "" if the finding carried none. */
  readonly category: string;
}

/** Count of findings by severity — for the report's at-a-glance summary. */
export interface SeverityTally {
  readonly error: number;
  readonly warn: number;
  readonly info: number;
}

/** The full view-model the report page consumes. */
export interface ReportView {
  /** C10 — spec / rule-table version pinned in the header. */
  readonly specVersion: string;
  /** C10/C3 — how matching was performed. */
  readonly matchingMode: MatchingMode;
  /** C3 — a plain-words decode of {@link matchingMode}. */
  readonly matchingModePlain: string;
  /** C10 — true when any synthetic artifact is involved (drives the label). */
  readonly simulated: boolean;
  /** Overall verdict (false when any finding exists). */
  readonly ok: boolean;
  /** Total findings rendered. */
  readonly findingCount: number;
  /** Severity breakdown. */
  readonly tally: SeverityTally;
  /** One row per finding, in the report's deterministic order. */
  readonly rows: readonly FindingRow[];
}

/** Deterministic value stringify — strings pass through; everything else JSON. */
function displayValue(value: unknown): string {
  return typeof value === "string" ? value : JSON.stringify(value);
}

/** Plain-words decode of the C3 matching-mode label. */
export function matchingModePlain(mode: MatchingMode): string {
  return mode === "synthetic-controlled"
    ? "synthetic-controlled — the copy and the catalog share item IDs, so matching is exact (no entity resolution)"
    : "real-world — identifiers do not line up, so matches were made by resolution (fuzzier)";
}

/**
 * Project a {@link VerifierReport} onto the view-model. Pure and total: identical
 * inputs give identical output. Every finding is preserved with all four C2
 * fields; nothing is invented.
 */
export function toReportView(report: VerifierReport): ReportView {
  const tally: Record<Severity, number> = { error: 0, warn: 0, info: 0 };
  const rows: FindingRow[] = report.findings.map((f) => {
    tally[f.severity] += 1;
    return {
      plainLine: f.plainLine ?? "",
      claimId: f.claim.id,
      claimSource: f.claim.source,
      claimField: f.claim.field,
      claimValue: displayValue(f.claim.value),
      referenceRowId: f.referenceRowId,
      ruleId: f.ruleId,
      severity: f.severity,
      category: f.category ?? "",
    };
  });
  return {
    specVersion: report.specVersion,
    matchingMode: report.matchingMode,
    matchingModePlain: matchingModePlain(report.matchingMode),
    simulated: report.simulated,
    ok: report.ok,
    findingCount: rows.length,
    tally,
    rows,
  };
}
