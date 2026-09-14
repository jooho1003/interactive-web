import { useEffect, useRef, type CSSProperties } from "react";
import { BirdArt } from "../scene/Bird.js";

type Props = { reduced: boolean; onClose(): void };
export function Celebration({ reduced, onClose }: Props) {
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    const timer = window.setTimeout(() => close.current(), 6800);
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") close.current(); };
    window.addEventListener("keydown", escape);
    return () => { window.clearTimeout(timer); window.removeEventListener("keydown", escape); };
  }, []);
  return <section aria-label="오늘 일정 완료" className={`board-celebration ${reduced ? "is-reduced" : ""}`} data-testid="celebration">
    {!reduced && <div aria-hidden="true" className="celebration-flock" data-testid="celebration-flock">
      {Array.from({ length: 5 }, (_, index) => <div className="celebration-bird" key={index} style={{ "--bird-index": index } as CSSProperties}><BirdArt /><span className="bird-chirp">♪</span></div>)}
    </div>}
    <div className="board-celebration-message" role="status"><strong>Congratulations!</strong><span>오늘 할 일을 다 끝냈어요</span><button aria-label="완료 연출 닫기" onClick={onClose} type="button">닫기</button></div>
  </section>;
}
