/**
 * A2 OFFLINE MACHINERY — the green-CI proof for the single-agent verify-and-self-correct loop
 * (spec §6.3). NO spend, deterministic, isolates the LOOP.
 *
 * Run WITHOUT --env-file (offline DI; ZERO Groq calls — never touches the shared 200K/day window):
 *   npx vitest run evals/agent-loop.test.ts
 *
 * What it proves:
 *  - R-LOOP-8 (machinery): with an INJECTED draft generate (planted fabrication iter-0 -> clean iter-1)
 *    AND an INJECTED judge verdict (any_unsupported iter-0 -> all-supported iter-1) — NOT mockJudge —
 *    the loop flags iter-0, reflects, re-drafts, reaches all-supported, routes, and records a
 *    TrajectoryStep[] containing the correction. 100% convergence on the seeded cases.
 *    The injected paths are asserted to be LIVE_AI / LIVE_JUDGE (NOT the mock fallback), so a green
 *    cannot come from silently degrading to mockDraft/mockJudge.
 *  - R-LOOP-8b (recommend-not-decide, TEST-LOCKED): an agent seeded to "send anyway" to a
 *    send_eligible:false merchant routes to human/hold; outreach_status SHALL NOT become simulated_sent.
 *  - R-LOOP-6: the trajectory is a dedicated type, freezable to a $0 fixture (round-trips through JSON);
 *    the getAgentLoopSnapshot() seam renders the self-correction at $0.
 *  - R-LOOP-9 (parity intact): evals/tools-differential.test.ts + evals/core-differential.test.ts stay
 *    green in the same suite (the loop adds no business logic to the deterministic tools).
 */
import { writeFileSync, readFileSync } from "node:fs";
import { describe, it, expect } from "vitest";
import { normalizeRow } from "@/lib/core/pipeline";
import type { Merchant, MerchantInput } from "@/lib/core/types";
import { MERCHANT_PLACEHOLDER, mockDraft } from "@/lib/agents/draft";
import { draftOutreachGroq } from "@/lib/agents/groq-draft";
import { costUsd } from "@/lib/agents/pricing";
import { estimateLiveCallCostUsd, resolvedGeminiModel } from "@/lib/agents/gemini";
import { runAgentLoop, type Recommendation, type RouterFn } from "@/lib/agents/loop/orchestrator";
import { strongRecommend } from "@/lib/agents/strategist";
import { strongReflection } from "@/lib/agents/router";
import { freezeTrajectory } from "@/lib/agents/loop/trajectory";
import { getAgentLoopSnapshot } from "@/lib/agents/loop/snapshot";

// ── DI fixtures: build the model-authored (pre-substitution) draft object + verdicts ──

/** A planted fabrication that survives the deterministic gatekeeper (gold P-timeline pattern). */
const FABRICATION = "We expect your account to be fully approved by Friday.";

/**
 * The GeneratedDraftSchema object the model would author: derived from the grounded stub with the real
 * name reversed back to {{MERCHANT}} (the model never sees the real name). Optionally append a
 * fabrication to the body — undeclared, so the gatekeeper passes it and only the judge catches it.
 */
function generatedFrom(merchant: Merchant, fabrication?: string) {
  const stub = mockDraft(merchant);
  const ph = (s: string) => s.replaceAll(merchant.merchant_name, MERCHANT_PLACEHOLDER);
  const body = ph(stub.draft_body);
  return {
    risk_explanation: ph(stub.risk_explanation),
    blocker_summary: stub.blocker_summary,
    next_best_action: stub.next_best_action,
    draft_subject: ph(stub.draft_subject),
    draft_body: fabrication ? `${body} ${fabrication}` : body,
    claims: stub.claims,
  };
}

const flagVerdict = (fab: string) => ({
  claims: [
    { text: "You have completed your onboarding steps.", supported: true, evidence_field: "steps_completed" },
    { text: fab, supported: false, evidence_field: null },
  ],
  any_unsupported: true,
});
const cleanVerdict = () => ({
  claims: [{ text: "You have completed your onboarding steps.", supported: true, evidence_field: "steps_completed" }],
  any_unsupported: false,
});

/**
 * Offline DI usage: a (mocked) call that reported ZERO tokens. On the METERED Gemini Drafter (A3-3)
 * this prices as KNOWN $0, so the loop stays on the LIVE_AI path WITHOUT recording real spend — the
 * honest "no real call offline" $0, distinct from Groq's genuinely-free $0. Absent usage would fail
 * closed to UNKNOWN_USAGE -> mockDraft (Codex P1 cost guard), which is exercised separately below.
 */
const ZERO_USAGE = { inputTokens: 0, outputTokens: 0 } as const;

/** Scripted draft generate: planted fabrication on call 0, clean on every later call (ZERO_USAGE => known $0). */
function scriptedDraftGenerate(merchant: Merchant, fab: string) {
  let call = 0;
  return async () => ({ object: call++ === 0 ? generatedFrom(merchant, fab) : generatedFrom(merchant), usage: ZERO_USAGE });
}
/** Scripted judge generate: flag (any_unsupported) on call 0, all-supported on every later call. */
function scriptedJudgeGenerate(fab: string) {
  let call = 0;
  return async () => ({ object: call++ === 0 ? flagVerdict(fab) : cleanVerdict() });
}

const mediumInput = (name: string, idx: number, steps: number): MerchantInput => ({
  merchant_name: name,
  merchant_category: "Restaurant",
  days_since_signup: 20,
  last_login_days_ago: 10,
  steps_completed: steps,
  source_risk_level: "Medium", // Medium + eligible contact => send_eligible:true (converges + sends)
});

// ───────────────────────── Groq draft action — isolation (no mock fallback) ─────────────────────────

