import { test, expect } from "@playwright/test";

/**
 * THE AUDIT WORKBENCH contract — the working tool. Runs in BOTH modes
 * (dev + artifact). The real engine runs client-side, so these tests exercise
 * genuine in-browser verification.
 *
 * MOVED HERE FROM playground.spec.ts 2026-07-28. The tool itself did not
 * change; its ADDRESS did. It used to be section four of five on
 * `/playground`, ~2990px below the fold, which is why the owner still could
 * not find it after session 36 built it. It now opens the home page. Every
 * assertion below is carried over unaltered except the route — the invariants
 * they pin (the golden verdict reproduced live, a reader's own record side
 * changing both verdict AND label, edits moving the receipts, garbage yielding
 * an honest error, and a verdict never outliving its inputs) are properties of
 * the engine and the component, not of the page that hosts them.
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
  await page.goto("/");

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
  await page.goto("/");

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
  await page.goto("/");
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
  await page.goto("/");
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
  await page.goto("/");

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

test("a verdict offers a way forward, and 'audit another pair' really resets", async ({ page }) => {
  // NEW 2026-07-28. The old surface stopped at a verdict and a download button:
  // the only route back to an empty bench was a page reload, which no reader has
  // a reason to guess. "Where do I go next" was one of the five steps the owner
  // named in the walkthrough review, and it was the one with no answer.
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  await page.getByRole("button", { name: "Use the sample feed" }).click();
  await page.getByRole("button", { name: "Run the audit" }).click();
  const result = page.getByRole("region", { name: "Audit result" });
  await expect(result).toBeVisible();

  const next = page.getByRole("navigation", { name: "Next steps" });
  await expect(next.getByRole("link", { name: "See a full worked report" })).toHaveAttribute(
    "href",
    "/report",
  );
  await expect(next.getByRole("link", { name: "What is real, what is invented" })).toHaveAttribute(
    "href",
    "/docs",
  );

  // The reset must clear BOTH slots, not just the verdict — a half-cleared
  // bench would run the old feed against nothing and call it a new audit.
  await next.getByRole("button", { name: "Audit another pair" }).click();
  await expect(result).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Run the audit" })).toBeDisabled();
  for (const label of ["The feed", "The record"]) {
    const slot = page.locator(".fd-slot", { hasText: label });
    await expect(slot.locator("textarea")).toHaveValue("");
  }
});

test("the sample pair can be DOWNLOADED, and it is the same bytes the inline button loads", async ({
  page,
}) => {
  // NEW 2026-07-28. "A ready-to-use website to upload test files" needs FILES.
  // Loading the sample inline exercises the engine but never the upload path,
  // so a reader who wanted to try dragging something in had nothing to drag.
  // The tooth that matters is not "a download happens" — it is that the file
  // and the inline sample are the SAME sample. Two sources for one specimen is
  // how a tool ends up demonstrating something other than what it audits.
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  for (const [label, fileName] of [
    ["The feed", "sample-feed.json"],
    ["The record", "sample-catalog.json"],
  ] as const) {
    const slot = page.locator(".fd-slot", { hasText: label });

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      slot.getByRole("button", { name: /download it to test uploading/ }).click(),
    ]);
    expect(download.suggestedFilename()).toBe(fileName);
    const stream = await download.createReadStream();
    const chunks: Buffer[] = [];
    for await (const c of stream) chunks.push(c as Buffer);
    const downloaded = Buffer.concat(chunks).toString("utf8");

    // Now load the SAME sample inline and compare the textarea's bytes.
    await slot.getByRole("button", { name: /^Use the sample/ }).click();
    const inline = await slot.locator("textarea").inputValue();
    expect(downloaded, `${fileName} must match the inline sample byte for byte`).toBe(inline);
    expect(() => JSON.parse(downloaded), `${fileName} must be valid JSON`).not.toThrow();
  }
});
