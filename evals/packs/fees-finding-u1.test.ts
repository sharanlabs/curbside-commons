import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  BASE_DERIVED_RULE_IDS,
  MissingProvisionalMarkerError,
  PROVISIONAL_U1,
  PURCHASE_PRICE_BASE_STATUS,
  makeFeeFinding,
  type FeeFindingInput,
} from "@/lib/packs/fees";
import { MissingEvidenceError } from "@/lib/verifier-core";

/**
 * U1 PROVISIONALITY, structural (plan F1a item 5), RED-GREEN: makeFeeFinding
 * wraps the core C2 guard (makeFinding) AND requires the U1 provisional marker on
 * any finding from a base-derived rule — a base-derived over-cap cannot exist as
 * an unqualified violation.
 */

const baseInput = (over: Partial<FeeFindingInput>): FeeFindingInput => ({
  claim: { id: "2026-06#delivery_fee", source: "fee-statement", field: "monthlyAverage", value: 1 },
  referenceRowId: "§ 20-563.3(a) (averaging clause)",
  ruleId: "NYC-563.3-a-2", // base-derived
  severity: "error",
  verdict: "violation",
  feeClass: "over-cap",
  professionalLine: "professional",
  plainLine: "plain",
  ...over,
});

describe("U1: base-derived findings REQUIRE the provisional marker", () => {
  it("RED: a base-derived rule without the U1 marker throws", () => {
    expect(() => makeFeeFinding(baseInput({}))).toThrow(MissingProvisionalMarkerError);
    expect(() => makeFeeFinding(baseInput({ provisional: ["something-else"] }))).toThrow(
      MissingProvisionalMarkerError,
    );
  });

  it("GREEN: the same finding WITH the U1 marker constructs", () => {
    const f = makeFeeFinding(baseInput({ provisional: [PROVISIONAL_U1] }));
    expect(f.provisional).toContain(PROVISIONAL_U1);
    expect(f.verdict).toBe("violation");
  });

  it("a NON-base-derived rule (d-1) does not require the marker", () => {
    const f = makeFeeFinding(
      baseInput({
        ruleId: "NYC-563.3-d-1",
        referenceRowId: "§ 20-563.3(d) (category lock)",
        feeClass: "bundling",
      }),
    );
    expect(f.provisional).toEqual([]);
  });

  it("the U1 marker is ONE constant, and the status flag is unresolved-U1", () => {
    expect(PROVISIONAL_U1).toBe("U1-base");
    expect(PURCHASE_PRICE_BASE_STATUS).toBe("unresolved-U1");
  });
});

describe("U1: makeFeeFinding still enforces the core C2 receipts + two registers", () => {
  it("a missing C2 receipt throws the core MissingEvidenceError", () => {
    expect(() =>
      makeFeeFinding(baseInput({ provisional: [PROVISIONAL_U1], referenceRowId: "" })),
    ).toThrow(MissingEvidenceError);
  });

  it("a missing professional or plain line throws (two-register standard)", () => {
    expect(() =>
      makeFeeFinding(baseInput({ provisional: [PROVISIONAL_U1], professionalLine: "  " })),
    ).toThrow(MissingProvisionalMarkerError);
    expect(() =>
      makeFeeFinding(baseInput({ provisional: [PROVISIONAL_U1], plainLine: "" })),
    ).toThrow(MissingProvisionalMarkerError);
  });
});

describe("U1: every base-derived finding in the frozen goldens carries the marker", () => {
  const dir = join(process.cwd(), "fixtures", "synthetic-restaurant", "fees");
  it("no golden report has a base-derived finding without U1-base", () => {
    for (const name of ["drifted", "cured", "conditional", "faithful"]) {
      const report = JSON.parse(readFileSync(join(dir, `expected-report.${name}.json`), "utf8")) as {
        findings: { ruleId: string; provisional: string[] }[];
      };
      for (const f of report.findings) {
        if (BASE_DERIVED_RULE_IDS.has(f.ruleId)) {
          expect(f.provisional, `${name}: ${f.ruleId} missing U1-base`).toContain(PROVISIONAL_U1);
        }
      }
    }
  });
});
