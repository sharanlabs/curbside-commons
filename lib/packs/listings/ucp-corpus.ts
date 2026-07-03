/**
 * UCP conformance CI-corpus BUILDER (pure) — W2 (plan §5 W2, C5).
 *
 * The deterministic recipe for the N≥30 real-UCP catalog-response corpus:
 * VALID documents + INVALID documents that each violate exactly ONE named schema
 * rule (its `LST-CONF-*` violation class). Pure and side-effect-free (no fs, no
 * clock, no randomness) so BOTH the generator script (which writes the fixtures)
 * and the freeze-integrity eval (which byte-locks every committed fixture to this
 * recipe, per the P2-1 lesson) call the SAME source of truth.
 *
 * HONESTY (C10): every document is a constructed simulation built from the
 * synthetic SOR and carries `simulated: true` (a field the open UCP response
 * schema permits without becoming non-conformant).
 *
 * Plain: the single recipe that builds every corpus file. One place makes them,
 * one place freezes them, so a hand-edit to any file is caught by CI.
 */
import {
  buildUcpSearchResponse,
  type UcpSearchResponse,
  type UcpWireProduct,
} from "./ucp-wire.ts";
import type { SyntheticCatalog } from "./types.ts";
import { UCP_PINNED_VERSION } from "./ucp.ts";

/** Which catalog response shape a fixture is validated against. */
export type UcpCorpusOp = "search" | "lookup" | "get_product";

/** One corpus fixture + its ground-truth verdict (manifest row). */
export interface UcpCorpusEntry {
  readonly file: string;
  readonly doc: unknown;
  readonly valid: boolean;
  readonly op: UcpCorpusOp;
  /** For invalid fixtures: the single `LST-CONF-*` class it violates. */
  readonly violationClass?: string;
  /** For invalid fixtures: the ajv keyword that rejects it. */
  readonly keyword?: string;
  readonly note: string;
}

export interface UcpConformanceCorpus {
  readonly entries: readonly UcpCorpusEntry[];
  readonly manifest: Record<string, unknown>;
}

type Json = Record<string, unknown>;
const clone = <T>(v: T): T => structuredClone(v);
const withSim = <T extends Json>(doc: T): T => ({ simulated: true, ...doc });

