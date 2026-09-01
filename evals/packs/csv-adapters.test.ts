/**
 * The spreadsheet path — S1 of docs/plan-testable-instrument-2026-09-01.md.
 *
 * What these tests make TRUE rather than asserted (SC-2/3/4/9 of the plan):
 *
 *  FREEZE   the committed templates are exactly the writers' output over the
 *           canonical fixtures (regenerate ⇒ bytes match), and the browser
 *           projections the UI holds produce the identical bytes — so S2 can
 *           generate the download at runtime with no bundled file.
 *  ROUND    the drifted templates, read back through the adapters, produce the
 *           committed golden report finding-for-finding — with ONE declared
 *           exception (cents-as-decimal, unreachable from a spreadsheet), which
 *           is asserted, not skipped. The faithful pair round-trips to zero.
 *  MUTATE   one edit per rule family a spreadsheet can reach yields exactly that
 *           finding on exactly that row — the denominator is declared below
 *           before any run, never taken from what happened to fire.
 *  REFUSE   only rows the engine cannot INDEX are refused, by spreadsheet row
 *           number; wrong VALUES always reach the engine as findings.
 *  ARRIVE   the file shape a spreadsheet app actually produces (BOM, CRLF,
 *           trailing zeros dropped, `$` and thousands commas, Title-Case headers,
 *           extra columns) reads to the same catalog as the clean template.
 *  SAFE     the adapters' import closure reaches no Node builtin and no
 *           network capability — the same fail-closed walk the delivery station
 *           is held to.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { walkImports } from "../lib/import-walk.ts";
import {
  FEED_COLUMNS,
  FEED_TEMPLATE_FILENAME,
  RECORD_COLUMNS,
  RECORD_TEMPLATE_FILENAME,
  catalogToCsv,
  feedFromCsv,
  feedToCsv,
  recordFromCsv,
} from "@/lib/playground/csv-adapters.ts";
import { RESAVE_FIXTURE_FILENAME, spreadsheetResave } from "@/lib/playground/csv-fixtures.ts";
import { csvCell, parseCsv, toCsv } from "@/lib/playground/csv.ts";
import { SAMPLE_FEED, SOR_CATALOG, verifyAcpFeed } from "@/components/playground/verify-in-browser.ts";
import type { AcpFeed } from "@/lib/packs/listings/acp-feed.ts";
import type { SyntheticCatalog } from "@/lib/packs/listings/types.ts";
import type { VerifierReport } from "@/lib/verifier-core/report.ts";

const ROOT = process.cwd();
const FIX = join(ROOT, "fixtures", "synthetic-restaurant");
const read = (rel: string): string => readFileSync(join(FIX, rel), "utf8");

const driftedFeed = JSON.parse(read("acp-feed.drifted.json")) as AcpFeed;
const faithfulFeed = JSON.parse(read("acp-feed.faithful.json")) as AcpFeed;
const catalog = JSON.parse(read("sor.catalog.json")) as SyntheticCatalog;
const golden = JSON.parse(read("expected-report.acp.json")) as VerifierReport;

const publishedCsv = read(`csv/${FEED_TEMPLATE_FILENAME}`);
const recordCsv = read(`csv/${RECORD_TEMPLATE_FILENAME}`);
const resaveCsv = read(`csv/${RESAVE_FIXTURE_FILENAME}`);

/** A fixed drop instant so every run is deterministic. */
const TODAY = "2026-09-01T17:30:00.000Z";
const READER = { feed: "reader", catalog: "reader" } as const;

/** Read both sides or fail loudly with the adapter's own message. */
function pair(feedText: string, recordText: string) {
  const f = feedFromCsv(feedText);
  const r = recordFromCsv(recordText, { today: TODAY });
  if (!f.ok) throw new Error(`feed refused: ${f.error}`);
  if (!r.ok) throw new Error(`record refused: ${r.error}`);
  return { feed: f.feed, catalog: r.catalog, asOfSource: r.asOfSource };
}

/** Replace one cell in a CSV by (item_id, column) — the edit a tester makes. */
function editCell(csv: string, columns: readonly string[], itemId: string, column: string, value: string): string {
  const parsed = parseCsv(csv);
  if (!parsed.ok) throw new Error(parsed.error);
  const col = columns.indexOf(column);
  const idCol = columns.indexOf("item_id");
  let hit = 0;
  const rows = parsed.rows.map((r, i) => {
    if (i === 0 || r.cells[idCol] !== itemId) return [...r.cells];
    hit++;
    const cells = [...r.cells];
    cells[col] = value;
    return cells;
  });
  if (hit !== 1) throw new Error(`editCell: expected exactly one row with item_id ${itemId}, found ${hit}`);
  return toCsv(rows);
}

