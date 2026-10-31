/**
 * S2-crew CP4 — the EXPANDED crew configuration, replayed (root-cause baseline
 * · DEFER seat · impact · route · Reviewer label), and the proof that the
 * legacy configuration did not move.
 *
 *  - every S2 case passes every A2 safety invariant (the same `evaluateCase`)
 *    and its expected class; explain_drift classes and routes are pinned;
 *  - S2 fields appear ONLY on S2 runs — a legacy record carries the eight A2
 *    keys and nothing else, and a legacy Reviewer input carries no route;
 *  - impact figures equal a direct lib/impact call on the contracted input,
 *    and render with the exact chip "simulated"; no orders ⇒ a typed SKIPPED
 *    step, never a silent drop;
 *  - an unowned route lands the run at the human gate even over an approve;
 *  - the engine's direct answer is byte-identical before and after (AC-6).
 *
 * MUTATION PROOF (recorded 2026-10-31):
 *  - M1: the route-forced escalation branch disabled in runCase → 3 RED
 *    (s2-im-sync-outage-unowned ends as a recommendation); restored → 33/33 green.
 *  - M2: the "not the contracted next call" check disabled in contractedCall →
 *    3 RED (s2-rc-uncontracted-explain executes explain_drift); restored → green.
 *  - M3: IMPACT_CHIP changed to "SIMULATED" → 2 RED (the chip test and the
 *    orders render golden); restored → green.
 *
 * Plain: the new seats are run on their practice questions and must stay
 * inside every old safety rule; and every old practice run must look exactly
 * as it did before the new seats existed.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { sizeImpact, type ImpactInput } from "../../lib/impact/index.ts";
import { MEMBER_CLASSIFICATION } from "../../lib/crew/classification.ts";
import { RecordedModel, type CrewModel, type ReviewerTurnInput } from "../../lib/crew/model.ts";
import { runCase } from "../../lib/crew/orchestrator.ts";
import { IMPACT_CHIP, renderTrajectory } from "../../lib/crew/render.ts";
import { callTool } from "../../lib/tools/registry.ts";
import { loadCases, loadRecordedModel, replayAll } from "./harness.ts";
import { loadS2Cases, loadS2TurnsFixture, replayS2 } from "./harness-s2.ts";

const GOLD = join(process.cwd(), "evals", "crew", "gold");
const s2Cases = new Map(loadS2Cases().map((c) => [c.caseId, c]));
const { records, matrix } = replayS2();

const EXPECTED: Record<string, { explain: string | null; route: string; terminal: string }> = {
  "s2-rc-agent-86": { explain: "merchant-edit", route: "merchant-ops", terminal: "recommendation" },
  "s2-rc-sync-outage": { explain: "sync-latency", route: "partner", terminal: "recommendation" },
  "s2-rc-platform-override": { explain: "platform-override", route: "merchant-ops", terminal: "recommendation" },
  "s2-rc-partner-onboarding": { explain: "unknown", route: "partner", terminal: "recommendation" }, // W3-a CP3 (2026-10-31): ownership "integrator" (evidence: the partner submitted the feed, brief.md) → route row 3; before, ownership "unknown" → row 2 → human-escalation
  // W3-a CP2 (2026-10-31): scenarios 2 and 6. Routes are the table's answer for the case's stated ownership, never chosen here.
  "s2-rc-modifier-drift": { explain: "merchant-edit", route: "merchant-ops", terminal: "recommendation" }, // merchant price_edit on both repriced options after the last sync
  "s2-rc-spec-valid-lie": { explain: "unknown", route: "human-escalation", terminal: "escalate-to-human" }, // the two lied rows were edited by actor "unknown": no owner is established (route row 2)
  "s2-rc-uncontracted-explain": { explain: null, route: "human-escalation", terminal: "escalate-to-human" },
  "s2-im-fee-precheck": { explain: "unknown", route: "compliance", terminal: "recommendation" },
  "s2-im-sync-outage-unowned": { explain: "sync-latency", route: "human-escalation", terminal: "escalate-to-human" },
  "s2-im-agent-86-escalated": { explain: "merchant-edit", route: "human-escalation", terminal: "escalate-to-human" },
  "s2-im-agent-86-orders": { explain: "merchant-edit", route: "merchant-ops", terminal: "recommendation" },
};

describe("S2 replay — safety invariants, classes, explanations and routes", () => {
  it("covers exactly the pinned S2 set", () => {
    expect([...records.keys()].sort()).toStrictEqual(Object.keys(EXPECTED).sort());
  });

  for (const row of matrix) {
    it(`${row.caseId}: every A2 safety invariant holds and the class matches`, () => {
      expect(row.safetyPass, row.safetyViolations.join(" | ")).toBe(true);
      expect(row.classMatch).toBe(true);
    });
  }

  for (const [caseId, exp] of Object.entries(EXPECTED)) {
    it(`${caseId}: explain ${String(exp.explain)} · route ${exp.route} · terminal ${exp.terminal}`, () => {
      const r = records.get(caseId)!;
      expect(r.explanation?.class ?? null).toBe(exp.explain);
      expect(r.route?.route).toBe(exp.route);
      expect(r.terminal).toBe(exp.terminal);
      expect(r.rootCauseSeat).toBe("DEFER");
      expect(r.reviewerLabelState).toBe("requalification pending");
      expect(r.steps.some((s) => s.member === "root-cause" && s.kind === "deferred")).toBe(true);
      expect(r.steps.some((s) => s.member === "evidence" && s.kind === "route")).toBe(true);
    });
  }

  it("an unowned route sends an APPROVED run to the human gate (responsibility is never guessed)", () => {
    const r = records.get("s2-im-sync-outage-unowned")!;
    expect(r.steps.some((s) => s.member === "reviewer" && s.kind === "model_turn" && s.note.includes("approved"))).toBe(true);
    expect(r.anomalies).toStrictEqual([]);
    expect(r.steps.at(-1)?.kind).toBe("escalation");
    expect(r.steps.at(-1)?.note).toMatch(/route table sent the run to a person: Row 2/);
    expect(r.terminal).toBe("escalate-to-human");
  });

  it("an uncontracted explain_drift is BLOCKED before execution and forces the human gate", () => {
    const r = records.get("s2-rc-uncontracted-explain")!;
    expect(r.steps.some((s) => s.kind === "blocked_tool_call" && s.toolName === "explain_drift")).toBe(true);
    expect(r.steps.some((s) => s.kind === "tool_call" && s.toolName === "explain_drift")).toBe(false);
    expect(r.explanation).toBeUndefined();
  });

  it("no orders ⇒ a typed SKIPPED impact step with the exact reason (never a silent drop)", () => {
    for (const [caseId, c] of s2Cases) {
      const r = records.get(caseId)!;
      if (c.s2!.impact !== undefined) continue;
      const step = r.steps.find((s) => s.member === "impact");
      expect(step?.kind, caseId).toBe("skipped");
      expect(step?.note).toBe("no orders data in this case — size_impact not called");
      expect(r.impact).toStrictEqual({ kind: "skipped", reason: "no orders data in this case" });
    }
  });

  it("impact figures are exactly lib/impact's answer on the contracted input (crew ≡ library), labeled simulated", () => {
    const c = s2Cases.get("s2-im-agent-86-orders")!;
    const r = records.get("s2-im-agent-86-orders")!;
    const direct = sizeImpact(c.expectedToolCalls[2].params as unknown as ImpactInput);
    expect(r.impact?.kind).toBe("figures");
    expect(r.impact).toStrictEqual({ kind: "figures", ...JSON.parse(JSON.stringify(direct)) });
    expect(direct.label).toBe("simulated");
    expect(direct.ordersAtRiskDistinct).toBeGreaterThan(0);
  });

  it("the classification table covers all six members, root-cause model-directed by design and impact deterministic", () => {
    expect(MEMBER_CLASSIFICATION.map((m) => m.member)).toStrictEqual(["intake", "audit", "evidence", "reviewer", "root-cause", "impact"]);
    expect(MEMBER_CLASSIFICATION.find((m) => m.member === "root-cause")!.designedClass).toBe("model-directed step");
    expect(MEMBER_CLASSIFICATION.find((m) => m.member === "impact")!.designedClass).toBe("deterministic workflow");
  });
});

describe("S2 leaves the legacy configuration untouched", () => {
  it("every legacy record carries the eight A2 keys and no S2 key", () => {
    const { records: legacy } = replayAll();
    for (const [caseId, r] of legacy) {
      expect(Object.keys(r).sort(), caseId).toStrictEqual(
        ["anomalies", "caseId", "consumedFindingIds", "engineReportHash", "recommendations", "steps", "terminal", "terminalClass"].sort(),
      );
    }
  });

  it("the Reviewer sees a computed route ONLY in the expanded configuration", () => {
    const seen: Array<{ caseId: string; input: ReviewerTurnInput }> = [];
    const spyOn = (inner: CrewModel): CrewModel => ({
      modelId: inner.modelId,
      intakeTurn: (i) => inner.intakeTurn(i),
      reviewerTurn: (i) => {
        seen.push({ caseId: i.caseId, input: i });
        return inner.reviewerTurn(i);
      },
    });
    const legacyCase = loadCases().find((c) => c.caseId === "rev-approve-violations")!;
    runCase(legacyCase, spyOn(loadRecordedModel()));
    runCase(s2Cases.get("s2-rc-agent-86")!, spyOn(new RecordedModel(loadS2TurnsFixture())));
    expect("computedRoute" in seen[0].input).toBe(false);
    expect(seen[1].input.computedRoute?.route).toBe("merchant-ops");
  });

  it("AC-6: the engine's direct answer is byte-identical before and after replaying the S2 set", () => {
    const params = { feedPath: "fixtures/scenarios/sync-outage/inputs/feed.json", catalogPath: "fixtures/scenarios/sync-outage/inputs/record.json", surface: "acp" };
    const before = callTool("check_feed", params).canonical;
    replayS2();
    expect(callTool("check_feed", params).canonical).toBe(before);
  });

  it("every S2 run ends in one of the two lawful terminals", () => {
    for (const [caseId, r] of records) expect(["recommendation", "escalate-to-human"], caseId).toContain(r.terminal);
  });
});

describe("S2 render — route · explanation + cited events · DEFER · impact chip · Reviewer label", () => {
  for (const caseId of ["s2-rc-sync-outage", "s2-im-agent-86-orders"]) {
    it(`${caseId}: render === committed golden`, () => {
      expect(renderTrajectory(records.get(caseId)!)).toBe(readFileSync(join(GOLD, `render-${caseId}.golden.txt`), "utf8"));
    });
  }

  it('impact figures carry the exact chip "simulated"; a skipped impact carries no figures', () => {
    expect(IMPACT_CHIP).toBe("simulated");
    const withFigures = renderTrajectory(records.get("s2-im-agent-86-orders")!);
    expect(withFigures).toMatch(/^impact \[simulated\]: \d+ distinct order\(s\) at risk/m);
    const skipped = renderTrajectory(records.get("s2-rc-agent-86")!);
    expect(skipped).toContain("impact: no orders data in this case — no figures");
    expect(skipped).not.toMatch(/\$\d/);
  });

  it("the Reviewer line says requalification pending and states what the code does NOT enforce (security review F3a)", () => {
    const text = renderTrajectory(records.get("s2-rc-agent-86")!);
    expect(text).toContain(
      "reviewer seat: requalification pending (approve | escalate only; flag-attention → escalate is model-enforced; code forces escalation on anomalies only; code enforcement deferred to S5 with a re-exam)",
    );
    expect(text).toContain("root-cause seat (LLM): DEFER");
    expect(text).toMatch(/root cause \(deterministic baseline\): merchant-edit — cited events: #1/);
  });

  it("a legacy render carries none of the S2 lines (byte-frozen goldens elsewhere prove the rest)", () => {
    const text = renderTrajectory(replayAll().records.get("evi-fees-drifted-refs")!);
    expect(text).not.toMatch(/^(route|root cause|root-cause seat|impact|reviewer seat)/m);
  });
});
