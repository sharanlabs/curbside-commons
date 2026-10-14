# Success metrics — pre-registered

**Type:** reference · **Audience:** the pilot's sponsor, its analysts and its risk reviewers · **Written:** 2026-10-12, Wave 1 / S4-docs · **Contract:** plan §§ 6, 7, 16, 17 (`docs/plan-menu-integrity-crew-2026-10-09.md`); D-7(a) (`docs/decision-log.md`, 2026-10-12).

## The answer first

This page fixes **what will be measured, how, and by whom, before the pilot runs.** Every threshold below reads **"TBD at pilot start — set before the first run"**. The rule is simple: floors are written and dated before the first run, and they do not move afterwards, in either direction. **Adoption and workflow metrics (§4)** decide "expand" or "stop" in this pilot. **M1** is the one pre-registered business number for a later platform deployment; it is **not scored inside this pilot**. Everything else is secondary and is labeled exploratory unless declared otherwise.

*In plain words:* we write down the scoreboard and the pass mark before the game. If we later disliked the score, we would not be allowed to change the pass mark.

## What this page is not claiming

- **No metric here has been measured.** Nothing below is a result. No number is a measurement of any platform.
- **Synthetic throughout this pilot.** The scenario library measures whether the workflow works. The business number below (M1) is **post-pilot, platform-measured — not scored inside this pilot**; it is what a platform would track with its own instruments after a separate deployment decision.
- **"Shaped like the public integration docs, not from the platform."** No affiliation, partnership, endorsement or access is claimed or implied.
- Human-led, AI-assisted, professionally reviewed (`RULES.md` §4). United States only.

## 1 · Pre-registration protocol

The fields follow the pre-registration guidance cited in plan § 16 (arXiv 2606.11217, as recorded by the plan; not re-read by this lane).

| Field | Rule |
| --- | --- |
| **Freeze** | This page is dated and frozen at pilot start, **before the first run**. The freeze date and the signer are entered below. |
| **Floors** | Every floor is "TBD at pilot start — set before the first run" until frozen. After the freeze, a change is a new, dated version beside the old one, never an edit. |
| **Cohort** | Named at pilot start: the merchants, the stores, the date range. **TBD at pilot start — set before the first run.** |
| **Baseline window** | The period before the pilot, measured with the platform's own instrument. **TBD at pilot start — set before the first run.** |
| **Confirmatory or exploratory** | Adoption and workflow metrics (§4) are **confirmatory** for this pilot. M1 is **confirmatory for a later deployment only** (not scored here). All other metrics are **exploratory** unless declared confirmatory before the freeze. |
| **Model and prompts** | The model id, prompts, parameters and floors for any model seat that runs are pinned in `docs/model-risk-register.md` before the first run. A seat on a model with no passed exam renders DEFER and is excluded from any score. |
| **Exclusions** | A refused or malformed model output is recorded and excluded by a rule written before the run. It is not retried silently. |
| **Decision thresholds** | "Expand" and "stop" are defined from the floors below (see § 5). |

## 2 · The primary metric (confirmatory)

| ID | Metric | Definition | Instrument | Direction | Floor | Computed by |
| --- | --- | --- | --- | --- | --- | --- |
| **M1** | **Menu-data-caused order-error adjustments per 1,000 orders** (post-pilot, platform-measured — **not scored inside this pilot**) on a cohort, versus its baseline window | The count of order-error adjustments whose reason is menu data (price, modifier, availability, description), divided by orders in the window, times 1,000, with the refund dollars behind them reported beside it | The platform's own order-error report (the baseline instrument; plan § 7) | Lower is better; reported as a reduction versus baseline | **TBD at pilot start — set before the first run** (documented for a later deployment; not a pilot score) | The platform, with its own instruments after a separate deployment |

**Why a rate and not a count.** Order volume moves week to week. A per-1,000-orders rate can be compared across windows.

## 3 · Secondary tangible metrics (exploratory)

