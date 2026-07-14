/**
 * Playground seam teeth (owner commission 2026-07-13) — the tests that make the
 * /playground page's claims TRUE rather than asserted:
 *
 * 1. GOLDEN EQUALITY — the browser seam (components/playground/verify-in-browser.ts),
 *    fed the committed drifted sample feed, reproduces the committed golden
 *    fixtures/synthetic-restaurant/expected-report.acp.json BYTE-FOR-BYTE. This is
 *    the exact equality the page claims on its face ("a committed test proves…").
 * 2. THE GATE BITES — mutate one price in a clone of the sample feed and the
 *    report changes (so #1 is not a vacuous comparison).
 * 3. BROWSER SAFETY — walk the seam's transitive import graph (relative + "@/",
 *    .ts/.tsx/.json) and assert no module reaches a node: builtin — the proof the
 *    engine actually runs client-side rather than needing a server.
 * 4. HONESTY LABELS — the page + client source carry the simulated framing, the
 *    non-affiliation predicate, and the no-AI/no-network wording; the noscript
 *    fallback exists and cites the committed golden's real tally.
 */
import { describe, expect, it } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import {
  SAMPLE_FEED,
  parseAcpFeedText,
  sampleFeedText,
  verifyAcpFeed,
} from "../../components/playground/verify-in-browser.ts";
import { serializeReport } from "../../lib/verifier-core/verify.ts";
import type { AcpFeed } from "../../lib/packs/listings/acp-feed.ts";

const root = resolve(__dirname, "..", "..");
const golden = readFileSync(
  join(root, "fixtures", "synthetic-restaurant", "expected-report.acp.json"),
  "utf8",
);

describe("playground golden equality (the page's central claim)", () => {
  it("the browser seam reproduces the committed golden byte-for-byte for the sample feed", () => {
    const report = verifyAcpFeed(SAMPLE_FEED);
    expect(serializeReport(report)).toBe(golden);
  });

  it("the equality gate bites: a one-price mutation changes the report", () => {
    const mutated = JSON.parse(JSON.stringify(SAMPLE_FEED)) as AcpFeed;
    const first = mutated.items[0] as { price: unknown };
    first.price = "999.99";
    const report = verifyAcpFeed(mutated);
    expect(serializeReport(report)).not.toBe(golden);
  });

  it("round-trips through the paste path: sampleFeedText → parse → verify == golden", () => {
    const parsed = parseAcpFeedText(sampleFeedText());
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(serializeReport(verifyAcpFeed(parsed.feed))).toBe(golden);
    }
  });

  it("malformed input yields an honest error, never a verdict", () => {
    expect(parseAcpFeedText("").ok).toBe(false);
    expect(parseAcpFeedText("not json {").ok).toBe(false);
    expect(parseAcpFeedText("[1,2,3]").ok).toBe(false);
    expect(parseAcpFeedText('{"no_items": true}').ok).toBe(false);
    const bad = parseAcpFeedText('{"no_items": true}');
    if (!bad.ok) expect(bad.error).toMatch(/items/);
  });

  it("structurally broken rows are rejected with the row named (batch-F P2 fix)", () => {
    // a null row would throw inside the adapter's property access
    const nullRow = parseAcpFeedText('{"items":[null]}');
    expect(nullRow.ok).toBe(false);
    if (!nullRow.ok) expect(nullRow.error).toMatch(/items\[0\]/);
    // an array row is not an object
    expect(parseAcpFeedText('{"items":[[1]]}').ok).toBe(false);
    // a row without a string item_id cannot name its findings
    const noId = parseAcpFeedText('{"items":[{"title":"x"}]}');
    expect(noId.ok).toBe(false);
    if (!noId.ok) expect(noId.error).toMatch(/item_id/);
    const numericId = parseAcpFeedText('{"items":[{"item_id":42}]}');
    expect(numericId.ok).toBe(false);
  });

  it("wrong or missing FIELD VALUES still verify (findings, not errors)", () => {
    // shape is readable (object + string item_id) — the engine's job is to
    // report the drift, not to reject the row.
    const sparse = parseAcpFeedText('{"items":[{"item_id":"sku-1","title":123}]}');
    expect(sparse.ok).toBe(true);
    if (sparse.ok) {
      const report = verifyAcpFeed(sparse.feed);
      expect(report.ok).toBe(false);
      expect(report.findings.length).toBeGreaterThan(0);
    }
  });
});

/**
 * Browser-safety closure walk — FAIL-CLOSED (batch-F P2 fix: the first cut's
 * single regex missed dynamic import(), require(), and import-equals, and
 * silently skipped unresolved specifiers — a fail-open "proof". This version:
 * matches every import form, checks the COMPLETE Node builtin list, fails on
 * any unresolved or non-allowlisted specifier, and proves its own matcher
 * bites on planted hidden forms.)
 */
import { builtinModules } from "node:module";

const IMPORT_FORMS: readonly RegExp[] = [
  // import ... from "x" / export ... from "x"
  /(?:import|export)\s[^"'`]*?from\s*["']([^"']+)["']/g,
  // side-effect import "x"
  /import\s*["']([^"']+)["']/g,
  // dynamic import("x")
  /import\s*\(\s*["']([^"']+)["']\s*\)/g,
  // require("x") — incl. TS import-equals `import x = require("x")`
  /require\s*\(\s*["']([^"']+)["']\s*\)/g,
];

