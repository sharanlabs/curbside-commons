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
  CORPUS_AS_OF,
  CORPUS_SEED,
  DuplicateVariationIdError,
  ListingsInputError,
  ReservedIdError,
  acpFeedToClaims,
  buildFaithfulMenuFeed,
  findDuplicateVariationId,
  generateMenuModelCatalog,
  runListingsVerification,
  type AcpFeed,
  type AcpFeedItem,
  type SorItem,
  type SyntheticCatalog,
} from "@/lib/packs/listings";
import { DuplicateFeedRowError, FeedShapeError } from "@/lib/packs/listings/adapters";
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

// ---------------------------------------------------------------------------
// S1.5 — engine-side input refusals from the security review of 2026-10-31
// (docs/reviews/security-privacy-legal-2026-10-31.md F1 · F4 · F6 · F7), each
// driven through `runCheck`, the call the CLI and the MCP `check_feed` tool make.
//
// RED proof (2026-10-31 01:47, measured on this file of 29 tests; every
// mutation restored from a saved copy → adapters.ts 864c03a2c1799e32 ·
// modifiers.ts c0842c1396f989ff · run.ts e9fabfbfddd71741 (sha256/16), 29/29):
//  F1  guardRows' reserved-id `throw` line deleted (adapters.ts) → 5 failed:
//      the four ACP/UCP `catalog#1` / `catalog` probes verify instead of
//      refusing, and the same-predicate test. The
//      `assertNoReservedVariationIds(sor);` call deleted (run.ts) → 1 failed
//      (the catalog-side probe).
//  F4  each projection reverted ALONE to the raw value — the option object
//      (modifiers.ts), `row.hours` (modifiers.ts), the raw `variant_dict`
//      (adapters.ts) → 1 failed each: "customer_email" reaches the report.
//  F6  guardRows' duplicate-id `throw` line deleted → 3 failed.
//  F7  guardRows' menu-field loop short-circuited → 3 failed (the projection
//      dies on the raw value instead of a FeedShapeError naming the field).
// ---------------------------------------------------------------------------

const ROOT = process.cwd();
const restaurant = join(ROOT, "fixtures", "synthetic-restaurant");
const readFixture = <T,>(name: string): T => JSON.parse(readFileSync(join(restaurant, name), "utf8")) as T;

