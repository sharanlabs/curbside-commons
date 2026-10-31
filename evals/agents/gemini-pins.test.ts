import { afterEach, describe, expect, it, vi } from "vitest";
import { estimateLiveCallCostUsd, resolvedGeminiModel } from "@/lib/agents/gemini";
import { costUsd, GEMINI_PRICING, PRICING_VERSION } from "@/lib/agents/pricing";

/**
 * Wave 1 / S1-pins — the Gemini model + price pins (plan docs/plan-menu-integrity-crew-
 * 2026-10-09.md § 8 and § 12 S1). Offline, $0, no network: this pins the NAMES and NUMBERS
 * the cost ledger and the budget guard stand on, so a re-pin is always an explicit,
 * test-visible migration and never a silent edit.
 *
 * Sources (RULES §6, read 2026-10-12): https://ai.google.dev/gemini-api/docs/pricing and
 * https://ai.google.dev/gemini-api/docs/models. Paid-tier STANDARD per-1M-token text prices.
 *
 * RED-BEFORE PROOF (measured 2026-10-31 01:14, Wave 1 acceptance review): changing
 * gemini-3.5-flash-lite outputPerMillionUsd 2.5 -> 2.6 in lib/agents/pricing.ts turned 2 tests red
 * ("gemini-3.5-flash-lite (the default) is priced $0.30 in / $2.50 out per 1M" and "costUsd prices
 * both current models..."); restored byte-exact -> green.
 * 2026-10-31 (S2-ledger): PRICING_VERSION assertion follows the bump to "2026-10-31" (new $0 rows only).
 */

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("S1-pins — the pinned price list", () => {
  it("PRICING_VERSION is the 2026-10-31 pin (new $0 free-tier rows only; paid prices unchanged, last re-verified 2026-10-12)", () => {
    expect(PRICING_VERSION).toBe("2026-10-31");
  });

  it("gemini-3.5-flash-lite (the default) is priced $0.30 in / $2.50 out per 1M", () => {
    expect(GEMINI_PRICING["gemini-3.5-flash-lite"]).toEqual({
      inputPerMillionUsd: 0.3,
      outputPerMillionUsd: 2.5,
    });
  });

  it("gemini-3.8-flash (the override) is priced at the CURRENT $0.75 in / $3.75 out per 1M", () => {
    expect(GEMINI_PRICING["gemini-3.8-flash"]).toEqual({
      inputPerMillionUsd: 0.75,
      outputPerMillionUsd: 3.75,
    });
  });

  it("the restricted-to-prior-users 2.5 rows the docs still list keep their documented prices", () => {
    expect(GEMINI_PRICING["gemini-2.5-flash"]).toEqual({ inputPerMillionUsd: 0.3, outputPerMillionUsd: 2.5 });
    expect(GEMINI_PRICING["gemini-2.5-flash-lite"]).toEqual({ inputPerMillionUsd: 0.1, outputPerMillionUsd: 0.4 });
    expect(GEMINI_PRICING["gemini-2.5-pro"]).toEqual({ inputPerMillionUsd: 1.25, outputPerMillionUsd: 10 });
  });

  it("costUsd prices both current models, bare or `models/`-prefixed, from API-reported tokens", () => {
    // 1M in + 1M out at each model's pinned price.
    expect(costUsd("gemini-3.5-flash-lite", 1_000_000, 1_000_000)).toBeCloseTo(2.8, 10);
    expect(costUsd("models/gemini-3.8-flash", 1_000_000, 1_000_000)).toBeCloseTo(4.5, 10);
  });

  it("costUsd still fails loud on an unpinned model (never silently $0)", () => {
    expect(() => costUsd("gemini-9.9-imaginary", 10, 10)).toThrow(/not in the pinned pricing table/);
  });
});

describe("S1-pins — the model default and its override", () => {
  it("defaults to gemini-3.5-flash-lite when GEMINI_MODEL is unset", () => {
    vi.stubEnv("GEMINI_MODEL", "");
    expect(resolvedGeminiModel()).toBe("gemini-3.5-flash-lite");
  });

  it("GEMINI_MODEL=gemini-3.8-flash overrides the default", () => {
    vi.stubEnv("GEMINI_MODEL", "gemini-3.8-flash");
    expect(resolvedGeminiModel()).toBe("gemini-3.8-flash");
  });

  it("the default and the documented override are both in the price table (the budget guard can price them)", () => {
    vi.stubEnv("GEMINI_MODEL", "");
    expect(GEMINI_PRICING[resolvedGeminiModel()]).toBeDefined();
    expect(GEMINI_PRICING["gemini-3.8-flash"]).toBeDefined();
    expect(() => estimateLiveCallCostUsd(resolvedGeminiModel())).not.toThrow();
  });
});
