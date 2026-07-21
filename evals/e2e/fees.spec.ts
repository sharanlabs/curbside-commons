import { test, expect } from "@playwright/test";

/**
 * Chapter 02 · Fee audit contract — the v9 takeover surface (consolidated e2e
 * rewrite, 2026-07-20). Runs in BOTH modes (dev + artifact). The rendered audit
 * shows the committed goldens' exact verdicts and receipts; the four example
 * months carry their four distinct legal outcomes behind honest aria-pressed
 * month tabs (paper receipts that say "FILE B", never a second case number);
 * the 11/6 boundary renders honestly-unresolved; and the paste leg runs the
 * real engine live (edited statements move the verdicts; garbage gets an honest
 * error, never a verdict).
 *
 * Supersedes the retired ReportView `.rpt-*` fee surface — the fee report is now
 * the paper-receipt FeesView (#fee-report) with the FeeJewel meter and the
 * ultramarine chapter head.
 */

test("/fees head: the NYC-alone framing, the four caps, the averaging jewel, the freshness pin", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/fees");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "A fee statement, read against the law.",
  );

  // The 17 = 11 + 6 boundary chips + the NYC-alone jurisdiction line.
  const chips = page.locator(".p2-chips");
  await expect(chips).toContainText("17");
  await expect(chips).toContainText("CODIFIED RULES");
  await expect(chips).toContainText("FROM THE STATEMENT");
  await expect(chips).toContainText("NEED OUTSIDE EVIDENCE");
  await expect(page.locator(".nyc-line")).toContainText("JURISDICTION · NEW YORK CITY");
  await expect(page.locator(".nyc-line")).toContainText("§20-563.3");

  // The four headline caps.
  const caps = page.locator(".caps .cap-cell");
  await expect(caps).toHaveCount(4);
  for (const key of ["DELIVERY", "ORDER-TAKING", "CARD PROCESSING", "ENHANCED TIER"]) {
    await expect(caps.filter({ hasText: key })).toHaveCount(1);
  }

  // The averaging-clause jewel — settled (reduced motion) at the month's average vs cap.
  const jewel = page.locator("#fee-jewel");
  await expect(jewel.locator(".fj-label")).toContainText("THE AVERAGING CLAUSE · OVER THE LINE");
  await expect(jewel).toContainText("16.0%");
  await expect(jewel).toContainText("15.0%");

  // The freshness pin.
  await expect(page.getByText("NYC Administrative Code §20-563.3").first()).toBeVisible();
  await expect(page.getByText(/verified current as of 2026-07-15/).first()).toBeVisible();
});

test("/fees renders the drifted month end-to-end: verdict, named receipt, boundary", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/fees");

  // The drifted month is the only failing month — verdict chip + count.
  const drifted = page.locator('#fee-report .fee-month[data-verdict="fail"]');
  await expect(drifted.locator(".fm-head .vtag.vio")).toContainText("FAIL · 5 FINDINGS");

  // The monthly-average delivery-fee violation receipt: rule id, clause, arithmetic.
  await expect(drifted.getByText("NYC-563.3-a-2").first()).toBeVisible();
  await expect(drifted.getByText("§ 20-563.3(a) (averaging clause)").first()).toBeVisible();
  await expect(
    drifted.getByText("$14.40 of fees on $90.00 of monthly purchases = 16.0% — cap 15%"),
  ).toBeVisible();
  // A line-level receipt names the statement line it caught.
  await expect(
    drifted.getByText('"Combined service + delivery bundle" · order ORD-3 · $1.50'),
  ).toBeVisible();
  // The verdict is a stamp, not prose — the paper receipt says FILE B, not a case number.
  await expect(drifted.locator(".rc-stamp .stamp").first()).toContainText("VIOLATION");
  await expect(drifted.locator(".rc-case").first()).toContainText("FILE B");
  await expect(drifted).not.toContainText("CASE 002");

  // The 11 / 6 boundary — honestly-unresolved lanes.
  await expect(page.getByRole("heading", { name: "Checkable here, deterministically" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Outside what a statement can show" })).toBeVisible();
  await expect(page.getByText("Service radius")).toBeVisible();
  await expect(page.getByText("UNRESOLVED — OUTSIDE THE STATEMENT").first()).toBeVisible();
});

test("the four example months carry their four legal outcomes (month tabs)", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/fees");
  const tabs = page.getByRole("group", { name: "Example month" });
  // The visible month after paging (exactly one is not hidden).
  const active = page.locator("#fee-report .fee-month:not([hidden])");

  // Within the caps — a clean PASS with no findings.
  await tabs.getByRole("button", { name: "Within the caps" }).click();
  await expect(active).toHaveAttribute("data-verdict", "pass");
  await expect(active.locator(".fm-head .vtag")).toContainText("PASS · NO FINDINGS");
  await expect(active.getByText(/Nothing to report/)).toBeVisible();

  // Refunded in time — over cap but cured inside the §20-563.3(e) window; the
  // receipt SHOWS the cure.
  await tabs.getByRole("button", { name: "Refunded in time" }).click();
  await expect(active.locator(".fm-head .vtag")).toContainText("CURED");
  await expect(active.locator(".rc-stamp .stamp").first()).toContainText(
    "CURED BY REFUND — not a violation",
  );

  // Window still open — not yet a violation; the statute defers the verdict.
  await tabs.getByRole("button", { name: "Window still open" }).click();
  await expect(active.locator(".fm-head .vtag")).toContainText("CONDITIONAL");
  await expect(active.locator(".rc-stamp .stamp").first()).toContainText(
    "CONDITIONAL — refund window open",
  );

  // Back to the violations month.
  await tabs.getByRole("button", { name: "Over the caps" }).click();
  await expect(active).toHaveAttribute("data-verdict", "fail");
  await expect(active.locator(".fm-head .vtag.vio")).toContainText("FAIL · 5 FINDINGS");
});

test("print floor: the viewed example month is visible on paper (D-1)", async ({ page }) => {
  // With JS on, the non-active months carry the `hidden` attribute and the print
  // stylesheet prints only the month the reader is viewing (the no-JS path prints
  // all four). The meetable floor: the active month is never blank on paper.
  await page.goto("/fees");
  await page.emulateMedia({ media: "print" });
  const active = page.locator("#fee-report .fee-month:not([hidden])");
  await expect(active).toHaveCount(1);
  await expect(active).toBeVisible();
  await expect(active.locator(".fm-title")).toBeVisible();
});

/* ===================== THE PASTE LEG (real engine) ==================== */

test("the paste leg audits the sample statement to the reference result, live", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/fees");
  await page.getByRole("button", { name: "Load the example statement" }).click();
  await page.getByRole("button", { name: "Audit this statement" }).click();
  const result = page.getByRole("region", { name: "Fee audit result" });
  await expect(result.getByText("FAIL", { exact: true })).toBeVisible();
  await expect(result.getByText(/5 findings — 5 violation/)).toBeVisible();
  await expect(result.getByText(/reference result/).first()).toBeVisible();
  await expect(result.getByText("NYC-563.3-c-1").first()).toBeVisible();
});

