import type { Advice } from "../domain/advisor.js";

export function SpeechBubble({ advice, x, onAction }: {
  advice: Advice;
  x: number;
  onAction(kind: "move-overdue" | "open-routines"): void;
}) {
  const clamped = Math.max(12, Math.min(88, x));
  return <div
    aria-live="polite"
    className="speech-bubble"
    data-testid="speech-bubble"
    style={{ left: `${clamped}%` }}
  >
    <span>{advice.text}</span>
    {advice.action && <button onClick={() => onAction(advice.action!.kind)} type="button">
      {advice.action.label}
    </button>}
  </div>;
}
