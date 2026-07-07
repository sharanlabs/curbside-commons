# A3 Delivery Safety Controls — governing any future L-2 transient live demo

**Status:** committed 2026-07-07 with slice A3 (plan `docs/plan-agentic-extension.md` §5 rows A3/L-2; RULES §3 — no live Slack/email until the offline slice + THESE controls exist). **The L-2 live send is NOT armed by this document** — it requires the owner's own explicit word, after which the demo runs under every control below with no exceptions.

## What exists now (offline, this slice)

Pure payload builders only: `lib/delivery/slack.ts` (Block Kit JSON) and `lib/delivery/email.ts` (RFC 5322 MIME). No client, no webhook URL, no token, no SMTP, no address book — the modules cannot transmit anything, machine-proven by the import walk (node builtins only) and the zero-network source scan.

## Binding controls for the L-2 transient demo (all mandatory)

1. **Owner word per send.** One explicit arming = one demo session; no standing authorization; no scheduled or triggered sends (prototype-not-service, AC-12).
2. **Allowlisted recipient only.** Exactly ONE recipient, owned by the owner (their own Slack workspace channel / their own inbox), named in the arming word and hard-coded for that run; the `.example` placeholders are replaced ONLY for that run and never committed.
3. **One-shot.** A single message per armed demo; no retries without a fresh word; the send script exits after one transmission.
4. **Banner in every message.** The SIMULATED banner leads every payload (already enforced at build time — the builder throws without it); the subject/fallback line carries it too.
5. **Secrets stay out of the repo** (RULES §11): webhook URL / API key via environment at run time only, never committed, never logged; the run record stores a REDACTED transcript.
6. **Record the run.** Timestamped run record in `docs/reviews/` (what was sent, to which allowlisted target, payload hash, redactions noted) — same evidence discipline as every live run in this repo.
7. **Free-tier first.** Slack: a free workspace incoming webhook. Email: any RFC 5322-capable sender — Resend (named in RULES §3) or a free/self-hosted alternative (e.g. an SMTP relay container) per the public-doc free-alternative rule; provider choice binds only at arming (O-A5).
8. **Failure semantics.** A failed/partial send is reported as-is (never retried to green silently); a provider error ends the demo session.
