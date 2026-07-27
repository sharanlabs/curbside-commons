import { describe, expect, it } from "vitest";
import {
  parseAcpFeedText,
  parseCatalogText,
  verifyAcpFeed,
} from "@/components/playground/verify-in-browser";

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
