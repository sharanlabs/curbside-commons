#!/usr/bin/env bash
# Owed Codex changed-files gates — Wave 1 (4 lanes, merged 2026-10-14), Wave 2 (9 lanes, merged 2026-10-31), then Wave 3 lanes as they merge (rows appended; the run is resumable, so a later start picks up only the new rows).
#
# WHY A SCRIPT: the Codex seat's auth is unreadable from the Claude Code sandbox, so the gates run in the
# OWNER's shell. One command, sequential by construction (codex-guarded serializes the shared seat),
# resumable (a lane whose verdict file exists and is non-empty is skipped), and it STOPS at the first run
# that produced no verdict, printing the raw tail of that run's log — it never silently retries, downgrades
# or switches accounts (owner doctrine, CLAUDE.md § Models & cost).
#
# RUN (repo root, owner shell; takes a while — background it and watch docs/reviews/ fill):
#   nohup bash scripts/codex-wave-gates.sh > /tmp/codex-gates.log 2>&1 &
#   tail -f /tmp/codex-gates.log
# One lane only:          bash scripts/codex-wave-gates.sh s2-crew
# Dry run (no Codex call): CODEX_DRY_RUN=1 bash scripts/codex-wave-gates.sh
#
# OUTPUT: docs/reviews/codex-2026-10-31-<lane>.md  (Codex's final message = the verdict, verbatim)
#         docs/reviews/codex-2026-10-31-gates-run.md (one record block per lane: route, model, tokens, session, verdict line)
#         $LOGDIR/<lane>.log (the full stream; not committed)
# Route: `review` (docs/MODEL-ROUTING.md § Codex routes); the wrapper may raise it on security keywords,
# never lower it. A SHADOW-DUE line triggers the documented one-off --shadow re-run (verdict saved as *-shadow.md).
set -uo pipefail
cd "$(dirname "$0")/.." || exit 1

WRAP="${CODEX_GUARDED:-$HOME/claude-os/bin/codex-guarded}"
DATE=2026-10-31
OUT=docs/reviews
RUNREC="$OUT/codex-$DATE-gates-run.md"
LOGDIR="${CODEX_GATES_LOGDIR:-/tmp/codex-gates-$DATE}"
ROUTE="${CODEX_ROUTE:-review}"
ONLY="${1:-}"
DRY="${CODEX_DRY_RUN:-}"
mkdir -p "$OUT" "$LOGDIR"
[ -s "$RUNREC" ] || printf '# Codex gates run — %s\n\nOne block per lane, appended by scripts/codex-wave-gates.sh as each verdict lands. Verdict files: docs/reviews/codex-%s-<lane>.md.\n' "$DATE" "$DATE" > "$RUNREC"

