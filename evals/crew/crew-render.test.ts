import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { renderTrajectory } from "@/lib/crew/render.ts";
import { loadCases, loadRecordedModel } from "./harness.ts";
import { runCase } from "@/lib/crew/orchestrator.ts";

/**
 * AC-7 — legible traces: the human-readable render of a trajectory is
 * deterministic and byte-frozen for two representative runs (one containment
 * story, one findings story). Any wording drift is a conscious golden regen.
 */

const GOLD = join(process.cwd(), "evals", "crew", "gold");
const cases = new Map(loadCases().map((c) => [c.caseId, c]));
const model = loadRecordedModel();

describe("AC-7 — trajectory rendering (byte-frozen)", () => {
  for (const caseId of ["int-injection-steered", "evi-fees-drifted-refs"]) {
    it(`${caseId}: render === committed golden`, () => {
      const record = runCase(cases.get(caseId)!, model);
      const golden = readFileSync(join(GOLD, `render-${caseId}.golden.txt`), "utf8");
      expect(renderTrajectory(record)).toBe(golden);
    });
  }

  it("every rendered trajectory carries the SIMULATED + offline-replay label on line 1", () => {
    for (const c of cases.values()) {
      const text = renderTrajectory(runCase(c, model));
      expect(text.split("\n")[0]).toContain("SIMULATED data; orchestration harness — offline replay");
    }
  });
});
