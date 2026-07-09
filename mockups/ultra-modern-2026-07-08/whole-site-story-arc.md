# Whole-site story arc — Commerce Truth Audit / ActivationOps

Provenance: written 2026-07-08 by the delegated writing-specialist (opus). This sits **above**
`whole-site-copy-deck.md`, not in place of it. The copy deck is the per-surface reference (every
line cited `file:line`); this document is the one **spine** the whole site tells — the single
narrative that runs through every surface, plus arc-anchored content samples that land each
surface's beat of it. Where a line is honesty-load-bearing it is kept verbatim from the repo and
marked *(kept)*; where it is sharpened for the arc the underlying claim is unchanged and it is
marked *(sharpened)*. `[VERIFY]` marks anything I could not tie to a file I read this session.

Skills applied: humanizer (AI-tell removal + voice injection; brand-voice path N/A — no
`marketing-context.md`) · content-production (arc + per-surface structure). Sources ground-checked
this session: `app/page.tsx`, `components/landing/CatchPanel.tsx`, `components/report/ReportView.tsx`,
`lib/packs/listings/demo/copy.ts`, `RULES.md` §4/§6, and the sibling copy deck.

**The one-sentence thesis (two packs, one truth):** *nothing false about a merchant reaches
anyone — not the merchant reading an outreach message, not a shopper's AI assistant reading a
listing — without being checked against that merchant's own record first.*

---

## Part 1 — The arc (one spine, seven movements)

Each movement is 2–4 sentences: the plain stakes first, then the one thing an activation-domain
expert would recognize as the real point. The surface(s) that carry each movement are named. Read
top to bottom, the seven movements are the whole site in order.

### Movement 1 — What's actually stalled
*Carried by: Landing (hero, Beat 1) · Console (header + queue).*

A delivery marketplace signs up thousands of restaurants; a large share of them never finish
onboarding. They stall two or three steps in — no menu photos, a half-entered menu, a bank account
that was never verified — and they go quiet. Each stalled merchant is acquisition money already
spent, sitting at zero, and there are far too many of them, each stuck for its own specific reason,
to hand-write to. So a team sends a nudge to move them along, and at scale the AI drafts it. That is
where the risk starts: the moment a machine writes to a merchant about that merchant's own account.

### Movement 2 — The confident wrong sentence
*Carried by: Landing (Beat 3, the gap · Beat 6, differentiation) · Demo (conformance-foil).*

When AI drafts outreach, its worst failure is not rudeness — it is a sentence that sounds certain
and simply isn't true for this merchant. "You'll be live by Friday," written for an account that has
no go-live date. An ordinary AI safety filter reads the message on its own — is it toxic, off-policy,
leaking personal data? — and a polite, wrong sentence passes every one of those checks. The reason
it slips through is structural: whether a claim is true is not a property of the sentence, it is a
relationship between the sentence and the merchant's record. A filter that never looks at the record
cannot catch it, no matter how good it is at reading tone.

### Movement 3 — The record is the only truth
*Carried by: Landing (CatchPanel record) · Merchant detail (the system-of-record).*

So the system pins truth to one place: the merchant's own record — onboarding status, steps
completed, the actual blocker, and whether there's a go-live date on file at all. Not the open web.
Not what the merchant typed into a form. Everything the message says has to be true against that
row, or it doesn't pass. Two design choices make this hold: checking against the structured record
(a field, not a retrieved passage) is what makes the check exact and repeatable, and keeping the
merchant's own untrusted text out of the model prompt closes an injection path a hostile input could
otherwise use to steer the draft.

### Movement 4 — Checked, not trusted
*Carried by: Landing (Beat 5, how it works) · Console (pipeline) · Merchant detail (why-chain).*

The AI is checked, not trusted. Every fact the draft states has to match a field in the record,
exactly — a fast, deterministic check that runs the same way every time and costs nothing. Then a
second reviewer, run on a different AI model family so it can't wave through its own kind, re-reads
the prose for anything slipped in that the data can't back. Then a person decides. The order is the
point: the cheap exact check runs first, the slower semantic judge near the end, and the two close
the gap from opposite directions — one matches each declared claim forward to a field, the other
reads the finished prose backward to the data — with a human holding the last word.

### Movement 5 — One claim, caught and held
*Carried by: Landing (Beat 4, the catch) · Report (16 findings) · Demo (the replay).*

