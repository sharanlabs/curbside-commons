/**
 * Demo pack surface — D1 (plan §5 D1). Barrel for the deterministic demo engine
 * and its browser-safe copy/types/renderer. `transcript.ts` is intentionally NOT
 * re-exported from the pack's browser-safe barrel graph elsewhere — it pulls
 * conformance.ts (node:fs) — but is exported here for the CLI, the generator, and
 * the evals that build the transcript.
 *
 * Plain: the demo's parts, gathered in one door — the words, the shapes, the
 * script-writer, and the text printer.
 */
export {
  DEMO_ACTOR_LABEL,
  DEMO_CLAIM,
  DEMO_FOIL_LINE,
  DEMO_INTENT_TITLE,
  DEMO_SIMULATED_BANNER,
  DEMO_SUBHEAD,
  DEMO_BEAT,
} from "./copy.ts";
export type {
  ActorSelection,
  DemoBeat,
  DemoBeatId,
  DemoFinding,
  DemoTranscript,
  DemoVerdict,
} from "./types.ts";
export { selectFromSurface } from "./actor.ts";
export { buildDemoTranscript, type DemoInputs } from "./transcript.ts";
export { renderDemoText } from "./render-text.ts";
