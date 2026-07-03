# Restructure W0 — Migration Ledger

**Plain-English summary (one line):** The old "activation" build was archived intact into `legacy/activation/` (moved with `git mv` so history follows, nothing deleted), the empty "verifier" skeleton was laid in (`lib/verifier-core`, `lib/packs/{listings,fees}`, `bin/`, `fixtures/`, `evals/{core,packs}`), and `npm run verify` is GREEN with all 306 original tests still passing (now from their legacy location) plus 4 new skeleton tests — none dropped or weakened.

---

**Register:** professional. Slice **W0** (repo restructure, plan `docs/plan-truth-audit-execution.md` §6, executed under S0). **Mode:** spec-adherence (delegated builder). **Not committed** — the orchestrator judges and commits.

## 1 · Verify result (HARD INVARIANT)

| Command | Exit | Tests |
| --- | --- | --- |
| `npm run verify` (typecheck + lint + test + build) | **0 (GREEN)** | **310 passed \| 5 skipped** (28 files passed \| 4 skipped) |
| `npm run test:legacy` (archived activation suite only) | **0** | **306 passed \| 5 skipped** (26 files passed \| 4 skipped) |

- **Baseline reconciliation:** HEAD `5bac40f` had 306 passing + 5 skipped. After W0: the **same 306 pass** (from `legacy/activation/evals/`, proven by `test:legacy`) **+ 4 new W0 skeleton tests** (`evals/core` ×2, `evals/packs` ×2) = **310 passing**; the **5 skipped are preserved** (the key-gated `*.live.test.ts`). No test dropped, excluded, or weakened.
- **CLI stub smoke:** `node bin/check.mjs` → help/no-args/known-`check` exit 0; **unknown command exits 2 (non-zero)** per C1; zero LLM calls on the path.

## 2 · Where tests run (per the invariant — recorded per decision, not per file)

- **Decision: option (a) — archived tests keep running under `npm run verify`**, executed from their new `legacy/activation/evals/` location via added vitest `include` globs. This is the lowest-risk path to "the 306 still pass under verify" and keeps nothing silently dropped.
- **Also provided: option (b)'s separate script** `npm run test:legacy` (= `vitest run legacy/activation/evals`), satisfying plan §6's "tests runnable via separate script." Both paths cover the identical archived suite.
- New verifier skeleton tests (`evals/core/verifier-core.test.ts`, `evals/packs/packs-load.test.ts`) run under `npm run verify` only.
- `evals/e2e/console.spec.ts` (Playwright, not part of `verify`) was **left in place** — it tests the console/provenance exhibit, not the activation domain; `playwright.config.ts testDir` unchanged.

## 3 · Created (verifier skeleton — honest stubs, no drift logic)

| Path | What it is |
| --- | --- |
| `lib/verifier-core/claim.ts` | Claim schema type(s) — STUB (C2 shape) |
| `lib/verifier-core/reference.ts` | Swappable reference interface (`json-schema` \| `pos-catalog` \| `fee-rule-table`) + `ReferenceMatch` — STUB (plan §3) |
| `lib/verifier-core/evidence.ts` | `Finding` type carrying the four required C2 fields (claim · referenceRowId · ruleId · severity) + `SEVERITY_LEVELS` |
| `lib/verifier-core/report.ts` | `VerifierReport` model — STUB (S-9/C4/C10) |
| `lib/verifier-core/index.ts` | Barrel + `VERIFIER_CORE_STATUS = "skeleton-w0"` |
| `lib/packs/listings/index.ts` | UC-2 placeholder; enumerates §7 listings drift classes |
| `lib/packs/fees/index.ts` | UC-1 placeholder; enumerates §7 fee-line classes |
| `bin/check.mjs` | Thin CLI stub; prints `check … --against …` usage, exit non-zero on unknown args, $0-LLM (C1) |
| `fixtures/synthetic-restaurant/README.md` | Corpus placeholder stub (W1 fills; notes licensed + taxonomy-keyed + simulated) |
| `evals/core/verifier-core.test.ts` | Placeholder test — verifier-core loads (makes `evals/core` a real dir) |
| `evals/packs/packs-load.test.ts` | Placeholder test — both packs load (makes `evals/packs` a real dir) |

## 4 · Kept in place (shared infra + console shell — reused as-is)

| Path | Rationale |
| --- | --- |
| `lib/agents/budget.ts`, `lib/agents/pricing.ts` | Cost ledger + $5 fail-closed (plan §3 as-is); leaf modules, no back-import to legacy |
| `lib/agents/gemini.ts`, `lib/agents/groq.ts` | Provider clients (plan §3 as-is); import only kept infra |
| `lib/server/env-flags.ts` | Provider gates (plan §3 as-is) |
| `lib/product.ts` | Console branding (`PLATFORM_NAME`, `HONEST_DATA_LABEL`) — shared console shell; no activation deps |
| `lib/utils.ts` | Shared `cn()` UI util used by `components/`; no activation deps |
| `app/**`, `components/**` | Next.js console shell (the provenance exhibit) — kept building; imports repointed (§5 below) |
| `evals/e2e/`, `playwright.config.ts`, verify toolchain | Toolchain kept as-is |

## 5 · Moved to `legacy/activation/` (archive-don't-delete, `git mv` — history follows; 77 files renamed)

