import { test, expect } from "@playwright/test";

/**
 * CANONICAL-PRODUCT e2e contract (plan v3.3 S5 — the truth-engine surface).
 * Runs under BOTH configs: dev (playwright.config.ts) and artifact mode
 * (playwright.artifact.config.ts, static-serving a recorded out/). A behavior
 * that only holds in dev is a defect.
 *
 * Supersedes the landing/nav halves of the retired console.spec.ts (S5 landing
 * retell + canonical nav — conscious contract rewrite, red-green 2026-07-11).
 */

test("landing tells the truth-audit story: metadata, H1, the chapter arc, the disclaimer-free footer", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  // v8 arc (design adoption 2026-07-16) — the commons-scene metadata title + H1
  await expect(page).toHaveTitle(/Dinner, ready for an agent/i);
  // the canonical H1 — the commons-scene headline (plain + gradient lines)
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Dinner, ready for an agent.",
  );
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Proven in the commons.",
  );
  // the seven-chapter arc renders, in order (each an <h2> headline)
  await expect(
    page.getByRole("heading", { level: 2, name: "A price that cannot pass." }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 2, name: "Three moves. Each can be checked." }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 2, name: "One report. Sixteen findings." }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 2, name: "The statement, read against the law." }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 2, name: "Out of focus stays unresolved." }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 2, name: "Every label has to be earned." }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 2, name: "Let the record have the last word." }),
  ).toBeVisible();
  // the chapters render IN ORDER (batch P2: independent visibility checks let
  // any permutation pass — assert the exact h2 sequence)
  const h2Sequence = await page.locator("main h2").allTextContents();
  expect(h2Sequence).toEqual([
    "A price that cannot pass.",
    "Three moves. Each can be checked.",
    "One report. Sixteen findings.",
    "The statement, read against the law.",
    "Out of focus stays unresolved.",
    "Every label has to be earned.",
    "Let the record have the last word.",
  ]);
  // the proof-object bar renders the REAL held-claim specimen (no invented values)
  const proofBar = page.locator(".pb-bar");
  await expect(proofBar).toContainText("HOLD");
  await expect(proofBar).toContainText("THE MENU: 2150");
  await expect(proofBar).toContainText("THE KITCHEN RECORD: 21.50");
  // the reduced-motion scene settles complete: order placed, proof attached
  await expect(page.locator(".cs-status-live")).toContainText(
    "SCENE SETTLED · ORDER PLACED WITH PROOF",
  );
  // The Evidence Bench is a genuine deterministic computation on illustrative input.
  // Under reduced motion the examination shows its COMPLETED state immediately: the
  // grounded tally, and the resolved finding. No dev-jargon / "SIMULATED" tag.
  const bench = page.locator(".eb");
  await expect(bench).toBeVisible();
  await expect(bench).toContainText("16 findings · 11 error · 5 warn");
  await expect(bench).toContainText("Claim is 100× the merchant record.");
  // The bench CHROME carries no "SIMULATED" tag (the contract's original intent).
  // Scoped since session 21: the finding-browse list legitimately renders the
  // committed golden's own plain lines, and finding 07 honestly describes a
  // "(simulated ghost item)" — the goldens' language is not a chrome tag.
  await expect(bench.locator(".eb-kicker")).not.toContainText(/simulated/i);
  await expect(bench.locator(".eb-receipt")).not.toContainText(/simulated/i);
  await expect(bench.locator(".eb-table")).not.toContainText(/simulated/i);
  // The Coverage default panel grounds the FAIL verdict + the same 16/11/5 tally.
  const coverage = page.locator("#coverage");
  await expect(coverage).toContainText("closes at FAIL with 16 findings: 11 error and 5 warn");
  // Freeze-reversal footer: disclaimer-free + honest (author credit present), and
  // NONE of the removed disclaimers / real-brand names / banned false claims render.
  const footer = page.locator("footer.site-footer");
  await expect(footer).toBeVisible();
  await expect(footer).toContainText("Sharan Kumar");
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
  ]) {
    expect(footerText, `footer should be disclaimer-free — found "${gone}"`).not.toContain(gone);
  }
  for (const banned of ["no ai was used", "actual doordash data", "production platform data"]) {
    expect(footerText, `footer must make no false claim — found "${banned}"`).not.toContain(banned);
  }
  // FOOTER COMPLETENESS (blindspot fix 2026-07-16): every canonical surface is
  // enumerated in the footer nav, label-identical to the primary nav — the site
  // chrome can never again forget a flagship surface.
  const footerNav = page.getByRole("navigation", { name: "Footer" });
  for (const label of [
    "Listings report",
    "Order scene",
    "Check a feed",
    "Fee-cap audit",
    "Evidence",
    "Measurables",
    "$0 cost",
    "Legacy",
  ]) {
    await expect(footerNav.getByRole("link", { name: label, exact: true })).toHaveCount(1);
  }
});

