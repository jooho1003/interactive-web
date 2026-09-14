import type { CSSProperties } from "react";
import type { DayBounds, Task } from "../schema/index.js";
import { xOf } from "../domain/time.js";

function numberFor(text: string) {
  return [...text].reduce((total, character) => total + character.charCodeAt(0), 0);
}

export function TaskHouse({ task, bounds, raised }: {
  task: Task;
  bounds: DayBounds;
  raised: boolean;
}) {
  if (task.slot.kind !== "time") return null;
  const hash = numberFor(task.title);
  const outside = task.slot.minute < bounds.dayStart || task.slot.minute > bounds.dayEnd;
  const width = 70;
  const height = 70 + (hash % 21);
  const x = xOf(task.slot.minute, bounds) * 1600;
  const segment = task.slot.minute <= bounds.morningEnd
    ? "morning"
    : task.slot.minute <= bounds.afternoonEnd ? "afternoon" : "evening";
  const style = {
    "--house-wall": `var(--house-${hash % 5})`,
    "--flag-segment": `var(--seg-${segment})`,
  } as CSSProperties;
  return <g
    aria-label={`${task.title} ${task.done ? "완료" : "미완료"}`}
    className={`task-house ${task.done ? "house-done" : ""}`}
    data-done={task.done ? "true" : "false"}
    data-testid="house"
    style={style}
    transform={`translate(${x - width / 2} ${382 - height - (raised ? 18 : 0)})`}
  >
    <rect className="house-wall" height={height} rx="5" width={width} y="0" />
    <path className="house-roof" d={`M-7 5 L35 ${-30} L77 5 Z`} />
    <rect className="house-window" height="16" width="14" x="12" y={height - 30} />
    <rect className="house-window" height="16" width="14" x="44" y={height - 30} />
    <path className="house-pole" d="M56 -50 L56 16" />
    <path className="house-flag" d="M57 -49 L83 -40 L57 -31 Z" />
    {outside && <text className="house-badge" x="35" y={height + 18}>구간 밖</text>}
  </g>;
}
