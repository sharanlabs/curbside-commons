import { describe, it, expect } from "vitest";
import { normalizeRow, runCore } from "@/legacy/activation/lib/core/pipeline";
import type { MerchantInput } from "@/legacy/activation/lib/core/types";
import { mockDraft } from "@/legacy/activation/lib/agents/draft";
import { getHybridMerchants } from "@/legacy/activation/lib/ingest/hybrid";
import { scoreDraft, scoreDraftCorpus } from "@/legacy/activation/lib/evals/draft-quality";
import { registerLeakFailures } from "@/legacy/activation/lib/agents/state-consistency";

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
  it("a clean mock draft passes all four dimensions", () => {
    const s = scoreDraft(mockDraft(merchant), merchant);
    expect(s.pass).toBe(true);
    expect(s.passed).toBe(4);
    expect(s.results.map((r) => r.grader).sort()).toEqual([
      "no-leakage",
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

  it("no-leakage: a leaked internal enum or risk level in the body fails that grader", () => {
    const d = mockDraft(merchant);
    d.draft_body = "Hi there — the current blocker is bank_verification_needed; this is a High Risk item.";
    const s = scoreDraft(d, merchant);
    const leak = s.results.find((r) => r.grader === "no-leakage");
    expect(leak?.pass).toBe(false);
    expect(leak?.failures.join(" ")).toContain("no-leakage:");
  });
});

describe("registerLeakFailures — allow/deny coverage (the no-leakage detector's teeth)", () => {
  it("DENIES a known internal identifier in any form (snake / UPPER / camel / kebab) + risk disclosures", () => {
    const deny = [
      "the current blocker is bank_verification_needed.",
      "BANK_VERIFICATION_NEEDED is set",
      "status: bankVerificationNeeded",
      "blocker bank-verification-needed pending",
      "internal current_blocker_code reads ...",
      "your account is flagged as High Risk",
      "this is a medium-risk item",
      "risk: High",
      "the risk is high here",
      "risk=high",
    ];
    for (const s of deny) {
      expect(registerLeakFailures(s).length, s).toBeGreaterThan(0);
    }
  });

  it("ALLOWS benign prose: separator words not in the denylist + natural phrasings of the same words", () => {
    const allow = [
      "Welcome to Tacos_To_Go!", // underscore name, not an internal token
      "We're a family-owned shop.", // hyphenated word
      "Finish your sign-up to continue.", // hyphenated word
      "Your bank verification is needed to go live.", // natural words, NOT the joined identifier
      "Please add photos and set your business hours.", // humanized actions
      "There is no risk to getting started.", // "risk" without a level disclosure
    ];
    for (const s of allow) {
      expect(registerLeakFailures(s), s).toEqual([]);
    }
  });
});
