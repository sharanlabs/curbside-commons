import type { Metadata } from "next";
import Link from "next/link";
import { getReplaySnapshot } from "@/legacy/activation/lib/replay/run";
import { PLATFORM_NAME } from "@/lib/product";

/**
 * Redirect stub for the S5 /legacy/ identity split (decision-log 2026-07-10).
 * Merchant detail moved to /legacy/merchant/[id]. Static-export-safe: a
 * per-id client-side <meta refresh> (no server redirect). generateStaticParams
 * mirrors the legacy page's id source so the export emits one stub per merchant.
 */
export const metadata: Metadata = {
  title: "Moved to /legacy/merchant",
  robots: { index: false },
};

export function generateStaticParams() {
  return getReplaySnapshot(PLATFORM_NAME).merchants.map((rm) => ({ id: rm.merchant.merchant_id }));
}

export default async function MerchantMoved({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <main className="ds-data ds-wrap ds-view">
      <meta httpEquiv="refresh" content={`0;url=/legacy/merchant/${id}`} />
      <p className="ds-note">
        This page moved to <Link href={`/legacy/merchant/${id}`}>/legacy/merchant/{id}</Link> — the
        legacy activation module.
      </p>
    </main>
  );
}
