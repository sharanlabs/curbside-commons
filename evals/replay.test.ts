import { describe, it, expect } from "vitest";
import { RUN_TIMESTAMP, STEP_MAP } from "@/lib/core/constants";
import { buildReplaySnapshot } from "@/lib/replay/run";

const snap = buildReplaySnapshot();

describe("REPLAY snapshot — deterministic, honest, complete", () => {
  it("is deterministic and recorded (no wall-clock, no spend)", () => {
    expect(buildReplaySnapshot()).toEqual(snap);
    expect(snap.servedMode).toBe("REPLAY");
    expect(snap.generatedAt).toBe(RUN_TIMESTAMP);
    expect(snap.costLedger.totalUsd).toBe(0);
    expect(snap.costLedger.liveCalls).toBe(0);
  });

  it("covers the full hybrid set with real provenance", () => {
    expect(snap.merchants.length).toBe(20);
    expect(snap.summary.merchants).toBe(20);
    expect(snap.provenance.license).toContain("PDDL");
  });

  it("every recorded draft is gate-clean and quality-passing (mock path)", () => {
    for (const rm of snap.merchants) {
      expect(["PASS", "WARN"]).toContain(rm.gatekeeper.status);
      expect(rm.gatekeeper.approvedForHumanReview).toBe(true);
      expect(rm.evalScore.pass).toBe(true);
      expect(rm.draft.claims.length).toBe(4);
      expect(rm.audit.length).toBeGreaterThanOrEqual(4);
    }
    expect(snap.summary.evalPassed).toBe(20);
    expect(snap.summary.rejected).toBe(0);
  });

  it("shows BOTH human-in-the-loop outcomes and the full blocker taxonomy", () => {
    expect(snap.summary.sent).toBeGreaterThan(0);
    expect(snap.summary.held).toBeGreaterThan(0);
    for (const { blocker } of Object.values(STEP_MAP)) {
      expect(snap.summary.blockers[blocker]).toBeGreaterThan(0);
    }
  });
});
