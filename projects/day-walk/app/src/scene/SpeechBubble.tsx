import type { Advice } from "../domain/advisor.js";

export function SpeechBubble({ advice, onAction, onDismiss }: { advice: Advice; onAction(kind: "move-overdue" | "open-routines"): void; onDismiss(): void }) {
  return <div aria-live="polite" className="speech-bubble" data-testid="speech-bubble">
    <button aria-label={`${advice.text} 말풍선 닫기`} className="speech-text" onClick={onDismiss} type="button"><span>{advice.text}</span><small>탭하면 잠깐 조용히 있을게</small></button>
    {advice.action && <button className="speech-action" onClick={() => onAction(advice.action!.kind)} type="button">{advice.action.label}</button>}
  </div>;
}
