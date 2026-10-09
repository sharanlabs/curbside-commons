import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * THE ON-SITE GUIDE, WALKED — SC-1 of docs/plan-testable-instrument-2026-09-01.md.
 *
 * /docs#test-it tells a stranger what to click and what they will see. This
 * spec is that stranger: it reads the figures OFF THE RENDERED GUIDE (never
 * from a constant in this file), then goes to the front page and does exactly
 * what the guide says, and holds the slab to the guide's numbers. If the guide
 * and the instrument ever disagree, this is where it shows — in a browser, on
 * the built site, with no number typed here to paper over it.
 */

const FIX = join(process.cwd(), "fixtures", "synthetic-restaurant", "csv");

const run = (page: Page) => page.getByRole("button", { name: /^Run (the audit|the bundled pair|again)$/ }).click();
const slot = (page: Page, label: string) => page.locator(".wk-zone", { hasText: label });
const liveSlab = (page: Page) => page.locator('.wk-slab[data-live="true"]');

/** Read one "what you should see" block off the docs page as rendered. */
async function readGuide(page: Page, which: "bundled" | "edited") {
  const figs = page.locator(`.docs-expect .figs[data-guide="${which}"]`);
  await expect(figs).toBeVisible();
  const read = async (k: string) => (await figs.locator(`[data-k="${k}"]`).textContent())?.trim() ?? "";
  return { verdict: await read("verdict"), findings: await read("findings") };
}

test("the guide's bundled path: three clicks land on exactly the figures the guide shows", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/docs#test-it");

  // The section is a real anchor target with a heading of its own.
  const section = page.locator("section#test-it");
  await expect(section.getByRole("heading", { level: 2 })).toContainText("Run it yourself");
  const promised = await readGuide(page, "bundled");
  const figs = page.locator('.docs-expect .figs[data-guide="bundled"]');
  const errors = (await figs.locator('[data-k="errors"]').textContent())?.trim();
  const warnings = (await figs.locator('[data-k="warnings"]').textContent())?.trim();
  const rows = (await figs.locator('[data-k="rows"]').textContent())?.trim();
  expect(promised.findings, "the guide must promise a number").toMatch(/^\d+$/);

  // Step 1: the guide's own link to the front page.
  await section.getByRole("link", { name: /Open the front page/ }).click();
  await expect(page).toHaveURL(/\/#audit$/);
  // Step 2.
  await page.getByRole("button", { name: "Run the bundled pair" }).click();
  // Step 3: the slab reads what the guide said it would, figure for figure, in the slab's own order.
  const result = liveSlab(page);
  await expect(result.locator(".wk-verdict-word")).toHaveText(promised.verdict);
  await expect(result.locator(".wk-tally .wk-n")).toHaveText([promised.findings, errors!, warnings!, rows!]);
  await expect(result.locator(".wk-prov-line")).toContainText("bundled records");
});

test("the guide's spreadsheet path: the one edit it names moves the tally to exactly the figure it shows", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/docs#test-it");

  // Read the edit off the page: which row, from what, to what — and the outcome.
  const steps = page.locator('.docs-guide .path').nth(1);
  const row = Number((await steps.locator('[data-k="row"]').textContent())?.trim());
  const from = (await steps.locator('[data-k="price"]').textContent())?.trim() ?? "";
  const to = (await steps.locator('[data-k="new-price"]').textContent())?.trim() ?? "";
  const rule = (await steps.locator('[data-k="rule"]').textContent())?.trim() ?? "";
  const item = (await steps.locator('[data-k="item"]').textContent())?.trim() ?? "";
  const promised = await readGuide(page, "edited");
  const feedName = (await steps.locator("li").first().locator("code").first().textContent())?.trim() ?? "";
  const recordName = (await steps.locator("li").first().locator("code").nth(1).textContent())?.trim() ?? "";
  expect(row).toBeGreaterThan(1);
  expect(from).not.toBe(to);

  // Steps 1–3, as a tester with a spreadsheet app would end up: the committed
  // template bytes (proven equal to the download by spreadsheet.spec.ts), with
  // the named row's price cell changed and nothing else.
  const template = readFileSync(join(FIX, feedName), "utf8");
  const lines = template.split("\n");
  const cells = lines[row - 1].split(",");
  expect(cells[0], "the row the guide names is the item the guide names").toBe(item);
  expect(cells[3], "the row the guide names sells at the price the guide quotes").toBe(from);
  cells[3] = to;
  lines[row - 1] = cells.join(",");
  const edited = lines.join("\n");

  // Step 4.
  await page.goto("/");
  await slot(page, "The feed").locator('input[type="file"]').setInputFiles({
    name: feedName,
    mimeType: "text/csv",
    buffer: Buffer.from(edited, "utf8"),
  });
  await slot(page, "The record").locator('input[type="file"]').setInputFiles(join(FIX, recordName));
  await expect(slot(page, "The feed")).toContainText(/rows read from a spreadsheet/);
  // Step 5.
  await run(page);

  const result = liveSlab(page);
  await expect(result.locator(".wk-verdict-word")).toHaveText(promised.verdict);
  await expect(result.locator(".wk-tally .wk-n").first()).toHaveText(promised.findings);
  // The new finding is the rule on the item the guide named, quoting both prices.
  await result.locator("details.wk-all > summary").click();
  const line = result.locator(".wk-all-list > li", { hasText: item }).filter({ hasText: rule });
  await expect(line).toHaveCount(1);
  await expect(line).toContainText(to);
  await expect(line).toContainText(from);
});

test("the landing names the second door and points at the guide's anchor", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const hint = page.locator(".wk-sheet-hint");
  await expect(hint).toContainText("spreadsheet template");
  const link = hint.getByRole("link");
  await expect(link).toHaveAttribute("href", "/docs#test-it");
  await link.click();
  await expect(page).toHaveURL(/\/docs#test-it$/);
  await expect(page.locator("section#test-it")).toBeVisible();
});
