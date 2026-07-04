import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  auditStatement,
  auditWithClassification,
  buildConditionalStatement,
  buildCuredStatement,
  buildDriftedStatement,
  buildFaithfulStatement,
  DeterministicBaselineClassifier,
  LIVE_CLASSIFIER_DESIGN,
  makeMockOracleClassifier,
  NOT_A_PERMITTED_FEE,
  serializeFeeReport,
  toClassifierInput,
  type ClassifierInput,
  type TrueCategoryLabel,
} from "@/lib/packs/fees";
import { MissingEvidenceError } from "@/lib/verifier-core";
import { makeFinding } from "@/lib/verifier-core/guard";

/**
 * F1b classifier seam + advisory-wiring evals (plan §5 F1b, C8; deliverables
 * 2/3/7). Covers:
 *  - the DI seam (baseline / mock-oracle both satisfy LineItemClassifier);
 *  - the deterministic-baseline honesty markers (never earns the label);
 *  - the $0-LLM / zero-network structural proof, EXTENDED to classifier.ts +
 *    classified-audit.ts (the fees-cli import-graph pattern, self-contained here
 *    so the frozen fees-cli.test.ts stays untouched);
 *  - the advisory audit path: the DEFAULT auditStatement path stays BYTE-IDENTICAL
 *    to the frozen F1a goldens; advisory findings carry claim.source "classifier"
 *    + the C2 receipts + the `advisory: true` marker and never affect `base.ok`;
 *  - the WIRING PROOF: the mock oracle surfaces the deferred ORD-5 relabeling +
 *    bundling candidates (deliverable 7) while the deterministic baseline — the
 *    honest floor — does NOT (it cannot resolve them from label text alone).
 */

const root = process.cwd();
const feesDir = join(root, "fixtures", "synthetic-restaurant", "fees");

describe("F1b classifier seam — DI + honesty markers", () => {
  it("the deterministic baseline never claims an earned/calibrated label", () => {
    expect(DeterministicBaselineClassifier.earnsLabel).toBe(false);
    expect(DeterministicBaselineClassifier.name).toBe("deterministic-baseline");
  });

  it("the mock oracle is a WIRING STUB — also never earns the label", () => {
    const mock = makeMockOracleClassifier(new Map(), () => "");
    expect(mock.earnsLabel).toBe(false);
    expect(mock.name).toBe("mock-oracle-wiring-stub");
  });

  it("the live lane is DESIGNED but explicitly NOT wired", () => {
    expect(LIVE_CLASSIFIER_DESIGN.wired).toBe(false);
  });

  it("both classifiers satisfy the same LineItemClassifier shape (interchangeable via DI)", () => {
    const input: ClassifierInput = {
      label: "Delivery fee",
      declaredCategory: "delivery_fee",
      amountCents: 300,
      orderPurchasePriceCents: 2000,
      isRefund: false,
      passthroughDocumented: false,
      siblingDeclaredCategories: ["delivery_fee"],
    };
    const mock = makeMockOracleClassifier(new Map<string, TrueCategoryLabel>([["k", "delivery_fee"]]), () => "k");
    for (const clf of [DeterministicBaselineClassifier, mock]) {
      const p = clf.classify(input);
      expect(typeof p.predicted).toBe("string");
      expect(typeof p.rationale).toBe("string");
    }
  });

  it("toClassifierInput carries NO ground-truth field (leak-free contract)", () => {
    const line = {
      orderId: "ORD-X",
      month: "2026-06",
      declaredCategory: "delivery_fee",
      label: "Delivery fee",
      amountCents: 300,
      orderPurchasePriceCents: 2000,
      isRefund: false,
      passthroughDocumented: false,
    };
    const input = toClassifierInput(line, ["delivery_fee"]);
    expect(Object.keys(input).sort()).toEqual(
      [
        "amountCents",
        "declaredCategory",
        "isRefund",
        "label",
        "orderPurchasePriceCents",
        "passthroughDocumented",
        "siblingDeclaredCategories",
      ].sort(),
    );
    // No key here can possibly carry an answer-key/trueCategory value.
    expect("trueCategory" in input).toBe(false);
  });
});

