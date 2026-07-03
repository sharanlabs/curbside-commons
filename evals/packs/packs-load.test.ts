import { describe, expect, it } from "vitest";
import { LISTINGS_PACK } from "@/lib/packs/listings";
import { FEES_PACK } from "@/lib/packs/fees";

/**
 * Pack-load smoke — asserts the listings (UC-2) and fees (UC-1) pack descriptors
 * load and enumerate their plan §7 classes. The listings pack's real behavior is
 * exercised by the W1 wedge evals + the W2 conformance evals (listings-*.test.ts,
 * ucp-conformance.test.ts, acp-field-rules.test.ts); the fees (UC-1) detectors
 * still land in F1.
 */
describe("verifier packs skeleton (W0)", () => {
  it("listings pack (UC-2) loads with its §7 drift classes", () => {
    expect(LISTINGS_PACK.useCase).toBe("UC-2");
    expect(LISTINGS_PACK.classes.length).toBeGreaterThan(0);
  });

  it("fees pack (UC-1) loads with its §7 fee-line classes", () => {
    expect(FEES_PACK.useCase).toBe("UC-1");
    expect(FEES_PACK.classes.length).toBeGreaterThan(0);
  });
});
