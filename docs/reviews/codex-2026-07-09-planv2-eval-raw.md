The plan needs revision. I verified `HEAD=906b522` with a clean worktree and checked the cited contracts; I did not re-run the supplied test floors. No files were changed.

Confirmed plan claims: the Playwright assertion really requires “Not affiliated with”; the renamed report/demo banner is not in CLI goldens; and `REFERENCE_PLATFORM_NAME = "DoorDash"` is a load-bearing legacy-oracle anchor.

### P1

- **AP-01**
  - **Claim:** B’s listed doc edits are enough for a truthful redeploy.
  - **Evidence:** `README.md:42` still says 947+6; `docs/PLAIN-ENGLISH.md:7-11` says classifier deferred/no agents/no sends; `docs/PUBLICATION.md:31-46` says 20/21 deferred and 743 tests; `docs/WHY.md:5` says deploy pending. Current records contradict those claims: `docs/SHOWCASE.md:35,56-59` records earned Intake/Reviewer labels, 21/21 classifier, and one owner-armed Slack send.
  - **Severity:** P1
  - **Category:** Public honesty
  - **Fix sketch:** Add a current-public-doc reconciliation slice before B; update canonical docs or clearly label dated material historical. Include omitted portfolio docs and stale `docs/plan-deploy.md:3`.
  - **Confidence:** High

- **AP-02**
  - **Claim:** Genericizing `app/layout.tsx` is sufficient.
  - **Evidence:** `app/layout.tsx:55-65` says the replay has “not … real sends,” while `docs/SHOWCASE.md:58` truthfully permits “one recorded one-shot Slack send.”
  - **Severity:** P1
  - **Category:** Runtime honesty
  - **Fix sketch:** Scope the footer to the web replay: it initiates no send. Preserve the narrow historical one-shot statement elsewhere; do not imply standing delivery.
  - **Confidence:** High

- **AP-03**
  - **Claim:** B can change the report banner/footer without an explicit reversal.
  - **Evidence:** `docs/plan-whole-site-redesign.md:18-24` freezes the SIMULATED banner and footer byte-for-byte; `mockups/ultra-modern-2026-07-08/whole-site-copy-deck.md:24-41` asserts parity. B changes `ReportView.tsx` and `layout.tsx`.
  - **Severity:** P1
  - **Category:** Frozen-contract violation
  - **Fix sketch:** Record a decision reversal first, update/classify every current parity artifact, and replace the old byte-freeze with a semantic disclosure contract plus a parity test.
  - **Confidence:** High

- **AP-04**
  - **Claim:** `npx wrangler pages deploy out/ --project-name curbside-commons --branch main` assuredly updates production.
  - **Evidence:** No Wrangler config/dependency exists in `package.json`; `HANDOFF.md:19` is only a historical command record. Current Cloudflare docs describe no-branch deploys as production and `--branch` deploys as previews; the project’s production branch is not source-controlled. [Cloudflare Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/)
  - **Severity:** P1
  - **Category:** Production deployment target
  - **Fix sketch:** Preflight the authenticated Pages project, record production URL/branch/deployment ID, deploy a preview first, then use confirmed production semantics and smoke the canonical URL. Pin or record Wrangler’s exact version.
  - **Confidence:** High that the plan lacks proof; medium that the historical command was ineffective.

- **AP-05**
  - **Claim:** C1’s Swiss/premium composite respects the current design direction.
  - **Evidence:** The fixed Oxblood spec bans gradients, glow, glass, numbered markers, and large radii in `docs/plan-whole-site-redesign.md:10-13`; the owner’s standing direction says no dark background and no grid lines in `docs/decision-log.md:129-131`. C1 proposes visible rules/markers, a dark gradient/glow card, glass, and radius 30.
  - **Severity:** P1
  - **Category:** Design-governance conflict
  - **Fix sketch:** Explicitly record this as a non-canonical exploratory mockup with enumerated exceptions, or conform it to Oxblood. “No dark page ground” is not the recorded rule.
  - **Confidence:** High

### P2

