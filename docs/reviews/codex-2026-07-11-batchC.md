# Batch C — Codex changed-files review + reconciliation (2026-07-11)

**Reviewer:** ONE `gpt-5.6-sol@high` run via `~/claude-os/bin/codex-guarded`
(probe-first: SEAT_OK, 15,245-token probe). **Scope:** `9de7fdd..HEAD` — all of
slice group C (pre-regs `31bd66d` · E1a `c08fc5c` · S6a `032c04c` · S5 `1f39153` ·
CI residual `85d50b3` · RV1 `b62e2b6` · RV2 `e7b3bb6` · S6b `13ff62a` · e2e
residual `9c44d90`, + the state-sync `b261bc2` the reviewer noted). Packet carried
plan v3.3 §Gates, the review-before-scoring rule, the S6a re-verify ask, the E1a
binding ask, the S5 dual contracts, and the intent-vs-code gate (doctrine delta
row 2026-07-11). Raw transcript: `codex-2026-07-11-batchC-raw.log`.

**VERDICT: REVISE — 6 P1 · 4 P2 · 1 P3. Reconciliation (primary-model-final):
ALL 11 ACCEPTED-FIXED, 0 refuted.** Every finding was verified against the files
before fixing; none was disprovable.

▸ *Plain: the second AI model reviewed everything this slice group built and found
eleven real problems — including two in this session's own work and one in a
security record from earlier in the group. We confirmed every one against the
actual files, fixed them all, and re-ran every check before publishing.*

## P1s (all confirmed → fixed)

1. **S6a vet §2 scan claims false** (`docs/reviews/s6a-emil-vet-2026-07-11.md`).
   CONFIRMED: the vendored `README.md:26` carries `npx skills@latest add …` and the
   tree has SIX external domains, not one. **Fix:** S6a REOPENED — fresh quarantine
   clone (upstream HEAD `7bb7061`; pin `b57fc72f` exists; `diff -rq` = exactly the
   one documented modification), genuine full-tree scan with EVERY hit adjudicated
   (all benign: upstream's own install line + prose reference domains incl. the
   easing sites the brief itself cites), SHA-256 hash manifest retained, dated §2b
   correction appended (original §2 left standing as the record of the error),
   **RE-CLOSED: CLOSED-PASS on corrected evidence**.
2. **E2 corpus freeze declarative, not mechanical** — CONFIRMED. **Fix:** dated
   tightening AMENDMENT A1: corpus pinned to the exact blob/tree hashes at
   `31bd66d`; any drift = HARD BLOCK; corpus change = new pre-registration.
3. **E4 denominators ungoverned** — CONFIRMED. **Fix:** AMENDMENT A1: minimum
   counts per label (≥30 SAME · ≥30 DIFFERENT · ≥8 trap · ≥8 AMBIGUOUS), mutual
   exclusivity machine-checked, zero-denominator = floors UNMET (hard fail).
4. **dashboard-evidence bindings incomplete** (`evals/packs/dashboard-evidence.test.ts`)
   — CONFIRMED: `RUN_RECORDS.value` strings were unbound. **Fix:** +6 tests binding
   every rendered run-record value to the committed artifact its provenance names
   (L-1 value fully DERIVED from the matrix; retry/DEFER interpolated; L-2 "eight
   safety controls" ↔ "all eight held"; n8n "episodic"+"sha256-identical"; zero-cost
   NOTE tokens ↔ enforcing tests). **Mutation red-green ×3 executed** (25/25→31/31;
   each mutation bites, restore green).
5. **`/cost` "complete ledger … no unrecorded runs" overclaim** (`app/cost/page.tsx`)
   — CONFIRMED (the 2026-07-05 DEFER run was absent). **Fix:** the DEFER run added
   as a first-class ledger row (derived from `CALIBRATION.deferRun`, provenance
   `4275aff`); heading/lede reworded to the provable scope; absolutist sentence
   removed.
6. **Artifact-mode `reuseExistingServer: !CI`** (`playwright.artifact.config.ts`)
   — CONFIRMED (a stale listener could swap the artifact under test). **Fix:**
   `reuseExistingServer: false` always; fail loud on an occupied port.

## P2s (all confirmed → fixed)

7. **BM25/E4 baselines underspecified** → E2 AMENDMENT A2 (Okapi k1=1.2 b=0.75,
   tokenization, identical chunking, top-k=5, zero post-access tuning) + E4
   AMENDMENT A2 (the exact normalization chain + enumerated suffix list, frozen).
8. **E2 leakage screen gaps** → AMENDMENT A3 (no source filenames/rule ids/schema
   anchors/answer-span ≥5-grams in questions + normalized near-dup check).
9. **E2 M5 injection under-registered** → AMENDMENT A4 (≥3 paired cases, retrieval
   REQUIRED and asserted, exact clean-vs-poisoned counterfactual, marker list).
10. **Meridian hold copy contradicted the code + `aria-expanded` unsynced**
    (`mockups/meridian-2026-07-11.html`) — CONFIRMED against this session's own
    build. **Fix:** copy now says hold-to-completion / early release cancels;
    `aria-expanded` added to the no-hold control and synced on both in `reveal()`.

## P3 (confirmed → fixed)

11. **Brief §12 checklist unchecked** → adjudicated item-by-item with evidence in
    `docs/design-brief-s6b-2026-07-11.md` §12 (incl. the P2 copy correction noted).

## Reviewer confirmations (recorded)

Protected-path diff == the five-file allowlist exactly (legacy/ + fixtures/ EMPTY) ·
E2/E4 byte-unchanged post-`31bd66d`, RESULTS empty, no scoring artifacts · `9c44d90`
= exactly the two timeout lines · the vet neutralization itself sound (the quoted
prompt-override defensive; the four U+200B benign) · S6b anchors/zero-request/
reduced-motion/no-JS/keyboard/banner/fixture-parity hold · recorded gates accepted.

## Post-fix gates (re-run live 2026-07-11, this reconciliation)

See the reconciliation commit message for the executed battery: verify exit 0
(floor held) · test:legacy 306+5 · e2e both modes · C10 green · protected-path
allowlist re-derived (now + `evals/packs/dashboard-evidence.test.ts` extension,
recorded here). PUSH follows per plan §Gates (batch C reconciled).
