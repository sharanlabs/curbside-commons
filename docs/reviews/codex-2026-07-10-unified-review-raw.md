# Codex (gpt-5.6-sol @ high) — unified-review raw verdict, 2026-07-10

Run 1 (startup checkpoint — stopped at the repo's approval gate, approved via thread resume):
```
{
  "review_date": "2026-07-10",
  "review_head": "cb2a8b7",
  "requested_baseline_head": "fbb4f67",
  "mode": "read-only file review",
  "section_a": [
    {"id":"AP-01","status":"STANDS-MODIFIED","severity":"P1","category":"public honesty","evidence":"README.md:42,46; docs/PLAIN-ENGLISH.md:7-11; docs/PUBLICATION.md:33,46; docs/WHY.md:5; docs/SHOWCASE.md:57-58","fix":"Reconcile current public docs or mark historical blocks explicitly.","confidence":"high"},
    {"id":"AP-02","status":"STANDS-MODIFIED","severity":"P1","category":"runtime honesty and identity","evidence":"app/layout.tsx:50-65; docs/SHOWCASE.md:58","fix":"Rewrite the footer for the current truth-audit site and scope no-send language to the web replay.","confidence":"high"},
    {"id":"AP-03","status":"STANDS","severity":"P2","category":"frozen-contract governance","evidence":"docs/plan-whole-site-redesign.md:18-24; docs/decision-log.md:143","fix":"Record a freeze reversal, then replace byte-freeze with a semantic disclosure contract and parity test.","confidence":"high"},
    {"id":"AP-04","status":"STANDS-MODIFIED","severity":"P1","category":"production deployment target","evidence":"docs/plan-debrand-design-armoury-2026-07-09.md:41; package.json:7-38; docs/decision-log.md:142; supplied Cloudflare 2026-07-10 fact","fix":"Preflight project state, preview first, use confirmed production semantics, record Wrangler version and deployment ID, then smoke canonical URL.","confidence":"high"},
    {"id":"AP-05","status":"MOOTED","severity":"P3","category":"historical design governance","evidence":"docs/decision-log.md:143","fix":"Use the new owner-fixed design direction; keep Oxblood only as shipped-site history.","confidence":"high"},
    {"id":"AP-06","status":"STANDS-MODIFIED","severity":"P2","category":"naming and legal precision","evidence":"docs/s11-curbside-commons-diligence.md:3,14,18-25; docs/suggestions-ledger.md:20; docs/decision-log.md:140","fix":"Synchronize the ledger and use current USPTO Trademark Search wording; state no commercial clearance or mark claim.","confidence":"high"},
    {"id":"AP-07","status":"STANDS-MODIFIED","severity":"P2","category":"routing and continuity","evidence":"docs/plan-debrand-design-armoury-2026-07-09.md:69; RULES.md:94-110; docs/decision-log.md:142","fix":"Plan v3 must tag every action with current routing and schedule all applicable closure records.","confidence":"high"},
    {"id":"AP-08","status":"STANDS","severity":"P2","category":"de-brand scope","evidence":"docs/plan-debrand-design-armoury-2026-07-09.md:37; README.md:7; app/layout.tsx:56-65; components/report/ReportView.tsx:114-117","fix":"Use a tracked allowlist inventory and scan tracked sources plus final out artifact.","confidence":"high"},
    {"id":"AP-09","status":"STANDS","severity":"P2","category":"identity and golden policy","evidence":"lib/packs/listings/demo/render-text.ts:43-50; lib/delivery/slack.ts:49,132; lib/delivery/email.ts:129,143-145; fixtures/synthetic-restaurant/expected-demo.txt:2","fix":"Decide historical versus current output; version and regenerate reviewed goldens only if current.","confidence":"high"},
    {"id":"AP-10","status":"STANDS","severity":"P2","category":"honesty gate gap","evidence":"evals/packs/honesty-c10.test.ts:45-75; components/report/ReportView.tsx:110-118; lib/packs/listings/demo/copy.ts:47-54","fix":"Single-source or parity-test disclosures and extend coverage to landing, footer, and mockups.","confidence":"high"},
    {"id":"AP-11","status":"STANDS","severity":"P2","category":"protected-path regression gate","evidence":"package.json:14; docs/reviews/unified-review-2026-07-10.md:11-13","fix":"Require empty protected-path diffs from the slice-start SHA in addition to tests.","confidence":"high"},
    {"id":"AP-12","status":"STANDS","severity":"P2","category":"release integrity","evidence":"package.json:18-19; playwright.config.ts:21-25","fix":"Build once, hash and scan out, force a fresh server, and test the exact artifact or preview promoted.","confidence":"high"},
    {"id":"AP-13","status":"STANDS-MODIFIED","severity":"P2","category":"release smoke and rollback","evidence":"docs/decision-log.md:138; out/404.html; out/_not-found.html","fix":"Use a 28-route manifest, explicit unknown-path 404, bounded retry, disclosure marker, and rollback procedure.","confidence":"high"},
    {"id":"AP-14","status":"STANDS","severity":"P2","category":"privacy and font precedent","evidence":"mockups/ultra-modern-2026-07-08/README.md:10-12,32; mockups/swiss.html:8-10; docs/decision-log.md:143","fix":"Use system or self-hosted fonts unless an exception is recorded and network-tested.","confidence":"high"},
    {"id":"AP-15","status":"STANDS-MODIFIED","severity":"P3","category":"mockup accessibility","evidence":"mockups/swiss.html:469,473; mockups/premium.html:429; mockups/story-flow.html:474,852; components/landing/Reveal.tsx:5-9","fix":"Define canonical fragments and verify keyboard, no-JS, reduced-motion, responsive, and contrast behavior.","confidence":"high"},
    {"id":"AP-16","status":"STANDS-MODIFIED","severity":"P3","category":"claim demonstrability","evidence":"docs/SHOWCASE.md:37-60; docs/plan-debrand-design-armoury-2026-07-09.md:47,57-59","fix":"Reuse SHOWCASE commands, prerequisites, expected exits, and exact earned-label boundaries.","confidence":"high"},
    {"id":"AP-17","status":"STANDS-MODIFIED","severity":"P1","category":"external source intake","evidence":"docs/plan-debrand-design-armoury-2026-07-09.md:43-55; RULES.md:140-146","fix":"Vet, pin, license-review, and security-review Emil content before use, or use repo-native motion rules.","confidence":"high"},
    {"id":"AP-18","status":"STANDS-MODIFIED","severity":"P3","category":"research traceability","evidence":"docs/decision-log.md:143; docs/plan-debrand-design-armoury-2026-07-09.md:46","fix":"Create a dated source matrix with principles, adopt/reject reasons, licensing, and evaluation criteria.","confidence":"high"},
    {"id":"AP-19","status":"MOOTED","severity":"P3","category":"historical spec precision","evidence":"mockups/swiss.html:137-144; mockups/premium.html:66; docs/decision-log.md:143","fix":"Do not carry incorrect parent attributions into the new brief.","confidence":"high"},
    {"id":"AP-20","status":"MOOTED","severity":"P3","category":"historical sequencing","evidence":"docs/decision-log.md:142; docs/plan-debrand-design-armoury-2026-07-09.md:61-62","fix":"The dual-flagship review now precedes deploy; remove the stale post-deploy tail in plan v3.","confidence":"high"},
    {"id":"GATE-P2-01","status":"STANDS","severity":"P2","category":"factual attribution contradiction","evidence":"README.md:59; docs/WHY.md:11,15; docs/PUBLICATION.md:15; docs/plan-debrand-design-armoury-2026-07-09.md:21-22","fix":"Genericize public prose while preserving dated named citations in research records.","confidence":"high"},
    {"id":"GATE-P3-01","status":"STANDS-MODIFIED","severity":"P3","category":"routing and writing QA","evidence":"docs/decision-log.md:142; docs/reviews/gate-2026-07-09-planv2-eval.md:14","fix":"The xhigh prescription is superseded, but the missing anti-slop/public-writing QA remains; use the owner-sanctioned current route.","confidence":"high"},
    {"id":"GATE-P3-02","status":"STANDS","severity":"P2","category":"banner parity","evidence":"lib/packs/listings/demo/copy.ts:47-54; components/report/ReportView.tsx:110-118; evals/packs/honesty-c10.test.ts:88-101","fix":"Use one source or normalized rendered parity before edits.","confidence":"high"},
    {"id":"GATE-P3-03","status":"STANDS-MODIFIED","severity":"P2","category":"supply-chain review","evidence":"docs/plan-debrand-design-armoury-2026-07-09.md:53-55","fix":"Require a dedicated review of vendored content or a recorded waiver.","confidence":"high"},
    {"id":"GATE-P3-04","status":"STANDS","severity":"P3","category":"deliverable definition","evidence":"docs/plan-debrand-design-armoury-2026-07-09.md:57-59","fix":"Name the record artifact, path, format, privacy rules, and acceptance check.","confidence":"high"},
    {"id":"GATE-P3-05","status":"STANDS","severity":"P3","category":"disclosure specificity","evidence":"docs/plan-debrand-design-armoury-2026-07-09.md:21; README.md:7; evals/packs/honesty-c10.test.ts:77-99","fix":"Record the tradeoff and enforce equivalent semantic disclosure if genericizing.","confidence":"high"}
  ],
  "section_b": [
    {"id":"NEW-01","claim":"The deployed app is two different products under one Curbside Commons identity: truth-verifier metadata/report/demo and active ActivationOps landing/console/eval/metrics/cost routes.","evidence":"README.md:3,79; app/layout.tsx:26-32; app/page.tsx:170-180; app/console/page.tsx:55-68; app/eval/page.tsx:3-18","severity":"P1","category":"product identity","fix":"Choose one canonical public product; move or explicitly namespace the legacy ActivationOps UI and rebuild navigation/content around that decision.","confidence":"high"},
    {"id":"NEW-02","claim":"The landing overclaims full prose coverage: it says every fact/claim is checked, while the documented gate covers declared claims and explicitly lacks full prose-to-claim coverage.","evidence":"app/page.tsx:131-139,173-180,300-305; docs/WHY.md:25","severity":"P1","category":"public capability honesty","fix":"Scope copy to declared claims plus independent semantic review, or implement and evaluate full prose claim extraction before restoring the claim.","confidence":"high"},
    {"id":"NEW-03","claim":"README and publication claim the headline is machine-checked in CI, but the repo has no CI workflow; package scripts are local only.","evidence":"README.md:20; docs/PUBLICATION.md:23; package.json:7-32; no .github/.gitlab/.circleci workflow in tracked tree","severity":"P1","category":"verification claim","fix":"Add a pinned, least-privilege CI workflow running the relevant gates, or change the copy to machine-checked in the committed test suite.","confidence":"high"},
    {"id":"NEW-04","claim":"Empty-seat, nobody-built-it, and first-mover claims violate the recorded binding honesty reframe that the trust layer is crowded and public positioning must not say no one automates it.","evidence":"README.md:13; docs/PLAIN-ENGLISH.md:35,43,56; docs/PUBLICATION.md:9,19; docs/decision-log.md:57","severity":"P1","category":"market-positioning honesty","fix":"Lead with the verified structured-SOR mechanism and portfolio proof; remove exclusivity and first-mover assertions.","confidence":"high"},
    {"id":"NEW-05","claim":"README's blanket all-synthetic/archive framing is false or materially misleading for the current exported app, whose primary routes still execute the legacy hybrid DataSF replay.","evidence":"README.md:7,68,79; lib/product.ts:15-17; app/console/page.tsx:103-107,158-161; app/eval/page.tsx:3-18","severity":"P2","category":"data provenance and lineage","fix":"Scope corpus claims by module and disclose that legacy activation routes remain active in the deployed artifact, or remove them from the canonical site.","confidence":"high"},
    {"id":"NEW-06","claim":"Public AI inventory says an LLM appears in one place, but SHOWCASE records live-floor-cleared Intake and Reviewer agents and the active eval route presents recorded Gemini output.","evidence":"README.md:51-53; docs/PUBLICATION.md:29-31; docs/PLAIN-ENGLISH.md:52; docs/SHOWCASE.md:29-35; app/eval/page.tsx:101-119","severity":"P2","category":"capability inventory","fix":"State scope explicitly: truth-engine verdict path, optional classifier, agent-extension surfaces, and legacy activation replay.","confidence":"high"},
    {"id":"NEW-07","claim":"The e2e suite actively locks the obsolete ActivationOps landing/console story and does not test the canonical cross-product identity or report tab behavior, so green e2e can certify the wrong public product.","evidence":"evals/e2e/console.spec.ts:3-18,20-73; app/layout.tsx:26-32","severity":"P2","category":"acceptance-gate gap","fix":"Add a canonical-product contract test across metadata, H1, nav, report/demo, disclosures, and evidence-dashboard provenance.","confidence":"high"},
    {"id":"NEW-08","claim":"Public artifacts do not expose a deployed-at commit/date marker, so site and repo can silently diverge after a public commit.","evidence":"docs/decision-log.md:138 records the deployment; app/layout.tsx:50-67 has no deployment provenance; README.md:1-87 has no live URL or deployed SHA","severity":"P2","category":"deployment provenance","fix":"Publish canonical URL plus deployed commit/date and verify it during every deploy smoke.","confidence":"high"},
    {"id":"NEW-09","claim":"CLI help still says the LLM classifier is deferred to F1b, while public status says the live lane earned calibration; the intended distinction from the deterministic CLI baseline is not expressed.","evidence":"bin/check.mjs:34-38; README.md:46; lib/tools/tools/classify-and-audit.ts:2-12","severity":"P2","category":"runtime label clarity","fix":"Say the CLI uses the deterministic baseline and the separately evaluated live lane is not invoked on this path.","confidence":"high"},
    {"id":"NEW-10","claim":"The report's ARIA tabs are incomplete: role=tablist/tab is used without tabpanel linkage, aria-controls, roving focus, or arrow-key behavior.","evidence":"components/report/ReportView.tsx:132-146","severity":"P3","category":"accessibility","fix":"Implement the ARIA tabs pattern fully or use ordinary toggle buttons without tab roles.","confidence":"high"},
    {"id":"NEW-11","claim":"Internal package identity remains commerce-truth-audit while the public repo/site identity is Curbside Commons.","evidence":"package.json:2,6; README.md:1; app/layout.tsx:28-29","severity":"P3","category":"identity consistency","fix":"Rename package metadata or document it as an intentional stable internal identifier.","confidence":"high"},
    {"id":"NEW-12","claim":"The mockups estate contains 54 files with multiple superseded directions but no root inventory/status boundary, leaving obsolete branded prototypes discoverable as if current.","evidence":"mockups/ directory inventory; mockups/design-samples-2026-07-08/README.md:1-20; mockups/ultra-modern-2026-07-08/README.md:1-12","severity":"P3","category":"public artifact hygiene","fix":"Add a root inventory labeling shipped, current reference, superseded, and historical artifacts; exclude obsolete outputs if they add no provenance value.","confidence":"high"},
    {"id":"NEW-13","claim":"Public quickstarts use npm install despite a committed lockfile, weakening reproducibility for a verification-led portfolio.","evidence":"README.md:27-34; docs/SHOWCASE.md:3; package-lock.json:1","severity":"P3","category":"developer reproducibility","fix":"Use npm ci as the canonical clean-room command and retain npm install only for active dependency development.","confidence":"medium"},
    {"id":"NEW-14","claim":"Static deployment security-header posture is not source-controlled or validated; next.config only exports static files and no header artifact exists.","evidence":"next.config.ts:3-10; no tracked _headers or equivalent deployment header config","severity":"P3","category":"deploy hardening","fix":"Define and smoke appropriate static security headers, or explicitly record why provider defaults are accepted after current-doc verification.","confidence":"medium"},
    {"id":"NEW-15","claim":"The glossary self-identifies as last updated 2026-07-07 despite 2026-07-09 earned classifier/delivery state and the current identity change.","evidence":"docs/GLOSSARY.md:3-5; docs/SHOWCASE.md:57-58","severity":"P3","category":"documentation freshness","fix":"Update glossary status-sensitive entries or make them definition-only and point to a canonical live status ledger.","confidence":"high"}
  ],
  "section_c": {
    "candidate_judgments": [
      {"candidate":"RAG lane","judgment":"AGREE WITH CONDITIONS","recommended_rank":2,"reason":"Adds a real missing capability, but exact deterministic lookup already exists and RAG must remain citation-required, abstaining, advisory, and pre-registered."},
      {"candidate":"MCP-Slack interactive approvals","judgment":"DISAGREE WITH RANK 2","recommended_rank":4,"reason":"Current MCP is local stdio and Slack is one-way webhook; interactive approval requires authenticated ingress, identity, idempotency, expiry, persistence, and a public endpoint."},
      {"candidate":"Eval/observability dashboard","judgment":"AGREE","recommended_rank":1,"reason":"Highest immediate hiring payoff and lowest risk; existing pages display legacy ActivationOps rather than truth-engine evidence."},
      {"candidate":"Email one-shot","judgment":"AGREE AT LAST","recommended_rank":5,"reason":"Transport adds little beyond the already-earned Slack send and adds external-delivery risk."}
    ],
    "recommended_order": [
      "truth-engine eval/observability dashboard",
      "pre-registered advisory corpus RAG",
      "adversarial entity-resolution and messy-input eval lane",
      "MCP-Slack interactive approvals",
      "email one-shot"
    ],
    "missing_candidate":"Adversarial entity-resolution and messy-input ingestion with pre-registered precision/recall and fail-to-human floors; directly addresses README.md:68."
  },
  "verdict": "REVISE",
  "fix_first": [
    "Resolve the truth-engine versus ActivationOps public identity split.",
    "Reconcile stale public docs/footer/status and scope data, AI, send, and deploy claims.",
    "Remove full-claim-coverage and empty-seat/first-mover overclaims.",
    "Make the CI claim real or correct it.",
    "Prove exact production targeting and exact-artifact deployment before redeploy."
  ]
}
```

Run 2 (resumed thread — full Sections A–C; usage: run-1 input 242,958 [192,000 cached] out 2,183; run-2 ~298k tokens):
```
Review complete at clean `cb2a8b7`; product code is unchanged from requested baseline `fbb4f67`. Machine-readable output: [codex-unified-review-curbside-commons.json](/tmp/codex-unified-review-curbside-commons.json).

## Section A — prior findings

Current totals: **17 STANDS/STANDS-MODIFIED, 3 MOOTED, 0 WRONG** across AP-01..20; **all 6 gate findings still stand or stand modified**.

| ID | Result | Current assessment |
|---|---|---|
| AP-01 | **STANDS-MODIFIED** | **P1 · public honesty · High.** README’s classifier row is current, but its 947+6 count is stale; PLAIN-ENGLISH still says deferred/no sends; PUBLICATION says 20/21, DEFERRED, 743 tests; WHY says deploy pending. Evidence: `README.md:42,46`; `docs/PLAIN-ENGLISH.md:7-11`; `docs/PUBLICATION.md:33,46`; `docs/WHY.md:5`; `docs/SHOWCASE.md:57-58`. Fix: reconcile or explicitly archive every status block. |
| AP-02 | **STANDS-MODIFIED** | **P1 · runtime honesty/identity · High.** Footer describes the archived ActivationOps/DataSF/Gemini product and says no real sends despite the recorded Slack send. Evidence: `app/layout.tsx:50-65`; `docs/SHOWCASE.md:58`. Fix: rewrite for the current product; say this web replay initiates no sends. |
| AP-03 | **STANDS** | **P2 · frozen contract · High.** Correcting the footer/banner still conflicts with the byte-freeze. Evidence: `docs/plan-whole-site-redesign.md:18-24`; `docs/decision-log.md:143`. Fix: recorded reversal, semantic disclosure contract, parity test. |
| AP-04 | **STANDS-MODIFIED** | **P1 · production deployment · High.** Plan still uses unpinned Wrangler with `--branch main`; supplied Cloudflare facts establish that branch deploys target branch environments. Evidence: `docs/plan-debrand-design-armoury-2026-07-09.md:41`; `package.json:7-38`; `docs/decision-log.md:142`. Fix: authenticated project preflight, preview, confirmed production command, recorded version/deployment ID, canonical smoke. |
| AP-05 | **MOOTED** | **P3 historical · design governance · High.** The 2026-07-10 owner direction supersedes the Swiss hybrid for the new lane. Evidence: `docs/decision-log.md:143`. Oxblood remains the shipped-site history. |
| AP-06 | **STANDS-MODIFIED** | **P2 · legal/name precision · High.** S-11 closed, but diligence still says TESS, retains manual tails, and the suggestions ledger remains pending. Evidence: `docs/s11-curbside-commons-diligence.md:3,14,18-25`; `docs/suggestions-ledger.md:20`. Fix: synchronize and use “final non-commercial display brand; no clearance claimed” plus current USPTO terminology. |
| AP-07 | **STANDS-MODIFIED** | **P2 · routing/continuity · High.** Plan-v2 routing is obsolete and closure artifacts remain under-specified. Evidence: `docs/plan-debrand-design-armoury-2026-07-09.md:69`; `RULES.md:94-110`; `docs/decision-log.md:142`. Fix in plan v3. |
| AP-08 | **STANDS** | **P2 · de-brand scope · High.** The grep misses other names, encodings, mockups, and allowed factual attribution. Evidence: `README.md:7`; `app/layout.tsx:56-65`; `components/report/ReportView.tsx:114-117`. Fix: tracked edit/allow/archive/history inventory plus final-`out/` scan. |
| AP-09 | **STANDS** | **P2 · identity/golden policy · High.** Commerce Truth Audit remains in CLI, Slack, email, and frozen output. Evidence: `lib/packs/listings/demo/render-text.ts:43-50`; `lib/delivery/slack.ts:49,132`; `lib/delivery/email.ts:129,143-145`; `fixtures/synthetic-restaurant/expected-demo.txt:2`. Fix: decide historical versus current output before versioned regeneration. |
| AP-10 | **STANDS** | **P2 · honesty gate · High.** C10 excludes landing, layout footer, and mockups; banners remain duplicated. Evidence: `evals/packs/honesty-c10.test.ts:45-75`; `components/report/ReportView.tsx:110-118`; `lib/packs/listings/demo/copy.ts:47-54`. |
| AP-11 | **STANDS** | **P2 · regression gate · High.** Passing legacy tests cannot prove protected files were untouched. Evidence: `package.json:14`; `docs/reviews/unified-review-2026-07-10.md:11-13`. Require empty diffs from the slice-start SHA. |
| AP-12 | **STANDS** | **P2 · release integrity · High.** E2E is outside `verify`, runs against `next dev`, may reuse a stale server, and never tests `out/`. Evidence: `package.json:18-19`; `playwright.config.ts:21-25`. |
| AP-13 | **STANDS-MODIFIED** | **P2 · smoke/rollback · High.** “30 routes” includes two error pages; intended success set is 28. Evidence: `out/404.html`; `out/_not-found.html`; `docs/decision-log.md:138`. Fix: manifest, explicit 404 probe, bounded retry and rollback. |
| AP-14 | **STANDS** | **P2 · privacy/font precedent · High.** Current precedent requires zero external requests; older parents load Google Fonts. Evidence: `mockups/ultra-modern-2026-07-08/README.md:10-12,32`; `mockups/swiss.html:8-10`; `docs/decision-log.md:143`. |
| AP-15 | **STANDS-MODIFIED** | **P3 · mockup accessibility · High.** Parent fragments remain incompatible, although the specific Swiss composite is superseded. Evidence: `mockups/swiss.html:469,473`; `mockups/premium.html:429`; `mockups/story-flow.html:474,852`. |
| AP-16 | **STANDS-MODIFIED** | **P3 · demonstrability · High.** SHOWCASE now has the correct commands and labels, but plan C1/E still does not. Evidence: `docs/SHOWCASE.md:37-60`; plan lines `47,57-59`. Reuse SHOWCASE verbatim. |
| AP-17 | **STANDS-MODIFIED** | **P1 · external-source intake · High.** Emil material is still consumed before vetting. Evidence: plan lines `43-55`; `RULES.md:140-146`. Vet/pin/license/security-review first, or use repo-native motion rules. |
| AP-18 | **STANDS-MODIFIED** | **P3 · research traceability · High.** New references are owner-fixed, but the dated adopt/reject/license matrix remains absent. Evidence: `docs/decision-log.md:143`; plan line `46`. |
| AP-19 | **MOOTED** | **P3 historical · specification precision · High.** The original attribution corrections are valid, but the Swiss brief is superseded. Evidence: `mockups/swiss.html:137-144`; `mockups/premium.html:66`; `docs/decision-log.md:143`. |
| AP-20 | **MOOTED** | **P3 historical · sequencing · High.** This dual-flagship review now occurs before deploy. Evidence: `docs/decision-log.md:142`. Remove the stale post-deploy advisory from plan v3. |
| Gate P2 | **STANDS** | **P2 · attribution policy · High.** Genericization still conflicts with dated named market claims. Evidence: `README.md:59`; `docs/WHY.md:11,15`; `docs/PUBLICATION.md:15`. Preserve named citations in research records. |
| Gate P3-1 | **STANDS-MODIFIED** | **P3 · writing QA · High.** The xhigh prescription is superseded, but the missing anti-slop/public-writing review remains. Evidence: gate line `14`; `docs/decision-log.md:142`. |
| Gate P3-2 | **STANDS** | **P2 · banner parity · High.** The promised verbatim parity remains unenforced. Evidence: `copy.ts:47-54`; `ReportView.tsx:110-118`; C10 lines `88-101`. |
| Gate P3-3 | **STANDS-MODIFIED** | **P2 · supply-chain review · High.** Vendored content still needs its own dedicated review or explicit waiver. Evidence: plan lines `53-55`. |
| Gate P3-4 | **STANDS** | **P3 · deliverable definition · High.** “Short watchable record” remains unnamed and untestable. Evidence: plan lines `57-59`. |
| Gate P3-5 | **STANDS** | **P3 · disclosure specificity · High.** Generic disclaimers remain weaker, and C10 does not enforce semantic equivalence. Evidence: plan line `21`; `README.md:7`; C10 lines `77-99`. |

## Section B — fresh findings missed on 2026-07-09

| ID | Claim and evidence | Severity · category | Fix sketch · confidence |
|---|---|---|---|
| NEW-01 | The exported app is two products under one identity. README/metadata/report/demo describe a commerce-truth verifier, while `/`, `/console`, `/eval`, `/metrics`, `/audit`, `/cost`, and merchant routes execute ActivationOps. Evidence: `README.md:3,79`; `app/layout.tsx:26-32`; `app/page.tsx:170-180`; `app/console/page.tsx:55-68`; `app/eval/page.tsx:3-18`. | **P1 · product identity** | Choose the canonical public product; remove or explicitly namespace the legacy UI. **High** |
| NEW-02 | Landing says every fact/claim is checked, but the gate only validates declared claims and explicitly lacks full prose→claim coverage. Evidence: `app/page.tsx:131-139,173-180,300-305`; `docs/WHY.md:25`. | **P1 · capability honesty** | Narrow the copy or build and evaluate full claim extraction. **High** |
| NEW-03 | “Machine-checked in CI” is unsupported: no tracked CI workflow exists; only local scripts do. Evidence: `README.md:20`; `docs/PUBLICATION.md:23`; `package.json:7-32`. | **P1 · verification claim** | Add real CI or say “machine-checked by the committed test suite.” **High that repo evidence is absent** |
| NEW-04 | “Empty seat,” “nobody built it,” and first-mover claims violate the binding decision that the trust layer is crowded and public copy must not claim nobody automates it. Evidence: `README.md:13`; `docs/PLAIN-ENGLISH.md:35,43,56`; `docs/PUBLICATION.md:9,19`; `docs/decision-log.md:57`. | **P1 · positioning honesty** | Position the structured-SOR mechanism and verification rigor, without exclusivity claims. **High** |
| NEW-05 | README’s blanket all-synthetic/archive framing conflicts with active exported routes using the hybrid DataSF activation replay. Evidence: `README.md:7,68,79`; `lib/product.ts:15-17`; `app/console/page.tsx:103-107,158-161`. | **P2 · provenance/lineage** | Scope claims per module or remove legacy routes from the canonical site. **High** |
| NEW-06 | Public AI inventory says an LLM appears in one place, while SHOWCASE records two live-floor-cleared agents and `/eval` presents recorded Gemini output. Evidence: `README.md:51-53`; `docs/PUBLICATION.md:29-31`; `docs/SHOWCASE.md:29-35`; `app/eval/page.tsx:101-119`. | **P2 · capability inventory** | Separate truth-verdict path, classifier, agent extension, and legacy replay explicitly. **High** |
| NEW-07 | E2E actively locks the obsolete ActivationOps landing/console and can pass while the canonical product identity is wrong. Evidence: `evals/e2e/console.spec.ts:3-73`. | **P2 · acceptance-gate gap** | Add a cross-surface canonical-product contract covering metadata, H1, navigation, report/demo and disclosures. **High** |
| NEW-08 | Neither live site nor README exposes deployed commit/date, enabling silent site↔repo drift. Evidence: deployment at `docs/decision-log.md:138`; absent from `app/layout.tsx:50-67` and `README.md`. | **P2 · deployment provenance** | Publish canonical URL plus deployed SHA/date and verify during smoke. **High** |
| NEW-09 | CLI help says the classifier is deferred to F1b, while the live lane earned calibration; the deterministic-baseline distinction is not stated. Evidence: `bin/check.mjs:34-38`; `README.md:46`; `lib/tools/tools/classify-and-audit.ts:2-12`. | **P2 · runtime label clarity** | State that this CLI path uses the deterministic baseline and does not invoke the earned live lane. **High** |
| NEW-10 | Report uses ARIA tab roles without `tabpanel`, `aria-controls`, roving focus, or arrow-key behavior. Evidence: `components/report/ReportView.tsx:132-146`. | **P3 · accessibility** | Implement the full tabs pattern or use ordinary toggle buttons. **High** |
| NEW-11 | Package identity remains `commerce-truth-audit` while repo/site identity is Curbside Commons. Evidence: `package.json:2,6`; `README.md:1`; `app/layout.tsx:28-29`. | **P3 · identity** | Rename or document as an intentional stable internal identifier. **High** |
| NEW-12 | `mockups/` contains 54 files across superseded directions with no root status inventory. | **P3 · artifact hygiene** | Add a shipped/current/superseded/historical inventory; remove obsolete public artifacts only if provenance is unnecessary. **High** |
| NEW-13 | Public quickstarts use `npm install` despite a committed lockfile. Evidence: `README.md:27-34`; `docs/SHOWCASE.md:3`; `package-lock.json:1`. | **P3 · reproducibility** | Make `npm ci` the clean-room command. **Medium** |
| NEW-14 | Static security-header posture is neither source-controlled nor tested; `next.config.ts` only exports files and no header artifact exists. Evidence: `next.config.ts:3-10`. | **P3 · deploy hardening** | Verify provider defaults against current docs or source-control and smoke appropriate headers. **Medium/uncertain** |
| NEW-15 | Glossary still says last updated 2026-07-07 despite later earned classifier/send state. Evidence: `docs/GLOSSARY.md:3-5`; `docs/SHOWCASE.md:57-58`. | **P3 · documentation freshness** | Update status-sensitive entries or make the glossary definition-only. **High** |

## Section C — enhancement ranking

1. **Eval/observability dashboard — AGREE, move to #1.** The strongest earned evidence is buried, while `/eval`, `/metrics`, and `/cost` still render ActivationOps records (`app/eval/page.tsx:3-18`; `app/metrics/page.tsx:24-39`; `app/cost/page.tsx:2-19`). A static, provenance-carrying truth-engine dashboard has the best hiring payoff, lowest risk and perfect $0/offline fit.

2. **Pre-registered RAG lane — AGREE WITH CONDITIONS, move to #2.** It adds genuine capability, but “the one missing floor” is overstated: real entity matching, operated observability, auth and validated demand are also absent (`README.md:65-71`). Exact deterministic rule lookup already exists. RAG should be citation-required, abstaining and advisory, with retrieval, support, citation, injection and version-pin floors committed before evaluation.

3. **Missing candidate: adversarial entity resolution/messy-input ingestion — insert at #3.** This directly attacks the project’s admitted synthetic-controlled matching limitation (`README.md:68`) using offline precision/recall and fail-to-human floors. It deepens the actual product moat more than another integration demo.

4. **MCP-Slack interactive approvals — DISAGREE with #2; move to #4.** Current MCP is local stdio, while Slack is a one-way webhook proof (`docs/SHOWCASE.md:21-27,58`). Interactive approvals require authenticated ingress, actor identity, replay protection, idempotency, expiry, persistence and a public endpoint. An offline signed-action simulator can precede any owner-armed live lane.

5. **Email one-shot — AGREE at #5.** The MIME builder is already complete and Slack has proven transport. A live email adds delivery risk with little incremental hiring signal (`lib/delivery/email.ts:1-28`; `docs/SHOWCASE.md:58`).

## Five fixes first

1. Resolve the truth-engine versus ActivationOps public identity split.
2. Reconcile stale README/docs/footer status, data, AI, send and deploy claims.
3. Remove the full-claim-coverage and empty-seat/first-mover overclaims.
4. Make the CI claim real—or correct it.
5. Prove exact production targeting and exact-artifact deployment before redeploy.

**VERDICT: REVISE**
CODEX_EXIT=0
```

---

# S0 round-1 verdict (gpt-5.6-sol @ high, thread 019f4d89, 2026-07-10): VERDICT: REVISE — raw verbatim below
```

The review used committed HEAD `99e8c78`. Concurrent owner/orchestrator changes to `CURRENT_TASK.md`, `HANDOFF.md`, and `PROJECT_STATE.md` were left untouched.

## 1. Finding-discharge audit

Adequately discharged in principle:

- AP/F stale public records and positioning: S1.
- Footer/send wording and freeze reversal: S2.
- Missing CI: S3, subject to the CI qualifications below.
- Broad de-brand inventory: S4, subject to the taxonomy clarification below.
- S-11 terminology and named demo record: S7.
- Cloudflare preview-first production deployment: S8.
- Font/source matrix/design-reference handling: S6.
- F-14 hold-and-release uncertainty: S6 explicitly confirms the reference or creates an original interaction.
- NEW-02/04/05/06/09/13/15: S1/S3.
- AP-05/19/20 remain correctly mooted.

Findings not adequately discharged:

1. **NEW-01 / NEW-07 — identity remains unresolved.**  
   Plan lines 11–12 and 20 retain `/console`, `/audit`, and 20 `/merchant/*` pages at canonical root URLs with labels. Labels do not repair primary navigation, metadata ownership, route hierarchy, or the fact that most exported product routes remain ActivationOps. The plan also builds the canonical E2E contract in S5 before E1 replaces the remaining legacy `/eval`, `/metrics`, and `/cost` surfaces.

   Fix: adopt a genuine `/legacy/**` namespace; build E1 before freezing canonical navigation/E2E; maintain separate canonical and legacy E2E contracts.

2. **AP-11 / F-05 — protected-path proof is ineffective.**  
   Plan line 31 checks `evals/goldens-frozen` and `fixtures-frozen`, neither of which exists. The repo contains 130 tracked `evals/**` files and 139 `fixtures/**` files, so only `legacy/` is actually protected.

   Fix: use real pathspecs—at minimum `legacy/`, `evals/`, and `fixtures/`—plus an exact per-slice allowlist for intentional additions. Existing frozen-file modifications or deletions must fail unless separately authorized and reviewed.

3. **AP-09 / F-03 — S4 contradicts its own golden policy.**  
   S4 says never touch eval goldens, then defaults AP-09 to current output and permits golden regeneration. Batch B subsequently lets S5 and E1 consume those changes before reviewing the freeze-boundary migration.

   Fix: resolve historical-versus-current at S0. Recommended decision: current generated outputs use Curbside Commons through a versioned template/golden migration; the historical send record remains immutable. Give that migration a dedicated review and explicit frozen-file allowlist before S5.

4. **AP-10 / F-04 — mockup honesty coverage remains partial.**  
   S2 proposes “a mockup claim test,” while S6 creates a later mockup checked only by a manual regex sweep.

   Fix: the automated honesty gate must dynamically cover every claim-bearing mockup classified current/new by the mockup inventory, with explicit historical exclusions.

5. **Gate-P2 / F-13 — the dated-market-claim class is not executable.**  
   S1 names the “third class,” but S4’s inventory taxonomy only says factual attribution may be kept. An executor could preserve the same named public claims that triggered the finding.

   Fix: state the rule verbatim: dated public-market prose is genericized; its named, dated citation is preserved and linked in the research digest.

6. **NEW-08 — deployed provenance is designed but not implemented.**  
   E1 designs a SHA/date line; S8 expects it to be correct. No slice defines how SHA and time enter the static artifact. A literal deployment date is unknown when the single build is hashed.

   Fix: inject and test source SHA plus UTC build timestamp before the exact-artifact build, labeling them accurately. Record Cloudflare deployment ID/time separately after deployment.

7. **NEW-10 — the actual ReportView tabs are not fixed.**  
   E1 only promises correct tabs where the dashboard reuses them. The cited defect remains in `components/report/ReportView.tsx:132-146`.

   Fix: explicitly repair ReportView or replace its ARIA tab roles with ordinary toggle-button semantics; add keyboard coverage.

8. **NEW-11 — package identity remains an execution-time fork.**  
   “Rename or record” in S5 is not a decision.

   Fix: resolve at S0. Renaming to a Curbside Commons-aligned package name is preferable unless a concrete compatibility reason requires the old internal identifier.

9. **NEW-12 — mockup inventory remains incomplete.**  
   S4 inventories brand hits, not all 54 artifacts by shipped/current/superseded/historical status.

   Fix: add a root `mockups/README.md` inventory covering every artifact and its publication status.

10. **AP-15 / F-12 — interaction acceptance is incomplete.**  
    S6 covers reduced motion, contrast and anchors but omits no-JS readability and general keyboard/focus/semantic behavior.

    Fix: add those checks, including a non-pointer equivalent for hold-and-release.

11. **NEW-14 — header policy is evaluated too late.**  
    S8 checks header posture during/after production deployment. Any required `_headers` or equivalent change would invalidate the already reviewed and hashed candidate.

    Fix: decide the policy during preflight, test it on preview, then promote and reconfirm in production.

12. **NEW-03 — CI is only partially complete.**  
    S3 makes the central CI claim true for `verify` and legacy tests, but canonical E2E added later is not run by CI. The claim and workflow are also proposed in the same push, before the first green result exists.

    Fix: run E2E in CI, pin Node 24 and actions, use least permissions and concurrency, and publish the claim only after the workflow’s first green run.

## 2. Identity pressure-test

### Strongest case against label-as-legacy

The recommendation fixes wording but not information architecture. Today primary navigation grants `/console` and `/audit` equal status with `/report` and `/demo` (`components/Nav.tsx:7-15`). The landing’s two main CTAs point to `/console` (`app/page.tsx:183-185,348-350`). Under the plan, 22 legacy routes remain at root—console, audit and 20 merchants—while the smaller truth-engine surface is declared canonical.

That means a hiring reviewer enters a truth-verifier site and is immediately routed into merchant-activation outreach. Global truth-engine metadata/footer then wraps legacy pages, while page-level labels must carry the entire semantic boundary. This is brittle, SEO-ambiguous and difficult to test. The proposed “legacy link” for the old eval/metrics/cost records also has no defined destination.

Full removal makes the cleanest public product. It does not destroy the work: `legacy/activation`, tests, records and documentation remain runnable. Its drawback is losing a browsable visual lineage.

A `/legacy/` path split is the strongest balance:

- Canonical nav contains only truth-engine surfaces.
- One secondary “Legacy activation module” link leads to `/legacy/console`.
- All activation pages use their own route-group layout, metadata, footer and provenance.
- Merchant breadcrumbs return to `/legacy/console`, not `/`.
- Old root URLs receive an explicit tested policy: static redirects or 404.
- E2E retains both the canonical contract and the legacy why-chain.
- Exported-route manifest classifies canonical, legacy and error routes.

Final position: **use `/legacy/` separation**. Full removal ranks second; label-only root routes rank last.

## 3. Slice-order and review-batch defects

1. **Slices are pushed before review.**  
   Line 14 authorizes per-slice commit and push; line 31 delays review to batches. Public S1/S2 changes, S4 frozen-output changes and S5 identity changes can therefore be pushed before review.

   Fix: local checkpoint commits are acceptable, but push only after the corresponding batch is reconciled and gates rerun. Freeze/identity migrations should receive dedicated reviews.

2. **Batch B crosses a frozen-golden boundary.**  
   S4 may regenerate frozen output, then S5/E1 consume it before review.

   Fix: review and close the migration before S5.

3. **Pre-registration boundaries are reviewed after scoring.**  
   E2 and E4 commit floors before results, but their Codex batch runs after both. The independent reviewer sees the floors only after results exist.

   Fix: add a pre-run review of corpus composition, leakage, metrics and floors before scoring; review results separately afterward.

4. **The release acceptance gate runs too early.**  
   Line 31 places it after batch B, but S6, E2, E3, E4 and S7 subsequently change the deployed commit. Wrap acceptance occurs after deployment.

   Fix: retain post-B as an identity milestone, then require the release acceptance gate after final batch reconciliation and before S8.

5. **E1 is built before E2–E4 evidence and never refreshed.**  
   The plan then parks a second deployment to add those rows even though S8 has not happened yet.

   Fix: add an E1b/dashboard-and-SHOWCASE reconciliation after E4 and before final review/S8; deploy once.

6. **S5 freezes identity before E1 completes identity replacement.**

   Fix order: decide namespace and route skeleton → build E1 current evidence → finalize canonical/legacy navigation, metadata and E2E.

7. **The legacy-record link has no produced destination.**

   Fix: define the `/legacy/**` destination and route manifest before E1 emits links.

8. **S6’s dedicated Emil review occurs after consumption unless made intra-slice.**

   Fix: VET/pin/license/security review must be a hard stop before the brief or sample uses the source; the later batch reviews only the resulting work.

9. **S8 hard-codes “28 routes” despite route changes.**

   Fix: generate the manifest from the exact export and compare it with an explicit expected route set; test unknown-path 404 separately.

10. **S1 writes 961+7 before later slices raise the count.**

    Fix: use a dated, commit-scoped count or avoid volatile totals; run a final public-claim reconciliation after E4.

11. **S7 records transcripts before batch-D fixes.**

    Fix: reconcile E3/E4 first, rerun gates, then generate the record from the final candidate SHA and review it separately.

12. **Identity, AP-09 treatment and freeze reversal lack an explicit S0 owner-disposition checkpoint.**

    Fix: record all three decisions before S1; Codex approval is advice, not owner disposition.

## 4. “Well built, covered in all aspects” gaps

- **RAG provenance:** pin embedding model ID, revision/hash, license and storage dependency; prove a clean network-denied run with no runtime download.
- **RAG integration contract:** specify whether the new tool is exposed through MCP; update registry schemas, tool envelopes, MCP transcript/tool count, SHOWCASE and relevant crew allowlists deliberately.
- **RAG evaluation:** include chunking/version metadata, citation precision, unsupported-answer rate, abstention calibration, retrieval-injection tests and deterministic BM25 baseline comparison.
- **Approval simulator threat model:** define signer identity, authorization, nonce, clock injection, tamper/forgery/wrong-actor tests, key handling, and prove it cannot send or mutate live state.
- **Entity resolution architecture:** state whether it is advisory or gating, how exact matching remains protected, tune/test separation, ambiguity abstention and false-merge cost.
- **Public discoverability:** E2–E4 must update the dashboard, SHOWCASE, glossary and limitations before the single deployment.
- **Exposed-split FAQ:** add the prepared answer that neither classifier split may be rerun; new claims require fresh pre-registration.
- **History disclosure:** state that current surfaces are de-branded while git history is intentionally preserved for provenance.
- **CI robustness:** add E2E, timeout/concurrency, minimal permissions, immutable action pins and artifact/build evidence where useful.
- **Final clean-room gate:** `npm ci` from a clean checkout, full verify/legacy/E2E, protected-file manifest, offline tests, exact-export hash, preview smoke, release acceptance, then production.

Blocking findings: identity must move to `/legacy/**`; protected paths must be corrected; AP-09 must be decided and reviewed before consumption; pushes must follow review; pre-registration and external-source gates must precede use; E1 must be refreshed after E2–E4; final acceptance must move immediately before deployment; provenance/header/route validation must occur before promotion.

VERDICT: REVISE
```

---

# S0 round-2 verdict (2026-07-10): VERDICT: REVISE — 7 blocking defects, raw verbatim below (all accepted → v3.2)
```
3,80,802
Plan v3.1 still has seven blocking defects at committed HEAD `46006f0`.

1. **Identity instructions contradict the accepted disposition.**  
   Line 5 fixes `/legacy/**`, but lines 16–17 still prescribe “**Label-as-legacy + dashboard replacement**” on root `/console`, `/audit`, and `/merchant/*`, treating `/legacy/` as merely an alternative. Line 4 says decisions are fixed before S1, while line 5 delays owner ratification until before S5 even though E1a consumes `/legacy/**` at line 26.

   Fix: replace lines 16–17 with the accepted `/legacy/**` architecture and require owner ratification before S1/E1a.

2. **CI claim sequencing is impossible.**  
   Line 23 puts workflow creation and the README CI claim in S3. Line 43 says the claim publishes only after the first green run, but line 41 prevents pushing until batch A review. The workflow cannot run before it is pushed.

   Fix: S3a = workflow-only, review, push, observe green. S3b = add the CI claim, review, push.

3. **Emil content can still be consumed before its dedicated review closes.**  
   Line 28 mentions a dedicated review leg but proceeds directly from VET to brief/build; line 42 reviews all of S6 only afterward in batch C.

   Fix: create an explicit S6a hard gate: VET/pin/license/security review → reconcile/close → only then brief and sample.

4. **S7 and batch D are circular.**  
   Line 33 says S7 executes “**AFTER batch D reconciles**”; line 42 includes S7 inside batch D. Additionally, a record “generated from the final release-candidate SHA” cannot be committed without changing that SHA.

   Fix: batch D reviews E2/E3/E4/E1b; after reconciliation, generate S7 against a named source-under-test SHA; review S7 in a separate batch E; establish the final release SHA afterward.

5. **The release-gated artifact is rebuilt and changed in S8.**  
   Line 34 builds and hashes exact `out/`. Line 35 then decides header policy, may add `_headers`, and builds again. Even without source changes, the injected UTC build timestamp guarantees a different artifact.

   Fix: perform Pages/header preflight and create the sole timestamped build before the release gate. The gate tests and hashes that immutable `out/`; S8 only preview-deploys, promotes, and smokes the same directory. Gate evidence must attest to the source SHA/artifact hash without triggering a rebuild.

6. **Dynamic mockup honesty coverage still misses the S6 artifact.**  
   Line 39 covers mockups classified current/new in the earlier S4 inventory. S6 creates a later mockup, while line 28 still specifies only a manual regex sweep.

   Fix: S6 must update the inventory and prove the new artifact is automatically included in C10’s dynamic scan.

7. **The accepted S6 accessibility fold remains incomplete.**  
   Line 28 covers reduced motion, contrast and anchors, but still omits the required no-JS fallback and keyboard/focus/semantic validation for the hold-and-release interaction.

   Fix: add explicit no-JS readability, keyboard-equivalent operation, focus behavior and semantic checks to S6 acceptance.

VERDICT: REVISE
```

---

# S0 round-3 verdict (2026-07-10): VERDICT: REVISE — 3 blocking defects, raw verbatim below (all accepted → v3.3)
```
4,11,311
Three blocking defects remain in v3.2:

1. **The release gate still performs a second build.**  
   Line 36 declares “**the SOLE timestamped build**” and makes `out/` immutable. Line 37 then runs “**full verify**” while claiming to attest “**WITHOUT rebuilding**.” At HEAD, `package.json:18` defines `verify` as typecheck + lint + tests + `npm run build`. The second build receives a different UTC timestamp and cannot match the accepted artifact.

   Fix: create the sole artifact from a clean isolated checkout at the candidate SHA, with `npm ci`, recorded tool versions and one fixed timestamp. The release gate must run explicit no-build checks afterward and only rehash/inspect that artifact.

2. **The exact exported artifact still lacks E2E coverage.**  
   Line 37 runs both contracts on a “fresh server,” but the current `playwright.config.ts:21-25` starts `next dev`, not a static server over immutable `out/`. Preview smoke is narrower than the full canonical and legacy contracts.

   Fix: add an artifact-mode Playwright configuration that serves the recorded `out/` without building and run both E2E contracts against it before SHIP attestation.

3. **Preflight can change source after the final Codex batch.**  
   Line 36 permits adding source-controlled `_headers` after batch E, but line 45 defines no review batch covering PRE-GATE BUILD+PREFLIGHT. A header-policy change could therefore enter the supposedly final candidate without changed-files review.

   Fix: decide and commit header policy before batch E, or add batch F for any preflight-induced source/configuration change. Only then declare the candidate final and perform the sole build.

VERDICT: REVISE
```
