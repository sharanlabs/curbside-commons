# Codex Review — Recalibration + L-2 Sender Slices (2026-07-09)

**Scope:** `162b9a9..90e6fd3` — retry pre-registration (`f5a051c`), L-2 one-shot sender (`a985a51`), recalibration results + label flips (`90e6fd3`). Read-only, xhigh via codex-guarded; maker=judge briefed (all files authored inline on the Fable seat).

**Seat event (raw on record):** the FIRST launch was externally stopped mid-run after ~565KB of interim work (no seat-limit banner; its own node probe had also hit the repo's `@/`-alias, harmless). One protocol retry completed and produced the verdict below. Also on record: the brief contained one stray non-English word ("никогда" for "never" in item d), flagged to the reviewer in the retry note.

**Verdict: BLOCK — 2 P1 + 1 P2. ALL THREE ACCEPTED-FIXED (primary-model-final; no refutations).** Raw: `codex-2026-07-09-retry-l2-slices-raw.md`.

| # | Finding | Reconciliation |
| --- | --- | --- |
| P1 | L-2 fetch follows redirects by default → a 307/308 could replay the POST off-allowlist; https/path shape unenforced | **CONFIRMED → FIXED:** `redirect: "error"` + `https:` protocol gate + `hooks.slack.com` host gate + `/services/` path-shape gate. Red-teamed live: absent / http / wrong-host / wrong-path all refuse pre-record, pre-network |
| P1 | Run record written AFTER the send → a 2xx followed by a write failure violates control #6; date-only filename could overwrite a same-day run | **CONFIRMED → FIXED:** ARMED/pending record probe-written BEFORE the send (the 2026-07-05 probe-write-before-spend lesson); filename = full timestamp; outcome replaces the probe |
| P2 | State docs (PROJECT_STATE / CURRENT_TASK / HANDOFF / task-log) stale after a high-risk live result | **CONFIRMED → FIXED:** synced in the same commit as these fixes (step-boundary sync, lossless-continuity rule) |

**Claims verified by the reviewer (its own recomputation):** (a) no-rigged-exam CONFIRMED — retry split structure + 19/21 baseline + the two analogue misses recomputed independently; (b) pre-registration integrity CONFIRMED via git diff (only below the RESULTS marker changed); (c) lock integrity CONFIRMED (recomputes from records; scored ids ≡ committed split; old snapshot/lock byte-clean across the range); (d) label-flip honesty mostly confirmed (C10 unexecutable in its sandbox — EPERM on Vite temp dirs — but the gate ran green in ours, twice); (f) provenance caveat judged "not disqualifying" with the recorded mitigations — "not an independent blind benchmark," which the status doc already states.

**Post-fix gates:** refusal red-team 4/4 · verify + legacy re-run green (counts in the fix commit).
