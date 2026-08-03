import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * THE README'S ROUTE CLAIMS — kept true by a test, not by a sweep (2026-08-03).
 *
 * WHY THIS EXISTS. On 2026-08-02 the legacy activation module was deleted from
 * the site: 8 route directories removed, 61 built pages down to 9, 404 adopted
 * as the honest answer. Nothing swept the public docs, so for a full day the
 * README told readers that "the legacy activation surfaces live under
 * `/legacy/**`" while `app/legacy` did not exist. The site had moved and its
 * front door had not.
 *
 * Every honesty suite in this repo walks an explicit file list of SHIPPING
 * surfaces — none of them reads README.md, and `readme-skip-claim.test.ts`
 * guards one specific sentence. So the class "README describes a route that is
 * not there" had no guard at all, and the only thing standing between a route
 * deletion and a false public claim was somebody remembering.
 *
 * THE PROPERTY, not a snapshot: every route-shaped path the README names in
 * backticks must resolve under `app/`. A count is deliberately not asserted —
 * a count fails on every honest edit and trains people to bump it without
 * reading it (the reasoning `readme-skip-claim.test.ts` already records).
 *
 * This is the cheap direction of the check. It catches "README names a route
 * that was deleted"; it does not catch "a route shipped and README never
 * mentioned it," which is an editorial call rather than a false statement.
 */

const ROOT = process.cwd();
const README = readFileSync(join(ROOT, "README.md"), "utf8");

/** Backticked paths that look like SITE routes: `/report`, `/legacy/**`. */
function routeClaims(md: string): string[] {
  const found = new Set<string>();
  for (const m of md.matchAll(/`(\/[a-z0-9][a-z0-9-]*(?:\/[a-z0-9*[\]-]+)*)`/g)) {
    // First segment is the App Router directory; `/legacy/**` → `legacy`.
    const seg = m[1].split("/")[1];
    if (seg) found.add(seg);
  }
  return [...found].sort();
}

describe("README route claims — the front door cannot name a route the site does not serve", () => {
  const claims = routeClaims(README);

  it("finds route claims at all (the scan is not vacuous)", () => {
    // If the extraction silently stops matching, every assertion below passes
    // on an empty set — the failure mode this repo has been bitten by twice.
    expect(claims.length).toBeGreaterThanOrEqual(4);
    expect(claims).toContain("report");
  });

  it("every route the README names resolves under app/", () => {
    const missing = claims.filter((seg) => {
      const dir = join(ROOT, "app", seg);
      return !(existsSync(dir) && statSync(dir).isDirectory());
    });
    expect(
      missing,
      `the README names ${missing.length} route(s) that do not exist under app/. ` +
        `A deleted route leaves a false claim in the most-read public file: ${missing.join(", ")}`,
    ).toEqual([]);
  });

  it("the deleted legacy module is not described as live anywhere in the README", () => {
    // The specific regression, pinned by name. `/legacy/**` was removed from
    // the site on 2026-08-02; those paths 404 by design, with no redirects.
    expect(existsSync(join(ROOT, "app", "legacy"))).toBe(false);
    expect(
      /the legacy activation surfaces live under/i.test(README),
      "README claims the legacy surfaces are live; they were deleted 2026-08-02",
    ).toBe(false);
  });

  it("the site description does not use the numbered-chapter framing the owner rejected", () => {
    // DESIGN.md lists "numbered chapter chrome" under Anti-patterns: de-numbered
    // by owner word 2026-07-28 ("numerals told visitors this was a document to
    // read in order"). The README outlived that decision by six days, still
    // describing the site as "four numbered chapters". A settled owner decision
    // that only lives in prose gets re-broken; this holds it in the public file.
    expect(/numbered chapters?/i.test(README)).toBe(false);
  });
});
