import { test, expect } from "@playwright/test";

/**
 * CANONICAL-PRODUCT e2e contract — the v9 takeover surface (consolidated e2e
 * rewrite after build pieces 1–3, 2026-07-20). Runs under BOTH configs: dev
 * (playwright.config.ts) and artifact mode (playwright.artifact.config.ts). A
 * behavior that only holds in dev is a defect.
 *
 * REWRITTEN 2026-07-28. This header used to describe "one continuing case
 * across four numbered chapters — 01 /report · 02 /fees · 03 /playground ·
 * 04 /proof". That grammar is gone: the site is a TOOL that opens on the
 * workbench, plus named supporting destinations (Example report · Fee rules ·
 * How it works · Proof) and the /docs reference and /legacy archive. A comment
 * describing a structure the code no longer has is the same defect the product
 * itself exists to catch — a claim broader than the thing backing it.
 *
 * Every rendered figure still derives from the engine (lib/landing/specimen.ts):
 * 16 findings, 11 error, 5 warn; the NYC fee split 17 = 11 + 6; the ×100 price
 * specimen $2,150.00 vs $21.50.
 */

/* ============================ THE LANDING ============================ */

test("landing leads with the working tool, then explains itself", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  // Metadata now says what the page DOES. The H1 keeps the adopted hero lines.
  await expect(page).toHaveTitle(/audit a marketplace feed against the merchant's records/i);
  const h1 = page.getByRole("heading", { level: 1 });
  await expect(h1).toContainText("Dinner can be ordered while you sleep.");
  await expect(h1).toContainText("What the agent read needs proof.");

  // The five beats render as <h2>, IN ORDER. The tool comes FIRST and the
  // explanatory scene follows it — a diagram belongs after the thing it
  // explains. Independent visibility checks would let any permutation pass.
  const h2Sequence = await page.locator("main h2").allTextContents();
  expect(h2Sequence).toEqual([
    "Audit a feed.",
    "A claim is checked before the order is placed.",
    "The check runs in the open.",
    "Two kinds of claim.",
    "The same input, the same receipt, every time.",
  ]);

  // The proof-object bar renders the REAL held-claim specimen (no invented values).
  const proofBar = page.locator(".pb-bar");
  await expect(proofBar).toContainText("HOLD");
  await expect(proofBar).toContainText("THE MENU: 2150");
  await expect(proofBar).toContainText("THE MERCHANT RECORD: 21.50");
  await expect(proofBar).toContainText("100\u00d7 THE RECORD");

  // The examination receipt carries the derived finding + arithmetic. The
  // "CASE 001" prefix is gone: a case number that never changes is somebody
  // else's case, and it was one of the markers that made this read as a
  // display piece rather than a tool.
  const receipt = page.locator("article.receipt").first();
  await expect(receipt).toContainText("CURBSIDE COMMONS \u00b7 EXAMINATION RECEIPT");
  await expect(receipt).toContainText("FINDING 11 OF 16");
  await expect(receipt).not.toContainText("CASE 001");
  await expect(receipt).toContainText("2150.00 \u00d7 100 = 215,000\u00a2");
  await expect(receipt.locator(".stamp")).toHaveText("HOLD");

  // What it checks: two plain cards. The FILE A / FILE B tab cuts and the big
  // stat rows are gone; the figures survive INSIDE the prose, still derived.
  const listings = page.locator("section.file").first();
  await expect(listings).not.toContainText("FILE A");
  await expect(listings.getByRole("heading", { name: "What the listing says" })).toBeVisible();
  await expect(listings).toContainText("16 findings \u2014 11 errors and 5 warnings");
  await expect(listings.getByRole("link", { name: /See the worked example/ })).toHaveAttribute(
    "href",
    "/report",
  );
  const fees = page.locator("section.file.law");
  await expect(fees).not.toContainText("FILE B");
  await expect(fees.getByRole("heading", { name: "What the fee statement says" })).toBeVisible();
  // The 17 = 11 + 6 split, in prose. Asserted with the spaces, because a
  // rewrite of this page rendered "17codified": JSX trims the lines of a text
  // node and rejoins them, so a space sitting after a }} can vanish even
  // though the source plainly contains it. Nothing else in the suite can see
  // that class of defect.
  await expect(fees).toContainText("applies 17 codified rules");
  await expect(fees).toContainText("11 checkable from the statement itself");
  await expect(fees).toContainText("6 that need outside evidence");
  await expect(fees.getByRole("link", { name: /Open the fee rules/ })).toHaveAttribute(
    "href",
    "/fees",
  );

  // Trust facts \u2014 deterministic \u00b7 the pinned test figure \u00b7 the published DEFER.
  const trust = page.locator(".trust");
  await expect(trust).toContainText("DETERMINISTIC");
  await expect(trust).toContainText("1,200+");
  await expect(trust).toContainText("automated tests compare the engine");
  await expect(trust.getByText("DEFER", { exact: true })).toBeVisible();

  // The audience eyebrow and the three-seat band are gone (owner, 2026-07-28):
  // both were positioning copy, never a next step.
  await expect(page.locator(".cs-eyebrow")).toHaveCount(0);
  await expect(page.locator(".seats")).toHaveCount(0);
  await expect(page.getByText("FOR MERCHANTS")).toHaveCount(0);
});

