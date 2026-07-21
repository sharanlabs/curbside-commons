import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * RV1 (owner review pick 2026-07-11): automated accessibility layer joining the
 * dual e2e contracts — runs in BOTH modes (dev + artifact) like every contract.
 * axe-core runs fully in-page (no network). Bar: zero WCAG 2.0/2.1 A+AA
 * violations across the canonical v9 surfaces + the legacy module. This
 * complements — never replaces — the hand-written checks (keyboard toggles,
 * reduced-motion, contrast recomputes).
 */

// v9 takeover surface list (consolidated e2e rewrite, 2026-07-20): the four
// chapters + /docs + the /legacy archive landing + the legacy console. The
// retired /eval /metrics /cost /demo dashboards are now redirect stubs and drop
// off the zero-violation bar.
const SURFACES = [
  "/",
  "/report",
  "/fees",
  "/playground",
  "/proof",
  "/docs",
  "/legacy",
  "/legacy/console",
] as const;

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
