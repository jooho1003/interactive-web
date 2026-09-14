import { useEffect, useRef } from "react";

export function ConfirmDialog({ open, title, message, onCancel, onConfirm }: {
  open: boolean;
  title: string;
  message: string;
  onCancel(): void;
  onConfirm(): void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);
  return <dialog className="app-dialog confirm-dialog" ref={ref} onClose={onCancel}>
    <h2>{title}</h2>
    <p>{message}</p>
    <div className="dialog-actions">
      <button onClick={onCancel} type="button">취소</button>
      <button onClick={onConfirm} type="button">확인</button>
    </div>
  </dialog>;
}
