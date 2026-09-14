import { ProgressBar } from "./ProgressBar.js";

type Props = {
  date: string;
  today: string;
  done: number;
  total: number;
  onPrevious(): void;
  onNext(): void;
  onToday(): void;
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
  onOpenRoutines,
  onOpenSettings,
}: Props) {
  const shown = new Date(`${date}T00:00:00`);
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  const label = `${shown.getMonth() + 1}월 ${shown.getDate()}일 (${days[shown.getDay()]})${date === today ? " · 오늘" : ""}`;
  const mobileLabel = `${shown.getMonth() + 1}/${shown.getDate()} (${days[shown.getDay()]})`;

  return (
    <header className="header">
      <h1>Day Walk</h1>
      <div className="date-nav">
        <button aria-label="이전 날짜" onClick={onPrevious} type="button">‹</button>
        <button
          aria-label={label}
          className="today-button"
          data-testid="date-label"
          onClick={onToday}
          type="button"
        >
          <span className="date-long">{label}</span>
          <span className="date-short">
            {mobileLabel}
            {date === today && <i aria-label="오늘" className="today-dot" />}
          </span>
        </button>
        <button aria-label="다음 날짜" onClick={onNext} type="button">›</button>
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
