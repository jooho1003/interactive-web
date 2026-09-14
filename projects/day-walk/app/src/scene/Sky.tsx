import { xOf } from "../domain/time.js";
import type { DayBounds } from "../schema/index.js";

export function Sky({ minute, bounds, phase, width }: { minute: number; bounds: DayBounds; phase: "before" | "during" | "after"; width: number }) {
  const progress = xOf(minute, bounds);
  const sky = phase === "during" ? progress < 1 / 3 ? "morning" : progress < 2 / 3 ? "afternoon" : "evening" : "night";
  const sunX = width * (.1 + progress * .8);
  const sunY = 140 - Math.sin(progress * Math.PI) * 80;
  const stars = Array.from({ length: 13 }, (_, index) => ({
    x: width * (.06 + ((index * 37) % 88) / 100),
    y: 42 + ((index * 29) % 120),
    r: 1 + (index % 2),
  }));
  const clouds = [
    { x: width * .12, y: 112, scale: .9 },
    { x: width * .58, y: 84, scale: 1.2 },
    { x: width * .87, y: 168, scale: .7 },
  ];
  return <>
    <defs>
      <linearGradient id="sky-gradient" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor={`var(--sky-${sky}-top)`} /><stop offset="100%" stopColor={`var(--sky-${sky}-bottom)`} /></linearGradient>
      <radialGradient id="orb-gradient"><stop offset="0%" stopColor="var(--orb-core)" /><stop offset="55%" stopColor="var(--orb-mid)" /><stop offset="100%" stopColor="var(--orb-edge)" /></radialGradient>
      <linearGradient id="haze-gradient" x1="0" x2="1"><stop stopColor="var(--sky-haze)" stopOpacity="0" /><stop offset=".5" stopColor="var(--sky-haze)" /><stop offset="1" stopColor="var(--sky-haze)" stopOpacity="0" /></linearGradient>
      <filter id="orb-blur"><feGaussianBlur stdDeviation="12" /></filter>
    </defs>
    <rect className="sky-base" fill="url(#sky-gradient)" height="500" width={width} />
    <rect className="sky-haze" fill="url(#haze-gradient)" height="160" width={width} y="170" />
    <g className={`sky-stars sky-stars-${sky}`}>{stars.map((star) => <circle cx={star.x} cy={star.y} key={`${star.x}-${star.y}`} r={star.r} />)}</g>
    <g className="sky-clouds" transform={`translate(${-progress * width * .05} 0)`}>{clouds.map((cloud) => <path className="sky-cloud" d="M0 24 Q12 2 28 18 Q43 -4 62 19 Q78 9 92 25 L92 35 L0 35 Z" key={cloud.x} transform={`translate(${cloud.x} ${cloud.y}) scale(${cloud.scale})`} />)}</g>
    <circle className="sky-orb-glow" cx={sunX} cy={sunY} filter="url(#orb-blur)" r="48" />
    <circle className={`sky-orb sky-orb-${sky}`} cx={sunX} cy={sunY} fill="url(#orb-gradient)" r="28" />
  </>;
}
