# Acceptance-gate record — Pub slice (2026-07-06)

**Artifact:** the entire uncommitted Pub diff vs `4275aff` (README replacement · PUBLICATION writeup · LICENSE/NOTICE · corpus-license close · C9/C10 test changes · product-surface rename + sanctioned golden regen · demo recording · CSV relocation + config fix · lockfile relocks · state docs).
**Judge:** independent acceptance-gate subagent (fresh context, read-only, no Bash; its advisor tool unavailable — surfaced verbatim in its record). Same model family as the maker; gate-2's discharged cross-model chain is the load-bearing independence, per the M2 precedent.

**VERDICT: SHIP — conditional, scoped to the recorded publish act only (commit + PRIVATE repo push; the public flip stays owner-held). Route-back: none.**

| Gate | Result | Key evidence |
| --- | --- | --- |
| 1 grill | PASS | AFK defaults each reversible/owner-flippable; DEFER story honest on both public surfaces; L11 published only as an open limitation |
| 2 codex cross-model | PASS | 5-pass chain authenticated raw-by-raw (BLOCK×4 → SHIP); every reconciliation verified landed; "no rubber stamp" |
| 3 verify-correctness | PASS conditional | RG-1/2/3 authenticated against the test files; condition = live verify handoff at commit time |
| 4 enterprise + elegance | PASS | lockfile discipline called the standout (used-facts audit; unlockable claim dropped); regression fixed not papered |
| 5 anti-slop | PASS | zero AI-tell vocabulary; em-dash density advisory only |

**SHIP condition DISCHARGED same session:** verify handoff executed live at commit time, raw tails + exit codes appended to `pub-verify-evidence.log` — verify exit 0 (**743 passed + 6 skipped**) · test:legacy exit 0 (**306+5**) · python **35 passed** exit 0. Counts unchanged from the public docs' claims.

**Advisories (non-blocking) and their disposition:**
1. Redaction consistency across raw logs → **FOLDED same session** (uniform P3 redaction applied to all four remaining raws, with in-file notes).
2. Owner should skim `docs/reviews/` (multi-MB raws publish under the internal-docs-as-is default) before the PUBLIC flip → **surfaced at wrap** (owner action).
3. Exact test counts in public prose = standing staleness trap; consider "740+" or a badge after publication → **surfaced at wrap**.
4. The four AFK defaults (interim name · Apache-2.0 · private-then-flip · internal-docs-as-is) recorded as defaults-taken, **owner ratification open** → surfaced at wrap.
5. Gate's advisor tool down (13th consecutive session pattern) → recorded.
