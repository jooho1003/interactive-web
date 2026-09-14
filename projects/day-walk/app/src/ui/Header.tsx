import { useEffect, useRef, useState } from "react";
import { ProgressBar } from "./ProgressBar.js";
import { DatePicker } from "./DatePicker.js";

type Props = {
  date: string;
  today: string;
  done: number;
  total: number;
  onPrevious(): void;
  onNext(): void;
  onToday(): void;
  onSelectDate(date: string): void;
  onOpenRoutines(element: HTMLElement): void;
  onOpenSettings(element: HTMLElement): void;
};

export function Header({
  date,
  today,
  done,
  total,
  onPrevious,
  onNext,
  onToday,
  onSelectDate,
  onOpenRoutines,
  onOpenSettings,
}: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const picker = useRef<HTMLDivElement>(null);
  const dateButton = useRef<HTMLButtonElement>(null);
  const closePicker = () => { setPickerOpen(false); dateButton.current?.focus(); };
  const shown = new Date(`${date}T00:00:00`);
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  const label = `${shown.getMonth() + 1}월 ${shown.getDate()}일 (${days[shown.getDay()]})${date === today ? " · 오늘" : ""}`;
  const mobileLabel = `${shown.getMonth() + 1}/${shown.getDate()} (${days[shown.getDay()]})`;

  useEffect(() => {
    if (!pickerOpen) return;
    const close = (event: PointerEvent) => {
      if (!picker.current?.contains(event.target as Node)) setPickerOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [pickerOpen]);

  return (
    <header className="header">
      <h1>Day Walk</h1>
      <div className="date-nav" ref={picker}>
        <button aria-label="이전 날짜" onClick={() => { setPickerOpen(false); onPrevious(); }} type="button">‹</button>
        <button
          aria-label={label}
          className="today-button"
          data-testid="date-label"
          ref={dateButton}
          aria-expanded={pickerOpen}
          aria-haspopup="dialog"
          onClick={() => setPickerOpen((open) => !open)}
          type="button"
        >
          <span className="date-long">{label}</span>
          <span className="date-short">
            {mobileLabel}
            {date === today && <i aria-label="오늘" className="today-dot" />}
          </span>
        </button>
        <button aria-label="다음 날짜" onClick={() => { setPickerOpen(false); onNext(); }} type="button">›</button>
        {pickerOpen && <DatePicker date={date} onClose={closePicker} onSelect={(value) => value === today ? onToday() : onSelectDate(value)} today={today} />}
      </div>
      <ProgressBar done={done} total={total} />
      <button
        aria-label="루틴"
        data-testid="header-routines"
        onClick={(event) => onOpenRoutines(event.currentTarget)}
        type="button"
      >
        <span aria-hidden="true">☰</span>
        <span className="routine-label"> 루틴</span>
      </button>
      <button
        aria-label="설정"
        data-testid="header-settings"
        onClick={(event) => onOpenSettings(event.currentTarget)}
        type="button"
      >
        ⚙
      </button>
    </header>
  );
}
