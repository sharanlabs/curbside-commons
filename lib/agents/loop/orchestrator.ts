/**
 * THE SINGLE-AGENT VERIFY-AND-SELF-CORRECT LOOP (the Router/Conductor in embryo).
 *
 * Given a stalled merchant, ONE orchestrator agent runs:
 *   plan -> draft -> verify -> reflect -> re-draft -> route
 * using ONLY the A1 tools (triage_merchant, diagnose_blocker, check_faithfulness_forward,
 * simulate_send, append_audit) + the LLM Drafter + the LIVE reverse-faithfulness judge.
 * Bounded, observable (a dedicated TrajectoryStep[]). A2 cleared this as the EARLY GO/NO-GO
 * milestone (R-LOOP-1..6); A3-3 swapped the Drafter to Gemini (cross-family, below).
 *
 * Framework decision (R-LOOP-D0): the loop is orchestrated by HAND with a bounded while-loop over the
 * already-installed Vercel `ai` SDK (used in gemini.ts / semantic-judge.ts / groq.ts) — NO LangGraph
 * added (reuse / start-simple, RULES §7). The loop's branching + the hard iteration cap + the typed
 * tool binding + the $0-REPLAY trajectory are all expressible directly; a graph runtime would be new
 * surface for no gain at this scale.
 *
 * CROSS-FAMILY MAKER!=JUDGE — RESTORED AT A3-3 (R-A3-2 / R-ARCH-3): the Drafter is Gemini Flash
 * (`draftOutreach`) and BOTH the reverse-faithfulness judge and (A3-4) the Domain Critic are Groq
 * gpt-oss-120b — model-layer independence, the gap A2 deferred under R-LOOP-5's same-family caveat.
 * Maker!=judge now holds at BOTH the process layer (verify is a distinct control from draft) AND the
 * model layer (different families). The Drafter is the only metered agent and runs every re-draft;
 * its spend is ledger-tracked under the $5 cap (cost notes below). The live run is owner-gated (A3-7).
 *
 * RECOMMEND-NOT-DECIDE — BINDING INVARIANT (AM-4 / R-LOOP-1b): the agent RECOMMENDS strategy/tone/
 * route only. The deterministic eligibility fields (contact_eligible, review_required, approval_state,
 * send_eligible) and the simulated_sent transition stay tool-derived. STRUCTURAL ENFORCEMENT:
 *   (1) the ONLY send-state change in this file flows through the deterministic simulate_send tool,
 *       whose eligibility is computeSendEligible() over the merchant's fields — the agent's
 *       recommendation is recorded but is NEVER an input to it;
 *   (2) assertEligibilityUntouched() HARD-THROWS if any eligibility field moved or if a
 *       simulated_sent landed on a send_eligible:false merchant. Test-locked by R-LOOP-8b.
 */
import type { z } from "zod";
import { AS_OF_DATE, REFERENCE_PLATFORM_NAME, RUN_TIMESTAMP } from "@/lib/core/constants";
import type { OutreachStatus } from "@/lib/core/constants";
import type { Merchant, MerchantInput } from "@/lib/core/types";
import type { Diagnosis } from "@/lib/domain/diagnosis";
import { DEFAULT_BUDGET_CAP_USD } from "@/lib/agents/budget";
import { estimateLiveCallCostUsd, resolvedGeminiModel, type BudgetContext } from "@/lib/agents/gemini";
import { draftOutreach, type OutreachDraft } from "@/lib/agents/draft";
import { judgeDraft, resolvedJudgeProvider, type JudgeResult } from "@/lib/agents/semantic-judge";
import { judgeDomain, resolvedDomainJudgeProvider, type DomainJudgeResult } from "@/lib/agents/domain-judge";
import type { GatekeeperReport } from "@/lib/agents/gatekeeper";
import {
  appendAudit,
  checkFaithfulnessForward,
  diagnoseBlocker,
  simulateSend,
  triageMerchant,
} from "@/lib/agents/tools/registry";
import type { AuditEntry } from "@/lib/replay/run";
import { groqLiveEnabled, liveAiEnabled } from "@/lib/server/env-flags";
import {
  TrajectoryRecorder,
  type TrajectoryStep,
  type TrajectoryToolCall,
} from "@/lib/agents/loop/trajectory";

