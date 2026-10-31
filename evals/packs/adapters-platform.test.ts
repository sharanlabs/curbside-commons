import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  CARRIER_SENTENCE,
  CORPUS_AS_OF,
  CORPUS_SEED,
  ListingsInputError,
  ORDER_ERRORS_CARRIER,
  ORDER_ERRORS_COLUMNS,
  OrderErrorsCsvError,
  PlatformShapeError,
  ReservedIdError,
  SHAPED_LIKE_DOORDASH,
  SHAPED_LIKE_UBER,
  UNSTATED_FIELDS,
  acpFeedToClaims,
  acpFeedToDoorDashShaped,
  acpFeedToUberShaped,
  buildFaithfulMenuFeed,
  doordashShapedToFeed,
  generateMenuModelCatalog,
  parseOrderErrorsCsv,
  platformFeedToClaims,
  runPlatformShapedCheck,
  serializePlatformShapedReport,
  uberShapedToFeed,
  type AcpFeed,
  type AcpFeedItem,
  type SyntheticCatalog,
} from "@/lib/packs/listings";
import { serializeReport } from "@/lib/verifier-core";

/**
 * PLATFORM-SHAPED ADAPTERS (S3 CP1; plan §§ 4, 6, 9, 12; research record
 * docs/research/external-references-2026-10-31.md "Top 5" #1–#5).
 *
 * Inputs here are synthetic, shaped like the public partner documentation of two
 * delivery platforms (read 2026-10-31), not from either; never called; not
 * affiliated.
 *
 *  ROUND TRIP   record → the faithful copy (ACP form) → the same copy shaped like
 *               each platform's documentation → the adapter → claims equal the
 *               ACP form's claims on every STATED field, and the check is clean;
 *               the shaped documents and the wrapped report are byte-pinned.
 *  DRIFT        a price, an 86, an add-on price and a suspension written in the
 *               platform shape are caught by the existing rules, each claim
 *               carrying its shape label.
 *  ALLOW-LIST   customer fields planted at item, option and group depth (and
 *               inside named objects) never reach a claim value, the adapted
 *               feed, or the serialized report; a named field of the wrong type
 *               refuses.
 *  REFUSALS     wrong envelope · missing required keys · non-integer price ·
 *               broken references · duplicates — typed, located (path + row),
 *               ListingsInputError (the CLI's exit 2 class).
 *  TRIGGER      the order-errors CSV: our column names, read by header name,
 *               unknown columns ignored, variation tolerated, refusals by line.
 *
 * ── Mutation record (2026-10-31; each red observed, then restored) ──
 *  M1 shared.ts `platformFeedToClaims`: the UNSTATED_FIELDS filter removed →
 *     ROUND TRIP + DRIFT + LABELS red, 12 failed / 17 passed (the variant-label,
 *     currency and eligibility claims the shape never states were judged anyway)
 *     — restored, 29/29.
 *  M2 doordash-shaped.ts: `...item` spread into the produced row → ALLOW-LIST red,
 *     1 failed / 28 passed (the planted customer_email reached the adapted feed)
 *     — restored, 29/29.
 *  M3 uber-shaped.ts: `out = until > asOfSeconds` → `out = until >= 0` → DRIFT red,
 *     1 failed / 28 passed (a past suspension read as an 86) — restored, 29/29.
 * (Commands and counts are in docs/returns/2026-10-31-s3-adapters.md.)
 */

const ROOT = process.cwd();
const SOR = JSON.parse(readFileSync(join(ROOT, "fixtures", "synthetic-restaurant", "sor.catalog.json"), "utf8")) as SyntheticCatalog;
const MENU_MODEL = generateMenuModelCatalog(CORPUS_SEED, CORPUS_AS_OF);
/** The menu-model record with every category on the first category's hours — one hours set, so one Uber-shaped menu. */
const MENU_ONE_HOURS: SyntheticCatalog = {
  ...MENU_MODEL,
  categoryAvailability: MENU_MODEL.categoryAvailability!.map((c) => ({ ...c, periods: MENU_MODEL.categoryAvailability![0].periods })),
};
const sha = (s: string): string => createHash("sha256").update(s).digest("hex").slice(0, 16);
const roundTripJson = <T,>(v: T): unknown => JSON.parse(JSON.stringify(v));