function dropRow(csv: string, columns: readonly string[], itemId: string): string {
  const parsed = parseCsv(csv);
  if (!parsed.ok) throw new Error(parsed.error);
  const idCol = columns.indexOf("item_id");
  const before = parsed.rows.length;
  const rows = parsed.rows.filter((r, i) => i === 0 || r.cells[idCol] !== itemId).map((r) => [...r.cells]);
  if (rows.length !== before - 1) throw new Error(`dropRow: ${itemId} not found exactly once`);
  return toCsv(rows);
}

// ---------------------------------------------------------------------------

describe("csv.ts — the reader/writer handles what spreadsheets do", () => {
  it("parses quotes, doubled quotes, embedded commas and embedded newlines", () => {
    const r = parseCsv('a,b\n"x, y","say ""hi"""\n"multi\nline",z\n');
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.rows.map((x) => x.cells)).toEqual([
      ["a", "b"],
      ["x, y", 'say "hi"'],
      ["multi\nline", "z"],
    ]);
    // Line numbers are where a row STARTS — the number the spreadsheet shows.
    expect(r.rows.map((x) => x.line)).toEqual([1, 2, 3]);
  });

  it("accepts a BOM, CRLF, mixed endings, a missing final newline and trailing blank lines", () => {
    const r = parseCsv("\uFEFFa,b\r\n1,2\n3,4\r\n\r\n\n");
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.rows.map((x) => x.cells)).toEqual([["a", "b"], ["1", "2"], ["3", "4"]]);
    const noFinal = parseCsv("a,b\n1,2");
    expect(noFinal.ok && noFinal.rows.length).toBe(2);
  });

  it("refuses an unterminated quote and names the line it opened on", () => {
    const r = parseCsv('a,b\n1,"open\n2,3\n');
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error).toMatch(/line 2/);
    expect(r.error).toMatch(/never closed/);
  });

  it("quotes on write only when RFC 4180 requires it, and round-trips", () => {
    expect(csvCell("plain")).toBe("plain");
    expect(csvCell("a,b")).toBe('"a,b"');
    expect(csvCell('say "hi"')).toBe('"say ""hi"""');
    const rows = [["h1", "h2"], ["x, y", 'q"q'], ["multi\nline", ""]];
    const back = parseCsv(toCsv(rows));
    expect(back.ok && back.rows.map((r) => r.cells)).toEqual(rows);
  });
});

describe("FREEZE — the committed templates are the writers' output over the canonical fixtures", () => {
  it(`csv/${FEED_TEMPLATE_FILENAME} is exactly feedToCsv(acp-feed.drifted.json)`, () => {
    expect(publishedCsv).toBe(feedToCsv(driftedFeed));
  });
  it(`csv/${RECORD_TEMPLATE_FILENAME} is exactly catalogToCsv(sor.catalog.json)`, () => {
    expect(recordCsv).toBe(catalogToCsv(catalog));
  });
  it(`csv/${RESAVE_FIXTURE_FILENAME} is exactly spreadsheetResave(sor.catalog.json)`, () => {
    expect(resaveCsv).toBe(spreadsheetResave(catalog));
    expect(resaveCsv.charCodeAt(0)).toBe(0xfeff);
    expect(resaveCsv).toMatch(/\r\n/);
    expect(resaveCsv).toMatch(/,21\.5,/); // trailing zero dropped, as a General cell would
    expect(resaveCsv).toMatch(/,10,in stock,/); // "10.00" → "10"
  });
  it("the browser projections the UI holds produce the identical template bytes (S2 needs no bundled file)", () => {
    expect(feedToCsv(SAMPLE_FEED)).toBe(publishedCsv);
    expect(catalogToCsv(SOR_CATALOG)).toBe(recordCsv);
  });
  it("the templates carry the column contract in their first row and no lab-labels anywhere", () => {
    expect(publishedCsv.split("\n")[0]).toBe(FEED_COLUMNS.join(","));
    expect(recordCsv.split("\n")[0]).toBe(RECORD_COLUMNS.join(","));
    for (const text of [publishedCsv, recordCsv]) {
      expect(text).not.toMatch(/simulated|synthetic|Test Kitchen|sample|demo/i);
    }
  });
});

