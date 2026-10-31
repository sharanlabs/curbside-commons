# Security one-pager

**Type:** reference · **Audience:** a platform's security, privacy and procurement reviewers · **Written:** 2026-10-12, Wave 1 / S4-docs · **Contract:** plan § 6 (security packet), decision D-7(a) and gap sheet page 3 (`docs/plan-wave2-gap-sheet-2026-10-12.md`).

## The answer first

The tool runs in **one of three modes**. In two of them no data leaves the machine. In the third, an owner-armed live demonstration on **synthetic data only**, two hosted model providers are sub-processors. **Inside the platform's environment, only replay or a local model is used, and no sub-processor is involved.** This project never receives platform data.

*In plain words:* by default nothing leaves your screen. Only when the owner switches on a live demonstration, and only with invented data, does a request go to an outside AI provider. A future run on a platform's own data — not part of this pilot — would stay behind the platform's walls and would need its own assessment.

## What this page is not claiming

- **No certification or audit attestation is held or claimed:** no SOC 2, no ISO certificate, and **ISO/IEC 42001 is NOT claimed**. No external penetration test is recorded in the repo. The only security reviews on record are internal (for example `docs/security/vuln-scan-2026-07-31-upload-surface.md`).
- **Synthetic on our side, always.** "Shaped like the public integration docs, not from the platform." No affiliation, partnership, endorsement, access or real-world impact is claimed.
- It is a **prototype run on demand**, not an operated service. There is no uptime, incident-response or support commitment.
- Human-led, AI-assisted, professionally reviewed (`RULES.md` §4).

## 1 · The three-mode data path

| Mode | Where it runs | What reaches a model host | Sub-processor | Data |
| --- | --- | --- | --- | --- |
| **1 · Site (replay)** | The visitor's browser, from a static export | Nothing. Replay only; the engine runs in the tab | **None** | Synthetic, bundled |
| **2 · CLI or MCP on synthetic scenarios** | The operator's machine | **Replay by default.** Only when the owner arms a live run (`ENABLE_LIVE_AI` plus a key) do model calls leave the machine | **Groq** (free tier) and **Google** (AI Studio free tier), **only in owner-armed live mode** | Synthetic scenario data only, never anything else |
| **Future: inside a platform's environment (NOT part of this pilot)** | The platform's machine, run by the platform | **Nothing.** Tier A (replay) or Tier D (a local model) only | **None. This project never receives the data.** | Would require a separate data-boundary and security assessment before any platform data is used; not in scope for the six-week synthetic pilot |

**Sub-processor terms, as far as this lane can state them.** Plan § 8 records, for Google's AI Studio free tier, that **content may be used by Google** (2026-10-09, not re-verified by this lane); that is acceptable only because mode 2 sends synthetic data. Groq's free-tier data-use terms were **not re-read by this lane: UNVERIFIED**. The rule that covers both is structural: only synthetic data ever reaches either provider, and mode 3 reaches neither.

## 2 · Controls and the evidence for each

| Claim | Evidence in the repo | Status |
| --- | --- | --- |
| **The engine has no network or model dependency** | Import-graph tests: `evals/packs/import-walk-guard.test.ts` (the guard's own guard, with known-positive and known-negative cases), `evals/packs/walkthrough-zero-egress.test.ts`, `evals/packs/landing-delivery-egress.test.ts`, `evals/crew/crew-import-walk.test.ts` | BUILT |
| **The public site cannot reach a live model** | Live paths are gated by `ENABLE_LIVE_AI` and a key and are off in the public deployment (`lib/server/env-flags.ts`) | BUILT |
| **Nothing is sent** | The Slack and email builders produce payloads; no send transport is wired into the site, CLI or MCP tools | BUILT |
| **Anything that would act needs a signed human decision** | Offline Ed25519 approval simulator with seven ordered checks (`lib/approvals/`) | BUILT as a simulator |
| **Prompt-injection tripwire before any model turn** | `lib/crew/injection-scan.ts`; hardening for Unicode normalization and multilingual and Base64 payloads | Tripwire BUILT; hardening ARRIVES S3 |
| **Customer fields are dropped at ingest** | Allow-list, drop by default, with a planted-field test. The spreadsheet (CSV) path already reads only named columns and drops the rest (`lib/playground/csv-adapters.ts`). The JSON feed path does not yet project nested keys: a planted `customer_email` inside a `modifiers[]` object passes into the report today (security review F4, 2026-10-31) | CSV: BUILT; JSON: ARRIVES with S1.5 (in progress) |
| **A run record exists** | Hash-chained, append-only ledger, exportable as JSON-lines | Library MERGED on `main` 2026-10-31 (`lib/ledger`); a crew run that writes to it ARRIVES S2 (in progress) |
| **No secrets in the repo** | `RULES.md` §11; `.env.example` is the template; contact data is fake | Rule; checked by review |
| **License** | Apache-2.0 (`LICENSE`; `package.json`) | BUILT |
| **Dependencies are listed** | `package.json` `dependencies`. No analytics or telemetry SDK appears there at commit `fac8204`. | BUILT |
| **Dependency audit and a software bill of materials** | CI artifacts from `npm audit` (production dependencies) and a CycloneDX SBOM | ARRIVES in the Wave 2 hygiene slice |

## 3 · Known gaps, stated

- **No Content-Security-Policy header today.** Production verification on 2026-10-09 found four security headers plus HSTS on a subpath and **no CSP** (plan § 12, S0).
- **The live budget guard is a pre-call estimate.** No active driver is wired to it, and the post-call overflow stop must be re-implemented before any live arming. See `docs/model-risk-register.md` § 5.
- **Hosted model ids are unpinned.** Provider behavior can drift between runs; replay is what keeps a walkthrough stable. A canary arrives in S5.
- **Hosting-provider logs are outside this repo.** The static site is hosted on a free hosting tier. What request logging the provider keeps for the project is **UNVERIFIED**; the site itself ships no analytics SDK.
- **The local-model path (Tier D) has not been smoke-tested.** That run on the owner's machine arrives in S5.
- **Free-text columns in an export are the privacy risk.** See `data-request-spec.md` § 3.

## 4 · How to check these claims yourself

Clone the repository. `npm run verify` runs the build and the tests, including the import-graph and honesty scans named above. The walkthrough command prints the Slack and email payloads instead of sending them. Adding a single network call to a guarded file turns the guard red, which `import-walk-guard.test.ts` proves in both directions.

## Sources and dates

Plan §§ 6, 8, 12 (2026-10-09); gap sheet pages 3 and 5 (2026-10-12); `docs/decision-log.md` 2026-10-12; files named in the table at commit `fac8204`. **Platform and provider terms are cited as recorded by the plan and were not re-read by this lane.**