describe("A2 Groq draft action — injected live path, $0, shared injection-cut (R-LOOP-7)", () => {
  const merchant = normalizeRow(mediumInput("Curry In A Hurry", 1, 2), 1);

  it("a planted draft passes through as LIVE_AI at $0 — the real name is substituted, not leaked", async () => {
    const generate = scriptedDraftGenerate(merchant, FABRICATION);
    const res = await draftOutreachGroq(merchant, { generate, budget: { spentUsd: 0, estimatedNextUsd: 0, capUsd: 5 } });
    expect(res.mode).toBe("LIVE_AI"); // NOT FAILED_TO_FALLBACK / DETERMINISTIC_RULES
    expect(res.costUsd).toBe(0); // free Groq, KNOWN $0 (not UNKNOWN_USAGE -> mock)
    expect(res.draft.draft_body).toContain(FABRICATION); // the fabrication really was drafted
    expect(res.draft.draft_body).toContain(merchant.merchant_name); // real name substituted after generation
    expect(res.draft.draft_body).not.toContain(MERCHANT_PLACEHOLDER); // placeholder resolved
  });

  it("a redraft instruction is accepted and still produces a LIVE_AI draft", async () => {
    const generate = async () => ({ object: generatedFrom(merchant) });
    const res = await draftOutreachGroq(merchant, {
      instruction: "Remove the timeline claim.",
      generate,
      budget: { spentUsd: 0, estimatedNextUsd: 0, capUsd: 5 },
    });
    expect(res.mode).toBe("LIVE_AI");
    expect(res.draft.draft_body).not.toContain(FABRICATION);
  });

  it("enforces the SHARED injection-cut on the Groq path: a leaked real name -> NAME_LEAK (R-LOOP-7)", async () => {
    // Proves the WIRING (the Groq path actually applies applyInjectionCut), not just the function.
    const generate = async () => ({
      object: { ...generatedFrom(merchant), draft_body: `Hi {{MERCHANT}}, this is ${merchant.merchant_name} — add photos.` },
    });
    const res = await draftOutreachGroq(merchant, { generate, budget: { spentUsd: 0, estimatedNextUsd: 0, capUsd: 5 } });
    expect(res.mode).toBe("FAILED_TO_FALLBACK");
    expect(res.errorClass).toBe("NAME_LEAK");
    expect(res.costUsd).toBe(0); // free Groq — a rejected draft still never billed
  });
});

// ───────────────────────── R-LOOP-8 — convergence via the injected failing verdict ─────────────────────────

describe("R-LOOP-8 — the loop self-corrects a planted fabrication (injected verdict, not mockJudge)", () => {
  it("flags iter-0, reflects, re-drafts, reaches all-supported, routes — LIVE_AI/LIVE_JUDGE throughout", async () => {
    const merchant = normalizeRow(mediumInput("Curry In A Hurry", 1, 2), 1);
    const result = await runAgentLoop(
      { input: mediumInput("Curry In A Hurry", 1, 2), index: 1 },
      { draftGenerate: scriptedDraftGenerate(merchant, FABRICATION), judgeGenerate: scriptedJudgeGenerate(FABRICATION) },
    );

    // converged in exactly 2 attempts, free, and (Medium + eligible) simulated-sent.
    expect(result.converged).toBe(true);
    expect(result.iterations).toBe(2);
    expect(result.stopReason).toBe("verified");
    expect(result.costUsd).toBe(0); // offline DI: a (mocked) 0-token call => known $0 (no real spend)
    expect(result.outreachStatus).toBe("simulated_sent");
    expect(result.sent).toBe(true);
    // the FINAL draft is the clean redraft — the fabrication is gone.
    expect(result.draft.draft_body).not.toContain(FABRICATION);
    expect(result.finalVerify.passed).toBe(true);
    expect(result.finalVerify.judge?.mode).toBe("LIVE_JUDGE");

    // ── the trajectory records the correction, and proves the LIVE paths ran (not the mock fallback) ──
    // A3-4: each VERIFY now has TWO steps — the faithfulness control THEN the advisory domain critic
    // (both "tool"; the domain_critic label DEFERS per the anti-theater eval). Domain runs because the
    // gatekeeper approved each draft (the fabrication survives the gate; only the judge catches it).
    const phases = result.trajectory.map((s) => s.phase);
    expect(phases).toEqual(["plan", "draft", "verify", "verify", "reflect", "redraft", "verify", "verify", "route"]);

    const draft0 = result.trajectory.find((s) => s.phase === "draft")!;
    // index the FAITHFULNESS verify steps explicitly (the domain critic shares the "verify" phase).
    const faithVerifies = result.trajectory.filter(
      (s) => s.phase === "verify" && s.toolCalls.some((t) => t.tool === "check_faithfulness_reverse"),
    );
    const verify0 = faithVerifies[0];
    const reflect0 = result.trajectory.find((s) => s.phase === "reflect")!;
    const redraft1 = result.trajectory.find((s) => s.phase === "redraft")!;
    const verify1 = faithVerifies[1];

    expect(draft0.modelMode).toBe("LIVE_AI"); // NOT mockDraft fallback
    expect(verify0.modelMode).toBe("LIVE_JUDGE"); // NOT mockJudge
    expect(verify0.verdictSummary).toContain("any_unsupported=true");
    expect(verify0.verdictSummary).toContain("verify=FAIL");
    expect(reflect0.verdictSummary).toContain(FABRICATION); // the reflection names the failing claim
    expect(redraft1.modelMode).toBe("LIVE_AI");
    expect(verify1.modelMode).toBe("LIVE_JUDGE");
    expect(verify1.verdictSummary).toContain("verify=PASS");

    // A3-4: the advisory domain critic ran each verify (gatekeeper-approved) — a "tool" step (label
    // DEFERS) carrying the domain verdict, surfaced but never gating. domain_critic stays ABSENT.
    const domainVerifies = result.trajectory.filter(
      (s) => s.phase === "verify" && s.toolCalls.some((t) => t.tool === "check_domain_quality"),
    );
    expect(domainVerifies.length).toBe(2); // one per gatekeeper-approved iteration
    expect(domainVerifies.every((s) => s.agent === "tool")).toBe(true); // label deferred, not "domain_critic"
    expect(domainVerifies[0].verdictSummary).toContain("ADVISORY");
    expect(result.finalVerify.domain).not.toBeNull(); // the verdict is surfaced for the human gate

    // audit is distinct from the trajectory (R-LOOP-6) and order-preserving — now incl. the "domain" actor.
    expect(result.audit.map((a) => a.actor)).toEqual(["system", "draft", "gatekeeper", "judge", "domain", "system"]);
  });

  it("100% convergence across the seeded cases", async () => {
    const seeds = [
      mediumInput("Curry In A Hurry", 1, 2),
      mediumInput("Harbor Dumpling", 2, 3),
      mediumInput("Presidio Pho", 3, 4),
    ];
    for (const input of seeds) {
      const merchant = normalizeRow(input, 1);
      const result = await runAgentLoop(
        { input, index: 1 },
        { draftGenerate: scriptedDraftGenerate(merchant, FABRICATION), judgeGenerate: scriptedJudgeGenerate(FABRICATION) },
      );
      expect(result.converged, `${input.merchant_name} should converge`).toBe(true);
      expect(result.outreachStatus).toBe("simulated_sent");
      expect(result.costUsd).toBe(0);
    }
  });

  it("bounded: a verdict that NEVER clears stops at maxIterations and holds — never unbounded (R-LOOP-3)", async () => {
    const merchant = normalizeRow(mediumInput("Stubborn Soup", 4, 2), 1);
    const alwaysFlag = async () => ({ object: flagVerdict(FABRICATION) }); // judge never clears
    const result = await runAgentLoop(
      { input: mediumInput("Stubborn Soup", 4, 2), index: 1 },
      {
        maxIterations: 3,
        draftGenerate: async () => ({ object: generatedFrom(merchant, FABRICATION), usage: ZERO_USAGE }),
        judgeGenerate: alwaysFlag,
      },
    );
    expect(result.converged).toBe(false);
    expect(result.iterations).toBe(3); // exactly the cap — bounded
    expect(result.stopReason).toBe("max_iterations");
    expect(result.outreachStatus).not.toBe("simulated_sent"); // held, never sent on an unverified draft
    expect(result.sent).toBe(false);
  });
});

