import { useState } from "react";
import type { Segment, Task } from "../schema/index.js";
import { taskSegment } from "../domain/tasks.js";
import { useAppStore } from "../store/AppStore.js";
import { useClock } from "../store/useClock.js";
import { Column } from "./Column.js";
const segments: Segment[] = ["morning", "afternoon", "evening"];
export function Board() { const { data, tasks, selectedDate, dispatch } = useAppStore(); const clock = useClock(data.settings.bounds); const [tab, setTab] = useState<Segment>(() => clock.minute <= data.settings.bounds.morningEnd ? "morning" : clock.minute <= data.settings.bounds.afternoonEnd ? "afternoon" : "evening"); const add = (task: Task) => dispatch({ type: "tasks", date: selectedDate, action: { type: "add", task } }); return <section className="board"><nav className="tabs">{segments.map((segment) => <button key={segment} onClick={() => setTab(segment)} className={tab === segment ? "selected" : ""}>{segment === "morning" ? "아침" : segment === "afternoon" ? "오후" : "저녁"}</button>)}</nav><div className="columns">{segments.map((segment) => <div key={segment} className={tab === segment ? "tab-current" : "tab-hidden"}><Column segment={segment} tasks={tasks.filter((task) => taskSegment(task, data.settings.bounds) === segment)} bounds={data.settings.bounds} minute={clock.minute} add={add} /></div>)}</div></section>; }
