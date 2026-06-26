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
import { runAgentLoop, type Recommendation } from "@/lib/agents/loop/orchestrator";
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

/** Scripted draft generate: planted fabrication on call 0, clean on every later call. */
function scriptedDraftGenerate(merchant: Merchant, fab: string) {
  let call = 0;
  return async () => ({ object: call++ === 0 ? generatedFrom(merchant, fab) : generatedFrom(merchant) });
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
    expect(result.costUsd).toBe(0); // R-LOOP-4 / no Gemini
    expect(result.outreachStatus).toBe("simulated_sent");
    expect(result.sent).toBe(true);
    // the FINAL draft is the clean redraft — the fabrication is gone.
    expect(result.draft.draft_body).not.toContain(FABRICATION);
    expect(result.finalVerify.passed).toBe(true);
    expect(result.finalVerify.judge?.mode).toBe("LIVE_JUDGE");

    // ── the trajectory records the correction, and proves the LIVE paths ran (not the mock fallback) ──
    const phases = result.trajectory.map((s) => s.phase);
    expect(phases).toEqual(["plan", "draft", "verify", "reflect", "redraft", "verify", "route"]);

    const draft0 = result.trajectory.find((s) => s.phase === "draft")!;
    const verify0 = result.trajectory.filter((s) => s.phase === "verify")[0];
    const reflect0 = result.trajectory.find((s) => s.phase === "reflect")!;
    const redraft1 = result.trajectory.find((s) => s.phase === "redraft")!;
    const verify1 = result.trajectory.filter((s) => s.phase === "verify")[1];

    expect(draft0.modelMode).toBe("LIVE_AI"); // NOT mockDraft fallback
    expect(verify0.modelMode).toBe("LIVE_JUDGE"); // NOT mockJudge
    expect(verify0.verdictSummary).toContain("any_unsupported=true");
    expect(verify0.verdictSummary).toContain("verify=FAIL");
    expect(reflect0.verdictSummary).toContain(FABRICATION); // the reflection names the failing claim
    expect(redraft1.modelMode).toBe("LIVE_AI");
    expect(verify1.modelMode).toBe("LIVE_JUDGE");
    expect(verify1.verdictSummary).toContain("verify=PASS");

    // audit is distinct from the trajectory (R-LOOP-6) and order-preserving.
    expect(result.audit.map((a) => a.actor)).toEqual(["system", "draft", "gatekeeper", "judge", "system"]);
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
        draftGenerate: async () => ({ object: generatedFrom(merchant, FABRICATION) }),
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

// ───────────────────── R-LOOP-8 fail-closed — a fallback judge never passes (Codex A2 P1) ─────────────────────

describe("R-LOOP-8 fail-closed — a FAILED_TO_FALLBACK judge is held, never sent (Codex A2 P1)", () => {
  it("a clean draft whose LIVE judge call fails (fallback) does NOT pass — held for a human, never sent", async () => {
    const merchant = normalizeRow(mediumInput("Failsafe Falafel", 1, 2), 1);
    const result = await runAgentLoop(
      { input: mediumInput("Failsafe Falafel", 1, 2), index: 1 },
      {
        // a clean draft (would clear the gatekeeper) ...
        draftGenerate: async () => ({ object: generatedFrom(merchant) }),
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
        draftGenerate: async () => ({ object: generatedFrom(merchant) }), // clean draft
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
    expect(snap.trajectory.map((s) => s.phase)).toEqual(["plan", "draft", "verify", "reflect", "redraft", "verify", "route"]);
    expect(snap.note).toContain("SCRIPTED"); // honest labeling (AM-7) — not a live "catches its own mistakes" claim
  });
});
