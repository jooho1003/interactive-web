import { useRef, useState, type CSSProperties } from "react";
import type { DayBounds, Task } from "../schema/index.js";
import { clamp, formatMinute, segmentOf, snap, xOf } from "../domain/time.js";

type Props = { task: Task; bounds: DayBounds; stack: number; onChange(minute: number): void; onFocus(task: Task): void };
export function Flag({ task, bounds, stack, onChange, onFocus }: Props) {
  const time = task.slot.kind === "time" ? task.slot : null;
  const start = useRef({ x: 0, minute: time?.minute ?? 0 });
  const [dragMinute, setDragMinute] = useState<number | null>(null);
  if (!time) return null;
  const minute = dragMinute ?? time.minute;
  const pointMinute = (clientX: number, element: HTMLElement) => {
    const rect = element.parentElement?.getBoundingClientRect();
    if (!rect) return time.minute;
    return clamp(snap(bounds.dayStart + ((clientX - rect.left) / rect.width) * (bounds.dayEnd - bounds.dayStart)), bounds.dayStart, bounds.dayEnd);
  };
  const move = (clientX: number, element: HTMLElement) => {
    const next = pointMinute(clientX, element);
    setDragMinute(next);
    window.dispatchEvent(new CustomEvent("timeline-segment", { detail: segmentOf(next, bounds) }));
  };
  return <button
    aria-valuetext={`${formatMinute(minute)} ${task.title}`}
    aria-valuemax={bounds.dayEnd}
    aria-valuemin={bounds.dayStart}
    aria-valuenow={minute}
    className={`flag ${task.done ? "flag-done" : ""}`}
    data-done={task.done ? "true" : "false"}
    data-testid="flag"
    onKeyDown={(event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      const amount = event.shiftKey ? 60 : 15;
      onChange(clamp(time.minute + (event.key === "ArrowLeft" ? -amount : amount), bounds.dayStart, bounds.dayEnd));
    }}
    onPointerDown={(event) => {
      event.currentTarget.setPointerCapture(event.pointerId);
      start.current = { x: event.clientX, minute: time.minute };
      setDragMinute(time.minute);
    }}
    onPointerMove={(event) => {
      if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
      move(event.clientX, event.currentTarget);
    }}
    onPointerUp={(event) => {
      if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
      event.currentTarget.releasePointerCapture(event.pointerId);
      const moved = Math.abs(event.clientX - start.current.x);
      const next = pointMinute(event.clientX, event.currentTarget);
      setDragMinute(null);
      if (moved < 4) onFocus(task);
      else onChange(next);
    }}
    role="slider"
    style={{ "--flag-x": `${xOf(minute, bounds) * 100}%`, "--flag-stack": String(stack) } as CSSProperties}
    type="button"
  >
    ⚑
    {dragMinute !== null && <span className="flag-bubble">{formatMinute(dragMinute)}</span>}
  </button>;
}