function categoryOf(record: SyntheticCatalog) {
  return (row: AcpFeedItem): string => record.items.find((i) => i.variations.some((v) => v.id === row.item_id))!.category;
}
const ddOf = (record: SyntheticCatalog, feed: AcpFeed = buildFaithfulMenuFeed(record)) =>
  acpFeedToDoorDashShaped(feed, { categoryOf: categoryOf(record), storeId: "store-synthetic-1" });
const uberOf = (record: SyntheticCatalog, feed: AcpFeed = buildFaithfulMenuFeed(record)) =>
  acpFeedToUberShaped(feed, { categoryOf: categoryOf(record), asOf: record.asOf });

const byId = <T extends { id: string }>(cs: readonly T[]): T[] => [...cs].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
/** The ACP form's claims on the fields a platform-shaped document states (sorted by claim id: the shape regroups rows by menu). */
const statedClaims = (feed: AcpFeed, opts: { hours?: boolean } = {}) =>
  byId(acpFeedToClaims(feed).filter((c) => !UNSTATED_FIELDS.has(c.field) && (opts.hours !== false || c.field !== "hours")));
const stripLabel = (claims: readonly { id: string }[]) =>
  byId(claims.map((c) => Object.fromEntries(Object.entries(c).filter(([k]) => k !== "shapedLike")) as { id: string }));

function refusal(fn: () => unknown): PlatformShapeError {
  try {
    fn();
  } catch (e) {
    expect(e).toBeInstanceOf(PlatformShapeError);
    expect(e).toBeInstanceOf(ListingsInputError);
    return e as PlatformShapeError;
  }
  throw new Error("expected a refusal, got a result");
}

type Json = Record<string, unknown> & { [k: string]: unknown };
const mut = <T,>(v: T): Json => roundTripJson(v) as Json;

describe("ROUND TRIP — the faithful copy, shaped like each documentation, reads back clean", () => {
  for (const [name, record] of [["bundled record", SOR], ["menu-model record (with hours)", MENU_MODEL], ["menu-model record, one hours set", MENU_ONE_HOURS]] as const) {
    it(`DoorDash-shaped, ${name}: claims equal the ACP form's stated claims; the check is clean`, () => {
      const feed = buildFaithfulMenuFeed(record);
      const back = doordashShapedToFeed(roundTripJson(ddOf(record)));
      expect(back.shapedLike).toBe(SHAPED_LIKE_DOORDASH);
      expect(back.items.length).toBe(feed.items.length);
      expect(stripLabel(platformFeedToClaims(back))).toEqual(statedClaims(feed));
      const run = runPlatformShapedCheck(back, record);
      expect(run.report.findings).toEqual([]);
      expect(run.report.ok).toBe(true);
    });

    it(`Uber-shaped, ${name}: claims equal the ACP form's stated claims (hours only from a one-menu document); the check is clean`, () => {
      const feed = buildFaithfulMenuFeed(record);
      const doc = uberOf(record);
      const back = uberShapedToFeed(roundTripJson(doc), { asOf: record.asOf });
      expect(back.shapedLike).toBe(SHAPED_LIKE_UBER);
      expect(stripLabel(platformFeedToClaims(back))).toEqual(statedClaims(feed, { hours: doc.menus.length === 1 }));
      expect(runPlatformShapedCheck(back, record).report.ok).toBe(true);
    });
  }

  it("the menu-model round trip carries hours and add-ons, so the comparison is not vacuous", () => {
    const back = doordashShapedToFeed(roundTripJson(ddOf(MENU_MODEL)));
    expect(platformFeedToClaims(back).filter((c) => c.field === "hours").length).toBe(back.items.length);
    expect(platformFeedToClaims(back).filter((c) => c.field === "modifier.option").length).toBeGreaterThan(10);
    const uberDoc = uberOf(MENU_ONE_HOURS);
    expect(uberDoc.menus).toHaveLength(1);
    const uber = uberShapedToFeed(roundTripJson(uberDoc), { asOf: MENU_ONE_HOURS.asOf });
    expect(platformFeedToClaims(uber).filter((c) => c.field === "hours").length).toBe(uber.items.length);
    // several hours sets → several menus → the item → menu path is unknown, so no hours claim at all
    expect(uberOf(MENU_MODEL).menus.length).toBeGreaterThan(1);
    expect(platformFeedToClaims(uberShapedToFeed(roundTripJson(uberOf(MENU_MODEL)), { asOf: MENU_MODEL.asOf })).some((c) => c.field === "hours")).toBe(false);
  });

  it("goldens: the shaped documents and the wrapped clean report are byte-pinned", () => {
    expect(sha(JSON.stringify(ddOf(SOR)))).toBe("f42a1eb4d855c74b");
    expect(sha(JSON.stringify(uberOf(SOR)))).toBe("6fc37d6e9022de4c");
    const dd = runPlatformShapedCheck(doordashShapedToFeed(roundTripJson(ddOf(SOR))), SOR);
    expect(sha(serializePlatformShapedReport(dd))).toBe("7962af6f03279704");
  });

  it("an item listed in two menus is one row carrying both menus' hours", () => {
    const doc = mut(ddOf(MENU_MODEL));
    const menus = doc.menus as Json[];
    const copy = mut(menus[0]);
    (copy as Json).open_hours = [{ day_index: "SUN", start_time: "06:00", end_time: "07:00" }];
    menus.push(copy);
    const back = doordashShapedToFeed(doc);
    const first = back.items[0];
    expect(back.items.filter((r) => r.item_id === first.item_id)).toHaveLength(1);
    expect(first.hours!.at(-1)).toEqual({ day: "SUN", open: "06:00:00", close: "07:00:00" });
  });
});

