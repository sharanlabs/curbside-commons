import { test, expect } from "@playwright/test";

/**
 * LEGACY WHY-CHAIN e2e contract (plan v3.3 S5 — the preserved activation
 * module under /legacy/**). Runs under BOTH configs (dev + artifact mode).
 * Ports the console/why-chain/skeleton halves of the retired console.spec.ts
 * to the /legacy/ routes (conscious contract rewrite, red-green 2026-07-11).
 */

test("legacy console renders the queue with both human-in-the-loop outcomes", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/legacy/console");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Activate stalled");
  await expect(page.getByRole("heading", { name: "Activation queue" })).toBeVisible();
  await expect(page.getByText("Held for review").first()).toBeVisible();
  await expect(page.getByText("Simulated sent").first()).toBeVisible();
});

test("a merchant opens its full why-chain end to end under /legacy/", async ({ page }) => {
  await page.goto("/legacy/console");
  await page.locator("tbody a").first().click();
  // 15s: dev mode compiles /legacy/merchant/[id] on first hit (artifact mode is instant).
  await expect(page).toHaveURL(/\/legacy\/merchant\/M\d{3}/, { timeout: 15_000 });
  for (const section of [
    "Triage & diagnosis",
    "Drafted outreach",
    "Claims-gatekeeper",
    "Domain quality check",
    "Eval / quality",
    "Human-in-the-loop gate",
    "Audit trail",
  ]) {
    await expect(page.getByRole("heading", { name: section }).first()).toBeVisible();
  }
  await expect(page.getByText("Why they're stuck", { exact: false })).toBeVisible();
});

test("the /legacy/ skeleton serves every moved surface under the provenance banner", async ({
  page,
}) => {
  // Handoff from the truth-engine dashboard into the moved surface
  await page.goto("/eval");
  await page.getByRole("link", { name: "/legacy/eval" }).click();
  await expect(page).toHaveURL(/\/legacy\/eval/);
  await expect(page.getByText("Legacy activation module", { exact: false }).first()).toBeVisible();
  await expect(page.getByRole("heading", { level: 1, name: "Eval / Quality" })).toBeVisible();
  // The provenance banner is not a footer — the root footer stays the only one.
  await expect(page.locator("footer")).toHaveCount(1);
  // The remaining moved surfaces resolve with their original H1s + the banner.
  const moved: Array<[string, string]> = [
    ["/legacy/metrics", "Workflow metrics (simulated)"],
    ["/legacy/cost", "Cost ledger"],
    ["/legacy/audit", "Audit Trail"],
  ];
  for (const [url, h1] of moved) {
    await page.goto(url);
    await expect(page.getByRole("heading", { level: 1, name: h1 })).toBeVisible();
    await expect(
      page.getByText("Legacy activation module", { exact: false }).first(),
    ).toBeVisible();
  }
  // legacy cost still shows the honest $0.00 replay ledger
  await expect(page.getByText("$0.00").first()).toBeVisible();
});
