import { test, expect } from "@playwright/test";

/**
 * Playground contract (owner commission 2026-07-13) — runs in BOTH modes
 * (dev + artifact) like every e2e contract. The real engine runs client-side,
 * so these tests exercise genuine in-browser verification, not a replay:
 * the sample run must show the committed golden's exact tally, and an edited
 * feed must produce a DIFFERENT result (the live-computation proof), and
 * garbage must produce an honest error, never a verdict.
 */

test("playground verifies the committed sample feed to the golden verdict", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/playground");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Verify a serving copy in your browser",
  );
  await page.getByRole("button", { name: "Load the sample feed" }).click();
  await page.getByRole("button", { name: "Verify this feed" }).click();
  const result = page.getByRole("region", { name: "Verification result" });
  await expect(result.getByText("FAIL", { exact: true })).toBeVisible();
  await expect(result.getByText(/16 findings — 11 error · 5 warn · 0 info/)).toBeVisible();
  // sample provenance framing (jargon-free: the reference result, recomputed live)
  await expect(result.getByText(/reference result/).first()).toBeVisible();
  // receipts render (rule ids from the golden)
  await expect(result.getByText("LST-EXIST-GHOST").first()).toBeVisible();
});

test("edited feeds yield engine-derived receipts for the edits — input-sensitivity evidence of live computation", async ({
  page,
}) => {
  // Batch-F P2 reconciliation: this test is input-sensitivity EVIDENCE, not an
  // impossibility proof — but the receipts it asserts embed values invented
  // HERE (a price and a title no fixture contains), so a canned replay would
  // have to contain this spec's own arbitrary inputs to pass. The byte-level
  // proof that the page runs the real engine is the golden-equality vitest
  // suite (playground-golden.test.ts).
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/playground");
  await page.getByRole("button", { name: "Load the sample feed" }).click();
  const result = page.getByRole("region", { name: "Verification result" });

  // Edit 1: plant an arbitrary price on the first row — the receipts must echo
  // it back as the asserted value on that row's price finding.
  const edit1 = await page.evaluate(() => {
    const ta = document.getElementById("pg-feed") as HTMLTextAreaElement;
    const feed = JSON.parse(ta.value);
    feed.items[0].price = "8642.31";
    return JSON.stringify(feed, null, 2);
  });
  await page.getByLabel("ACP feed JSON").fill(edit1);
  await page.getByRole("button", { name: "Verify this feed" }).click();
  await expect(result.getByText("FAIL", { exact: true })).toBeVisible();
  // The planted price replaces an existing price drift, so the TALLY stays the
  // golden's 16 — the live-computation evidence is the receipt echoing the
  // value invented in this spec, which no fixture contains.
  await expect(result.getByText(/8642\.31/).first()).toBeVisible();
  await expect(result.getByText(/Computed in your browser just now/)).toBeVisible();

  // Edit 2 (distinct shape): drop all rows but the first — the completeness
  // sweep must flag catalog rows the copy silently dropped, by name.
  const edit2 = await page.evaluate(() => {
    const ta = document.getElementById("pg-feed") as HTMLTextAreaElement;
    const feed = JSON.parse(ta.value);
    feed.items = feed.items.slice(0, 1);
    return JSON.stringify(feed, null, 2);
  });
  await page.getByLabel("ACP feed JSON").fill(edit2);
  await page.getByRole("button", { name: "Verify this feed" }).click();
  await expect(result.getByText("FAIL", { exact: true })).toBeVisible();
  // Dropping rows DOES change the tally — the golden's exact tally must be gone.
  await expect(result.getByText(/16 findings — 11 error · 5 warn · 0 info/)).toHaveCount(0);
  await expect(result.getByText(/missing from the serving copy/).first()).toBeVisible();
});

test("garbage input yields an honest error and no verdict", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/playground");
  await page.getByLabel("ACP feed JSON").fill("this is not a feed {{{");
  await page.getByRole("button", { name: "Verify this feed" }).click();
  // Scope to the playground's own alert — Next's route announcer is also role=alert.
  const alert = page.locator('div.pg-error[role="alert"]');
  await expect(alert).toContainText("No verdict.");
  await expect(alert).toContainText("Not valid JSON");
  await expect(page.getByRole("region", { name: "Verification result" })).toHaveCount(0);

  // batch-F P2 fix: a structurally broken row (null) must reach the SAME honest
  // error path, naming the row — never a crash, never a verdict.
  await page.getByLabel("ACP feed JSON").fill('{"items":[null]}');
  await page.getByRole("button", { name: "Verify this feed" }).click();
  await expect(alert).toContainText("No verdict.");
  await expect(alert).toContainText("items[0]");
  await expect(page.getByRole("region", { name: "Verification result" })).toHaveCount(0);
});
