import { useEffect, useRef, useState } from "react";
import { applyRoutine } from "../domain/tasks.js";
import { useAppStore } from "../store/AppStore.js";
import { useToast } from "./Toast.js";

export function RoutineDialog({ open, onClose, opener }: {
  open: boolean;
  onClose(): void;
  opener: HTMLElement | null;
}) {
  const { data, dispatch, selectedDate, tasks } = useAppStore();
  const toast = useToast();
  const ref = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState("");
  useEffect(() => {
    const dialog = ref.current;
    if (open && dialog && !dialog.open) dialog.showModal();
    if (!open && dialog?.open) dialog.close();
  }, [open]);
  const close = () => {
    onClose();
    window.setTimeout(() => opener?.focus(), 0);
  };
  const save = () => {
    const clean = name.trim();
    if (!clean || !tasks.length) return;
    dispatch({
      type: "routine-save",
      routine: {
        id: crypto.randomUUID(),
        name: clean,
        tasks: tasks.map(({ title, slot, starred }) => ({ title, slot, starred })),
      },
    });
    setName("");
    toast("루틴으로 저장했어요");
  };
  return <dialog className="app-dialog" ref={ref} onClose={close}>
    <h2>루틴</h2>
    <ul className="routine-list">
      {data.routines.map((routine) => <li key={routine.id}>
        <span>{routine.name} · {routine.tasks.length}개</span>
        <button onClick={() => {
          const result = applyRoutine(tasks, routine, () => crypto.randomUUID(), Date.now());
          dispatch({ type: "routine-apply", date: selectedDate, routine, now: Date.now() });
          toast(`${result.added}개 추가, ${result.skipped}개는 이미 있어요`);
        }} type="button">오늘에 불러오기</button>
        <button onClick={() => dispatch({ type: "routine-delete", id: routine.id })} type="button">삭제</button>
      </li>)}
    </ul>
    <form className="routine-save" onSubmit={(event) => { event.preventDefault(); save(); }}>
      <label htmlFor="routine-name">현재 날짜의 할 일을 루틴으로 저장</label>
      <input id="routine-name" maxLength={40} onChange={(event) => setName(event.target.value)} value={name} />
      <button type="submit">저장</button>
    </form>
    <div className="dialog-actions"><button onClick={close} type="button">닫기</button></div>
  </dialog>;
}
