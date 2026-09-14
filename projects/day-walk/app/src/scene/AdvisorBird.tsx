import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ruleAdvisor, type Advice } from "../domain/advisor.js";
import { formatMinute, xOf } from "../domain/time.js";
import { useAppStore } from "../store/AppStore.js";
import { Bird } from "./Bird.js";
import { SpeechBubble } from "./SpeechBubble.js";

export function AdvisorBird({ onOpenRoutines }: { onOpenRoutines(): void }) {
  const { data, dispatch, tasks, minute, phase, selectedDate } = useAppStore();
  const [visible, setVisible] = useState(true);
  const [arrival, setArrival] = useState<{ advice: Advice; tasks: string[] } | null>(null);
  const previousMinute = useRef(minute);
  const seen = useRef(new Set<string>());
  const bounds = data.settings.bounds;
  const advice = ruleAdvisor.advise({ tasks, bounds, minute, phase });

  useEffect(() => {
    const reached = tasks.filter((task) => task.slot.kind === "time" && !task.done && task.slot.minute <= minute && task.slot.minute >= previousMinute.current && !seen.current.has(`${task.id}:${task.slot.minute}`));
    previousMinute.current = minute;
    if (!reached.length) return;
    reached.forEach((task) => { if (task.slot.kind === "time") seen.current.add(`${task.id}:${task.slot.minute}`); });
    const newest = Math.max(...reached.map((task) => task.slot.kind === "time" ? task.slot.minute : 0));
    setArrival({ advice: { id: `arrival-${newest}`, text: `${formatMinute(newest)}이야. ${reached.map((task) => task.title).join(", ")} 할 시간이야.` }, tasks: reached.map((task) => task.id) });
    setVisible(true);
  }, [minute, tasks]);

  const current = arrival && tasks.some((task) => arrival.tasks.includes(task.id) && !task.done) ? arrival.advice : advice[0];
  const position = xOf(minute, bounds);
  return <div className={`scene-companion ${position > .5 ? "companion-left" : ""}`} style={{ "--companion-x": `${position * 100}%` } as CSSProperties}>
    <Bird expanded={visible} onNext={() => setVisible(true)} />
    {visible && current && <SpeechBubble advice={current} onDismiss={() => setVisible(false)} onAction={(kind) => {
      if (kind === "open-routines") onOpenRoutines();
      else dispatch({ type: "tasks", date: selectedDate, action: { type: "move-overdue", bounds, minute } });
    }} />}
  </div>;
}
