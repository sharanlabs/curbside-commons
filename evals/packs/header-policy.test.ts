/**
 * HEADER POLICY binding (plan v3.3 §HEADER POLICY, decided 2026-07-12).
 *
 * Binds docs/header-policy-2026-07-12.md to the shipped file: public/_headers
 * exists, parses as Cloudflare Pages `_headers` syntax, applies EXACTLY the
 * four adopted headers to `/*`, and carries NO Content-Security-Policy — the
 * CSP deferral is part of the policy (it cannot be verified by the artifact
 * battery; see the record §3), so a CSP appearing here without a new reviewed
 * decision is a failure, not an upgrade.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const HEADERS_PATH = join(process.cwd(), "public", "_headers");

const ADOPTED: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "no-referrer",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};

function parse(): { rules: Array<{ url: string; headers: Array<[string, string]> }> } {
  const raw = readFileSync(HEADERS_PATH, "utf8");
  const rules: Array<{ url: string; headers: Array<[string, string]> }> = [];
  for (const line of raw.split("\n")) {
    if (line.trim() === "" || line.trim().startsWith("#")) continue;
    if (/^\S/.test(line)) {
      rules.push({ url: line.trim(), headers: [] });
      continue;
    }
    const m = line.trim().match(/^([A-Za-z0-9-]+):\s*(.*)$/);
    if (!m) throw new Error(`unparseable _headers line: ${JSON.stringify(line)}`);
    const last = rules[rules.length - 1];
    if (!last) throw new Error(`header line before any URL rule: ${JSON.stringify(line)}`);
    last.headers.push([m[1], m[2]]);
  }
  return { rules };
}

describe("header policy — public/_headers is exactly the adopted 2026-07-12 policy", () => {
  it("exists, has one /* rule, and parses", () => {
    const { rules } = parse();
    expect(rules).toHaveLength(1);
    expect(rules[0].url).toBe("/*");
  });

  it("carries exactly the four adopted headers with exactly the adopted values", () => {
    const { rules } = parse();
    // Batch-E P2 #2: Object.fromEntries silently collapses duplicate names, so a
    // smuggled duplicate placed before the canonical value would pass an
    // object-equality check (and Cloudflare would comma-join both values live).
    // Assert the raw pair list first: exactly four pairs, all names unique.
    expect(rules[0].headers).toHaveLength(4);
    const names = rules[0].headers.map(([n]) => n);
    expect(new Set(names).size).toBe(4);
    const got = Object.fromEntries(rules[0].headers);
    expect(got).toEqual(ADOPTED);
  });

  it("carries no CSP anywhere (the deferral is policy, not an omission)", () => {
    const raw = readFileSync(HEADERS_PATH, "utf8");
    // Match the header NAME position only — the comment naming the deferral may
    // mention CSP in prose; an actual header line must not.
    for (const line of raw.split("\n")) {
      if (line.trim().startsWith("#")) continue;
      expect(/content-security-policy/i.test(line)).toBe(false);
    }
  });

  it("the policy record exists and names the CSP deferral", () => {
    const record = readFileSync(
      join(process.cwd(), "docs", "header-policy-2026-07-12.md"),
      "utf8",
    );
    expect(record).toContain("defer a Content-Security-Policy with a named reason");
    expect(record).toContain("public/_headers");
  });
});
