import { afterEach, describe, it, expect } from "vitest";
import {
  assertConfiguredModelAvailable,
  estimateLiveCallCostUsd,
  liveGenerationOptions,
  LIVE_THINKING_BUDGET_TOKENS,
  resolvedGeminiModel,
} from "@/lib/agents/gemini";
import { costUsd } from "@/lib/agents/pricing";

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

  it("reserves reasoning tokens so it upper-bounds completion+reasoning even if thinkingBudget is ignored (Codex confirming P1)", () => {
    const model = "gemini-2.5-flash";
    // Worst-case billable output = MAX_LIVE_OUTPUT_TOKENS (4096) completion + the model's documented
    // max thinking budget (24576). Reasoning is NOT bounded by maxOutputTokens, so the estimate must
    // reserve it separately or it under-prices the thinkingBudget-ignored path.
    const worstCaseActual = costUsd(model, 2_000, 4_096 + 24_576);
    expect(estimateLiveCallCostUsd(model)).toBeGreaterThanOrEqual(worstCaseActual);
    // ...and it must exceed an output-only reservation — proving reasoning really is reserved (this
    // FAILS if the estimate goes back to MAX_LIVE_OUTPUT_TOKENS alone).
    expect(estimateLiveCallCostUsd(model)).toBeGreaterThan(costUsd(model, 2_000, 4_096));
  });
});

describe("liveGenerationOptions — drafter-reliability fix is wired (A3-7)", () => {
  // The default `generate` closure only runs LIVE, so the thinking-disable + output-ceiling wiring
  // can't be exercised offline THROUGH a real call. Proving it via this pure builder is how the fix
  // is verified at $0; the live effect (parse rate recovers) is the owner-gated slice-2 re-run.
  it("disables Gemini 2.5 thinking for structured drafting (thinkingBudget=0)", () => {
    const opts = liveGenerationOptions();
    expect(LIVE_THINKING_BUDGET_TOKENS).toBe(0);
    expect(opts.providerOptions.google.thinkingConfig.thinkingBudget).toBe(0);
    expect(opts.providerOptions.google.thinkingConfig.includeThoughts).toBe(false);
  });

  it("keeps a generous output ceiling so JSON can finish even if thinkingBudget is ignored", () => {
    // Insurance for the reported "model ignores thinkingBudget=0" case: room for reasoning + the JSON.
    expect(liveGenerationOptions().maxOutputTokens).toBe(4096);
  });

  it("disables SDK retries so one reservation maps to one billed provider attempt (Codex P1)", () => {
    // The AI SDK default maxRetries=2 would let ONE estimate reserve cover up to 3 billed attempts,
    // breaking the 1:1 reservation:attempt accounting. (A soft-budget/input overflow above the
    // reservation is bounded by the orchestrator's post-call budget_overflow stop, not by this flag.)
    expect(liveGenerationOptions().maxRetries).toBe(0);
  });
});
