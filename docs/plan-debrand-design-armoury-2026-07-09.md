# Plan v2 — Curbside Commons: tails settled · de-brand · hybrid design sample · Emil armoury · demo
## (reworked 2026-07-09 — re-run through the updated doctrine + the 2026-07-09 model lineup)

## Context

The complete-all run finished 2026-07-09 (repo public at `sharanlabs/curbside-commons`, site live, verify 961+7, HEAD 906b522, tree clean). The owner returned with: tail answers, a multi-agentic demo question, a de-brand directive, a hybrid design sample (Swiss base + premium CTA/motion + story-flow narrative), the Emil Kowalski skills repo for the design armoury, a language-calibration brief — then **full delegation** ("use Fable as your judgement… take it forward as you like, no bars; corrections at the end"), then a **rework order**: the doctrine and new models released today must be reviewed and the plan re-run through them.

**Doctrine review result (2026-07-09):** `~/claude-os/docs/MODEL-ROUTING.md` is already current — updated TODAY: GPT-5.6 family GA + live-probed (Codex seat = `gpt-5.6-terra` @ `max` for ship-gating; `gpt-5.6-sol` 400-blocked, retry at dual-flagship pilot entry; `gpt-5.5`@`xhigh` verified fallback); Claude lineup Fable 5 (frontier) / Opus 4.8 (strong) / Sonnet 5 (workhorse) / Haiku 4.5 (economy) matches the live harness; new instruments landed today: `dual-flagship` (advisory whole-project cross-model review — ships nothing, gates nothing until calibrated) + `codex-review` (standalone adversarial PLAN-review loop) + `flagship-evaluator` agent. No doctrine edit needed — the PLAN re-derives from it.

