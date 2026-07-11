# Batch-A Codex review — 2026-07-10 (plan v3.3: S1 + S2 + S3a)

**Run:** ONE `gpt-5.6-sol` @ `high` via `~/claude-os/bin/codex-guarded` (probe-first: SEAT_OK at low effort before the heavy run, per the 2026-07-10 quota amendment). Read-only; reviewed range `09b08be..9b739f9` (5 local commits, unpushed). Packet cited plan v3.3 (S1/S2/S3a + §Gates), the unified-review ledger, and the S1 claim ledger (`docs/reviews/s1-claim-ledger-2026-07-10.md`). Raw stream preserved: `docs/reviews/codex-2026-07-10-batchA-raw.log` (~179k tokens used).

**VERDICT: REVISE — 2 P1 + 5 P2. Reconciliation (primary-model-final, Fable): ALL 7 ACCEPTED, 0 refuted — each fixed red-green the same session.**

| # | Sev | Finding | Disposition + fix |
|---|---|---|---|
| 1 | P1 | `docs/PLAIN-ENGLISH.md` "Answering either question today means checking by hand" preserves the prohibited exclusivity/automation claim (decision-log 2026-06-22) | **ACCEPTED.** Scoped: "For a merchant without reconciliation tooling, answering either question means checking by hand, line by line." |
| 2 | P1 | `README.md` evals section reintroduced blanket coverage ("Everything asserted here is measured") and universalized the anti-theater baseline over components (agents earned labels via safety/class-match floors, not baseline-beating) | **ACCEPTED** — the named pre-approach risk, caught exactly as designed. Intro scoped to "the measurement rules the repo's labels live under"; the baseline bullet now names the classifier's baseline bar and the agents' floor bar separately ("Each label names the exact bar it cleared"). |
| 3 | P2 | `docs/PUBLICATION.md` honesty box "No real merchant data … anywhere" false for the legacy module's DataSF adapter | **ACCEPTED.** Scoped to the truth-audit engine + the legacy module disclosed as the scoped exception (adapter over public-domain records, synthetic overlay, fictional display). |
| 4 | P2 | `docs/PLAIN-ENGLISH.md` "That's the only place AI is used" contradicts the live agents + recorded Gemini lane | **ACCEPTED.** Scoped to "inside the checker itself" + pointer to the README AI inventory. |
| 5 | P2 | The mockup scan's non-affiliation strip (`[^.<]*`) could erase a genuine overclaim sharing the disclaimer's sentence | **ACCEPTED.** Strip narrowed to the PREDICATE only (`not affiliated with, endorsed by, or connected to\b`); two new adversarial bite tests: same-sentence overclaim (em-dash continuation) caught; the honest disclaimer still passes clean. |
| 6 | P2 | The footer semantic-contract test scanned the whole layout source (comments included); e2e assertions were page-global and prefix-only | **ACCEPTED.** Contract now binds to the extracted `<footer>…</footer>` block with JSX comments stripped; new outside-footer mutation test (layout minus footer must fail every disclosure); e2e assertions scoped to `footer.site-footer` and assert the complete non-affiliation sentence + both send-posture sentences. |
| 7 | P2 | `ci.yml` `push: branches: [main]` contradicts the plan's unqualified "on push/PR" and the file's own comment | **ACCEPTED.** Branch filter removed (unqualified push + pull_request); per-ref concurrency de-duplicates. |

**Post-fix gates (all re-run live):** C10 pack 101/101 · e2e 4/4 (footer-scoped assertions) · `npm run verify` exit 0 = **1005 passed + 7 skipped** (README/PUBLICATION counts updated to the final measured number, dated) · `test:legacy` 306+5 · protected paths: `legacy/` `fixtures/` EMPTY; `evals/` = the same recorded 2-file allowlist (honesty-c10.test.ts, console.spec.ts — both plan-specified).

**Push policy:** batch A reconciled → push proceeds; S3a's first green CI run to be observed live post-push (S3b's claim flip waits for it).
