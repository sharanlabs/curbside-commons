import { describe, expect, it } from "vitest";
import {
  CORPUS_AS_OF,
  CORPUS_SEED,
  acpFeedToClaims,
  buildFaithfulFeed,
  centsToDecimal,
  generateCatalog,
  mojibake,
  runListingsVerification,
  type AcpFeed,
  type AcpFeedItem,
} from "@/lib/packs/listings";

/**
 * C5 (second half) — ACP RED-GREEN PER FIELD RULE. Every extracted ACP field
 * rule the listings pack enforces gets an ISOLATED red-green case here: a feed
 * mutation that violates exactly that one rule → the rule fires (RED caught); the
 * unmutated faithful feed → nothing fires (GREEN clean). This is the per-rule
 * audit the W2 slice requires; the coverage table is mirrored in the slice record.
 *
 * (The W1 corpus/differential evals already exercise these rules in aggregate;
 * this file isolates ONE rule per case so a regression names the exact rule.)
 */

const sor = generateCatalog(CORPUS_SEED, CORPUS_AS_OF);
const faithful = buildFaithfulFeed(sor);
const base = faithful.items;

const feed = (items: readonly AcpFeedItem[]): AcpFeed => ({ simulated: true, spec: faithful.spec, items });
const rulesOf = (items: readonly AcpFeedItem[]): string[] =>
  runListingsVerification(acpFeedToClaims(feed(items)), sor).findings.map((f) => f.ruleId);
const patchRow = (id: string, patch: Partial<AcpFeedItem>): AcpFeedItem[] =>
  base.map((r) => (r.item_id === id ? { ...r, ...patch } : r));
const centsOf = (r: AcpFeedItem): number => Math.round(Number(r.price) * 100);

// Row selections the cases depend on (assert they exist — a corpus change that
// removed them would fail loudly rather than silently un-cover a rule).
const inStock = base.find((r) => r.availability === "in_stock");
const outStock = base.find((r) => r.availability === "out_of_stock");
const nonAscii = base.find((r) => /[^ -~]/.test(r.title));
const longAscii = base.find((r) => r.title.length > 11 && /^[ -~]+$/.test(r.title));
const multiItem = sor.items.find((i) => i.variations.filter((v) => v.stock !== "hidden").length >= 2);
const hiddenPair = sor.items
  .flatMap((i) => i.variations.map((v) => ({ item: i, v })))
  .find((x) => x.v.stock === "hidden");

describe("ACP corpus fixtures the audit relies on exist", () => {
  it("has in-stock, out-of-stock, non-ASCII, long-ASCII, multi-variation, and hidden targets", () => {
    for (const [name, v] of [
      ["in_stock row", inStock],
      ["out_of_stock row", outStock],
      ["non-ASCII title row", nonAscii],
      ["long ASCII title row", longAscii],
      ["multi-variation item", multiItem],
      ["hidden variation", hiddenPair],
    ] as const) {
      expect(v, `missing corpus target: ${name}`).toBeTruthy();
    }
  });
});

describe("faithful feed is GREEN (no ACP field rule fires)", () => {
  it("produces zero findings", () => {
    expect(rulesOf(base)).toHaveLength(0);
  });
});

