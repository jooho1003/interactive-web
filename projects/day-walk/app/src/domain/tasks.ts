import type { DayBounds, Routine, Segment, Slot, Task } from "../schema/index.js";
import { segmentOf } from "./time.js";

export function taskSegment(task: Task, bounds: DayBounds): Segment { return task.slot.kind === "time" ? segmentOf(task.slot.minute, bounds) : task.slot.segment; }
export function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => Number(a.done) - Number(b.done) || Number(b.starred) - Number(a.starred) ||
    Number(a.slot.kind !== "time") - Number(b.slot.kind !== "time") ||
    (a.slot.kind === "time" && b.slot.kind === "time" ? a.slot.minute - b.slot.minute : 0) || a.createdAt - b.createdAt);
}
export function sameSlot(a: Slot, b: Slot) { return a.kind === b.kind && (a.kind === "time" ? a.minute === (b as Extract<Slot, { kind: "time" }>).minute : a.segment === (b as Extract<Slot, { kind: "segment" }>).segment); }
export function applyRoutine(tasks: Task[], routine: Routine, makeId: () => string, now: number) {
  let added = 0, skipped = 0;
  const created = routine.tasks.flatMap((item) => {
    if (tasks.some((task) => task.title === item.title && sameSlot(task.slot, item.slot))) { skipped++; return []; }
    added++; return [{ id: makeId(), title: item.title, slot: item.slot, starred: item.starred, done: false, createdAt: now, doneAt: null } satisfies Task];
  });
  return { tasks: [...tasks, ...created], added, skipped };
}
export type TaskAction =
  | { type: "add"; task: Task } | { type: "replace"; task: Task } | { type: "delete"; id: string }
  | { type: "toggle-done"; id: string; now: number } | { type: "toggle-star"; id: string };
export function tasksReducer(tasks: Task[], action: TaskAction): Task[] {
  if (action.type === "add") return [...tasks, action.task];
  if (action.type === "delete") return tasks.filter((task) => task.id !== action.id);
  if (action.type === "replace") return tasks.map((task) => task.id === action.task.id ? action.task : task);
  return tasks.map((task) => {
    if (task.id !== action.id) return task;
    if (action.type === "toggle-star") return { ...task, starred: !task.starred };
    return { ...task, done: !task.done, doneAt: task.done ? null : action.now };
  });
}
