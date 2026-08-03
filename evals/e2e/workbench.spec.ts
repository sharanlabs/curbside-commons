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
 *
 * REBOUND 2026-08-02 (the walkthrough redesign). The landing became six
 * stations, so the workbench kept the INPUTS and the verdict moved to a slab of
 * its own. Two consequences run through every test below:
 *
 *   1. The slab is ALWAYS present — it opens on the bundled pair's committed
 *      verdict. So "is there a result?" is no longer `toHaveCount(0)`; it is
 *      `data-live`, which says whether the verdict on screen is the reader's own
 *      run or the page's opening state. Every stale-verdict assertion now checks
 *      that the slab fell BACK to the bundled state, which is strictly more than
 *      the old absence check could see.
 *   2. The run control is never disabled. With empty slots it reads "Run the
 *      bundled pair" and running IS loading the bundled pair.
 *
 * Not one invariant is dropped. Each is asserted against the surface that now
 * carries it.
 */

/**
 * Open a slot's paste box and fill it — the keyboard/no-drag route.
 * Idempotent: clicking the <summary> TOGGLES, so a second call on the same
 * slot would close what the first opened. Open only when it is shut.
 */
async function fillSlot(page: import("@playwright/test").Page, label: string, text: string) {
  const slot = page.locator(".wk-zone", { hasText: label });
  const details = slot.locator("details.wk-paste");
  if (!(await details.evaluate((d: HTMLDetailsElement) => d.open))) {
    // Click the <summary> element itself rather than matching its words: the
    // summary's copy is product copy and has been reworded twice, and a helper
    // that breaks on a copy edit fails every test for the wrong reason.
    await details.locator("summary").click();
  }
  await slot.locator("textarea").fill(text);
}

/** The verdict slab, only while it is showing the READER's own run. */
function liveSlab(page: import("@playwright/test").Page) {
  return page.locator('.wk-slab[data-live="true"]');
}

/**
 * A FAITHFUL one-row pair: a feed and a record that agree in every field the
 * engine checks, so PASS is the only honest verdict. Held here as ONE fixture
 * used by both tests that need it — two copies of the same specimen is how a
 * suite ends up proving something about a pair that no longer matches itself.
 *
 * The variant label must agree with the record's variation name or the identity
 * rule fires (correctly), which is what makes PASS meaningful rather than lucky.
 */
const FAITHFUL_FEED = JSON.stringify({
  spec: "acp-product-feed/extract-2026-07-02",
  items: [
    {
      item_id: "sku-1",
      title: "House Focaccia",
      price: "9.00",
      currency: "USD",
      availability: "in_stock",
      variant_dict: { variation: "Regular" },
    },
  ],
});

const FAITHFUL_RECORD = JSON.stringify({
  asOf: "2026-07-03T00:00:00Z",
  items: [
    {
      id: "item-1",
      name: "House Focaccia",
      variations: [{ id: "sku-1", name: "Regular", priceCents: 900, stock: "in_stock" }],
    },
  ],
});

test("the workbench reproduces the golden verdict from the sample pair", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  await page.getByRole("button", { name: "Load the bundled feed" }).click();
  await page.getByRole("button", { name: /^Run (the audit|the bundled pair|again)$/ }).click();

  const result = liveSlab(page);
  await expect(result.locator(".wk-verdict-word")).toHaveText("FAIL");
  // The golden tally, now rendered as the slab's four figures.
  const tally = result.locator(".wk-tally");
  await expect(tally).toContainText("16");
  await expect(tally).toContainText("11");
  await expect(tally).toContainText("5");
  // The complete findings list itemises the tally it advertises, so a specific
  // rule the golden contains must be findable on screen — not merely counted.
  await expect(result.locator(".wk-all-list > li")).toHaveCount(16);
  await expect(result.locator(".wk-all")).toContainText("LST-EXIST-GHOST");
  // With no record uploaded, the run must SAY it used the bundled records.
  await expect(result.locator(".wk-prov-line")).toContainText("bundled records");
});