/** The injectable generate (test/DI) — same shape as draft.ts / semantic-judge.ts. */
type GenerateObjectFn = (a: {
  model: string;
  schema: z.ZodTypeAny;
  prompt: string;
}) => Promise<{ object: unknown; usage?: { inputTokens?: number; outputTokens?: number; totalTokens?: number; finishReason?: string | null } }>;

export type RecommendedRoute = "contact" | "hold_for_review" | "suppress";

/** The agent's PLAN-step recommendation (recommend-not-decide: never feeds the send decision). */
export interface Recommendation {
  route: RecommendedRoute;
  strategy: string;
  tone: string;
  rationale: string;
  /** Optional provenance so the trajectory's modelMode stays honest when an LLM recommend (the A3-2
   *  Strategist) is wired: "LIVE_AI" | "DETERMINISTIC_RULES" | "FAILED_TO_FALLBACK". A deterministic
   *  recommend (defaultRecommend) leaves it undefined ⇒ recorded as DETERMINISTIC_RULES. */
  mode?: string;
  /** Set when a live recommend fell back — the honest reason, surfaced in the trajectory summary. */
  errorClass?: string;
}

export type RecommendFn = (merchant: Merchant, diagnosis: Diagnosis) => Recommendation | Promise<Recommendation>;

export type StopReason = "verified" | "max_iterations" | "budget_guard";

export interface AgentLoopInput {
  /** A raw row to triage in-loop (plan calls triage_merchant). */
  input?: MerchantInput;
  /** 1-based row index for triage (default 1). */
  index?: number;
  /** A pre-triaged merchant (e.g. a gold-set item); skips triage_merchant. */
  merchant?: Merchant;
}

export interface AgentLoopOptions {
  platformName?: string;
  /** Hard iteration cap (R-LOOP-3, bounded). Default 3. Floored at 1. */
  maxIterations?: number;
  /** Cumulative budget ledger for the metered Gemini Drafter ($5 cap; $0 offline). Default { spentUsd:0, estimatedNextUsd:0, capUsd:5 }. */
  budget?: BudgetContext;
  /** Whether the draft + the two critics run live. Default = `crossFamilyReady` = liveAiEnabled() &&
   *  groqLiveEnabled() && resolvedJudgeProvider()==="groq" && resolvedDomainJudgeProvider()==="groq" — a
   *  real cross-family run needs the Gemini-drafter key AND BOTH critics genuinely Groq (the faithfulness
   *  judge AND the Domain Critic, separate envs; R-A3-2). Forcing live:true that is not cross-family-ready
   *  (and not a DI path) THROWS rather than silently going same-family (Codex A3-4 P1). */
  live?: boolean;
  /** Inter-call pacing (ms) against the provider windows (Gemini drafter + Groq judge) — LIVE path only (R-LOOP-4). */
  pacingMs?: number;
  /** Iteration-0 starting draft fed in (R-LOOP-10 seeding); else iteration-0 is generated by the Gemini Drafter. */
  seedDraft?: OutreachDraft;
  /** The agent's plan-judgment seam (default = a deterministic A2 stand-in). */
  recommend?: RecommendFn;
  /** DI: the Drafter's object-generate (offline machinery — provider-agnostic; feeds the Gemini Drafter). */
  draftGenerate?: GenerateObjectFn;
  /** DI: the reverse-faithfulness judge generate (offline machinery — inject the failing verdict). */
  judgeGenerate?: GenerateObjectFn;
  /** DI: the DOMAIN critic's object-generate (offline machinery — inject a per-dimension domain verdict). */
  domainGenerate?: GenerateObjectFn;
}

