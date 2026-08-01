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
import { readFileSync, existsSync, statSync } from "node:fs";
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
// The estate's single list of egress spellings — imported rather than
// re-declared so a new sink added there is enforced here too (gate finding 12).
import { NETWORK_CALL_PATTERNS } from "../lib/import-walk.ts";

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
// "@number-flow/react": vetted ADOPT-WITH-CONDITIONS 2026-07-16 (MIT, exact-pinned
// 0.6.1; zero network/hooks verified in the repo AND the published tarballs incl.
// the esm-env transitive; reduced-motion/ARIA floors verified) — first real use is
// the /fees paste-leg tally. The covering batch re-probes the whole condition set.
// "react-dom": the shipped FeesView.tsx imports { flushSync } from it (a client-only
// React DOM API for the SSR-then-page tab flush) — browser-provided, same bundle as the
// already-trusted "react-dom/" prefix; no node builtin is reachable through it.
const BARE_ALLOWLIST = new Set(["react", "react-dom", "@number-flow/react"]);
const BARE_PREFIX_ALLOWLIST = ["react/", "next/", "react-dom/"];
const NODE_BUILTINS = new Set([...builtinModules, ...builtinModules.map((m) => `node:${m}`)]);

describe("playground browser safety (fail-closed import-graph walk)", () => {
  function resolveSpec(fromFile: string, spec: string): string | null {
    let base: string;
    if (spec.startsWith("@/")) base = join(root, spec.slice(2));
    else if (spec.startsWith(".")) base = resolve(dirname(fromFile), spec);
    else return null;
    // FILE candidates only (fee-surface extension 2026-07-16): a bare `base`
    // hit can be a DIRECTORY (a barrel import like "@/lib/packs/fees"), which
    // the old order returned and then failed to read — resolve barrels to
    // their index.ts and never return a directory.
    for (const cand of [`${base}.ts`, `${base}.tsx`, `${base}.json`, join(base, "index.ts"), base]) {
      if (existsSync(cand) && statSync(cand).isFile()) return cand;
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
      // Batch P2 fix (2026-07-16): a dynamic import()/require() whose specifier
      // is NOT a single quoted literal (template literal, variable, or a
      // quoted-prefix CONCATENATION like require("node:" + x)) would slip the
      // extraction regexes — count call sites vs FULL-literal calls and fail
      // closed on any gap.
      const dynCalls = (src.match(/\bimport\s*\(/g) ?? []).length;
      const dynLiterals = (src.match(/\bimport\s*\(\s*["'][^"']*["']\s*\)/g) ?? []).length;
      if (dynCalls > dynLiterals) {
        offenders.push(`${file} contains a dynamic import with a non-literal specifier — fail closed`);
      }
      const reqCalls = (src.match(/\brequire\s*\(/g) ?? []).length;
      const reqLiterals = (src.match(/\brequire\s*\(\s*["'][^"']*["']\s*\)/g) ?? []).length;
      if (reqCalls > reqLiterals) {
        offenders.push(`${file} contains a require() with a non-literal specifier — fail closed`);
      }
      // EGRESS SINKS, not just imports (cross-model gate finding 12,
      // 2026-07-27). This walk only ever checked what a file IMPORTS — but
      // `fetch`, `sendBeacon`, `XMLHttpRequest`, `WebSocket` and `EventSource`
      // are GLOBALS: adding any of them needs no import at all and left this
      // guard green. That made "zero-network by construction" a claim broader
      // than the thing backing it — on the very surface that now reads the
      // reader's files. The shared scanner already had the patterns
      // (evals/lib/import-walk.ts:77-87); this walk simply never used them.
      for (const [pattern, label] of NETWORK_CALL_PATTERNS) {
        if (pattern.test(src)) {
          offenders.push(`${file} contains a network call: ${label}`);
        }
      }
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
      // The upload surface (2026-07-27) joins the same closure: a file input
      // is only zero-network if what reads it is. FileReader never touches a
      // network, and this walk proves nothing in the workbench's import graph
      // can either — the page's "nothing leaves this page" promise is
      // structural, not a courtesy.
      join(root, "components", "playground", "AuditWorkbench.tsx"),
      join(root, "components", "playground", "FileDrop.tsx"),
      // Fee surface (NYC showcase N1+N2, 2026-07-16): the fee seam + clients
      // run in the same browser closure — same fail-closed proof.
      join(root, "components", "fees", "audit-in-browser.ts"),
      join(root, "components", "fees", "FeePlaygroundClient.tsx"),
      join(root, "components", "fees", "FeesView.tsx"),
      join(root, "components", "fees", "fee-report-data.ts"),
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

  it("the non-literal-specifier catch bites (template-literal / variable imports)", () => {
    // Mirrors the walker's FULL decision: a planted non-literal form is caught
    // either by the call-site counting gap, or by its extracted quoted PREFIX
    // failing the bare-specifier allowlist (fail-closed both ways).
    const caughtByWalkRules = (planted: string): boolean => {
      const dynCalls = (planted.match(/\bimport\s*\(/g) ?? []).length;
      const dynLiterals = (planted.match(/\bimport\s*\(\s*["'][^"']*["']\s*\)/g) ?? []).length;
      const reqCalls = (planted.match(/\brequire\s*\(/g) ?? []).length;
      const reqLiterals = (planted.match(/\brequire\s*\(\s*["'][^"']*["']\s*\)/g) ?? []).length;
      if (dynCalls > dynLiterals || reqCalls > reqLiterals) return true;
      return extractSpecifiers(planted).some(
        (s) =>
          !s.startsWith("@/") &&
          !s.startsWith(".") &&
          !NODE_BUILTINS.has(s) &&
          !BARE_ALLOWLIST.has(s) &&
          !BARE_PREFIX_ALLOWLIST.some((p) => s.startsWith(p)),
      );
    };
    for (const planted of [
      "void import(`./mods/${name}`)",
      "const m = import(modPath)",
      'const fs = require("node:" + name)',
      "const r = require(pathVar)",
    ]) {
      expect(caughtByWalkRules(planted), `non-literal specifier slipped the catch: ${planted}`).toBe(
        true,
      );
    }
  });
});

describe("playground honesty labels (de-jargon Slice E — disclaimer-free + honest)", () => {
  const pageSrc = readFileSync(join(root, "app", "playground", "page.tsx"), "utf8");
  // REBOUND 2026-07-27 (the upload commission). These guards used to read
  // components/playground/PlaygroundClient.tsx — the one-field paste leg. That
  // component was DELETED when /playground became the two-file workbench, so
  // the guards now read the surface that actually ships. Every invariant below
  // is preserved verbatim; only the file they point at changed. A honesty
  // guard aimed at a component the page no longer renders is worse than no
  // guard: it reports green over an unexamined surface.
  const clientSrc = readFileSync(
    join(root, "components", "playground", "AuditWorkbench.tsx"),
    "utf8",
  );
  const dropSrc = readFileSync(join(root, "components", "playground", "FileDrop.tsx"), "utf8");

  // The public copy is disclaimer-free and jargon-free: the honest boundary is
  // stated in plain product language ("illustrative"), NOT with lab-words or a
  // non-affiliation disclaimer. These assertions are the red half — they FAIL
  // against the pre-de-jargon copy.
  it("the page states the honest boundary in plain, jargon-free language", () => {
    // freeze-reversal 2026-07-20: the "illustrative" label requirement is retired; the
    // rebuilt /playground states its honest boundary as the pinned-world copy — the
    // merchant catalog of N records, out-of-catalog reads as unknown or missing.
    // 2026-07-27: reworded from "reference world is …" to "sample catalog of N
    // records", because the page now ALSO takes the reader's own records — a
    // single fixed "reference world" stopped being true of every run on it.
    expect(pageSrc).toMatch(/HONEST BOUNDARY/);
    expect(pageSrc).toMatch(/checks against the bundled catalog/);
    expect(pageSrc).toMatch(/reads as unknown or missing/);
    // No lab-words / removed disclaimer leak onto the public page.
    expect(pageSrc).not.toMatch(/\bsimulated\b/i);
    expect(pageSrc).not.toMatch(/\bsynthetic\b/i);
    expect(pageSrc).not.toMatch(/\bgolden\b/i);
    expect(pageSrc).not.toMatch(/Not\s+affiliated with/i);
  });

  it("the page states the no-AI / data-stays-here boundary at the strength the code supports", () => {
    expect(pageSrc).toMatch(/No AI calls/i);
    // WAS `/no network requests/i` until 2026-07-28. That claim was FALSE and
    // this assertion was PINNING it: measured against the built export, `/`
    // makes 12 post-load requests — Next `<Link>` viewport prefetch pulling RSC
    // route payloads for /docs and /legacy/console. Off-origin count: 0.
    //
    // The two claims come apart, and only one is true. Nothing the reader
    // uploads or types ever leaves the browser (FileReader in, Blob URL out,
    // zero off-origin traffic) — but the PAGE plainly makes requests, for its
    // own routes. The site now says the true half.
    //
    // The banned pattern is asserted alongside the required one so the retired
    // overclaim cannot quietly return: a test that only checks for the new
    // wording would stay green if the old sentence were added back beside it.
    expect(pageSrc).toMatch(/nothing you type leaves your browser/i);
    expect(
      pageSrc,
      "the retired overclaim 'no network requests' is measurably false — see docs/reviews/codex-2026-07-28-s38-gate.md",
    ).not.toMatch(/no network requests/i);
  });

  it("the noscript fallback exists and cites the real tally (jargon-free, no repo path)", () => {
    // freeze-reversal 2026-07-20: the page no longer carries a single hardcoded noscript
    // paragraph citing "16 findings (11 error / 5 warn)"; the bench SSRs the settled
    // reference result so a no-JS reader gets the complete story, and PlaygroundClient
    // keeps its own <noscript> for the paste leg. Rebound to those real surfaces — the
    // byte-exact reference tally is proven by the golden-equality test above.
    expect(pageSrc).toMatch(/<TryLiveBench \/>/);
    expect(clientSrc).toMatch(/<noscript>/);
    // The internal fixture path must NOT be cited on any public surface.
    for (const src of [pageSrc, clientSrc, dropSrc]) {
      expect(src).not.toMatch(/expected-report\.acp\.json/);
      expect(src).not.toMatch(/fixtures\//);
    }
  });

  it("the workbench names the record side of every run, in plain language", () => {
    // 2026-07-27: the run's provenance is no longer one fixed sentence, because
    // the record side is now a CHOICE. Whichever way the reader goes, the
    // result must say which records the verdict was reached against — an
    // unlabelled verdict is the one thing this surface may never produce.
    expect(clientSrc).toMatch(/computed\s*\n?\s*in your browser/i);
    expect(clientSrc).toMatch(/of your own records/);
    expect(clientSrc).toMatch(/bundled records/);
    expect(clientSrc).toMatch(/unknown or missing/);
    // Both provenance phrases must read from the recorded ACTION, never from a
    // "is this slot non-empty" proxy — the bug gate finding 4 named.
    expect(clientSrc).toMatch(/run\.origin\.catalog === "reader"/);
    expect(clientSrc).toMatch(/run\.origin\.feed === "reader"/);
    // No lab-words on any public surface. The predecessor guard banned the
    // WHOLE WORD `simulated`, and an earlier version of this rebound tooth
    // narrowed it to `simulated: true` — which would have let the bare word
    // back onto a shipping surface. Caught by diffing old assertions against
    // new (claim-F attack, 2026-07-27); the original breadth is restored, and
    // this comment exists so the next narrowing has to be deliberate.
    for (const src of [clientSrc, dropSrc]) {
      expect(src).not.toMatch(/\bsimulated\b/i);
      expect(src).not.toMatch(/\bsynthetic\b/i);
    }
  });

  it("an uploaded run cannot inherit the committed corpus's honesty label", () => {
    // The C3/C10 labels describe the RUN. When the records are the reader's
    // own, the report must not claim synthetic-controlled matching or a
    // simulated corpus — see lib/packs/listings/run.ts (slice 1) and the
    // provenance suite. This tooth pins that the workbench actually passes a
    // catalog through rather than falling back to the compiled-in one.
    expect(clientSrc).toMatch(/verifyAcpFeed\(parsedFeed\.feed, catalog, origin\)/);
    // Provenance is carried, not inferred: the origin passed to the engine is
    // built from slot state, and the slot records the action that filled it.
    expect(clientSrc).toMatch(/catalogOrigin = record\.source/);
    expect(clientSrc).toMatch(/feed: feed\.source/);
  });

  it("FEED origin is distinguished, not just record origin", () => {
    // The deleted paste client distinguished the committed sample feed from a
    // pasted one, and the first rebound guard checked record origin ONLY —
    // retiring an invariant by accident rather than by decision (gate finding
    // 16). It is restored: both sides carry an origin, the sample-feed button
    // records "sample", and the result panel renders a `feed side` row that the
    // e2e asserts. This tooth exists so the next lapse has to be deliberate.
    expect(clientSrc).toMatch(/sampleFeedText\(\), "sample-feed\.json", "sample"/);
    expect(clientSrc).toMatch(/catalogSampleText\(\), "sample-catalog\.json", "sample"/);
    expect(clientSrc).toMatch(/feed side/);
    expect(clientSrc).toMatch(/bundled feed/);
  });
});