describe("ROUND — templates → adapters → engine reproduces the committed golden", () => {
  it("the drifted pair yields the golden finding-for-finding, with ONE declared exception", () => {
    const { feed, catalog: cat, asOfSource } = pair(publishedCsv, recordCsv);
    expect(asOfSource).toBe("column");
    const report = verifyAcpFeed(feed, cat, READER);

    // The exception is declared from the SPEC of the adapter, not observed: feed
    // prices are normalized to two decimals (spreadsheets drop trailing zeros
    // and the engine compares strings), so the fixture's "2150" arrives as
    // "2150.00" and is caught as a plain mismatch, not as cents-as-decimal.
    const exceptions = golden.findings.filter((f) => f.ruleId === "LST-PRICE-CENTS-AS-DECIMAL");
    expect(exceptions, "the golden carries exactly one cents-as-decimal row").toHaveLength(1);

    // The expected report is the golden with that ONE row rewritten exactly as
    // the adapter's contract predicts. The engine orders findings by category
    // and rule, so the rewritten row legitimately moves; compare as sets keyed
    // by (claim id, rule) rather than by position.
    const expected = golden.findings.map((f) =>
      f.ruleId === "LST-PRICE-CENTS-AS-DECIMAL"
        ? {
            ...f,
            ruleId: "LST-PRICE-VALUE",
            claim: { ...f.claim, value: "2150.00" },
            plainLine: "The served price 2150.00 does not match the catalog price 21.50.",
          }
        : f,
    );
    const key = (f: { claim: { id: string }; ruleId: string }) => `${f.claim.id} ${f.ruleId}`;
    const sortByKey = <T extends { claim: { id: string }; ruleId: string }>(xs: readonly T[]) =>
      [...xs].sort((a, b) => key(a).localeCompare(key(b)));
    expect(report.findings).toHaveLength(golden.findings.length);
    expect(sortByKey(report.findings)).toEqual(sortByKey(expected));
    // The site's headline tally survives unchanged: same count, same severities.
    const tally = (fs: readonly { severity: string }[]) => fs.map((f) => f.severity).sort().join(",");
    expect(tally(report.findings)).toBe(tally(golden.findings));
    expect(report.ok).toBe(false);
    // Provenance is a fact about the ACTION: both sides came from the reader.
    expect(report.simulated).toBe(false);
    expect(report.matchingMode).toBe("synthetic-controlled");
  });

  it("the same drifted pair with the bundled record still reads `simulated` (an OR over both sides)", () => {
    const f = feedFromCsv(publishedCsv);
    if (!f.ok) throw new Error(f.error);
    const report = verifyAcpFeed(f.feed, SOR_CATALOG, { feed: "reader", catalog: "sample" });
    expect(report.simulated).toBe(true);
  });

  it("the faithful pair round-trips to a clean report (zero findings, ok)", () => {
    const { feed, catalog: cat } = pair(feedToCsv(faithfulFeed), recordCsv);
    const report = verifyAcpFeed(feed, cat, READER);
    expect(report.findings).toEqual([]);
    expect(report.ok).toBe(true);
  });

  it("the catalog the adapter builds matches the fixture on every field a rule reads", () => {
    const { catalog: cat } = pair(feedToCsv(faithfulFeed), recordCsv);
    const shape = (c: SyntheticCatalog) =>
      c.items.map((it) => ({
        id: it.id,
        name: it.name,
        variations: it.variations.map((v) => ({ id: v.id, name: v.name, priceCents: v.priceCents, stock: v.stock })),
      }));
    expect(shape(cat)).toEqual(shape(catalog));
    expect(cat.asOf).toBe(catalog.asOf);
    expect(cat.currency).toBe("USD");
  });
});

/**
 * MUTATE — the denominator, declared before the run: one edit per rule family
 * a spreadsheet can reach. Each edit is made on the FAITHFUL pair (baseline
 * zero findings) so "exactly one finding, on this row, with this rule" is a
 * clean statement. Rules a spreadsheet cannot express are named, not omitted:
 * LST-PRICE-CENTS-AS-DECIMAL (see ROUND), LST-PRICE-CURRENCY (a wholly different
 * currency is refused by the RECORD adapter as non-USD — the feed side can carry
 * one, and does below), LST-IDENT-TITLE-AMBIGUOUS (needs two record rows with
 * one expected title — exercised in the grouping test).
 */
