import { describe, expect, it } from "vitest";
import { SEVERITY_LEVELS, VERIFIER_CORE_STATUS } from "@/lib/verifier-core";

/**
 * W0 placeholder — asserts the verifier-core skeleton module loads and exposes
 * its runtime surface, so evals/core is a real (tracked) directory. Real
 * comparator tests land in W1.
 */
describe("verifier-core skeleton (W0)", () => {
  it("loads the verifier-core barrel", () => {
    expect(VERIFIER_CORE_STATUS).toBe("skeleton-w0");
  });

  it("exposes the severity ladder (info -> warn -> error)", () => {
    expect(SEVERITY_LEVELS).toEqual(["info", "warn", "error"]);
  });
});
