import type { CSSProperties } from "react";
import type { Advice } from "../domain/advisor.js";

export function SpeechBubble({ advice, height, x, width, onAction }: { advice: Advice; height: number; x: number; width: number; onAction(kind: "move-overdue" | "open-routines"): void }) {
  const bubbleWidth = Math.min(280, width - 16);
  const anchor = x * width;
  const top = 8;
  const canFitAbove = height >= 128;
  const placeRight = anchor < width / 2;
  const sideX = placeRight ? anchor + bubbleWidth / 2 : anchor - bubbleWidth / 2;
  const rawX = canFitAbove ? anchor : sideX;
  const clamped = Math.max(8 + bubbleWidth / 2, Math.min(width - 8 - bubbleWidth / 2, rawX)) / width;
  const tail = canFitAbove
    ? `${Math.max(10, Math.min(90, clamped * 100))}%`
    : placeRight ? "0%" : "100%";
  return (
    <div
      aria-live="polite"
      className={`speech-bubble ${canFitAbove ? "speech-above" : "speech-side"}`}
      data-testid="speech-bubble"
      style={{
        left: `${clamped * 100}%`,
        top: canFitAbove ? "var(--speech-top-right)" : "50%",
        transform: "translateX(-50%)",
        "--bubble-tail": tail,
      } as CSSProperties}
    >
      <span>{advice.text}</span>
      {advice.action && <button onClick={() => onAction(advice.action!.kind)} type="button">{advice.action.label}</button>}
    </div>
  );
}