describe("DRIFT — written in the platform shape, caught by the existing rules, labeled", () => {
  it("DoorDash-shaped: a price, an 86 and an add-on price each fire their rule; every claim names the shape", () => {
    const doc = mut(ddOf(SOR));
    const items = ((doc.menus as Json[])[0].menu as Json).categories as Json[];
    const item0 = (items[0].items as Json[])[0];
    item0.price = (item0.price as number) + 100;
    const item1 = (items[0].items as Json[])[1];
    item1.active = false;
    const withExtra = (doc.menus as Json[]).flatMap((m) => ((m.menu as Json).categories as Json[]).flatMap((c) => c.items as Json[])).find((i) => (i.extras as Json[]).length > 0)!;
    const opt = ((withExtra.extras as Json[])[0].options as Json[])[1];
    opt.price = (opt.price as number) + 25;
    const run = runPlatformShapedCheck(doordashShapedToFeed(doc), SOR);
    expect(new Set(run.report.findings.map((f) => f.ruleId))).toEqual(new Set(["LST-PRICE-VALUE", "LST-AVAIL-STATE", "LST-MOD-PRICE-VALUE"]));
    for (const f of run.report.findings) expect((f.claim as { shapedLike?: string }).shapedLike).toBe(SHAPED_LIKE_DOORDASH);
    expect(serializePlatformShapedReport(run)).toContain(CARRIER_SENTENCE[SHAPED_LIKE_DOORDASH]);
  });

  it("Uber-shaped: a suspension later than asOf is an 86; one at or before asOf, or null, is available", () => {
    const base = mut(uberOf(SOR));
    const inStock = (base.items as Json[]).find((i) => i.suspension_info === undefined && !String(i.id).includes("-m"))!;
    const asOfSeconds = Date.parse(SOR.asOf) / 1000;
    const at = (until: number | null) => {
      const doc = mut(base);
      const it = (doc.items as Json[]).find((i) => i.id === inStock.id)!;
      it.suspension_info = { suspension: { suspend_until: until } };
      return runPlatformShapedCheck(uberShapedToFeed(doc, { asOf: SOR.asOf }), SOR).report;
    };
    const later = at(asOfSeconds + 1);
    expect(later.findings.map((f) => [f.ruleId, f.claim.id])).toEqual([["LST-AVAIL-STATE", `${inStock.id}#availability`]]);
    expect(at(asOfSeconds).ok).toBe(true);
    expect(at(asOfSeconds - 3600).ok).toBe(true);
    expect(at(null).ok).toBe(true);
  });

  it("price unit is a parameter: cents by default (inferred, not stated); dollars reads the same integers as whole dollars", () => {
    const doc = roundTripJson(ddOf(SOR));
    expect(runPlatformShapedCheck(doordashShapedToFeed(doc), SOR).report.ok).toBe(true);
    const dollars = runPlatformShapedCheck(doordashShapedToFeed(doc, { priceUnit: "dollars" }), SOR).report;
    expect(dollars.findings.filter((f) => f.ruleId === "LST-PRICE-VALUE").length).toBe(dollars.findings.filter((f) => f.claim.field === "price.amount").length);
    expect(dollars.findings.length).toBeGreaterThan(SOR.items.length);
    expect(refusal(() => doordashShapedToFeed(doc, { priceUnit: "euros" as never })).kind).toBe("option");
  });

  it("the price channel is explicit: base_price is read only when asked, and its absence refuses", () => {
    const doc = mut(ddOf(SOR));
    const item0 = ((((doc.menus as Json[])[0].menu as Json).categories as Json[])[0].items as Json[])[0];
    const e = refusal(() => doordashShapedToFeed(doc, { priceField: "base_price" }));
    expect(e.kind).toBe("missing-key");
    expect(e.path).toMatch(/items\[0\]\.base_price$/);
    for (const m of doc.menus as Json[]) for (const c of (m.menu as Json).categories as Json[]) for (const it of c.items as Json[]) {
      it.base_price = it.price;
      for (const x of it.extras as Json[]) for (const o of x.options as Json[]) o.base_price = o.price;
    }
    item0.base_price = (item0.price as number) - 100;
    expect(runPlatformShapedCheck(doordashShapedToFeed(doc), SOR).report.ok).toBe(true);
    expect(runPlatformShapedCheck(doordashShapedToFeed(doc, { priceField: "base_price" }), SOR).report.findings.map((f) => f.ruleId)).toEqual(["LST-PRICE-VALUE"]);
  });
});

