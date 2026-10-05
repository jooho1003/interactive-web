import test from 'node:test';
import assert from 'node:assert/strict';
import { MOOD_KEY, openStorage, readMood, writeMood } from '../dist/moods.js';

const memory = (init = {}) => { const data = { ...init }; return { data, getItem: key => (key in data ? data[key] : null), setItem: (key, value) => { data[key] = String(value); } }; };
const blocked = { getItem() { throw new Error('SecurityError'); }, setItem() { throw new Error('QuotaExceededError'); } };
const ids = ['si', 'seo', 'hwa'];

test('저장된 분야는 장면 id일 때만 받는다', () => {
  assert.equal(readMood(memory({ [MOOD_KEY]: 'seo' }), ids), 'seo');
  assert.equal(readMood(memory({ [MOOD_KEY]: 'hero' }), ids), null);
  assert.equal(readMood(memory(), ids), null);
  assert.equal(readMood(null, ids), null);
});
test('저장소가 막혀도 예외 없이 null·false', () => {
  assert.equal(readMood(blocked, ids), null);
  assert.equal(writeMood(blocked, 'seo'), false);
  assert.equal(writeMood(null, 'seo'), false);
  assert.equal(openStorage(() => { throw new Error('SecurityError'); }), null);
});
test('쓰기 성공', () => {
  const storage = memory();
  assert.equal(writeMood(storage, 'hwa'), true);
  assert.equal(storage.data[MOOD_KEY], 'hwa');
});
