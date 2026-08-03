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
 * workbench, plus named supporting destinations (Report · Fee rules ·
 * How it works · Proof) and the /docs reference. A comment
 * describing a structure the code no longer has is the same defect the product
 * itself exists to catch — a claim broader than the thing backing it.
 *
 * Every rendered figure still derives from the engine (lib/landing/specimen.ts):
 * 16 findings, 11 error, 5 warn; the NYC fee split 17 = 11 + 6; the ×100 price
 * specimen $2,150.00 vs $21.50.
 */

/* ============================ THE LANDING ============================ */

test("landing carries one run through six named stations", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  // Metadata says what the page DOES. The H1 keeps the adopted hero lines.
  await expect(page).toHaveTitle(/audit a marketplace feed against the merchant's records/i);
  const h1 = page.getByRole("heading", { level: 1 });
  await expect(h1).toContainText("Dinner can be ordered while you sleep.");
  await expect(h1).toContainText("What the agent read needs proof.");

  // THE PROCESS STRIP — six stations, named and in order, with NO numerals.
  // Numbered stations would tell a visitor this is a document to be read in
  // order, which is the read the 2026-07-28 de-numbering removed sitewide.
  const strip = page.getByRole("navigation", { name: "Stations" });
  await expect(strip.getByRole("link")).toHaveCount(6);
  expect(await strip.getByRole("link").allTextContents()).toEqual([
    "Inputs",
    "Run",
    "Verdict",
    "Fees",
    "Delivery",
    "Proof",
  ]);
  await expect(strip).not.toContainText(/\d/);
  for (const id of ["audit", "run", "verdict", "fees", "delivery", "proof"]) {
    await expect(page.locator(`section#${id}`)).toHaveCount(1);
  }

  // The stations render as <h2>, IN ORDER. Independent visibility checks would
  // let any permutation pass. INPUTS carries the H1 and RUN's heading is the
  // ticker's own head, so four H2s remain — the run's consequences.
  const h2Sequence = await page.locator("main h2").allTextContents();
  expect(h2Sequence).toEqual([
    "Findings, with the arithmetic attached.",
    "The fee statement, read against the law.",
    "What a human would receive.",
    "The same input, the same receipt, every time.",
  ]);

  // STATION 2 · RUN — idle, the ticker explains what the check IS.
  await expect(page.locator(".wk-ticker")).toContainText("The check, line by line");
  await expect(page.locator(".wk-ticker-idle")).toContainText(
    /matched to the record it should agree with/,
  );

  // STATION 3 · VERDICT — the slab opens on the BUNDLED pair's committed
  // verdict, so the page tells its whole story before a reader runs anything.
  // Every figure derives from the engine (lib/landing/specimen.ts): 16 findings,
  // 11 errors, 5 warnings, 25 feed rows.
  const slab = page.locator(".wk-slab");
  await expect(slab).toHaveAttribute("data-live", "false");
  await expect(slab.locator(".wk-verdict-word")).toHaveText("FAIL");
  const tally = slab.locator(".wk-tally");
  await expect(tally).toContainText("16");
  await expect(tally).toContainText("11");
  await expect(tally).toContainText("5");
  await expect(tally).toContainText("25");
  await expect(slab.locator(".wk-prov")).toContainText("feed side: bundled feed");
  await expect(slab.locator(".wk-prov")).toContainText("record side: bundled catalog");
  // The honesty sentence is part of the object, and its link is reachable.
  await expect(slab.locator(".wk-real")).toContainText(
    "The rules and the arithmetic are real; the merchant is invented.",
  );
  await expect(slab.locator(".wk-real").getByRole("link")).toHaveAttribute("href", "/docs");
  // Two receipts, each citing the rule it stands on and deep-linking to it.
  await expect(slab.locator(".wk-receipt")).toHaveCount(2);
  const chips = slab.locator(".wk-rc-rule");
  await expect(chips).toHaveCount(2);
  for (const href of await chips.evaluateAll((els) => els.map((e) => e.getAttribute("href")))) {
    expect(["/report", "/fees"]).toContain(href);
  }
  // Idle carries no "Download the report" — there is no run of the reader's to keep.
  await expect(slab.getByRole("button", { name: "Download the report" })).toHaveCount(0);

  // STATION 4 · FEES — the 17 = 11 + 6 split, derived, rendered as counts.
  const feesStation = page.locator("section#fees");
  await expect(feesStation).toContainText("17");
  await expect(feesStation).toContainText("11");
  await expect(feesStation).toContainText("6");
  await expect(feesStation.getByRole("link", { name: /Open the fee rules/ })).toHaveAttribute(
    "href",
    "/fees",
  );

  // STATION 5 · DELIVERY — two artifacts, both stamped BUILT NOT SENT, and the
  // Slack payload leading with the BUILDER's own SIMULATED banner (never a
  // string retyped into JSX — evals/packs/landing-delivery-egress.test.ts pins
  // that the component cannot contain a copy of it).
  const artifacts = page.locator(".wk-artifact");
  await expect(artifacts).toHaveCount(2);
  await expect(page.locator(".wk-stamp")).toHaveCount(2);
  for (const stamp of await page.locator(".wk-stamp").allTextContents()) {
    expect(stamp).toBe("Built, not sent");
  }
  await expect(artifacts.first()).toContainText("Slack message");
  await expect(artifacts.first().locator(".wk-sk-banner")).toContainText("SIMULATED DATA");
  await expect(artifacts.nth(1)).toContainText("RFC 5322");
  // RFC 2606 reserved placeholders only — a valid message that can never resolve.
  await expect(artifacts.nth(1).locator(".wk-em-heads")).toContainText("sender.example");
  await expect(artifacts.nth(1).locator(".wk-em-heads")).toContainText("recipient.example");
  await expect(artifacts.nth(1).locator(".wk-em-heads")).toContainText("[SIMULATED]");
  await expect(page.locator(".wk-delivery-note")).toContainText("Nothing is transmitted.");

  // STATION 6 · PROOF — deterministic · the pinned test figure · the published DEFER.
  const trust = page.locator(".trust");
  await expect(trust).toContainText("DETERMINISTIC");
  await expect(trust).toContainText("1,200+");
  await expect(trust).toContainText("automated tests compare the engine");
  await expect(trust.getByText("DEFER", { exact: true })).toBeVisible();

  // The retired landing furniture is gone: the scene, the examination receipt,
  // and the proof-object bar all left this page with the redesign.
  await expect(page.locator(".cs-eyebrow")).toHaveCount(0);
  await expect(page.locator(".seats")).toHaveCount(0);
  await expect(page.locator("article.receipt")).toHaveCount(0);
  await expect(page.locator(".pb-bar")).toHaveCount(0);
});

