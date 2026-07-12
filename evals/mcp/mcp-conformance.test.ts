import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Client } from "@modelcontextprotocol/sdk/client/index.js";

import { TOOL_DESCRIPTIONS } from "@/lib/mcp/descriptions.ts";
import { canonicalJson } from "./canonical-json.mjs";
import { connectMcpClient, MCP_TEST_TIMEOUT_MS } from "./harness.ts";

/**
 * AC-4 — MCP conformance (plan §4 AC-4, §5 row A1): `tools/list` over a REAL
 * spawned server returns exactly the registry's tools (six engine tools + the
 * E2 lookup_reference), in registry order, each
 * with its committed input schema (canonicalized — see `canonical-json.mjs`
 * for why a raw byte comparison would spuriously fail on SDK key reordering)
 * and its committed honesty-labeled description.
 */

const root = process.cwd();
const schemaDir = join(root, "lib", "tools", "schemas");

const EXPECTED_TOOL_ORDER = [
  "check_feed",
  "check_conformance",
  "audit_statement",
  "classify_and_audit",
  "get_rule",
  "lookup_reference", // E2 advisory retrieval (pre-reg §6, added 2026-07-12 post-scoring)
  "run_demo",
] as const;

describe("AC-4 MCP conformance — tools/list (real spawned server)", () => {
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

  it(
    "returns EXACTLY the registry's seven tools, in its own definition order",
    async () => {
      const { tools } = await client.listTools();
      expect(tools.map((t) => t.name)).toEqual([...EXPECTED_TOOL_ORDER]);
    },
    MCP_TEST_TIMEOUT_MS,
  );

  for (const name of EXPECTED_TOOL_ORDER) {
    it(
      `${name}: advertised inputSchema is canonically byte-equal to the committed schema file on disk`,
      async () => {
        const { tools } = await client.listTools();
        const tool = tools.find((t) => t.name === name);
        expect(tool, `tool "${name}" missing from tools/list`).toBeDefined();
        const committed = JSON.parse(readFileSync(join(schemaDir, `${name}.input.schema.json`), "utf8"));
        expect(canonicalJson(tool!.inputSchema)).toBe(canonicalJson(committed));
      },
      MCP_TEST_TIMEOUT_MS,
    );

    it(
      `${name}: advertised description is byte-equal to the committed TOOL_DESCRIPTIONS entry`,
      async () => {
        const { tools } = await client.listTools();
        const tool = tools.find((t) => t.name === name);
        expect(tool!.description).toBe(TOOL_DESCRIPTIONS[name]);
      },
      MCP_TEST_TIMEOUT_MS,
    );
  }

  it(
    "run_demo's description begins with the required DEMO-ONLY WALKTHROUGH marking",
    async () => {
      const { tools } = await client.listTools();
      const tool = tools.find((t) => t.name === "run_demo")!;
      expect((tool.description ?? "").startsWith("DEMO-ONLY WALKTHROUGH — never an audit result")).toBe(true);
    },
    MCP_TEST_TIMEOUT_MS,
  );

  it(
    "classify_and_audit's description states the required ADVISORY / not-earned-label marking",
    async () => {
      const { tools } = await client.listTools();
      const tool = tools.find((t) => t.name === "classify_and_audit")!;
      expect(tool.description).toContain(
        "ADVISORY — candidate leads, never a verdict; classifier has NOT earned a calibrated label",
      );
    },
    MCP_TEST_TIMEOUT_MS,
  );

  it(
    "every description states the data is SIMULATED (or, for get_rule/lookup_reference, precisely scopes the real-published-text exception)",
    async () => {
      const { tools } = await client.listTools();
      for (const tool of tools) {
        expect(tool.description, `${tool.name} description missing a SIMULATED marking`).toMatch(/SIMULATED/);
      }
    },
    MCP_TEST_TIMEOUT_MS,
  );

  it(
    "server initialize metadata: name, version (from package.json), instructions cover simulated/deterministic/demo_only/advisory semantics",
    async () => {
      const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as { version: string };
      expect(client.getServerVersion()).toEqual({ name: "commerce-truth-audit", version: pkg.version });
      const instructions = client.getInstructions() ?? "";
      expect(instructions).toMatch(/SIMULATED/);
      expect(instructions).toMatch(/deterministic/i);
      expect(instructions).toMatch(/demo_only/);
      expect(instructions).toMatch(/advisory/);
    },
    MCP_TEST_TIMEOUT_MS,
  );
});
