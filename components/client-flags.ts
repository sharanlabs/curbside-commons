"use client";

import { useSyncExternalStore } from "react";

/**
 * Hydration-safe client flags (build piece 3 polish, 2026-07-20).
 *
 * `useSyncExternalStore` renders the SERVER snapshot during hydration and
 * re-renders with the client snapshot immediately after — the documented
 * replacement for the `useEffect(() => setMounted(true))` pattern the React
 * compiler lint rejects (set-state-in-effect cascades).
 */

const noopSubscribe = () => () => {};

/** false in SSR/hydration HTML, true on the client right after hydration. */
export function useMounted(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReduced(onChange: () => void): () => void {
  const mql = matchMedia(REDUCED_QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

/** Live reduced-motion preference; false during SSR (choreography is client-gated anyway). */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReduced,
    () => matchMedia(REDUCED_QUERY).matches,
    () => false,
  );
}
