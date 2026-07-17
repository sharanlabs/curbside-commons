import { test, expect } from "@playwright/test";

/**
 * Fee-surface contract (NYC showcase N1+N2, plan docs/plan-nyc-showcase-2026-07-16.md)
 * — runs in BOTH modes (dev + artifact) like every e2e contract. The rendered
 * audit must show the committed goldens' exact verdicts and receipts; the four
 * example months must carry their four distinct legal outcomes; the boundary
 * lanes must render honestly-unresolved; and the paste leg must run the real
 * engine live (edited statements move the verdicts; garbage gets an honest
 * error, never a verdict).
 */

test("/fees renders the drifted month's audit end-to-end: verdict, receipts, boundary, as-of", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/fees");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "A fee statement, read against the law.",
  );

  // Verdict head — the committed drifted golden: FAIL, 5 findings, all violations.
  const report = page.locator("#fee-report");
  await expect(report.locator(".rpt-verdict-flag")).toHaveText("FAIL");
  await expect(report.locator(".rpt-verdict-count")).toHaveText("5 findings");
  await expect(report.locator(".rpt-verdict-tally")).toContainText("5 violation");

  // A named receipt: the monthly-average delivery-fee violation with its
  // rule id, exact clause, arithmetic, and statement-line receipt.
  await expect(report.getByText("NYC-563.3-a-2").first()).toBeVisible();
  await expect(report.getByText("§ 20-563.3(a) (averaging clause)").first()).toBeVisible();
  await expect(
    report.getByText("$14.40 of fees on $90.00 of monthly purchases = 16.0% — cap 15%"),
  ).toBeVisible();
  await expect(report.getByText("monthly aggregate — the delivery fee charge lines").first()).toBeVisible();
  // A line-level receipt names the statement line it caught.
  await expect(report.getByText('"Combined service + delivery bundle" · order ORD-3 · $1.50')).toBeVisible();
  // Verdict states render as tags, not prose.
  await expect(report.locator(".fee-vtag.violation").first()).toContainText("VIOLATION");

  // The basis rail: governing law + the dated freshness pin.
  await expect(report.getByText("NYC Administrative Code §20-563.3")).toBeVisible();
  await expect(report.getByText(/verified current as of 2026-07-15/)).toBeVisible();

  // The 11 / 6 boundary renders with the same care — honestly unresolved lanes.
  await expect(page.getByRole("heading", { name: /Checked from the statement/ })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /Needs evidence beyond the statement/ }),
  ).toBeVisible();
  await expect(page.getByText("Service radius")).toBeVisible();
  await expect(
    page.getByText("UNRESOLVED — outside what a statement can show").first(),
  ).toBeVisible();

  // Real-world framing without overclaim: the invented-example boundary is rendered.
  await expect(page.getByText(/invented examples/).first()).toBeVisible();
  await expect(page.getByText(/No real platform statement/).first()).toBeVisible();
});

