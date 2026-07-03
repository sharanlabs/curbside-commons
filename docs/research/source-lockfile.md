# Primary-Source Lockfile

**Purpose (Codex amendment 12, plan `docs/plan-truth-audit-execution.md` §11):** before ANY public claim, every load-bearing live fact must be locked here with URL · access date · quote · status. A fact not LOCKED here may not appear in a public artifact.
**Status values:** `LOCKED` (verified on primary, quote captured) · `PENDING-RELOCK` (established in prior research; must be re-verified live before public use) · `UNVERIFIED` (never confirmed on primary).
**Seeded:** 2026-07-03 (during P1 close-out). This file is append/update-only at slice close-outs; it is NOT itself a public artifact.

▸ *Plain: the receipts drawer. Any fact we ever say in public must have a receipt in here first — link, date, exact quote.*

| # | Fact | Status | Source (URL · access date · quote) |
| --- | --- | --- | --- |
| L1 | LL79/2025 **effective date = 2025-06-30** (became law 2025-05-31; §4 = "takes effect 30 days after it becomes law") | **LOCKED** (2026-07-03) | intro.nyc/local-laws/2025-79 (enacted PDF, pdftotext) · 2026-07-03 · "This local law takes effect 30 days after it becomes law" + Legistar Int 0762-2024 enactment 5/31/2025. Full chain: `ll79-source-memo.md` §3 |
| L2 | NYC fee caps as amended: delivery 15% · basic service 5% · transaction 3% (no averaging, no safe harbor, documented pass-through exception) · enhanced 20% (only with basic offered) · category lock (any other fee unlawful) | **LOCKED** (2026-07-03) | Same primary (enacted LL79 §3); verbatim clauses in `ll79-source-memo.md` §2; spot-re-verified against the raw extraction 2026-07-03 (orchestrator) |
| L3 | Over-cap refund safe harbor covers subdivisions **a, b, d only — c excluded**; 30 calendar days from month-end | **LOCKED** (2026-07-03) | Same primary: "exceeds any fee cap imposed pursuant to subdivisions a, b or d of this section within 30 calendar days of the final day of the month" |
| L4 | July-16 DCWP recordkeeping comment deadline (rulemaking docket) | **PENDING-RELOCK** | Established in council/research phase 2026-07-02 (`pivot-research-2026-07.md` addendum). Owner DECLINED O4 — fact only needed publicly if the rulemaking is ever cited; re-lock then |
| L5 | UCP catalog capability = **live-query interface** wording (copy layer in-protocol per catalog spec) | **PENDING-RELOCK** | Established at G8 (`docs/reviews/gate-2026-07-02-g8-crux.md`); re-verify against ucp.dev/GitHub spec text before public use |
| L6 | Official `ucp-schema` validator = **v1.4.0** (cargo/Rust tool, Apache-2.0); the pinned UCP JSON **Schemas** = spec tag **`v2026-04-08`** (== `UCP_PINNED_VERSION`), Apache-2.0 | **LOCKED** (2026-07-03) | `github.com/Universal-Commerce-Protocol/ucp-schema` releases/latest · 2026-07-03 · `"tag_name":"v1.4.0"` published 2026-06-26; license `Apache-2.0`. Schemas: `github.com/Universal-Commerce-Protocol/ucp` releases/latest `"tag_name":"v2026-04-08"`, license `Apache-2.0`; 78 schema files pinned + sha256-locked at `fixtures/ucp-schemas/2026-04-08/PROVENANCE.json`. **Divergence recorded:** the JSON Schemas live in the `ucp` SPEC repo (`source/schemas/`), NOT in `ucp-schema` (which is the validator tool). cargo/rustc NOT installed on the build machine → CI differential-oracle agreement UNMEASURED locally (`scripts-ts/ucp-oracle-diff.mts` skips loud) |
| L7 | ucptools depth/pricing (community validator landscape) | **PENDING-RELOCK** | Research addendum 2026-07-02; volatile — re-check before any comparative public claim |
| L8 | UCP Food vertical participants (DoorDash · Square · Toast · Uber Eats; schemas pending) | **PENDING-RELOCK** | Research addendum + GLOSSARY entry (2026-07-02); re-verify on the UCP announcement/spec pages before public use |
| L9 | OpenAI ACP feed-vs-website rejection wording | **PENDING-RELOCK** | ACP primary read 2026-07-02 (research addendum); re-quote from developers.openai.com/commerce before public use |
| L10 | Gemini free-tier figures / pricing (gemini-2.5-flash $0.30/$2.50 per M as of 2026-06-29) | **PENDING-RELOCK** | RULES §6 freshness anchor 2026-06-29; re-anchor at D1 (demo spend arming) per standing practice |
| L11 | "Purchase price of each online order" statutory base inclusions (tax/tip/discount) | **UNVERIFIED** | Source-memo U1 — load-bearing for UC-1 base-inflation verdicts; resolve in F1 before any such verdict is published |

**Maintenance rule:** every slice that produces or consumes a load-bearing live fact updates this table at its close-out; the Pub slice gate (plan §5) requires zero PENDING-RELOCK rows among facts actually used in the publication.
