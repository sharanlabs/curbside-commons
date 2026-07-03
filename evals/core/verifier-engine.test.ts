import { describe, expect, it } from "vitest";
import type { Claim, Reference } from "@/lib/verifier-core";
import {
  MissingEvidenceError,
  buildReport,
  makeFinding,
  serializeReport,
  sortFindings,
  verifyClaims,
} from "@/lib/verifier-core";

/**
 * Engine behavior — C2 guard (no finding without all four receipts), report
 * assembly (spec pin C10, matchingMode label C3, ok/exit semantics C1), and
 * deterministic ordering (what makes golden byte-comparison meaningful).
 */

const claim: Claim = { id: "row-1#price.amount", source: "acp-feed", field: "price.amount", value: "18.99" };

const validInput = {
  claim,
  referenceRowId: "row-1",
  ruleId: "LST-PRICE-VALUE",
  severity: "error",
} as const;

describe("C2 evidence guard (makeFinding)", () => {
  it("constructs a frozen finding when all four fields are present", () => {
    const f = makeFinding(validInput);
    expect(f.referenceRowId).toBe("row-1");
    expect(Object.isFrozen(f)).toBe(true);
  });

  it.each([
    ["empty referenceRowId", { ...validInput, referenceRowId: "" }],
    ["empty ruleId", { ...validInput, ruleId: "  " }],
    ["invalid severity", { ...validInput, severity: "fatal" as never }],
    ["claim without id", { ...validInput, claim: { ...claim, id: "" } }],
  ])("throws MissingEvidenceError on %s", (_label, input) => {
    expect(() => makeFinding(input)).toThrow(MissingEvidenceError);
  });
});

describe("report assembly", () => {
  const opts = { specVersion: "test-spec@1", matchingMode: "synthetic-controlled", simulated: true } as const;

  it("pins specVersion + matchingMode + simulated into the report (C10/C3)", () => {
    const report = buildReport([], opts);
    expect(report.specVersion).toBe("test-spec@1");
    expect(report.matchingMode).toBe("synthetic-controlled");
    expect(report.simulated).toBe(true);
    expect(report.ok).toBe(true);
  });

  it("ok=false iff findings exist (the CLI's non-zero exit derives from it, C1)", () => {
    const report = buildReport([makeFinding(validInput)], opts);
    expect(report.ok).toBe(false);
  });

  it("re-asserts C2 on findings injected from outside verifyClaims", () => {
    const evil = { ...makeFinding(validInput), ruleId: "" };
    expect(() => buildReport([evil], opts)).toThrow(MissingEvidenceError);
  });

  it("orders findings deterministically (category, ruleId, claim id)", () => {
    const a = makeFinding({ ...validInput, category: "price", ruleId: "R-2" });
    const b = makeFinding({ ...validInput, category: "price", ruleId: "R-1" });
    const c = makeFinding({ ...validInput, category: "availability", ruleId: "R-9" });
    const sorted = sortFindings([a, b, c]);
    expect(sorted.map((f) => f.ruleId)).toEqual(["R-9", "R-1", "R-2"]);
  });

  it("serializeReport is byte-stable for identical reports", () => {
    const r1 = buildReport([makeFinding(validInput)], opts);
    const r2 = buildReport([makeFinding(validInput)], opts);
    expect(serializeReport(r1)).toBe(serializeReport(r2));
  });
});

describe("verifyClaims", () => {
  const reference: Reference = {
    kind: "pos-catalog",
    resolve: (c) =>
      c.id.startsWith("row-1")
        ? { referenceRowId: "row-1", matching: "synthetic-controlled", value: "19.99" }
        : null,
  };

  it("runs detectors over resolved claims and guards every emitted finding", () => {
    const findings = verifyClaims([claim], reference, [
      (c, m) =>
        m && c.value !== m.value
          ? [{ claim: c, referenceRowId: m.referenceRowId, ruleId: "T-1", severity: "error" }]
          : [],
    ]);
    expect(findings).toHaveLength(1);
    expect(findings[0].ruleId).toBe("T-1");
  });

  it("propagates the guard: a detector emitting evidence-free findings throws", () => {
    expect(() =>
      verifyClaims([claim], reference, [
        (c, m) => (m ? [{ claim: c, referenceRowId: m.referenceRowId, ruleId: "", severity: "error" }] : []),
      ]),
    ).toThrow(MissingEvidenceError);
  });
});
