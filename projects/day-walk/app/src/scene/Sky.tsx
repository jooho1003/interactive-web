import type { DayBounds } from "../schema/index.js";
import { xOf } from "../domain/time.js";

const palette = ["morning", "afternoon", "evening"] as const;

export function Sky({ minute, bounds, phase }: {
  minute: number;
  bounds: DayBounds;
  phase: "before" | "during" | "after";
}) {
  const progress = xOf(minute, bounds);
  const index = Math.min(palette.length - 1, Math.floor(progress * palette.length));
  const next = palette[Math.min(palette.length - 1, index + 1)];
  const local = (progress * palette.length - index) * 100;
  const current = phase === "during" ? palette[index] : "night";
  const following = phase === "during" ? next : "night";
  const sunX = 180 + progress * 1240;
  const sunY = 150 - Math.sin(progress * Math.PI) * 92;
  return <>
    <defs>
      <linearGradient id="sky-gradient" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stopColor={`var(--sky-${current}-top)`} />
        <stop offset={`${local}%`} stopColor={`var(--sky-${following}-top)`} />
        <stop offset="100%" stopColor={`var(--sky-${following}-bottom)`} />
      </linearGradient>
    </defs>
    <rect fill="url(#sky-gradient)" height="500" width="1600" />
    <circle
      className="sky-orb"
      cx={sunX}
      cy={sunY}
      r="28"
    />
  </>;
}
