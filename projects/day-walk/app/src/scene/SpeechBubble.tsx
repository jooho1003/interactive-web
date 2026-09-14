import type { CSSProperties } from "react";
import type { Advice } from "../domain/advisor.js";

export function SpeechBubble({ advice, x, width, onAction }: { advice: Advice; x: number; width: number; onAction(kind: "move-overdue" | "open-routines"): void }) {
  const bubbleWidth = Math.min(280, width - 16);
  const clamped = Math.max(8 + bubbleWidth / 2, Math.min(width - 8 - bubbleWidth / 2, x * width)) / width;
  const tail = `${Math.max(10, Math.min(90, clamped * 100))}%`;
  return <div aria-live="polite" className="speech-bubble" data-testid="speech-bubble" style={{ left: `${clamped * 100}%`, transform: "translateX(-50%)", "--bubble-tail": tail } as CSSProperties}><span>{advice.text}</span>{advice.action && <button onClick={() => onAction(advice.action!.kind)} type="button">{advice.action.label}</button>}</div>;
}
