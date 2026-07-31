# Source-level security scan — the upload surface (2026-07-31)

**Trigger:** `docs/assessment-2026-07-30-estate-revaluation.md` finding 3 — the reader-facing
upload path had never had a source-level security review by anyone but its own authors.
**Scope:** `components/playground/FileDrop.tsx` · `components/playground/verify-in-browser.ts`
(`parseCatalogText`) · `components/playground/AuditWorkbench.tsx`, plus the egress claim they carry.
**Method:** read-only. No building, no running against production, no network. Every claim below
was **executed** — the probes are recorded so a reader can re-run them rather than trust this file.
**Seat:** Opus 5, high effort.

---

## Verdict

**One finding, LOW.** No high or medium severity issue found. The surface is materially better
hardened than the assessment anticipated, and the reason is on record: it has already survived an
adversarial self-pass (session 36, `docs/reviews/adversarial-2026-07-27-s36-upload.md`) and a
cross-model gate (session 38). What follows is what a *fresh* adversarial read adds to that.

**The honest framing:** this scan was performed by the same lineage that wrote the code. It is a
second look, not an independent one. A genuinely independent pass remains worth running.

---

## F-1 (LOW) — the 5 MB input cap covers the file path but not the paste path

`FileDrop.tsx:79,111` refuses a file over `MAX_BYTES` (5 MB) **before** reading it. The paste
route has no equivalent bound: `FileDrop.tsx:216` wires the textarea's `onChange` straight to
`onText`, and `parseCatalogText` imposes no length, item-count, or nesting limit — verified by
grep, there is no `MAX_*` or `.length >` bound anywhere in the parser.

So the same 22 MB document is **refused as a file and accepted as a paste**. A guard that a
reader can step around by choosing the other door is a guard on one door.

**Why this is LOW and not higher, measured rather than assumed:**

| probe | result |
|---|---|
| `JSON.parse` of a 5.4 MB catalog (50k items) | 50 ms |
| `JSON.parse` of a 22 MB catalog (200k items) | 203 ms |
| parser loop shape, 25k → 200k items | **linear** (0.10–0.40 µs/item; no quadratic) |
| deep nesting, 1k / 10k / 100k levels | parses fine — **no stack overflow** |

There is no algorithmic amplification behind the missing bound, and the only resource at risk is
the reader's own tab — nothing runs on a server. The realistic worst case is a reader pasting
something enormous and their own tab going unresponsive. That is a **robustness gap, not a
vulnerability**, and it is recorded as one.

**Recommended fix (not applied — this is a read-only scan):** apply the same `MAX_BYTES` ceiling
in `onText`, so both doors share one limit, and refuse with the existing error channel rather than
silently truncating. Truncation would be the worse bug: it would produce a *verdict* on a document
the reader never supplied, which is the precise class this product exists to catch.

### F-1 FIXED, same day (2026-07-31, owner: "go ahead finish it")

Applied one step deeper than recommended above. Rather than adding a second check in `onText`, the
bound moved **into the two parsers** (`MAX_INPUT_CHARS`, `verify-in-browser.ts`) — the seam where
the file route and the paste route converge. That way the rule is applied **once**, by construction,
instead of by two callers agreeing to apply it. `FileDrop` now derives its `MAX_BYTES` from the
shared constant rather than declaring its own literal; its `file.size` check stays, because it is
the only one that can refuse a file *without reading it into memory*.

Refusal, not truncation, as argued above — and the refusal says so explicitly, so a reader cannot
assume a partial verdict covered everything they pasted.

**5 teeth** (`evals/packs/input-size-cap.test.ts`), including one that fails if `FileDrop` ever
re-declares a numeric cap — the drift shape that *caused* F-1. Both mutation directions proven red;
both restores sha256-verified. The bound is also pinned by the mutation pass as M09/M10
(`docs/quality/mutation-pass-2026-07-31.md`), both killed.

---

## Classes tested and found CLEAN

**Prototype pollution — not exploitable.** `parseCatalogText` does `JSON.parse` on reader input
and never guards `__proto__` / `constructor`. Executed rather than reasoned about:

```
Object.prototype.polluted        = undefined
({}).polluted                    = undefined
__proto__ is an OWN key?         = true
```

`JSON.parse` assigns `__proto__` as a plain own property by spec — it does not walk the prototype
chain the way `Object.assign` or a hand-rolled deep-merge would. The parser also **constructs new
objects field by field** rather than spreading the parsed input, so a hostile key never reaches a
merge. Clean, though for a reason worth stating: it is clean because of how the parser builds its
output, not because of an explicit check. A future refactor to `{...row}` would reopen this.

**HTML/script injection — no reader input reaches a sink.** Two `dangerouslySetInnerHTML` sites
exist (`AuditWorkbench.tsx:260`, `CommonsScene.tsx:857`). Both are **hardcoded CSS string literals
inside `<noscript>`**, taking no argument and interpolating nothing. No `eval`, `new Function`,
`document.write`, `innerHTML`, or `insertAdjacentHTML` anywhere in the playground closure. Every
reader-supplied value renders as a React text child, which escapes by construction.

**Egress — structurally enforced, and the enforcement is itself tested.** The zero-network claim
does not rest on `FileReader` being trustworthy; `evals/packs/import-walk-guard.test.ts` walks the
import graph and was **inverted to an allowlist** in session 34 after a beacon was found executing
while the old denylist eval printed PASS. That guard now carries known-positive *and*
known-negative cases — a detector validated only on the shapes it was designed against tells you
nothing about the shapes it wasn't.

**Read-ordering / race — already fixed and guarded.** `FileDrop.tsx:106` holds a monotonic
`generation` counter; a `FileReader` result whose token is stale is dropped (gate finding 11).
Two files chosen quickly cannot land out of order and audit a file the reader already replaced.

**Failure channel separation.** Content and failure travel on separate callbacks (`onText` /
`onReadError`). A failure encoded as content — a sentinel string, an empty result that reads as
"valid but empty" — is the exact defect class this product audits, and the component refuses to
commit it.

**Input semantics the parser refuses, each for a stated reason:** non-UTC `asOf` (lexical
comparison would reverse staleness verdicts), non-USD currency (would manufacture false
mismatches), duplicate variation ids (silently shadow in the index Map — two prices, one verdict),
`#` in ids (splits the internal `id#field` reference), the reserved id `catalog`, empty `items`
(would report every feed row as a ghost). These are correctness guards, but several are
security-adjacent: each one is a way a crafted document could make the tool state something false.

---

## What this scan did NOT cover

Stated so the coverage is not read as wider than it is.

- **The live site.** Read-only, source-level only. No production probing.
- **Response headers.** Still unverified — see `HANDOFF.md`; no tool in this seat returns them.
- **The dependency tree.** No supply-chain audit (`npm audit`, transitive review) was run.
- **The non-upload surfaces.** CLI, MCP tool surface, and the delivery lanes were out of scope.
- **Independence.** Same lineage as the code's authors. Second look, not independent review.

---

## Provenance

Probes were run from a scratchpad and are reproducible from the descriptions above: a
prototype-pollution payload through `JSON.parse`; synthetic catalogs at 25k/50k/100k/200k items
through the parser's own loop shape; nesting at 1k/10k/100k levels. No repository file was
modified by this scan.
