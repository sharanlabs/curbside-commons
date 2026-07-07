# A0 slice record — tool registry (agentic extension, plan §5 row A0)

**Slice:** A0 (plan `docs/plan-agentic-extension.md` v1.0 §3–§6, §5 row A0). **Mode:** SPEC-ADHERENCE (delegated implementer lane; Fable orchestrates/judges — top-model-final). **Date:** 2026-07-07. **Status:** built + self-verified; **NOT committed** (awaits Fable equivalence review of the diff, per the standing 2026-07-03 bar → any downstream Codex batch → acceptance-gate).

Professional register leads; *plain-English lines are marked ▸*.

▸ *Plain: this slice builds the one panel of six clearly-labeled buttons ("check this feed", "check this document's shape", "audit this fee bill", "audit + flag the AI's suspicions", "look up a legal rule", "run the scripted demo") that every later AI helper/plug-in/automation will press instead of reaching into the checker's engine room directly. None of the existing checker code was touched — this is a wrapper layer with its own tests proving it agrees with the checker byte-for-byte.*

## 1 · What was built

**Source (`lib/tools/`):**
- `types.ts` (116 lines) — the `ToolResult` envelope type, `ToolDefinition` interface, `freezeToolResult` (the ONLY sanctioned envelope constructor — enforces `ok === (exitCode === 0)` at construction, throws otherwise), and the three typed errors: `ToolInputError` (carries the ajv errors), `ToolNotFoundError`, `RuleNotFoundError`.
- `ajv.ts` (34 lines) — a SEPARATE ajv instance from `lib/packs/listings/conformance.ts` (that file is untouched), same package/draft/`ajv-formats`-interop style, exporting `compileSchema`.
- `schema-loader.ts` (19 lines) — reads a committed schema file from `lib/tools/schemas/` off this module's own URL (works from any cwd).
- `serializers.ts` (49 lines) — the two NEW named canonical serializers this slice adds: `serializeClassifiedFeeReport` (classify_and_audit's envelope: the base report round-tripped through the EXISTING `serializeFeeReport`, plus `advisoryFindings` as a separate stably-keyed section, in statement order) and `serializeRuleLookup` (get_rule's three payload shapes).
- `registry.ts` (130 lines) — the `REGISTRY` map (six `ToolDefinition`s), one compiled ajv input/output validator per tool, and `callTool(name, params)`: validates params via ajv BEFORE running, throws `ToolNotFoundError`/`ToolInputError` loud, never swallows a tool's own runtime error.
- `tools/check-feed.ts`, `tools/check-conformance.ts`, `tools/audit-statement.ts`, `tools/classify-and-audit.ts`, `tools/get-rule.ts`, `tools/run-demo.ts` — one file per tool (38–64 lines each), each wrapping an UNCHANGED engine entry point.
- `schemas/*.schema.json` (12 files) — committed input + output-envelope JSON Schema per tool. Output schemas validate ONLY the envelope shape (incl. `demoOnly`/`advisory`/`earnsLabel` where applicable); `canonical`'s inner shape is each engine serializer's own contract, asserted by the differential tests, not re-schematized (plan §5 row A0).

**Tests (`evals/tools/`):**
- `registry-ac1.test.ts` (195 lines) — AC-1: per tool, a valid-input happy case + ≥1 invalid-input case (typed `ToolInputError` with ajv errors attached) + output-envelope schema validation; an unregistered-tool case (`ToolNotFoundError`); get_rule's unknown-`ruleId` case (`RuleNotFoundError`).
- `registry-ac2-differential.test.ts` (162 lines) — AC-2 (the load-bearing test): every tool's `canonical` compared byte-for-byte against a DIRECT engine call through the SAME named serializer, plus exit-code parity, over real fixtures (see §3 for the exact corpus list).
- `registry-ac3-import-graph.test.ts` (102 lines) — AC-3: the transitive import-graph walk from `lib/tools/registry.ts`, same pattern/ban-list as the existing `cli-c1`/`demo-blindness` $0-LLM proofs; asserts `lib/agents/**` is unreachable at all, no bare `fetch(`, no `node:http(s)`.
- `registry-envelope-goldens.test.ts` (64 lines) + `gold/*.golden.json` (6 files) — one representative committed `ToolResult` per tool, byte-frozen.
- `registry-advisory-never-gates.test.ts` (90 lines) — a dedicated in-memory (OS-temp-file) case proving `classify_and_audit`'s exit code is driven by `base.ok` ONLY, never by `advisoryFindings` — see E-2 below for why the corpus fixtures alone could not prove this.

**Docs (same breath):** `docs/PLAIN-ENGLISH.md` — one leading status row (2026-07-07) + an "Update" line under the existing 2026-07-06 status paragraph. `docs/GLOSSARY.md` — three new alphabetically-placed entries (Canonical serializer, Tool envelope, Tool registry) + the "Last updated" line bumped.

