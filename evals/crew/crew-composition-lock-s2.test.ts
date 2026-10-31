/**
 * S2 COMPOSITION LOCK (S2-crew CP4; gap sheet 2026-10-12 page 5). The A2 lock
 * (`crew-composition-lock.test.ts`) is NOT edited and still pins its 20 legacy
 * cases; this file pins the NEW cases separately, so neither set can be
 * quietly changed after the fact:
 *  - the exact pinned ids, ≥ 3 per new member (root-cause, impact);
 *  - disjoint from the A2 replay split and the exposed L-1 held-out split;
 *  - every case carries the S2 block and a current manifest digest; its turns
 *    carry the same digest and NO root-cause turn (the LLM root-cause seat is
 *    DEFER, so there is nothing to record);
 *  - every expectation RE-DERIVES from the real engine offline — the main
 *    call's report hash, class and refs, and the explain_drift / size_impact
 *    call contracts, rebuilt here independently of the orchestrator.
 * Replay-only: no case here was ever, or may be, answered by a live model.
 *
 * MUTATION PROOF (recorded 2026-10-31): one event's actor flipped inside the
 * committed explain_drift contract of s2-rc-sync-outage → 2 RED (the contract
 * no longer re-derives from the events file; the stamp is stale); the file
 * restored byte-for-byte → 8/8 green.
 *
 * Plain: the new practice questions are counted, named and re-checked against
 * the checker itself, so nobody can swap one for an easier version later.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { argsDigest, reportHash } from "../../lib/crew/orchestrator.ts";
import { caseManifestDigest } from "../../lib/crew/manifest.ts";
import { deriveRecommendationClass, parseReportCanonical, RECOMMENDATION_CLASSES, type CrewCase } from "../../lib/crew/types.ts";
import { callTool } from "../../lib/tools/registry.ts";
import { loadCases } from "./harness.ts";
import { loadS2Cases, loadS2TurnsFixture } from "./harness-s2.ts";

const cases = loadS2Cases();
const turns = loadS2TurnsFixture();

const PINNED_S2_IDS = [
  "s2-im-agent-86-escalated",
  "s2-im-agent-86-orders",
  "s2-im-fee-precheck",
  "s2-im-sync-outage-unowned",
  "s2-rc-agent-86",
  "s2-rc-modifier-drift", // W3-a CP2 (2026-10-31): scenario 2's root-cause case
  "s2-rc-partner-onboarding",
  "s2-rc-platform-override",
  "s2-rc-spec-valid-lie", // W3-a CP2 (2026-10-31): scenario 6's root-cause case
  "s2-rc-sync-outage",
  "s2-rc-uncontracted-explain",
] as const;

/** The one containment case whose contract deliberately omits explain_drift. */
const UNCONTRACTED = new Set(["s2-rc-uncontracted-explain"]);

const KNOWN_TOOLS_S2 = new Set([
  "check_feed",
  "check_conformance",
  "audit_statement",
  "classify_and_audit",
  "get_rule",
  "run_demo",
  "explain_drift",
  "size_impact",
]);

function jsonl(path: string): unknown[] {
  return readFileSync(path, "utf8")
    .split("\n")
    .filter((l) => l.trim().length > 0)
    .map((l) => JSON.parse(l) as unknown);
}

