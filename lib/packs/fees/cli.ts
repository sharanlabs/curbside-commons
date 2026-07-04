/**
 * Fees CLI entry logic — F1a (plan §5 F1 item 8; C1 one-command validator).
 *
 * Loaded by bin/check.mjs via Node's native TypeScript type-stripping (Node ≥ 24).
 * Reads a monthly fee statement from disk, parses it LOUDLY (typed errors →
 * exit 2 at the bin), audits it deterministically against the codified NYC
 * §20-563.3 rule table, and returns the report + exit code (1 iff any `violation`
 * verdict). ZERO LLM / network — enforced by the import-graph eval, not promised.
 *
 * Two registers (item 7): default output is a human-readable TEXT report (the
 * professional line paired with its plain line, verdict states, U1-provisional
 * markers spelled out); `--json` emits the canonical machine report. Both carry
 * the honest scope label — classification is AS-DECLARED; the LLM line-item
 * classifier is DEFERRED to F1b.
 *
 * Plain: point it at a delivery bill; it prints every over-cap or illegal fee with
 * receipts and says whether each is a settled violation or still inside the legal
 * refund window — free to run, no AI.
 */
import { readFileSync } from "node:fs";
import { auditStatement } from "./audit.ts";
import type { FeeAuditReport, FeeFinding } from "./finding.ts";
import { serializeFeeReport } from "./finding.ts";
import { parseStatement } from "./parser.ts";

export interface FeeCliResult {
  readonly report: FeeAuditReport;
  readonly output: string;
  /** 0 = clean, 1 = at least one `violation` verdict. */
  readonly exitCode: 0 | 1;
}

/**
 * Run one fee audit. Throws {@link import("./parser.ts").StatementParseError} on
 * unreadable/malformed input — bin/check.mjs maps that to exit 2.
 */
export function runFeeCheck(statementPath: string, opts: { json?: boolean } = {}): FeeCliResult {
  const raw = readFileSync(statementPath, "utf8");
  const statement = parseStatement(raw);
  const report = auditStatement(statement);
  const output = opts.json ? serializeFeeReport(report) : renderFeeReportText(report);
  return { report, output, exitCode: report.ok ? 0 : 1 };
}

const VERDICT_TAG: Readonly<Record<FeeFinding["verdict"], string>> = {
  violation: "VIOLATION",
  "conditional-pending-refund-window": "CONDITIONAL (refund window open)",
  "cured-by-refund": "CURED BY REFUND (not a violation)",
};

/** Human-readable two-register text render (the default CLI output). */
export function renderFeeReportText(report: FeeAuditReport): string {
  const lines: string[] = [];
  lines.push("UC-1 FEE AUDIT — deterministic spine (SIMULATED statement vs REAL codified NYC §20-563.3)");
  lines.push(`spec: ${report.specVersion}`);
  lines.push(`classification: ${report.classification}`);
  lines.push(`assumed purchase-price base (U1 unresolved): ${report.assumedPurchasePriceBase}`);
  lines.push(`verdict: ${report.ok ? "PASS (no violations)" : "FAIL (violations present)"}`);
  lines.push(
    `findings: ${report.findings.length} — violation ${report.verdictTally.violation}, conditional ${report.verdictTally["conditional-pending-refund-window"]}, cured ${report.verdictTally["cured-by-refund"]}`,
  );
  lines.push("");
  if (report.findings.length === 0) {
    lines.push("No findings — every fee line is within cap as declared.");
  }
  for (const f of report.findings) {
    const marks = f.provisional.length > 0 ? ` [provisional: ${f.provisional.join(", ")}]` : "";
    lines.push(`• [${VERDICT_TAG[f.verdict]}] ${f.ruleId} (${f.referenceRowId}) — ${f.feeClass}${marks}`);
    lines.push(`    ${f.professionalLine}`);
    lines.push(`    ▸ ${f.plainLine}`);
  }
  lines.push("");
  lines.push("Note: SIMULATED statements audited against REAL codified law. No real-platform access or data.");
  return `${lines.join("\n")}\n`;
}
