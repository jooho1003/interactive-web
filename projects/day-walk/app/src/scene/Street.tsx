export function Street({ parallax }: { parallax: number }) {
  const homes = Array.from({ length: 8 }, (_, index) => 80 + index * 210);
  return <>
    <path className="far-hills" d="M0 330 L0 250 L220 180 L420 270 L660 150 L900 260 L1160 170 L1400 270 L1600 195 L1600 330 Z" transform={`translate(${-parallax * 40} 0)`} />
    <g className="back-homes">
      {homes.map((x, index) => <g key={x} transform={`translate(${x} ${300 - (index % 2) * 20})`}>
        <path d="M0 38 L28 8 L56 38 Z" />
        <rect height="42" width="56" y="38" />
      </g>)}
    </g>
    <path className="street-road" d="M0 388 Q400 360 800 390 T1600 382 L1600 500 L0 500 Z" />
    <path className="street-line" d="M0 425 Q400 397 800 427 T1600 419" />
  </>;
}
