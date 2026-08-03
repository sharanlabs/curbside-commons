import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * DARK SCHEME — the two teeth a duplicated token set needs (2026-08-02, owner
 * word: "also dark mode for it").
 *
 * A CSS custom property cannot be aliased across two selectors, so the dark
 * value set is written TWICE — once at `:root[data-theme="dark"]` (a stored
 * choice) and once at `:root:not([data-theme="light"])` inside
 * `@media (prefers-color-scheme: dark)` (the system default). Duplication that
 * has to stay in step is exactly the kind that silently drifts: an edit to one
 * block leaves the other rendering last week's colour, and the failure is
 * invisible because each block only shows up in one of the two entry paths.
 *
 * So the parity is pinned rather than trusted. The second test is the other half
 * of the same idea: a colour that does not resolve through a token cannot follow
 * the scheme, so the stylesheet is scanned for literals that would leak light
 * values into dark, with the deliberate exceptions named individually.
 */

const CSS = readFileSync(join(process.cwd(), "app", "globals.css"), "utf8");

/** Pull the declaration body of a selector's block (brace-balanced). */
function blockFor(selector: string): string {
  const at = CSS.indexOf(`${selector} {`);
  expect(at, `selector not found: ${selector}`).toBeGreaterThan(-1);
  let depth = 0;
  for (let i = CSS.indexOf("{", at); i < CSS.length; i++) {
    if (CSS[i] === "{") depth++;
    else if (CSS[i] === "}" && --depth === 0) return CSS.slice(CSS.indexOf("{", at) + 1, i);
  }
  throw new Error(`unbalanced block for ${selector}`);
}

