import { taskSegment } from "../domain/tasks.js";
import { formatMinute, segmentOf } from "../domain/time.js";
import type { Task } from "../schema/index.js";
import { useAppStore } from "../store/AppStore.js";
import { AdvisorBird } from "./AdvisorBird.js";
import { CinematicScene } from "./CinematicScene.js";

export function Scene({ onOpenRoutines }: { onOpenRoutines(): void }) {
  const { data, dispatch, logicalDate, minute, phase, selectedDate, tasks } = useAppStore();
  const bounds = data.settings.bounds;
  const viewingToday = selectedDate === logicalDate;
  const remaining = tasks.filter((task) => !task.done).length;
  const segmentLabel = { morning: "아침", afternoon: "오후", evening: "저녁" }[segmentOf(minute, bounds)];
  const focusTask = (task: Task) => {
    window.dispatchEvent(new CustomEvent("timeline-segment", { detail: taskSegment(task, bounds) }));
    requestAnimationFrame(() => document.getElementById(`task-${task.id}`)?.focus({ preventScroll: false }));
  };
  return <section aria-label={`하루 산책 동네. 현재 ${formatMinute(minute)}, ${segmentLabel} 구간, 남은 일 ${remaining}개`} className={`scene scene-${phase}`} data-testid="scene" data-viewing-today={String(viewingToday)}>
    <CinematicScene bounds={bounds} minute={minute}
      onAddTask={(title, taskMinute) => {
        dispatch({ type: "tasks", date: selectedDate, action: { type: "add", task: { id: crypto.randomUUID(), title, slot: { kind: "time", minute: taskMinute }, starred: false, done: false, createdAt: Date.now(), doneAt: null } } });
        window.dispatchEvent(new CustomEvent("timeline-segment", { detail: segmentOf(taskMinute, bounds) }));
      }}
      onChangeTask={(task, next) => dispatch({ type: "tasks", date: selectedDate, action: { type: "set-time", id: task.id, minute: next } })}
      onFocusTask={focusTask} onOpenRoutines={onOpenRoutines} remaining={remaining} segmentLabel={segmentLabel} selectedDate={selectedDate} showCharacter={data.settings.showCharacter} tasks={tasks} viewingToday={viewingToday}
    />
    {viewingToday && data.settings.showAdvisor && data.settings.showCharacter && <AdvisorBird onOpenRoutines={onOpenRoutines} />}
    {!viewingToday && <p className="scene-date-note">{new Intl.DateTimeFormat("ko-KR", { month: "long", day: "numeric" }).format(new Date(`${selectedDate}T00:00:00`))}을 보고 있어요</p>}
  </section>;
}
