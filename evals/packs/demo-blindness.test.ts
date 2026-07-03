import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { buildFaithfulFeed, applyCorpusDrift, generateCatalog, CORPUS_AS_OF, CORPUS_SEED } from "@/lib/packs/listings";
import { selectFromSurface } from "@/lib/packs/listings/demo/actor";

/**
 * D1 — the actor is SOR-BLIND, machine-verified (plan §5 D1, council condition 5).
 *
 * A transitive import-graph walk from the actor module proves it can NEVER reach
 * the SOR reference resolver (reference.ts) or any SOR fixture — the blindness is
 * the whole point (an agent that could see the records would not need the
 * verifier). The SAME walk also proves the actor path is $0-LLM. A second walk
 * proves the WEB demo-render path imports no LLM/provider/network/fs-engine module
 * (it renders the COMMITTED transcript, exactly like the report page). Both walks
 * use the alias-capable resolver (adopted repo-wide, D1 fold-in advisory ii).
 */

const root = process.cwd();

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

function reachableFrom(entry: string): Set<string> {
  const queue = [entry];
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

const banned = [
  /lib\/agents\//,
  /@ai-sdk/,
  /^ai$|\/ai\//,
  /node:https?/,
  /undici/,
  /groq|gemini/i,
];

describe("D1 actor SOR-blindness (transitive import graph)", () => {
  const actor = join(root, "lib", "packs", "listings", "demo", "actor.ts");
  const reached = [...reachableFrom(actor)].map((f) => f.replace(root, ""));

  it("the actor never imports the SOR reference resolver (reference.ts)", () => {
    expect(reached.some((f) => /lib\/packs\/listings\/reference\.ts$/.test(f))).toBe(false);
  });

  it("the actor never imports any SOR/catalog fixture", () => {
    expect(reached.some((f) => /fixtures\//.test(f))).toBe(false);
    expect(reached.some((f) => /sor\.catalog|\.catalog\.json/.test(f))).toBe(false);
  });

  it("the actor path is $0-LLM (no provider/network module reachable)", () => {
    for (const spec of [...reachableFrom(actor)].flatMap((f) =>
      f.endsWith(".json") ? [] : importsOf(f),
    )) {
      for (const pattern of banned) {
        expect(pattern.test(spec), `banned import "${spec}" reachable from the actor`).toBe(false);
      }
    }
  });

  it("selection is deterministic — identical surface gives identical selection", () => {
    const sor = generateCatalog(CORPUS_SEED, CORPUS_AS_OF);
    const { feed } = applyCorpusDrift(buildFaithfulFeed(sor), sor);
    expect(selectFromSurface(feed)).toStrictEqual(selectFromSurface(feed));
  });
});

describe("D1 web demo-render path is provider-free (and renders committed JSON)", () => {
  const entry = join(root, "app", "demo", "page.tsx");
  const reached = reachableFrom(entry);
  const rel = [...reached].map((f) => f.replace(root, ""));

  it("no module reachable from app/demo/page.tsx matches a banned pattern", () => {
    for (const file of reached) {
      if (file.endsWith(".json")) continue;
      for (const spec of importsOf(file)) {
        for (const pattern of banned) {
          expect(pattern.test(spec), `banned import "${spec}" in ${file}`).toBe(false);
        }
      }
    }
  });

  it("no reachable source performs a bare fetch()", () => {
    for (const file of reached) {
      if (file.endsWith(".json")) continue;
      const text = readFileSync(file, "utf8");
      expect(/(^|[^.\w])fetch\s*\(/.test(text), `bare fetch( reachable in ${file}`).toBe(false);
    }
  });

  it("the web path renders the COMMITTED transcript, never the fs-touching engine", () => {
    // It must reach the view + the committed JSON + the single-sourced copy...
    expect(rel.some((f) => f.includes("components/demo/DemoView"))).toBe(true);
    expect(rel.some((f) => f.includes("fixtures/synthetic-restaurant/expected-demo.json"))).toBe(true);
    expect(rel.some((f) => f.includes("lib/packs/listings/demo/copy"))).toBe(true);
    // ...and must NOT pull the engine (transcript.ts → conformance.ts → node:fs).
    expect(rel.some((f) => /demo\/transcript\.ts$/.test(f))).toBe(false);
    expect(rel.some((f) => /listings\/conformance\.ts$/.test(f))).toBe(false);
    expect(rel.some((f) => /listings\/run\.ts$/.test(f))).toBe(false);
  });
});
