import { describe, expect, it } from "vitest";
import {
  acpFeedToClaims,
  runListingsVerification,
} from "@/lib/packs/listings";
import type { AcpFeed } from "@/lib/packs/listings";
import type { SyntheticCatalog } from "@/lib/packs/listings/types";

/**
 * ENGINE — what happens to a row whose id does not resolve directly, but whose
 * TITLE resolves uniquely (cross-model gate findings 8 and 9,
 * `docs/reviews/codex-2026-07-27-s36-gate.md`).
 *
 * `completenessSweep` (run.ts) handles rows the reference could not match by id.
 * It re-matches by exact expected title, and on a unique hit emits
 * `LST-IDENT-ID-MISMATCH` — "same item, mismatched identity". That is the right
 * finding, and it is where the row's journey ENDS.
 *
 * The gate's claim: nothing else about that row is ever checked. Every
 * per-claim detector runs off `reference.resolve()`, which is keyed by
 * variation id (reference.ts:66-72) and returns null here — so price,
 * availability, title and the hidden-item rule all silently no-op. A merchant
 * who renames an id and simultaneously serves a hidden item, or a wrong price,
 * gets ONE finding about the id and SILENCE about the rest.
 *
 * The gate's second claim: two catalog rows sharing an expected title fall into
 * the SAME branch as zero matches, so the report says "no such item exists"
 * when in fact two do — the opposite of the truth, on data the engine could
 * describe precisely.
 *
 * Both are pre-existing engine behaviour, NOT introduced by the upload work.
 * These teeth reproduce them first; the fix follows.
 */

const AS_OF = "2026-07-03T00:00:00Z";

function catalog(items: SyntheticCatalog["items"]): SyntheticCatalog {
  return {
    simulated: true,
    generator: { name: "test", seed: 0, version: "t" },
    currency: "USD",
    asOf: AS_OF,
    merchantName: "M",
    items,
  };
}

function feed(rows: AcpFeed["items"]): AcpFeed {
  return { simulated: true, spec: "acp-product-feed/extract-2026-07-02", items: rows } as AcpFeed;
}

const row = (over: Record<string, unknown>) =>
  ({
    item_id: "legacy-sku",
    title: "House Focaccia",
    description: "A focaccia.",
    url: "https://example.com/item",
    brand: "Example",
    image_url: "https://example.com/i.png",
    price: "9.00",
    currency: "USD",
    availability: "in_stock",
    inventory_quantity: 5,
    item_group_id: "g1",
    group_id: "g1",
    variant_dict: { variation: "" },
    condition: "new",
    is_eligible_search: true,
    is_eligible_checkout: true,
    ...over,
  }) as unknown as AcpFeed["items"][number];

describe("F-8: a title-resolved row is still audited on every other claim", () => {
  it("a HIDDEN catalog item served under a legacy id does not escape the hidden rule", () => {
    // The merchant's catalog marks this item hidden; the feed serves it anyway,
    // under an id the catalog no longer uses. The identity drift must not
    // swallow the availability violation — a hidden item being sold is the more
    // serious of the two findings.
    const sor = catalog([
      {
        id: "item-1",
        name: "House Focaccia",
        description: "",
        category: "",
        modifierLists: [],
        variations: [{ id: "current-sku", name: "", priceCents: 900, stock: "hidden" }],
      },
    ]);
    const report = runListingsVerification(acpFeedToClaims(feed([row({})])), sor);

    expect(report.findings.some((f) => f.ruleId === "LST-IDENT-ID-MISMATCH")).toBe(true);
    expect(report.findings.some((f) => f.ruleId === "LST-AVAIL-HIDDEN-SHOWN")).toBe(true);
  });

  it("a WRONG PRICE on a title-resolved row is still reported", () => {
    const sor = catalog([
      {
        id: "item-1",
        name: "House Focaccia",
        description: "",
        category: "",
        modifierLists: [],
        variations: [{ id: "current-sku", name: "", priceCents: 900, stock: "in_stock" }],
      },
    ]);
    // Served at 99.00 against a 9.00 record.
    const report = runListingsVerification(
      acpFeedToClaims(feed([row({ price: "99.00" })])),
      sor,
    );

    expect(report.findings.some((f) => f.ruleId === "LST-IDENT-ID-MISMATCH")).toBe(true);
    expect(report.findings.some((f) => f.category === "price")).toBe(true);
  });

  it("every finding on the row cites the RESOLVED record, not the feed's stale id", () => {
    const sor = catalog([
      {
        id: "item-1",
        name: "House Focaccia",
        description: "",
        category: "",
        modifierLists: [],
        variations: [{ id: "current-sku", name: "", priceCents: 900, stock: "in_stock" }],
      },
    ]);
    const report = runListingsVerification(
      acpFeedToClaims(feed([row({ price: "99.00" })])),
      sor,
    );
    for (const f of report.findings) {
      expect(f.referenceRowId).toBe("current-sku");
    }
  });

  it("a title-resolved row is NOT also reported missing", () => {
    // Resolution already claimed the truth row; reporting it missing too would
    // double-count one row as both drifted and absent.
    const sor = catalog([
      {
        id: "item-1",
        name: "House Focaccia",
        description: "",
        category: "",
        modifierLists: [],
        variations: [{ id: "current-sku", name: "", priceCents: 900, stock: "in_stock" }],
      },
    ]);
    const report = runListingsVerification(acpFeedToClaims(feed([row({})])), sor);
    expect(report.findings.filter((f) => f.ruleId === "LST-EXIST-MISSING")).toHaveLength(0);
  });
});

describe("F-9: an AMBIGUOUS title is not reported as a non-existent item", () => {
  it("two catalog rows sharing an expected title produce an ambiguity finding, not a ghost", () => {
    // Two items, same name, each single-variation — so both share the expected
    // title "House Focaccia". Saying "no such item exists" is the opposite of
    // the truth: two do, and the engine cannot tell which was meant.
    const sor = catalog([
      {
        id: "item-1",
        name: "House Focaccia",
        description: "",
        category: "",
        modifierLists: [],
        variations: [{ id: "sku-a", name: "", priceCents: 900, stock: "in_stock" }],
      },
      {
        id: "item-2",
        name: "House Focaccia",
        description: "",
        category: "",
        modifierLists: [],
        variations: [{ id: "sku-b", name: "", priceCents: 950, stock: "in_stock" }],
      },
    ]);
    const report = runListingsVerification(acpFeedToClaims(feed([row({})])), sor);

    expect(report.findings.some((f) => f.ruleId === "LST-EXIST-GHOST")).toBe(false);
    const ambiguous = report.findings.find((f) => f.ruleId === "LST-IDENT-TITLE-AMBIGUOUS");
    expect(ambiguous).toBeDefined();
    // The candidates must be NAMED — an ambiguity a reader cannot resolve is
    // barely better than a wrong answer.
    expect(ambiguous?.plainLine).toContain("sku-a");
    expect(ambiguous?.plainLine).toContain("sku-b");
  });

  it("a genuinely absent item is still a ghost", () => {
    // The zero-match branch must keep its own meaning.
    const sor = catalog([
      {
        id: "item-1",
        name: "Something Else",
        description: "",
        category: "",
        modifierLists: [],
        variations: [{ id: "sku-a", name: "", priceCents: 900, stock: "in_stock" }],
      },
    ]);
    const report = runListingsVerification(acpFeedToClaims(feed([row({})])), sor);
    expect(report.findings.some((f) => f.ruleId === "LST-EXIST-GHOST")).toBe(true);
  });
});
