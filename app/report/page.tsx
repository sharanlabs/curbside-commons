import type { Metadata } from "next";
import { ReportView } from "@/components/report/ReportView";

/**
 * `/report` — the one-page verifier report (W3; plan §5 W3, criteria C2/C4/C10).
 *
 * A thin server wrapper (metadata only) around the client {@link ReportView},
 * which renders the COMMITTED golden fixture reports statically. No LLM, no
 * network, $0 — the whole report-rendering path is provably provider-free
 * (evals/packs/report-view-c1.test.ts).
 *
 * Plain: the page that shows the checker's result as a printable one-pager.
 */
export const metadata: Metadata = {
  title: "Verifier report — listings truth check (simulated)",
  description:
    "A one-page, evidence-cited verifier report: a menu serving-copy checked line by line against the restaurant's own records, every catch in plain words with its receipts. Simulated test data; deterministic; zero AI calls.",
};

export default function ReportPage() {
  return <ReportView />;
}
