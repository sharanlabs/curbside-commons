import { test, expect } from "@playwright/test";

/**
 * SCHEME CONTRACT — the two schemes and the control that chooses between them
 * (owner word 2026-08-02: "also dark mode for it").
 *
 * Three claims are worth pinning, because each one fails silently rather than
 * loudly:
 *
 *  1. WITH NO STORED CHOICE, THE SYSTEM DECIDES. A dark-mode site that ignores
 *     `prefers-color-scheme` until someone finds a button has not shipped dark
 *     mode; it has shipped a setting. Asserted on the COMPUTED background, not
 *     on the presence of a media query.
 *  2. A STORED CHOICE WINS IN BOTH DIRECTIONS. The interesting half is the one
 *     that is easy to miss: choosing LIGHT while the system asks for dark. A
 *     `[data-theme="dark"]`-only implementation handles one direction and
 *     quietly ignores the other.
 *  3. IT SURVIVES A RELOAD WITHOUT A FLASH. The choice is stamped by an inline
 *     script in <head> before first paint. Reading `data-theme` immediately
 *     after `goto` — before any React has hydrated — is what proves the stamp
 *     happened at parse time rather than in an effect.
 *
 * The toggle's accessible name is checked in both schemes because the name is
 * carried by CSS (`display: none` on the label that does not apply), not by
 * component state — see components/ThemeToggle.tsx.
 */

const DARK_BG = "rgb(14, 16, 22)"; // --bg #0e1016
const LIGHT_BG = "rgb(255, 255, 255)"; // --bg #ffffff

const bodyBg = (page: import("@playwright/test").Page) =>
  page.evaluate(() => getComputedStyle(document.body).backgroundColor);

test("with no stored choice, the system preference decides the scheme", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "dark" });
  await page.goto("/");
  await expect.poll(() => bodyBg(page)).toBe(DARK_BG);
  // No stored choice means the attribute is ABSENT — the stylesheet's media
  // branch is doing the work. If JS had resolved the system preference into the
  // attribute, a later system change would be silently overridden.
  expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBeUndefined();

  await page.emulateMedia({ colorScheme: "light" });
  await expect.poll(() => bodyBg(page)).toBe(LIGHT_BG);
});

test("the toggle has an accessible name stating the action, in both schemes", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "light" });
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Switch to dark theme" })).toBeVisible();

  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.getByRole("button", { name: "Switch to light theme" })).toBeVisible();
  // Exactly one name contributes — the other label is display:none, which
  // removes it from the accessible name computation rather than merely hiding it.
  await expect(page.getByRole("button", { name: "Switch to dark theme" })).toHaveCount(0);
});

test("clicking the toggle stamps data-theme and the choice survives a reload", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "light" });
  await page.goto("/");
  await expect.poll(() => bodyBg(page)).toBe(LIGHT_BG);

  await page.getByRole("button", { name: "Switch to dark theme" }).click();
  expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBe("dark");
  await expect.poll(() => bodyBg(page)).toBe(DARK_BG);
  expect(await page.evaluate(() => localStorage.getItem("cc-theme"))).toBe("dark");

  await page.reload();
  // Read the attribute FIRST: this is the no-flash claim. If the stamp came
  // from an effect rather than the inline <head> script, the page would have
  // painted light before this line ran.
  expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBe("dark");
  await expect.poll(() => bodyBg(page)).toBe(DARK_BG);
});

test("a stored LIGHT choice wins over a dark system preference", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "dark" });
  await page.goto("/");
  await expect.poll(() => bodyBg(page)).toBe(DARK_BG);

  await page.getByRole("button", { name: "Switch to light theme" }).click();
  expect(await page.evaluate(() => localStorage.getItem("cc-theme"))).toBe("light");
  await expect.poll(() => bodyBg(page)).toBe(LIGHT_BG);

  await page.reload();
  expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBe("light");
  await expect.poll(() => bodyBg(page)).toBe(LIGHT_BG);
});

test("the dark scheme reaches every route, including the element-scoped /docs block", async ({ page }) => {
  // .docs-main declares its own tokens ON THE ELEMENT, which beats anything
  // inherited from :root — without its own dark branch it renders a fully
  // light document inside a dark page. (.rpt-wrap was asserted here first,
  // but nothing mounts it — dead CSS with a stale comment; /report darkens
  // via :root, verified rendered 2026-08-02.)
  await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "dark" });

  for (const route of ["/report", "/fees", "/proof", "/playground"]) {
    await page.goto(route);
    await expect
      .poll(() => page.evaluate(() => getComputedStyle(document.body).backgroundColor))
      .toBe("rgb(14, 16, 22)"); // --bg #0e1016
  }

  await page.goto("/docs");
  await expect
    .poll(() =>
      page.evaluate(() => {
        const el = document.querySelector(".docs-main");
        return el ? getComputedStyle(el).backgroundColor : null;
      }),
    )
    .toBe("rgb(22, 21, 15)"); // --docs-bg #16150f
});
