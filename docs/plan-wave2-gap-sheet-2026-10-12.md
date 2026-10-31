# Wave 2 pre-build gap sheet (2026-10-12)

**Why this exists.** Two read-only passes on 2026-10-12 (`docs/research/blindspot-pass-2026-10-12.md`,
`docs/research/guidelines-adherence-2026-10-12.md`) found that plan §§ 5–7 promise capabilities the code does
not have. Under the owner's handover ("go ahead complete step by step, i am handing over to you"), the lead
closes each gap with a decision here before any Wave 2 packet is written. Each page: the decision first, then the
evidence, then what it costs. The plan of record (`docs/plan-menu-integrity-crew-2026-10-09.md`) is amended by
reference to this sheet; RULES §4 is unchanged throughout.

Facts verified in code on main @ `fac8204`: `lib/crew/model.ts:33-56` · `lib/crew/types.ts:27` ·
`lib/agents/crew-live.ts:65-75` · `evals/crew/crew-composition-lock.test.ts:46` · `lib/tools/registry.ts:125` ·
`lib/packs/listings/types.ts:17-65` · `lib/agents/budget.ts:8-26`.

---

## Page 1 — The Reviewer cannot route. Decision: routing becomes deterministic.

**Decision.** The Reviewer LLM seat keeps exactly the vocabulary its label was earned on — `approve | escalate`
(`ReviewerDecision`, `model.ts:33-35`). **Routing is not an LLM decision.** A new deterministic rule table,
`lib/crew/route.ts`, maps (trigger kind · finding categories · max severity · pack) → one of
`merchant-ops | partner | compliance` plus the artifact set, and is labeled **deterministic workflow** like Audit
and Evidence. The Reviewer sees the computed route in its input and may only approve or escalate it. Plan § 5's
Reviewer row is narrowed accordingly; the earned label survives because the exam surface is unchanged.

**Why.** The label "agent (live-run floors cleared)" was earned on five approve/escalate cases
(`docs/crew-live-l1-status.md`). Routing is a new decision surface; wearing the old label on it is exactly the
"eval theater" failure the owner named. A rule table is also what a platform ops lead can read, change through
change control, and audit — the LLM adds nothing here but risk. (Deterministic before AI, RULES §3 item 9.)

**Rule table, first cut (S2 writes the tests first):** fee pack → `compliance`, artifacts {email, ledger} ·
trigger `partner-onboarding` or any finding whose reference row cites the id-mapping sheet → `partner`,
artifacts {partner-ticket, slack} · everything else → `merchant-ops`, artifacts {slack, email}. Any `escalate`
from the Reviewer, any injection anomaly, any Tier-2/3 request → `human-escalation` regardless of table.

**Cost.** ~80 LOC + a table test; no exam; no split burned.

## Page 2 — Root-cause has no inputs and no honest ground truth. Decision: deterministic explanation ships; the LLM seat is DEFER until an exam of real size.

