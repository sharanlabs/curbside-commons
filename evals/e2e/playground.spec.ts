import { test, expect } from "@playwright/test";

/**
 * Chapter 03 · Try it live contract — the v9 takeover surface (consolidated e2e
 * rewrite, 2026-07-20). Runs in BOTH modes (dev + artifact). The real engine
 * runs client-side, so these tests exercise genuine in-browser verification:
 * the reader-operated TryLiveBench presets recompute the committed feed live,
 * and the paste leg below takes a whole feed of your own — an edited feed
 * produces a DIFFERENT result (the live-computation proof), and garbage produces
 * an honest error, never a verdict.
 *
 * Two selectors that could collide are disambiguated: the bench preset card
 * "Load the committed feed" carries extra text, so the paste-leg button is
 * matched with { exact: true }.
 */

test("the try-it-live head states the deterministic, zero-cost, offline posture", async ({
  page,
}) => {
  await page.goto("/playground");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Verify a feed");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("in your browser");
  const chips = page.locator(".p2-chips");
  for (const chip of ["DETERMINISTIC", "NO AI CALLS", "$0 TO RUN", "NO NETWORK REQUESTS"]) {
    await expect(chips.getByText(chip, { exact: true })).toBeVisible();
  }
});

test("the reader-operated bench recomputes the committed feed live; edits move the tally", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/playground");
  const presets = page.getByRole("group", { name: "Bench presets" });
  await expect(presets.getByRole("button")).toHaveCount(4);

  const vpanel = page.locator(".bench3 .vpanel");
  // The opening state is the recomputed reference result — the chapter 01 tally.
  await expect(vpanel.locator(".vstamp")).toContainText("FAIL");
  await expect(vpanel.locator(".vtally")).toContainText("16 findings — 11 error · 5 warn · 0 info");
  await expect(page.locator(".bench3 ~ .pb-bar .pb-line")).toContainText("16 FINDINGS");

  // Serve a ghost row the catalog never had — one new finding on top of the feed's own.
  await presets.getByRole("button", { name: /Serve an item the catalog never had/ }).click();
  await expect(vpanel.locator(".vstamp")).toContainText("FAIL");
  await expect(vpanel.locator(".vtally")).toContainText("17 findings");
  await expect(vpanel).toContainText(/\+1 finding · −0/i);

  // Edit one served price to the true value — that line clears, the tally drops
  // by one (the feed's other findings remain, so the verdict stays FAIL).
  await presets.getByRole("button", { name: /Edit one served price yourself/ }).click();
  await page.getByRole("button", { name: /the true price/ }).click();
  await expect(vpanel.locator(".vtally")).toContainText("15 findings");
  await expect(vpanel).toContainText(/\+0 findings · −1/i);
});

/* ============== THE AUDIT WORKBENCH — two files, real engine ==============
 *
 * REWRITTEN 2026-07-27 (owner commission: "I WANT WORKING WEBSITE WHERE I WILL
 * UPLOAD TEST FILES"). These four tests replace the three that bound the
 * single-field paste leg. Every invariant that leg proved is preserved — the
 * golden verdict is reproduced live, edits move the receipts, garbage yields
 * an honest error and never a verdict — and the new ones the two-file tool
 * introduces are added: a reader's own RECORD side genuinely changes the
 * verdict, and the report says which records it was reached against.
 *
 * The paste textareas live inside a <details>, so each is opened before use —
 * that is the real reader's path too, not a test-only affordance.
 */

/**
 * Open a slot's paste box and fill it — the keyboard/no-drag route.
 * Idempotent: clicking the <summary> TOGGLES, so a second call on the same
 * slot would close what the first opened. Open only when it is shut.
 */
async function fillSlot(page: import("@playwright/test").Page, label: string, text: string) {
  const slot = page.locator(".fd-slot", { hasText: label });
  const details = slot.locator("details.fd-paste");
  if (!(await details.evaluate((d: HTMLDetailsElement) => d.open))) {
    await slot.getByText("or paste it as text").click();
  }
  await slot.locator("textarea").fill(text);
}

test("the workbench reproduces the golden verdict from the sample pair", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/playground");

  await page.getByRole("button", { name: "Use the sample feed" }).click();
  await page.getByRole("button", { name: "Run the audit" }).click();

  const result = page.getByRole("region", { name: "Audit result" });
  await expect(result.getByText("FAIL", { exact: true })).toBeVisible();
  await expect(result.getByText(/16 findings — 11 error · 5 warn · 0 info/)).toBeVisible();
  await expect(result.getByText("LST-EXIST-GHOST").first()).toBeVisible();
  // With no record uploaded, the run must SAY it used the sample records.
  await expect(result.getByText(/sample records/).first()).toBeVisible();
});

