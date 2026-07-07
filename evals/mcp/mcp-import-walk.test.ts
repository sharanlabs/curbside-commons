import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * A1 import-boundary + $0/offline proof (plan §5 row A1, AC-3, AC-4).
 *
 * TWO separate, complementary claims — deliberately not the same test,
 * because they are not the same property (escalation recorded in the slice
 * record):
 *
 * 1. DIRECT-import boundary: every source file physically under `lib/mcp/**`
 *    must never import `lib/packs/**` or `lib/verifier-core/**` DIRECTLY —
 *    only the registry (`lib/tools/registry.ts` or its co-located
 *    types/errors) may sit between the MCP server and the engine. This is
 *    the literal reading of "the server imports ONLY ... lib/tools/registry.ts
 *    ... NEVER lib/packs/** or lib/verifier-core/** directly".
 *
 * 2. TRANSITIVE $0/offline proof, reusing the EXACT walker pattern from
 *    `evals/tools/registry-ac3-import-graph.test.ts`: starting from
 *    `lib/mcp/server.ts`, the full reachable graph (which, same as the A0
 *    proof, legitimately DOES reach into `lib/packs/**` transitively via the
 *    registry — that is the whole point of the registry seam, and the A0
 *    proof already establishes it is fine) must never reach an LLM/network
 *    module, must never perform a bare `fetch(`, must never import an
 *    HTTP/SSE MCP transport, and must have no `require`/non-literal dynamic
 *    `import(` escape hatch the walker cannot follow.
 *
 * Claim 1 is what "server -> registry-only" means at the DIRECT-import level
 * (the honest, satisfiable reading of "every reachable repo file under lib/
 * is either lib/tools/** or lib/mcp/**" — reachable meaning "directly
 * imported from lib/mcp/** itself", not "anywhere in the full transitive
 * closure", since the registry's OWN A0 proof already shows the registry
 * transitively reaches lib/packs/** by design).
 */

const root = process.cwd();
const mcpDir = join(root, "lib", "mcp");
const entry = join(mcpDir, "server.ts");

function importsOf(file: string): string[] {
  const text = readFileSync(file, "utf8");
  const specs: string[] = [];
  const re = /(?:from\s+|import\s*\(\s*|import\s+)["']([^"']+)["']/g;
  for (let m = re.exec(text); m; m = re.exec(text)) specs.push(m[1]);
  return specs;
}

function resolve(fromFile: string, spec: string): string | null {
  let base: string | null = null;
  if (spec.startsWith("@/")) base = join(root, spec.slice(2));
  else if (spec.startsWith(".")) base = join(fromFile, "..", spec);
  if (base === null) return null;
  const candidates = [base, `${base}.ts`, `${base}.tsx`, `${base}.mjs`, `${base}.json`, join(base, "index.ts")];
  return candidates.find((c) => existsSync(c) && /\.(ts|tsx|mjs|json)$/.test(c)) ?? null;
}

function reachableFrom(startFile: string): Set<string> {
  const queue = [startFile];
  const seen = new Set<string>();
  while (queue.length > 0) {
    const file = queue.pop() as string;
    if (seen.has(file)) continue;
    seen.add(file);
    if (file.endsWith(".json")) continue;
    for (const spec of importsOf(file)) {
      const resolved = resolve(file, spec);
      if (resolved !== null) queue.push(resolved);
    }
  }
  return seen;
}

function listMcpSourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entryName of readdirSync(dir)) {
    const full = join(dir, entryName);
    if (statSync(full).isDirectory()) {
      out.push(...listMcpSourceFiles(full));
    } else if (/\.(ts|tsx)$/.test(full)) {
      out.push(full);
    }
  }
  return out;
}

// Same ban list as evals/tools/registry-ac3-import-graph.test.ts, reused
// verbatim (not re-derived) so the two proofs agree on what "network/LLM" means.
const banned = [
  /lib\/agents\//,
  /@ai-sdk/,
  /^ai$|\/ai\//,
  /node:https?/,
  /undici/,
  /groq|gemini/i,
  /node:net|node:tls|node:dgram/,
  /^node-fetch|^axios|^got$|^ws$/,
];

