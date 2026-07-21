import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Client } from "@modelcontextprotocol/sdk/client/index.js";

import { connectMcpClient, MCP_TEST_TIMEOUT_MS } from "./harness.ts";

/**
 * Path-containment leg (guidelines-monitor security review 2026-07-20): every
 * file-path tool parameter (`audit_statement.statementPath`,
 * `classify_and_audit.statementPath`, `check_feed.feedPath`/`catalogPath`) must
 * refuse a path that escapes the repo root — `../`-traversal OR an absolute
 * path — with the typed `ToolPathError` (`lib/tools/paths.ts`) BEFORE any
 * `readFileSync` runs.
 *
 * ANTI-THEATER, same discipline as the invalid-input leg: `isError:true` alone
 * is NOT proof — a pre-guard build would ALSO return `isError:true`, because
 * the payload would reach `readFileSync`/`JSON.parse` and fail there with a
 * DIFFERENT message ("Unexpected token …", an ENOENT, a StatementParseError).
 * The load-bearing assertion is that the message carries the guard's own
 * "escapes the allowed root" phrase (and the offending parameter name) — a
 * message only the containment check produces, and only when it fires BEFORE
 * the read. Seeing THAT message is the proof the file was never opened.
 */

// Enough `..` to climb past the repo root to the filesystem root; `path.resolve`
// collapses the surplus, landing on /etc/passwd — the classic out-of-root target.
const TRAVERSAL = "../".repeat(12) + "etc/passwd";
const ABSOLUTE = "/etc/passwd";

const VALID_FEED = "fixtures/synthetic-restaurant/acp-feed.drifted.json";
const VALID_CATALOG = "fixtures/synthetic-restaurant/sor.catalog.json";
const VALID_STATEMENT = "fixtures/synthetic-restaurant/fees/statement.drifted.json";
const VALID_UCP_DOC = "fixtures/ucp-conformance-ci/valid/search-full-catalog.json";

describe("MCP path-containment leg — out-of-root paths refused with ToolPathError, no file ever read", () => {
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

  const escapes: ReadonlyArray<{
    readonly tool: string;
    readonly args: Record<string, unknown>;
    readonly param: string;
    readonly kind: string;
  }> = [
    { tool: "audit_statement", args: { statementPath: TRAVERSAL }, param: "statementPath", kind: "traversal" },
    { tool: "audit_statement", args: { statementPath: ABSOLUTE }, param: "statementPath", kind: "absolute" },
    { tool: "classify_and_audit", args: { statementPath: TRAVERSAL }, param: "statementPath", kind: "traversal" },
    { tool: "classify_and_audit", args: { statementPath: ABSOLUTE }, param: "statementPath", kind: "absolute" },
    { tool: "check_conformance", args: { docPath: TRAVERSAL }, param: "docPath", kind: "traversal" },
    { tool: "check_conformance", args: { docPath: ABSOLUTE }, param: "docPath", kind: "absolute" },
    // check_feed: a VALID sibling path on the other param, so ONLY the guarded
    // path can trip the call — nothing else can produce the guard's message.
    // Full matrix: each of the two path params × each escape kind (Finding 7).
    { tool: "check_feed", args: { feedPath: TRAVERSAL, catalogPath: VALID_CATALOG, surface: "acp" }, param: "feedPath", kind: "traversal" },
    { tool: "check_feed", args: { feedPath: ABSOLUTE, catalogPath: VALID_CATALOG, surface: "acp" }, param: "feedPath", kind: "absolute" },
    { tool: "check_feed", args: { feedPath: VALID_FEED, catalogPath: TRAVERSAL, surface: "acp" }, param: "catalogPath", kind: "traversal" },
    { tool: "check_feed", args: { feedPath: VALID_FEED, catalogPath: ABSOLUTE, surface: "acp" }, param: "catalogPath", kind: "absolute" },
  ];

  for (const c of escapes) {
    it(
      `${c.tool}: ${c.kind} "${c.param}" -> isError:true, message carries "escapes the allowed root" (${c.param}), no tool read`,
      async () => {
        const result = await client.callTool({ name: c.tool, arguments: c.args });
        expect(result.isError).toBe(true);
        const content = result.content as ReadonlyArray<{ type: string; text?: string }>;
        expect(content[0]?.type).toBe("text");
        const message = content[0]?.text ?? "";
        // The guard's own message — a pre-guard build would surface a parse/
        // ENOENT/StatementParseError message instead, so this phrase is the
        // proof the read never happened.
        expect(message).toContain("escapes the allowed root");
        expect(message).toContain(c.param);
        // The guard throws before a ToolResult is ever built, so no envelope.
        expect(result.structuredContent).toBeUndefined();
      },
      MCP_TEST_TIMEOUT_MS,
    );
  }

  const legit: ReadonlyArray<{ readonly tool: string; readonly args: Record<string, unknown> }> = [
    { tool: "audit_statement", args: { statementPath: VALID_STATEMENT } },
    { tool: "classify_and_audit", args: { statementPath: VALID_STATEMENT } },
    { tool: "check_conformance", args: { docPath: VALID_UCP_DOC, op: "search" } },
    { tool: "check_feed", args: { feedPath: VALID_FEED, catalogPath: VALID_CATALOG, surface: "acp" } },
  ];

  for (const c of legit) {
    it(
      `${c.tool}: a legitimate in-root path still runs (isError:false, envelope present)`,
      async () => {
        const result = await client.callTool({ name: c.tool, arguments: c.args });
        expect(result.isError).toBe(false);
        expect(result.structuredContent).toBeDefined();
        expect((result.structuredContent as { tool?: string }).tool).toBe(c.tool);
      },
      MCP_TEST_TIMEOUT_MS,
    );
  }

  // Surface elimination (security review 2026-07-21): the caller-directed
  // `schemaDir` was REMOVED from check_conformance's input schema
  // (`additionalProperties:false`), so it is no longer a path the guard even
  // has to contain — a caller that still sends it is refused at schema
  // validation, before any tool code runs.
  it(
    "check_conformance: a removed schemaDir arg is rejected as an unknown property (not walked)",
    async () => {
      const result = await client.callTool({
        name: "check_conformance",
        arguments: { docPath: VALID_UCP_DOC, schemaDir: "/etc" },
      });
      expect(result.isError).toBe(true);
      const content = result.content as ReadonlyArray<{ type: string; text?: string }>;
      const message = content[0]?.text ?? "";
      // ajv unknown-property rejection — NOT the path guard, NOT a walk.
      expect(message).toMatch(/schema validation|additional propert|schemaDir/i);
      expect(result.structuredContent).toBeUndefined();
    },
    MCP_TEST_TIMEOUT_MS,
  );
});