Here is one, in full. In a recorded draft, two lines match the merchant's record and pass on their
own; the third — "you'll be live by Friday" — has no go-live date behind it, so it is caught and
held for a person. Not sent, not rejected. Someone's call, recorded. The same discipline runs on a
second surface entirely — the menu copy an AI shopping assistant reads — and in the sample report,
sixteen lines are checked against the restaurant's records and sixteen catches come back, each with
its receipts: eleven errors, five warnings. A served price of $12 where the catalog says $10; an
item shown in stock that's sold out; a dish on the feed that doesn't exist in the kitchen.

### Movement 6 — Measured, audited, capped
*Carried by: Eval / Quality · Metrics · Audit · Cost.*

None of this asks you to take it on faith. Every drafted message is scored before a person sees it.
Every decision — what was found, what the check said, how it scored, who approved — is written to a
trail you can open, row by row. And the one path that spends real money is capped, with a fail-closed
hard stop that blocks any call that would cross the line. The depth is in how each of those is kept
honest: the graders are proven by paired corrupted-record tests, because a grader that can't fail is
theater; cost is computed from real reported tokens against a pinned price list, not an estimate; and
the public run stays in replay at $0.00 the whole way through.

### Movement 7 — What this is, said plainly
*Carried by: Landing (Beat 9, honesty) · global footer · every SIMULATED banner.*

And the site says exactly what it is. A prototype, run on demand, on an invented merchant and a
made-up menu — not a live service, and not connected to any real marketplace. The accuracy numbers
aren't posted, because the calibration run has to clear the bar first; until it does, the method
stands and the figures wait. Human-led, AI-assisted, professionally reviewed. This is the same
discipline turned inward: don't state what you can't back — including about your own tool.

---

## Part 2 — Per-surface content samples (arc-anchored)

For Landing and each of the eight product surfaces: a sharpened eyebrow, a headline, and one or two
plain-paired-with-technical lines that land that surface's beat of the arc. Honesty-load-bearing
headlines and labels are kept verbatim. These refine the copy deck for the arc — they do not restate
it; the deck remains the full per-line reference.

### Landing (`/`) — the whole arc in miniature · Movements 1–5, 7
- **Eyebrow:** `Merchant Activation · review & approval` *(kept, `page.tsx:104–106`)*
- **Headline** *(kept — the fixed honest headline, `page.tsx:107–110`):* "AI writes your merchant
  outreach — and nothing reaches a merchant until every claim is checked against their own data."
- **Plain** *(sharpened):* Each message is checked against that merchant's own record before it can
  send; a confident-sounding claim the data can't back is held for a person, never sent on its own.
- **Technical** *(sharpened):* A deterministic forward check matches each declared claim to a field
  (byte-reproducible, $0); a cross-family reviewer then reads the prose back to the data to catch
  facts slipped in casually; a person has the last word.
- **Arc guard:** the landing carries **no accuracy numbers** — "figures pending calibration" is the
  answer to that question, not a gap to fill *(`page.tsx:428–431`)*.

### Console (`/console`) — the operator's whole line · Movements 1 + 4
- **Eyebrow:** `Curbside Commons · stalled-merchant activation` *(kept, `PLATFORM_NAME`, `console/page.tsx:46–48`)*
- **Headline** *(kept):* "Activate stalled, long-tail merchants — responsibly." *(`console/page.tsx:50–52`)*
- **Plain** *(sharpened):* It finds which merchants are stuck and exactly why, drafts the next message
  with every claim checked against the merchant's own data, and keeps a person in charge — built to
  be measured, audited, and adopted.
- **Technical** *(kept):* Deterministic risk + blocker triage → bounded, schema-constrained LLM
  drafting → a claims-gatekeeper that ties every declared claim to the merchant's own data → an eval
  harness → a human approval gate with an audit trail. *(`console/page.tsx:59–64`)*

### Report (`/report`) — one surface, fully checked · Movement 5 (listings pack)
- **Eyebrow:** `Verifier report · listings truth check` *(kept, `ReportView.tsx:122`)*
- **Headline** *(kept):* "What the copy says vs. what the restaurant's records say." *(`ReportView.tsx:123`)*
- **Plain** *(source, `ReportView.tsx:124–129`):* A serving copy of a menu (what an AI shopping
  assistant would read) checked, line by line, against the restaurant's own system-of-record — every
  difference the checker caught, plain words first, then the exact receipts.
- **Technical** *(kept, repo-bound):* **FAIL · 16 findings · 11 error · 5 warn · 0 info**;
  deterministic and $0, no language model in this verifier runtime, the same input always gives this
  same report; four receipts per finding — claim · reference row · rule/spec-clause · class.
- **Banner — byte-verbatim** *(top of page, `ReportView.tsx:113–118`; single source `copy.ts:53–54`):*
  > Synthetic test data — an invented restaurant, invented menu, invented prices. Not real DoorDash / Square / Uber Eats / Grubhub data, access, or business impact. The verification rules and the pinned data-format standard are real; the restaurant, its menu, and its records are invented.

