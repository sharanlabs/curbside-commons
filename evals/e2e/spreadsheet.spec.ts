import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * THE SPREADSHEET DOOR, rendered — S2 of docs/plan-testable-instrument-2026-09-01.md.
 *
 * The bring-your-own-data path a stranger uses: download the template, edit a
 * cell in a spreadsheet app, drop the file back. These tests drive the real
 * file input with the committed template bytes (and with an edited copy), so
 * the whole path — picker → FileReader → content dispatch → CSV adapter → the
 * same engine → the slab — runs in a real browser. Nothing is mocked and no
 * expected number is typed by hand: the tally the CSV pair must produce is the
 * golden's own (16 / 11 / 5), which the JSON pair already pins in
 * workbench.spec.ts, so the two doors are held to the same verdict.
 */

const FIX = join(process.cwd(), "fixtures", "synthetic-restaurant", "csv");
const FEED_CSV = join(FIX, "menu-as-published.csv");
const RECORD_CSV = join(FIX, "menu-record.csv");

const run = (page: import("@playwright/test").Page) =>
  page.getByRole("button", { name: /^Run (the audit|the bundled pair|again)$/ }).click();

const slot = (page: import("@playwright/test").Page, label: string) =>
  page.locator(".wk-zone", { hasText: label });

const liveSlab = (page: import("@playwright/test").Page) => page.locator('.wk-slab[data-live="true"]');

test("the two spreadsheet templates, dropped in, reproduce the bundled pair's verdict", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  await slot(page, "The feed").locator('input[type="file"]').setInputFiles(FEED_CSV);
  await slot(page, "The record").locator('input[type="file"]').setInputFiles(RECORD_CSV);

  // The slot says which door was used — the file name alone is easy to misread.
  await expect(slot(page, "The feed")).toContainText("menu-as-published.csv");
  await expect(slot(page, "The feed")).toContainText(/25 rows read from a spreadsheet/);
  await expect(slot(page, "The record")).toContainText(/12 items read from a spreadsheet/);

  await run(page);
  const result = liveSlab(page);
  await expect(result.locator(".wk-verdict-word")).toHaveText("FAIL");
  const tally = result.locator(".wk-tally");
  await expect(tally).toContainText("16");
  await expect(tally).toContainText("11");
  await expect(tally).toContainText("5");
  await expect(result.locator(".wk-all-list > li")).toHaveCount(16);
  // Provenance is the ACTION: both sides came from the reader's files.
  await expect(result.locator(".wk-prov")).toContainText("feed side: your upload");
  await expect(result.locator(".wk-prov")).toContainText("record side: your upload");
  await expect(result.locator(".wk-prov-line")).toContainText("of your own records");
  // The record carried its own as_of column, so no drop-day sentence appears.
  await expect(result.locator(".wk-prov-line")).not.toContainText("dated");
});

test("editing one cell in the spreadsheet moves the verdict — the value is read, not the file name", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  // Start from a spreadsheet pair that AGREES (the record template on both
  // sides is not a feed; instead take the published template and fix its
  // planted drift by replacing the feed with a faithful rendering of the record).
  const record = readFileSync(RECORD_CSV, "utf8");
  const faithfulFeed = faithfulFeedFrom(record);
  const edited = faithfulFeed.replace(/^(item-006-v1,[^,]*,[^,]*,)10\.00,/m, (_m, lead: string) => `${lead}8642.31,`);
  expect(edited, "the edit must have landed on exactly one row").not.toBe(faithfulFeed);

  await slot(page, "The feed").locator('input[type="file"]').setInputFiles({
    name: "my-menu.csv",
    mimeType: "text/csv",
    buffer: Buffer.from(edited, "utf8"),
  });
  await slot(page, "The record").locator('input[type="file"]').setInputFiles(RECORD_CSV);
  await run(page);

  const result = liveSlab(page);
  await expect(result.locator(".wk-verdict-word")).toHaveText("FAIL");
  // Exactly the one edit is caught, and the planted value is echoed back. One
  // finding renders as one receipt card (the "all findings" fold appears only
  // when there are more findings than receipts), so the receipt is the tooth.
  await expect(result.locator(".wk-receipt")).toHaveCount(1);
  await expect(result.locator(".wk-all")).toHaveCount(0);
  await expect(result.locator(".wk-receipt")).toContainText("LST-PRICE-VALUE");
  await expect(result.locator(".wk-receipt").getByText(/8642\.31/).first()).toBeVisible();
});