**Decision.** S2 builds **`explain_drift`, a deterministic timestamp/actor baseline** exposed as a registry tool,
and that is what the pilot shows under "why". The **LLM Root-cause seat renders DEFER on its face** until it has
sat a pre-registered exam with **≥ 10 cases per class** (6 classes → ≥ 60 cases), scored on the *class* only
(evidence-citation is a secondary, non-gating score, per Anthropic's outcome-over-path guidance), with a
**Wilson lower bound reported** and the label "smoke-scale, n = 10/class". That exam is S5 and owner-armed.

**Ground truth.** The engine compares two snapshots; nothing in the fixture records *why* they differ
(`updated_at` is stamped at generation, never a claim). So the scenario generator gains an **event log**
(`inputs/events.jsonl`: `{at, actor: merchant|integrator|platform|unknown, action: price_edit|86|un86|sync|override, target}`)
that is **evidence given to both the baseline and the seat**, while the class is the hidden label. **Leak test:**
with `events.jsonl` stripped, the baseline must fall to chance; with the class field present anywhere in the
inputs, the test fails. This closes the forward-leakage gap.

**Cost.** Baseline ~120 LOC + fixture field + 2 tests in S2. Exam cost in S5: 60 cases × K=3 on Groq free tier
(~$0; fits RPD 1K); input must be pre-summarised deterministically to ≤ 2K tokens (TPM 8K) — that summariser is
also the Root-cause seat's **input contract** (closes the quarantine gap: findings + events only, no raw text).

## Page 3 — Where the real-data leg runs. Decision: D-7(a); the data path is one diagram with three modes.

**Decision (applied 2026-10-12, decision-log).** Three modes, and the pilot kit states which is in force:
- **Site** — replay only; everything in the browser; zero egress proven by import teeth. No sub-processor.
- **CLI / MCP, synthetic** — replay by default; Tier B (Groq) / Tier C (Google) only when owner-armed on
  scenario data. **Sub-processors named in the security one-pager: Groq, Google**, with the free-tier
  training terms quoted and the statement that only synthetic data ever reaches them.
- **Inside the platform's environment, on its own exports** — the platform runs the tool; Tier A (replay) or
  Tier D (Ollama, local) only; **no sub-processor; this project never receives the data.** The banner there is
  the platform's own provenance label, which S3's `inputProvenance` field (`synthetic | operator-supplied`)
  selects — RULES §4 holds because *our* artifacts remain synthetic; theirs are theirs.

**What this closes.** The RULES §4 contradiction; the "who is the sub-processor" question; the SOC-2-is-not-enough
list (per-hop data path · providers named · no-training/retention terms · re-review trigger on model change —
the last is the existing DEFER rule, now written in the register).

## Page 4 — Impact has no orders model. Decision: a seeded orders fixture on the existing 12-item restaurant first; the 300-item fixture waits for Wave 3 with alert volume as its test.

**Decision.** `fixtures/synthetic-restaurant/orders.jsonl` — 30 days, seeded, generated by the existing fixture
script family: `{order_id, placed_at, channel: app|agent, lines: [{variation_id, modifier_option_ids[], qty,
unit_price_cents_charged}], status: fulfilled|refunded|cancelled, refund_cents, reason: menu|other|none}`.
**Impact arithmetic (deterministic seat, labeled simulated):** orders at risk = orders in the window whose
lines touch a finding's variation/option · refund exposure = Σ `refund_cents` on those lines where
`reason = menu` · agent-cancel exposure = `agent`-channel orders on `soldout_86`/hidden items · error-charge
exposure = refund exposure × a declared share, named as an assumption in the output. **Test:** every figure the
seat emits is recomputed from the jsonl by the test; the fixture is freeze-locked.

**Deferred, with its own test.** The ~300-item / 7-day fixture is a new generator (the current one cycles a
12-name list; changing PRNG consumption moves every golden). It becomes **Wave 3** with the success criterion
the blindspot pass asked for: *findings per 100 items and the `warn` share at realistic drift rates*, so alert
fatigue is measured before the pilot, not after. Until then, `LST-HOURS-WINDOW` (S1) carries a tolerance band
parameter and the sync-window grace rule is a documented rule-table row (closes the "timing breaks should
auto-close" pothole).

## Page 5 — File ownership for S2 and S3 (so no lane edits an unowned lock).

| Concern | Files | Owner lane |
| --- | --- | --- |
| Roster widening | `lib/crew/types.ts` (`CrewMemberName` + `root-cause`, `impact`) · `lib/crew/model.ts` (new turn-input/decision types) · `lib/crew/orchestrator.ts` | S2-crew |
| **Pre-registered lock stays byte-intact** | `evals/crew/crew-composition-lock.test.ts` is **not edited**; a new `crew-composition-lock-s2.test.ts` pins the new members' cases separately | S2-crew |
| Live crew de-hardwiring | `lib/agents/crew-live.ts` (`SOR_CATALOG_PATH` → scenario parameter; `CREW_LIVE_TOOL_NAMES` + `explain_drift`, `size_impact`) · `evals/crew/crew-live-fetchers.test.ts` | S2-crew |
| New registry tools | `lib/tools/registry.ts` · `lib/mcp/descriptions.ts` · `lib/mcp/server.ts` | S2-crew |
| Route table | `lib/crew/route.ts` (new) + test | S2-crew |
| Ledger | `lib/ledger/**` (JSON-lines, `prevHash` chain, `diff`) · `signers.json` registry + revoke rule | S2-ledger |
| Budget truth | `lib/agents/budget.ts` post-call overflow stop + cumulative ledger · `pricing.ts` $0 rows for Groq/Ollama ids + RPD/TPD counters | S2-ledger |
| Orders fixture + Impact | `scripts-ts/generate-orders.mts` · `fixtures/synthetic-restaurant/orders.jsonl` · `lib/crew/seats/impact.ts` | S2-impact |
| Platform-shaped adapters | `lib/packs/listings/adapters-platform/**` · `inputProvenance` field · **ingest allow-list (drop by default) + planted-customer-field test** | S3 |
| Injection hardening | `lib/crew/injection-scan.ts` NFKC + multilingual/Base64 fixtures in scenario 8 | S3 |
| Honesty surface | every new doc, page and adapter **named in C10's explicit list** (`app/pilot/page.tsx` included) | the lane that creates the file |

**Wave 2 lanes and seats** (model rule 2026-10-12: cheapest with proven-equal output; judgment on Opus/Sonnet 5.5):
S2-crew (Opus 5.5 — roster, route table, de-hardwiring, baseline) ∥ S2-ledger (Sonnet 5.5 — ledger, signers,
budget truth) ∥ S2-impact (Sonnet 5.5 — orders fixture + arithmetic) ∥ S3 (Opus 5.5 — adapters, ingest rule,
injection hardening, C10 probes) ∥ **exec-layer** (Sonnet 5.5 — executive brief + 5-minute walk; `/pilot`
derived figures) ∥ **ci-hygiene** (calibration lane: Composer 2.5 vs Sonnet 5.5 on the same brief — `npm audit
--omit=dev` + CycloneDX SBOM as CI artifacts, prune `@huggingface/transformers`, `.env.example` re-headed).
Sequential at wave open: unify `generate-scenarios(-s1).mts` and `scenarios(-s1).test.ts`; flip
`UCP_PINNED_VERSION` with its golden regeneration explained line by line.

**Owner-only items still open:** D-4 (auto-deploy) · D-6 (`sysctl -n hw.memsize`) · one validation conversation
before S4 (interview guide drafted on request) · the production deploy at each wave close.
