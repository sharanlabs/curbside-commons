import { test, expect } from "@playwright/test";

/**
 * "How it works" contract — the demonstration bench (was "Chapter 03 · Try it
 * live"). Runs in BOTH modes (dev + artifact). The real engine runs
 * client-side, so these tests exercise genuine in-browser verification: the
 * reader-operated TryLiveBench presets recompute the committed feed live.
 *
 * The upload workbench that used to sit below moved to `/` on 2026-07-28 and
 * its contract moved with it, unaltered, to workbench.spec.ts.
 */

test("the how-it-works head states the deterministic, zero-cost, offline posture", async ({
  page,
}) => {
  await page.goto("/playground");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("The engine");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("shown on a sample");
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
  // The opening state is the recomputed reference result — the example tally.
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
