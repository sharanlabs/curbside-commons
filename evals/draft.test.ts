import { describe, it, expect } from "vitest";
import { normalizeRow, makeDraft } from "@/lib/core/pipeline";
import type { MerchantInput } from "@/lib/core/types";
import { costUsd } from "@/lib/agents/pricing";
import { resolvedGeminiModel, type AgentRunUsage } from "@/lib/agents/gemini";
import { draftOutreach, mockDraft } from "@/lib/agents/draft";

const input: MerchantInput = {
  merchant_name: "Curry In A Hurry",
  merchant_category: "Restaurant",
  days_since_signup: 20,
  last_login_days_ago: 10,
  steps_completed: 2, // -> photos_needed / add_photos
  source_risk_level: "Medium",
};
const merchant = normalizeRow(input, 1);

/** A schema-valid generated draft, parameterized so tests can corrupt one field. */
function validGenerated(overrides: Record<string, unknown> = {}) {
  return {
    risk_explanation: `${merchant.merchant_name} has completed 2 of 5 steps.`,
    blocker_summary: "Current blocker: photos_needed.",
    next_best_action: merchant.next_best_action,
    draft_subject: "Your next onboarding step",
    draft_body: "Hi, your next step is to add photos of your items.",
    claims: [{ field: "steps_completed", value: 2 }],
    ...overrides,
  };
}
const usage: AgentRunUsage = { inputTokens: 1000, outputTokens: 200, totalTokens: 1200, finishReason: "stop" };
// The live path now REQUIRES an explicit budget ledger (no silent spentUsd:0 default).
const budget = { spentUsd: 0, estimatedNextUsd: 0.01 };

describe("mockDraft — deterministic stub with verifiable claims", () => {
  it("reproduces the core draft text and derives claims from real merchant fields", () => {
    const d = mockDraft(merchant);
    expect(d.draft_body).toBe(makeDraft(merchant).draft_body);
    expect(d.claims).toEqual([
      { field: "steps_completed", value: 2 },
      { field: "total_steps", value: 5 },
      { field: "current_blocker_code", value: "photos_needed" },
      { field: "next_best_action", value: "add_photos" },
    ]);
  });
});

describe("draftOutreach — mode taxonomy, cost, fail-closed budget", () => {
  it("defaults to the deterministic path (no spend, no network)", async () => {
    const res = await draftOutreach(merchant);
    expect(res.mode).toBe("DETERMINISTIC_RULES");
    expect(res.costUsd).toBe(0);
    expect(res.modelId).toBe("deterministic-rules");
    expect(res.draft.claims.length).toBe(4);
  });

  it("LIVE_AI on a valid generated object; cost from reported tokens", async () => {
    let called = false;
    const generate = async () => {
      called = true;
      return { object: validGenerated(), usage };
    };
    const res = await draftOutreach(merchant, { generate, budget });
    expect(called).toBe(true);
    expect(res.mode).toBe("LIVE_AI");
    expect(res.modelId).toBe(resolvedGeminiModel());
    expect(res.costUsd).toBeCloseTo(costUsd(resolvedGeminiModel(), 1000, 200), 10);
    expect(res.draft.next_best_action).toBe("add_photos");
    expect(res.draft.model_version).toBe(resolvedGeminiModel());
  });

  it("FAILED_TO_FALLBACK on an unparseable object — but the billed cost is still accounted", async () => {
    const generate = async () => ({ object: validGenerated({ draft_body: undefined }), usage });
    const res = await draftOutreach(merchant, { generate, budget });
    expect(res.mode).toBe("FAILED_TO_FALLBACK");
    expect(res.errorClass).toBe("UNPARSEABLE_DRAFT");
    // The live call BILLED before the parse failed → its cost is recorded (not $0), so
    // cumulative budget enforcement stays honest. The draft itself is the stub fallback.
    expect(res.costUsd).toBeCloseTo(costUsd(resolvedGeminiModel(), 1000, 200), 10);
    expect(res.draft.draft_body).toBe(makeDraft(merchant).draft_body); // stub answered
  });

  it("FAILED_TO_FALLBACK when the live call throws", async () => {
    const generate = async () => {
      throw new Error("network down");
    };
    const res = await draftOutreach(merchant, { generate, budget });
    expect(res.mode).toBe("FAILED_TO_FALLBACK");
    expect(res.errorClass).toContain("network down");
  });

  it("budget hard-stop blocks the call BEFORE it can bill", async () => {
    let called = false;
    const generate = async () => {
      called = true;
      return { object: validGenerated(), usage };
    };
    const res = await draftOutreach(merchant, {
      generate,
      budget: { spentUsd: 5, estimatedNextUsd: 1 },
    });
    expect(called).toBe(false); // never invoked
    expect(res.mode).toBe("FAILED_TO_FALLBACK");
    expect(res.errorClass).toContain("Budget hard-stop");
  });

  it("fail-closed: the live path with no budget ledger does NOT call (no silent spentUsd:0)", async () => {
    let called = false;
    const generate = async () => {
      called = true;
      return { object: validGenerated(), usage };
    };
    const res = await draftOutreach(merchant, { generate }); // no budget
    expect(called).toBe(false);
    expect(res.mode).toBe("FAILED_TO_FALLBACK");
    expect(res.errorClass).toBe("NO_BUDGET_LEDGER");
    expect(res.costUsd).toBe(0);
  });
});
