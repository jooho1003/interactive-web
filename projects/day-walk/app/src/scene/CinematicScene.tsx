import { useEffect, useRef, useState, type CSSProperties, type FormEvent, type PointerEvent } from "react";
import { clamp, formatMinute, snap, xOf } from "../domain/time.js";
import type { DayBounds, Task } from "../schema/index.js";
import { Flag } from "../timeline/Flag.js";

type Props = {
  bounds: DayBounds;
  minute: number;
  onAddTask(title: string, minute: number): void;
  onOpenRoutines(): void;
  onChangeTask(task: Task, minute: number): void;
  onFocusTask(task: Task): void;
  remaining: number;
  segmentLabel: string;
  selectedDate: string;
  showCharacter: boolean;
  tasks: Task[];
  viewingToday: boolean;
};

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric", month: "long", day: "numeric", weekday: "short",
});

function positionStyle(value: number, name: "--add-x" | "--marker-x" | "--now-x" | "--walker-x"): CSSProperties {
  const edge = name === "--add-x" ? 9 : 4;
  return { [name]: `${Math.max(edge, Math.min(100 - edge, value * 100))}%` } as CSSProperties;
}

function daylightStyle(bounds: DayBounds): CSSProperties {
  const morning = xOf(bounds.morningEnd, bounds) * 100;
  const afternoon = (xOf(bounds.afternoonEnd, bounds) - xOf(bounds.morningEnd, bounds)) * 100;
  const sunset = morning + afternoon;
  return {
    "--morning-width": `${morning}%`,
    "--afternoon-width": `${afternoon}%`,
    "--evening-width": `${100 - morning - afternoon}%`,
    "--dawn-x": `${morning}%`,
    "--sunset-x": `${sunset}%`,
    "--sun-center-x": `${morning + afternoon / 2}%`,
    "--sun-width": `${Math.max(12, afternoon)}%`,
  } as CSSProperties;
}

function minuteAt(clientX: number, element: HTMLElement, bounds: DayBounds) {
  const rect = element.getBoundingClientRect();
  const ratio = (clientX - rect.left) / rect.width;
  return snap(clamp(bounds.dayStart + ratio * (bounds.dayEnd - bounds.dayStart), bounds.dayStart, bounds.dayEnd));
}

export function CinematicScene({ bounds, minute, onAddTask, onChangeTask, onFocusTask, onOpenRoutines, remaining, segmentLabel, selectedDate, showCharacter, tasks, viewingToday }: Props) {
  const [addMinute, setAddMinute] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const element = useRef<HTMLDivElement>(null);
  const [sceneWidth, setSceneWidth] = useState(1440);
  const progress = xOf(minute, bounds);
  const dateLabel = dateFormatter.format(new Date(`${selectedDate}T00:00:00`));
  const hasTimedTasks = tasks.some((task) => task.slot.kind === "time");
  const isWalking = viewingToday && minute >= bounds.dayStart && minute <= bounds.dayEnd;
  const labelRows = new Map<string, number>();
  const rowEnds: number[] = [];
  const labelWidth = sceneWidth <= 720 ? 100 : 180;
  [...tasks].filter((task) => task.slot.kind === "time").sort((a, b) => (a.slot as { minute: number }).minute - (b.slot as { minute: number }).minute).forEach((task) => {
    if (task.slot.kind !== "time") return;
    const x = xOf(task.slot.minute, bounds) * sceneWidth;
    let row = rowEnds.findIndex((end) => x - labelWidth / 2 > end);
    if (row < 0) row = Math.min(rowEnds.length, 3);
    rowEnds[row] = x + labelWidth / 2;
    labelRows.set(task.id, row);
  });

  useEffect(() => {
    const node = element.current;
    if (!node) return;
    const observer = new ResizeObserver(() => setSceneWidth(node.clientWidth));
    setSceneWidth(node.clientWidth);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (addMinute !== null) window.setTimeout(() => input.current?.focus(), 0);
  }, [addMinute]);

  useEffect(() => {
    const close = (event: globalThis.PointerEvent) => {
      if (!(event.target as Element).closest(".scene-add-popover, .neighborhood-scene")) setAddMinute(null);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const clean = title.trim();
    if (!clean || addMinute === null) return;
    onAddTask(clean, addMinute);
    setTitle("");
    setAddMinute(null);
  };

  const openAdd = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || (event.target as HTMLElement).closest("button, form")) return;
    setAddMinute(minuteAt(event.clientX, event.currentTarget, bounds));
  };

  return (
    <div aria-label={`${dateLabel} 시간 산책. 빈 곳을 누르면 그 시각에 일정을 추가합니다.`} className={`neighborhood-scene ${isWalking ? "is-walking" : ""}`} data-testid="cinematic-scene" onPointerDown={openAdd} ref={element} style={daylightStyle(bounds)}>
      <img alt="아침에서 밤으로 이어지는 3D 애니메이션 주택가" className="neighborhood-frame" fetchPriority="high" loading="eager" src="./media/day-walk-daylight-v3.webp" />
      <img alt="" aria-hidden="true" className="neighborhood-frame neighborhood-day" src="./media/day-walk-afternoon-v4.webp" />
      <img alt="" aria-hidden="true" className="neighborhood-frame neighborhood-night" src="./media/day-walk-evening-v3.webp" />
      <div className="neighborhood-hud">
        <span className="neighborhood-mode">DAY WALK · {segmentLabel}</span>
        <span className="neighborhood-date">{dateLabel}</span>
        <span className="neighborhood-clock">{formatMinute(minute)} · 남은 일정 {remaining}</span>
      </div>

      <div className="scene-task-markers">
        {tasks.map((task) => {
          if (task.slot.kind !== "time") return null;
          const stack = labelRows.get(task.id) ?? 0;
          return <Flag bounds={bounds} currentMinute={minute} key={task.id} onChange={(next) => onChangeTask(task, next)} onFocus={onFocusTask} stack={stack} task={task} viewingToday={viewingToday} />;
        })}
      </div>

      {showCharacter && viewingToday && (
        <div aria-label={`${formatMinute(minute)} 현재 위치의 캐릭터`} className="scene-walker-3d" data-minute={minute} data-testid="scene-walker" role="img" style={positionStyle(progress, "--walker-x")}>
          <span aria-hidden="true" className="scene-walker-shadow" />
          <img alt="" aria-hidden="true" src="./media/day-walk-walker-v2.webp" />
        </div>
      )}

      {viewingToday && <div aria-hidden="true" className="scene-now-pin" style={positionStyle(progress, "--now-x")}><i /><span>{formatMinute(minute)}</span></div>}

      {addMinute !== null && (
        <form className="scene-add-popover" onSubmit={submit} style={positionStyle(xOf(addMinute, bounds), "--add-x")}>
          <span aria-hidden="true" className="scene-add-flag"><i /><b /></span>
          <b>{formatMinute(addMinute)}에 깃발 꽂기</b>
          <input aria-label="이미지에서 일정 추가" maxLength={80} onChange={(event) => setTitle(event.target.value)} onKeyDown={(event) => { if (event.key === "Escape") setAddMinute(null); }} placeholder="할 일을 입력하세요" ref={input} value={title} />
          <button type="submit">추가</button>
        </form>
      )}

      <div className="scene-controls">
        {!hasTimedTasks ? <button onClick={onOpenRoutines} type="button">루틴 불러오기</button> : <span>현재 시간에 맞춰 천천히 진행 중</span>}
      </div>
    </div>
  );
}
