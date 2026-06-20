import { describe, it, expect } from "vitest";
import { normalizeRow } from "@/lib/core/pipeline";
import type { MerchantInput } from "@/lib/core/types";
import { estimateLiveCallCostUsd, resolvedGeminiModel, type AgentRunUsage } from "@/lib/agents/gemini";
import { draftBatchLive } from "@/lib/agents/live-batch";

const merchants = [0, 1, 2].map((i) =>
  normalizeRow(
    {
      merchant_name: `Merchant ${i}`,
      merchant_category: "Restaurant",
      days_since_signup: 10 + i,
      last_login_days_ago: 3,
      steps_completed: i % 6,
      source_risk_level: "Medium",
    } satisfies MerchantInput,
    i + 1,
  ),
);

const usage: AgentRunUsage = { inputTokens: 1000, outputTokens: 200, totalTokens: 1200, finishReason: "stop" };
const generate = async () => ({
  object: {
    risk_explanation: "Stalled in onboarding.",
    blocker_summary: "Current blocker.",
    next_best_action: "add_photos",
    draft_subject: "Your next step, {{MERCHANT}}",
    draft_body: "Hi {{MERCHANT}}, please add photos of your items.",
    claims: [{ field: "steps_completed", value: 1 }],
  },
  usage,
});

describe("live-batch — cumulative ledger holds the $5 cap across the run", () => {
  it("threads cumulative spend; processes all under a generous cap", async () => {
    const res = await draftBatchLive(merchants, { generate, capUsd: 5 });
    expect(res.processed).toBe(3);
    expect(res.stoppedEarly).toBe(false);
    expect(res.rows.every((r) => r.result.mode === "LIVE_AI")).toBe(true);
    expect(res.totalCostUsd).toBeGreaterThan(0);
    // total == sum of per-call costs (cumulative accounting)
    const sum = res.rows.reduce((a, r) => a + r.result.costUsd, 0);
    expect(res.totalCostUsd).toBeCloseTo(sum, 10);
  });

  it("stops BEFORE a call that would breach the cumulative cap (fail-closed)", async () => {
    // Cap == one call's estimate: the first call fits exactly, the second would breach.
    const cap = estimateLiveCallCostUsd(resolvedGeminiModel());
    const res = await draftBatchLive(merchants, { generate, capUsd: cap });
    expect(res.processed).toBe(1);
    expect(res.stoppedEarly).toBe(true);
    expect(res.requested).toBe(3);
    expect(res.totalCostUsd).toBeLessThanOrEqual(cap);
  });
});
