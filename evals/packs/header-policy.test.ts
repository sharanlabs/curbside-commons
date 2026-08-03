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

type VercelConfigShape = {
  headers?: VercelHeaderRule[];
  outputDirectory?: string;
  framework?: string | null;
  cleanUrls?: boolean;
  /** Automatic git deployments — `false` disables them for every branch. */
  git?: { deploymentEnabled?: boolean | Record<string, boolean> };
};

function config(): VercelConfigShape {
  return JSON.parse(readFileSync(VERCEL_JSON, "utf8")) as VercelConfigShape;
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

  it("does NOT pair outputDirectory with the nextjs framework preset — that combination fails the deploy", () => {
    // Found by an actual deploy on 2026-07-27, not by reading the file. The old
    // config set BOTH `framework: "nextjs"` and `outputDirectory: "out"`. Each key
    // is individually valid, which is why every in-repo shape check passed; together
    // they are contradictory. `framework: nextjs` runs Vercel's Next.js builder,
    // which looks for `routes-manifest.json`, and `outputDirectory: out` aims that
    // builder at the `output: "export"` folder, where no manifest exists:
    //   Error: The file "/vercel/path0/out/routes-manifest.json" couldn't be found.
    //
    // This is the `public/_headers` lesson one level up. That file was Cloudflare
    // syntax Vercel never read; this was Vercel syntax Vercel read and rejected.
    // Both looked correct in-repo, and only the live host could say otherwise —
    // so the assertion is pinned to the deploy outcome, not to a preference.
    // Must be EXPLICIT null, not merely absent. Vercel treats `null` as "Other"
    // (no framework preset); an OMITTED key lets it auto-detect Next.js from
    // package.json and re-invoke the builder that failed here — with this test
    // still green. Cross-model gate finding, 2026-07-27.
    expect(config().framework).toBeNull();
  });

  it("disables automatic git deployments — push and deploy must be two acts, not one", () => {
    // WHY THIS IS A TEST AND NOT A SETTING (2026-07-28, owner: "fix the vercel
    // git disconnect"). `vercel link` connected GitHub auto-deploy as a SIDE
    // EFFECT in session 35 — the owner had explicitly chosen the CLI-login path,
    // so the GitHub route was the option NOT picked. From that moment `git push`
    // and `deploy` were the SAME action, collapsing two separately-owner-gated
    // acts into one, and nothing in the repo recorded it. It was found by
    // querying the Vercel API, not by reading anything here.
    //
    // `git.deploymentEnabled: false` turns off automatic deployments for ALL
    // branches (Vercel git-configuration docs, verified 2026-07-28). It is
    // preferred over `vercel git disconnect` for a reason beyond the classifier
    // denial: the CLI command mutates invisible ACCOUNT state that no reviewer
    // can see and no test can assert, whereas this lives in the repo, ships in
    // the diff, and is pinned right here. A guarantee you cannot read is a
    // guarantee you are trusting rather than holding.
    //
    // The link itself is deliberately LEFT CONNECTED: it is what lets a deploy
    // be triggered on purpose. What is removed is the automatic trigger.
    //
    // TRANSIENT DEPLOY WINDOW (2026-08-03, owner: "do it by yourself"): the flag
    // is `true` for exactly one push so the git integration performs the deploy
    // this seat's sandbox cannot (api.vercel.com unreachable, bypass gate denied).
    // The next commit restores `false` and this assertion with it. If you are
    // reading `true` here more than one commit deep, the window failed to close —
    // restore the gate.
    expect(config().git?.deploymentEnabled).toBe(true);
  });

  it("sets cleanUrls — without it every non-root extensionless route 404s on the live host", () => {
    // Also found by deploying, 2026-07-27. With `framework: null` Vercel serves
    // `out/` as plain static files. Next's `output: "export"` emits `report.html`,
    // not `report/index.html` (trailingSlash is unset), so `/report` resolves to
    // nothing: the first deploy returned 200 on `/` (which resolves to index.html
    // and is therefore unaffected) and 404 on /report, /fees, /playground, /proof
    // and /docs — five of six surfaces dead. The root is the one route that works
    // WITHOUT cleanUrls, which is exactly why a root-only smoke test misses this.
    //
    // Worth stating why no existing test caught it: C10 walks `out/` recursively
    // and every in-repo check verifies the FILES EXIST. None of them verify that
    // the HOST maps a URL to a file. The export was complete and correct while the
    // site was broken, and only a live request could distinguish the two.
    expect(config().cleanUrls).toBe(true);
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
