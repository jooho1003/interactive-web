import type { CSSProperties } from "react";
import { useAppStore } from "../store/AppStore.js";
import { formatMinute, xOf } from "../domain/time.js";
import { QuickAdd } from "./QuickAdd.js";

export function Timeline() {
  const { data, dispatch, selectedDate } = useAppStore();
  const bounds = data.settings.bounds;
  const hours = Array.from({ length: Math.ceil((bounds.dayEnd - bounds.dayStart) / 60) }, (_, index) => (Math.floor(bounds.dayStart / 60) + index + 1) * 60).filter((minute) => minute < bounds.dayEnd);
  const references = [bounds.dayStart, bounds.morningEnd, bounds.afternoonEnd, bounds.dayEnd];
  return <section aria-label="하루 시간 기준선" className="timeline" data-testid="timeline">
    <div className="segments" aria-hidden="true"><i className="segment-morning" /><i className="segment-afternoon" /><i className="segment-evening" /></div>
    <div aria-hidden="true" className="hour-marks">{hours.map((minute) => <span key={minute} style={{ left: `${xOf(minute, bounds) * 100}%` }}><i />{references.every((value) => Math.abs(value - minute) > 30) && <small>{Math.floor(minute / 60) % 24}</small>}</span>)}</div>
    {references.map((minute, index) => <span className={`time-tick ${index === 0 ? "time-tick-start" : index === 3 ? "time-tick-end" : ""}`} key={index} style={{ "--tick-x": `${xOf(minute, bounds) * 100}%` } as CSSProperties}>{formatMinute(minute)}</span>)}
    <QuickAdd bounds={bounds} onAdd={(title, minute) => dispatch({ type: "tasks", date: selectedDate, action: { type: "add", task: { id: crypto.randomUUID(), title, slot: { kind: "time", minute }, starred: false, done: false, createdAt: Date.now(), doneAt: null } } })} />
  </section>;
}