// ───────────────────── A3-4 — the domain critic is ADVISORY + INDEPENDENT (R-A3-4) ─────────────────────

describe("A3-4 — the domain critic is ADVISORY + INDEPENDENT of faithfulness (R-A3-4)", () => {
  /** A domain verdict the model would author: one dimension fails ⇒ domain_defective. */
  const domainDefectiveVerdict = () => ({
    dimensions: [
      { dimension: "matched_to_blocker", pass: true, rationale: "addresses the blocker" },
      { dimension: "engagement_appropriate", pass: true, rationale: "fits the engagement state" },
      { dimension: "no_over_promise", pass: false, rationale: "implied-typicality hype (a §4.2 residual)" },
    ],
    any_dimension_failed: true,
  });

  it("a domain-DEFECTIVE draft that PASSES faithfulness still converges + sends — domain never gates", async () => {
    const merchant = normalizeRow(mediumInput("Advisory Arepas", 1, 2), 1);
    const result = await runAgentLoop(
      { input: mediumInput("Advisory Arepas", 1, 2), index: 1 },
      {
        live: false,
        draftGenerate: async () => ({ object: generatedFrom(merchant), usage: ZERO_USAGE }),
        judgeGenerate: async () => ({ object: cleanVerdict() }), // faithfulness PASSES (all-supported)
        domainGenerate: async () => ({ object: domainDefectiveVerdict() }), // domain FLAGS (defective)
      },
    );

    // INDEPENDENT (R-A3-4) — STRUCTURAL: judgeDomain receives ONLY (draft, merchant), never the
    // faithfulness verdict (and domainSituation withholds diagnose().play), so its verdict cannot be a
    // function of faithfulness. This test exercises the loop SURFACING both verdicts side by side via DI
    // (faithfulness PASS + domain FLAG on the same draft); the independence itself is from that signature.
    expect(result.finalVerify.judge?.verdict.any_unsupported).toBe(false); // faithfulness: all-supported
    expect(result.finalVerify.domain?.verdict.domain_defective).toBe(true); // domain: flagged the SAME draft
    expect(result.finalVerify.domain?.mode).toBe("LIVE_JUDGE"); // genuine judgment ran (via DI), not the mock

    // ADVISORY (R-A3-4): the domain flag did NOT block — eligibility/send stayed the deterministic core's.
    // RED-GREEN: making verifyPassed (or the send) depend on domain_defective turns this RED.
    expect(result.converged).toBe(true);
    expect(result.outreachStatus).toBe("simulated_sent");
    expect(result.sent).toBe(true);

    // tool-until-earned: the domain step is "tool" (the label DEFERS per the anti-theater eval), NOT
    // "domain_critic" — even though a genuine LIVE_JUDGE produced the verdict.
    const domainStep = result.trajectory.find((s) => s.toolCalls.some((t) => t.tool === "check_domain_quality"))!;
    expect(domainStep.agent).toBe("tool");
    expect(new Set(result.trajectory.map((s) => s.agent)).has("domain_critic")).toBe(false);
  });

  it("a gatekeeper-BLOCKED final draft surfaces NO stale domain verdict (Codex A3-4 P2 — lastDomain reset)", async () => {
    const merchant = normalizeRow(mediumInput("Stale Strudel", 6, 2), 1);
    let call = 0;
    const result = await runAgentLoop(
      { input: mediumInput("Stale Strudel", 6, 2), index: 1 },
      {
        maxIterations: 2,
        // iter 0: a clean draft (gatekeeper PASS → domain RUNS) but faithfulness flags it → re-draft.
        // iter 1: a register-leak draft (internal snake_case token) → gatekeeper BLOCKS → domain SKIPPED.
        draftGenerate: async () => ({
          object:
            call++ === 0
              ? generatedFrom(merchant)
              : {
                  ...generatedFrom(merchant),
                  draft_body: "Hi {{MERCHANT}}, your business_verification_needed step is next.",
                },
          usage: ZERO_USAGE,
        }),
        judgeGenerate: scriptedJudgeGenerate(FABRICATION), // flag iter 0 → forces the re-draft
      },
    );

    // the FINAL draft was gate-BLOCKED; lastDomain reset per iteration ⇒ no STALE iteration-0 verdict.
    expect(result.finalVerify.gatekeeper?.approvedForHumanReview).toBe(false);
    expect(result.finalVerify.domain).toBeNull(); // not the earlier approved draft's verdict
    expect(result.audit.some((a) => a.actor === "domain")).toBe(false); // and no stale domain audit entry
    // sanity: the domain critic DID run on iteration 0 — proving the null is a RESET, not "never ran".
    expect(result.trajectory.some((s) => s.toolCalls.some((t) => t.tool === "check_domain_quality"))).toBe(true);
  });

  it("a forced live:true that is NOT cross-family-ready (DOMAIN_JUDGE_PROVIDER=gemini) FAILS CLOSED — throws (Codex A3-4 P1)", async () => {
    const keys = ["ENABLE_LIVE_AI", "GEMINI_API_KEY", "GROQ_API_KEY", "JUDGE_PROVIDER", "DOMAIN_JUDGE_PROVIDER"] as const;
    const saved = Object.fromEntries(keys.map((k) => [k, process.env[k]]));
    try {
      process.env.ENABLE_LIVE_AI = "true";
      process.env.GEMINI_API_KEY = "test-gemini-key";
      process.env.GROQ_API_KEY = "test-groq-key";
      process.env.JUDGE_PROVIDER = "groq";
      process.env.DOMAIN_JUDGE_PROVIDER = "gemini"; // ← the same-family hole: the Domain Critic would be Gemini
      const R_A3_2 = /R-A3-2: live:true requested but cross-family is not ready/;
      const input = { input: mediumInput("Crossfam Crepes", 1, 2), index: 1 };
      const gen = async () => ({ object: generatedFrom(normalizeRow(mediumInput("Crossfam Crepes", 1, 2), 1)), usage: ZERO_USAGE });

      // (a) NO DI — a real forced-live run while the Domain Critic is NOT Groq → THROW before any call.
      await expect(runAgentLoop(input, { live: true })).rejects.toThrow(R_A3_2);

      // (b) PARTIAL DI (draftGenerate only) STILL throws (Codex A3-4 P1 round 2): the non-injected Domain
      // Critic would make a REAL Gemini call. The exemption requires FULLY-injected DI, not just any.
      await expect(runAgentLoop(input, { live: true, draftGenerate: gen })).rejects.toThrow(R_A3_2);

      // The three OLD generates (draft + judge + domain). A3-6 made the Strategist (recommend) + Router
      // (reflect) seams live-capable by default, so these THREE alone are no longer "fully injected".
      const threeGenerates = {
        draftGenerate: gen,
        judgeGenerate: async () => ({ object: cleanVerdict() }),
        domainGenerate: async () => ({
          object: {
            dimensions: [
              { dimension: "matched_to_blocker", pass: true, rationale: "ok" },
              { dimension: "engagement_appropriate", pass: true, rationale: "ok" },
              { dimension: "no_over_promise", pass: true, rationale: "ok" },
            ],
            any_dimension_failed: false,
          },
        }),
      };

      // (c) The three generates only — NO recommend/reflect — STILL throws (Codex A3-6 P1): a forced-live
      // run with the Strategist + Router seams non-injected would make a REAL Groq Strategist + Router call.
      await expect(runAgentLoop(input, { live: true, ...threeGenerates })).rejects.toThrow(R_A3_2);

      // (d) ALL FIVE live-capable seams injected (the three generates + recommend + reflect) → no real
      // provider call on ANY seam → exempt, runs, does NOT throw.
      await expect(
        runAgentLoop(input, {
          live: true,
          ...threeGenerates,
          recommend: (m, d) => ({ ...strongRecommend(m, d), mode: "DETERMINISTIC_RULES" }),
          reflect: (rctx) => strongReflection(rctx),
        }),
      ).resolves.toBeDefined();
    } finally {
      for (const k of keys) {
        if (saved[k] === undefined) delete process.env[k];
        else process.env[k] = saved[k];
      }
    }
  });
});