test("the instrument opens the page — drop zones AND the run control sit above the fold", async ({
  page,
}) => {
  // THE CONTRACT THAT KEPT REGRESSING. Reachability is not the requirement —
  // ARRIVAL is. This pins the requirement itself at the 1280px desktop floor
  // this site is designed for.
  //
  // STRENGTHENED 2026-08-02: the RUN CONTROL now has to clear the fold too. It
  // used to sit below it by design and be `disabled` at first paint, so the
  // page's primary verb arrived out of reach and switched off (DESIGN.md open
  // item 1). The control is never disabled now — with empty slots it reads
  // "Run the bundled pair" — so "can a reader see it and press it without
  // scrolling?" became a real question, and this is the answer.
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  const zones = page.locator(".wk-zone");
  await expect(zones).toHaveCount(2);
  for (let i = 0; i < 2; i++) {
    const box = await zones.nth(i).boundingBox();
    expect(box, `drop zone ${i} must render`).not.toBeNull();
    // WHOLLY above the fold, not merely starting above it: a zone beginning at
    // 880 is 'above the fold' by the weaker reading while being almost entirely
    // below it.
    expect(
      box!.y + box!.height,
      `drop zone ${i} must sit ENTIRELY within the first screen`,
    ).toBeLessThanOrEqual(900);
  }

  const runBtn = page.getByRole("button", { name: "Run the bundled pair" });
  await expect(runBtn).toBeVisible();
  await expect(runBtn).toBeEnabled();
  const btnBox = await runBtn.boundingBox();
  expect(btnBox, "the run control must render").not.toBeNull();
  expect(
    btnBox!.y + btnBox!.height,
    "the run control must sit ENTIRELY within the first screen",
  ).toBeLessThanOrEqual(900);
});

