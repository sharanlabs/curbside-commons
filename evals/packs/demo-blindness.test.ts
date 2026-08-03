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
 * verifier). The SAME walk also proves the actor path is $0-LLM. The walk uses
 * the alias-capable resolver (adopted repo-wide, D1 fold-in advisory ii).
 *
 * A second walk once covered the /demo web render path; see the tombstone at the
 * foot of this file for why it was retired and where its property now lives.
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

// ---------------------------------------------------------------------------
// RETIRED 2026-08-02 — "D1 web demo-render path is provider-free".
//
// That describe walked the import graph from `app/demo/page.tsx`. The /demo
// route was a meta-refresh redirect stub, and the stub was deleted along with
// the rest of the retired route set (real-product voice, owner directive): git
// history is the archive, and the URL now serves the site's 404. With no entry
// point the walk has no root, and a rootless walk passes vacuously — which is
// how a gate rots without anyone noticing, so it is removed rather than left
// pointing at nothing.
//
// The property it guarded is not lost. Egress and provider-freedom on the
// SERVED surfaces are walked by evals/packs/landing-delivery-egress.test.ts
// (the landing route the /demo content folded into) and
// evals/packs/walkthrough-zero-egress.test.ts, both of which use the shared
// lib/import-walk walker with its own known-positive controls in
// evals/packs/import-walk-guard.test.ts. The actor SOR-blindness walk above —
// the D1 contract proper — is untouched and still rooted in a real module.
// ---------------------------------------------------------------------------
