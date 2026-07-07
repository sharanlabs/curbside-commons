import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * A2 IMPORT BOUNDARY (plan §3 as amended by Codex finding 4 — the enforceable
 * version of "recommendation-only"; AC-6):
 *
 * 1. DIRECT boundary: every file under `lib/crew/**` may import ONLY other
 *    `lib/crew/**` files, `lib/tools/registry.ts` (+ co-located types), and
 *    node builtins. The DENIED list (lib/verifier-core/**, lib/packs/**,
 *    lib/agents/**, lib/mcp/**, fixtures, goldens, answer keys) is checked
 *    against every import spec.
 * 2. TRANSITIVE $0/offline proof: same walker + ban list as A0/A1 (the walk
 *    legitimately reaches lib/packs/** THROUGH the registry — that seam is
 *    A0's own proven property).
 * 3. NEGATIVE FIXTURES (the plan's committed-negative-fixtures requirement):
 *    the forbidden-construct checker is exercised against three committed
 *    fixture files that each contain one forbidden construct, proving the
 *    checker actually fires (a walker that can't catch anything would pass
 *    silently otherwise).
 */

const root = process.cwd();
const crewDir = join(root, "lib", "crew");
const entry = join(crewDir, "orchestrator.ts");

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

function listCrewFiles(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...listCrewFiles(full));
    else if (/\.(ts|tsx)$/.test(full)) out.push(full);
  }
  return out;
}

/** The forbidden-construct checker — exported shape so the negative fixtures can exercise it directly. */
export function forbiddenConstructsIn(sourceText: string): string[] {
  const hits: string[] = [];
  if (/(^|[^.\w])require\s*\(|createRequire/.test(sourceText)) hits.push("cjs-require");
  if (/import\s*\(\s*[^"')]/.test(sourceText)) hits.push("non-literal-dynamic-import");
  if (/(^|[^.\w])fetch\s*\(/.test(sourceText)) hits.push("bare-fetch");
  return hits;
}

// DENIED direct-import targets for lib/crew/** (plan §3 amended AC-6 list).
const deniedDirect = [
  /verifier-core\//,
  /packs\//,
  /lib\/agents\/|agents\//,
  /lib\/mcp\/|\.\.\/mcp\//,
  /fixtures\//,
  /evals\//,
  /\.golden\./,
];

// Transitive ban list — same as A0/A1 (kept in agreement across the three proofs).
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

describe("A2 direct import boundary — lib/crew/** imports registry + crew + builtins ONLY", () => {
  const crewFiles = listCrewFiles(crewDir);

  it("sanity: the crew source files exist and were walked", () => {
    expect(crewFiles.length).toBeGreaterThanOrEqual(5);
  });

  it("no crew file imports a denied target (verifier-core, packs, agents, mcp, fixtures, goldens)", () => {
    for (const file of crewFiles) {
      for (const spec of importsOf(file)) {
        for (const pattern of deniedDirect) {
          expect(pattern.test(spec), `denied import "${spec}" in ${file}`).toBe(false);
        }
      }
    }
  });

  it("every repo-relative import from lib/crew/** targets lib/crew/** or lib/tools/**", () => {
    for (const file of crewFiles) {
      for (const spec of importsOf(file)) {
        if (spec.startsWith("node:") || (!spec.startsWith(".") && !spec.startsWith("@/"))) continue;
        const resolved = resolve(file, spec);
        expect(resolved, `unresolvable repo import "${spec}" in ${file}`).not.toBeNull();
        expect(
          /\/lib\/crew\/|\/lib\/tools\/(registry|types)\.ts$/.test(resolved!),
          `crew file ${file} imports outside lib/crew + the registry seam (registry.ts/types.ts ONLY — tool implementations and serializers are off-limits; Codex A2 P2-2): ${resolved}`,
        ).toBe(true);
      }
    }
  });
});

describe("A2 transitive $0/offline proof (through the registry, same as A0/A1)", () => {
  const reached = reachableFrom(entry);

  it("sanity: the walk traversed the crew AND the registry", () => {
    const rel = [...reached].map((f) => f.replace(root, ""));
    expect(reached.size).toBeGreaterThan(15);
    expect(rel.some((f) => f === "/lib/tools/registry.ts")).toBe(true);
  });

  it("no module reachable from the orchestrator matches a banned LLM/network pattern", () => {
    for (const file of reached) {
      if (file.endsWith(".json")) continue;
      for (const spec of importsOf(file)) {
        for (const pattern of banned) {
          expect(pattern.test(spec), `banned import "${spec}" in ${file}`).toBe(false);
        }
      }
    }
  });

  it("no reachable source contains a forbidden construct (require/createRequire, non-literal import(, bare fetch()", () => {
    for (const file of reached) {
      if (file.endsWith(".json")) continue;
      const hits = forbiddenConstructsIn(readFileSync(file, "utf8"));
      expect(hits, `forbidden constructs ${JSON.stringify(hits)} in ${file}`).toStrictEqual([]);
    }
  });
});

describe("A2 negative fixtures — the checker demonstrably FIRES (committed bad-source files)", () => {
  const negDir = join(root, "evals", "crew", "fixtures", "negative");
  const expected: ReadonlyArray<{ file: string; hit: string }> = [
    { file: "uses-require.src.txt", hit: "cjs-require" },
    { file: "uses-dynamic-import.src.txt", hit: "non-literal-dynamic-import" },
    { file: "uses-fetch.src.txt", hit: "bare-fetch" },
  ];

  for (const { file, hit } of expected) {
    it(`${file} is flagged with "${hit}"`, () => {
      const text = readFileSync(join(negDir, file), "utf8");
      expect(forbiddenConstructsIn(text)).toContain(hit);
    });
  }

  it("a clean source yields zero hits (the checker is not trivially always-firing)", () => {
    expect(forbiddenConstructsIn('import { x } from "./y.ts";\nexport const z = x + 1;\n')).toStrictEqual([]);
  });
});