describe("A1 hard constraint — lib/mcp/** never imports lib/packs/** or lib/verifier-core/** directly", () => {
  const mcpFiles = listMcpSourceFiles(mcpDir);

  it("sanity: the directory walk actually found the server + descriptions modules", () => {
    const rel = mcpFiles.map((f) => f.replace(root, ""));
    expect(rel.some((f) => f === "/lib/mcp/server.ts")).toBe(true);
    expect(rel.some((f) => f === "/lib/mcp/descriptions.ts")).toBe(true);
  });

  it("no file under lib/mcp/** imports lib/packs/** or lib/verifier-core/** directly", () => {
    for (const file of mcpFiles) {
      for (const spec of importsOf(file)) {
        expect(/packs\//.test(spec), `direct lib/packs import "${spec}" in ${file}`).toBe(false);
        expect(/verifier-core\//.test(spec), `direct lib/verifier-core import "${spec}" in ${file}`).toBe(false);
      }
    }
  });

  it("every repo-relative (non-SDK, non-node-builtin) import from lib/mcp/** targets lib/tools/** or another lib/mcp/** file", () => {
    for (const file of mcpFiles) {
      for (const spec of importsOf(file)) {
        if (spec.startsWith("@modelcontextprotocol/") || spec.startsWith("node:")) continue;
        const resolved = resolve(file, spec);
        if (resolved === null) continue; // bare specifier we don't resolve (shouldn't occur here)
        const rel = resolved.replace(root, "");
        expect(
          /^\/lib\/(tools|mcp)\//.test(rel),
          `lib/mcp/** file ${file} imports "${spec}" -> ${rel}, outside lib/tools/** and lib/mcp/**`,
        ).toBe(true);
      }
    }
  });
});

describe("A1 transitive $0/offline + zero-HTTP-transport proof (reuses the A0 AC-3 walker pattern)", () => {
  const reached = reachableFrom(entry);
  const rel = [...reached].map((f) => f.replace(root, ""));

  it("no module reachable from lib/mcp/server.ts matches a banned LLM/network pattern", () => {
    for (const file of reached) {
      if (file.endsWith(".json")) continue;
      for (const spec of importsOf(file)) {
        for (const pattern of banned) {
          expect(pattern.test(spec), `banned import "${spec}" in ${file}`).toBe(false);
        }
      }
    }
  });

  it("no reachable source imports an HTTP/SSE MCP transport (streamableHttp / sse / express) — stdio only", () => {
    for (const file of reached) {
      if (file.endsWith(".json")) continue;
      for (const spec of importsOf(file)) {
        expect(/streamableHttp|\/sse(\.js)?$|webStandardStreamableHttp|server\/express/.test(spec)).toBe(false);
      }
    }
    // Also scan the launcher directly (outside the lib/ walk, but must hold).
    const launcher = readFileSync(join(root, "bin", "mcp-server.mjs"), "utf8");
    expect(/streamableHttp|\/sse(\.js)?["']|webStandardStreamableHttp|server\/express/.test(launcher)).toBe(false);
    expect(launcher).toContain("StdioServerTransport");
  });

  it("no reachable source performs a bare fetch(), CJS require/createRequire, or a non-literal dynamic import( (walker escape hatches)", () => {
    for (const file of reached) {
      if (file.endsWith(".json")) continue;
      const text = readFileSync(file, "utf8");
      expect(/(^|[^.\w])fetch\s*\(/.test(text), `bare fetch( reachable from lib/mcp/server.ts in ${file}`).toBe(false);
      expect(
        /(^|[^.\w])require\s*\(|createRequire/.test(text),
        `CJS require/createRequire reachable in ${file}`,
      ).toBe(false);
      expect(/import\s*\(\s*[^"')]/.test(text), `non-literal dynamic import( reachable in ${file}`).toBe(false);
    }
  });

  it("sanity: the walk traversed the registry (and, transitively, both engine packs — same as the A0 proof)", () => {
    expect(reached.size).toBeGreaterThan(15);
    expect(rel.some((f) => f === "/lib/tools/registry.ts")).toBe(true);
    expect(rel.some((f) => /\/lib\/packs\/listings\/cli\.ts$/.test(f))).toBe(true);
    expect(rel.some((f) => /\/lib\/packs\/fees\/audit\.ts$/.test(f))).toBe(true);
  });
});

/**
 * SDK-INTERNAL stdio-only proof (Codex A1 review, P3-1): our repo-level walker
 * skips bare package imports, so on its own it cannot prove the PINNED SDK's
 * server/stdio runtime path never reaches HTTP/SSE/Express/Hono code. This
 * walk runs INSIDE the exact-pinned @modelcontextprotocol/sdk dist/esm tree,
 * following its relative imports from the three modules we actually load
 * (server/index.js, server/stdio.js, types.js), and bans network transports —
 * so an SDK-internal drift on a future (consciously re-pinned) upgrade fails
 * this test instead of shipping silently.
 */
describe("A1 SDK-internal walk — the pinned SDK's stdio path imports no HTTP/SSE transport code", () => {
  const sdkEsm = join(root, "node_modules", "@modelcontextprotocol", "sdk", "dist", "esm");
  const sdkEntries = [
    join(sdkEsm, "server", "index.js"),
    join(sdkEsm, "server", "stdio.js"),
    join(sdkEsm, "types.js"),
  ];

  function sdkResolve(fromFile: string, spec: string): string | null {
    if (!spec.startsWith(".")) return null; // bare/builtin specs judged by the ban list below
    const base = join(fromFile, "..", spec);
    const candidates = [base, `${base}.js`, join(base, "index.js")];
    return candidates.find((c) => existsSync(c) && c.endsWith(".js")) ?? null;
  }

  function sdkReachable(): Set<string> {
    const queue = [...sdkEntries];
    const seen = new Set<string>();
    while (queue.length > 0) {
      const file = queue.pop() as string;
      if (seen.has(file)) continue;
      seen.add(file);
      for (const spec of importsOf(file)) {
        const resolved = sdkResolve(file, spec);
        if (resolved !== null) queue.push(resolved);
      }
    }
    return seen;
  }

  const sdkBanned = [
    /streamableHttp/i,
    /webStandardStreamableHttp/i,
    /\/sse(\.js)?$/,
    /^express$|server\/express/,
    /^hono$|@hono\//,
    /^cors$/,
    /node:https?$/,
    /^eventsource/,
    /^raw-body$/,
  ];

  it("all three SDK entry modules exist at the pinned layout (else this proof is vacuous)", () => {
    for (const e of sdkEntries) {
      expect(existsSync(e), `pinned SDK entry missing: ${e} — re-pin consciously and update this walk`).toBe(true);
    }
  });

  it("no module reachable from server/index.js + server/stdio.js + types.js imports a banned network/transport spec", () => {
    const reachedSdk = sdkReachable();
    expect(reachedSdk.size).toBeGreaterThan(5); // sanity: the walk actually traversed the SDK
    for (const file of reachedSdk) {
      for (const spec of importsOf(file)) {
        for (const pattern of sdkBanned) {
          expect(
            pattern.test(spec),
            `banned SDK-internal import "${spec}" reachable from the stdio path, in ${file}`,
          ).toBe(false);
        }
      }
    }
  });
});
