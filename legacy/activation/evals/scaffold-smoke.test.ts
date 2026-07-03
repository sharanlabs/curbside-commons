import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("scaffold smoke", () => {
  it("runs the test harness", () => {
    expect(1 + 1).toBe(2);
  });

  it("cn merges conflicting tailwind classes (last wins)", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });
});
