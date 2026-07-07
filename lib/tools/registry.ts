/**
 * A0 TOOL REGISTRY — the ONE seam over the gated engine's existing entry
 * points (plan `docs/plan-agentic-extension.md` §3–§6, §5 row A0).
 *
 * Six typed JSON-in/JSON-out tools, each wrapping an UNCHANGED engine entry
 * point (`lib/packs/listings/cli.ts`, `lib/packs/fees/*`) with a committed
 * input/output JSON Schema and a named canonical serializer. `callTool` is
 * the ONE call surface every later consumer (A1 MCP server, A2 agent crew,
 * A4 n8n lane) is meant to use: it validates `params` against the tool's
 * committed input schema via ajv BEFORE running the tool, and never swallows
 * a runtime failure — the engine's own typed errors (`StatementParseError`,
 * plain `Error`s from `readFileSync`/`JSON.parse`) pass straight through.
 *
 * ZERO LLM / network imports below this file (enforced by the import-graph
 * eval `evals/tools/registry-ac3-import-graph.test.ts`, same pattern as the
 * existing `cli-c1`/`demo-blindness` $0-LLM proofs) — every tool here calls
 * only deterministic, $0, offline engine code.
 *
 * Plain: this is the one panel of six clearly-labeled buttons that every
 * future robot (an MCP tool client, an agent crew, an automation workflow)
 * will press instead of reaching into the checker's engine room directly —
 * press a button with the wrong-shaped input and it refuses loudly instead of
 * guessing.
 */
import { compileSchema, type ValidateFunction } from "./ajv.ts";
import { loadSchema } from "./schema-loader.ts";
import {
  ToolInputError,
  ToolNotFoundError,
  type ToolDefinition,
  type ToolMetadata,
  type ToolResult,
} from "./types.ts";

import { runCheckFeedTool, type CheckFeedParams } from "./tools/check-feed.ts";
import { runCheckConformanceTool, type CheckConformanceParams } from "./tools/check-conformance.ts";
import { runAuditStatementTool, type AuditStatementParams } from "./tools/audit-statement.ts";
import { runClassifyAndAuditTool, type ClassifyAndAuditParams } from "./tools/classify-and-audit.ts";
import { runGetRuleTool, type GetRuleParams } from "./tools/get-rule.ts";
import { runRunDemoTool, type RunDemoParams } from "./tools/run-demo.ts";

// Re-export every tool's params type — the one place a consumer imports them from.
export type {
  CheckFeedParams,
  CheckConformanceParams,
  AuditStatementParams,
  ClassifyAndAuditParams,
  GetRuleParams,
  RunDemoParams,
};
export type { ToolResult, ToolMetadata } from "./types.ts";
export {
  assertDecisionGrade,
  ToolInputError,
  ToolNotFoundError,
  RuleNotFoundError,
} from "./types.ts";

const TOOL_DEFINITIONS: readonly ToolDefinition[] = [
  {
    name: "check_feed",
    inputSchema: loadSchema("check_feed.input.schema.json"),
    outputSchema: loadSchema("check_feed.output.schema.json"),
    run: runCheckFeedTool,
  },
  {
    name: "check_conformance",
    inputSchema: loadSchema("check_conformance.input.schema.json"),
    outputSchema: loadSchema("check_conformance.output.schema.json"),
    run: runCheckConformanceTool,
  },
  {
    name: "audit_statement",
    inputSchema: loadSchema("audit_statement.input.schema.json"),
    outputSchema: loadSchema("audit_statement.output.schema.json"),
    run: runAuditStatementTool,
  },
  {
    name: "classify_and_audit",
    inputSchema: loadSchema("classify_and_audit.input.schema.json"),
    outputSchema: loadSchema("classify_and_audit.output.schema.json"),
    run: runClassifyAndAuditTool,
  },
  {
    name: "get_rule",
    inputSchema: loadSchema("get_rule.input.schema.json"),
    outputSchema: loadSchema("get_rule.output.schema.json"),
    run: runGetRuleTool,
  },
  {
    name: "run_demo",
    demoOnly: true,
    inputSchema: loadSchema("run_demo.input.schema.json"),
    outputSchema: loadSchema("run_demo.output.schema.json"),
    run: runRunDemoTool,
  },
];

// The RUNNABLE registry stays module-PRIVATE: exposing `run` would let a
// consumer bypass `callTool`'s ajv input validation (Codex A0 review,
// finding 1). `callTool` below is the ONE execution path.
const RUNNABLE: ReadonlyMap<string, ToolDefinition> = new Map(
  TOOL_DEFINITIONS.map((t) => [t.name, t]),
);

/**
 * The PUBLIC registry view — metadata only (name, `demoOnly` marker, committed
 * input/output schemas), deliberately with NO `run` function. Listing surfaces
 * (the A1 MCP server's tools/list, docs, tests) read this; execution goes
 * through {@link callTool} exclusively.
 */
export const TOOLS: ReadonlyMap<string, ToolMetadata> = new Map(
  TOOL_DEFINITIONS.map((t) => [
    t.name,
    Object.freeze({
      name: t.name,
      ...(t.demoOnly === true ? { demoOnly: true as const } : {}),
      inputSchema: t.inputSchema,
      outputSchema: t.outputSchema,
    }),
  ]),
);

// One compiled ajv validator per tool per schema half, built once at module
// load (compile is the expensive step; `callTool` reuses these).
const inputValidators: ReadonlyMap<string, ValidateFunction> = new Map(
  TOOL_DEFINITIONS.map((t) => [t.name, compileSchema(t.inputSchema)]),
);
const outputValidators: ReadonlyMap<string, ValidateFunction> = new Map(
  TOOL_DEFINITIONS.map((t) => [t.name, compileSchema(t.outputSchema)]),
);

/** The compiled output-envelope validator for one tool (tests use this to assert AC-1's envelope-schema requirement). */
export function outputValidatorFor(name: string): ValidateFunction | undefined {
  return outputValidators.get(name);
}

/**
 * The ONE call surface: validate `params` against the tool's committed input
 * schema, THEN run it. Throws {@link ToolNotFoundError} for an unregistered
 * `name`, {@link ToolInputError} (carrying the ajv errors) for input that
 * fails schema validation. A runtime failure inside `run` (e.g. an unreadable
 * file, a malformed statement, an unknown `ruleId`) is the engine's or the
 * tool's own typed error and passes straight through — never caught here.
 */
export function callTool(name: string, params: unknown): ToolResult {
  const tool = RUNNABLE.get(name);
  if (!tool) {
    throw new ToolNotFoundError(name);
  }
  const validate = inputValidators.get(name);
  if (!validate) {
    // Unreachable in practice (every RUNNABLE entry has a compiled input
    // validator built above) — a defensive guard, not a silent fallback.
    throw new Error(`registry: no compiled input validator for tool "${name}"`);
  }
  if (!validate(params)) {
    throw new ToolInputError(name, validate.errors ?? []);
  }
  return tool.run(params);
}
