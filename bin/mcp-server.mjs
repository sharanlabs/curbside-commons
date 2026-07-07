#!/usr/bin/env node
/**
 * A1 MCP server launcher (plan `docs/plan-agentic-extension.md` §5 row A1).
 *
 * Thin: build the server from `lib/mcp/server.ts` — loaded via Node's native
 * TS type-stripping (Node >= 24), the SAME pattern `bin/check.mjs` already
 * uses for `../lib/packs/listings/cli.ts` — and connect it to stdio. ZERO
 * network: `StdioServerTransport` only, never an HTTP/SSE transport.
 *
 * Plain: the one small script that turns the MCP server module into an
 * actual running process an MCP client can spawn and talk to over
 * stdin/stdout.
 */

async function main() {
  const { createMcpServer } = await import("../lib/mcp/server.ts");
  const { StdioServerTransport } = await import("@modelcontextprotocol/sdk/server/stdio.js");
  const server = createMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  process.stderr.write(`mcp-server: ${err instanceof Error ? (err.stack ?? err.message) : String(err)}\n`);
  process.exit(1);
});