| From | To |
| --- | --- |
| `lib/core/**` (constants, guardrail, pipeline, types) | `legacy/activation/lib/core/**` |
| `lib/domain/**` (diagnosis, effective-rubric) | `legacy/activation/lib/domain/**` |
| `lib/ingest/**` (hybrid, overlay, sanitize, sf-adapter) | `legacy/activation/lib/ingest/**` |
| `lib/replay/**` (run, live-samples) | `legacy/activation/lib/replay/**` |
| `lib/data/**` (SF dataset + calibration snapshots + PROVENANCE.md) | `legacy/activation/lib/data/**` |
| `lib/evals/**` (draft-quality, judge-metrics) | `legacy/activation/lib/evals/**` |
| `lib/agents/{claimable-fields,domain-judge,draft,gatekeeper,groq-draft,live-batch,router,semantic-judge,state-consistency,strategist}.ts` | `legacy/activation/lib/agents/**` |
| `lib/agents/loop/**`, `lib/agents/tools/**` | `legacy/activation/lib/agents/{loop,tools}/**` |
| `evals/*.test.ts` (all activation suites) + `evals/gold/**` | `legacy/activation/evals/**` |

**Import rewrites (mechanical, alias-path only):** inside moved files, app/, and the moved eval suite, `@/lib/<moved>` → `@/legacy/activation/lib/<moved>` and `@/evals/gold/` → `@/legacy/activation/evals/gold/`. The seven KEEP paths (`@/lib/agents/{budget,pricing,gemini,groq}`, `@/lib/server/env-flags`, `@/lib/product`, `@/lib/utils`) were left untouched. Verified: no kept-infra file imports a moved file (no `lib → legacy` back-import).

## 6 · Modified (config / wiring)

| Path | Change |
| --- | --- |
| `app/{audit,console,cost,eval,metrics,merchant/[id]}/page.tsx` | Console imports of activation modules (replay/run, replay/live-samples, core/constants, domain/effective-rubric) repointed to `@/legacy/activation/lib/...`. **Chose option (a)** (move + repoint app) over (b) for every console-pinned module, for a clean verifier-only `lib/`; `@/lib/product`, `@/lib/agents/{pricing,budget}` stayed. |
| `vitest.config.ts` | `include` adds `legacy/activation/evals/**`; coverage `include` adds `legacy/activation/lib/**` (coverage runs on `npm run coverage` only, not verify — kept meaningful so activation code is not silently dropped from the metric) |
| `package.json` | Added `test:legacy` script |
| `scripts-ts/build-hybrid-snapshot.mjs` | Output path `../lib/data/...` → `../legacy/activation/lib/data/...` (generator script; not in verify) |

## 7 · Judgment calls (every choice recorded)

1. **`groq-draft.ts` → moved (not kept).** Plan's KEEP list says `groq*.ts`, which literally matches `groq-draft.ts`. Interpreted `groq*` as the **provider client** (`groq.ts` = genuine shared infra, kept); `groq-draft.ts` is activation **application** logic (imports `draft`) that verifier-core will not reuse, and keeping it would force a `lib → legacy` back-import. Moved for coherence.
2. **Console-pinned activation modules → option (a) (move + repoint app), not (b).** The console is the provenance exhibit that renders the activation product; §3 explicitly lists pipeline/diagnosis/SF-dataset as "dropped." Repointing app imports to `legacy/` yields a clean verifier-only `lib/` (the exhibit displays the archive) rather than leaving half the domain pinned in `lib/`. Green preserved.
3. **Archived tests kept under `verify` (option a) AND given `test:legacy` (option b).** Task invariant permits (a); plan §6 asks for a separate script. Did both — safest for "306 still pass under verify" while honoring §6.
4. **`product.ts` / `utils.ts` kept at `lib/`** as shared console shell (not named in the plan's KEEP list, but leaf modules with no activation deps that the console/components need).
5. **`evals/e2e/` and `lib/core`'s differential-oracle location:** `lib/core` **moved** to `legacy/activation/lib/core` (allowed — "may MOVE per the ledger"); its differential test (`core-differential.test.ts`) reads `out/merchants_v1.csv` via `process.cwd()` (repo-root-relative), so the move does not break the data path — semantics untouched, test passes from legacy. `evals/e2e` kept in place (console test).

## 8 · Consciously NOT touched / out of scope

- **No commit** (orchestrator's job). No `.env`/secret access. State docs (`PROJECT_STATE`/`CURRENT_TASK`/`HANDOFF`) not modified. No repo/product rename, no `bin` name in `package.json` (avoids implying the owner-gated "Assay" name). Nothing deleted.
- **Untracked `docs/research/{ll79-source-memo.md,uc1-rule-table.md,uc1-rule-table.draft.json}`** were present in the tree (a parallel P1 slice's artifacts) — **left untouched; not part of W0.**

## 9 · Ambiguities hit / stop points

- **No hard stops** — every ambiguity was resolvable within the spec's explicit latitude ("choose per-module for coherence, record every choice"; test option (a) vs (b)). All resolutions recorded in §7.
- One spec-vs-spec tension surfaced (task-invariant option (a) vs plan §6 "separate script") — resolved by doing **both** (§7.3), not by picking one.
