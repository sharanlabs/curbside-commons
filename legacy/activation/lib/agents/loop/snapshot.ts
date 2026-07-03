/**
 * The $0 REPLAY seam for the A2 trajectory (R-LOOP-6) — mirrors lib/replay/run.ts getReplaySnapshot():
 * build-once, cached, served through one accessor so the public demo / the A4 "watch it reason" view
 * renders the self-correction at $0, no keys, no spend.
 *
 * HOW IT STAYS $0 + DETERMINISTIC + HONEST: it runs the real orchestrator over one merchant with a
 * SCRIPTED deterministic DI — a planted-fabrication draft on iteration-0 then a clean draft on
 * iteration-1, and an injected judge verdict that flags iteration-0 then clears iteration-1. No network,
 * no model call, no spend. This is a SCRIPTED MACHINERY DEMONSTRATION of the loop's control flow; the
 * LIVE CROSS-FAMILY self-correction trajectory (real Gemini drafter + real Groq judge, A3-3) is frozen
 * at the owner-gated A3-7 live run and swapped in behind this same accessor. Labeled as such (AM-7
 * honesty) — it is NOT a live "catches its own mistakes" claim.
 *
 * The injected objects are derived from the grounded deterministic stub (mockDraft) with the real name
 * placeholderized back to {{MERCHANT}}, so after the shared injection-cut they reproduce a gate-passing
 * draft exactly; the planted variant appends one undeclared fabrication (the gold P-timeline pattern)
 * that survives the gatekeeper and only the judge catches.
 */
import { normalizeRow } from "@/legacy/activation/lib/core/pipeline";
import type { MerchantInput } from "@/legacy/activation/lib/core/types";
import { MERCHANT_PLACEHOLDER, mockDraft } from "@/legacy/activation/lib/agents/draft";
import { runAgentLoop } from "@/legacy/activation/lib/agents/loop/orchestrator";
import { A2_HONESTY_NOTE, freezeTrajectory, type AgentLoopSnapshot } from "@/legacy/activation/lib/agents/loop/trajectory";

/** A Medium-risk, contact-eligible restaurant stalled at photos (step 2) — converges + simulated-sends. */
const DEMO_INPUT: MerchantInput = {
  merchant_name: "Curry In A Hurry",
  merchant_category: "Restaurant",
  days_since_signup: 20,
  last_login_days_ago: 10,
  steps_completed: 2,
  source_risk_level: "Medium",
};

/** One undeclared fabrication that survives the deterministic gatekeeper (only the judge catches it). */
const PLANTED_FABRICATION = "We expect your account to be fully approved by Friday.";

/** Build the deterministic scripted DI objects (clean + planted GeneratedDraftSchema; flag + clean verdict). */
function scriptedFixtures() {
  const merchant = normalizeRow(DEMO_INPUT, 1);
  const stub = mockDraft(merchant);
  // Reverse the post-generation substitution: the model authored {{MERCHANT}}, never the real name.
  const toPlaceholder = (s: string) => s.replaceAll(merchant.merchant_name, MERCHANT_PLACEHOLDER);
  const cleanGenerated = {
    risk_explanation: toPlaceholder(stub.risk_explanation),
    blocker_summary: stub.blocker_summary,
    next_best_action: stub.next_best_action,
    draft_subject: toPlaceholder(stub.draft_subject),
    draft_body: toPlaceholder(stub.draft_body),
    claims: stub.claims,
  };
  const plantedGenerated = { ...cleanGenerated, draft_body: `${cleanGenerated.draft_body} ${PLANTED_FABRICATION}` };

  const flagVerdict = {
    claims: [
      { text: "You have completed 2 of 5 onboarding steps.", supported: true, evidence_field: "steps_completed" },
      { text: PLANTED_FABRICATION, supported: false, evidence_field: null },
    ],
    any_unsupported: true,
  };
  const cleanVerdict = {
    claims: [
      { text: "You have completed 2 of 5 onboarding steps.", supported: true, evidence_field: "steps_completed" },
    ],
    any_unsupported: false,
  };
  return { cleanGenerated, plantedGenerated, flagVerdict, cleanVerdict };
}

/** Run the scripted loop and freeze its trajectory to the serializable $0 REPLAY snapshot. */
export async function buildAgentLoopSnapshot(): Promise<AgentLoopSnapshot> {
  const { cleanGenerated, plantedGenerated, flagVerdict, cleanVerdict } = scriptedFixtures();
  let draftCall = 0;
  let judgeCall = 0;
  const result = await runAgentLoop(
    { input: DEMO_INPUT, index: 1 },
    {
      // `live:false` + injected generate => the injected (LIVE_AI / LIVE_JUDGE) paths run, deterministic + $0.
      // The Gemini Drafter (A3-3) needs reported usage to price; ZERO tokens => known $0, no real spend.
      live: false,
      draftGenerate: async () => ({
        object: draftCall++ === 0 ? plantedGenerated : cleanGenerated,
        usage: { inputTokens: 0, outputTokens: 0 },
      }),
      judgeGenerate: async () => ({ object: judgeCall++ === 0 ? flagVerdict : cleanVerdict }),
    },
  );
  return freezeTrajectory({
    merchantId: result.merchant.merchant_id,
    converged: result.converged,
    iterations: result.iterations,
    stopReason: result.stopReason,
    outreachStatus: result.outreachStatus,
    sent: result.sent,
    trajectory: result.trajectory,
    audit: result.audit,
    note:
      `${A2_HONESTY_NOTE} | SCRIPTED deterministic machinery demonstration (planted->clean draft, ` +
      "flag->clean verdict). The Strategist plan, the Router reflect, and the advisory Domain critic shown " +
      "here are their DETERMINISTIC baselines (strongRecommend / strongReflection / mockDomainJudge, $0) — " +
      "the seams are wired (A3-6) but the LLM agents and the live cross-family self-correction trajectory " +
      "(real Gemini drafter + Groq critics) are frozen at the owner-gated A3-7 live run and swapped in " +
      "behind this same accessor.",
  });
}

let cached: Promise<AgentLoopSnapshot> | null = null;

/** The accessor the surface uses (build-once cache; mirrors getReplaySnapshot — async because the loop is). */
export function getAgentLoopSnapshot(): Promise<AgentLoopSnapshot> {
  if (!cached) cached = buildAgentLoopSnapshot();
  return cached;
}
