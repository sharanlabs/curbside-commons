/**
 * THE A2 SINGLE-AGENT VERIFY-AND-SELF-CORRECT LOOP (the Router/Conductor in embryo).
 *
 * Given a stalled merchant, ONE orchestrator agent runs:
 *   plan -> draft -> verify -> reflect -> re-draft -> route
 * using ONLY the A1 tools (triage_merchant, diagnose_blocker, check_faithfulness_forward,
 * simulate_send, append_audit) + a Groq drafting action + the LIVE reverse-faithfulness judge.
 * Bounded, free on Groq, observable (a dedicated TrajectoryStep[]). This is the EARLY GO/NO-GO
 * milestone — a true agent on its own (R-LOOP-1..6).
 *
 * Framework decision (R-LOOP-D0): the loop is orchestrated by HAND with a bounded while-loop over the
 * already-installed Vercel `ai` SDK (used in gemini.ts / semantic-judge.ts / groq.ts) — NO LangGraph
 * added (reuse / start-simple, RULES §7). The loop's branching + the hard iteration cap + the typed
 * tool binding + the $0-REPLAY trajectory are all expressible directly; a graph runtime would be new
 * surface for no gain at this scale.
 *
 * SAME-FAMILY VERIFY — DOCUMENTED LIMITATION (R-LOOP-5): the drafter AND the reverse-faithfulness
 * judge are both Groq gpt-oss-120b. A2 asserts loop CONVERGENCE/machinery, NOT calibrated
 * faithfulness. Maker!=judge still holds at the PROCESS layer (verify is a distinct control from
 * draft); model-layer independence (R-ARCH-3) is restored at A3 (Gemini drafter, Groq judges
 * cross-family). Not overclaimed.
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
import type { BudgetContext } from "@/lib/agents/gemini";
import type { OutreachDraft } from "@/lib/agents/draft";
import { draftOutreachGroq } from "@/lib/agents/groq-draft";
import { judgeDraft, type JudgeResult } from "@/lib/agents/semantic-judge";
import type { GatekeeperReport } from "@/lib/agents/gatekeeper";
import {
  appendAudit,
  checkFaithfulnessForward,
  diagnoseBlocker,
  simulateSend,
  triageMerchant,
} from "@/lib/agents/tools/registry";
import type { AuditEntry } from "@/lib/replay/run";
import { judgeLiveEnabled } from "@/lib/server/env-flags";
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
}

export type RecommendFn = (merchant: Merchant, diagnosis: Diagnosis) => Recommendation;

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
  /** Cumulative budget ledger (free Groq => $0). Default { spentUsd:0, estimatedNextUsd:0, capUsd:5 }. */
  budget?: BudgetContext;
  /** Whether the draft/judge run live. Default judgeLiveEnabled() (the A2 Groq gate). */
  live?: boolean;
  /** Inter-call pacing (ms) against the Groq day-window — used by the LIVE path only (R-LOOP-4). */
  pacingMs?: number;
  /** Iteration-0 starting draft fed in (R-LOOP-10 seeding); else iteration-0 is generated on Groq. */
  seedDraft?: OutreachDraft;
  /** The agent's plan-judgment seam (default = a deterministic A2 stand-in). */
  recommend?: RecommendFn;
  /** DI: the Groq drafting generate (offline machinery). */
  draftGenerate?: GenerateObjectFn;
  /** DI: the reverse-faithfulness judge generate (offline machinery — inject the failing verdict). */
  judgeGenerate?: GenerateObjectFn;
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
  finalVerify: { gatekeeper: GatekeeperReport | null; judge: JudgeResult | null; passed: boolean };
  outreachStatus: OutreachStatus;
  sent: boolean;
  /** Total LLM spend across the run. ALWAYS 0 on A2 (free Groq, zero Gemini) — R-LOOP-4. */
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
 * Offline-provable via injected draftGenerate/judgeGenerate; live on free Groq when keyed.
 */
export async function runAgentLoop(
  input: AgentLoopInput,
  opts: AgentLoopOptions = {},
): Promise<AgentLoopResult> {
  const platformName = opts.platformName ?? REFERENCE_PLATFORM_NAME;
  const maxIterations = Math.max(1, opts.maxIterations ?? 3);
  const budget: BudgetContext = opts.budget ?? { spentUsd: 0, estimatedNextUsd: 0, capUsd: DEFAULT_BUDGET_CAP_USD };
  const live = opts.live ?? judgeLiveEnabled();
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
  const recommendation = recommend(merchant, diagnosis);
  recorder.record({
    phase: "plan",
    iteration: 0,
    toolCalls: planToolCalls,
    modelMode: "DETERMINISTIC_RULES",
    verdictSummary: `recommend=${recommendation.route}; strategy=${recommendation.strategy}; ${recommendation.rationale}`,
  });

  // ──────────────── DRAFT -> VERIFY -> REFLECT -> RE-DRAFT (bounded) ────────────────
  let draft: OutreachDraft | null = null;
  let lastGate: GatekeeperReport | null = null;
  let lastJudge: JudgeResult | null = null;
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
        iteration: i,
        toolCalls: [{ tool: "seed_draft", summary: "iteration-0 starting draft fed in (R-LOOP-10)" }],
        modelMode: draftMode,
        verdictSummary: `subject="${draft.draft_subject}"; claims=${draft.claims.length}`,
      });
    } else {
      if (live && opts.pacingMs) await sleep(opts.pacingMs);
      const draftResult = await draftOutreachGroq(merchant, {
        platformName,
        instruction,
        live,
        budget,
        generate: opts.draftGenerate,
      });
      totalCostUsd += draftResult.costUsd;
      draft = draftResult.draft;
      draftMode = draftResult.mode;
      draftErrorClass = draftResult.errorClass;
      recorder.record({
        phase: i === 0 ? "draft" : "redraft",
        iteration: i,
        toolCalls: [{ tool: "draft_outreach_groq", summary: `mode=${draftResult.mode}` }],
        modelMode: draftMode,
        verdictSummary:
          `subject="${draft.draft_subject}"; claims=${draft.claims.length}` +
          (draftErrorClass ? `; errorClass=${draftErrorClass}` : ""),
      });
      // Budget-guard trip (defense-in-depth; never fires on free Groq). Stop bounded -> held.
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

    if (verifyPassed) {
      stopReason = "verified";
      break;
    }

    // ── REFLECT: which claim/field failed -> a concrete revision instruction (R-LOOP-2) ──
    instruction = buildReflection(gate, judge);
    recorder.record({
      phase: "reflect",
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
      action: live ? "LIVE_AI_GROQ" : "MACHINERY",
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
    finalVerify: { gatekeeper: lastGate, judge: lastJudge, passed: verifyPassed },
    outreachStatus,
    sent,
    costUsd: totalCostUsd,
    audit,
    trajectory: recorder.steps(),
  };
}
