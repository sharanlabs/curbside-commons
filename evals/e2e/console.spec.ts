import { test, expect } from "@playwright/test";

test("Landing renders the arc: honest H1, the shown catch, and the honesty footer", async ({
  page,
}) => {
  // reduced-motion forced: the landing must render fully settled (the catch resolved in SSR DOM)
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  // the FIXED honest headline — asserted on a single text node (not the styled span)
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "nothing reaches a merchant",
  );
  // the shown catch / verification is visible and settled (verdict + the held banner)
  await expect(page.getByText("not in the data").first()).toBeVisible();
  await expect(page.getByText("Held for a person to approve.").first()).toBeVisible();
  // S2 semantic disclosure contract (decision-log 2026-07-10 freeze-reversal row):
  // scoped to the RENDERED FOOTER (batch-A Codex P2 — a page-global match could
  // be satisfied from outside the footer), asserting the complete sentences.
  const footer = page.locator("footer.site-footer");
  await expect(footer).toBeVisible();
  await expect(footer).toContainText(
    "Not affiliated with, endorsed by, or connected to DoorDash, Uber Eats, Grubhub, DataSF, or any named business.",
  );
  await expect(footer).toContainText("This site initiates no sends and makes no live calls");
  await expect(footer).toContainText("exactly one recorded, owner-armed send exists");
});

test("Console renders the queue with both human-in-the-loop outcomes visible", async ({ page }) => {
  // reduced-motion respected (the console has no motion, so it must render identically + settled)
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/console");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Activate stalled");
  await expect(page.getByRole("heading", { name: "Activation queue" })).toBeVisible();
  // both HITL outcomes are visible in the queue
  await expect(page.getByText("Held for review").first()).toBeVisible();
  await expect(page.getByText("Simulated sent").first()).toBeVisible();
});

test("a merchant opens its full why-chain end to end", async ({ page }) => {
  await page.goto("/console");
  await page.locator("tbody a").first().click();
  await expect(page).toHaveURL(/\/merchant\/M\d{3}/);
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
  // the domain-depth payoff is on the page
  await expect(page.getByText("Why they're stuck", { exact: false })).toBeVisible();
});

test("console nav reaches every surface; active link carries aria-current", async ({ page }) => {
  await page.goto("/console");
  // Console first — its H1 carries an em-dash, so assert by substring, not exact name.
  await page.getByRole("link", { name: "Console", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Activate stalled");
  await expect(page.getByRole("link", { name: "Console", exact: true })).toHaveAttribute(
    "aria-current",
    "page",
  );

  // E1a (plan v3.3): /eval /metrics /cost now carry the truth-engine dashboard;
  // the legacy content moved under /legacy/** (asserted below). Nav labels are
  // reworked at S5 — this binds today's labels to today's H1s (conscious update,
  // red-green run 2026-07-11).
  const surfaces: Array<[string, string]> = [
    ["Eval / Quality", "Eval evidence"],
    ["Metrics", "Engine measurables"],
    ["Audit", "Audit Trail"],
    ["Cost", "Cost & $0 enforcement"],
  ];
  for (const [navLabel, heading] of surfaces) {
    await page.getByRole("link", { name: navLabel, exact: true }).click();
    await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
    await expect(page.getByRole("link", { name: navLabel, exact: true })).toHaveAttribute(
      "aria-current",
      "page",
    );
  }
});

test("the /legacy/ skeleton serves the moved surfaces under the provenance banner", async ({
  page,
}) => {
  // The dashboard hands off to the moved legacy surface…
  await page.goto("/eval");
  await page.getByRole("link", { name: "/legacy/eval" }).click();
  await expect(page).toHaveURL(/\/legacy\/eval/);
  // …which renders the route-group provenance banner + the ORIGINAL legacy content.
  await expect(page.getByText("Legacy activation module", { exact: false }).first()).toBeVisible();
  await expect(page.getByRole("heading", { level: 1, name: "Eval / Quality" })).toBeVisible();
  // The banner is not a footer (the root footer stays the site's only footer).
  await expect(page.locator("footer")).toHaveCount(1);
  // The other two moved surfaces resolve with their original H1s.
  await page.goto("/legacy/metrics");
  await expect(
    page.getByRole("heading", { level: 1, name: "Workflow metrics (simulated)" }),
  ).toBeVisible();
  await page.goto("/legacy/cost");
  await expect(page.getByRole("heading", { level: 1, name: "Cost ledger" })).toBeVisible();
  // legacy cost still shows the honest $0.00 replay ledger
  await expect(page.getByText("$0.00").first()).toBeVisible();
});

test("report surface toggle is keyboard-operable honest buttons (NEW-10)", async ({ page }) => {
  await page.goto("/report");
  const group = page.getByRole("group", { name: "Serving surface" });
  await expect(group).toBeVisible();
  // No faked tablist remains.
  await expect(page.locator('[role="tablist"], [role="tab"]')).toHaveCount(0);
  const buttons = group.getByRole("button");
  await expect(buttons.first()).toHaveAttribute("aria-pressed", "true");
  await expect(buttons.nth(1)).toHaveAttribute("aria-pressed", "false");
  // Keyboard: focus the second toggle and press it with the keyboard only.
  await buttons.nth(1).focus();
  await page.keyboard.press("Enter");
  await expect(buttons.nth(1)).toHaveAttribute("aria-pressed", "true");
  await expect(buttons.first()).toHaveAttribute("aria-pressed", "false");
});
