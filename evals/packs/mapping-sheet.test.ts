import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  ListingsInputError,
  MappingSheetError,
  acpFeedToClaims,
  acpFeedToUberShaped,
  buildFaithfulFeed,
  buildFaithfulMenuFeed,
  mappingSheetReference,
  parseMappingSheet,
  platformFeedToClaims,
  runListingsVerification,
  runListingsVerificationWithMapping,
  sorReference,
  uberShapedToFeed,
  type AcpFeed,
  type MappingSheet,
  type SyntheticCatalog,
} from "@/lib/packs/listings";
import { serializeReport } from "@/lib/verifier-core";

/**
 * ID-MAPPING SHEET (S3 CP2; plan § 4 MAP, § 6 control register "the id-mapping
 * sheet is cited as a reference row when it resolves an identity"; blindspot
 * pass Q9 lifecycle; Codex cross-check 2026-10-12 § 3 p.1 "ownership is never
 * inferred from a mapping reference").
 *
 * Fixtures: fixtures/mapping/sheet.csv (every faithful row under an opaque
 * platform id) · sheet.stale.csv (one live line, two stale) ·
 * sheet.duplicate-title.csv (one line resolving a name two record rows share).
 * All synthetic. The copies are derived here from the bundled faithful feed.
 *
 * ── Mutation record (2026-10-31; each red observed, then restored) ──
 *  M1 mapping-sheet.ts: the receipt swap removed (`referenceRowId:
 *     f.referenceRowId`) → RECEIPT red, 1 failed / 18 passed (the finding cited
 *     the record row, not the sheet line) — restored, 19/19.
 *  M2 mapping-sheet.ts: `staleFindings` emptied → LIFECYCLE red, 1 failed / 18
 *     passed — restored, 19/19.
 *  M3 mapping-sheet.ts: the one-record-row-one-copy-row refusal skipped →
 *     REFUSALS red, 1 failed / 18 passed — restored, 19/19.
 */

const ROOT = process.cwd();
const fx = (name: string): string => readFileSync(join(ROOT, "fixtures", "mapping", name), "utf8");
const SOR = JSON.parse(readFileSync(join(ROOT, "fixtures", "synthetic-restaurant", "sor.catalog.json"), "utf8")) as SyntheticCatalog;
const SHEET = parseMappingSheet(fx("sheet.csv"));

/** The copy keyed by platform ids: every faithful row renamed through the sheet. */
function platformKeyed(feed: AcpFeed, sheet: MappingSheet = SHEET): AcpFeed {
  const toPlatform = new Map(sheet.rows.map((r) => [r.record_variation_id, r.platform_item_id]));
  return { ...feed, items: feed.items.map((r) => ({ ...r, item_id: toPlatform.get(r.item_id) ?? r.item_id })) };
}
const lineOf = (platformId: string): number => SHEET.rows.find((r) => r.platform_item_id === platformId)!.line;
const COPY = platformKeyed(buildFaithfulFeed(SOR));
const mutRow = (feed: AcpFeed, id: string, patch: Record<string, unknown>): AcpFeed => ({
  ...feed,
  items: feed.items.map((r) => (r.item_id === id ? { ...r, ...patch } : r)),
});

