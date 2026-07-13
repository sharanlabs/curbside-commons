# HEADER POLICY — Cloudflare Pages response headers (2026-07-12, plan v3.3)

**Decision:** ship a source-controlled [`public/_headers`](../public/_headers) applying four low-risk security headers to every path, and **defer a Content-Security-Policy with a named reason**. Decided and committed BEFORE batch E so the review covers it; no header change may enter the release candidate after review.

## 1 · Source basis (live, dated)

- Cloudflare Pages `_headers` reference — <https://developers.cloudflare.com/pages/configuration/headers/>, fetched **2026-07-12**: the file lives in the project's static asset directory (for frameworks, `public/`); `[url]` line + indented `name: value` pairs; splat matching; ≤100 rules; the file itself is not served. Direct-upload projects are served the same way (the file ships inside the uploaded directory — ours is `out/`).
- Next.js static export (`output: "export"`, our `next.config`) copies `public/*` verbatim into `out/` — so the policy is one committed file, present in the immutable artifact the release gate hashes.

## 2 · Adopted headers (all paths, `/*`)

| Header | Value | Why |
| --- | --- | --- |
| `X-Content-Type-Options` | `nosniff` | Blocks MIME sniffing; zero behavioral risk on a static site. |
| `X-Frame-Options` | `DENY` | Nothing legitimately embeds this site; kills clickjacking framing. |
| `Referrer-Policy` | `no-referrer` | Maximal privacy for visitors following the few outbound links (GitHub, USPTO); the site itself needs no referrer data. |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | The site uses none of these; explicit denial is free. |

## 3 · CSP — deferred, with the reason named

A strict CSP would be the strongest browser-level enforcement of the site's zero-external-requests claim — and is exactly the kind of change that must not ship unverified:

1. **Our release battery cannot exercise it.** The artifact-mode e2e serves the recorded `out/` through a local static server that does not read `_headers` — a CSP that broke Next's hydration inline scripts (`__NEXT_DATA__` et al.) would pass every pre-deploy gate and ship broken. Verification-before-claims (RULES §3) says don't adopt what we can't test.
2. **Report-Only is not an option here:** a report endpoint is an external request, which the site's own posture forbids.
3. The four adopted headers carry no such risk (none affects script execution or asset loading).

**Path to adoption (future, owner-gated like any consequential change):** verify a candidate CSP on a *preview* deployment (real Pages headers, real browser), then commit it through a reviewed slice. Until then, no CSP header and no CSP claim.

## 4 · Verification

- **Now (pre-deploy):** `evals/packs/header-policy.test.ts` binds this policy — the file exists in `public/`, parses, carries exactly the four adopted headers with exactly these values, and carries no CSP (the deferral is part of the policy).
- **At S8 (owner-gated deploy):** the preview smoke asserts each adopted header is actually served (plan §S8 "headers verified"); production re-smoke repeats it.
- **Honest boundary:** until a deploy happens, these headers are *committed policy*, not *observed behavior* — the live site (already several slices behind) serves none of them today.
