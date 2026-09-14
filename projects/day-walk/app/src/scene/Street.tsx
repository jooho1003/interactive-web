export function Street({ parallax, width }: { parallax: number; width: number }) {
  const homes = Array.from({ length: 8 }, (_, index) => width * (.05 + index * .13));
  const lamps = [width * .18, width * .72];
  const trees = [width * .04, width * .48, width * .94];
  return <>
    <path className="far-hills" d={`M0 360 L0 300 L${width * .16} 250 L${width * .32} 310 L${width * .5} 235 L${width * .67} 305 L${width * .84} 245 L${width} 300 L${width} 360 Z`} transform={`translate(${-parallax * width * .025} 0)`} />
    <g className="back-homes" transform={`translate(${-parallax * width * .06} 0)`}>{homes.map((x, index) => <g key={x} transform={`translate(${x} ${332 - (index % 2) * 14}) scale(.55)`}><path d="M0 38 L28 8 L56 38 Z" /><rect height="42" width="56" y="38" /><rect className="back-home-window" height="7" width="8" x="11" y="48" /><rect className="back-home-window" height="7" width="8" x="37" y="48" /></g>)}</g>
    <path className="scene-ground" d={`M0 350 L${width} 350 L${width} 500 L0 500 Z`} />
    <g className="street-trees" transform={`translate(${-parallax * width * .12} 0)`}>{trees.map((x, index) => <g key={x} transform={`translate(${x} ${300 - index * 8}) scale(${.8 + index * .12})`}><path className="tree-trunk" d="M18 105 L24 25 L34 25 L39 105 Z" /><circle className="tree-crown" cx="28" cy="18" r="28" /><circle className="tree-crown tree-crown-back" cx="7" cy="35" r="20" /><circle className="tree-crown tree-crown-front" cx="50" cy="38" r="21" /></g>)}</g>
    <path className="street-road" d={`M0 405 Q${width * .25} 385 ${width * .5} 402 T${width} 398 L${width} 500 L0 500 Z`} />
    <g className="road-markings"><path d={`M${width * .12} 450 L${width * .22} 447`} /><path d={`M${width * .42} 444 L${width * .52} 441`} /><path d={`M${width * .72} 440 L${width * .82} 438`} /></g>
    <path className="street-line" d={`M0 445 Q${width * .25} 425 ${width * .5} 442 T${width} 438`} />
    <g className="street-lamps">{lamps.map((x) => <g key={x} transform={`translate(${x} 294)`}><path className="lamp-pole" d="M0 105 L0 0 Q0 -12 10 -12" /><circle className="lamp-glow" cx="10" cy="-12" r="9" /><circle className="lamp-light" cx="10" cy="-12" r="4" /></g>)}</g>
  </>;
}
