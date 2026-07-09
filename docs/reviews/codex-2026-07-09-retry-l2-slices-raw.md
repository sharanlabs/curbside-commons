**Verdict: BLOCK**

**Findings**

P1 — L-2 sender can violate “single POST / allowlisted recipient” through redirects.  
[scripts-ts/l2-slack-one-shot.mts](/Users/sharan_98/Desktop/AI DoorDash Merchant Engine/scripts-ts/l2-slack-one-shot.mts:46) only checks `host === "hooks.slack.com"`, then [fetches](/Users/sharan_98/Desktop/AI DoorDash Merchant Engine/scripts-ts/l2-slack-one-shot.mts:68) without `redirect: "error"` or `redirect: "manual"`, and without enforcing `https:`. Fetch defaults to following redirects per MDN’s RequestInit docs. A 307/308 can replay the POST body to a redirected location, breaking the plan’s “single message” and allowlist controls in [docs/plan-a3-delivery-safety.md](/Users/sharan_98/Desktop/AI DoorDash Merchant Engine/docs/plan-a3-delivery-safety.md:12). Fix: require `url.protocol === "https:"`, require Slack webhook path shape, and set `redirect: "error"`.

P1 — L-2 can send successfully and then fail to produce the mandatory run record.  
The POST happens before the record write: [fetch](/Users/sharan_98/Desktop/AI DoorDash Merchant Engine/scripts-ts/l2-slack-one-shot.mts:68) precedes [writeFileSync](/Users/sharan_98/Desktop/AI DoorDash Merchant Engine/scripts-ts/l2-slack-one-shot.mts:102). If the record write fails after a 2xx response, control #6 in [docs/plan-a3-delivery-safety.md](/Users/sharan_98/Desktop/AI DoorDash Merchant Engine/docs/plan-a3-delivery-safety.md:16) is violated. The date-only record filename can also overwrite a same-day run. Fix: preflight the record path before send, use a unique timestamped filename, write an armed/pending record first, then append outcome.

P2 — Continuity docs are stale after a high-risk live-calibration result.  
`git diff --name-status 162b9a9..90e6fd3` shows no updates to `PROJECT_STATE.md`, `CURRENT_TASK.md`, `HANDOFF.md`, or `docs/task-log.md`. Current handoff still lists “classifier retry” as open at [HANDOFF.md](/Users/sharan_98/Desktop/AI DoorDash Merchant Engine/HANDOFF.md:9), and `CURRENT_TASK.md` still lists L-2/public flip/S-11/classifier retry as remaining at [CURRENT_TASK.md](/Users/sharan_98/Desktop/AI DoorDash Merchant Engine/CURRENT_TASK.md:6). That violates RULES.md closure/handoff expectations and creates repeat-run risk.

**Claims Verified**

(a) No-rigged-exam: confirmed by static recomputation. Retry split is 21 items, 3 per stratum, denominators 4/3/4/4/6, baseline recomputes 19/21 with misses `relabel-retry-2` and `bundle-retry-2`. Floors are not weaker: [docs/fee-classifier-recalibration-status.md](/Users/sharan_98/Desktop/AI DoorDash Merchant Engine/docs/fee-classifier-recalibration-status.md:45).

(b) Pre-registration integrity: confirmed. `f5a051c` committed the pre-reg with pending results; `git diff f5a051c..90e6fd3 -- docs/fee-classifier-recalibration-status.md` changes only below the RESULTS marker.

(c) Lock integrity: confirmed structurally. New lock recomputes from per-item records and checks scored ids + ground truth against retry split at [evals/gold/fee-classifier-recalibration.lock.test.ts](/Users/sharan_98/Desktop/AI DoorDash Merchant Engine/evals/gold/fee-classifier-recalibration.lock.test.ts:70). Old snapshot/lock/status diff clean across the range.

(d) Label-flip honesty: mostly confirmed. README/SHOWCASE bound the claim to fresh held-out/synthetic n=21 and preserve 2026-07-05 DEFER. C10 file unchanged. Could not execute C10 due sandbox temp-write failure.

(e) L-2 controls: BLOCK, as above.

(f) Provenance caveat: not disqualifying by itself. The caveat is recorded at [docs/fee-classifier-recalibration-status.md](/Users/sharan_98/Desktop/AI DoorDash Merchant Engine/docs/fee-classifier-recalibration-status.md:77), and the mirror rule + identical baseline pin + unchanged floors are adequate for the bounded synthetic claim. It is not an independent blind benchmark.

**Validation**

Attempted focused Vitest runs, but the read-only sandbox blocks Vite temp directory creation with `EPERM: mkdir .../T/.../ssr`. I used git diffs plus read-only Node probes for metric recomputation. Subagent blind-spot pass independently agreed on the L-2 and continuity-doc blockers.