import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseSiteDoc, parsePatterns, validate, toCatalog, summary, families } from './model.mjs';
import { renderPage } from './gallery.mjs';
import { splitDoc } from '../tools/md-blocks.mjs';

const card = ({ id = 'alpha', url = 'https://www.alpha.test/', check = '✅ 2026-10-01 · 1440px, 390px · Aside', pattern = '`desktop-os`', image = true, second = false } = {}) => `### ${id} · Alpha Studio — 창처럼 여는 포트폴리오

${image ? `<img src="media/${id}/desk.webp" width="360">${second ? ` <img src="media/${id}/state.webp" width="360">` : ''}\n\n` : ''}| 항목 | 내용 |
|---|---|
| 주소 | ${url} |
| 출처 | @curator 큐레이션 · 가져온 날 2026-09-30 |
| 노션 | \`3ead12f2325581b699abdaa10d99e0a4\` |
| 확인 | ${check} |
| 패턴 | ${pattern} |
| 패밀리 | D에 가까움, A' |
| 기술 흔적 | (추정) WebGL, GSAP |
| 쓰인 작품 | — |

**무엇이 다른가** — 작업을 창으로 연다.

**가져올 것** — 익숙한 창 조작으로
탐색하기

**안 가져올 것** — 모바일에서도 창을 겹치는 배치

[녹화](media/${id}/walk.webm)
`;
const doc = (...cards) => `# 테스트 출처\n\n머리말\n\n${cards.join('\n')}`;
const PATTERNS = `# 패턴 색인

머리말

### \`desktop-os\` — 데스크톱 OS 은유

작업을 창으로 연다.

| 항목 | 내용 |
|---|---|
| 맞는 의뢰 | 작업이 많은 포트폴리오 |
| 패밀리 | D에 가까움 |
| 레이어 대응 | 창 프레임 |
| 검수할 점 | Escape로 닫기 |
`;
const reason = (errors) => errors.map((e) => e.slice(e.indexOf('": ') + 3));

test('parseSiteDoc: 카드 항목을 읽는다', () => {
  const { sites, errors } = parseSiteDoc('alpha.md', doc(card()));
  assert.deepEqual(errors, []);
  const { part, ...s } = sites[0];
  assert.deepEqual(s, {
    id: 'alpha', name: 'Alpha Studio', tagline: '창처럼 여는 포트폴리오', file: 'alpha.md', anchor: 'site-alpha',
    url: 'https://www.alpha.test/', via: '@curator 큐레이션', importedAt: '2026-09-30',
    notion: ['3ead12f2-3255-81b6-99ab-daa10d99e0a4'],
    check: { status: 'ok', date: '2026-10-01' },
    patterns: ['desktop-os'], families: ['D', "A'"], tech: ['(추정) WebGL, GSAP'], usedIn: [],
    image: 'media/alpha/desk.webp', images: ['media/alpha/desk.webp'], video: 'media/alpha/walk.webm',
    take: '익숙한 창 조작으로\n탐색하기', avoid: '모바일에서도 창을 겹치는 배치',
  });
});

test('parseSiteDoc·validate: 한 줄의 <img> 여러 장을 순서대로 읽고 모두 검사한다', () => {
  const { sites, errors } = parseSiteDoc('alpha.md', doc(card({ second: true })));
  assert.deepEqual(errors, []);
  assert.deepEqual(sites[0].images, ['media/alpha/desk.webp', 'media/alpha/state.webp']);
  assert.equal(sites[0].image, 'media/alpha/desk.webp');
  assert.deepEqual(validate(sites, parsePatterns('patterns.md', PATTERNS).patterns, () => false), [
    'alpha.md alpha: 미디어 파일 없음 media/alpha/desk.webp',
    'alpha.md alpha: 미디어 파일 없음 media/alpha/state.webp',
    'alpha.md alpha: 미디어 파일 없음 media/alpha/walk.webm',
  ]);
});

test('parseSiteDoc: 백틱 속 태그는 tech·summary에 남고, 기술 흔적은 나누지 않는다', () => {
  const md = doc(card()).replace('(추정) WebGL, GSAP', '`<canvas>` 1개, 번들(`three`, `gsap`)').replace('**가져올 것** — 익숙한 창 조작으로\n탐색하기', '**가져올 것** — `<video>` 루프');
  const { sites, errors } = parseSiteDoc('alpha.md', md);
  assert.deepEqual(errors, []);
  assert.deepEqual(sites[0].tech, ['<canvas> 1개, 번들(three, gsap)']);
  assert.ok(summary(sites[0]).includes('가져올 것: <video> 루프'));
});

