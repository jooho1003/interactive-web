import type { DayBounds } from "../schema/index.js";
import { xOf } from "../domain/time.js";

export function Walker({ bounds, minute, phase, visible }: {
  bounds: DayBounds;
  minute: number;
  phase: "before" | "during" | "after";
  visible: boolean;
}) {
  if (!visible) return null;
  const x = phase === "before" ? 55 : phase === "after" ? 1545 : xOf(minute, bounds) * 1600;
  return <g className={`walker walker-${phase}`} transform={`translate(${x} 380)`}>
    <circle className="walker-head" cx="0" cy="-68" r="16" />
    <path className="walker-body" d="M0 -51 L0 -20 M0 -44 L-17 -29 M0 -44 L17 -29 M0 -20 L-14 5 M0 -20 L14 5" />
    {phase !== "during" && <text className="walker-sleep" x="18" y="-80">z</text>}
  </g>;
}
