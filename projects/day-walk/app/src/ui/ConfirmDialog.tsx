import { useEffect, useRef } from "react";

export function ConfirmDialog({ open, title, message, onCancel, onConfirm }: {
  open: boolean;
  title: string;
  message: string;
  opener: HTMLElement | null;
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
  const restoreFocus = () => {
    window.setTimeout(() => opener?.focus(), 0);
  };

  const handleClose = () => {
    onCancel();
    restoreFocus();
  };

  const close = () => {
    ref.current?.close();
  };

  return <dialog
    className="app-dialog confirm-dialog"
    onCancel={(event) => {
      event.preventDefault();
      close();
    }}
    onClose={handleClose}
    ref={ref}
  >
    <h2>{title}</h2>
    <p>{message}</p>
    <div className="dialog-actions">
      <button onClick={close} type="button">취소</button>
      <button onClick={() => {
        onConfirm();
        close();
      }} type="button">확인</button>
    </div>
  </dialog>;
}
