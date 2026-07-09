/**
 * Monoline SVG marks for the Oxblood data surfaces (S4). Small, decorative
 * (aria-hidden) shape-marks that pair with a WORD on severity/verdict indicators
 * so status is never conveyed by colour alone. Exclusively used by the six data
 * surfaces (/console, /eval, /metrics, /audit, /cost, /merchant/[id]); not shared
 * with the landing or report/demo systems, which carry their own icon sets.
 */
import type { CSSProperties } from "react";

export type MarkName = "check" | "x" | "alert" | "flag" | "arrow" | "record";

const PATHS: Record<MarkName, string> = {
  check: "M4 10.5l3.6 3.5L16 5.5",
  x: "M6 6l8 8M14 6l-8 8",
  alert: "M10 3l7 12.6H3z M10 8v3.5 M10 13.4v.01",
  flag: "M5 3v14 M5 3.8h8.6l-2 3 2 3H5",
  arrow: "M14 10H4 M8.4 5.8L4 10l4.4 4.2",
  record: "M4.5 6h11 M4.5 10h11 M4.5 14h7",
};

export function Mark({
  name,
  className,
  style,
}: {
  name: MarkName;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