# lane | wave | first-parent merge commits (space-separated) | spec | record | lane-specific focus
LANES='
s1-engine|1|c45bff5|docs/plan-menu-integrity-crew-2026-10-09.md Appendix A (the S1 engine lane)|docs/reviews/wave1-acceptance-2026-10-31.md (the independent read of this lane; its deferred items moved to S1.5 and were landed at 7857966 — verify there, do not re-report them here)|The listings engine: detectors, run, reference, the plainLine copy, LISTINGS_SPEC_VERSION. Check that every detector change is covered by a test that bites (the acceptance review re-applied one mutation; find a second).
s15-correctness|2|7857966|docs/packets/2026-10-31-s15-correctness.md|docs/returns/2026-10-31-s15-correctness.md|One shared reserved/duplicate-id predicate on EVERY input path (CLI, MCP registry, browser) — security F1 in docs/reviews/security-privacy-legal-2026-10-31.md; dates compared as instants; declared-key projection of nested fields (F4); the malformed-modifiers shape guard (F7); the new honesty probe families; scenarios 2 and 6 added by the generator with figures derived.
s2-crew|2|7215a46|docs/packets/2026-10-31-s2-crew.md|docs/returns/2026-10-31-s2-crew.md|lib/crew/route.ts rows (unknown ownership → human BEFORE any team row); manifestDigest binding of replay to input bytes; the per-run nonce quarantine delimiters and look-alike neutralization; injection-scan Unicode folding; budget reserve/settle/overflow halt on the live path; ALLOWED_ROOTS narrowed to fixtures/evals/temp with dot-segments refused and fixed-text errors (security F2, F3, F5, F8, F9). The orchestrator applied the route doctrine in code at this merge and re-pinned one case — see docs/wave2-run-ledger-2026-10-31.md § Pins moved.
s15b-regeneration|2|10208a0|docs/packets/2026-10-31-s15b-regeneration.md|docs/returns/2026-10-31-s15b-regeneration.md|A pre-registered record set was touched: every changed golden line must be either the UCP spec string (2026-04-08 → 2026-08-25) or one of exactly three plainLine sentences; crew exam hashes must have been re-derived by running the engine, never hand-edited (the return packet claims 23 re-pinned by the engine and 44 derived records by harness — verify the mechanism in the diff); the bundled tally in lib/landing/test-guide.ts must not have moved; one paragraph in docs/model-risk-register.md.
s3-adapters|2|d786f60 40f56da|docs/packets/2026-10-31-s3-adapters.md|docs/returns/2026-10-31-s3-adapters.md|DoorDash-shaped and Uber-shaped adapters whose field names come ONLY from the public partner documentation cited in docs/research/external-references-2026-10-31.md (reverse-engineered repositories were rejected for code — any field or behaviour that could only have come from one is a HIGH); the ingest allow-list and its planted-field test; the "shaped like, not from" carrier wording and the C10 probes that enforce it; the id-mapping sheet; the partner scorecard; scenario 8 (an injected artifact the crew hands to a human) and the cases-s3 digests.
s2-impact|2|3926e69|docs/plan-menu-integrity-crew-2026-10-09.md § 12 (S2 impact) + docs/plan-wave2-gap-sheet-2026-10-12.md Page 4 (the impact arithmetic contract, verbatim)|docs/returns/2026-10-31-s2-impact.md|Deterministic impact arithmetic labelled simulated: orders at risk as DISTINCT orders, explicit refund allocation, agent-cancel exposure, the declared error-charge share named as an assumption; the seeded orders fixture is FREEZE-locked and every figure the seat emits is recomputed from the jsonl by a test; nothing typed.
s2-ledger|2|7e4f699|docs/plan-menu-integrity-crew-2026-10-09.md § 12 (S2 ledger / approvals) + docs/plan-wave2-gap-sheet-2026-10-12.md Page 5 ownership|docs/returns/2026-10-31-s2-ledger.md|lib/ledger: hash-chained JSON-lines with a trusted checkpoint, diff and eval-candidates — look for a chain that can be rewritten or a checkpoint that trusts itself; lib/approvals signer registry and the eighth door (SignerRevokedError) in the fixed door order; lib/agents budget/pricing rows ($0 free-tier rows, PRICING_VERSION). Security F10 (executed:true on a reject) is KNOWN and open — do not re-report.
exec-layer|2|204ade5 a047b0e|docs/packets/2026-10-31-exec-layer.md|docs/returns/2026-10-31-exec-layer.md|The /pilot executive page: EVERY figure derived through lib/landing/pilot-figures.ts, no typed digit in the page or its STATE labels outside ISO dates and S-labels (a test enforces this — confirm it bites); production register (no "sample", "demo", "example", "real" captioning); the Wave 1 acceptance wording corrections (items 1–14, 18, 19, 25) landed; governance-model and model-risk-register wording honest about what is model-enforced vs code-enforced (F3a).
cli-experience|2|91b06ae|docs/packets/2026-10-31-cli-experience.md|docs/returns/2026-10-31-cli-experience.md|bin/check.mjs verbs scenario <id>|--list and ledger verify|checkpoint|diff via lib/cli/{scenario,ledger}.ts; exit codes proven by process tests; no engine edit (cli.ts was owned by another lane).
ci-hygiene|2|bf3df7f|docs/returns/2026-10-31-ci-hygiene.md (the brief is in its DONE section; no separate packet)|docs/returns/2026-10-31-ci-hygiene.md|.github/workflows/ci.yml: every action pinned to a full SHA (upload-artifact v7.0.2 = cf430e030ddbb5b0abf93d22962f4752f3646cd9), permissions contents: read, npm audit non-blocking with the reason recorded, CycloneDX SBOM artifact; the env template re-headed; SECURITY.md dependencies section matches package.json (note: the MCP SDK row was bumped to 1.32.2 this morning at e692e95 — not this lane).
s1-pins|1|9fef172|docs/plan-menu-integrity-crew-2026-10-09.md Appendix A (the pins section) + the NOTICE file|docs/reviews/wave1-acceptance-2026-10-31.md (S1-pins: FLAG scope — two files outside the list were a packet inconsistency, not a lane fault)|A pins lane: vendored files and pin tests. Every vendored file must match its declared upstream tag (NOTICE) byte-for-byte where the repo claims it; pin tests must bite (the acceptance review flipped one output 2.5 → 2.6 → red); nothing in the vendored set may carry a modification the NOTICE does not disclose.
w1b-docs|1|fc8536f|docs/plan-menu-integrity-crew-2026-10-09.md Appendix W1b (S4-docs)|docs/reviews/wave1-acceptance-2026-10-31.md (docs items 1–14, 18, 19, 25 were corrected by exec-layer at 204ade5/a047b0e — verify each correction is on main)|Public-claims docs: RULES.md § 4 on every sentence; BUILT / ARRIVES / OWED legend honest at the time and refreshed since; one "marked-not-faked" item flagged by the acceptance review.
w1c-scenarios|1|b7dacaf|docs/plan-menu-integrity-crew-2026-10-09.md Appendix W1c + § 9|docs/reviews/wave1-acceptance-2026-10-31.md (scenarios-w1: PASS, 39/39 files inside the list)|scripts-ts/generate-scenarios.mts: deterministic seeded generation from the committed corpus (read-only on it); every figure in a brief is a placeholder filled from the engine run; evals/packs/scenarios.test.ts regenerates in memory, byte-compares and re-derives figures — confirm it would catch a typed figure and a moved byte.
w3d-large-fixture|3|2052b7a|docs/packets/2026-10-31-w3d-large-fixture.md|docs/returns/2026-10-31-w3d-large-fixture.md|The large synthetic restaurant: its own seeded PRNG (never the scenario generator stream); every figure in manifest.json and README.md derived by running the engine at generation and re-derived by evals/packs/large-fixture.test.ts (FREEZE by regenerate-and-byte-compare; the identity findings(d) = findings(d-1) - resolved + new); hours stated once per item (the orchestrator accepted this: the existing corpus feeds carry hours on zero rows); resolvedFindings 1 on days 5 and 6 is a rule change on one modifier option, reported not suppressed; lib/** untouched; the declared drift rates are labelled assumptions, not claims.
'

build_prompt() {   # $1 lane $2 wave $3 merges $4 spec $5 record $6 focus
  local lane="$1" wave="$2" merges="$3" spec="$4" record="$5" focus="$6" m diffs=""
  for m in $merges; do diffs="$diffs git diff --stat $m^1 $m ;"; done
  cat <<PROMPT
CHANGED-FILES REVIEW (read-only, adversarial). Curbside Commons (project identity ActivationOps AI), Wave $wave lane "$lane", merged into main as first-parent merge commit(s): $merges.

SCOPE. The lane's landed change is exactly the first-parent diff of each merge: for each commit run "git diff --stat <m>^1 <m>" first ($diffs) then "git diff <m>^1 <m> -- <path>" per source, test and doc file. Generated fixtures and goldens are large: do not read them whole; read the generator and the test that derives or freezes them, then spot-check a handful of lines against the derivation.

SPEC (what the lane was told to build; ALLOWED FILES / OUT / STOP lists are binding): $spec.
RECORD (what the lane or its reviewer claims): $record.
LANE CONTRACT every lane followed: docs/wave2-lane-contract-2026-10-31.md. Merge-time decisions and pins the orchestrator moved deliberately: docs/wave2-run-ledger-2026-10-31.md (§ Pins moved by the orchestrator at merge).
KNOWN FINDINGS (read; verify their fixes landed; do NOT re-report them as new): docs/reviews/wave1-acceptance-2026-10-31.md and docs/reviews/security-privacy-legal-2026-10-31.md (its "Verification at merge" table says where each fix landed).
HONESTY BAR (RULES.md § 4): simulated data always; never a real-platform, merchant or business-impact claim; platform names nominative only; production register in user-facing text (no "sample", "demo", "example", "real" captioning); every figure a reader sees is DERIVED by code or a generator, never typed.

LANE-SPECIFIC FOCUS: $focus

LOOK FOR, in priority order: (1) correctness defects in the landed code (wrong logic, missed branch, unsafe parse, wrong unit, off-by-one, a rule that fires on the wrong row); (2) test integrity — a test that cannot fail, a figure typed where the rule is derived-never-typed, a golden re-pinned by hand rather than by the engine, an assertion weakened to pass, a mutation claim in the record that the test would not actually catch; (3) spec deviation — files touched outside ALLOWED FILES, a STOP condition that should have fired, a claim in the record that the diff does not support, work the record calls DONE that is partial; (4) security — path handling, injection surfaces, secrets, supply chain, error text that echoes input; (5) register / honesty violations in any user-facing sentence the lane added.

CONSTRAINTS. Your sandbox is read-only: do not run npm, vitest, the build or any generator; reason from the diff, the files and git history (git log / show / diff / grep are fine). Do not propose rewrites or praise; find defects and state evidence. If you cannot settle something, say so under "Not checked" rather than guessing.

OUTPUT, exactly this shape, markdown, nothing before the first heading:
## Verdict: PASS | PASS WITH FINDINGS | BLOCK
## Findings
Numbered. Each: severity (HIGH / MEDIUM / LOW / INFO) · file:line · what is wrong · evidence (quote the line) · the minimal fix. Severity HIGH means the lane should not have been merged as-is.
## Claims checked
One line per claim in the record you verified (CONFIRMED) or refuted (REFUTED, with evidence).
## Not checked
What you could not settle and why.
PROMPT
}

ran=0
while IFS='|' read -r lane wave merges spec record focus; do
  [ -z "${lane// /}" ] && continue
  case "$lane" in \#*) continue;; esac
  if [ -n "$ONLY" ] && [ "$ONLY" != "$lane" ]; then continue; fi
  verdict="$OUT/codex-$DATE-$lane.md"
  if [ -s "$verdict" ]; then echo "skip  $lane — verdict exists ($verdict)"; continue; fi
  log="$LOGDIR/$lane.log"; tmpout="$LOGDIR/$lane.verdict.md"
  prompt="$(build_prompt "$lane" "$wave" "$merges" "$spec" "$record" "$focus")"
  if [ -n "$DRY" ]; then
    printf '%s\n' "$prompt" > "$LOGDIR/$lane.prompt.txt"
    echo "dry   $lane → $LOGDIR/$lane.prompt.txt ($(wc -c < "$LOGDIR/$lane.prompt.txt") bytes); would run: $WRAP --route $ROUTE exec -s read-only -o $tmpout \"<prompt>\""
    continue
  fi
  start="$(date +%H:%M:%S)"
  echo "run   $lane  ($start)  merges: $merges"
  rm -f "$tmpout"
  "$WRAP" --route "$ROUTE" exec -s read-only -o "$tmpout" "$prompt" </dev/null >"$log" 2>&1
  rc=$?
  if [ ! -s "$tmpout" ]; then
    echo "STOP  $lane produced no verdict (wrapper exit $rc). Raw tail of $log:"
    tail -40 "$log"
    exit 2
  fi
  cp "$tmpout" "$verdict"
  routeline="$(grep -m1 '^codex-guarded: route' "$log" || true)"
  model="$(grep -m1 '^model:' "$log" || true)"
  effort="$(grep -m1 '^reasoning effort:' "$log" || true)"
  sess="$(grep -m1 '^session id:' "$log" || true)"
  tokens="$(grep -A1 -m1 '^tokens used' "$log" | tail -1 | tr -d ' ' || true)"
  vline="$(grep -m1 '^## Verdict' "$verdict" || echo '## Verdict: (no verdict heading — read the file)')"
  {
    printf '\n## %s (Wave %s) — %s → %s\n' "$lane" "$wave" "$start" "$(date +%H:%M:%S)"
    printf -- '- merges: %s\n- %s\n- %s · %s · %s\n- tokens used: %s\n- verdict file: %s\n- %s\n' "$merges" "${routeline:-route line not printed}" "${model:-model ?}" "${effort:-effort ?}" "${sess:-session ?}" "${tokens:-?}" "$verdict" "$vline"
  } >> "$RUNREC"
  echo "done  $lane  ($(date +%H:%M:%S))  $vline  tokens=${tokens:-?}"
  ran=$((ran+1))
  if grep -q 'SHADOW-DUE' "$log"; then
    echo "shadow $lane — SHADOW-DUE printed; one documented re-run with --shadow"
    "$WRAP" --route "$ROUTE" --shadow exec -s read-only -o "$LOGDIR/$lane.shadow.md" "$prompt" </dev/null >"$LOGDIR/$lane-shadow.log" 2>&1
    [ -s "$LOGDIR/$lane.shadow.md" ] && cp "$LOGDIR/$lane.shadow.md" "$OUT/codex-$DATE-$lane-shadow.md" && printf -- '- shadow verdict: %s\n' "$OUT/codex-$DATE-$lane-shadow.md" >> "$RUNREC"
  fi
done <<< "$LANES"
echo "finished: $ran verdict(s) produced this run; $(ls "$OUT"/codex-$DATE-*.md 2>/dev/null | grep -vc 'gates-run') verdict file(s) present"
