import { afterEach, describe, it, expect } from "vitest";
import {
  assertConfiguredModelAvailable,
  estimateLiveCallCostUsd,
  resolvedGeminiModel,
} from "@/lib/agents/gemini";

const ORIG = process.env.GEMINI_MODEL;
afterEach(() => {
  if (ORIG === undefined) delete process.env.GEMINI_MODEL;
  else process.env.GEMINI_MODEL = ORIG;
});

describe("resolvedGeminiModel", () => {
  it("defaults to the GA model and honors a GEMINI_MODEL override", () => {
    delete process.env.GEMINI_MODEL;
    expect(resolvedGeminiModel()).toBe("gemini-2.5-flash");
    process.env.GEMINI_MODEL = "gemini-2.5-flash-lite";
    expect(resolvedGeminiModel()).toBe("gemini-2.5-flash-lite");
    process.env.GEMINI_MODEL = "  "; // whitespace falls back to the default
    expect(resolvedGeminiModel()).toBe("gemini-2.5-flash");
  });
});

describe("assertConfiguredModelAvailable — model preflight (DI, no network)", () => {
  it("does NOT list models (no fetch) when live AI is disabled", async () => {
    let called = false;
    await assertConfiguredModelAvailable({
      enabled: () => false,
      model: () => "gemini-2.5-flash",
      listModels: async () => {
        called = true;
        return [];
      },
    });
    expect(called).toBe(false);
  });

  it("resolves when the configured model is available (normalizing the models/ prefix)", async () => {
    await expect(
      assertConfiguredModelAvailable({
        enabled: () => true,
        model: () => "gemini-2.5-flash",
        listModels: async () => ["models/gemini-2.5-flash", "models/gemini-2.5-pro"],
      }),
    ).resolves.toBeUndefined();
  });

  it("FAILS LOUD when the configured model is not available", async () => {
    await expect(
      assertConfiguredModelAvailable({
        enabled: () => true,
        model: () => "gemini-9.9-ultra",
        listModels: async () => ["models/gemini-2.5-flash"],
      }),
    ).rejects.toThrow(/not available/i);
  });
});

describe("estimateLiveCallCostUsd", () => {
  it("returns a positive upper-bound estimate for a known model", () => {
    expect(estimateLiveCallCostUsd("gemini-2.5-flash")).toBeGreaterThan(0);
  });
});
