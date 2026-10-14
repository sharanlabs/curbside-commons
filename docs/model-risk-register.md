# Model-risk register — which seat has sat its exam, on which model

**Type:** reference · **Audience:** a platform's model-risk and engineering readers · **Written:** 2026-10-12, Wave 1 / S4-docs · **Contract:** `docs/plan-menu-integrity-crew-2026-10-09.md` §§ 5, 8 as amended by `docs/plan-wave2-gap-sheet-2026-10-12.md` (page 2) and the 2026-10-12 free-only gate in `docs/decision-log.md`. `RULES.md` wins.

## The answer first

Every model-driven seat in the crew carries a label, and **the label belongs to a pair: (seat, model).** A seat earned its label on one model, on an exam whose passing floors were written down before the run. Run the same seat on a different model and the label does not travel: the seat renders **DEFER** on its face until the pair sits a fresh exam. This register is the table that records which pairs have.

*In plain words:* a driver's license is for one kind of vehicle. If we swap the engine for a different one, we do not assume the old license still applies. We test again, and until then the screen says "DEFER".

**What the register records, and only that.** Each row is filled from what the repo itself records (exam documents, frozen answer files and their lock tests). Where nothing is recorded, the row says NOT EXAMINED. No exam date is invented.

## What this document is not claiming

- All exam data is **synthetic**: invented merchants, menus and fee lines. A cleared floor says how a model did on a small, invented, pre-registered test. It says nothing about any real platform's data.
- **No affiliation, partnership, endorsement, access or real-world impact is claimed.** Nothing here was measured on, or supplied by, any platform. Platform-shaped scenario inputs are "shaped like the public integration docs, not from the platform."
- A small exam is a floor check, not a general robustness claim. The record of each exam states its own size; this register does not enlarge it.
- Human-led, AI-assisted, professionally reviewed (`RULES.md` §4).

## State words

| State | Meaning | What the seat's face shows |
| --- | --- | --- |
| **CLEARED** | The pair sat a pre-registered exam and met every floor. | The earned label, named for that model only |
| **DEFER** | The pair sat an exam and a floor was missed, or the label is capped by policy. | DEFER |
| **NOT EXAMINED** | No exam is recorded for the pair. | DEFER (a seat on a model with no passed exam renders DEFER) |

## 1 · The crew's model-driven seats

Owner of every row: the **project owner** (build side). The platform-side owner is assigned at pilot start. The "version / pin" column names the model id the repo uses. No provider build number or revision is recorded in the repo for any hosted id, so none is claimed.

| Seat | Model | Version / pin | Floors | Last exam date | Owner | State |
| --- | --- | --- | --- | --- | --- | --- |
| **Intake** | Groq-hosted `openai/gpt-oss-120b` | Unpinned hosted id (`DEFAULT_CREW_LIVE_MODEL` in `lib/agents/crew-live.ts`; `CREW_LIVE_MODEL` overrides) | 100 % safety and ≥ 90 % class-match, which is 5 of 5 at N = 5 (`docs/plan-a2-trajectory-floors.md` §§ 3, 4, 6, as run in `docs/crew-live-l1-status.md`) | 2026-07-07 US Eastern (the run began 2026-07-08T02:13Z) | Project owner | **CLEARED** on this model only |
| **Reviewer** | Groq-hosted `openai/gpt-oss-120b` | Same as Intake | Same floors; the exam surface is **approve or escalate** and nothing else | 2026-07-07 US Eastern (same run) | Project owner | **CLEARED** on this model only, on approve and escalate only |
| **Root-cause** | None chosen | None | Plan § 5: per-class recall ≥ 0.80 · zero unsafe class flips across K = 3 · beats the deterministic explain-drift baseline. Gap sheet page 2: **at least 10 cases per class (six classes, so at least 60 cases)**, scored on the class only, a Wilson lower bound reported, labeled "smoke-scale, n = 10/class". Floors are committed before any live turn. | None recorded | Project owner | **NOT EXAMINED** (seat arrives in S2; exam is S5 and owner-armed) |

**Seats with no model, which therefore carry no row:** Audit, Evidence, Impact, Route and Explain-drift are deterministic code. Their correctness is held by tests, not by an exam, and the gap sheet labels the last two "deterministic workflow". The Reviewer sees the route table's output and may only approve or escalate it, so the earned label has not been widened.

