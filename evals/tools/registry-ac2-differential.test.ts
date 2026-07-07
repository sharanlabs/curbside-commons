import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { callTool, RuleNotFoundError } from "@/lib/tools/registry.ts";

import { runCheck, runConformanceCheck, runDemo } from "@/lib/packs/listings/cli.ts";
import { auditStatement } from "@/lib/packs/fees/audit.ts";
import { serializeFeeReport } from "@/lib/packs/fees/finding.ts";
import { parseStatement } from "@/lib/packs/fees/parser.ts";
import { auditWithClassification } from "@/lib/packs/fees/classified-audit.ts";
import { DeterministicBaselineClassifier } from "@/lib/packs/fees/classifier.ts";
import { serializeClassifiedFeeReport, serializeRuleLookup } from "@/lib/tools/serializers.ts";
import { FEE_RULES, FEE_RULE_BY_ID, NON_STATEMENT_CHECKABLE } from "@/lib/packs/fees/rules.ts";

/**
 * AC-2 DIFFERENTIAL FIDELITY (plan §4 AC-2, the load-bearing test) — for every
 * tool, over REAL fixtures: the registry's `canonical` payload must be
 * BYTE-IDENTICAL (string equality) to a DIRECT engine call through the SAME
 * named serializer, and `exitCode` must match. This is what proves the
 * registry is a faithful seam, not a re-implementation with drift risk.
 */

const root = process.cwd();
const fixtures = join(root, "fixtures", "synthetic-restaurant");
const fees = join(fixtures, "fees");
const catalogPath = join(fixtures, "sor.catalog.json");
const ucpDir = join(root, "fixtures", "ucp-conformance-ci");

describe("AC-2 differential — check_feed vs runCheck (SAME serializeReport)", () => {
  const cases: ReadonlyArray<{ readonly label: string; readonly feedPath: string; readonly surface: "acp" | "ucp" }> = [
    { label: "acp faithful", feedPath: join(fixtures, "acp-feed.faithful.json"), surface: "acp" },
    { label: "acp drifted", feedPath: join(fixtures, "acp-feed.drifted.json"), surface: "acp" },
    { label: "ucp faithful", feedPath: join(fixtures, "ucp-catalog-response.faithful.json"), surface: "ucp" },
    { label: "ucp drifted", feedPath: join(fixtures, "ucp-catalog-response.drifted.json"), surface: "ucp" },
  ];

  for (const c of cases) {
    it(`${c.label}: registry canonical === direct runCheck (byte-identical) + exit-code parity`, () => {
      const direct = runCheck(c.feedPath, catalogPath, c.surface);
      const result = callTool("check_feed", { feedPath: c.feedPath, catalogPath, surface: c.surface });
      expect(result.canonical).toBe(direct.output);
      expect(result.exitCode).toBe(direct.exitCode);
    });
  }
});

describe("AC-2 differential — check_conformance vs runConformanceCheck (SAME serializeReport)", () => {
  const cases: ReadonlyArray<{ readonly label: string; readonly docPath: string }> = [
    { label: "valid: search-full-catalog", docPath: join(ucpDir, "valid", "search-full-catalog.json") },
    { label: "valid: search-single-product", docPath: join(ucpDir, "valid", "search-single-product.json") },
    { label: "invalid: pattern-currency-lowercase", docPath: join(ucpDir, "invalid", "pattern-currency-lowercase.json") },
    { label: "invalid: req-missing-root-products", docPath: join(ucpDir, "invalid", "req-missing-root-products.json") },
  ];

  for (const c of cases) {
    it(`${c.label}: registry canonical === direct runConformanceCheck (byte-identical) + exit-code parity`, () => {
      const direct = runConformanceCheck(c.docPath, "search");
      const result = callTool("check_conformance", { docPath: c.docPath, op: "search" });
      expect(result.canonical).toBe(direct.output);
      expect(result.exitCode).toBe(direct.exitCode);
    });
  }
});

describe("AC-2 differential — audit_statement vs direct parseStatement+auditStatement+serializeFeeReport", () => {
  const statementFiles = [
    "statement.faithful.json",
    "statement.drifted.json",
    "statement.cured.json",
    "statement.conditional.json",
  ];

  for (const file of statementFiles) {
    it(`${file}: registry canonical === serializeFeeReport(auditStatement(parseStatement(raw))) (byte-identical) + exit-code parity`, () => {
      const statementPath = join(fees, file);
      const raw = readFileSync(statementPath, "utf8");
      const directReport = auditStatement(parseStatement(raw));
      const directCanonical = serializeFeeReport(directReport);
      const result = callTool("audit_statement", { statementPath });
      expect(result.canonical).toBe(directCanonical);
      expect(result.exitCode).toBe(directReport.ok ? 0 : 1);
    });
  }
});

