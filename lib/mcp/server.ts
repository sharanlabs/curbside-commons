/**
 * A1 MCP SERVER — the stdio Model Context Protocol server exposing the A0
 * tool registry's six tools (plan `docs/plan-agentic-extension.md` §3–§6,
 * §5 row A1) via the official TypeScript SDK
 * (`@modelcontextprotocol/sdk@1.29.0`, exact-pinned in `package.json`, MIT,
 * freshness-checked live 2026-07-07).
 *
 * This file imports ONLY: the MCP SDK, node builtins, and
 * `lib/tools/registry.ts` (+ its re-exported types/errors) — NEVER
 * `lib/packs/**` or `lib/verifier-core/**` directly (`evals/mcp/
 * mcp-import-walk.test.ts` proves this both as a direct-import boundary on
 * every file under `lib/mcp/**` and as a transitive $0/offline proof reusing
 * the A0 AC-3 walker). `callTool` from the registry is the ONE execution
 * path (Codex A0 review finding 1) — this file never calls a tool's own
 * `run()` function directly, and never re-implements ajv validation.
 *
 * The committed JSON Schema every tool advertises is registered via the
 * LOW-LEVEL `Server` class (`tools/list` / `tools/call` request handlers set
 * directly), NOT the high-level `McpServer.registerTool()` convenience API —
 * that API's `inputSchema` config accepts only a Zod raw shape or a
 * Standard-Schema object (`AnySchema`; see the SDK's own `mcp.d.ts`), which
 * would force re-authoring the A0 registry's committed JSON Schema into a
 * different shape by hand. The low-level
 * `Server.setRequestHandler(ListToolsRequestSchema, ...)` /
 * `setRequestHandler(CallToolRequestSchema, ...)` path takes a tool's
 * `inputSchema` as a plain JSON-Schema-shaped object (the SDK's own `Tool`
 * wire type is `{ type: "object", properties?, required? } & catchall
 * unknown` — a JSON Schema object, not a Zod schema), so the committed
 * schema is advertised VERBATIM, with no re-authoring and no drift risk
 * between what ajv validates and what an MCP client sees.
 *
 * ZERO network: this module never imports an HTTP/SSE transport from the SDK
 * (`server/streamableHttp.js`, `server/sse.js`, `server/express.js`) — stdio
 * only, wired by the launcher (`bin/mcp-server.mjs`).
 *
 * Plain: this is the "plug adapter" that lets an MCP client (Claude Desktop,
 * an agent framework, an eval harness) press the same six clearly-labeled
 * buttons the A0 registry already built — over stdin/stdout, never a network
 * socket — using the EXACT rulebook the checker itself validates input
 * against, not a hand-copied one. A bad input still gets refused loudly; a
 * finding still gets reported even when the audit "fails" — failing an audit
 * is the tool working correctly, not an MCP error.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import type { CallToolResult, Tool } from "@modelcontextprotocol/sdk/types.js";

import { callTool, TOOLS, ToolInputError, ToolNotFoundError, type ToolResult } from "../tools/registry.ts";
import { TOOL_DESCRIPTIONS } from "./descriptions.ts";

const HERE = dirname(fileURLToPath(import.meta.url));

/** Read this repo's own `package.json` `version` (never hand-duplicated). */
function readPackageVersion(): string {
  const pkgPath = join(HERE, "..", "..", "package.json");
  const raw = readFileSync(pkgPath, "utf8");
  const pkg = JSON.parse(raw) as { version?: unknown };
  if (typeof pkg.version !== "string" || pkg.version.length === 0) {
    throw new Error(`lib/mcp/server.ts: package.json at ${pkgPath} has no non-empty string "version"`);
  }
  return pkg.version;
}

/** Server `instructions` string surfaced to the client at `initialize` (plan §5 row A1). */
const SERVER_INSTRUCTIONS =
  "commerce-truth-audit MCP server — SIMULATED demonstration data throughout, never real " +
  "merchant data. Deterministic, $0, offline engine underneath every tool: agents recommend, " +
  "the engine decides (no AI call sits in any of these six tools' decision paths). run_demo is " +
  "a demo_only walkthrough, never an audit result. classify_and_audit is advisory — candidate " +
  "leads, never a verdict; its classifier has not earned a calibrated label (earnsLabel: false).";

/** The six tool names, in the A0 registry's own definition order (never hand-duplicated). */
const TOOL_ORDER: readonly string[] = Object.freeze([...TOOLS.keys()]);

/** One `tools/list` entry: name + committed description + the VERBATIM committed input schema. */
interface McpToolDescriptor {
  readonly name: string;
  readonly description: string;
  readonly inputSchema: Readonly<Record<string, unknown>>;
}

