# Interview guide — one conversation before Wave 2 ships (2026-10-12)

**Purpose.** The plan's weakest assumption is that a US delivery platform would *pilot* an independent menu-truth
verifier rather than build one or ignore the problem. Every build decision after Wave 1 rests on it. One
30-minute conversation with the right person moves that from assumption to evidence — or reshapes S2–S4 before
three weeks are spent. (Blindspot pass Q10; plan § 3 "still unvalidated".)

**Who.** In order of value: someone who has run a *vendor intake* at a delivery platform or a POS/menu-sync vendor
(integrations manager, partner engineering, merchant-ops tooling) · a merchant-ops / menu-quality analyst · an
operator who runs 3+ locations on two platforms. One is enough; a second from a different seat is better.

**Ground rules (say them aloud).** Not a sales call. No platform data, screenshots or internal numbers requested
or accepted — if they start to share one, stop them; the project runs on synthetic data by design (RULES §4) and
the record of this conversation names no employer. Notes go in `docs/research/` with the person described by
role only.

**The five questions (ask these; let them talk; do not pitch until Q5).**

1. **Discovery today.** "When your copy of a merchant's menu is wrong — price, a modifier, an 86'd item still
   showing — how do you find out, and how long after it went wrong?" *(Listening for: customer complaint ·
   refund report · merchant email · sampling · never. Write down the instrument they name — it is the baseline
   the pilot would be measured against.)*
2. **Ownership.** "Who owns that finding once it's known — and what does 'closed' mean for them?" *(Listening for:
   a team, an SLA, a queue tool, a root-cause tag list. If nobody owns it, the digest has no reader.)*
3. **Build vs. buy.** "If a tool showed you each drift with the receipt, the likely cause, and the dollars at risk,
   and a human had to sign anything it proposed — would your team pilot it, build it, or route around it? What
   would the first artifact your security or procurement people ask for be?" *(Listening for: SOC 2 · DPA ·
   data-path diagram · sub-processor list · 'we have a vendor for that' · 'we'd build it'. Each answer maps to a
   pilot-kit document; a confident 'build it' reshapes S4.)*
4. **The id problem.** "How do you match a platform item to the merchant's own catalog item today — shared ids,
   names, a mapping someone maintains?" *(Listening for: `merchant_supplied_id`, POS ids, a spreadsheet, nothing.
   This decides whether the human-owned mapping sheet is realistic or a dead end.)*
5. **The number.** "If a pilot ran for six weeks, what single number going down would make you extend it?"
   *(Listening for: error-charge adjustments per 1,000 orders · refund dollars · dispute minutes · agent-order
   cancellations · tickets. That number becomes the pre-registered pilot metric. Only now describe the product,
   in two sentences, and ask what in it sounds wrong.)*

**Close.** "Is there one person you'd want in the room before a pilot like this started?" — the next conversation.

**Afterwards (within the hour).** Write `docs/research/conversation-<n>-<role>-<date>.md`: role · the five
answers verbatim where possible · the instrument named in Q1 · the number named in Q5 · what in the plan this
contradicts · what it confirms. The lead then records a decision-log row stating which slices move.
