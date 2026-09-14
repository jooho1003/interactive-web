import { useId } from "react";

export function BirdArt() {
  const matte = useId();
  return <span aria-hidden="true" className="bird-art">
    <svg className="bird-matte" width="0" height="0" focusable="false">
      <defs><filter id={matte} colorInterpolationFilters="sRGB" x="0" y="0" width="100%" height="100%">
        {/* Key the generated green matte while preserving warm and blue feathers. */}
        <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  6 -6 6 0 0" />
      </filter></defs>
    </svg>
    <img alt="" className="bird-sprite" draggable="false" src="./media/day-walk-bird-v3.webp" style={{ filter: `url(#${matte})` }} />
  </span>;
}

export function Bird({ onNext, expanded }: { onNext(): void; expanded: boolean }) {
  return <button aria-label="새 조언 보기" aria-expanded={expanded} className="bird" data-testid="bird" onClick={onNext} type="button"><span className="bird-float"><BirdArt /></span></button>;
}
