# Ten-minute walkthrough script

**Type:** how-to · **Audience:** the person presenting to a platform's operations, risk or executive readers · **Written:** 2026-10-12, Wave 1 / S4-docs · **Contract:** plan § 17 and the kit's honesty rules; the script walks **only paths that exist today** and labels everything else "arrives in S\<n\>". · **Corrected:** 2026-10-31, Wave 2 / exec-layer, from the Wave 1 acceptance review (`docs/reviews/wave1-acceptance-2026-10-31.md`, items 10, 12–14 and check (a)).

## The answer first

Ten minutes, four live paths: the landing page (`/`), the bundled pair, the spreadsheet template with `/docs#test-it`, and the DELIVERY station. The last minutes say, aloud and without a screen, what is planned and when. **Nothing is shown that does not exist.**

*In plain words:* open the site, press one button, read what it found, change one cell in a spreadsheet and watch the count move by one, look at the messages it would send, then say plainly what comes next.

## What this script is not claiming

- **Everything on screen is synthetic.** Say so in the first minute. The merchant, menu and fee statement are invented.
- **"Shaped like the public integration docs, not from the platform."** Use that sentence whenever a platform's name comes up. No affiliation, partnership, endorsement, access or real-world impact is claimed.
- **Do not say** that the problem is unwatched (merchant-side monitors exist; plan § 16), that the tool has touched a platform's systems or merchants, or that any number is a measured effect. Do not describe the bundled menu as anyone's actual menu.
- **Do not read figures from this page.** Read them off the screen. They are derived by `lib/landing/test-guide.ts` and held equal to an engine run by `evals/packs/test-guide.test.ts`, so a number typed here could only drift.
- Labels in this script are the ones on `main` at `fac8204`, re-checked at `cd0d347` (2026-10-31). The site's layout is planned to be redesigned in Wave 3, so **re-check each label before every use.**

## Before you start

- Open the live site, or run `npm run dev` and use `http://localhost:3000`.
- Have a spreadsheet application ready.
- Fallback with no network: `npm run walkthrough` prints the same audit, the Slack payload and the email in a terminal. It sends nothing.

## The minutes

| Minute | Say | Do (live path) | Watch for |
| --- | --- | --- | --- |
| **0:00–1:00** | "Everything you will see is invented: the merchant, the menu, the statement. The rules are real and cited. This is a prototype run on demand." | Open `/`. Point at the footer link to the "What is real" page. | The two labeled slots: "A published menu feed" and "The system of record". |
| **1:00–3:00** | "Left: what a marketplace shows. Right: what the merchant holds. We compare line by line with exact rules. No model can flip a verdict; the AI seats recommend only." | Click **Run the bundled pair**. | The verdict and the tally. **Read them off the screen**, do not recall them. |
| **3:00–4:30** | "Every finding carries its evidence: the claim, the reference row, the rule id, the severity." | Open one finding's receipts. Point at the RUN ticker: HELD means a real finding, OK means that row had none. | The stream is the engine's own run: `evals/e2e/canonical.spec.ts` holds every HELD line to the rule id the engine cited and the ticker to the run's own tally. |
| **4:30–6:00** | "Now your data would come in as a spreadsheet. One edit changes the count by exactly one." | Open `/docs#test-it`. Click **Download the spreadsheet template** under each slot. Edit the one row the guide names, as it is written on the page. Drop the edited file into the feed slot and the untouched record file into the record slot. Click **Run the audit**. Change the cell back. | The tally moves by one and returns. Read the row and the outcome off `/docs#test-it`. |
| **6:00–7:00** | "These are the messages the workflow would send. It builds them. It does not send them." | Scroll to the **DELIVERY** station. | The Slack payload and the email, stamped **BUILT, NOT SENT**. The SIMULATED banner comes from the builder, not page copy. |
| **7:00–8:00** | "For a legal team, the same engine reads a fee statement against New York City's published caps." | Show the **FEES** station, or open `/fees` and load the bundled statement. | A statement audited against NYC §20-563.3. Say it is not legal advice. |
| **8:00–9:00** | "Here is what is not built yet. I am saying it, not showing it." | **No screen.** Say the roadmap below. | Do not click anything that implies the roadmap exists. |
| **9:00–10:00** | "If useful, a six-week pilot on invented scenarios with your risk and ops teams in the room. Whether it ever runs on your own data is a separate decision, with its own security review, after that." | Offer the kit: the proposal, the metrics, the security one-pager. | Ask what number would change a decision for them. |

## The roadmap to say aloud (minute 8:00–9:00)

Say each item with its label, and say that none of it is on the site today.

- A picker for the scenarios on the site — **arrives in S4**. Five scenario folders (synthetic inputs plus the engine's report) are built in the repository today; two more arrive in S1.5 (in progress) and one in S3.
- A deterministic "why" for each finding, an impact figure with its arithmetic, a readable routing table and a run that writes to the ledger — **arrives in S2 (in progress)**. The impact arithmetic and the ledger library themselves merged on 2026-10-31; neither shows in a run yet.
- Platform-shaped input adapters and an id-mapping sheet — **arrives in S3**.
- The `/pilot` page (the delivery point, cost model and governance as a proposal) is in the build from Wave 2 and reaches the live site at the next deploy, which the owner has deferred (2026-10-31). A partner-ticket builder — **arrives in S4**.
- An exam for the AI "root cause" seat — **arrives in S5**. Until it passes, that seat shows DEFER.

## Variants by listener

| Listener | Spend more time on | Skip |
| --- | --- | --- |
| **Executive sponsor** | 1:00–3:00, then 9:00–10:00 | 3:00–4:30 detail |
| **Merchant-ops** | 3:00–6:00 | 7:00–8:00 |
| **Integrations** | 4:30–6:00, the spreadsheet path, then the id-mapping sheet in the roadmap | 7:00–8:00 |
| **Risk and security** | 0:00–1:00, 6:00–7:00, then hand over `security-one-pager.md` | 7:00–8:00 |
| **Compliance and legal** | 7:00–8:00, then `../governance-model.md` | 4:30–6:00 |

## Questions to expect

| Question | Answer, within the honesty rules |
| --- | --- |
| "Is this our data?" | "No. It is invented. If you try it on yours, you run it inside your own environment and we never receive it." |
| "Are you connected to us?" | "No. We have no access to your systems and no relationship with your company. The platform-shaped inputs follow your public documentation." |
| "Does the AI decide?" | "No. The engine decides; a rule table routes; the AI seats only approve or hand off, and each shows DEFER on any model that has not passed its exam." |
| "What does it cost?" | "Nothing to run: replay costs nothing and live runs use free tiers (owner decision 2026-10-12; each free tier's terms are re-verified at use, `RULES.md` §6). In this pilot your side is reviewer time on the scenario library; a later deployment on your own data would add exports, outside this pilot. The cost-benefit model is in the proposal, with every assumption named and labeled illustrative." |
| "What would success look like?" | "One pre-registered number, with its pass mark written down before the first run. The page says TBD until then, on purpose." |

## Sources

`docs/how-to-test.md` (the live paths and their labels, at `fac8204`, re-checked at `cd0d347`); `lib/landing/test-guide.ts` and `evals/packs/test-guide.test.ts` (the derived figures); plan §§ 12, 16, 17; `docs/decision-log.md` 2026-10-12.
