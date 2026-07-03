/**
 * Unit tests for the domain-quality ("Effective"-axis) judge (Track B1, B1b).
 *
 * Covers: the deterministic MOCK judge's per-dimension behavior (matched / engagement / over-promise);
 * the "never trust the model's aggregate" recompute; the fail-closed live path (no ledger ⇒ fallback);
 * and the R-DARCH-2 lock — the judge's runtime input (situation + prompt) must NOT leak the
 * pre-computed correct play (`diagnose().play`), or calibration is a string-compare wrapper.
 */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { normalizeRow } from "@/legacy/activation/lib/core/pipeline";
import { domainJudgeLiveEnabled } from "@/lib/server/env-flags";
import type { Merchant, MerchantInput } from "@/legacy/activation/lib/core/types";
import { mockDraft, type OutreachDraft } from "@/legacy/activation/lib/agents/draft";
import { engagementState } from "@/legacy/activation/lib/domain/diagnosis";
import { domainSituation } from "@/legacy/activation/lib/domain/effective-rubric";
import {
  mockDomainJudge,
  judgeDomain,
  buildDomainJudgePrompt,
  dimensionPassMap,
} from "@/legacy/activation/lib/agents/domain-judge";

function merchant(input: MerchantInput, idx = 200): Merchant {
  return normalizeRow(input, idx);
}

/** Recently active, blocked at the photos step — a step nudge is the appropriate play. */
const activelyStuck = merchant(
  { merchant_name: "Test Bistro", merchant_category: "Restaurant", days_since_signup: 18, last_login_days_ago: 2, steps_completed: 2, source_risk_level: "Medium" },
  201,
);
/** Inactive + barely started — needs re-engagement first, not a bare step nudge. */
const ghosted = merchant(
  { merchant_name: "Quiet Cafe", merchant_category: "Restaurant", days_since_signup: 24, last_login_days_ago: 12, steps_completed: 1, source_risk_level: "High" },
  202,
);

/** Replace the body of a grounded matched draft (keeps the valid claims, so the gatekeeper still passes). */
const withBody = (m: Merchant, body: string): OutreachDraft => ({ ...mockDraft(m), draft_body: body });

describe("mockDomainJudge — per-dimension structure", () => {
  it("returns exactly one verdict per rubric dimension, each with a rationale", () => {
    const v = mockDomainJudge(mockDraft(activelyStuck), activelyStuck);
    expect(v.dimensions.map((d) => d.dimension).sort()).toEqual([
      "engagement_appropriate",
      "matched_to_blocker",
      "no_over_promise",
    ]);
    expect(v.dimensions.every((d) => d.rationale.length > 0)).toBe(true);
  });

  it("passes a matched, engagement-appropriate, non-over-promising draft (clean negative)", () => {
    const v = mockDomainJudge(mockDraft(activelyStuck), activelyStuck);
    expect(v.domain_defective).toBe(false);
    expect(dimensionPassMap(v)).toEqual({
      matched_to_blocker: true,
      engagement_appropriate: true,
      no_over_promise: true,
    });
  });
});

describe("mockDomainJudge — catches each defect class", () => {
  it("matched_to_blocker FAILS on a generic draft that ignores the known blocker", () => {
    const generic = withBody(activelyStuck, "Welcome! Complete your setup to get started on our marketplace.");
    const v = mockDomainJudge(generic, activelyStuck);
    expect(dimensionPassMap(v).matched_to_blocker).toBe(false);
    expect(v.domain_defective).toBe(true);
  });

  it("engagement_appropriate FAILS on a bare step nudge to a ghosted merchant", () => {
    expect(engagementState(ghosted)).toBe("ghosted");
    // A step-only nudge with no re-engagement/value framing.
    const bareNudge = withBody(ghosted, "Please add photos to your profile — that's your next onboarding step.");
    const v = mockDomainJudge(bareNudge, ghosted);
    expect(dimensionPassMap(v).engagement_appropriate).toBe(false);
  });

  it("engagement_appropriate PASSES when a ghosted merchant's draft leads with re-engagement/value", () => {
    const reengage = withBody(
      ghosted,
      "We noticed it's been a while — here's why getting your photos live is worth it, then the quick next step.",
    );
    const v = mockDomainJudge(reengage, ghosted);
    expect(dimensionPassMap(v).engagement_appropriate).toBe(true);
  });

  it("no_over_promise FAILS on implied/typicality phrasing that dodges the deterministic guardrail", () => {
    const overPromise = withBody(
      activelyStuck,
      "Add your photos — stores like yours quickly become neighborhood favorites.",
    );
    const v = mockDomainJudge(overPromise, activelyStuck);
    expect(dimensionPassMap(v).no_over_promise).toBe(false);
  });
});

