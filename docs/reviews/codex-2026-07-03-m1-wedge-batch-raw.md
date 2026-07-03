collab: Wait
codex
[P1] `bin/check.mjs:87` — `--conformance` wins over `--against`, so mixed-mode commands silently skip the truth leg — this matters because the headline exhibit is explicitly conformant but false (`evals/packs/ucp-conformance.test.ts:145`) — failure scenario: `check conformant-but-false.json --conformance --against sor.catalog.json` exits clean on schema shape while never checking the SOR lie — suggested fix: make `--conformance` mutually exclusive with `--against`/`--surface`, exit `2`, and add a regression using `conformant-but-false.json`.

[P2] `lib/packs/listings/drift.ts:276` — `drift-013` is labeled ACP-only staleness but mutates shared `availability` to `pre_order`, which leaks into the UCP report as availability drift via `lib/packs/listings/ucp.ts:67` and `lib/packs/listings/adapters.ts:89` — this matters because the manifest’s surface labels are part of C3 evidence — failure scenario: UCP shows `LST-AVAIL-STATE` for `item-004-v1` even though `fixtures/synthetic-restaurant/drift-manifest.json:141` says ACP-only — suggested fix: build UCP fixtures from a surface-specific mutation set or relabel/test the mutation as UCP availability-affecting.

[P2] `evals/packs/listings-coverage-c6.test.ts:49` — C6 “caught” is category-level, not manifest-entry-level — this matters because a false positive in the same category can satisfy “8/8 caught” while a planted row is missed — failure scenario: remove detection for one price subtype but keep another price finding and C6 still reports price caught — suggested fix: assert each manifest entry is covered by `(class, target row/reference, intended surface)`, then separately report the compressed 8/8 class summary.

[P2] `components/report/ReportView.tsx:53` — the report claims C2 receipts are visible, but it does not render `claim.source` even though the guard now requires it at `lib/verifier-core/guard.ts:55` and the view model carries it at `lib/packs/listings/report-view.ts:29` — this matters because “claim” evidence is weaker without source when ACP/UCP/conformance rows share field paths — failure scenario: a rendered report shows `price.amount = 23.50` but not whether the claim came from `acp-feed` or `ucp-catalog` — suggested fix: render `claimSource` in the claim receipt and assert it in `evals/packs/report-view-c1.test.ts`.

[P2] `evals/packs/ucp-conformance.test.ts:91` — the “each invalid fixture violates exactly one named schema rule” promise is not enforced — this matters because `lib/packs/listings/ucp-corpus.ts:4` and manifest text make an exact-one claim, but the test only checks `.toContain(e.violationClass)` — failure scenario: a fixture accidentally violates both `TYPE` and `REQUIRED`, still passes if the declared class appears — suggested fix: assert distinct `ruleId` set equals the declared class, or soften the corpus promise to “at least the declared class.”

[P3] `components/report/ReportView.tsx:124` — public copy says “no AI,” while the C10 grep gate does not scan `components/report` or `app/report` (`evals/packs/honesty-c10.test.ts:34`) — this matters because project rules forbid broad “no AI was used” implications — failure scenario: the report page can drift into forbidden AI-honesty language without the gate catching it — suggested fix: say “no AI calls in this verifier runtime” and include report files in the C10 scan.

[P3] `bin/check.mjs:75` — extra non-flag positional arguments are ignored — this matters for CI command hygiene after W3 tightened unknown flags — failure scenario: `check a.json b.json --against sor.json` silently uses `a.json` and ignores `b.json` — suggested fix: parse mode-specific arguments and reject surplus positionals with exit `2`.

CONFIRMED:
- W1 C1 exit contract exists for normal truth/conformance paths: clean `0`, findings `1`, usage/input `2` are tested in `evals/packs/cli-c1.test.ts:35`.
- W1 C2 core guard holds for generated findings: `makeFinding` requires claim, reference row, rule, severity at `lib/verifier-core/guard.ts:47`, and `buildReport` revalidates at `lib/verifier-core/verify.ts:82`.
- W1 C3 one comparator/two adapters is real for the synthetic surfaces: ACP/UCP adapters normalize claims at `lib/packs/listings/adapters.ts:44` and `:76`; differential tests cover shared manifest entries at `evals/packs/listings-differential-c3.test.ts:59`.
- W1 C6 8/8 injected + 8/8 caught holds only at taxonomy-class level: class list is `lib/packs/listings/index.ts:16`, and C6 computes category sets at `evals/packs/listings-coverage-c6.test.ts:53`.
- W1 C10 simulated/no-real-access labeling is present in fixture docs: `fixtures/synthetic-restaurant/README.md:6`, `:84`, and `fixtures/README.md:109`.
- Headline conformance-vs-truth claim holds in tests: `conformant-but-false.json` is asserted conformance-clean and truth-dirty at `evals/packs/ucp-conformance.test.ts:145`.

Summary: The core comparator and guard are directionally sound, but the CLI has a serious mode-confusion bug that can turn a false menu into a passing check. The strongest remaining issues are test-integrity and honesty-boundary gaps: C6 is class-level only, one ACP-only mutation leaks into UCP, and report receipts omit source. I did not run full verification in this read-only sandbox; this verdict is based on file inspection, the produced git/diff evidence, and the subagent’s targeted CLI confirmation.

VERDICT: BLOCK
tokens used
