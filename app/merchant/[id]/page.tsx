import type { CSSProperties, ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getReplaySnapshot, getReplayMerchant } from "@/legacy/activation/lib/replay/run";
import { PLATFORM_NAME, HONEST_DATA_LABEL } from "@/lib/product";
import { TOTAL_STEPS } from "@/legacy/activation/lib/core/constants";
import { DIMENSION_SPECS } from "@/legacy/activation/lib/domain/effective-rubric";
import { Mark } from "@/components/data-surfaces/Mark";

export function generateStaticParams() {
  return getReplaySnapshot(PLATFORM_NAME).merchants.map((rm) => ({ id: rm.merchant.merchant_id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const rm = getReplayMerchant(id, PLATFORM_NAME);
  return { title: rm ? rm.merchant.merchant_name : "Merchant" };
}

const GATE_CHIP: Record<string, string> = { PASS: "pass", WARN: "warn", BLOCKED: "blocked" };
const GATE_MARK: Record<string, "check" | "flag" | "alert"> = {
  PASS: "check",
  WARN: "flag",
  BLOCKED: "alert",
};
const RISK_CHIP: Record<string, string> = { Low: "low", Medium: "medium", High: "high" };

function Section({ title, plain, children }: { title: string; plain: string; children: ReactNode }) {
  return (
    <section className="ds-card flush">
      <h2>{title}</h2>
      <p className="ds-card-p" style={{ color: "var(--muted)", margin: "6px 0 12px" }}>
        {plain}
      </p>
      {children}
    </section>
  );
}

export default async function MerchantDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const rm = getReplayMerchant(id, PLATFORM_NAME);
  if (!rm) notFound();

  const { merchant: m, draft, gatekeeper: gate, judge, domainJudge, evalScore, diagnosis } = rm;
  const mRec = m as unknown as Record<string, unknown>;
  const stepsRemaining = TOTAL_STEPS - m.steps_completed;

  return (
    <main className="ds-data ds-wrap ds-narrow ds-view">
      <Link href="/" className="ds-back">
        <Mark name="arrow" />
        <span>Activation queue</span>
      </Link>

      <div className="ds-mhead">
        <div>
          <h1>{m.merchant_name}</h1>
          <p className="ds-msub">
            {m.merchant_category} · {m.merchant_id} · onboarding {m.steps_completed}/{TOTAL_STEPS}
          </p>
        </div>
        <span className={`ds-chip ${RISK_CHIP[m.risk_level]}`} style={{ fontSize: "11px" }}>
          {m.risk_level} risk · {m.risk_score}
        </span>
      </div>

      <div className="ds-stack" style={{ marginTop: "18px" }}>
        <Section
          title="1 · Triage & diagnosis"
          plain="How stuck this merchant is, and exactly what's blocking them — by an auditable rule, not a model guess."
        >
          <dl className="ds-fields">
            <Field label="Risk score" value={`${m.risk_score} (${m.risk_level})`} />
            <Field label="Blocker" value={m.current_blocker_code} />
            <Field label="Next best action" value={m.next_best_action} />
            <Field label="Days since signup" value={String(m.days_since_signup)} />
            <Field label="Last login (days ago)" value={String(m.last_login_days_ago)} />
            <Field label="Reason codes" value={m.risk_reason_codes.join(", ") || "—"} />
          </dl>
          <p className="ds-formula">
            risk = 2×{m.days_since_signup} + 3×{m.last_login_days_ago} + 10×({TOTAL_STEPS}−
            {m.steps_completed}) = {m.risk_score}
            <span className="dim">
              {"  "}# {stepsRemaining} step{stepsRemaining === 1 ? "" : "s"} remaining
            </span>
          </p>

          <div className="ds-sub">
            <div className="ds-tags">
              <span className="ds-tag role">Why they&apos;re stuck</span>
              <span className="ds-tag">{diagnosis.engagement_state.replace(/_/g, " ")}</span>
              <span className="ds-tag">{diagnosis.blocker_source.replace(/_/g, " ")}</span>
            </div>
            <p className="ds-card-p" style={{ marginTop: "10px" }}>
              {diagnosis.root_cause_hypothesis}
            </p>
            <div
              style={{
                marginTop: "10px",
                border: "1px solid var(--rule)",
                background: "var(--bg)",
                borderRadius: "8px",
                padding: "10px 12px",
              }}
            >
              <span className="ds-tag role" style={{ background: "none", border: "none", padding: 0 }}>
                Recommended play ·{" "}
              </span>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--ink)" }}>
                {diagnosis.play.touch.replace(/_/g, " ")}
              </span>
              <p className="ds-card-p" style={{ marginTop: "6px" }}>
                {diagnosis.play.action}
              </p>
              <p className="ds-card-tech" style={{ fontFamily: "var(--ff-sans)" }}>
                {diagnosis.play.rationale}
              </p>
            </div>
            <p className="ds-gate-note" style={{ marginTop: "8px" }}>
              {diagnosis.caveat}
            </p>
          </div>
        </Section>

        <Section
          title="2 · Drafted outreach"
          plain="A bounded, schema-constrained draft. Here it's the deterministic stub (REPLAY); a recorded real-Gemini run is on the Eval page — the safety machinery around it is identical either way."
        >
          <div className="ds-draft">
            <div className="ds-draft-sub">{draft.draft_subject}</div>
            <div className="ds-draft-body">{draft.draft_body}</div>
          </div>
          <p className="ds-card-tech" style={{ fontFamily: "var(--ff-sans)", color: "var(--graphite)" }}>
            Claims (each declared claim, verified against the merchant&apos;s data):
          </p>
          <ul className="ds-claims">
            {draft.claims.map((c, i) => (
              <li key={i}>
                <Mark name="check" style={{ width: "13px", height: "13px", color: "var(--ok)", flex: "none" }} />
                <code className="ds-code">
                  {c.field} = {String(c.value)}
                </code>
                <span style={{ color: "var(--muted)" }}>
                  → merchant.{c.field} = {String(mRec[c.field])}
                </span>
              </li>
            ))}
          </ul>
          <p className="ds-meta-line">
            mode: {rm.draftMode} · cost: ${rm.costUsd.toFixed(2)} · model: {draft.model_version}
          </p>
        </Section>

        <Section
          title="3 · Claims-gatekeeper"
          plain="A deterministic firewall: the draft cannot reach a human unless every declared claim checks out against the merchant's data and no forbidden-claim pattern is present."
        >
          <div className="ds-judge-h">
            <span className={`ds-chip ${GATE_CHIP[gate.status]}`}>
              <Mark name={GATE_MARK[gate.status]} />
              {gate.status}
            </span>
            <span className="ds-judge-count">
              {gate.approvedForHumanReview
                ? "Approved for the human gate"
                : "Auto-rejected (not shown to a human)"}
            </span>
          </div>
          <FlagList label="Guardrail flags" items={gate.guardrailFlags} emptyText="none — clean" />
          <FlagList label="Failures" items={gate.failures} emptyText="none" />
          <FlagList label="Warnings" items={gate.warnings} emptyText="none" tone="warn" />
        </Section>

        <Section
          title="4 · Faithfulness check (semantic judge)"
          plain="A second, independent check: an LLM from a DIFFERENT model family reads the finished message and verifies each factual sentence against the merchant's data row — catching an invented number, capability, or timeline the deterministic gatekeeper structurally can't see. Here it's the deterministic stub verdict (REPLAY, $0); the live cross-family judge (Groq gpt-oss-120b) is key-gated."
        >
          {judge ? (
            <>
              <div className="ds-judge-h">
                <span className={`ds-chip ${judge.verdict.any_unsupported ? "warn" : "pass"}`}>
                  <Mark name={judge.verdict.any_unsupported ? "flag" : "check"} />
                  {judge.verdict.any_unsupported ? "UNSUPPORTED CLAIM" : "ALL SUPPORTED"}
                </span>
                <span className="ds-judge-count">
                  {judge.verdict.claims.filter((c) => c.supported).length}/{judge.verdict.claims.length}{" "}
                  prose assertions backed by the data row
                </span>
              </div>
              <ul className="ds-judge-list">
                {judge.verdict.claims.map((c, i) => (
                  <li key={i}>
                    <Mark name={c.supported ? "check" : "x"} style={{ color: c.supported ? "var(--ok)" : "var(--error)" }} />
                    <span>
                      {c.text}
                      {c.supported && c.evidence_field ? (
                        <span className="ev">
                          {" "}
                          → <code className="ds-code">{c.evidence_field}</code>
                        </span>
                      ) : (
                        <span className="un"> → no supporting field (unsupported)</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="ds-meta-line">
                mode: {judge.mode} · model: {judge.modelId} · cost: ${judge.costUsd.toFixed(2)}
                {judge.errorClass ? ` · ${judge.errorClass}` : ""}
              </p>
            </>
          ) : (
            <p className="ds-card-p">
              Skipped — the gatekeeper blocked this draft, so it never reaches the semantic judge.
            </p>
          )}
        </Section>

        <Section
          title="5 · Domain quality check (domain judge)"
          plain="A third, independent check — on a different question than faithfulness. Not 'is every fact true?' but 'is this a GOOD activation message?' — scored against a cited rubric: matched to the merchant's real blocker · the right play for their engagement state · no over-promising. It's advisory and recall-favoring: the verdict is surfaced for the reviewer and recorded in the audit trail, but it never changes the send — eligibility and the human approval gate stay deterministic (a low-risk draft can still be simulated-sent even when flagged). Here BOTH the draft and this verdict are deterministic $0 stubs (REPLAY) — a minimal stub nudge often trips the engagement-fit check, which is the tertiary control doing its job, not the product grading its real output down; the live cross-family judge (Groq gpt-oss-120b) and the real drafter are separate and key-gated."
        >
          {domainJudge ? (
            <>
              <div className="ds-judge-h">
                <span className={`ds-chip ${domainJudge.verdict.domain_defective ? "warn" : "pass"}`}>
                  <Mark name={domainJudge.verdict.domain_defective ? "flag" : "check"} />
                  {domainJudge.verdict.domain_defective ? "FLAGGED FOR REVIEW" : "GOOD PRACTICE"}
                </span>
                <span className="ds-judge-count">
                  {domainJudge.verdict.dimensions.filter((d) => d.pass).length}/
                  {domainJudge.verdict.dimensions.length} domain-quality dimensions passed
                </span>
              </div>
              <ul className="ds-judge-list">
                {domainJudge.verdict.dimensions.map((d, i) => (
                  <li key={i}>
                    <Mark name={d.pass ? "check" : "flag"} style={{ color: d.pass ? "var(--ok)" : "var(--warn)" }} />
                    <span>
                      <span style={{ fontWeight: 600, color: "var(--ink)" }}>
                        {DIMENSION_SPECS[d.dimension].title}
                      </span>
                      <span className="ev"> — {d.rationale}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <p className="ds-meta-line">
                mode: {domainJudge.mode} · model: {domainJudge.modelId} · cost: $
                {domainJudge.costUsd.toFixed(2)}
                {domainJudge.errorClass ? ` · ${domainJudge.errorClass}` : ""} · advisory — does not
                change the send decision
              </p>
            </>
          ) : (
            <p className="ds-card-p">
              Skipped — the gatekeeper blocked this draft, so it never reaches the domain judge.
            </p>
          )}
        </Section>

        <Section
          title="6 · Eval / quality"
          plain="An independent measurement of draft quality across four dimensions — the deep-AI showcase, in human terms."
        >
          <div className="ds-grid g4" style={{ marginTop: 0 }}>
            {evalScore.results.map((r) => (
              <div
                key={r.grader}
                style={{ border: "1px solid var(--rule)", borderRadius: "10px", padding: "12px 14px" }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--ink)" }}>{r.grader}</span>
                  <span className={r.pass ? "ds-verdict ok" : "ds-verdict no"}>
                    <Mark name={r.pass ? "check" : "x"} />
                    {r.pass ? "PASS" : "FAIL"}
                  </span>
                </div>
                {r.failures.length > 0 ? (
                  <div className="ds-flaglist err">
                    <ul>
                      {r.failures.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
          <p className="ds-meta-line" style={{ fontFamily: "var(--ff-sans)", fontSize: "12px" }}>
            {evalScore.passed}/{evalScore.total} dimensions passing.
          </p>
        </Section>

        <Section
          title="7 · Human-in-the-loop gate"
          plain="A person decides — hold, reject, or send. Low-risk, clean drafts are eligible to send (simulated); high-risk ones are held for approval."
        >
          {m.review_required ? (
            <div>
              <div className="ds-held">
                <div className="h">
                  <Mark name="flag" />
                  Held for human approval ({m.review_reason}).
                </div>
                <div className="p">No message is sent until a human approves.</div>
              </div>
              <div className="ds-gate-btns">
                <GateButton label="Approve & send" tone="primary" />
                <GateButton label="Reject" tone="danger" />
                <GateButton label="Hold" tone="neutral" />
              </div>
              <p className="ds-gate-note">
                Display of the gate state. Interactive approval (writing the decision back) lands in
                Phase C.
              </p>
            </div>
          ) : (
            <div>
              <p className="ds-verdict ok" style={{ fontFamily: "var(--ff-sans)", fontSize: "13px" }}>
                <Mark name="check" />
                Eligible by the deterministic core → <span style={{ fontWeight: 600 }}>simulated send</span>{" "}
                recorded.
              </p>
              {domainJudge?.verdict.domain_defective ? (
                <p className="ds-gate-note" style={{ color: "var(--warn)" }}>
                  The domain quality check above flagged this draft — advisory only; it does not change
                  eligibility or the send.
                </p>
              ) : null}
              {m.idempotency_key ? (
                <p className="ds-meta-line">idempotency_key: {m.idempotency_key}</p>
              ) : null}
            </div>
          )}
        </Section>

        <Section title="8 · Audit trail" plain="Every step of the decision, recorded.">
          <ol className="ds-audit">
            {rm.audit.map((a, i) => (
              <li key={i}>
                <span className="a-actor">{a.actor}</span>
                <span className="a-action">{a.action}</span>
                <span className="a-detail">{a.detail}</span>
              </li>
            ))}
          </ol>
        </Section>
      </div>

      <p className="ds-note warn" style={{ marginTop: "24px" }}>
        {HONEST_DATA_LABEL}
      </p>
    </main>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="ds-field">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function FlagList({
  label,
  items,
  emptyText,
  tone = "fail",
}: {
  label: string;
  items: string[];
  emptyText: string;
  tone?: "fail" | "warn";
}) {
  return (
    <div className="ds-flaglist" style={{ color: "var(--ink-2)" }}>
      <span className="fl-l">{label}: </span>
      {items.length === 0 ? (
        <span style={{ color: "var(--muted)" }}>{emptyText}</span>
      ) : (
        <ul className={tone === "warn" ? "ds-flaglist warn" : "ds-flaglist err"}>
          {items.map((it, i) => (
            <li key={i}>{it}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function GateButton({ label, tone }: { label: string; tone: "primary" | "danger" | "neutral" }) {
  const style: CSSProperties =
    tone === "danger"
      ? { color: "var(--error)", borderColor: "rgba(217, 45, 32, 0.4)" }
      : {};
  return (
    <button type="button" disabled className={tone === "primary" ? "ds-btn primary" : "ds-btn"} style={style}>
      {label}
    </button>
  );
}
