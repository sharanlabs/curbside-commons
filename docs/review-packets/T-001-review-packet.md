# T-001 Review Packet

A concise, self-contained packet for Codex adversarial review (and ChatGPT). Full detail: `docs/v1-data-dictionary.md` and `docs/v1-slice-plan.md`.

Task: **T-001 — plan the V1 offline thin slice.** This is a *plan review*, not a code review. No product code exists yet.

## Plan summary

Build the smallest credible offline workflow on the 20-row dummy CSV: ingest read-only → normalize to `out/merchants_v1.csv` → recompute risk → deterministic blocker diagnosis → human review queue → one stubbed structured draft behind guardrails → simulated send with idempotency → two append-only audit logs. Acceptance criteria are 18 tests (T1–T18, including a send-gate test and per-category guardrail fixtures). No external services, no credentials, no real sending.

## Key assumptions

1. The risk formula `2*days + 3*last_login + 10*(5−steps)` reproduces the source score on all 20 rows (verified). The 20 rows over-determine it, so recomputing + validating it is genuine.
2. Risk-level thresholds are **under-constrained** (only 2 Medium rows, both 69; gaps 48→69 and 69→89). We therefore **carry the source `risk_level` as authoritative** and treat `thresholds.v1 {Low<50, Medium 50–79, High≥80}` as a documented assumption used only for a consistency check and future unseen data.
3. The onboarding step order (business-verify → menu → photos → hours → bank → final) is recovered from the source nudge messages (verified on all 20 rows).
4. Contacts/consent do not exist in the source; `merchants_v1.csv` seeds **labeled-synthetic** contact defaults and invents **no** opted-out/suppressed merchants. Ineligibility routing is exercised by test fixtures.
5. `merchant_id` = `M001..M020` by source row order (stable for this fixed dataset).
6. The stubbed generator makes the guardrail pass by construction; guardrail strength = the planted + real cases fed to it.
7. Send-eligibility is gated separately from contact-eligibility: review-required/High merchants are held (`approval_state=pending_review`) and are never auto-sent; approval comes only from a synthetic fixture in V1 (no human UI).

## V1 scope (in)

Ingest/normalize; derived timestamps; recomputed risk_score + carried risk_level + reason codes; blocker + next-best-action; review queue; **contact-eligibility separate from send-eligibility, with an `approval_state` gate** (review-required/High merchants are held, never auto-sent); one stubbed `draft.v1` JSON; forbidden-claims + state-consistency guardrail (6 categories); `model_runs.csv` + `audit_log.csv`; idempotent simulated send; tests **T1–T18**. Store = one entity CSV + two append-only logs.

## Out of scope

Live Supabase/n8n/Slack/Resend/Gemini; real credentials; real contacts/consent; real sending; per-step statuses/timestamps; delivery webhooks; outcome learning; cost ledgers; dashboards; 14-table schema; multi-channel; autonomous/agentic tool use.

## Known risks

- Thresholds are not validated by the data; the honesty of the T5 framing is load-bearing for the project's credibility.
- A stubbed generator cannot prove the guardrail is robust; real adversarial cases are deferred to the live-Gemini stage.
- `merchant_id` by row order shifts if the source row order changes (acceptable for a fixed file; flagged).
- CSV-as-store has no constraints; idempotency is enforced in code, not by the storage layer.
- Over-documentation risk: keep V1 to the agreed scope; do not add tables or fields "just in case."

## Proposed files

Plan/spec (this task): `docs/v1-data-dictionary.md`, `docs/v1-slice-plan.md`, `docs/review-packets/T-001-review-packet.md`.
Implementation task (later): `scripts/` (Python), `tests/` (+ `tests/fixtures/`), and generated `out/merchants_v1.csv`, `out/model_runs.csv`, `out/audit_log.csv`, optional `out/review_queue.csv`.

## Proposed checks / tests

T1 source unchanged · T2 header fixed · T3 unique IDs · T4 risk_score == source · T5 threshold consistency (caveated) · T6 timestamps · T7 blocker mapping · T8 review queue counts · T9 draft schema · T10 guardrail catches planted bad draft · T11 guardrail over 20 real nudges → 0 flags · T12 draft state-consistency · T13 idempotent send · T14 determinism · T15 eligibility routing (fixture) · T16 dictionary validation · **T17 send gate (review-required/High never sent without synthetic approval)** · **T18 guardrail under-flag coverage (one negative fixture per category)**.

## Questions for Codex adversarial review

1. Is carrying source `risk_level` (while recomputing `risk_score`) the right call, and is the T5 "consistency not correctness" framing honest and sufficient?
2. Is the forbidden-claims list (revenue guarantees, unsupported metrics, state mismatch, false authority, PII) adequate without over-flagging the 20 real nudges (T11)?
3. Is the idempotency key (`merchant_id:blocker:template:as_of_date`) enough to prevent duplicate simulated sends?
4. Is one entity CSV + two append-only logs right for V1, or is SQLite already justified?
5. Is putting synthetic ineligibility in fixtures (not product output) the correct separation?
6. Is `merchant_id` by row order acceptable, or is a content-hash ID worth it now?
7. Any scope creep, missing edge case, or missing test?

## Codex adversarial review — round 1 (2026-06-01)

Verdict: **needs-attention / NO-SHIP** (job `review-mpw2j628-ncd4my`). Two findings, both accepted and fixed in this revision:

- **[high] Review-required merchants could reach `simulated_send` with no approval gate.** The plan routed High-risk merchants to review but then sent any *contact-eligible* drafted merchant, with no test proving High/review-required rows are blocked — defeating the human-review control the slice exists to prove.
  - **Fix:** separated `contact_eligible` from `send_eligible`; added `approval_state` (`not_required`/`pending_review`/`approved`/`rejected`); `send_eligible = contact_eligible AND (review_required=false OR approval_state=approved)`; `simulated_send` only when `send_eligible`. Approval comes only from a synthetic fixture in V1. Added **T17** (review-required/High never sent without explicit approval). See data dictionary §7.1.
- **[medium] Guardrail tests proved over-flagging + one planted case, not under-flagging across categories; regex alternation ambiguous in a Markdown table.**
  - **Fix:** moved patterns into a fenced code block; added an `aggressive_urgency` category (now 6); bound numeric/percentage patterns to revenue/performance context so onboarding-progress percentages don't false-positive (keeps T11 green); added **T18** (one negative fixture per category). See data dictionary §9.

Codex's other answers were confirmations, carried as-is: carry source `risk_level` (Q1), CSV + two logs (Q4), fixtures-not-product (Q5), row-order IDs with hash assertion (Q6). Idempotency (Q3) was "OK only after the review-gate fix" — now closed.

Remaining (accepted, deferred — not blockers): thresholds and guardrail robustness cannot be fully validated on 20 rows with a stub; both are explicitly caveated and revisited when live Gemini lands.

## Final recommendation

The revised plan addresses both Codex findings with concrete schema + tests (T17, T18) and keeps scope unchanged (still one entity CSV + two append-only logs, still offline). The honesty discipline is intact (carry the source label; eligibility in fixtures; guardrail caveated). The only remaining risks are the unavoidable stage-limits above, which are documented, not hidden. **Recommend human GO for implementation.** A second Codex pass is optional, not required, before building.