test("paste-leg receipt cells hold a readable measure — no ribbon collapse", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 1000 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/fees");
  await page.getByRole("button", { name: "Load the example statement" }).click();
  await page.getByRole("button", { name: "Audit this statement" }).click();
  const cells = page.locator(".pg-result .pg-receipts dd");
  const n = await cells.count();
  expect(n).toBeGreaterThan(0);
  for (let i = 0; i < n; i++) {
    const box = await cells.nth(i).boundingBox();
    expect(box, `receipt cell ${i} has a box`).not.toBeNull();
    expect(box!.width, `receipt cell ${i} width ≥ 150px`).toBeGreaterThanOrEqual(150);
  }
});

test("edited statements yield engine-derived verdict changes — input-sensitivity evidence", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/fees");
  await page.getByRole("button", { name: "Load the example statement" }).click();
  // Bring every delivery fee under the 15% monthly cap: the tally must move.
  const edited = await page.evaluate(() => {
    const ta = document.getElementById("fee-statement") as HTMLTextAreaElement;
    const stmt = JSON.parse(ta.value);
    for (const line of stmt.lines) {
      if (line.declaredCategory === "delivery_fee") line.amountCents = 100; // 5% of $20
    }
    return JSON.stringify(stmt, null, 2);
  });
  await page.getByLabel("Fee statement JSON").fill(edited);
  await page.getByRole("button", { name: "Audit this statement" }).click();
  const result = page.getByRole("region", { name: "Fee audit result" });
  await expect(result.getByText("FAIL", { exact: true })).toBeVisible();
  // The monthly-average delivery violation is gone; the tally is engine-derived.
  await expect(result.getByText(/5 findings — 5 violation/)).toHaveCount(0);
  await expect(result.getByText(/4 findings — 4 violation/)).toBeVisible();
  await expect(result.getByText(/Computed in your browser just now/)).toBeVisible();
});

test("garbage and unmarked pastes get honest errors, never a verdict", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/fees");
  const alert = page.locator("div.pg-error[role='alert']");

  await page.getByLabel("Fee statement JSON").fill("this is not a statement {{{");
  await page.getByRole("button", { name: "Audit this statement" }).click();
  await expect(alert).toContainText("No verdict.");
  await expect(alert).toContainText("Not valid JSON");
  await expect(page.getByRole("region", { name: "Fee audit result" })).toHaveCount(0);

  // A paste without the honesty marker is refused with the boundary stated.
  await page.getByLabel("Fee statement JSON").fill('{"meta":{"simulated":false},"lines":[]}');
  await page.getByRole("button", { name: "Audit this statement" }).click();
  await expect(alert).toContainText("No verdict.");
  await expect(alert).toContainText("illustrative");
  await expect(page.getByRole("region", { name: "Fee audit result" })).toHaveCount(0);
});

test("the paste-leg tally is a live NumberFlow instrument with the sentence intact", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/fees");
  await page.getByRole("button", { name: "Load the example statement" }).click();
  await page.getByRole("button", { name: "Audit this statement" }).click();
  const result = page.getByRole("region", { name: "Fee audit result" });
  const tally = result.locator(".pg-tally");
  // One flow per figure: the findings count + the four verdict-tally counts.
  await expect(tally.locator("number-flow-react")).toHaveCount(5);
  await expect(result.getByText(/5 findings — 5 violation/)).toBeVisible();
  // The figures are LIVE: an edit + re-audit moves the same elements (5 → 4).
  const edited = await page.evaluate(() => {
    const ta = document.getElementById("fee-statement") as HTMLTextAreaElement;
    const stmt = JSON.parse(ta.value);
    for (const line of stmt.lines) {
      if (line.declaredCategory === "delivery_fee") line.amountCents = 100;
    }
    return JSON.stringify(stmt, null, 2);
  });
  await page.getByLabel("Fee statement JSON").fill(edited);
  await page.getByRole("button", { name: "Audit this statement" }).click();
  await expect(tally.locator("number-flow-react")).toHaveCount(5);
  await expect(result.getByText(/4 findings — 4 violation/)).toBeVisible();
  await expect(result.getByText(/5 findings — 5 violation/)).toHaveCount(0);
});
