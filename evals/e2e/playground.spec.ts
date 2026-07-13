import { test, expect } from "@playwright/test";

/**
 * Playground contract (owner commission 2026-07-13) — runs in BOTH modes
 * (dev + artifact) like every e2e contract. The real engine runs client-side,
 * so these tests exercise genuine in-browser verification, not a replay:
 * the sample run must show the committed golden's exact tally, and an edited
 * feed must produce a DIFFERENT result (the live-computation proof), and
 * garbage must produce an honest error, never a verdict.
 */

test("playground verifies the committed sample feed to the golden verdict", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/playground");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Verify a serving copy in your browser",
  );
  await page.getByRole("button", { name: "Load the committed sample feed" }).click();
  await page.getByRole("button", { name: "Verify this feed" }).click();
  const result = page.getByRole("region", { name: "Verification result" });
  await expect(result.getByText("FAIL", { exact: true })).toBeVisible();
  await expect(result.getByText(/16 findings — 11 error · 5 warn · 0 info/)).toBeVisible();
  // sample provenance framing (simulated + test-proven equality)
  await expect(result.getByText(/committed/).first()).toBeVisible();
  // receipts render (rule ids from the golden)
  await expect(result.getByText("LST-EXIST-GHOST").first()).toBeVisible();
});

test("an edited feed changes the verdict — live computation, not a replay", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/playground");
  await page.getByRole("button", { name: "Load the committed sample feed" }).click();
  // remove everything but the first item: the completeness sweep must now flag
  // the catalog rows the copy silently dropped — a tally the golden never shows.
  const edited = await page.evaluate(() => {
    const ta = document.getElementById("pg-feed") as HTMLTextAreaElement;
    const feed = JSON.parse(ta.value);
    feed.items = feed.items.slice(0, 1);
    return JSON.stringify(feed, null, 2);
  });
  await page.getByLabel("ACP feed JSON").fill(edited);
  await page.getByRole("button", { name: "Verify this feed" }).click();
  const result = page.getByRole("region", { name: "Verification result" });
  await expect(result.getByText("FAIL", { exact: true })).toBeVisible();
  await expect(result.getByText(/16 findings — 11 error · 5 warn · 0 info/)).toHaveCount(0);
  await expect(result.getByText(/missing from the serving copy/).first()).toBeVisible();
  // pasted-feed provenance framing (live, synthetic-catalog boundary)
  await expect(result.getByText(/Computed in your browser just now/)).toBeVisible();
});

test("garbage input yields an honest error and no verdict", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/playground");
  await page.getByLabel("ACP feed JSON").fill("this is not a feed {{{");
  await page.getByRole("button", { name: "Verify this feed" }).click();
  // Scope to the playground's own alert — Next's route announcer is also role=alert.
  const alert = page.locator('div.pg-error[role="alert"]');
  await expect(alert).toContainText("No verdict.");
  await expect(alert).toContainText("Not valid JSON");
  await expect(page.getByRole("region", { name: "Verification result" })).toHaveCount(0);
});
