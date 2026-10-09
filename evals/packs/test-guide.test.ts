import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { GUIDE, GUIDE_EDIT_RULE } from "@/lib/landing/test-guide.ts";
import {
  SAMPLE_FEED,
  SOR_CATALOG,
  feedTemplateText,
  recordTemplateText,
  verifyAcpFeed,
} from "@/components/playground/verify-in-browser.ts";
import { FEED_COLUMNS, feedFromCsv, recordFromCsv } from "@/lib/playground/csv-adapters.ts";
import { parseCsv, toCsv } from "@/lib/playground/csv.ts";
import type { VerifierReport } from "@/lib/verifier-core/report.ts";

/**
 * THE ON-SITE GUIDE CANNOT DRIFT FROM THE ENGINE — S3, SC-1 / SC-8 of
 * docs/plan-testable-instrument-2026-09-01.md.
 *
 * /docs tells a stranger what they will see. Those sentences are claims about
 * the engine, and this file is what makes them true rather than remembered:
 *
 *  DERIVED   the guide's figures equal a LIVE engine run over the same bundled
 *            pair the page's "Run the bundled pair" loads — not just the golden
 *            file they were read from. Two independent sources, one number.
 *  THE EDIT  the one cell the guide asks a tester to change produces exactly
 *            the outcome the guide promises: the bundled tally plus one finding,
 *            of the named rule, on the named row, quoting both prices — and
 *            changing it back returns the tally. Proven through the same
 *            adapters the slot uses, on the template bytes the download saves.
 *  RENDERED  app/docs/page.tsx renders the derived object and types none of its
 *            numbers; the landing's affordance line targets an anchor the docs
 *            page actually has.
 *  MARKDOWN  docs/how-to-test.md and README.md cannot import a module, so they
 *            type the figures — in ONE recognisable phrase this test extracts
 *            and compares. A stale number there is a red test, not a style note.
 *  REGISTER  the guide section carries no "sample"/"demo" captioning (owner,
 *            2026-07-31) and states desktop/tablet as a decision (owner,
 *            2026-09-01).
 */

const ROOT = process.cwd();
const readRepo = (rel: string): string => readFileSync(join(ROOT, rel), "utf8");

const TODAY = "2026-09-03T12:00:00.000Z";
const READER = { feed: "reader", catalog: "reader" } as const;

/** Findings as a comparable set: claim id + rule. */
const keys = (r: VerifierReport): string[] => r.findings.map((f) => `${f.claim.id}|${f.ruleId}`).sort();

function verdictOfCsvPair(feedCsv: string, recordCsv: string): VerifierReport {
  const f = feedFromCsv(feedCsv);
  const r = recordFromCsv(recordCsv, { today: TODAY });
  if (!f.ok) throw new Error(`feed refused: ${f.error}`);
  if (!r.ok) throw new Error(`record refused: ${r.error}`);
  return verifyAcpFeed(f.feed, r.catalog, READER);
}

/**
 * Apply the guide's edit exactly as a tester would: that spreadsheet row, the
 * price cell. `from` is what the cell must hold before the edit — the template
 * price on the way out, the edited price on the way back.
 */
function applyGuideEdit(feedCsv: string, from: string, to: string): string {
  const parsed = parseCsv(feedCsv);
  if (!parsed.ok) throw new Error(parsed.error);
  const priceCol = FEED_COLUMNS.indexOf("price");
  const idCol = FEED_COLUMNS.indexOf("item_id");
  const rows = parsed.rows.map((r) => {
    if (r.line !== GUIDE.edit.spreadsheetRow) return [...r.cells];
    // The row the guide names must BE the item it names — the number a tester
    // reads off the spreadsheet and the id the finding will quote agree.
    expect(r.cells[idCol]).toBe(GUIDE.edit.itemId);
    expect(r.cells[priceCol]).toBe(from);
    const cells = [...r.cells];
    cells[priceCol] = to;
    return cells;
  });
  return toCsv(rows);
}

// ---------------------------------------------------------------------------

describe("DERIVED — the guide's figures are the engine's, measured live", () => {
  const live = verifyAcpFeed(SAMPLE_FEED, SOR_CATALOG);

  it("bundled tally: findings / errors / warnings / rows read equal a live run of the bundled pair", () => {
    expect(live.ok).toBe(false);
    expect(GUIDE.bundled.verdict).toBe("FAIL");
    expect(GUIDE.bundled.findings).toBe(live.findings.length);
    expect(GUIDE.bundled.errors).toBe(live.findings.filter((f) => f.severity === "error").length);
    expect(GUIDE.bundled.warnings).toBe(live.findings.filter((f) => f.severity === "warn").length);
    expect(GUIDE.bundled.rowsRead).toBe(SAMPLE_FEED.items.length);
    expect(GUIDE.bundled.recordItems).toBe(SOR_CATALOG.items.length);
    // The arithmetic the slab shows must close: every finding is an error or a warning.
    expect(GUIDE.bundled.errors + GUIDE.bundled.warnings).toBe(GUIDE.bundled.findings);
  });

  it("the figures are not degenerate — the guide promises a FAIL with something to look at", () => {
    expect(GUIDE.bundled.findings).toBeGreaterThan(1);
    expect(GUIDE.bundled.errors).toBeGreaterThan(0);
    expect(GUIDE.bundled.rowsRead).toBeGreaterThan(0);
  });

  it("the two template names the guide prints are the names the download saves", () => {
    expect(GUIDE.templates.feed).toBe("menu-as-published.csv");
    expect(GUIDE.templates.record).toBe("menu-record.csv");
  });
});

