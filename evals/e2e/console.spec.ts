import { test, expect } from "@playwright/test";

test("Overview renders the queue with both human-in-the-loop outcomes visible", async ({ page }) => {
  // reduced-motion respected (the console has no motion, so it must render identically + settled)
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Activate stalled");
  await expect(page.getByRole("heading", { name: "Activation queue" })).toBeVisible();
  // both HITL outcomes are visible in the queue
  await expect(page.getByText("Held for review").first()).toBeVisible();
  await expect(page.getByText("Simulated sent").first()).toBeVisible();
});

test("a merchant opens its full why-chain end to end", async ({ page }) => {
  await page.goto("/");
  await page.locator("tbody a").first().click();
  await expect(page).toHaveURL(/\/merchant\/M\d{3}/);
  for (const section of [
    "Triage & diagnosis",
    "Drafted outreach",
    "Claims-gatekeeper",
    "Eval / quality",
    "Human-in-the-loop gate",
    "Audit trail",
  ]) {
    await expect(page.getByRole("heading", { name: section }).first()).toBeVisible();
  }
  // the domain-depth payoff is on the page
  await expect(page.getByText("Why they're stuck", { exact: false })).toBeVisible();
});

test("console nav reaches every surface; active link carries aria-current", async ({ page }) => {
  await page.goto("/");
  const surfaces: Array<[string, string]> = [
    ["Eval / Quality", "Eval / Quality"],
    ["Metrics", "Workflow metrics (simulated)"],
    ["Audit", "Audit Trail"],
    ["Cost", "Cost ledger"],
  ];
  for (const [navLabel, heading] of surfaces) {
    await page.getByRole("link", { name: navLabel, exact: true }).click();
    await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
    await expect(page.getByRole("link", { name: navLabel, exact: true })).toHaveAttribute(
      "aria-current",
      "page",
    );
  }
  // cost surface shows the honest $0.00 + the fail-closed cap
  await page.getByRole("link", { name: "Cost", exact: true }).click();
  await expect(page.getByText("$0.00").first()).toBeVisible();
});
