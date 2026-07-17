# Codex covering batch — design-enhancement slice, sessions 21+22 (2026-07-16)

**Reviewer:** ONE gpt-5.6-sol@high via `~/claude-os/bin/codex-guarded` (probe SEAT_OK 12,370 tok earlier this session; batch run 450,999 tok, read-only, `--skip-git-repo-check`). Scope: the ENTIRE uncommitted tree on `fb32360` — session-21 bench substance + layout-sanity, the session-22 content pass, de-slop deletion, drift-lock, NumberFlow first use, section rails — with an ORDERED PROBE of `@number-flow/react` as the first browser-bundle runtime dependency (owner unknown ②). Raw: `codex-2026-07-16-batchS22-raw.txt`. One harness event raw: the first foreground run hit the 10-minute tool cap (SIGTERM 143) → relaunched in background, seat uncontended.

**VERDICT: REVISE — 0 P1 · 5 P2 · 3 P3 → reconciled primary-model-final: 7 ACCEPTED-FIXED · 1 ACCEPTED-PARTIAL · 0 refuted.**

## Disposition

| # | Sev | Finding | Disposition |
|---|-----|---------|-------------|
| 1 | P2 | EvidenceBench print-mid-replay corrupts restored state | **ACCEPTED-FIXED, deeper than filed:** the real defect was the stage-dependent effect RE-SUBSCRIBING on every stage change, discarding the closure (`opened`, prior state) between `beforeprint` and `afterprint` — the restore only ever worked from the steady state. Rebuilt as subscribe-once + refs (React ref discipline enforced by the compiler lint, which caught the first draft's render-time ref writes); a print that interrupts a replay now RE-RUNS the deterministic replay (elapsed timers are unrestorable — re-run is the honest resume). New e2e tooth (RED first): print mid-replay → settled-complete on paper, resumed run after; stepped-state round-trip exact. |
| 2 | P2 | Bundled MIT deps ship without notices | **ACCEPTED-FIXED:** NOTICE gains the three attributions (number-flow / @number-flow/react — © 2024 Maxwell Barvian; esm-env — © 2022 Benjamin McCann); `public/third-party-notices.txt` (full MIT text + attributions) ships in the artifact at /third-party-notices.txt. |
| 3 | P2 | MethodRelation no-JS fallback kept the superseded sentence | **ACCEPTED-FIXED:** both renders now assemble from ONE `SENTENCE` fragment constant — the copies cannot drift; a structural fix instead of a second string to police. |
| 4 | P2 | Content-pass adjudication totals false (27/6 vs the true 24+8) | **ACCEPTED-FIXED:** corrected in the contentpass record, task-log, and tooling ledger to 32 accepted (24 as proposed + 8 modified) · 3 refuted. |
| 5 | P2 | State docs still describe session 21 | **ACCEPTED:** the session-22 blocks publish in PROJECT_STATE/CURRENT_TASK/HANDOFF BEFORE the commit (executed at wrap, per this record). |
| 6 | P3 | Fees no-JS floor incomplete (orphan label + impossible tip) | **ACCEPTED-FIXED:** the noscript style now hides `.pg-label` and the tip (`.pg-tip`) with the controls; the honest fallback line stays. |
| 7 | P3 | NumberFlow tooth doesn't exercise re-audit | **ACCEPTED-PARTIAL:** the tooth now runs under emulated reduced motion, edits + re-audits, and asserts the SAME five flows render the moved tally (5→4) with the sr mirror moving too. DECLINED: frame-level animation assertions — under reduced motion the correct behavior is NO animation, and animation-frame sampling on the allowed-motion path is nondeterministic theater; the package's prefers-reduced-motion branch was verified in shipped code by this batch itself (probe d). |
| 8 | P3 | Record referenced /tmp + a nonexistent §Raw | **ACCEPTED-FIXED:** points at the committed `codex-2026-07-16-contentpass-raw.txt`. |

## NumberFlow probe (a–f) — batch findings + primary-seat evidence, reconciled
- **a. Bundle:** ESM closure 29.4K raw / 8.7K gzip; attributable segment in the /fees chunk ≈17.2K raw / 5.7K gzip ≈ 2.75% of /fees transferred JS; route-local (the chunk is referenced by out/fees.html only — primary-seat check concurred). PROPORTIONATE for five genuinely changing figures.
- **b. Licenses:** MIT ×3, exact-pinned; notices were MISSING → fixed (finding 2).
- **c. esm-env:** environment-literal conditional exports; the emitted browser branch carries no process/dev residue; zero telemetry/install hooks across all three packages.
- **d. Floors:** no NumberFlow markup exists in the no-JS path (result state starts null; out/fees.html carries none); prefers-reduced-motion honored in shipped code (`number-flow/dist/lite.mjs:81-85`, `respectMotionPreference` default true) — now ALSO exercised by the extended e2e tooth (finding 7).
- **e. Zero-external-request:** no fetch/XHR/WebSocket/EventSource/sendBeacon/network-URL in any shipped dist (both reviewers' independent greps); the only external ref on /fees is the footer's GitHub `<a href>` — a navigation link, not a load-time request.
- **f. A11y:** shadow-root digits + ElementInternals role=img/ariaLabel; the aria-hidden visual line + sr-only sentence mirror JUDGED CORRECT (no double announcement; robust where ElementInternals is absent; prints via the visible line).

## Batch-clean list (verbatim from the verdict)
Honesty bytes + banned-claim scans · deleted-hero CSS liveness · the 16-row drift lock · section rails · layout-sanity coverage · package networking · reduced-motion implementation · ARIA mirroring.

## Post-fix gates (re-run after every fix landed)
Recorded below in the task-log wrap block: verify exit 0 · full vitest · dev e2e · ARTIFACT e2e (rebuilt) · axe 9/9 · lint clean.
