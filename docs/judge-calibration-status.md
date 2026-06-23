# Semantic Judge — P3 Calibration Status (2026-06-22)

**Status: infrastructure DONE + live path PROVEN; one clean calibration run REMAINS (gated on a fresh Groq daily token window). No "calibrated, metrics = X" claim ships until that run clears the bar (R-HON-3).**

## What is built + proven (this session)

- **Live cross-family judge WIRED + working.** `@ai-sdk/groq@2.0.42` installed; the Groq `openai/gpt-oss-120b` path is wired in `lib/agents/semantic-judge.ts` (`defaultJudgeGenerate`) with **strict structured outputs** (`structuredOutputs: true`) and **`reasoningEffort: "low"`**. A build-time strict-mode smoke returned schema-valid per-claim JSON and correctly flagged a planted fabrication. The key was verified live (HTTP 200; model available + non-deprecated, RULES §6).
- **Calibration harness + runner.** `evals/judge-calibration.live.test.ts` runs the live judge over the 30-item gold set (K=3 reps/item), partitions by the real gatekeeper (R-CAL-1), and writes a report (`lib/data/judge-calibration.snapshot.json`, regenerated each run). It is key-gated (auto-skips offline) and paces calls sequentially.

## Qualitative findings (directional — NOT the locked metrics)

A live run that completed surfaced two real signals (specific numbers are intentionally NOT enshrined here — the backing snapshot was a pre-fix run with a known true-negative inflation, and is superseded):

1. **Recall is strong** — the judge caught the planted fabrications it was shown (timelines like "approved by Friday", invented counts like "4 customers waiting", fabricated entities/benefits), across reps.
2. **Precision was dragged by a GROUNDING gap, not a real miss** — the judge wrongly flagged the **platform's own name** ("...onboarding step with DoorDash") and greeting/subject framing as "unsupported." **Root-caused and fixed**: the judge prompt now tells the model the email is sent BY the platform and to skip the platform name + greeting/sign-off framing (`buildJudgePrompt`, threaded `platformName`). A raw probe confirmed the fix discriminates cleanly (caught both planted fabrications, ignored platform/greeting) at `reasoningEffort: "low"`.

## The real constraint (read verbatim from the Groq 429 body)

```
Rate limit reached for model openai/gpt-oss-120b ... service tier on_demand
on tokens per day (TPD): Limit 200000, Used 199981, Requested 364.
```

- The binding free-tier limit is **tokens-per-day = 200,000** (NOT per-minute; the 8,000 TPM bucket was a red herring). Five debugging/calibration runs this session **exhausted today's 200K budget** (rolling 24h window; it trickles back slowly).
- **`reasoningEffort: "low"` is the fix that makes a full run cheap:** it cuts a judge call from ~700 to ~374 tokens, so the full 78-call calibration (26 gatekeeper-approved gold items × 3 reps) needs **~30K of the 200K daily budget** — comfortably feasible on a fresh window. Free tier is sufficient; today's was simply spent on debugging.

## Remaining P3 step (one clean run)

On a fresh Groq daily window (or any window with ≥ ~40K TPD headroom), run:
```
node --env-file=.env node_modules/.bin/vitest run evals/judge-calibration.live.test.ts
```
Then read `lib/data/judge-calibration.snapshot.json` for the held-out (test-split) recall/precision/F1 + κ + flip-rate. IF they clear the recall bar with an acceptable precision cost (R-CAL-7) → proceed to **P4** (eval-lock the threshold + gold set, freeze the judge fixture, wire the 3 demo surfaces to recorded verdicts, Codex gate, and only THEN flip the docs from "designed boundary" to "built + calibrated, metrics = X"). IF not → tune the prompt/threshold on the tune split and re-run.

**Honesty hold (R-HON-1/3):** numbers stay directional until the held-out floor clears the bar AND the Codex gate approves. No "built + calibrated" claim before then.
