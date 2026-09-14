import { useRef, useState, type CSSProperties } from "react";
import { playFlag } from "../audio/sfx.js";
import type { DayBounds, Task } from "../schema/index.js";
import { useAppStore } from "../store/AppStore.js";
import { clamp, formatMinute, magneticMinute, segmentOf, xOf } from "../domain/time.js";

type Props = { task: Task; bounds: DayBounds; currentMinute: number; stack: number; viewingToday: boolean; onChange(minute: number): void; onFocus(task: Task): void };
export function Flag({ task, bounds, currentMinute, stack, viewingToday, onChange, onFocus }: Props) {
  const { data } = useAppStore();
  const drag = useRef<{ pointer: number; x: number; minute: number; width: number; moved: boolean } | null>(null);
  const [dragMinute, setDragMinute] = useState<number | null>(null);
  if (task.slot.kind !== "time") return null;
  const time = task.slot.minute;
  const minute = dragMinute ?? time;
  const position = xOf(minute, bounds);
  const pointMinute = (clientX: number) => drag.current ? clamp(magneticMinute(drag.current.minute + (clientX - drag.current.x) / drag.current.width * (bounds.dayEnd - bounds.dayStart)), bounds.dayStart, bounds.dayEnd) : time;
  const save = (next: number) => {
    onChange(next);
    window.dispatchEvent(new CustomEvent("timeline-segment", { detail: segmentOf(next, bounds) }));
    if (data.settings.sound) playFlag();
  };
  return <button
    aria-label={`${formatMinute(minute)} ${task.title}`}
    aria-valuetext={`${formatMinute(minute)} ${task.title}`}
    aria-valuemax={bounds.dayEnd} aria-valuemin={bounds.dayStart} aria-valuenow={minute} aria-orientation="horizontal"
    className={`scene-task-marker ${task.done ? "is-done" : ""} ${viewingToday && minute <= currentMinute ? "is-reached" : "is-upcoming"} ${task.starred ? "is-important" : ""} ${dragMinute !== null ? "is-dragging" : ""} ${position < .1 ? "is-near-start" : position > .9 ? "is-near-end" : ""}`}
    data-done={String(task.done)} data-testid="flag"
    onKeyDown={(event) => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onFocus(task); return; }
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      save(clamp(time + (event.key === "ArrowLeft" ? -1 : 1) * (event.shiftKey ? 60 : 15), bounds.dayStart, bounds.dayEnd));
    }}
    onPointerDown={(event) => {
      if (event.button !== 0) return;
      event.preventDefault();
      event.stopPropagation();
      drag.current = { pointer: event.pointerId, x: event.clientX, minute: time, width: event.currentTarget.parentElement!.getBoundingClientRect().width, moved: false };
      event.currentTarget.setPointerCapture(event.pointerId);
    }}
    onPointerMove={(event) => {
      if (drag.current?.pointer !== event.pointerId) return;
      if (Math.abs(event.clientX - drag.current.x) < 4 && !drag.current.moved) return;
      drag.current.moved = true;
      setDragMinute(pointMinute(event.clientX));
    }}
    onPointerUp={(event) => {
      if (drag.current?.pointer !== event.pointerId) return;
      const next = pointMinute(event.clientX);
      const moved = drag.current.moved;
      drag.current = null;
      setDragMinute(null);
      if (moved) save(next); else onFocus(task);
      if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    }}
    onPointerCancel={() => { drag.current = null; setDragMinute(null); }}
    onLostPointerCapture={() => { drag.current = null; setDragMinute(null); }}
    role="slider"
    style={{ "--marker-x": `${position * 100}%`, "--marker-row": stack, "--flag-segment": `var(--seg-${segmentOf(minute, bounds)})` } as CSSProperties}
    title={`${task.title} · ${formatMinute(minute)} · 드래그해서 시각 변경`}
    type="button"
  >
    <span className="scene-flag-label"><small>{task.done ? "✓ 완료" : task.starred ? "★ 중요한 일정" : "TO DO"}<time>{formatMinute(minute)}</time></small><b>{task.title}</b></span>
    <span aria-hidden="true" className="neighborhood-flag"><i /><b><em /></b><span className="flag-finial" /><span className="flag-foot" /></span>
    {dragMinute !== null && minute % 30 === 0 && <span className="flag-snap-hint">{formatMinute(minute)}에 맞춤</span>}
  </button>;
}
