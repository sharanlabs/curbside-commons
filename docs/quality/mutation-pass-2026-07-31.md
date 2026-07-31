# Mutation pass — do the guards actually bite? (2026-07-31)

**Trigger:** `docs/assessment-2026-07-30-estate-revaluation.md` finding 4 — *"Green is a
measurement of the code. It is not a measurement of the tests."*
**Question:** of the guards that are green today, how many would still be green with the
behaviour they protect deliberately broken?
**Seat:** Opus 5, high effort. **Scope:** the shipping audit engine + the browser seam.

---

## Result

| | before | after |
|---|---:|---:|
| mutants declared | 10 | 10 |
| killed | **8** | **10** |
| survived | **2** | **0** |
| mutation score | 80% | **100%** |

**Two guards were protected by nothing.** Both were added by session 38's cross-model gate
(findings 5 and 6), both were correct, and deleting either left all 1,578 tests green.

---

## Method, and why it is shaped this way

**The mutant set is declared up front, before any run.** The denominator comes from the
specification and never from the observations. That rule was learned in session 35, when a
scorer certified a 19-case run as COMPLETE because it counted only the ids it happened to
see. A completeness check that counts what it observed cannot notice what is missing.

**Each mutant is one semantically meaningful edit to shipping code** — an inverted
comparison, a dropped guard, a relaxed threshold. Not syntax noise. A mutant that only
breaks a type or crashes on import proves the compiler works, not that the tests do.

**Each pattern is asserted to match exactly once before it is applied**, so a mutant can
never silently edit the wrong site. My first draft of this set failed that check on 5 of 10
patterns — I had guessed at the engine's internals instead of reading them. The check caught
it; the run never happened on a bad set.

**Every file is restored from a byte-exact backup and verified by sha256.** A harness that
corrupts the thing it measures is worse than no harness. All five mutated files verified
identical after the final run.

**One disclosed exclusion:** `honesty-c10.test.ts` is excluded from the harness's suite run.
It shells out to `npm run build`, which fetches `fonts.googleapis.com` — outside the sandbox
allowlist — so it fails for an environmental reason unrelated to any mutant. Excluding it is
recorded rather than quietly folded in.

---

## The ten mutants

| id | file | broken behaviour | verdict |
|---|---|---|---|
| M01 | `acp-feed.ts` | drop the `/100` in cents→decimal — every price off by 100× | killed (33) |
| M02 | `detectors.ts` | stop reporting an item sold while hidden in the record | killed (27) |
| M03 | `detectors.ts` | map sold-out to `in_stock` | killed (61) |
| M04 | `fees/rules.ts` | flip `>` to `>=` — a fee exactly AT the cap reads as a violation | killed (29) |
| M05 | `fees/rules.ts` | monthly-average cap never exceeded | killed (33) |
| M06 | `verify-in-browser.ts` | accept a non-UTC `asOf` | **SURVIVED** → killed (4) |
| M07 | `verify-in-browser.ts` | accept a non-USD catalog | **SURVIVED** → killed (5) |
| M08 | `verify-in-browser.ts` | accept an empty `items` array | killed (1) |
| M09 | `verify-in-browser.ts` | drop the feed-side size bound (re-open F-1) | killed (2) |
| M10 | `verify-in-browser.ts` | drop the catalog-side size bound (re-open F-1) | killed (2) |

M01 deserves a note: it is the product's founding defect — a feed claiming $2,150 for a
$21.50 pizza. 33 tests caught it. The engine's core is genuinely well guarded, and that is
the honest headline alongside the two misses.

---

## The two survivors

### M06 — `asOf` accepted in any format

`asOf` is compared **lexically** downstream, which is only correct for a canonical UTC
instant. A local-offset stamp (`+05:30`) sorts by its literal digits, so a catalog can be
judged fresh when it is stale, or stale when it is fresh. **The verdict flips silently** —
there is no error for a reader to notice, which is the property that makes it serious.

### M07 — non-USD catalog accepted

The engine compares a feed's currency against the catalog's own, and every price is integer
cents. A EUR catalog compared against USD feed prices reports a mismatch on **every row** —
findings that read as the merchant's fault and are entirely the tool's.

### Why the suite missed them — and it is not carelessness

Several tests *do* pass `currency: "USD"` and a valid `asOf`. They set the fields correctly
and move on to what they were written to check. **No test ever hands the parser a bad one.**

> A field that every fixture supplies correctly is a field whose validator is never exercised.

That is the same shape as session 38's tautological reset assertion, where deleting the line
under test left it green. Both are cases where the *inputs* were too well-behaved to reach
the code that handles bad inputs.

---

## What was added

`evals/packs/catalog-guard-survivors.test.ts` — 14 tests. Each asserts the refusal **and the
reason for it**: a guard that refuses for the wrong reason is one the next reader will "fix"
after misreading the error message. The accept-side cases are deliberate too — a false
refusal is as dishonest as a false verdict, and the canonical `…Z` and `….000Z` forms both
have to keep parsing.

Re-running M06 and M07 against the new tests: **both killed**, 4 and 5 tests respectively.
Full re-run: **10/10**.

---

## Honest limits

- **Ten mutants is a survey, not a census.** The suite has 1,578 tests across 117 files; this
  samples the code whose wrongness produces a *false verdict*. A 100% score on ten declared
  mutants is not a claim about the other guards — it is a claim about these ten.
- **Same lineage as the code's authors.** Second look, not independent review.
- **The harness is committed (`docs/quality/mutate.py`) but is NOT wired into CI.** It is
  preserved so this record is reproducible rather than merely reported — `python3
  docs/quality/mutate.py` re-runs the set, and it takes ~10 full suite runs (several minutes).
  Making it a standing gate is a separate decision with its own maintenance cost, and it was
  not taken here. Nothing runs it automatically; if the engine changes, the mutant patterns
  may stop matching and will report `UNAPPLIED` rather than silently passing.
- **`honesty-c10` was excluded** for the environmental reason above, so its guards were not
  measured by this pass.