describe("ALLOW-LIST — only named fields are read; planted customer fields never travel", () => {
  const PLANT = { customer_email: "planted.person@example.invalid", customer_phone: "+1-555-0100-PLANTED", notes: "PLANTED-NOTE-TEXT" };
  const planted = Object.values(PLANT);
  const assertClean = (texts: readonly string[]) => {
    for (const t of texts) for (const p of planted) expect(t, `planted "${p}" leaked`).not.toContain(p);
  };

  it("DoorDash-shaped: planted at root, store, menu, category, item, extra and option depth — none reaches the feed, a claim or the report", () => {
    const doc = mut(ddOf(SOR));
    Object.assign(doc, PLANT);
    Object.assign(doc.store as Json, PLANT);
    for (const m of doc.menus as Json[]) {
      Object.assign(m, PLANT);
      Object.assign(m.menu as Json, PLANT);
      for (const c of (m.menu as Json).categories as Json[]) {
        Object.assign(c, PLANT);
        for (const it of c.items as Json[]) {
          Object.assign(it, PLANT);
          it.price = (it.price as number) + 1; // every row now drifts, so every claim lands in the report
          for (const x of it.extras as Json[]) {
            Object.assign(x, PLANT);
            for (const o of x.options as Json[]) {
              Object.assign(o, PLANT);
              o.price = (o.price as number) + 1;
            }
          }
        }
      }
    }
    const feed = doordashShapedToFeed(doc);
    const run = runPlatformShapedCheck(feed, SOR);
    expect(run.report.findings.length).toBeGreaterThan(20);
    assertClean([JSON.stringify(feed), JSON.stringify(platformFeedToClaims(feed)), serializePlatformShapedReport(run), serializeReport(run.report)]);
  });

  it("Uber-shaped: planted at item, group, option-reference and inside named objects — none travels", () => {
    const doc = mut(uberOf(SOR));
    for (const k of ["menus", "categories", "items", "modifier_groups"] as const) for (const o of doc[k] as Json[]) Object.assign(o, PLANT);
    for (const it of doc.items as Json[]) {
      Object.assign(it.price_info as Json, PLANT);
      Object.assign((it.title as Json).translations as Json, PLANT);
      (it.price_info as Json).price = ((it.price_info as Json).price as number) + 1;
    }
    for (const g of doc.modifier_groups as Json[]) for (const o of g.modifier_options as Json[]) Object.assign(o, PLANT);
    const feed = uberShapedToFeed(doc, { asOf: SOR.asOf });
    const run = runPlatformShapedCheck(feed, SOR);
    expect(run.report.findings.length).toBeGreaterThan(20);
    assertClean([JSON.stringify(feed), JSON.stringify(platformFeedToClaims(feed)), serializePlatformShapedReport(run)]);
  });

  it("a claim value carries exactly the declared keys (modifier option, hours window)", () => {
    const claims = platformFeedToClaims(doordashShapedToFeed(roundTripJson(ddOf(MENU_MODEL))));
    const opt = claims.find((c) => c.field === "modifier.option")!;
    expect(Object.keys(opt.value as object).sort()).toEqual(["availability", "id", "list_id", "list_name", "name", "price_delta"]);
    const hours = claims.find((c) => c.field === "hours")!;
    for (const w of hours.value as object[]) expect(Object.keys(w).sort()).toEqual(["close", "day", "open"]);
    expect(Object.keys(opt).sort()).toEqual(["field", "id", "shapedLike", "source", "value"]);
  });

  it("a named field holding an object (a smuggled record) is refused, never passed on", () => {
    const doc = mut(ddOf(SOR));
    const item0 = ((((doc.menus as Json[])[0].menu as Json).categories as Json[])[0].items as Json[])[0];
    item0.name = { ...PLANT };
    const e = refusal(() => doordashShapedToFeed(doc));
    expect([e.kind, e.row]).toEqual(["type", 1]);
    expect(e.message).not.toContain(PLANT.customer_email);
    const u = mut(uberOf(SOR));
    ((u.items as Json[])[2].title as Json).translations = { en_us: { ...PLANT } };
    expect(refusal(() => uberShapedToFeed(u, { asOf: SOR.asOf })).kind).toBe("type");
  });
});

