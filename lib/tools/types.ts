/**
 * A0 tool-registry types — the ONE seam every later surface (MCP server, agent
 * crew, delivery builders, n8n lane) will consume (plan §3, §5 row A0).
 *
 * A {@link ToolResult} is the typed, FROZEN envelope every registry tool
 * returns: which tool ran, whether it passed (`ok`), its exit code, the two
 * honesty flags a consumer must never miss (`demoOnly` / `advisory` +
 * `earnsLabel`), and `canonical` — the tool's own named-serializer string
 * output (the differential tests compare this field byte-for-byte against a
 * direct call through the SAME serializer; see plan AC-2). `canonical` stays a
 * bare string on purpose: its INNER shape is each engine serializer's own
 * contract, not re-schematized here (plan §5 row A0 note).
 *
 * `freezeToolResult` is the ONLY sanctioned envelope constructor: it enforces
 * the one hard invariant every tool must honor (`ok` iff `exitCode === 0`) and
 * freezes the result, so no tool can hand back a self-contradicting envelope.
 *
 * Plain: every tool in this registry hands back the same-shaped little
 * receipt — which tool ran, did it pass, what its exit code was, and (when it
 * matters) a big flashing "this is a demo" or "this is just a suggestion, not
 * a verdict" flag — plus the tool's own answer as one exact text block.
 */
import type { ErrorObject } from "ajv";

/** The typed, frozen result every registry tool hands back (plan §3). */
export interface ToolResult {
  /** The tool's registry name (e.g. "check_feed"). */
  readonly tool: string;
  /** `false` iff `exitCode !== 0` — enforced by {@link freezeToolResult}. */
  readonly ok: boolean;
  /** The tool's exit code, passed through from (or assigned per) its engine entry point. */
  readonly exitCode: number;
  /** `true` ONLY on `run_demo` — a walkthrough, never an audit result (Codex amendment 7). */
  readonly demoOnly?: true;
  /** `true` ONLY on `classify_and_audit` — a lead, never a verdict (Codex amendment 6). */
  readonly advisory?: true;
  /** Whether the classifier behind an advisory tool has EARNED its label (AM-7); always `false` for the deterministic baseline. */
  readonly earnsLabel?: boolean;
  /** The tool's own named-serializer string output — the differential contract (AC-2). */
  readonly canonical: string;
}

/** Raw input to {@link freezeToolResult} — everything but the frozen guarantee. */
export type ToolResultInput = {
  readonly tool: string;
  readonly ok: boolean;
  readonly exitCode: number;
  readonly demoOnly?: true;
  readonly advisory?: true;
  readonly earnsLabel?: boolean;
  readonly canonical: string;
};

/**
 * The ONLY sanctioned {@link ToolResult} constructor. Enforces the one
 * envelope invariant every tool must honor (`ok` iff `exitCode === 0`) before
 * freezing — a tool cannot hand back `{ ok: true, exitCode: 1 }` or vice versa
 * without this throwing loudly first.
 */
export function freezeToolResult(input: ToolResultInput): ToolResult {
  if (input.ok !== (input.exitCode === 0)) {
    throw new Error(
      `tool "${input.tool}": envelope invariant violated — ok (${input.ok}) must equal (exitCode === 0), got exitCode ${input.exitCode}`,
    );
  }
  return Object.freeze({ ...input });
}

/**
 * One registered tool: its name, an optional registry-level `demoOnly` marker
 * (set on `run_demo` only), its committed input/output JSON Schemas, and its
 * `run` function. `run` receives params that {@link callTool} has ALREADY
 * validated against `inputSchema` — a tool file may safely narrow `params` to
 * its own params type.
 */
export interface ToolDefinition {
  readonly name: string;
  readonly demoOnly?: true;
  readonly inputSchema: Readonly<Record<string, unknown>>;
  readonly outputSchema: Readonly<Record<string, unknown>>;
  run(params: unknown): ToolResult;
}

/**
 * Metadata-only view of one registered tool — what the registry EXPOSES for
 * listing (name, honesty marker, committed schemas). Deliberately carries NO
 * `run`: `callTool` is the only execution path, so no consumer can bypass the
 * ajv input validation (Codex A0 review, finding 1).
 */
export interface ToolMetadata {
  readonly name: string;
  readonly demoOnly?: true;
  readonly inputSchema: Readonly<Record<string, unknown>>;
  readonly outputSchema: Readonly<Record<string, unknown>>;
}

/**
 * Assert a {@link ToolResult} is DECISION-GRADE — i.e. safe to treat as an
 * audit verdict. Throws loudly on a `demoOnly` envelope (`run_demo` is a
 * walkthrough, never a result — plan Codex amendment 7) and on an `advisory`
 * envelope (`classify_and_audit` carries leads, never verdicts — use
 * `audit_statement` for the verdict; plan Codex amendment 6). Every later
 * consumer (A1 MCP handlers, A2 crew, A4 n8n) must call this wherever an
 * audit result is required (Codex A0 review, finding 4).
 *
 * Plain: the bouncer that stops a demo printout or an AI hunch from ever being
 * waved through as a real audit verdict.
 */
export function assertDecisionGrade(result: ToolResult): ToolResult {
  if (result.demoOnly === true) {
    throw new Error(
      `tool "${result.tool}": demoOnly output is a walkthrough, never an audit result — do not consume it where a verdict is required`,
    );
  }
  if (result.advisory === true) {
    throw new Error(
      `tool "${result.tool}": advisory output carries candidate leads, never a verdict — use "audit_statement" for the decision-grade report`,
    );
  }
  return result;
}

/** Thrown by {@link import("./registry.ts").callTool} when `params` fails ajv validation against the tool's committed input schema. */
export class ToolInputError extends Error {
  readonly tool: string;
  readonly ajvErrors: readonly ErrorObject[];
  constructor(tool: string, ajvErrors: readonly ErrorObject[]) {
    super(
      `tool "${tool}": input failed schema validation (${ajvErrors.length} error(s)): ${JSON.stringify(ajvErrors)}`,
    );
    this.name = "ToolInputError";
    this.tool = tool;
    this.ajvErrors = Object.freeze([...ajvErrors]);
  }
}

/** Thrown by {@link import("./registry.ts").callTool} when `name` is not a registered tool. */
export class ToolNotFoundError extends Error {
  readonly tool: string;
  constructor(tool: string) {
    super(`unknown tool "${tool}"`);
    this.name = "ToolNotFoundError";
    this.tool = tool;
  }
}

/** Thrown by `get_rule` when `ruleId` is neither in `FEE_RULE_BY_ID` nor `NON_STATEMENT_CHECKABLE` — registered, not faked (rules.ts precedent). */
export class RuleNotFoundError extends Error {
  readonly ruleId: string;
  constructor(ruleId: string) {
    super(`get_rule: unknown ruleId "${ruleId}" (not in FEE_RULE_BY_ID or NON_STATEMENT_CHECKABLE)`);
    this.name = "RuleNotFoundError";
    this.ruleId = ruleId;
  }
}