describe("F1b $0-LLM / zero-network structural proof — classifier.ts + classified-audit.ts", () => {
  const banned = [/lib\/agents\//, /@ai-sdk/, /^ai$|\/ai\//, /node:https?/, /undici/, /groq|gemini/i];

  function importsOf(file: string): string[] {
    const text = readFileSync(file, "utf8");
    const specs: string[] = [];
    const re = /(?:from\s+|import\s*\(\s*|import\s+)["']([^"']+)["']/g;
    for (let m = re.exec(text); m; m = re.exec(text)) specs.push(m[1]);
    return specs;
  }
  function resolve(fromFile: string, spec: string): string | null {
    let base: string | null = null;
    if (spec.startsWith("@/")) base = join(root, spec.slice(2));
    else if (spec.startsWith(".")) base = join(fromFile, "..", spec);
    if (base === null) return null;
    const candidates = [base, `${base}.ts`, `${base}.tsx`, `${base}.mjs`, `${base}.json`, join(base, "index.ts")];
    return candidates.find((c) => existsSync(c) && /\.(ts|tsx|mjs|json)$/.test(c)) ?? null;
  }

  it("no module reachable from classifier.ts / classified-audit.ts matches a banned pattern (and no bare fetch)", () => {
    const queue = [
      join(root, "lib", "packs", "fees", "classifier.ts"),
      join(root, "lib", "packs", "fees", "classified-audit.ts"),
    ];
    const seen = new Set<string>();
    while (queue.length > 0) {
      const file = queue.pop() as string;
      if (seen.has(file)) continue;
      seen.add(file);
      if (file.endsWith(".json")) continue;
      const text = readFileSync(file, "utf8");
      expect(/(^|[^.\w])fetch\s*\(/.test(text), `bare fetch( reachable in ${file}`).toBe(false);
      for (const spec of importsOf(file)) {
        for (const pattern of banned) {
          expect(pattern.test(spec), `banned import "${spec}" in ${file}`).toBe(false);
        }
        const resolved = resolve(file, spec);
        if (resolved !== null) queue.push(resolved);
      }
    }
    expect(seen.size).toBeGreaterThan(3);
  });
});

describe("F1b advisory audit path — default path stays byte-identical; advisory is a separate, non-gating array", () => {
  it("auditWithClassification's `base` report is EXACTLY auditStatement(statement) — byte-identical", () => {
    const statement = buildDriftedStatement();
    const direct = auditStatement(statement);
    const { base } = auditWithClassification(statement, DeterministicBaselineClassifier);
    expect(serializeFeeReport(base)).toBe(serializeFeeReport(direct));
  });

  it("the F1a frozen golden reports are UNCHANGED by this slice (re-assertion, deliverable 7)", () => {
    const cases: readonly [string, () => ReturnType<typeof buildFaithfulStatement>][] = [
      ["expected-report.faithful.json", buildFaithfulStatement],
      ["expected-report.drifted.json", buildDriftedStatement],
      ["expected-report.cured.json", buildCuredStatement],
      ["expected-report.conditional.json", buildConditionalStatement],
    ];
    for (const [golden, build] of cases) {
      const goldenText = readFileSync(join(feesDir, golden), "utf8");
      expect(serializeFeeReport(auditStatement(build())), golden).toBe(goldenText);
    }
  });

  it("an advisory finding carries claim.source 'classifier' + all four C2 receipts + the advisory marker", () => {
    const statement = buildDriftedStatement();
    const { advisoryFindings } = auditWithClassification(statement, DeterministicBaselineClassifier);
    expect(advisoryFindings.length).toBeGreaterThan(0);
    for (const f of advisoryFindings) {
      expect(f.claim.source).toBe("classifier");
      expect(f.advisory).toBe(true);
      expect(f.claim.id.length).toBeGreaterThan(0);
      expect(f.referenceRowId.length).toBeGreaterThan(0);
      expect(f.ruleId.length).toBeGreaterThan(0);
      expect(f.severity).toBe("info");
      expect(f.professionalLine.length).toBeGreaterThan(0);
      expect(f.plainLine.length).toBeGreaterThan(0);
    }
  });

  it("a claim missing a C2 receipt still throws the core guard (the advisory path reuses the SAME guard, not a bypass)", () => {
    expect(() =>
      makeFinding({
        claim: { id: "x", source: "classifier", field: "", value: "y" },
        referenceRowId: "classifier:test",
        ruleId: "F1B-CLASSIFIER-ADVISORY(test)",
        severity: "info",
      }),
    ).toThrow(MissingEvidenceError);
  });

  it("advisory findings NEVER change base.ok / base.findings / base.verdictTally", () => {
    const statement = buildDriftedStatement();
    const direct = auditStatement(statement);
    const { base } = auditWithClassification(statement, DeterministicBaselineClassifier);
    expect(base.ok).toBe(direct.ok);
    expect(base.findings.length).toBe(direct.findings.length);
    expect(base.verdictTally).toEqual(direct.verdictTally);
  });
});

describe("F1b wiring proof (deliverable 7) — the mock oracle surfaces the deferred ORD-5 candidates; the honest baseline does not", () => {
  // ORD-5 carries the two DEFERRED-TO-CLASSIFIER answer-key entries (fee-drift-006
  // bundling, fee-drift-007 relabeling) — see fee-answer-key.json / generate.ts.
  const ord5Answers = new Map<string, TrueCategoryLabel>([
    ["ORD-5#transaction_fee", NOT_A_PERMITTED_FEE], // fee-drift-006: bundles service+processing
    ["ORD-5#enhanced_service_fee", "delivery_fee"], // fee-drift-007: relabeled from delivery
  ]);
  const keyOf = (input: ClassifierInput): string => {
    // Reconstructed from the orderId carried in the advisory finding's claim id
    // shape; here we key directly off the label+declaredCategory pair for the two
    // known ORD-5 lines (a test-local oracle key, not a production convention).
    if (input.label.includes("service + processing bundle")) return "ORD-5#transaction_fee";
    if (input.label.includes("formerly delivery")) return "ORD-5#enhanced_service_fee";
    return "no-match";
  };

  it("the MOCK ORACLE surfaces BOTH deferred ORD-5 candidates (proves the seam CAN carry a relabeling)", () => {
    const mock = makeMockOracleClassifier(ord5Answers, keyOf);
    const { advisoryFindings } = auditWithClassification(buildDriftedStatement(), mock);
    const ord5 = advisoryFindings.filter((f) => f.orderId === "ORD-5");
    expect(ord5.length).toBe(2);
    const byDeclared = new Map(ord5.map((f) => [f.declaredCategory, f.predictedTrueCategory]));
    expect(byDeclared.get("transaction_fee")).toBe(NOT_A_PERMITTED_FEE);
    expect(byDeclared.get("enhanced_service_fee")).toBe("delivery_fee");
  });

  it("the DETERMINISTIC BASELINE does NOT resolve the ORD-5 relabeling (honest floor — no overclaim)", () => {
    const { advisoryFindings } = auditWithClassification(buildDriftedStatement(), DeterministicBaselineClassifier);
    const ord5Enhanced = advisoryFindings.find(
      (f) => f.orderId === "ORD-5" && f.declaredCategory === "enhanced_service_fee",
    );
    // "Marketing (formerly delivery)" reads as enhanced/marketing to the keyword
    // rules — the baseline agrees with the (wrong) declared category, so it emits
    // NO advisory candidate here. This is the measured gap the LLM classifier must
    // beat, not a floor assumed to already catch it.
    expect(ord5Enhanced).toBeUndefined();
  });

  it("neither classifier's ORD-5 output is presented as a caught violation (advisory only, severity info)", () => {
    const mock = makeMockOracleClassifier(ord5Answers, keyOf);
    const { advisoryFindings, base } = auditWithClassification(buildDriftedStatement(), mock);
    const ord5 = advisoryFindings.filter((f) => f.orderId === "ORD-5");
    for (const f of ord5) {
      expect(f.severity).toBe("info");
      expect(f.advisory).toBe(true);
    }
    // The base (deterministic) report's ok/findings are unaffected by the mock's candidates.
    expect(base.findings.every((finding) => !finding.claim.id.includes("ORD-5"))).toBe(true);
  });
});
