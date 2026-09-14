export function ProgressBar({ done, total }: { done: number; total: number }) {
  const label = total ? `${Math.round(done / total * 100)}%` : "—";
  return <div className="progress-wrap"><div className="progress" data-testid="progress" aria-label={`진행률 ${label}`}><span style={{ width: total ? `${done / total * 100}%` : "0%" }} /></div><strong>{label}</strong></div>;
}
