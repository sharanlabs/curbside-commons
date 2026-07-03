/**
 * A3-2a OFFLINE MACHINERY — the Strategist agent + its anti-theater eval (R-A3-1). NO spend,
 * deterministic + DI-mock LLM, isolates the strategy seam. Run offline (ZERO Groq calls):
 *   npx vitest run evals/strategist.test.ts
 *
 * What it proves:
 *  - strongRecommend (the HONEST anti-theater BASELINE, AM-2): reads risk_level / tenure / engagement
 *    (the factors diagnose().play provably IGNORES — it routes only on engagement_state × blocker_source)
 *    and produces a differentiated caution / strategy / tone.
 *  - The recommend-only ROUTE FIREWALL (R-A3-3): allowedRoute + clampRouteToEnvelope let an advisory
 *    route be only MORE cautious than the deterministic floor, never less; an LLM-proposed relaxed route
 *    is clamped up. The route never feeds the send regardless.
 *  - The ANTI-THEATER FLOOR (R-A3-1), with explicit RED-GREEN teeth on a same-play.touch / different-risk
 *    pair: the naive baselines (diagnose().play, defaultRecommend) FAIL to distinguish the pair (RED);
 *    strongRecommend and a risk-aware (mock-DI) Strategist PASS (GREEN); a risk-BLIND Strategist (a
 *    deterministic conductor in costume — the inverse failure §11 names) FAILS (RED).
 *  - FLOOR-NOT-CEILING (advisor): caution is a finite enum a deterministic baseline computes perfectly,
 *    so on the structural axis the Strategist can at best TIE strongRecommend. A3-2's eval is therefore a
 *    NECESSARY anti-theater floor, NOT a label-earning ceiling; the `strategist` trajectory label DEFERS
 *    to the A3-3 cross-family judge. A3-2b (live $0 Groq) is CONFIRMATORY (does the live LLM match the
 *    floor?), never seat-earning. The plan-step `agent` stays "tool" until then (tool-until-earned).
 */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { normalizeRow } from "@/legacy/activation/lib/core/pipeline";
import type { RiskLevel } from "@/legacy/activation/lib/core/constants";
import type { Merchant, MerchantInput } from "@/legacy/activation/lib/core/types";
import { diagnose } from "@/legacy/activation/lib/domain/diagnosis";
import { defaultRecommend, type RecommendedRoute } from "@/legacy/activation/lib/agents/loop/orchestrator";
import { groqLiveEnabled } from "@/lib/server/env-flags";
import {
  allowedRoute,
  buildStrategistPrompt,
  clampRouteToEnvelope,
  strategistRecommend,
  strongRecommend,
} from "@/legacy/activation/lib/agents/strategist";

// ── fixtures ──────────────────────────────────────────────────────────────

/** A stalled, recently-active merchant (-> engagement_state "actively_stuck", play.touch self_serve_nudge). */
function input(name: string, risk: RiskLevel): MerchantInput {
  return {
    merchant_name: name,
    merchant_category: "Restaurant",
    days_since_signup: 30,
    last_login_days_ago: 2,
    steps_completed: 3,
    source_risk_level: risk,
  };
}

/** Free Groq => $0; threaded for symmetry with the live boundary (never trips on the free tier). */
const budget = { spentUsd: 0, estimatedNextUsd: 0, capUsd: 5 };

/** A DI mock for the Groq Strategist call — returns a fixed structured output, no network, no spend. */
function mockGen(out: { caution: "standard" | "elevated"; route: RecommendedRoute }) {
  return async () => ({
    object: {
      strategy: "Mock: lead with the blocker fix; pre-empt the verification concern.",
      tone: "helpful, measured",
      caution: out.caution,
      route: out.route,
      rationale: "Mock rationale (DI machinery; no Groq call).",
    },
    usage: {},
  });
}

/** Extract the structured caution discriminator, or null if the recommender doesn't emit one. */
function cautionOf(rec: unknown): "standard" | "elevated" | null {
  if (rec && typeof rec === "object" && "caution" in rec) {
    const c = (rec as { caution?: unknown }).caution;
    if (c === "standard" || c === "elevated") return c;
  }
  return null;
}

