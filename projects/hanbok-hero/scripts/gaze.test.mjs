import test from 'node:test';
import assert from 'node:assert/strict';
import { gazeZone, cellIndex, ENTER, LEAVE } from '../dist/gaze.js';

test('정면·옆·범위 밖', () => {
  assert.deepEqual(gazeZone({ dx: 0, dy: 0, range: 100 }), { col: 0, row: 0 });
  assert.deepEqual(gazeZone({ dx: 100, dy: 0, range: 100 }), { col: 1, row: 0 });
  assert.deepEqual(gazeZone({ dx: -5000, dy: 5000, range: 100 }), { col: -1, row: 1 });
});
test('히스테리시스: 들어갈 때 0.38, 나올 때 0.28', () => {
  const range = 100;
  assert.equal(gazeZone({ dx: ENTER * range - 1, dy: 0, range }).col, 0);
  assert.equal(gazeZone({ dx: ENTER * range + 1, dy: 0, range }).col, 1);
  const prev = { col: 1, row: 0 };
  assert.equal(gazeZone({ dx: 30, dy: 0, range, prev }).col, 1, '0.3은 아직 유지');
  assert.equal(gazeZone({ dx: LEAVE * range - 1, dy: 0, range, prev }).col, 0, '0.28 아래면 정면');
  assert.equal(gazeZone({ dx: -ENTER * range - 1, dy: 0, range, prev }).col, -1, '반대편으로 바로 넘어감');
});
test('cellIndex는 가운데 칸 기준이고 1×1·2×2에서도 범위 안', () => {
  assert.deepEqual(cellIndex({ col: 1, row: -1 }, 3, 3), { col: 2, row: 0 });
  assert.deepEqual(cellIndex({ col: -1, row: 1 }, 1, 1), { col: 0, row: 0 });
  assert.deepEqual(cellIndex({ col: 1, row: 1 }, 2, 2), { col: 1, row: 1 });
  assert.deepEqual(cellIndex({ col: -1, row: -1 }, 2, 2), { col: 0, row: 0 });
});
