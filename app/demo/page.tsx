import type { Metadata } from "next";
import { DemoView } from "@/components/demo/DemoView";

/**
 * `/demo` — the one-page verifier demo (D1; plan §5 D1, criteria C7/C10).
 *
 * A thin server wrapper (metadata only) around the static {@link DemoView}, which
 * renders the COMMITTED demo transcript. No LLM, no network, $0 — the whole
 * demo-render path is provably provider-free (evals/packs/demo-blindness.test.ts).
 *
 * Plain: the page that plays the scripted demo as a printable one-pager.
 */
export const metadata: Metadata = {
  title: "Verifier demo — a claim checked against the record",
  description:
    "A scripted, deterministic walkthrough: a shopping agent follows a spec-valid but false serving copy; the verifier checks that same copy against the merchant's records and catches the mismatch. Zero AI calls; ends at item selection (no checkout).",
};

export default function DemoPage() {
  return <DemoView />;
}
