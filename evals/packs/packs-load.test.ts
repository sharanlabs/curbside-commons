import { describe, expect, it } from "vitest";
import { LISTINGS_PACK } from "@/lib/packs/listings";
import { FEES_PACK } from "@/lib/packs/fees";

/**
 * W0 placeholder — asserts the listings (UC-2) and fees (UC-1) pack skeletons
 * load and enumerate their plan §7 classes, so evals/packs is a real (tracked)
 * directory. Real pack detector/classifier tests land in W1 / F1.
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