describe("RESOLUTION — the sheet lines rows up, and the run says so", () => {
  it("the bundled sheet covers every faithful row once, under opaque platform ids", () => {
    const faithful = buildFaithfulFeed(SOR);
    expect(SHEET.rows.map((r) => r.record_variation_id)).toEqual(faithful.items.map((r) => r.item_id));
    expect(SHEET.rows.every((r) => /^plat-\d{3}$/.test(r.platform_item_id))).toBe(true);
    expect(SHEET.rows[0].line).toBe(2);
  });

  it("without the sheet, every platform-keyed row is an id mismatch; with it, the copy is clean and every identity is cited", () => {
    const without = runListingsVerification(acpFeedToClaims(COPY), SOR);
    expect(new Set(without.findings.map((f) => f.ruleId))).toEqual(new Set(["LST-IDENT-ID-MISMATCH"]));
    expect(without.findings).toHaveLength(COPY.items.length);
    const run = runListingsVerificationWithMapping(acpFeedToClaims(COPY), SOR, SHEET);
    expect(run.report.findings).toEqual([]);
    expect(run.report.ok).toBe(true);
    expect(run.resolutions).toHaveLength(COPY.items.length);
    for (const r of run.resolutions) {
      expect(r.matching).toBe("mapping-sheet");
      expect(r.referenceRowId).toBe(`mapping:${lineOf(r.platformItemId)}`);
    }
  });

  it("a copy keyed by the record's own ids is untouched by the layer (the record id resolves first)", () => {
    const faithful = buildFaithfulFeed(SOR);
    const plain = serializeReport(runListingsVerification(acpFeedToClaims(faithful), SOR));
    const run = runListingsVerificationWithMapping(acpFeedToClaims(faithful), SOR, SHEET);
    expect(serializeReport(run.report)).toBe(plain);
    expect(run.resolutions).toEqual([]);
  });

  it("the Reference layer: record ids resolve as before; a mapped platform id resolves to the sheet line; anything else is null", () => {
    const layer = mappingSheetReference(SOR, SHEET);
    const base = sorReference(SOR);
    const own = { id: "item-001-v1#price.amount", source: "acp-feed" as const, field: "price.amount", value: "21.50" };
    expect(layer.resolve(own)).toEqual(base.resolve(own));
    const mapped = layer.resolve({ ...own, id: "plat-003#price.amount" })!;
    expect(mapped.referenceRowId).toBe(`mapping:${lineOf("plat-003")}`);
    expect(mapped.value).toEqual(base.resolve({ ...own, id: `${SHEET.rows[2].record_variation_id}#price.amount` })!.value);
    expect(layer.resolve({ ...own, id: "plat-404#price.amount" })).toBeNull();
    expect(mappingSheetReference(SOR, parseMappingSheet(fx("sheet.stale.csv"))).resolve({ ...own, id: "plat-099#price.amount" })).toBeNull();
  });
});

describe("RECEIPT — a finding on a mapped row cites the sheet line, under the copy's own row id", () => {
  it("price and availability drift on mapped rows: claim id is the platform id; the receipt is mapping:<line>", () => {
    const row3 = COPY.items[2];
    const row7 = COPY.items[6];
    let copy = mutRow(COPY, row3.item_id, { price: (Number(row3.price) + 1).toFixed(2) });
    copy = mutRow(copy, row7.item_id, { availability: row7.availability === "in_stock" ? "out_of_stock" : "in_stock" });
    const run = runListingsVerificationWithMapping(acpFeedToClaims(copy), SOR, SHEET);
    expect(run.report.findings.map((f) => [f.ruleId, f.claim.id, f.referenceRowId])).toEqual([
      ["LST-AVAIL-STATE", `${row7.item_id}#availability`, `mapping:${lineOf(row7.item_id)}`],
      ["LST-PRICE-VALUE", `${row3.item_id}#price.amount`, `mapping:${lineOf(row3.item_id)}`],
    ]);
  });

  it("an add-on finding keeps the option's own receipt; the row it sits on is the platform id", () => {
    const menu = platformKeyed(buildFaithfulMenuFeed(SOR));
    const row = menu.items.find((r) => (r.modifiers ?? []).length > 1)!;
    const mods = row.modifiers!.map((m, i) => (i === 1 ? { ...m, price_delta: "9.99" } : m));
    const run = runListingsVerificationWithMapping(acpFeedToClaims(mutRow(menu, row.item_id, { modifiers: mods })), SOR, SHEET);
    expect(run.report.findings.map((f) => [f.ruleId, f.claim.id, f.referenceRowId])).toEqual([
      ["LST-MOD-PRICE-VALUE", `${row.item_id}#modifier.${mods[1].id}`, mods[1].id],
    ]);
  });

  it("a platform-shaped copy keyed by platform ids reads clean through the sheet (the reason the sheet exists)", () => {
    const category = (id: string) => SOR.items.find((i) => i.variations.some((v) => v.id === id))!.category;
    const toRecord = new Map(SHEET.rows.map((r) => [r.platform_item_id, r.record_variation_id]));
    const doc = acpFeedToUberShaped(platformKeyed(buildFaithfulMenuFeed(SOR)), { categoryOf: (r) => category(toRecord.get(r.item_id)!), asOf: SOR.asOf });
    const run = runListingsVerificationWithMapping(platformFeedToClaims(uberShapedToFeed(doc, { asOf: SOR.asOf })), SOR, SHEET);
    expect(run.report.ok).toBe(true);
    expect(run.resolutions).toHaveLength(SHEET.rows.length);
  });
});

