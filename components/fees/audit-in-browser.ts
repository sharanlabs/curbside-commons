/**
 * Fee-playground seam — the REAL fee audit, browser-side (NYC showcase N2,
 * plan docs/plan-nyc-showcase-2026-07-16.md; the listings-playground pattern).
 *
 * This module is the entire bridge between the /fees paste leg and the shipped
 * engine: it composes exactly what the CLI composes (`parseStatement` →
 * `auditStatement`, see lib/packs/fees/cli.ts runFeeCheck) minus the disk read.
 * Nothing is re-implemented and nothing is mocked: the golden-equality test in
 * evals/packs/fees-surface.test.ts proves this seam, fed the sample statement
 * below, reproduces fixtures/synthetic-restaurant/fees/expected-report.drifted.json
 * BYTE-FOR-BYTE — the same equality the page claims on its face.
 *
 * Browser safety: every transitive import in this closure is pure TypeScript —
 * no node:fs, no network (the fail-closed import-graph walk in
 * evals/packs/playground-golden.test.ts includes this seam's closure).
 *
 * Honesty by construction: the engine requires `meta.simulated: true` on every
 * statement it audits (the parser refuses anything else), so a pasted bill is
 * always explicitly an illustrative one, never presented as a real platform
 * statement. The sample's meta is rebuilt here with honest plain-voice values
 * (the lines are the committed fixture's verbatim); the audit report depends
 * only on month/asOf/lines, so the golden equality is exact.
 */
import driftedStatementJson from "@/fixtures/synthetic-restaurant/fees/statement.drifted.json";
import { auditStatement, parseStatement, StatementParseError } from "@/lib/packs/fees";
import type { FeeAuditReport } from "@/lib/packs/fees";

/** The committed drifted month's lines, verbatim; meta rebuilt in plain voice. */
export const SAMPLE_STATEMENT = {
  meta: {
    simulated: true,
    generator: { name: "illustrative-statement", seed: 20260703, version: "web" },
    merchant: "Illustrative restaurant",
    month: driftedStatementJson.meta.month,
    currency: "USD",
    asOf: driftedStatementJson.meta.asOf,
    purchasePriceBaseConvention: driftedStatementJson.meta.purchasePriceBaseConvention,
  },
  lines: driftedStatementJson.lines,
} as const;

/** Pretty-printed sample statement text for the paste box. */
export function sampleStatementText(): string {
  return JSON.stringify(SAMPLE_STATEMENT, null, 2);
}

export type FeeParseResult =
  | { readonly ok: true; readonly report: FeeAuditReport }
  | { readonly ok: false; readonly error: string };

/**
 * Parse + audit pasted text — honest, specific failures; never a fake verdict.
 * The real parser does the validation; this wrapper only makes two failure
 * modes friendlier for the page (invalid JSON shape, the missing honesty
 * marker) without weakening anything.
 */
export function auditStatementText(text: string): FeeParseResult {
  if (!text.trim()) {
    return {
      ok: false,
      error: "The paste box is empty — paste a fee-statement JSON document first.",
    };
  }
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch (e) {
    return { ok: false, error: `Not valid JSON: ${e instanceof Error ? e.message : String(e)}` };
  }
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    return {
      ok: false,
      error: "Expected a JSON object with `meta` and `lines` — got a non-object. Load the sample to see the shape.",
    };
  }
  const meta = (raw as { meta?: unknown }).meta;
  if (
    typeof meta === "object" &&
    meta !== null &&
    (meta as { simulated?: unknown }).simulated !== true
  ) {
    return {
      ok: false,
      error:
        'This audit only runs on example statements: set "simulated": true in meta. The marker says the bill is illustrative — the audit never treats a paste as a real platform statement.',
    };
  }
  try {
    const statement = parseStatement(raw);
    return { ok: true, report: auditStatement(statement) };
  } catch (e) {
    if (e instanceof StatementParseError) {
      return { ok: false, error: e.message };
    }
    return {
      ok: false,
      error: `The audit could not process this statement: ${e instanceof Error ? e.message : String(e)}`,
    };
  }
}