test("landing interactions: Evidence Bench replays, Method swaps, Coverage tabs switch", async ({
  page,
}) => {
  // motion allowed (default) — the Evidence Bench OPENS COMPLETE (owner pick 2026-07-15,
  // the storyboard's ships-done lesson: nothing opens empty). "Replay the check" re-runs
  // the resolve with the footprint kept — zero layout shift.
  await page.goto("/");

  // 01 Evidence Bench: the settled examination is already on the table on arrival.
  const bench = page.locator(".eb");
  const receipt = bench.locator(".eb-receipt-plain");
  await expect(receipt).toBeVisible();
  await expect(receipt).toHaveText("Claim is 100× the merchant record.");
  await expect(bench).toHaveAttribute("data-phase", "done");
  // Replay: the run resolves again and settles back complete, with no height delta.
  const replay = bench.getByRole("button", { name: "Replay the check" });
  await expect(replay).toBeVisible();
  const heightBefore = (await bench.boundingBox())!.height;
  // Watch the WHOLE run, not just its endpoints: a ResizeObserver records every
  // box the bench passes through across all six stage transitions, so a transient
  // mid-stage shift cannot slip between samples (phase-F batch finding #17).
  await bench.evaluate((el) => {
    const w = window as unknown as { __ebHeights: number[]; __ebRO: ResizeObserver };
    w.__ebHeights = [el.getBoundingClientRect().height];
    w.__ebRO = new ResizeObserver(() => {
      w.__ebHeights.push(el.getBoundingClientRect().height);
    });
    w.__ebRO.observe(el, { box: "border-box" });
  });
  await replay.click();
  await expect(bench).toHaveAttribute("data-phase", "running");
  await expect(bench).toHaveAttribute("data-phase", "done", { timeout: 6_000 });
  await expect(receipt).toBeVisible();
  const heights = await page.evaluate(() => {
    const w = window as unknown as { __ebHeights: number[]; __ebRO: ResizeObserver };
    w.__ebRO.disconnect();
    return w.__ebHeights;
  });
  for (const h of heights) {
    expect(Math.abs(h - heightBefore), `bench height drifted mid-replay: ${heights}`).toBeLessThanOrEqual(1);
  }
  const heightAfter = (await bench.boundingBox())!.height;
  expect(Math.abs(heightAfter - heightBefore)).toBeLessThanOrEqual(1);

  // 02 Method: the four words are pressable; selecting one swaps the detail panel.
  const recordWord = page.getByRole("button", { name: "record", exact: true });
  await recordWord.click();
  await expect(recordWord).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".mr-panel")).toContainText("21.50");

  // 03 Coverage: a proper tablist — switching tabs changes the visible panel.
  const tablist = page.getByRole("tablist", { name: "Measured coverage categories" });
  const schemaTab = tablist.getByRole("tab", { name: "SCHEMA + PROTOCOL" });
  await schemaTab.click();
  await expect(schemaTab).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel")).toContainText("78 pinned official schemas");
});