**No new npm dependencies** (ajv/ajv-formats already dependencies, reused per the packet's instruction to "import the same ajv the conformance leg uses" — a separate instance, same package/style, conformance.ts untouched).

## 2 · Escalations (judgment calls for the orchestrator to overrule)

- **E-1 — `run_demo`'s default `format` is `"json"`, diverging from the CLI's own text-first default.** The packet states the params shape literally: `{format?: "text"|"json", default "json"}`. The CLI (`bin/check.mjs`) defaults to text for a human at a terminal; a tool-registry caller (MCP client, agent, workflow) is a program, not a terminal, so machine-JSON-first is the more useful registry-level default. Implemented exactly per the packet's literal default. **Overrule path:** a one-line default-value change in `lib/tools/tools/run-demo.ts` if text-first is preferred for registry consistency with the CLI.
- **E-2 — `classify_and_audit`'s "advisory never gates" invariant needed an IN-MEMORY case, not a fixture, to be provably exercised end-to-end.** All four committed fee-statement corpus fixtures were checked directly (`node` one-liners, not guessed): every fixture with a CLEAN base audit (`faithful`, `cured`, `conditional`) also happens to have ZERO baseline-classifier disagreements, and the one fixture with classifier disagreements (`drifted`, 3 advisory findings) already has a non-clean base audit — so no committed fixture combines "clean base + nonzero advisory" and the AC-2 differential loop alone cannot distinguish "exitCode driven by base.ok" from "exitCode accidentally also correct because advisories only appear on already-failing statements." **Resolution:** `registry-advisory-never-gates.test.ts` builds one small synthetic `MonthlyStatement` in-memory (a single line, "Promo adjustment fee" declared `delivery_fee`, well under cap — base audit clean; the baseline's promo/adjustment keyword rule relabels it `not-a-permitted-fee` — one advisory finding), writes it to an OS-temp file (never `fixtures/`, per the hard constraint), and asserts the registry call still returns `ok:true, exitCode:0`. The RG-4 mutation cycle (§3) proves this is exactly the eval that catches a gating regression the corpus-only differential missed (1 failed there; 0 failed in the corpus-only differential run under the same mutation). **Overrule path:** none expected — this strengthens AC-2's own stated intent (recommend-don't-decide) rather than substituting for it.
- **E-3 — `serializeClassifiedFeeReport`'s exact algorithm was under-specified; resolved conservatively.** The packet says: "serialize base via the existing serializeFeeReport + the advisory array as a separate stable-keyed JSON section — advisory findings serialized in statement order." Implemented literally: `JSON.parse(serializeFeeReport(report.base))` (a genuine round-trip through the named serializer, not just re-embedding the same JS object) assembled into `{ base, advisoryFindings }`; `advisoryFindings` is `[...report.advisoryFindings]` with no re-sort, since `auditWithClassification` already iterates `statement.lines` in order and pushes in that order (verified by reading `classified-audit.ts`, not assumed). **Overrule path:** if a different top-level key name or a string-concatenation-based serializer (rather than round-tripping) is wanted, this is a one-function edit; the differential tests only assert against whatever this function does, so nothing else would need to change.
- **E-4 — `get_rule`'s exit code was unspecified for the lookup case; resolved as always `0`/`ok:true` on every successful branch (including the non-statement-checkable answer).** The packet gives exit-code rules for every OTHER tool but not this one. Read `get_rule` as a pure lookup (never a pass/fail check per its own doc comment intent), so a correctly-ANSWERED "this rule can't be checked from a statement" is a SUCCESS, not a failure — only an actually-unknown `ruleId` is an error, and that is modeled as a thrown `RuleNotFoundError`, not a nonzero exit code. **Overrule path:** if `get_rule` should carry a distinct exitCode convention (e.g., nonzero for non-statement-checkable), the output schema's `exitCode`/`ok` `const` values are the only things that would need to change.
- **advisor unavailable this session** (tool call returned "unavailable, do not retry"). Mitigated by: the 5-cycle RED-GREEN log (`docs/reviews/a0-verify-evidence.log`), this escalation record, and the standing plan-level Codex cross-check already done at the PLAN stage (`docs/reviews/codex-2026-07-07-agentic-plan-crosscheck.md`, referenced by the plan). No downstream Codex changed-files review has run yet on THIS diff — flagged for the orchestrator to route per the module's own gate (§5 row A0: "per-slice verify + red-green + Codex changed-files").

## 3 · Red-green index (raw in `docs/reviews/a0-verify-evidence.log`)

