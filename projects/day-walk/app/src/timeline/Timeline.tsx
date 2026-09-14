import type { CSSProperties } from "react";
import type { Task } from "../schema/index.js";
import { useAppStore } from "../store/AppStore.js";
import { formatMinute, xOf } from "../domain/time.js";
import { BoundaryHandle } from "./BoundaryHandle.js";
import { Flag } from "./Flag.js";
import { QuickAdd } from "./QuickAdd.js";

export function Timeline() {
  const { data, dispatch, selectedDate, tasks } = useAppStore();
  const bounds = data.settings.bounds;
  const timed = tasks.filter((task) => task.slot.kind === "time");
  const stacks = new Map<number, number>();
  const focus = (task: Task) => {
    document.getElementById(`task-${task.id}`)?.focus();
    window.dispatchEvent(new CustomEvent("timeline-segment", { detail: task.slot.kind === "time" && task.slot.minute <= bounds.morningEnd ? "morning" : task.slot.kind === "time" && task.slot.minute <= bounds.afternoonEnd ? "afternoon" : "evening" }));
  };
  return <section className="timeline" data-testid="timeline">
    <div className="segments" aria-hidden="true"><i className="segment-morning" /><i className="segment-afternoon" /><i className="segment-evening" /></div>
    {[bounds.dayStart, bounds.morningEnd, bounds.afternoonEnd, bounds.dayEnd].map((minute, index) => <span className={`time-tick ${index === 0 ? "time-tick-start" : index === 3 ? "time-tick-end" : ""}`} key={minute} style={{ "--tick-x": `${xOf(minute, bounds) * 100}%` } as CSSProperties}>{formatMinute(minute)}</span>)}
    {timed.map((task) => { const value = task.slot.kind === "time" ? task.slot.minute : 0; const stack = stacks.get(value) ?? 0; stacks.set(value, stack + 1); return <Flag bounds={bounds} key={task.id} onChange={(minute) => dispatch({ type: "tasks", date: selectedDate, action: { type: "set-time", id: task.id, minute } })} onFocus={focus} stack={stack} task={task} />; })}
    <BoundaryHandle bounds={bounds} name="morningEnd" onChange={(next) => dispatch({ type: "settings", settings: { ...data.settings, bounds: next } })} />
    <BoundaryHandle bounds={bounds} name="afternoonEnd" onChange={(next) => dispatch({ type: "settings", settings: { ...data.settings, bounds: next } })} />
    <QuickAdd bounds={bounds} onAdd={(title, minute) => dispatch({ type: "tasks", date: selectedDate, action: { type: "add", task: { id: crypto.randomUUID(), title, slot: { kind: "time", minute }, starred: false, done: false, createdAt: Date.now(), doneAt: null } } })} />
  </section>;
}