// ───────────────────── R-LOOP-8 fail-closed — a fallback judge never passes (Codex A2 P1) ─────────────────────

describe("R-LOOP-8 fail-closed — a FAILED_TO_FALLBACK judge is held, never sent (Codex A2 P1)", () => {
  it("a clean draft whose LIVE judge call fails (fallback) does NOT pass — held for a human, never sent", async () => {
    const merchant = normalizeRow(mediumInput("Failsafe Falafel", 1, 2), 1);
    const result = await runAgentLoop(
      { input: mediumInput("Failsafe Falafel", 1, 2), index: 1 },
      {
        // a clean draft (would clear the gatekeeper) ...
        draftGenerate: async () => ({ object: generatedFrom(merchant), usage: ZERO_USAGE }),
        // ... but the LIVE judge call THROWS -> judgeDraft falls back to the mock (FAILED_TO_FALLBACK).
        // Without fail-closed, a clean mock verdict would PASS -> simulate_send. It must NOT.
        judgeGenerate: async () => {
          throw new Error("simulated Groq 429 / live judge failure");
        },
      },
    );
    expect(result.finalVerify.judge?.mode).toBe("FAILED_TO_FALLBACK"); // the judge fell back
    expect(result.converged).toBe(false); // fail-closed: a fallback verdict is NOT verification
    expect(result.outreachStatus).not.toBe("simulated_sent"); // never sent on the keyword-mock's say-so
    expect(result.sent).toBe(false);
  });
});

