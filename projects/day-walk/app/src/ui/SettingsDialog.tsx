import { useEffect, useRef, useState } from "react";
import { clampBounds, DEFAULT_BOUNDS, formatMinuteWithDay } from "../domain/time.js";
import { AppData, type DayBounds, type Settings } from "../schema/index.js";
import { defaultAppData } from "../store/storage.js";
import { useAppStore } from "../store/AppStore.js";
import { ConfirmDialog } from "./ConfirmDialog.js";
import { useToast } from "./Toast.js";

function timeValue(minute: number) {
  return String(Math.floor((minute % 1440) / 60)).padStart(2, "0") + ":" + String(minute % 60).padStart(2, "0");
}

function toMinute(value: string, nextDay: boolean) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes + (nextDay ? 1440 : 0);
}

export function SettingsDialog({ open, onClose, opener }: {
  open: boolean;
  onClose(): void;
  opener: HTMLElement | null;
}) {
  const { data, dispatch, selectedDate } = useAppStore();
  const toast = useToast();
  const ref = useRef<HTMLDialogElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const confirmOpener = useRef<HTMLElement | null>(null);
  const [confirm, setConfirm] = useState<"clear" | "import" | null>(null);
  const [incoming, setIncoming] = useState<typeof data | null>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (open && dialog && !dialog.open) dialog.showModal();
    if (!open && dialog?.open) dialog.close();
  }, [open]);
  const restoreFocus = () => {
    window.setTimeout(() => opener?.focus(), 0);
  };

  const handleClose = () => {
    onClose();
    restoreFocus();
  };

  const close = () => {
    ref.current?.close();
  };
  const update = (changes: Partial<Settings>) => {
    dispatch({ type: "settings", settings: { ...data.settings, ...changes } });
  };
  const updateBounds = (key: keyof DayBounds, value: number) => {
    update({ bounds: clampBounds({ ...data.settings.bounds, [key]: value }) });
  };
  const enableNotifications = async (checked: boolean) => {
    update({ notifications: checked });
    if (checked && "Notification" in window) await Notification.requestPermission();
  };
  const download = () => {
    const blob = new Blob([JSON.stringify({ format: "day-walk-v1", data })], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `day-walk-${selectedDate}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };
  const readImport = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > 1024 * 1024) return toast("파일이 1MB보다 커서 가져올 수 없어요");
    try {
      const value: unknown = JSON.parse(await file.text());
      const wrapped = value as { format?: string; data?: unknown };
      if (wrapped.format !== "day-walk-v1") return toast("Day Walk 데이터 파일이 아니에요");
      const parsed = AppData.safeParse(wrapped.data);
      if (!parsed.success) return toast("Day Walk 데이터 파일이 아니에요");
      setIncoming(parsed.data);
      setConfirm("import");
    } catch {
      toast("파일을 읽을 수 없어요");
    }
  };
  const nextDay = data.settings.bounds.dayEnd >= 1440;
  const fallback = !data.settings.notifications || !("Notification" in window) || Notification.permission !== "granted";
  return <>
    <dialog
      className="app-dialog settings-dialog"
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      onClose={handleClose}
      ref={ref}
    >
      <h2>설정</h2>
      <fieldset><legend>하루 구간</legend>
        {(["dayStart", "morningEnd", "afternoonEnd", "dayEnd"] as const).map((key) => <label key={key}>
          {key === "dayStart" ? "시작" : key === "morningEnd" ? "아침 마감" : key === "afternoonEnd" ? "점심 마감" : "저녁 마감"}
          <input onChange={(event) => updateBounds(key, toMinute(event.target.value, key === "dayEnd" && (nextDay || event.target.value <= "04:00")))} step="900" type="time" value={timeValue(data.settings.bounds[key])} />
          {key === "dayEnd" && <small>{formatMinuteWithDay(data.settings.bounds.dayEnd)}</small>}
        </label>)}
        <button onClick={() => update({ bounds: DEFAULT_BOUNDS })} type="button">기본값으로</button>
      </fieldset>
      <fieldset><legend>동네</legend>
        <label><input checked={data.settings.showCharacter} onChange={(event) => update({ showCharacter: event.target.checked })} type="checkbox" />캐릭터 표시</label>
        <label><input checked={data.settings.showAdvisor} onChange={(event) => update({ showAdvisor: event.target.checked })} type="checkbox" />새 조언 표시</label>
        <label><input checked={data.settings.sound} onChange={(event) => update({ sound: event.target.checked })} type="checkbox" />효과음</label>
        <label>움직임<select onChange={(event) => update({ motion: event.target.value as Settings["motion"] })} value={data.settings.motion}><option value="system">시스템</option><option value="reduce">줄이기</option><option value="full">전부</option></select></label>
      </fieldset>
      <fieldset><legend>알림</legend>
        <label><input checked={data.settings.notifications} onChange={(event) => void enableNotifications(event.target.checked)} type="checkbox" />알림 켜기</label>
        {fallback && data.settings.notifications && <p>브라우저 알림이 꺼져 있어 화면 안에 표시해요</p>}
      </fieldset>
      <fieldset><legend>데이터</legend>
        <button onClick={download} type="button">내보내기</button>
        <button onClick={(event) => {
          confirmOpener.current = event.currentTarget;
          fileRef.current?.click();
        }} type="button">가져오기</button>
        <input accept="application/json" className="sr-only" data-testid="import-file" onChange={(event) => void readImport(event.target.files?.[0])} ref={fileRef} type="file" />
        <button onClick={(event) => {
          confirmOpener.current = event.currentTarget;
          setConfirm("clear");
        }} type="button">모든 데이터 지우기</button>
      </fieldset>
      <div className="dialog-actions"><button onClick={close} type="button">닫기</button></div>
    </dialog>
    <ConfirmDialog
      message={confirm === "clear" ? "저장된 모든 데이터를 지웁니다." : "현재 데이터를 모두 바꿉니다."}
      onCancel={() => setConfirm(null)}
      onConfirm={() => {
        dispatch({ type: "replace-all", data: confirm === "clear" ? defaultAppData() : incoming ?? data });
        setConfirm(null);
        toast(confirm === "clear" ? "모든 데이터를 지웠어요" : "데이터를 가져왔어요");
      }}
      open={confirm !== null}
      opener={confirmOpener.current}
      title="정말 진행할까요?"
    />
  </>;
}
