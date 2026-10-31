# Five-minute walk — the site, for an executive

**Type:** how-to · **Audience:** the person presenting to a platform executive · **Written:** 2026-10-14, Wave 2 / exec-layer; corrected 2026-10-31 · **Contract:** `demo-script-10min.md`, compressed; plan § 12 slice labels. Walk only what exists; say everything else aloud with its label.

## The answer first

Five minutes, five beats: the front page, the bundled pair and one receipt, the delivery payloads, the `/pilot` page (cost and governance), and the one number a platform would measure later. **Nothing is shown that does not exist.**

## What this walk is not claiming

- **Everything on screen is synthetic.** Say so first: the merchant, the menu and the statement are invented; the rules and the cited law are not.
- **"Shaped like the public integration docs, not from the platform."** No affiliation, partnership, endorsement, access or business impact is claimed or implied.
- **Read figures off the screen**, never from this page. They are derived in code and held equal to an engine run by tests.

## Before you start

Run `npm run dev` and open `http://localhost:3000`, or open the live site. **`/pilot` reaches the live site at the next deploy**, which the owner has deferred (2026-10-31); until then, show it from `npm run dev`.

| Time | Say · do | Honest line |
| --- | --- | --- |
| **0:00–0:45** | Open **`/`**. Point at the two slots (the published feed and the system of record) and at the footer link to the "What is real" statement. | No platform data; a prototype run on demand. |
| **0:45–1:45** | Click **Run the bundled pair**. Read the verdict and the tally **off the screen** (derived; `evals/packs/test-guide.test.ts` holds them equal to an engine run). Open one finding's receipt: claim, reference row, rule id, severity. | The engine judged; no model can flip a verdict. |
| **1:45–2:30** | Scroll to **DELIVERY**: the Slack payload and the email, stamped **BUILT, NOT SENT**. | Rendered artifacts only; no send transport is wired. |
| **2:30–4:15** | Open **`/pilot`**. Walk the delivery point (a proposal), the cost model (read the assumptions table, then the derived figures, then the sentence that none is a measurement), the governance tiers, and the scenario library's state. | Every figure on the page is derived by `lib/landing/pilot-figures.ts`; the library shows which scenarios are built and which arrive. |
| **4:15–5:00** | Name the one number: **M1**, measured with the platform's own instruments after a separate deployment decision. Offer the kit (`executive-brief.md`, `pilot-proposal.md`, `security-one-pager.md`). Ask which pre-registered floor would change their decision. | Running on the platform's own data is a separate decision, after this pilot. |

## Say aloud, do not show

- Five scenario folders are built in the repository (`agent-86`, `sync-outage`, `platform-override`, `partner-onboarding`, `fee-precheck`); `modifier-drift` and `spec-valid-lie` arrive in S1.5 (in progress) and `injected-artifact` in S3. The on-site scenario picker arrives in S4. `/pilot` reads the folders as they exist, so it shows the current state.
- The deterministic "why" and the route table arrive in S2 (in progress).

## Optional pointer

For a ten-minute version with the **FEES** station and the fuller roadmap, use [`demo-script-10min.md`](demo-script-10min.md): same honesty rules, a longer path.
