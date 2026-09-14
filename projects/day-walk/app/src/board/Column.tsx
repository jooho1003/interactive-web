import { useEffect, useRef } from "react";
import { sortTasks } from "../domain/tasks.js";
import { formatMinute, segmentOf } from "../domain/time.js";
import type { DayBounds, Segment, Task } from "../schema/index.js";
import { AddTask } from "./AddTask.js";
import { TaskItem } from "./TaskItem.js";
import { TimeField } from "../ui/TimeField.js";
import { useAppStore } from "../store/AppStore.js";

const labels: Record<Segment, string> = { morning: "아침", afternoon: "점심", evening: "저녁" };

type Props = { segment: Segment; tasks: Task[]; bounds: DayBounds; minute: number; panelId: string; selectedTabId: string; add(task: Task): void };

export function Column({ segment, tasks, bounds, minute, panelId, selectedTabId, add }: Props) {
  const { data, dispatch } = useAppStore();
  const wasClear = useRef(false);
  const end = segment === "morning" ? bounds.morningEnd : segment === "afternoon" ? bounds.afternoonEnd : bounds.dayEnd;
  const start = segment === "morning" ? bounds.dayStart : segment === "afternoon" ? bounds.morningEnd : bounds.afternoonEnd;
  const current = segmentOf(minute, bounds) === segment;
  const open = tasks.filter((task) => !task.done);
  const complete = tasks.length - open.length;
  const overdue = !current && minute > end && open.length > 0;
  const remaining = end - minute;
  const timeLeft = remaining >= 60 ? `${Math.floor(remaining / 60)}시간 ${remaining % 60}분 남음` : `${Math.max(0, remaining)}분 남음`;
  const clear = tasks.length > 0 && !open.length;

  useEffect(() => {
    if (clear && !wasClear.current) window.dispatchEvent(new Event("bird-flap"));
    wasClear.current = clear;
  }, [clear]);

  return (
    <section aria-labelledby={selectedTabId} className="column" data-current={current ? "true" : "false"} data-testid={`column-${segment}`} id={panelId} role="tabpanel">
      <header>
        <span className="column-period">{labels[segment]} · {formatMinute(start)}–{formatMinute(end)}</span>
        <h2>{labels[segment]}까지 ~{formatMinute(end)}</h2>
        {current && <b>●지금</b>}
        {overdue && <b>지남</b>}
        <div className="column-deadline"><span>마감 시각</span><TimeField label={`${labels[segment]} 구간 마감 시각`}
          min={segment === "morning" ? bounds.dayStart + 60 : segment === "afternoon" ? bounds.morningEnd + 60 : Math.max(1260, bounds.afternoonEnd + 60)}
          max={segment === "morning" ? bounds.afternoonEnd - 60 : segment === "afternoon" ? bounds.dayEnd - 60 : 1680}
          onCommit={(value) => dispatch({ type: "settings", settings: { ...data.settings, bounds: { ...bounds, [segment === "morning" ? "morningEnd" : segment === "afternoon" ? "afternoonEnd" : "dayEnd"]: value } } })} value={end} /></div>
        <p>남은 {open.length} · 완료 {complete}{current && ` · ${timeLeft}`}</p>
        {clear && <strong className="clear">CLEAR</strong>}
      </header>
      <ul>{sortTasks(tasks).map((task) => <TaskItem bounds={bounds} key={task.id} overdue={overdue} task={task} />)}</ul>
      <AddTask add={add} segment={segment} />
    </section>
  );
}
