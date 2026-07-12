/**
 * Named canonical serializers OWNED by the A0 tool registry (plan §3: "each
 * tool has a named canonical serializer"; §5 row A0). Four of the six tools
 * reuse an EXISTING engine serializer verbatim (`serializeReport` for
 * check_feed/check_conformance, `serializeFeeReport` for audit_statement) —
 * those are imported and called directly in the tool files, nothing new to
 * name here. This file holds the TWO serializers that are new because their
 * payload shape is new to this slice: the classify_and_audit advisory
 * envelope, and the get_rule lookup payload.
 *
 * Plain: the two exact "how do we print this as text" recipes this slice adds
 * — one for "here's the legal audit plus the AI's separate suggestions", one
 * for "here's the rule (or rules) you asked about".
 */
import { serializeFeeReport, type FeeAuditReport } from "../packs/fees/finding.ts";
import type { ClassifiedFeeAuditReport } from "../packs/fees/classified-audit.ts";
import type { FeeRule } from "../packs/fees/rules.ts";

/**
 * Canonical serializer for `classify_and_audit`. Reuses the EXISTING
 * `serializeFeeReport` for the `base` half verbatim (round-tripped through it
 * so the embedded base report is byte-identical, key order included, to what
 * `audit_statement` itself would print), then adds the advisory findings as a
 * SEPARATE, stably-keyed top-level section — never merged into `base`, never
 * re-sorted (the audit already iterates `statement.lines` in statement order,
 * so `advisoryFindings` stays in statement order per the packet).
 */
export function serializeClassifiedFeeReport(report: ClassifiedFeeAuditReport): string {
  // Round-trip through the named base serializer (not just `report.base`
  // directly) so this canonical output is provably built FROM
  // `serializeFeeReport`, not merely from the same underlying object.
  const baseViaNamedSerializer = JSON.parse(serializeFeeReport(report.base)) as FeeAuditReport;
  const payload = {
    base: baseViaNamedSerializer,
    advisoryFindings: [...report.advisoryFindings],
  };
  return `${JSON.stringify(payload, null, 2)}\n`;
}

/** The three shapes `get_rule` can canonicalize (plan §5 row A0: "ruleId omitted -> all rules"; single rule; registered non-statement-checkable). */
export type RuleLookupPayload =
  | readonly FeeRule[]
  | FeeRule
  | { readonly ruleId: string; readonly nonStatementCheckable: true; readonly reason: string };

/** Canonical serializer for `get_rule` — stable JSON, same two-space/trailing-newline convention as every other canonical serializer in this repo. */
export function serializeRuleLookup(payload: RuleLookupPayload): string {
  return `${JSON.stringify(payload, null, 2)}\n`;
}

/** The `lookup_reference` canonical payload (E2 pre-reg §6: answer_span + citations + score + abstained, plus the honest lane/label/registration fields). */
export interface ReferenceLookupPayload {
  readonly question: string;
  readonly lane: "bm25";
  readonly label: string;
  readonly abstained: boolean;
  readonly answer_span: string | null;
  readonly citations: readonly { readonly file: string; readonly anchor: string }[];
  readonly score: number;
  readonly registration: string;
}

/** Canonical serializer for `lookup_reference` — same stable-JSON convention as every other canonical serializer here. */
export function serializeReferenceLookup(payload: ReferenceLookupPayload): string {
  return `${JSON.stringify(payload, null, 2)}\n`;
}