| ID | Metric | Instrument | Direction | Floor |
| --- | --- | --- | --- | --- |
| **M2** | Refund dollars behind menu-data adjustments, per merchant-month | The platform's order-error report | Lower | TBD at pilot start — set before the first run |
| **M3** | Dispute volume and handling minutes per merchant-month | The platform's dispute queue and its own time records | Lower | TBD at pilot start — set before the first run |
| **M4** | Agent-order cancellation rate on **flagged** versus **unflagged** items | The platform's agent-order records | Flagged below unflagged | TBD at pilot start — set before the first run |
| **M5** | Time to detect drift, from the change to the finding | Timestamps in the run ledger against the platform's change records | Lower | TBD at pilot start — set before the first run |
| **M6** | Partner-enforcement hours per partner-quarter | The platform's own time records | Lower | TBD at pilot start — set before the first run |

## 4 · Adoption and workflow metrics (exploratory)

Measured, not assumed (plan § 17). They sit beside the business number so that a good M1 with an unused tool, or an unused M1 with a busy tool, is visible.

| ID | Metric | Instrument | Floor |
| --- | --- | --- | --- |
| **A1** | Digests opened versus acted on | Ledger and the platform's channel records | TBD at pilot start — set before the first run |
| **A2** | Proposals signed, withdrawn and expired | Ledger (ARRIVES S2) | TBD at pilot start — set before the first run |
| **A3** | Time to acknowledge a finding | Ledger | TBD at pilot start — set before the first run |
| **A4** | Which role uses which artifact | Ledger | TBD at pilot start — set before the first run |
| **A5** | Repeat alerts on an unchanged finding (the alert-fatigue guard) | Ledger | TBD at pilot start — set before the first run |

## 5 · Safety guardrails (stop conditions, not scores)

Any one of these, at any time, stops the pilot. They are not traded against M1.

| ID | Condition | How it is detected |
| --- | --- | --- |
| **G1** | An action executed without a signed approval | The ledger and the approval checks |
| **G2** | Real platform data was ingested into a run this project controls | By design excluded; synthetic throughout this pilot |
| **G3** | A prompt-injection changed a verdict | The injection tripwire and the engine's report hash |
| **G4** | A seat shown with a label it has not earned | The register against the on-screen label |

**Decision rule.** **Expand** if the adoption and workflow metrics (§4) clear their frozen floors **and** no G condition fired. **Stop** if those floors miss at the end of week 6 **or** any G condition fires. M1 is recorded for a later platform deployment; it is not scored inside this pilot.

## 6 · Phase 1 checks (the scenario library)

Phase 1 measures whether the workflow behaves, not whether a platform benefits. These are deterministic and are held by tests, so they are not typed here.

- **Every planted drift is caught,** and each scenario's expected report equals a live engine run. The scenario tests hold this (they arrive with the Wave 1 scenario lanes and S1–S3).
- **Every figure a reader sees is derived** from fixtures, not typed. The bundled-pair tally lives in `lib/landing/test-guide.ts` and `evals/packs/test-guide.test.ts` holds it equal to an engine run.
- **Alert volume.** Findings per 100 items and the share that are warnings at realistic drift rates are measured before the pilot (a Wave 3 item in the gap sheet, page 4), so alert fatigue is a known number and not a surprise.

## 7 · Intangible effects (not scored)

Merchant trust and retention · a recordkeeping trail that points toward what the NYC fee-cap docket and the FTC inquiry ask for · credibility on agent surfaces · position when the UCP food schema lands. These are named so the sponsor can discuss them. They carry no floor.

## 8 · Freeze record

| Item | Entry |
| --- | --- |
| Frozen on | TBD at pilot start — set before the first run |
| Signed by (platform) | TBD at pilot start — set before the first run |
| Signed by (project owner) | TBD at pilot start — set before the first run |
| Cohort | TBD at pilot start — set before the first run |
| Baseline window | TBD at pilot start — set before the first run |
| Model seats in play and their register rows | TBD at pilot start — set before the first run |

## Sources and dates

Plan §§ 6, 7, 16, 17 (2026-10-09); gap sheet pages 2 and 4 (2026-10-12); `docs/decision-log.md` 2026-10-12. The derivation pattern is `lib/landing/test-guide.ts` with `evals/packs/test-guide.test.ts`.
