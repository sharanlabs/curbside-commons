# How this was built — the process, translated

*You'll notice this repo carries an unusual amount of process: hundreds of review
records, a decision log, evidence files, adversarial audits. This page explains
what all of that is, in plain language, and why it's the point rather than the
overhead.*

## The one-sentence version

One person directed two frontier AI systems to build this — one as the builder,
one as a standing adversarial reviewer — under written rules that neither AI is
allowed to relax, and the paper trail you see is what it looks like when
AI-assisted engineering is run like an engineering discipline instead of a
chat session.

## The division of labor

- **The human owner** decides scope, architecture, product direction, public
  claims, and anything irreversible (sends, spends, deploys, publishing). Every
  such decision is a dated row in `docs/decision-log.md`, in the owner's own
  words.
- **Claude (the builder)** plans and writes the code, slice by slice, under a
  startup contract (`RULES.md`, `CLAUDE.md`) it must re-read every session.
- **A second, independent AI (Codex, a different vendor's model)** reviews every
  batch of changes adversarially — its job is to find what the builder got wrong.
  Its raw, unedited verdicts are committed under `docs/reviews/`. When it's
  wrong, the refutation is written down with evidence; when it's right, the fix
  is red-green tested. Neither AI rubber-stamps the other.

## The rules that don't move

1. **Nothing is claimed that wasn't earned.** Every quality label ("calibrated",
   "agent") traces to an evaluation whose passing bars were committed to git
   *before* the test ran — and when a run missed a bar, the miss stayed public
   and the label stayed off (see the deferred first calibration run, kept
   permanently in `docs/fee-classifier-calibration-status.md`).
2. **Deterministic before AI.** The core verifier makes zero AI calls — that's
   machine-enforced by tests that walk the import graph, not a promise.
3. **Humans gate the irreversible.** Exactly one real message was ever sent by
   this project; it was armed by the owner in writing, wrapped in eight written
   safety controls, and its full record is committed.
4. **Simulated is labeled simulated, everywhere, always.**

## Why the trail is so heavy

Because the honest answer to "how do you engineer with AI without being fooled
by it?" *is a process*, and the trail is the evidence the process ran: the fix
history shows the adversarial reviews bit (dozens of accepted findings, each
with a test that failed before the fix and passed after), the decision log shows
a human deciding, and the pre-registrations show the evals weren't graded on a
curve. If the trail were light, the claims above would just be words.

## Where to look if you want proof, not prose

- A review that caught real defects and the fixes it forced:
  `docs/reviews/codex-2026-07-10-batchA.md`
- A pre-registration committed before its test ran:
  `docs/fee-classifier-recalibration-status.md`
- The import-graph test that makes "no AI calls" a fact:
  `evals/crew/crew-import-walk.test.ts`
- The one recorded send and its controls:
  `docs/reviews/l2-slack-one-shot-2026-07-09T15-06-01-054Z.md`
- The live evidence dashboard, where every figure cites the committed file it
  comes from: `/eval` on the site.

*Human-led, AI-assisted, professionally reviewed — this page is what that
sentence means in practice.*