describe("THE EDIT — the one cell the guide names does exactly what the guide says", () => {
  const feedCsv = feedTemplateText();
  const recordCsv = recordTemplateText();

  it("the named row is one the bundled verdict has nothing to say about", () => {
    const base = verdictOfCsvPair(feedCsv, recordCsv);
    const touched = base.findings.some(
      (f) => f.claim.id.startsWith(`${GUIDE.edit.itemId}#`) || f.referenceRowId === GUIDE.edit.itemId,
    );
    expect(touched, `${GUIDE.edit.itemId} already has a finding — an edit there could not move the tally by one`).toBe(
      false,
    );
    expect(GUIDE.edit.newPrice).not.toBe(GUIDE.edit.price);
  });

  it("changing that price → the bundled tally plus exactly one finding, of the named rule, on that row, quoting both prices", () => {
    const base = verdictOfCsvPair(feedCsv, recordCsv);
    // The unedited templates reproduce the bundled tally (the round-trip
    // csv-adapters.test.ts proves finding-for-finding; here the COUNT is what
    // the guide states, so it is asserted where the guide's sentence is made).
    expect(base.findings.length).toBe(GUIDE.bundled.findings);

    const edited = verdictOfCsvPair(applyGuideEdit(feedCsv, GUIDE.edit.price, GUIDE.edit.newPrice), recordCsv);
    expect(edited.findings.length).toBe(GUIDE.afterEdit.findings);
    expect(GUIDE.afterEdit.findings).toBe(GUIDE.bundled.findings + 1);

    const added = keys(edited).filter((k) => !keys(base).includes(k));
    const removed = keys(base).filter((k) => !keys(edited).includes(k));
    expect(removed).toEqual([]);
    expect(added).toEqual([`${GUIDE.edit.itemId}#price.amount|${GUIDE_EDIT_RULE}`]);
    expect(GUIDE.afterEdit.ruleId).toBe(GUIDE_EDIT_RULE);

    const finding = edited.findings.find((f) => f.ruleId === GUIDE_EDIT_RULE && f.claim.id.startsWith(GUIDE.edit.itemId));
    expect(finding).toBeDefined();
    // The receipt quotes what was published and what the record says — both
    // prices a tester just looked at. `plainLine` is the sentence the slab shows.
    expect(finding!.plainLine).toContain(GUIDE.edit.newPrice);
    expect(finding!.plainLine).toContain(GUIDE.edit.price);
  });

  it("changing it back returns the bundled tally — the guide's last sentence", () => {
    const out = applyGuideEdit(feedCsv, GUIDE.edit.price, GUIDE.edit.newPrice);
    const back = applyGuideEdit(out, GUIDE.edit.newPrice, GUIDE.edit.price);
    // The writer is canonical, so undoing the edit restores the template byte-for-byte.
    expect(back).toBe(feedCsv);
    expect(verdictOfCsvPair(back, recordCsv).findings.length).toBe(GUIDE.bundled.findings);
  });
});