// ───────────────────── R-LOOP-8b — recommend-not-decide (TEST-LOCKED, AM-4) ─────────────────────

describe("R-LOOP-8b — the agent cannot override deterministic eligibility", () => {
  it("an agent seeded to 'send anyway' to a send_eligible:false merchant is held, NOT sent", async () => {
    // High-risk + unapproved => review_required:true, approval_state:pending_review => send_eligible:false.
    const highRisk: MerchantInput = {
      merchant_name: "Risky Ramen",
      merchant_category: "Restaurant",
      days_since_signup: 18,
      last_login_days_ago: 9,
      steps_completed: 1,
      source_risk_level: "High",
    };
    const merchant = normalizeRow(highRisk, 1);
    expect(merchant.send_eligible).toBe(false); // precondition: deterministically NOT send-eligible

    // The agent is PROMPTED to send anyway (route=contact) — and the draft is clean (verify passes).
    const sendAnyway = (): Recommendation => ({
      route: "contact",
      strategy: "self_serve_nudge",
      tone: "pushy",
      rationale: "SEEDED: recommend send anyway (the test's adversarial agent).",
    });
    const result = await runAgentLoop(
      { input: highRisk, index: 1 },
      {
        recommend: sendAnyway,
        draftGenerate: async () => ({ object: generatedFrom(merchant), usage: ZERO_USAGE }), // clean draft
        judgeGenerate: async () => ({ object: cleanVerdict() }), // all-supported -> verify passes
      },
    );

    // The agent DID recommend "contact" (send) ...
    expect(result.recommendation.route).toBe("contact");
    expect(result.converged).toBe(true); // the draft itself is clean
    // ... but deterministic eligibility HELD: no simulated send, ever.
    expect(result.merchant.send_eligible).toBe(false); // untouched by the agent
    expect(result.outreachStatus).not.toBe("simulated_sent");
    expect(result.outreachStatus).toBe("drafted"); // held for human approval
    expect(result.sent).toBe(false);
  });

  it("an async recommender that MUTATES its merchant arg cannot corrupt the loop (isolated by clone) [Codex A3-2a P3]", async () => {
    const highRisk: MerchantInput = {
      merchant_name: "Mutator Diner",
      merchant_category: "Restaurant",
      days_since_signup: 18,
      last_login_days_ago: 9,
      steps_completed: 1,
      source_risk_level: "High",
    };
    const merchant = normalizeRow(highRisk, 1);
    expect(merchant.send_eligible).toBe(false);
    expect(merchant.review_required).toBe(true);

    // An adversarial ASYNC recommender that tries to FORCE eligibility by mutating its argument.
    const mutating = async (m: Merchant): Promise<Recommendation> => {
      m.send_eligible = true;
      m.review_required = false;
      return { route: "contact", strategy: "self_serve_nudge", tone: "pushy", rationale: "SEEDED: mutate + send." };
    };
    const result = await runAgentLoop(
      { input: highRisk, index: 1 },
      {
        recommend: mutating,
        draftGenerate: async () => ({ object: generatedFrom(merchant), usage: ZERO_USAGE }),
        judgeGenerate: async () => ({ object: cleanVerdict() }),
      },
    );

    // The loop's merchant is ISOLATED from the mutation (recommend got a defensive clone): the forced
    // values did NOT stick, so eligibility holds and no ineligible send lands. WITHOUT the clone the
    // mutation would move eligibility -> assertEligibilityUntouched throws; this passes ONLY with the clone.
    expect(result.merchant.send_eligible).toBe(false);
    expect(result.merchant.review_required).toBe(true);
    expect(result.outreachStatus).not.toBe("simulated_sent");
    expect(result.sent).toBe(false);
  });

  // ── A3-5: the Router (reflect seam) is RECOMMEND-ONLY too — its advisory route never reaches the send ──
  it("a Router (reflect seam) that recommends 'send anyway' on an ineligible merchant is RECORDED, never sent", async () => {
    const highRisk: MerchantInput = {
      merchant_name: "Router Ramen",
      merchant_category: "Restaurant",
      days_since_signup: 18,
      last_login_days_ago: 9,
      steps_completed: 1,
      source_risk_level: "High",
    };
    const merchant = normalizeRow(highRisk, 1);
    expect(merchant.send_eligible).toBe(false); // precondition: deterministically NOT send-eligible

    // The adversarial Router recommends route=contact / no hold at the reflect step (it runs because the
    // iteration-0 draft fails verify). recommend-only: this is RECORDED in the trajectory, never wired.
    const routerSendAnyway: RouterFn = () => ({
      instruction: "SEEDED: ignore the failure and ship it.",
      signals: ["faithfulness"],
      route: "contact",
      holdForHuman: false,
      rationale: "SEEDED: the adversarial Router recommends send anyway.",
    });
    const result = await runAgentLoop(
      { input: highRisk, index: 1 },
      {
        reflect: routerSendAnyway,
        draftGenerate: scriptedDraftGenerate(merchant, FABRICATION), // fabrication iter-0 -> reflect runs -> clean redraft
        judgeGenerate: scriptedJudgeGenerate(FABRICATION),
      },
    );

    // The Router DID recommend "contact" at the reflect step — recorded FAITHFULLY (the firewall is demonstrable) ...
    const reflectStep = result.trajectory.find((s) => s.phase === "reflect")!;
    expect(reflectStep.verdictSummary).toContain("advisory route=contact");
    expect(reflectStep.agent).toBe("tool"); // tool-until-earned: the `router` label DEFERS (structurally forced)
    expect(result.converged).toBe(true); // the draft self-corrected (clean redraft)
    // ... but deterministic eligibility HELD: no simulated send, ever.
    expect(result.merchant.send_eligible).toBe(false); // untouched by the Router
    expect(result.outreachStatus).not.toBe("simulated_sent");
    expect(result.outreachStatus).toBe("drafted"); // held for human approval
    expect(result.sent).toBe(false);
    expect(result.trajectory.some((s) => s.agent === "router")).toBe(false); // router ABSENT (label deferred)
  });

  it("a reflect seam that MUTATES its merchant arg cannot corrupt the loop (isolated by clone) [A3-5]", async () => {
    const highRisk: MerchantInput = {
      merchant_name: "Router Mutator",
      merchant_category: "Restaurant",
      days_since_signup: 18,
      last_login_days_ago: 9,
      steps_completed: 1,
      source_risk_level: "High",
    };
    const merchant = normalizeRow(highRisk, 1);
    expect(merchant.send_eligible).toBe(false);
    expect(merchant.review_required).toBe(true);

    // An adversarial reflect seam that tries to FORCE eligibility by mutating its ctx.merchant argument.
    const mutatingReflect: RouterFn = (c) => {
      c.merchant.send_eligible = true;
      c.merchant.review_required = false;
      return { instruction: "x", signals: ["faithfulness"], route: "contact", holdForHuman: false, rationale: "SEEDED: mutate + send." };
    };
    const result = await runAgentLoop(
      { input: highRisk, index: 1 },
      {
        reflect: mutatingReflect,
        draftGenerate: scriptedDraftGenerate(merchant, FABRICATION),
        judgeGenerate: scriptedJudgeGenerate(FABRICATION),
      },
    );

    // The loop's merchant is ISOLATED from the mutation (reflect got a defensive clone): eligibility holds,
    // no ineligible send. WITHOUT the clone the mutation would move eligibility -> assertEligibilityUntouched
    // throws; this passes ONLY with the clone at the reflect call site.
    expect(result.merchant.send_eligible).toBe(false);
    expect(result.merchant.review_required).toBe(true);
    expect(result.outreachStatus).not.toBe("simulated_sent");
    expect(result.sent).toBe(false);
  });
});

