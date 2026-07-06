# Codex cross-model review — Pub slice (2026-07-06) — DISCHARGED (SHIP)

**Scope:** the entire uncommitted Pub diff vs `4275aff` (README replacement · `docs/PUBLICATION.md` · LICENSE/NOTICE · corpus license close-out · C9/C10 test changes · product-surface rename + sanctioned demo-golden regen · demo recording · CSV relocation · lockfile relocks · state docs), with a mandatory claims-vs-repo-truth pass on all new public prose (advisor constraint).

**Chain (all raws in this directory):**

| Pass | Effort | Verdict | Findings |
| --- | --- | --- | --- |
| Batch (`codex-2026-07-06-pub-slice-raw.md`) | medium (deviation noted below) | BLOCK | 2 P1 + 2 P2 + 1 P3 |
| Confirming (`…-pub-confirm-raw.md`) | xhigh (forced) | BLOCK | 2 P1 + 1 P3 residual; all 5 batch fixes CONFIRMED |
| Narrow (`…-pub-final-confirm-raw.md`) | xhigh | BLOCK | 1 (exception-list completeness) |
| Micro (`…-pub-micro-confirm-raw.md`) | xhigh | BLOCK | enumeration stragglers (all gitignored) |
| Closing (`…-pub-close-confirm-raw.md`) | xhigh | **SHIP** | — |

**Reconciliations (primary-model-final; details + counts in `pub-verify-evidence.log`):**
1. **P1 stale counts** — README/PUBLICATION 737+6 → 743+6; counts re-run at commit time.
2. **P1 source-lock violation** (the deepest catch): L4 + L8 relocked live; new LOCKED rows L12–L15 (Square 2026-07-01 · HungryPanda $875K with the restitution/penalty split made exact · Gemini/DoorDash pilot 2026-03-03 · ACP OpenAI+Stripe Apache-2.0); Juniper trust-barrier claim **dropped** from both public docs rather than published on secondary sourcing (L16); used-facts audit appended — zero PENDING-RELOCK among used facts.
3. **P2 package-lock name** — regenerated.
4. **P2 gmail fixture** — accepted with the fix **corrected** (partial refutation): `example.com` is the guardrail's deliberate sanctioned-fake exclusion; fixed to RFC-2606 `growth-team@mailprovider.example`, preserving T18's teeth.
5. **P3 raw-log redaction** — completed across embedded copies after the confirming pass caught the partial first sweep.

**Also fixed under this ceremony (not found by Codex):** the CSV relocation had broken the archived python pipeline (`scripts/config.py:10`); caught by running the python suite during P2-2, fixed, all 35 python tests green.

**Confirmed by Codex along the way:** C10 extended-not-softened; C9 strictly stronger; demo-golden delta exactly the banner line, JSON golden untouched; LICENSE canonical; NOTICE coherent; upstream UCP license/provenance untouched; all headline numeric claims (8/8, 33/35+2, 20/21-yet-DEFER, 17/11+6, 78 schemas, $0-LLM CLI) supported by repo tests/records; runtime code and current-instruction surfaces clean of the old CSV name.

**Process deviation on record:** the batch ran at reasoning effort **medium** (below the ship-gating xhigh doctrine — wrapper default not overridden); every subsequent pass ran at forced xhigh.

**Final state at discharge:** `npm run verify` exit 0 = **743 passed + 6 skipped** · `test:legacy` 306+5 · python suite 35 passed.