function extractSpecifiers(src: string): string[] {
  const specs: string[] = [];
  for (const re of IMPORT_FORMS) {
    for (const m of src.matchAll(re)) specs.push(m[1]);
  }
  return specs;
}

/** Bare specifiers the browser bundle legitimately provides. Everything else fails. */
const BARE_ALLOWLIST = new Set(["react"]);
const BARE_PREFIX_ALLOWLIST = ["react/", "next/", "react-dom/"];
const NODE_BUILTINS = new Set([...builtinModules, ...builtinModules.map((m) => `node:${m}`)]);

describe("playground browser safety (fail-closed import-graph walk)", () => {
  function resolveSpec(fromFile: string, spec: string): string | null {
    let base: string;
    if (spec.startsWith("@/")) base = join(root, spec.slice(2));
    else if (spec.startsWith(".")) base = resolve(dirname(fromFile), spec);
    else return null;
    for (const cand of [base, `${base}.ts`, `${base}.tsx`, `${base}.json`, join(base, "index.ts")]) {
      if (existsSync(cand)) return cand;
    }
    return null;
  }

  function walkClosure(entries: string[]): { seen: Set<string>; offenders: string[] } {
    const seen = new Set<string>();
    const offenders: string[] = [];
    function walk(file: string) {
      if (seen.has(file)) return;
      seen.add(file);
      if (file.endsWith(".json")) return;
      const src = readFileSync(file, "utf8");
      for (const spec of extractSpecifiers(src)) {
        if (NODE_BUILTINS.has(spec)) {
          offenders.push(`${file} imports the Node builtin "${spec}"`);
          continue;
        }
        if (spec.startsWith("@/") || spec.startsWith(".")) {
          const resolved = resolveSpec(file, spec);
          if (resolved === null) {
            offenders.push(`${file} imports "${spec}" which did not resolve — fail closed`);
            continue;
          }
          walk(resolved);
          continue;
        }
        // bare specifier: allowlisted or a failure — never silently skipped
        if (BARE_ALLOWLIST.has(spec) || BARE_PREFIX_ALLOWLIST.some((p) => spec.startsWith(p))) {
          continue;
        }
        offenders.push(`${file} imports non-allowlisted bare specifier "${spec}" — fail closed`);
      }
    }
    for (const e of entries) walk(e);
    return { seen, offenders };
  }

  it("the seam's transitive closure reaches no Node builtin and nothing unresolved", () => {
    const { seen, offenders } = walkClosure([
      join(root, "components", "playground", "verify-in-browser.ts"),
      join(root, "components", "playground", "PlaygroundClient.tsx"),
    ]);
    expect(offenders, offenders.join("\n")).toEqual([]);
    // Sanity: the walk actually traversed the engine, not just the seam.
    expect(seen.size).toBeGreaterThan(8);
  });

  it("the scanner itself bites: every hidden import form is detected", () => {
    const hidden = [
      'void import("node:fs")',
      'const fs = require("node:fs")',
      'import fs = require("node:fs")',
      'export { x } from "node:crypto"',
      'import "fs"',
      'import { join } from "path"',
    ];
    for (const sample of hidden) {
      const specs = extractSpecifiers(sample);
      const caught = specs.some((s) => NODE_BUILTINS.has(s));
      expect(caught, `scanner missed: ${sample} (extracted: ${JSON.stringify(specs)})`).toBe(true);
    }
    // and a non-allowlisted bare package would fail rather than be skipped
    const bare = extractSpecifiers('import x from "left-pad"');
    expect(bare).toContain("left-pad");
    expect(BARE_ALLOWLIST.has("left-pad")).toBe(false);
  });
});

describe("playground honesty labels", () => {
  const pageSrc = readFileSync(join(root, "app", "playground", "page.tsx"), "utf8");
  const clientSrc = readFileSync(
    join(root, "components", "playground", "PlaygroundClient.tsx"),
    "utf8",
  );

  it("the page carries the simulated framing and the non-affiliation predicate", () => {
    expect(pageSrc).toMatch(/simulated/i);
    expect(pageSrc).toMatch(
      /Not\s+affiliated with, endorsed by, or connected to any marketplace, POS vendor, AI company,\s+or protocol body\./,
    );
  });

  it("the page states the no-AI / no-network boundary and the synthetic-catalog boundary", () => {
    expect(pageSrc).toMatch(/No AI calls/i);
    expect(pageSrc).toMatch(/no network requests/i);
    expect(pageSrc).toMatch(/Honest boundary/);
  });

  it("the noscript fallback exists and cites the committed golden's real tally", () => {
    expect(pageSrc).toMatch(/<noscript>/);
    expect(pageSrc).toMatch(/16 findings \(11 error \/ 5 warn\)/);
    expect(pageSrc).toMatch(/expected-report\.acp\.json/);
  });

  it("the client distinguishes sample (simulated golden) from pasted (live, synthetic-catalog-checked) provenance", () => {
    expect(clientSrc).toMatch(/recomputed in your browser/);
    expect(clientSrc).toMatch(/Computed in your browser just now/);
    expect(clientSrc).toMatch(/stays labeled simulated/);
  });
});