const MUTATIONS: ReadonlyArray<{
  readonly name: string;
  readonly side: "feed" | "record";
  readonly itemId: string;
  readonly column: string;
  readonly value: string;
  /** Every rule the edit must fire, sorted — usually one; the engine fires two on a pre-order state change. */
  readonly rules: readonly string[];
}> = [
  { name: "a wrong price", side: "feed", itemId: "item-006-v1", column: "price", value: "12.00", rules: ["LST-PRICE-VALUE"] },
  { name: "a malformed currency code", side: "feed", itemId: "item-001-v2", column: "currency", value: "usd", rules: ["LST-PRICE-CURRENCY-FORM"] },
  { name: "a different currency", side: "feed", itemId: "item-001-v2", column: "currency", value: "EUR", rules: ["LST-PRICE-CURRENCY"] },
  { name: "sold out in the record, shown in stock", side: "record", itemId: "item-005-v1", column: "stock", value: "sold out", rules: ["LST-AVAIL-STATE"] },
  { name: "hidden in the record, still served", side: "record", itemId: "item-005-v1", column: "stock", value: "hidden", rules: ["LST-AVAIL-HIDDEN-SHOWN"] },
  { name: "a variant label on the wrong row", side: "feed", itemId: "item-004-v2", column: "variation", value: "Small", rules: ["LST-IDENT-MODIFIER-AMBIG"] },
  { name: "a garbled name", side: "feed", itemId: "item-004-v3", column: "name", value: "JalapeÃ±o Poppers (Large)", rules: ["LST-ENC-UTF8"] },
  { name: "a truncated name", side: "feed", itemId: "item-005-v2", column: "name", value: "Margherita…", rules: ["LST-ENC-TRUNC"] },
  { name: "a wrong name", side: "feed", itemId: "item-005-v2", column: "name", value: "Pepperoni Pizza (Medium)", rules: ["LST-IDENT-NAME"] },
  { name: "an expiry date already passed", side: "feed", itemId: "item-003-v3", column: "expires", value: "2026-01-01", rules: ["LST-STALE-EXPIRED"] },
  // A pre-order row against an in-stock record is ALSO an availability-state
  // drift, so the engine fires both — the golden does the same on item-004-v1.
  { name: "a pre-order with no date", side: "feed", itemId: "item-004-v1", column: "availability", value: "pre-order", rules: ["LST-AVAIL-STATE", "LST-XF-PREORDER-DATE-MISSING"] },
  { name: "a sale price above the price", side: "feed", itemId: "item-001-v3", column: "sale_price", value: "28.50", rules: ["LST-PRICE-SALE-GT"] },
  { name: "buyable but not searchable", side: "feed", itemId: "item-002-v1", column: "searchable", value: "no", rules: ["LST-XF-CHECKOUT-SEARCH"] },
];

