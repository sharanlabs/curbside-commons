# Tech-stack test plan — every layer, how it's tested, what a live run needs

**Plain-English:** the product isn't just a website — it's an engine, a command-line
tool, an MCP server an AI agent can call, an LLM classifier lane, and delivery
integrations. This plan lists **every layer**, how each is tested, whether it's green
today, and — for the lanes that make a real outside call — exactly what to arm and run.
Test data lives in `fixtures/synthetic-restaurant/` and the how-to-test guide is
`docs/how-to-test.md`.

Three buckets: **[GREEN]** automated + passing today · **[LIVE]** works but needs a real
key/target to exercise end-to-end · **[BUILD]** planned but not yet wired for a live test.

---

## The matrix

| # | Layer | Tech | How it's tested | Status |
|---|---|---|---|---|
| 1 | **Website** | Next.js static export, React | Playwright e2e (47) + deployed + 7-route smoke | **[GREEN]** live at curbside-commons.pages.dev |
| 2 | **Verifier engine** | TypeScript, deterministic | vitest unit + byte-frozen goldens | **[GREEN]** (in the 1286-test suite) |
| 3 | **CLI** | `bin/check.mjs` | evals + `npm run demo`/`check:fees` | **[GREEN]** |
| 4 | **MCP server** | `@modelcontextprotocol/sdk`, stdio | mcp evals (conformance, invalid-input, path-traversal, import-walk) | **[GREEN]** |
| 5 | **Tool registry** | ajv-validated tools | tool goldens | **[GREEN]** |
| 6 | **Crew orchestration** | TypeScript, engine-decides | crew safety + case evals (offline) | **[GREEN]** offline · **[LIVE]** for a real model run |
| 7 | **RAG lookup** | BM25, extractive | rag evals (pre-registered floors) | **[GREEN]** (advisory/experimental) |
| 8 | **LLM classifier** | Groq `gpt-oss-120b` / Gemini via `ai` SDK | gold + 3 `.live.test.ts` | **[LIVE]** — keys in your `.env` |
| 9 | **Slack delivery** | incoming webhook | goldens + one-shot send | **[GREEN + LIVE-DONE]** delivered HTTP 200 (2026-07-21) |
| 10 | **Email / Resend** | `lib/delivery/email.ts` builder + one-shot | goldens + one-shot send | **[LIVE]** transport ready — first send pending the owner's word |
| 11 | **n8n automation** | `.n8n-artifacts/` workflow | manual episodic run | **[BUILD/LIVE]** run the workflow |
| 12 | **Supabase** | — | — | **[BUILD]** not built (enterprise-path) |

---

## [GREEN] — run the whole automated stack in one command

```bash
npm run verify        # typecheck + lint + build + 1286 vitest tests (engine, CLI, MCP, crew, RAG, tools, honesty)
npm run test:e2e      # Playwright — the website, 47 tests
npm run test:legacy   # the archived activation module, 306 tests
```
All green as of 2026-07-22 (re-verified: `npm run verify` exit 0, 1286 passed + 8 skipped). This covers layers 1–7 and 9–10 (offline) with no keys.

---

## [LIVE] — lanes that make a real call (need a key/target you own)

Each is **owner-armed**: the secret goes in the gitignored `.env`, never committed, and
the run reads it from the environment (the agent never sees it).

**8 · LLM classifier (Groq / Gemini)** — keys already in your `.env`:
```bash
# injection-resistance (safe to re-run — proves the lane resists steered input):
ENABLE_LIVE_AI=true node --env-file=.env node_modules/.bin/vitest run evals/gold/fee-classifier-injection-resistance.live.test.ts

# the calibration evals are PRE-REGISTERED scored runs (already passed) — re-run only deliberately:
ENABLE_LIVE_AI=true node --env-file=.env node_modules/.bin/vitest run evals/gold/fee-classifier-calibration.live.test.ts
```

**6 · Crew live run (Groq)** — the multi-agent loop with a real model. Its recorded
run's turns are **regression-locked and green** (`evals/crew/l1-live-lock.test.ts`, in
the suite), and the underlying Groq path is the same one the classifier test above just
proved live. A FRESH live run is an owner-armed one-shot (probe the free-tier window
first, per the doctrine):
```bash
node --env-file=.env scripts-ts/groq-preflight.mjs
ENABLE_LIVE_AI=true node --env-file=.env scripts-ts/crew-live-l1-run.mts
```

**9 · Slack delivery** — DONE 2026-07-21 (HTTP 200). To send again, one word + a fresh webhook:
```bash
node --env-file=.env scripts-ts/l2-slack-one-shot.mts
```

**10 · Email delivery (Resend)** — the one-shot transport exists (`scripts-ts/l2-resend-one-shot.mts`,
same 8 safety controls as Slack; sends the same real audit to a recipient YOU own via Resend's
free-tier test sender). Owner-armed: `RESEND_API_KEY` + `RESEND_TO` in the gitignored `.env`, then:
```bash
node --env-file=.env scripts-ts/l2-resend-one-shot.mts
```

Cost: Groq is free-tier; Gemini is capped under $5 by policy. Prior live runs were ~$0.05 total.

---

## [BUILD] — planned but not yet testable end-to-end

These are honest gaps, not hidden failures. Each has a clear path:

- **n8n (11)** — a workflow exists in `.n8n-artifacts/`; it's been run episodically. To test: `npx n8n` locally, import the workflow, trigger it manually (it calls the tool registry, no standing service). Owner-run.
- **Supabase (12)** — **not built.** It's in the *enterprise-expansion path*, never wired into the prototype (which is client-side + CLI, no database). Testing it means first deciding to build a minimal storage lane — a scope call for you, not a hidden failure.

---

## What "all tested" means here (honest scope)

- **Automated core (layers 1–7, 9–10 offline): fully green, no keys.**
- **Live LLM + crew + Slack + email: exercisable now** — Slack done, LLM running, crew and the email one-shot each one command away (you hold the keys).
- **n8n, Supabase: need a manual run / a scope decision** respectively — neither pretends to work today.

Nothing in the stack claims to be tested that isn't, and nothing claims real-platform access — every live lane runs on simulated inputs against real rules/law, owner-armed, on your own targets.