test("uploading your own record side changes the verdict AND its label", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/playground");

  // A feed of one row, and a record that agrees with it exactly: the only
  // possible honest verdict is PASS. This is the proof that the reader's
  // catalog is genuinely the truth side — against the shipped sample catalog
  // this same feed would report a ghost row plus five missing ones.
  await fillSlot(
    page,
    "The feed",
    JSON.stringify({
      spec: "acp-product-feed/extract-2026-07-02",
      items: [
        {
          item_id: "sku-1",
          title: "House Focaccia",
          price: "9.00",
          currency: "USD",
          availability: "in_stock",
          // The variant label must agree with the record's variation name, or
          // the identity rule fires — correctly. This pair is faithful in
          // EVERY field the engine checks, which is what makes PASS the only
          // honest verdict and the test meaningful.
          variant_dict: { variation: "Regular" },
        },
      ],
    }),
  );
  await fillSlot(
    page,
    "The record",
    JSON.stringify({
      asOf: "2026-07-03T00:00:00Z",
      items: [
        {
          id: "item-1",
          name: "House Focaccia",
          variations: [{ id: "sku-1", name: "Regular", priceCents: 900, stock: "in_stock" }],
        },
      ],
    }),
  );
  await page.getByRole("button", { name: "Run the audit" }).click();

  const result = page.getByRole("region", { name: "Audit result" });
  await expect(result.getByText("PASS", { exact: true })).toBeVisible();
  await expect(result.getByText(/No drift detected/)).toBeVisible();
  // THE HONESTY TEETH. Corrected after the cross-model gate (findings 2 + 4):
  // the C3 label describes the MATCHING MECHANISM, not who owns the data.
  // `sorReference` only ever performs exact shared-id lookup, and report-view
  // decodes "real-world" as "identifiers do not line up … matched by
  // resolution" — so labelling a reader's run real-world would assert a
  // mechanism that never ran. Ownership is carried by the two origin rows.
  await expect(result.getByText(/of your own records/)).toBeVisible();
  await expect(result.getByText("synthetic-controlled", { exact: true })).toBeVisible();
  await expect(result.getByText("your upload").first()).toBeVisible();

  // And the record-side row must track the ACTION, not "is this slot filled".
  // Loading the SAMPLE catalog previously printed "your own records" beside a
  // report correctly labelled otherwise — screen and header disagreeing.
  await page.getByRole("button", { name: "Use the sample catalog" }).click();
  await page.getByRole("button", { name: "Run the audit" }).click();
  await expect(result.getByText(/sample records/)).toBeVisible();
  await expect(result.getByText("sample catalog", { exact: true })).toBeVisible();
});

test("edits move the receipts — input-sensitivity evidence of live computation", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/playground");
  await page.getByRole("button", { name: "Use the sample feed" }).click();
  const result = page.getByRole("region", { name: "Audit result" });

  const feedArea = page.locator(".fd-slot", { hasText: "The feed" }).locator("textarea");
  await fillSlot(page, "The feed", await feedArea.inputValue());

  // Edit 1: plant an arbitrary price — the receipts must echo it back.
  const edit1 = await feedArea.inputValue().then((v) => {
    const feed = JSON.parse(v);
    feed.items[0].price = "8642.31";
    return JSON.stringify(feed, null, 2);
  });
  await feedArea.fill(edit1);
  await page.getByRole("button", { name: "Run the audit" }).click();
  await expect(result.getByText("FAIL", { exact: true })).toBeVisible();
  await expect(result.getByText(/8642\.31/).first()).toBeVisible();

  // Edit 2: drop all rows but the first — the completeness sweep catches it.
  const edit2 = await feedArea.inputValue().then((v) => {
    const feed = JSON.parse(v);
    feed.items = feed.items.slice(0, 1);
    return JSON.stringify(feed, null, 2);
  });
  await feedArea.fill(edit2);
  await page.getByRole("button", { name: "Run the audit" }).click();
  await expect(result.getByText("FAIL", { exact: true })).toBeVisible();
  // Dropping rows DOES change the tally — the golden's exact tally must be gone.
  await expect(result.getByText(/16 findings — 11 error · 5 warn · 0 info/)).toHaveCount(0);
  await expect(result.getByText(/missing from the feed/).first()).toBeVisible();
});

test("a verdict never outlives the inputs that produced it", async ({ page }) => {
  // THE STALE-VERDICT HAZARD (adversarial pass, 2026-07-27). A result panel
  // left standing beside changed inputs is a lie the reader cannot detect:
  // the screen asserts a verdict about a feed that is no longer on screen.
  // Every input path must clear it — touching either slot, loading a sample,
  // or a failed file read.
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/playground");
  const result = page.getByRole("region", { name: "Audit result" });

  await page.getByRole("button", { name: "Use the sample feed" }).click();
  await page.getByRole("button", { name: "Run the audit" }).click();
  await expect(result).toBeVisible();

  // Editing the FEED clears it.
  await fillSlot(page, "The feed", '{"items":[]}');
  await expect(result).toHaveCount(0);

  await page.getByRole("button", { name: "Use the sample feed" }).click();
  await page.getByRole("button", { name: "Run the audit" }).click();
  await expect(result).toBeVisible();

  // So does touching the RECORD — the side that changes what the verdict MEANS.
  await page.getByRole("button", { name: "Use the sample catalog" }).click();
  await expect(result).toHaveCount(0);
});

test("garbage input yields an honest error and no verdict, on either side", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/playground");

  await fillSlot(page, "The feed", "this is not a feed {{{");
  await page.getByRole("button", { name: "Run the audit" }).click();
  const alert = page.locator('div.wb-error[role="alert"]');
  await expect(alert).toContainText("No verdict.");
  await expect(alert).toContainText("Not valid JSON");
  await expect(page.getByRole("region", { name: "Audit result" })).toHaveCount(0);

  // A structurally broken row reaches the SAME honest path, naming the row.
  await fillSlot(page, "The feed", '{"items":[null]}');
  await page.getByRole("button", { name: "Run the audit" }).click();
  await expect(alert).toContainText("items[0]");
  await expect(page.getByRole("region", { name: "Audit result" })).toHaveCount(0);

  // And so does a broken RECORD — a good feed plus an unreadable catalog must
  // never fall back to the sample records and report a verdict anyway.
  await page.getByRole("button", { name: "Use the sample feed" }).click();
  await fillSlot(page, "The record", '{"asOf":"2026-07-03T00:00:00Z","items":[{"id":"x"}]}');
  await page.getByRole("button", { name: "Run the audit" }).click();
  await expect(alert).toContainText("The record could not be read");
  await expect(alert).toContainText("items[0]");
  await expect(page.getByRole("region", { name: "Audit result" })).toHaveCount(0);
});
