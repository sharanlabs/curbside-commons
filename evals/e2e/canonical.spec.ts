import { test, expect } from "@playwright/test";

/**
 * CANONICAL-PRODUCT e2e contract — the v9 takeover surface (consolidated e2e
 * rewrite after build pieces 1–3, 2026-07-20). Runs under BOTH configs: dev
 * (playwright.config.ts) and artifact mode (playwright.artifact.config.ts). A
 * behavior that only holds in dev is a defect.
 *
 * Supersedes the retired v8 console contract (7-chapter landing arc, Evidence
 * Bench, Coverage tablist, Method words, the /eval dashboard, /demo copy, and
 * the 8-tab nav). The v9 site is one continuing case across four numbered
 * chapters — 01 /report · 02 /fees · 03 /playground · 04 /proof — plus the
 * /docs reference and the /legacy archive. Every rendered figure derives from
 * the engine (lib/landing/specimen.ts): 16 findings, 11 error, 5 warn; the
 * NYC fee split 17 = 11 + 6; the ×100 price specimen $2,150.00 vs $21.50.
 */

/* ============================ THE LANDING ============================ */

test("landing tells the truth-audit story: metadata, H1, the section arc, the case files", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  // v9 metadata + hero headline (W3 verbatim, both lines).
  await expect(page).toHaveTitle(/Dinner can be ordered while you sleep\. What the agent read needs proof\./);
  const h1 = page.getByRole("heading", { level: 1 });
  await expect(h1).toContainText("Dinner can be ordered while you sleep.");
  await expect(h1).toContainText("What the agent read needs proof.");

  // The five story beats render as <h2>, IN ORDER (independent visibility
  // checks would let any permutation pass — assert the exact sequence).
  const h2Sequence = await page.locator("main h2").allTextContents();
  expect(h2Sequence).toEqual([
    "The check runs in the open.",
    "One held claim opens a case.",
    "Break the feed yourself.",
    "Different roles need the same proof.",
    "The same input, the same receipt, every time.",
  ]);

  // The proof-object bar renders the REAL held-claim specimen (no invented values).
  const proofBar = page.locator(".pb-bar");
  await expect(proofBar).toContainText("HOLD");
  await expect(proofBar).toContainText("THE MENU: 2150");
  await expect(proofBar).toContainText("THE MERCHANT RECORD: 21.50");
  await expect(proofBar).toContainText("100× THE RECORD");

  // The examination receipt (the turn) carries the derived case + arithmetic.
  const receipt = page.locator("article.receipt").first();
  await expect(receipt).toContainText("CURBSIDE COMMONS · EXAMINATION RECEIPT");
  await expect(receipt).toContainText("CASE 001 · FINDING 11/16");
  await expect(receipt).toContainText("2150.00 × 100 = 215,000¢");
  await expect(receipt.locator(".stamp")).toHaveText("HOLD");

  // The case file — FILE A (listings, anywhere in the US) + FILE B (NYC fees).
  const fileA = page.locator("section.file").first();
  await expect(fileA).toContainText("FILE A");
  await expect(fileA.getByRole("heading", { name: "The listings file" })).toBeVisible();
  await expect(fileA).toContainText("16 findings: 11 errors and 5 warnings");
  await expect(fileA.getByRole("link", { name: /Open the listings audit/ })).toHaveAttribute(
    "href",
    "/report",
  );
  const fileB = page.locator("section.file.law");
  await expect(fileB).toContainText("FILE B");
  await expect(fileB.getByRole("heading", { name: "The fee-law file" })).toBeVisible();
  // The 17 = 11 + 6 fee split, from the figure block (the load-bearing figures;
  // NOTE the adjacent prose renders "17codified" with a missing space — a minor
  // product defect reported to the caller, not asserted here).
  const figs = fileB.locator(".figs");
  await expect(figs).toContainText("17");
  await expect(figs).toContainText("RULES");
  await expect(figs).toContainText("FROM THE STATEMENT");
  await expect(figs).toContainText("NEED EVIDENCE");
  await expect(fileB.getByRole("link", { name: /Open the fee audit/ })).toHaveAttribute(
    "href",
    "/fees",
  );

  // Why it matters — the seats + the empty-seat wedge (as-of mid-2026, no overclaim).
  const emptySeat = page.locator(".empty-seat");
  await expect(emptySeat).toContainText("AS OF MID-2026");
  await expect(emptySeat).toContainText(
    "No named product independently verifies the feed against the merchant’s records.",
  );

  // Trust facts — deterministic · the pinned test figure · the published DEFER.
  const trust = page.locator(".trust");
  await expect(trust).toContainText("DETERMINISTIC");
  await expect(trust).toContainText("1,200+");
  await expect(trust).toContainText("AUTOMATED TESTS");
  await expect(trust.getByText("DEFER", { exact: true })).toBeVisible();

  // The door to chapter 01 — a REAL route link (D3: no "sample" residue).
  const door = page.getByRole("link", { name: /CONTINUE · 01/ });
  await expect(door).toHaveAttribute("href", "/report");
  await expect(door).toContainText("The listings audit");
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

test("landing Try bench runs the real one-rule check live on the served price", async ({ page }) => {
  await page.goto("/");
  const input = page.getByLabel("SERVED PRICE (EDIT ME)");
  const verdict = page.locator("#try-verdict");

  // The opening state is the feed's claim — held at ×100 (the cents-as-decimal drift).
  await expect(verdict.locator(".v-chip")).toContainText("HELD");

  // The true price agrees with the record — the verdict flips to PASS.
  await input.fill("21.50");
  await expect(verdict.locator(".v-chip")).toHaveText("PASS");
  await expect(verdict).toHaveClass(/pass/);

  // A preset restores the drift; the chip reads the ×100 factor the engine derived.
  await page.getByRole("button", { name: /the feed's claim/ }).click();
  await expect(verdict.locator(".v-chip")).toContainText("HELD ×100");

  // A non-price value gets an honest refusal, never a verdict.
  await input.fill("not a price");
  await expect(verdict.locator(".v-chip")).toHaveText("NOT A PRICE");
});

test("commons scene: reduced motion settles complete; the pause control is real (WCAG 2.2.2)", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  // Under reduced motion the scene opens on its settled state — order placed, proof attached.
  await expect(page.locator(".cs-status-live")).toContainText(
    "SCENE SETTLED · ORDER PLACED WITH PROOF",
  );
  // The primary CTA runs the check; the secondary is a native in-page anchor.
  await expect(page.getByRole("button", { name: "Watch the check" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Try it on a feed" })).toHaveAttribute("href", "#try");
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

test("nav = one continuing case across four numbered chapters; each reachable with aria-current", async ({
  page,
}) => {
  test.slow(); // dev mode compiles + client-navigates four chapters in one run
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Chapters" });

  // No retired v8 tabs survive.
  await expect(nav.getByRole("link", { name: "Console", exact: true })).toHaveCount(0);
  await expect(nav.getByRole("link", { name: "Evidence", exact: true })).toHaveCount(0);

  const chapters: Array<[string, string, RegExp]> = [
    ["/report", "Listings audit", /What the feed claims vs\. what the records say\./],
    ["/fees", "Fee audit", /A fee statement,/],
    ["/playground", "Try it live", /Verify a feed/],
    ["/proof", "Proof", /Every verdict is scored once/],
  ];
  for (const [href, label, h1] of chapters) {
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
});

test("the CASE 001 readout speaks the instrument's voice on every route", async ({ page }) => {
  test.slow(); // seven full-navigation route loads in one run (dev compile)
  const routes: Array<[string, RegExp]> = [
    ["/", /CASE 001 · CLAIM HELD · 16 FINDINGS/],
    ["/report", /CASE 001 · FILE A · FAIL · 11 ERR · 5 WARN/],
    ["/fees", /CASE 001 · FILE B · FEE AUDIT/],
    ["/playground", /CASE 001 · BENCH · IN YOUR BROWSER/],
    ["/proof", /CASE 001 · LOGBOOK · THE PROOF/],
    ["/docs", /CASE 001 · REFERENCE · THE METHOD/],
    ["/legacy", /CASE 001 · ARCHIVE · LEGACY MODULE/],
  ];
  for (const [path, readout] of routes) {
    await page.goto(path);
    await expect(page.locator(".nav-case")).toContainText(readout, { timeout: 15_000 });
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

  // The door continues to chapter 02.
  const door = page.getByRole("link", { name: /CONTINUE · 02/ });
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
  await expect(page.getByRole("link", { name: /BACK TO THE START · 01/ })).toHaveAttribute(
    "href",
    "/report",
  );
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

  test("landing opens complete without scripting: hero + held try-bench verdict", async ({
    page,
  }) => {
    await page.goto("/");
    // The hero copy is real SSR DOM (the settled-scene status lives in a
    // <noscript> block Playwright does not surface as visible — asserted via the
    // real rendered DOM below instead).
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Dinner can be ordered while you sleep.",
    );
    // The SSR try-bench verdict renders the feed's held claim (no dead editable form).
    await expect(page.locator("#try-verdict .v-chip")).toContainText("HELD");
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
