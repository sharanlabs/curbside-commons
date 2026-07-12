/**
 * E3 — the NO-SEND structural proof (plan §E3): a transitive import-graph
 * walk from `lib/approvals/simulator.ts` (the AC-3 walker pattern,
 * `evals/tools/registry-ac3-import-graph.test.ts`) reaches NO LLM/network
 * module, NO `node:child_process` (the simulator must not shell out), and —
 * the E3-specific teeth — NEITHER `lib/delivery/**` NOR `lib/mcp/**` is
 * reachable at all: the simulator structurally CANNOT send or transport.
 * Plus the bare-`fetch(` source scan over every reachable file.
 *
 * Plain: we trace every road leading out of the approvals code and prove
 * none of them goes anywhere near Slack, email, the network, or a shell —
 * the "send" roads don't just have gates, they don't exist.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const entry = join(root, "lib", "approvals", "simulator.ts");

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

// The AC-3 ban list, EXTENDED per the E3 packet: + node:child_process.
const banned = [
  /lib\/agents\//,
  /@ai-sdk/,
  /^ai$|\/ai\//,
  /node:https?/,
  /undici/,
  /groq|gemini/i,
  /node:net|node:tls|node:dgram/,
  /^node-fetch|^axios|^got$|^ws$/,
  /node:child_process/,
];

describe("E3 no-send structural proof", () => {
  const reached = reachableFrom(entry);
  const rel = [...reached].map((f) => f.replace(root, ""));

  it("no module reachable from lib/approvals/simulator.ts matches a banned LLM/network/shell pattern", () => {
    for (const file of reached) {
      if (file.endsWith(".json")) continue;
      for (const spec of importsOf(file)) {
        for (const pattern of banned) {
          expect(pattern.test(spec), `banned import "${spec}" in ${file}`).toBe(false);
        }
      }
    }
  });

  it("lib/delivery/** is UNREACHABLE (the simulator cannot build a sendable payload)", () => {
    expect(rel.some((f) => /^\/lib\/delivery\//.test(f))).toBe(false);
  });

  it("lib/mcp/** is UNREACHABLE (the simulator is not a transport surface)", () => {
    expect(rel.some((f) => /^\/lib\/mcp\//.test(f))).toBe(false);
  });

  it("no reachable source performs a bare fetch()", () => {
    for (const file of reached) {
      if (file.endsWith(".json")) continue;
      const text = readFileSync(file, "utf8");
      expect(/(^|[^.\w])fetch\s*\(/.test(text), `bare fetch( reachable in ${file}`).toBe(false);
    }
  });

  it("sanity: the walk actually traversed the approvals module (types + canonical + crew types)", () => {
    expect(rel.some((f) => f.includes("/lib/approvals/types.ts"))).toBe(true);
    expect(rel.some((f) => f.includes("/lib/approvals/canonical.ts"))).toBe(true);
    expect(rel.some((f) => f.includes("/lib/crew/types.ts"))).toBe(true);
    expect(reached.size).toBeGreaterThan(3);
  });
});