describe("MUTATE — one spreadsheet edit, one finding, on that row", () => {
  const faithfulCsv = feedToCsv(faithfulFeed);

  it("the declared set covers every listings rule a spreadsheet can reach (denominator check)", () => {
    const reachable = new Set(MUTATIONS.flatMap((m) => m.rules));
    const all = new Set(golden.findings.map((f) => f.ruleId));
    // Every rule the golden exercises is either reachable from a spreadsheet or
    // named above as unreachable — nothing falls through unaccounted.
    const unreachable = new Set(["LST-PRICE-CENTS-AS-DECIMAL", "LST-EXIST-GHOST", "LST-EXIST-MISSING", "LST-IDENT-ID-MISMATCH", "LST-STALE-AVAILDATE"]);
    for (const rule of all) {
      expect(reachable.has(rule) || unreachable.has(rule), `rule ${rule} is neither declared reachable nor named unreachable`).toBe(true);
    }
  });

  for (const m of MUTATIONS) {
    it(`${m.name} → exactly ${m.rules.join(" + ")} on ${m.itemId}`, () => {
      const feedText = m.side === "feed" ? editCell(faithfulCsv, FEED_COLUMNS, m.itemId, m.column, m.value) : faithfulCsv;
      const recordText = m.side === "record" ? editCell(recordCsv, RECORD_COLUMNS, m.itemId, m.column, m.value) : recordCsv;
      const { feed, catalog: cat } = pair(feedText, recordText);
      const report = verifyAcpFeed(feed, cat, READER);
      expect(report.findings.map((f) => f.ruleId).sort()).toEqual([...m.rules].sort());
      for (const f of report.findings) expect(f.claim.id.split("#")[0]).toBe(m.itemId);
    });
  }

  it("the completeness sweep runs on spreadsheet input: a dropped record row → GHOST; a dropped feed row → MISSING", () => {
    // A single-variation item, so removing it does not change a sibling's
    // expected title (dropping one size of a two-size item also makes the other
    // size's title "Name" instead of "Name (Size)" — correct, but a second finding).
    const ghost = pair(faithfulCsv, dropRow(recordCsv, RECORD_COLUMNS, "item-012-v1"));
    const g = verifyAcpFeed(ghost.feed, ghost.catalog, READER);
    expect(g.findings.map((f) => f.ruleId)).toEqual(["LST-EXIST-GHOST"]);
    expect(g.findings[0].claim.id).toBe("item-012-v1#existence");

    const missing = pair(dropRow(faithfulCsv, FEED_COLUMNS, "item-012-v1"), recordCsv);
    const mr = verifyAcpFeed(missing.feed, missing.catalog, READER);
    expect(mr.findings.map((f) => f.ruleId)).toEqual(["LST-EXIST-MISSING"]);
    expect(mr.findings[0].referenceRowId).toBe("item-012-v1");
  });

  it("a renamed id with the same name resolves as ID-MISMATCH, and a stale pre-order date as STALE-AVAILDATE", () => {
    const renamed = pair(editCell(faithfulCsv, FEED_COLUMNS, "item-003-v2", "item_id", "legacy-pos-4471"), recordCsv);
    const r1 = verifyAcpFeed(renamed.feed, renamed.catalog, READER);
    expect(r1.findings.map((f) => f.ruleId)).toEqual(["LST-IDENT-ID-MISMATCH"]);

    let text = editCell(faithfulCsv, FEED_COLUMNS, "item-004-v1", "availability", "pre-order");
    text = editCell(text, FEED_COLUMNS, "item-004-v1", "available_from", "2026-02-01");
    const stale = pair(text, recordCsv);
    const r2 = verifyAcpFeed(stale.feed, stale.catalog, READER);
    // pre-order against an in-stock record is also an availability-state drift (as in the golden).
    expect(r2.findings.map((f) => f.ruleId).sort()).toEqual(["LST-AVAIL-STATE", "LST-STALE-AVAILDATE"]);
  });
});