test('parseSiteDoc: 주소 칸의 백틱·굵게는 주소에 딸려 오지 않는다', () => {
  const { sites } = parseSiteDoc('alpha.md', doc(card({ url: '`https://www.alpha.test/`' })));
  assert.equal(sites[0].url, 'https://www.alpha.test/');
  assert.equal(parseSiteDoc('alpha.md', doc(card({ url: '**https://www.alpha.test/**' }))).sites[0].url, 'https://www.alpha.test/');
});

test('parseSiteDoc: 빈 줄로 나뉜 이미지 문단이 둘이어도 모두 읽는다', () => {
  const md = doc(card()).replace('<img src="media/alpha/desk.webp" width="360">', '<img src="media/alpha/desk.webp" width="360">\n\n<img src="media/alpha/state.webp" width="360">');
  const { sites } = parseSiteDoc('alpha.md', md);
  assert.deepEqual(sites[0].images, ['media/alpha/desk.webp', 'media/alpha/state.webp']);
});

test('parseSiteDoc: 필수 항목이 빠지면 항목마다 오류', () => {
  const { errors } = parseSiteDoc('bad.md', '# x\n\n### beta · Beta\n\n| 항목 | 내용 |\n|---|---|\n| 주소 | 없음 |\n');
  assert.deepEqual(reason(errors), [
    '주소가 없거나 http(s) 주소가 아님',
    '출처가 비어 있음',
    '확인은 "✅ 날짜", "⏸", "⚠️ 날짜" 중 하나로 시작',
    '패턴이 없음 (`id` 형식)',
    "패밀리는 A / A' / B / D / E / 새 패턴 중 하나 이상",
    '"**가져올 것** — …" 문단이 비어 있음',
    '"**안 가져올 것** — …" 문단이 비어 있음',
  ]);
});

test('parseSiteDoc: id 형식, ✅에는 날짜와 캡처', () => {
  const { errors } = parseSiteDoc('x.md', doc(card({ id: 'Bad', check: '✅', image: false })));
  assert.deepEqual(reason(errors), [
    '제목은 "id · 이름 — 한 줄 성격", id는 영문 소문자·숫자·하이픈',
    '확인 ✅에는 날짜가 필요함',
    '✅ 카드에는 캡처(<img src="media/…">)가 있어야 함',
  ]);
});

test('parseSiteDoc: CRLF, 변형 선택자 없는 ⚠, 백틱 없는 패턴', () => {
  const down = parseSiteDoc('w.md', doc(card({ check: '⚠ 2026-10-02' })).replace(/\n/g, '\r\n'));
  assert.deepEqual(down.errors, []);
  assert.equal(down.sites[0].id, 'alpha');
  assert.deepEqual(down.sites[0].check, { status: 'down', date: '2026-10-02' });
  const noTick = parseSiteDoc('p.md', doc(card({ pattern: 'desktop-os' })));
  assert.deepEqual(reason(noTick.errors), ['패턴이 없음 (`id` 형식)']);
});

test('parsePatterns: 제목 형식과 패밀리', () => {
  const ok = parsePatterns('patterns.md', PATTERNS);
  assert.deepEqual(ok.errors, []);
  assert.deepEqual(ok.patterns.map(({ part, ...p }) => p), [{ id: 'desktop-os', name: '데스크톱 OS 은유', anchor: 'pattern-desktop-os', families: ['D'] }]);
  const bad = parsePatterns('patterns.md', '# x\n\n### desktop-os — 백틱 없음\n');
  assert.deepEqual(bad.errors, ['patterns.md "desktop-os — 백틱 없음": 제목은 "`id` — 이름" 형식']);
});

test("families: 숫자가 붙은 토큰은 무시하고 굽은 따옴표 A'는 A'로 읽는다", () => {
  assert.deepEqual(families('3D 요소'), []);
  assert.deepEqual(families('B2B'), []);
  assert.deepEqual(families('B에 가까움 (3D 스크롤)'), ['B']);
  assert.deepEqual(families("A' 변형"), ["A'"]);
  assert.deepEqual(families('A\u2019 변형'), ["A'"]);
  assert.deepEqual(families("D에 가까움, A'"), ['D', "A'"]);
});

