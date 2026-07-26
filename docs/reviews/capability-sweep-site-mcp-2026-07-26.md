# Capability sweep — site + MCP — 2026-07-26

**Method:** run inline on the main thread after three consecutive background workflows died
mid-flight (two on the session limit, one on `Not logged in`). Every claim below was proved by a
command actually executed against the tree at `e13f563`.

## Site surface — 5 claims checked, 5 HOLD, 0 findings

| Claim | Verdict | Evidence |
| --- | --- | --- |
| The C10 honesty gate covers every rendered route | **HOLDS** | `htmlFiles()` (`honesty-c10.test.ts:222`) walks `out/` **recursively** — it is not a hardcoded route list, so a new route cannot escape it. All **60** built pages are scanned. |
| RULES §4(b): a permanent footer-linked "what is real" page on every page | **HOLDS** | Scanned all 60 built pages for `href="/docs` — **0 missing**. |
| Redirect stubs actually redirect in the static export | **HOLDS** | `/eval`, `/metrics`, `/cost`, `/demo`, `/audit` — all five carry a `http-equiv="refresh"`. |
| Every advertised route exists in the build | **HOLDS** | 60 HTML files including `/report` `/fees` `/playground` `/proof` `/docs` `/legacy/*` and the merchant pages. |
| Honesty bright line (RULES §4) | **HOLDS** | C10 green across the full build; no real-platform/merchant claim found. |

**The prior session's specific worry — "new surfaces missing from the honesty-scan allowlist" — is
structurally resolved.** The gate stopped being a list and became a directory walk, so the failure
mode cannot recur. Worth recording because it is the *opposite* of the pattern the other surfaces
showed: here the claim was backed by a mechanism that is complete by construction.

## MCP surface — 1 real finding (MEDIUM), fixed

| Claim | Verdict | Evidence |
| --- | --- | --- |
| No tool can reach the network or an LLM | **BROKEN → fixed** | See below. |
| Tools cannot read outside the repo | **HOLDS** | Probed 3 traversal vectors (`../../../etc/passwd`, absolute `/etc/passwd`, embedded `fixtures/../../../`) — all three refused with *"escapes the allowed root"*. |
| stdio only; no HTTP/SSE transport reachable | **HOLDS** | Pre-existing tests forbid `streamableHttp`, `/sse`, `server/express` on the reachable graph. |
| The recorded transcript comes from a real server run | **HOLDS** | `record-transcript.mjs` spawns the real server over `StdioClientTransport`; re-recorded live this session. |

### MEDIUM — the MCP import guard shared the CLI's denylist weakness

The sibling CLI guard was proved bypassable the same day (a beacon executed while its eval printed
`PASS`). The MCP guard is **genuinely better** — it carries `node:net|tls|dgram`, which the CLI's did
not — but it is still a denylist, and still had **five measured ways through**:

```
node:child_process   BYPASS      globalThis.fetch(u)   BYPASS
node:worker_threads  BYPASS      (0,fetch)(u)          BYPASS
node:inspector       BYPASS
```

**A correction on the record:** my first probe transcribed the denylist from a truncated grep and
reported `node:net`/`tls`/`dgram` as bypasses too. They are not — that line exists. Re-probed with
the full array; the five above are the real gaps. *The finding got smaller on verification, which is
the direction that matters.*

**Fix:** the shared allowlist walker (`evals/lib/import-walk.ts`) now runs alongside the denylist on
the MCP entry. Both are kept deliberately — a denylist hit says *"you imported an LLM provider"*
(legible), the allowlist says *"not permitted"* (complete). Common case gets the good message;
unknown case still fails.

**One reviewed exception:** `@modelcontextprotocol/sdk` is permitted on this surface — an MCP server
cannot exist without it. Scoped here, not estate-wide, and *absent* from the CLI's allowlist where
importing it would be a real finding. It is not blind: the SDK ships HTTP/SSE transports, and the
pre-existing tests already keep them unreachable. The allowlist grants the package while a narrower
check keeps its networked half out.

## Also fixed this pass — the MCP protocol revision was unobservable

The transcript recorded `serverInfo`, `capabilities` and `instructions` but **not the negotiated
protocol revision** — so the single fact that most defines an MCP server's currency was invisible to
a byte-lock built to freeze exactly that session. An SDK bump could change the negotiated revision
with every test staying green.

Now captured via the transport's `setProtocolVersion` hook (the Transport interface exposes no
getter) and pinned at **`2025-11-25`**. An earlier cut of that line read `transport.protocolVersion`,
which does not exist — it would have frozen `null` into the golden forever: a field that looks like
coverage and observes nothing.

## Currency, verified live (as-of 2026-07-26)

| Thing | Pinned | Current | Action |
| --- | --- | --- | --- |
| `@modelcontextprotocol/sdk` | 1.29.0 | 1.29.0 | none |
| MCP protocol revision | *(uncited)* | **2025-11-25** | recorded + pinned; a stale `2025-06-18` citation corrected |
| UCP schemas | v2026-04-08 | **v2026-04-08** (latest release; next-newest 2026-01-23) | none |
| Gemini flash / flash-lite pricing | $0.30/$2.50 · $0.10/$0.40 | unchanged | none — `PRICING_VERSION` deliberately NOT bumped, since it tracks prices, not read-dates |

`gemini-2.5-flash` remains active (newer generations exist alongside it). Model *selection* is a
separate owner-gated decision from price currency.

## Coverage note

All five surfaces are now audited: CLI, delivery, evals, site, MCP. Three returned real defects
(delivery ×5, CLI ×4 incl. a HIGH, MCP ×1); two came back clean (evals 12/12, site 5/5).
