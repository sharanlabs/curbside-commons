# Guidelines adherence audit — Curbside Commons, main @ `fac8204` (2026-10-12)

**Provenance.** Read-only pass by a `guidelines-monitor` subagent (Sonnet 5.5), dispatched by the orchestrator
seat under the owner's 2026-10-12 production-floors mandate. It edited nothing. **Orchestrator verification
(same day):** the three load-bearing code claims are confirmed — `lib/agents/budget.ts:8-26` states in its own
header that it is a per-call pre-check with *no active non-legacy driver wired* and a post-call overflow stop
that must be re-implemented before arming; `lib/delivery/slack.ts:53,113,147` hard-codes `SIMULATED_BANNER`
into every payload; `lib/agents/pricing.ts` throws on an unknown model id (so any Groq id would throw today);
`.github/workflows/ci.yml` has no `npm audit` / SBOM step; `@huggingface/transformers` 4.2.0 is still a
devDependency (`package.json:60`). The KB caveat below is the auditor's own.

**Disposition.** Owner decision required on gap 1 (below); gaps 2–10 mapped to slices and folded into the
pre-build gap sheet and the Wave 2 packets (decision-log 2026-10-12).

---

**DOMAINS:** hybrid deterministic+LLM workflow · evals/pre-registration · prompt-injection defence · human
approval · model-risk governance · cost control · pilot data handling · supply chain/reliability.

**SOURCES.** Curated KB: `agent_building_kb` INDEX, `evals_kb` INDEX + `rag-evaluation`,
`security_kb/mcp-server-security`, `harness_engineering_kb/execution-safety` — caveat: `rag-evaluation` and
`mcp-server-security` were harvested *from this project*, so they are self-citation; there is no curated KB
for cost control, data handling, supply chain or pilot ops. Live, fetched 2026-10-12: OWASP LLM Top 10 2025
and LLM01 · Anthropic "Demystifying evals for AI agents" · NIST AI RMF page · ISO/IEC 42001 page · Groq
rate-limits and Prompt Guard 2 pages · npm-sbom docs.

**Scope limits.** Grep/Glob were hook-blocked; the auditor sampled by direct reads: the plan · RULES · README ·
PROJECT_STATE · `orchestrator.ts` · `model.ts` · `injection-scan.ts` · `budget.ts` · `pricing.ts` · `gemini.ts` ·
`env-flags.ts` · `slack.ts` · `crew-import-walk.test.ts` · `honesty-c10.test.ts` · `ci.yml` · `package.json` ·
`SECURITY.md` · decision-log rows · `mutate.py` · the L-1 preregistration. Not opened: `lib/verifier-core/**`,
the freeze-lock tests, the approvals module.

## Per domain

### 1. Hybrid workflow design
- ✓ FOLLOWED — deterministic baseline first; workflow over agent; escalate on a named trigger (plan §5, §17).
- ✓ FOLLOWED — least privilege + human approval for risky actions (OWASP LLM01 mitigations 4–5; plan §6 tiers; no send path).
- ⚠ PARTIAL — plan §16 paraphrases Anthropic as "grade trajectories"; Anthropic's Step 5 says grade what was produced, path-grading is brittle. Fix: the root-cause *class* is the gating metric; evidence-citation a secondary, non-gating score. **S2.**

### 2. Evals and pre-registration
- ✓ FOLLOWED — pre-specified floors, burned split, disclosed correction, K=3 consistency (`docs/l1-consistency-preregistration.md`).
- ⚠ PARTIAL — root-cause "per-class recall ≥ 0.80" has no n per class; at ~20–30 scenarios that is 3/4 or 4/4. Fix: ≥ 10 cases per class, Wilson intervals, label "smoke-scale, n=…". **S2 floors doc.**
- ⚠ PARTIAL — judge hygiene: an "Unknown" exit and calibration against human labels are named in §16 but in no SC; the S5 Gemini judge has no calibration step. **S5.**
- ✗ NOT ADDRESSED — forward leakage: if the generator writes the cause into "source metadata", the seat reads the answer. Fix: a leak test (baseline must fail with the field stripped). **S2.**