// ───────────────────── R-LOOP-6 — trajectory freeze + $0 REPLAY seam ─────────────────────

describe("R-LOOP-6 — the trajectory freezes to a $0 fixture and renders the self-correction", () => {
  it("freezeTrajectory round-trips through JSON (serializable, no functions/instances)", async () => {
    const merchant = normalizeRow(mediumInput("Curry In A Hurry", 1, 2), 1);
    const result = await runAgentLoop(
      { input: mediumInput("Curry In A Hurry", 1, 2), index: 1 },
      { draftGenerate: scriptedDraftGenerate(merchant, FABRICATION), judgeGenerate: scriptedJudgeGenerate(FABRICATION) },
    );
    const snap = freezeTrajectory({
      merchantId: result.merchant.merchant_id,
      converged: result.converged,
      iterations: result.iterations,
      stopReason: result.stopReason,
      outreachStatus: result.outreachStatus,
      sent: result.sent,
      trajectory: result.trajectory,
      audit: result.audit,
    });
    const roundTripped = JSON.parse(JSON.stringify(snap));
    expect(roundTripped).toEqual(snap); // pure data — freezes cleanly to a fixture
    writeFileSync("/tmp/agent-loop.snapshot.json", JSON.stringify(snap, null, 2)); // prove a real freeze ($0, /tmp only)
    const reread = JSON.parse(readFileSync("/tmp/agent-loop.snapshot.json", "utf8"));
    expect(reread.servedMode).toBe("REPLAY");
    expect(reread.trajectory.some((s: { phase: string }) => s.phase === "reflect")).toBe(true);
  });

  it("getAgentLoopSnapshot() serves the scripted self-correction at $0 (mirrors getReplaySnapshot)", async () => {
    const snap = await getAgentLoopSnapshot();
    expect(snap.servedMode).toBe("REPLAY");
    expect(snap.converged).toBe(true);
    expect(snap.sent).toBe(true);
    expect(snap.outreachStatus).toBe("simulated_sent");
    expect(snap.trajectory.map((s) => s.phase)).toEqual(["plan", "draft", "verify", "verify", "reflect", "redraft", "verify", "verify", "route"]);
    // R-A3-6 on the DEPLOYED payoff surface (acceptance-gate advisory): the SERVED snapshot carries
    // valid `agent` attribution and shows no un-earned agent (tool-until-earned holds on the fixture).
    const allowedAgents = new Set(["strategist", "drafter", "domain_critic", "router", "tool"]);
    expect(snap.trajectory.every((s) => allowedAgents.has(s.agent))).toBe(true);
    expect(snap.trajectory.map((s) => s.agent)).toEqual(["tool", "drafter", "tool", "tool", "tool", "drafter", "tool", "tool", "tool"]);
    expect(snap.note).toContain("SCRIPTED"); // honest labeling (AM-7) — not a live "catches its own mistakes" claim
  });
});