test("one click on the empty bench runs the bundled pair end to end", async ({ page }) => {
  // The empty-slot path IS the bundled run: the door and the verb agree, so a
  // first-time reader sees the whole instrument work without supplying a file.
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  const slab = page.locator(".wk-slab");
  await expect(slab).toHaveAttribute("data-live", "false");

  await page.getByRole("button", { name: "Run the bundled pair" }).click();

  // The run is the reader's now, and the slab says so.
  await expect(slab).toHaveAttribute("data-live", "true");
  await expect(slab.locator(".wk-verdict-word")).toHaveText("FAIL");
  await expect(slab.locator(".wk-prov-line")).toContainText("computed in your browser just now");
  await expect(slab.locator(".wk-prov-line")).toContainText("bundled records");
  await expect(slab.getByRole("button", { name: "Download the report" })).toBeVisible();

  // Both slots filled themselves, and the control offers the next run.
  await expect(page.locator(".wk-zone.is-filled")).toHaveCount(2);
  await expect(page.getByRole("button", { name: "Run again" })).toBeVisible();

  // The ticker settled on the REAL tally, and every streamed line is a check
  // that genuinely ran — HELD lines carry the rule id the engine cited.
  const ticker = page.locator(".wk-ticker");
  await expect(ticker.locator(".wk-ticker-sum")).toContainText("every claim checked");
  await expect(ticker.locator(".wk-ticker-sum")).toContainText("16 findings");
  await expect(ticker.locator(".wk-tk-line")).not.toHaveCount(0);
  for (const held of await ticker.locator(".wk-tk-v.held").all()) {
    await expect(held).toHaveText("HELD");
  }

  // The delivery artifacts rebuilt from THIS run and still lead with the banner.
  await expect(page.locator(".wk-artifact").first().locator(".wk-sk-banner")).toContainText(
    "SIMULATED DATA",
  );
});

test("landing footer: disclaimer-free, honest, and product chrome only", async ({
  page,
}) => {
  await page.goto("/");
  const footer = page.locator("footer.site-footer");
  await expect(footer).toBeVisible();
  await expect(footer).toContainText("Sharan Kumar");
  // Exactly one <footer> — the chrome never grows a second. This is the only
  // remaining carrier of that contract (the legacy suite that also held it was
  // deleted with the archive routes, 2026-08-02).
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

  // The footer nav is ONE link: the /docs honesty statement. Owner directive
  // 2026-08-02 retired the archive door and the source-repository link — the
  // product stops carrying its own scaffolding. What cannot go is /docs: RULES
  // §4(b) requires the "what is real, what is invented" statement to stay
  // reachable from every page's footer.
  const footerNav = page.getByRole("navigation", { name: "Footer" });
  await expect(footerNav.getByRole("link")).toHaveCount(1);
  await expect(footerNav.getByRole("link", { name: "Documentation", exact: true })).toHaveAttribute(
    "href",
    "/docs",
  );

  // No page on the site links a source repository or the retired archive.
  await expect(footer.locator('a[href*="github.com"]')).toHaveCount(0);
  await expect(footer.locator('a[href^="/legacy"]')).toHaveCount(0);
});

/* The landing "Break the feed yourself" TryBench test was retired 2026-07-28
 * together with the component. It mirrored ONE price rule in page-local code
 * and needed an equivalence pack to prove the mirror still matched the engine.
 * The workbench above runs the REAL engine on the reader's own two files, so
 * the mirror is not simplified \u2014 it is gone, and with it the entire class of
 * mirror-drift defect the pack existed to catch. */


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
    ["/report", "Report", /What the feed claims vs\. what the records say\./],
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
  //
  // The Audit link TARGETS `/#audit` (owner word 2026-07-31: the emphasized
  // pill used to point at "/", so on the landing page it navigated nowhere)
  // while the ROUTE it represents is still "/". aria-current must follow the
  // route, not the href — pin both facts, because keying the component off the
  // href is exactly the regression this asserts against.
  //
  // The positive count comes FIRST and is what makes the zero mean anything: a
  // bare `toHaveCount(0)` also passes on an empty nav, a renamed landmark, or a
  // locator that resolves to nothing — the survivor shape the mutation pass
  // exists to catch.
  await expect(nav.getByRole("link")).toHaveCount(5);
  const audit = nav.locator('a[href="/#audit"]');
  await expect(audit).toHaveCount(1);
  await expect(nav.locator('a[href="/"]')).toHaveCount(0);
  await page.goto("/report");
  await expect(audit).not.toHaveAttribute("aria-current", "page");
  await page.goto("/");
  await expect(audit).toHaveAttribute("aria-current", "page");
});

test("the nav carries no self-captioning readout — production register (owner word 2026-08-02)", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".nav-case")).toHaveCount(0);
  await expect(page.locator("nav, header").first()).not.toContainText("RUNS IN YOUR BROWSER");
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

/* ====================== DELETED-ROUTE POLICY ====================== */