test('validate: 없는 패턴, 겹치는 주소·id, 없는 미디어, 사례 없는 패턴', () => {
  const site = (file, id, url, patterns, image = null) => ({ file, id, url, patterns, image, video: null });
  const errors = validate(
    [site('a.md', 'one', 'https://www.x.test/', ['p1']), site('b.md', 'two', 'https://x.test', ['nope'], 'media/two/a.webp'), site('b.md', 'one', 'https://y.test/', ['p1'])],
    [{ id: 'p1' }, { id: 'p2' }],
    () => false,
  );
  assert.deepEqual(errors, [
    'b.md two: 주소 중복 — a.md one와 같음',
    'b.md two: patterns.md에 없는 패턴 `nope`',
    'b.md two: 미디어 파일 없음 media/two/a.webp',
    'b.md one: 사이트 id 중복 — a.md one와 같음',
    'patterns.md `p2`: 이 패턴을 쓰는 사이트 카드가 없음',
  ]);
});

test('validate: 한 노션 행에서 나온 사이트 여러 곳은 같은 노션 id를 적어도 된다', () => {
  const { sites } = parseSiteDoc('a.md', doc(card(), card({ id: 'beta', url: 'https://beta.test/' })));
  assert.deepEqual(sites.map((s) => s.notion), [['3ead12f2-3255-81b6-99ab-daa10d99e0a4'], ['3ead12f2-3255-81b6-99ab-daa10d99e0a4']]);
  assert.deepEqual(validate(sites, parsePatterns('patterns.md', PATTERNS).patterns, () => true), []);
});

test('toCatalog·summary: 에이전트용 목록과 플랜용 요약', () => {
  const { sites } = parseSiteDoc('alpha.md', doc(card()));
  const cat = toCatalog(sites, parsePatterns('patterns.md', PATTERNS).patterns, ['alpha.md', 'patterns.md']);
  assert.deepEqual(cat.generatedFrom, ['alpha.md', 'patterns.md']);
  assert.deepEqual(cat.patterns, [{ id: 'desktop-os', name: '데스크톱 OS 은유', families: ['D'], sites: ['alpha'] }]);
  assert.equal(cat.sites[0].summary, '[레퍼런스] alpha — Alpha Studio (https://www.alpha.test/) · 패턴 desktop-os · ✅ 2026-10-01\n가져올 것: 익숙한 창 조작으로 탐색하기\n안 가져올 것: 모바일에서도 창을 겹치는 배치');
  assert.equal('part' in cat.sites[0], false);
  assert.ok(summary({ ...sites[0], check: { status: 'pending', date: null } }).split('\n')[0].endsWith('· ⏸'));
});

test('renderPage: 카드 필터 속성·요약, site 모드는 미디어를 모은다', () => {
  const pat = parsePatterns('patterns.md', PATTERNS);
  const parsed = parseSiteDoc('alpha.md', doc(card({ second: true })));
  const model = { readme: splitDoc('# 안내\n\n## 가져오는 법\n\n1. 태그를 붙인다\n'), patternDoc: pat.doc, docs: [{ file: 'alpha.md', ...parsed }], sites: parsed.sites, patterns: pat.patterns };
  const local = renderPage(model, { mode: 'local', root: '/repo/references' });
  assert.ok(local.body.includes('<article class="card" id="site-alpha" data-status="ok" data-patterns="desktop-os" data-families="D|A&#39;">'));
  assert.ok(local.body.includes('id="pattern-desktop-os"'));
  assert.ok(local.body.includes('[레퍼런스] alpha — Alpha Studio (https://www.alpha.test/)'));
  assert.ok(local.body.includes('id="guide-가져오는-법"'));
  assert.equal(local.files.size, 0);
  const site = renderPage(model, { mode: 'site', root: '/repo/references' });
  assert.deepEqual([...site.files.keys()].sort(), ['media/alpha/desk.webp', 'media/alpha/state.webp', 'media/alpha/walk.webm']);
  assert.ok(site.body.includes('aria-label="Alpha Studio 캡처 2 크게 보기"') && site.body.includes('alt="Alpha Studio 화면 2"'));
});
