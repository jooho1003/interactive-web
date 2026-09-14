import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { DayBounds } from "../schema/index.js";
import { clamp, snap, xOf } from "../domain/time.js";

export function QuickAdd({ bounds, onAdd }: { bounds: DayBounds; onAdd(title: string, minute: number): void }) {
  const [minute, setMinute] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const open = (clientX: number, element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    setMinute(clamp(snap(bounds.dayStart + ((clientX - rect.left) / rect.width) * (bounds.dayEnd - bounds.dayStart)), bounds.dayStart, bounds.dayEnd));
    setTimeout(() => input.current?.focus());
  };
  useEffect(() => {
    const close = (event: PointerEvent) => { if (!(event.target as Element).closest(".quick-add")) setMinute(null); };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);
  return <div className="quick-add" onPointerDown={(event) => { if (event.target === event.currentTarget) open(event.clientX, event.currentTarget); }} onKeyDown={(event) => { if (event.key === "Enter" && minute === null) { event.preventDefault(); setMinute(bounds.dayStart); } }} tabIndex={0}>
    {minute !== null && <form className="quick-popover" onSubmit={(event) => { event.preventDefault(); if (title.trim()) { onAdd(title.trim(), minute); setTitle(""); setMinute(null); } }} style={{ "--quick-x": `${xOf(minute, bounds) * 100}%` } as CSSProperties}>
      <span className="flag-preview">⚑</span>
      <input aria-label="일정 제목" onChange={(event) => setTitle(event.target.value)} onKeyDown={(event) => { if (event.key === "Escape") setMinute(null); }} ref={input} value={title} />
    </form>}
  </div>;
}