describe("REFUSALS — typed, located, never a finding", () => {
  it("wrong envelope: not an object · no store · menus not a list · an Uber document missing a required list", () => {
    expect(refusal(() => doordashShapedToFeed([])).kind).toBe("type");
    expect(refusal(() => doordashShapedToFeed({ menus: [] })).path).toBe("document.store");
    expect(refusal(() => doordashShapedToFeed({ store: {}, menus: {} })).kind).toBe("type");
    for (const k of ["menus", "categories", "items", "modifier_groups"]) {
      const doc = mut(uberOf(SOR));
      delete doc[k];
      const e = refusal(() => uberShapedToFeed(doc, { asOf: SOR.asOf }));
      expect([e.kind, e.path]).toEqual(["missing-key", `document.${k}`]);
    }
    // the other shape's document is not mistaken for this one
    expect(refusal(() => doordashShapedToFeed(uberOf(SOR))).path).toBe("document.store");
    expect(refusal(() => uberShapedToFeed(ddOf(SOR), { asOf: SOR.asOf })).kind).toBe("missing-key");
  });

  it("a non-integer price refuses with its path and row number (12.99 · \"1299\" · -1)", () => {
    for (const bad of [12.99, "1299", -1]) {
      const doc = mut(ddOf(SOR));
      const cat = (((doc.menus as Json[])[0].menu as Json).categories as Json[])[0];
      (cat.items as Json[])[2].price = bad;
      const e = refusal(() => doordashShapedToFeed(doc));
      expect([e.kind, e.row, e.path]).toEqual(["price", 3, "menus[0].menu.categories[0].items[2].price"]);
      expect(e.message).toMatch(/\(row 3\)/);
      const u = mut(uberOf(SOR));
      ((u.items as Json[])[4].price_info as Json).price = bad;
      const ue = refusal(() => uberShapedToFeed(u, { asOf: SOR.asOf }));
      expect([ue.kind, ue.row, ue.path]).toEqual(["price", 5, "items[4].price_info.price"]);
    }
  });

  it("broken references, duplicates, an unknown option type, a bad day or time, a bad asOf", () => {
    const u1 = mut(uberOf(SOR));
    ((u1.modifier_groups as Json[])[0].modifier_options as Json[])[0].id = "no-such-item";
    expect(refusal(() => uberShapedToFeed(u1, { asOf: SOR.asOf })).kind).toBe("reference");
    const u2 = mut(uberOf(SOR));
    (u2.items as Json[]).find((i) => i.modifier_group_ids !== undefined)!.modifier_group_ids = { ids: ["no-such-group"] };
    expect(refusal(() => uberShapedToFeed(u2, { asOf: SOR.asOf })).kind).toBe("reference");
    const u3 = mut(uberOf(SOR));
    ((u3.modifier_groups as Json[])[0].modifier_options as Json[])[0].type = "MODIFIER_GROUP";
    expect(refusal(() => uberShapedToFeed(u3, { asOf: SOR.asOf })).kind).toBe("type");
    const u4 = mut(uberOf(SOR));
    (u4.items as Json[]).push(mut((u4.items as Json[])[0]));
    expect(refusal(() => uberShapedToFeed(u4, { asOf: SOR.asOf })).kind).toBe("duplicate");
    expect(refusal(() => uberShapedToFeed(uberOf(SOR), { asOf: "yesterday" })).kind).toBe("option");
    const u5 = mut(uberOf(MENU_MODEL));
    ((u5.menus as Json[])[0].service_availability as Json[])[0].day_of_week = "funday";
    expect(refusal(() => uberShapedToFeed(u5, { asOf: MENU_MODEL.asOf })).kind).toBe("type");

    const d1 = mut(ddOf(SOR));
    const cat = (((d1.menus as Json[])[0].menu as Json).categories as Json[])[0];
    const dup = mut((cat.items as Json[])[0]);
    dup.name = "Something else";
    (cat.items as Json[]).push(dup);
    expect(refusal(() => doordashShapedToFeed(d1)).kind).toBe("duplicate");
    const d2 = mut(ddOf(MENU_MODEL));
    ((d2.menus as Json[])[0].open_hours as Json[])[0].start_time = "11am";
    expect(refusal(() => doordashShapedToFeed(d2)).kind).toBe("type");
  });

  it("the engine's own id predicate still runs: a reserved or '#' id is refused (S1.5)", () => {
    for (const id of ["catalog", "sku#1"]) {
      const doc = mut(ddOf(SOR));
      ((((doc.menus as Json[])[0].menu as Json).categories as Json[])[0].items as Json[])[0].merchant_supplied_id = id;
      expect(() => platformFeedToClaims(doordashShapedToFeed(doc))).toThrow(ReservedIdError);
    }
  });

  it("nested option extras deeper than the limit refuse (no unbounded recursion)", () => {
    const leaf = { name: "o", merchant_supplied_id: "o", active: true, price: 0 };
    let opt: Json = { ...leaf };
    for (let d = 0; d < 5; d++) opt = { ...leaf, merchant_supplied_id: `o${d}`, extras: [{ name: "x", merchant_supplied_id: `x${d}`, active: true, options: [opt] }] };
    const doc = { store: {}, menus: [{ menu: { active: true, categories: [{ active: true, items: [{ name: "n", merchant_supplied_id: "i", price: 0, extras: [{ name: "x", merchant_supplied_id: "x", active: true, options: [opt] }] }] }] } }] };
    expect(refusal(() => doordashShapedToFeed(doc)).kind).toBe("depth");
  });
});