/**
 * The DIRECTIONAL anti-theater scorer (objective + structural + directional — R-A3-8, NOT a prose-quality
 * certification): on a same-play.touch / different-risk pair, does the recommender RAISE caution for the
 * high-risk merchant above the low-risk one?
 */
function distinguishesRiskPair(lowRec: unknown, highRec: unknown): boolean {
  return cautionOf(lowRec) === "standard" && cautionOf(highRec) === "elevated";
}

// ── strongRecommend: the honest baseline reads what the play ignores ────────

describe("strongRecommend — reads risk / tenure / engagement (the factors diagnose().play ignores)", () => {
  it("caution tracks risk_level (the play never reads risk)", () => {
    const low = normalizeRow(input("Caution Low", "Low"), 1);
    const high = normalizeRow(input("Caution High", "High"), 2);
    expect(strongRecommend(low, diagnose(low)).caution).toBe("standard");
    expect(strongRecommend(high, diagnose(high)).caution).toBe("elevated");
  });

  it("strategy differs by engagement_state", () => {
    const stuck = normalizeRow(input("Stuck", "Low"), 1); // actively_stuck
    const dormant = normalizeRow({ ...input("Dormant", "Low"), last_login_days_ago: 10 }, 2); // dormant
    expect(diagnose(stuck).engagement_state).toBe("actively_stuck");
    expect(diagnose(dormant).engagement_state).toBe("dormant");
    expect(strongRecommend(stuck, diagnose(stuck)).strategy).not.toBe(
      strongRecommend(dormant, diagnose(dormant)).strategy,
    );
  });

  it("strategy names the long gap only for a long-tenure stall (the play ignores tenure magnitude)", () => {
    const fresh = normalizeRow(input("Fresh Stall", "Low"), 1); // 30d
    const longGap = normalizeRow({ ...input("Long Stall", "Low"), days_since_signup: 50 }, 2); // 50d
    // both actively_stuck with the SAME play.touch — only tenure magnitude differs
    expect(diagnose(fresh).play.touch).toBe(diagnose(longGap).play.touch);
    expect(strongRecommend(longGap, diagnose(longGap)).strategy.toLowerCase()).toContain("long gap");
    expect(strongRecommend(fresh, diagnose(fresh)).strategy.toLowerCase()).not.toContain("long gap");
  });

  it("suppressed/ineligible -> route suppress + do-not-draft", () => {
    const low = normalizeRow(input("Supp", "Low"), 1);
    const suppressed: Merchant = { ...low, contact_eligible: false };
    const rec = strongRecommend(suppressed, diagnose(suppressed));
    expect(rec.route).toBe("suppress");
    expect(rec.caution).toBe("elevated");
  });
});

// ── the recommend-only route firewall (R-A3-3) ──────────────────────────────

describe("envelope (allowedRoute + clampRouteToEnvelope) — recommend-only firewall (R-A3-3)", () => {
  const low = normalizeRow(input("Env Low", "Low"), 1); // eligible, no review -> contact floor
  const high = normalizeRow(input("Env High", "High"), 2); // review_required -> hold floor
  const suppressed: Merchant = { ...low, contact_eligible: false }; // ineligible -> suppress floor

  it("allowedRoute reads eligibility + review, not engagement", () => {
    expect(allowedRoute(low)).toBe("contact");
    expect(allowedRoute(high)).toBe("hold_for_review");
    expect(allowedRoute(suppressed)).toBe("suppress");
  });

  it("clamp allows only MORE caution than the floor, never less", () => {
    // contact floor: passes through
    expect(clampRouteToEnvelope("contact", low)).toBe("contact");
    expect(clampRouteToEnvelope("suppress", low)).toBe("suppress");
    // hold floor: a relaxed "contact" is forced up to hold; suppress still allowed
    expect(clampRouteToEnvelope("contact", high)).toBe("hold_for_review");
    expect(clampRouteToEnvelope("suppress", high)).toBe("suppress");
    // suppress floor: everything collapses to suppress
    expect(clampRouteToEnvelope("contact", suppressed)).toBe("suppress");
    expect(clampRouteToEnvelope("hold_for_review", suppressed)).toBe("suppress");
  });
});

