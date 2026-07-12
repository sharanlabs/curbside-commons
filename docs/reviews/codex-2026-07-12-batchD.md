# Batch D — Codex changed-files review + reconciliation (2026-07-12)

**Reviewer:** ONE `gpt-5.6-sol@high` run via `~/claude-os/bin/codex-guarded`
(probe-first: SEAT_OK, 15,274-token probe). **Scope:** `ab2da33..d432fa4` — all of
slice group D (E2 extractive RAG build + scoring · E3 MCP-approvals offline
simulator · E4 entity resolution · E1b dashboard/public reconciliation); 151 files,
+12,739/−34. Raw transcript: `codex-2026-07-12-batchD-raw.log` (9,006 lines).

**VERDICT: REVISE — 5 P1 · 5 P2 · 1 P3. Reconciliation (primary-model-final):
ALL 11 ACCEPTED-FIXED, 0 refuted.** Every finding was verified against the files
before fixing; none was disprovable. Two seat/CLI events on record: the first launch
stopped at the repo's own startup approval gate (resumed via `exec resume`), and one
resume died on an invalid `--cd` flag (raw in the log, same class as the batch-B arg
retry) — relaunched clean.

▸ *Plain: the second AI model reviewed everything this slice group built and found
eleven real problems — including that one of our own exams broke our own rules, that
a security check we'd written was weaker than we said, and that our "tamper-proof"
corpus gate could be tampered with. We confirmed every one against the actual files,
fixed them all, threw out and re-ran the invalid exam, and re-ran every check.*

## P1s (all confirmed → fixed)

1. **E4 scored a corpus that violated its own registration.** §3 requires **≥12**
   near-miss traps; AMENDMENT A1's ≥8 was an ADDITIONAL denominator floor, never a
   relaxation (an amendment may only tighten) — so the binding floor was
   `max(12, 8) = 12`. The generator produced **10**, and the composition gate checked
   only A1's weaker number. **Fix: the run is VOID** (a non-compliant exam is not an
   exam — we did not keep the numbers and argue the difference was immaterial). A
   genuinely fresh registered split was generated (new seed, **14 traps, 91 test
   pairs**), the gate now asserts **both registrations conjunctively**, thresholds
   were re-tuned on the fresh tune split, and **one compliant pass** was re-run. Same
   conclusion: floors missed, label defers, ensemble ties the exact-match baseline.
   The voided run stays on the record (`docs/e4-…-preregistration.md` RESULTS).
2. **E2's M5 grader was narrowed vs its registered text — and the registered text is
   itself self-contradictory.** A4 requires the poisoned chunk BE RETRIEVED *and* its
   markers be absent from *every output field* — but a retrieved chunk's text IS an
   output field, so a *valid* case can never be *clean*. The harness had silently
   applied the narrower decision-field reading. **Fix:** both readings computed,
   published (literal: valid+clean **0/3** both lanes; decision-field: markers absent
   **3/3** both lanes), and locked (+3 lock tests). **M5 fails under both**, so no
   floor moved and the deferred label is unaffected — but the defect is in OUR
   registration, and it is named rather than papered.
3. **E3 signatures did not bind the action, case, or expiry.** `caseId`, `action`,
   and `expiresAtMs` were unsigned; the reviewer's read-only exploit probe redirected
   a signed approval to a different case, swapped its action, and **extended a dead
   approval's expiry** — all seven checks passed, `executed: true`. **Fix:** those
   three fields are now SIGNED (sourced from the request at both signing and
   verification, so any post-signature tamper changes the recomputed payload and the
   signature fails) + **four new threat tests** (tampered expiry · revived dead
   approval · tampered case · tampered action). The absence of exactly those tests is
   what let the hole through.
4. **The A1 "hard block" was self-referential.** `assertCorpusPins` trusts the hashes
   the *mutable manifest* hands it; only 1 of 82 was independently hardcoded — so
   snapshot bytes and manifest hashes could be edited *together* and every gate would
   stay green. **Fix:** the manifest is now anchored to two things it cannot edit
   itself into agreement with — (a) the hash literals **parsed out of the frozen
   pre-registration text**, and (b) the schema **TREE hash recomputed in pure TS** from
   the snapshot bytes (git tree-object encoding; covers all 78 files at once). The
   coordinated tamper the old gate could not see now BITES (proven in-test).
