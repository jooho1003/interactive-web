import { useState } from "react";
import type { Segment, Task } from "../schema/index.js";

export function AddTask({ segment, add }: { segment: Segment; add(task: Task): void }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");
  const submit = () => {
    const value = title.trim();
    if (!value) return;
    add({ id: crypto.randomUUID(), title: value, slot: { kind: "segment", segment }, starred: false, done: false, createdAt: Date.now(), doneAt: null });
    setTitle("");
  };

  if (!editing) return <div className="add-task"><button onClick={() => setEditing(true)} type="button">+ 할 일 추가</button></div>;
  return (
    <div className="add-task">
      <input aria-label="할 일 제목" autoFocus onChange={(event) => setTitle(event.target.value)} onKeyDown={(event) => {
        if (event.key === "Enter") submit();
        if (event.key === "Escape") { setTitle(""); setEditing(false); }
      }} placeholder="할 일 제목" value={title} />
    </div>
  );
}