function listedTools(): McpToolDescriptor[] {
  return TOOL_ORDER.map((name) => {
    const meta = TOOLS.get(name);
    if (!meta) {
      // Unreachable in practice — TOOL_ORDER is derived from TOOLS itself.
      throw new Error(`lib/mcp/server.ts: tool "${name}" listed but not found in the registry`);
    }
    const description = TOOL_DESCRIPTIONS[name];
    if (description === undefined) {
      throw new Error(`lib/mcp/server.ts: tool "${name}" has no committed MCP description`);
    }
    return { name: meta.name, description, inputSchema: meta.inputSchema };
  });
}

/**
 * Build the `structuredContent` machine-readable slot for one tool result.
 *
 * `structuredContent` (not `_meta`) is the SDK-sanctioned slot chosen here:
 * the SDK's own `CallToolResultSchema` defines `structuredContent` as a
 * `Record<string, unknown>` specifically for a tool's machine-readable
 * output, so every MCP client library already knows to look there for
 * tool-domain data. `_meta` is the protocol's own out-of-band envelope
 * (progress tokens, related-task ids) — reserved for transport/protocol
 * concerns, not tool-domain honesty flags. The shape is FIXED (every key
 * always present) so a client never has to branch on which keys exist;
 * `earnsLabel` is `null` (not omitted) when a tool carries no advisory
 * classifier at all, so its presence/absence is never itself a signal a
 * caller has to special-case.
 */
function structuredContentFor(result: ToolResult): Record<string, unknown> {
  return {
    tool: result.tool,
    ok: result.ok,
    exitCode: result.exitCode,
    demoOnly: result.demoOnly === true,
    advisory: result.advisory === true,
    earnsLabel: result.earnsLabel ?? null,
  };
}

/** Format one ajv error object as a stable "<json-pointer> <message>" fragment. */
function formatAjvError(err: { readonly instancePath?: string; readonly message?: string }): string {
  const pointer = err.instancePath !== undefined && err.instancePath.length > 0 ? err.instancePath : "(root)";
  return `${pointer} ${err.message ?? "invalid"}`;
}

/**
 * Run one tool via the registry's ONE execution path (`callTool`) and map its
 * outcome to an MCP `CallToolResult`.
 *
 * `exitCode !== 0` is NOT an MCP error — the audit ran fine and reported
 * findings, which is a successful tool call (`isError: false`). Only a
 * genuine failure to run the tool at all — bad input (`ToolInputError`), an
 * unregistered name (`ToolNotFoundError`, unreachable through this server's
 * own `tools/list` contract but mapped anyway per the dispatch packet), or an
 * engine-level failure (`StatementParseError`, an unreadable file, an unknown
 * `ruleId` via `RuleNotFoundError`) — becomes `isError: true`. No branch here
 * ever swallows a failure into a silent success.
 */
function toolCallResult(name: string, rawArgs: unknown): CallToolResult {
  try {
    const result = callTool(name, rawArgs ?? {});
    return {
      content: [{ type: "text", text: result.canonical }],
      structuredContent: structuredContentFor(result),
      isError: false,
    };
  } catch (err) {
    if (err instanceof ToolInputError) {
      const detail = err.ajvErrors.map(formatAjvError).join("; ");
      return {
        content: [
          {
            type: "text",
            text: `tool "${name}": input failed schema validation (${err.ajvErrors.length} error(s)): ${detail}`,
          },
        ],
        isError: true,
      };
    }
    if (err instanceof ToolNotFoundError) {
      // Unreachable via a well-behaved MCP client (this server's own
      // `tools/list` never advertises a name outside TOOL_ORDER), but a raw
      // `tools/call` with an arbitrary `name` is still possible over the
      // wire, so this stays mapped rather than left to throw uncaught.
      return { content: [{ type: "text", text: err.message }], isError: true };
    }
    const message = err instanceof Error ? err.message : String(err);
    return { content: [{ type: "text", text: message }], isError: true };
  }
}

/**
 * Build a fresh, UNCONNECTED `Server` instance exposing the A0 registry's six
 * tools over MCP. The caller (`bin/mcp-server.mjs`) attaches the stdio
 * transport and calls `connect`.
 */
export function createMcpServer(): Server {
  const server = new Server(
    { name: "commerce-truth-audit", version: readPackageVersion() },
    {
      capabilities: { tools: {} },
      instructions: SERVER_INSTRUCTIONS,
    },
  );

  server.setRequestHandler(ListToolsRequestSchema, () => ({
    tools: listedTools() as unknown as Tool[],
  }));

  server.setRequestHandler(CallToolRequestSchema, (request) => {
    const { name, arguments: args } = request.params;
    return toolCallResult(name, args);
  });

  return server;
}

export { TOOL_ORDER };
