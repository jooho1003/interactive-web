import { useId, useRef, useState } from "react";
import { formatMinute, formatMinuteWithDay, parseTimeInput } from "../domain/time.js";

type Props = { value: number | null; min: number; max: number; label: string; onCommit(minute: number): void };
export function TimeField({ value, min, max, label, onCommit }: Props) {
  const [draft, setDraft] = useState<string | null>(null);
  const [invalid, setInvalid] = useState(false);
  const id = useId();
  const canceled = useRef(false);
  const commit = () => {
    if (draft === null) return;
    if (!draft.trim()) { setDraft(null); setInvalid(false); return; }
    const minute = parseTimeInput(draft, min, max);
    if (minute === null) { setInvalid(true); return; }
    setDraft(null);
    setInvalid(false);
    if (minute !== value) onCommit(minute);
  };
  return <span className={`time-field ${invalid ? "is-invalid" : ""}`}>
    <input aria-describedby={invalid ? id : undefined} aria-invalid={invalid || undefined} aria-label={label} autoComplete="off" inputMode="numeric" maxLength={5}
      onBlur={() => { if (canceled.current) canceled.current = false; else commit(); }} onChange={(event) => { setDraft(event.target.value); setInvalid(false); }} onFocus={(event) => event.currentTarget.select()}
      onKeyDown={(event) => {
        if (event.key === "Enter") { event.preventDefault(); commit(); }
        if (event.key === "Escape") { event.preventDefault(); canceled.current = true; setDraft(null); setInvalid(false); event.currentTarget.blur(); }
      }} placeholder="시각 지정" title="시각을 입력하고 Enter · 예: 14:20" type="text" value={draft ?? (value === null ? "" : formatMinute(value))} />
    {value !== null && value >= 1440 && <small className="time-next-day">+1</small>}
    {invalid && <span className="time-field-error" id={id} role="alert">{formatMinuteWithDay(min)}–{formatMinuteWithDay(max)} 사이 시각을 입력해 주세요.</span>}
  </span>;
}
