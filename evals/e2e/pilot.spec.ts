import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * /pilot, RENDERED — the executive page in a real browser, both schemes
 * (Wave 2 exec-layer, 2026-10-31; plan § 12 S4 "axe 0 both schemes").
 *
 * AUTHORED, NOT RUN BY ITS AUTHOR: the lane's sandbox cannot launch Chromium
 * (mach-port bootstrap denied), so CI's real-browser battery adjudicates this
 * file. The built-HTML suite (evals/packs/pilot-page.test.ts) already holds
 * every data-pilot value equal to lib/landing/pilot-figures.ts; this spec adds
 * what only a browser can show: the page paints in both schemes, the figures a
 * reader SEES close their own arithmetic, the header nav does not grow, and axe
 * finds nothing in either scheme.
 *
 * No figure is typed here (the test-guide.spec idiom): the assumptions are read
 * off the rendered cells and the derived cells are recomputed from them.
 */

const fig = async (page: Page, key: string): Promise<string> =>
  ((await page.locator(`[data-pilot="${key}"]`).textContent()) ?? "").trim();
const n = (s: string): number => Number(s.replace(/[$,%\s]/g, ""));

for (const scheme of ["light", "dark"] as const) {
  test(`/pilot paints in the ${scheme} scheme and the header nav is unchanged`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce", colorScheme: scheme });
    await page.goto("/pilot");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("A pilot proposal, with the arithmetic attached.");
    // The page wears the /docs layer, whose element-scoped tokens carry their own dark branch.
    await expect
      .poll(() => page.evaluate(() => getComputedStyle(document.querySelector(".pilot-main")!).backgroundColor))
      .toBe(scheme === "dark" ? "rgb(22, 21, 15)" : "rgb(251, 250, 246)"); // --docs-bg #16150f / #fbfaf6
    // Outside the nav by design: the pinned five links, none of them /pilot.
    const nav = page.getByRole("navigation", { name: "Sections" });
    await expect(nav.getByRole("link")).toHaveCount(5);
    await expect(nav.locator('a[href="/pilot"]')).toHaveCount(0);
    // Desktop/tablet decision: no horizontal page scroll at 1280.
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  });

  test(`/pilot has zero WCAG A/AA violations in the ${scheme} scheme`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce", colorScheme: scheme });
    await page.goto("/pilot");
    await page.waitForLoadState("networkidle");
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
    expect(results.violations.map((v) => ({ id: v.id, nodes: v.nodes.length, help: v.help }))).toEqual([]);
  });
}

test("the figures a reader sees on /pilot close their own arithmetic", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/pilot");
  const stores = n(await fig(page, "assumption.stores"));
  const perDay = n(await fig(page, "assumption.ordersPerStorePerDay"));
  const days = n(await fig(page, "assumption.days"));
  const ratePct = n(await fig(page, "assumption.errorRateBp"));
  const sharePct = n(await fig(page, "assumption.menuShareBp"));
  const refund = n(await fig(page, "assumption.avgRefundCents"));
  const orders = stores * perDay * days;
  const drift = Math.round((orders * ratePct * sharePct) / 10000);
  expect(n(await fig(page, "derived.ordersPerMonth"))).toBe(orders);
  expect(n(await fig(page, "derived.driftErrorsPerMonth"))).toBe(drift);
  expect(n(await fig(page, "derived.refundExposureCents"))).toBe(drift * refund);
  await expect(page.getByText("No dollar figure on this page is a measurement.")).toBeVisible();
  // The library is read from the folders: the built count equals the BUILT rows shown.
  const built = n(await fig(page, "library.built"));
  await expect(page.locator('[data-pilot$=".state"]', { hasText: /^BUILT$/ })).toHaveCount(built);
});
