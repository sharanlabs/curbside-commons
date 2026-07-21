import { test, expect } from "@playwright/test";

/**
 * Chapter 03 · Try it live contract — the v9 takeover surface (consolidated e2e
 * rewrite, 2026-07-20). Runs in BOTH modes (dev + artifact). The real engine
 * runs client-side, so these tests exercise genuine in-browser verification:
 * the reader-operated TryLiveBench presets recompute the committed feed live,
 * and the paste leg below takes a whole feed of your own — an edited feed
 * produces a DIFFERENT result (the live-computation proof), and garbage produces
 * an honest error, never a verdict.
 *
 * Two selectors that could collide are disambiguated: the bench preset card
 * "Load the committed feed" carries extra text, so the paste-leg button is
 * matched with { exact: true }.
 */

test("the try-it-live head states the deterministic, zero-cost, offline posture", async ({
  page,
}) => {
  await page.goto("/playground");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Verify a feed");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("in your browser");
  const chips = page.locator(".p2-chips");
  for (const chip of ["DETERMINISTIC", "NO AI CALLS", "$0 TO RUN", "NO NETWORK REQUESTS"]) {
    await expect(chips.getByText(chip, { exact: true })).toBeVisible();
  }
});

test("the reader-operated bench recomputes the committed feed live; edits move the tally", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/playground");
  const presets = page.getByRole("group", { name: "Bench presets" });
  await expect(presets.getByRole("button")).toHaveCount(4);

  const vpanel = page.locator(".bench3 .vpanel");
  // The opening state is the recomputed reference result — the chapter 01 tally.
  await expect(vpanel.locator(".vstamp")).toContainText("FAIL");
  await expect(vpanel.locator(".vtally")).toContainText("16 findings — 11 error · 5 warn · 0 info");
  await expect(page.locator(".bench3 ~ .pb-bar .pb-line")).toContainText("16 FINDINGS");

  // Serve a ghost row the catalog never had — one new finding on top of the feed's own.
  await presets.getByRole("button", { name: /Serve an item the catalog never had/ }).click();
  await expect(vpanel.locator(".vstamp")).toContainText("FAIL");
  await expect(vpanel.locator(".vtally")).toContainText("17 findings");
  await expect(vpanel).toContainText(/\+1 finding · −0/i);

  // Edit one served price to the true value — that line clears, the tally drops
  // by one (the feed's other findings remain, so the verdict stays FAIL).
  await presets.getByRole("button", { name: /Edit one served price yourself/ }).click();
  await page.getByRole("button", { name: /the true price/ }).click();
  await expect(vpanel.locator(".vtally")).toContainText("15 findings");
  await expect(vpanel).toContainText(/\+0 findings · −1/i);
});

/* ===================== THE PASTE LEG (real engine) ==================== */

test("the paste leg verifies the committed sample feed to the golden verdict", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/playground");
  // The paste-leg "Load" button — exact name excludes the bench preset card.
  await page.getByRole("button", { name: "Load the committed feed", exact: true }).click();
  await page.getByRole("button", { name: "Verify this feed" }).click();
  const result = page.getByRole("region", { name: "Verification result" });
  await expect(result.getByText("FAIL", { exact: true })).toBeVisible();
  await expect(result.getByText(/16 findings — 11 error · 5 warn · 0 info/)).toBeVisible();
  await expect(result.getByText(/reference result/).first()).toBeVisible();
  await expect(result.getByText("LST-EXIST-GHOST").first()).toBeVisible();
});

test("edited feeds yield engine-derived receipts — input-sensitivity evidence of live computation", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/playground");
  await page.getByRole("button", { name: "Load the committed feed", exact: true }).click();
  const result = page.getByRole("region", { name: "Verification result" });

  // Edit 1: plant an arbitrary price on the first row — the receipts must echo it back.
  const edit1 = await page.evaluate(() => {
    const ta = document.getElementById("pg-feed") as HTMLTextAreaElement;
    const feed = JSON.parse(ta.value);
    feed.items[0].price = "8642.31";
    return JSON.stringify(feed, null, 2);
  });
  await page.getByLabel("ACP feed JSON").fill(edit1);
  await page.getByRole("button", { name: "Verify this feed" }).click();
  await expect(result.getByText("FAIL", { exact: true })).toBeVisible();
  await expect(result.getByText(/8642\.31/).first()).toBeVisible();
  await expect(result.getByText(/Computed in your browser just now/)).toBeVisible();

  // Edit 2: drop all rows but the first — the completeness sweep flags dropped rows.
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
  await expect(result.getByText(/missing from the feed/).first()).toBeVisible();
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

  // A structurally broken row (null) reaches the SAME honest error path, naming the row.
  await page.getByLabel("ACP feed JSON").fill('{"items":[null]}');
  await page.getByRole("button", { name: "Verify this feed" }).click();
  await expect(alert).toContainText("No verdict.");
  await expect(alert).toContainText("items[0]");
  await expect(page.getByRole("region", { name: "Verification result" })).toHaveCount(0);
});
