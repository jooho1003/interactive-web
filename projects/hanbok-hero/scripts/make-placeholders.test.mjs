import test from 'node:test';
import assert from 'node:assert/strict';
import { png } from './make-placeholders.mjs';

test('png()는 서명·IHDR 크기·RGBA 타입을 쓴다', () => {
  const buf = png(3, 2, () => [1, 2, 3, 4]);
  assert.deepEqual([...buf.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  assert.equal(buf.readUInt32BE(16), 3);
  assert.equal(buf.readUInt32BE(20), 2);
  assert.equal(buf[24], 8);
  assert.equal(buf[25], 6);
  assert.equal(buf.subarray(buf.length - 8, buf.length - 4).toString('ascii'), 'IEND');
});
