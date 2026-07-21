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
  // De-jargon (redesign Slice E): the outcome label reads "Marked sent" on the
  // public page (the internal outreach state keeps its name in the project).
  await expect(page.getByText("Marked sent").first()).toBeVisible();
});

test("a merchant opens its full why-chain end to end under /legacy/", async ({ page }) => {
  await page.goto("/legacy/console");
  await page.locator("tbody a").first().click();
  // 30s: dev mode compiles /legacy/merchant/[id] on first hit (artifact mode is
  // instant); 15s was measured insufficient under load on 2026-07-11.
  await expect(page).toHaveURL(/\/legacy\/merchant\/M\d{3}/, { timeout: 30_000 });
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
  // Phase-F batch findings #1/#2: the preserved module's diagnosis prose renders
  // through the display-layer de-jargon — no vendor/agency names reach the page.
  const merchantBody = await page.locator("main").innerText();
  for (const leak of [/\bstripe\b/i, /\bIRS\b/, /\bDataSF\b/i]) {
    expect(merchantBody, `vendor/agency name leaked on the merchant page: ${leak}`).not.toMatch(
      leak,
    );
  }
});

test("the /legacy/ skeleton serves every moved surface under the provenance banner", async ({
  page,
}) => {
  // Handoff from the /legacy archive landing into a moved surface (the v9
  // takeover retired the /eval dashboard into a /proof redirect stub, so the
  // archive landing is now the door into the preserved module).
  await page.goto("/legacy");
  await page.getByRole("link", { name: "Eval", exact: true }).click();
  // 30s: the App Router updates the URL only once the RSC payload for the target
  // resolves, and dev compiles /legacy/eval on first hit under parallel load
  // (artifact mode prebuilds it and is instant). 15s was measured insufficient
  // cold — same dev-compile allowance the merchant why-chain test uses. Do NOT
  // re-click: a second click aborts the in-flight navigation and it never lands.
  await expect(page).toHaveURL(/\/legacy\/eval/, { timeout: 30_000 });
  await expect(page.getByText("Legacy activation module", { exact: false }).first()).toBeVisible();
  await expect(page.getByRole("heading", { level: 1, name: "Eval / Quality" })).toBeVisible();
  // The provenance banner is not a footer — the root footer stays the only one.
  await expect(page.locator("footer")).toHaveCount(1);
  // The remaining moved surfaces resolve with their original H1s + the banner.
  const moved: Array<[string, string]> = [
    ["/legacy/metrics", "Workflow metrics (illustrative)"],
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
  // legacy cost still shows the honest $0.00 replay ledger. (Asserted on the cost
  // page itself: pre-freeze-reversal this incidentally passed on whatever page the
  // loop last landed on, because the removed nav "· $0.00" pill rendered on every
  // page. With the pill gone, the check is repointed to its stated intent.)
  await page.goto("/legacy/cost");
  await expect(page.getByText("$0.00").first()).toBeVisible();
});
