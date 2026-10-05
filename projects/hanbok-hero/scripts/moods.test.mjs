import test from 'node:test';
import assert from 'node:assert/strict';
import { MOOD_KEY, openStorage, readMood, writeMood, moodImages } from '../dist/moods.js';
import manifest from '../dist/layers.manifest.js';
import published from '../dist/layers.values.js';

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
test('매니페스트: 장면 3개와 분야 레이어', () => {
  assert.deepEqual(Object.keys(manifest.scenes), ['si', 'seo', 'hwa']);
  assert.equal(manifest.initialScene, 'si');
  for (const id of ['glyph', 'moods', 'credit']) assert.ok(manifest.layers.some(layer => layer.id === id), id);
  assert.deepEqual(['si', 'seo', 'hwa'].map(id => manifest.scenes[id].set.glyph.text), ['詩', '書', '畫']);
  assert.deepEqual(['si', 'seo', 'hwa'].map(id => manifest.scenes[id].set.global.accent), ['#b9c7d6', '#e8866b', '#93c9b8']);
});
test('빈 메뉴·작품 보기는 게시값으로 숨김', () => {
  assert.equal(published.base.nav.visible, false);
  assert.equal(published.base.cta.visible, false);
});
test('분야별 배경 주소: 장면마다 다른 그림 3장', () => {
  assert.deepEqual(moodImages(manifest, published, []), ['./assets/mood-si.webp', './assets/mood-seo.webp', './assets/mood-hwa.webp']);
});