### 3. Prompt-injection defence
- ✓ FOLLOWED — quarantine wrapper (`model.ts:60-68`); call-site containment by tool name + argument digest (`orchestrator.ts:107-123`); anomaly forces escalation over a model "approve" (`:221-231`).
- ⚠ PARTIAL — OWASP LLM01 scenario #9 (multilingual / Base64): `injection-scan.ts` is English regex, no NFKC normalisation, no encoded-payload check (its header honestly says "tripwire, not a guarantee"). New inputs widen the surface. Fix: NFKC before scanning; multilingual + Base64 negative fixtures in scenario 8; optionally Groq's free `llama-prompt-guard-2-86m` as a second Tier-B anomaly source into the same escalation path. **S3.**
- ✗ NOT ADDRESSED — quarantine contract for the root-cause seat (the 400-char excerpt fits intake/reviewer, not a seat that needs findings + timestamps). **S2.**

### 4. Human approval and governance
- ✓ FOLLOWED — signed, content-bound, replay/expiry-checked approvals with a threat-model suite.
- ⚠ PARTIAL — the signer is a simulator: no key registry, enrolment, rotation or revocation. Fix: committed `signers.json` public-key registry + revoke rule. **S2.**
- ⚠ PARTIAL — ledger append-only by policy, not tamper-evident. Fix: `prevHash` per JSON-lines entry; `diff` verifies the chain. **S2.**
- ✗ NOT ADDRESSED — NIST AI RMF 1.0 / GenAI Profile (NIST-AI-600-1): no crosswalk of the §6 control register to GOVERN/MAP/MEASURE/MANAGE. Fix: one-page table in `docs/governance-model.md`. **S4-docs.**
- ✗ NOT ADDRESSED — ISO/IEC 42001: organisation-level standard; a solo prototype should not claim it. Fix: one explicit non-claim line in the pilot kit. **S4-docs.**

### 5. Cost control and sustainability
- ✓ FOLLOWED — fail-closed cap; pricing throws on an unknown model (`budget.ts:50-70`, `pricing.ts:50-58`).
- ✗ VIOLATED (plan vs code) — plan §1 item 4 says the live path is "budget-capped"; `budget.ts` says only a pre-call guard exists, no active driver is wired, and a post-call overflow stop must be re-implemented before arming. S2/S5 SCs do not mention it. Fix: "post-call overflow stop + cumulative ledger" in S2's SC. **S2.**
- ✗ NOT ADDRESSED — free-tier accounting: `pricing.ts` prices only Gemini ids, so Groq ids throw; Groq free limits RPM 30 / RPD 1K / TPM 8K / TPD 200K (fetched 2026-10-12). Root-cause on a ~300-item fixture will not fit 8K TPM. Fix: $0-priced rows + RPD/TPD counters; deterministic pre-summary capped ~2K tokens, asserted by test. **S1 (pricing), S2 (cap).**
- ✓ FOLLOWED — episodic, no standing infra (`SECURITY.md:44-52` documents the rate-limit exception with a revisit trigger).

### 6. Pilot data handling
- ✗ VIOLATED (internal contradiction) — plan §6: "four weeks on test data then two on the platform's own exports." RULES §4: "a simulation on dummy data — always"; `slack.ts:53` hard-codes `SIMULATED_BANNER`. Phase 2 either breaks the constitution or prints a false banner on real exports. Fix: **owner decision-log row first**; then an `inputProvenance` field (`synthetic | customer-supplied`) selecting the banner; C10 probes for both modes. **S3 + S4-docs.**
- ✗ NOT ADDRESSED in any SC — the §6 "drop any customer field" ingest rule, data classification and retention exist only in the control register. Fix: allow-list columns (drop by default) + a test that plants customer fields. **S3.**

