import type { DayBounds, Task } from "../schema/index.js";
import { segmentOf } from "./time.js";
import { taskSegment } from "./tasks.js";

export interface DueNotification { id: string; text: string }
export function dueNotifications(tasks: Task[], bounds: DayBounds, minute: number, alreadyNotified: ReadonlySet<string>): DueNotification[] {
  const due: DueNotification[] = [];
  for (const task of tasks) {
    if (task.done || task.slot.kind !== "time" || minute < task.slot.minute || minute - task.slot.minute > 5) continue;
    const id = `task:${task.id}`;
    if (!alreadyNotified.has(id)) due.push({ id, text: `${String(Math.floor(task.slot.minute / 60)).padStart(2, "0")}:${String(task.slot.minute % 60).padStart(2, "0")} · ${task.title}` });
  }
  const segment = segmentOf(minute, bounds);
  const end = segment === "morning" ? bounds.morningEnd : segment === "afternoon" ? bounds.afternoonEnd : bounds.dayEnd;
  const id = `deadline:${segment}`;
  if (minute === end - 30 && !alreadyNotified.has(id)) {
    const count = tasks.filter((task) => !task.done && taskSegment(task, bounds) === segment).length;
    if (count) due.push({ id, text: `${segment === "morning" ? "아침" : segment === "afternoon" ? "점심" : "저녁"} 마감 30분 전 · 남은 일 ${count}개` });
  }
  return due;
}
