import { useRef, useState } from "react";
import { dateKey } from "../domain/time.js";

type Props = { date: string; today: string; onSelect(date: string): void; onClose(): void };
const weekdays = ["일", "월", "화", "수", "목", "금", "토"];

export function DatePicker({ date, today, onSelect, onClose }: Props) {
  const [month, setMonth] = useState(() => new Date(`${date.slice(0, 7)}-01T00:00:00`));
  const grid = useRef<HTMLDivElement>(null);
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstWeekday = new Date(year, monthIndex, 1).getDay();
  const count = new Date(year, monthIndex + 1, 0).getDate();
  const select = (value: string) => { onSelect(value); onClose(); };
  const changeMonth = (amount: number) => setMonth(new Date(year, monthIndex + amount, 1));

  return <div aria-label="날짜 선택" className="date-picker-popover" onKeyDown={(event) => {
    if (event.key === "Escape") { event.stopPropagation(); onClose(); }
  }} role="dialog">
    <div className="calendar-toolbar">
      <button aria-label="이전 달" onClick={() => changeMonth(-1)} type="button">‹</button>
      <label><span className="sr-only">연도</span><input aria-label="연도" max={9999} min={1} onChange={(event) => {
        const value = Number(event.target.value);
        if (value >= 1 && value <= 9999) setMonth(new Date(`${String(value).padStart(4, "0")}-${String(monthIndex + 1).padStart(2, "0")}-01T00:00:00`));
      }} type="number" value={year} /></label>
      <select aria-label="월" onChange={(event) => setMonth(new Date(year, Number(event.target.value), 1))} value={monthIndex}>
        {Array.from({ length: 12 }, (_, index) => <option key={index} value={index}>{index + 1}월</option>)}
      </select>
      <button aria-label="다음 달" onClick={() => changeMonth(1)} type="button">›</button>
    </div>
    <div aria-hidden="true" className="calendar-weekdays">{weekdays.map((day) => <span key={day}>{day}</span>)}</div>
    <div aria-label={`${year}년 ${monthIndex + 1}월`} className="calendar-grid" ref={grid}>
      {Array.from({ length: firstWeekday }, (_, index) => <span key={`space-${index}`} />)}
      {Array.from({ length: count }, (_, index) => {
        const day = index + 1;
        const key = dateKey(new Date(year, monthIndex, day));
        return <button aria-current={key === today ? "date" : undefined} aria-label={`${year}년 ${monthIndex + 1}월 ${day}일`} aria-pressed={key === date} autoFocus={key === date} key={key} onClick={() => select(key)} onKeyDown={(event) => {
          const offset = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[event.key];
          if (offset === undefined) return;
          event.preventDefault();
          const next = day - 1 + offset;
          grid.current?.querySelectorAll<HTMLButtonElement>("button")[Math.max(0, Math.min(count - 1, next))]?.focus();
        }} type="button">{day}</button>;
      })}
    </div>
    <div className="calendar-footer"><span>{date.replaceAll("-", ".")}</span><button onClick={() => select(today)} type="button">오늘로 이동</button></div>
  </div>;
}
