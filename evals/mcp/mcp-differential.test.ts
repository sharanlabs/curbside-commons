import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Client } from "@modelcontextprotocol/sdk/client/index.js";

import { callTool } from "@/lib/tools/registry.ts";
import { connectMcpClient, MCP_TEST_TIMEOUT_MS } from "./harness.ts";

/**
 * AC-2 — MCP differential fidelity (plan §4 AC-2, Codex amendment 5): for
 * every tool, over >=2 REAL fixtures, the MCP tool-result payload must equal
 * the registry's DIRECT `callTool(...)` result — canonical string AND
 * exit-code parity. Per the amendment, the JSON-RPC envelope is parsed to the
 * tool-result payload FIRST (the SDK client's `callTool()` already does
 * this — `content`/`structuredContent`/`isError` are the parsed payload, not
 * the raw wire frame) and only THEN compared; this file never byte-compares
 * a raw envelope.
 */

const root = process.cwd();
const fixtures = join(root, "fixtures", "synthetic-restaurant");
const fees = join(fixtures, "fees");
const catalogPath = join(fixtures, "sor.catalog.json");
const ucpDir = join(root, "fixtures", "ucp-conformance-ci");

interface ParsedToolResult {
  readonly isError: boolean;
  readonly text: string;
  readonly structured: { readonly exitCode: number; readonly ok: boolean } & Record<string, unknown>;
}

describe("AC-2 MCP differential — MCP tool-result canonical === direct callTool canonical", () => {
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

  async function callViaMcp(name: string, args: Record<string, unknown>): Promise<ParsedToolResult> {
    const result = await client.callTool({ name, arguments: args });
    const content = result.content as ReadonlyArray<{ type: string; text?: string }>;
    expect(content.length, `${name}: expected exactly one content block`).toBe(1);
    expect(content[0]?.type).toBe("text");
    return {
      isError: result.isError === true,
      text: content[0]?.text ?? "",
      structured: result.structuredContent as ParsedToolResult["structured"],
    };
  }

  describe("check_feed (>=2 fixtures)", () => {
    const cases = [
      { label: "acp faithful", args: { feedPath: join(fixtures, "acp-feed.faithful.json"), catalogPath, surface: "acp" } },
      { label: "acp drifted", args: { feedPath: join(fixtures, "acp-feed.drifted.json"), catalogPath, surface: "acp" } },
    ];
    for (const c of cases) {
      it(
        `${c.label}: MCP canonical + exit code === direct callTool`,
        async () => {
          const direct = callTool("check_feed", c.args);
          const mcp = await callViaMcp("check_feed", c.args);
          expect(mcp.isError).toBe(false);
          expect(mcp.text).toBe(direct.canonical);
          expect(mcp.structured.exitCode).toBe(direct.exitCode);
          expect(mcp.structured.ok).toBe(direct.ok);
        },
        MCP_TEST_TIMEOUT_MS,
      );
    }
  });

  describe("check_conformance (>=2 fixtures)", () => {
    const cases = [
      { label: "valid: search-full-catalog", args: { docPath: join(ucpDir, "valid", "search-full-catalog.json"), op: "search" } },
      { label: "invalid: pattern-currency-lowercase", args: { docPath: join(ucpDir, "invalid", "pattern-currency-lowercase.json"), op: "search" } },
    ];
    for (const c of cases) {
      it(
        `${c.label}: MCP canonical + exit code === direct callTool`,
        async () => {
          const direct = callTool("check_conformance", c.args);
          const mcp = await callViaMcp("check_conformance", c.args);
          expect(mcp.isError).toBe(false);
          expect(mcp.text).toBe(direct.canonical);
          expect(mcp.structured.exitCode).toBe(direct.exitCode);
        },
        MCP_TEST_TIMEOUT_MS,
      );
    }
  });

  describe("audit_statement (>=2 fixtures)", () => {
    const cases = ["statement.faithful.json", "statement.drifted.json"];
    for (const file of cases) {
      it(
        `${file}: MCP canonical + exit code === direct callTool`,
        async () => {
          const statementPath = join(fees, file);
          const direct = callTool("audit_statement", { statementPath });
          const mcp = await callViaMcp("audit_statement", { statementPath });
          expect(mcp.isError).toBe(false);
          expect(mcp.text).toBe(direct.canonical);
          expect(mcp.structured.exitCode).toBe(direct.exitCode);
        },
        MCP_TEST_TIMEOUT_MS,
      );
    }
  });

  describe("classify_and_audit (>=2 fixtures) — advisory + earnsLabel ride-through", () => {
    const cases = ["statement.faithful.json", "statement.drifted.json"];
    for (const file of cases) {
      it(
        `${file}: MCP canonical + exit code === direct callTool, advisory:true, earnsLabel:false`,
        async () => {
          const statementPath = join(fees, file);
          const direct = callTool("classify_and_audit", { statementPath });
          const mcp = await callViaMcp("classify_and_audit", { statementPath });
          expect(mcp.isError).toBe(false);
          expect(mcp.text).toBe(direct.canonical);
          expect(mcp.structured.exitCode).toBe(direct.exitCode);
          expect(mcp.structured.advisory).toBe(true);
          expect(mcp.structured.earnsLabel).toBe(false);
        },
        MCP_TEST_TIMEOUT_MS,
      );
    }
  });

  describe("get_rule (>=2 cases)", () => {
    const cases = [
      { label: "no ruleId -> all rules", args: {} },
      { label: "ruleId NYC-563.3-a-1", args: { ruleId: "NYC-563.3-a-1" } },
    ];
    for (const c of cases) {
      it(
        `${c.label}: MCP canonical + exit code === direct callTool`,
        async () => {
          const direct = callTool("get_rule", c.args);
          const mcp = await callViaMcp("get_rule", c.args);
          expect(mcp.isError).toBe(false);
          expect(mcp.text).toBe(direct.canonical);
          expect(mcp.structured.exitCode).toBe(direct.exitCode);
        },
        MCP_TEST_TIMEOUT_MS,
      );
    }
  });

  describe("run_demo (both formats)", () => {
    const cases = [{ format: "json" }, { format: "text" }];
    for (const args of cases) {
      it(
        `format=${args.format}: MCP canonical + exit code === direct callTool, demoOnly:true`,
        async () => {
          const direct = callTool("run_demo", args);
          const mcp = await callViaMcp("run_demo", args);
          expect(mcp.isError).toBe(false);
          expect(mcp.text).toBe(direct.canonical);
          expect(mcp.structured.exitCode).toBe(direct.exitCode);
          expect(mcp.structured.demoOnly).toBe(true);
        },
        MCP_TEST_TIMEOUT_MS,
      );
    }
  });
});