/** Build the full corpus from a synthetic SOR. Deterministic. */
export function buildUcpConformanceCorpus(sor: SyntheticCatalog): UcpConformanceCorpus {
  const faithful = buildUcpSearchResponse(sor);
  const products = faithful.products;

  const searchDoc = (ps: readonly UcpWireProduct[]): Json =>
    withSim({ ucp: { version: UCP_PINNED_VERSION, status: "success" }, products: ps });
  const lookupProduct = (p: UcpWireProduct): Json => ({
    ...(clone(p) as unknown as Json),
    variants: p.variants.map((v) => ({
      ...(clone(v) as unknown as Json),
      inputs: [{ id: v.id, match: "exact" }],
    })),
  });
  const lookupDoc = (ps: readonly UcpWireProduct[]): Json =>
    withSim({ ucp: { version: UCP_PINNED_VERSION, status: "success" }, products: ps.map(lookupProduct) });
  const getProductDoc = (p: UcpWireProduct): Json =>
    withSim({ ucp: { version: UCP_PINNED_VERSION, status: "success" }, product: p });

  const enrichedProduct = (): UcpWireProduct => {
    const base = clone(products[0]) as UcpWireProduct & Json;
    return {
      ...base,
      url: "https://example.com/curbside-commons-simulated/p/" + base.id,
      handle: "simulated-" + base.id,
      categories: [{ value: "Food > Appetizers", taxonomy: "merchant" }],
      tags: ["simulated"],
      media: [
        { type: "image", url: "https://example.com/img/" + base.id + ".png", alt_text: "simulated", width: 800, height: 600 },
      ],
      options: [{ name: "Size", values: base.variants.map((v) => ({ label: v.title })) }],
      variants: base.variants.map((v, i) => ({
        ...(clone(v) as unknown as Json),
        sku: "SIM-" + base.id + "-" + i,
        url: "https://example.com/curbside-commons-simulated/v/" + v.id,
        options: [{ name: "Size", label: v.title }],
      })),
    } as unknown as UcpWireProduct;
  };

  // ---- VALID ----
  const validEntries: { name: string; op: UcpCorpusOp; doc: Json; note: string }[] = [
    { name: "search-full-catalog", op: "search", doc: searchDoc(products), note: "full faithful catalog (all products/variants)" },
    { name: "search-single-product", op: "search", doc: searchDoc([products[0]]), note: "single product" },
    { name: "search-multi-variant", op: "search", doc: searchDoc([products.find((p) => p.variants.length >= 3) ?? products[0]]), note: "a product with ≥3 variants" },
    { name: "search-single-variant", op: "search", doc: searchDoc([products.find((p) => p.variants.length === 1) ?? products[0]]), note: "a single-variant product" },
    { name: "search-enriched-optionals", op: "search", doc: searchDoc([enrichedProduct()]), note: "optional fields present (url/media/options/categories)" },
    { name: "search-messages-present", op: "search", doc: { ...searchDoc([products[1]]), messages: [{ type: "info", code: "results", content: "results returned" }] }, note: "optional messages array present (valid message_info)" },
    { name: "search-two-products", op: "search", doc: searchDoc(products.slice(0, 2)), note: "two products" },
    { name: "search-half-catalog", op: "search", doc: searchDoc(products.slice(0, 6)), note: "six products" },
    { name: "lookup-full", op: "lookup", doc: lookupDoc(products), note: "lookup response, full list (variants carry inputs correlation)" },
    { name: "lookup-single", op: "lookup", doc: lookupDoc([products[2]]), note: "lookup response, one product" },
    { name: "get-product-single", op: "get_product", doc: getProductDoc(products[0]), note: "get_product response (singular)" },
    { name: "get-product-multi-variant", op: "get_product", doc: getProductDoc(products.find((p) => p.variants.length >= 3) ?? products[0]), note: "get_product with ≥3 variants" },
  ];

  {
    const free = clone(products[0]) as unknown as { price_range: { min: { amount: number } }; variants: { price: { amount: number } }[] };
    free.price_range.min.amount = 0;
    free.variants[0].price.amount = 0;
    validEntries.push({ name: "search-free-item-amount-zero", op: "search", doc: searchDoc([free as unknown as UcpWireProduct]), note: "amount:0 free item (valid, minimum 0)" });
  }

  // THE conformance-vs-truth headline exhibit.
  {
    const lying = clone(faithful) as UcpSearchResponse;
    const v0 = lying.products[0].variants[0];
    (lying.products[0].variants[0] as { price: { amount: number } }).price.amount = v0.price.amount + 200;
    validEntries.push({
      name: "conformant-but-false",
      op: "search",
      doc: withSim(lying as unknown as Json),
      note: "HEADLINE: spec-VALID (passes ajv) yet truth-FALSE (variant[0] price inflated +200 minor units vs SOR) — the conformance-vs-truth distinction",
    });
  }

  // ---- INVALID (one named violation class each) ----
  const del = (o: Json, path: (string | number)[]): void => {
    let cur: unknown = o;
    for (let i = 0; i < path.length - 1; i++) cur = (cur as Json)[path[i]];
    delete (cur as Json)[path[path.length - 1]];
  };
  const set = (o: Json, path: (string | number)[], value: unknown): void => {
    let cur: unknown = o;
    for (let i = 0; i < path.length - 1; i++) cur = (cur as Json)[path[i]];
    (cur as Json)[path[path.length - 1]] = value;
  };
  const singleValid = (): Json => searchDoc([clone(products[0]) as UcpWireProduct]);
  const enrichedValid = (): Json => searchDoc([enrichedProduct()]);

  type Mut = { name: string; op: UcpCorpusOp; doc: Json; violationClass: string; keyword: string; note: string };
  const invalidEntries: Mut[] = [];

  { const d = singleValid(); del(d, ["products"]); invalidEntries.push({ name: "req-missing-root-products", op: "search", doc: d, violationClass: "LST-CONF-REQUIRED-MISSING", keyword: "required", note: "root missing required `products`" }); }
  { const d = singleValid(); set(d, ["ucp"], {}); invalidEntries.push({ name: "req-missing-ucp-version", op: "search", doc: d, violationClass: "LST-CONF-REQUIRED-MISSING", keyword: "required", note: "ucp object missing required `version`" }); }
  { const d = singleValid(); del(d, ["products", 0, "title"]); invalidEntries.push({ name: "req-missing-product-title", op: "search", doc: d, violationClass: "LST-CONF-REQUIRED-MISSING", keyword: "required", note: "product missing required `title`" }); }
  { const d = singleValid(); del(d, ["products", 0, "price_range"]); invalidEntries.push({ name: "req-missing-product-price-range", op: "search", doc: d, violationClass: "LST-CONF-REQUIRED-MISSING", keyword: "required", note: "product missing required `price_range`" }); }
  { const d = singleValid(); del(d, ["products", 0, "variants", 0, "price"]); invalidEntries.push({ name: "req-missing-variant-price", op: "search", doc: d, violationClass: "LST-CONF-REQUIRED-MISSING", keyword: "required", note: "variant missing required `price`" }); }
  { const d = singleValid(); del(d, ["products", 0, "description"]); invalidEntries.push({ name: "req-missing-product-description", op: "search", doc: d, violationClass: "LST-CONF-REQUIRED-MISSING", keyword: "required", note: "product missing required `description`" }); }

  { const d = singleValid(); set(d, ["products"], {}); invalidEntries.push({ name: "type-products-not-array", op: "search", doc: d, violationClass: "LST-CONF-TYPE", keyword: "type", note: "`products` is an object, must be array" }); }
  { const d = singleValid(); set(d, ["products", 0, "variants", 0, "price", "amount"], "2150"); invalidEntries.push({ name: "type-amount-string", op: "search", doc: d, violationClass: "LST-CONF-TYPE", keyword: "type", note: "price.amount is a string, must be integer" }); }
  { const d = singleValid(); set(d, ["products", 0, "variants", 0, "availability", "available"], "yes"); invalidEntries.push({ name: "type-availability-available-string", op: "search", doc: d, violationClass: "LST-CONF-TYPE", keyword: "type", note: "availability.available is a string, must be boolean" }); }

  { const d = singleValid(); set(d, ["products", 0, "variants", 0, "price", "currency"], "usd"); invalidEntries.push({ name: "pattern-currency-lowercase", op: "search", doc: d, violationClass: "LST-CONF-PATTERN", keyword: "pattern", note: "currency `usd` fails ^[A-Z]{3}$" }); }
  { const d = singleValid(); set(d, ["products", 0, "variants", 0, "price", "currency"], "US"); invalidEntries.push({ name: "pattern-currency-two-letter", op: "search", doc: d, violationClass: "LST-CONF-PATTERN", keyword: "pattern", note: "currency `US` fails ^[A-Z]{3}$" }); }

  { const d = singleValid(); set(d, ["products", 0, "variants", 0, "price", "amount"], -5); invalidEntries.push({ name: "range-amount-negative", op: "search", doc: d, violationClass: "LST-CONF-NUMBER-RANGE", keyword: "minimum", note: "price.amount -5 < minimum 0" }); }
  { const d = enrichedValid(); set(d, ["products", 0, "media", 0, "width"], 0); invalidEntries.push({ name: "range-media-width-zero", op: "search", doc: d, violationClass: "LST-CONF-NUMBER-RANGE", keyword: "minimum", note: "media.width 0 < minimum 1" }); }

  { const d = singleValid(); set(d, ["products", 0, "variants"], []); invalidEntries.push({ name: "array-variants-empty", op: "search", doc: d, violationClass: "LST-CONF-ARRAY-BOUNDS", keyword: "minItems", note: "variants [] violates minItems 1" }); }

  { const d = enrichedValid(); set(d, ["products", 0, "url"], "not a uri"); invalidEntries.push({ name: "format-product-url", op: "search", doc: d, violationClass: "LST-CONF-FORMAT", keyword: "format", note: "product.url is not a uri" }); }
  { const d = enrichedValid(); set(d, ["products", 0, "media", 0, "url"], "http://[bad"); invalidEntries.push({ name: "format-media-url", op: "search", doc: d, violationClass: "LST-CONF-FORMAT", keyword: "format", note: "media.url is not a uri" }); }

  { const d = singleValid(); set(d, ["products", 0, "description"], {}); invalidEntries.push({ name: "object-product-description-empty", op: "search", doc: d, violationClass: "LST-CONF-OBJECT-SHAPE", keyword: "minProperties", note: "product.description {} violates minProperties 1" }); }
  { const d = singleValid(); set(d, ["products", 0, "variants", 0, "description"], {}); invalidEntries.push({ name: "object-variant-description-empty", op: "search", doc: d, violationClass: "LST-CONF-OBJECT-SHAPE", keyword: "minProperties", note: "variant.description {} violates minProperties 1" }); }

  { const d = singleValid(); set(d, ["ucp", "status"], "bogus"); invalidEntries.push({ name: "enum-ucp-status", op: "search", doc: d, violationClass: "LST-CONF-ENUM", keyword: "enum", note: "ucp.status `bogus` not in [success, error]" }); }

  { const d = lookupDoc([clone(products[0]) as UcpWireProduct]); del(d, ["products"]); invalidEntries.push({ name: "lookup-req-missing-products", op: "lookup", doc: d, violationClass: "LST-CONF-REQUIRED-MISSING", keyword: "required", note: "lookup response missing required `products`" }); }
  { const d = getProductDoc(clone(products[0]) as UcpWireProduct); del(d, ["product"]); invalidEntries.push({ name: "get-product-req-missing-product", op: "get_product", doc: d, violationClass: "LST-CONF-REQUIRED-MISSING", keyword: "required", note: "get_product response missing required `product`" }); }

  const entries: UcpCorpusEntry[] = [
    ...validEntries.map((e) => ({ file: `valid/${e.name}.json`, doc: e.doc, valid: true, op: e.op, note: e.note })),
    ...invalidEntries.map((e) => ({ file: `invalid/${e.name}.json`, doc: e.doc, valid: false, op: e.op, violationClass: e.violationClass, keyword: e.keyword, note: e.note })),
  ];

  const violationClasses = [...new Set(invalidEntries.map((e) => e.violationClass))].sort();
  const manifest: Record<string, unknown> = {
    simulated: true,
    note: "Constructed-simulation UCP catalog-response corpus for the W2 conformance leg. Each invalid fixture violates exactly ONE named schema rule. Verdicts asserted in evals/packs/ucp-conformance.test.ts; optional cargo differential oracle in scripts-ts/ucp-oracle-diff.mts.",
    seed: sor.generator.seed,
    asOf: sor.asOf,
    specVersion: UCP_PINNED_VERSION,
    schemaSource: "fixtures/ucp-schemas/2026-04-08 (Universal-Commerce-Protocol/ucp @ v2026-04-08, Apache-2.0)",
    counts: { total: entries.length, valid: validEntries.length, invalid: invalidEntries.length },
    violationClasses,
    headlineExhibit: "valid/conformant-but-false.json",
    entries: entries.map((e) => ({
      file: e.file,
      valid: e.valid,
      op: e.op,
      ...(e.violationClass ? { violationClass: e.violationClass, keyword: e.keyword } : {}),
      note: e.note,
    })),
  };

  return { entries, manifest };
}
