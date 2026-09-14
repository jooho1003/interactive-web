import { useEffect, useRef } from "react";
import type { DayBounds, Segment, Task } from "../schema/index.js";
import { formatMinute, segmentOf } from "../domain/time.js";
import { sortTasks } from "../domain/tasks.js";
import { AddTask } from "./AddTask.js";
import { TaskItem } from "./TaskItem.js";
const labels: Record<Segment, string> = { morning: "아침", afternoon: "점심", evening: "저녁" };
export function Column({ segment, tasks, bounds, minute, add }: { segment: Segment; tasks: Task[]; bounds: DayBounds; minute: number; add(task: Task): void }) {
  const wasClear = useRef(false);
  const end = segment === "morning" ? bounds.morningEnd : segment === "afternoon" ? bounds.afternoonEnd : bounds.dayEnd;
  const current = segmentOf(minute, bounds) === segment; const open = tasks.filter((task) => !task.done); const complete = tasks.length - open.length;
  const overdue = !current && minute > end && open.length > 0;
  const remaining = end - minute; const text = remaining >= 60 ? `${Math.floor(remaining / 60)}시간 ${remaining % 60}분 남음` : `${Math.max(0, remaining)}분 남음`;
  const clear = tasks.length > 0 && !open.length;
  useEffect(() => {
    if (clear && !wasClear.current) window.dispatchEvent(new Event("bird-flap"));
    wasClear.current = clear;
  }, [clear]);
  return <section className="column" data-testid={`column-${segment}`} data-current={current ? "true" : "false"}><header><h2>{labels[segment]}까지 ~{formatMinute(end)}</h2>{current && <b>●지금</b>}{overdue && <b>지남</b>}<p>남은 {open.length} · 완료 {complete}{current && ` · ${text}`}</p>{clear && <strong className="clear">CLEAR</strong>}</header><ul>{sortTasks(tasks).map((task) => <TaskItem key={task.id} task={task} bounds={bounds} overdue={overdue} />)}</ul><AddTask segment={segment} add={add} /></section>;
}