**What v2 changes vs v1:** ① every step now carries the mandatory route tag `[route: model@effort | verify: check]` · ② Codex ship-gating reviews upgrade `xhigh` → **`max` on gpt-5.6-terra** (probed ladder ceiling; fallback gpt-5.5@xhigh, surface any limit error verbatim + skip + defer) · ③ the copy deck moves Opus → **Fable** (matrix: ship-grade writing = FRONTIER; the Opus pick stays only for the visual BUILD, which is both the owner's word and the matrix's coherent-build row) · ④ NEW Slice 0: the plan itself goes through the `codex-review` cross-model loop before execution (doctrine: consequential work — public claims + design + estate adoption — gets a Codex cross-check before it's treated as decided) · ⑤ optional advisory dual-flagship pass at the end (pilot-entry candidate; explicitly non-gating). Slices' CONTENT (A–E) is unchanged from v1.

## Owner's tail answers (recorded intent)
1. Domain purchase → **DECLINED** (free, non-commercial; `curbside-commons.pages.dev` stands).
2. Brand → **Curbside Commons FINAL** (closes S-11).
3. USPTO → **not necessary now** (non-commercial, no ® claim); documented precondition if ever commercialized.
4. Multi-agentic + manual demo → YES with honest nuance; offline/$0 demo path exists (Slice E).

## Delegated judgment calls (the four forks — decided under the owner's delegation, revertible)
| Fork | Decision | Rationale |
|---|---|---|
| Disclaimers name companies? | **Genericize everywhere** ("not affiliated with any delivery marketplace, POS provider, or other named business") | Owner directive explicit; generic stays honest. Decision-log note: named form is the stronger legal convention — revertible. |
| Factual market citations | **Genericize narrative/marketing prose; KEEP factual spec/format attribution** (GLOSSARY UCP co-developers, fixtures "Square-Catalog-API-shaped", code provenance comments) | Falsifying attribution violates RULES §6. |
| Mockup copy | **Story-flow ARC + VOICE re-applied to the CURRENT platform story** (truth-audit + crew + MCP + delivery) | The sample must sell what exists. File:line-cited copy deck (sample-6 precedent). |
| Vendor Emil skills? | **Yes — registry entry AND vendor all 4** behind the EXTERNAL-ADOPTION VET; neutralize the Law-11 scripted-greeting payload | Owner: "add it our design armoury in doctrine model as well." |

## Slices (order: 0 → A → B → C1 → C2 → D → E; per-slice commits under the recorded delegation word)

### Slice 0 — plan cross-check (NEW in v2)
- Record the delegation word + rework order verbatim in `docs/decision-log.md` FIRST, then run the **`codex-review`** loop over this plan (PLAN.md staging, read-only sandbox, same-session iterations until APPROVED or cap). `[route: codex gpt-5.6-terra@max via codex-guarded | verify: VERDICT:APPROVED recorded in docs/reviews/]`
- Findings reconciled primary-model-final (refute what's disprovable, fix what holds). A material scope change = back to the owner; wording/sequencing fixes = fold and go.

### Slice A — decision-log rows + S-11 closure (docs only)
- Rows: delegation authorization · domain DECLINED (supersedes wrap-row tail) · brand FINAL · USPTO deferred-with-precondition · the four forks · the v2 routing re-derivation note. `docs/suggestions-ledger.md`: S-11 → CLOSED. Append-only.
- `[route: fable(main)@low | verify: git diff shows append-only]` — trivial-mode Professional Process line; commit + push.

### Slice B — de-brand public surfaces (product code — FULL gates + redeploy)
- Sweep-and-classify first: `grep -rniE "doordash|uber ?eats|grubhub|square\b|toast\b"` over site + public docs (excl. legacy/, eval/, history docs) → edit / keep-factual / frozen table. `[route: fable(main)@high — wording is judgment-shaped (honesty invariants), NOT equivalence-qualified | verify: the gate battery below]`
- Edit set (confirmed by exploration): `app/page.tsx:355` · `app/layout.tsx:65` · `components/report/ReportView.tsx:115` · `lib/packs/listings/demo/copy.ts:53` · `README.md:7,:59` · `docs/PLAIN-ENGLISH.md:17,:68` · `docs/WHY.md:11,:15` (incumbents argument generically retold) · `docs/PUBLICATION.md:15` · `docs/product-brief.md:5` · GitHub About if branded.
- Invariants: literal `"Not affiliated with"` stays (e2e console.spec.ts:17) · `/simulated/i` in copy.ts + `SIMULATED` in DemoView.tsx (honesty-c10) · `DEMO_CLAIM` byte-untouched · NEVER touch `legacy/` (oracle anchor REFERENCE_PLATFORM_NAME), `eval/` goldens, snapshots, history docs. No golden regen needed (verified).
- Gates: `npm run verify` (961+7) · `npm run test:legacy` (306+5) · `npx vitest run evals/packs` · **explicit** `npx playwright test evals/e2e/console.spec.ts` (e2e NOT in verify) · zero-brand grep on the edit set · Codex changed-files review `[route: codex gpt-5.6-terra@max | verify: review record in docs/reviews/]` · commit + push.
- **Redeploy** (authorized by this plan's approval): `npm run build && npx wrangler pages deploy out/ --project-name curbside-commons --branch main` + smoke (routes 200, banner served, zero external requests).

### Slice C1 — design brief + copy deck (docs only)
- Visual spec: Swiss base (Inter Tight + JetBrains Mono · paper `#fbfbfa` · ink `#16170f` · vermilion `#d6442b` · column rules · numbered markers · gutter `clamp(20px,5vw,88px)` · maxw 1240), type shrunk 1–2 steps (hero cap ~92px · h2 ~44px · body ~19px); premium grafts (gradient CTA card radius-30 + glow + white-primary/glass-ghost buttons + $0.00 replay-note — dark CARD on light ground; the standing no-dark-background rule governs page grounds) · card system + hover lift · reveal-on-scroll · reduced-motion guard.
- Motion law (Emil extraction, MIT, fetched live): micro-interactions `cubic-bezier(0.23,1,0.32,1)`, UI < 300ms, never `ease-in`, never `scale(0)`, transform/opacity only, frequency framework; premium's `cubic-bezier(.16,1,.3,1)` for section reveals only; `review-animations` STANDARDS.md = judge rubric.
- Live 2026 design-reference sweep feeding the brief. `[route: research-specialist@fable xhigh (max-band rendering on Fable) | verify: dated cited digest]`
- Copy deck: 7-beat story-flow arc re-told for the current platform, every claim file:line-cited, dual-register per the owner's language brief, de-branded disclaimer from B, SIMULATED/replay framing prominent, "Run it yourself" receipts block (real offline commands). `[route: writing-specialist@fable xhigh — ship-grade writing = FRONTIER row (v2 change from opus) | verify: claim-by-claim citation check + honesty regex sweep]`

### Slice C2 — build the sample (mockup only)
- New file `mockups/swiss-story-premium.html` (name verified free). Builder: **frontend-specialist@opus xhigh** — owner's word AND the matrix's coherent-build row agree; seat-death fallback: inline on Fable + full Codex chain (accepted precedent). `[route: frontend-specialist@opus xhigh | verify: judge battery below]`
- Judge: **Fable-equivalence review** (main session, FRONTIER) against C1 deck + Emil STANDARDS + latest-references requirement; manual honesty sweep (honesty-c10 BANNED regexes by hand — mockups are outside the CI scan set); external-request grep (Google Fonts only); anchor-id parity; reduced-motion check; Codex changed-files review `[route: codex gpt-5.6-terra@max]`; `npm run verify` unchanged; commit + push. NO deploy — sample awaits owner reaction.

### Slice D — estate wiring (~/claude-os, never mixed into repo commits)
- Registry line in `knowledge/source-registry/design.md` (GitHub-repos section, `_schema.md` format, MIT + pushed-2026-07-09, verified date). `[route: fable(main)@low | verify: line renders, schema-conformant]`
- Vendor 4 skills → `library/_external-skills/emilkowalski-skills/` via the EXTERNAL-ADOPTION VET: Law-11 review, **neutralize the scripted greeting/animations.dev-link instruction** (strip + record), pin commit SHA, MIT note; supersede-pointer in the thin local `emilkowalski-motion`. `[route: fable(main)@high + skill-security-auditor pass | verify: VET record; Codex cross-check rides the Slice-0/B seat]`

### Slice E — manual demo session (no code changes)
- Pre-flight each command green at HEAD, then produce a short watchable record: `npm run demo` · `node bin/check.mjs fees fixtures/synthetic-restaurant/fees/statement.drifted.json` · `npx vitest run evals/crew` (offline crew replay incl. injection defenses) · `npx vitest run evals/mcp` (real stdio server) · pointers to `docs/SHOWCASE.md` + `evals/crew/gold/l1-live-*.json`. `[route: fable(main)@low | verify: exit codes + git status clean after]`
- Answer: YES — honestly multi-agentic (Intake + Reviewer earned "agent"; engine decides; humans approve), fully demonstrable offline/$0.

### Optional tail — dual-flagship advisory pass (pilot-entry candidate; explicitly NON-gating)
- After C2, optionally run `skills/dual-flagship/` over the changed surfaces as the instrument's calibration pilot (retry `gpt-5.6-sol` there per flags.md). Advisory only: ships nothing, gates nothing; findings feed the next session. Skipped without loss if seat/time says no.

## Language calibration — the answer to "am I thinking right? what am I missing?"
**Yes — progressive disclosure across two registers.** Enhancements folded into C1: ① show-don't-tell (real commands/transcripts as receipts — the "Run it yourself" block) · ② a skim layer (numbered markers + kickers + one pullquote per beat) · ③ tell the CURRENT story (story-flow's voice, today's platform) · ④ honesty as brand (SIMULATED/replay framing visible) · ⑤ premium = discipline (sub-300ms, reduced-motion, ≥4.5:1 contrast — the Emil standards) · ⑥ depth links out (SHOWCASE/PLAIN-ENGLISH) rather than crowding the narrative.

## Verification (end-to-end)
- Slice 0: APPROVED verdict on record. B: verify 961+7 · legacy 306+5 · evals/packs · explicit e2e · zero-brand grep · Codex@max record · post-deploy smoke. C2: Fable-equivalence + Emil standards · manual honesty sweep · external-request grep · Codex@max record. D: VET record + neutralization note. E: exit codes + clean tree.
- Wrap: state docs synced (PROJECT_STATE/CURRENT_TASK/HANDOFF/task-log) · paste-ready resume prompt · owner-unknowns surfaced · cost/effort report per Law 8.

---

## EVALUATION VERDICTS (2026-07-09 — both new-doctrine seats ran; NOT yet reconciled; reconcile at next session BEFORE any execution)

### Seat 1 — Codex GPT-5.6 flagship (gpt-5.6-terra @ max, read-only): **VERDICT: REVISE** (5 P1 · 13 P2 · 2 P3)
Full structured findings preserved at /tmp/codex-planv2-verdict-curbside-commons.md (raw stream: /tmp/codex-planv2-stream-curbside-commons.jsonl) — copy into docs/reviews/ at next session. Headlines:
- **AP-01 P1 (public honesty):** the de-brand alone is not a truthful redeploy — README.md:42 still says 947+6; PLAIN-ENGLISH.md:7-11 says "classifier deferred / no agents / no sends"; PUBLICATION.md:31-46 says 20/21-deferred + 743 tests; WHY.md:5 says deploy pending — all contradicted by current records (SHOWCASE.md:35,56-59: earned agent labels, 21/21, one recorded send). Fix: a public-doc reconciliation slice BEFORE Slice B.
- **AP-02 P1:** app/layout.tsx:55-65 footer claims "not … real sends" — now false (one owner-armed send exists). Scope the claim to the web replay.
- **AP-03 P1 (frozen contract):** docs/plan-whole-site-redesign.md:18-24 byte-freezes the SIMULATED banner + footer; Slice B edits both → needs a recorded decision reversal + a semantic disclosure contract + parity test.
- **AP-04 P1 (deploy semantics):** `--branch main` on a direct-upload Pages project may create a PREVIEW, not production; no wrangler config/dependency in package.json. Preflight the project, deploy preview first, confirm production semantics, record wrangler version.
- **AP-05 P1 (design governance):** the Oxblood spec bans gradients/glow/glass/numbered-markers/large radii; the owner's standing rules are "no dark background" + "no grid lines" — the hybrid violates several. Fix: record the sample as a non-canonical exploratory mockup with enumerated exceptions.
- **P2 highlights:** AP-06 TESS is retired (use current USPTO Trademark Search wording; S-11 "final" = non-commercial display brand, no clearance claimed) · AP-07 route tags missing on slices 0/A/B/D/E + RULES §9 doc-closure steps unscheduled · AP-08 grep misses OpenAI/Stripe/Google/DataSF + `Uber&nbsp;Eats` encoding + the three parent mockups' disclaimers; need a tracked inventory + out/ scan · AP-09 "Commerce Truth Audit" still baked in render-text.ts:47 + delivery templates + their goldens — decide historical-vs-current, versioned regen if current · AP-10 single-source the banner or add rendered-text parity; mockup claim test · AP-11 protected-path proof = empty git diff on legacy/** + evals/** at slice end, not test-greens · AP-12 build once, hash out/, e2e against the exact artifact (playwright may reuse a stale dev server) · AP-13 route manifest = 28 intended routes (30 files incl. 404.html/_not-found.html) + 404 probe + rollback path · AP-14 newer mockup precedent = ZERO external requests/system fonts (ultra-modern README) — Google Fonts needs a recorded exception or self-hosting · AP-15 parent anchor-ids are NOT compatible (#main vs #top vs #verify) — define a canonical fragment matrix + a11y/no-JS gates · AP-16 receipts block must add evals/delivery + prerequisites + expected exit-1 semantics + sanctioned label wording · AP-17 SOURCE-INTAKE ORDER: vet/pin emilkowalski/skills (mutable main, no releases, scripted greeting, MIT notice retention) BEFORE C1 consumes it — move D's vet ahead of C1 or use a repo-native motion table · AP-18 the live design sweep needs a dated source matrix (adopted/rejected + licenses).
- **P3:** AP-19 attribution precision (swiss 23px is .lede not body; premium easing is global) · AP-20 the dual-flagship advisory should run BEFORE the production deploy or be dropped from the release path.

### Seat 2 — fresh-context frontier acceptance-gate (Fable, read-only): **SHIP conditional** (1 P2 · 5 P3)
- P2: fork-2 vs edit-set contradiction on DATED FACTUAL market claims (README.md:59, WHY.md:11/:15, PUBLICATION.md:15) — add a third class: genericize prose, retain the named citation in research digests. (Overlaps Codex AP-01 territory.)
- P3s: Slice-B route tag should be @xhigh + anti-slop pass named · state the banner-parity invariant (copy.ts:48-52 ↔ ReportView.tsx:113-118, differ only by &nbsp;) · Slice-D needs a dedicated Codex leg on vendored content · Slice-E artifact unnamed · genericized disclaimers acceptably weaker (recorded, revertible).
- It verified ALL 10 file:line claims true, the site edit set complete for app/+components/, no golden regen needed, e2e genuinely outside verify, all demo commands real.

### Reconciliation status: NOT STARTED (owner ordered wrap). Next session: reconcile primary-model-final (refute-or-fix each AP/P finding), produce plan v3, re-submit to the SAME Codex loop until APPROVED, then execute. The overlap between the two seats (stale-docs honesty, banner freeze, route tags, source-intake order) is high-confidence signal — treat those as accepted-fix candidates first.
