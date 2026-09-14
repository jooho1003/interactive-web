import { useEffect, useState, type ReactNode } from "react";
import { taskSegment } from "../domain/tasks.js";
import type { Segment, Task } from "../schema/index.js";
import { useAppStore } from "../store/AppStore.js";
import { Column } from "./Column.js";

const segments: Segment[] = ["morning", "afternoon", "evening"];
const labels: Record<Segment, string> = { morning: "아침", afternoon: "오후", evening: "저녁" };

export function Board({ celebration }: { celebration?: ReactNode }) {
  const { data, tasks, selectedDate, dispatch, minute } = useAppStore();
  const current = minute <= data.settings.bounds.morningEnd ? "morning" : minute <= data.settings.bounds.afternoonEnd ? "afternoon" : "evening";
  const [tab, setTab] = useState<Segment>(current);
  const [highlight, setHighlight] = useState<Segment | null>(null);

  useEffect(() => {
    const listener = (event: Event) => {
      const segment = (event as CustomEvent<Segment>).detail;
      setTab(segment);
      setHighlight(segment);
      window.setTimeout(() => setHighlight(null), 300);
    };
    window.addEventListener("timeline-segment", listener);
    return () => window.removeEventListener("timeline-segment", listener);
  }, []);

  const add = (task: Task) => dispatch({ type: "tasks", date: selectedDate, action: { type: "add", task } });

  return (
    <section className="board">
      <nav aria-label="할 일 구간" className="tabs" role="tablist">
        {segments.map((segment) => (
          <button aria-controls={`panel-${segment}`} aria-selected={tab === segment} className={tab === segment ? "selected" : ""} id={`tab-${segment}`} key={segment} onClick={() => setTab(segment)} role="tab" type="button">
            {labels[segment]}
          </button>
        ))}
      </nav>
      <div className="columns">
        {segments.map((segment) => (
          <div className={`${tab === segment ? "tab-current" : "tab-hidden"} ${highlight === segment ? "column-flash" : ""}`} key={segment}>
            <Column add={add} bounds={data.settings.bounds} minute={minute} panelId={`panel-${segment}`} segment={segment} selectedTabId={`tab-${segment}`} tasks={tasks.filter((task) => taskSegment(task, data.settings.bounds) === segment)} />
          </div>
        ))}
      </div>
      {celebration}
    </section>
  );
}