| # | Change proven | Mutation → RED | Target eval |
| --- | --- | --- | --- |
| RG-1 | Input validation (AC-1) | Removed the `surface` enum constraint from `check_feed.input.schema.json` | `registry-ac1` (1 failed, 20 passed) — a bad `surface` value reached `runCheck` and threw an unrelated `TypeError` deep inside instead of the loud `ToolInputError` at the boundary |
| RG-2 | Differential equality (AC-2) | Appended `"MUTATED-RG-2"` to `check_feed`'s canonical output | `registry-ac2-differential` (4 failed — exactly check_feed's 4 cases; 34 passed) |
| RG-3 | `demoOnly` flag (Codex amendment 7) | Omitted `demoOnly: true` from `run_demo`'s envelope | `registry-ac1` + `registry-envelope-goldens` (3 failed, 24 passed) — caught on THREE independent surfaces: the AC-1 assertion, the output schema's required `demoOnly` (ajv), and the byte-frozen golden |
| RG-4 | Advisory-never-gates (recommend-don't-decide) | Let a nonzero advisory finding gate `classify_and_audit`'s `ok`/`exitCode` even on a clean base audit | `registry-advisory-never-gates` + `registry-ac2-differential` (1 failed, 40 passed — the corpus-only differential did NOT catch it; only the dedicated in-memory eval did — see E-2) |
| RG-5 | Import walk ($0-LLM, AC-3) | Planted `import "node:https";` in `registry.ts` | `registry-ac3-import-graph` (1 failed, 3 passed) |

Each cycle: mutate → RED → revert → GREEN. Post-revert, all five mutated files were byte-diffed against pre-mutation backups (empty diff on all five — logged verbatim).

## 4 · Gates

- `npm run verify` → **exit 0** — Test Files 62 passed | 5 skipped (67); **Tests 821 passed | 6 skipped** (baseline 749+6; **+72** new, all in `evals/tools/`); `next build` ✓ (30/30 static pages).
- `npm run test:legacy` → **exit 0** — **306 passed | 5 skipped** (unchanged, hard constraint).
- `npx eslint lib/tools evals/tools --max-warnings=0` → clean.
- `npx tsc --noEmit` → clean (part of `verify`).
- **Diff-scope proof:** `git status --porcelain` shows exactly `?? evals/tools/`, `?? lib/tools/`, `?? docs/reviews/a0-verify-evidence.log` (this record itself pending), plus `M docs/decision-log.md` — that modification PRE-EXISTS this slice (the owner's 2026-07-07 GO entry authorizing this very build, already in the working tree before this implementer session began; verified via `git diff docs/decision-log.md`, not touched by this slice). No file under `lib/packs/**`, `lib/verifier-core/**`, `lib/agents/**`, `bin/check.mjs`, any existing `evals/**` file, `fixtures/**`, or any golden/snapshot was modified.

## 5 · Acceptance-criteria self-check (against plan §4 wording, this slice's subset)

- **AC-1 (registry contract):** every tool has a committed input AND output JSON Schema; invalid input fails loud via `ToolInputError` (ajv errors attached); envelope validates against its own output schema. ✓ (`registry-ac1.test.ts`, 21 tests)
- **AC-2 (differential fidelity, canonical):** registry canonical ≡ direct engine call through the SAME named serializer + exit-code parity, per tool × corpus (check_feed: 4 fixtures incl. both surfaces faithful/drifted; check_conformance: 2 valid + 2 invalid; audit_statement + classify_and_audit: all 4 committed statement fixtures; get_rule: all 11 `FEE_RULES` + all 6 `NON_STATEMENT_CHECKABLE` ids (exceeds the ≥2 floor) + 1 unknown; run_demo: both formats). ✓ (`registry-ac2-differential.test.ts`, 38 tests)
- **AC-3 ($0/offline core):** import-graph eval from `lib/tools/registry.ts` reaches no LLM/network module; `lib/agents/**` unreachable at all; no bare `fetch(`/`node:http(s)`. ✓ (`registry-ac3-import-graph.test.ts`, 4 tests)
- **Envelope goldens byte-frozen:** one representative call per tool, freeze-tested. ✓ (`registry-envelope-goldens.test.ts`, 6 tests)
- **Recommend-don't-decide (classify_and_audit):** `advisory:true`, `earnsLabel:false` surfaced verbatim; exit code driven by `base.ok` only, proven by a dedicated in-memory case the corpus alone could not exercise (E-2). ✓ (`registry-advisory-never-gates.test.ts`, 3 tests)
- **`run_demo` never mistakable for an audit result (Codex amendment 7):** `demoOnly:true` always, `exitCode` always 0, enforced by the output schema's required property. ✓

## 6 · Deferred / not done (by design, out of A0's scope)

- **A1 (MCP server), A2 (agent crew), A3 (delivery builders), A4 (n8n lane), AM (module ceremony)** — not this slice; A0 is the seam they will each consume (plan §5 DAG).
- **Codex changed-files review of this diff** — not run in this session (advisor also unavailable; see E-4/escalation note). Flagged as the standing next gate before this diff is treated as accepted, per the module's own row in §5 ("per-slice verify + red-green + Codex changed-files").
- **Commit / push** — not done; diff left uncommitted for Fable equivalence review.

## §4 Codex changed-files review + reconciliation (2026-07-07, post-Fable-review)

Verdict: findings — 3 P2 + 1 P3 (raw: docs/reviews/codex-2026-07-07-a0-registry-raw.md). All four ACCEPTED and fixed same-session (see the evidence log's reconciliation addendum + RG-6/RG-7). Fable-equivalence review: PASS with 1 elevation fix (PLAIN-ENGLISH table split) + escalations E-1..E-4 accepted. Final: verify re-run green post-fixes.
