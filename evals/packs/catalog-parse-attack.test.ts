import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  SOR_CATALOG,
  parseAcpFeedText,
  parseCatalogText,
  verifyAcpFeed,
} from "@/components/playground/verify-in-browser";
import {
  DuplicateVariationIdError,
  acpFeedToClaims,
  findDuplicateVariationId,
  runListingsVerification,
  type AcpFeed,
  type SorItem,
  type SyntheticCatalog,
} from "@/lib/packs/listings";
import { runCheck } from "@/lib/packs/listings/cli";

/**
 * ADVERSARIAL PASS on `parseCatalogText` (2026-07-27) — attacking my own claim
 * that it "refuses only what the engine cannot index, and never coerces."
 *
 * The dangerous direction is ACCEPTANCE, not refusal. A refused document tells
 * the reader plainly that nothing ran. An ACCEPTED document that the engine
 * then reads differently than the reader wrote it produces a VERDICT — and a
 * wrong verdict on a real catalog is the failure this product exists to catch.
 *
 * So each case below feeds a document the parser accepts and asks: does the
 * report that comes out mean what the reader thinks it means?
 */

const feedOf = (ids: readonly string[]) =>
  JSON.stringify({
    spec: "acp-product-feed/extract-2026-07-02",
    items: ids.map((id) => ({
      item_id: id,
      title: "Thing",
      price: "1.00",
      currency: "USD",
      availability: "in_stock",
      variant_dict: { variation: "" },
    })),
  });

const catalogOf = (items: unknown[]) =>
  JSON.stringify({ asOf: "2026-07-03T00:00:00Z", items });

const one = (id: string, vid: string, cents = 100, stock = "in_stock") => ({
  id,
  name: "Thing",
  variations: [{ id: vid, name: "", priceCents: cents, stock }],
});

describe("duplicate variation ids — the silent-shadowing case", () => {
  it("a catalog with two rows sharing a variation id does not quietly verify against one", () => {
    // indexCatalog builds a Map keyed by variation id (reference.ts:38-44), so
    // a duplicate SILENTLY overwrites: the feed row is checked against whichever
    // record happened to be last, and the reader is never told the other record
    // exists. Both prices cannot be right, and the report cannot say which was
    // used — an unresolvable ambiguity dressed as a clean verdict.
    const r = parseCatalogText(catalogOf([one("i1", "dup", 100), one("i2", "dup", 500)]));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/dup/);
  });

  it("distinct ids across items remain fine", () => {
    const r = parseCatalogText(catalogOf([one("i1", "v1"), one("i2", "v2")]));
    expect(r.ok).toBe(true);
  });

  it("duplicates WITHIN one item are caught too", () => {
    const r = parseCatalogText(
      catalogOf([
        {
          id: "i1",
          name: "Thing",
          variations: [
            { id: "same", name: "S", priceCents: 100, stock: "in_stock" },
            { id: "same", name: "L", priceCents: 200, stock: "in_stock" },
          ],
        },
      ]),
    );
    expect(r.ok).toBe(false);
  });
});

describe("an empty catalog is refused, not silently turned into a verdict", () => {
  it("`items: []` cannot produce an honest audit", () => {
    // Accepted, this yields a report where EVERY feed row is a ghost — a
    // confident-looking wall of errors whose real cause is that the reader
    // supplied no records at all. Refusing names the actual problem.
    const r = parseCatalogText(catalogOf([]));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/no items|empty/i);
  });
});

