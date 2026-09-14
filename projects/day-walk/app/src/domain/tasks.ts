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
  | { type: "restore"; task: Task } | { type: "rename"; id: string; title: string }
  | { type: "set-time"; id: string; minute: number } | { type: "clear-time"; id: string; bounds: DayBounds }
  | { type: "move-segment"; id: string; segment: Segment }
  | { type: "move-overdue"; bounds: DayBounds; minute: number }
  | { type: "toggle-done"; id: string; now: number } | { type: "toggle-star"; id: string };
export function tasksReducer(tasks: Task[], action: TaskAction): Task[] {
  if (action.type === "add" || action.type === "restore") return [...tasks, action.task];
  if (action.type === "delete") return tasks.filter((task) => task.id !== action.id);
  if (action.type === "replace") return tasks.map((task) => task.id === action.task.id ? action.task : task);
  if (action.type === "move-overdue") {
    const current = segmentOf(action.minute, action.bounds);
    return tasks.map((task) => !task.done && task.slot.kind === "segment" && taskSegment(task, action.bounds) !== current
      && ((task.slot.segment === "morning" && current !== "morning") || (task.slot.segment === "afternoon" && current === "evening"))
      ? { ...task, slot: { kind: "segment", segment: current } } : task);
  }
  return tasks.map((task) => {
    if (task.id !== action.id) return task;
    if (action.type === "toggle-star") return { ...task, starred: !task.starred };
    if (action.type === "rename") return { ...task, title: action.title };
    if (action.type === "set-time") return { ...task, slot: { kind: "time", minute: action.minute } };
    if (action.type === "clear-time") return { ...task, slot: { kind: "segment", segment: taskSegment(task, action.bounds) } };
    if (action.type === "move-segment") return task.slot.kind === "segment" ? { ...task, slot: { kind: "segment", segment: action.segment } } : task;
    return { ...task, done: !task.done, doneAt: task.done ? null : action.now };
  });
}