**On the Intake and Reviewer exam.** Twenty cases, one pass, no retries, a held-out split that is now **exposed and may never be re-scored**. Every raw model turn is frozen in the repo, and `evals/crew/l1-live-lock.test.ts` re-derives the results on every suite run. The derived records were recomputed on 2026-07-24 when a deterministic injection scan was added; the floors still clear and the label is unaffected (`docs/crew-live-l1-status.md`). One of the reviewer's five cases measures containment rather than judgment, as that document records.

## 2 · Other model-driven lanes in the active code

| Lane | Model | Version / pin | Floors | Last exam date | Owner | State |
| --- | --- | --- | --- | --- | --- | --- |
| **Fee-line classifier** (advisory only: leads, never a verdict) | Groq-hosted `openai/gpt-oss-120b` | Unpinned hosted id (`DEFAULT_FEE_CLASSIFIER_MODEL` in `lib/agents/fee-classifier.ts`) | Six floors written before the run: accuracy at least 20 of 21 and strictly above the deterministic baseline; macro precision ≥ 0.85; per-class recall ≥ 0.70, and ≥ 0.80 on two named classes; flip rate ≤ 0.15 at K = 3; macro Cohen's κ ≥ 0.60 | 2026-07-09 (`docs/fee-classifier-recalibration-status.md`) | Project owner | **CLEARED**, label "calibrated (fresh held-out, pre-registered floors, one pass)" |

The classifier's first attempt on 2026-07-05 missed one floor and **stays on the record as a miss**; the bar did not move, and the second exam used a fresh split (`docs/fee-classifier-calibration-status.md`). Both splits are exposed and never re-scorable. The classifier's output is held in a separate advisory list and cannot flip an engine verdict.

## 3 · Candidate models — none has sat an exam for any seat

The model tiers are as plan § 8 fixes them (verified by the plan on 2026-10-09; **this lane did not re-verify them**, and plan § 8 says to re-verify at use-time under `RULES.md` §6). Under the 2026-10-12 free-only gate, only free tiers and free local models are named.

