import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * AC-3 — $0/offline core (plan §4 AC-3, §5 row A0): a transitive import-graph
 * walk from `lib/tools/registry.ts` must reach NO module in the LLM/network
 * ban set (the SAME pattern + ban list as the existing `cli-c1`/
 * `demo-blindness` $0-LLM proofs) — `lib/agents/**` must be UNREACHABLE from
 * the registry at all, and no reachable source performs a bare `fetch(` or
 * imports `node:http(s)`.
 */

const root = process.cwd();
const entry = join(root, "lib", "tools", "registry.ts");

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
  const candidates = [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    `${base}.mjs`,
    `${base}.json`,
    join(base, "index.ts"),
  ];
  return candidates.find((c) => existsSync(c) && /\.(ts|tsx|mjs|json)$/.test(c)) ?? null;
}

function reachableFrom(startFile: string): Set<string> {
  const queue = [startFile];
  const seen = new Set<string>();
  while (queue.length > 0) {
    const file = queue.pop() as string;
    if (seen.has(file)) continue;
    seen.add(file);
    if (file.endsWith(".json")) continue; // data leaf, no imports
    for (const spec of importsOf(file)) {
      const resolved = resolve(file, spec);
      if (resolved !== null) queue.push(resolved);
    }
  }
  return seen;
}

// The cli-c1/demo-blindness ban list, EXTENDED for the tools seam (Codex A0
// finding 3): raw-socket modules and the common HTTP client packages too.
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

describe("AC-3 registry $0-LLM: structural import-graph proof", () => {
  const reached = reachableFrom(entry);
  const rel = [...reached].map((f) => f.replace(root, ""));

  it("no module reachable from lib/tools/registry.ts matches a banned pattern", () => {
    for (const file of reached) {
      if (file.endsWith(".json")) continue;
      for (const spec of importsOf(file)) {
        for (const pattern of banned) {
          expect(pattern.test(spec), `banned import "${spec}" in ${file}`).toBe(false);
        }
      }
    }
  });

  it("lib/agents/** is unreachable from the registry at all (no path, not even indirectly)", () => {
    expect(rel.some((f) => /^\/lib\/agents\//.test(f))).toBe(false);
  });

  it("no reachable source performs a bare fetch() (P3-5 pattern: source-text network scan)", () => {
    for (const file of reached) {
      if (file.endsWith(".json")) continue;
      const text = readFileSync(file, "utf8");
      expect(/(^|[^.\w])fetch\s*\(/.test(text), `bare fetch( reachable from the registry in ${file}`).toBe(
        false,
      );
    }
  });

  it("walker escape hatches are CLOSED: no require()/createRequire and no non-literal dynamic import in any reachable source (Codex A0 finding 3 — the regex walker only follows literal specifiers, so these constructs must not exist at all)", () => {
    for (const file of reached) {
      if (file.endsWith(".json")) continue;
      const text = readFileSync(file, "utf8");
      expect(
        /(^|[^.\w])require\s*\(|createRequire/.test(text),
        `CJS require/createRequire reachable from the registry in ${file} — the import walker cannot follow it`,
      ).toBe(false);
      expect(
        /import\s*\(\s*[^"')]/.test(text),
        `non-literal dynamic import( reachable from the registry in ${file} — the import walker cannot resolve it`,
      ).toBe(false);
    }
  });

  it("sanity: the walk actually traversed the registry + both packs, not just the entry", () => {
    expect(reached.size).toBeGreaterThan(15);
    expect(rel.some((f) => /\/lib\/packs\/listings\/cli\.ts$/.test(f))).toBe(true);
    expect(rel.some((f) => /\/lib\/packs\/fees\/audit\.ts$/.test(f))).toBe(true);
    expect(rel.some((f) => /\/lib\/packs\/fees\/classifier\.ts$/.test(f))).toBe(true);
  });
});
