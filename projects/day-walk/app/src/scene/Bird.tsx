import { useEffect, useState } from "react";

export function Bird({ onNext, x }: { onNext(): void; x: number }) {
  const [flapping, setFlapping] = useState(false);
  useEffect(() => {
    const flap = () => { setFlapping(true); window.setTimeout(() => setFlapping(false), 300); };
    window.addEventListener("bird-flap", flap);
    return () => window.removeEventListener("bird-flap", flap);
  }, []);
  return (
    <g
      aria-label="다음 조언 보기"
      className={`bird ${flapping ? "bird-celebrate" : ""}`}
      data-testid="bird"
      onClick={onNext}
      onKeyDown={(event) => {
        if (event.key === "Enter") onNext();
      }}
      role="button"
      tabIndex={0}
      transform={`translate(${x} 435)`}
    >
      <ellipse className="bird-body" cx="-62" cy="-116" rx="18" ry="12" />
      <circle className="bird-head" cx="-47" cy="-123" r="10" />
      <path className="bird-beak" d="M-38 -123 L-28 -119 L-38 -116 Z" />
      <circle className="bird-eye" cx="-44" cy="-126" r="2" />
      <path className="bird-wing bird-wing-back" d="M-68 -119 Q-87 -139 -83 -111 Q-72 -105 -62 -112 Z" />
      <path className="bird-wing bird-wing-front" d="M-65 -118 Q-81 -99 -54 -106 Q-52 -114 -58 -121 Z" />
    </g>
  );
}
