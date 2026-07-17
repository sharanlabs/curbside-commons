# Codex (gpt-5.6-sol@high) content pass — rendered surfaces (2026-07-16, session 22)

**Lane:** the owner's session-21 content/de-slop directive (decision row 2026-07-16, verbatim there): language flow · clarity · tone · narrative across the rendered surfaces; natural human professional-corporate register readable by technical + domain + non-technical readers WITHOUT losing substance/keywords/terms/tools; sol owner-routed; Fable adjudicates primary-model-final.

**Reviewer:** ONE gpt-5.6-sol@high via `~/claude-os/bin/codex-guarded` (probe SEAT_OK 12,370 tok; content run 159,191 tok, read-only sandbox, `--skip-git-repo-check` from the scratchpad — the standing shape). Packet: register + hard constraints (honesty strings byte-frozen; no design/register proposals; v8 final; minimal diffs) + the 18 primary surface files; `app/legacy/**` EXCLUDED (frozen historical lane, contract-bound copy — scoping judgment recorded). Raw output archived beside this record: `docs/reviews/codex-2026-07-16-contentpass-raw.txt` (35 findings + narrative verdict, verbatim).

**VERDICT: 35 findings (14 P1 · 20 P2 · 1 P3) → adjudicated primary-model-final: 32 ACCEPTED (24 as proposed + 8 accepted-modified) · 3 REFUTED · narrative verdict noted (arc coherent; the "out of focus" double meaning was the one stumble — fixed via F2).**

## Disposition table