describe("REFUSE — only what the engine cannot index, by spreadsheet row; wrong values never", () => {
  const feedRow = (cells: Record<string, string>) =>
    toCsv([[...FEED_COLUMNS], FEED_COLUMNS.map((c) => cells[c] ?? "")]);
  const recordRows = (...rows: Record<string, string>[]) =>
    toCsv([[...RECORD_COLUMNS], ...rows.map((cells) => RECORD_COLUMNS.map((c) => cells[c] ?? ""))]);

  it("empty text, header-only, and a header missing a required column are refused with the template's columns named", () => {
    expect(feedFromCsv("")).toMatchObject({ ok: false, error: expect.stringMatching(/empty/) });
    expect(feedFromCsv("item_id,price\n")).toMatchObject({ ok: false, error: expect.stringMatching(/no data rows/) });
    const r = feedFromCsv("name,price\nx,1.00\n");
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error).toMatch(/"item_id"/);
      expect(r.error).toMatch(new RegExp(FEED_COLUMNS.join(", ").replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    }
    const rr = recordFromCsv("item_id,price\nx,1.00\n", { today: TODAY });
    expect(rr).toMatchObject({ ok: false, error: expect.stringMatching(/"name"/) });
  });

  it("a ragged row (more cells than the header) is refused and explained as an unquoted comma", () => {
    const r = feedFromCsv("item_id,price\nx,1.00,extra\n");
    expect(r).toMatchObject({ ok: false, error: expect.stringMatching(/Row 2 has 3 cells but the header names 2/) });
  });

  it("ids the engine would misread are refused on both sides, naming the row", () => {
    expect(feedFromCsv(feedRow({ item_id: "sku#1", price: "1.00" }))).toMatchObject({
      ok: false,
      error: expect.stringMatching(/^Row 2 \(item_id "sku#1"\): its id "sku#1" contains "#"/),
    });
    expect(recordFromCsv(recordRows({ item_id: "catalog", name: "x", price: "1.00" }), { today: TODAY })).toMatchObject({
      ok: false,
      error: expect.stringMatching(/reserved word "catalog"/),
    });
    expect(feedFromCsv(feedRow({ price: "1.00" }))).toMatchObject({ ok: false, error: expect.stringMatching(/^Row 2: has no item_id/) });
  });

  it("a duplicate id is refused on both sides — two rows, one id, no way to say which was checked", () => {
    const dupFeed = toCsv([[...FEED_COLUMNS], ["a", "x", "", "1.00", "", "", "", "", "", "", "", ""], ["a", "y", "", "2.00", "", "", "", "", "", "", "", ""]]);
    expect(feedFromCsv(dupFeed)).toMatchObject({ ok: false, error: expect.stringMatching(/^Row 3 \(item_id "a"\): repeats/) });
    const dupRec = recordRows({ item_id: "a", name: "x", price: "1.00" }, { item_id: "a", name: "x", price: "2.00" });
    expect(recordFromCsv(dupRec, { today: TODAY })).toMatchObject({ ok: false, error: expect.stringMatching(/^Row 3 \(item_id "a"\): repeats/) });
  });

  it("a price the engine cannot turn into exact cents is refused — three decimals, words, negatives", () => {
    for (const bad of ["1.005", "twelve", "-3.00", "1,2,3", ""]) {
      const r = feedFromCsv(feedRow({ item_id: "a", price: bad }));
      expect(r.ok, `feed price "${bad}" should be refused`).toBe(false);
      if (!r.ok) expect(r.error).toMatch(/^Row 2 \(item_id "a"\): price/);
      const rr = recordFromCsv(recordRows({ item_id: "a", name: "x", price: bad }), { today: TODAY });
      expect(rr.ok, `record price "${bad}" should be refused`).toBe(false);
    }
  });

  it("an unknown stock / availability word, a bad date, and a bad yes/no are refused with the accepted words", () => {
    expect(recordFromCsv(recordRows({ item_id: "a", name: "x", price: "1.00", stock: "maybe" }), { today: TODAY })).toMatchObject({
      ok: false,
      error: expect.stringMatching(/stock "maybe".*in stock, sold out, or hidden/),
    });
    expect(feedFromCsv(feedRow({ item_id: "a", price: "1.00", availability: "gone" }))).toMatchObject({
      ok: false,
      error: expect.stringMatching(/availability "gone".*in stock, out of stock, or pre-order/),
    });
    expect(feedFromCsv(feedRow({ item_id: "a", price: "1.00", expires: "next tuesday" }))).toMatchObject({
      ok: false,
      error: expect.stringMatching(/expires "next tuesday".*YYYY-MM-DD/),
    });
    expect(feedFromCsv(feedRow({ item_id: "a", price: "1.00", expires: "2026-01-01T00:00:00+05:30" }))).toMatchObject({ ok: false });
    expect(feedFromCsv(feedRow({ item_id: "a", price: "1.00", buyable: "sometimes" }))).toMatchObject({
      ok: false,
      error: expect.stringMatching(/buyable "sometimes" must be yes or no/),
    });
  });

  it("a record whose rows disagree on as_of is refused — one record, one date", () => {
    const r = recordFromCsv(
      recordRows({ item_id: "a", name: "x", price: "1.00", as_of: "2026-07-03" }, { item_id: "b", name: "y", price: "1.00", as_of: "2026-07-04" }),
      { today: TODAY },
    );
    expect(r).toMatchObject({ ok: false, error: expect.stringMatching(/^Row 3 \(item_id "b"\): as_of "2026-07-04" disagrees with "2026-07-03T00:00:00Z" on row 2/) });
  });

  it("WRONG VALUES ARE NOT REFUSED — a disagreeing price, a strange currency, an odd name all reach the engine", () => {
    const f = feedFromCsv(feedRow({ item_id: "item-006-v1", name: "Something Else", variation: "Regular", price: "999.99", currency: "XYZ" }));
    expect(f.ok).toBe(true);
    if (!f.ok) return;
    const report = verifyAcpFeed(f.feed, SOR_CATALOG, { feed: "reader", catalog: "sample" });
    expect(report.findings.map((x) => x.ruleId).sort()).toEqual(
      ["LST-IDENT-NAME", "LST-PRICE-CURRENCY", "LST-PRICE-VALUE", ...catalog.items.flatMap((it) => it.variations).filter((v) => v.stock !== "hidden" && v.id !== "item-006-v1").map(() => "LST-EXIST-MISSING")].sort(),
    );
  });
});

