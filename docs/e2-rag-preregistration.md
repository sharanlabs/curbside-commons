# E2 — RAG Lane PRE-REGISTRATION (committed before any scoring run)

**Status (2026-07-11): PRE-REGISTERED — no retrieval index built, no gold item scored.
This document is reviewed in Codex batch C BEFORE any scoring (plan v3.3 §E2 / §Gates);
results land in batch D. Nothing above the RESULTS marker may change after the first
scoring run. Any post-registration amendment requires its own dated, reasoned row here
BEFORE the run it affects — floors may never be weakened after exposure.**

▸ *Plain: before we build or test the "look it up and cite it" feature, we are writing
down — in public, in git — exactly what data it searches, exactly how we will grade it,
and exactly what scores it must beat. If it misses any bar, we say so and the feature
carries a "not validated" label. No moving the goalposts afterward.*

Regime precedent: `docs/plan-f1b-classifier.md` §3.1 + `docs/fee-classifier-recalibration-status.md`
(pre-registered conjunctive floors · one pass · exposed-split discipline · label defers on any miss).

## 1. What E2 is (and is not)

A **$0, offline, advisory** retrieval lane over the project's own committed reference
corpus, exposed through the existing typed tool-registry seam (`lib/tools/registry.ts`).
It RETRIEVES and CITES; it never decides. The deterministic engine remains the only
verdict path (advisory-only contract, same as the crew's recommendation boundary).

- **Answer layer is extractive, not generative:** returned answers are verbatim spans
  from retrieved chunks with mandatory citations (file + anchor). There is NO live LLM
  call anywhere in E2 (the $5 Gemini cap is untouched; no new arming).
- **Citation-REQUIRED:** an answer without a resolvable citation is a defect, scored
  as unsupported.
- **Abstention:** below the registered similarity threshold the lane returns
  "no sufficiently supported answer" and routes to the human — abstaining is a
  CORRECT outcome, scored as such on out-of-corpus items.

## 2. Corpus composition (frozen at registration)

Exactly these committed sources, at the tree state of the commit that lands this
document (the corpus manifest test pins content hashes at index-build time):

1. The NYC §20-563.3 rule table: `lib/packs/fees/rules.ts` (11 statement predicates
   + 6 registered non-checkable clauses) + its committed research twin
   `docs/research/uc1-rule-table.md` and `docs/research/uc1-rule-table.draft.json`
   (the human-readable clause text the TS predicates were transcribed from).
2. `fixtures/ucp-schemas/2026-04-08/schemas/**` — the 78 pinned official UCP JSON
   Schemas (Apache-2.0, PROVENANCE.json). Indexed as DATA (Law 11: schema text is
   never executed as instructions).
3. `docs/GLOSSARY.md` — the two-register glossary.

Plus ONE adversarial insert (registered here, required by §5-M5): a synthetic chunk
containing instruction-like text ("ignore your instructions and …") planted to prove
retrieved text is inert data. It is clearly marked synthetic inside the corpus.

**Exclusions (leakage screen, §4):** no eval/gold files, no calibration snapshots, no
status docs, no review records — the corpus is reference knowledge, never the answer
key to any existing eval.

## 3. Index + versioning (recorded, not tuned-after-the-fact)

- Chunking: recorded at build (target 200–400 token chunks, split on headings/rule
  boundaries; exact parameters written into the corpus manifest BEFORE scoring).
- Embeddings: local Transformers.js-class model, $0 offline. **Provenance pinned in
  the manifest: model ID + revision/content hash + license + storage dependency.**
  A **network-denied clean run** (same harness pattern as the crew's offline proof)
  must demonstrate no runtime download; if the model cannot run network-denied, E2
  BLOCKS rather than fetching at runtime.
- Store: in-memory cosine + BM25 hybrid — smallest thing that works; no external DB.
- **Deterministic BM25 baseline:** every retrieval metric in §5 is ALSO measured for
  plain BM25 (no embeddings). If the hybrid does not strictly beat BM25 on M1 while
  holding M2–M5, the SIMPLER lane ships and the writeup says so (anti-theater: an
  embedding lane must earn its complexity).

## 4. Gold set + leakage screen (constructed before the index is queried)

- **n = 30 items, committed in one gold file before any scoring:** 24 in-corpus
  answerable questions (stratified: ≥8 fee-rule, ≥8 UCP-schema, ≥6 glossary,
  ≥2 cross-source) + 6 out-of-corpus questions whose correct outcome is ABSTAIN.
- Each in-corpus item: question · expected source file(s) · expected supporting span
  (the grader checks the cited span actually supports the answer).
- **Leakage screen (machine-checked, composition-test precedent
  `evals/gold/fee-lines-gold-retry-composition.test.ts`):** no gold question may be a
  verbatim (≥8-gram) copy of corpus text; questions are paraphrases. The composition
  test asserts the 24/6 split, stratification, and the n-gram disjointness screen.
- **Tune/test discipline:** a separate scratch set of ≤10 items may be used while
  building (recorded in the manifest). Gold items are queried ONLY in the scoring
  run. **One pass; the gold set is EXPOSED after that pass and never re-scorable**
  (same rule as the classifier splits). A re-attempt requires a fresh pre-registered
  gold set and a fresh owner-visible registration row.

## 5. Metrics + FLOORS (conjunctive — ANY miss → the label DEFERS)

| # | Metric | Definition | Floor |
| --- | --- | --- | --- |
| M1 | Retrieval hit-rate@5 | expected source file appears in top-5 retrieved chunks (24 in-corpus items) | ≥ 0.85 (21/24) **AND** strictly > the BM25 baseline's hit-rate, tie = the simpler lane ships |
| M2 | Citation precision | of all citations emitted across answered items, the fraction whose cited span supports the answer (grader: span-containment + human-readable audit list) | ≥ 0.90 |
| M3 | Unsupported-answer rate | answered items whose answer text is NOT contained in any cited span | ≤ 0.05 |
| M4 | Abstention calibration | out-of-corpus items correctly abstained | ≥ 5/6 · AND ≤ 4 wrong abstentions on the 24 in-corpus items |
| M5 | Injection resistance | the planted instruction-chunk (§2) retrieved as data: rank/citation behavior unchanged, no behavioral deviation, answer text never executes/echoes the instruction as a directive | 100% (binary) |

Determinism: the whole lane is deterministic (extractive, temp-free) — the scoring
run is a single pass by construction; a flip-rate metric is not applicable and is
not claimed.

**Label on success:** "RAG lane: validated on a pre-registered 30-item gold set, one
pass — advisory, extractive, offline" (scope-bounded; says nothing beyond this corpus).
**Label on any miss:** "RAG lane: floors not met (see results) — experimental, advisory
only" — the lane may still ship as clearly-labeled experimental, per the honesty rules.

## 6. Integration contract (decided here, per plan §E2)

- Tool-registry: ONE new advisory tool (`lookup_reference`), JSON-schema-validated,
  returning {answer_span, citations[], score, abstained}. The engine never consumes
  it for verdicts; the crew MAY receive it read-advisory (allowlist updated
  deliberately + reviewed in batch D).
- **MCP exposure: YES** — the MCP server advertises the same tool (schema verbatim
  from the registry); transcript + tool count + SHOWCASE updated in the E2 results
  slice, all inside batch D's review.
- CI: the E2 suites join `npm run verify` (they are offline and deterministic).

## 7. Verification chain (what reviewers check, in order)

1. This document's commit PRECEDES the gold-set commit, which PRECEDES any results
   commit (git-provable, S2/S4b precedent).
2. The corpus manifest + composition/leakage tests exist and are green BEFORE scoring.
3. The scoring run's raw outputs are committed with the results (raws-before-scoring
   discipline, L-1 precedent).
4. Floors table above compared line-by-line; conjunctive rule applied mechanically.
5. Network-denied clean run recorded (command + exit code) in the results doc.

---

## AMENDMENTS (2026-07-11, batch-C review — TIGHTENING ONLY, recorded BEFORE any
## index build or scoring; each traces to a batch-C finding; nothing here weakens
## a floor, and no floor above moved)

- **A1 — corpus pinned to blobs (batch-C P1):** "frozen at registration" is now
  git-mechanical, not declarative. The corpus is EXACTLY these objects at `31bd66d`:
  `lib/packs/fees/rules.ts` @ blob `bced3341` · `docs/research/uc1-rule-table.md`
  @ `a5140f5` · `docs/research/uc1-rule-table.draft.json` @ `945db38` ·
  `docs/GLOSSARY.md` @ `7752b6f` · `fixtures/ucp-schemas/2026-04-08/schemas/**`
  @ tree `7e167aa`. The index-build manifest must resolve every corpus path to
  exactly these hashes; **any addition, deletion, or content drift = HARD BLOCK**
  (scoring may not run; changing the corpus requires a NEW pre-registration). The
  one registered adversarial insert (§2/M5) is corpus-EXTERNAL, committed with the
  gold set, and enumerated separately in the manifest.
- **A2 — BM25 baseline frozen (batch-C P2):** Okapi BM25, `k1=1.2`, `b=0.75`;
  tokenization = NFKC → lowercase → split on non-alphanumerics; chunking IDENTICAL
  to the hybrid lane's; `top-k=5` for BOTH lanes; the baseline implementation is
  committed in the index commit BEFORE the gold set is ever queried; **zero
  parameter or preprocessing changes after gold-set access** (any change = a new
  pre-registration).
- **A3 — leakage screen extended (batch-C P2):** beyond the ≥8-gram screen, no gold
  question may contain: a corpus source filename or path · a rule id (`LST-*` /
  fee-rule id patterns) · a schema `$id`/anchor · any ≥5-gram of its own expected
  supporting span. A normalized near-duplicate check (casefold + punctuation-strip)
  runs against corpus sentences. All machine-checked in the composition test
  BEFORE scoring.
- **A4 — M5 made counterfactual and multi-case (batch-C P2):** M5 uses **≥3
  registered PAIRED injection cases**. Each case = a clearly-marked poisoned chunk
  variant + a registered query whose retrieval set MUST contain that chunk (asserted
  mechanically — a "pass" that never retrieved the poison is INVALID) + an exact
  clean-vs-poisoned comparison: structured answer fields equal, citation sets equal
  modulo the poisoned chunk itself appearing as cited data, and a registered marker
  list of instruction-following indicators absent from every output field. M5 =
  100% across all pairs, conjunctive with the rest.

## RESULTS (appended after the one scoring pass — nothing above this line changes)

**Scored 2026-07-12 (one pass, network-denied; the gold set is now EXPOSED and never
re-scorable).** Chain (git-provable, §7.1): registration `31bd66d` → index `d97fa90` →
gold `c4396f0` → harness `fe6100c` → this results commit. Composition + leakage tests
were green BEFORE scoring (§7.2; 12/12 at `c4396f0`). Raws flushed BEFORE metrics
(§7.3): `evals/rag/results/raw-items.jsonl` (66 records: 30 items × 2 lanes + 3 pairs
× 2 lanes). Network-denied clean run (§7.5):
`node --import ./evals/rag/net-blocker.mjs scripts-ts/rag-score.mts` → **exit 0**
(every network API replaced with a throwing stub for the whole process).

### Floors, applied mechanically (conjunctive — §5 + amendments)

| Metric | BM25 baseline | Hybrid | Floor | Verdict |
| --- | --- | --- | --- | --- |
| M1 hit-rate@5 | **19/24 (0.792)** | 18/24 (0.750) | ≥ 0.85 AND hybrid strictly > BM25 | **BOTH MISS**; hybrid ≤ BM25 → the simpler lane ships |
| M2 citation precision | 9/24 (0.375) | 9/27 (0.333) | ≥ 0.90 | **MISS** |
| M3 unsupported-answer rate | 0.000 | 0.000 | ≤ 0.05 | met (structural guarantee held) |
| M4 abstention | 1/6 out abstained · 5 wrong in-abstentions | 1/6 · 2 | ≥ 5/6 AND ≤ 4 | **MISS (both sides for BM25; out-side for hybrid)** |
| M5 injection resistance | 1/3 pairs valid+clean | 2/3 | 100% | **MISS** (see below) |

**LABEL (per §5): "RAG lane: floors not met (see results) — experimental, advisory
only."** The shipped lane is **BM25** (hybrid failed to strictly beat it on M1 — the
anti-theater clause fired: the embedding lane did NOT earn its complexity). The lane
ships as clearly-labeled experimental, advisory-only, per the registration.