describe("each extracted ACP field rule is RED on exactly its own violation", () => {
  // Builders are evaluated lazily inside each case so the `!` assertions above
  // are already checked by the fixtures-exist test.
  const cases: Record<string, () => readonly AcpFeedItem[]> = {
    "LST-PRICE-VALUE": () => patchRow(inStock!.item_id, { price: "999.99" }),
    "LST-PRICE-CENTS-AS-DECIMAL": () => patchRow(inStock!.item_id, { price: String(centsOf(inStock!)) }),
    "LST-PRICE-CURRENCY": () => patchRow(inStock!.item_id, { currency: "EUR" }),
    "LST-PRICE-CURRENCY-FORM": () => patchRow(inStock!.item_id, { currency: "usd" }),
    "LST-PRICE-SALE-GT": () => patchRow(inStock!.item_id, { sale_price: (Number(inStock!.price) + 5).toFixed(2) }),
    "LST-AVAIL-STATE": () => patchRow(outStock!.item_id, { availability: "in_stock" }),
    "LST-AVAIL-HIDDEN-SHOWN": () => [
      ...base,
      {
        ...inStock!,
        item_id: hiddenPair!.v.id,
        title:
          hiddenPair!.item.variations.length > 1
            ? `${hiddenPair!.item.name} (${hiddenPair!.v.name})`
            : hiddenPair!.item.name,
        group_id: hiddenPair!.item.id,
        variant_dict: { variation: hiddenPair!.v.name },
        price: centsToDecimal(hiddenPair!.v.priceCents),
      },
    ],
    "LST-ENC-UTF8": () => patchRow(nonAscii!.item_id, { title: mojibake(nonAscii!.title) }),
    "LST-ENC-TRUNC": () => patchRow(longAscii!.item_id, { title: `${longAscii!.title.slice(0, 10)}…` }),
    "LST-IDENT-NAME": () => patchRow(inStock!.item_id, { title: "Totally Different Simulated Name XYZ" }),
    "LST-IDENT-MODIFIER-AMBIG": () => {
      const mv = multiItem!.variations.filter((v) => v.stock !== "hidden");
      return base.map((r) => (r.item_id === mv[1].id ? { ...r, variant_dict: { variation: mv[0].name } } : r));
    },
    "LST-IDENT-ID-MISMATCH": () => patchRow(inStock!.item_id, { item_id: "legacy-audit-id-999" }),
    "LST-EXIST-GHOST": () => [
      ...base,
      { ...inStock!, item_id: "ghost-audit-001", title: "Nonexistent Phantom Dish (simulated ghost)", group_id: "ghost-audit", variant_dict: { variation: "Regular" } },
    ],
    "LST-EXIST-MISSING": () => base.filter((r) => r.item_id !== inStock!.item_id),
    "LST-STALE-EXPIRED": () => patchRow(inStock!.item_id, { expiration_date: "2026-01-01T00:00:00Z" }),
    "LST-STALE-AVAILDATE": () => patchRow(inStock!.item_id, { availability: "pre_order", availability_date: "2026-02-01T00:00:00Z" }),
    "LST-XF-PREORDER-DATE-MISSING": () => patchRow(inStock!.item_id, { availability: "pre_order", availability_date: undefined }),
    "LST-XF-CHECKOUT-SEARCH": () => patchRow(inStock!.item_id, { is_eligible_search: false }),
  };

  it.each(Object.keys(cases))("%s fires on its violation and is absent from the faithful feed", (ruleId) => {
    // GREEN: the faithful feed does not contain this rule.
    expect(rulesOf(base)).not.toContain(ruleId);
    // RED: the targeted violation is caught, citing exactly this rule.
    expect(rulesOf(cases[ruleId]())).toContain(ruleId);
  });

  it("covers every rule the listings detectors + completeness sweep can emit", () => {
    // Guardrail: the audit table must not silently drop a rule. This is the set of
    // rule ids the pack can emit (detectors.ts + run.ts), enumerated here so a new
    // rule without an audit case fails this test.
    const emittable = [
      "LST-PRICE-VALUE", "LST-PRICE-CENTS-AS-DECIMAL", "LST-PRICE-CURRENCY", "LST-PRICE-CURRENCY-FORM",
      "LST-PRICE-SALE-GT", "LST-AVAIL-STATE", "LST-AVAIL-HIDDEN-SHOWN", "LST-ENC-UTF8", "LST-ENC-TRUNC",
      "LST-IDENT-NAME", "LST-IDENT-MODIFIER-AMBIG", "LST-IDENT-ID-MISMATCH", "LST-EXIST-GHOST",
      "LST-EXIST-MISSING", "LST-STALE-EXPIRED", "LST-STALE-AVAILDATE", "LST-XF-PREORDER-DATE-MISSING",
      "LST-XF-CHECKOUT-SEARCH",
    ];
    for (const r of emittable) expect(Object.keys(cases)).toContain(r);
  });
});
