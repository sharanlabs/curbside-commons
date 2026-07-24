#!/usr/bin/env node
/**
 * A1 MCP scripted-client transcript recorder (plan §5 row A1, AC-4).
 *
 * Spawns `bin/mcp-server.mjs` as a REAL child process over stdio (the SDK's
 * `StdioClientTransport`) and runs the fixed scripted session: initialize
 * (performed by `client.connect`) -> tools/list -> one happy call per the six
 * tools -> two invalid calls. Writes a NORMALIZED, deterministic JSON
 * transcript.
 *
 * Determinism / normalization (documented, per the dispatch packet's "if the
 * SDK injects nondeterminism, normalize it in the transcript writer and
 * document exactly what is normalized"):
 *
 *   1. The transcript is a STRUCTURED session log built from the SDK
 *      Client's own PARSED method results (`client.listTools()` /
 *      `client.callTool()`), never raw JSON-RPC wire frames. The
 *      auto-incrementing per-connection JSON-RPC request `id` is therefore
 *      never captured — it is a connection-timing/ordering artifact, not
 *      part of the tool-level contract this transcript audits (the same
 *      "parse the envelope before comparing" principle as the AC-2
 *      differential's Codex amendment 5).
 *   2. Every `inputSchema` recorded in the `tools/list` step is
 *      CANONICALIZED (`canonical-json.mjs`) before being written — the MCP
 *      SDK's own Zod wire schema for `Tool.inputSchema` reconstructs each
 *      object with its declared keys first and the JSON-Schema "catchall"
 *      keys (`$schema`, `$id`, `title`, ...) appended afterwards, a
 *      different key ORDER than the committed schema file, even though no
 *      key or value differs. Canonicalizing (recursive alphabetical key
 *      sort) makes the frozen transcript reproducible independent of that
 *      SDK-internal reordering.
 *   3. Every fixture path recorded in a `tools/call` request's `arguments`
 *      is REPO-RELATIVE (e.g. "fixtures/synthetic-restaurant/..."), never an
 *      absolute filesystem path — so the transcript is byte-identical across
 *      machines/clones. The spawned server process inherits this script's
 *      cwd (the repo root), so relative paths resolve correctly at runtime.
 *   4. No timestamps and no process ids are ever recorded.
 *
 * Usage: `node evals/mcp/record-transcript.mjs [--out <path>]` — defaults to
 * the committed golden path. The freeze test (`mcp-transcript-freeze.test.ts`)
 * calls this with `--out` pointed at a scratch file so regenerating the
 * transcript during `npm run verify` never dirties the tracked golden.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { canonicalize } from "./canonical-json.mjs";

const root = process.cwd();
const serverEntry = join(root, "bin", "mcp-server.mjs");
const defaultOut = join(fileURLToPath(new URL(".", import.meta.url)), "gold", "mcp-session.transcript.json");

function parseOutPath(argv) {
  const idx = argv.indexOf("--out");
  if (idx === -1) return defaultOut;
  const value = argv[idx + 1];
  if (!value) throw new Error("record-transcript: --out needs a path argument");
  return value;
}

// One happy (schema-VALID) call per tool, in the registry's own definition
// order. All paths are repo-relative (normalization rule 3 above).
const HAPPY_CALLS = [
  {
    name: "check_feed",
    arguments: {
      feedPath: "fixtures/synthetic-restaurant/acp-feed.faithful.json",
      catalogPath: "fixtures/synthetic-restaurant/sor.catalog.json",
      surface: "acp",
    },
  },
  {
    name: "check_conformance",
    arguments: { docPath: "fixtures/ucp-conformance-ci/valid/search-full-catalog.json", op: "search" },
  },
  {
    name: "audit_statement",
    arguments: { statementPath: "fixtures/synthetic-restaurant/fees/statement.faithful.json" },
  },
  {
    name: "classify_and_audit",
    arguments: { statementPath: "fixtures/synthetic-restaurant/fees/statement.faithful.json" },
  },
  { name: "get_rule", arguments: { ruleId: "NYC-563.3-a-1" } },
  // E2 (pre-reg §6): a question whose top BM25 hit clears the frozen
  // threshold deterministically — the transcript shows an answered, cited,
  // advisory/experimental-labeled lookup.
  { name: "lookup_reference", arguments: { question: "What does drift mean for a published menu?" } },
  { name: "run_demo", arguments: { format: "json" } },
];

// Two invalid (schema-INVALID) calls, per the dispatch packet's scripted
// session shape ("initialize -> tools/list -> one happy call per tool -> 2
// invalid calls").
const INVALID_CALLS = [
  { name: "check_feed", arguments: { feedPath: "x", catalogPath: "y", surface: "carrier-pigeon" } },
  { name: "get_rule", arguments: { ruleId: 12345 } },
];

function normalizeToolResult(result) {
  const content = (result.content ?? []).map((c) =>
    c.type === "text" ? { type: "text", text: c.text } : { type: c.type },
  );
  return {
    isError: result.isError === true,
    content,
    structuredContent: result.structuredContent === undefined ? null : canonicalize(result.structuredContent),
  };
}

async function main() {
  const outPath = parseOutPath(process.argv.slice(2));

  const transport = new StdioClientTransport({ command: process.execPath, args: [serverEntry] });
  const client = new Client({ name: "a1-transcript-recorder", version: "0.0.0" });
  await client.connect(transport);

  const steps = [];

  steps.push({
    step: "initialize",
    serverInfo: client.getServerVersion() ?? null,
    capabilities: client.getServerCapabilities() ?? null,
    instructions: client.getInstructions() ?? null,
  });

  const { tools } = await client.listTools();
  steps.push({
    step: "tools/list",
    tools: tools.map((t) => ({
      name: t.name,
      description: t.description,
      inputSchema: canonicalize(t.inputSchema),
      // Behaviour hints + the structuredContent-envelope output schema are part of
      // what a real client sees on tools/list, so the frozen transcript records them
      // too (canonicalized like inputSchema — the SDK's Zod wire schema reorders keys).
      annotations: canonicalize(t.annotations),
      outputSchema: canonicalize(t.outputSchema),
    })),
  });

  for (const call of HAPPY_CALLS) {
    const result = await client.callTool(call);
    steps.push({ step: "tools/call", request: call, response: normalizeToolResult(result) });
  }

  for (const call of INVALID_CALLS) {
    const result = await client.callTool(call);
    steps.push({ step: "tools/call (invalid)", request: call, response: normalizeToolResult(result) });
  }

  await client.close();

  const transcript = { schemaVersion: 1, steps };
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, `${JSON.stringify(transcript, null, 2)}\n`, "utf8");
  process.stdout.write(`record-transcript: wrote ${outPath}\n`);
}

main().catch((err) => {
  process.stderr.write(`record-transcript: ${err instanceof Error ? (err.stack ?? err.message) : String(err)}\n`);
  process.exit(1);
});
