"use client";

/**
 * Theme toggle — the nav's one scheme control (owner word 2026-08-02: "also dark
 * mode for it").
 *
 * THE ACCESSIBLE NAME IS CARRIED BY CSS, NOT BY STATE, AND THAT IS THE POINT.
 * The action this button performs depends on the RESOLVED scheme, which the
 * server cannot know — the reader's system preference is a client fact. Naming
 * the button from React state would mean rendering one name on the server,
 * hydrating, and correcting it in an effect: a window in which a screen reader
 * can read the wrong action out loud, and a hydration mismatch besides.
 *
 * So both names are rendered, and the stylesheet hides the one that does not
 * apply with `display: none` — content hidden that way is excluded from the
 * accessible name computation, so exactly one label ever contributes. The name
 * is therefore correct on the very first paint, before any JavaScript runs, and
 * it follows a scheme change with no re-render at all. The sun/moon glyphs are
 * swapped by the same mechanism. (This is why there is no `aria-label`: an
 * aria-label would override the content and put us back on state.)
 *
 * WHAT A CLICK DOES. It resolves the CURRENT scheme the same way the page does —
 * a stored choice if there is one, otherwise the system preference — and flips
 * away from it, so the first click always visibly changes something. The choice
 * is written to `localStorage("cc-theme")` and stamped on
 * `document.documentElement`, which is the same attribute the inline no-flash
 * script in `app/layout.tsx` sets before first paint on the next load.
 *
 * No dependencies, no icon library, no emoji — two inline SVGs on `currentColor`,
 * matching the brand mark's static-geometry idiom.
 */

const STORAGE_KEY = "cc-theme";

export function ThemeToggle() {
  function flip() {
    const root = document.documentElement;
    let current = root.dataset.theme;
    if (current !== "dark" && current !== "light") {
      // No stored choice: the page is rendering whatever the system asked for,
      // so THAT is what we are flipping away from.
      current =
        typeof window.matchMedia === "function" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
    }
    const next = current === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Private mode / storage disabled. The scheme still changes for this
      // page — it just will not survive a reload, which is the correct
      // degradation for a preference we were not allowed to record.
    }
  }

  return (
    <button type="button" className="theme-toggle" onClick={flip}>
      <span className="tt-say tt-say-light">Switch to dark theme</span>
      <span className="tt-say tt-say-dark">Switch to light theme</span>
      {/* sun — shown while the page is light, because it names the state you
          are in; the label names the action you would take. */}
      <svg
        className="tt-mark tt-mark-light"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <circle cx="10" cy="10" r="3.6" />
        <path d="M10 1.8v2M10 16.2v2M1.8 10h2M16.2 10h2M4.2 4.2l1.4 1.4M14.4 14.4l1.4 1.4M15.8 4.2l-1.4 1.4M5.6 14.4l-1.4 1.4" />
      </svg>
      {/* moon */}
      <svg
        className="tt-mark tt-mark-dark"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M16.2 12.4A7 7 0 0 1 7.6 3.8a7 7 0 1 0 8.6 8.6z" />
      </svg>
    </button>
  );
}