describe("ARRIVE — the shape a spreadsheet app actually produces", () => {
  it("the BOM + CRLF + trailing-zeros-dropped re-save reads to the same catalog as the clean template", () => {
    const clean = recordFromCsv(recordCsv, { today: TODAY });
    const resaved = recordFromCsv(resaveCsv, { today: TODAY });
    expect(clean.ok && resaved.ok).toBe(true);
    if (!clean.ok || !resaved.ok) return;
    expect(resaved.catalog).toEqual(clean.catalog);
    // And therefore the same verdict on the same feed.
    const f = feedFromCsv(publishedCsv);
    if (!f.ok) throw new Error(f.error);
    expect(verifyAcpFeed(f.feed, resaved.catalog, READER)).toEqual(verifyAcpFeed(f.feed, clean.catalog, READER));
  });

  it("feed prices normalize to two decimals; `$` and thousands commas are accepted; record prices become exact cents", () => {
    const f = feedFromCsv(
      toCsv([[...FEED_COLUMNS], ["a", "x", "", "21.5", "", "", "", "", "", "", "", ""], ["b", "y", "", "12", "", "", "", "", "", "", "", ""], ["c", "z", "", "$1,250.00", "", "", "", "", "", "", "", ""]]),
    );
    expect(f.ok).toBe(true);
    if (!f.ok) return;
    expect(f.feed.items.map((i) => i.price)).toEqual(["21.50", "12.00", "1250.00"]);
    const r = recordFromCsv(
      toCsv([[...RECORD_COLUMNS], ["a", "x", "", "21.5", "", "", ""], ["b", "y", "", "$1,250", "", "", ""], ["c", "z", "", "0.07", "", "", ""]]),
      { today: TODAY },
    );
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.catalog.items.flatMap((i) => i.variations.map((v) => v.priceCents))).toEqual([2150, 125000, 7]);
  });

  it("headers match case- and space-insensitively, in any order, with extra columns ignored", () => {
    const text = "\uFEFFPrice,Category,Item ID,Name,Stock\n1.00,Mains,a,Burger,In Stock\n";
    const r = recordFromCsv(text, { today: TODAY });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.catalog.items[0]).toMatchObject({ name: "Burger", variations: [{ id: "a", priceCents: 100, stock: "in_stock" }] });
  });

  it("plain words in cells resolve regardless of case, spacing, hyphens or underscores", () => {
    const f = feedFromCsv(
      toCsv([[...FEED_COLUMNS], ["a", "x", "", "1.00", "", "", "Pre Order", "2026-12-01", "", "YES", "No", ""], ["b", "y", "", "1.00", "", "", "OUT_OF_STOCK", "", "", "", "", ""], ["c", "z", "", "1.00", "", "", "Sold out", "", "", "", "", ""]]),
    );
    expect(f.ok).toBe(true);
    if (!f.ok) return;
    expect(f.feed.items.map((i) => i.availability)).toEqual(["pre_order", "out_of_stock", "out_of_stock"]);
    expect(f.feed.items[0]).toMatchObject({ is_eligible_search: true, is_eligible_checkout: false, availability_date: "2026-12-01T00:00:00Z" });
    const r = recordFromCsv(toCsv([[...RECORD_COLUMNS], ["a", "x", "", "1.00", "86'd", "", ""], ["b", "y", "", "1.00", "Hidden", "", ""]]), { today: TODAY });
    expect(r.ok && r.catalog.items.map((i) => i.variations[0].stock)).toEqual(["soldout_86", "hidden"]);
  });

  it("blank optional cells take their documented defaults", () => {
    const f = feedFromCsv(toCsv([[...FEED_COLUMNS], ["a", "x", "", "1.00", "", "", "", "", "", "", "", ""]]));
    expect(f.ok).toBe(true);
    if (!f.ok) return;
    expect(f.feed.items[0]).toMatchObject({
      currency: "USD",
      availability: "in_stock",
      is_eligible_search: true,
      is_eligible_checkout: true,
      group_id: "a",
      variant_dict: { variation: "" },
    });
    expect(f.feed.items[0]).not.toHaveProperty("sale_price");
    expect(f.feed.items[0]).not.toHaveProperty("expiration_date");
  });
});

