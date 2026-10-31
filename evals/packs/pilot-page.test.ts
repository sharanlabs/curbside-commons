import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  BUNDLED,
  COST,
  LIBRARY,
  M1,
  TIERS,
  formatValue,
} from "@/lib/landing/pilot-figures.ts";

/**
 * /pilot AS BUILT — the page a platform executive reads holds no typed figure,
 * no captioning register, and no claim the honesty bar forbids (plan § 12 S4;
 * RULES §4; DESIGN.md production register; Codex cross-check 2026-10-12 § 5).
 *
 * Reads the BUILT export, never the JSX: what a reader receives is the
 * artifact, and a source test would prove intent only. Run
 * `node scripts/build-offline.mjs` first (the honesty-c10 suite rebuilds a
 * stale out/ with `npm run build`, which needs a font host; this suite simply
 * reads what is there and fails loudly if /pilot is missing).
 *
 *  FIGURES     every `data-pilot` element's text equals the field it names in
 *              lib/landing/pilot-figures.ts, and every field the module
 *              derives is rendered (a figure silently dropped is also a drift).
 *  NO TYPED    with the data-pilot elements removed, the page's visible text
 *  DIGIT       holds no digit except allow-listed NAMES: ISO dates, slice
 *              labels (S2, S1.5), M1, Tier 0–3, section references (§ 7, §4),
 *              §20-563.3. The test-guide technique, page-wide.
 *  REGISTER    no "sample" / "demo" / "example" captioning; "real" only in the
 *              name of the site's "What is real" statement.
 *  §4          the carriers are present: synthetic, "shaped like the public
 *              integration docs, not from the platform", not affiliated,
 *              "nothing acts", and "No dollar figure on this page is a
 *              measurement."
 *  NAV         /pilot sits OUTSIDE the header navigation, so the pinned nav
 *              set in evals/e2e/canonical.spec.ts does not move.
 *
 * MUTATIONS (applied to app/pilot/page.tsx, out/ rebuilt with
 * build-offline, run, restored with `git checkout -- app/pilot/page.tsx`,
 * rebuilt, green — recorded in docs/returns/2026-10-31-exec-layer.md):
 *  P-a  a typed figure planted in the cost prose ("about 900,000 orders") →
 *       RED: NO TYPED DIGIT.
 *  P-b  one data-pilot cell rendered as `{formatValue(d.value + 1, d.unit)}`
 *       → RED: FIGURES.
 *  P-c  "Nothing acts." removed from the note → RED: §4 carriers.
 */

const ROOT = process.cwd();
const OUT = join(ROOT, "out");
const PAGE = [join(OUT, "pilot.html"), join(OUT, "pilot", "index.html")].find((p) => existsSync(p));

/** Entities React and Next emit in text nodes. */
function decode(s: string): string {
  return s
    .replace(/&#x27;|&#39;|&apos;|&rsquo;/g, (m) => (m === "&rsquo;" ? "’" : "'"))
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");
}

/** Visible text: scripts/styles/comments dropped, tags stripped, whitespace collapsed (copied from C10's normalizer — importing it would re-collect that suite). */
function visible(html: string): string {
  return decode(
    html
      .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
      .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/\s+/g, " ")
    // Tag stripping leaves "hypothesis ." and "( 11"; rejoin punctuation so a
    // carrier split by an inline <b> still reads as one sentence.
    .replace(/\s+([.,;:)])/g, "$1")
    .replace(/\(\s+/g, "(")
    .trim();
}

const html = PAGE ? readFileSync(PAGE, "utf8") : "";
const main = html.match(/<main class="docs-main pilot-main"[^>]*>([\s\S]*?)<\/main>/)?.[1] ?? "";

/** Every data-pilot element (leaf elements by construction: text only, or a single expression). */
const FIELD = /<(\w+)\b[^>]*\bdata-pilot="([^"]+)"[^>]*>([\s\S]*?)<\/\1>/g;
const rendered = new Map<string, string>();
for (const m of main.matchAll(FIELD)) rendered.set(m[2], visible(m[3]));

/** What each key must read, from the module — the page's only source of figures. */
function expected(): Map<string, string> {
  const e = new Map<string, string>();
  for (const a of Object.values(COST.assumptions)) e.set(`assumption.${a.key}`, formatValue(a.value, a.unit));
  for (const d of Object.values(COST.derived)) e.set(`derived.${d.key}`, formatValue(d.value, d.unit));
  e.set("bundled.verdict", BUNDLED.verdict);
  e.set("bundled.findings", String(BUNDLED.findings));
  e.set("bundled.errors", String(BUNDLED.errors));
  e.set("bundled.warnings", String(BUNDLED.warnings));
  e.set("bundled.rowsRead", String(BUNDLED.rowsRead));
  e.set("library.built", String(LIBRARY.builtCount));
  e.set("library.planned", String(LIBRARY.plannedCount));
  for (const r of LIBRARY.rows) {
    e.set(`scenario.${r.id}.id`, r.id);
    e.set(`scenario.${r.id}.story`, r.story);
    e.set(`scenario.${r.id}.state`, r.state === "ARRIVES" ? `ARRIVES ${r.arrives}` : r.state);
    e.set(`scenario.${r.id}.verdict`, r.verdict ?? "—");
    e.set(`scenario.${r.id}.findings`, r.findings === null ? "—" : String(r.findings));
    e.set(`scenario.${r.id}.later`, r.later.length > 0 ? r.later.join(", ") : "—");
  }
  for (const t of TIERS) e.set(`tier.${t.tier}`, String(t.tier));
  e.set("m1.id", M1.id);
  e.set("m1.name", M1.name);
  e.set("m1.floor", M1.floor);
  return e;
}

