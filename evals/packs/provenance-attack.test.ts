import { describe, expect, it } from "vitest";
import {
  SOR_CATALOG,
  catalogSampleText,
  parseAcpFeedText,
  parseCatalogText,
  sampleFeedText,
  verifyAcpFeed,
} from "@/components/playground/verify-in-browser";

/**
 * ADVERSARIAL PASS on my own slice-1 provenance decision (2026-07-27).
 *
 * The claim under attack: "deciding provenance by `catalog !== SOR_CATALOG`
 * reference identity is sound." I wrote that rule, so it gets attacked rather
 * than asserted — session 35's carried-forward lesson is that the calls I am
 * least entitled to make alone are exactly the ones to gate.
 *
 * The attack that lands: a reader clicks "Use the sample catalog". That button
 * fills the slot with `catalogSampleText()` — the COMMITTED CORPUS, verbatim —
 * which then goes through `parseCatalogText` and returns a NEW OBJECT. Under
 * reference identity that new object is "not SOR_CATALOG", so the run gets
 * labelled `real-world` / `simulated: false`: the committed synthetic corpus,
 * reported as the reader's real records, matched by real-world entity
 * resolution that never ran. That is a RULES §4 defect — a claim broader than
 * the thing backing it — introduced by the very fix meant to prevent one.
 *
 * These teeth pin the honest behaviour in BOTH directions, because a rule that
 * only ever errs one way is still a rule that can be wrong.
 */

describe("the committed corpus is labelled as itself, however it arrives", () => {
  it("the sample-catalog BUTTON path does not relabel the corpus as reader data", () => {
    const feed = parseAcpFeedText(sampleFeedText());
    expect(feed.ok).toBe(true);
    if (!feed.ok) return;

    // Exactly what clicking "Use the sample catalog" then "Run the audit" does.
    const parsed = parseCatalogText(catalogSampleText());
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;

    // It is a different OBJECT holding the same RECORDS.
    expect(parsed.catalog).not.toBe(SOR_CATALOG);
    expect(JSON.stringify(parsed.catalog.items)).toBe(JSON.stringify(SOR_CATALOG.items));

    const report = verifyAcpFeed(feed.feed, parsed.catalog);
    expect(report.matchingMode).toBe("synthetic-controlled");
    expect(report.simulated).toBe(true);
  });

  it("the default (no catalog argument) is unchanged", () => {
    const feed = parseAcpFeedText(sampleFeedText());
    if (!feed.ok) return;
    const report = verifyAcpFeed(feed.feed);
    expect(report.matchingMode).toBe("synthetic-controlled");
    expect(report.simulated).toBe(true);
  });
});

/**
 * REVISED after the cross-model gate (findings 1-4). My first fix compared
 * catalog CONTENT instead of object identity — which cured the symptom below and
 * kept the real error: provenance is a fact about the ACTION the reader took,
 * not a property of the bytes. A reader's catalog that happens to match the
 * fixture is still theirs; a reordered copy of the fixture is still ours. So
 * `verifyAcpFeed` now takes an explicit `RunOrigin`, and these teeth pass it.
 *
 * The gate also corrected a conceptual error in what the labels MEAN:
 *   - C3 `matchingMode` describes the MECHANISM. `sorReference` only ever does
 *     exact shared-id lookup (reference.ts:63,71), and report-view decodes
 *     `real-world` as "identifiers do not line up … matched by resolution".
 *     Labelling a reader's run `real-world` claimed a mechanism that never ran,
 *     so it stays `synthetic-controlled` for every run this seam performs.
 *   - C10 `simulated` is true when ANY synthetic artifact participated — so it
 *     is an OR across BOTH sides, not a property of the truth side alone.
 */
describe("a genuinely reader-supplied catalog is labelled as theirs", () => {
  it("a fully reader-supplied run is not simulated, and still matches by id", () => {
    const feed = parseAcpFeedText(sampleFeedText());
    if (!feed.ok) return;

    const parsed = parseCatalogText(
      JSON.stringify({
        asOf: "2026-07-03T00:00:00Z",
        items: [
          {
            id: "their-item",
            name: "Their Dish",
            variations: [{ id: "their-sku", name: "", priceCents: 1234, stock: "in_stock" }],
          },
        ],
      }),
    );
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;

    // Reader's OWN feed too — otherwise C10 is true via the feed side.
    const readerFeed = parseAcpFeedText(
      JSON.stringify({
        spec: "acp-product-feed/extract-2026-07-02",
        items: [
          {
            item_id: "their-sku",
            title: "Their Dish",
            price: "12.34",
            currency: "USD",
            availability: "in_stock",
            variant_dict: { variation: "" },
          },
        ],
      }),
    );
    expect(readerFeed.ok).toBe(true);
    if (!readerFeed.ok) return;

    const report = verifyAcpFeed(readerFeed.feed, parsed.catalog, {
      feed: "reader",
      catalog: "reader",
    });
    expect(report.simulated).toBe(false);
    // Matching is still exact shared-id lookup — that is the MECHANISM, and
    // claiming otherwise would assert entity resolution the engine never ran.
    expect(report.matchingMode).toBe("synthetic-controlled");
  });

  it("our sample FEED keeps the run simulated even against reader records", () => {
    // C10 says true when ANY synthetic artifact participated (gate finding 1).
    const feed = parseAcpFeedText(sampleFeedText());
    if (!feed.ok) return;
    const parsed = parseCatalogText(
      JSON.stringify({
        asOf: "2026-07-03T00:00:00Z",
        items: [
          {
            id: "their-item",
            name: "Their Dish",
            variations: [{ id: "their-sku", name: "", priceCents: 1234, stock: "in_stock" }],
          },
        ],
      }),
    );
    if (!parsed.ok) return;
    const report = verifyAcpFeed(feed.feed, parsed.catalog, {
      feed: "sample",
      catalog: "reader",
    });
    expect(report.simulated).toBe(true);
  });

  it("a ONE-ROW difference from the corpus is still the reader's catalog", () => {
    // The boundary case: near-identical records must not round down to "ours".
    // Whose data it is, is not a similarity judgement.
    const feed = parseAcpFeedText(sampleFeedText());
    if (!feed.ok) return;

    const doc = JSON.parse(catalogSampleText());
    doc.items[0].variations[0].priceCents += 1;
    const parsed = parseCatalogText(JSON.stringify(doc));
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;

    // Whose data it is, is not a similarity judgement — it is the action.
    const report = verifyAcpFeed(feed.feed, parsed.catalog, {
      feed: "reader",
      catalog: "reader",
    });
    expect(report.simulated).toBe(false);
  });
});
