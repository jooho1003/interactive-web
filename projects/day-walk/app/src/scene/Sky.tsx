import { xOf } from "../domain/time.js";
import type { DayBounds } from "../schema/index.js";

export function Sky({ minute, bounds, phase, width }: { minute: number; bounds: DayBounds; phase: "before" | "during" | "after"; width: number }) {
  const progress = xOf(minute, bounds);
  const sky = phase === "during" ? progress < 1 / 3 ? "morning" : progress < 2 / 3 ? "afternoon" : "evening" : "night";
  const sunX = width * (.1 + progress * .8);
  const sunY = 140 - Math.sin(progress * Math.PI) * 80;
  return <><defs><linearGradient id="sky-gradient" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor={`var(--sky-${sky}-top)`} /><stop offset="100%" stopColor={`var(--sky-${sky}-bottom)`} /></linearGradient></defs><rect fill="url(#sky-gradient)" height="500" width={width} /><circle className="sky-orb" cx={sunX} cy={sunY} r="28" /></>;
}