// ── the anti-theater eval — explicit RED-GREEN (R-A3-1) ─────────────────────

describe("anti-theater eval — the FLOOR that catches a deterministic conductor in costume (R-A3-1)", () => {
  // risk_level = source_risk_level (pipeline.ts:199), independent of the engagement inputs. So this pair
  // shares engagement/tenure/blocker => identical diagnose().play; the INPUTS differ only on
  // source_risk_level (after normalization, High also induces review_required — the play ignores both).
  const low = normalizeRow(input("Pair Low", "Low"), 1);
  const high = normalizeRow(input("Pair High", "High"), 2);

  it("the pair shares play.touch but differs on risk (the seam the play ignores)", () => {
    expect(diagnose(low).play.touch).toBe(diagnose(high).play.touch);
    expect(low.risk_level).toBe("Low");
    expect(high.risk_level).toBe("High");
  });

  it("RED: the naive baselines (diagnose().play + defaultRecommend) do NOT distinguish the risk pair", () => {
    // play.touch is a Touch string with no caution signal -> identical -> fails.
    expect(distinguishesRiskPair(diagnose(low).play.touch, diagnose(high).play.touch)).toBe(false);
    // defaultRecommend (the A2 stand-in) emits no calibrated caution -> fails on this axis.
    expect(
      distinguishesRiskPair(defaultRecommend(low, diagnose(low)), defaultRecommend(high, diagnose(high))),
    ).toBe(false);
  });

  it("GREEN: strongRecommend (the honest floor) distinguishes the risk pair", () => {
    expect(
      distinguishesRiskPair(strongRecommend(low, diagnose(low)), strongRecommend(high, diagnose(high))),
    ).toBe(true);
  });

  it("GREEN: the live (mock-DI) Strategist clears the floor AND clamps a relaxed LLM route ($0 machinery)", async () => {
    // The mock LLM proposes route 'contact' for BOTH (relaxed/over-eager) but correct caution.
    const lowRec = await strategistRecommend(low, diagnose(low), {
      generate: mockGen({ caution: "standard", route: "contact" }),
      budget,
    });
    const highRec = await strategistRecommend(high, diagnose(high), {
      generate: mockGen({ caution: "elevated", route: "contact" }),
      budget,
    });
    // It actually ran the live path (NOT a silent fallback to the baseline).
    expect(lowRec.mode).toBe("LIVE_AI");
    expect(highRec.mode).toBe("LIVE_AI");
    // R-A3-3 route firewall: the relaxed 'contact' is CLAMPED up to the high merchant's hold floor.
    expect(highRec.route).toBe("hold_for_review");
    expect(lowRec.route).toBe("contact");
    // It clears the anti-theater floor.
    expect(distinguishesRiskPair(lowRec, highRec)).toBe(true);
  });

  it("RED: the floor has TEETH — a risk-BLIND Strategist (the inverse costume) FAILS", async () => {
    // A deterministic-conductor-in-costume: 'standard' for both, blind to risk.
    const blindLow = await strategistRecommend(low, diagnose(low), {
      generate: mockGen({ caution: "standard", route: "contact" }),
      budget,
    });
    const blindHigh = await strategistRecommend(high, diagnose(high), {
      generate: mockGen({ caution: "standard", route: "contact" }),
      budget,
    });
    expect(distinguishesRiskPair(blindLow, blindHigh)).toBe(false);
  });

  it("FLOOR-NOT-CEILING: on the finite structural axis the Strategist can only TIE strongRecommend", async () => {
    // caution is a finite enum the deterministic baseline computes perfectly, so 'beats strongRecommend on
    // open-ended synthesis' is NOT decidable here -> the `strategist` label DEFERS to the A3-3 cross-family
    // judge. This documents the tie (a demote/defer is an AM-7 success, not a failure).
    const lowRec = await strategistRecommend(low, diagnose(low), {
      generate: mockGen({ caution: "standard", route: "contact" }),
      budget,
    });
    expect(lowRec.caution).toBe(strongRecommend(low, diagnose(low)).caution);
  });

  it("the deterministic default ($0, no live, no generate) is the strong baseline", async () => {
    const rec = await strategistRecommend(low, diagnose(low));
    expect(rec.mode).toBe("DETERMINISTIC_RULES");
    expect(rec.caution).toBe(strongRecommend(low, diagnose(low)).caution);
  });
});