- **AP-06**
  - **Claim:** Slice A can close S-11 as “FINAL brand” while deferring trademark work and declining the domain.
  - **Evidence:** `docs/s11-curbside-commons-diligence.md:20-25` keeps domain registration and manual trademark work as owner tails; `docs/suggestions-ledger.md:20,22` remains PENDING. “TESS” is obsolete; USPTO now directs users to Trademark Search. [USPTO Trademark Search](https://www.uspto.gov/trademarks/search), [TESS retirement notice](https://www.uspto.gov/subscription-center/2023/retiring-tess-what-know-about-new-trademark-search-system)
  - **Severity:** P2
  - **Category:** Decision-record / legal-claim precision
  - **Fix sketch:** Treat the delegation as authority but record “final non-commercial display brand, no clearance claimed”; append a formal domain-tail reversal; replace “TESS clearance” with a limited current USPTO Trademark Search review and retain the no-® boundary.
  - **Confidence:** High

- **AP-07**
  - **Claim:** The new routing doctrine is implemented by the plan.
  - **Evidence:** Mandatory per-step tags are absent for 0, A, B, D, E, deployment, smoke, and documentation closure. `RULES.md:94-111` also requires task-log, handoff, state, and meaningful-work records, while Slice 0 names only the decision log.
  - **Severity:** P2
  - **Category:** Model-routing / continuity
  - **Fix sketch:** Add `[route | purpose | verifier]` to every action and explicitly schedule `CURRENT_TASK`, task log, journal, state, and handoff updates.
  - **Confidence:** High

- **AP-08**
  - **Claim:** The five-name grep establishes a complete public de-brand.
  - **Evidence:** It misses `OpenAI`, `Stripe`, `Google`, `DataSF`, and encoded `Uber&nbsp;Eats` in `components/report/ReportView.tsx:115`. It also conflicts with F1’s “everywhere”: public-repo mockups retain names at `mockups/swiss.html:903-905`, `premium.html:949`, and `story-flow.html:876-879`; F2 deliberately retains factual attribution in `docs/GLOSSARY.md:73`.
  - **Severity:** P2
  - **Category:** Scope / validation ambiguity
  - **Fix sketch:** Create a tracked inventory: edit, factual attribution allowed, frozen labeled archive, or historical. Scan tracked sources and final `out/` against that allowlist. Verify GitHub About separately rather than “if branded.”
  - **Confidence:** High

- **AP-09**
  - **Claim:** “Never touch eval/goldens” is compatible with final identity coherence.
  - **Evidence:** `lib/packs/listings/demo/render-text.ts:47` emits “Commerce Truth Audit”; it is frozen by `fixtures/synthetic-restaurant/expected-demo.txt:2` and `evals/packs/demo-cli.test.ts:34-43`. Future delivery templates also retain that identity in `lib/delivery/slack.ts:49,132` and `lib/delivery/email.ts:129,143-145`, with goldens in `evals/delivery/delivery.test.ts:36-47,102-111`.
  - **Severity:** P2
  - **Category:** Public-output / golden-policy conflict
  - **Fix sketch:** Decide and document whether these are historical artifacts or current public output. If current, intentionally version templates and regenerate reviewed goldens; never alter the actual historical Slack-send record.
  - **Confidence:** High

- **AP-10**
  - **Claim:** Existing C10 plus a manual regex pass protects new disclaimer/mockup copy.
  - **Evidence:** C10 scans only selected public prose and report/demo files (`evals/packs/honesty-c10.test.ts:45-75`), not landing/footer/mockups. Report and demo banners are independently maintained at `ReportView.tsx:114-118` and `copy.ts:53-54`; C10 only checks simulated markers, not equality or disclosure completeness.
  - **Severity:** P2
  - **Category:** Honesty gate gap
  - **Fix sketch:** Single-source the banner or add normalized rendered-text parity; add a reproducible mockup-specific claim test enforcing simulated/invented/no-access/no-impact/non-affiliation semantics.
  - **Confidence:** High

- **AP-11**
  - **Claim:** `test:legacy` proves protected legacy/eval/golden paths stayed untouched.
  - **Evidence:** The oracle depends on `REFERENCE_PLATFORM_NAME` at `legacy/activation/lib/core/constants.ts:22-29` and byte comparison at `legacy/activation/evals/core-differential.test.ts:22-60`; tests cannot prove no forbidden path changed.
  - **Severity:** P2
  - **Category:** Regression gate
  - **Fix sketch:** Record slice-start SHA and require empty diffs for `legacy/activation/**`, `evals/**`, frozen fixtures/goldens/snapshots; run legacy again after the final export build.
  - **Confidence:** High

- **AP-12**
  - **Claim:** The stated gates validate the artifact that ships.
  - **Evidence:** `npm run verify` already builds (`package.json:18`), then B rebuilds before deploy. Playwright starts `next dev` and can reuse a stale port-3100 server (`playwright.config.ts:21-25`); it never tests `out/`.
  - **Severity:** P2
  - **Category:** Release integrity
  - **Fix sketch:** Build once, scan/hash that `out/`, run e2e with a fresh server, then serve/smoke the exact static artifact or preview deployment.
  - **Confidence:** High

- **AP-13**
  - **Claim:** “30 routes 200” is a precise deployment smoke test.
  - **Evidence:** Current `out/` has 30 HTML files, but two are `404.html` and `_not-found.html`; there are 28 intended user routes. The previous deploy had transient 522s (`docs/decision-log.md:138`).
  - **Severity:** P2
  - **Category:** Release validation / rollback
  - **Fix sketch:** Use a route manifest: 28 expected 200s, an unknown URL expected 404, required de-brand marker/banner, bounded retry policy, and a tested rollback path.
  - **Confidence:** High

- **AP-14**
  - **Claim:** Google Fonts-only follows current mockup precedent.
  - **Evidence:** Legacy parents use Google Fonts, but the newer accepted precedent requires zero external requests/system fonts: `mockups/ultra-modern-2026-07-08/README.md:10-12`; the live app self-hosts through `app/layout.tsx:3`.
  - **Severity:** P2
  - **Category:** CSP/privacy / precedent conflict
  - **Fix sketch:** Use system or self-hosted fonts; otherwise record an exception and verify browser network traffic, not just source grep.
  - **Confidence:** High

- **AP-15**
  - **Claim:** C2’s anchor and accessibility gates are testable and sufficient.
  - **Evidence:** Parent IDs are incompatible: Swiss has `#main`, premium has `#top`, story-flow has `#verify`/`#method`. C2 omits no-JS/no-IntersectionObserver behavior despite the production settled-DOM pattern in `components/landing/Reveal.tsx:6-9`; `npm run verify` does not inspect mockups.
  - **Severity:** P2
  - **Category:** Mockup acceptance gap
  - **Fix sketch:** Define a new canonical fragment matrix; verify links, unique IDs, skip link, keyboard/focus, reduced motion, no-JS/no-IO, responsive render, contrast, title, and `node --check`.
  - **Confidence:** High

- **AP-16**
  - **Claim:** The C1 receipts substantiate the stated current “engine + crew + MCP + delivery” story.
  - **Evidence:** C1 omits `npx vitest run evals/delivery` despite `docs/SHOWCASE.md:37-42`; it omits n8n if mentioned (`:44-50`), prerequisites (`:3`), and that the drifted-fee command intentionally exits 1 (`:10-12`). Only Intake/Reviewer carry agent labels; delivery is one recorded send (`:56-59`).
  - **Severity:** P2
  - **Category:** Claim scope / demonstrability
  - **Fix sketch:** Add missing commands and expected outcomes; use sanctioned wording: two bounded live-validated agent components, deterministic Audit/Evidence, episodic delivery, engine decides, humans approve.
  - **Confidence:** High

- **AP-17**
  - **Claim:** C1 may adopt the external motion law before D vets/vendors it.
  - **Evidence:** C1/C2 precede D, violating source-intake order in `RULES.md:145` and `docs/enterprise-delivery-playbook.md:108-119`. The upstream source is mutable `main`, has no releases, includes a scripted greeting, and `review-animations` requires its referenced `STANDARDS.md`; MIT copies must retain copyright/permission notices. [Upstream repository](https://github.com/emilkowalski/skills), [MIT license](https://raw.githubusercontent.com/emilkowalski/skills/main/LICENSE)
  - **Severity:** P2
  - **Category:** Supply chain / prompt-injection / sequencing
  - **Fix sketch:** Move intake before C1 or use an explicitly repo-native temporary motion table. Pin commit/tree hashes; inventory exact paths and dependencies; preserve license notice; review for scripts/links; record the exact greeting-neutralization diff and rollback.
  - **Confidence:** High

- **AP-18**
  - **Claim:** “Latest references requirement” is reviewable as written.
  - **Evidence:** C1 names a live sweep but no source log, dated citations, selection criteria, or rejection record; `RULES.md:57-63` requires current source basis for platform claims.
  - **Severity:** P2
  - **Category:** Research traceability
  - **Fix sketch:** Make the C1 brief carry a dated source matrix, what was adopted/rejected, license/reuse posture, and exact review criteria.
  - **Confidence:** High

### P3

- **AP-19**
  - **Claim:** The design/motion attribution is exact.
  - **Evidence:** Swiss’s 23px value belongs to `.lede`, while `.body` is 16px (`mockups/swiss.html:137-144`); premium’s cubic-bezier is global, not reveal-only (`mockups/premium.html:66,126-159`).
  - **Severity:** P3
  - **Category:** Specification precision
  - **Fix sketch:** Label these as new adaptations, not parent behavior; say “lede 23→19.” Scope `$0.00` to the replay’s model/API spend.
  - **Confidence:** High

- **AP-20**
  - **Claim:** A non-gating dual-flagship advisory after redeploy is useful release protection.
  - **Evidence:** It occurs after the irreversible public action and “ships nothing.”
  - **Severity:** P3
  - **Category:** Sequencing
  - **Fix sketch:** Move it before production deploy or omit it from the release plan.
  - **Confidence:** High

VERDICT: REVISE