import { useEffect, useMemo, useRef, useState } from "react";
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
  const element = useRef<HTMLElement>(null);
  const [box, setBox] = useState({ width: 1600, pixelWidth: 1600, pixelHeight: 500 });
  const [adviceIndex, setAdviceIndex] = useState(0);
  const bounds = data.settings.bounds;
  const viewingToday = selectedDate === logicalDate;
  const advice = useMemo(() => ruleAdvisor.advise({ tasks, bounds, minute, phase }), [tasks, bounds, minute, phase]);
  const currentAdvice = advice[adviceIndex % Math.max(advice.length, 1)];
  const timed = tasks.filter((task) => task.slot.kind === "time");
  const characterX = xOf(minute, bounds);
  const remaining = tasks.filter((task) => !task.done).length;

  useEffect(() => {
    const node = element.current;
    if (!node) return;
    const resize = () => setBox({
      width: 500 * (node.clientWidth / node.clientHeight),
      pixelWidth: node.clientWidth,
      pixelHeight: node.clientHeight,
    });
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => setAdviceIndex(0), [advice]);

  const action = (kind: "move-overdue" | "open-routines") => {
    if (kind === "open-routines") return onOpenRoutines();
    dispatch({ type: "tasks", date: selectedDate, action: { type: "move-overdue", bounds, minute } });
  };
  const label = `하루 산책 동네. 현재 ${formatMinute(minute)}, 남은 일 ${remaining}개`;

  return (
    <section className="scene" ref={element}>
      <svg aria-label={label} data-testid="scene" preserveAspectRatio="xMidYMax meet" role="img" viewBox={`0 0 ${box.width} 500`}>
        <Sky bounds={bounds} minute={minute} phase={phase} width={box.width} />
        <Street parallax={xOf(minute, bounds)} width={box.width} />
        {timed.map((task, index) => <TaskHouse bounds={bounds} index={index} key={task.id} task={task} width={box.width} />)}
        {viewingToday && <Walker bounds={bounds} minute={minute} phase={phase} visible={data.settings.showCharacter} width={box.width} />}
        {viewingToday && data.settings.showAdvisor && data.settings.showCharacter && <Bird onNext={() => setAdviceIndex((index) => (index + 1) % Math.max(advice.length, 1))} x={characterX * box.width} />}
      </svg>
      {viewingToday && data.settings.showAdvisor && data.settings.showCharacter && currentAdvice && <SpeechBubble advice={currentAdvice} height={box.pixelHeight} onAction={action} width={box.pixelWidth} x={characterX} />}
      {!viewingToday && <p className="scene-date-note">{new Intl.DateTimeFormat("ko-KR", { month: "long", day: "numeric" }).format(new Date(`${selectedDate}T00:00:00`))}을 보고 있어요</p>}
    </section>
  );
}
