# Codex adversarial cross-check — plan + gap sheet (2026-10-12)

**Provenance.** Codex CLI 0.159.3 via `~/claude-os/bin/codex-guarded`, read-only sandbox, 711 s, 169,541 tokens, dispatched by the orchestrator 2026-10-12 13:44 with the plan, the gap sheet, both research passes and the 2026-10-12 decision-log section as brief; instructed to form its verdict before reading orchestrator conclusions (D23). **Orchestrator verification (2026-10-14):** all four code findings in § 4 confirmed at the cited lines — `lib/packs/listings/reference.ts:41` (`byVariationId.set` overwrites a duplicate id silently), `lib/packs/listings/detectors.ts:175,205` (`actual >= asOf` string comparison on timestamps), `lib/agents/crew-live.ts:217` (`generateObject` without `maxRetries`), `lib/crew/model.ts:91-106` (replay keyed on `caseId`/member only). Vercel Hobby fair-use and owner-account entitlements remain UNVERIFIED as Codex marked them. Verbatim output follows.

---

1. VERDICT ON THE DIRECTION

PROCEED WITH CHANGES. Proceed as a synthetic demonstration of a bounded verification workflow; hold claims of enterprise readiness, prevented losses, and platform acceptance. The deterministic recommendation boundary and signed approval checks have supporting evidence, but the plan overstates reference authority, transfers qualifications across changed inputs, and treats local execution as sufficient security assurance. The gap sheet improves feasibility without resolving those weaknesses. My initial verdict preceded the research conclusions; subsequent code checks strengthened it. Platform willingness to adopt, available exports, and commercial effectiveness remain UNVERIFIED.

References: “Plan” means docs/plan-menu-integrity-crew-2026-10-09.md; “Gap” means docs/plan-wave2-gap-sheet-2026-10-12.md.

2. THE FIVE WEAKEST LOAD-BEARING CLAIMS

A. Claim: comparing the platform copy with the merchant record establishes which menu is “telling the truth.”

Why it may be false: legitimate channel prices, intentionally restricted assortments, and differently dated snapshots can disagree. The current price detector compares directly against one catalog price; it does not establish that this catalog governs this channel at this time.