test("the tool opens the page \u2014 both drop zones sit above the fold", async ({ page }) => {
  // THE CONTRACT THAT KEPT REGRESSING. Session 36 built the workbench and put
  // it in section four of page three, ~2990px down; the owner returned with the
  // same complaint. Reachability is not the requirement \u2014 ARRIVAL is. This
  // pins the requirement itself rather than a proxy for it, at the 1280px
  // desktop floor this site is designed for.
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  for (const label of ["The feed", "The record"]) {
    const slot = page.locator(".fd-slot", { hasText: label });
    await expect(slot).toBeVisible();
    // Measure `.fd-zone`, the actual drop target — NOT `.fd-slot`, which also
    // contains the title and hint above it. Measuring the slot would let added
    // header copy sink the real drop zone past the fold while the assertion
    // still passed: a test that holds while the requirement it names breaks.
    const zone = slot.locator(".fd-zone");
    const box = await zone.boundingBox();
    expect(box, `${label} drop zone must render`).not.toBeNull();
    // WHOLLY above the fold, not merely starting above it. `y < 900` was the
    // original assertion and it is weaker than the requirement it names: a zone
    // beginning at 880 is 'above the fold' by that measure while being almost
    // entirely below it. Measured today the zones run 657.5 → 871.7, so the
    // stricter reading holds with ~28px of headroom and costs nothing.
    expect(
      box!.y + box!.height,
      `${label} drop zone must sit ENTIRELY within the first screen`,
    ).toBeLessThanOrEqual(900);
  }

  // The run control sits BELOW the fold, and that is by design — it follows
  // both drop zones (measured: button top 970.5 vs record zone bottom 871.7).
  // The previous assertion here was `toBeVisible()`, which in Playwright means
  // "has a box and is not hidden" and says NOTHING about the viewport; paired
  // with a comment claiming the control was reachable "without hunting for it",
  // it read as a fold guarantee it never made. What is actually true, and worth
  // pinning, is that the button is the NEXT thing after the zones rather than
  // buried further down the page. (Cross-model gate, 2026-07-28.)
  const runBtn = page.getByRole("button", { name: "Run the audit" });
  await expect(runBtn).toBeVisible();
  const btnBox = await runBtn.boundingBox();
  const recordZone = await page
    .locator(".fd-slot", { hasText: "The record" })
    .locator(".fd-zone")
    .boundingBox();
  expect(
    btnBox!.y - (recordZone!.y + recordZone!.height),
    "the run control must follow the drop zones immediately, not sit further down the page",
  ).toBeLessThan(200);
});