describe("accepted documents produce verdicts that mean what they say", () => {
  it("a hidden row is not reported missing — the engine's own rule, preserved", () => {
    // completenessSweep skips `hidden` variations (run.ts:90). A reader whose
    // catalog marks a row hidden must not see it demanded of their feed.
    const cat = parseCatalogText(catalogOf([one("i1", "v1", 100, "hidden")]));
    expect(cat.ok).toBe(true);
    if (!cat.ok) return;
    const feed = parseAcpFeedText(feedOf([]));
    expect(feed.ok).toBe(true);
    if (!feed.ok) return;

    const report = verifyAcpFeed(feed.feed, cat.catalog);
    expect(report.findings.filter((f) => f.ruleId === "LST-EXIST-MISSING")).toHaveLength(0);
  });

  it("ids differing only by whitespace are treated as DIFFERENT — no silent trimming", () => {
    // Coercion here would be the product's own sin: two ids that look alike but
    // are not the same string must not be quietly matched.
    const cat = parseCatalogText(catalogOf([one("i1", "sku-1")]));
    const feed = parseAcpFeedText(feedOf(["sku-1 "]));
    expect(cat.ok && feed.ok).toBe(true);
    if (!cat.ok || !feed.ok) return;

    const report = verifyAcpFeed(feed.feed, cat.catalog);
    expect(report.ok).toBe(false);
    // The engine does BETTER than refuse: it resolves the row by exact name and
    // reports the identity mismatch, quoting both ids so the trailing space is
    // visible. (My first version of this tooth expected GHOST and was wrong —
    // the engine was right. Recorded rather than quietly corrected.)
    expect(report.findings.some((f) => f.ruleId === "LST-IDENT-ID-MISMATCH")).toBe(true);
    expect(report.findings.some((f) => f.plainLine?.includes('"sku-1 "'))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// S1.5 (2026-10-31) — ONE duplicate-id predicate for every path into the engine.
//
// Codex cross-check 2026-10-12 § 4: the browser refused a catalog that repeats
// a variation id, but the CLI / MCP / runListingsVerification path accepted it,
// and `indexCatalog`'s Map silently kept the LAST row. The offline probe — two
// record rows sharing one id at $10 and $20, against a $20 feed — returned PASS.
// Now `runListingsVerification` calls `assertUniqueVariationIds`
// (lib/packs/listings/reference.ts) before any claim is judged, so the CLI, the
// MCP `check_feed` tool (a wrapper of `runCheck`), the demo, the generators and
// the browser seam `verifyAcpFeed` all refuse through the SAME function.
//
// The browser's parse-layer refusal (`parseCatalogText`, components/playground/
// verify-in-browser.ts) is an earlier, inline check in a file outside this
// lane; it is held to the same verdicts by the shared fixture below, and its
// engine call is held to the same predicate by import identity
// (`verifyAcpFeed` throws the very `DuplicateVariationIdError` class).
//
// RED proof (2026-10-31 01:27, recorded): with the `assertUniqueVariationIds(sor);`
// line in run.ts replaced by a comment (run.ts sha256/16 c5f9f382ebe2ae19 →
// eb3a7bb701285e90), the four engine / runCheck / browser-seam / real-process
// tests below fail — nothing is thrown, and bin/check.mjs exits 0 with a PASS
// report on stdout (Codex's PASS, reproduced) instead of 2. Restored from the
// saved copy → sha c5f9f382ebe2ae19, 15/15 green.
// ---------------------------------------------------------------------------

/** Codex's probe: two record rows share id "dup" at $10 and $20; the copy serves "dup" at $20. */
const PROBE_CATALOG: SyntheticCatalog = {
  simulated: true,
  generator: { name: "duplicate-id probe", seed: 0, version: "test" },
  currency: "USD",
  asOf: "2026-07-03T00:00:00Z",
  merchantName: "Probe merchant",
  items: [
    { id: "i1", name: "Thing", description: "", category: "", modifierLists: [], variations: [{ id: "dup", name: "", priceCents: 1000, stock: "in_stock" }] },
    { id: "i2", name: "Thing", description: "", category: "", modifierLists: [], variations: [{ id: "dup", name: "", priceCents: 2000, stock: "in_stock" }] },
  ],
};
const PROBE_FEED = (() => {
  const r = parseAcpFeedText(
    JSON.stringify({
      spec: "acp-product-feed/extract-2026-07-02",
      items: [{ item_id: "dup", title: "Thing", price: "20.00", currency: "USD", availability: "in_stock", variant_dict: { variation: "" } }],
    }),
  );
  if (!r.ok) throw new Error(`probe feed must parse: ${r.error}`);
  return r.feed;
})();

/** The refusal names the id AND both rows. */
function expectNamesBothRows(message: string): void {
  expect(message).toContain('"dup"');
  expect(message).toContain('items[0].variations[0] (item "i1")');
  expect(message).toContain('items[1].variations[0] (item "i2")');
}

describe("S1.5 — the duplicate-id refusal is one predicate on every path (Codex § 4 probe)", () => {
  it("the engine refuses Codex's $10/$20 probe instead of returning PASS", () => {
    let thrown: unknown;
    try {
      runListingsVerification(acpFeedToClaims(PROBE_FEED), PROBE_CATALOG);
    } catch (e) {
      thrown = e;
    }
    expect(thrown, "a duplicate-id catalog must never verify (Codex probe returned PASS)").toBeInstanceOf(
      DuplicateVariationIdError,
    );
    expectNamesBothRows((thrown as Error).message);
    expect((thrown as DuplicateVariationIdError).duplicate.id).toBe("dup");
  });

  it("the browser seam refuses through the SAME predicate (import identity: the same error class)", () => {
    expect(() => verifyAcpFeed(PROBE_FEED, PROBE_CATALOG)).toThrow(DuplicateVariationIdError);
  });

  it("runCheck (the CLI's and the MCP check_feed tool's engine call) throws the same typed error", () => {
    const dir = mkdtempSync(join(tmpdir(), "s15-dup-"));
    try {
      const feedPath = join(dir, "feed.json");
      const catPath = join(dir, "catalog.json");
      writeFileSync(feedPath, JSON.stringify(PROBE_FEED));
      writeFileSync(catPath, JSON.stringify(PROBE_CATALOG));
      let thrown: unknown;
      try {
        runCheck(feedPath, catPath, "acp");
      } catch (e) {
        thrown = e;
      }
      expect(thrown).toBeInstanceOf(DuplicateVariationIdError);
      expectNamesBothRows((thrown as Error).message);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("bin/check.mjs (real process) exits 2 and prints the refusal naming the id and both rows", () => {
    const dir = mkdtempSync(join(tmpdir(), "s15-dup-cli-"));
    try {
      const feedPath = join(dir, "feed.json");
      const catPath = join(dir, "catalog.json");
      writeFileSync(feedPath, JSON.stringify(PROBE_FEED));
      writeFileSync(catPath, JSON.stringify(PROBE_CATALOG));
      const r = spawnSync(process.execPath, [join(process.cwd(), "bin", "check.mjs"), "check", feedPath, "--against", catPath], {
        encoding: "utf8",
      });
      expect(r.status, `stdout: ${r.stdout}`).toBe(2);
      expect(r.stdout).toBe("");
      expectNamesBothRows(r.stderr);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  // One fixture, two refusal points: the browser's parse layer and the shared
  // predicate must agree on every case (refuse ⇔ the predicate finds a duplicate,
  // and both name the same id).
  const variation = (id: string, cents = 100) => ({ id, name: "", priceCents: cents, stock: "in_stock" });
  const SHARED_CASES: ReadonlyArray<readonly [string, unknown[]]> = [
    ["across two items", [{ id: "i1", name: "A", variations: [variation("dup", 1000)] }, { id: "i2", name: "B", variations: [variation("dup", 2000)] }]],
    ["within one item", [{ id: "i1", name: "A", variations: [variation("same", 100), variation("same", 200)] }]],
    ["the third row repeats the first", [{ id: "i1", name: "A", variations: [variation("v1"), variation("v2")] }, { id: "i2", name: "B", variations: [variation("v1")] }]],
    ["every id distinct", [{ id: "i1", name: "A", variations: [variation("v1"), variation("v2")] }, { id: "i2", name: "B", variations: [variation("v3")] }]],
  ];
  it.each(SHARED_CASES)("shared fixture — %s: the browser parse layer and the shared predicate agree", (_name, items) => {
    const parsed = parseCatalogText(JSON.stringify({ asOf: "2026-07-03T00:00:00Z", items }));
    const dup = findDuplicateVariationId(items as SorItem[]);
    expect(parsed.ok).toBe(dup === null);
    if (!parsed.ok && dup) expect(parsed.error).toContain(`"${dup.id}"`);
  });

  it("the clean bundled catalogs have no duplicate id (the engine still verifies them)", () => {
    const bundled = JSON.parse(
      readFileSync(join(process.cwd(), "fixtures", "synthetic-restaurant", "sor.catalog.json"), "utf8"),
    ) as SyntheticCatalog;
    expect(findDuplicateVariationId(bundled.items)).toBeNull();
    expect(findDuplicateVariationId(SOR_CATALOG.items)).toBeNull();
    const faithful = JSON.parse(
      readFileSync(join(process.cwd(), "fixtures", "synthetic-restaurant", "acp-feed.faithful.json"), "utf8"),
    ) as AcpFeed;
    expect(runListingsVerification(acpFeedToClaims(faithful), bundled).ok).toBe(true);
  });
});
