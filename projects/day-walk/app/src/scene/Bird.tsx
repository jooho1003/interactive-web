export function Bird({ onNext }: { onNext(): void }) {
  return <g
    aria-label="다음 조언 보기"
    className="bird"
    data-testid="bird"
    onClick={onNext}
    onKeyDown={(event) => {
      if (event.key === "Enter") onNext();
    }}
    role="button"
    tabIndex={0}
  >
    <ellipse className="bird-body" cx="-62" cy="-100" rx="15" ry="10" />
    <path className="bird-wing" d="M-65 -103 L-82 -120 L-72 -98 Z" />
  </g>;
}