test("landing footer: disclaimer-free, honest, and exactly the three chrome links", async ({
  page,
}) => {
  await page.goto("/");
  const footer = page.locator("footer.site-footer");
  await expect(footer).toBeVisible();
  await expect(footer).toContainText("Sharan Kumar");
  // Exactly one <footer> — the chrome never grows a second (legacy contract).
  await expect(page.locator("footer")).toHaveCount(1);

  const footerText = (await footer.innerText()).toLowerCase();
  for (const gone of [
    "doordash",
    "uber eats",
    "grubhub",
    "datasf",
    "not affiliated",
    "simulated data throughout",
    "no sends",
    "owner-armed send",
    // The owner-authorized freeze-reversal retired the prototype line from the
    // chrome (2026-07-20) — it must appear nowhere in the footer.
    "working prototype",
  ]) {
    expect(footerText, `footer should be disclaimer-free — found "${gone}"`).not.toContain(gone);
  }
  for (const banned of ["no ai was used", "actual doordash data", "production platform data"]) {
    expect(footerText, `footer must make no false claim — found "${banned}"`).not.toContain(banned);
  }

  // The footer nav is the three-link real-product chrome, no more, no less.
  const footerNav = page.getByRole("navigation", { name: "Footer" });
  await expect(footerNav.getByRole("link")).toHaveCount(3);
  await expect(footerNav.getByRole("link", { name: "Documentation", exact: true })).toHaveAttribute(
    "href",
    "/docs",
  );
  await expect(
    footerNav.getByRole("link", { name: "Legacy activation", exact: true }),
  ).toHaveAttribute("href", "/legacy/console");
  await expect(footerNav.getByRole("link", { name: "GitHub", exact: true })).toBeVisible();
});

/* The landing "Break the feed yourself" TryBench test was retired 2026-07-28
 * together with the component. It mirrored ONE price rule in page-local code
 * and needed an equivalence pack to prove the mirror still matched the engine.
 * The workbench above runs the REAL engine on the reader's own two files, so
 * the mirror is not simplified \u2014 it is gone, and with it the entire class of
 * mirror-drift defect the pack existed to catch. */

test("commons scene: reduced motion settles complete; the pause control is real (WCAG 2.2.2)", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  // Under reduced motion the scene opens on its settled state — order placed, proof attached.
  await expect(page.locator(".cs-status-live")).toContainText(
    "SCENE SETTLED · ORDER PLACED WITH PROOF",
  );
  // The primary CTA runs the check. The secondary is a native link — it now
  // goes to the worked report, because the tool it used to advertise is on
  // this page, above this band.
  await expect(page.getByRole("button", { name: "Watch a claim get held" })).toBeVisible();
  await expect(page.getByRole("link", { name: "See a full worked report" })).toHaveAttribute(
    "href",
    "/report",
  );
});