| # | Sev | Location | Disposition | Note |
|---|-----|----------|-------------|------|
| 1 | P1 | fee-report-data.ts:398 | ACCEPTED-MODIFIED | CONFIRMED contradiction with FeesView:131 ("not a lawfulness certificate"). "every line lawful and within cap" → "every fee line within its cap" (sol's "as declared" tail dropped — unverified nuance). |
| 2 | P1 | CommonsScene HOLD_STATUS | ACCEPTED | CONFIRMED: hero hold = a confirmed mismatch, but "OUT OF FOCUS" is chapter-05's term for *unresolved* — the exact double meaning sol's narrative verdict flagged. → "A CLAIM HELD · DOES NOT MATCH THE RECORD". |
| 3 | P1 | metrics:65 | ACCEPTED | Grammar (schemas "validated against" dangling) + "The headline" promotional framing → sol's rewrite. |
| 4 | P1 | page.tsx H2 "Three moves. No trust required." | ACCEPTED | Categorical trust-free claim vs the honesty posture → "Three moves. Each can be checked." e2e contract rewritten RED→GREEN (canonical.spec.ts ×2; RED proven: 3 tests failed on old expectations before the rewrite). |
| 5 | P1 | MethodRelation sentence | ACCEPTED-MODIFIED | "is checked against … under a rule" adopted; the "checked instead of trusted" thesis ending KEPT (sol dropped it); all four interactive word-buttons intact. |
| 6 | P1 | CommonsScene zone pill "The menu" | ACCEPTED | CONFIRMED in code: zone "menu" floats THE MENU + THE KITCHEN (lines 173-4/515/529) → "The menu and kitchen". |
| 7 | P1 | zone pill "The agent" | ACCEPTED | Same proof (agent+order stations) → "The agent and order". |
| 8 | P1 | EvidenceBench "5 · BREAK" | ACCEPTED | → "5 · MISMATCH" (aligns with the receipt's own PRICE MISMATCH label). |
| 9 | P1 | "EVIDENCE LOCKED" | ACCEPTED-MODIFIED | "Locked" = unexplained tamper claim; collapsed the two-state label to a constant truthful "EVIDENCE ATTACHED" (evidence IS attached throughout; the dim is visual staging). |
| 10 | P1 | cost:44 "delivery builders hold to zero connections" | ACCEPTED | Jargon → "make no network connections". |
| 11 | P1 | eval:101 "Durable teeth … standing lock" | ACCEPTED | Internal metaphors → "A recorded snapshot and a standing check preserve this result." |
| 12 | P1 | eval:191 "out-of-scope abstained" | ACCEPTED | → "out-of-scope abstention". |
| 13 | P1 | verify-in-browser.ts:98 | ACCEPTED | CONFIRMED: the branch also catches arrays; "got a non-object" misdiagnoses them → "the top-level value is not a feed object." No test bound the old string. |
| 14 | P1 | cost:72 "Recorded live legs" | ACCEPTED | → "Recorded live runs". |
| 15 | P2 | page.tsx "renders on" | ACCEPTED | → "appears on". |
| 16 | P2 | H2 "A price that cannot pass." | **REFUTED** | "Pass" is the scene's own verdict vocabulary (pass/hold cycle) and the foot line decodes the claim immediately; sol's flat replacement weakens the arc's strongest beat. v8 voice kept; e2e-bound heading unchanged. |
| 17 | P2 | page.tsx record card | ACCEPTED | "log answers:" → "log records what is actually offered…". |
| 18 | P2 | page.tsx proof card | ACCEPTED | Articles + concrete object ("holds any claim that does not agree"). |
| 19 | P2 | page.tsx:301 | ACCEPTED-MODIFIED | "honest first-attempt DEFER" self-praise dropped + "enforcement proofs" jargon → "checks that keep the runtime at $0"; **"earned labels" KEPT** (it is the chapter H2's tie: "Every label has to be earned."). |
| 20 | P2 | H2 "Out of focus stays unresolved." | **REFUTED** | This chapter DEFINES the lens term and its body decodes it; with F2 removing the one conflicting usage, the metaphor is now single-meaning site-wide. E2e-bound heading; no residual defect. |
| 21 | P2 | bench tally "11 error · 5 warn" | **REFUTED** | The product-wide readout convention (playground result line asserts "16 findings — 11 error · 5 warn · 0 info"; report/CLI use the same form). A readout, not prose; changing one instance would create the very inconsistency sol's pass polices. |
| 22 | P2 | announce "the break" | ACCEPTED | → "the mismatch" (pairs F8). |
| 23 | P2 | announce "the locked evidence" | ACCEPTED | → "the evidence receipt" (pairs F9). |
| 24 | P2 | "Analyzing…" | ACCEPTED | The exam is complete; a replay re-lights it → "Replaying…" (accuracy, not just tone). |
| 25 | P2 | provenance dt "held to" | ACCEPTED-MODIFIED | → dt "rule" (parallel to "claim id"; sol's "governing rule" over-long for the dl key style). |
| 26 | P2 | fees meta description | ACCEPTED | "verdict states/honest boundary/paste-a-statement" → plain equivalents. |
| 27 | P2 | FeePlaygroundClient noscript hint | ACCEPTED | "paste leg"/"render" jargon → "pasted-statement audit… are available either way." |
| 28 | P2 | ReportView "product-feed shape" | ACCEPTED | → "product feed format". |
| 29 | P2 | layout.tsx meta description | ACCEPTED-MODIFIED | sol flagged "truth layer" as marketing; the real defect is INCONSISTENCY — the nav tag + OG title say "proof layer". → "The proof layer for agentic commerce — a deterministic verifier that checks the serving copy of a platform or AI agent…" (possessive ambiguity also fixed). Positioning kept. |
| 30 | P2 | metrics lead | ACCEPTED | "substance in numbers"/"lives in" → "scope in numbers"/"derived from its committed source". |
| 31 | P2 | eval "fancier" | ACCEPTED | → "more complex method". |
| 32 | P2 | eval "richer (embedding) method" | ACCEPTED | "Richer" implies unearned superiority (it lost) → "embedding-based method". |
| 33 | P2 | eval "thrown out — by us, on the record" | ACCEPTED-MODIFIED | → "We voided the first exam ourselves, on the record." (sol's passive "was voided and kept" loses the self-policing agency that IS the point). |
| 34 | P2 | not-found lede | ACCEPTED-MODIFIED | "surfaces" jargon → "pages"; the serving quip KEPT (grounded personality, not confusion — sol's full strip was over-correction). |
| 35 | P3 | CoverageTabs aria-label "lanes" | ACCEPTED | → "Measured coverage categories"; canonical.spec.ts ×2 rewritten in the same red-green. |

## Red-green + gates
- RED: `npx playwright test canonical.spec.ts` against the new copy with OLD expectations → exactly 3 failures (chapter-arc H2, tablist name ×2 — the two rewritten contracts and nothing else).
- GREEN: canonical 10/10 after the contract rewrite; **full vitest 1241 pass + 7 skip**; baseline verify exit 0 re-proven live at session open (58/58 build).
- Honesty invariants untouched: no frozen string edited; C10 packs green in the full run.

## Harness events (raw)
- One auto-mode classifier outage at session open blocked the first background verify launch: `claude-sonnet-5[1m] is temporarily unavailable, so auto mode cannot determine the safety of Bash right now.` — owner-resumed; the identical command then ran clean.