describe("/pilot is built and is the page this suite thinks it is", () => {
  it("out/ carries the /pilot page with its main element (run scripts/build-offline.mjs first)", () => {
    expect(PAGE, "no out/pilot.html — build the site before this suite").toBeDefined();
    expect(main.length, "the built page has no <main class=\"docs-main pilot-main\">").toBeGreaterThan(1000);
    expect(visible(main)).toContain("A pilot proposal, with the arithmetic attached.");
  });
});

describe("FIGURES — every data-pilot value is the module's, and every module figure is rendered", () => {
  const want = expected();

  it("each rendered data-pilot element equals its field", () => {
    const wrong: string[] = [];
    for (const [k, v] of rendered) {
      if (!want.has(k)) wrong.push(`${k}: rendered but the module derives no such field`);
      else if (want.get(k) !== v) wrong.push(`${k}: page "${v}" ≠ module "${want.get(k)}"`);
    }
    expect(wrong).toEqual([]);
  });

  it("every field the module derives is on the page", () => {
    const missing = [...want.keys()].filter((k) => !rendered.has(k));
    expect(missing).toEqual([]);
  });

  it("the cost block shows the derived exposure and the catch rate is not assumed", () => {
    expect(rendered.get("derived.refundExposureCents")).toBe(formatValue(COST.derived.refundExposureCents.value, "cents"));
    expect(visible(main)).toContain(COST.catchRate.display);
  });
});

describe("NO TYPED DIGIT — outside data-pilot fields, the only digits are names", () => {
  it("strips the fields, then finds no digit that is not an allow-listed name", () => {
    const withoutFields = visible(main.replace(FIELD, " "));
    const ALLOWED: readonly RegExp[] = [
      /\b\d{4}-\d{2}-\d{2}\b/g, // ISO dates (read dates, decision dates)
      /§20-563\.3/g, // the NYC code section, a name
      /§\s?\d+(?:\.\d+)?(?:,\s?§\s?\d+)*/g, // section references: plan § 7, RULES §4
      /\bS\d(?:\.\d)?\b/g, // slice labels: S2, S1.5
      /\bM1\b/g, // the metric's id
      /\bTier [0-3]\b/g, // tier names in prose
    ];
    let rest = withoutFields;
    for (const re of ALLOWED) rest = rest.replace(re, " ");
    const hits = [...rest.matchAll(/.{0,30}\d.{0,30}/g)].map((m) => m[0]);
    expect(hits, "a figure is typed in /pilot's visible text").toEqual([]);
  });
});

describe("REGISTER — production register on the executive page", () => {
  const text = visible(main);

  it("no sample / demo / example captioning", () => {
    expect(text).not.toMatch(/\b(sample|demo|example)s?\b/i);
  });

  it('"real" appears only as the name of the site\'s "What is real" statement', () => {
    const stray = text.replace(/What is real, and what is invented/g, " ");
    expect(stray).not.toMatch(/\breal\b/i);
    expect(text).toContain("What is real, and what is invented");
  });
});

describe("§4 — the honesty carriers are on the page", () => {
  const text = visible(main);

  it.each([
    ["synthetic", /Synthetic throughout/],
    ["shaped like, not from", /Shaped like the public integration docs, not from the platform\./],
    ["not affiliated", /Not affiliated with any delivery platform/],
    ["nothing acts", /Nothing acts\./],
    ["a human signs a proposal", /A human signs a proposal; nothing acts\./],
    ["no dollar figure is a measurement", /No dollar figure on this page is a measurement\./],
    ["the delivery point is a hypothesis", /That effect is a hypothesis\./],
    ["M1 measured later", /measured later, with the platform’s own instruments, after a separate deployment decision/],
  ])("%s", (_name, re) => {
    expect(text).toMatch(re);
  });

  it("the footer link reaches the site's honesty statement on /docs", () => {
    expect(main).toMatch(/<a [^>]*href="\/docs"[^>]*>What is real, and what is invented<\/a>/);
  });
});

describe("NAV — /pilot is outside the header navigation", () => {
  it("the Nav component names no /pilot destination", () => {
    const nav = readFileSync(join(ROOT, "components", "Nav.tsx"), "utf8");
    expect(nav).not.toContain("/pilot");
  });

  it("no built page's header links to /pilot", () => {
    for (const file of ["index.html", "docs.html", PAGE ? PAGE.slice(OUT.length + 1) : "pilot.html"]) {
      const page = readFileSync(join(OUT, file), "utf8");
      const header = page.match(/<header[\s\S]*?<\/header>/)?.[0] ?? "";
      expect(header.length, `${file} has no header`).toBeGreaterThan(100);
      expect(header, `${file}'s header links /pilot`).not.toMatch(/href="\/pilot"/);
    }
  });
});
