import { test, expect } from "@playwright/test";

/**
 * Layout-sanity sweep — PERMANENT contract (owner pick, decision-log 2026-07-16).
 * Generalizes the session-19 /fees receipt-ribbon tooth (the first quantitative
 * layout guard, which caught a defect visual inspection had passed) to every
 * primary surface at the three desktop widths. Two families:
 *
 *  1. Ribbon metrics — no element carrying sentence-length text may render
 *     below a readable measure (the /fees defect: 48px columns, 13–17 lines).
 *  2. Horizontal overflow — no surface scrolls sideways at a supported width.
 *
 * Plus the D-1 print tooth (design review 2026-07-16 session 20): scroll-reveal
 * blocks must be visible on paper. `Reveal` strips the settled state when motion
 * is allowed and re-adds it on intersection; the print stylesheet must rescue
 * not-yet-intersected blocks the same way the reduced-motion block does —
 * otherwise every chapter below the fold prints as blank white.
 *
 * Runs in BOTH modes (dev + artifact) like every e2e contract.
 */

const ROUTES = ["/", "/fees", "/report", "/demo", "/playground", "/eval", "/metrics", "/cost"];
const WIDTHS = [1280, 1440, 1728] as const;

/** Minimum readable measure for sentence-length text (the /fees defect was 48px). */
const MIN_TEXT_WIDTH = 120;
/** Own-text length that marks an element as sentence-bearing (receipts were ~60–120 chars). */
const MIN_TEXT_LEN = 40;

test("print path: every reveal-gated landing block is visible on paper (D-1)", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  // Motion ALLOWED on purpose: this is the path where Reveal strips the settled
  // state on mount and below-fold blocks sit at opacity 0 until intersected.
  await page.goto("/");
  // Wait until the mount effect has opted blocks into the animated lifecycle —
  // at scroll 0 the below-fold blocks must exist in their un-revealed state.
  await page.waitForFunction(
    () => document.querySelector(".ds-reveal:not(.in), .ds-stagger:not(.in)") !== null,
  );
  await page.emulateMedia({ media: "print" });
  const invisible = await page.evaluate(() => {
    const bad: string[] = [];
    for (const el of document.querySelectorAll(".ds-reveal, .ds-stagger > *")) {
      const cs = getComputedStyle(el);
      if (cs.display === "none") continue; // nav/footer are print-hidden by design
      if (cs.opacity !== "1") {
        bad.push(
          `${el.tagName.toLowerCase()}.${(el.getAttribute("class") ?? "").split(" ")[0]} opacity=${cs.opacity}`,
        );
      }
    }
    return bad;
  });
  expect(invisible, "reveal-gated blocks invisible under print media").toEqual([]);
});

for (const width of WIDTHS) {
  test(`no horizontal overflow on any surface at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    for (const route of ROUTES) {
      await page.goto(route);
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, `${route} overflows horizontally at ${width}`).toBeLessThanOrEqual(0);
    }
  });

  test(`no ribbon text columns on any surface at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    for (const route of ROUTES) {
      await page.goto(route);
      const ribbons = await page.evaluate(
        ({ minWidth, minLen }) => {
          // measure disclosure content in its OPEN state — that is where narrow
          // flex-slot ribbons actually live (the session-21 eb-browse catch)
          document.querySelectorAll("details").forEach((d) => {
            d.open = true;
          });
          const bad: string[] = [];
          const skip = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "OPTION"]);
          for (const el of document.querySelectorAll("body *")) {
            if (skip.has(el.tagName) || el.closest("svg")) continue;
            // content inside a CLOSED <details> is not visible (Chromium keeps
            // layout-containment boxes for it, so rects alone don't exclude it)
            const det = el.closest("details");
            if (det && !det.open && !el.closest("summary")) continue;
            let own = "";
            for (const n of el.childNodes) {
              if (n.nodeType === Node.TEXT_NODE) own += n.textContent ?? "";
            }
            own = own.replace(/\s+/g, " ").trim();
            if (own.length < minLen) continue;
            const r = el.getBoundingClientRect();
            if (r.width === 0 && r.height === 0) continue; // not rendered
            // the standard visually-hidden pattern (1×1px clipped box) is an
            // intentional screen-reader affordance, not a layout ribbon
            if (r.width < 3 && r.height < 3) continue;
            const cs = getComputedStyle(el);
            if (cs.display === "none" || cs.visibility === "hidden") continue;
            if (r.width < minWidth) {
              bad.push(
                `${el.tagName.toLowerCase()}.${(el.getAttribute("class") ?? "").split(" ")[0]} ` +
                  `${Math.round(r.width)}px "${own.slice(0, 48)}"`,
              );
            }
          }
          return bad;
        },
        { minWidth: MIN_TEXT_WIDTH, minLen: MIN_TEXT_LEN },
      );
      expect(ribbons, `${route} renders ribbon text columns at ${width}`).toEqual([]);
    }
  });
}
