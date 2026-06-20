import { describe, it, expect } from "vitest";
import { assertWithinBudget, BudgetExceededError } from "@/lib/agents/budget";

describe("assertWithinBudget — fail-closed gate", () => {
  it("allows a valid under-cap call", () => {
    expect(() => assertWithinBudget(1, 1, 5)).not.toThrow();
  });

  it("blocks a would-breach call", () => {
    expect(() => assertWithinBudget(4.5, 1, 5)).toThrow(BudgetExceededError);
  });

  it("rejects negative spend or estimate (garbage in -> fail closed)", () => {
    expect(() => assertWithinBudget(-1, 1, 5)).toThrow(BudgetExceededError);
    expect(() => assertWithinBudget(1, -1, 5)).toThrow(BudgetExceededError);
  });

  it("rejects a non-finite spend/estimate", () => {
    expect(() => assertWithinBudget(Number.NaN, 1, 5)).toThrow(BudgetExceededError);
    expect(() => assertWithinBudget(1, Number.POSITIVE_INFINITY, 5)).toThrow(BudgetExceededError);
  });

  it("rejects a non-positive or non-finite cap", () => {
    expect(() => assertWithinBudget(0, 1, 0)).toThrow(BudgetExceededError);
    expect(() => assertWithinBudget(0, 1, -5)).toThrow(BudgetExceededError);
    expect(() => assertWithinBudget(0, 1, Number.NaN)).toThrow(BudgetExceededError);
  });
});