test("uploading your own record side changes the verdict AND its label", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  // A feed of one row, and a record that agrees with it exactly: the only
  // possible honest verdict is PASS. This is the proof that the reader's
  // catalog is genuinely the truth side — against the shipped sample catalog
  // this same feed would report a ghost row plus five missing ones.
  await fillSlot(page, "The feed", FAITHFUL_FEED);
  await fillSlot(page, "The record", FAITHFUL_RECORD);
  await page.getByRole("button", { name: /^Run (the audit|the bundled pair|again)$/ }).click();

  const result = liveSlab(page);
  await expect(result.locator(".wk-verdict-word")).toHaveText("PASS");
  await expect(result.getByText(/No drift detected/)).toBeVisible();
  // THE HONESTY TEETH. Corrected after the cross-model gate (findings 2 + 4):
  // the C3 label describes the MATCHING MECHANISM, not who owns the data.
  // `sorReference` only ever performs exact shared-id lookup, and report-view
  // decodes "real-world" as "identifiers do not line up … matched by
  // resolution" — so labelling a reader's run real-world would assert a
  // mechanism that never ran. Ownership is carried by the two origin rows.
  await expect(result.locator(".wk-prov-line")).toContainText("of your own records");
  await expect(result.locator(".wk-prov")).toContainText("matching: synthetic-controlled");
  await expect(result.locator(".wk-prov")).toContainText("your upload");

  // And the record-side row must track the ACTION, not "is this slot filled".
  // Loading the SAMPLE catalog previously printed "your own records" beside a
  // report correctly labelled otherwise — screen and header disagreeing.
  await page.getByRole("button", { name: "Load the bundled catalog" }).click();
  await page.getByRole("button", { name: /^Run (the audit|the bundled pair|again)$/ }).click();
  await expect(result.locator(".wk-prov-line")).toContainText("bundled records");
  await expect(result.locator(".wk-prov")).toContainText("record side: bundled catalog");
});

test("edits move the receipts — input-sensitivity evidence of live computation", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.getByRole("button", { name: "Load the bundled feed" }).click();
  const result = liveSlab(page);

  const feedArea = page.locator(".wk-zone", { hasText: "The feed" }).locator("textarea");
  await fillSlot(page, "The feed", await feedArea.inputValue());

  // Edit 1: plant an arbitrary price — the receipts must echo it back.
  const edit1 = await feedArea.inputValue().then((v) => {
    const feed = JSON.parse(v);
    feed.items[0].price = "8642.31";
    return JSON.stringify(feed, null, 2);
  });
  await feedArea.fill(edit1);
  await page.getByRole("button", { name: /^Run (the audit|the bundled pair|again)$/ }).click();
  await expect(result.locator(".wk-verdict-word")).toHaveText("FAIL");
  // The planted value is echoed back by the evidence — receipts or the full
  // list, whichever holds it; what matters is that the run READ it. The full
  // list is a fold (CI run 30773077581: present-but-hidden fails toBeVisible),
  // so open it — the tooth is the echo, not the fold's default state.
  await result.locator("details.wk-all > summary").click();
  await expect(result.getByText(/8642\.31/).first()).toBeVisible();

  // Edit 2: drop all rows but the first — the completeness sweep catches it.
  const edit2 = await feedArea.inputValue().then((v) => {
    const feed = JSON.parse(v);
    feed.items = feed.items.slice(0, 1);
    return JSON.stringify(feed, null, 2);
  });
  await feedArea.fill(edit2);
  await page.getByRole("button", { name: /^Run (the audit|the bundled pair|again)$/ }).click();
  await expect(result.locator(".wk-verdict-word")).toHaveText("FAIL");
  // Dropping rows DOES change the tally — the golden's 16 findings must be gone.
  await expect(result.locator(".wk-all-list > li")).not.toHaveCount(16);
  await result.locator("details.wk-all > summary").click();
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
  const result = liveSlab(page);

  await page.getByRole("button", { name: "Load the bundled feed" }).click();
  await page.getByRole("button", { name: /^Run (the audit|the bundled pair|again)$/ }).click();
  await expect(result).toBeVisible();

  // Editing the FEED clears it — the slab falls BACK to the bundled verdict
  // rather than standing beside inputs that no longer produced it.
  await fillSlot(page, "The feed", '{"items":[]}');
  await expect(result).toHaveCount(0);
  await expect(page.locator(".wk-slab")).toHaveAttribute("data-live", "false");

  await page.getByRole("button", { name: "Load the bundled feed" }).click();
  await page.getByRole("button", { name: /^Run (the audit|the bundled pair|again)$/ }).click();
  await expect(result).toBeVisible();

  // So does touching the RECORD — the side that changes what the verdict MEANS.
  await page.getByRole("button", { name: "Load the bundled catalog" }).click();
  await expect(result).toHaveCount(0);
  await expect(page.locator(".wk-slab")).toHaveAttribute("data-live", "false");
});

