type Direction = "left" | "up" | "right";

export function ArrowIcon({ direction }: { direction: Direction }) {
  const rotation = direction === "left" ? 180 : direction === "up" ? -90 : 0;
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" style={{ transform: `rotate(${rotation}deg)` }}>
      <path d="M5 12h13M13 6l6 6-6 6" />
    </svg>
  );
}

export function VolumeIcon({ muted }: { muted: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 10v4h4l5 4V6l-5 4H4Z" />
      {muted ? <path d="m17 9 4 6m0-6-4 6" /> : <path d="M17 9.5a4 4 0 0 1 0 5" />}
    </svg>
  );
}