describe("AC-2 differential — classify_and_audit vs direct auditWithClassification+serializeClassifiedFeeReport", () => {
  const statementFiles = [
    "statement.faithful.json",
    "statement.drifted.json",
    "statement.cured.json",
    "statement.conditional.json",
  ];

  for (const file of statementFiles) {
    it(`${file}: registry canonical === serializeClassifiedFeeReport(auditWithClassification(...)) (byte-identical) + exit-code parity`, () => {
      const statementPath = join(fees, file);
      const raw = readFileSync(statementPath, "utf8");
      const statement = parseStatement(raw);
      const directReport = auditWithClassification(statement, DeterministicBaselineClassifier);
      const directCanonical = serializeClassifiedFeeReport(directReport);
      const result = callTool("classify_and_audit", { statementPath });
      expect(result.canonical).toBe(directCanonical);
      expect(result.exitCode).toBe(directReport.base.ok ? 0 : 1);
      expect(result.advisory).toBe(true);
      expect(result.earnsLabel).toBe(false);

      // INDEPENDENT proof (Codex A0 finding 2): the serializer above is shared
      // by both sides, so byte-equality alone cannot catch the serializer
      // itself dropping/mis-shaping the envelope. Assert against two sources
      // it does NOT own: (a) the embedded base equals audit_statement's OWN
      // canonical (a different tool through the OLD engine serializer);
      // (b) the advisory list equals the direct engine report's advisory
      // findings, field for field.
      const parsed = JSON.parse(result.canonical) as {
        base: unknown;
        advisoryFindings: unknown;
      };
      const auditResult = callTool("audit_statement", { statementPath });
      expect(parsed.base).toStrictEqual(JSON.parse(auditResult.canonical));
      expect(parsed.advisoryFindings).toStrictEqual(
        JSON.parse(JSON.stringify(directReport.advisoryFindings)),
      );
    });
  }
});

describe("AC-2 differential — get_rule vs direct rules.ts + serializeRuleLookup", () => {
  it("no ruleId -> all FEE_RULES, byte-identical", () => {
    const result = callTool("get_rule", {});
    expect(result.canonical).toBe(serializeRuleLookup(FEE_RULES));
    expect(result.exitCode).toBe(0);
  });

  for (const rule of FEE_RULES) {
    it(`ruleId ${rule.id}: byte-identical to serializeRuleLookup(FEE_RULE_BY_ID.get(...))`, () => {
      const result = callTool("get_rule", { ruleId: rule.id });
      expect(result.canonical).toBe(serializeRuleLookup(FEE_RULE_BY_ID.get(rule.id)!));
      expect(result.exitCode).toBe(0);
    });
  }

  for (const [ruleId, reason] of NON_STATEMENT_CHECKABLE) {
    it(`ruleId ${ruleId} (non-statement-checkable): byte-identical registered answer`, () => {
      const result = callTool("get_rule", { ruleId });
      expect(result.canonical).toBe(
        serializeRuleLookup({ ruleId, nonStatementCheckable: true, reason }),
      );
      expect(result.exitCode).toBe(0);
    });
  }

  it("an unknown ruleId throws RuleNotFoundError (never a fabricated answer)", () => {
    expect(() => callTool("get_rule", { ruleId: "NYC-BOGUS-DOES-NOT-EXIST" })).toThrow(
      RuleNotFoundError,
    );
  });
});

describe("AC-2 differential — run_demo vs direct runDemo (both formats)", () => {
  it("format=json: byte-identical to direct runDemo({json:true})", () => {
    const direct = runDemo({ json: true });
    const result = callTool("run_demo", { format: "json" });
    expect(result.canonical).toBe(direct.output);
    expect(result.exitCode).toBe(direct.exitCode);
  });

  it("format=text: byte-identical to direct runDemo({json:false})", () => {
    const direct = runDemo({ json: false });
    const result = callTool("run_demo", { format: "text" });
    expect(result.canonical).toBe(direct.output);
    expect(result.exitCode).toBe(direct.exitCode);
  });

  it("default format (omitted) === json format", () => {
    const withDefault = callTool("run_demo", {});
    const withJson = callTool("run_demo", { format: "json" });
    expect(withDefault.canonical).toBe(withJson.canonical);
  });
});
