import { test, expect } from "@playwright/test";

/**
 * CANONICAL-PRODUCT e2e contract (plan v3.3 S5 — the truth-engine surface).
 * Runs under BOTH configs: dev (playwright.config.ts) and artifact mode
 * (playwright.artifact.config.ts, static-serving a recorded out/). A behavior
 * that only holds in dev is a defect.
 *
 * Supersedes the landing/nav halves of the retired console.spec.ts (S5 landing
 * retell + canonical nav — conscious contract rewrite, red-green 2026-07-11).
 */

test("landing tells the truth-audit story: metadata, H1, the shown catch, the honesty footer", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page).toHaveTitle(/truth layer for agentic commerce/i);
  // the canonical H1 — the serving-copy-vs-records sentence
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "checks the serving copy, line by line",
  );
  // the shown catch is the COMMITTED golden (verdict + tally + a real finding)
  const catchPanel = page.getByRole("figure", {
    name: "Two findings from the committed demo verifier report",
  });
  await expect(catchPanel).toBeVisible();
  await expect(catchPanel).toContainText("FAIL");
  await expect(catchPanel).toContainText("16 findings · 11 error / 5 warn");
  await expect(catchPanel).toContainText("SIMULATED");
  // S2 semantic disclosure contract — scoped to the rendered footer
  const footer = page.locator("footer.site-footer");
  await expect(footer).toBeVisible();
  await expect(footer).toContainText(
    "Not affiliated with, endorsed by, or connected to DoorDash, Uber Eats, Grubhub, DataSF, or any named business.",
  );
  await expect(footer).toContainText("This site initiates no sends and makes no live calls");
  await expect(footer).toContainText("exactly one recorded, owner-armed send exists");
});

test("canonical nav = truth-engine surfaces + exactly one legacy link; every surface reachable", async ({
  page,
}) => {
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Primary" });
  // No legacy-product entries in the canonical set
  await expect(nav.getByRole("link", { name: "Console", exact: true })).toHaveCount(0);
  await expect(nav.getByRole("link", { name: "Audit", exact: true })).toHaveCount(0);
  // The canonical surfaces, each reachable with aria-current landing on it
  const surfaces: Array<[string, RegExp]> = [
    ["Report", /What the copy says/],
    ["Demo", /.+/],
    ["Eval evidence", /^Eval evidence$/],
    ["Measurables", /^Engine measurables$/],
    ["Cost", /^Cost & \$0 enforcement$/],
  ];
  for (const [label, h1] of surfaces) {
    await nav.getByRole("link", { name: label, exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 }).first()).toContainText(h1);
    await expect(nav.getByRole("link", { name: label, exact: true })).toHaveAttribute(
      "aria-current",
      "page",
    );
  }
  // Exactly one legacy entry, and it reaches the legacy module
  const legacyLink = nav.getByRole("link", { name: "Legacy activation", exact: true });
  await expect(legacyLink).toHaveCount(1);
  await legacyLink.click();
  await expect(page).toHaveURL(/\/legacy\/console/);
});

test("the eval dashboard renders earned labels with visible provenance", async ({ page }) => {
  await page.goto("/eval");
  await expect(
    page.getByText("calibrated (fresh held-out, pre-registered floors, one pass — 2026-07-09)"),
  ).toBeVisible();
  // the honest DEFER arc stays on the surface
  await expect(page.getByText("label DEFERRED", { exact: false }).first()).toBeVisible();
  // per-figure provenance lines render (file @ sha)
  await expect(
    page.getByText("docs/fee-classifier-recalibration-status.md", { exact: false }).first(),
  ).toBeVisible();
});

test("report surface toggle is keyboard-operable honest buttons (NEW-10)", async ({ page }) => {
  await page.goto("/report");
  const group = page.getByRole("group", { name: "Serving surface" });
  await expect(group).toBeVisible();
  await expect(page.locator('[role="tablist"], [role="tab"]')).toHaveCount(0);
  const buttons = group.getByRole("button");
  await expect(buttons.first()).toHaveAttribute("aria-pressed", "true");
  await expect(buttons.nth(1)).toHaveAttribute("aria-pressed", "false");
  await buttons.nth(1).focus();
  await page.keyboard.press("Enter");
  await expect(buttons.nth(1)).toHaveAttribute("aria-pressed", "true");
  await expect(buttons.first()).toHaveAttribute("aria-pressed", "false");
});

test("old root URLs carry the tested redirect policy to /legacy/**", async ({ page }) => {
  // The stubs meta-refresh (0s) to the moved surface — assert the landing spot.
  await page.goto("/console");
  await expect(page).toHaveURL(/\/legacy\/console/, { timeout: 10_000 });
  await expect(page.getByText("Legacy activation module", { exact: false }).first()).toBeVisible();
  await page.goto("/audit");
  await expect(page).toHaveURL(/\/legacy\/audit/, { timeout: 10_000 });
});
