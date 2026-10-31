# Blindspot pass — Menu Integrity Crew, before Wave 2 (2026-10-12)

**Provenance.** Read-only pass by a `blindspot-scout` subagent (Sonnet 5.5), dispatched by the orchestrator seat
on the owner's 2026-10-12 mandate ("you discover what is needed as well"). It read the plan of record, RULES,
README, the state-doc tops, the decision log, the research docs, and `lib/crew/{orchestrator,model,types}.ts`,
`lib/agents/crew-live.ts`, `lib/approvals/simulator.ts`, `lib/packs/listings/*`. It changed nothing.
Web sources are cited inline, fetched 2026-10-12; community/vendor sources are field signal, not proof.
Anything from memory is marked UNVERIFIED. **Orchestrator verification (same day, `rg` on main at `fac8204`):**
feasibility items 1, 2, 3 and 6 below are confirmed in the code (`lib/crew/model.ts:33-35` —
`approve | escalate` only; `lib/agents/crew-live.ts:75` — hard-coded SOR path; `lib/crew/types.ts:27` —
closed four-name union; `evals/crew/crew-composition-lock.test.ts:46` — exactly 20 cases; no orders/velocity
concept under `lib/` or `fixtures/`).

**Disposition.** Adopted as a **pre-build gap sheet gate before Wave 2** (decision-log 2026-10-12). Items that
touch slices in flight (S1-engine: feed modifier shape, claim-id convention, golden discipline) are already
bounded by that lane's contracts (bundled tally fixed; only the spec-version golden line may change).

---

## 1. What a platform pilot needs that the plan doesn't answer

Plan § 6 has a security one-pager, a data-request spec and success metrics. It has no answers to the questions below.

