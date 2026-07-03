/**
 * The scripted demonstration actor — D1 (plan §5 D1, condition 5).
 *
 * A deterministic, SOR-BLIND consumer of a serving copy. It parses the published
 * ACP feed exactly as a spec-faithful agent would, applies ONE fixed scripted
 * intent (order the named item, if in stock on the surface), and selects the
 * matching row — taking the surface's claims (price, availability) entirely at
 * face value. It has NO access to the merchant's system-of-record: this module's
 * only import is the ACP feed shape, and the blindness eval
 * (evals/packs/demo-blindness.test.ts) proves the actor's transitive imports
 * exclude reference.ts and every SOR fixture path. That machine-checked blindness
 * is the whole point — the agent cannot detect the drift, which is why an
 * independent verifier is needed.
 *
 * Plain: a stand-in shopping agent that only ever sees the published menu (never
 * the restaurant's till), decides what to order by a fixed rule written in code,
 * and believes whatever the menu says.
 */
import type { AcpFeed } from "../acp-feed.ts";
import { DEMO_INTENT_TITLE } from "./copy.ts";
import type { ActorSelection } from "./types.ts";

/**
 * Run the scripted intent over a serving copy and return the actor's selection.
 * THROWS if the target item is not served in stock — a demo actor that silently
 * selected nothing would hide a broken fixture (fail loud, never no-op).
 */
export function selectFromSurface(feed: AcpFeed): ActorSelection {
  // Fixed intent: the agent wants the named item, and — spec-faithfully — only
  // considers it if the surface says it is orderable (availability in_stock).
  const chosen = feed.items.find(
    (r) => r.title === DEMO_INTENT_TITLE && r.availability === "in_stock",
  );
  if (!chosen) {
    throw new Error(
      `demo actor: no in-stock "${DEMO_INTENT_TITLE}" row on the serving copy (broken fixture?)`,
    );
  }
  return {
    intent: `Order the "${DEMO_INTENT_TITLE}" if the published feed lists it as available.`,
    targetTitle: DEMO_INTENT_TITLE,
    selectedItemId: chosen.item_id,
    selectedTitle: chosen.title,
    observedPrice: chosen.price,
    observedCurrency: chosen.currency,
    observedAvailability: chosen.availability,
  };
}
