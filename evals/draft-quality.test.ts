import { describe, it, expect } from "vitest";
import { normalizeRow, runCore } from "@/lib/core/pipeline";
import type { MerchantInput } from "@/lib/core/types";
import { mockDraft } from "@/lib/agents/draft";
import { getHybridMerchants } from "@/lib/ingest/hybrid";
import { scoreDraft, scoreDraftCorpus } from "@/lib/evals/draft-quality";

const merchant = normalizeRow(
  {
    merchant_name: "Silver Sprocket",
    merchant_category: "Retail",
    days_since_signup: 12,
    last_login_days_ago: 4,
    steps_completed: 3, // -> business_hours_needed / set_business_hours
    source_risk_level: "Medium",
  } satisfies MerchantInput,
  1,
);

describe("draft-quality eval — clean drafts score full marks", () => {
  it("a clean mock draft passes all three dimensions", () => {
    const s = scoreDraft(mockDraft(merchant), merchant);
    expect(s.pass).toBe(true);
    expect(s.passed).toBe(3);
    expect(s.results.map((r) => r.grader).sort()).toEqual([
      "policy",
      "state-consistency",
      "structure",
    ]);
  });

  it("the hybrid corpus of mock drafts scores clean (eval lane works end-to-end)", () => {
    const merchants = runCore(getHybridMerchants()).merchants;
    const summary = scoreDraftCorpus(merchants.map((m) => ({ merchant: m, draft: mockDraft(m) })));
    expect(summary.totalDrafts).toBe(20);
    expect(summary.allPass).toBe(true);
    expect(summary.passedDrafts).toBe(20);
  });

  it("an EMPTY corpus is NOT a vacuous pass", () => {
    const summary = scoreDraftCorpus([]);
    expect(summary.totalDrafts).toBe(0);
    expect(summary.allPass).toBe(false);
  });
});

describe("draft-quality eval — each dimension's teeth bite a planted corruption", () => {
  it("structure: an empty body fails the structure grader (others can still pass)", () => {
    const d = mockDraft(merchant);
    d.draft_body = "";
    const s = scoreDraft(d, merchant);
    expect(s.pass).toBe(false);
    expect(s.results.find((r) => r.grader === "structure")?.pass).toBe(false);
  });

  it("state-consistency: a mismatched claim fails that grader", () => {
    const d = mockDraft(merchant);
    d.claims.push({ field: "steps_completed", value: 0 });
    const s = scoreDraft(d, merchant);
    expect(s.results.find((r) => r.grader === "state-consistency")?.pass).toBe(false);
  });

  it("policy: a forbidden impact claim fails the policy grader", () => {
    const d = mockDraft(merchant);
    d.draft_body = "Sign up now — boost your sales by 30% and earn $1000 more!";
    const s = scoreDraft(d, merchant);
    const policy = s.results.find((r) => r.grader === "policy");
    expect(policy?.pass).toBe(false);
    expect(policy?.failures.join(" ")).toContain("policy:");
  });
});
