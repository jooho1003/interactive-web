import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from "react";
import type { DayBounds } from "../schema/index.js";
import { clamp, segmentOf, snap, xOf } from "../domain/time.js";

type Props = {
  bounds: DayBounds;
  onAdd(title: string, minute: number): void;
};

export function QuickAdd({ bounds, onAdd }: Props) {
  const [minute, setMinute] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => { if (minute !== null) input.current?.focus(); }, [minute]);
  const open = (clientX: number, element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const next = bounds.dayStart + ((clientX - rect.left) / rect.width) * (bounds.dayEnd - bounds.dayStart);
    setMinute(clamp(snap(next), bounds.dayStart, bounds.dayEnd));
    setTimeout(() => input.current?.focus());
  };

  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (!(event.target as Element).closest(".quick-add")) setMinute(null);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim() || minute === null) return;
    onAdd(title.trim(), minute);
    window.dispatchEvent(new CustomEvent("timeline-segment", { detail: segmentOf(minute, bounds) }));
    setTitle("");
    setMinute(null);
  };

  return (
    <div
      className="quick-add"
      onKeyDown={(event) => {
        if (event.key === "Enter" && minute === null) {
          event.preventDefault();
          setMinute(bounds.dayStart);
        }
      }}
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) open(event.clientX, event.currentTarget);
      }}
      tabIndex={0}
    >
      {minute !== null && (
        <form
          className="quick-popover"
          onSubmit={submit}
          style={{ "--quick-x": `${Math.max(15, Math.min(85, xOf(minute, bounds) * 100))}%` } as CSSProperties}
        >
          <span className="flag-preview">⚑</span>
          <input
            aria-label="일정 제목"
            onChange={(event) => setTitle(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") setMinute(null);
            }}
            ref={input}
            value={title}
          />
        </form>
      )}
    </div>
  );
}
