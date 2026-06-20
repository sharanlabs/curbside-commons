import { describe, it, expect } from "vitest";
import { liveSamples } from "@/lib/replay/live-samples";

/**
 * Regression-lock the RECORDED live-Gemini run (the frozen fixture). Converts the prose
 * "honest_findings" into enforced teeth — runs on the committed snapshot, no key, no spend, CI-safe.
 * Re-run + refresh the fixture (node --env-file=.env … evals/live-smoke.test.ts) if it changes.
 */
describe("live-samples fixture — recorded real-Gemini run, regression-locked", () => {
  it("has rows and recorded total spend under the $5 cap", () => {
    expect(liveSamples.rows.length).toBeGreaterThan(0);
    expect(liveSamples.provenance.total_cost_usd).toBeLessThanOrEqual(5);
    expect(liveSamples.provenance.total_cost_usd).toBeGreaterThan(0);
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

  it("the provenance mode counts match the rows (no drift between summary and data)", () => {
    const modes = liveSamples.rows.reduce<Record<string, number>>(
      (a, r) => ((a[r.mode] = (a[r.mode] ?? 0) + 1), a),
      {},
    );
    expect(modes).toEqual(liveSamples.provenance.modes);
  });
});