### 7. Reliability, supply chain, delivery
- ✓ FOLLOWED — SHA-pinned CI actions, least permissions, read-only transport.
- ⚠ PARTIAL — plan §6 promises a "dependency list"; CI has no `npm audit`, no SBOM; the 2026-07-21 row records 5 un-forced advisories; `@huggingface/transformers` remains a devDependency though README says the lane was retired. Fix: `npm audit --omit=dev` + `npm sbom --sbom-format cyclonedx` as CI artifacts; prune. **NEW tiny slice.**
- ✗ NOT ADDRESSED — provider drift: floors earned on an unpinned hosted id (`openai/gpt-oss-120b`). Fix: pre-demo canary (frozen K=3 set, ~$0 on Tier B) + provider model and date stamped in each ledger entry. **S5.**
- ✗ NOT ADDRESSED — installing inside a platform environment: Node ≥ 24 + `npm ci` from the registry. Fix: tagged release tarball + lockfile hash + SBOM. **S6.**

### 8. Feedback loops
- ✗ NOT ADDRESSED — failures should become test cases (Anthropic). Ledger records signed/withdrawn/expired but nothing turns them into eval candidates. Fix: a script emitting human-relabelled candidates from ledger dispositions, admitted only into the next fresh split. **S2 (script), S5.**

## Top 10 gaps (risk to pilot × cheapness)
1. Phase-2 real exports vs RULES §4 and the SIMULATED banner — **owner decision** + provenance flag. S3/S4.
2. Customer-field drop rule + data classification have no SC — allow-list adapter + one test. S3.
3. Root-cause seat has no input contract (untrusted text, quarantine, ≤ 2K-token cap). S2.
4. "Budget-capped live path" is not true in code (no post-call stop, no Groq accounting). S2.
5. Tripwire: no normalisation, no multilingual/Base64 fixtures. S3.
6. No CI audit/SBOM; known advisories unrecorded in the security packet. NEW tiny.
7. Floors lack n per class and a leakage test. S2.
8. Ledger hash chain + signer key registry. S2.
9. Provider-drift canary + model stamping. S5.
10. NIST crosswalk + ISO non-claim. S4-docs.

Below the top 10: no feedback-to-eval path (S2/S5) · no installable release (S6) · `.env.example` still headed
"ActivationOps AI" with legacy drafter/judge guidance.

## Do not regress (the repo beats the guideline here)
- Pre-registered floors + the burn rule: floors before data; burned split; published DEFER for E2/E4; a voided run kept on the record; a disclosed adapter correction. Exceeds Anthropic/OWASP baselines.
- K=3 flip-rate with a zero unsafe-direction floor — stricter than plain pass^k.
- The model seam is untrusted by construction (argument-digest contract; anomaly overrides approve; committed negative fixtures in `crew-import-walk.test.ts`).
- The tripwire's discipline: zero-false-positive corpus, adversarial sweeps, stated non-guarantee — keep it when adding normalisation.
- Import-graph egress teeth with decision-grade assertions.
- Mutation harness with a declared denominator (`docs/quality/mutate.py`).
- Honesty gates that bite: C10 + `readme-route-claims`. Caution: C10 scans an *explicit list* — `app/pilot/page.tsx` and every new adapter/doc stay unscanned until named; plan S4 must list the page.
- Cross-model review adjudicated rather than obeyed (the 2026-07-21 rejection of a worse security "fix").
- Plan §16's corrections: "monitoring exists; evidence-grade verification doesn't"; never "nobody audits menus".

**Live, not yet curated (harvest candidates):** Groq Prompt Guard 2 as a layered control · npm SBOM/audit in CI · Groq free-tier TPM/TPD as a design constraint · OWASP LLM01 scenario #9.
**No established guidance found (not guessed):** statistical sizing for per-class recall floors at smoke scale · US-state AI-law applicability to a platform-side verifier (not assessed).

**VERDICT: GAPS TO CLOSE BEFORE SHIP.** Engine and eval discipline above the guideline; the gaps are plan-level — the Phase-2 data contradiction, the unowned ingest rule, and live-path claims the code does not yet support.