describe("judgeDomain — live path (DI), recompute + fail-closed", () => {
  const budget = { spentUsd: 0, estimatedNextUsd: 0, capUsd: 5 } as const;

  it("recomputes domain_defective from the per-dimension passes, NOT the model's aggregate", async () => {
    // The model LIES: any_dimension_failed=false, but engagement_appropriate failed.
    const generate = async () => ({
      object: {
        dimensions: [
          { dimension: "matched_to_blocker", pass: true, rationale: "addresses the blocker" },
          { dimension: "engagement_appropriate", pass: false, rationale: "bare nudge to a quiet merchant" },
          { dimension: "no_over_promise", pass: true, rationale: "no hype" },
        ],
        any_dimension_failed: false,
      },
      usage: { inputTokens: 120, outputTokens: 40 },
    });
    const res = await judgeDomain(mockDraft(ghosted), ghosted, { live: true, budget, generate });
    expect(res.mode).toBe("LIVE_JUDGE");
    expect(res.costUsd).toBe(0); // Groq free tier
    expect(res.verdict.domain_defective).toBe(true); // recomputed, the model's `false` is ignored
  });

  it("fails closed (NO_BUDGET_LEDGER) when a live call has no budget ledger", async () => {
    const generate = async () => ({ object: { dimensions: [], any_dimension_failed: false } });
    const res = await judgeDomain(mockDraft(activelyStuck), activelyStuck, { live: true, generate });
    expect(res.mode).toBe("FAILED_TO_FALLBACK");
    expect(res.errorClass).toBe("NO_BUDGET_LEDGER");
  });

  it("falls back honestly (UNPARSEABLE_VERDICT) on a schema-invalid model object", async () => {
    const generate = async () => ({ object: { not: "a verdict" }, usage: { inputTokens: 10, outputTokens: 5 } });
    const res = await judgeDomain(mockDraft(activelyStuck), activelyStuck, { live: true, budget, generate });
    expect(res.mode).toBe("FAILED_TO_FALLBACK");
    expect(res.errorClass).toBe("UNPARSEABLE_VERDICT");
    // The fallback still returns a usable (mock) verdict — never goes dark.
    expect(res.verdict.dimensions.length).toBe(3);
  });

  // [Codex B1 P2-1] A schema-valid but PARTIAL verdict must NOT let an omitted failed dimension read as
  // passing. The judge must fail closed to the mock (all three), never accept the subset.
  it("falls back (INCOMPLETE_VERDICT) when the model OMITS a rubric dimension", async () => {
    const generate = async () => ({
      object: {
        // engagement_appropriate omitted — for a ghosted merchant that is exactly the dimension at risk.
        dimensions: [
          { dimension: "matched_to_blocker", pass: true, rationale: "addresses the blocker" },
          { dimension: "no_over_promise", pass: true, rationale: "no hype" },
        ],
        any_dimension_failed: false,
      },
      usage: { inputTokens: 100, outputTokens: 30 },
    });
    const res = await judgeDomain(mockDraft(ghosted), ghosted, { live: true, budget, generate });
    expect(res.mode).toBe("FAILED_TO_FALLBACK");
    expect(res.errorClass).toBe("INCOMPLETE_VERDICT");
    expect(res.verdict.dimensions.length).toBe(3); // mock assesses all three
  });

  it("falls back (INCOMPLETE_VERDICT) when duplicate dimensions normalize down to < 3", async () => {
    const generate = async () => ({
      object: {
        dimensions: [
          { dimension: "matched_to_blocker", pass: true, rationale: "ok" },
          { dimension: "matched_to_blocker", pass: false, rationale: "dup — first wins on normalize" },
          { dimension: "no_over_promise", pass: true, rationale: "ok" },
        ],
        any_dimension_failed: false,
      },
      usage: { inputTokens: 100, outputTokens: 30 },
    });
    const res = await judgeDomain(mockDraft(activelyStuck), activelyStuck, { live: true, budget, generate });
    expect(res.mode).toBe("FAILED_TO_FALLBACK");
    expect(res.errorClass).toBe("INCOMPLETE_VERDICT");
  });

  it("accepts a complete 3-dimension verdict (the guard does not over-reject)", async () => {
    const generate = async () => ({
      object: {
        dimensions: [
          { dimension: "matched_to_blocker", pass: true, rationale: "ok" },
          { dimension: "engagement_appropriate", pass: true, rationale: "ok" },
          { dimension: "no_over_promise", pass: true, rationale: "ok" },
        ],
        any_dimension_failed: false,
      },
      usage: { inputTokens: 100, outputTokens: 30 },
    });
    const res = await judgeDomain(mockDraft(activelyStuck), activelyStuck, { live: true, budget, generate });
    expect(res.mode).toBe("LIVE_JUDGE");
    expect(res.verdict.domain_defective).toBe(false);
  });
});

