import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getReplaySnapshot, getReplayMerchant } from "@/lib/replay/run";
import { PLATFORM_NAME, HONEST_DATA_LABEL } from "@/lib/product";
import { TOTAL_STEPS } from "@/lib/core/constants";

export function generateStaticParams() {
  return getReplaySnapshot(PLATFORM_NAME).merchants.map((rm) => ({ id: rm.merchant.merchant_id }));
}

const STATUS_STYLE: Record<string, string> = {
  PASS: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  WARN: "bg-amber-50 text-amber-700 ring-amber-600/20",
  BLOCKED: "bg-red-50 text-red-700 ring-red-600/20",
};
const RISK_STYLE: Record<string, string> = {
  Low: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  Medium: "bg-amber-50 text-amber-700 ring-amber-600/20",
  High: "bg-red-50 text-red-700 ring-red-600/20",
};

function Section({ title, plain, children }: { title: string; plain: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-neutral-200 p-5">
      <h2 className="text-sm font-semibold text-neutral-900">{title}</h2>
      <p className="mt-0.5 text-[12px] text-neutral-500">{plain}</p>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export default async function MerchantDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const rm = getReplayMerchant(id, PLATFORM_NAME);
  if (!rm) notFound();

  const { merchant: m, draft, gatekeeper: gate, evalScore, diagnosis } = rm;
  const mRec = m as unknown as Record<string, unknown>;
  const stepsRemaining = TOTAL_STEPS - m.steps_completed;

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <Link href="/" className="text-[13px] text-neutral-500 underline-offset-2 hover:underline">
        ← Activation queue
      </Link>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{m.merchant_name}</h1>
          <p className="text-[13px] text-neutral-500">
            {m.merchant_category} · {m.merchant_id} · onboarding {m.steps_completed}/{TOTAL_STEPS}
          </p>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-medium ring-1 ring-inset ${RISK_STYLE[m.risk_level]}`}
        >
          {m.risk_level} risk · {m.risk_score}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4">
        <Section
          title="1 · Triage & diagnosis"
          plain="How stuck this merchant is, and exactly what's blocking them — by an auditable rule, not a model guess."
        >
          <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
            <Field label="Risk score" value={`${m.risk_score} (${m.risk_level})`} />
            <Field label="Blocker" value={m.current_blocker_code} />
            <Field label="Next best action" value={m.next_best_action} />
            <Field label="Days since signup" value={String(m.days_since_signup)} />
            <Field label="Last login (days ago)" value={String(m.last_login_days_ago)} />
            <Field label="Reason codes" value={m.risk_reason_codes.join(", ") || "—"} />
          </dl>
          <p className="mt-3 rounded bg-neutral-50 px-3 py-2 font-mono text-[12px] text-neutral-600">
            risk = 2×{m.days_since_signup} + 3×{m.last_login_days_ago} + 10×({TOTAL_STEPS}−{m.steps_completed}) ={" "}
            {m.risk_score}
            <span className="ml-2 text-neutral-400">
              # {stepsRemaining} step{stepsRemaining === 1 ? "" : "s"} remaining
            </span>
          </p>

          <div className="mt-4 rounded-lg border border-neutral-200 bg-neutral-50/60 p-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
                Why they&apos;re stuck
              </span>
              <span className="rounded-full bg-neutral-200 px-2 py-0.5 text-[11px] font-medium text-neutral-700">
                {diagnosis.engagement_state.replace(/_/g, " ")}
              </span>
              <span className="rounded-full bg-neutral-200 px-2 py-0.5 text-[11px] font-medium text-neutral-700">
                {diagnosis.blocker_source.replace(/_/g, " ")}
              </span>
            </div>
            <p className="mt-2 text-[13px] text-neutral-700">{diagnosis.root_cause_hypothesis}</p>
            <div className="mt-2 rounded border border-neutral-200 bg-white px-3 py-2">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
                Recommended play ·{" "}
              </span>
              <span className="text-[12px] font-medium text-neutral-800">
                {diagnosis.play.touch.replace(/_/g, " ")}
              </span>
              <p className="mt-1 text-[13px] text-neutral-700">{diagnosis.play.action}</p>
              <p className="mt-1 text-[12px] text-neutral-500">{diagnosis.play.rationale}</p>
            </div>
            <p className="mt-2 text-[11px] text-neutral-400">{diagnosis.caveat}</p>
          </div>
        </Section>

        <Section
          title="2 · Drafted outreach"
          plain="A bounded, schema-constrained draft. Here it's the deterministic stub (live Gemini is the Phase-B step) — the safety machinery around it is identical either way."
        >
          <div className="rounded-md border border-neutral-200">
            <div className="border-b border-neutral-100 px-3 py-2 text-sm font-medium">
              {draft.draft_subject}
            </div>
            <div className="px-3 py-2.5 text-[13px] leading-relaxed text-neutral-700">{draft.draft_body}</div>
          </div>
          <p className="mt-3 text-[12px] font-medium text-neutral-500">
            Claims (each declared claim, verified against the merchant&apos;s data):
          </p>
          <ul className="mt-1 space-y-1">
            {draft.claims.map((c, i) => (
              <li key={i} className="flex items-center gap-2 text-[13px]">
                <span className="text-emerald-600">✓</span>
                <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-[12px]">
                  {c.field} = {String(c.value)}
                </code>
                <span className="text-neutral-400">→ merchant.{c.field} = {String(mRec[c.field])}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[11px] text-neutral-400">
            mode: {rm.draftMode} · cost: ${rm.costUsd.toFixed(2)} · model: {draft.model_version}
          </p>
        </Section>

        <Section
          title="3 · Claims-gatekeeper"
          plain="A deterministic firewall: the draft cannot reach a human unless every declared claim checks out against the merchant's data and no forbidden-claim pattern is present."
        >
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-medium ring-1 ring-inset ${STATUS_STYLE[gate.status]}`}
            >
              {gate.status}
            </span>
            <span className="text-[13px] text-neutral-600">
              {gate.approvedForHumanReview ? "Approved for the human gate" : "Auto-rejected (not shown to a human)"}
            </span>
          </div>
          <FlagList label="Guardrail flags" items={gate.guardrailFlags} emptyText="none — clean" />
          <FlagList label="Failures" items={gate.failures} emptyText="none" />
          <FlagList label="Warnings" items={gate.warnings} emptyText="none" tone="warn" />
        </Section>

        <Section
          title="4 · Eval / quality"
          plain="An independent measurement of draft quality across three dimensions — the deep-AI showcase, in human terms."
        >
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {evalScore.results.map((r) => (
              <div key={r.grader} className="rounded-md border border-neutral-200 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-medium">{r.grader}</span>
                  <span className={r.pass ? "text-emerald-600" : "text-red-600"}>{r.pass ? "PASS" : "FAIL"}</span>
                </div>
                {r.failures.length > 0 ? (
                  <ul className="mt-1 list-inside list-disc text-[11px] text-red-600">
                    {r.failures.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
          </div>
          <p className="mt-2 text-[12px] text-neutral-500">
            {evalScore.passed}/{evalScore.total} dimensions passing.
          </p>
        </Section>

        <Section
          title="5 · Human-in-the-loop gate"
          plain="A person decides — hold, reject, or send. Low-risk, clean drafts are eligible to send (simulated); high-risk ones are held for approval."
        >
          {m.review_required ? (
            <div>
              <p className="text-[13px] text-amber-700">
                Held for human approval ({m.review_reason}). No message is sent until a human approves.
              </p>
              <div className="mt-2 flex gap-2">
                <GateButton label="Approve & send" tone="primary" />
                <GateButton label="Reject" tone="danger" />
                <GateButton label="Hold" tone="neutral" />
              </div>
              <p className="mt-1.5 text-[11px] text-neutral-400">
                Display of the gate state. Interactive approval (writing the decision back) lands in Phase C.
              </p>
            </div>
          ) : (
            <div>
              <p className="text-[13px] text-emerald-700">
                Eligible and clean → <span className="font-medium">simulated send</span> recorded.
              </p>
              {m.idempotency_key ? (
                <p className="mt-1 font-mono text-[11px] text-neutral-500">
                  idempotency_key: {m.idempotency_key}
                </p>
              ) : null}
            </div>
          )}
        </Section>

        <Section title="6 · Audit trail" plain="Every step of the decision, recorded.">
          <ol className="space-y-1.5">
            {rm.audit.map((a, i) => (
              <li key={i} className="flex gap-3 text-[12px]">
                <span className="w-28 shrink-0 font-medium text-neutral-500">{a.actor}</span>
                <span className="w-36 shrink-0 font-mono text-neutral-700">{a.action}</span>
                <span className="text-neutral-600">{a.detail}</span>
              </li>
            ))}
          </ol>
        </Section>
      </div>

      <p className="mt-6 rounded-md border border-amber-200 bg-amber-50 px-4 py-2.5 text-[12px] text-amber-800">
        {HONEST_DATA_LABEL}
      </p>
    </main>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] font-medium uppercase tracking-wide text-neutral-400">{label}</dt>
      <dd className="text-[13px] text-neutral-800">{value}</dd>
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
    <div className="mt-2">
      <span className="text-[12px] font-medium text-neutral-500">{label}: </span>
      {items.length === 0 ? (
        <span className="text-[12px] text-neutral-400">{emptyText}</span>
      ) : (
        <ul className={`mt-1 list-inside list-disc text-[12px] ${tone === "warn" ? "text-amber-700" : "text-red-600"}`}>
          {items.map((it, i) => (
            <li key={i}>{it}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function GateButton({ label, tone }: { label: string; tone: "primary" | "danger" | "neutral" }) {
  const cls =
    tone === "primary"
      ? "bg-neutral-900 text-white"
      : tone === "danger"
        ? "border border-red-300 text-red-700"
        : "border border-neutral-300 text-neutral-700";
  return (
    <button
      type="button"
      disabled
      className={`cursor-not-allowed rounded-md px-3 py-1.5 text-[13px] font-medium opacity-70 ${cls}`}
    >
      {label}
    </button>
  );
}
