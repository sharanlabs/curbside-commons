# Vercel deploy — owner runbook

**Written 2026-07-26. EXECUTED 2026-07-27** — the site is live at
**https://curbside-commons.vercel.app**. This document is now both the procedure and the record of
what actually happened, because what happened is more useful than what was planned.

## Status: DEPLOYED

The 2026-07-26 blockers (no CLI, no `auth.json`, no token) were cleared by installing the CLI and an
owner `vercel login`. Project `prj_RA3ZL1C3T4ilf7AE7xAMXjEQk0fJ`, org `team_JFEjWZeHLROwGXXC755erEXl`
— an exact match to the team id recorded in the handoff, confirmed at link time rather than assumed.

## What went wrong — two config defects no in-repo check could see

Worth reading before any future host migration, because both were invisible locally.

**① The deploy failed outright.** `vercel.json` set both `"framework": "nextjs"` and
`"outputDirectory": "out"`. Each key is individually valid, which is exactly why every shape check
passed. Together they are contradictory: `framework: nextjs` runs Vercel's Next.js builder, which
requires `routes-manifest.json`, and `outputDirectory: out` aimed that builder at the
`output: "export"` folder, where no such manifest exists.

```
Error: The file "/vercel/path0/out/routes-manifest.json" couldn't be found.
```

Fixed with `"framework": null`, which serves the static export directly instead of invoking the
Next.js builder.

**② The next deploy succeeded and the site was still five-sixths dead.** With `framework: null`,
Vercel serves `out/` as plain static files. Next's export emits `report.html`, not
`report/index.html` (`trailingSlash` is unset), so `/` returned 200 while `/report`, `/fees`,
`/playground`, `/proof` and `/docs` all returned **404** — while `/report.html` served fine. Fixed
with `"cleanUrls": true`.

**The generalizable lesson.** Every in-repo check — including the C10 recursive walk over all 60
built pages — verifies that **the files exist**. None of them verify that **the host maps a URL to a
file**. The export was complete and correct while the site was broken, and only a live request could
distinguish the two. This is the `public/_headers` trap one level up: that file was Cloudflare syntax
Vercel never read; these were Vercel keys Vercel read and then either rejected or honored straight
into a 404.

Both are now red-green pinned in `evals/packs/header-policy.test.ts`, each carrying the actual deploy
error in its comment so the assertion traces to an outcome rather than to a preference.

## Readiness — verified, not assumed

| Check | Result |
| --- | --- |
| `npm run verify` | exit 0 — **1511 passed + 8 skipped** |
| Static export present | `out/` with **60** HTML pages |
| `robots.txt` + `og.svg` ship in the export | yes |
| `vercel.json` parses, correct shape | ~~`framework: nextjs`, `outputDirectory: out`~~ — **this row was WRONG and is kept to show how.** It read as verified because the file parsed and every key was individually valid; the combination failed the deploy (defect ① above). The shipping config is `framework: null`, `outputDirectory: out`, `cleanUrls: true`, 1 header rule with **4** headers |
| Security headers ported from Cloudflare | `X-Content-Type-Options` · `X-Frame-Options` · `Referrer-Policy` · `Permissions-Policy` |
| No retired host anywhere in the build | `pages.dev` — **0 matches** |
| `metadataBase` | `https://curbside-commons.vercel.app`, asserted against the BUILT export |

## The deploy — the commands that actually worked

```bash
npm i -g vercel                      # Vercel CLI 57.0.0
vercel login                         # interactive — run it yourself
cd ~/Desktop/curbside-commons
vercel link --yes --scope sharank98-6490s-projects --project curbside-commons
vercel --prod --yes
```

In Claude Code, prefix with `!` to run interactively — e.g. `! vercel login`.

`vercel link` also connects the GitHub repo and writes a gitignored `.env.local` holding a
`VERCEL_OIDC_TOKEN`. Both `.env.local` and `.vercel/` are covered by `.gitignore` — verified, not
presumed (RULES §11).

**Alternative, no CLI:** connect the GitHub repo (`sharanlabs/curbside-commons`) in the Vercel
dashboard. `vercel.json` is committed, so a push to `main` builds and deploys with the same config.

## After the deploy — verify, don't assume

```bash
# every route 200s
for r in "" report fees playground proof docs; do
  printf "%-12s %s\n" "/$r" "$(curl -s -o /dev/null -w '%{http_code}' https://curbside-commons.vercel.app/$r)"
done

# the four security headers actually arrive (the whole point of the vercel.json port)
curl -sI https://curbside-commons.vercel.app/ | grep -iE "x-content-type-options|x-frame-options|referrer-policy|permissions-policy"

# robots + the social card are served
curl -s https://curbside-commons.vercel.app/robots.txt | head -3
curl -s -o /dev/null -w '%{http_code} %{content_type}\n' https://curbside-commons.vercel.app/og.svg
```

**The header check is the one that matters.** `public/_headers` was Cloudflare syntax that Vercel
never reads; leaving it would have shipped a site with zero security headers while its test stayed
green. The port to `vercel.json` is verified in-repo, but only a live `curl -I` proves the host is
actually sending them.

**Run the route check against a SUBPATH, not just `/`.** Defect ② above returned 200 on `/` and 404
on all five other routes; a smoke test that only hits the root would have called that a clean deploy.

### Results, 2026-07-27

| Check | Result |
| --- | --- |
| `/` `/report` `/fees` `/playground` `/proof` `/docs` | **200** — all six |
| Four security headers on `/report` | **all four present** (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`) |
| `robots.txt` | 200 |
| `og.svg` | 200 `image/svg+xml` |
| Unknown path | 404 (correct) |

## Retire the old deploy

`curbside-commons.pages.dev` will keep serving a stale build until it is deleted or redirected. Two
live sites disagreeing about the same product is its own honesty problem — retire it in the
Cloudflare dashboard once Vercel is confirmed green.

## Record it

Add a decision-log row with the deploy URL, the commit SHA deployed, and the route/header smoke
results — the same convention every prior deploy used.
