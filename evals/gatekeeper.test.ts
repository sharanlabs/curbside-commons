import { describe, it, expect } from "vitest";
import { normalizeRow } from "@/lib/core/pipeline";
import type { MerchantInput } from "@/lib/core/types";
import { mockDraft } from "@/lib/agents/draft";
import { runGatekeeper } from "@/lib/agents/gatekeeper";

function merchantWith(overrides: Partial<MerchantInput>, idx = 1) {
  const input: MerchantInput = {
    merchant_name: "Folklore",
    merchant_category: "Retail",
    days_since_signup: 5,
    last_login_days_ago: 2,
    steps_completed: 5, // -> complete_final_verification
    source_risk_level: "Low",
    ...overrides,
  };
  return normalizeRow(input, idx);
}

const clean = merchantWith({});
const high = merchantWith({ steps_completed: 1, source_risk_level: "High" }, 2);

describe("gatekeeper — clean drafts", () => {
  it("PASS on a clean draft for a non-review merchant; approved for the human gate", () => {
    const r = runGatekeeper(mockDraft(clean), clean);
    expect(r.status).toBe("PASS");
    expect(r.failures).toEqual([]);
    expect(r.guardrailFlags).toEqual([]);
    expect(r.approvedForHumanReview).toBe(true);
  });

  it("WARN (not block) on a clean draft for a held-for-review merchant", () => {
    const r = runGatekeeper(mockDraft(high), high);
    expect(r.status).toBe("WARN");
    expect(r.approvedForHumanReview).toBe(true);
    expect(r.warnings.join(" ")).toContain("held for human review");
  });
});

describe("gatekeeper — corrupted drafts each BLOCK (teeth, not theater)", () => {
  it("blocks a claim whose value does not match the merchant data", () => {
    const d = mockDraft(clean);
    d.claims.push({ field: "steps_completed", value: 99 });
    const r = runGatekeeper(d, clean);
    expect(r.status).toBe("BLOCKED");
    expect(r.approvedForHumanReview).toBe(false);
    expect(r.failures.join(" ")).toContain("steps_completed");
  });

  it("blocks a claim citing an unverifiable field", () => {
    const d = mockDraft(clean);
    d.claims.push({ field: "projected_revenue", value: 1000 });
    const r = runGatekeeper(d, clean);
    expect(r.status).toBe("BLOCKED");
    expect(r.failures.join(" ")).toContain("unverifiable field");
  });

  it("blocks a forbidden revenue/impact claim in the body", () => {
    const d = mockDraft(clean);
    d.draft_body = "We guarantee you'll earn $5000 more in sales next month.";
    const r = runGatekeeper(d, clean);
    expect(r.status).toBe("BLOCKED");
    expect(r.failures.join(" ")).toContain("guardrail:");
  });

  it("blocks a draft claiming a step the merchant has not reached (state_mismatch prose)", () => {
    const m = merchantWith({ steps_completed: 1, source_risk_level: "Low" }, 3); // menu not yet done
    const d = mockDraft(m);
    d.draft_body = "Great news — your menu is uploaded and live. Thanks!";
    const r = runGatekeeper(d, m);
    expect(r.status).toBe("BLOCKED");
    expect(r.failures.join(" ")).toContain("guardrail:state_mismatch");
  });

  it("blocks a draft whose action contradicts the computed next-best-action", () => {
    const d = mockDraft(clean); // merchant action = complete_final_verification
    d.next_best_action = "upload_menu";
    const r = runGatekeeper(d, clean);
    expect(r.status).toBe("BLOCKED");
    expect(r.failures.join(" ")).toContain("guardrail:state_mismatch");
  });

  it("blocks a draft leaking an internal identifier / risk level into merchant-facing prose", () => {
    const d = mockDraft(clean);
    d.draft_body = "Hi — the current blocker is bank_verification_needed; this is a High Risk item.";
    const r = runGatekeeper(d, clean);
    expect(r.status).toBe("BLOCKED");
    expect(r.approvedForHumanReview).toBe(false);
    expect(r.failures.join(" ")).toContain("register-leak");
  });
});

describe("gatekeeper — live-phrasing precision (the 2026-06-20 live-run fix)", () => {
  const step0 = merchantWith({ steps_completed: 0, source_risk_level: "Low" }, 7); // business_verification

  it("does NOT block a truthful imperative ('complete business verification')", () => {
    const d = mockDraft(step0); // action = verify_business (matches)
    d.draft_body = "Hi, to get live, please complete business verification. You have completed 0 of 5 steps.";
    const r = runGatekeeper(d, step0);
    expect(r.status).toBe("PASS");
    expect(r.failures.join(" ")).not.toContain("state_mismatch");
  });

  it("STILL blocks a real completion claim ('your business is verified') the merchant hasn't reached", () => {
    const d = mockDraft(step0);
    d.draft_body = "Great — your business is verified and you're all set. Thanks!";
    const r = runGatekeeper(d, step0);
    expect(r.status).toBe("BLOCKED");
    expect(r.failures.join(" ")).toContain("guardrail:state_mismatch");
  });
});