### Demo (`/demo`) — spec-valid is not the same as true · Movements 2 + 5
- **Eyebrow:** `Verifier demo · listings truth check` *(kept, `DemoView.tsx:107`)*
- **Headline** *(kept — the C7 sanctioned `DEMO_CLAIM`, `copy.ts:23–24`):* "a spec-faithful simulated
  agent follows a spec-valid but false surface; the verifier catches the surface/SOR mismatch"
- **Plain** *(source, `copy.ts:57–78`):* A shopping agent reads the published feed and never sees the
  restaurant's records; the same document passes the official schema check — it is correctly shaped —
  and still misstates the price versus the records.
- **Technical** *(kept — the `DEMO_SUBHEAD`, `copy.ts:81–82`):* "The comparison is exact,
  deterministic logic — no language model runs in this demo, and no live platform is touched."
- **Arc guard:** frame every beat as the verifier catching the mismatch — never the agent "getting
  caught" (the honesty grep-gate enforces both halves, `copy.ts:16–24`).

### Eval / Quality (`/eval`) — scored before a human sees it · Movement 6
- **Eyebrow** *(sharpened):* `Quality · every draft scored first`
- **Headline** *(kept):* "Eval / Quality." *(`eval/page.tsx:18`)*
- **Plain** *(sharpened):* Every drafted message is scored before a person sees it — is it well-formed,
  do its declared claims all check out against this merchant's data, and does it avoid forbidden
  promises?
- **Technical** *(kept):* Four deterministic graders — structure · state-consistency · policy ·
  no-leakage — proven by paired corrupted-record tests; the same graders also scored a recorded real
  Gemini run (key-gated, **$0.0042** spent, cap **$5**) so this stays honest about real output. The
  public demo makes no live calls. *(`eval/page.tsx:24–36`)*

### Metrics (`/metrics`) — what the run routed and held · Movement 6
- **Eyebrow** *(sharpened):* `Workflow · routed and held (simulated)`
- **Headline** *(kept — "(simulated)" stays):* "Workflow metrics (simulated)." *(`metrics/page.tsx:28`)*
- **Plain** *(sharpened):* What the demo routes and tracks for an activation team — how many stalled
  merchants get a claim-checked nudge, how many are held for a human, and what's blocking them.
- **Technical** *(kept):* Every percentage is computed at render from the snapshot — illustrative of
  the workflow, not activation, revenue, or reactivation outcomes. *(`metrics/page.tsx:34–38`)*

### Audit (`/audit`) — every decision recorded · Movement 6
- **Eyebrow** *(sharpened):* `Trail · every decision recorded`
- **Headline** *(kept):* "Audit Trail." *(`audit/page.tsx:17`)*
- **Plain** *(sharpened):* Every merchant's decision is recorded — what was found, what the gatekeeper
  said, how the draft scored, and what happened. No black boxes.
- **Technical** *(kept, data-bound):* Run executed deterministically at [generatedAt] (mode
  [servedMode]); open a merchant for its full step-by-step trail. Append-only, mono timestamps and
  IDs. *(`audit/page.tsx:23–27`)*

### Cost (`/cost`) — the cap physically holds · Movement 6
- **Eyebrow** *(sharpened):* `Spend · the cap holds`
- **Headline** *(kept):* "Cost ledger." *(`cost/page.tsx:12`)*
- **Plain** *(sharpened):* The one path that spends real money is budget-guarded, so a run can't
  quietly exceed the cap.
- **Technical** *(kept):* Cost = real API-reported tokens × a pinned, versioned price table (not an
  estimate); before every live call a fail-closed guard blocks it if spend would cross the cap;
  **$0.00** this run (REPLAY), **$5.00** hard cap; an unknown model id fails loud, never silently at
  $0. *(`cost/page.tsx:42–51`)*

### Merchant detail (`/merchant/[id]`) — the record, and the whole why-chain · Movements 3 + 4
- **Eyebrow** *(sharpened):* `Merchant · the record every claim is checked against`
- **Framing line** *(proposed, no new capability — the page header is the merchant's own name +
  category + onboarding steps + risk chip, `merchant/page.tsx:49–61`):* one merchant, the full
  why-chain, in eight numbered sections — the surface that proves the system isn't a black box.
- **Plain** *(sharpened):* Triage → draft → claims-gatekeeper → faithfulness check → domain quality
  check → eval → the human gate → the audit trail. Each step shows its own reasoning, against this
  merchant's own record.