test("commons scene pause/play genuinely toggles the motion loop", async ({ page }) => {
  // Motion allowed (default) — the loop runs, so the control reads "Pause motion".
  await page.goto("/");
  const pause = page.getByRole("button", { name: "Pause motion" });
  await expect(pause).toBeVisible();
  await pause.click();
  await expect(page.getByRole("button", { name: "Play motion" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Pause motion" })).toHaveCount(0);
});

/* ============================== THE NAV ============================== */

test("nav = named destinations, no chapter numerals; each reachable with aria-current", async ({
  page,
}) => {
  test.slow(); // dev mode compiles + client-navigates every destination in one run
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Sections" });

  // No retired v8 tabs survive.
  await expect(nav.getByRole("link", { name: "Console", exact: true })).toHaveCount(0);
  await expect(nav.getByRole("link", { name: "Evidence", exact: true })).toHaveCount(0);

  // AND no chapter numerals return. Numbered destinations tell a visitor this
  // is a document to be read in order (owner, 2026-07-28).
  await expect(nav.locator(".num")).toHaveCount(0);
  await expect(nav).not.toContainText(/\b0[1-4]\b/);

  const destinations: Array<[string, string, RegExp]> = [
    ["/report", "Example report", /What the feed claims vs\. what the records say\./],
    ["/fees", "Fee rules", /A fee statement,/],
    ["/playground", "How it works", /The engine,/],
    ["/proof", "Proof", /Every verdict is scored once/],
  ];
  for (const [href, label, h1] of destinations) {
    const link = nav.locator(`a[href="${href}"]`);
    await expect(link).toHaveCount(1);
    await expect(link).toContainText(label);
    await link.click();
    // 15s: dev mode compiles each surface on first hit (artifact mode is instant).
    await expect(page.getByRole("heading", { level: 1 }).first()).toContainText(h1, {
      timeout: 15_000,
    });
    await expect(nav.locator(`a[href="${href}"]`)).toHaveAttribute("aria-current", "page");
  }

  // Home is the tool, and it is exact-match only — "/" prefix-matches every
  // route, so a naive check would light every destination at once.
  await page.goto("/report");
  await expect(nav.locator('a[href="/"]')).not.toHaveAttribute("aria-current", "page");
  await page.goto("/");
  await expect(nav.locator('a[href="/"]')).toHaveAttribute("aria-current", "page");
});

test("the nav readout states something true of the route you are on", async ({ page }) => {
  test.slow(); // seven full-navigation route loads in one run (dev compile)
  // Was "CASE 001 · <FILE> · …" on every route: a case number that never
  // changes, describing somebody else's data. On the tool it now states the
  // promise a visitor most needs before dropping a file in.
  const routes: Array<[string, RegExp]> = [
    ["/", /RUNS IN YOUR BROWSER · NOTHING IS UPLOADED/],
    ["/report", /EXAMPLE REPORT · FAIL · 11 ERR · 5 WARN/],
    ["/fees", /FEE RULES · NEW YORK CITY/],
    ["/playground", /HOW IT WORKS · RUNS IN YOUR BROWSER/],
    ["/proof", /PROOF · EVERY SCORE, MISSES KEPT IN/],
    ["/docs", /REFERENCE · WHAT IS REAL, WHAT IS INVENTED/],
    ["/legacy", /ARCHIVE · LEGACY MODULE/],
  ];
  for (const [path, readout] of routes) {
    await page.goto(path);
    await expect(page.locator(".nav-case")).toContainText(readout, { timeout: 15_000 });
    await expect(page.locator(".nav-case")).not.toContainText("CASE 001");
  }
});

/* ========================= CHAPTER 01 · REPORT ======================= */

test("report: the chapter head, the ×100 jewel, and the sixteen-row ledger", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/report");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "What the feed claims vs. what the records say.",
  );

  // Verdict status chips — the derived tally.
  const status = page.locator(".p2-status");
  await expect(status.getByText("FAIL", { exact: true })).toBeVisible();
  await expect(status.getByText("16 FINDINGS")).toBeVisible();
  await expect(status.getByText("11 ERRORS")).toBeVisible();
  await expect(status.getByText("5 WARNINGS")).toBeVisible();

  // The jewel — settled (reduced motion) at the full ×100 arithmetic.
  const jewel = page.locator("#jewel");
  await expect(jewel.locator(".j-label")).toContainText("FINDING 11 OF 16 · THE ×100 CLAIM");
  await expect(jewel.locator(".j-fig.bad")).toContainText("215,000¢");
  await expect(jewel.locator(".j-seal")).toHaveText("RULE · LST-PRICE-CENTS-AS-DECIMAL");

  // The full accession ledger — all sixteen findings render as register rows.
  const rows = page.locator("ol.idx-list > li");
  await expect(rows).toHaveCount(16);
  // The benched finding is marked on the receipt above.
  await expect(page.locator("ol.idx-list > li.bench")).toContainText("ON THE RECEIPT ABOVE");

  // The door continues to the fee rules.
  const door = page.getByRole("link", { name: /NEXT/ }).first();
  await expect(door).toHaveAttribute("href", "/fees");
});

test("report ledger filters are keyboard-operable honest buttons (aria-pressed, row counts move)", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/report");
  const group = page.getByRole("group", { name: "Filter findings by severity" });
  await expect(group).toBeVisible();
  // No tablist semantics — these are plain toggle buttons.
  await expect(page.locator('[role="tablist"], [role="tab"]')).toHaveCount(0);

  const rows = page.locator("ol.idx-list > li");
  const all = group.getByRole("button", { name: /^ALL/ });
  const errors = group.getByRole("button", { name: /^ERRORS/ });
  const warnings = group.getByRole("button", { name: /^WARNINGS/ });
  await expect(all).toHaveAttribute("aria-pressed", "true");
  await expect(rows).toHaveCount(16);

  await errors.click();
  await expect(errors).toHaveAttribute("aria-pressed", "true");
  await expect(all).toHaveAttribute("aria-pressed", "false");
  await expect(rows).toHaveCount(11);

  // Keyboard: focus + Enter operates the toggle.
  await warnings.focus();
  await page.keyboard.press("Enter");
  await expect(warnings).toHaveAttribute("aria-pressed", "true");
  await expect(rows).toHaveCount(5);
});