describe("LABELS — the carrier travels on the feed, every claim and the wrapper", () => {
  it.each([SHAPED_LIKE_DOORDASH, SHAPED_LIKE_UBER] as const)("%s: the carrier sentence says shaped like, not from, never called, not affiliated", (s) => {
    const c = CARRIER_SENTENCE[s];
    for (const w of ["Shaped like", "public partner documentation", "read 2026-10-31", "not from the platform", "never called", "not affiliated", "synthetic"]) {
      expect(c).toContain(w);
    }
  });

  it("every claim from either adapter carries its shape; the wrapper is simulated", () => {
    const dd = doordashShapedToFeed(roundTripJson(ddOf(SOR)));
    const ub = uberShapedToFeed(roundTripJson(uberOf(SOR)), { asOf: SOR.asOf });
    expect(platformFeedToClaims(dd).every((c) => c.shapedLike === SHAPED_LIKE_DOORDASH)).toBe(true);
    expect(platformFeedToClaims(ub).every((c) => c.shapedLike === SHAPED_LIKE_UBER)).toBe(true);
    expect(runPlatformShapedCheck(ub, SOR)).toMatchObject({ simulated: true, shapedLike: SHAPED_LIKE_UBER, carrier: CARRIER_SENTENCE[SHAPED_LIKE_UBER] });
    expect(platformFeedToClaims(dd).some((c) => UNSTATED_FIELDS.has(c.field))).toBe(false);
  });
});

