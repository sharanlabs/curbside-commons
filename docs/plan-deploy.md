# Deploy Plan — Curbside Commons static showcase (plan-first; awaiting owner sign-off)

**Status: PLAN ONLY — nothing deployed, no code changed.** Written 2026-07-08 (late session) under the standing "plan-first, free-static bias" ruling. Execution fires only on the owner's explicit deploy word naming a platform (or accepting the recommendation below).

## 1. What "done" looks like

The gated whole-site Oxblood redesign (30 prerendered pages) is reachable at a public URL as a **static artifact showcase** — a portfolio demonstration, not an operated service. Verify: every route loads (/, /report, /demo, /console, /eval, /metrics, /audit, /cost, /merchant/M001..M020), the SIMULATED banner renders and survives print, zero external requests, $0/month.

## 2. Identity constraints (binding)

- **Prototype, not a service** (owner-set 2026-06-11): the deploy is a static file drop, redeployed on demand. No uptime claims, no ops posture, no scheduled builds. Public docs must not describe it as "live infrastructure."
- Honesty invariants ride along unchanged: SIMULATED banner, footer honesty paragraph, simulated labels — the deploy changes hosting, never content.
- Deploy happens **from a committed state** — the four-slice redesign must be committed first (owner act ⓪) so the deployed artifact is SHA-traceable.

## 3. Technical shape (verified against the working tree, 2026-07-08)

- Next.js ^16.0.6, App Router; **all 30 routes prerender Static/SSG** (live `npm run build` this session); no server features in `app/` (grep: no `use server` / `next/headers` / `cookies()`).
- Execution slice = one config line (`output: "export"` in `next.config.ts`) → `next build` emits a pure-static `out/` → upload. Risk: `output: "export"` disables the default image optimizer and any future server features — acceptable; the site uses neither today. This config change is product code → standard gates (verify 947+6 floor, test:legacy 306+5, one Codex changed-files review).

## 4. Platform pick (live freshness checks, all fetched 2026-07-08)

| Option | Cost | Fit | Source (2026-07-08) |
| --- | --- | --- | --- |
| **Cloudflare Pages — direct upload (RECOMMENDED)** | $0 — static asset requests "free and unlimited"; 500 deploys/mo on Free | Best fit: `wrangler pages deploy out/` is an **episodic manual push** — no git integration, no repo access granted, no standing build pipeline; matches prototype-run-on-demand. `*.pages.dev` subdomain, no domain purchase. | developers.cloudflare.com/workers/platform/pricing/ + developers.cloudflare.com/pages/ ("Available on all plans") |
| **Vercel Hobby (free alternative)** | $0 — Hobby plan free, non-commercial/personal use only (fits a portfolio prototype) | Native Next.js host; supports private repos; CLI deploy possible without git integration. Slightly heavier identity: Vercel wants an account-linked project. | vercel.com/docs/plans/hobby (doc dated 2026-06-16) |
| **GitHub Pages** | $0 but **BLOCKED while the repo is private** — Free plan serves Pages from public repos only | Becomes viable after the owner's public flip; would keep everything in one vendor. Not available today. | docs.github.com/en/get-started/learning-about-github/githubs-plans |

Enterprise-expansion path (documented, not built): the same static `out/` behind any org CDN (Cloudflare Enterprise / AWS CloudFront+S3 / Azure Static Web Apps) with CI-gated deploys.

## 5. Execution slice (fires only on the owner's word)

1. Pre-req check: redesign committed (owner act ⓪); working tree clean.
2. Add `output: "export"` to `next.config.ts`; run `npm run verify` (floor 947+6) + `test:legacy` (306+5); confirm `out/` carries all 30 pages.
3. Codex changed-files review (config diff; xhigh not warranted — one line, but ship-gating visibility → route per effort rule at review time).
4. `wrangler pages deploy out/` (or `vercel deploy --prebuilt` if the owner picks Vercel) — authenticated by the owner's own account login (owner action; agents hold no credentials — RULES §11).
5. Post-deploy smoke: fetch every route, banner present, print stylesheet intact, zero external requests (browser network log).
6. Record: decision-log row (platform + URL + date), PROJECT_STATE/HANDOFF sync, README note only if the owner extends the name/README (separate act ②).

## 6. Open owner inputs

- **The deploy word itself** + platform pick (recommendation: Cloudflare Pages direct upload).
- Whether the public URL should carry the "Curbside Commons" name only in-site (current ruling) or also in the subdomain slug (e.g. `curbside-commons.pages.dev`) — cosmetic, but it's naming, so it's yours.
- Timing relative to act ② (repo/README rename) and the public flip — independent; the deploy does not expose the repo.
