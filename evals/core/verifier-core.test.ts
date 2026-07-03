import { describe, expect, it } from "vitest";
import { SEVERITY_LEVELS, VERIFIER_CORE_STATUS } from "@/lib/verifier-core";

/**
 * Barrel smoke — asserts the verifier-core module loads and exposes its runtime
 * surface. The engine's behavior tests live in verifier-engine.test.ts.
 */
describe("verifier-core barrel", () => {
  it("loads the verifier-core barrel at the W1 stage marker", () => {
    expect(VERIFIER_CORE_STATUS).toBe("w1-wedge");
  });

  it("exposes the severity ladder (info -> warn -> error)", () => {
    expect(SEVERITY_LEVELS).toEqual(["info", "warn", "error"]);
  });
});