// ───────────────────── R-A3-6 — trajectory `agent` attribution + tool-until-earned ─────────────────────

describe("R-A3-6 — every step carries an `agent` attribution, honest under tool-until-earned (AM-2)", () => {
  it("attributes the scripted self-correction trajectory and labels NO un-earned agent", async () => {
    const merchant = normalizeRow(mediumInput("Curry In A Hurry", 1, 2), 1);
    const result = await runAgentLoop(
      { input: mediumInput("Curry In A Hurry", 1, 2), index: 1 },
      { draftGenerate: scriptedDraftGenerate(merchant, FABRICATION), judgeGenerate: scriptedJudgeGenerate(FABRICATION) },
    );

    // Every step is attributed (the field is required; tsc + this guard both enforce presence).
    const allowed = new Set(["strategist", "drafter", "domain_critic", "router", "tool"]);
    for (const s of result.trajectory) expect(allowed.has(s.agent)).toBe(true);

    // The mapping is locked against the known phase sequence (A3-4: each verify is TWO steps — faithfulness
    // then the advisory domain critic): plan,draft,verify,verify,reflect,redraft,verify,verify,route.
    expect(result.trajectory.map((s) => s.phase)).toEqual(["plan", "draft", "verify", "verify", "reflect", "redraft", "verify", "verify", "route"]);
    expect(result.trajectory.map((s) => s.agent)).toEqual(["tool", "drafter", "tool", "tool", "tool", "drafter", "tool", "tool", "tool"]);

    // tool-until-earned (AM-2 / R-A3-1): in A3-1 the ONLY agent that has earned its label is the
    // drafter (the genuinely-generative slot). strategist/router/domain_critic appear ONLY in the
    // slice that wires their LLM and clears the anti-theater eval — they must NOT appear yet.
    const agents = new Set(result.trajectory.map((s) => s.agent));
    expect(agents.has("drafter")).toBe(true);
    expect(agents.has("strategist")).toBe(false); // → A3-2 iff R-A3-1 passes
    expect(agents.has("router")).toBe(false); // → A3-5 iff R-A3-1 passes
    expect(agents.has("domain_critic")).toBe(false); // → A3-4 (2nd verify-phase critic)

    // A deterministic stand-in step is honestly "tool" + DETERMINISTIC_RULES (no agent costume).
    const plan = result.trajectory.find((s) => s.phase === "plan")!;
    expect(plan.agent).toBe("tool");
    expect(plan.modelMode).toBe("DETERMINISTIC_RULES");
  });

  it("the seedDraft branch is a fixture, not the Drafter: seed_draft → tool, the generated redraft → drafter [Codex A3-1 F2]", async () => {
    const merchant = normalizeRow(mediumInput("Seeded Soba", 5, 2), 1);
    // iteration-0 is a FED-IN draft (a fixture) carrying a planted fabrication; the injected judge flags
    // it, so the loop re-drafts on iteration-1 via the GENERATED Drafter (Gemini) path (clean) and converges.
    const base = mockDraft(merchant);
    const seed = { ...base, draft_body: `${base.draft_body} ${FABRICATION}` };
    const result = await runAgentLoop(
      { input: mediumInput("Seeded Soba", 5, 2), index: 1 },
      {
        seedDraft: seed,
        draftGenerate: async () => ({ object: generatedFrom(merchant), usage: ZERO_USAGE }), // the clean redraft
        judgeGenerate: scriptedJudgeGenerate(FABRICATION), // flag the seed, clear the redraft
      },
    );

    // The iteration-0 draft went through the seedDraft branch (a fixture), NOT the Drafter.
    const seedStep = result.trajectory.find((s) => s.phase === "draft")!;
    expect(seedStep.toolCalls[0]?.tool).toBe("seed_draft"); // confirm it IS the seed branch
    expect(seedStep.modelMode).toBe("REPLAY"); // no generative call
    expect(seedStep.agent).toBe("tool"); // a fed-in fixture is NOT the drafter (F1)

    // The actual re-draft IS the Drafter — a genuine generative call earns the label.
    const redraft = result.trajectory.find((s) => s.phase === "redraft")!;
    expect(redraft.agent).toBe("drafter");

    // tool-until-earned still holds across the seeded branch: no un-earned agent appears.
    const agents = new Set(result.trajectory.map((s) => s.agent));
    expect(agents.has("strategist")).toBe(false);
    expect(agents.has("router")).toBe(false);
    expect(agents.has("domain_critic")).toBe(false);
  });
});

