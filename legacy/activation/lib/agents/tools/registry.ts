/**
 * The A1 agent-tool registry (Phase A1 — tool-ify the deterministic core).
 *
 * Each tool is a thin, typed adapter over an EXISTING deterministic/bounded function:
 *   { name, description, inputSchema, outputSchema, run(input) }
 * `run` parses input on entry, calls EXACTLY the one cited existing function, and validates +
 * returns its result unchanged (modulo Zod parse). A tool adds NO business logic of its own
 * (R-TOOL-1); the schemas reuse the existing types (R-TOOL-2); lib/core/* is untouched (R-TOOL-3).
 *
 * `run` is SYNCHRONOUS by design: every A1 tool wraps a deterministic/offline function, so A1
 * makes ZERO live model calls. (The reverse-faithfulness tool wraps the deterministic MOCK judge,
 * not the live Groq judge — the live path is A2.) An async `run` would be a smell here.
 *
 * The Drafter is deliberately NOT an A1 tool — its bounded LLM surface (draftOutreach) is the
 * action the A2 agent takes, registered there. A1 wraps only the deterministic/bounded controls.
 */
import { z } from "zod";

/** A typed agent tool: a name + Zod I/O contract + a delegation-only `run`. */
export interface Tool<I, O> {
  /** Stable, action-oriented tool name (the agent calls tools by this). */
  readonly name: string;
  /** One-line description of what the tool does (for the agent + humans). */
  readonly description: string;
  /** Zod schema the input is parsed against on entry (validate at the boundary). */
  readonly inputSchema: z.ZodTypeAny;
  /** Zod schema the output satisfies on exit. */
  readonly outputSchema: z.ZodTypeAny;
  /** Delegate to the cited existing function; return its result unchanged (modulo Zod parse). */
  run(input: I): O;
}

import { triageMerchant } from "./triage";
import { diagnoseBlocker } from "./diagnose";
import { checkFaithfulnessForward } from "./faithfulness-forward";
import { checkFaithfulnessReverse } from "./faithfulness-reverse";
import { scoreQuality } from "./score";
import { simulateSend } from "./send";
import { appendAudit } from "./audit";

export {
  triageMerchant,
  diagnoseBlocker,
  checkFaithfulnessForward,
  checkFaithfulnessReverse,
  scoreQuality,
  simulateSend,
  appendAudit,
};

/** All A1 tools, keyed by their tool name — the surface the A2 agent binds to. */
export const toolRegistry = {
  [triageMerchant.name]: triageMerchant,
  [diagnoseBlocker.name]: diagnoseBlocker,
  [checkFaithfulnessForward.name]: checkFaithfulnessForward,
  [checkFaithfulnessReverse.name]: checkFaithfulnessReverse,
  [scoreQuality.name]: scoreQuality,
  [simulateSend.name]: simulateSend,
  [appendAudit.name]: appendAudit,
} as const;

/** The tool names, for discoverability + tests. */
export const TOOL_NAMES = [
  triageMerchant.name,
  diagnoseBlocker.name,
  checkFaithfulnessForward.name,
  checkFaithfulnessReverse.name,
  scoreQuality.name,
  simulateSend.name,
  appendAudit.name,
] as const;