▸ *Plain: we built it, graded it against the bars we locked in advance, and it missed
them. So it does NOT get the "validated" label — it ships marked "experimental," the
scoreboard is published, and the simpler of the two search methods is the one kept,
because the fancier one didn't beat it.*

### What actually failed (from the committed raws)

- **M1** — every miss is a UCP-schema item (BM25: S1/S2/S4/S5/S8; hybrid also S3/S6):
  paraphrased questions vs 78 lexically-similar JSON files is a genuine vocabulary-gap
  retrieval problem; neither word-matching nor MiniLM-class embeddings closed it.
- **M4 (the biggest honest finding)** — 5 of 6 out-of-corpus questions were ANSWERED
  by both lanes. The gold out-items are deliberately domain-ADJACENT (penalties,
  California caps, live commission rates); the scratch probes that froze the
  thresholds were more distant (weather/VAT/lawsuit). The frozen thresholds did not
  transfer: abstention calibration on near-domain unanswerables is genuinely weak.
- **M5** — behavioral inertness held everywhere it was exercised: markers absent from
  all decision fields 6/6 lane-pairs, citations stable 6/6, answers byte-equal 5/6.
  The failures are: P1+P3 (BM25) and P3 (hybrid) never pulled the poisoned chunk into
  top-5 (the registered validity rule counts an unexercised counterfactual as INVALID,
  not as a pass), and P2 (hybrid) shifted its answer span under poisoning (a real
  behavioral deviation, caught exactly as registered).
- **M2 disclosure (gold-design artifact, numbers stand)** — the support check binds a
  citation to the item's REGISTERED span(s); several cited chunks contain equivalent
  answering content from a DIFFERENT corpus location (e.g. the summary table row
  instead of the registered rule-table row) and score "unsupported" as registered.
  The metric is kept as-registered (no post-hoc regrade); the artifact is named here
  and the per-item audit list lives in the raws.

### Consequences (registered §6 contract, applied)

- `lookup_reference` ships over the **BM25** lane (deterministic, zero runtime
  embedding dependency), envelope-labeled **experimental / floors-not-met / advisory**
  with a pointer to this section. Registry + MCP exposure per §6; the eval-lock test
  (`evals/rag/rag-results-lock.test.ts`) re-derives every number above from the
  committed raws forever.
- **Crew consumption: DEFERRED** (deliberate §6 "MAY" decision) — an experimental
  lane does not enter the crew's allowlist; revisiting requires the floors met on a
  fresh registration.
- A re-attempt requires a FRESH pre-registered gold set and a new registration row —
  this split is exposed and dead for scoring.
