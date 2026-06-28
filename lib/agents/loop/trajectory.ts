/**
 * THE TRAJECTORY — the agent's reasoning path (R-LOOP-6). A DEDICATED type, deliberately NOT an
 * overload of AuditEntry.actor:
 *   - Audit (lib/replay/run.ts AuditEntry) = what happened TO THE RECORD (triage, gatekeeper, sent).
 *   - Trajectory (here) = HOW THE AGENT REASONED (plan -> draft -> verify -> reflect -> redraft -> route).
 * They are distinct concerns; conflating them was the explicit anti-pattern R-LOOP-6 forbids.
 *
 * The trajectory is serializable + freezable to a fixture served through a getReplaySnapshot()-style
 * seam (lib/agents/loop/snapshot.ts), so the public REPLAY demo can show the self-correction at $0
 * (mirroring lib/data/live-samples.snapshot.json).
 *
 * This module is PURE (types + an in-memory recorder + a pure freeze function); it imports no
 * orchestrator and makes no model call, so there is no import cycle.
 */
import { RUN_TIMESTAMP } from "@/lib/core/constants";
import type { OutreachStatus } from "@/lib/core/constants";
import type { AuditEntry } from "@/lib/replay/run";

/** The loop phases (R-LOOP-6). iter-0 drafting is "draft"; a re-draft after reflection is "redraft". */
export type LoopPhase = "plan" | "draft" | "verify" | "reflect" | "redraft" | "route";

/**
 * WHICH specialist produced a step (R-A3-6 — the A4 "watch the four agents reason" attribution).
 * The four named agents are strategist | drafter | domain_critic | router; "tool" is every
 * deterministic/control step that is NOT one of them (triage/diagnose, the faithfulness control,
 * the deterministic conductor).
 *
 * HONESTY RULE — tool-until-earned (AM-2 "no agent costumes on pipeline stages" + R-A3-1): a step
 * carries an agent role ONLY in the slice that BOTH wires that agent's LLM AND clears its
 * anti-theater seam-eval. Until then it is "tool". `agent` is a positive claim ("this IS the
 * strategist"); `modelMode` does not soften it. So in A2/A3-1 the plan/reflect/route steps are
 * deterministic stand-ins ⇒ "tool"; they flip to "strategist"/"router" in A3-2/A3-5 IFF R-A3-1
 * passes (a demoted candidate stays "tool" automatically). Only the genuinely-generative drafter is
 * an agent today (§11.1 — "already agentic"). This makes the agent column a live anti-theater ledger.
 */
export type TrajectoryAgent = "strategist" | "drafter" | "domain_critic" | "router" | "tool";

/** One tool/action invocation within a step, summarized for the trajectory view. */
export interface TrajectoryToolCall {
  /** The A1 tool name (triage_merchant, ...) or the Drafter action / live judge. */
  tool: string;
  /** A one-line summary of what it returned (not the full payload — that lives in the audit/record). */
  summary: string;
}

/**
 * One step of the agent's reasoning path. The R-LOOP-6 shape exactly:
 * { phase, iteration, toolCalls, modelMode, verdictSummary }.
 */
export interface TrajectoryStep {
  phase: LoopPhase;
  /** WHICH specialist produced the step (R-A3-6). Required so tsc flags any un-attributed record()
   *  site. "tool" until an agent earns its role per the tool-until-earned rule on TrajectoryAgent. */
  agent: TrajectoryAgent;
  /** 0-based loop iteration. plan uses 0; route uses the final iteration. */
  iteration: number;
  /** The tools/actions invoked in this step. */
  toolCalls: TrajectoryToolCall[];
  /** The model mode of any LLM call in this step (AgentMode/JudgeMode), or "DETERMINISTIC_RULES". */
  modelMode: string;
  /** A human-readable summary of the step's outcome (the verify verdict, the reflection, the route). */
  verdictSummary: string;
}

/** A tiny ordered recorder. record() copies the step so later mutation of the source can't leak in. */
export class TrajectoryRecorder {
  private readonly _steps: TrajectoryStep[] = [];

  record(step: TrajectoryStep): void {
    this._steps.push({ ...step, toolCalls: step.toolCalls.map((t) => ({ ...t })) });
  }

  /** The recorded steps, in order (a copy — the recorder stays the single source of truth). */
  steps(): TrajectoryStep[] {
    return this._steps.map((s) => ({ ...s, toolCalls: s.toolCalls.map((t) => ({ ...t })) }));
  }
}

/** The $0 REPLAY fixture the trajectory freezes to (served through getAgentLoopSnapshot()). */
export interface AgentLoopSnapshot {
  servedMode: "REPLAY";
  generatedAt: string;
  /** Honesty note (AM-7 / R-ARCH-3): cross-family verify (A3-3), convergence not calibrated faithfulness. */
  note: string;
  merchantId: string;
  converged: boolean;
  iterations: number;
  stopReason: string;
  outreachStatus: OutreachStatus;
  sent: boolean;
  trajectory: TrajectoryStep[];
  audit: AuditEntry[];
}

/**
 * The default honesty note stamped on a frozen trajectory (AM-7 + R-ARCH-3). Named A2_* for its
 * origin (the grill record cites this constant as where the caveat lives); the CONTENT tracks the
 * live architecture, updated at A3-3 when the Drafter became Gemini (cross-family restored).
 */
export const A2_HONESTY_NOTE =
  "Single-agent verify-and-self-correct loop. CROSS-FAMILY maker!=judge (R-ARCH-3, restored at A3-3): " +
  "the Drafter is Gemini Flash and the reverse-faithfulness judge is Groq gpt-oss-120b (different " +
  "families). The loop proves CONVERGENCE/machinery; the faithfulness judge's calibration label stays " +
  "'directional' and was NOT re-calibrated on live Gemini prose (R-A3-8). No real spend offline; a live " +
  "Gemini Drafter bills every re-draft, ledger-tracked under the $5 cap (live run owner-gated, A3-7).";

/**
 * Freeze a completed loop run into the serializable REPLAY snapshot. PURE — the orchestrator hands in
 * its result fields; this adds the REPLAY framing + the honesty note. The output round-trips through
 * JSON (no functions, no class instances), so it can be written to lib/data/agent-loop.snapshot.json.
 */
export function freezeTrajectory(run: {
  merchantId: string;
  converged: boolean;
  iterations: number;
  stopReason: string;
  outreachStatus: OutreachStatus;
  sent: boolean;
  trajectory: readonly TrajectoryStep[];
  audit: readonly AuditEntry[];
  note?: string;
}): AgentLoopSnapshot {
  return {
    servedMode: "REPLAY",
    generatedAt: RUN_TIMESTAMP,
    note: run.note ?? A2_HONESTY_NOTE,
    merchantId: run.merchantId,
    converged: run.converged,
    iterations: run.iterations,
    stopReason: run.stopReason,
    outreachStatus: run.outreachStatus,
    sent: run.sent,
    trajectory: run.trajectory.map((s) => ({ ...s, toolCalls: s.toolCalls.map((t) => ({ ...t })) })),
    audit: run.audit.map((a) => ({ ...a })),
  };
}