// ── the Strategist live gate is Groq-keyed, NOT the faithfulness judge's (Codex A3-2a P1) ───

describe("groqLiveEnabled — Groq-only gate (ENABLE_LIVE_AI && GROQ_API_KEY), immune to JUDGE_PROVIDER", () => {
  const KEYS = ["ENABLE_LIVE_AI", "GROQ_API_KEY", "GEMINI_API_KEY", "JUDGE_PROVIDER"] as const;
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

  it("is off unless ENABLE_LIVE_AI is set (even with a key)", () => {
    delete process.env.ENABLE_LIVE_AI;
    process.env.GROQ_API_KEY = "x";
    expect(groqLiveEnabled()).toBe(false);
  });

  it("is off without a Groq key", () => {
    process.env.ENABLE_LIVE_AI = "true";
    delete process.env.GROQ_API_KEY;
    expect(groqLiveEnabled()).toBe(false);
  });

  it("is on with ENABLE_LIVE_AI + GROQ_API_KEY", () => {
    process.env.ENABLE_LIVE_AI = "true";
    process.env.GROQ_API_KEY = "x";
    expect(groqLiveEnabled()).toBe(true);
  });

  it("is NOT misrouted by JUDGE_PROVIDER=gemini (stays keyed to GROQ_API_KEY) — the bug it fixes", () => {
    process.env.ENABLE_LIVE_AI = "true";
    process.env.JUDGE_PROVIDER = "gemini";
    process.env.GEMINI_API_KEY = "g";
    // With a Groq key it is ON regardless of the faithfulness judge's provider...
    process.env.GROQ_API_KEY = "x";
    expect(groqLiveEnabled()).toBe(true);
    // ...and with NO Groq key it is OFF, even though JUDGE_PROVIDER=gemini + GEMINI_API_KEY would have
    // turned the faithfulness judge (judgeLiveEnabled) on — the coupling the Strategist must NOT inherit.
    delete process.env.GROQ_API_KEY;
    expect(groqLiveEnabled()).toBe(false);
  });
});

// ── the Strategist prompt carries the discriminating facts + withholds the name (Codex A3-2a P2/F3) ──

describe("buildStrategistPrompt — regression-locks the fact wiring + the no-merchant_name injection surface", () => {
  const merchant = normalizeRow(
    {
      merchant_name: "Qwerty Zephyr Bistro",
      merchant_category: "Restaurant",
      days_since_signup: 30,
      last_login_days_ago: 2,
      steps_completed: 3,
      source_risk_level: "High",
    },
    1,
  );
  const d = diagnose(merchant);
  const prompt = buildStrategistPrompt(merchant, d, "Acme");

  it("includes risk / review flag / tenure / engagement / blocker / root cause (dropping any breaks this)", () => {
    expect(prompt).toContain(`risk_level: ${merchant.risk_level}`);
    expect(prompt).toContain(`review_required: ${merchant.review_required}`);
    expect(prompt).toContain(`tenure (days_since_signup): ${merchant.days_since_signup}`);
    expect(prompt).toContain(`engagement_state: ${d.engagement_state}`);
    expect(prompt).toContain(d.blocker_label);
    expect(prompt).toContain(d.blocker_code);
    expect(prompt).toContain(d.root_cause_hypothesis);
  });

  it("does NOT leak the raw merchant_name (no prompt-injection surface — the name reaches only the Drafter)", () => {
    expect(prompt).not.toContain("Qwerty Zephyr Bistro");
    expect(prompt).not.toContain("Qwerty");
  });
});