test("a record spreadsheet with no as_of column is dated the drop-day — and the slab says so", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  const record = readFileSync(RECORD_CSV, "utf8");
  // Drop the as_of column entirely (header and every row).
  const noAsOf = record
    .split("\n")
    .map((line) => (line ? line.split(",").filter((_, i) => i !== 5).join(",") : line))
    .join("\n");
  expect(noAsOf.split("\n")[0]).toBe("item_id,name,variation,price,stock,group");

  await slot(page, "The feed").locator('input[type="file"]').setInputFiles({
    name: "menu.csv",
    mimeType: "text/csv",
    buffer: Buffer.from(faithfulFeedFrom(record), "utf8"),
  });
  await slot(page, "The record").locator('input[type="file"]').setInputFiles({
    name: "record.csv",
    mimeType: "text/csv",
    buffer: Buffer.from(noAsOf, "utf8"),
  });
  await run(page);

  const result = liveSlab(page);
  await expect(result.locator(".wk-verdict-word")).toHaveText("PASS");
  const line = result.locator(".wk-prov-line");
  await expect(line).toContainText("carried no as_of date");
  await expect(line).toContainText("the day you dropped it");
  // The date shown is today's, in the browser's UTC day — the shape, not a literal.
  await expect(line.locator("time")).toHaveAttribute("datetime", /^\d{4}-\d{2}-\d{2}T00:00:00Z$/);
});

test("a spreadsheet the engine cannot index is refused by row, with no verdict", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  const bad = "item_id,name,variation,price\nsku-1,Burger,,9.00\nsku-1,Burger,,9.00\n";
  await slot(page, "The feed").locator('input[type="file"]').setInputFiles({
    name: "dup.csv",
    mimeType: "text/csv",
    buffer: Buffer.from(bad, "utf8"),
  });
  // The refusal is shown beside the slot BEFORE any run …
  await expect(slot(page, "The feed").locator(".fd-status.error")).toContainText('Row 3 (item_id "sku-1")');
  // … and the run itself yields no verdict.
  await run(page);
  const alert = page.locator('div.wb-error[role="alert"]');
  await expect(alert).toContainText("No verdict.");
  await expect(alert).toContainText("repeats an item_id");
  await expect(liveSlab(page)).toHaveCount(0);
});

test("the spreadsheet templates can be downloaded, and they are the committed bytes", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  for (const [label, fileName, path] of [
    ["The feed", "menu-as-published.csv", FEED_CSV],
    ["The record", "menu-record.csv", RECORD_CSV],
  ] as const) {
    const s = slot(page, label);
    await s.locator("details.wk-paste > summary").click();
    await expect(s.locator("details.wk-paste")).toHaveAttribute("open", "");
    const dlBtn = s.getByRole("button", { name: /download the spreadsheet template/i });
    await dlBtn.evaluate((el) => el.scrollIntoView({ block: "center" }));
    const [download] = await Promise.all([page.waitForEvent("download"), dlBtn.click()]);
    expect(download.suggestedFilename()).toBe(fileName);
    const stream = await download.createReadStream();
    const chunks: Buffer[] = [];
    for await (const c of stream) chunks.push(c as Buffer);
    expect(Buffer.concat(chunks).toString("utf8"), `${fileName} must be the committed template`).toBe(
      readFileSync(path, "utf8"),
    );
  }
});

/**
 * A feed spreadsheet that agrees with a record spreadsheet in every field the
 * engine reads — built from the record itself so the pair cannot drift apart.
 * Mirrors the engine's own faithful-feed convention: hidden rows are not
 * published; sold-out rows are published "out of stock"; the published name is
 * "Name (Variation)" when the item has more than one variation, else "Name".
 */
function faithfulFeedFrom(recordCsv: string): string {
  const [header, ...rows] = recordCsv.trim().split("\n");
  expect(header).toBe("item_id,name,variation,price,stock,as_of,group");
  const parsed = rows.map((r) => r.split(","));
  const perGroup = new Map<string, number>();
  for (const [, , , , , , group] of parsed) perGroup.set(group, (perGroup.get(group) ?? 0) + 1);
  const out = ["item_id,name,variation,price,sale_price,currency,availability,available_from,expires,searchable,buyable,group"];
  for (const [id, name, variation, price, stock, , group] of parsed) {
    if (stock === "hidden") continue;
    const title = (perGroup.get(group) ?? 1) > 1 ? `${name} (${variation})` : name;
    const availability = stock === "sold out" ? "out of stock" : "in stock";
    out.push([id, title, variation, price, "", "USD", availability, "", "", "yes", "yes", group].join(","));
  }
  return out.join("\n") + "\n";
}