**Security reviewer.** Standard guidance says a SOC 2 report and a questionnaire are necessary but not sufficient
for AI vendors ([NonaSec](https://nonasec.com/resource/ai-vendor-security-review-framework),
[aiapphunters](https://aiapphunters.com/blog/how-to-evaluate-an-ai-vendor-security-procurement-checklist)).
Reviewers also ask for: a per-hop data path · named model providers and sub-processors · no-training and
retention terms · a signable DPA · a re-review trigger on any model change. The plan answers "zero egress" only
for replay mode. The two-week "platform's own exports" leg does not say where the process runs. Tier B/C live
turns send data to Groq or Google, whose free-tier content may be used for training (plan § 8). The platform's
lawyers will read that as a sub-processor. **[K]** Does the pilot's real-data leg run only on Tier D (local) and
replay? The plan never says so.

**Merchant-Ops lead.** The plan does not say: who owns a finding after the digest lands · the SLA · what
"closed" means · how a false positive is recorded · who maintains the id-mapping sheet. § 17's de-duplication
rule is the only fatigue control; no tolerance band, no severity tiering, no cap on queue size. Review-queue
guidance names the failures as single-person ownership, no definition of closed, no root-cause tags on closure
([Unpay](https://www.unpay.co/blog/exception-management-review-queues)). **[K]**

**Integrations manager.** Whether this tool needs API access they can't grant. DoorDash's Marketplace APIs are
"not yet generally available"; DoorDash says it is "at capacity" and requires an application
([developer.doordash.com](https://developer.doordash.com/en-US/docs/marketplace/overview/onboarding_requirements/)).
The plan has the pilot using "one menu export" but never says which export format or who inside the platform can
produce one. **[K]**

**Procurement.** The plan names none of: contract vehicle and pilot SOW · liability · exit and deletion terms ·
price after the pilot · the legal entity that signs · whether the vendor is the owner personally or a company.
Guidance: get no-training, retention, breach-notice and price-cap terms "in the contract, not a web page"
([aiapphunters](https://aiapphunters.com/blog/how-to-evaluate-an-ai-vendor-security-procurement-checklist)).

**The question behind all four:** why would they buy this instead of building it? The plan lists this as
unvalidated in § 3, then schedules the conversations last (Q10).

## 2. Prior art and potholes

| Failure mode in comparable pilots | Evidence | This plan's exposure |
| --- | --- | --- |
| Alert fatigue; close rates above 95 %; rules unreviewed for a year | [Constellation](https://one-constellation.com/blog/6-signs-your-transaction-monitoring-system-is-generating-too-many-false-positives/); [Tookitaki](https://www.tookitaki.com/compliance-hub/reducing-false-positives-transaction-monitoring) | **High.** `LST-HOURS-WINDOW` is a "warn" with no tolerance. A real 300-item menu produces warns constantly. Eight scenarios never test queue volume. |
| Timing breaks that should auto-close | Unpay: a timing break needs no human if the queue knows the expected window | **High.** `sync-outage` is exactly this class; the plan raises it as a human finding with no sync-window grace. |
| Ownership gaps; root-cause tag list not maintained by the operator | Unpay; [Vilfora](https://vilfora.com/insights/treasury-exception-management) | **High.** The root-cause enum has six values authored by the builder, not by Merchant-Ops. |
| Id-mapping drift | DoorDash maps stores by OAuth and `doordash_store_id`; name/address mapping is a "last resort" ([SOW docs](https://developer.doordash.com/en-US/docs/marketplace/overview/onboarding/sow/)) | **Medium.** The human-owned mapping sheet is the same pattern; nothing decides who updates it or what happens when it goes stale. |
| Eval–reality gap | MIT's pilot-to-production figures are contested ([NANDA report](https://21464181.fs1.hubspotusercontent-na1.net/hubfs/21464181/v0.1_State_of_AI_in_Business_2025_Report.pdf)); Gartner: ≥ 50 % of GenAI projects abandoned after PoC ([Gartner](https://www.gartner.com/en/articles/genai-project-failure)) | **High.** See § 3. |
| Model churn | Plan § 14: three ids changed since July | Covered by the DEFER rule; each re-exam costs an unplaced split. |
| Pilot dies at the data wall | [Trew Knowledge](https://trewknowledge.com/2026/10/05/why-so-few-ai-pilots-reach-production-and-what-the-5-do-differently/) (2026-10-05; single secondary source) | **High.** Every input here is synthetic. |

Treat the 95 % and 50 % figures as directional.

## 3. Feasibility traps — plan assumptions the code does not show

1. **The Reviewer cannot route.** `ReviewerDecision` is `approve | escalate` only (`lib/crew/model.ts`).
   `ReviewerTurnInput` carries a terminal class, a finding count, anomalies and a 400-character excerpt — never
   the findings. Plan § 5 says the Reviewer produces "route (merchant-ops/partner/compliance) + which artifacts"
   under the "agent (live-run floors cleared)" label. That label was earned on a different, closed vocabulary
   (five cases each for pick-a-tool and approve/escalate, `docs/crew-live-l1-status.md`). **Routing is a new,
   unexamined decision surface wearing an earned label.** *(Orchestrator: confirmed.)*
2. **The crew is a contracted replay.** `lib/crew/orchestrator.ts` blocks any tool call whose argument digest
   differs from `expectedToolCalls`. `lib/agents/crew-live.ts` hard-codes `SOR_CATALOG_PATH`. Eight scenarios
   with their own records cannot run the crew live without editing `crew-live.ts`; no slice's allowed-file list
   includes it. *(Confirmed.)*
3. **Adding seats collides with the pre-registered lock.** `evals/crew/crew-composition-lock.test.ts` pins
   exactly 20 cases and 5 per member; `CrewMemberName` is a closed union of four; the crew's import-walk bars it
   from importing pack types. Root-cause and Impact must arrive through a new registry tool. Appendix A forbids
   `lib/crew/**` and S2 has no file list. *(Confirmed.)*
4. **Root-cause has no inputs.** The engine compares two snapshots; `updated_at` is stamped at generation and
   never becomes a claim. No sync events, edit actors or timestamps from either side. Distinguishing
   `sync-latency` / `merchant-edit` / `platform-override` means inventing an event log in the same script that
   writes the answer; the "beats a timestamp baseline" floor is then scored against author-set labels.
5. **The floors can't carry weight at this N.** Per-class recall ≥ 0.80 over six classes and eight scenarios is
   one or two cases per class.
6. **Impact has no orders model.** No order-velocity concept in `lib/` or `fixtures/`. "Orders at risk" comes
   from a fixture not yet built. *(Confirmed.)*
7. **The "~300-item" fixture isn't a scale-up of the generator.** `generate.ts` cycles a 12-name list through a
   seeded PRNG; changing PRNG consumption changes every golden. A 300-item fixture, a 7-day series and a month
   of orders are new subsystems.
8. **Modifiers aren't in the feed.** `AcpFeedItem` has no modifier field; `modifierLists` exist only on the SOR
   side. `sorReference.resolve` keys on `<variationId>` and splits claim ids on `#`. `LST-MOD-PRICE-VALUE`
   needs a new feed shape, a claim-id convention and a UCP-schema decision.
9. **Matching is exact-id plus exact-title**, exercised only on shared synthetic ids. Whether item-level ids in
   a real DoorDash export are `merchant_supplied_id` or portal-created is UNVERIFIED.
10. **Dirty tree at wave start** — `decision-log.md` modified (orchestrator's own record; lanes run in
    worktrees from `fac8204`, unaffected).

## 4. The owner's own blindspots

| Blindspot | Cheapest evidence that settles it |
| --- | --- |
| Whether any platform reviews a vendor tool without a sponsor inside | One conversation with anyone who has run a vendor intake at a platform or sync vendor; ask what the first artifact is. |
| What "pilot" means to them: two weeks or two quarters, free or paid | Same conversation. |
| Data-handling language: signable DPA, retention, sub-processor list | Read one public AI-vendor DPA end to end; write a one-pager against its headings. |
| Support expectations when a digest is wrong at 9 am | Write the on-call line down. "None — on-demand prototype" is valid, but they must hear it before signing. |
| Demo-to-pilot conversion | Ask one operator and one integrations PM what made them stop answering vendor emails. |
| Sole-founder risk: bus factor, escrow, who maintains the rule tables | A one-paragraph continuity statement. Apache-2.0 helps; it isn't support. |
| Whether the buyer even wants an independent verifier | Interview, not build. |

## 5. Ten questions before Wave 2, with the cheapest instrument

1. **Is Reviewer-routing an unlabeled new capability?** A one-page diff of claimed vs. real Reviewer interfaces; narrow § 5 or schedule a fresh exam for routing.
2. **Can Root-cause be scored on anything but self-authored labels?** Decide the ground-truth source in a doc before S2 (a human label set by someone other than the generator, or drop the seat for the pilot).
3. **Minimum N for the Root-cause floors to mean anything?** A calculation added to the pre-registration.
4. **Where does the real-data leg run, and who is the sub-processor?** A one-page data-path diagram: replay, Tier D only, or neither.
5. **What orders data feeds Impact?** A one-page spec for the order fixture's fields, derivation and test.
6. **Which crew files does each slice own?** Add `crew-live.ts`, `crew/types.ts` and the composition lock to S1/S2's allowed files, or declare a separate lane.
7. **What does a real 300-item menu do to alert volume?** Run the current engine on a synthetic 300-item pair; count findings per 100 items and the `warn` share.
8. **How do timing breaks get a grace window?** A rule-table design note: which classes auto-close within a window.
9. **What is the mapping sheet's lifecycle?** Three mapping-fixture cases: stale entry, duplicate title, unmapped id.
10. **Should the five conversations move before Wave 2?** Write the five-question interview guide now; book one conversation this week. A single no from an integrations PM would reshape S2–S4 more than any slice review.

## Honest gaps (the scout's)

Did not run the suite or build; did not read `HANDOFF.md` / `CURRENT_TASK.md` blocks, `docs/plan-a2-trajectory-floors.md` in full, or the Uber Eats docs. UNVERIFIED from memory: item-level `merchant_supplied_id` in real DoorDash exports; any platform's named AI-vendor intake process. Practitioner voices (Reddit/X) not reachable; alert-fatigue evidence is vendor/regulator-flavored. Only confirmed: the registry has seven tools; the crew-live intake enum has six.