test("every deleted URL serves the site's 404 — no redirect rescues it", async ({ page }) => {
  test.slow(); // one full navigation per dead route

  // WHAT CHANGED AND WHY. These paths used to be meta-refresh redirect stubs
  // pointing at /proof, the front page, and the archived activation module. The
  // owner retired the archive and the scaffolding from the product on
  // 2026-08-02: git history is the archive, and the site stops carrying its own
  // build history as chrome. A redirect would have kept that history alive in
  // the URL space, so none was added — the honest answer to "is this page part
  // of the product?" is the 404, and this test is what keeps it honest. If a
  // redirect is ever reintroduced for one of these, this fails.
  //
  // VERIFICATION STATUS AT AUTHORING. Every assertion below was validated in
  // ARTIFACT mode by running scripts-ts/serve-artifact.mts's own resolution
  // logic over the built out/: all eleven paths fall through to out/404.html at
  // status 404, the server emits no 3xx (so the URL cannot move), and all six
  // routes the not-found page offers resolve 200. DEV mode was NOT executed —
  // the authoring environment could not bind a port — so the dev-server status
  // code is the one unverified assumption here. If dev diverges, the divergence
  // itself is the finding: the two configs are supposed to agree.
  const DELETED = [
    "/eval",
    "/metrics",
    "/cost",
    "/demo",
    "/audit",
    "/console",
    "/merchant/M001",
    "/legacy",
    "/legacy/console",
    "/legacy/audit",
    "/legacy/merchant/M001",
  ];

  for (const path of DELETED) {
    const response = await page.goto(path);
    // The URL must not move: a 404 that silently lands somewhere else is a
    // redirect wearing a different hat.
    expect(page.url(), `${path} navigated away — something is redirecting it`).toContain(path);
    if (response) {
      expect(response.status(), `${path} did not answer 404`).toBe(404);
    }
    await expect(
      page.getByRole("heading", { level: 1 }),
      `${path} did not render the site's not-found page`,
    ).toContainText("Nothing is served at this path");
  }

  // CONTROL: the same probe on a path that never existed behaves identically,
  // so the assertions above are testing the 404 and not some deleted-route
  // special case.
  const control = await page.goto("/this-path-has-never-existed");
  if (control) expect(control.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Nothing is served at this path",
  );

  // The not-found page offers only routes that are actually served.
  const hrefs = await page
    .locator("main a[href^='/']")
    .evaluateAll((els) => els.map((e) => e.getAttribute("href") ?? ""));
  expect(hrefs.length, "the not-found page offers no routes at all").toBeGreaterThan(0);
  for (const href of hrefs) {
    const res = await page.request.get(href);
    expect(res.status(), `the 404 page offers ${href}, which does not serve`).toBe(200);
  }
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
    await expect(page.getByRole("button", { name: "Run the bundled pair" })).toBeHidden();
    await expect(page.locator(".wk-zones")).toBeHidden();
    await expect(
      page.getByText(/runs entirely in your browser and needs scripting turned on/),
    ).toBeVisible();
    // And it must not imply a server is involved — the promise survives no-JS.
    await expect(page.getByText(/Nothing runs on a server either way/)).toBeVisible();

    // THE FLOOR MOVED AGAIN, AND ROSE (2026-08-02). It used to rest on the
    // examination receipt and the proof bar, both of which left this page with
    // the redesign. What replaces them is stronger: every station downstream of
    // the tool has a complete IDLE state built on the SERVER from the bundled
    // pair's committed report, so a reader without scripting still gets the
    // whole story — the verdict, its receipts, and the messages a human would
    // receive — rather than a page of empty cards.
    // The RUN station is labelled by the ticker's own head, which is a client
    // component — so the label only exists if that component SSRs. Pinned here
    // because a section whose `aria-labelledby` points at nothing is an
    // accessible-name failure that only shows up without scripting.
    await expect(page.locator("#run-h")).toHaveCount(1);
    await expect(page.locator("section#run")).toHaveAttribute("aria-labelledby", "run-h");

    const slab = page.locator(".wk-slab");
    await expect(slab).toHaveAttribute("data-live", "false");
    await expect(slab.locator(".wk-verdict-word")).toHaveText("FAIL");
    await expect(slab.locator(".wk-tally")).toContainText("16");
    await expect(slab.locator(".wk-receipt")).toHaveCount(2);
    await expect(slab.locator(".wk-real")).toContainText("the merchant is invented");
    // The delivery artifacts are server-built, so they survive no-JS intact —
    // including the builder's own banner.
    await expect(page.locator(".wk-artifact")).toHaveCount(2);
    await expect(page.locator(".wk-sk-banner")).toContainText("SIMULATED DATA");
    await expect(page.locator(".wk-em-heads")).toContainText("sender.example");
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
    for (const retired of [
      "Try it live",
      "CONTINUE ·",
      "CASE 001",
      // Retired with the archive + scaffolding cut (owner directive 2026-08-02).
      "Legacy activation",
      "In plain terms:",
    ]) {
      expect(main, `${route} still advertises the retired name "${retired}"`).not.toContain(retired);
    }
  }
});