describe("LIFECYCLE — stale line · duplicate title · unmapped id", () => {
  it("a stale line (its record row no longer exists) is LST-MAP-STALE, warn, existence, and resolves nothing", () => {
    const stale = parseMappingSheet(fx("sheet.stale.csv"));
    const run = runListingsVerificationWithMapping(acpFeedToClaims(COPY), SOR, stale);
    const staleF = run.report.findings.filter((f) => f.ruleId === "LST-MAP-STALE");
    expect(staleF.map((f) => [f.claim.id, f.severity, f.category, f.referenceRowId])).toEqual([
      ["mapping:3#record_variation_id", "warn", "existence", "catalog-meta"],
      ["mapping:4#record_variation_id", "warn", "existence", "catalog-meta"],
    ]);
    expect(staleF[0].plainLine).toMatch(/Line 3 of the id-mapping sheet maps "plat-005" to record row "item-001-v9", which the merchant's record does not have/);
    // plat-001 (live line) is clean; plat-005 (stale) falls to the engine's own path — exact-name resolution, reported;
    // plat-099 is not served, so the stale line is all that is said about it.
    const on = (row: string) => run.report.findings.filter((f) => f.claim.id.split("#")[0] === row).map((f) => f.ruleId);
    expect(on("plat-001")).toEqual([]);
    expect(on("plat-005")).toEqual(["LST-IDENT-ID-MISMATCH"]);
    expect(on("plat-099")).toEqual([]);
    expect(run.resolutions.map((r) => r.platformItemId)).toEqual(["plat-001"]);
  });

  it("duplicate title: two record rows share a name — with no line it is ambiguous, never guessed; with a line it resolves", () => {
    const record: SyntheticCatalog = {
      ...SOR,
      items: SOR.items.map((i) => (i.id === "item-003" ? { ...i, name: SOR.items[0].name } : i)),
    };
    const feed = buildFaithfulFeed(record);
    const copy = { ...feed, items: feed.items.map((r) => (r.item_id === "item-003-v1" ? { ...r, item_id: "plat-dup" } : r)) };
    const without = runListingsVerification(acpFeedToClaims(copy), record);
    const amb = without.findings.find((f) => f.claim.id === "plat-dup#existence")!;
    expect(amb.ruleId).toBe("LST-IDENT-TITLE-AMBIGUOUS");
    expect(amb.plainLine).toMatch(/matches 2 catalog rows \(item-001-v1, item-003-v1\)/);
    const sheet = parseMappingSheet(fx("sheet.duplicate-title.csv"));
    const run = runListingsVerificationWithMapping(acpFeedToClaims(copy), record, sheet);
    expect(run.report.ok).toBe(true);
    expect(run.resolutions).toEqual([{ platformItemId: "plat-dup", recordVariationId: "item-003-v1", referenceRowId: "mapping:2", matching: "mapping-sheet" }]);
  });

  it("an unmapped id takes the existing path: a ghost when no record row has its name", () => {
    const ghost = { ...COPY.items[0], item_id: "plat-404", title: "A Dish Nobody Recorded" };
    const run = runListingsVerificationWithMapping(acpFeedToClaims({ ...COPY, items: [...COPY.items, ghost] }), SOR, SHEET);
    expect(run.report.findings.map((f) => [f.ruleId, f.claim.id])).toEqual([["LST-EXIST-GHOST", "plat-404#existence"]]);
  });
});

describe("OWNERSHIP — the sheet resolves identity only; who mapped a line is never read", () => {
  it("rewriting mapped_by on every line changes neither the report bytes nor the resolutions; no report names a mapper", () => {
    const drifted = mutRow(COPY, COPY.items[1].item_id, { price: "99.99" });
    const a = runListingsVerificationWithMapping(acpFeedToClaims(drifted), SOR, SHEET);
    const other: MappingSheet = { rows: SHEET.rows.map((r) => ({ ...r, mapped_by: "partner-integration-engineer" })) };
    const b = runListingsVerificationWithMapping(acpFeedToClaims(drifted), SOR, other);
    expect(serializeReport(b.report)).toBe(serializeReport(a.report));
    expect(b.resolutions).toEqual(a.resolutions);
    expect(serializeReport(a.report) + JSON.stringify(a.resolutions)).not.toMatch(/integrations-analyst|mapped_by/);
    for (const r of a.resolutions) expect(Object.keys(r).sort()).toEqual(["matching", "platformItemId", "recordVariationId", "referenceRowId"]);
  });

  it("the module never reads mapped_by outside parsing (source check)", () => {
    const src = readFileSync(join(ROOT, "lib", "packs", "listings", "mapping-sheet.ts"), "utf8");
    const uses = src.split("\n").filter((l) => /\bmapped_by\b/.test(l) && !/^\s*(\*|\/\/|\/\*)/.test(l));
    expect(uses.every((l) => /MAPPING_SHEET_COLUMNS|readonly mapped_by|mapped_by: cell|"mapped_by", "mapped_at"/.test(l)), uses.join("\n")).toBe(true);
  });
});

describe("REFUSALS — a sheet the engine cannot use honestly is refused, with its line", () => {
  const H = "platform_item_id,record_variation_id,mapped_by,mapped_at,note";
  const lineOfError = (fn: () => unknown): number | null => {
    try {
      fn();
    } catch (e) {
      expect(e).toBeInstanceOf(MappingSheetError);
      expect(e).toBeInstanceOf(ListingsInputError);
      return (e as MappingSheetError).line;
    }
    throw new Error("expected a refusal");
  };
  it.each([
    ["a missing mapped_by column", "platform_item_id,record_variation_id,mapped_at\np,item-001-v1,2026-07-01", 1],
    ["a blank record id", `${H}\np-1,item-001-v1,a,2026-07-01,\np-2,,a,2026-07-01,`, 3],
    ["a reserved id", `${H}\ncatalog,item-001-v1,a,2026-07-01,`, 2],
    ["an id containing #", `${H}\np-1,item-001-v1#x,a,2026-07-01,`, 2],
    ["a platform id mapped twice", `${H}\np-1,item-001-v1,a,2026-07-01,\np-1,item-001-v2,a,2026-07-01,`, 3],
    ["a mapped_at that is not an instant", `${H}\np-1,item-001-v1,a,last week,`, 2],
  ])("parse: %s", (_name, csv, line) => {
    expect(lineOfError(() => parseMappingSheet(csv))).toBe(line);
  });

  it("run: re-mapping a record id to another, and two copy rows judged as one record row, are refused", () => {
    const remap = parseMappingSheet(`${H}\nitem-001-v1,item-001-v2,a,2026-07-01,`);
    expect(lineOfError(() => runListingsVerificationWithMapping(acpFeedToClaims(buildFaithfulFeed(SOR)), SOR, remap))).toBe(2);
    const twoOnOne = parseMappingSheet(`${H}\nplat-a,item-001-v1,a,2026-07-01,\nplat-b,item-001-v1,a,2026-07-01,`);
    const copy = { ...COPY, items: [{ ...COPY.items[0], item_id: "plat-a" }, { ...COPY.items[0], item_id: "plat-b" }] };
    expect(lineOfError(() => runListingsVerificationWithMapping(acpFeedToClaims(copy), SOR, twoOnOne))).toBe(3);
    const ownAndMapped = parseMappingSheet(`${H}\nplat-a,item-001-v1,a,2026-07-01,`);
    const both = { ...COPY, items: [buildFaithfulFeed(SOR).items[0], { ...COPY.items[0], item_id: "plat-a" }] };
    expect(lineOfError(() => runListingsVerificationWithMapping(acpFeedToClaims(both), SOR, ownAndMapped))).toBe(2);
  });
});
