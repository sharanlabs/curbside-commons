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

## RESULTS (appended after the one scoring pass — nothing above this line changes)

*(empty at registration — batch C reviews this document with this section empty)*