describe("RENDERED — the docs page derives, the landing points at an anchor that exists", () => {
  const docsSrc = readRepo("app/docs/page.tsx");
  const benchSrc = readRepo("components/playground/AuditWorkbench.tsx");

  /** The guide section's source, between its banner and the next section's. */
  function guideSection(): string {
    const start = docsSrc.indexOf("===== TEST IT YOURSELF =====");
    const end = docsSrc.indexOf("===== ARCHITECTURE =====");
    expect(start, "the TEST IT YOURSELF section banner is missing from app/docs/page.tsx").toBeGreaterThan(-1);
    expect(end).toBeGreaterThan(start);
    return docsSrc.slice(start, end);
  }

  it("the page imports the derived object and renders its fields", () => {
    expect(docsSrc).toMatch(/import \{ GUIDE \} from "@\/lib\/landing\/test-guide"/);
    for (const field of [
      "GUIDE.bundled.findings",
      "GUIDE.bundled.errors",
      "GUIDE.bundled.warnings",
      "GUIDE.bundled.rowsRead",
      "GUIDE.edit.spreadsheetRow",
      "GUIDE.edit.price",
      "GUIDE.edit.newPrice",
      "GUIDE.afterEdit.findings",
      "GUIDE.afterEdit.ruleId",
      "GUIDE.templates.feed",
      "GUIDE.templates.record",
    ]) {
      expect(guideSection(), `the guide section does not render ${field}`).toContain(field);
    }
  });

  it("no guide figure is typed by hand in the section", () => {
    const section = guideSection();
    const figures = [
      GUIDE.bundled.findings,
      GUIDE.bundled.errors,
      GUIDE.bundled.warnings,
      GUIDE.bundled.rowsRead,
      GUIDE.afterEdit.findings,
      GUIDE.edit.spreadsheetRow,
    ];
    for (const n of figures) {
      // A bare figure inside JSX text (between a `>` or a space and `<`/space/punct)
      // is the shape a hand-typed number takes. Attribute values and expressions
      // are excluded by construction: they carry `GUIDE.` instead.
      const typed = new RegExp(`(^|[>\\s(])${n}(?=[\\s<.,;:)])`, "m");
      expect(typed.test(section), `the figure ${n} appears typed in the guide section`).toBe(false);
    }
    expect(section).not.toMatch(/\b(19|20)\.00\b/);
    expect(section).not.toMatch(/item-\d{3}-v\d/);
  });

  it("the landing's affordance line targets the docs section's anchor, and the anchor exists", () => {
    const m = benchSrc.match(/href="\/docs#([a-z0-9-]+)"/);
    expect(m, "AuditWorkbench carries no link into the /docs guide").not.toBeNull();
    const anchor = m![1];
    expect(docsSrc).toContain(`id="${anchor}"`);
    expect(benchSrc).toMatch(/spreadsheet template/i);
  });

  it("REGISTER — no example/sample/demo captioning, and desktop/tablet stated as a decision", () => {
    const section = guideSection();
    expect(section).not.toMatch(/\b(sample|demo|example)s?\b/i);
    expect(section).toMatch(/desktop and tablet/i);
    expect(section).toMatch(/by decision/i);
  });
});

describe("MARKDOWN — the two guides that must type the figures agree with the derived ones", () => {
  // ONE phrase, one regex. Both files write the tally as
  // "<n> findings — <e> errors, <w> warnings"; anything else is a drift.
  const TALLY = /(\d+) findings — (\d+) errors, (\d+) warnings/g;
  // "edit row 11 — Margherita Pizza (Small) — which sells at 19.00; make it 20.00"
  const EDIT = /row (\d+) — (.+?) — .*?(\d+\.\d{2})\b.*?\b(\d+\.\d{2})\b/;
  const AFTER = /(\d+) findings — the (\d+) above plus one/;

  for (const file of ["docs/how-to-test.md", "README.md"]) {
    it(`${file}: the tally phrase is present and equals the derived figures`, () => {
      const text = readRepo(file);
      const hits = [...text.matchAll(TALLY)];
      expect(hits.length, `${file} has no "<n> findings — <e> errors, <w> warnings" phrase`).toBeGreaterThan(0);
      for (const h of hits) {
        expect([Number(h[1]), Number(h[2]), Number(h[3])]).toEqual([
          GUIDE.bundled.findings,
          GUIDE.bundled.errors,
          GUIDE.bundled.warnings,
        ]);
      }
    });
  }

  it("docs/how-to-test.md: the spreadsheet edit it describes is the derived one, with its outcome", () => {
    // Markdown wraps at ~90 columns; the phrases are matched on the unwrapped text.
    const text = readRepo("docs/how-to-test.md").replace(/\s+/g, " ");
    const m = text.match(EDIT);
    expect(m, "how-to-test.md does not describe the guide's row edit").not.toBeNull();
    expect(Number(m![1])).toBe(GUIDE.edit.spreadsheetRow);
    expect(m![2]).toBe(GUIDE.edit.name);
    expect(m![3]).toBe(GUIDE.edit.price);
    expect(m![4]).toBe(GUIDE.edit.newPrice);
    const a = text.match(AFTER);
    expect(a, 'how-to-test.md lacks the "<n> findings — the <m> above plus one" outcome').not.toBeNull();
    expect(Number(a![1])).toBe(GUIDE.afterEdit.findings);
    expect(Number(a![2])).toBe(GUIDE.bundled.findings);
    expect(text).toContain(GUIDE.afterEdit.ruleId);
    expect(text).toContain(GUIDE.templates.feed);
    expect(text).toContain(GUIDE.templates.record);
  });

  it("README names the spreadsheet path on the live site with both template names", () => {
    const readme = readRepo("README.md");
    expect(readme).toContain(GUIDE.templates.feed);
    expect(readme).toContain(GUIDE.templates.record);
    expect(readme).toMatch(/Download the spreadsheet template/);
  });
});
