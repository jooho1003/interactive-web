import test from 'node:test';
import assert from 'node:assert/strict';
import { targetCell, centerCell, approach, snap, HYSTERESIS } from '../dist/gaze.js';

test('포인터 → 칸 좌표: 가운데·양 끝·범위 밖', () => {
  assert.deepEqual(targetCell({ dx: 0, dy: 0, range: 100, cols: 13, rows: 2 }), { x: 6, y: 0.5 });
  assert.deepEqual(targetCell({ dx: -100, dy: 100, range: 100, cols: 13, rows: 2 }), { x: 0, y: 1 });
  assert.deepEqual(targetCell({ dx: 5000, dy: -5000, range: 100, cols: 13, rows: 2 }), { x: 12, y: 0 });
  assert.deepEqual(targetCell({ dx: 50, dy: 0, range: 100, cols: 3, rows: 3 }), { x: 1.5, y: 1 });
});
test('쉬는 칸은 정면 그림과 같은 칸: 2행이면 아래 행 가운데, 1×1이면 0', () => {
  assert.deepEqual(centerCell(13, 2), { x: 6, y: 1 });
  assert.deepEqual(centerCell(3, 3), { x: 1, y: 1 });
  assert.deepEqual(centerCell(1, 1), { x: 0, y: 0 });
});
test('지수 감쇠: tau 0이면 바로, 아니면 조금씩 다가가고 넘치지 않는다', () => {
  assert.equal(approach(0, 10, 16, 0), 10);
  const step = approach(0, 10, 16, 110);
  assert.ok(step > 0 && step < 10);
  let value = 0;
  for (let i = 0; i < 200; i++) value = approach(value, 10, 16, 110);
  assert.ok(Math.abs(value - 10) < 1e-6 && value <= 10);
});
test('칸 경계 히스테리시스: 0.5 + HYSTERESIS를 넘어야 옆 칸', () => {
  assert.equal(snap(6.4, -1, 13), 6, '처음에는 반올림');
  assert.equal(snap(6.5 + HYSTERESIS - 0.01, 6, 13), 6, '경계 근처에서는 유지');
  assert.equal(snap(6.5 + HYSTERESIS + 0.01, 6, 13), 7, '넘으면 옆 칸');
  assert.equal(snap(6.9, 7, 13), 7);
  assert.equal(snap(20, 3, 13), 12, '범위 밖은 끝 칸');
  assert.equal(snap(2, 9, 3), 2, '칸 수가 줄면 지금 칸을 버리고 다시 자른다');
});
