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
