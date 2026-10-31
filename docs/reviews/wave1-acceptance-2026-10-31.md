# Wave 1 acceptance review — 2026-10-31 (the review that never ran on 2026-10-12/14)

**Plain English:** four lanes of work were merged two weeks ago without the planned independent read. Tonight four read-only checks did that read. This page holds what they found, who fixes each item, and what is already good and must not regress.

Tree reviewed: `main` @ `0ac396f` / `cd0d347` (Wave 1 merge range `5818c35..0ac396f`). Checks: (a) contract/allowed-files · (b) register / RULES §4 / honesty · (c) test accounting · (d) one mutation re-applied per lane. Reviewers: Haiku 5.5 ×3 read-only, Sonnet 5.5 for (d). The orchestrator's own diff-first read is the admitting check; these are second opinions with evidence.

## (b) Register · RULES §4 · honesty sweep — returned 01:14

Counts: register 10 · §4 affiliation 0 (every mention is a disclaimer) · §4 impact/overclaim 4 · unsourced/undated fact 7 · capability stated present while it ARRIVES S<n> 7 · Codex § 5 structural analogs 4 (the exact Codex strings have zero hits).

**MUST-FIX before any public surface (→ exec-layer lane, docs):**
1. `docs/pilot-kit/pilot-proposal.md:7` — "catches, explains, sizes and routes drift … before it becomes a refund …" → present-tense capability (explain/size/route ARRIVE S2) + the Codex "caught before it becomes a refund" pattern. Rewrite as proposal/hypothesis with ARRIVES labels.
2. `docs/pilot-kit/pilot-proposal.md:9` — "This workflow finds it first, says how big it is, says who should fix it … A named person signs before anything happens." → same; signing exists only as an offline simulator. "the first person to find out is usually the customer" is unsourced → cite or label.
3. `docs/pilot-kit/pilot-proposal.md:45` — "A pre-flight confirms or holds the item … (tool exists; …)" → Codex "confirms or holds" pattern; no such tool in the README "exists today" table. Rewrite as proposed.
4. `docs/governance-model.md:146` (and `:159`) — "the C10 gate that scans every public sentence" → overclaim of enforcement; C10 is an explicit file list with eight patterns (Codex § 5). State what it scans and what it does not; note the new probes arriving in S1.5.