test("garbage input yields an honest error and no verdict, on either side", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  await fillSlot(page, "The feed", "this is not a feed {{{");
  await page.getByRole("button", { name: /^Run (the audit|the bundled pair|again)$/ }).click();
  const alert = page.locator('div.wb-error[role="alert"]');
  await expect(alert).toContainText("No verdict.");
  await expect(alert).toContainText("Not valid JSON");
  await expect(liveSlab(page)).toHaveCount(0);

  // A structurally broken row reaches the SAME honest path, naming the row.
  await fillSlot(page, "The feed", '{"items":[null]}');
  await page.getByRole("button", { name: /^Run (the audit|the bundled pair|again)$/ }).click();
  await expect(alert).toContainText("items[0]");
  await expect(liveSlab(page)).toHaveCount(0);

  // And so does a broken RECORD — a good feed plus an unreadable catalog must
  // never fall back to the sample records and report a verdict anyway.
  await page.getByRole("button", { name: "Load the bundled feed" }).click();
  await fillSlot(page, "The record", '{"asOf":"2026-07-03T00:00:00Z","items":[{"id":"x"}]}');
  await page.getByRole("button", { name: /^Run (the audit|the bundled pair|again)$/ }).click();
  await expect(alert).toContainText("The record could not be read");
  await expect(alert).toContainText("items[0]");
  await expect(liveSlab(page)).toHaveCount(0);
});

test("a verdict offers a way forward, and clearing the bench really resets", async ({ page }) => {
  // NEW 2026-07-28. The old surface stopped at a verdict and a download button:
  // the only route back to an empty bench was a page reload, which no reader has
  // a reason to guess. "Where do I go next" was one of the five steps the owner
  // named in the walkthrough review, and it was the one with no answer.
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  // BOTH slots are filled BY HAND, and the first cut of this test did not do
  // that — it clicked the feed's bundled door alone. The record side is
  // OPTIONAL, so its textarea stayed "" for the whole run, and the post-reset
  // assertion that it equals "" was therefore already true BEFORE the reset.
  // Deleting `setRecord(EMPTY)` from `startOver` left this test green —
  // demonstrated by mutation, not argued. A slot must be DIRTY before "it was
  // cleared" asserts anything at all. (Cross-model gate, 2026-07-28.)
  await fillSlot(page, "The feed", FAITHFUL_FEED);
  await fillSlot(page, "The record", FAITHFUL_RECORD);

  // The precondition is ASSERTED, not assumed — it is the half that was
  // missing, and a precondition you trust is how the hole got here.
  for (const label of ["The feed", "The record"]) {
    await expect(
      page.locator(".wk-zone", { hasText: label }).locator("textarea"),
      `${label} must be dirty before the reset, or clearing it proves nothing`,
    ).not.toHaveValue("");
  }

  await page.getByRole("button", { name: /^Run (the audit|the bundled pair|again)$/ }).click();
  const result = liveSlab(page);
  await expect(result).toBeVisible();

  // The ways forward now live ON the verdict: keep the evidence, read a full
  // worked report, or go read what is real. The old "Next steps" nav is gone
  // with the result panel that hosted it; every destination it carried survives.
  await expect(result.getByRole("button", { name: "Download the report" })).toBeVisible();
  await expect(result.getByRole("link", { name: /See a full worked report/ })).toHaveAttribute(
    "href",
    "/report",
  );
  await expect(result.locator(".wk-real").getByRole("link")).toHaveAttribute("href", "/docs");

  // The reset must clear BOTH slots, not just the verdict — a half-cleared
  // bench would run the old feed against nothing and call it a new audit.
  await page.getByRole("button", { name: "Clear both slots" }).click();
  await expect(result).toHaveCount(0);
  await expect(page.locator(".wk-slab")).toHaveAttribute("data-live", "false");
  // The control is never disabled — an empty bench offers the bundled run.
  await expect(page.getByRole("button", { name: "Run the bundled pair" })).toBeEnabled();
  for (const label of ["The feed", "The record"]) {
    const slot = page.locator(".wk-zone", { hasText: label });
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
    ["The feed", "bundled-feed.json"],
    ["The record", "bundled-catalog.json"],
  ] as const) {
    const slot = page.locator(".wk-zone", { hasText: label });
    // The download shares one disclosure with the paste box; open it first —
    // and ASSERT it opened (CI run 30773077581 timed out downstream of here
    // with a cause this seat could not reproduce; if it recurs, fail loudly at
    // the true line, not at waitForEvent).
    await slot.locator("details.wk-paste > summary").click();
    await expect(slot.locator("details.wk-paste")).toHaveAttribute("open", "");

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
    await slot.getByRole("button", { name: /^Load the bundled/ }).click();
    const inline = await slot.locator("textarea").inputValue();
    expect(downloaded, `${fileName} must match the inline sample byte for byte`).toBe(inline);
    expect(() => JSON.parse(downloaded), `${fileName} must be valid JSON`).not.toThrow();
  }
});