- **Technical** *(kept):* The risk score is an auditable formula
  (`risk = 2×days_since_signup + 3×last_login_days_ago + 10×(TOTAL_STEPS − steps_completed)`); the
  faithfulness judge is a cross-family LLM (Groq gpt-oss-120b, key-gated) that verifies each factual
  sentence against the data row; the domain quality check is **advisory and never changes the send**.
  *(`merchant/page.tsx:64–82, 159–250`.)* `[VERIFY]` TOTAL_STEPS = 5 (per the CatchPanel record
  "2 of 5 steps").

---

## Part 3 — Voice note + honesty self-audit

### How "simple but deep" reads here
- **Plain line leads, the technical line is a receipt.** The plain sentence carries the meaning on its
  own; the technical line underneath is evidence, not decoration — a reader can stop after the plain
  line and be right, or read one more line and see exactly why.
- **Concrete nouns over abstractions.** The vocabulary is `record`, `field`, `go-live date`, `price`,
  `blocker` — not `insights`, `growth`, `optimization`. Depth comes from precision (claim→field,
  cross-family, fail-closed), not from bigger words.
- **One idea per sentence, varied length.** Short sentence to land the stakes; a longer one when a
  mechanism genuinely needs to unwind. No rule-of-three padding, no em-dash reflex.
- **The mono register does real work.** Setting IDs, timestamps, receipts, and numbers in the mono
  face reads as engineering honesty — the right signal for a truth-audit and an AI-engineer reader.
- **A position, not a hedge.** The site takes a stance — "the AI is checked, not trusted" — and backs
  it. The one place it refuses to assert (accuracy numbers) is stated as a deliberate hold, not a gap.

### Honesty self-audit (verified against sources this session)
- **SIMULATED banner byte-verbatim** ✓ — reproduced exactly from `copy.ts:53–54` and rendered
  `ReportView.tsx:113–118` (the JSX renders `Uber Eats` with a non-breaking space; the canonical
  single-sourced string is plain "Uber Eats"). Unchanged on report and demo.
- **Report / demo / global footers verbatim** ✓ — none rewritten; the arc frames around them
  (`ReportView.tsx:210–215`, `DemoView.tsx:134–140`, `app/layout.tsx:63–77`).
- **No fabricated metrics** ✓ — the only hard numerals in this document are repo/fixture-bound: the
  sample report tally **16 · 11 error / 5 warn / 0 info** (`expected-report.acp.json`, `ok:false`);
  `$0.00` and the `$5` / `$5.00` cap; `$0.0042` recorded-run cost (`eval/page.tsx`); "2 of 5 steps"
  (`CatchPanel.tsx`); and the structural counts (5 stages, 3 checks, 4 grader dimensions, 6 console
  steps, 8 merchant sections, 16 findings), each counted in its source file. All
  merchant/sent/held/percent values stay data-bound — never hardcoded into copy.
- **No real-marketplace claims** ✓ — no assertion of real DoorDash / Square / Uber Eats / Grubhub /
  DataSF data, access, or business impact anywhere in the arc (`RULES.md` §4, project-integrity
  paragraph, line 44: "Never claim real DoorDash access, real merchant data, or real business impact").
- **Prototype, not a service** ✓ — "run on demand … not a live service" preserved; `Prototype · REPLAY
  · $0.00` kept; no uptime/hosting/SLA language introduced.
- **No "no AI" / "AI built this"** ✓ — only "Human-led, AI-assisted, professionally reviewed"
  (`RULES.md` §4, §18–20). The verifier's "no LLM in this runtime" is a claim about the *verifier
  path*, not the build, and is preserved as written.
- **Advisory-judge honesty** ✓ — "advisory and never changes the send" kept verbatim on the merchant
  beat; not softened into a stronger claim.
- **Landing carries no accuracy numbers** ✓ — "figures pending calibration" preserved as the answer;
  no precision/recall figure added anywhere on the landing.
- **Anti-slop pass** ✓ — no "Insights / Growth / Scale / Optimize" filler, no emoji, no invented
  stats or testimonials, no negative-parallelism ("not X, it's Y") reflex, no rule-of-three padding;
  em-dashes used purposefully; sentence rhythm varied.
- **Open items surfaced, not resolved** — the three-name product identity (Commerce Truth Audit /
  ActivationOps / Curbside Commons; copy deck §11.2) and the `[VERIFY]` markers (TOTAL_STEPS = 5; the
  merchant framing line) are flagged for the owner as a scope decision (no silent rebrand; per the
  copy deck's own §11.2 flag and CLAUDE.md's "no silent scope change" rule) — not resolved here.
