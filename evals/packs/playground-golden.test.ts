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
});

describe("playground browser safety (import-graph walk)", () => {
  it("the seam's transitive import closure reaches no node:* module", () => {
    const seen = new Set<string>();
    const offenders: string[] = [];
    const IMPORT_RE = /(?:import|export)[^"']*from\s+["']([^"']+)["']|import\s+["']([^"']+)["']/g;

    function resolveSpec(fromFile: string, spec: string): string | null {
      let base: string;
      if (spec.startsWith("@/")) base = join(root, spec.slice(2));
      else if (spec.startsWith(".")) base = resolve(dirname(fromFile), spec);
      else return null; // bare specifier — handled by the caller
      for (const cand of [base, `${base}.ts`, `${base}.tsx`, `${base}.json`, join(base, "index.ts")]) {
        if (existsSync(cand)) return cand;
      }
      return null;
    }

    function walk(file: string) {
      if (seen.has(file)) return;
      seen.add(file);
      if (file.endsWith(".json")) return;
      const src = readFileSync(file, "utf8");
      for (const m of src.matchAll(IMPORT_RE)) {
        const spec = m[1] ?? m[2];
        if (!spec) continue;
        if (spec.startsWith("node:") || spec === "fs" || spec === "path") {
          offenders.push(`${file} imports ${spec}`);
          continue;
        }
        if (spec === "react" || spec === "next" || spec.startsWith("next/")) continue;
        const resolved = resolveSpec(file, spec);
        if (resolved) walk(resolved);
      }
    }

    walk(join(root, "components", "playground", "verify-in-browser.ts"));
    walk(join(root, "components", "playground", "PlaygroundClient.tsx"));
    expect(offenders, offenders.join("\n")).toEqual([]);
    // Sanity: the walk actually traversed the engine, not just the seam.
    expect(seen.size).toBeGreaterThan(8);
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