/* ========================== CHAPTER 04 · PROOF ====================== */

test("proof: the logbook masthead, the calibration plate, the crew, and the doors", async ({
  page,
}) => {
  await page.goto("/proof");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Every verdict is scored once, against a bar set in advance.",
  );
  await expect(page.getByRole("heading", { level: 1 })).toContainText("The misses are kept in.");

  // The masthead keys.
  const masthead = page.locator(".p4-masthead");
  for (const k of ["EVALUATION SETS", "EACH SCORED", "RESULTS", "MISSES"]) {
    await expect(masthead.getByText(k, { exact: true })).toBeVisible();
  }

  // The calibration plate carries the DEFERRED→CALIBRATED arc + earned label.
  const cal = page.locator(".cal");
  await expect(cal.locator(".vd.defer")).toHaveText("DEFERRED");
  await expect(cal.locator(".vd.pass")).toHaveText("CALIBRATED");
  await expect(cal).toContainText("Earned label:");
  // JS + motion proven → the replay control renders (never a dead no-JS button).
  await expect(page.getByRole("button", { name: "Replay the count-up" })).toBeVisible();

  // The crew: two agents, two deterministic workflows, and the iron rule.
  await expect(page.locator(".mem-kind.agent")).toHaveCount(2);
  await expect(page.locator(".mem-kind.flow")).toHaveCount(2);
  await expect(page.locator(".iron")).toContainText(
    "Agents recommend; the engine decides; a human owns anything irreversible.",
  );
  // The two recorded replay consoles.
  await expect(page.locator(".p4-console")).toHaveCount(2);

  // The reference-retrieval rail keeps its honest DEFER on the surface (scoped:
  // the calibration sr-sentence also contains the phrase).
  await expect(page.locator(".spec4 .vd.defer")).toHaveText("LABEL DEFERRED");

  // Signed approvals — the seven checks.
  await expect(page.locator("ol.checks > li.check")).toHaveCount(7);

  // The doors: back to 01, plus the /docs reference line.
  // The last door goes to the TOOL, not back into the narrative: after the
  // evidence, the next useful act is running it on your own feed.
  await expect(page.getByRole("link", { name: /BACK TO THE TOOL/ })).toHaveAttribute("href", "/");
  await expect(page.locator(".docs-line").getByRole("link", { name: "Documentation" })).toHaveAttribute(
    "href",
    "/docs",
  );
});

/* ============================ /docs REFERENCE ======================== */