| Tier | What | Cost | When |
| --- | --- | --- | --- |
| **A · Replay** (default) | Recorded model turns committed per scenario; the crew evals already run this way | $0, offline, deterministic | Every showcase; CI; the public site |
| **B · Hosted open-weight** | Groq free tier (no card): `openai/gpt-oss-120b` (the seats' floors were earned here), `gpt-oss-20b`, `qwen/qwen3.8-27b`; 30 RPM · 1K RPD · 8K TPM · 200K TPD | $0 | Live run of a seat; new exams |
| **C · Google AI Studio free tier** (cross-family judge or alternate drafter) | Free input and output; content may be used by Google, so synthetic data only. Model ids: see `lib/agents/pricing.ts` (another lane is re-pinning them this wave, so none is written here). The owner's Google Cloud credit via Vertex is a fallback only if free-tier limits bite, as a credit and never a charge. | $0 | Cross-family checks; a second drafter for consistency runs |
| **D · Local open-weight** | Ollama with JSON-schema `format`, temperature 0: `gpt-oss:20b` (same family as Tier B, so floors transfer only with a re-exam) or `qwen3:8b`. The owner picks by machine memory (plan decision D-6, open). | $0, air-gapped | The "runs inside your environment" story; offline live runs |

| Candidate model | Intake | Reviewer | Root-cause | Fee-line classifier |
| --- | --- | --- | --- | --- |
| `gpt-oss-20b` (Tier B) | NOT EXAMINED | NOT EXAMINED | NOT EXAMINED | NOT EXAMINED |
| `qwen/qwen3.8-27b` (Tier B) | NOT EXAMINED | NOT EXAMINED | NOT EXAMINED | NOT EXAMINED |
| Google free-tier models (Tier C; ids in `lib/agents/pricing.ts`) | NOT EXAMINED | NOT EXAMINED | NOT EXAMINED | NOT EXAMINED |
| `gpt-oss:20b` local (Tier D) | NOT EXAMINED | NOT EXAMINED | NOT EXAMINED | NOT EXAMINED |
| `qwen3:8b` local (Tier D) | NOT EXAMINED | NOT EXAMINED | NOT EXAMINED | NOT EXAMINED |

A seat run on any model in this table renders **DEFER on its face**. The Tier D smoke run on the owner's machine arrives in S5.

**Replay and labels.** Tier A plays back turns that a named model produced. The label that applies to a replayed run is the label of the model that produced the turns. *This is this lane's reading of plan § 8; it is confirmed when scenario turns exist (S2).*

## 4 · The re-exam rule

A seat's label is per (seat, model). **Changing the model means a fresh pre-registered split**, and the rule has five parts:

1. The split is **generated from the scenario library, never reused.** A previously exposed split is burned.
2. The **floors are committed before the run.** They do not move afterwards, in either direction.
3. The **raw model turns are frozen** into the repo as they arrive.
4. The **score is re-derivable** from the frozen turns, and a lock test re-derives it on every suite run.
5. Until the pair passes, the seat renders **DEFER on its face.**

The exam is owner-armed: live models are never reached from the public site.

## 5 · Live-path controls, stated as they are

| Control | State today |
| --- | --- |
| **Budget cap** | A **pre-call estimate**: it reserves a conservative cost before a call and refuses the call if the cap would be breached (`lib/agents/budget.ts`). It is a fail-closed best-effort bound and not a provider-enforced quota. **No active non-legacy driver is wired to it today.** The paired **post-call overflow stop**, which halts a run when a call bills above its reservation, exists only in the archived legacy orchestrator and **must be re-implemented before any live arming** (`lib/agents/budget.ts` header). The re-implementation is planned in S2 (budget truth, gap sheet page 5). |
| **Free-only gate** | Owner word 2026-10-12: Groq free tier, Google AI Studio free tier, local models, no paid tier. The old dollar allowance is retired. The guard remains as a fail-safe. |
| **Injection tripwire** | A deterministic scan runs before any model turn (`lib/crew/injection-scan.ts`). Hardening for Unicode normalization and for multilingual and Base64 payloads arrives in S3. |
| **Report-hash pin** | When a model touched a run, the report hash is pinned so a recommendation cannot be re-attributed to a different verdict. |
| **Eval-locks** | Frozen raw turns and lock tests re-derive every earned label on every suite run. |
| **Live arming** | `ENABLE_LIVE_AI` plus a key, set by the owner for one demonstration. Off in the public deployment. |

## 6 · Provider-drift risk

**The Groq model ids above are unpinned hosted ids.** A hosted id can change behavior, or disappear, without a change in this repo. Three consequences are stated plainly:

- The label on an **unpinned** hosted id is a statement about the model **as it answered on the exam date**. Replay (Tier A) is what keeps a showcase stable; a live run is a fresh draw from a provider that can move.
- The mitigation in the plan is a **provider canary** (a small fixed probe run before a live demonstration, comparing against the frozen answers). It arrives in S5 and is **not built today**.
- Model churn has already happened: three model ids changed under this project between July and October 2026 (plan § 14). The register makes the resulting DEFER visible instead of silent.

Rate ceilings on the free tiers (Tier B figures above) also bound how large an exam can be. The root-cause exam's input is pre-summarised deterministically to fit the per-minute token window (gap sheet page 2).

## 7 · Maintenance

- **When a row changes:** a model id change, a new exam, or a floor miss. Update the row, the date, the state and the evidence link in one reviewed change. Do not edit an earlier exam record; add a new row beside it.
- **Who fills it:** S5 owns the filling (plan § 12). Rows marked NOT EXAMINED stay that way until an exam is recorded.
- **Where evidence lives:** the status documents named in each row, the frozen turns under `evals/`, and the lock tests that re-derive them.

## Sources and dates

- Plan § 8 (2026-10-09) for the tiers and free-tier ceilings, not re-verified by this lane.
- `docs/crew-live-l1-status.md` (intake and reviewer exam, 2026-07-07/08, derivation note 2026-07-24).
- `docs/fee-classifier-recalibration-status.md` and `docs/fee-classifier-calibration-status.md` (2026-07-09 and 2026-07-05).
- `lib/agents/budget.ts`, `lib/agents/crew-live.ts`, `lib/agents/fee-classifier.ts`, `lib/crew/injection-scan.ts` at commit `fac8204`.
- Free-only gate and provider canary: `docs/decision-log.md` 2026-10-12.
- Models that belonged to the pre-pivot activation module (an earlier judge, strategist, router and drafter) live under `legacy/activation/`. They are not in the crew's runtime path and carry no row here; their status documents remain in `docs/` for provenance.
