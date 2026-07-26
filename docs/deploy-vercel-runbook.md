# Vercel deploy — owner runbook

**Written 2026-07-26.** The repo is deploy-ready; the deploy itself is an owner action and this
document is why, plus exactly what to run.

## Why this session could not deploy it

Checked on this machine, not assumed:

- `which vercel` → **not installed**
- `~/Library/Application Support/com.vercel.cli/auth.json` → **absent** (the CLI is not logged in)
- `config.json` → has `currentTeam: team_JFEjWZeHLROwGXXC755erEXl` but **no token**

So the account exists and the team is the one recorded in the handoff, but nothing here can
authenticate. Deploying is also owner-gated by `RULES.md` regardless — this is a real blocker *and* a
governed one.

## Readiness — verified, not assumed

| Check | Result |
| --- | --- |
| `npm run verify` | exit 0 — **1511 passed + 8 skipped** |
| Static export present | `out/` with **60** HTML pages |
| `robots.txt` + `og.svg` ship in the export | yes |
| `vercel.json` parses, correct shape | `framework: nextjs`, `outputDirectory: out`, 1 header rule with **4** headers |
| Security headers ported from Cloudflare | `X-Content-Type-Options` · `X-Frame-Options` · `Referrer-Policy` · `Permissions-Policy` |
| No retired host anywhere in the build | `pages.dev` — **0 matches** |
| `metadataBase` | `https://curbside-commons.vercel.app`, asserted against the BUILT export |

## The deploy

```bash
npm i -g vercel          # not installed on this machine
vercel login             # interactive — run it yourself
cd ~/Desktop/curbside-commons
vercel link              # team: team_JFEjWZeHLROwGXXC755erEXl, project: curbside-commons
vercel --prod            # vercel.json already pins framework + outputDirectory
```

In Claude Code, prefix with `!` to run interactively — e.g. `! vercel login`.

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

## Retire the old deploy

`curbside-commons.pages.dev` will keep serving a stale build until it is deleted or redirected. Two
live sites disagreeing about the same product is its own honesty problem — retire it in the
Cloudflare dashboard once Vercel is confirmed green.

## Record it

Add a decision-log row with the deploy URL, the commit SHA deployed, and the route/header smoke
results — the same convention every prior deploy used.
