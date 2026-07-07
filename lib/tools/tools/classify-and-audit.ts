/**
 * `classify_and_audit` — the A0 ADVISORY tool wrapping
 * `auditWithClassification` (`lib/packs/fees/classified-audit.ts`) with the
 * DETERMINISTIC BASELINE classifier ONLY (`DeterministicBaselineClassifier`,
 * `lib/packs/fees/classifier.ts`) — never the mock oracle, never the
 * env-gated live lane (`lib/agents/fee-classifier.ts`, unreachable from this
 * pack and therefore from this registry). Plan §3, §5 row A0, Codex
 * amendment 6.
 *
 * The envelope carries `advisory: true` and `earnsLabel: false` verbatim —
 * the baseline IS the measured floor, never a "calibrated" result (AM-7). The
 * base audit is byte-identical to `audit_statement`'s own report
 * (`auditWithClassification` calls the unchanged `auditStatement` internally);
 * `exitCode` is driven by `base.ok` ONLY — the advisory findings NEVER gate
 * (recommend-don't-decide). Canonical = `serializeClassifiedFeeReport`
 * (`lib/tools/serializers.ts`), the new named serializer this slice adds.
 *
 * Plain: same legal fee audit as `audit_statement`, PLUS a second, clearly
 * separate list of "the classifier thinks this label might be wrong" leads —
 * leads that can never change whether the audit passes or fails, and that
 * openly say they haven't earned the right to be trusted yet.
 */
import { readFileSync } from "node:fs";
import { auditWithClassification } from "../../packs/fees/classified-audit.ts";
import { DeterministicBaselineClassifier } from "../../packs/fees/classifier.ts";
import { parseStatement } from "../../packs/fees/parser.ts";
import { serializeClassifiedFeeReport } from "../serializers.ts";
import { freezeToolResult, type ToolResult } from "../types.ts";

/** Params for `classify_and_audit` (schema: `schemas/classify_and_audit.input.schema.json`). */
export interface ClassifyAndAuditParams {
  readonly statementPath: string;
}

/** Run `classify_and_audit`. `params` must already be ajv-validated by `callTool`. */
export function runClassifyAndAuditTool(params: unknown): ToolResult {
  const p = params as ClassifyAndAuditParams;
  const raw = readFileSync(p.statementPath, "utf8");
  const statement = parseStatement(raw);
  const report = auditWithClassification(statement, DeterministicBaselineClassifier);
  return freezeToolResult({
    tool: "classify_and_audit",
    ok: report.base.ok,
    exitCode: report.base.ok ? 0 : 1,
    advisory: true,
    earnsLabel: DeterministicBaselineClassifier.earnsLabel,
    canonical: serializeClassifiedFeeReport(report),
  });
}
