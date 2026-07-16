# Redesign copy — approved source (2026-07-14)

**Author:** gpt-5.6-sol (owner-directed writer, directive 5 & 8). **Adjudication:** Claude (Opus) primary-model-final — **ACCEPTED**. Honesty-clean (no dev-jargon, no real-brand names, no false claims; passes the C10 `BANNED_CLAIMS` intent). Ran an anti-slop pass. Placeholders `[…]` are repo-derived and MUST be filled from committed values at build (never invented).

**Placeholder fill map (REPO-VERIFIED 2026-07-14 from code, not memory — per owner directive "always dont just rely on memory and training knowledge"):**
- `[claim value]` → `2150` (rendered `$2,150.00`) · `[record value]` → `21.50` · rule = cents-as-decimal ×100 error. (source: the committed demo report / grounding)
- `[N findings]` → **16 findings (11 error / 5 warn), verdict FAIL** (`lib/dashboard/evidence.ts` demoFindings/demoErrors/demoWarns, computed from the committed report).
- `[N pinned official schemas]` → **78** (`lib/dashboard/evidence.ts:155` `ucpSchemaCount`, recomputed by the evidence test from `fixtures/ucp-schemas/2026-04-08`).
- `[N codified fee-cap rules]` → **17** = 11 executable predicates (`FEE_RULES.length`) + 6 registered non-checkable clauses (`NON_STATEMENT_CHECKABLE.size`) that need external evidence (`lib/dashboard/evidence.ts:144-147`, `lib/packs/fees/rules.ts`). Copy honestly as "17 codified rules — 11 executable checks; 6 require external evidence."
- `[install command]` = `npm ci` · `[dev command]` = `npm run dev` · `[demo command]` = `npm run demo`.

**✅ LIVE-VERIFIED 2026-07-14 (research-specialist, current official sources — per owner "do not rely on memory" + RULES §6):**
- **NYC §20-563.3** — VERIFIED real + in force: "Fee caps," Subchapter 36, amended by Local Law 79 of 2025 (eff. 2025-06-30); tiered caps still enforced per the DCWP Apr-2026 flyer. "17 codified rules" accurate. Ship as-is. (codelibrary.amlegal.com · intro.nyc/local-laws/2025-79 · nyc.gov/dca)
- **ACP** — VERIFIED: Agentic Commerce Protocol, open (Apache-2.0), **OpenAI + Stripe** joint founding maintainers, includes a product-feed spec. "OpenAI/Stripe product-feed shape" accurate; repo's lock current. (github.com/agentic-commerce-protocol · docs.stripe.com/agentic-commerce · openai.com)
- **UCP** — VERIFIED: Universal Commerce Protocol, **Google-led** (ucp.dev), canonical repo github.com/Universal-Commerce-Protocol/ucp = the repo's pinned source; pinned **v2026-04-08 IS the current latest** (not stale). "Google-led live-catalog shape" accurate. (developers.google.com/merchant/ucp · GitHub releases)
- **Minor internal-docs cleanup (not public copy):** `docs/GLOSSARY.md:11` calls ACP "OpenAI's published specification" → should read "OpenAI + Stripe" (co-equal founding maintainers). Fold into the de-jargon pass (Phase D/E).
- Horizon note: both specs are date-versioned + fast-moving (only cite the canonical orgs above — lookalike domains exist); re-verify versions before any FUTURE copy that cites a specific spec date.

---

## DELIVERABLE 1 — Landing page copy

**HERO** — eyebrow `PROOF BEFORE TRUST` · headline **"Check every claim against the record."** · lede: *Curbside Commons compares agent-readable menu and catalog claims with a merchant's own records. It also checks data formats and audits NYC delivery fee statements, with evidence attached to every finding.* · CTAs: **View the verifier report** / **See the walkthrough**

**01 THE SHOWN CATCH** — eyebrow `01 / THE SHOWN CATCH` · headline **"See the mismatch before you read the receipt."** · body: *The listing states [claim value]. The merchant's record states [record value]. The listing passes its schema check, but the price is still wrong. Curbside Commons places the claim, the rule, and the record together.*

