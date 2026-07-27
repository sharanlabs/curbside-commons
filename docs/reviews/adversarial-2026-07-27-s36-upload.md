# Adversarial pass — session 36, the two-file audit workbench (2026-07-27)

**Subject:** the upload commission (`/playground` rebuilt as a two-file tool) and, underneath it,
the slice-1 change to the C3/C10 honesty labels in `lib/packs/listings/run.ts`.

**Why this record exists.** I wrote the change, found the original defect, and ruled my own repair
sound. That is maker-judging-maker on the one part of this codebase RULES §4 exists to protect —
exactly the condition session 35's carried-forward lesson names as needing a gate. A Codex
cross-model pass was dispatched; while it ran I attacked my own six claims with executable tests
rather than argument. **Four attacks landed. All four were mine.**

---

## The claims under attack

| | Claim | Verdict |
|---|---|---|
| A | The provenance default keeps all ~40 pre-existing call sites byte-identical | **SURVIVES** — untouched golden + drift-lock suites, plus a dedicated tooth |
| B | Deciding provenance by `catalog !== SOR_CATALOG` is sound | **FAILED — P1** |
| C | `specVersion` is not caller-overridable | **SURVIVES** — T3 tooth |
| D | The parser refuses only what the engine cannot index, and never coerces | **FAILED twice — P1, P2**; the no-coercion half survives |
| E | The upload path is zero-network by construction | **SURVIVES** — import-walk guard extended to the new closure |
| F | Rebinding the honesty guards preserved every invariant | **FAILED — P2** |

---

## F-1 · P1 · Reference identity mislabelled the committed corpus as the reader's real data

`components/playground/verify-in-browser.ts` — `verifyAcpFeed`

The provenance decision was `catalog !== SOR_CATALOG`. The "Use the sample catalog" button fills
the slot with `catalogSampleText()` — the committed corpus, verbatim — which returns from
`parseCatalogText` as a **new object**. Under reference identity that run was labelled
`matchingMode: "real-world"`, `simulated: false`: **our own synthetic corpus reported as the
reader's real records, matched by entity resolution that never ran.**

This is the same defect class the slice was written to fix, re-introduced by the fix. It is also
the seventh instance of *a claim broader than the thing backing it* in three sessions.

**Reproduced** in `evals/packs/provenance-attack.test.ts` (red: `expected 'real-world' to be
'synthetic-controlled'`). **Fixed** by comparing what the engine actually reads —
`isCommittedCorpus()` compares `items` content, with reference identity kept as a fast path.
Erring toward "the reader's own" on any mismatch is the safe direction: it declines to claim a run
as our simulation rather than claiming someone's real data is. A one-cent difference from the
corpus is still the reader's catalog — pinned as its own tooth, because whose data it is, is not a
similarity judgement.

## F-2 · P1 · Duplicate variation ids were accepted, and silently shadow

`components/playground/verify-in-browser.ts` — `parseCatalogText`

`indexCatalog` keys a `Map` by variation id (`reference.ts:38-44`), so a repeated id **silently
overwrites** the earlier record. A feed row would then be checked against whichever copy happened
to be last, and no report could say which. Two prices, one verdict, no way to tell them apart —
a wrong verdict wearing a clean face.

**Reproduced** in `evals/packs/catalog-parse-attack.test.ts`, both across items and within one
item. **Fixed:** refused, naming the offending id and its position.

## F-3 · P2 · An empty catalog produced an all-ghost verdict instead of a refusal

`items: []` parsed clean. Every feed row then reported as an item that does not exist — a
confident wall of errors whose real cause is that no records were supplied. **Fixed:** refused,
with the reason stated in those terms.

## F-4 · P2 · The rebound lab-word guard was narrower than the one it replaced

`evals/packs/playground-golden.test.ts`

The predecessor banned the whole word `simulated` from the shipping client surface. My rebound
version banned only `simulated: true` — which would have let the bare word back onto a public
surface unnoticed. Found by diffing old assertions against new, which is the only way this class
of weakening is visible: the suite is green either way. **Fixed:** original breadth restored, with
a comment so the next narrowing has to be deliberate.

---

## What survived, and on what evidence

- **A** — every caller passes two arguments; the golden byte-equality and drift-lock suites were
  not touched and stayed green, and T1 pins the two-argument default explicitly.
- **C** — T3 runs a labelled and an unlabelled verification and asserts identical `specVersion`.
  A caller may describe whose data ran; it may never restate which rules ran.
- **D (no-coercion half)** — ids differing only by trailing whitespace are **not** silently
  trimmed. The engine does better than refuse: it resolves by exact name and reports
  `LST-IDENT-ID-MISMATCH` quoting both ids. *My first tooth here expected `GHOST` and was wrong —
  the engine was right and my test was lying. Recorded rather than quietly corrected.*
- **E** — `FileReader` is local by construction, and the existing import-walk guard was extended
  to `AuditWorkbench.tsx` and `FileDrop.tsx` so the new closure is proven unable to reach a
  network at all.
- **Stale verdicts** — every input path (`feedText`, `recordText`, both `onReadError` handlers,
  both sample loaders) calls `invalidate()`. Now pinned by an e2e tooth rather than left as an
  inspection: a verdict left standing beside changed inputs is a lie the reader cannot detect.

## The pattern under all four

Every landed finding is the same shape: **something true of every case that existed when it was
written.** Hardcoded labels were true of every caller. Reference identity was true while the only
catalog came from a compiled-in import. The narrowed guard was true of a source file that happened
to be clean. None were mistakes at the time; all became defects when a new case arrived.

The tell is consistent and worth keeping: **a constant is not a fact — it is an unexamined
assumption with good luck, and the giveaway is a type that permits variation where the code
permits none.**

## Status of the cross-model gate

Dispatched (`gpt-5.6-sol` @ high, read-only). The first run spent its budget on the repo's
mandatory startup contract and paused for authorization; a resume was mis-invoked (`--cd` is not
valid on `exec resume`) — both recorded raw rather than retried silently. A third dispatch was
running at the time of writing. **Until it returns, the honest statement is: every check I know how
to write passes, and four defects that no check I had written would have caught were found by
attacking my own claims.**
