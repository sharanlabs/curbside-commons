import { describe, it, expect } from "vitest";
import { liveSamples } from "@/lib/replay/live-samples";

/**
 * Regression-lock the RECORDED live-Gemini run (the frozen fixture). The live model is
 * NON-deterministic, so this locks the STABLE invariants — shape, valid enums, accounting, and
 * gate↔eval↔provenance CONSISTENCY — NOT specific outcomes (mode split, gate verdicts, scores all
 * vary across a refresh; a true overclaim legitimately BLOCKs). Runs on the committed snapshot —
 * no key, no spend, CI-safe. Refresh with: node --env-file=.env … evals/live-smoke.test.ts.
 */
describe("live-samples fixture — recorded real-Gemini run, regression-locked", () => {
  it("has the stable shape: 6 rows (one per blocker), spend > 0 within the $5 cap", () => {
    expect(liveSamples.rows.length).toBe(6);
    expect(liveSamples.provenance.total_cost_usd).toBeGreaterThan(0);
    expect(liveSamples.provenance.total_cost_usd).toBeLessThanOrEqual(5);
  });

  it("total cost == sum of per-row cost (accounting integrity)", () => {
    const sum = liveSamples.rows.reduce((a, r) => a + r.costUsd, 0);
    expect(sum).toBeCloseTo(liveSamples.provenance.total_cost_usd, 5);
  });

  it("every row uses valid enums + has its fields populated", () => {
    for (const r of liveSamples.rows) {
      expect(["LIVE_AI", "FAILED_TO_FALLBACK"]).toContain(r.mode);
      expect(["PASS", "WARN", "BLOCKED"]).toContain(r.gatekeeper);
      expect(r.eval).toMatch(/^[0-3]\/3$/);
      expect(typeof r.blocker).toBe("string");
      expect(typeof r.subject).toBe("string");
      expect(typeof r.body).toBe("string");
      expect(typeof r.costUsd).toBe("number");
    }
  });

  it("gate verdicts are internally consistent (BLOCKED ⇒ has a recorded failure; PASS ⇒ none)", () => {
    for (const r of liveSamples.rows) {
      if (r.gatekeeper === "BLOCKED") expect(r.gateFailures.length).toBeGreaterThan(0);
      if (r.gatekeeper === "PASS") expect(r.gateFailures.length).toBe(0);
    }
  });

  it("every FAILED_TO_FALLBACK row degraded honestly: errorClass set + billed cost recorded (not $0)", () => {
    for (const r of liveSamples.rows.filter((r) => r.mode === "FAILED_TO_FALLBACK")) {
      expect(r.errorClass).toBeTruthy();
      expect(r.costUsd).toBeGreaterThan(0);
    }
  });

  it("provenance mode + gate counts match the rows (no summary↔data drift)", () => {
    const count = (key: "mode" | "gatekeeper") =>
      liveSamples.rows.reduce<Record<string, number>>((a, r) => {
        const k = key === "mode" ? r.mode : r.gatekeeper;
        return (a[k] = (a[k] ?? 0) + 1), a;
      }, {});
    expect(count("mode")).toEqual(liveSamples.provenance.modes);
    expect(count("gatekeeper")).toEqual(liveSamples.provenance.gate);
  });
});
