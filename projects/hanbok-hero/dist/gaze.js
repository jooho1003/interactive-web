// 포인터 → 시선 구역. DOM 없음. 축마다 ENTER를 넘어야 옆 칸, LEAVE 아래로 내려와야 정면(히스테리시스).
export const ENTER = 0.38;
export const LEAVE = 0.28;
export function axisZone(n, prev = 0, enter = ENTER, leave = LEAVE) {
  if (prev > 0) return n > leave ? 1 : n < -enter ? -1 : 0;
  if (prev < 0) return n < -leave ? -1 : n > enter ? 1 : 0;
  return n > enter ? 1 : n < -enter ? -1 : 0;
}
export function gazeZone({ dx, dy, range, prev = { col: 0, row: 0 } }) {
  const clamp = value => Math.max(-1, Math.min(1, value / range));
  return { col: axisZone(clamp(dx), prev.col), row: axisZone(clamp(dy), prev.row) };
}
export function cellIndex(zone, cols, rows) {
  const centerCol = Math.floor((cols - 1) / 2), centerRow = Math.floor((rows - 1) / 2);
  return {
    col: Math.max(0, Math.min(cols - 1, centerCol + zone.col)),
    row: Math.max(0, Math.min(rows - 1, centerRow + zone.row))
  };
}