**SHOULD-FIX (→ exec-layer lane, docs, unless marked):**
5. `docs/governance-model.md:13` — "a named person signs before anything happens" → "a named person signs a proposal; nothing acts".
6. `docs/governance-model.md:56` — "this is what the pilot shows under 'why'" → explain_drift ARRIVES S2.
7. `docs/governance-model.md:63` — vendor-guidance claim with no URL/read date → cite plan § 16 sources with dates.
8. `docs/pilot-kit/pilot-proposal.md:40` — "After" cell in present tense → ARRIVES labels.
9. `docs/pilot-kit/pilot-proposal.md:44` — "thresholds enforced by sampling" → cite the Uber quality-program page + read date, or UNVERIFIED.
10. `docs/pilot-kit/pilot-proposal.md:104` and `demo-script-10min.md:65` — "free tiers only" → add the decision date and "re-verified at use (RULES §6)".
11. `docs/model-risk-register.md:57-58` — Groq limits and Google free-tier rows → inline "vendor pages read 2026-10-12; re-verify at use" (the freshness lane's 2026-10-31 read will supply the new date).
12. `docs/pilot-kit/demo-script-10min.md:31` — "Nothing in the stream is staged." → point at the test that holds it (demo-transcript test) or soften.
13. `docs/pilot-kit/demo-script-10min.md:30` — "No AI does the judging." → "No model can flip a verdict; the LLM seats recommend only" (reconcile with the Reviewer seat).
14. `docs/pilot-kit/demo-script-10min.md:34` — "load the example statement" → register: "the bundled statement".
15. **(→ S1.5 lane, code)** `lib/packs/listings/detectors.ts:124` and `:135` — plainLine "vs the real '${expected}'" → "vs the record's '${expected}'"; `:105` "is being served to customers" → "is served on the copy". Goldens regenerate with the change explained.

**NOTES:**
16. `demo-script-10min.md` filename + kit README link text carry "demo" → left as is tonight (filename, not captioning); revisit at the redesign port.
17. "live demonstration" in security-one-pager:7,9 and model-risk-register:94,101 → register watch-word; acceptable ("demonstration" is the doctrine's own term for the owner-armed live run).
18. `success-metrics.md:80` — "The scenario tests hold this" for tests that arrive later → ARRIVES label (exec-layer).
19. `data-request-spec.md:46` — present-tense proof of an S3 test, then "not built" → tense fix (exec-layer).
20. **(→ S1.5)** `fixtures/scenarios/README.md:22-26` — "this lane (Wave 1)" / "built by the S1 lane" → reader-facing table says Built: yes / arrives S2 etc., no lane jargon.
21. **(→ S1.5)** `fixtures/scenarios/README.md:14` — "No input is shaped like any platform's wire format" vs the kit's "shaped like the public integration docs" → make consistent: "none of these inputs is platform-shaped yet; platform-shaped inputs arrive in S3 under the 'shaped like, not from' label".
22. **(→ S1.5)** `fixtures/scenarios/README.md:95` — NYC §20-563.3 → add the read date / docket pointer used elsewhere in the repo.
23. `PROVENANCE.json:2` `"simulated": false` is correct for vendored schemas → add a one-line `"note"` explaining (S1.5 may, optional).
24. `detectors.ts:105` → covered by 15.
25. `pilot-proposal.md:93` $108,000 → labeled ILLUSTRATIVE/ASSUMPTION; keep adjacent on reuse (exec-layer, when deriving `/pilot` figures).

**Keep (do not regress):** the "What this is not claiming" box on every kit/governance doc · the BUILT / ARRIVES S<n> / OWED legend and "Nothing marked ARRIVES or OWED is a capability today" · UNVERIFIED and "not re-read by this lane" tags · the illustrative cost model with ASSUMPTION labels and "No dollar figure below is a measurement" · honest-limit boxes (budget guard, provider drift, security known gaps) · register NOT EXAMINED / DEFER states, "No exam date is invented" · scenario briefs: signature is a ledger record, nothing sent · derived-figure rule stated in both READMEs · verbatim "shaped like the public integration docs, not from the platform" · ISO/IEC 42001 explicitly not claimed · UCP README honesty bound.

**Disposition (orchestrator):** review (b) = **FLAG**. Push of `main` waits until items 1–4 and 15 are merged. Items 1–14, 18, 19, 25 → exec-layer packet (batch 1b). Items 15, 20–23 → S1.5 amendment sent 01:1x.

## (a) Contract / allowed-files check — returned 01:15

Lane verdicts: S1-pins FLAG (scope) · S1-engine FLAG (scope + two deferred contract items) · scenarios-w1 PASS (39/39 files inside the list) · S4-docs FLAG (scope + one marked-not-faked).
- Scope flags are packet inconsistencies, not lane faults: `evals/agents/gemini-pins.test.ts` and `legacy/activation/evals/gemini.test.ts` (S1-pins); `lib/packs/listings/{types,acp-feed,index,run}.ts` (S1-engine — the CONTRACTS clause "shapes extended" required the type edits the ALLOWED list omitted); `evals/packs/honesty-c10.test.ts` pilotDocs (S4-docs — the TESTS FIRST clause required it). **Accepted with record.**
- Deferred contract items, now in S1.5: `LISTINGS_SPEC_VERSION` not bumped (`run.ts:39`) · UCP pin still `2026-04-08` · scenarios 2 and 6 absent · README rows 2/6 say "built by the S1 lane".
- **Marked-not-faked, must-fix (→ exec-layer):** `docs/model-risk-register.md:38` states "Audit, Evidence, Impact, Route and Explain-drift are deterministic code. Their correctness is held by tests." — Impact, Route and Explain-drift do not exist on main (they arrive in S2 tonight; wording must say so until merged).
- Stale "ARRIVE S1" labels now understated (`data-request-spec.md:29`, `demo-script-10min.md:42`, `pilot-kit/README.md:47`) → exec-layer refreshes to BUILT where S1-engine landed.
- Record inaccuracies in the 2026-10-14 task-log entry ("+2 doc paths" — eight were added; "18 pins" — gemini-pins has 9, the other 9 are UCP pin tests) → corrected by the orchestrator below.
- Passed: detectors diff additive, no pre-existing ruleId/plainLine edited; new ids/severities exact; PRICING_VERSION dated; default/override as contracted; UCP 2026-08-25 vendored with PROVENANCE (content not byte-verified); manifests carry simulated/shapedLike/seed/generator; nothing under verifier-core, fees, delivery, crew, app, components or DESIGN.md.

## (c) Test accounting — returned 01:15

Itemised +124 = scenarios 91 · gemini-pins 9 · listings-coverage-c6 +5 · ucp-conformance +9 · honesty-c10 +9 (8 pilotDocs + modifiers.ts) · mockup html row +1. **Exact match** to the measured 1697 → 1821. No `.only` / `.skip` / `.todo` added. Flags: gemini-pins.test.ts has no RED-before proof in its header (→ S2-ledger adds tonight's measured red); listings-coverage-c6 mutation header has no restore sha (→ S1.5 adds it); honesty-c10 pilotDocs comment has no RED proof (→ S1.5's new probes supply it). Non-independent assertions in scenarios.test.ts (:380-388, :402-404, :650-660) are regression pins by design (FREEZE/ENGINE), not tautologies — accepted.

## (d) Mutation re-apply — returned 01:14 (Sonnet, in `.worktrees/review-w1`, restored clean)

- S1-engine: `if (true || actual === expected) return [];` in the LST-MOD-PRICE-VALUE detector → c6 red (coverage 10/11), c3 red (drift-014/015), scenarios red (FREEZE + platform-override/partner-onboarding ENGINE) — **bites**, wider than the header predicted.
- scenarios-w1: `"21.50" → "21.51"` in agent-86/inputs/feed.json → 7 red; `node scripts-ts/generate-scenarios.mts` → 91 green, tree clean — **bites**.
- S1-pins: output price 2.5 → 2.6 → 2 red in gemini-pins — **bites**.
- S4-docs: "Trusted by every major delivery platform and approved for production use." planted in governance-model.md → **ACCEPTED (green)** — Codex's prediction confirmed; a BANNED_CLAIMS phrase ("real-time DoorDash data") → red. The endorsement/approval/saved-$ probes land in S1.5 tonight and must turn that sentence red.
- **Environment finding:** in a fresh worktree the full suite reads 1804 passed · 1 failed · 8 skipped: the honesty-c10 site-wide scan runs `npm run build` when `out/` is absent (Google Fonts fetch denied in this sandbox) and `evals/presentation-posture.test.ts` reads `out/index.html`. Main passes only because its `out/` (2026-10-14) is newer than every source. **Rule for every lane and for every merge: `node scripts/build-offline.mjs` immediately before the full `vitest run`.**

## Verdict (orchestrator, 01:2x)

**Wave 1 ACCEPTED WITH CORRECTIONS.** Code lanes sound: tests bite, counts exact, contracts met except the items deliberately deferred to S1.5. Docs lanes need the wording fixes above (exec-layer) and one marked-not-faked correction (model-risk-register:38). Push of `main` waits for the S1.5 and exec-layer merges. Codex changed-files reviews remain owed (owner's limits).

## Reconciliation (written at each merge; verified = the fixed sentence read on `main`, or the probe re-applied)

| item | lane | status on main | evidence |
| --- | --- | --- | --- |
| (b) 1–3 pilot-proposal must-fix | exec-layer | **verified `204ade5`** | `:7` now "designed to … would likely become"; `:9` "a human signs a proposal; nothing acts"; `:45` pre-flight as proposal (diff read at the prefix merge) |
| (b) 4 governance-model C10 overclaim | exec-layer | **verified `204ade5`** | C10 described as an explicit list + patterns + rendered scan; new probes "ARRIVE with S1.5" |
| (a) 12 model-risk-register:38 marked-not-faked | exec-layer | **verified `204ade5`** | Audit/Evidence BUILT; Impact + ledger "MERGED 2026-10-31"; Route/Explain-drift "ARRIVE S2 (in progress)" |
| (b) 5–14, 18, 19, 25 · (a) 14 stale labels · F14 one-pager · F3a register line | exec-layer | **verified `204ade5` / `a047b0e`** (grep: 0 register hits in the six docs; no endorsement/saved-$ phrasing) | lane commit `4a8c763`; orchestrator grep at the prefix merge |
| (b) 15 plainLine register (`detectors.ts`) | S1.5b | **verified `10208a0`** | three sentences changed; goldens regenerated; mutation reverting them → 8 red |
| (b) 20–22 scenarios README · (a) 7–9 pin flip, scenarios 2 and 6 | S1.5 / S1.5b | **verified** | README rows; folders with goldens; `UCP_PINNED_VERSION === "2026-08-25"` asserted |
| (c) gemini-pins RED proof header | S2-ledger | **verified `7e4f699`** | header carries the 2.5 → 2.6 red |
| (c) c6 header restore sha | S1.5 | **verified** | header carries the restore sha |
| (d) endorsement sentence accepted by C10 | S1.5 probes | **verified at the S1.5 merge** | planted again in the worktree → 1 red in the new probe family; restored |
| (a) 15 task-log inaccuracies | orchestrator | **done** | correction entry appended |

**Push gate (orchestrator, 02:5x):** items 1–4 and 15 verified on `main` → the push gate opens. `main` pushed to origin pre-Codex (every owed gate logged; deploy gate closed; deploy deferred by owner word 2026-10-31).
