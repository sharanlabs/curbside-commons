/**
 * `audit_statement` — the A0 tool composing the fee-audit engine's own
 * primitives directly: `readFileSync` + `parseStatement` + `auditStatement`
 * (`lib/packs/fees/parser.ts` + `audit.ts`), UNCHANGED (plan §3, §5 row A0).
 *
 * Canonical = `serializeFeeReport(report)` — the fees JSON canonical
 * serializer (`lib/packs/fees/finding.ts`), NOT the CLI's human-text render
 * (`renderFeeReportText`). `exitCode` is `report.ok ? 0 : 1`. Runtime failures
 * — an unreadable file (`readFileSync`) or a malformed statement
 * (`StatementParseError`, `lib/packs/fees/parser.ts`) — are the engine's own
 * typed errors and are NOT caught here (never swallowed).
 *
 * Plain: point this tool at a monthly delivery-fee statement file and it
 * hands back the exact same legal fee-cap audit the fees CLI's `--json` leg
 * would print.
 */
import { readFileSync } from "node:fs";
import { auditStatement } from "../../packs/fees/audit.ts";
import { serializeFeeReport } from "../../packs/fees/finding.ts";
import { parseStatement } from "../../packs/fees/parser.ts";
import { freezeToolResult, type ToolResult } from "../types.ts";

/** Params for `audit_statement` (schema: `schemas/audit_statement.input.schema.json`). */
export interface AuditStatementParams {
  readonly statementPath: string;
}

/** Run `audit_statement`. `params` must already be ajv-validated by `callTool`. */
export function runAuditStatementTool(params: unknown): ToolResult {
  const p = params as AuditStatementParams;
  const raw = readFileSync(p.statementPath, "utf8");
  const statement = parseStatement(raw);
  const report = auditStatement(statement);
  return freezeToolResult({
    tool: "audit_statement",
    ok: report.ok,
    exitCode: report.ok ? 0 : 1,
    canonical: serializeFeeReport(report),
  });
}
