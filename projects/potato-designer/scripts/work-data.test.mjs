import test from 'node:test';
import assert from 'node:assert/strict';
import { works, findWork, filterWorks, validFavorites } from '../dist/work-data.js';

test('catalog IDs remain unique and detail content is complete', () => {
  assert.equal(new Set(works.map(work => work.id)).size, works.length);
  for (const work of works) {
    for (const field of ['title', 'category', 'summary', 'challenge', 'approach']) assert.ok(work[field]);
    assert.ok(work.deliverables.length);
    assert.equal(findWork(work.id), work);
  }
});
test('search handles Korean, case, surrounding whitespace, and multiple terms', () => {
  assert.deepEqual(filterWorks({ query: '  로고 ' }).map(work => work.id), ['brand']);
  assert.deepEqual(filterWorks({ query: 'DIGITAL 모션' }).map(work => work.id), ['digital']);
  assert.equal(filterWorks({ query: ' ' }).length, works.length);
});
test('category, query, and saved filters intersect rather than override each other', () => {
  assert.deepEqual(filterWorks({ category: 'digital', savedOnly: true, favorites: ['brand'] }), []);
  assert.deepEqual(filterWorks({ query: '캐릭터', savedOnly: true, favorites: ['character'] }).map(work => work.id), ['character']);
  assert.deepEqual(filterWorks({ query: '<script>not a work</script>' }), []);
});
test('stored favorites discard unknown IDs, duplicates, and malformed values', () => {
  assert.deepEqual(validFavorites(['brand', 'brand', 'unknown', null, {}, 'digital']), ['brand', 'digital']);
  for (const value of [null, {}, 'brand', 7]) assert.deepEqual(validFavorites(value), []);
  assert.equal(findWork('__proto__'), undefined);
});
