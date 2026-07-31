# Re-evaluation through the updated estate — 2026-07-30

**Trigger:** owner, `/claude-os` — *"revaluate through updated estate the project. Tell next steps. Completely own judgement."*
**Seat:** Opus 5 (1M) · **Stage:** triage of an existing project → ranked forward-proposals · **Effort:** high (ship-gating judgment, no code changed)
**Scope:** assessment only. No product code, no state-doc rewrite, no deploy. Every number below was **measured today**, not carried from a session log.

---

## Verified state at HEAD (measured 2026-07-30)

| Check | Result | How |
|---|---|---|
| `git status` | clean | — |
| `main` vs `origin/main` | **0 / 0 — push is done** | `git rev-list --left-right --count` |
| `npm run verify` | **exit 0 · 1574 passed + 8 skipped · 61 pages built** | run today at `fb6c327` |
| Live routes | 6/6 → 200 | `curl` |
| **Live commit** | **`b2f781f`, built 2026-07-28T14:50Z** | footer provenance |
| **Undeployed delta** | **16 commits** | `git log b2f781f..HEAD` |

One methodology note, because it nearly became a finding of its own: the first verify run reported "exit 0" while the build had actually **failed**. The run was piped (`npm run verify | tail`), so the exit code belonged to `tail`. Re-run unpiped, it is genuinely green. *A pipeline reports the last command's verdict, not the one you care about* — the same shape as this repo's recurring "a claim broader than the thing backing it."

---

## Finding 1 — Production is serving a claim the repo retired as false

**The repo is honest. Production is not.** Session 38 measured the built export and found the "no network requests" claim false (12 post-load requests: `<Link>` viewport prefetch pulling RSC payloads). It was corrected across five shipping surfaces on 2026-07-29, committed, pushed, and green.

That correction is **one of the 16 commits that has never been deployed.** Measured on the live site today:

