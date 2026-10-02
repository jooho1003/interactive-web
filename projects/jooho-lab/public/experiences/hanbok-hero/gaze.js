// 포인터 → 얼굴 칸. DOM 없음. 칸 좌표는 연속값(x: 0..cols-1, y: 0..rows-1)으로 다루고 보여 줄 때만 정수로 자른다.
// layer-fixed: 칸 경계 히스테리시스는 입력 안정성 상수. 파라미터로 열면 경계에서 떨림 방지 보증이 깨진다
export const HYSTERESIS = 0.15;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

// 쉬는 칸 = 정면 그림과 같은 칸. 가로 가운데, 세로는 가운데(짝수 행이면 아래쪽 가운데 — 위 행은 위를 볼 때만).
export function centerCell(cols, rows) { return { x: (cols - 1) / 2, y: Math.ceil((rows - 1) / 2) }; }

// 기준점에서 포인터까지(dx, dy)를 칸 좌표로. ±range가 양 끝 칸, range 밖은 가장 바깥 칸.
export function targetCell({ dx, dy, range, cols, rows }) {
  const nx = clamp(dx / range, -1, 1), ny = clamp(dy / range, -1, 1);
  return { x: (nx + 1) / 2 * (cols - 1), y: (ny + 1) / 2 * (rows - 1) };
}

// 지수 감쇠로 목표에 다가간다. tau(ms)가 0이면 바로 목표.
export function approach(current, target, dt, tau) {
  if (!(tau > 0)) return target;
  return current + (target - current) * (1 - Math.exp(-dt / tau));
}

// 연속 좌표 → 보여 줄 칸. 지금 칸에서 0.5 + HYSTERESIS 넘게 벗어나야 바꾼다.
export function snap(value, shown, count) {
  const max = count - 1;
  if (shown >= 0 && shown <= max && Math.abs(value - shown) <= 0.5 + HYSTERESIS) return shown;
  return clamp(Math.round(value), 0, max);
}

