import type { CSSProperties } from "react";
import { xOf } from "../domain/time.js";
import type { DayBounds, Task } from "../schema/index.js";

const hash = (text: string) => [...text].reduce((total, character) => total + character.charCodeAt(0), 0);

export function TaskHouse({ task, bounds, index, width }: { task: Task; bounds: DayBounds; index: number; width: number }) {
  if (task.slot.kind !== "time") return null;
  const value = hash(task.title);
  const height = 70 + value % 21;
  const outside = task.slot.minute < bounds.dayStart || task.slot.minute > bounds.dayEnd;
  const segment = task.slot.minute <= bounds.morningEnd ? "morning" : task.slot.minute <= bounds.afternoonEnd ? "afternoon" : "evening";
  const style = { "--house-wall": `var(--house-${value % 5})`, "--flag-segment": `var(--seg-${segment})` } as CSSProperties;
  return <g aria-label={task.title} className={`task-house ${task.done ? "house-done" : ""}`} data-done={task.done ? "true" : "false"} data-testid="house" style={style} transform={`translate(${xOf(task.slot.minute, bounds) * width - 35} ${405 - height - (index && Math.abs(index % 2) ? 18 : 0)})`}><rect className="house-wall" height={height} rx="5" width="70" /><path className="house-roof" d="M-7 5 L35 -30 L77 5 Z" /><rect className="house-window" height="16" width="14" x="12" y={height - 30} /><rect className="house-window" height="16" width="14" x="44" y={height - 30} /><path className="house-pole" d="M56 -50 L56 16" /><path className="house-flag" d="M57 -49 L83 -40 L57 -31 Z" />{outside && <text className="house-badge" x="35" y={height + 18}>구간 밖</text>}</g>;
}
