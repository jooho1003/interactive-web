import { ProgressBar } from "./ProgressBar.js";
export function Header({ date, today, done, total, onPrevious, onNext, onToday }: { date: string; today: string; done: number; total: number; onPrevious(): void; onNext(): void; onToday(): void }) {
  const shown = new Date(`${date}T00:00:00`);
  const label = `${shown.getMonth() + 1}월 ${shown.getDate()}일 (${["일", "월", "화", "수", "목", "금", "토"][shown.getDay()]})${date === today ? " · 오늘" : ""}`;
  return <header className="header"><h1>Day Walk</h1><div className="date-nav"><button onClick={onPrevious} aria-label="이전 날짜">‹</button><button onClick={onToday}>{label}</button><button onClick={onNext} aria-label="다음 날짜">›</button></div><ProgressBar done={done} total={total} /><button type="button">루틴</button><button type="button" aria-label="설정">⚙</button></header>;
}
