/**
 * A1 MCP eval harness — spawns `bin/mcp-server.mjs` as a REAL child process
 * over stdio (the SDK's `StdioClientTransport`) and connects an SDK `Client`
 * to it. Shared by every `evals/mcp/*.test.ts` file so each test file spawns
 * exactly ONE server process (`beforeAll`/`afterAll`) rather than one per
 * `it()` — cold Node TS-strip + MCP `initialize` handshake is slow, the same
 * reason `evals/packs/cli-c1.test.ts` uses generous (60s) per-test timeouts.
 */
import { join } from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

export const MCP_SERVER_ENTRY = join(process.cwd(), "bin", "mcp-server.mjs");

/** Spawn the MCP server and connect a fresh SDK client to it. */
export async function connectMcpClient(): Promise<{
  readonly client: Client;
  readonly close: () => Promise<void>;
}> {
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [MCP_SERVER_ENTRY],
  });
  const client = new Client({ name: "a1-eval-client", version: "0.0.0" });
  await client.connect(transport);
  return {
    client,
    close: () => client.close(),
  };
}

/** Generous per-test timeout for anything that talks to a spawned MCP server (matches `cli-c1.test.ts`'s 60s discipline). */
export const MCP_TEST_TIMEOUT_MS = 60_000;
