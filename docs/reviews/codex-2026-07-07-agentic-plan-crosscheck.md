# Codex Cross-Check — Agentic Extension Plan (2026-07-07)

**Subject:** `docs/plan-agentic-extension.md` v1.0-rc (plan-stage gate; no code changed).
**Invocation:** ONE read-only pass via `~/claude-os/bin/codex-guarded exec --sandbox read-only` (shared-seat rule); seat smoke-tested first (`SEAT_OK`); config default `gpt-5.5` @ `xhigh` inherited (ship-gating review → xhigh per the effort policy). Raw output: `codex-2026-07-07-agentic-plan-crosscheck-raw.md`. Tokens ≈ 180k.
**Attack surface tasked (plan §10):** (a) §6 trajectory-floor testability · (b) AC-2/AC-6 structural enforceability · (c) contradiction scan vs RULES §3/§4 + base plan · (d) DAG dependency claims · (e) hiring-reviewer theater risk.

## Verdict

**CONFIRM-WITH-AMENDMENTS** — 9 P1 + 3 P2, no P0, no BLOCK.

## Findings + reconciliation (primary-model-final; ALL 12 ACCEPTED — none refutable)

| # | Sev | Finding (condensed) | Disposition → where it landed in v1.0 |
|---|---|---|---|
| 1 | P1 | §6 floors not testable as written ("constraints"/"class"/"not steered" vague) | ACCEPTED → committed trajectory-case schema (§6: allowed/forbidden tools, ordered/unordered call pattern + argument digests, expected engine-report hash, recommendation-class enum, finding refs, gate state); "not steered" defined as call-pattern match + no forbidden tool |
| 2 | P1 | ≥90% aggregate floor lets one member fail inside a passing crew | ACCEPTED → per-member floors (100% safety invariants + ≥90% own class-match); member × case matrix committed |
| 3 | P1 | Mocked/recorded turns could earn the "agent" label — theater | ACCEPTED → offline replay earns only "orchestration harness passed"; public "agent" label per member requires the owner-gated LIVE run (L-1) clearing pre-registered floors on a held-out split (§6 label semantics; C10 wording enforcement added to §9) |
| 4 | P1 | "No agent-reachable constructor" unsound — TS structural typing; builders exported from verifier-core/packs | ACCEPTED, claim WITHDRAWN → hard import boundary (denied paths listed in §3) + negative import-walk fixtures + behavioral byte-identity test + fabricated-ref check (AC-6 amended) |
| 5 | P1 | Raw byte-equality breaks across MCP JSON-RPC envelopes / serializers | ACCEPTED → canonical-payload comparison through a NAMED serializer per tool + exit-code parity; MCP tests parse the tool-result payload before comparing (AC-2 amended) |
| 6 | P1 | `auditWithClassification` needs an injected `LineItemClassifier` — plan silent on which | ACCEPTED → separate `classify_and_audit` advisory tool, deterministic baseline classifier only, `earnsLabel:false`, advisory array snapshotted separately (§3) |
| 7 | P1 | `runDemo` listed beside decision-grade tools; it is a scripted always-exit-0 walkthrough | ACCEPTED → `demo_only: true` flag enforced in the registry envelope; agents/MCP/n8n forbidden from treating it as an audit result (§3) |
| 8 | P1 | A4 shown depending only on A1; a credible automation lane must consume A3 payloads | ACCEPTED → DAG re-wired A1 + A3 → A4; A4 must prove fixture → tool → A3 payload artifact (§5) |
| 9 | P1 | O-A2 "pre-authorize any subset now" contradicts RULES §3 offline-first ordering | ACCEPTED → pre-authorization option WITHDRAWN; each live leg armed individually after its offline gate + safety controls (§1.2, §8) |
| 10 | P2 | AC-4 passable as a thin wrapper transcript | ACCEPTED → MCP anti-theater gates: invalid-input transcript + typed error snapshots + registry-only import walk + per-tool differential over faithful/drifted/invalid (AC-4) |
| 11 | P2 | Structural JSON checks alone don't prove the n8n lane works | ACCEPTED → zero-network dry run if docker approved (O-A4); else honest "workflow spec, not executed n8n lane" label, not counted as a working surface (AC-9) |
| 12 | P2 | "Groq free tier $0" overconfident vs repo's own corrected framing | ACCEPTED → "expected $0 under current account limits; preflight + ledger; metered pricing re-verified at arming" (§1.4, §7) |

## Outcome

Plan bumped v1.0-rc → **v1.0 (reconciled)** with all 12 amendments folded in. Confirmed by Codex without amendment: the SCQA framing, the one-seam/four-consumer architecture, A1∥A2 sibling ordering with A1 first, the offline-first slice structure, the freshness-check table shape, and the owner-call surfacing. Next gate = **owner GO** (plan §10) — no build, no live integration, no spend before it.
