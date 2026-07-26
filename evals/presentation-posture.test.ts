import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * PRESENTATION POSTURE — lane (e), 2026-07-25.
 *
 * The three surfaces a visitor or a crawler meets BEFORE any page content:
 * `metadataBase` (every absolute URL Next derives), the social card, and
 * robots.txt. None of them had a test, and one of them was wrong: `metadataBase`
 * named `curbside-commons.vercel.app` while the site is deployed on Cloudflare
 * Pages, so every absolute URL pointed at a host that does not serve the site.
 *
 * The honesty stake here is specific and worth stating: a social card is the ONE
 * surface that travels WITHOUT its page. Every other surface carries its
 * simulated-data labelling in chrome the reader sees; a screenshotted card does
 * not. So the RULES §4 obligation lands on the card copy itself, and that is
 * what these tests hold.
 */

const ROOT = process.cwd();
const OG_SVG = readFileSync(join(ROOT, "public", "og.svg"), "utf8");
const ROBOTS = readFileSync(join(ROOT, "public", "robots.txt"), "utf8");

/**
 * Assertions read the BUILT export (`out/index.html`) rather than importing
 * `app/layout.tsx`. Two reasons, and the second is the load-bearing one:
 * importing the layout pulls `next/font`, which only initialises inside the
 * Next build; and more importantly the built HTML is what a crawler actually
 * receives — testing the source would prove the intent, not the artifact.
 * `npm run verify` builds before it tests, so `out/` is always current here.
 */
const OUT_HTML = join(ROOT, "out", "index.html");
const HTML = readFileSync(OUT_HTML, "utf8");

/** Pull a meta tag's content out of the built HTML. */
function meta(property: string): string {
  const m =
    HTML.match(new RegExp(`<meta[^>]*(?:property|name)="${property}"[^>]*content="([^"]*)"`, "i")) ??
    HTML.match(new RegExp(`<meta[^>]*content="([^"]*)"[^>]*(?:property|name)="${property}"`, "i"));
  return m ? m[1] : "";
}

describe("presentation — metadataBase names the host that actually serves the site", () => {
  it("absolute URLs point at the live Cloudflare Pages deploy, not a host that never served it", () => {
    // The defect this pins: metadataBase named curbside-commons.vercel.app
    // while the site is deployed on Cloudflare Pages, so every derived
    // absolute URL addressed a host that does not serve the site.
    expect(meta("og:image")).toContain("curbside-commons.pages.dev");
    expect(meta("og:image")).not.toContain("vercel.app");
  });

  it("absolute URLs are https (they must not downgrade)", () => {
    expect(meta("og:image").startsWith("https://")).toBe(true);
  });
});

describe("presentation — the social card carries its own scope (RULES §4)", () => {
  it("the OG description states prototype AND simulated data", () => {
    const d = meta("og:description");
    expect(d).toMatch(/prototype/i);
    expect(d).toMatch(/simulated/i);
  });

  it("the OG description disclaims affiliation (the card travels without the page)", () => {
    expect(meta("og:description")).toMatch(/not affiliated/i);
  });

  it("the Twitter description states prototype AND simulated data", () => {
    const d = meta("twitter:description");
    expect(d).toMatch(/prototype/i);
    expect(d).toMatch(/simulated/i);
  });

  it("the card is a large-image summary pointing at the committed asset", () => {
    expect(meta("twitter:card")).toBe("summary_large_image");
    expect(meta("twitter:image")).toContain("/og.svg");
  });

  it("neither card names a real platform, merchant, or vendor", () => {
    const copy = `${meta("og:description")} ${meta("twitter:description")} ${meta("description")}`;
    expect(copy.length, "meta descriptions must be present, or this test is vacuous").toBeGreaterThan(100);
    for (const brand of ["DoorDash", "Uber Eats", "UberEats", "Grubhub", "Square", "Toast", "Stripe", "OpenAI"]) {
      expect(copy, `card copy names ${brand}`).not.toContain(brand);
    }
  });

  it("the card IMAGE states its scope on its face, not only in the alt text", () => {
    // A reader who sees only the rendered image must still get the scope right.
    expect(OG_SVG).toContain("SIMULATED DATA");
    expect(OG_SVG).toContain("PROTOTYPE");
    expect(OG_SVG).toMatch(/Not affiliated with any delivery platform/i);
  });

  it("the card image honors the site-wide lamp ledger (ember means violations only)", () => {
    // #b42318 is reserved site-wide for violation marks. A social card is
    // decoration, never a verdict — it must not borrow the violation colour.
    // Scoped to MARKUP, not comments: the rationale comment names the colour
    // while explaining why it is banned, and a check that cannot tell the
    // difference between using a thing and documenting it is a bad check.
    const markup = OG_SVG.replace(/<!--[\s\S]*?-->/g, "");
    expect(markup).not.toContain("#b42318");
    expect(markup).toContain("#2438d6"); // ultramarine, the standing accent
  });

  it("the card image is self-contained (no external fetch from a social crawler)", () => {
    const markup = OG_SVG.replace(/<!--[\s\S]*?-->/g, "");
    expect(markup).not.toMatch(/<image\b/i);
    // The SVG namespace URI is structural and is never fetched; any OTHER
    // absolute URL would be a real outbound reference from a rendered card.
    const urls = [...markup.matchAll(/https?:\/\/[^\s"'<>]+/g)].map((m) => m[0]);
    expect(urls.filter((u) => u !== "http://www.w3.org/2000/svg")).toEqual([]);
  });
});

describe("presentation — robots posture is deliberate and documented", () => {
  it("indexable by design: the substance is crawlable", () => {
    expect(ROBOTS).toMatch(/^User-agent: \*$/m);
    expect(ROBOTS).toMatch(/^Allow: \/$/m);
  });

  it("the superseded /legacy archive is disallowed", () => {
    // An indexed legacy page is how a stale claim outlives its correction.
    expect(ROBOTS).toMatch(/^Disallow: \/legacy$/m);
  });

  it("the live surfaces are NOT disallowed", () => {
    for (const route of ["/report", "/fees", "/playground", "/proof", "/docs"]) {
      expect(ROBOTS, `${route} must stay crawlable`).not.toMatch(new RegExp(`^Disallow: ${route}\\b`, "m"));
    }
  });

  it("names no sitemap it does not have (a dangling reference reads as a site defect)", () => {
    expect(ROBOTS).not.toMatch(/^Sitemap:/m);
  });

  it("the posture carries its REASONING, not just its rules", () => {
    // The decision is a judgment call; the file explains why, so a future
    // session can re-decide it on the merits rather than guess at intent.
    expect(ROBOTS).toMatch(/portfolio prototype/i);
    expect(ROBOTS.split("\n").filter((l) => l.startsWith("#")).length).toBeGreaterThan(8);
  });
});