describe("R-DARCH-2 lock — situation-in, NOT answer-in", () => {
  it("domainSituation surfaces facts only — no play / root-cause keys", () => {
    const s = domainSituation(ghosted) as unknown as Record<string, unknown>;
    expect(Object.keys(s).sort()).toEqual([
      "blocker_label",
      "blocker_source",
      "current_blocker_code",
      "engagement_state",
      "merchant_category",
      "risk_level",
      "steps_completed",
      "total_steps",
    ]);
    expect("play" in s).toBe(false);
    expect("root_cause_hypothesis" in s).toBe(false);
  });

  it("the judge prompt does not leak the recommended tactic vocabulary", () => {
    const prompt = buildDomainJudgePrompt(domainSituation(ghosted), "Some draft prose.");
    // The diagnose() Touch vocabulary (the ANSWER) must never appear in the judge's input.
    for (const tactic of ["re_engagement", "ops_escalation", "self_serve_nudge", "high_touch"]) {
      expect(prompt).not.toContain(tactic);
    }
  });
});

describe("domainJudgeLiveEnabled — reads the DOMAIN_JUDGE_* namespace, not the faithfulness JUDGE_* [Codex B1 P2-2]", () => {
  const KEYS = ["ENABLE_LIVE_AI", "GROQ_API_KEY", "GEMINI_API_KEY", "JUDGE_PROVIDER", "DOMAIN_JUDGE_PROVIDER"] as const;
  let saved: Record<string, string | undefined>;
  beforeEach(() => {
    saved = {};
    for (const k of KEYS) saved[k] = process.env[k];
  });
  afterEach(() => {
    for (const k of KEYS) {
      if (saved[k] === undefined) delete process.env[k];
      else process.env[k] = saved[k];
    }
  });

  it("is off unless ENABLE_LIVE_AI is set (even with a provider + key)", () => {
    delete process.env.ENABLE_LIVE_AI;
    process.env.DOMAIN_JUDGE_PROVIDER = "groq";
    process.env.GROQ_API_KEY = "x";
    expect(domainJudgeLiveEnabled()).toBe(false);
  });

  it("the Gemini domain override is enabled by DOMAIN_JUDGE_PROVIDER + GEMINI_API_KEY (no Groq key) — the bug", () => {
    process.env.ENABLE_LIVE_AI = "true";
    delete process.env.GROQ_API_KEY;
    delete process.env.JUDGE_PROVIDER;
    process.env.DOMAIN_JUDGE_PROVIDER = "gemini";
    process.env.GEMINI_API_KEY = "x";
    // Before the fix this read JUDGE_PROVIDER (→ groq) and reported the domain override disabled.
    expect(domainJudgeLiveEnabled()).toBe(true);
  });

  it("the faithfulness JUDGE_PROVIDER does NOT leak into the domain judge's gate", () => {
    process.env.ENABLE_LIVE_AI = "true";
    delete process.env.GROQ_API_KEY;
    delete process.env.GEMINI_API_KEY;
    process.env.JUDGE_PROVIDER = "gemini"; // faithfulness namespace only
    delete process.env.DOMAIN_JUDGE_PROVIDER; // defaults to groq → needs GROQ_API_KEY (absent)
    expect(domainJudgeLiveEnabled()).toBe(false);
  });

  it("default provider (groq) is enabled by GROQ_API_KEY", () => {
    process.env.ENABLE_LIVE_AI = "true";
    delete process.env.DOMAIN_JUDGE_PROVIDER;
    delete process.env.GEMINI_API_KEY;
    process.env.GROQ_API_KEY = "x";
    expect(domainJudgeLiveEnabled()).toBe(true);
  });
});
