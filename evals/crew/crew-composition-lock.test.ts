import { describe, expect, it } from "vitest";
import { RECOMMENDATION_CLASSES } from "@/lib/crew/types.ts";
import { loadCases, loadRecordedModel } from "./harness.ts";

/**
 * COMPOSITION LOCK (floors doc §2; F1b composition-test pattern): the case
 * set's size, per-member split, pinned ids, injection/refusal minimums, and
 * schema validity are asserted so the pre-registered composition cannot be
 * quietly changed after the fact.
 */

const cases = loadCases();
const PINNED_IDS = [
  "aud-advisory-refused",
  "aud-demo-refused",
  "aud-feed-clean",
  "aud-fees-clean",
  "aud-fees-violations",
  "evi-conf-valid-clean",
  "evi-feed-drifted-refs",
  "evi-fees-conditional",
  "evi-fees-drifted-refs",
  "evi-injection-content",
  "int-injection-steered",
  "int-reject-malformed",
  "int-route-conf-happy",
  "int-route-feed-happy",
  "int-route-fees-happy",
  "rev-approve-clean",
  "rev-approve-violations",
  "rev-escalate-conditional",
  "rev-escalate-suspicious",
  "rev-refusal-forced",
] as const;

const KNOWN_TOOLS = new Set([
  "check_feed",
  "check_conformance",
  "audit_statement",
  "classify_and_audit",
  "get_rule",
  "run_demo",
]);

describe("A2 composition lock", () => {
  it("exactly 20 cases with the exact pinned ids", () => {
    expect(cases.map((c) => c.caseId).sort()).toStrictEqual([...PINNED_IDS].sort());
  });

  it("exactly 5 cases per member focus", () => {
    for (const member of ["intake", "audit", "evidence", "reviewer"]) {
      expect(cases.filter((c) => c.member === member).length, member).toBe(5);
    }
  });

  it("the two pre-registered INJECTION cases exist and terminate at the human gate", () => {
    for (const id of ["int-injection-steered", "rev-escalate-suspicious"]) {
      const c = cases.find((x) => x.caseId === id);
      expect(c, id).toBeDefined();
      expect(c!.expectedGateState).toBe("escalate-to-human");
      expect(c!.inputArtifact.path).toContain("statement.injection.json");
    }
  });

  it("reviewer has ≥2 refusal cases (expectedGateState escalate-to-human)", () => {
    const refusals = cases.filter((c) => c.member === "reviewer" && c.expectedGateState === "escalate-to-human");
    expect(refusals.length).toBeGreaterThanOrEqual(2);
  });

  it("every case document is schema-valid (fields, enums, known tools)", () => {
    for (const c of cases) {
      expect(typeof c.caseId).toBe("string");
      expect(["intake", "audit", "evidence", "reviewer"]).toContain(c.member);
      expect(typeof c.inputArtifact?.path).toBe("string");
      expect(typeof c.ask).toBe("string");
      expect(Array.isArray(c.allowedTools) && Array.isArray(c.forbiddenTools)).toBe(true);
      for (const t of [...c.allowedTools, ...c.forbiddenTools]) expect(KNOWN_TOOLS.has(t), `${c.caseId}: ${t}`).toBe(true);
      for (const call of c.expectedToolCalls) expect(KNOWN_TOOLS.has(call.tool), `${c.caseId}: ${call.tool}`).toBe(true);
      expect([...RECOMMENDATION_CLASSES, "none-escalated"]).toContain(c.expectedRecommendationClass);
      expect(["approve-recommendation", "escalate-to-human"]).toContain(c.expectedGateState);
      expect(c.expectedEngineReportHash === null || /^[0-9a-f]{64}$/.test(c.expectedEngineReportHash!)).toBe(true);
    }
  });

  it("every case has its committed recorded intake turn (and reviewer turn where the flow reaches one)", () => {
    const model = loadRecordedModel();
    for (const c of cases) {
      expect(
        () => model.intakeTurn({ caseId: c.caseId, ask: c.ask, quarantinedArtifactExcerpt: "", allowedTools: c.allowedTools }),
        `${c.caseId}: missing intake turn`,
      ).not.toThrow();
    }
  });
});
