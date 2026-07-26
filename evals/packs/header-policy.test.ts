/**
 * HEADER POLICY binding (plan v3.3 §HEADER POLICY, decided 2026-07-12;
 * PORTED FROM CLOUDFLARE PAGES TO VERCEL 2026-07-26 on the owner's word).
 *
 * Binds `docs/header-policy-2026-07-12.md` to the shipped config: `vercel.json`
 * applies EXACTLY the four adopted headers to every path, and carries NO
 * Content-Security-Policy — the CSP deferral is part of the policy (it cannot be
 * verified by the artifact battery; see the record §3), so a CSP appearing here
 * without a new reviewed decision is a failure, not an upgrade.
 *
 * WHY THIS FILE CHANGED: the policy used to live in `public/_headers`, which is
 * CLOUDFLARE PAGES syntax. Vercel does not read that file at all. A find-replace
 * migration would have left it sitting in `public/` — still parsing, still
 * passing the old version of this suite — while shipping a site with ZERO
 * security headers. The headers had to be re-expressed in `vercel.json`, and
 * this test had to follow the policy to its new home rather than keep asserting
 * against a file the new host ignores.
 *
 * The generalized trap, worth stating because it is invisible: **a config file
 * for the wrong platform does not error — it is simply never read.** Nothing
 * fails; the protection silently stops existing. So this suite asserts the
 * policy lives where the ACTIVE host looks, and that the abandoned Cloudflare
 * file is gone rather than lingering as a decoy that keeps a stale test green.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const VERCEL_JSON = join(process.cwd(), "vercel.json");

const ADOPTED: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "no-referrer",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};

interface VercelHeaderRule {
  source: string;
  headers: Array<{ key: string; value: string }>;
}

function config(): { headers?: VercelHeaderRule[]; outputDirectory?: string } {
  return JSON.parse(readFileSync(VERCEL_JSON, "utf8")) as {
    headers?: VercelHeaderRule[];
    outputDirectory?: string;
  };
}

describe("header policy — vercel.json is exactly the adopted 2026-07-12 policy", () => {
  it("exists, parses, and has exactly one catch-all header rule", () => {
    const rules = config().headers ?? [];
    expect(rules).toHaveLength(1);
    // Vercel's catch-all is a path pattern, not Cloudflare's `/*` glob.
    expect(rules[0].source).toBe("/(.*)");
  });

  it("carries exactly the four adopted headers with exactly the adopted values", () => {
    const rule = (config().headers ?? [])[0];
    // A smuggled DUPLICATE placed before the canonical value would pass an
    // object-equality check while changing what the host actually sends, so the
    // raw pair list is asserted first: exactly four, all names unique.
    expect(rule.headers).toHaveLength(4);
    const names = rule.headers.map((h) => h.key);
    expect(new Set(names).size).toBe(4);
    expect(Object.fromEntries(rule.headers.map((h) => [h.key, h.value]))).toEqual(ADOPTED);
  });

  it("carries no CSP anywhere (the deferral is policy, not an omission)", () => {
    expect(readFileSync(VERCEL_JSON, "utf8")).not.toMatch(/content-security-policy/i);
  });

  it("the abandoned Cloudflare _headers file is GONE, not lingering as a decoy", () => {
    // If it survived the migration it would still parse and could keep a stale
    // test green while the live host read none of it. Absence IS the assertion.
    expect(existsSync(join(process.cwd(), "public", "_headers"))).toBe(false);
  });

  it("the config points at the static export the policy applies to", () => {
    expect(config().outputDirectory).toBe("out");
  });

  it("the policy record exists and names the CSP deferral", () => {
    const record = readFileSync(join(process.cwd(), "docs", "header-policy-2026-07-12.md"), "utf8");
    expect(record).toContain("defer a Content-Security-Policy with a named reason");
    // The record is a 2026-07-12 artifact naming the then-current carrier; the
    // 2026-07-26 Vercel port is recorded in the decision log rather than by
    // rewriting a dated record.
    expect(record).toContain("public/_headers");
  });
});
