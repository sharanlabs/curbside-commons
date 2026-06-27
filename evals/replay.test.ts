import { describe, it, expect } from "vitest";
import { RUN_TIMESTAMP, STEP_MAP } from "@/lib/core/constants";
import { buildReplaySnapshot } from "@/lib/replay/run";
import { normalizeRow } from "@/lib/core/pipeline";
import { mockDraft } from "@/lib/agents/draft";
import { runGatekeeper } from "@/lib/agents/gatekeeper";
import { mockJudgeResult } from "@/lib/agents/semantic-judge";
import { mockDomainJudge, dimensionPassMap } from "@/lib/agents/domain-judge";

const snap = buildReplaySnapshot();

describe("REPLAY snapshot — deterministic, honest, complete", () => {
  it("is deterministic and recorded (no wall-clock, no spend)", () => {
    expect(buildReplaySnapshot()).toEqual(snap);
    expect(snap.servedMode).toBe("REPLAY");
    expect(snap.generatedAt).toBe(RUN_TIMESTAMP);
    expect(snap.costLedger.totalUsd).toBe(0);
    expect(snap.costLedger.liveCalls).toBe(0);
  });

  it("covers the full hybrid set with real provenance", () => {
    expect(snap.merchants.length).toBe(20);
    expect(snap.summary.merchants).toBe(20);
    expect(snap.provenance.license).toContain("PDDL");
  });

  it("every recorded draft is gate-clean and quality-passing (mock path)", () => {
    for (const rm of snap.merchants) {
      expect(["PASS", "WARN"]).toContain(rm.gatekeeper.status);
      expect(rm.gatekeeper.approvedForHumanReview).toBe(true);
      expect(rm.evalScore.pass).toBe(true);
      expect(rm.draft.claims.length).toBe(4);
      expect(rm.audit.length).toBeGreaterThanOrEqual(4);
    }
    expect(snap.summary.evalPassed).toBe(20);
    expect(snap.summary.rejected).toBe(0);
  });

  it("shows BOTH human-in-the-loop outcomes and the full blocker taxonomy", () => {
    expect(snap.summary.sent).toBeGreaterThan(0);
    expect(snap.summary.held).toBeGreaterThan(0);
    for (const { blocker } of Object.values(STEP_MAP)) {
      expect(snap.summary.blockers[blocker]).toBeGreaterThan(0);
    }
  });
});

