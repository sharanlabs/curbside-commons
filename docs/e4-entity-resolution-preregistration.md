# E4 — Entity-Resolution Lane PRE-REGISTRATION (committed before any scoring run)

**Status (2026-07-11): PRE-REGISTERED — no matcher built beyond the protected exact
default, no gold item scored. Reviewed in Codex batch C BEFORE any scoring (plan v3.3
§E4 / §Gates); results land in batch D. Nothing above the RESULTS marker changes after
the scoring run; floors may never be weakened after exposure.**

▸ *Plain: merchants show up in data under messy names — "Fog City Tacos", "FOG CITY
TACOS LLC", "Fog City Tacos". Before building the feature that says "these are probably
the same business," we lock in — in git, in advance — how we'll grade it and what it
must score. Its worst failure is confidently merging two DIFFERENT businesses, so the
bars are precision-heavy, and anything uncertain goes to a human instead of being
guessed.*

Regime precedent: `docs/plan-f1b-classifier.md` §3.1 (pre-registered conjunctive
floors · one pass · exposed-split discipline) + `docs/e2-rag-preregistration.md` (this
batch's sibling registration).

## 1. Architecture (stated up front, per plan §E4)

- **ADVISORY, never gating:** the resolver proposes candidate matches with scores; it
  cannot merge records, alter verdicts, or feed the engine's decision path. EXACT
  matching remains the protected default everywhere the engine consumes identity.
- **Abstain-to-human:** any score inside the registered ambiguity band routes to the
  human gate (crew human-gate contract). Abstaining on a genuine match is a cheap
  error; a FALSE MERGE is the expensive one.
- **False-merge cost, named:** a false merge attaches one business's records,
  findings, or fee verdicts to a different business — in a real deployment that is a
  reputational/legal-grade defect (misattributed noncompliance). This is why §5's
  floors are precision-weighted and why below-threshold NEVER auto-merges.
- **Scope label (renders wherever E4 surfaces):** "entity resolution validated on a
  SYNTHETIC adversarial name corpus — advisory only; exact matching remains the
  system default." It claims nothing about real-world business registries.
- Deterministic + $0: normalization pipeline + string-similarity ensemble
  (e.g. token-set / Jaro-Winkler / phonetic), thresholds registered before scoring.
  No LLM anywhere in E4. Offline; joins `npm run verify`.

## 2. Data: synthetic adversarial corpus (generated, then FROZEN before scoring)

Generated from the project's existing fictional merchant names (never real
businesses; the HONEST_DATA_LABEL discipline carries over):

- **Variant classes (≥6 each in the test split):** case/punctuation/whitespace ·
  legal-suffix noise (LLC/Inc/Corp/d.b.a.) · typo/transposition (edit distance 1–2) ·
  unicode confusables + NBSP/width variants · word-order + abbreviation
  ("Fog City Tacos" / "Tacos, Fog City" / "FC Tacos") · near-miss DIFFERENT
  businesses (the trap class: high lexical overlap, distinct entities —
  "Fog City Tacos" vs "Fog City Taqueria" as separate registered entities).
- Every pair carries a generated ground-truth label: SAME / DIFFERENT / AMBIGUOUS
  (ambiguous = even a careful human would need more evidence; correct output for
  those = abstain).

## 3. Tune/test split (disjoint by construction, machine-checked)

- **Tune split:** ~40 pairs, used freely while building (thresholds, weights).
- **Test split:** ≥60 pairs (≥6 per variant class per §2, ≥12 near-miss traps,
  ≥8 ambiguous), generated from DISJOINT base merchants — no base merchant name
  appears in both splits (a composition test asserts the disjointness and the class
  quotas, `evals/gold/*composition*` precedent).
- The test split is queried ONCE, in the scoring run. It is EXPOSED afterward and
  never re-scorable; a re-attempt requires a fresh registered split.

## 4. Thresholds (the shape is registered; exact values are frozen pre-run)

Two thresholds, T_match > T_abstain, tuned ONLY on the tune split and committed in
the gold-set commit BEFORE the scoring run: score ≥ T_match → propose SAME;
score ≤ T_abstain → propose DIFFERENT; between → ABSTAIN to human.

## 5. Metrics + FLOORS (conjunctive over the test split — ANY miss → the label DEFERS)

| # | Metric | Definition | Floor |
| --- | --- | --- | --- |
| M1 | Merge precision | of pairs proposed SAME, fraction truly SAME | ≥ 0.98 |
| M2 | Merge recall | of truly-SAME pairs, fraction proposed SAME (abstain ≠ miss for M1 but counts against M2) | ≥ 0.80 |
| M3 | Trap resistance | near-miss DIFFERENT pairs NOT proposed SAME (abstain acceptable) | 100% (0 false merges on the trap class) |
| M4 | Fail-to-human | AMBIGUOUS-labeled pairs routed to abstain | ≥ 0.75 · AND abstain volume overall ≤ 0.30 (an always-abstain matcher is theater) |
| M5 | Determinism | two consecutive runs byte-identical outputs | 100% (binary) |

Baseline comparison (anti-theater): normalized EXACT matching is scored on the same
split; the ensemble must strictly beat it on M2 while holding M1/M3 — otherwise the
protected default is also the shipped default and the writeup says so.

