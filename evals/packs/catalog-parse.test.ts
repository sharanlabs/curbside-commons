import { describe, expect, it } from "vitest";
import { parseCatalogText } from "@/components/playground/verify-in-browser";

/**
 * SLICE 2 — parsing an UPLOADED merchant catalog (owner commission
 * 2026-07-27). The feed side already had this discipline
 * (`parseAcpFeedText`); the truth side never needed it, because the truth side
 * was always the committed fixture.
 *
 * THE STANDARD, inherited from the feed parser and from the CLI shape-guard
 * added in session 34: a document we cannot read is REFUSED WITH A REASON THAT
 * NAMES THE ROW — never coerced, never silently defaulted, and above all never
 * turned into a verdict. A fabricated verdict on unreadable input is precisely
 * the failure this product exists to catch (cli.ts:47-60 makes the same
 * argument for the same reason).
 *
 * WHAT COUNTS AS UNREADABLE. Only what the ENGINE ACTUALLY READS is required.
 * The engine touches exactly: `asOf`, and per item `id`, `name`,
 * `variations[].id`, `.name`, `.priceCents`, `.stock` (reference.ts:27-46,
 * detectors.ts:38,94,222). `description`, `category` and `modifierLists` are
 * carried by the TYPE but never read by a rule, so demanding them would reject
 * a catalog this engine can verify perfectly well — a false refusal is as
 * dishonest as a false verdict.
 *
 * WRONG VALUES ARE NOT PARSE ERRORS. A price that disagrees with the feed is
 * the entire point of the product; it must reach the engine and surface as a
 * FINDING. Only rows the engine cannot even index are refused here.
 */

const ok = {
  asOf: "2026-07-03T00:00:00Z",
  items: [
    {
      id: "item-1",
      name: "Crispy Calamari",
      variations: [{ id: "item-1-v1", name: "Small", priceCents: 2150, stock: "in_stock" }],
    },
  ],
};

const parse = (v: unknown) => parseCatalogText(JSON.stringify(v));

describe("accepts what the engine can actually run on", () => {
  it("a minimal catalog carrying only engine-read fields is accepted", () => {
    const r = parse(ok);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.catalog.items).toHaveLength(1);
      expect(r.catalog.items[0].variations[0].priceCents).toBe(2150);
    }
  });

  it("optional type-only fields are preserved when present, not required when absent", () => {
    const rich = {
      ...ok,
      currency: "USD",
      merchantName: "Any Merchant",
      items: [{ ...ok.items[0], description: "d", category: "c", modifierLists: [] }],
    };
    const r = parse(rich);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.catalog.items[0].description).toBe("d");
  });

  it("a value that merely DISAGREES with a feed is accepted — that is a finding, not a parse error", () => {
    const r = parse({ ...ok, items: [{ ...ok.items[0], variations: [{ ...ok.items[0].variations[0], priceCents: 999999 }] }] });
    expect(r.ok).toBe(true);
  });
});

describe("refuses what it cannot read, and names the row", () => {
  it("empty input", () => {
    const r = parseCatalogText("   ");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/empty/i);
  });

  it("invalid JSON", () => {
    const r = parseCatalogText("{ not json");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/not valid json/i);
  });

  it("a top-level array is not a catalog object", () => {
    const r = parse([1, 2, 3]);
    expect(r.ok).toBe(false);
  });

  it("a missing items array is named as such", () => {
    const r = parse({ asOf: ok.asOf });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/items/i);
  });

  it("an item without a string id names its index", () => {
    const r = parse({ ...ok, items: [{ name: "x", variations: ok.items[0].variations }] });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/items\[0\]/);
  });

  it("an item without variations names its index", () => {
    const r = parse({ ...ok, items: [{ id: "i", name: "x" }] });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/items\[0\]/);
  });

  it("a variation without a string id names BOTH indices", () => {
    const r = parse({
      ...ok,
      items: [{ id: "i", name: "x", variations: [{ name: "Small", priceCents: 1, stock: "in_stock" }] }],
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/items\[0\]\.variations\[0\]/);
  });

  it("a non-integer priceCents is refused — the engine's whole arithmetic is integer cents", () => {
    const r = parse({
      ...ok,
      items: [{ id: "i", name: "x", variations: [{ id: "v", name: "S", priceCents: 21.5, stock: "in_stock" }] }],
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/priceCents/);
  });

  it("an unknown stock state is refused with the allowed set named", () => {
    const r = parse({
      ...ok,
      items: [{ id: "i", name: "x", variations: [{ id: "v", name: "S", priceCents: 1, stock: "maybe" }] }],
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/in_stock/);
  });

  it("a missing asOf is refused — staleness rules read it, and a clock read would break determinism", () => {
    const noAsOf = { items: ok.items };
    const r = parse(noAsOf);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/asOf/);
  });
});

describe("the honesty label is never inherited from the upload", () => {
  it("a document claiming simulated:false cannot smuggle that label through the parser", () => {
    // The uploader decides provenance at the CALL SITE (slice 1), never by
    // asserting it inside their own file. A parsed catalog is normalized to
    // the type's `simulated: true` literal; what the REPORT says is decided by
    // the caller passing ListingsRunProvenance.
    const r = parse({ ...ok, simulated: false });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.catalog.simulated).toBe(true);
  });
});