test("commons scene controls: the pause control is real (WCAG 2.2.2) and zone pills toggle", async ({
  page,
}) => {
  await page.goto("/");
  // The pause/play control genuinely stops and restarts ALL motion — a
  // label-swapping action button (no aria-pressed; batch P2 semantics fix).
  const pause = page.getByRole("button", { name: "Pause motion" });
  await expect(pause).toBeVisible();
  await pause.click();
  const play = page.getByRole("button", { name: "Play motion" });
  await expect(play).toBeVisible();
  await expect(page.getByRole("button", { name: "Pause motion" })).toHaveCount(0);
  // A story CTA fired while paused runs as a pausable one-shot: the control
  // flips to "Pause motion" during the run and can stop it mid-flight.
  await page.getByRole("button", { name: "Inspect a held claim" }).click();
  const pauseAgain = page.getByRole("button", { name: "Pause motion" });
  await expect(pauseAgain).toBeVisible();
  await pauseAgain.click();
  await expect(page.getByRole("button", { name: "Play motion" })).toBeVisible();
  // Zone pills highlight a part of the scene (honest aria-pressed group).
  const zones = page.getByRole("group", { name: "Highlight a part of the scene" });
  const commons = zones.getByRole("button", { name: "The commons" });
  await commons.click();
  await expect(commons).toHaveAttribute("aria-pressed", "true");
  await commons.click();
  await expect(commons).toHaveAttribute("aria-pressed", "false");
});

test("Coverage tabs are a keyboard-operable roving tablist (Arrow/Home/End, aria-selected/controls, panel visibility)", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const tablist = page.getByRole("tablist", { name: "Measured coverage categories" });
  const tabs = tablist.getByRole("tab");
  await expect(tabs).toHaveCount(3);
  const first = tabs.nth(0);
  const second = tabs.nth(1);
  const third = tabs.nth(2);

  // roving tabindex: only the selected tab is in the tab order
  await expect(first).toHaveAttribute("aria-selected", "true");
  await expect(first).toHaveAttribute("tabindex", "0");
  await expect(second).toHaveAttribute("tabindex", "-1");

  // aria-controls binds each tab to its tabpanel; the selected panel is visible, others hidden
  const firstPanelId = await first.getAttribute("aria-controls");
  const secondPanelId = await second.getAttribute("aria-controls");
  expect(firstPanelId).toBeTruthy();
  await expect(page.locator(`#${firstPanelId}`)).toBeVisible();
  await expect(page.locator(`#${secondPanelId}`)).toBeHidden();

  // ArrowRight moves selection AND focus together (automatic activation, roving focus)
  await first.focus();
  await page.keyboard.press("ArrowRight");
  await expect(second).toBeFocused();
  await expect(second).toHaveAttribute("aria-selected", "true");
  await expect(second).toHaveAttribute("tabindex", "0");
  await expect(first).toHaveAttribute("aria-selected", "false");
  await expect(first).toHaveAttribute("tabindex", "-1");
  await expect(page.locator(`#${secondPanelId}`)).toBeVisible();
  await expect(page.locator(`#${firstPanelId}`)).toBeHidden();

  // End → last, Home → first, ArrowLeft wraps to last
  await page.keyboard.press("End");
  await expect(third).toBeFocused();
  await expect(third).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("Home");
  await expect(first).toBeFocused();
  await expect(first).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("ArrowLeft");
  await expect(third).toBeFocused();
  await expect(third).toHaveAttribute("aria-selected", "true");
});

