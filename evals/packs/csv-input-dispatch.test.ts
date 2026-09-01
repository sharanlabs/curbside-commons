/**
 * THE SPREADSHEET DOOR in the browser seam — S2 of
 * docs/plan-testable-instrument-2026-09-01.md.
 *
 * `parseFeedInput` / `parseRecordInput` are now the ONLY parse the workbench
 * calls, for both slots, both doors (file and paste). What this file makes true:
 *
 *  - dispatch is on CONTENT: a JSON document takes the JSON path unchanged
 *    (byte-identical results to the parsers it wraps), anything else is read as
 *    a spreadsheet — so a file renamed .txt is still whatever its bytes are;
 *  - the 5 MB cap is enforced BEFORE the CSV branch, with the same message the
 *    JSON branch uses — a limit one door enforces and another does not is a
 *    limit on one door (F-1);
 *  - the record's date travels with the parse: `record` when the file carried
 *    it, `drop-day` when a spreadsheet had no as_of column — and the parser
 *    never reads a clock;
 *  - the templates the UI offers for download are byte-identical to the
 *    committed fixtures, so the download and the repo can never disagree;
 *  - the bundled-pair path is untouched: the golden still reproduces through
 *    the dispatcher.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  FEED_TEMPLATE_FILENAME,
  MAX_INPUT_CHARS,
  RECORD_TEMPLATE_FILENAME,
  SAMPLE_ORIGIN,
  SOR_CATALOG,
  catalogSampleText,
  detectInputFormat,
  feedTemplateText,
  parseAcpFeedText,
  parseCatalogText,
  parseFeedInput,
  parseRecordInput,
  recordTemplateText,
  sampleFeedText,
  verifyAcpFeed,
} from "@/components/playground/verify-in-browser.ts";
import { serializeReport } from "@/lib/verifier-core/verify.ts";

const FIX = join(process.cwd(), "fixtures", "synthetic-restaurant");
const golden = readFileSync(join(FIX, "expected-report.acp.json"), "utf8");
const publishedCsv = readFileSync(join(FIX, "csv", FEED_TEMPLATE_FILENAME), "utf8");
const recordCsv = readFileSync(join(FIX, "csv", RECORD_TEMPLATE_FILENAME), "utf8");
const TODAY = "2026-09-01T17:30:00.000Z";

describe("detectInputFormat — content, not extension", () => {
  it("an object or array opener is JSON; anything else is a spreadsheet", () => {
    expect(detectInputFormat('{"items":[]}')).toBe("json");
    expect(detectInputFormat("  \n[1]")).toBe("json");
    expect(detectInputFormat("\uFEFF{")).toBe("json");
    expect(detectInputFormat("item_id,price\na,1.00\n")).toBe("csv");
    expect(detectInputFormat("\uFEFFitem_id,price\n")).toBe("csv");
    expect(detectInputFormat("")).toBe("csv");
  });
});

describe("parseFeedInput — the JSON path is unchanged, the CSV path is the adapter", () => {
  it("JSON text yields exactly what parseAcpFeedText yields, success and failure alike", () => {
    for (const text of [sampleFeedText(), "", "   ", "{not json", "[1,2]", '{"items":[null]}', '{"items":[]}']) {
      expect(parseFeedInput(text)).toEqual(parseAcpFeedText(text));
    }
  });

  it("text that is neither shape is told so — not handed a missing-column message about a sheet it never was", () => {
    for (const text of ["this is not a feed {{{", "hello", "item_id\na\n"]) {
      const r = parseFeedInput(text);
      expect(r.ok).toBe(false);
      if (!r.ok) {
        expect(r.error).toMatch(/neither shape|either shape this slot reads/);
        expect(r.error).toContain(FEED_TEMPLATE_FILENAME);
      }
    }
    const rec = parseRecordInput("nope", { today: TODAY });
    expect(!rec.ok && rec.error).toContain(RECORD_TEMPLATE_FILENAME);
  });

  it("the template reads to the same feed the adapter builds, and the bundled pair still reproduces the golden", () => {
    const viaDispatch = parseFeedInput(publishedCsv);
    expect(viaDispatch.ok).toBe(true);
    if (!viaDispatch.ok) return;
    expect(viaDispatch.feed.items).toHaveLength(25);
    // Bundled JSON pair through the dispatcher == the committed golden, byte for byte.
    const json = parseFeedInput(sampleFeedText());
    expect(json.ok && serializeReport(verifyAcpFeed(json.feed, SOR_CATALOG, SAMPLE_ORIGIN))).toBe(golden);
  });

  it("an oversized spreadsheet is refused before parsing, with the shared cap's own message", () => {
    const big = "item_id,price\n" + "a,1.00\n".repeat(Math.ceil(MAX_INPUT_CHARS / 7) + 1);
    expect(big.length).toBeGreaterThan(MAX_INPUT_CHARS);
    const r = parseFeedInput(big);
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error).toMatch(/larger than the 5 MB this tab will read/);
      expect(r.error).toMatch(/not truncated/);
    }
    // The JSON branch says the same thing for the same size — one limit, one voice.
    const bigJson = '{"items":[' + '{"item_id":"a"},'.repeat(Math.ceil(MAX_INPUT_CHARS / 16) + 1) + "]}";
    const j = parseFeedInput(bigJson);
    expect(!j.ok && j.error).toMatch(/larger than the 5 MB this tab will read/);
  });

  it("a spreadsheet the adapter refuses reaches the reader with the adapter's row-numbered message", () => {
    const r = parseFeedInput("item_id,price\n,1.00\n");
    expect(!r.ok && r.error).toMatch(/^Row 2: has no item_id/);
  });
});

describe("parseRecordInput — the record's date travels with the parse", () => {
  it("a JSON catalog is dated by its own asOf and says `record`", () => {
    const r = parseRecordInput(catalogSampleText(), { today: TODAY });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.dated).toEqual({ asOf: SOR_CATALOG.asOf, source: "record" });
    const direct = parseCatalogText(catalogSampleText());
    expect(direct.ok && direct.catalog).toEqual(r.catalog);
  });

  it("JSON failures pass through unchanged", () => {
    for (const text of ["", "{nope", '{"items":[]}', '{"asOf":"2026-07-03T00:00:00Z","items":[{"id":"x"}]}']) {
      const a = parseRecordInput(text, { today: TODAY });
      const b = parseCatalogText(text);
      expect(a.ok).toBe(false);
      expect(b.ok).toBe(false);
      if (!a.ok && !b.ok) expect(a.error).toBe(b.error);
    }
  });

  it("a spreadsheet with an as_of column is dated by it (`record`); without one, by the drop-day (`drop-day`)", () => {
    const withColumn = parseRecordInput(recordCsv, { today: TODAY });
    expect(withColumn.ok && withColumn.dated).toEqual({ asOf: "2026-07-03T00:00:00Z", source: "record" });

    const noColumn = "item_id,name,variation,price,stock\na,Burger,,9.00,in stock\n";
    const defaulted = parseRecordInput(noColumn, { today: TODAY });
    expect(defaulted.ok && defaulted.dated).toEqual({ asOf: "2026-09-01T00:00:00Z", source: "drop-day" });
    // No clock inside: the same inputs, the same result, whatever the wall clock says.
    expect(parseRecordInput(noColumn, { today: TODAY })).toEqual(defaulted);
  });

  it("an oversized spreadsheet record is refused before parsing", () => {
    const big = "item_id,name,price\n" + "a,x,1.00\n".repeat(Math.ceil(MAX_INPUT_CHARS / 9) + 1);
    const r = parseRecordInput(big, { today: TODAY });
    expect(!r.ok && r.error).toMatch(/larger than the 5 MB this tab will read/);
  });
});

describe("the templates offered for download are the committed fixtures, byte for byte", () => {
  it("feed template", () => {
    expect(feedTemplateText()).toBe(publishedCsv);
  });
  it("record template", () => {
    expect(recordTemplateText()).toBe(recordCsv);
  });
  it("and each reads straight back through the dispatcher", () => {
    expect(parseFeedInput(feedTemplateText()).ok).toBe(true);
    expect(parseRecordInput(recordTemplateText(), { today: TODAY }).ok).toBe(true);
  });
});
