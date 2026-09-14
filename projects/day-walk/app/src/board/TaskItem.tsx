import { useState, type CSSProperties } from "react";
import { playDone } from "../audio/sfx.js";
import type { TaskAction } from "../domain/tasks.js";
import { formatMinute } from "../domain/time.js";
import type { DayBounds, Task } from "../schema/index.js";
import { useAppStore } from "../store/AppStore.js";
import { useToast } from "../ui/Toast.js";

export function TaskItem({ task, bounds, overdue }: { task: Task; bounds: DayBounds; overdue: boolean }) {
  const { data, dispatch, selectedDate } = useAppStore();
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [burst, setBurst] = useState(false);
  const act = (action: TaskAction) => dispatch({ type: "tasks", date: selectedDate, action });
  const toggleDone = () => {
    const completing = !task.done;
    act({ type: "toggle-done", id: task.id, now: Date.now() });
    if (!completing) return;
    setBurst(true);
    window.setTimeout(() => setBurst(false), 600);
    if (data.settings.sound) playDone();
  };
  const finishRename = () => {
    if (title.trim()) act({ type: "rename", id: task.id, title: title.trim() });
    setEditing(false);
  };
  return (
    <li className={`task ${task.done ? "done" : ""}`} data-testid="task-item" id={`task-${task.id}`} tabIndex={-1}>
      <span className="check-wrap">
        <input aria-label={`${task.title} 완료`} checked={task.done} onChange={toggleDone} type="checkbox" />
        {burst && <span aria-hidden="true" className="particle-burst">{Array.from({ length: 12 }, (_, index) => <i key={index} style={{ "--particle-index": index } as CSSProperties} />)}</span>}
      </span>
      <button aria-label="중요 표시" aria-pressed={task.starred} className="star" onClick={() => act({ type: "toggle-star", id: task.id })} type="button">{task.starred ? "★" : "☆"}</button>
      {task.slot.kind === "time" && <span className="time-chip">{formatMinute(task.slot.minute)}</span>}
      {editing ? <input autoFocus onBlur={finishRename} onChange={(event) => setTitle(event.target.value)} value={title} /> : <span className="task-title" onDoubleClick={() => setEditing(true)}>{task.title}</span>}
      {overdue && !task.done && <em>지남</em>}
      <details>
        <summary aria-label="할 일 메뉴">⋯</summary>
        <button onClick={() => setEditing(true)} type="button">이름 바꾸기</button>
        {task.slot.kind === "time" ? <button onClick={() => act({ type: "clear-time", id: task.id, bounds })} type="button">시각 없애기</button> : <button onClick={() => act({ type: "move-segment", id: task.id, segment: "morning" })} type="button">아침으로</button>}
        <button onClick={() => { act({ type: "delete", id: task.id }); toast("삭제했어요", { label: "되돌리기", run: () => act({ type: "restore", task }) }); }} type="button">삭제</button>
      </details>
    </li>
  );
}
