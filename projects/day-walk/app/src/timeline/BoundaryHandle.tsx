import { useRef, useState, type CSSProperties } from "react";
import type { DayBounds } from "../schema/index.js";
import { clamp, formatMinute, magneticMinute, xOf } from "../domain/time.js";

type Name = "morningEnd" | "afternoonEnd";
export function BoundaryHandle({ name, bounds, onChange }: { name: Name; bounds: DayBounds; onChange(bounds: DayBounds): void }) {
  const drag = useRef<{ pointer: number; x: number; minute: number; width: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const min = name === "morningEnd" ? bounds.dayStart + 60 : bounds.morningEnd + 60;
  const max = name === "morningEnd" ? bounds.afternoonEnd - 60 : bounds.dayEnd - 60;
  const change = (value: number) => onChange({ ...bounds, [name]: clamp(Math.round(value), min, max) });
  const update = (clientX: number) => {
    if (!drag.current) return;
    change(magneticMinute(drag.current.minute + (clientX - drag.current.x) / drag.current.width * (bounds.dayEnd - bounds.dayStart)));
  };
  return <button
    aria-label={name === "morningEnd" ? "아침과 오후 경계" : "오후와 저녁 경계"}
    aria-orientation="horizontal"
    aria-valuemax={max}
    aria-valuemin={min}
    aria-valuenow={bounds[name]}
    aria-valuetext={formatMinute(bounds[name])}
    className={`boundary ${dragging ? "is-dragging" : ""}`}
    data-testid={`boundary-${name}`}
    onKeyDown={(event) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      const amount = event.shiftKey ? 15 : 1;
      change(event.key === "Home" ? min : event.key === "End" ? max : bounds[name] + (event.key === "ArrowLeft" ? -amount : amount));
    }}
    onPointerDown={(event) => {
      if (event.button !== 0) return;
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      drag.current = { pointer: event.pointerId, x: event.clientX, minute: bounds[name], width: event.currentTarget.parentElement!.getBoundingClientRect().width };
      setDragging(true);
    }}
    onPointerMove={(event) => { if (drag.current?.pointer === event.pointerId) update(event.clientX); }}
    onPointerUp={(event) => {
      if (drag.current?.pointer !== event.pointerId) return;
      update(event.clientX);
      drag.current = null;
      setDragging(false);
      if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    }}
    onPointerCancel={() => { drag.current = null; setDragging(false); }}
    onLostPointerCapture={() => { drag.current = null; setDragging(false); }}
    role="slider"
    style={{ "--boundary-x": `${xOf(bounds[name], bounds) * 100}%` } as CSSProperties}
    title="점선을 좌우로 드래그해서 시간대 조절"
    type="button"
  ><span aria-hidden="true" className="boundary-drag-area" /><span aria-hidden="true" className="boundary-grip">⋮</span><span className="boundary-time">{formatMinute(bounds[name])}</span></button>;
}