// ───────────────── A3-3 — cost integrity: the metered Gemini Drafter inside the loop ─────────────────
// The A3-3 swap (Groq -> Gemini) makes the Drafter a BILLING agent that runs EVERY re-draft. The
// convergence tests above hold cost at $0 with 0-token DI (no real spend offline) — but $0 fixtures
// alone would DELETE coverage of the one thing this slice introduces: a metered drafter + a cumulative
// ledger. These two tests inject REALISTIC usage and lock that behavior (advisor A3-3). Still $0 of
// REAL spend (DI, no network); the asserted dollars are computed from the pinned Gemini price table.
describe("A3-3 cost integrity — the metered Gemini Drafter accrues into the loop's $5 ledger", () => {
  it("a 2-iteration run accrues BOTH Gemini draft calls — costUsd is the cumulative bill, not a per-call $0", async () => {
    const merchant = normalizeRow(mediumInput("Costly Curry", 1, 2), 1);
    const USAGE = { inputTokens: 1200, outputTokens: 300 };
    let call = 0;
    // planted (caught) -> clean redraft: exactly 2 metered Gemini draft calls.
    const draftGenerate = async () => ({
      object: call++ === 0 ? generatedFrom(merchant, FABRICATION) : generatedFrom(merchant),
      usage: USAGE,
    });
    const result = await runAgentLoop(
      { input: mediumInput("Costly Curry", 1, 2), index: 1 },
      { live: false, draftGenerate, judgeGenerate: scriptedJudgeGenerate(FABRICATION) },
    );

    expect(result.converged).toBe(true);
    expect(result.iterations).toBe(2); // two draft calls (initial + one redraft)
    const perCall = costUsd(resolvedGeminiModel(), USAGE.inputTokens, USAGE.outputTokens);
    expect(perCall).toBeGreaterThan(0); // guards a silently-$0 price table (the test would be vacuous otherwise)
    // The ledger ACCUMULATES across re-drafts (the Groq judge is free) — the cumulative cap is real.
    expect(result.costUsd).toBeCloseTo(2 * perCall, 10);
  });

  it("a billed draft with UNKNOWN usage fails closed INSIDE the loop — records the estimate, never $0 (Codex P1)", async () => {
    const merchant = normalizeRow(mediumInput("Unknown Udon", 2, 2), 1);
    // A parseable object but NO usage reported: on the metered Gemini path a real call that can't be
    // priced MUST NOT record $0 (that is the exact blind spot that lets spend escape the cap). It fails
    // closed to the conservative estimate the loop reserved (budget.estimatedNextUsd) — proven IN-LOOP.
    const draftGenerate = async () => ({ object: generatedFrom(merchant) }); // no usage
    const result = await runAgentLoop(
      { input: mediumInput("Unknown Udon", 2, 2), index: 1 },
      { live: false, draftGenerate, judgeGenerate: async () => ({ object: cleanVerdict() }) },
    );

    const estimate = estimateLiveCallCostUsd(resolvedGeminiModel());
    expect(estimate).toBeGreaterThan(0);
    const draftStep = result.trajectory.find((s) => s.phase === "draft")!;
    expect(draftStep.modelMode).toBe("FAILED_TO_FALLBACK"); // the in-loop draft fell back honestly
    expect(draftStep.verdictSummary).toContain("UNKNOWN_USAGE");
    expect(result.costUsd).toBeCloseTo(estimate, 10); // charged the estimate, NOT $0
  });
});

// ───────────────────── A3-6 — the integrated multi-agent defaults are WIRED ─────────────────────

describe("A3-6 — the orchestrator default IS the Strategist (plan) + the Router (reflect), not the A2 stand-ins", () => {
  it("plan uses strongRecommend (Strategist baseline) + reflect uses strongReflection (Router) — proven by content, $0", async () => {
    const merchant = normalizeRow(mediumInput("Integrated Idli", 1, 2), 1);
    // A domain-DEFECTIVE verdict injected at the (gatekeeper-approved) domain critic — ONLY the Router
    // (strongReflection) surfaces it at reflect; the old domain-blind buildReflection structurally cannot.
    const domainDefective = async () => ({
      object: {
        dimensions: [
          { dimension: "matched_to_blocker", pass: true, rationale: "ok" },
          { dimension: "engagement_appropriate", pass: true, rationale: "ok" },
          { dimension: "no_over_promise", pass: false, rationale: "implied an approval timeline" },
        ],
        any_dimension_failed: true, // required by DomainVerdictSchema (domain_defective is recomputed from dimensions)
      },
      usage: ZERO_USAGE,
    });
    const result = await runAgentLoop(
      { input: mediumInput("Integrated Idli", 1, 2), index: 1 },
      {
        // NO recommend / reflect injected -> the A3-6 INTEGRATED DEFAULTS run (strategistRecommend ->
        // strongRecommend offline; routerReflect -> strongReflection offline). $0.
        draftGenerate: scriptedDraftGenerate(merchant, FABRICATION),
        judgeGenerate: scriptedJudgeGenerate(FABRICATION),
        domainGenerate: domainDefective,
      },
    );
    expect(result.costUsd).toBe(0); // integrated defaults are deterministic offline -> $0

    // PLAN default = the Strategist baseline (strongRecommend), NOT the naive defaultRecommend:
    // strongRecommend's rationale carries engagement/risk/tenure; defaultRecommend's is just the root cause.
    expect(result.recommendation.rationale).toMatch(/risk=/);
    expect(result.recommendation.rationale).toMatch(/tenure=/);
    const planStep = result.trajectory.find((s) => s.phase === "plan")!;
    expect(planStep.modelMode).toBe("DETERMINISTIC_RULES"); // strongRecommend offline ($0)
    expect(planStep.agent).toBe("tool"); // label DEFERS (tool-until-earned) — strategist NOT claimed

    // REFLECT default = the Router (strongReflection), NOT the domain-blind buildReflection: the iter-0
    // reflect surfaces the ADVISORY domain signal (no_over_promise) ALONGSIDE the gating faithfulness fix.
    const reflect0 = result.trajectory.find((s) => s.phase === "reflect")!;
    expect(reflect0.verdictSummary).toContain(FABRICATION); // faithfulness fix (gating) — still first
    expect(reflect0.verdictSummary).toMatch(/no_over_promise/); // domain addendum — buildReflection CANNOT produce this
    expect(reflect0.agent).toBe("tool"); // label DEFERS — router NOT claimed

    // tool-until-earned still holds across the whole integrated trajectory: only the Drafter is an agent.
    expect(result.trajectory.some((s) => s.agent === "strategist")).toBe(false);
    expect(result.trajectory.some((s) => s.agent === "router")).toBe(false);
    expect(result.trajectory.some((s) => s.agent === "domain_critic")).toBe(false);
    expect(result.trajectory.filter((s) => s.agent === "drafter").length).toBeGreaterThan(0);
  });
});
