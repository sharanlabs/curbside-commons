/**
 * UCP catalog-response fixtures — W1 (plan §5 W1, C3 surface (b)).
 *
 * HONESTY BOUNDS (C10, G8 record 2026-07-02): UCP's catalog capability is a
 * LIVE-QUERY, session-scoped interface; responses "reflect the Business's
 * current terms" with NO SOR/accuracy obligation — which is exactly why serving
 * copies can drift behind it. We have NO real marketplace access and claim none:
 * these fixtures are CONSTRUCTED SIMULATIONS of a catalog-response shape (our
 * interpretation — UCP food schemas are still pending as of 2026-07-02), built
 * deterministically from the same drifted feed state so the C3 differential test
 * can prove one comparator catches the same drift on both surfaces.
 *
 * Plain: we can't record a real marketplace answering an AI agent, and we don't
 * pretend to. We build the same drifted menu in the live-answer shape the UCP
 * standard describes, label it simulated, and prove the verifier catches the
 * same lies there too.
 */
import type { AcpFeed } from "./acp-feed.ts";

/** One item in a constructed catalog response (simulated shape — see header). */
export interface UcpCatalogItem {
  readonly id: string;
  readonly title: string;
  readonly price: { readonly amount: string; readonly currency: string };
  /** Constructed availability vocabulary; the adapter normalizes it. */
  readonly availability: "available" | "unavailable";
  readonly group_id: string;
  readonly variant: Readonly<Record<string, string>>;
}

/** A constructed, session-scoped catalog response fixture. */
export interface UcpCatalogResponseFixture {
  readonly simulated: true;
  readonly note: string;
  readonly capability: "catalog";
  /** Spec versions the (simulated) responder claims to speak (§7 version skew). */
  readonly supported_versions: readonly string[];
  readonly session: { readonly id: string };
  readonly items: readonly UcpCatalogItem[];
}

/** The spec version the verifier pins reports against (C10 header pin). */
export const UCP_PINNED_VERSION = "2026-04-08";

/**
 * Build a catalog-response fixture from a feed state (faithful or drifted). The
 * mapping keeps only fields a live catalog answer plausibly carries (id · title
 * · price · availability · variant grouping) — feed-only fields (eligibility,
 * expiration/availability dates, sale_price) do not exist on this surface, which
 * is why some §7 classes are ACP-only (recorded per-entry in the drift manifest).
 */
export function buildUcpResponse(
  feed: AcpFeed,
  opts: { readonly supportedVersions: readonly string[]; readonly sessionId: string },
): UcpCatalogResponseFixture {
  return {
    simulated: true,
    note:
      "CONSTRUCTED SIMULATION of a UCP catalog-capability response shape (our interpretation; UCP food schemas pending as of 2026-07-02). Not recorded from any real marketplace.",
    capability: "catalog",
    supported_versions: opts.supportedVersions,
    session: { id: opts.sessionId },
    items: feed.items.map((r) => ({
      id: r.item_id,
      title: r.title,
      price: { amount: r.price, currency: r.currency },
      availability: r.availability === "in_stock" ? "available" : "unavailable",
      group_id: r.group_id,
      variant: r.variant_dict,
    })),
  };
}