test("canonical nav = truth-engine surfaces + exactly one legacy link; every surface reachable", async ({
  page,
}) => {
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Primary" });
  // No legacy-product entries in the canonical set
  await expect(nav.getByRole("link", { name: "Console", exact: true })).toHaveCount(0);
  await expect(nav.getByRole("link", { name: "Audit", exact: true })).toHaveCount(0);
  // The canonical surfaces, each reachable with aria-current landing on it
  // (labels: the v8 narrative voice, sol draft 2026-07-16 Fable-adjudicated;
  // /fees joins the canonical set — NYC showcase N3).
  const surfaces: Array<[string, RegExp]> = [
    ["Listings report", /What the copy says/],
    ["Order scene", /.+/],
    ["Check a feed", /^Verify a serving copy in your browser$/],
    ["Fee-cap audit", /^A fee statement, read against the law\.$/],
    ["Evidence", /^Eval evidence$/],
    ["Measurables", /^Engine measurables$/],
    ["$0 cost", /^Cost & \$0 enforcement$/],
  ];
  for (const [label, h1] of surfaces) {
    await nav.getByRole("link", { name: label, exact: true }).click();
    // 15s: dev mode compiles each surface on first hit (artifact mode is instant).
    await expect(page.getByRole("heading", { level: 1 }).first()).toContainText(h1, {
      timeout: 15_000,
    });
    await expect(nav.getByRole("link", { name: label, exact: true })).toHaveAttribute(
      "aria-current",
      "page",
    );
  }
  // Exactly one legacy entry, and it reaches the legacy module
  const legacyLink = nav.getByRole("link", { name: "Legacy activation", exact: true });
  await expect(legacyLink).toHaveCount(1);
  await legacyLink.click();
  await expect(page).toHaveURL(/\/legacy\/console/);
});

test("the eval dashboard renders earned labels with visible provenance", async ({ page }) => {
  await page.goto("/eval");
  await expect(
    page.getByText("calibrated (fresh held-out, pre-registered floors, one pass — 2026-07-09)"),
  ).toBeVisible();
  // the honest DEFER arc stays on the surface
  await expect(page.getByText("label DEFERRED", { exact: false }).first()).toBeVisible();
  // per-figure provenance lines render — jargon-free (no repo file paths / SHAs on the
  // public page): every figure is shown as traced to a committed record.
  await expect(
    page.getByText("Traced to a record kept in the project", { exact: false }).first(),
  ).toBeVisible();
});

test("report surface toggle is keyboard-operable honest buttons (NEW-10)", async ({ page }) => {
  await page.goto("/report");
  const group = page.getByRole("group", { name: "Serving surface" });
  await expect(group).toBeVisible();
  await expect(page.locator('[role="tablist"], [role="tab"]')).toHaveCount(0);
  const buttons = group.getByRole("button");
  await expect(buttons.first()).toHaveAttribute("aria-pressed", "true");
  await expect(buttons.nth(1)).toHaveAttribute("aria-pressed", "false");
  await buttons.nth(1).focus();
  await page.keyboard.press("Enter");
  await expect(buttons.nth(1)).toHaveAttribute("aria-pressed", "true");
  await expect(buttons.first()).toHaveAttribute("aria-pressed", "false");
});

test("the demo states its illustrative-data boundary in rendered copy", async ({ page }) => {
  // Phase-F batch finding #4: with the SIMULATED banner removed by the recorded
  // freeze reversal, the demo must still SAY its records are invented — honesty
  // lives in the rendered interface, not only in the repo.
  await page.goto("/demo");
  const foot = page.locator(".rpt-foot");
  await expect(foot).toContainText("invented for this demonstration");
  await expect(foot).toContainText("no real merchant");
});

test("old root URLs carry the tested redirect policy to /legacy/**", async ({ page }) => {
  // The stubs meta-refresh (0s) to the moved surface — assert the landing spot.
  await page.goto("/console");
  await expect(page).toHaveURL(/\/legacy\/console/, { timeout: 10_000 });
  await expect(page.getByText("Legacy activation module", { exact: false }).first()).toBeVisible();
  await page.goto("/audit");
  await expect(page).toHaveURL(/\/legacy\/audit/, { timeout: 10_000 });
});

