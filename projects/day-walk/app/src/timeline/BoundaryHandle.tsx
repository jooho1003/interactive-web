import { useState, type CSSProperties } from "react";
import type { DayBounds } from "../schema/index.js";
import { clampBounds, formatMinute, xOf } from "../domain/time.js";

type Name = "morningEnd" | "afternoonEnd";
export function BoundaryHandle({ name, bounds, onChange }: { name: Name; bounds: DayBounds; onChange(bounds: DayBounds): void }) {
  const [minute, setMinute] = useState<number | null>(null);
  const value = minute ?? bounds[name];
  const update = (clientX: number, element: HTMLElement, save: boolean) => {
    const rect = element.parentElement?.getBoundingClientRect();
    if (!rect) return;
    const raw = bounds.dayStart + ((clientX - rect.left) / rect.width) * (bounds.dayEnd - bounds.dayStart);
    const next = clampBounds({ ...bounds, [name]: raw });
    setMinute(next[name]);
    if (save) { onChange(next); setMinute(null); }
  };
  return <button
    aria-valuemax={name === "morningEnd" ? bounds.afternoonEnd - 60 : bounds.dayEnd - 60}
    aria-valuemin={name === "morningEnd" ? bounds.dayStart + 60 : bounds.morningEnd + 60}
    aria-valuenow={value}
    className="boundary"
    data-testid={`boundary-${name}`}
    onKeyDown={(event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      onChange(clampBounds({ ...bounds, [name]: bounds[name] + (event.key === "ArrowLeft" ? -15 : 15) }));
    }}
    onPointerDown={(event) => event.currentTarget.setPointerCapture(event.pointerId)}
    onPointerMove={(event) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) update(event.clientX, event.currentTarget, false); }}
    onPointerUp={(event) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) { event.currentTarget.releasePointerCapture(event.pointerId); update(event.clientX, event.currentTarget, true); } }}
    onPointerCancel={() => setMinute(null)}
    onLostPointerCapture={() => setMinute(null)}
    role="slider"
    style={{ "--boundary-x": `${xOf(value, bounds) * 100}%` } as CSSProperties}
    type="button"
  >◆<span className="sr-only">{formatMinute(value)}</span></button>;
}