/** Write `feed` and `catalog` to a temp dir, run `runCheck`, clean up; returns the result or the thrown error. */
function check(feed: unknown, catalog: unknown, surface: "acp" | "ucp" = "acp"): { output?: string; ok?: boolean; error?: unknown } {
  const dir = mkdtempSync(join(tmpdir(), "s15-sec-"));
  try {
    const feedPath = join(dir, "feed.json");
    const catPath = join(dir, "catalog.json");
    writeFileSync(feedPath, JSON.stringify(feed));
    writeFileSync(catPath, JSON.stringify(catalog));
    const r = runCheck(feedPath, catPath, surface);
    return { output: r.output, ok: r.report.ok };
  } catch (error) {
    return { error };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

describe("S1.5 — F1: a feed row named `catalog` / `catalog#N` is refused, never a PASS", () => {
  const record = readFixture<SyntheticCatalog>("sor.catalog.json");
  const acp = readFixture<AcpFeed>("acp-feed.faithful.json");
  const ucp = readFixture<{ items: Array<Record<string, unknown>> }>("ucp-catalog-response.faithful.json");
  const fakeAcp = (id: string): AcpFeed => ({ ...acp, items: [...acp.items, { ...acp.items[0], item_id: id, title: "Phantom Platter", price: "20.00" }] });
  const fakeUcp = (id: string) => ({ ...ucp, items: [...ucp.items, { ...ucp.items[0], id, title: "Phantom Platter", price: { amount: "20.00", currency: "USD" } }] });

  it("control: the clean pair passes, and a fake `ghost-1` row is caught as a ghost", () => {
    expect(check(acp, record).ok).toBe(true);
    const ghost = check(fakeAcp("ghost-1"), record);
    expect(ghost.ok).toBe(false);
    expect(ghost.output).toContain("LST-EXIST-GHOST");
  });

  it.each(["catalog#1", "catalog"])("ACP: a fake row %s priced 20.00 is refused by name (security review probe)", (id) => {
    const r = check(fakeAcp(id), record);
    expect(r.ok, "the fake row must never return PASS").toBeUndefined();
    expect(r.error).toBeInstanceOf(ReservedIdError);
    expect((r.error as Error).message).toContain(`Feed row items[${acp.items.length}]`);
    expect((r.error as Error).message).toContain(id === "catalog" ? 'reserved id "catalog"' : `("${id}")`);
  });

  it.each(["catalog#1", "catalog"])("UCP: a fake item %s priced 20.00 is refused by name", (id) => {
    const r = check(fakeUcp(id), record, "ucp");
    expect(r.ok).toBeUndefined();
    expect(r.error).toBeInstanceOf(ReservedIdError);
    expect((r.error as Error).message).toContain(`Feed row items[${ucp.items.length}]`);
  });

  it("catalog side: a record variation id `catalog` or `sku#1` is refused by location", () => {
    for (const bad of ["catalog", "sku#1"]) {
      const tampered: SyntheticCatalog = {
        ...record,
        items: record.items.map((it, i) => (i === 1 ? { ...it, variations: it.variations.map((v, k) => (k === 0 ? { ...v, id: bad } : v)) } : it)),
      };
      const r = check(acp, tampered);
      expect(r.error, bad).toBeInstanceOf(ReservedIdError);
      expect((r.error as Error).message).toContain("Catalog row items[1].variations[0]");
    }
  });

  it("the browser's JSON door and the engine refuse through the same predicate", () => {
    const parsed = parseAcpFeedText(JSON.stringify(fakeAcp("catalog#1")));
    expect(parsed.ok).toBe(false);
    if (!parsed.ok) expect(parsed.error).toContain('has an `id` containing "#" ("catalog#1")');
    expect(() => acpFeedToClaims(fakeAcp("catalog#1"))).toThrow('has an `id` containing "#" ("catalog#1")');
  });
});

describe("S1.5 — F6: the same row id served twice on one copy is refused", () => {
  const record = readFixture<SyntheticCatalog>("sor.catalog.json");
  const acp = readFixture<AcpFeed>("acp-feed.faithful.json");
  const ucp = readFixture<{ items: Array<Record<string, unknown>> }>("ucp-catalog-response.faithful.json");

  it("ACP: an exact duplicate row is refused, naming the id and both rows", () => {
    const r = check({ ...acp, items: [...acp.items, acp.items[2]] }, record);
    expect(r.error).toBeInstanceOf(DuplicateFeedRowError);
    expect((r.error as Error).message).toContain(`"${acp.items[2].item_id}" twice: items[2] and items[${acp.items.length}]`);
  });

  it("ACP: a duplicate row that disagrees with the record cannot hide behind the one that agrees", () => {
    const r = check({ ...acp, items: [...acp.items, { ...acp.items[2], price: "0.01" }] }, record);
    expect(r.error).toBeInstanceOf(DuplicateFeedRowError);
  });

  it("UCP: a duplicate item is refused the same way", () => {
    const r = check({ ...ucp, items: [...ucp.items, ucp.items[0]] }, record, "ucp");
    expect(r.error).toBeInstanceOf(DuplicateFeedRowError);
  });
});

describe("S1.5 — F4: a field planted inside modifiers[] / hours[] / variant_dict never reaches the report", () => {
  const record = generateMenuModelCatalog(CORPUS_SEED, CORPUS_AS_OF);
  const faithful = buildFaithfulMenuFeed(record);
  const PLANT = { customer_email: "planted-person@example.com" };

  it("the planted key is dropped from every claim value, while the drift it rides on is still reported", () => {
    // Plant on rows that ALSO drift, so the claim carrying the planted key is a finding's evidence.
    const modRow = faithful.items.find((r) => (r.modifiers ?? []).some((m) => Number(m.price_delta) > 0))!;
    const hoursRow = faithful.items.find((r) => r.hours !== undefined && r.item_id !== modRow.item_id)!;
    const dictRow = faithful.items.find((r) => r.item_id !== modRow.item_id && r.item_id !== hoursRow.item_id)!;
    const items = faithful.items.map((r): AcpFeedItem => {
      if (r.item_id === modRow.item_id) {
        return { ...r, modifiers: r.modifiers!.map((m, i) => (i === 0 ? { ...m, ...PLANT, price_delta: "9.99" } : m)) };
      }
      if (r.item_id === hoursRow.item_id) {
        return { ...r, hours: r.hours!.map((w, i) => (i === 0 ? { ...w, ...PLANT, close: "03:00:00" } : w)) };
      }
      if (r.item_id === dictRow.item_id) return { ...r, variant_dict: { variation: "Not This One", ...PLANT } };
      return r;
    });
    const r = check({ ...faithful, items }, record);
    expect(r.error).toBeUndefined();
    expect(r.ok).toBe(false);
    for (const rule of ["LST-MOD-PRICE-VALUE", "LST-HOURS-WINDOW", "LST-IDENT-MODIFIER-AMBIG"]) expect(r.output).toContain(rule);
    expect(r.output).not.toContain("customer_email");
    expect(r.output).not.toContain("planted-person");
  });
});

describe("S1.5 — F7: a malformed menu-extension value is a named refusal, not a TypeError", () => {
  const record = generateMenuModelCatalog(CORPUS_SEED, CORPUS_AS_OF);
  const faithful = buildFaithfulMenuFeed(record);
  it.each([
    ["modifiers", "extra cheese"],
    ["modifiers", [null]],
    ["hours", { day: "MON" }],
  ] as const)("%s = %j is refused with a FeedShapeError naming the row and the field", (field, value) => {
    const items = faithful.items.map((r, i) => (i === 0 ? ({ ...r, [field]: value } as unknown as AcpFeedItem) : r));
    const r = check({ ...faithful, items }, record);
    expect(r.error).toBeInstanceOf(FeedShapeError);
    expect(r.error).toBeInstanceOf(ListingsInputError);
    expect((r.error as Error).message).toContain(`items[0] (item_id "${faithful.items[0].item_id}") has a \`${field}\` value`);
  });
});
