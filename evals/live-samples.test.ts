import { describe, it, expect } from "vitest";
import { liveSamples } from "@/lib/replay/live-samples";

/**
 * Regression-lock the RECORDED live-Gemini run (the frozen fixture). Converts the prose
 * "honest_findings" into enforced teeth — runs on the committed snapshot, no key, no spend, CI-safe.
 * Re-run + refresh the fixture (node --env-file=.env … evals/live-smoke.test.ts) if it changes.
 */
describe("live-samples fixture — recorded real-Gemini run, regression-locked", () => {
  it("locks the recorded run's exact shape (6 rows; 4 LIVE_AI / 2 FAILED_TO_FALLBACK; 3 PASS / 3 WARN)", () => {
    expect(liveSamples.rows.length).toBe(6);
    expect(liveSamples.provenance.modes).toEqual({ LIVE_AI: 4, FAILED_TO_FALLBACK: 2 });
    expect(liveSamples.provenance.gate).toEqual({ WARN: 3, PASS: 3 });
    expect(liveSamples.provenance.total_cost_usd).toBeGreaterThan(0);
    expect(liveSamples.provenance.total_cost_usd).toBeLessThanOrEqual(5);
  });

  it("total cost == sum of per-row cost (no accounting drift)", () => {
    const sum = liveSamples.rows.reduce((a, r) => a + r.costUsd, 0);
    expect(sum).toBeCloseTo(liveSamples.provenance.total_cost_usd, 5);
  });

  it("every row has the expected fields populated", () => {
    for (const r of liveSamples.rows) {
      expect(typeof r.blocker).toBe("string");
      expect(typeof r.subject).toBe("string");
      expect(typeof r.body).toBe("string");
      expect(["LIVE_AI", "FAILED_TO_FALLBACK"]).toContain(r.mode);
      expect(typeof r.costUsd).toBe("number");
    }
  });

  it("no draft was BLOCKED in the recorded run (post guardrail-precision fix)", () => {
    for (const r of liveSamples.rows) expect(["PASS", "WARN"]).toContain(r.gatekeeper);
  });

  it("every LIVE_AI draft scored full marks on the eval", () => {
    const live = liveSamples.rows.filter((r) => r.mode === "LIVE_AI");
    expect(live.length).toBeGreaterThan(0);
    for (const r of live) expect(r.eval).toBe("3/3");
  });

  it("every FAILED_TO_FALLBACK row degraded honestly: errorClass set + billed cost recorded (not $0)", () => {
    for (const r of liveSamples.rows.filter((r) => r.mode === "FAILED_TO_FALLBACK")) {
      expect(r.errorClass).toBeTruthy();
      expect(r.costUsd).toBeGreaterThan(0);
    }
  });

  it("the provenance mode + gate counts match the rows (no drift between summary and data)", () => {
    const count = (key: "mode" | "gatekeeper") =>
      liveSamples.rows.reduce<Record<string, number>>((a, r) => {
        const k = key === "mode" ? r.mode : r.gatekeeper;
        return (a[k] = (a[k] ?? 0) + 1), a;
      }, {});
    expect(count("mode")).toEqual(liveSamples.provenance.modes);
    expect(count("gatekeeper")).toEqual(liveSamples.provenance.gate);
  });
});