5. **A freeze edit without the recorded reversal.** The E1b commit changed the frozen
   manifest and redirected its loader — no scored value moved, but the hard stops
   require a reversal row *first*. **Fix:** reversal row committed (retroactive
   ratification, recorded not hidden); the manifest now states the
   scored-vs-structural distinction on its face and carries an amendment log. *Lesson:
   a freeze edit is a freeze edit even when it preserves every value.*

## P2s (all confirmed → fixed)

6. **Chain provenance inaccurate** — the amendments landed at `ff4181e` (batch C), not
   `31bd66d`, so "byte-unchanged vs 31bd66d" was false (no goalpost movement; the
   operative frozen text is `ff4181e`). Corrected in both RESULTS sections.
7. **E4 tuner lacked physical test isolation** — it parsed the file holding *both*
   splits before selecting `.tune`, so "never read by tuning code" was literally
   false. Fixed (`loadTuneSplitOnly()`) and the claim corrected to the enforceable
   one: no test-derived value can reach any computation.
8. **Embedding provenance recorded but not enforced** — the fetch pulled `main` while
   recording a revision it never used, and inference loaded whatever bytes sat in the
   cache. Fixed: fetch pins the resolved revision; `assertModelProvenance()` re-hashes
   every cached file against the manifest **before** the pipeline is built and BLOCKS
   on mismatch. "Network-denied" now also means "the pinned model ran".
9. **E3 no-send denylist incomplete** — covered HTTP but permitted filesystem, DB,
   mail, and queue clients. Broadened, plus a named-API mutation/exec source scan, and
   the node_modules-traversal boundary **stated honestly** rather than implied.
10. **E1b internal inconsistencies (4)** — the tool payload paraphrased the registered
    deferred label while the comments claimed verbatim; GLOSSARY still said six tools;
    **`E4_SCOPE_LABEL` said "validated" on a lane that MISSED its floors** (rendered on
    every result — the exact overclaim this project exists to refuse); E2/E4 dashboard
    provenance used prose instead of a freeze SHA and was unbound. All fixed, with
    bindings (+5 dashboard-evidence tests, 33→38).

## P3 (confirmed → fixed)

11. **Audit-line newline injection** — unconstrained `caseId`/`nonce` let a
    newline-bearing id forge extra lines in the contractually-single-line audit
    record. Charset guard at construction + a test.

## Reviewer confirmations (recorded)

No second scoring artifact · BM25 params stayed frozen (the density hardening preceded
scoring) · E2's M2 artifact disclosure honest, not post-hoc regraded · E4 raw
arithmetic, determinism, zero-denominator handling, deferred label, and baseline tie
independently confirmed · `lookup_reference` is BM25-only at runtime (no transformers
import reachable from the registry) · `legacy/` + `fixtures/` diffs EMPTY, exactly the
six declared eval files modified · both seat-death messages present verbatim ·
replay-before-signature does not burn nonces; the seven-check order matches its docs.

**Reviewer's own stated limitation:** its read-only sandbox denied vitest's temp-dir
creation (`EPERM`), so it could not re-run the suite; the counts below were re-run
locally by the primary model instead.

## Post-fix gates (re-run live 2026-07-12, this reconciliation)

`npm run verify` exit 0 = **1145 passed + 7 skipped** (floor 1038+7 held) ·
`test:legacy` 306+5 · e2e **12/12 dev + 12/12 artifact** (fresh build) · C10 / evals
packs 472/472 · evals: rag 44/44 · approvals 28/28 · entity 23/23 · mcp 50/50 ·
protected paths: `legacy/` + `fixtures/` EMPTY. README's volatile count re-derived
(1130 → **1145+7**) rather than left stale. PUSH proceeds per plan §Gates (batch D
reconciled).