test("receipt cells hold a readable measure at the desktop floor — no ribbon collapse", async ({
  page,
}) => {
  // Session-19 design fix: the shared four-track receipt ledger starved "the
  // arithmetic" (sentence-length evidence) to ~48px ribbons at 1280. The fee
  // surface now pairs receipts 2×2; this tooth fails if any receipt cell ever
  // collapses below a readable measure again.
  await page.setViewportSize({ width: 1280, height: 1000 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/fees");
  const cells = page.locator("#fee-report .rpt-rc dd");
  const n = await cells.count();
  expect(n).toBeGreaterThan(0);
  for (let i = 0; i < n; i++) {
    const box = await cells.nth(i).boundingBox();
    expect(box, `receipt cell ${i} has a box`).not.toBeNull();
    expect(box!.width, `receipt cell ${i} width ≥ 150px (was 48px in the ribbon defect)`).toBeGreaterThanOrEqual(150);
  }
});

test("the four example months carry their four legal outcomes (toggle)", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/fees");
  const report = page.locator("#fee-report");
  const toggle = page.getByRole("group", { name: "Example month" });

  // Within the caps — a clean PASS with no findings.
  await toggle.getByRole("button", { name: "Within the caps" }).click();
  await expect(report.locator(".rpt-verdict-flag")).toHaveText("PASS");
  await expect(report.getByText(/No findings — every fee line on this statement/)).toBeVisible();

  // Refunded in time — over cap but cured inside the §20-563.3(e) window; the
  // receipt SHOWS the refund that proves the cure (batch P2 fix).
  await toggle.getByRole("button", { name: "Refunded in time" }).click();
  await expect(report.locator(".rpt-verdict-flag")).toHaveText("PASS");
  await expect(report.locator(".fee-vtag.cured-by-refund").first()).toContainText(
    "CURED BY REFUND — not a violation",
  );
  await expect(report.getByText(/cured by refund \$\d+\.\d{2} on \d{4}-\d{2}-\d{2}/)).toBeVisible();

  // Window still open — not yet a violation; the statute defers the verdict.
  await toggle.getByRole("button", { name: "Window still open" }).click();
  await expect(report.locator(".rpt-verdict-flag")).toHaveText("PASS");
  await expect(report.locator(".fee-vtag.conditional-pending-refund-window").first()).toContainText(
    "CONDITIONAL — refund window open",
  );

  // Back to the violations month.
  await toggle.getByRole("button", { name: "Over the caps" }).click();
  await expect(report.locator(".rpt-verdict-flag")).toHaveText("FAIL");
});

test("the paste leg audits the sample statement to the reference result, live", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/fees");
  await page.getByRole("button", { name: "Load the sample statement" }).click();
  await page.getByRole("button", { name: "Audit this statement" }).click();
  const result = page.getByRole("region", { name: "Fee audit result" });
  await expect(result.getByText("FAIL", { exact: true })).toBeVisible();
  await expect(result.getByText(/5 findings — 5 violation/)).toBeVisible();
  await expect(result.getByText(/reference result/).first()).toBeVisible();
  await expect(result.getByText("NYC-563.3-c-1").first()).toBeVisible();
});

test("edited statements yield engine-derived verdict changes — input-sensitivity evidence", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/fees");
  await page.getByRole("button", { name: "Load the sample statement" }).click();
  // Bring every delivery fee under the 15% monthly cap and un-bundle the two
  // unlawful category lines: the tally must move with the edit (values invented
  // here — no committed record contains this statement).
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
  await page
    .getByLabel("Fee statement JSON")
    .fill('{"meta":{"simulated":false},"lines":[]}');
  await page.getByRole("button", { name: "Audit this statement" }).click();
  await expect(alert).toContainText("No verdict.");
  await expect(alert).toContainText("illustrative");
  await expect(page.getByRole("region", { name: "Fee audit result" })).toHaveCount(0);
});

test("the paste-leg tally is a live instrument: NumberFlow renders every tally figure with the sentence intact", async ({
  page,
}) => {
  // NumberFlow's FIRST real use (session-22 ③): the tally values genuinely change
  // when the reader edits and re-audits, so the transition is honest — unlike the
  // bench delta, which stays static by the recorded honesty adjudication.
  // Reduced motion emulated: the value swap must be exact and instant (the
  // package's own prefers-reduced-motion branch), so the assertions below are
  // deterministic — frame-level animation checks would be theater (recorded
  // adjudication of the batch P3, 2026-07-16).
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/fees");
  await page.getByRole("button", { name: "Load the sample statement" }).click();
  await page.getByRole("button", { name: "Audit this statement" }).click();
  const result = page.getByRole("region", { name: "Fee audit result" });
  const tally = result.locator(".pg-tally");
  // One flow per figure: the findings count + the four verdict-tally counts.
  await expect(tally.locator("number-flow-react")).toHaveCount(5);
  // The sentence still reads as one line of copy (screen readers + text search).
  await expect(result.getByText(/5 findings — 5 violation/)).toBeVisible();
  // The figures are LIVE: an edit + re-audit moves the same NumberFlow elements
  // (5 findings → 4) and the sr-only sentence mirror moves with them.
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