describe("TRIGGER — the order-errors CSV, shaped like the described contents (our column names)", () => {
  const HEAD = ORDER_ERRORS_COLUMNS.join(",");

  it("reads by header name in any order; unknown columns (a planted customer field) are ignored, never carried", () => {
    const csv = [
      "customer_email,issue_type,order_id,customer_refund_cents,item_in_error,placed_at,merchant_charge_cents,platform_covered_cents,source_channel,driver_note",
      "planted.person@example.invalid,missing_item,ord-1,1250,item-001-v1,2026-07-02T19:00:00Z,1250,0,agent,PLANTED-NOTE-TEXT",
      "planted.person@example.invalid,incorrect_order,ord-2,,,,,,app,",
    ].join("\n");
    const t = parseOrderErrorsCsv(csv);
    expect(t).toMatchObject({ kind: "order-errors", simulated: true, carrier: ORDER_ERRORS_CARRIER });
    expect(t.rows).toEqual([
      { line: 2, order_id: "ord-1", placed_at: "2026-07-02T19:00:00Z", issue_type: "missing_item", item_in_error: "item-001-v1", customer_refund_cents: 1250, merchant_charge_cents: 1250, platform_covered_cents: 0, source_channel: "agent" },
      { line: 3, order_id: "ord-2", placed_at: null, issue_type: "incorrect_order", item_in_error: null, customer_refund_cents: null, merchant_charge_cents: null, platform_covered_cents: null, source_channel: "app" },
    ]);
    expect(JSON.stringify(t)).not.toContain("planted.person");
    expect(JSON.stringify(t)).not.toContain("PLANTED-NOTE");
  });

  it("tolerates format variation: BOM, CRLF, header spelling, issue words, currency signs, separators, offsets", () => {
    const csv = "﻿Order ID,Issue-Type,Customer Refund Cents,Placed At\r\nord-9,Incorrect item,\"$1,250\",2026-07-02T15:00:00-04:00\r\nord-10,MISSING-ITEM,€ 300,2026-07-02\r\n";
    const t = parseOrderErrorsCsv(csv);
    expect(t.rows.map((r) => [r.order_id, r.issue_type, r.customer_refund_cents, r.placed_at])).toEqual([
      ["ord-9", "incorrect_item", 1250, "2026-07-02T15:00:00-04:00"],
      ["ord-10", "missing_item", 300, "2026-07-02"],
    ]);
  });

  it("refuses with the line number: unknown issue, fractional cents, bad instant, blank id, missing column, empty file", () => {
    const line = (csv: string) => {
      try {
        parseOrderErrorsCsv(csv);
      } catch (e) {
        expect(e).toBeInstanceOf(OrderErrorsCsvError);
        expect(e).toBeInstanceOf(ListingsInputError);
        return (e as OrderErrorsCsvError).line;
      }
      throw new Error("expected a refusal");
    };
    expect(line(`${HEAD}\nord-1,,cold_food,,,,,`)).toBe(2);
    expect(line(`${HEAD}\nord-1,,missing_item,,12.50,,,`)).toBe(2);
    expect(line(`${HEAD}\nord-1,2026-07-02,missing_item,,,,,\nord-2,last tuesday,missing_item,,,,,`)).toBe(3);
    expect(line(`${HEAD}\n ,,missing_item,,,,,`)).toBe(2);
    expect(line("order_id,item_in_error\nord-1,x")).toBe(1);
    expect(line("")).toBeNull();
  });

  it("the header comment says the shape is invented and neither platform publishes these headers", () => {
    const src = readFileSync(join(ROOT, "lib", "packs", "listings", "adapters-platform", "order-errors-csv.ts"), "utf8").replace(/\n \* /g, " ");
    expect(src).toMatch(/THE COLUMN NAMES ARE OURS/);
    expect(src).toMatch(/neither publishes the column headers/);
    expect(src).toMatch(/This shape is invented/);
    expect(ORDER_ERRORS_CARRIER).toMatch(/the column names are ours — neither platform publishes these headers/);
  });
});