/** selector body → ordered [token, value] pairs, comments and spacing stripped. */
function tokens(body: string): Array<[string, string]> {
  return [...body.replace(/\/\*[\s\S]*?\*\//g, "").matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g)].map(
    (m) => [m[1], m[2].replace(/\s+/g, " ").trim()],
  );
}

describe("dark scheme: the two token blocks stay in step", () => {
  const stored = tokens(blockFor(':root[data-theme="dark"]'));
  const system = tokens(blockFor(':root:not([data-theme="light"])'));

  it("declares a non-trivial token set (the blocks were actually found)", () => {
    expect(stored.length).toBeGreaterThan(60);
  });

  it("declares the SAME token names in both blocks", () => {
    expect(system.map(([k]) => k).sort()).toEqual(stored.map(([k]) => k).sort());
  });

  it("declares the SAME value for every token in both blocks", () => {
    const storedMap = new Map(stored);
    const drifted = system.filter(([k, v]) => storedMap.get(k) !== v);
    expect(
      drifted.map(([k, v]) => `${k}: ${v} (stored: ${storedMap.get(k)})`),
      "a token drifted between the stored-choice and system-preference blocks",
    ).toEqual([]);
  });

  it("re-declares every ground, ink and hairline token the light :root sets", () => {
    // The ramp is the scheme. If a step is missed it does not fail loudly — it
    // renders a light-mode grey on a near-black ground and simply reads wrong.
    const required = [
      "--bg",
      "--bg-2",
      "--bg-3",
      "--ink",
      "--ink-2",
      "--body",
      "--graphite",
      "--muted",
      "--faint",
      "--rule",
      "--rule-2",
      "--rule-3",
      "--line",
      "--surface",
      "--surface-raise",
      "--panel-dark",
      "--glass-rgb",
      "--shadow-rgb",
      "--edge",
      "--edge-2",
      "--edge-3",
      "--on-ink",
      "--accent",
      "--accent-fill",
      "--accent-hi",
      "--ember",
      "--gold",
      "--ok",
      "--error",
      "--warn",
      "--paper",
      "--paper-ink",
      "--docs-bg",
      "--grad-phrase",
      "--grad-cta",
      "--elev-1",
      "--elev-2",
      "--elev-3",
    ];
    const have = new Set(stored.map(([k]) => k));
    expect(required.filter((t) => !have.has(t))).toEqual([]);
  });

  it("keeps --on-accent white in dark — the fill under it is dark in BOTH schemes", () => {
    expect(new Map(stored).get("--on-accent")).toBe("#ffffff");
  });

  it("scopes the dark section to screen, so printing still prints the light system", () => {
    const section = CSS.slice(CSS.indexOf("DARK SCHEME (owner word"));
    expect(section).toContain("@media screen {");
    expect(section.indexOf("@media screen {")).toBeLessThan(
      section.indexOf(':root[data-theme="dark"] {'),
    );
  });

  it("re-declares the ELEMENT-SCOPED token blocks, which :root cannot reach", () => {
    // A custom property set on an element beats anything inherited from :root,
    // so .docs-main would render fully light inside a dark page unless its own
    // selector is re-declared. (.rpt-wrap was pinned here too until the R-3
    // purge, 2026-08-02 — the retired report/demo ledger left the stylesheet,
    // so asserting its dark branch would pin dead CSS back into the file.)
    for (const sel of [".docs-main"]) {
      expect(CSS).toContain(`:root[data-theme="dark"] ${sel} {`);
      expect(CSS).toContain(`:root:not([data-theme="light"]) ${sel} {`);
    }
  });
});

describe("dark scheme: no colour literal leaks light values into dark", () => {
  // Everything before the first rule is the :root token ledger, where literals
  // are the POINT. Consumers come after, and a consumer literal cannot follow
  // the scheme.
  const DARK_MARKER = "DARK SCHEME (owner word";

  /** Literals that are correct as literals, each with the reason it is exempt. */
  const ALLOWED = [
    // white paper — the one ground that does not change
    "@media print",
    // white-alpha films sitting on a surface that is dark in BOTH schemes
    "rgba(255, 255, 255, 0.05)",
    "rgba(255, 255, 255, 0.08)",
    "rgba(255, 255, 255, 0.14)",
  ];

  /**
   * Blank every comment while preserving line breaks, so line numbers in a
   * failure message still point at the real line. Prose comments in this file
   * quote hexes constantly ("recomputed on #FFFFFF"), and a scanner that cannot
   * tell a quoted hex from a declared one reports noise instead of leaks.
   */
  const CODE = CSS.replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, " "));

  it("leaves no untokenised #fff / #ffffff outside the token ledger and print", () => {
    const lines = CODE.split("\n");
    const rootEnd = lines.findIndex((l) => l.trim() === "* {");
    const darkStart = CSS.split("\n").findIndex((l) => l.includes(DARK_MARKER));
    const offenders: string[] = [];
    let inPrint = false;
    let printDepth = 0;
    for (let i = rootEnd; i < (darkStart > -1 ? darkStart : lines.length); i++) {
      const L = lines[i];
      if (/@media\s+print/.test(L)) {
        inPrint = true;
        printDepth = 0;
      }
      if (inPrint) {
        printDepth += (L.match(/\{/g) ?? []).length - (L.match(/\}/g) ?? []).length;
        if (printDepth <= 0 && /\}/.test(L)) inPrint = false;
        continue;
      }
      if (/^\s*(--|\/\*|\*)/.test(L)) continue; // token declarations + comments
      if (/#(fff|ffffff|FFFFFF)\b/.test(L)) offenders.push(`${i + 1}: ${L.trim()}`);
    }
    expect(offenders, "a white literal here renders white on the dark ground").toEqual([]);
  });

  it("routes every ink hairline and shadow through a channel token", () => {
    const consumers = CODE.slice(CODE.indexOf("* {"), CSS.indexOf(DARK_MARKER));
    const stray = [...consumers.matchAll(/^.*rgba\((?:18, 20, 28|23, 21, 27|16, 16, 22)[^)]*\).*$/gm)]
      .map((m) => m[0].trim())
      .filter((l) => !l.startsWith("--") && !l.startsWith("/*") && !l.startsWith("*"));
    expect(stray, "an ink-hue rgba here stays dark-on-dark").toEqual([]);
  });

  it("keeps the deliberate on-dark white films as literals, not --glass-rgb", () => {
    // Migrating these would INVERT them: the surface beneath is dark in both
    // schemes, so the film must stay light in both.
    for (const literal of ALLOWED.slice(1)) expect(CSS).toContain(literal);
  });
});
