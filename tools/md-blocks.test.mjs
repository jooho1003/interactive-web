import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseBlocks, splitDoc, makeInline, plain } from './md-blocks.mjs';

test('parseBlocks: 코드 펜스 속성, 표 구분선, 목록, 여러 줄 문단', () => {
  const md = ['```text id=style with=base', 'a < b', '```', '', '| 항목 | 내용 |', '|---|---|', '| 주소 | https://x.test/ |', '', '- 하나', '- 둘', '', '첫 줄', '둘째 줄'].join('\n');
  assert.deepEqual(parseBlocks(md), [
    { type: 'code', lang: 'text', attrs: { id: 'style', with: 'base' }, text: 'a < b' },
    { type: 'table', head: ['항목', '내용'], rows: [['주소', 'https://x.test/']] },
    { type: 'list', ordered: false, items: ['하나', '둘'] },
    { type: 'para', text: '첫 줄\n둘째 줄' },
  ]);
});

test('splitDoc: 제목, 머리말, ## 절과 ### 카드', () => {
  const doc = splitDoc('# 제목\n\n머리말\n\n## 절\n\n본문\n\n### 카드\n\n카드 본문\n');
  assert.equal(doc.title, '제목');
  assert.deepEqual(doc.intro, [{ type: 'para', text: '머리말' }]);
  assert.deepEqual(doc.parts.map((p) => [p.kind, p.title]), [['section', '절'], ['card', '카드']]);
});

test('makeInline: 이스케이프, 서식, 링크·미디어 훅', () => {
  const inline = makeInline({
    link: (url) => (url.startsWith('http') ? { href: url, external: true } : { text: url }),
    media: (rel) => `m/${rel}`,
  });
  assert.equal(
    inline('<b> `x` **굵게** [밖](https://a.test/) [안](../x.md) <img src="p.webp" width="90"> ~~끝~~\n다음', {}),
    '&lt;b&gt; <code>x</code> <strong>굵게</strong> <a href="https://a.test/" target="_blank" rel="noopener">밖</a> <span class="path" title="저장소 경로">안</span> <img src="m/p.webp" alt="" loading="lazy"> <s>끝</s> 다음',
  );
});

test('plain: 서식 제거', () => {
  assert.equal(plain('`id` **굵게** [글](https://a.test/) <img src="x">'), 'id 굵게 글');
});
