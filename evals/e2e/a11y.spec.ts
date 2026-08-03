import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * RV1 (owner review pick 2026-07-11): automated accessibility layer joining the
 * dual e2e contracts — runs in BOTH modes (dev + artifact) like every contract.
 * axe-core runs fully in-page (no network). Bar: zero WCAG 2.0/2.1 A+AA
 * violations across every served surface. This
 * complements — never replaces — the hand-written checks (keyboard toggles,
 * reduced-motion, contrast recomputes).
 */

// The product's whole surface: the four chapters plus the /docs reference. This
// list is the site — if a route is added, it joins the zero-violation bar here.
const SURFACES = ["/", "/report", "/fees", "/playground", "/proof", "/docs"] as const;

for (const path of SURFACES) {
  test(`axe: ${path} has zero WCAG A/AA violations`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    const summary = results.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      nodes: v.nodes.length,
      help: v.help,
    }));
    expect(summary, JSON.stringify(summary, null, 2)).toEqual([]);
  });
}

/**
 * DARK SCHEME (2026-08-02). A second scheme is a second set of contrast ratios,
 * and a design system that only proves the light half has proved half of itself.
 * Every dark value was computed before it was written; this is the independent
 * check that the values actually COMPOSITE the way the arithmetic said — alpha
 * hairlines over a lifted panel, text over a tinted ground, the lamp inks on
 * their own soft grounds.
 *
 * One caveat worth stating rather than discovering later: axe reports text over
 * a gradient or an image as INCOMPLETE, not as a violation. So the H1 gradient
 * phrase, the slab wash and the masthead gradients pass here silently and were
 * verified by computing each stop instead (DESIGN.md carries the numbers).
 */
for (const path of SURFACES) {
  test(`axe: ${path} has zero WCAG A/AA violations in DARK`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "dark" });
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    // Guard the guard: if the scheme did not actually apply, this suite would
    // pass by re-testing the light page under a different name.
    await expect
      .poll(() => page.evaluate(() => getComputedStyle(document.body).backgroundColor))
      .toBe("rgb(14, 16, 22)");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    const summary = results.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      nodes: v.nodes.length,
      help: v.help,
    }));
    expect(summary, JSON.stringify(summary, null, 2)).toEqual([]);
  });
}