**Label on success:** "entity resolution: validated on a pre-registered synthetic
adversarial split, one pass — advisory only." **On any miss:** "entity resolution:
floors not met (see results) — experimental, advisory only."

## 6. Verification chain

1. This registration's commit PRECEDES the frozen corpus/threshold commit, which
   PRECEDES the results commit (git-provable).
2. Composition + disjointness tests green BEFORE scoring; raws committed with results.
3. Floors applied mechanically, conjunctively; the E1b dashboard row cites this doc
   and the results with per-figure provenance.

---

## AMENDMENTS (2026-07-11, batch-C review — TIGHTENING ONLY, recorded BEFORE corpus
## generation or scoring; each traces to a batch-C finding; no floor above moved)

- **A1 — denominator minimums + label exclusivity (batch-C P1):** the TEST split
  must contain, machine-checked by the composition test BEFORE scoring: **≥30
  truly-SAME pairs · ≥30 general DIFFERENT pairs · ≥8 trap near-miss DIFFERENT
  pairs · ≥8 AMBIGUOUS pairs**, on top of the ≥6-per-variant-class rule already
  registered. Every pair carries EXACTLY ONE ground-truth label (mutual exclusivity
  machine-checked; label × variant-class counts reported in the composition test's
  output). **Any floor metric whose denominator is zero = the floors are UNMET**
  (hard fail — never skipped, never N/A'd, never "vacuously passed").
- **A2 — normalized-exact baseline frozen (batch-C P2):** the baseline's
  normalization chain is EXACTLY: NFKC → casefold → collapse whitespace → strip
  punctuation → strip the enumerated legal-suffix list `{llc, inc, corp, co, ltd,
  dba, d.b.a.}` — frozen here, committed with the matcher BEFORE scoring; **no
  post-hoc changes** (any change = a new pre-registration).

## RESULTS (appended after the one scoring pass — nothing above this line changes)

**Scored 2026-07-12 (one pass; the test split is now EXPOSED and never re-scorable).**
Chain (git-provable, §6.1): registration `31bd66d` → corpus freeze + composition tests
green (`e5f42c1`, 8/8 incl. the A1 minimums: 35 SAME · 32 general DIFFERENT · 10 trap ·
10 AMBIGUOUS, disjoint bases, generator freeze-integrity) → threshold freeze
(`705e54a`, tune-split-only: T_match 0.999 · T_abstain 0.849, with the honest
pre-scoring read RECORDED BEFORE the pass: best feasible tune recall was 0.60, so an
M2 miss was expected) → harness commit → this results commit. Raws:
`evals/entity/results/raw-pairs.json` (both determinism runs, 87 pairs each).

### Floors, applied mechanically (conjunctive)

| Metric | Ensemble | Baseline (A2 normalized-exact) | Floor | Verdict |
| --- | --- | --- | --- | --- |
| M1 merge precision | **18/18 = 1.000** | 18/18 = 1.000 | ≥ 0.98 | met |
| M2 merge recall | **18/35 = 0.514** | 18/35 = 0.514 | ≥ 0.80 | **MISS** |
| M3 trap resistance | **0/10 false merges** | 0/10 | 100% | met |
| M4 fail-to-human | **9/10 ambiguous abstained (0.90) · abstain volume 0.126** | (never abstains) | ≥ 0.75 AND ≤ 0.30 | met |
| M5 determinism | **two runs byte-identical** | — | 100% | met |
| A1 denominators | all four non-zero (18 / 35 / 10 / 10) | — | non-zero | met |

**Baseline comparison (anti-theater):** the ensemble TIES the protected
normalized-exact default on M1, M2, and M3 — it does not strictly beat it on M2, so
**the protected default is also the shipped default, and this writeup says so.**
Under the hard 100% trap floor, the ensemble's usable match region collapses to
scores ≈ 1.0 (i.e. exactly the normalized-equal pairs the baseline already catches);
its one genuinely added behavior is SAFE ROUTING — 11 of 87 pairs abstained to the
human, including 9 of the 10 deliberately-ambiguous branch/expansion pairs, which the
baseline (which never abstains) force-labels.

**LABEL (per §5): "entity resolution: floors not met (see results) — experimental,
advisory only."** Exact matching remains the system default everywhere (it always
was — §1); no advisory surface consumes this lane pending floors met on a fresh
registration. Lock: `evals/entity/entity-results-lock.test.ts` re-derives every
number above from the committed raws forever.

▸ *Plain: the fuzzy name-matcher turned out to be no better than careful exact
matching once we required it to NEVER confuse two similar-but-different businesses —
so the careful exact matching stays, the fuzzy layer is labeled "experimental, not
validated," and the one thing it demonstrably does well (sending genuinely uncertain
cases to a human instead of guessing) is documented with the scoreboard. The bars
didn't move after the fact; the miss is published.*

### What the misses teach (named, not spun)

- The trap class works as designed: "Fog City Tacos" vs "Fog City Taqueria"-shaped
  pairs score as high as genuine typo variants, so ANY threshold that guarantees
  zero false merges also rejects most typo/word-order true matches. Closing that gap
  needs evidence beyond the name string (address, registry id) — out of scope for
  this synthetic-corpus lane and named here rather than simulated away.
- A re-attempt requires a fresh registered split and a new registration row; this
  split is exposed and dead for scoring.