describe("S2 composition lock", () => {
  it("exactly the pinned S2 ids", () => {
    expect(cases.map((c) => c.caseId)).toStrictEqual([...PINNED_S2_IDS]);
  });

  it("≥ 3 cases per new member, and only the new members", () => {
    const rc = cases.filter((c) => c.member === "root-cause").length;
    const im = cases.filter((c) => c.member === "impact").length;
    expect(rc).toBe(7); // 5 S2-crew + 2 W3-a CP2 (modifier-drift, spec-valid-lie)
    expect(im).toBe(4);
    expect(rc + im).toBe(cases.length);
  });

  it("disjoint from the A2 replay split and the exposed L-1 held-out split", () => {
    const a2 = new Set(loadCases().map((c) => c.caseId));
    const live = new Set(
      readdirSync(join(process.cwd(), "evals", "crew", "cases-live"))
        .filter((f) => f.endsWith(".case.json"))
        .map((f) => (JSON.parse(readFileSync(join(process.cwd(), "evals", "crew", "cases-live", f), "utf8")) as CrewCase).caseId),
    );
    for (const c of cases) {
      expect(a2.has(c.caseId), c.caseId).toBe(false);
      expect(live.has(c.caseId), c.caseId).toBe(false);
    }
  });

  it("every case is schema-valid: S2 block, known tools, enums, current manifest digest", () => {
    for (const c of cases) {
      expect(c.s2, c.caseId).toBeDefined();
      expect(typeof c.s2!.eventsPath).toBe("string");
      expect(Number.isNaN(Date.parse(c.s2!.asOf))).toBe(false);
      for (const t of [...c.allowedTools, ...c.forbiddenTools, ...c.expectedToolCalls.map((x) => x.tool)]) {
        expect(KNOWN_TOOLS_S2.has(t), `${c.caseId}: ${t}`).toBe(true);
      }
      expect([...RECOMMENDATION_CLASSES, "none-escalated"]).toContain(c.expectedRecommendationClass);
      expect(["approve-recommendation", "escalate-to-human"]).toContain(c.expectedGateState);
      expect(c.manifestDigest).toBe(caseManifestDigest(c));
    }
  });

  it("recorded turns: same digest as the case, intake + reviewer only — no root-cause turn exists (the seat is DEFER)", () => {
    expect(Object.keys(turns).sort()).toStrictEqual([...PINNED_S2_IDS]);
    for (const c of cases) {
      const entry = turns[c.caseId] as unknown as Record<string, unknown>;
      expect(entry.manifestDigest, c.caseId).toBe(c.manifestDigest);
      expect(Object.keys(entry).sort(), c.caseId).toStrictEqual(["intake", "manifestDigest", "reviewer"]);
    }
  });

  it("every expectation re-derives from the real engine offline (hash, class, refs ⊆ engine ids)", () => {
    for (const c of cases) {
      const main = c.expectedToolCalls[0];
      const result = callTool(main.tool, main.params);
      const report = parseReportCanonical(result.canonical);
      expect(reportHash(result.canonical), c.caseId).toBe(c.expectedEngineReportHash);
      for (const ref of c.expectedFindingRefs) expect(report.findingIds, `${c.caseId}: ${ref}`).toContain(ref);
      if (c.expectedGateState === "approve-recommendation") {
        expect(deriveRecommendationClass(report), c.caseId).toBe(c.expectedRecommendationClass);
      } else {
        expect(c.expectedRecommendationClass, c.caseId).toBe("none-escalated");
      }
    }
  });

  it("the explain_drift and size_impact contracts re-derive from the engine report + the case's own evidence files", () => {
    for (const c of cases) {
      const report = JSON.parse(callTool(c.expectedToolCalls[0].tool, c.expectedToolCalls[0].params).canonical) as {
        findings: Array<{ claim: { id: string }; ruleId: string; category?: string; referenceRowId?: string }>;
      };
      const explainCall = c.expectedToolCalls.find((x) => x.tool === "explain_drift");
      if (UNCONTRACTED.has(c.caseId)) {
        expect(explainCall, c.caseId).toBeUndefined();
        continue;
      }
      expect(c.expectedToolCalls[1]?.tool, c.caseId).toBe("explain_drift");
      const explainParams = {
        asOf: c.s2!.asOf,
        events: jsonl(c.s2!.eventsPath),
        findings: report.findings.map((f) => ({ id: f.claim.id, ruleId: f.ruleId, category: f.category ?? null, referenceRowId: f.referenceRowId ?? null })),
      };
      expect(argsDigest(explainCall!.params), `${c.caseId}: explain_drift contract`).toBe(argsDigest(explainParams));
      const impactCall = c.expectedToolCalls.find((x) => x.tool === "size_impact");
      if (c.s2!.impact === undefined) {
        expect(impactCall, `${c.caseId}: no orders ⇒ no size_impact contract`).toBeUndefined();
      } else {
        expect(c.expectedToolCalls[2]?.tool, c.caseId).toBe("size_impact");
        const impactParams = {
          errorChargeShare: c.s2!.impact.errorChargeShare,
          windowDays: c.s2!.impact.windowDays,
          orders: jsonl(c.s2!.impact.ordersPath),
          findings: report.findings.map((f) => ({ id: f.claim.id, ruleId: f.ruleId, category: f.category ?? "", referenceRowId: f.referenceRowId ?? null })),
        };
        expect(argsDigest(impactCall!.params), `${c.caseId}: size_impact contract`).toBe(argsDigest(impactParams));
      }
    }
  });

  it("at least one pinned case exercises each S2 path: orders present, orders absent, uncontracted explain, route-forced escalation, reviewer escalation", () => {
    expect(cases.some((c) => c.s2?.impact !== undefined)).toBe(true);
    expect(cases.some((c) => c.s2?.impact === undefined)).toBe(true);
    expect(cases.some((c) => UNCONTRACTED.has(c.caseId))).toBe(true);
    expect(cases.some((c) => c.s2?.route.ownership === "unknown" && c.s2.route.triggerKind !== "partner-onboarding" && c.s2.route.pack !== "fees")).toBe(true);
    expect(cases.some((c) => (turns[c.caseId]?.reviewer as { kind?: string } | undefined)?.kind === "escalate")).toBe(true);
  });
});
