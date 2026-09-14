import { xOf } from "../domain/time.js";
import type { DayBounds } from "../schema/index.js";

export function Walker({ bounds, minute, phase, visible, width }: { bounds: DayBounds; minute: number; phase: "before" | "during" | "after"; visible: boolean; width: number }) {
  if (!visible) return null;
  const x = phase === "before" ? width * .035 : phase === "after" ? width * .965 : xOf(minute, bounds) * width;
  return (
    <g className={`walker walker-${phase}`} transform={`translate(${x} 435)`}>
      <ellipse className="walker-shadow" cx="0" cy="3" rx="30" ry="5" />
      <circle className="walker-head" cx="0" cy="-69" r="15" />
      <path className="walker-hair" d="M-14 -70 Q-8 -88 5 -83 Q16 -80 14 -67 Q5 -76 -14 -70 Z" />
      <path className="walker-bag" d="M10 -51 Q25 -45 24 -27 L13 -28 L8 -48 Z" />
      <path className="walker-scarf" d="M-10 -54 Q0 -48 10 -54 L8 -47 Q0 -42 -9 -48 Z" />
      <path className="walker-shirt" d="M-13 -53 Q0 -59 13 -53 L11 -25 L-11 -25 Z" />
      <path className="walker-pants" d="M-11 -25 L-2 -25 L-5 -5 L-15 -5 Z M2 -25 L11 -25 L15 -5 L5 -5 Z" />
      {phase === "during" && <path className="walker-limbs" d="M-11 -49 L-25 -32 M11 -49 L25 -37 M-7 -7 L-17 4 M8 -7 L20 1" />}
      {phase !== "during" && <path className="walker-sit" d="M-11 -25 L13 -25 L20 -8 L-2 -8 L-15 -18 Z" />}
      <path className="walker-shoes" d="M-19 4 L-8 4 M16 1 L27 1" />
      {phase !== "during" && <text className="walker-sleep" x="20" y="-82">z</text>}
    </g>
  );
}
