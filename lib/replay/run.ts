/**
 * The REPLAY orchestrator — runs the full end-to-end loop over the hybrid set and
 * assembles the snapshot the desktop surface renders. Deterministic + pure (no network,
 * no wall-clock, no spend), so the public demo never bills.
 *
 * For THIS slice the draft path is the deterministic stub (mockDraft), so each draft's
 * mode is DETERMINISTIC_RULES and the cost ledger is $0. servedMode is REPLAY: the
 * surface renders a recorded/reproducible snapshot, not a live call. getReplaySnapshot()
 * is the seam — Phase B records a real-Gemini run behind this same accessor (freezing a
 * fixture), and the surface is unchanged.
 */
import { PRICING_VERSION } from "@/lib/agents/pricing";
import { REFERENCE_PLATFORM_NAME, RUN_TIMESTAMP } from "@/lib/core/constants";
import { runCore } from "@/lib/core/pipeline";
import type { Merchant } from "@/lib/core/types";
import { mockDraft, type OutreachDraft } from "@/lib/agents/draft";
import type { AgentMode } from "@/lib/agents/gemini";
import { runGatekeeper, type GatekeeperReport } from "@/lib/agents/gatekeeper";
import { scoreDraft, type DraftScore } from "@/lib/evals/draft-quality";
import { diagnose, type Diagnosis } from "@/lib/domain/diagnosis";
import { getHybridMerchants, hybridProvenance, type HybridProvenance } from "@/lib/ingest/hybrid";

export interface AuditEntry {
  at: string;
  actor: "system" | "draft" | "gatekeeper" | "eval";
  action: string;
  detail: string;
}

export interface ReplayMerchant {
  merchant: Merchant;
  draft: OutreachDraft;
  draftMode: AgentMode;
  gatekeeper: GatekeeperReport;
  evalScore: DraftScore;
  /** Domain-depth diagnosis: engagement state + root-cause hypothesis + routed reactivation play. */
  diagnosis: Diagnosis;
  costUsd: number;
  /** Final human-in-the-loop state: held / simulated_sent / draft_rejected / none. */
  outreachStatus: Merchant["outreach_status"];
  audit: AuditEntry[];
}

export interface ReplaySummary {
  merchants: number;
  sent: number;
  held: number;
  rejected: number;
  blockers: Record<string, number>;
  riskLevels: Record<string, number>;
  evalPassed: number;
  evalTotal: number;
}

export interface CostLedger {
  totalUsd: number;
  pricingVersion: string;
  liveCalls: number;
  note: string;
}

export interface ReplaySnapshot {
  servedMode: AgentMode;
  platformName: string;
  generatedAt: string;
  provenance: HybridProvenance;
  summary: ReplaySummary;
  costLedger: CostLedger;
  merchants: ReplayMerchant[];
}

function buildAudit(
  m: Merchant,
  gate: GatekeeperReport,
  evalScore: DraftScore,
  diagnosis: Diagnosis,
): AuditEntry[] {
  return [
    {
      at: RUN_TIMESTAMP,
      actor: "system",
      action: "TRIAGE",
      detail: `risk=${m.risk_score} (${m.risk_level}); blocker=${m.current_blocker_code}; engagement=${diagnosis.engagement_state}; play=${diagnosis.play.touch}`,
    },
    {
      at: RUN_TIMESTAMP,
      actor: "draft",
      action: "DETERMINISTIC_RULES",
      detail: "Outreach drafted by the deterministic stub (REPLAY; a recorded real-Gemini run is on the Eval page).",
    },
    {
      at: RUN_TIMESTAMP,
      actor: "gatekeeper",
      action: gate.status,
      detail: `${gate.failures.length} failure(s), ${gate.warnings.length} warning(s).`,
    },
    {
      at: RUN_TIMESTAMP,
      actor: "eval",
      action: evalScore.pass ? "PASS" : "FAIL",
      detail: `${evalScore.passed}/${evalScore.total} quality dimensions passed.`,
    },
    {
      at: RUN_TIMESTAMP,
      actor: "system",
      action: m.outreach_status.toUpperCase(),
      detail:
        m.outreach_status === "simulated_sent"
          ? "Eligible and not held — simulated send recorded (idempotent)."
          : m.review_required
            ? "Held for human approval before any send."
            : "No send.",
    },
  ];
}

/** Build the deterministic end-to-end REPLAY snapshot over the hybrid set. */
export function buildReplaySnapshot(platformName = REFERENCE_PLATFORM_NAME): ReplaySnapshot {
  const { merchants } = runCore(getHybridMerchants(), {}, platformName);

  const replayMerchants: ReplayMerchant[] = merchants.map((m) => {
    const draft = mockDraft(m, platformName);
    const gatekeeper = runGatekeeper(draft, m, platformName);
    draft.guardrail_flags = gatekeeper.guardrailFlags; // stamp the record accurately
    const evalScore = scoreDraft(draft, m, platformName);
    const diagnosis = diagnose(m);
    return {
      merchant: m,
      draft,
      draftMode: "DETERMINISTIC_RULES",
      gatekeeper,
      evalScore,
      diagnosis,
      costUsd: 0,
      outreachStatus: m.outreach_status,
      audit: buildAudit(m, gatekeeper, evalScore, diagnosis),
    };
  });

  const blockers: Record<string, number> = {};
  const riskLevels: Record<string, number> = {};
  for (const rm of replayMerchants) {
    blockers[rm.merchant.current_blocker_code] = (blockers[rm.merchant.current_blocker_code] ?? 0) + 1;
    riskLevels[rm.merchant.risk_level] = (riskLevels[rm.merchant.risk_level] ?? 0) + 1;
  }

  const summary: ReplaySummary = {
    merchants: replayMerchants.length,
    sent: replayMerchants.filter((r) => r.outreachStatus === "simulated_sent").length,
    held: replayMerchants.filter((r) => r.merchant.review_required && r.outreachStatus === "drafted").length,
    rejected: replayMerchants.filter((r) => r.outreachStatus === "draft_rejected").length,
    blockers,
    riskLevels,
    evalPassed: replayMerchants.filter((r) => r.evalScore.pass).length,
    evalTotal: replayMerchants.length,
  };

  return {
    servedMode: "REPLAY",
    platformName,
    generatedAt: RUN_TIMESTAMP,
    provenance: hybridProvenance,
    summary,
    costLedger: {
      totalUsd: 0,
      pricingVersion: PRICING_VERSION,
      liveCalls: 0,
      note: "Deterministic stub drafting — no live Gemini calls, $0.00 spend. A real Gemini run is recorded (see Eval); the public demo stays REPLAY-only.",
    },
    merchants: replayMerchants,
  };
}

const cache = new Map<string, ReplaySnapshot>();

/** The accessor the surface uses. Builds once per platform name (deterministic); Phase B
 *  can swap in a recorded live-Gemini fixture here without changing any caller. */
export function getReplaySnapshot(platformName = REFERENCE_PLATFORM_NAME): ReplaySnapshot {
  let snap = cache.get(platformName);
  if (!snap) {
    snap = buildReplaySnapshot(platformName);
    cache.set(platformName, snap);
  }
  return snap;
}

/** One merchant's end-to-end record by id (for the detail surface). */
export function getReplayMerchant(
  merchantId: string,
  platformName = REFERENCE_PLATFORM_NAME,
): ReplayMerchant | undefined {
  return getReplaySnapshot(platformName).merchants.find(
    (rm) => rm.merchant.merchant_id === merchantId,
  );
}