export interface AgentLoopResult {
  merchant: Merchant;
  recommendation: Recommendation;
  draft: OutreachDraft;
  /** Number of draft attempts made (1..maxIterations). */
  iterations: number;
  /** Verify passed within the cap (gatekeeper approved AND judge all-supported). */
  converged: boolean;
  stopReason: StopReason;
  /** `domain` is the ADVISORY Effective-axis verdict (A3-4) — surfaced for the human gate, NEVER an input
   *  to `passed`/eligibility/the send. `null` when the gatekeeper blocked the draft (the critic is moot). */
  finalVerify: {
    gatekeeper: GatekeeperReport | null;
    judge: JudgeResult | null;
    domain: DomainJudgeResult | null;
    passed: boolean;
  };
  outreachStatus: OutreachStatus;
  sent: boolean;
  /** Total LLM spend across the run. $0 offline (no real call) AND $0 on the public REPLAY demo;
   *  a live Gemini Drafter bills every re-draft — accrued here + ledger-tracked under the $5 cap. */
  costUsd: number;
  audit: AuditEntry[];
  /** The agent's reasoning path (dedicated type — R-LOOP-6). */
  trajectory: TrajectoryStep[];
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * A2 plan-judgment STAND-IN. The genuine LLM strategy judgment is an A3 concern (the Strategist
 * agent); in A2 the recommendation is a bounded deterministic read of the deterministic triage +
 * diagnosis, so A2 stays free + focused on LOOP convergence. Crucially it NEVER feeds the send
 * decision (recommend-not-decide) — eligibility is computeSendEligible's alone.
 */
export function defaultRecommend(merchant: Merchant, diagnosis: Diagnosis): Recommendation {
  if (merchant.suppression_reason.trim() !== "" || !merchant.contact_eligible) {
    return {
      route: "suppress",
      strategy: diagnosis.play.touch,
      tone: "n/a",
      rationale: "Contact suppressed/ineligible — do not draft outreach.",
    };
  }
  if (merchant.review_required) {
    return {
      route: "hold_for_review",
      strategy: diagnosis.play.touch,
      tone: "respectful, low-pressure",
      rationale: `Recommend hold for human review (${merchant.review_reason || "review_required"}).`,
    };
  }
  return {
    route: "contact",
    strategy: diagnosis.play.touch,
    tone: "helpful, concise, no pressure",
    rationale: diagnosis.root_cause_hypothesis,
  };
}

/** The deterministic eligibility fields the agent SHALL NOT touch (R-LOOP-1b). */
function captureEligibility(m: Merchant) {
  return {
    contact_eligible: m.contact_eligible,
    review_required: m.review_required,
    approval_state: m.approval_state,
    send_eligible: m.send_eligible,
  };
}

/** HARD lock: throw if the agent moved an eligibility field or sent an ineligible merchant (R-LOOP-1b). */
function assertEligibilityUntouched(
  before: ReturnType<typeof captureEligibility>,
  merchant: Merchant,
): void {
  const after = captureEligibility(merchant);
  for (const key of Object.keys(before) as (keyof typeof before)[]) {
    if (before[key] !== after[key]) {
      throw new Error(
        `R-LOOP-1b violation: the agent mutated deterministic eligibility "${key}" ` +
          `(${String(before[key])} -> ${String(after[key])}). The agent RECOMMENDS only.`,
      );
    }
  }
  if (merchant.outreach_status === "simulated_sent" && !merchant.send_eligible) {
    throw new Error(
      "R-LOOP-1b violation: outreach_status=simulated_sent for a send_eligible:false merchant. " +
        "Any send for a send_eligible:false merchant is a hard failure.",
    );
  }
}

/** Reflect: read the verify failure and form a CONCRETE revision instruction (R-LOOP-2). */
function buildReflection(gate: GatekeeperReport, judge: JudgeResult): string {
  if (!gate.approvedForHumanReview && gate.failures.length > 0) {
    return (
      `Gatekeeper blocked the draft: ${gate.failures.join("; ")}. ` +
      "Remove or correct the cited claim(s); state only facts present in the merchant record."
    );
  }
  const unsupported = judge.verdict.claims.filter((c) => !c.supported).map((c) => c.text);
  if (unsupported.length > 0) {
    return (
      `Faithfulness judge flagged unsupported assertion(s): ${unsupported.map((t) => `"${t}"`).join("; ")}. ` +
      "Remove them — no merchant field supports them."
    );
  }
  return "Verification failed; remove any assertion not backed by a merchant field.";
}

/**
 * Run the A2 single-agent verify-and-self-correct loop over one stalled merchant.
 * Offline-provable via injected draftGenerate/judgeGenerate; live cross-family (Gemini drafter +
 * Groq judge) when BOTH keys are present (owner-gated, A3-7).
 */
export async function runAgentLoop(
  input: AgentLoopInput,
  opts: AgentLoopOptions = {},
): Promise<AgentLoopResult> {
  const platformName = opts.platformName ?? REFERENCE_PLATFORM_NAME;
  const maxIterations = Math.max(1, opts.maxIterations ?? 3);
  // CLONE the budget so the cumulative ledger we accrue across re-drafts (the Gemini Drafter bills
  // every iteration) never mutates the caller's object; default is a fresh $5-capped ledger.
  const budget: BudgetContext = { ...(opts.budget ?? { spentUsd: 0, estimatedNextUsd: 0, capUsd: DEFAULT_BUDGET_CAP_USD }) };
  // CROSS-FAMILY READINESS (R-A3-2; Codex A3-3 P1 + A3-4). A real cross-family live run needs the Gemini
  // Drafter key (liveAiEnabled) AND BOTH Groq critics — the Groq key (groqLiveEnabled) AND BOTH judge
  // providers actually resolving to "groq": the faithfulness judge (resolvedJudgeProvider) AND the Domain
  // Critic (resolvedDomainJudgeProvider, a SEPARATE DOMAIN_JUDGE_PROVIDER env). Either flipped to gemini
  // would run a SAME-family critic while the code claims cross-family.
  const crossFamilyReady =
    liveAiEnabled() &&
    groqLiveEnabled() &&
    resolvedJudgeProvider() === "groq" &&
    resolvedDomainJudgeProvider() === "groq";
  // FAIL CLOSED on a FORCED live:true that bypasses the default gate (Codex A3-4 P1, round 2): a caller
  // that forces live:true with a non-Groq critic config (e.g. DOMAIN_JUDGE_PROVIDER=gemini) would run
  // same-family critics under a cross-family banner. The exemption requires FULLY-injected DI — ALL of
  // draft + judge + domain generates — because PARTIAL DI still leaves the non-injected critic making a
  // REAL provider call (e.g. live:true + draftGenerate only + DOMAIN_JUDGE_PROVIDER=gemini would run a
  // real Gemini Domain Critic). A REAL forced-live run that is not cross-family-ready THROWS rather than
  // silently going same-family. (The A3-7 harness forces live:true only behind its crossFamilyReady skip-gate.)
  const fullyInjectedDI = Boolean(opts.draftGenerate && opts.judgeGenerate && opts.domainGenerate);
  if (opts.live === true && !crossFamilyReady && !fullyInjectedDI) {
    throw new Error(
      "R-A3-2: live:true requested but cross-family is not ready — need the Gemini Drafter key AND BOTH " +
        "the faithfulness judge and the Domain Critic resolving to Groq (check ENABLE_LIVE_AI, GEMINI_API_KEY, " +
        "GROQ_API_KEY, JUDGE_PROVIDER=groq, DOMAIN_JUDGE_PROVIDER=groq).",
    );
  }
  const live = opts.live ?? crossFamilyReady;
  const recommend = opts.recommend ?? defaultRecommend;
  const recorder = new TrajectoryRecorder();

  // ─────────────────────────────── PLAN ───────────────────────────────
  // Work on a CLONE so a passed-in merchant (e.g. a gold item) is never mutated by the loop.
  let merchant: Merchant;
  const planToolCalls: TrajectoryToolCall[] = [];
  if (input.merchant) {
    merchant = { ...input.merchant };
    planToolCalls.push({
      tool: "triage_merchant",
      summary: `pre-triaged ${merchant.merchant_id} (risk=${merchant.risk_level}, send_eligible=${merchant.send_eligible})`,
    });
  } else if (input.input) {
    merchant = triageMerchant.run({ index: input.index ?? 1, row: input.input });
    planToolCalls.push({
      tool: "triage_merchant",
      summary: `${merchant.merchant_id} risk=${merchant.risk_level} send_eligible=${merchant.send_eligible}`,
    });
  } else {
    throw new Error("runAgentLoop: provide either `input` (to triage) or `merchant` (pre-triaged).");
  }

  // Snapshot the deterministic eligibility BEFORE the loop — the recommend-not-decide lock (R-LOOP-1b).
  const eligibilityBefore = captureEligibility(merchant);

  const diagnosis = diagnoseBlocker.run(merchant);
  planToolCalls.push({
    tool: "diagnose_blocker",
    summary: `engagement=${diagnosis.engagement_state}; play=${diagnosis.play.touch}`,
  });
  // `recommend` may be sync (defaultRecommend) or async (the A3-2 LLM Strategist) — await covers both.
  // RECOMMEND-NOT-DECIDE (R-A3-3 / R-LOOP-1b), enforced two ways:
  //   (1) ISOLATION: recommend gets a defensive CLONE, so a recommend impl physically cannot mutate the
  //       loop's merchant (eligibility) — the contract is structural, not just the end-of-loop assert
  //       (which stays as belt). [Codex A3-2a P3]
  //   (2) ADVISORY, NOT CLAMPED: the recommendation is the agent's voice, recorded FAITHFULLY — NOT
  //       clamped here, so the trajectory honestly shows what the agent recommended (incl. an over-eager
  //       route) and the firewall stays demonstrable (R-LOOP-8b seeds a "send anyway" route and proves
  //       the system holds). `route` never feeds the send (eligibility is computeSendEligible's alone);
  //       each recommend owns its OWN envelope discipline — the live Strategist clamps its LLM route
  //       inside strategistRecommend (clampRouteToEnvelope), never trusting the model.
  const recommendation = await recommend({ ...merchant }, diagnosis);
  recorder.record({
    phase: "plan",
    // tool-until-earned (R-A3-6): the recommend seam is a deterministic stand-in in A2/A3-1; it flips to
    // "strategist" in A3-2 IFF the Strategist clears its R-A3-1 anti-theater eval. Until then, "tool".
    agent: "tool",
    iteration: 0,
    toolCalls: planToolCalls,
    // HONEST PROVENANCE (Codex A3-2a P2): reflect the recommend's actual mode (an LLM Strategist may be
    // LIVE_AI/FAILED_TO_FALLBACK), NOT a hardcoded literal — even while `agent` stays "tool".
    modelMode: recommendation.mode ?? "DETERMINISTIC_RULES",
    verdictSummary:
      `recommend=${recommendation.route}; strategy=${recommendation.strategy}; ${recommendation.rationale}` +
      (recommendation.errorClass ? ` (fallback: ${recommendation.errorClass})` : ""),
  });

  // ──────────────── DRAFT -> VERIFY -> REFLECT -> RE-DRAFT (bounded) ────────────────
  let draft: OutreachDraft | null = null;
  let lastGate: GatekeeperReport | null = null;
  let lastJudge: JudgeResult | null = null;
  let lastDomain: DomainJudgeResult | null = null; // ADVISORY Effective-axis verdict (A3-4); never gates.
  let attempts = 0;
  let verifyPassed = false;
  let stopReason: StopReason = "max_iterations";
  let instruction: string | undefined;
  let totalCostUsd = 0;

  for (let i = 0; i < maxIterations; i++) {
    attempts = i + 1;

    // ── DRAFT (or iteration-0 seed) ──
    let draftMode: string;
    let draftErrorClass: string | undefined;
    if (i === 0 && opts.seedDraft) {
      draft = opts.seedDraft;
      draftMode = "REPLAY"; // a fed-in starting draft (R-LOOP-10 seeding); no model call here
      recorder.record({
        phase: "draft",
        // a FED-IN fixture (modelMode "REPLAY", no generative call) — NOT a Drafter-produced step, so
        // "tool", not "drafter" (tool-until-earned / AM-2: only a genuinely-GENERATED draft/redraft
        // earns "drafter"; labeling a seeded fixture "drafter" would be a costume). [Codex A3-1 F1]
        agent: "tool",
        iteration: i,
        toolCalls: [{ tool: "seed_draft", summary: "iteration-0 starting draft fed in (R-LOOP-10)" }],
        modelMode: draftMode,
        verdictSummary: `subject="${draft.draft_subject}"; claims=${draft.claims.length}`,
      });
    } else {
      if (live && opts.pacingMs) await sleep(opts.pacingMs);
      // CUMULATIVE LEDGER (the cap is across the WHOLE run, not per call): reserve a conservative
      // Gemini estimate before the metered call, then accrue the actual cost into budget.spentUsd so
      // the NEXT re-draft's assertWithinBudget sees the running total. Offline DI => $0, no-op.
      budget.estimatedNextUsd = estimateLiveCallCostUsd(resolvedGeminiModel());
      const draftResult = await draftOutreach(merchant, {
        platformName,
        instruction,
        live,
        budget,
        generate: opts.draftGenerate,
      });
      totalCostUsd += draftResult.costUsd;
      budget.spentUsd += draftResult.costUsd;
      draft = draftResult.draft;
      draftMode = draftResult.mode;
      draftErrorClass = draftResult.errorClass;
      recorder.record({
        phase: i === 0 ? "draft" : "redraft",
        agent: "drafter", // generative prose composition is the Drafter's real seam (Gemini at A3-3 — cross-family)
        iteration: i,
        toolCalls: [{ tool: "draft_outreach", summary: `mode=${draftResult.mode}` }],
        modelMode: draftMode,
        verdictSummary:
          `subject="${draft.draft_subject}"; claims=${draft.claims.length}` +
          (draftErrorClass ? `; errorClass=${draftErrorClass}` : ""),
      });
      // Budget-guard trip: a Gemini cap breach surfaces as "Budget hard-stop" -> stop bounded, held
      // (the metered Drafter CAN trip this now; offline DI never does). NOT the agent touching eligibility.
      if (draftErrorClass?.includes("Budget hard-stop")) {
        stopReason = "budget_guard";
        break;
      }
    }

    // ── VERIFY: forward gatekeeper (A1 tool) AND reverse LIVE judge (judgeDraft live path) ──
    // The A1 check_faithfulness_reverse tool wraps the MOCK judge (the $0 REPLAY plumbing); the LOOP's
    // reverse check is the LIVE Groq judge (§6.1), driven offline by an injected verdict (R-LOOP-8) so
    // the test isolates the loop and does NOT lean on the mock keyword heuristic to detect.
    const gate = checkFaithfulnessForward.run({ draft, merchant, platformName });
    if (live && opts.pacingMs) await sleep(opts.pacingMs);
    const judge = await judgeDraft(draft, merchant, {
      live,
      budget,
      platformName,
      generate: opts.judgeGenerate,
    });
    totalCostUsd += judge.costUsd;
    budget.spentUsd += judge.costUsd; // accrue ALL metered spend into the ledger (Groq judge => $0 no-op;
    // a configured Gemini judge would accrue, so a later draft's assertWithinBudget can't undercount). [Codex A3-3 P2]
    lastGate = gate;
    lastJudge = judge;
    const supported = judge.verdict.claims.filter((c) => c.supported).length;
    // R-LOOP-3(a) is the authoritative pass condition: gatekeeper PASS/WARN (no failures =
    // approvedForHumanReview) AND the judge reports all-supported.
    // FAIL CLOSED (Codex A2 P1): a judge that FELL BACK to the deterministic mock (the live call
    // failed / was rate-limited) never actually ran the reverse-faithfulness check — its clean verdict
    // must NOT count as verification. Treat FAILED_TO_FALLBACK as not-passed, so the draft is re-drafted
    // or held for a human, NEVER sent on the keyword-mock's say-so.
    verifyPassed =
      gate.approvedForHumanReview &&
      judge.mode !== "FAILED_TO_FALLBACK" &&
      !judge.verdict.any_unsupported;
    recorder.record({
      phase: "verify",
      // the faithfulness check is a CONTROL, not one of the four product agents (it stays "tool");
      // the domain_critic enters VERIFY as a SECOND verify-phase step in A3-4.
      agent: "tool",
      iteration: i,
      toolCalls: [
        { tool: "check_faithfulness_forward", summary: `${gate.status} (${gate.failures.length} fail)` },
        {
          tool: "check_faithfulness_reverse",
          summary: `${judge.mode} ${supported}/${judge.verdict.claims.length} supported; any_unsupported=${judge.verdict.any_unsupported}`,
        },
      ],
      modelMode: judge.mode,
      verdictSummary: `gatekeeper=${gate.status}; judge any_unsupported=${judge.verdict.any_unsupported}; verify=${verifyPassed ? "PASS" : "FAIL"}`,
    });

    // ── DOMAIN CRITIC (A3-4): the 2nd VERIFY-phase critic — the calibrated Effective-axis judge ──
    // ADVISORY + INDEPENDENT (R-A3-4): it gets ONLY the draft + the merchant (judgeDomain withholds
    // diagnose().play via domainSituation, R-DARCH-2) and is NOT passed the faithfulness verdict, so it
    // is formed without it. Its verdict NEVER feeds verifyPassed/eligibility/the send (verifyPassed was
    // ALREADY finalized above; nothing below reads lastDomain into a gate). It runs ONLY on a gatekeeper-
    // APPROVED draft (R-DARCH-4 ordering: gatekeeper → faithfulness → domain; a blocked draft is moot).
    //
    // LABEL DEFERS — the step is "tool", NOT "domain_critic" (A3-4 anti-theater eval, floor-not-ceiling):
    // on the held-out gold the deterministic mockDomainJudge TIES the live judge (both F1 1.00), so the
    // eval is a NECESSARY FLOOR (it fails a critic WORSE than the baseline), NOT a label-earning ceiling.
    // The label flips to "domain_critic" IFF a future discriminating eval shows the live judge materially
    // beats the mock (evals/domain-critic-antitheater.test.ts locks the defer). Tool-until-earned (AM-2).
    //
    // RESET per iteration (Codex A3-4 P2): lastDomain holds ONLY the current draft's verdict, so if the
    // FINAL iteration's gatekeeper BLOCKS (skipping the domain critic), finalVerify.domain + the audit are
    // null — never a stale verdict from an earlier approved draft.
    lastDomain = null;
    if (gate.approvedForHumanReview) {
      if (live && opts.pacingMs) await sleep(opts.pacingMs);
      const domain = await judgeDomain(draft, merchant, { live, budget, generate: opts.domainGenerate });
      totalCostUsd += domain.costUsd;
      budget.spentUsd += domain.costUsd; // accrue ALL metered spend (Groq domain critic => $0 no-op).
      lastDomain = domain;
      const dimsPassed = domain.verdict.dimensions.filter((d) => d.pass).length;
      recorder.record({
        phase: "verify",
        agent: "tool", // label DEFERS (see above) — flips to "domain_critic" only when the eval earns it
        iteration: i,
        toolCalls: [
          {
            tool: "check_domain_quality",
            summary: `${domain.mode} ${dimsPassed}/${domain.verdict.dimensions.length} dims passed; domain_defective=${domain.verdict.domain_defective}`,
          },
        ],
        modelMode: domain.mode,
        // ADVISORY — surfaced for the human gate; "directional" calibration label held (R-A3-8: the judge
        // was calibrated on the synthetic gold, NOT on live Gemini prose). Never changes the send.
        verdictSummary: `domain_defective=${domain.verdict.domain_defective} (ADVISORY — directional; does not gate the send)`,
      });
    }

    if (verifyPassed) {
      stopReason = "verified";
      break;
    }

    // ── REFLECT: which claim/field failed -> a concrete revision instruction (R-LOOP-2) ──
    instruction = buildReflection(gate, judge);
    recorder.record({
      phase: "reflect",
      // buildReflection is the Router/Conductor's revision-synthesis seam, deterministic in A2; it
      // flips to "router" in A3-5 IFF the Router clears its R-A3-1 eval vs buildReflection. Until then "tool".
      agent: "tool",
      iteration: i,
      toolCalls: [],
      modelMode: "DETERMINISTIC_RULES",
      verdictSummary: instruction,
    });
    // loop continues -> re-draft with `instruction`; if i was the last, the loop exits -> "max_iterations".
  }

  // ─────────────────────────────── ROUTE ───────────────────────────────
  // RECOMMEND-NOT-DECIDE (R-LOOP-1b): the send transition flows ONLY through simulate_send, whose
  // eligibility = computeSendEligible over the merchant's deterministic fields. The agent's
  // recommendation is recorded but is NEVER an input to it.
  const finalDraft = draft as OutreachDraft; // at least one attempt always ran (maxIterations >= 1)
  let sent = false;
  let outreachStatus: OutreachStatus;
  const routeToolCalls: TrajectoryToolCall[] = [];

  if (verifyPassed) {
    // Clean draft -> the deterministic post-draft state (exactly as runCore sets it, pipeline.ts:250-252).
    merchant.outreach_status = "drafted";
    merchant.last_outreach_at = AS_OF_DATE;
    // Consult the ONLY send path. It recomputes eligibility deterministically — the agent cannot force it.
    const send = simulateSend.run(merchant);
    routeToolCalls.push({
      tool: "simulate_send",
      summary: `send_eligible=${send.send_eligible}; status=${send.outreach_status}`,
    });
    if (send.outreach_status === "simulated_sent") {
      merchant.idempotency_key = send.idempotency_key;
      merchant.outreach_status = "simulated_sent";
      merchant.last_outreach_at = AS_OF_DATE;
      sent = true;
    }
    outreachStatus = merchant.outreach_status; // simulated_sent (eligible) or drafted (held for human)
  } else {
    // Could not self-correct (or budget guard): WITHHOLD the draft from the send tool — the verify gate
    // holds it for a human (the judge is recall-favoring; it never auto-rejects). This is the loop's
    // bounded stop, NOT the agent touching eligibility.
    if (lastGate && !lastGate.approvedForHumanReview) {
      merchant.outreach_status = "draft_rejected"; // gatekeeper BLOCKED -> core auto-reject semantics
    } else {
      merchant.outreach_status = "drafted"; // gate-approved but judge-flagged (or no verdict) -> held
      merchant.last_outreach_at = AS_OF_DATE;
    }
    outreachStatus = merchant.outreach_status;
    routeToolCalls.push({ tool: "human_gate", summary: `held (${stopReason}); simulate_send NOT consulted` });
  }

  // HARD LOCK (R-LOOP-1b): the agent mutated nothing eligibility-bearing; no ineligible send landed.
  assertEligibilityUntouched(eligibilityBefore, merchant);

  // ── AUDIT (built via the append_audit A1 tool — distinct from the trajectory, R-LOOP-6) ──
  let audit: AuditEntry[] = [];
  audit = appendAudit.run({
    log: audit,
    entry: {
      at: RUN_TIMESTAMP,
      actor: "system",
      action: "TRIAGE",
      detail: `risk=${merchant.risk_level}; blocker=${merchant.current_blocker_code}; engagement=${diagnosis.engagement_state}; recommend=${recommendation.route}`,
    },
  });
  audit = appendAudit.run({
    log: audit,
    entry: {
      at: RUN_TIMESTAMP,
      actor: "draft",
      action: live ? "LIVE_AI_GEMINI" : "MACHINERY",
      detail: `${attempts} draft attempt(s); converged=${verifyPassed} (${stopReason})`,
    },
  });
  if (lastGate) {
    audit = appendAudit.run({
      log: audit,
      entry: {
        at: RUN_TIMESTAMP,
        actor: "gatekeeper",
        action: lastGate.status,
        detail: `${lastGate.failures.length} failure(s), ${lastGate.warnings.length} warning(s)`,
      },
    });
  }
  if (lastJudge) {
    const sup = lastJudge.verdict.claims.filter((c) => c.supported).length;
    audit = appendAudit.run({
      log: audit,
      entry: {
        at: RUN_TIMESTAMP,
        actor: "judge",
        action: lastJudge.mode,
        detail: `${sup}/${lastJudge.verdict.claims.length} prose assertions supported; any_unsupported=${lastJudge.verdict.any_unsupported}`,
      },
    });
  }
  if (lastDomain) {
    const dimsPassed = lastDomain.verdict.dimensions.filter((d) => d.pass).length;
    audit = appendAudit.run({
      log: audit,
      entry: {
        at: RUN_TIMESTAMP,
        actor: "domain", // the ADVISORY Effective-axis critic (A3-4); ordered after `judge`, before the final system entry
        action: lastDomain.mode,
        detail:
          `${dimsPassed}/${lastDomain.verdict.dimensions.length} domain-quality dimensions passed` +
          (lastDomain.verdict.domain_defective
            ? " → domain quality flagged (ADVISORY — surfaced for review; does not change the send or eligibility)."
            : "."),
      },
    });
  }
  audit = appendAudit.run({
    log: audit,
    entry: {
      at: RUN_TIMESTAMP,
      actor: "system",
      action: outreachStatus.toUpperCase(),
      detail: sent
        ? "Eligible and verified — simulated send recorded (idempotent)."
        : verifyPassed
          ? "Verified but not send-eligible — held for human approval."
          : `Could not self-correct within ${maxIterations} — held for human review.`,
    },
  });

  recorder.record({
    phase: "route",
    // the deterministic conductor in A2 (route recommendation + rationale); flips to "router" in A3-5
    // with reflect, IFF R-A3-1 passes. Recommend-only either way (R-A3-3).
    agent: "tool",
    iteration: attempts - 1,
    toolCalls: [...routeToolCalls, { tool: "append_audit", summary: `${audit.length} entries` }],
    modelMode: "DETERMINISTIC_RULES",
    verdictSummary: `${stopReason}; outreach_status=${outreachStatus}; sent=${sent}`,
  });

  return {
    merchant,
    recommendation,
    draft: finalDraft,
    iterations: attempts,
    converged: verifyPassed,
    stopReason,
    finalVerify: { gatekeeper: lastGate, judge: lastJudge, domain: lastDomain, passed: verifyPassed },
    outreachStatus,
    sent,
    costUsd: totalCostUsd,
    audit,
    trajectory: recorder.steps(),
  };
}