test("docs: the architecture figure, the iron rule, the MCP tool table, and the honesty statement", async ({
  page,
}) => {
  await page.goto("/docs");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("How the instrument works.");

  // The architecture diagram is a labelled figure (role=img with a name).
  await expect(page.getByRole("img", { name: "Curbside Commons architecture" })).toBeVisible();

  await expect(page.locator(".docs-iron")).toContainText(
    "Agents recommend; the engine decides; a human owns anything irreversible.",
  );

  // The seven MCP tools, by name.
  const toolNames = page.locator(".tools .t-name");
  await expect(toolNames).toHaveCount(7);
  for (const tool of [
    "check_feed",
    "check_conformance",
    "audit_statement",
    "classify_and_audit",
    "get_rule",
    "lookup_reference",
    "run_demo",
  ]) {
    await expect(toolNames.filter({ hasText: tool })).toHaveCount(1);
  }

  // The delivery builders + the CLI console excerpt.
  await expect(page.getByRole("heading", { name: "Slack builder" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Email builder" })).toBeVisible();
  await expect(page.getByText("node bin/check.mjs demo")).toBeVisible();

  // The site's one background honesty carrier — "What is real, and what is invented."
  await expect(page.getByRole("heading", { name: "What is real, and what is invented." })).toBeVisible();
  const statement = page.locator(".statement");
  await expect(statement).toContainText("The fee rules are codified from real published law");
  await expect(statement).toContainText("No real platform feed or statement was audited.");
});

/* ======================= REDIRECT STUB POLICY ======================= */

test("old dashboard URLs meta-refresh to /proof; /demo to the front page; /audit to /legacy/audit", async ({
  page,
}) => {
  // These stubs use an instant `<meta http-equiv="refresh" content="0;...">`,
  // which can abort the initial `page.goto` (ERR_ABORTED) when the refresh fires
  // before the load event — the redirect IS the expected behavior, so tolerate
  // the aborted navigation and assert on the destination the refresh lands on.
  for (const from of ["/eval", "/metrics", "/cost"]) {
    await page.goto(from).catch(() => {});
    await expect(page).toHaveURL(/\/proof/, { timeout: 10_000 });
  }
  await page.goto("/demo").catch(() => {});
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Dinner can be ordered while you sleep.",
    { timeout: 10_000 },
  );
  await page.goto("/audit").catch(() => {});
  await expect(page).toHaveURL(/\/legacy\/audit/, { timeout: 10_000 });
});

/* =========================== NO-JS FLOORS =========================== */

test.describe("no-JS completeness (SSR floors)", () => {
  test.use({ javaScriptEnabled: false });

  test("landing opens complete without scripting, and the tool says so honestly", async ({
    page,
  }) => {
    await page.goto("/");
    // The hero copy is real SSR DOM (the settled-scene status lives in a
    // <noscript> block Playwright does not surface as visible — asserted via the
    // real rendered DOM below instead).
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Dinner can be ordered while you sleep.",
    );

    // THE FLOOR THAT MOVED, NOT THE FLOOR THAT WENT AWAY. This used to assert
    // the try-bench's SSR verdict. That bench is gone, and the page now opens
    // on a tool that genuinely CANNOT work without scripting — the whole audit
    // runs client-side. So the floor becomes: no dead controls, and the reason
    // stated in words. A drop zone that silently does nothing is worse than one
    // that is honest about needing JS.
    await expect(page.getByRole("button", { name: "Run the audit" })).toBeHidden();
    await expect(page.locator(".wb-slots")).toBeHidden();
    await expect(
      page.getByText(/runs entirely in your browser and needs scripting turned on/),
    ).toBeVisible();
    // And it must not imply a server is involved — the promise survives no-JS.
    await expect(page.getByText(/Nothing runs on a server either way/)).toBeVisible();

    // The explanatory half of the page still opens complete: the receipt is
    // SSR-settled, so a no-JS reader still learns what the product does.
    await expect(page.locator("article.receipt").first()).toContainText("FINDING 11 OF 16");
    await expect(page.locator(".pb-bar")).toContainText("HOLD");
  });

  test("fees renders every example month without scripting; the month tabs are hidden", async ({
    page,
  }) => {
    await page.goto("/fees");
    await expect(page.locator(".fee-month")).toHaveCount(4);
    await expect(page.locator(".fee-months .mtabs")).toBeHidden();
  });

  test("playground renders the settled reference result without scripting", async ({ page }) => {
    await page.goto("/playground");
    // The reader-operated preset cards are interactive-only (absent under no-JS).
    await expect(page.locator(".pcards")).toHaveCount(0);
    // The settled reference bench still tells the whole story.
    await expect(page.locator(".vpanel .vstamp")).toContainText("FAIL");
    await expect(page.locator(".vpanel .vtally")).toContainText(
      "16 findings — 11 error · 5 warn · 0 info",
    );
  });
});

test("every door's label agrees with where it actually goes", async ({ page }) => {
  // TWO DOORS DISAGREED WITH THEMSELVES after the 2026-07-28 rename: /proof
  // said "BACK TO THE TOOL" and went to /report, and /fees promised "audit your
  // own feed" while pointing at /playground — which is now the DEMO page, not
  // the tool. Both are the same defect class this repo keeps meeting: a surface
  // that is technically correct and communicates the wrong thing. A rename
  // always leaves these behind, and nothing else in the suite looks for them.
  test.slow();

  // THE DENOMINATOR COMES FROM HERE, NOT FROM THE PAGE. The first cut of this
  // test filtered doors by `/audit your own feed/i` and checked three routes.
  // Both halves of that were wrong, and provably so: the very defect it was
  // written for — /fees reading "Try it live" while pointing at /playground —
  // does NOT contain that phrase, so the filter skipped it. What actually
  // caught that one was the retired-name sweep below, keyed to a dead NAME
  // rather than to label-vs-destination agreement. A door renamed to any other
  // wording and repointed anywhere passed green, and /report was never visited
  // at all.
  //
  // This repo has already paid for this exact shape once: a completeness check
  // that takes its denominator from the OBSERVATIONS can only ever confirm what
  // is present (session 35 — the scorer that certified a 19-case run complete).
  // So the full set of doors is DECLARED, and the page is checked against it.
  // Adding a door, deleting one, renaming one, or repointing one all fail here.
  const DOORS: Readonly<Record<string, ReadonlyArray<{ title: string; href: string }>>> = {
    "/": [],
    "/report": [{ title: "Fee rules", href: "/fees" }],
    "/fees": [{ title: "Audit your own feed", href: "/" }],
    "/proof": [{ title: "Audit your own feed", href: "/" }],
    "/playground": [
      { title: "Audit your own feed", href: "/" },
      { title: "Proof", href: "/proof" },
    ],
    "/docs": [],
  };

  for (const [route, expected] of Object.entries(DOORS)) {
    await page.goto(route);
    const doors = page.locator("a.door");

    // Count first: a door the specification does not know about is exactly the
    // residue a rename leaves behind, and it is invisible to any per-door loop.
    await expect(doors, `${route}: door COUNT disagrees with the specification`).toHaveCount(
      expected.length,
    );

    for (let i = 0; i < expected.length; i++) {
      const door = doors.nth(i);
      await expect(
        door.locator(".d-title"),
        `${route} door ${i}: label drifted from the specification`,
      ).toHaveText(expected[i].title);
      await expect(
        door,
        `${route} door ${i} says "${expected[i].title}" — it must GO to ${expected[i].href}`,
      ).toHaveAttribute("href", expected[i].href);
    }
  }

  // And no door may advertise a destination name the site no longer uses.
  for (const route of ["/", "/report", "/fees", "/proof", "/playground", "/docs"]) {
    await page.goto(route);
    const main = await page.locator("main").innerText();
    for (const retired of ["Try it live", "CONTINUE ·", "CASE 001"]) {
      expect(main, `${route} still advertises the retired name "${retired}"`).not.toContain(retired);
    }
  }
});