test("bench substance: explicit delta, step-through, provenance receipts, finding browse", async ({
  page,
}) => {
  // Session-21 enhancement slice (owner directive 2026-07-16): the bench gains
  // direction v1's interactive skeleton INSIDE the fixed v8 language — a rendered
  // ×100 delta (never computed by the reader), a discrete step-through of the
  // completed examination, native <details> provenance for every figure, and a
  // browsable findings index behind the tally (D-4 resolved). Reduced motion is
  // emulated so state changes are deterministic (states, not animation).
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const bench = page.locator(".eb");

  // ① The ×100 delta is a first-class rendered element at the axis terminus.
  const delta = bench.locator(".eb-delta");
  await expect(delta).toBeVisible();
  await expect(delta).toContainText("100");
  await expect(delta).toContainText(/100× THE MERCHANT'S OWN RECORD/i);

  // ② Step-through: discrete stages the reader inspects at their own pace
  // (WCAG 2.5.7 — no timing, no dragging). Stepping to RULE dims later stages
  // as STATE (allowed under reduced motion; it is not animation).
  const steps = bench.getByRole("group", { name: /step through the examination/i });
  await steps.getByRole("button", { name: /3 · RULE/ }).click();
  await expect(bench.locator(".eb-math")).toHaveCSS("opacity", "0.3");
  await expect(bench.locator(".eb-break")).toHaveCSS("opacity", "0.3");
  await expect(steps.getByRole("button", { name: /3 · RULE/ })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  // Stepping back to the receipt restores the settled examination.
  await steps.getByRole("button", { name: /6 · RECEIPT/ }).click();
  await expect(bench.locator(".eb-math")).toHaveCSS("opacity", "1");

  // ③ Provenance receipts: native <details> per figure — the exact source named.
  const claimProv = bench.locator("details.eb-prov").first();
  await claimProv.locator("summary").click();
  await expect(claimProv).toContainText("item-001-v1#price.amount");
  await expect(claimProv).toContainText("acp-feed");
  const recordProv = bench.locator("details.eb-prov").nth(1);
  await recordProv.locator("summary").click();
  await expect(recordProv).toContainText("2150¢");

  // ④ Finding browse: the tally opens the full committed index — 16 real rows,
  // the benched finding marked current. Golden-bound: finding 1's plain line.
  const browse = bench.locator("details.eb-browse");
  await browse.locator("summary").click();
  await expect(browse.locator("li")).toHaveCount(16);
  await expect(browse).toContainText("hidden in the merchant's own catalog");
  await expect(browse.locator("[aria-current='true']")).toContainText("100× overstatement");
});

test("bench print lifecycle: a print mid-replay settles the page for paper, then the interrupted replay resumes (batch P2, 2026-07-16)", async ({
  page,
}) => {
  await page.goto("/");
  const bench = page.locator(".eb");
  await expect(bench).toHaveAttribute("data-phase", "done");
  // Start a replay, then print in the middle of it.
  await bench.getByRole("button", { name: "Replay the check" }).click();
  await expect(bench).toHaveAttribute("data-phase", "running");
  await page.evaluate(() => window.dispatchEvent(new Event("beforeprint")));
  // For paper: the examination is settled-complete and every disclosure is open.
  await expect(bench).toHaveAttribute("data-phase", "done");
  const openCount = await bench.locator("details[open]").count();
  expect(openCount).toBe(await bench.locator("details").count());
  await page.evaluate(() => window.dispatchEvent(new Event("afterprint")));
  // Back on screen: the interrupted replay RESUMES (re-runs) and settles complete —
  // never a stuck partial state with dead timers.
  await expect(bench).toHaveAttribute("data-phase", "running");
  await expect(bench).toHaveAttribute("data-phase", "done", { timeout: 6_000 });
  await expect(bench.locator(".eb-receipt-plain")).toBeVisible();

  // Steady-state path: a stepped-to stage survives the print round-trip exactly.
  await bench.getByRole("button", { name: "3 · RULE" }).click();
  await page.evaluate(() => {
    window.dispatchEvent(new Event("beforeprint"));
    window.dispatchEvent(new Event("afterprint"));
  });
  await expect(bench.getByRole("button", { name: "3 · RULE" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});