describe("REPLAY — domain-quality judge wired as the advisory tertiary control (B2)", () => {
  it("runs the domain judge exactly on gatekeeper-approved drafts, $0, mock mode", () => {
    for (const rm of snap.merchants) {
      // Parallel-gated to the faithfulness judge (R-DARCH-4): present iff the gatekeeper approved;
      // null = blocked (skipped). In REPLAY every draft is approved, so every merchant is judged.
      expect(rm.domainJudge !== null).toBe(rm.gatekeeper.approvedForHumanReview);
      if (rm.domainJudge) {
        expect(rm.domainJudge.mode).toBe("DETERMINISTIC_JUDGE");
        expect(rm.domainJudge.costUsd).toBe(0);
      }
    }
    expect(snap.costLedger.totalUsd).toBe(0); // wiring the tertiary control in stays $0
  });

  it("scores all three rubric dimensions INCLUDING no_over_promise (§4.2 keeps it a gating dimension)", () => {
    for (const rm of snap.merchants) {
      if (!rm.domainJudge) continue;
      const dims = rm.domainJudge.verdict.dimensions.map((d) => d.dimension);
      expect(dims).toContain("matched_to_blocker");
      expect(dims).toContain("engagement_appropriate");
      expect(dims).toContain("no_over_promise"); // §4.2 decision: kept as detection, not dropped
      expect(rm.domainJudge.verdict.dimensions.length).toBe(3);
      // domain_defective is recomputed from the per-dimension passes — never a model self-flag.
      expect(rm.domainJudge.verdict.domain_defective).toBe(
        rm.domainJudge.verdict.dimensions.some((d) => !d.pass),
      );
    }
  });

  it("is ADVISORY — a domain-defective verdict NEVER changes eligibility or the send", () => {
    // Non-vacuous (the binding Phase-0 precondition AM-4 / R-LOOP-1b): the mock flags merchants
    // domain_defective that the DETERMINISTIC core still marked simulated_sent. If the judge could gate
    // the send, this set would be empty. Its non-emptiness proves the judge cannot override eligibility.
    const defectiveYetSent = snap.merchants.filter(
      (rm) => rm.domainJudge?.verdict.domain_defective && rm.outreachStatus === "simulated_sent",
    );
    expect(defectiveYetSent.length).toBeGreaterThan(0);
    // And the converse safety: outreachStatus is only ever a core-computed value, never judge-derived.
    for (const rm of snap.merchants) {
      expect(rm.outreachStatus).toBe(rm.merchant.outreach_status);
    }
  });

  it("records a 'domain' audit entry, ordered AFTER the faithfulness judge and BEFORE eval (R-DARCH-4)", () => {
    for (const rm of snap.merchants) {
      const actors = rm.audit.map((a) => a.actor);
      expect(actors).toContain("domain");
      const judgeIdx = actors.indexOf("judge");
      const domainIdx = actors.indexOf("domain");
      const evalIdx = actors.indexOf("eval");
      expect(judgeIdx).toBeLessThan(domainIdx);
      expect(domainIdx).toBeLessThan(evalIdx);
      // The audit detail stays honest: it never says the domain judge "rejected" the merchant, and a
      // flagged verdict is explicitly labeled advisory.
      const entry = rm.audit[domainIdx];
      expect(entry.detail.toLowerCase()).not.toContain("reject");
      if (rm.domainJudge?.verdict.domain_defective) {
        expect(entry.detail.toLowerCase()).toContain("advisory");
      }
    }
  });
});

describe("§4.2 non-redundancy — no_over_promise catches implied-typicality hype the upstream controls structurally miss", () => {
  it("a grounded draft + implied-typicality prose: gatekeeper APPROVES, faithfulness PASSES, ONLY no_over_promise FAILS", () => {
    // This is the demonstration behind the owner's §4.2 decision (keep no_over_promise as a gating domain
    // dimension): it catches what the upstream controls structurally cannot. We use an ACTIVELY-STUCK
    // merchant (so matched_to_blocker + engagement_appropriate both pass — isolating no_over_promise as the
    // SOLE catch), take the grounded base draft, and append implied-typicality hype that has NO merchant
    // data field to entail against.
    const m = normalizeRow(
      { merchant_name: "Test Bistro", merchant_category: "Restaurant", days_since_signup: 18, last_login_days_ago: 2, steps_completed: 2, source_risk_level: "Medium" },
      201,
    );
    const base = mockDraft(m);
    const hype = {
      ...base,
      draft_body: `${base.draft_body} Stores like yours quickly become neighborhood favorites.`,
    };

    // Upstream control 1 — the DETERMINISTIC gatekeeper APPROVES: implied typicality dodges the
    // forbidden-claim guardrail (which targets explicit earnings/%/guarantee/urgency, not "stores like you").
    expect(runGatekeeper(hype, m).approvedForHumanReview).toBe(true);
    // Upstream control 2 — the FAITHFULNESS judge PASSES: the hype is not a checkable per-merchant fact, so
    // there is no data field to entail it against — per-claim entailment structurally cannot see it.
    expect(mockJudgeResult(hype, m).verdict.any_unsupported).toBe(false);
    // Tertiary control — ONLY no_over_promise fails; matched + engagement still pass. The §4.2 seam, closed.
    const dom = mockDomainJudge(hype, m); // returns a DomainVerdict directly (not wrapped in .verdict)
    expect(dimensionPassMap(dom)).toEqual({
      matched_to_blocker: true,
      engagement_appropriate: true,
      no_over_promise: false,
    });
    expect(dom.domain_defective).toBe(true);
  });
});