- `/playground` — the retired claim is **still visible, 4 times** (7 raw grep hits; 3 are the inlined RSC payload double-counting the rendered strings — the honest number is 4)
- `/` and `/docs` — 0 (session 37's rebuild already shipped in `b2f781f`)

**Keep session 38's distinction intact, or a reader will infer worse than the truth:** off-origin requests measured **0**. Nothing a reader uploads or types leaves the browser. The live defect is a **false claim**, not a data leak.

This reclassifies the deploy. It is not an open chore carried from a wrap note — it is the closure of a known-false public claim under `RULES.md` §4, currently live, on the one page that invites strangers to upload their own files.

**Deploy stays owner-worded** (`RULES.md`; the full-grant covers in-flow work, never the hard gates). One command:

```
npx vercel --prod
```

Auto-deploy is off by design (`vercel.json` → `git.deploymentEnabled: false`), so nothing has shipped by itself and nothing will.

**Post-deploy verification must be live, not in-repo** — session 35's lesson was that every in-repo check, including C10's 60-page recursive walk, verifies *the files exist*, never *the host maps a URL to a file*:
1. 6/6 routes → 200
2. all five security headers present **on a subpath**
3. re-grep `/playground` for the retired phrase → expect **0**
4. footer provenance reads `fb6c327`, no `+dirty`

---

## Finding 2 — The startup contract is what keeps breaking the review gate

The highest-leverage repo-side fix, and the estate just landed the evidence for it.

`AGENTS.md:7` orders **every** agent — Codex reviewers included — to read `RULES.md`, `PROJECT_STATE.md`, `CURRENT_TASK.md`, `HANDOFF.md`, `docs/task-log.md` before doing anything. Measured today, those five plus the playbook total **1.31 MB** (`HANDOFF.md` 422KB · `PROJECT_STATE.md` 307KB · `CURRENT_TASK.md` 170KB · `docs/task-log.md` 344KB). `docs/reviews/` alone is **47 MB**.

The consequence is not theoretical. **Three cross-model gate runs have died on it** — sessions 34, 36, and 38 — the last one burning 20+ minutes at `xhigh` and returning a log containing only the echoed prompt. Session 38 got its gate only by re-running inline, scoped by file, at a **disclosed** effort downgrade.

*The instruction meant to give every reviewer full context is the reason the reviewer cannot run.* That is a structural defect in the only independent check this project has, and it is self-reinforcing: each session's wrap note grows the file that kills the next session's gate.

The estate is now pointed straight at this. Three capabilities landed 2026-07-29/30 that did not exist when these docs grew:
- **`ablate`** — deletion-first: the null hypothesis is that a line buys nothing and must earn its way back
- **`/doctor`** — Anthropic's own shipped health skill, read-only first; checks context weight, always-loaded guidance that should be lazy-loaded, and CLAUDE.md redundancy
- the Cherny/YC finding — **the Claude Code team deleted ~80% of their own instructions; this estate has only ever added.** The owner's standing decision on that was *nothing changes* for claude-os. This project is a different call, because here the bloat has a measured casualty count.

Shape of the fix (proposal, not executed): `AGENTS.md` points a reviewer at a **lean brief** (RULES + a ≤5KB current-state summary) with the deep archives available on demand; the three state docs get their closed sessions archived the way claude-os archives its own `STATE.md`. Nothing is deleted — sessions 24–36 move to a dated archive and the live docs carry pointers.

---

## Finding 3 — The upload surface has never had a source-level security scan

The estate vendored the `defending-code-reference-harness` suite on 2026-07-30 (`threat-model` · `vuln-scan` · `vuln-triage` · `vuln-patch` · `dnr-hunt` · `dnr-respond`). Its **first live run, over claude-os's own `bin/hooks/`, found 3 real defects in code that had passed self-tests, an audit, and a security review the same day** — including a credential screen bypassable by any interpreter and a runaway brake losing 3 of every 4 concurrent increments.

This repo has never been scanned that way, and since session 36 it has had the surface that most warrants it: `FileDrop` (drag-drop + browse + paste over a native file input) and `parseCatalogText` — reader-supplied content parsed in-browser, on a page the site invites strangers to use.

The zero-network property is genuinely enforced structurally (session 34 inverted the import guard to an allowlist after finding a beacon that executed while the eval printed PASS). That is the *egress* half. The *parsing* half — what a hostile file does on the way in — has been probed only by this project's own authors, which is maker-judging-maker.

`/vuln-scan` is read-only: no building, no running, no network. It writes `VULN-FINDINGS.{json,md}` for `/vuln-triage`. Cost is bounded and the downside of skipping it is exactly the class this project keeps catching late.

---

## Finding 4 — The guards have not been tested for whether they can fail

Session 38 found **three test-integrity defects, each proven by mutation rather than argument**: a door test that filtered on one phrase over 3 of 6 routes and would not have caught the defect it was written for; a reset assertion that was tautological (*deleting the line under test left it green*); a fold guard whose `toBeVisible()` asserted nothing about the viewport. Two more tests were actively **pinning the false "no network requests" claim** — an honest correction would have failed CI.

Independently, the estate ran the same question against its own 17-task golden set on 2026-07-30 and the answer was worse: **not one was fit to use.** One scored **backwards** — an answer that broke every rule got full marks while a correct one got zero. Two graded PASS against a blank answer key.

The suite here is 1574 tests across 116 files, all green. **Green is a measurement of the code. It is not a measurement of the tests.** The unasked question is what fraction of those 1574 would still pass with the behaviour they guard deliberately broken — and this project has now produced five known instances of the answer being "it passes anyway," which is a rate worth quantifying rather than sampling.

Method is estate-standard now: planted controls, red-green both directions, denominator taken from the specification and never from the observations (session 35's own rule, learned when a scorer certified a 19-case run as complete).

---

## The goal, for the owner to fix

`/claude-os` on an existing project ends at proposals; the owner fixes the goal, then `/autopilot` executes it. My judgment on sequencing:

1. **Finding 1 now, alone.** It is one owner-worded command plus a four-point live re-verify, and it retires a false public claim. It does not need, and should not wait for, anything below it.
2. **Finding 2 next, as its own session.** It is the fix that makes findings 3 and 4 affordable — every review pass until it lands pays the same 1.31 MB toll, and one in three has died from it.
3. **Findings 3 and 4 after that**, in either order. Both are read-only detection passes; neither changes shipping behaviour on its own.

Deliberately **not** proposed: another design pass (sessions 36–38 measured, inverted, and gated it — the remaining `/report` `/fees` `/proof` `/docs` "narrative chapter" note is a taste item, not a defect), and any live-integration work (the honesty bright line and prototype-not-service identity both hold).

---

---

## Addendum — deploy executed, verified, and one defect found by the verification itself

**Deploy (owner-worded, run by the owner via `!`).** `dpl_H5bypZ9d81sTHv6i65awLKNNQT2v` → READY → aliased to `curbside-commons.vercel.app`. Build clean: 61 static pages, TypeScript green, 37s.

**Live verification, 2 of 4 checks confirmed by me directly (WebFetch is not bound by the Bash sandbox):**

| # | Check | Result |
|---|---|---|
| 1 | 6/6 routes → 200 | **not run** — needs status codes; Bash network is sandboxed |
| 2 | Five headers on a subpath | **not run** — same reason |
| 3 | `/playground` retired phrase → 0 | ✅ **PASS** — phrase absent; replacement reads *"The audit itself makes no requests — nothing typed leaves your browser"* |
| 4 | Footer = `fb6c327`, no `+dirty` | ✅ **PASS** — `Built from source fb6c327a3f76 at 2026-07-31T03:19:09.664Z`, no dirty marker |

Finding 1 is **closed**: the false claim is off production, and the wording that replaced it preserves the true half of the distinction rather than deleting the claim outright.

Checks 1–2 remain genuinely unrun. They are not "probably fine" — session 35's whole lesson was that a host can serve 200 on `/` and 404 on five other routes while every in-repo check passes.

**The defect the testing found — a hardcoded-path class across six files.** Running the suite under the owner's newly-mandated sandbox turned one test red: `agent-loop.test.ts:630` wrote to a hardcoded `/tmp/agent-loop.snapshot.json` → `EPERM`. A repo-wide sweep found the same shape in **six** files. Two problems, only one of which the sandbox exposed:

1. it is unwritable under any sandboxed run — so the suite could not go green under auto-mode at all
2. a fixed absolute path is **shared across concurrent runs**, so two runs race on one file — the same containment defect session 35 found in `L1_OUT_DIR`, where `join()` was assumed to confine a path and did not

Fixed in all six by `join(tmpdir(), …)`. **Disclosure on evidence strength:** one was proven **red → green** (it was the failing test). The other five are `.live.test.ts` files that skip without API keys, so they are change-by-analogy — mechanically identical, typechecked, and lint-clean, but **not executed**. Recording that rather than implying six proofs.

**Post-fix gates, all sandboxed:** `tsc --noEmit` exit 0 · `eslint --max-warnings=0` exit 0 · **vitest exit 0, 1574 passed + 8 skipped** (from 1573 passed / 1 failed). Tree is uncommitted; commit is the owner's word.

This is Finding 4 arriving on its own, unprompted, within an hour of being written down — a guard that could not run, in a suite reported green for months because the environment that hid it was the only one it ever ran in.

## Unknowns worth the owner's attention

- **`docs/reviews/` is 47 MB** in a repo whose reviewers are instructed to read the repo. Nothing reads it automatically today, but it is one wildcard away from being loaded.
- **`.claude/rules/` does not exist here.** claude-os adopted path-scoped rules on 2026-07-30 (guidance that loads only when you touch the matching paths). It is the mechanism finding 2 wants, already proven next door.
- **Sandbox reach.** Live-production checks and `npm run verify` (its `next/font` step fetches `fonts.googleapis.com`) are outside the default allowlist. Per the owner's 2026-07-30 directive the bypass flag is retired; widening is `/sandbox`, or a one-off is `! <command>`.