Evidence: Plan:12,104; lib/packs/listings/detectors.ts:92; lib/packs/listings/reference.ts:54. DoorDash explicitly supports different delivery and pickup prices. [DoorDash dual-pricing documentation](https://developer.doordash.com/en-US/docs/marketplace/how_to/how_to_build_dual_pricing/)

What settles it: an authoritative-reference contract covering store, channel, fulfillment, capture time, and approved transformations; fixtures where intentional differences pass and unauthorized differences fail. Otherwise describe “disagreement with the supplied reference.”

B. Claim: derived impact arithmetic supports the proposed refund-reduction business outcome.

Why it may be false: association is not prevention. An order touching a flagged item need not have suffered that error. The proposed schema stores refund_cents at order level but describes summing refunds “on those lines,” creating an allocation/double-counting ambiguity. Exact recomputation can reproduce a wrong economic model perfectly. Recorded proposals also do not demonstrate remediation.

Evidence: Plan:110–118; Gap:74–81; lib/approvals/simulator.ts:213,226.

What settles it: distinct-order counting, explicit drift intervals, refund allocation rules, unrelated-refund controls, and separate fields for observed refunds versus hypothetical exposure. Actual reduction requires a controlled remediation measurement outside this synthetic demonstration; effectiveness is UNVERIFIED.

C. Claim: the Reviewer’s earned label survives because approve/escalate vocabulary is unchanged.

Why it may be false: the input and task change when the Reviewer evaluates computed routes, new seats, and impact. Stable output grammar does not establish equivalent behavior.

Evidence: Gap:18–23; lib/crew/model.ts:46–52. Existing qualification locks prompt bytes and the recorded model, not merely vocabulary: evals/crew/l1-lane-drift-lock.test.ts:69–94.

What settles it: preserve the historical qualification with its original scope; evaluate the expanded configuration on fresh cases before displaying that qualification on the new workflow.

D. Claim: D-7(a) preserves synthetic-only scope while shipping operator-supplied inputs, and zero egress removes the need for security review.

Why it may be false: Gap:65 introduces the provenance-controlled real-data mode that Plan:208 identifies as a constitutional change. Moving execution to a customer machine does not make processed data synthetic. Zero egress also leaves installation, filesystem access, local retention, dependency, and signing risks.

Evidence: Gap:58–69; Plan:96,117,208,261; RULES.md §4. Existing provenance labels are caller-controlled and do not alter verification: lib/packs/listings/run.ts:205–234.

What settles it: keep this pilot synthetic throughout. Treat customer deployment as a separate future decision with an executable data boundary and security assessment. The promised local deployment controls are UNVERIFIED.

E. Claim: free tiers and the budget work make the proposed live exams feasible and safely capped.

Why it may be false: the active crew generator has no budget reservation or settlement. Missing usage becomes zero in pricing. The latest decision retires the paid allowance, while the plan retains it. Also, 60 cases × three runs × 2,000 input tokens permits 360,000 input tokens before outputs, exceeding the documented 200,000-token daily allowance; fitting request/day limits is insufficient.

Evidence: lib/agents/crew-live.ts:202–224; lib/agents/pricing.ts:75–77; Gap:52–54; Plan:128; docs/decision-log.md:254–258. [Groq rate limits](https://console.groq.com/docs/rate-limits)

What settles it: enforce free-account eligibility, explicit retry limits, shared quota scheduling, and accounting for failed/unknown-usage attempts. Any credit fallback needs enforceable exhaustion behavior. Owner-account entitlements remain UNVERIFIED.

3. GAP-SHEET DECISIONS YOU DISAGREE WITH

Page 1: deterministic routing is the right choice, but “a mapping reference appears” is not evidence that the integration partner caused the problem. Route using explicit ownership rules; send unresolved responsibility to human escalation. Requalify the changed Reviewer configuration. Cost: a responsibility table, ambiguous-owner cases, and evaluation work.

Page 2: keep the deterministic explanation, but require evidence validity and appropriate abstention as gating outcomes. A correct class with fabricated receipts is unsafe verification. Citation quality is an output property, not an unnecessarily prescribed tool sequence; Anthropic’s guidance does not justify making it non-gating. [Anthropic evaluation guidance](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)

The “baseline must fall to chance” test should instead require unknown when evidence is insufficient. Add conflicting events, incomplete logs, and independently authored labels. At eight successes in ten cases, the calculated 95% Wilson lower bound is approximately 0.49: retain the smoke-scale label. Cost: stronger fixtures and grading; leave the LLM seat DEFER.

Page 3: remove the real-export phase and new operator-supplied mode from this pilot. “Theirs are theirs” does not settle the repository’s own processing and artifact obligations. Cost: deferred customer-data validation; no infrastructure spending.

Page 4: keeping the small fixture first is reasonable. Change the arithmetic contract before implementation: count each order once, allocate refunds explicitly, and distinguish historical association from prospective exposure. Add multi-line/multi-finding orders immediately. Cost: a small schema clarification and focused tests; retain realistic alert-volume testing before showing scale claims.

Page 5: retaining the old composition lock is valid if its legacy corpus remains separate. It does not qualify the expanded workflow. Add end-to-end integration cases and a replay manifest binding input, prompt, model, rule, and roster versions. A prevHash chain also needs a trusted checkpoint to detect truncation or wholesale rewriting. Cost: integration tests and local checkpoint/state handling. Freeze shared interfaces before parallel implementation.

4. WHAT BOTH RESEARCH PASSES MISSED

• Duplicate-ID boundary inconsistency. CLI/MCP catalog parsing checks only that items exists; reference indexing silently overwrites duplicate variation IDs. An offline probe with two records sharing one ID at $10/$20 and a $20 feed returned PASS. The browser already rejects catalog duplicates. This can produce false verification and partner attribution. Evidence: lib/packs/listings/cli.ts:42–45; reference.ts:41; run.ts:77–79.

• Timestamp representation changes verdicts. String comparison classified an expiry 100 milliseconds in the future as expired; an actually expired timestamp with a +02:00 offset passed. Invalid feed dates also passed. Canonicalize and validate instants across every ingestion path. Evidence: lib/packs/listings/detectors.ts:175,205.

• SDK retry amplification. The crew omits maxRetries. An offline transport stub produced three requests; maxRetries:0 produced one. Wrapper-call tests miss this behavior, affecting quota, latency, and attempt accounting. Evidence: lib/agents/crew-live.ts:217; installed node_modules/ai/dist/index.mjs:1820.

• Replay can silently use an obsolete answer. RecordedModel keys only on caseId/member. Changing a case’s ask and artifact while retaining its ID and old tool contract produced the identical trajectory and a passing safety evaluation. Bind replay to the complete scenario manifest. Evidence: lib/crew/model.ts:91–106; evals/crew/harness.ts:69–106.

• Free hosting eligibility. The decision selects Vercel Hobby, but its policy restricts Hobby to personal, noncommercial use and includes advertising a product/service within commercial usage. A sales-oriented executive pilot creates an eligibility question; applicability to this deployment is UNVERIFIED. Resolve it or demonstrate locally. Evidence: docs/decision-log.md:254; [Vercel fair-use policy](https://vercel.com/docs/limits/fair-use-guidelines).

5. HONESTY (RULES §4) EXPOSURE FOR A CEO-AUDIENCE DEMO

These sentence patterns need revision before becoming pilot-kit copy:

• “Caught … before it becomes a refund” and “root cause says why; impact says how much is at risk” present prevention and causal certainty as established behavior. Plan:104–108.

• “A human signs the fix” and pre-flight “confirms or holds” an item can imply an operational platform connection. Presently, execution records an offline decision; it changes no menu. Plan:108; lib/approvals/simulator.ts:213–227.

• “This is the design the platforms’ own risk teams will accept” implies validated acceptance. It is UNVERIFIED. Plan:243.

• “Replaced by the platform’s export on day one” implies access and an agreed pilot arrangement. Plan:116.

C10 does not enforce the entire semantic honesty promise. Offline probes showed that its eight patterns accept “Trusted by DoorDash,” “DoorDash-approved menu verification,” and “We saved merchants $108,000 per month.” Metadata and accessibility attributes are also removed from the rendered-text scan. Evidence: evals/packs/honesty-c10.test.ts:147–156,251–262.

Require human claim-to-evidence review alongside C10. Use explicit synthetic assumptions and “proposed,” “hypothesis,” and “artifact built, not sent” where warranted. No actual affiliation or prevented impact was established.

6. ORDER OF WORK

Recommended Wave 2 sequence:

1. One platform-intake conversation; settle reference authority, buyer responsibility, synthetic scope, and permitted claims.
2. Accept and verify merged Wave 1; unify ingestion validation, fix duplicate IDs/timestamps, and bind replay inputs.
3. Build deterministic routing/explanation and independently checked impact arithmetic.
4. Add signer lifecycle, durable replay protection, and checkpointed ledger.
5. Close free-tier/retry/quota controls before any live arming.
6. Build the executive walkthrough and redesigned surfaces from verified outputs; perform expanded integration and honesty review.

Cut the live LLM Root-cause exam slice for this pilot. Retain deterministic explanation and visible DEFER; revisit only after it demonstrates value beyond the baseline.

Validation: three independent read-only code audits, offline Node reproductions, twenty legacy replay safety/class checks, and approval tamper checks. Vitest collected zero tests: EPERM creating its temporary ssr directory. Full suite, build, browser demo, and live-provider behavior remain UNVERIFIED. No files edited.