**02 THE PROBLEM** — eyebrow `02 / THE PROBLEM` · headline **"Schema-valid is not the same as true."** · body: *Agent-readable formats standardize which fields appear and how values are encoded. They do not prove that a stated price, item, or availability matches the merchant's records. A valid shape can still carry a wrong claim.*

**03 HOW IT WORKS** — eyebrow `03 / HOW IT WORKS` · headline **"From source record to supported finding."**
1. **Start with the record.** The merchant's own system defines the ground truth.
2. **Read the serving copy.** A platform presents its menu or catalog in an agent-readable format.
3. **Compare every claim.** Deterministic code checks the serving copy against the record, line by line.
4. **Attach the evidence.** Every finding includes the claim, the rule that caught it, and the record it failed against.
5. **Keep people in control.** Any recommendation based on the results requires explicit human review.

**04 WHAT IT COVERS** — eyebrow `04 / MEASURED COVERAGE` · headline **"Three checks. Each with a clear boundary."** · intro: *Coverage is measured by the claims, schemas, and rules evaluated. It is not presented as a broad success score.*
- **Listings truth** — *Compares serving copy with merchant records for item existence, availability, price, and encoding. Each finding identifies the exact mismatch.*
- **Protocol and schema conformance** — *Validates agent-readable data against [N pinned official schemas]. Conformance proves that the format is valid. It does not prove that the claim is true.*
- **NYC fee-cap audit** — *Applies [N codified fee-cap rules] from NYC §20-563.3 to delivery fee statements. Each result identifies the rule and the supplied facts behind the conclusion.*

**05 HONEST LIMITS** — eyebrow `05 / HONEST LIMITS` · headline **"Honesty belongs in the interface."** · body: *Some fee clauses depend on evidence beyond the supplied statement. Those cases remain open instead of being forced into a verdict. Some fee bases remain provisional until the required facts are available. Any model-assisted step is advisory. It never decides the verifier's result.*

**CLOSING CTA** — eyebrow `THE STANDARD` · headline **"Make the conclusion as inspectable as the claim."** · body: *A trustworthy finding should show its work. Read the claim, the rule, and the record, then reach the same conclusion yourself.* · CTAs: **Review the proof** / **Back to top**

---

## DELIVERABLE 2 — GitHub hub README (draft, fill placeholders before landing)

```markdown
# Curbside Commons

**Every agent-readable claim checked against the record.**

Curbside Commons is a working demonstration of deterministic verification for agentic commerce. It is for engineers, reviewers, and hiring teams who want clear evidence that machine-readable commerce claims match the source record.

## What it checks

### Listings truth
Compares a platform's agent-readable menu or catalog with the merchant's own records. It checks item existence, availability, price, and encoding.

### Protocol and schema conformance
Validates data against [N pinned official schemas]. A passing result confirms that the format conforms to the standard. It does not confirm that the underlying claim is true.

### NYC delivery fee caps
Applies [N codified fee-cap rules] from NYC §20-563.3 to delivery fee statements. Cases that require evidence beyond the supplied information remain clearly identified.

## How it works
1. The merchant's records establish the ground truth.
2. The platform's agent-readable copy is supplied to the verifier.
3. Deterministic code checks each claim against the record.
4. The verifier also checks schema conformance and applicable NYC fee-cap rules.
5. Every finding includes the claim, the rule that caught it, and the record it failed against.
6. Any recommendation based on the results requires explicit human review.

No AI model runs inside the verifier. The same input produces the same result, and verification costs $0 to run.

## Try it
Run Curbside Commons locally:
```text
npm ci
npm run dev
npm run demo
```

## What's real vs illustrative
The verification logic is implemented and deterministic. The NYC delivery fee-cap checks codify §20-563.3 as executable rules. The official data-format schemas are pinned to defined versions.

The example merchant and its menu are illustrative. Curbside Commons does not connect to a live platform and does not use real merchant data.

## Tech
Next.js · TypeScript · Deterministic verification engine

## Author
Created by [Sharan Kumar](https://github.com/sharanlabs).
```

**Note on the README's honesty section:** this is the developer-facing repo front page, where "what's real vs illustrative" is the *right* place for the detail the owner wants "kept in the background repo." The deployed public site stays disclaimer-free per owner directive; the repo carries the honest framing.