describe("as_of — the one default that could change a verdict is reported, never hidden", () => {
  const noAsOf = toCsv([[...RECORD_COLUMNS], ["a", "x", "", "1.00", "", "", ""]]);

  it("with no as_of column, the record is dated the drop-day at 00:00:00Z and says so", () => {
    const r = recordFromCsv(noAsOf, { today: TODAY });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.asOfSource).toBe("default");
    expect(r.catalog.asOf).toBe("2026-09-01T00:00:00Z");
  });

  it("with an as_of column the sheet's date is used, date-only expanding to midnight UTC", () => {
    const r = recordFromCsv(toCsv([[...RECORD_COLUMNS], ["a", "x", "", "1.00", "", "2026-07-03", ""]]), { today: TODAY });
    expect(r.ok && r.asOfSource).toBe("column");
    expect(r.ok && r.catalog.asOf).toBe("2026-07-03T00:00:00Z");
  });

  it("the adapter never reads a clock: the same inputs give the same catalog, and a bad drop time is refused", () => {
    const a = recordFromCsv(noAsOf, { today: TODAY });
    const b = recordFromCsv(noAsOf, { today: TODAY });
    expect(a).toEqual(b);
    expect(recordFromCsv(noAsOf, { today: "yesterday" })).toMatchObject({ ok: false, error: expect.stringMatching(/no usable drop time/) });
  });

  it("the default changes staleness verdicts exactly as a dated record would — that is why it is reported", () => {
    const f = feedFromCsv(toCsv([[...FEED_COLUMNS], ["a", "x", "", "1.00", "", "", "", "", "2026-08-31", "", "", ""]]));
    const r = recordFromCsv(noAsOf, { today: TODAY });
    if (!f.ok || !r.ok) throw new Error("setup");
    const report = verifyAcpFeed(f.feed, r.catalog, READER);
    expect(report.findings.map((x) => x.ruleId)).toEqual(["LST-STALE-EXPIRED"]);
    expect(report.findings[0].plainLine).toContain("catalog as-of 2026-09-01T00:00:00Z");
  });
});

describe("grouping — rows become items by `group`, else by `name`", () => {
  it("rows sharing a name are one item, so the expected title carries the variation; a lone row does not", () => {
    const r = recordFromCsv(
      toCsv([[...RECORD_COLUMNS], ["p1", "Pizza", "Small", "10.00", "", "", ""], ["p2", "Pizza", "Large", "14.00", "", "", ""], ["s1", "Soup", "", "6.00", "", "", ""]]),
      { today: TODAY },
    );
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.catalog.items.map((i) => [i.id, i.name, i.variations.length])).toEqual([["Pizza", "Pizza", 2], ["Soup", "Soup", 1]]);
    // The engine's expected titles follow: "Pizza (Small)" / "Pizza (Large)" / "Soup".
    const f = feedFromCsv(toCsv([[...FEED_COLUMNS], ["p1", "Pizza (Small)", "Small", "10.00", "", "", "", "", "", "", "", ""], ["p2", "Pizza (Large)", "Large", "14.00", "", "", "", "", "", "", "", ""], ["s1", "Soup", "", "6.00", "", "", "", "", "", "", "", ""]]));
    if (!f.ok) throw new Error(f.error);
    expect(verifyAcpFeed(f.feed, r.catalog, READER).findings).toEqual([]);
  });

  it("an explicit `group` overrides name-grouping, so two distinct items may share a name", () => {
    const r = recordFromCsv(
      toCsv([[...RECORD_COLUMNS], ["a", "Special", "", "10.00", "", "", "g1"], ["b", "Special", "", "12.00", "", "", "g2"]]),
      { today: TODAY },
    );
    expect(r.ok && r.catalog.items.map((i) => i.id)).toEqual(["g1", "g2"]);
    // Two records with one expected title make an unresolvable feed row: the
    // engine names the candidates rather than calling it a ghost (TITLE-AMBIGUOUS).
    const f = feedFromCsv(toCsv([[...FEED_COLUMNS], ["zz", "Special", "", "10.00", "", "", "", "", "", "", "", ""]]));
    if (!f.ok || !r.ok) throw new Error("setup");
    const rules = verifyAcpFeed(f.feed, r.catalog, READER).findings.map((x) => x.ruleId);
    expect(rules).toContain("LST-IDENT-TITLE-AMBIGUOUS");
  });
});

describe("SAFE — the adapters reach no Node builtin and no network capability", () => {
  it("the import closure of csv-adapters.ts is pure TypeScript", () => {
    const entry = join(ROOT, "lib", "playground", "csv-adapters.ts");
    const { violations, seen } = walkImports(entry, { root: ROOT, allowPackages: [] });
    expect([...seen].some((f) => f.endsWith("csv.ts")), "the walk never reached the CSV reader").toBe(true);
    expect([...seen].some((f) => f.endsWith("acp-feed.ts")), "the walk never reached the feed model").toBe(true);
    expect(violations).toEqual([]);
    for (const f of seen) {
      expect(readFileSync(f, "utf8")).not.toMatch(/from\s+["']node:/);
    }
  });
});
