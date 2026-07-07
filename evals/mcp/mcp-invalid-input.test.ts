import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Client } from "@modelcontextprotocol/sdk/client/index.js";

import { connectMcpClient, MCP_TEST_TIMEOUT_MS } from "./harness.ts";

/**
 * Invalid-input leg (plan §5 row A1, AC-4 anti-theater gate): per tool, >=1
 * malformed call must come back `isError: true` with a message containing
 * the ajv JSON-pointer, and — the load-bearing "no tool executes" proof — the
 * malformed value chosen is one that would produce a DIFFERENT, non-ajv error
 * if the schema gate were bypassed and the value reached the engine anyway
 * (e.g. a non-string `statementPath`/`docPath` would throw a Node
 * `readFileSync` TypeError, not our ajv-formatted message; a non-string
 * `ruleId` would never reach `RuleNotFoundError`'s message shape). Seeing the
 * ajv-shaped message — and ONLY that shape — is the proof the tool's own
 * `run()` never ran.
 */

describe("MCP invalid-input leg — isError:true, ajv pointer in message, no tool execution", () => {
  let client: Client;
  let close: () => Promise<void>;

  beforeAll(async () => {
    const conn = await connectMcpClient();
    client = conn.client;
    close = conn.close;
  }, MCP_TEST_TIMEOUT_MS);

  afterAll(async () => {
    await close();
  }, MCP_TEST_TIMEOUT_MS);

  const cases: ReadonlyArray<{
    readonly tool: string;
    readonly args: Record<string, unknown>;
    readonly pointer: string;
  }> = [
    { tool: "check_feed", args: { feedPath: "x", catalogPath: "y", surface: "carrier-pigeon" }, pointer: "/surface" },
    { tool: "check_conformance", args: { docPath: 42 }, pointer: "/docPath" },
    { tool: "audit_statement", args: { statementPath: 42 }, pointer: "/statementPath" },
    { tool: "classify_and_audit", args: { statementPath: 42 }, pointer: "/statementPath" },
    { tool: "get_rule", args: { ruleId: 12345 }, pointer: "/ruleId" },
    { tool: "run_demo", args: { format: "xml" }, pointer: "/format" },
  ];

  for (const c of cases) {
    it(
      `${c.tool}: malformed "${c.pointer.slice(1)}" -> isError:true, message carries the ajv pointer ${c.pointer}, no structuredContent (proof no tool ran)`,
      async () => {
        const result = await client.callTool({ name: c.tool, arguments: c.args });
        expect(result.isError).toBe(true);
        const content = result.content as ReadonlyArray<{ type: string; text?: string }>;
        expect(content[0]?.type).toBe("text");
        const message = content[0]?.text ?? "";
        expect(message).toContain("input failed schema validation");
        expect(message).toContain(c.pointer);
        // No tool-result envelope was ever constructed — the registry's
        // callTool() throws ToolInputError BEFORE running the tool, so there
        // is no ToolResult to build a structuredContent from.
        expect(result.structuredContent).toBeUndefined();
      },
      MCP_TEST_TIMEOUT_MS,
    );
  }

  it(
    "an unregistered tool name maps to isError:true (ToolNotFoundError), never a thrown/crashed connection",
    async () => {
      const result = await client.callTool({ name: "not_a_real_tool", arguments: {} });
      expect(result.isError).toBe(true);
      const content = result.content as ReadonlyArray<{ type: string; text?: string }>;
      expect(content[0]?.text ?? "").toContain("not_a_real_tool");
    },
    MCP_TEST_TIMEOUT_MS,
  );
});
