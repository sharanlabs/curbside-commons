import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { callTool } from "@/lib/tools/registry.ts";
import { parseStatement } from "@/lib/packs/fees/parser.ts";
import { auditWithClassification } from "@/lib/packs/fees/classified-audit.ts";
import { DeterministicBaselineClassifier } from "@/lib/packs/fees/classifier.ts";
import { serializeClassifiedFeeReport } from "@/lib/tools/serializers.ts";

/**
 * "Advisory findings never gate" (plan §3, §5 row A0: `classify_and_audit`'s
 * `exitCode` is driven by `base.ok` ONLY). None of the four committed fee
 * corpus fixtures happens to combine a CLEAN base audit with a classifier
 * disagreement (checked directly against all four — every clean statement
 * also happens to have zero baseline-classifier disagreements), so this eval
 * builds one small in-memory statement — written to an OS-temp file, never
 * the repo's fixtures/ tree — where the base audit is clean (`ok:true`, zero
 * findings) while the baseline classifier still disagrees on one line's
 * category (a nonzero advisory finding: "Promo adjustment fee" declared
 * `delivery_fee`, which `BASELINE_RULES`' promo/adjustment keyword rule
 * relabels `not-a-permitted-fee`). This is the only way to exercise the
 * gating invariant END-TO-END through the actual registry call.
 */

const SYNTHETIC_CLEAN_STATEMENT_WITH_ADVISORY = JSON.stringify({
  meta: {
    simulated: true,
    generator: { name: "a0-inline-synthetic", seed: 1, version: "1.0.0" },
    merchant: "A0 synthetic test merchant (advisory-never-gates eval; not a real corpus fixture)",
    month: "2026-01",
    currency: "USD",
    asOf: "2026-01-31",
    purchasePriceBaseConvention:
      "order item subtotal before discounts, excluding tax and tip (ASSUMED — U1 unresolved)",
  },
  lines: [
    {
      orderId: "ORD-TEST-1",
      month: "2026-01",
      declaredCategory: "delivery_fee",
      label: "Promo adjustment fee",
      amountCents: 500,
      orderPurchasePriceCents: 10000,
      isRefund: false,
      passthroughDocumented: false,
    },
  ],
});

let tmpDir: string;
let statementPath: string;

beforeAll(() => {
  tmpDir = mkdtempSync(join(tmpdir(), "a0-advisory-never-gates-"));
  statementPath = join(tmpDir, "synthetic-clean-with-advisory.json");
  writeFileSync(statementPath, SYNTHETIC_CLEAN_STATEMENT_WITH_ADVISORY, "utf8");
});

afterAll(() => {
  rmSync(tmpDir, { recursive: true, force: true });
});

describe("advisory-never-gates: classify_and_audit's exitCode ignores advisoryFindings", () => {
  it("setup sanity: base audit is clean AND the classifier disagrees on the one line", () => {
    const statement = parseStatement(SYNTHETIC_CLEAN_STATEMENT_WITH_ADVISORY);
    const report = auditWithClassification(statement, DeterministicBaselineClassifier);
    expect(report.base.ok).toBe(true);
    expect(report.base.findings).toHaveLength(0);
    expect(report.advisoryFindings.length).toBeGreaterThan(0);
  });

  it("the registry tool reports ok:true, exitCode:0 despite the nonzero advisory finding", () => {
    const result = callTool("classify_and_audit", { statementPath });
    expect(result.ok).toBe(true);
    expect(result.exitCode).toBe(0);
    expect(result.advisory).toBe(true);
    expect(result.earnsLabel).toBe(false);
    expect(result.canonical).toContain("not-a-permitted-fee");
  });

  it("byte-identical to a direct engine call through the same named serializer (AC-2 style)", () => {
    const raw = SYNTHETIC_CLEAN_STATEMENT_WITH_ADVISORY;
    const statement = parseStatement(raw);
    const direct = auditWithClassification(statement, DeterministicBaselineClassifier);
    const directCanonical = serializeClassifiedFeeReport(direct);
    const result = callTool("classify_and_audit", { statementPath });
    expect(result.canonical).toBe(directCanonical);
  });
});
