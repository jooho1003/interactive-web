import test from 'node:test';
import assert from 'node:assert/strict';
import { png, cell } from './make-placeholders.mjs';

test('png()는 서명·IHDR 크기·RGBA 타입을 쓴다', () => {
  const buf = png(3, 2, () => [1, 2, 3, 4]);
  assert.deepEqual([...buf.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  assert.equal(buf.readUInt32BE(16), 3);
  assert.equal(buf.readUInt32BE(20), 2);
  assert.equal(buf[24], 8);
  assert.equal(buf[25], 6);
  assert.equal(buf.subarray(buf.length - 8, buf.length - 4).toString('ascii'), 'IEND');
});

test('cell()의 눈동자는 look.col에 따라 위치가 다르다', () => {
  const size = 256;
  const leftEye = cell(size, { col: -1, row: 0 });
  const rightEye = cell(size, { col: 1, row: 0 });
  // 샘플 좌표: 좌안의 눈동자 위치
  const x = size / 2 - size * 0.13 - size * 0.04;
  const y = size / 2 - size * 0.05;
  const pixelLeft = leftEye(x, y);
  const pixelRight = rightEye(x, y);
  // col:-1일 때 이 좌표에서 어두운 픽셀(눈동자), col:1일 때 피부색 또는 투명
  assert.deepEqual(pixelLeft, [40, 30, 30, 255], 'col:-1에서 눈동자 픽셀');
  assert.notDeepEqual(pixelRight, [40, 30, 30, 255], 'col:1에서 눈동자 없음');
});
