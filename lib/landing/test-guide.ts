import golden from "@/fixtures/synthetic-restaurant/expected-report.acp.json";
import {
  FEED_TEMPLATE_FILENAME,
  RECORD_TEMPLATE_FILENAME,
  SAMPLE_FEED,
  SOR_CATALOG,
  feedTemplateText,
} from "@/components/playground/verify-in-browser";
import { FEED_COLUMNS } from "@/lib/playground/csv-adapters";
import { parseCsv } from "@/lib/playground/csv";

/**
 * THE NUMBERS THE ON-SITE GUIDE PROMISES — derived, never typed
 * (S3 of docs/plan-testable-instrument-2026-09-01.md; SC-1 / SC-8).
 *
 * The /docs "Test it yourself" section tells a stranger what they will see
 * after each path: the tally for the bundled pair, and what one spreadsheet
 * edit does to it. A hand-typed number in that guide would be a claim about
 * the engine maintained by memory, and this repo has already paid for that
 * shape twice (a README test count and a "no network requests" sentence both
 * outlived the facts they described). So every figure is computed HERE from
 * the committed fixtures the site itself runs on, and the page renders the
 * fields of this object. `evals/packs/test-guide.test.ts` then holds three
 * things true: the figures equal a live engine run; the described edit
 * produces exactly the described outcome; and the two markdown guides that
 * must type the same numbers (they cannot import) agree with this object.
 *
 * Which fixtures: `expected-report.acp.json` is the golden the CLI, the tests
 * and the landing's opening slab all pin; `SAMPLE_FEED` / `SOR_CATALOG` are
 * the browser projections the inline doors load and the templates are
 * generated from. Same menu, three shapes; one set of numbers.
 */

type GoldenFinding = {
  readonly claim: { readonly id: string };
  readonly referenceRowId: string;
  readonly severity: string;
  readonly ruleId: string;
};

const findings = (golden as { readonly findings: readonly GoldenFinding[] }).findings;

/** The rule the guide's one-cell edit fires — the product's founding check. */
export const GUIDE_EDIT_RULE = "LST-PRICE-VALUE" as const;

/**
 * The one edit the guide asks a tester to make: the first row of the FEED
 * template that the golden has nothing to say about (no finding on the row's
 * id, on either side of a claim), sells at one price with no sale price and
 * is in stock — so a changed price can fire exactly one rule, and the tally
 * moves by exactly one. Row numbers are the spreadsheet's own: the header is
 * row 1, so the first data row is row 2 — computed from the template text the
 * download actually produces, not from an offset someone remembered.
 */
function deriveEdit() {
  const parsed = parseCsv(feedTemplateText());
  if (!parsed.ok) throw new Error(`the feed template does not parse: ${parsed.error}`);
  const col = (name: string) => FEED_COLUMNS.indexOf(name as (typeof FEED_COLUMNS)[number]);
  const idCol = col("item_id");
  const nameCol = col("name");
  const varCol = col("variation");
  const priceCol = col("price");
  const saleCol = col("sale_price");
  const availCol = col("availability");

  const touched = new Set<string>();
  for (const f of findings) {
    touched.add(f.claim.id.split("#")[0]);
    touched.add(f.referenceRowId);
  }

  const row = parsed.rows.slice(1).find((r) => {
    const cells = r.cells;
    return (
      !touched.has(cells[idCol]) &&
      cells[saleCol] === "" &&
      cells[availCol] === "in stock" &&
      /^\d+\.\d{2}$/.test(cells[priceCol])
    );
  });
  if (!row) throw new Error("no clean, single-price, in-stock row exists in the feed template to point a tester at");

  const price = row.cells[priceCol];
  // One dollar more: unmistakably a different number, still a plausible menu price.
  const newPrice = (Math.round(Number(price) * 100) / 100 + 1).toFixed(2);

  return {
    /** The row as the spreadsheet app numbers it (header = row 1). */
    spreadsheetRow: row.line,
    itemId: row.cells[idCol],
    name: row.cells[nameCol],
    variation: row.cells[varCol],
    price,
    newPrice,
  } as const;
}

export const GUIDE = {
  /** The tally the slab shows after "Run the bundled pair" — findings · errors · warnings · rows read. */
  bundled: {
    verdict: "FAIL" as const,
    findings: findings.length,
    errors: findings.filter((f) => f.severity === "error").length,
    warnings: findings.filter((f) => f.severity === "warn").length,
    /** The slab's "Rows read" is the feed's row count. */
    rowsRead: SAMPLE_FEED.items.length,
    recordItems: SOR_CATALOG.items.length,
  },
  templates: {
    feed: FEED_TEMPLATE_FILENAME,
    record: RECORD_TEMPLATE_FILENAME,
  },
  edit: deriveEdit(),
  /** After the one edit: the bundled tally plus exactly one finding, of this rule, on that row. */
  afterEdit: {
    findings: findings.length + 1,
    ruleId: GUIDE_EDIT_RULE,
  },
} as const;
