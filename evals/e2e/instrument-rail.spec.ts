import { test, expect } from "@playwright/test";

/**
 * SECTION RAIL contract (session-22 ③ — the D-2 instrument upgrade): each
 * data surface carries an "On this page" rail of REAL anchor links with a live
 * reading-position marker. The document becomes navigable instrumentation:
 * native anchors (no-JS functional), scroll-margin under the sticky chrome,
 * aria-current="location" tracking, visible focus. Desktop-only bar applies.
 */

const SURFACES = [
  { path: "/demo", links: 4 },
  { path: "/eval", links: 6 },
  { path: "/metrics", links: 3 },
  { path: "/cost", links: 3 },
] as const;

for (const s of SURFACES) {
  test(`section rail on ${s.path}: real anchors, live position marker`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(s.path);
    const rail = page.getByRole("navigation", { name: "On this page" });
    await expect(rail).toBeVisible();
    const links = rail.getByRole("link");
    await expect(links).toHaveCount(s.links);
    // Every rail entry is a same-page anchor to an element that exists.
    for (let i = 0; i < s.links; i++) {
      const href = await links.nth(i).getAttribute("href");
      expect(href, `rail link ${i} is a fragment`).toMatch(/^#./);
      await expect(page.locator(`[id="${href!.slice(1)}"]`)).toHaveCount(1);
    }
    // Navigating by the LAST anchor brings its section into the viewport and
    // the position marker follows (exactly one aria-current at any time).
    await links.last().click();
    const lastHref = (await links.last().getAttribute("href"))!;
    await expect(page.locator(`[id="${lastHref.slice(1)}"]`)).toBeInViewport();
    await expect(rail.locator('[aria-current="location"]')).toHaveCount(1);
    await expect(links.last()).toHaveAttribute("aria-current", "location");
  });
}
