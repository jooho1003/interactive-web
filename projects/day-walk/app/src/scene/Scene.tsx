import { useEffect, useMemo, useState } from "react";
import { ruleAdvisor } from "../domain/advisor.js";
import { formatMinute, xOf } from "../domain/time.js";
import { useAppStore } from "../store/AppStore.js";
import { Bird } from "./Bird.js";
import { Sky } from "./Sky.js";
import { SpeechBubble } from "./SpeechBubble.js";
import { Street } from "./Street.js";
import { TaskHouse } from "./TaskHouse.js";
import { Walker } from "./Walker.js";

export function Scene({ onOpenRoutines }: { onOpenRoutines(): void }) {
  const { data, dispatch, logicalDate, minute, phase, selectedDate, tasks } = useAppStore();
  const [adviceIndex, setAdviceIndex] = useState(0);
  const bounds = data.settings.bounds;
  const viewingToday = selectedDate === logicalDate;
  const advice = useMemo(() => ruleAdvisor.advise({ tasks, bounds, minute, phase }), [tasks, bounds, minute, phase]);
  const currentAdvice = advice[adviceIndex % Math.max(advice.length, 1)];
  const timed = tasks.filter((task) => task.slot.kind === "time");
  const overlap = new Set<string>();
  timed.forEach((task, index) => {
    const previous = timed[index - 1];
    if (previous?.slot.kind === "time" && task.slot.kind === "time" && Math.abs(task.slot.minute - previous.slot.minute) < 60) {
      overlap.add(previous.id);
    }
  });
  const characterX = xOf(minute, bounds) * 100;
  const remaining = tasks.filter((task) => !task.done).length;
  useEffect(() => setAdviceIndex(0), [advice]);
  const nextAdvice = () => setAdviceIndex((index) => (index + 1) % Math.max(advice.length, 1));
  const action = (kind: "move-overdue" | "open-routines") => {
    if (kind === "open-routines") {
      onOpenRoutines();
      return;
    }
    dispatch({ type: "tasks", date: selectedDate, action: { type: "move-overdue", bounds, minute } });
  };
  const label = `하루 산책 동네. 현재 ${formatMinute(minute)}, ${phase === "before" ? "시작 전" : phase === "after" ? "종료 후" : "현재"} 구간, 남은 일 ${remaining}개`;
  return <section className="scene">
    <svg aria-label={label} data-testid="scene" preserveAspectRatio="xMidYMax slice" role="img" viewBox="0 0 1600 500">
      <Sky bounds={bounds} minute={minute} phase={phase} />
      <Street parallax={xOf(minute, bounds)} />
      {timed.map((task) => <TaskHouse bounds={bounds} key={task.id} raised={overlap.has(task.id)} task={task} />)}
      {viewingToday && <Walker bounds={bounds} minute={minute} phase={phase} visible={data.settings.showCharacter} />}
      {viewingToday && data.settings.showAdvisor && data.settings.showCharacter && <g transform={`translate(${characterX * 16} 0)`}>
        <Bird onNext={nextAdvice} />
      </g>}
    </svg>
    {viewingToday && data.settings.showAdvisor && data.settings.showCharacter && currentAdvice && <SpeechBubble advice={currentAdvice} onAction={action} x={characterX} />}
    {!viewingToday && <p className="scene-date-note">{new Intl.DateTimeFormat("ko-KR", { month: "long", day: "numeric" }).format(new Date(`${selectedDate}T00:00:00`))}을 보고 있어요</p>}
  </section>;
}
