# 선비 사이트 시·서·화 분야 전환 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `projects/hanbok-hero`에 시(詩)·서(書)·화(畫) 분야 버튼을 넣어, 고르면 배경 그림·큰 한자·부제·강조색이 바뀌는 가상 선비 "소운 윤하담"의 첫 화면을 만든다.

**Architecture:** 분야 = layer-kit 장면 3개(`si`·`seo`·`hwa`). 버튼은 `layerHost.setScene`만 부르고, 화면 동기화(버튼 상태·배경 덮개 전환·글자 등장)는 `layerHost.subscribe` 한 곳에서 한다. 그래서 관리자의 `bridge.setScene`도 같은 길을 탄다. 순수 로직(저장·검증·미리 불러올 목록)은 `dist/moods.js`, DOM 연결은 `dist/mood-switch.js`로 나눈다(기존 `gaze.js`/`app.js` 분리와 같은 방식).

**Tech Stack:** 정적 ES 모듈, `@iw/layer-kit`(복사본 `dist/vendor/layer-kit/`), `node --test`, 페이지 안 검수 함수(`dist/qa/browser-checks.js`), Aside·Playwright MCP, Codex CLI `image_gen`, Python Pillow.

**Spec:** `.claude/plans/2026-10-05-hanbok-moods.md` (실행 전 함께 읽는다)

## Global Constraints

- 레이어 계약: 화면의 모든 시각 요소는 `dist/layers.manifest.js` 레이어에 속하고, 조정할 수치·색·문구를 CSS·JS에 리터럴로 두지 않는다. 구조상 필요한 값은 `/* layer-fixed: 이유 */` 또는 매니페스트 `fixed`에 적는다.
- 장면 id: `si`(시 詩) · `seo`(서 書) · `hwa`(화 畫), `initialScene: "si"`.
- 이름 "소운 윤하담", 제작 표시 "제작 이주호".
- 강조색: 시 `#b9c7d6` · 서 `#c8553d` · 화 `#6f9a8d`. 부제: "달을 읊고 바람을 적는 선비" · "먹을 갈아 마음을 쓰는 선비" · "산과 물을 화폭에 옮기는 선비".
- 분야 저장 키 `hanbok-hero:mood:v1`. 값이 장면 id가 아니면 버리고 `si`.
- 정지 이미지는 Codex `image_gen`(`codex exec`)으로만 만든다. fal은 쓰지 않는다.
- 배경 3장은 회화풍 콘셉트 아트, 모두 실외, 프롬프트에 한국 고유 명사 + "not Chinese, not Japanese" + 사람·글자·현판·명패·붉은 해·깃발 금지.
- 배경은 1920 폭 webp, 장당 200KB 안쪽 목표.
- 버튼 터치 영역 최소 44px. 한자는 `aria-hidden`.
- 브라우저 확인은 Aside가 기본이다. 동작 줄이기·뷰포트 에뮬레이션처럼 Aside로 안 되는 검사는 사용자에게 그렇다고 알리고 Playwright MCP로 한다.
- 새 npm 의존성 없음. 개발 서버 포트 4178.
- 코드 주석과 검수 문구는 주변 코드처럼 한국어로 쓴다.
- 커밋은 `hanbok-moods` 브랜치에. 메시지는 이유 중심, 끝에 `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. 파일은 이름으로 stage한다(`git add -A` 금지).

## Review Focus

- 분야 버튼을 빠르게 연달아 누름 → 마지막으로 누른 분야로 끝나고 덮개가 남지 않아야 한다. (Task 3 `runCrossfade` "연달아 눌러도")
- 관리자 미리보기처럼 `setScene`을 직접 부름 → 버튼 `aria-pressed`가 따라오고 저장은 하지 않아야 한다. (Task 3 `runMoodChecks` "직접 setScene")
- 같은 값으로 다시 적용(화면 크기 경계를 넘는 resize, 관리자 값 변경) → 배경 덮개가 다시 생기지 않아야 한다. (Task 3 `runMoodChecks` "다시 적용해도")
- 키보드만 쓰는 사람 → Tab으로 버튼에 닿고 Enter·Space로 고르며 포커스 링이 보여야 한다. (Task 3 Step 7 Playwright 키보드)
- 숨긴 메뉴·작품 보기 링크 → Tab에 잡히지 않아야 한다. (Task 3 `runMoodChecks` "숨긴 링크")

---

### Task 1: 분야 저장·검증 순수 로직

**Files:**
- Create: `projects/hanbok-hero/dist/moods.js`
- Test: `projects/hanbok-hero/scripts/moods.test.mjs`

**Interfaces:**
- Consumes: `resolve(manifest, values, scene, screens)` from `dist/vendor/layer-kit/index.js` (기존)
- Produces:
  - `MOOD_KEY: 'hanbok-hero:mood:v1'`
  - `openStorage(get?: () => Storage): Storage | null`
  - `readMood(storage: Storage | null, ids: string[]): string | null`
  - `writeMood(storage: Storage | null, id: string): boolean`
  - `moodImages(manifest, values, screens?: string[]): string[]` — 장면별 `paper.image`, 중복 제거

- [ ] **Step 1: 실패하는 테스트 쓰기** — `projects/hanbok-hero/scripts/moods.test.mjs`

```js
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
```

- [ ] **Step 2: 실패 확인**

Run: `node --test projects/hanbok-hero/scripts/moods.test.mjs`
Expected: FAIL — `Cannot find module ... dist/moods.js`

- [ ] **Step 3: 구현** — `projects/hanbok-hero/dist/moods.js`

```js
import { resolve } from './vendor/layer-kit/index.js';

// 분야(장면) 고르기의 순수 로직 — DOM 없이 node --test로 검사한다.
export const MOOD_KEY = 'hanbok-hero:mood:v1';
// localStorage에 접근하는 것만으로 예외가 나는 브라우저(저장 차단)가 있다
export function openStorage(get = () => globalThis.localStorage) { try { return get() || null; } catch { return null; } }
// 저장값이 장면 id일 때만 받는다. 막혀 있거나 이상한 값이면 null(→ 첫 장면)
export function readMood(storage, ids) { try { const value = storage?.getItem(MOOD_KEY); return ids.includes(value) ? value : null; } catch { return null; } }
// 저장 성공 여부. 실패해도 화면은 바뀌고 이번 방문 동안만 기억한다
export function writeMood(storage, id) { try { if (!storage) return false; storage.setItem(MOOD_KEY, id); return true; } catch { return false; } }
// 장면마다 실제로 보일 배경 주소(지금 화면 크기 값 포함), 중복 없이 — 미리 불러오기용
export function moodImages(manifest, values, screens = []) {
  return [...new Set(Object.keys(manifest.scenes).map(id => resolve(manifest, values, id, screens).paper.image))];
}
```

- [ ] **Step 4: 통과 확인**

Run: `node --test projects/hanbok-hero/scripts/moods.test.mjs`
Expected: 3 tests PASS

- [ ] **Step 5: 커밋**

```bash
git add projects/hanbok-hero/dist/moods.js projects/hanbok-hero/scripts/moods.test.mjs
git commit -F - <<'EOF'
선비 사이트: 분야 저장·검증 로직

저장소가 막히거나 이상한 값이 들어 있어도 화면이 깨지지 않게, 분야 기억을 DOM과 떼어 테스트로 고정하기 위해서다.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 2: 레이어 계약 — 장면 3개, 새 레이어, 마크업·스타일

**Files:**
- Modify: `projects/hanbok-hero/dist/layers.manifest.js` (아래 변환 스크립트로)
- Modify: `projects/hanbok-hero/dist/layers.values.json`
- Modify: `projects/hanbok-hero/dist/index.html`
- Modify: `projects/hanbok-hero/dist/style.css`
- Modify: `projects/hanbok-hero/scripts/check.mjs:58`
- Modify: `projects/hanbok-hero/scripts/moods.test.mjs` (테스트 추가)
- Generated (build): `dist/layers.css`, `dist/layers.values.js`, `dist/index.html`

**Interfaces:**
- Consumes: Task 1 `moodImages`
- Produces (later tasks rely on these):
  - DOM: `img.paper-prev[hidden]`(바인딩 없음), `p.glyph[aria-hidden]`, `div.moods[role=group][aria-labelledby=moods-label]`, `button.mood[data-scene=si|seo|hwa][aria-pressed]`, `span.mood-ko`, `span.mood-hanja[aria-hidden]`, `p.credit`
  - CSS: `.paper-prev.is-fading`(opacity 0), `html.mood-enter`가 `.glyph`·`.title-tagline`에 `mood-in` 애니메이션, `.paper-prev`의 `transition-duration` = `global.moodFade`(동작 줄이기면 0)
  - 매니페스트: 레이어 `glyph`·`moods`·`credit`, `global.accent`·`global.moodFade`, 장면 `si`·`seo`·`hwa`의 `set`

- [ ] **Step 1: 실패하는 테스트 추가** — `scripts/moods.test.mjs` 끝에 붙인다(첫 줄 import에 `moodImages` 추가)

```js
import manifest from '../dist/layers.manifest.js';
import published from '../dist/layers.values.js';

test('매니페스트: 장면 3개와 분야 레이어', () => {
  assert.deepEqual(Object.keys(manifest.scenes), ['si', 'seo', 'hwa']);
  assert.equal(manifest.initialScene, 'si');
  for (const id of ['glyph', 'moods', 'credit']) assert.ok(manifest.layers.some(layer => layer.id === id), id);
  assert.deepEqual(['si', 'seo', 'hwa'].map(id => manifest.scenes[id].set.glyph.text), ['詩', '書', '畫']);
  assert.deepEqual(['si', 'seo', 'hwa'].map(id => manifest.scenes[id].set.global.accent), ['#b9c7d6', '#c8553d', '#6f9a8d']);
});
test('빈 메뉴·작품 보기는 게시값으로 숨김', () => {
  assert.equal(published.base.nav.visible, false);
  assert.equal(published.base.cta.visible, false);
});
test('분야별 배경 주소: 지금은 세 분야 모두 같은 그림', () => {
  assert.deepEqual(moodImages(manifest, published, []), ['./assets/palace.webp']);
});
```

첫 줄 import를 이렇게 바꾼다: `import { MOOD_KEY, openStorage, readMood, writeMood, moodImages } from '../dist/moods.js';`

- [ ] **Step 2: 실패 확인**

Run: `node --test projects/hanbok-hero/scripts/moods.test.mjs`
Expected: FAIL — `Object.keys(manifest.scenes)`가 `['hero']`

- [ ] **Step 3: 매니페스트 변환 스크립트 작성·실행**

저장소 밖 임시 폴더(세션 scratchpad 등)에 `hanbok-moods-manifest.mjs`를 만든다.

```js
import { readFile, writeFile } from 'node:fs/promises';
const file = process.argv[2];
const source = (await readFile(file, 'utf8')).replace(/\r\n/g, '\n');
const m = JSON.parse(source.replace(/^export default /, '').replace(/;\s*$/, ''));
const layer = id => m.layers.find(item => item.id === id);
const fonts = layer('global').params.font.options; // 글꼴 후보는 index.html Google Fonts와 짝
const base = () => ({ visible: { label: '보이기', type: 'boolean', default: true, on: 'visible', off: 'hidden' }, opacity: { label: '불투명도', type: 'number', default: 1, min: 0, max: 1, step: 0.01, unit: '' } });
const num = (label, def, min, max, step, unit, at) => ({ label, type: 'number', default: def, min, max, step, unit, ...(at ? { at } : {}) });
const text = (label, def, maxLength, marker) => ({ label, type: 'text', default: def, maxLength, text: `[data-layer-text="${marker}"]` });
const color = (label, def) => ({ label, type: 'color', default: def });
const font = () => ({ label: '글꼴', type: 'select', default: fonts[0].value, options: fonts });

m.initialScene = 'si';
m.scenes = {
  si: { label: '시 詩', set: { global: { accent: '#b9c7d6' }, glyph: { text: '詩' }, title: { tagline: '달을 읊고 바람을 적는 선비' } } },
  seo: { label: '서 書', set: { global: { accent: '#c8553d' }, glyph: { text: '書' }, title: { tagline: '먹을 갈아 마음을 쓰는 선비' } } },
  hwa: { label: '화 畫', set: { global: { accent: '#6f9a8d' }, glyph: { text: '畫' }, title: { tagline: '산과 물을 화폭에 옮기는 선비' } } },
};
Object.assign(layer('global').params, { accent: color('분야 강조색', '#b9c7d6'), moodFade: num('분야 전환 시간', 600, 0, 3000, 50, 'ms') });
layer('title').params.name.default = '소운 윤하담';
layer('title').params.tagline.default = '달을 읊고 바람을 적는 선비';

const glyph = { id: 'glyph', label: '큰 한자', group: '글', el: '.glyph', params: { ...base(), text: text('글자', '詩', 4, 'glyph/text'), font: font(), size: num('크기', 70, 10, 150, 1, 'vh', { tablet: 52, mobile: 34 }), x: num('가로 위치(가운데)', 28, -50, 150, 0.1, '%', { mobile: 50 }), y: num('세로 위치(가운데)', 42, -50, 150, 0.1, '%', { mobile: 30 }), color: color('색', '#f3e9d8') } };
glyph.params.opacity.default = 0.08;
const moods = { id: 'moods', label: '분야 버튼', group: '메뉴', el: '.moods', params: { ...base(),
  label: text('묶음 이름(스크린리더)', '분야', 20, 'moods/label'),
  ko1: text('첫째 이름', '시', 10, 'moods/ko1'), hanja1: text('첫째 한자', '詩', 4, 'moods/hanja1'),
  ko2: text('둘째 이름', '서', 10, 'moods/ko2'), hanja2: text('둘째 한자', '書', 4, 'moods/hanja2'),
  ko3: text('셋째 이름', '화', 10, 'moods/ko3'), hanja3: text('셋째 한자', '畫', 4, 'moods/hanja3'),
  font: font(), size: num('글자 크기', 1.05, 0.6, 3, 0.05, 'rem', { mobile: 0.95 }), color: color('글자 색', '#e9dcc3'),
  gap: num('버튼 간격', 0.5, 0, 4, 0.05, 'rem'),
  x: num('가로 위치(가운데)', 95, -50, 150, 0.1, '%', { tablet: 92, mobile: 50 }), y: num('세로 위치(가운데)', 50, -50, 150, 0.1, '%', { mobile: 9 }),
  direction: { label: '방향', type: 'select', default: 'column', options: [{ value: 'column', label: '세로' }, { value: 'row', label: '가로' }], at: { mobile: 'row' } },
} };
const credit = { id: 'credit', label: '제작 표시', group: '글', el: '.credit', params: { ...base(), text: text('문구', '제작 이주호', 60, 'credit/text'), color: color('색', '#bfae8e'), size: num('크기', 0.8, 0.5, 2, 0.05, 'rem'), x: num('가로 위치', 6, -50, 150, 0.1, '%'), y: num('세로 위치', 95, -50, 150, 0.1, '%') } };
credit.params.opacity.default = 0.85;

const at = id => m.layers.findIndex(item => item.id === id);
m.layers.splice(at('paper') + 1, 0, glyph);
m.layers.splice(at('title') + 1, 0, moods);
m.layers.push(credit);
m.fixed.push(
  { reason: '분야 버튼 3개는 장면 3개(si·seo·hwa)와 data-scene으로 짝을 이룬다. 장면 id가 곧 분야이므로 버튼 수와 순서는 구조다. 고른 버튼 강조는 global.accent 한 곳에서 바뀌게 따로 색 파라미터를 두지 않는다. 장면 set의 글자·색은 공통 값보다 우선하므로 분야별 값은 관리자에서 "이 장면" 범위로 바꾼다.' },
  { reason: '배경 전환은 이전 그림(.paper-prev, 바인딩 없음)을 위에 덮고 새 그림이 디코딩되면 moodFade 동안 걷어 낸다. 두 배경이 잠깐 겹치는 것은 의도다(얼굴 칸은 겹치지 않는다는 고정값과 다르다). 새 그림을 불러오지 못하면 덮개를 그대로 둔다. 전환 이징(ease)과 글자 등장(투명에서 시작)은 디자인 고정이다.' },
  { reason: '동작 줄이기에서는 배경 덮개 전환·글자 등장·버튼 색 전환을 끄고 즉시 바꾼다. 버튼 터치 영역 최소 44px, 그룹 이름은 스크린리더 전용(.moods-label), 큰 한자와 버튼 속 한자는 aria-hidden이다. 큰 한자·분야 버튼은 가운데 기준(translate -50%)으로 놓는다.' },
);
await writeFile(file, 'export default ' + JSON.stringify(m, null, 2) + ';\n');
console.log('layers', m.layers.length);
```

Run: `node <임시폴더>/hanbok-moods-manifest.mjs projects/hanbok-hero/dist/layers.manifest.js`
Expected: `layers 10`
Then: `git diff --stat projects/hanbok-hero/dist/layers.manifest.js` — 추가 위주의 변경. `git diff`에서 기존 레이어(character·hint 등) 줄이 서식 때문에 통째로 바뀌었으면 원래 서식이 `JSON.stringify(…, null, 2)`가 아니라는 뜻이다. 그때는 `git restore`로 되돌리고 멈춰서 보고한다.

- [ ] **Step 4: 게시값에서 메뉴·작품 보기 숨기기** — `projects/hanbok-hero/dist/layers.values.json` 전체를 이렇게 바꾼다

```json
{
  "format": "iw-layers/1",
  "work": "hanbok-hero",
  "manifestVersion": 1,
  "base": {
    "nav": { "visible": false },
    "cta": { "visible": false }
  },
  "responsive": {},
  "scenes": {}
}
```

- [ ] **Step 5: 마크업** — `projects/hanbok-hero/dist/index.html`

`<meta name="description" …>`의 content를 `시·서·화를 고르면 분위기가 바뀌고, 갓 쓴 조선 선비가 시선으로 맞이하는 첫 화면.`으로 바꾼다.

`.paper` 줄을 바꾸고 바로 아래에 큰 한자를 넣는다:

```html
    <div class="paper" aria-hidden="true">
      <img class="paper-image" data-layer-image="paper/image" src="./assets/palace.webp" alt="" draggable="false">
      <img class="paper-prev" alt="" draggable="false" hidden>
    </div>
    <p class="glyph" aria-hidden="true" data-layer-text="glyph/text">詩</p>
```

`</h1>` 바로 뒤(cta 앞)에 분야 버튼을 넣는다:

```html
    <div class="moods" role="group" aria-labelledby="moods-label">
      <span class="moods-label" id="moods-label" data-layer-text="moods/label">분야</span>
      <button class="mood" type="button" data-scene="si" aria-pressed="true"><span class="mood-ko" data-layer-text="moods/ko1">시</span><span class="mood-hanja" aria-hidden="true" data-layer-text="moods/hanja1">詩</span></button>
      <button class="mood" type="button" data-scene="seo" aria-pressed="false"><span class="mood-ko" data-layer-text="moods/ko2">서</span><span class="mood-hanja" aria-hidden="true" data-layer-text="moods/hanja2">書</span></button>
      <button class="mood" type="button" data-scene="hwa" aria-pressed="false"><span class="mood-ko" data-layer-text="moods/ko3">화</span><span class="mood-hanja" aria-hidden="true" data-layer-text="moods/hanja3">畫</span></button>
    </div>
```

`</main>` 바로 앞(hint 뒤)에 제작 표시를 넣는다:

```html
    <p class="credit" data-layer-text="credit/text">제작 이주호</p>
```

- [ ] **Step 6: 스타일** — `projects/hanbok-hero/dist/style.css`

`.paper::after` 줄(10행) 바로 뒤에:

```css
.paper-prev { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 1; transition: opacity var(--L-global-moodFade) ease; } /* layer-fixed: 이전 배경 덮개 — 배경 그림과 같은 자리, 이징은 디자인 고정 */
.paper-prev.is-fading { opacity: 0; } /* layer-fixed: 걷힌 끝 상태 */
.glyph { position: absolute; left: var(--L-glyph-x); top: var(--L-glyph-y); translate: -50% -50%; margin: 0; font-family: var(--L-glyph-font); font-size: var(--L-glyph-size); line-height: 1; color: var(--L-glyph-color); visibility: var(--L-glyph-visible); opacity: var(--L-glyph-opacity); pointer-events: none; user-select: none; } /* layer-fixed: 가운데 기준, 한 글자 줄 높이 1, 입력을 막지 않는 장식 */
```

`.title-tagline` 줄(25행) 바로 뒤에:

```css
.mood-enter .glyph, .mood-enter .title-tagline { animation: mood-in var(--L-global-moodFade) ease both; } /* layer-fixed: 분야를 바꾸면 새 글자가 서서히 나타난다 — 이징 고정 */
@keyframes mood-in { from { opacity: 0; } } /* layer-fixed: 투명에서 시작 */
```

`@keyframes hint-out` 줄(37행) 바로 뒤에:

```css
.moods { position: absolute; left: var(--L-moods-x); top: var(--L-moods-y); translate: -50% -50%; display: flex; flex-direction: var(--L-moods-direction); gap: var(--L-moods-gap); font-family: var(--L-moods-font); font-size: var(--L-moods-size); visibility: var(--L-moods-visible); opacity: var(--L-moods-opacity); } /* layer-fixed: 가운데 기준 배치 */
.moods-label { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; } /* layer-fixed: 스크린리더 전용 그룹 이름 */
.mood { display: inline-flex; align-items: baseline; justify-content: center; gap: .4em; min-width: 44px; min-height: 44px; padding: .35em .6em; border: 1px solid transparent; border-radius: 2px; background: none; color: var(--L-moods-color); font: inherit; cursor: pointer; text-shadow: 0 1px 2px rgba(0, 0, 0, .45); transition: color var(--L-global-moodFade), border-color var(--L-global-moodFade); } /* layer-fixed: 터치 타깃 44px, 버튼 기본 모양 제거, 대비용 그림자 */
.mood[aria-pressed="true"] { color: var(--L-global-accent); border-color: var(--L-global-accent); } /* layer-fixed: 고른 분야 표시 */
.mood-hanja { font-size: 1.35em; } /* layer-fixed: 한자를 한글보다 크게 */
.mood:focus-visible { outline: 2px solid #f3e9d8; outline-offset: 3px; } /* layer-fixed: 포커스 링 대비 */
.credit { position: absolute; left: var(--L-credit-x); top: var(--L-credit-y); margin: 0; font-size: var(--L-credit-size); color: var(--L-credit-color); visibility: var(--L-credit-visible); opacity: var(--L-credit-opacity); letter-spacing: .04em; white-space: nowrap; } /* layer-fixed: 한 줄, 자간 디자인 고정 */
```

마지막 줄(동작 줄이기, 41행)을 통째로 바꾼다:

```css
@media (prefers-reduced-motion: reduce) { .character.use-sheet .character-still { visibility: visible; } .character.use-sheet .character-body, .character.use-sheet .character-head { visibility: hidden; } .hint { animation: none; visibility: hidden; } .paper-prev, .mood { transition: none; } .mood-enter .glyph, .mood-enter .title-tagline { animation: none; } } /* layer-fixed: 동작 줄이기 — 분야 전환은 즉시 */
```

- [ ] **Step 7: 엔트리 검사에 새 요소 추가** — `scripts/check.mjs` 58행 배열을 바꾼다

```js
for (const marker of ['class="gaze-range"', 'class="character-still"', 'class="character-body"', 'class="character-head"', 'class="character-sheet"', 'class="hint-pointer"', 'class="hint-touch"', 'class="paper-prev"', 'class="glyph"', 'class="moods"', 'data-scene="si"', 'data-scene="seo"', 'data-scene="hwa"', 'class="credit"']) {
```

- [ ] **Step 8: 생성물 빌드와 검사**

Run: `pnpm --filter hanbok-hero build`
Expected: `PASS: entrypoint, … local assets, syntax, required elements.`
Run: `pnpm --filter hanbok-hero check`
Expected: 테스트 10개(gaze 4 + moods 6) PASS, `PASS layer-kit lint: 10 layers, 107 parameters; generated CSS/runtime/HTML current.`
Lint가 `Unbound --L-…`이나 `Unknown CSS variable`을 내면 Step 6의 변수 이름(`--L-<레이어>-<키>`)을 매니페스트 키와 맞춘다.

- [ ] **Step 9: 커밋**

```bash
git add projects/hanbok-hero/dist/layers.manifest.js projects/hanbok-hero/dist/layers.values.json projects/hanbok-hero/dist/layers.values.js projects/hanbok-hero/dist/layers.css projects/hanbok-hero/dist/index.html projects/hanbok-hero/dist/style.css projects/hanbok-hero/scripts/check.mjs projects/hanbok-hero/scripts/moods.test.mjs
git commit -F - <<'EOF'
선비 사이트: 시·서·화 장면과 분야 레이어 선언

분야를 바꿀 때 달라지는 배경·큰 한자·문구·강조색과 분야 버튼·제작 표시를 모두 관리자에서 고칠 수 있게 레이어 계약부터 세우기 위해서다. 아직 채우지 않은 메뉴는 게시값으로 숨긴다.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 3: 분야 전환 런타임과 브라우저 검수

**Files:**
- Create: `projects/hanbok-hero/dist/mood-switch.js`
- Modify: `projects/hanbok-hero/dist/app.js:1-6,108-113`
- Modify: `projects/hanbok-hero/dist/qa/browser-checks.js`

**Interfaces:**
- Consumes: Task 1 `openStorage`·`readMood`·`writeMood`·`moodImages`; Task 2 DOM·CSS 계약; `layerHost.subscribe(cb({ scene, current }))`, `layerHost.setScene(id)`, `layerHost.refresh()`
- Produces:
  - `setupMoods(layerHost, { storage? }) → { scene: string, saved: boolean | null, preloaded: string[] }` (getter)
  - `app.js`의 `export const moods`
  - 검수 함수: `runMoodChecks()`, `runCrossfade()`, `runMoodImageFailure()`, `runMoodStorageBlocked()`, `moodState()` — 모두 `{ passed, failed }` 또는 상태 객체를 돌려준다

- [ ] **Step 1: 실패하는 브라우저 검수 함수 쓰기** — `dist/qa/browser-checks.js`

`collector()` 정의(5행) 바로 뒤에 도우미를 넣는다:

```js
const MOOD_KEY = 'hanbok-hero:mood:v1';
const moodButton = id => document.querySelector(`.mood[data-scene="${id}"]`);
const paperSrc = () => document.querySelector('.paper-image').getAttribute('src');
const coverShown = () => !document.querySelector('.paper-prev').hidden;
const fadeMs = () => Math.round((parseFloat(getComputedStyle(document.querySelector('.paper-prev')).transitionDuration) || 0) * 1000);
const settleMood = () => wait(fadeMs() + 400);
const screensNow = host => host.manifest.breakpoints.filter(item => matchMedia(item.media).matches).map(item => item.id);
const rgb = hex => { const n = parseInt(hex.slice(1, 7), 16); return `rgb(${n >> 16}, ${(n >> 8) & 255}, ${n & 255})`; };
const stored = () => { try { return localStorage.getItem(MOOD_KEY); } catch { return 'blocked'; } };
const restoreStored = value => { try { if (value === null) localStorage.removeItem(MOOD_KEY); else localStorage.setItem(MOOD_KEY, value); } catch {} };
const overlap = (a, b) => { const r = a.getBoundingClientRect(), s = b.getBoundingClientRect(); return Boolean(r.width && s.width) && !(r.right <= s.left || s.right <= r.left || r.bottom <= s.top || s.bottom <= r.top); };
```

`runChecks` 안을 고친다. 105행(메뉴 3개 키보드 도달)을 지우고, 108·112행의 `'hero'`를 `layerHost.scene`으로 바꾼다:

```js
      layerHost.setValues(setValue(original, layerHost.scene, 'base', 'character', 'react', false)); await wait(30);
```
```js
      layerHost.setValues(setValue(original, layerHost.scene, 'base', 'character', 'cols', 1)); await wait(30);
```

`runSheetFailure` 앞에 분야 검수 함수들을 넣는다:

```js
export async function runMoodChecks() {
  const { layerHost, moods } = await import('/app.js');
  const { resolve } = await import('/vendor/layer-kit/index.js');
  const { check, passed, failed } = collector();
  const ids = Object.keys(layerHost.manifest.scenes), before = stored();
  const buttons = [...document.querySelectorAll('.mood[data-scene]')];
  try {
    check(ids.join() === 'si,seo,hwa', '장면 3개(si·seo·hwa)');
    check(buttons.length === 3 && buttons.every(b => b.tagName === 'BUTTON' && b.tabIndex >= 0) && buttons.map(b => b.dataset.scene).join() === ids.join(), '분야 버튼 3개, 장면과 같은 순서, 키보드 도달');
    const group = document.querySelector('.moods');
    check(group.getAttribute('role') === 'group' && document.getElementById(group.getAttribute('aria-labelledby'))?.textContent.trim() !== '', '버튼 묶음에 이름');
    check([...document.querySelectorAll('.mood-hanja, .glyph')].every(el => el.getAttribute('aria-hidden') === 'true'), '한자(버튼 속·큰 글자)는 스크린리더가 읽지 않음');
    check(buttons.every(b => { const r = b.getBoundingClientRect(); return r.width >= 44 && r.height >= 44; }), '버튼 터치 영역 44px 이상');
    check(['.nav', '.cta'].every(sel => getComputedStyle(document.querySelector(sel)).display === 'none'), '빈 메뉴·작품 보기 숨김');
    check([...document.querySelectorAll('.nav a, .cta')].every(el => el.offsetParent === null), '숨긴 링크는 Tab으로 닿지 않음');
    for (const id of ids) {
      moodButton(id).click(); await settleMood();
      const want = resolve(layerHost.manifest, layerHost.values, id, screensNow(layerHost));
      check(document.documentElement.dataset.layerScene === id && layerHost.scene === id, `${id}: 장면`);
      check(buttons.every(b => b.getAttribute('aria-pressed') === String(b.dataset.scene === id)), `${id}: 고른 버튼만 aria-pressed`);
      check(paperSrc() === want.paper.image && !coverShown(), `${id}: 배경 ${want.paper.image}, 덮개 걷힘`);
      check(document.querySelector('.glyph').textContent === want.glyph.text, `${id}: 큰 한자 ${want.glyph.text}`);
      check(document.querySelector('.title-tagline').textContent === want.title.tagline, `${id}: 부제`);
      check(getComputedStyle(moodButton(id)).color === rgb(want.global.accent), `${id}: 고른 버튼 강조색 ${want.global.accent}`);
      check(stored() === id && moods.saved === true, `${id}: 브라우저에 저장`);
    }
    const kept = stored();
    layerHost.setScene('seo'); await settleMood();
    check(moodButton('seo').getAttribute('aria-pressed') === 'true' && stored() === kept, '직접 setScene(관리자 경로): 버튼 동기화, 저장 안 함');
    layerHost.refresh(); await wait(50);
    check(!coverShown(), '같은 값으로 다시 적용해도 덮개 없음');
    check(document.documentElement.scrollWidth <= window.innerWidth, '가로 스크롤 없음');
  } finally {
    moodButton('si').click(); await settleMood(); restoreStored(before);
  }
  return { passed, failed };
}

// 배경이 다른 두 분야 사이의 덮개 전환. 배경이 같아도 검사할 수 있게 'seo' 배경을 잠깐 1px 그림으로 바꾼다.
export async function runCrossfade() {
  const { layerHost } = await import('/app.js');
  const { setValue } = await import('/vendor/layer-kit/index.js');
  const { check, passed, failed } = collector();
  const original = layerHost.values, reduce = matchMedia('(prefers-reduced-motion: reduce)').matches, before = stored();
  const cover = document.querySelector('.paper-prev');
  try {
    moodButton('si').click(); await settleMood();
    const from = paperSrc();
    layerHost.setValues(setValue(original, 'seo', 'base', 'paper', 'image', './assets/blank.png'));
    moodButton('seo').click();
    check(coverShown() && cover.getAttribute('src') === from, '바꾸는 순간 이전 배경이 덮개로 보임');
    check(reduce ? fadeMs() === 0 : fadeMs() === layerHost.get('global', 'moodFade'), reduce ? '동작 줄이기: 전환 시간 0' : '전환 시간 = global.moodFade');
    if (!reduce) { await wait(fadeMs() / 2); check(coverShown() && Number(getComputedStyle(cover).opacity) < 1, '전환 중: 덮개가 걷히는 중'); }
    await settleMood();
    check(!coverShown() && paperSrc() === './assets/blank.png', '전환 뒤 덮개 걷힘');
    moodButton('si').click(); moodButton('seo').click(); moodButton('hwa').click();
    await settleMood(); await settleMood();
    check(layerHost.scene === 'hwa' && !coverShown() && paperSrc() === layerHost.get('paper', 'image'), '연달아 눌러도 마지막 분야, 덮개 없음');
  } finally {
    layerHost.setValues(original); moodButton('si').click(); await settleMood(); restoreStored(before);
  }
  return { passed, failed };
}

export async function runMoodImageFailure() {
  const { layerHost } = await import('/app.js');
  const { setValue } = await import('/vendor/layer-kit/index.js');
  const { check, passed, failed } = collector();
  const original = layerHost.values, before = stored(), cover = document.querySelector('.paper-prev');
  const warn = console.warn; let warned = 0;
  console.warn = (...args) => { warned++; warn(...args); };
  try {
    moodButton('si').click(); await settleMood();
    const good = paperSrc();
    layerHost.setValues(setValue(original, 'seo', 'base', 'paper', 'image', './assets/missing-mood.webp'));
    moodButton('seo').click(); await settleMood();
    check(paperSrc() === './assets/missing-mood.webp', '검사 조건: 없는 배경 주소');
    check(coverShown() && cover.getAttribute('src') === good && getComputedStyle(cover).opacity === '1', '불러오지 못하면 이전 배경이 그대로 보임');
    check(warned > 0, '콘솔 경고');
    check(layerHost.scene === 'seo' && document.querySelector('.glyph').textContent === layerHost.get('glyph', 'text'), '배경 실패에도 장면·글자는 바뀜');
    moodButton('hwa').click(); await settleMood();
    check(!coverShown() && paperSrc() === layerHost.get('paper', 'image'), '다른 분야로 가면 회복');
  } finally {
    console.warn = warn; layerHost.setValues(original); moodButton('si').click(); await settleMood(); restoreStored(before);
  }
  return { passed, failed };
}

export async function runMoodStorageBlocked() {
  const { layerHost, moods } = await import('/app.js');
  const { check, passed, failed } = collector();
  const { getItem, setItem } = Storage.prototype;
  const errors = [], onError = event => errors.push(event.message);
  addEventListener('error', onError);
  Storage.prototype.getItem = function () { throw new DOMException('blocked', 'SecurityError'); };
  Storage.prototype.setItem = function () { throw new DOMException('blocked', 'SecurityError'); };
  try {
    const target = layerHost.scene === 'hwa' ? 'seo' : 'hwa';
    moodButton(target).click(); await settleMood();
    check(layerHost.scene === target && moodButton(target).getAttribute('aria-pressed') === 'true', '저장소가 막혀도 분야는 바뀜');
    check(moods.saved === false, '저장 실패를 알고 이번 방문 동안만 기억');
    check(errors.length === 0, '페이지 오류 없음');
  } finally {
    Storage.prototype.getItem = getItem; Storage.prototype.setItem = setItem; removeEventListener('error', onError);
    moodButton('si').click(); await settleMood();
  }
  return { passed, failed };
}

// 새로고침 뒤 복구 확인용 — 상태만 돌려준다
export async function moodState() {
  const { layerHost } = await import('/app.js');
  return { scene: layerHost.scene, pressed: document.querySelector('.mood[aria-pressed="true"]')?.dataset.scene, stored: stored(), cover: coverShown() };
}
```

`runReducedMotionChecks`의 `check(cell().col === before.col, '반응 없음');` 바로 뒤에:

```js
    moodButton('seo').click(); await wait(120);
    check(getComputedStyle(document.querySelector('.glyph')).animationName === 'none' && fadeMs() === 0 && !coverShown(), '분야 전환: 글자 등장·덮개 전환 없이 즉시');
    moodButton('si').click(); await wait(120);
```

`runNarrowChecks`를 고친다. `check(window.innerWidth <= 650, '390px 뷰포트');`를 `check(window.innerWidth <= 650, \`${window.innerWidth}px 뷰포트(모바일 구간)\`);`로 바꾸고, `check(inView(document.querySelector('.nav')), '메뉴가 화면 안');` 줄을 아래로 바꾼다:

```js
    const moodsEl = document.querySelector('.moods'), creditEl = document.querySelector('.credit');
    check(inView(moodsEl), '분야 버튼이 화면 안');
    check(getComputedStyle(moodsEl).flexDirection === 'row', '좁은 화면에서 분야 버튼은 가로');
    check(inView(creditEl), '제작 표시가 화면 안');
    check(!['.title', '.credit', '.hint'].some(sel => overlap(moodsEl, document.querySelector(sel))), '분야 버튼이 이름·제작 표시·안내와 겹치지 않음');
    check(!overlap(creditEl, document.querySelector('.hint')), '제작 표시와 안내가 겹치지 않음');
```

- [ ] **Step 2: 실패 확인**

Run(백그라운드): `pnpm --filter hanbok-hero dev` → `http://localhost:4178/`
브라우저(Aside 기본)에서 페이지를 열고 실행: `await (await import('/qa/browser-checks.js')).runMoodChecks()`
Expected: 실패 — `moods`가 `undefined`라 `moods.saved`에서 TypeError, 또는 `si: 브라우저에 저장`·`직접 setScene` 등이 failed 목록에 있다.

- [ ] **Step 3: 런타임 구현** — `projects/hanbok-hero/dist/mood-switch.js`

```js
import { readMood, writeMood, openStorage, moodImages } from './moods.js';

// 분야 버튼 ↔ 장면(si·seo·hwa). 버튼 클릭도, 관리자의 setScene도 같은 길(layerHost.subscribe)로 화면을 맞춘다.
export function setupMoods(layerHost, { storage = openStorage() } = {}) {
  const root = document.documentElement;
  const buttons = [...document.querySelectorAll('.mood[data-scene]')];
  const image = document.querySelector('.paper-image');
  const cover = document.querySelector('.paper-prev');
  const ids = Object.keys(layerHost.manifest.scenes);
  let scene = layerHost.scene, shown = image.getAttribute('src'), saved = null, started = false, token = null, timer = 0;

  const sync = () => { for (const button of buttons) button.setAttribute('aria-pressed', String(button.dataset.scene === scene)); };
  // 덮개 전환 시간의 정본은 .paper-prev의 계산된 transition-duration(= global.moodFade, 동작 줄이기면 0)
  const fadeMs = () => (parseFloat(getComputedStyle(cover).transitionDuration) || 0) * 1000;
  function lift(current) {
    if (token !== current) return;
    cover.hidden = true; cover.classList.remove('is-fading');
  }
  // 이전 배경을 덮개로 덮어 두고 새 배경이 디코딩되면 걷어 낸다. 새 배경을 못 불러오면 덮개를 그대로 둬 빈 배경이 보이지 않게 한다.
  function crossfade(animate) {
    const next = image.getAttribute('src');
    clearTimeout(timer);
    if (next === shown) { token = null; cover.hidden = true; cover.classList.remove('is-fading'); return; }
    const current = token = {};
    cover.src = shown; cover.classList.remove('is-fading'); cover.hidden = false;
    image.decode().then(() => {
      if (token !== current) return;
      shown = next;
      const ms = animate ? fadeMs() : 0;
      if (!ms) return lift(current);
      void cover.offsetWidth; // 덮개를 보인 직후 같은 프레임에 걷으면 전환이 일어나지 않는다
      cover.classList.add('is-fading');
      timer = setTimeout(() => lift(current), ms + 50);
    }, () => {
      if (token === current) console.warn('배경 그림을 불러오지 못해 이전 그림을 그대로 둡니다.', next);
    });
  }
  function reveal() { root.classList.remove('mood-enter'); void root.offsetWidth; root.classList.add('mood-enter'); }

  layerHost.subscribe(({ scene: next }) => {
    const changed = next !== scene;
    scene = next;
    sync();
    crossfade(started && changed);
    if (started && changed && fadeMs()) reveal();
  });
  for (const button of buttons) button.addEventListener('click', () => {
    const id = button.dataset.scene;
    if (id !== layerHost.scene) layerHost.setScene(id);
    saved = writeMood(storage, id);
  });

  const restored = readMood(storage, ids);
  if (restored && restored !== layerHost.scene) layerHost.setScene(restored);
  sync();
  started = true;

  // 다른 분야 배경은 첫 화면을 그린 뒤 한가할 때 미리 불러 둔다
  const keep = [];
  function preload() {
    const screens = layerHost.manifest.breakpoints.filter(item => matchMedia(item.media).matches).map(item => item.id);
    for (const src of moodImages(layerHost.manifest, layerHost.values, screens)) {
      if (src === image.getAttribute('src')) continue;
      const img = new Image(); img.src = src; img.decode().catch(() => {}); keep.push(img);
    }
  }
  const idle = callback => (window.requestIdleCallback ? requestIdleCallback(callback, { timeout: 2000 }) : setTimeout(callback, 200));
  if (document.readyState === 'complete') idle(preload); else addEventListener('load', () => idle(preload), { once: true });

  return { get scene() { return scene; }, get saved() { return saved; }, get preloaded() { return keep.map(img => img.getAttribute('src')); } };
}
```

- [ ] **Step 4: app.js 연결**

`dist/app.js` 4행 뒤에 import를 추가한다:

```js
import { setupMoods } from './mood-switch.js';
```

111행(`};` — `export const gaze` 끝) 바로 뒤, 113행(studio import) 앞에:

```js

// 분야(시·서·화) 버튼과 장면 — 시선 구독(위) 다음에 붙여, 저장된 분야로 바꿀 때 시선도 새 배치를 읽는다
export const moods = setupMoods(layerHost);
```

Run: `pnpm --filter hanbok-hero check`
Expected: 테스트 10 PASS, 엔트리·문법 PASS(새 `mood-switch.js` 문법 검사 포함), lint 10 layers / 107 parameters 오류 0.

- [ ] **Step 5: 브라우저 검수 (Aside)**

서버를 다시 켜고(빌드 포함) 페이지를 새로 연 뒤, 페이지 안에서 차례로 실행한다:

```js
const q = await import('/qa/browser-checks.js');
({ moods: await q.runMoodChecks(), cross: await q.runCrossfade(), fail: await q.runMoodImageFailure(), blocked: await q.runMoodStorageBlocked(), gaze: await q.runChecks(), probe: await q.runProbe() })
```

Expected: 모든 `failed: []`, `probe`는 `{ total: 107, passed: 107, failed: [] }`.
`probe`에서 숨긴 `nav`·`cta` 파라미터가 실패하면 그 결과를 그대로 적고 멈춰서 보고한다(숨김 상태에서 계산 스타일이 안 바뀌는지 확인이 필요하다).

새로고침 복구: `localStorage.setItem('hanbok-hero:mood:v1','hwa')` → 새로고침 → `await (await import('/qa/browser-checks.js')).moodState()` → `{ scene: 'hwa', pressed: 'hwa', stored: 'hwa', cover: false }`. 다시 `localStorage.setItem('hanbok-hero:mood:v1','hero')` → 새로고침 → `scene: 'si'`. 끝나면 `localStorage.removeItem('hanbok-hero:mood:v1')`.

- [ ] **Step 6: 에뮬레이션 검수 (Playwright MCP — Aside로는 동작 줄이기·뷰포트 전환을 할 수 없음을 사용자에게 먼저 알린다)**

1. `browser_emulate_media` reducedMotion `reduce` → 새로고침 → `({ rm: await q.runReducedMotionChecks(), cross: await q.runCrossfade() })` — 모두 `failed: []`.
2. 동작 줄이기 해제, `browser_resize` 390×844 → 새로고침 → `q.runNarrowChecks()` — `failed: []`.
3. `browser_resize` 320×640 → 새로고침 → `q.runNarrowChecks()` — `failed: []`. 겹치면 매니페스트 `moods`·`credit`의 `at.mobile` 값(x·y·size)을 고치고 Task 2 Step 8 빌드부터 다시 한다.
4. 1440×900·390×844에서 세 분야 캡처(`browser_take_screenshot`)를 찍어 분야 버튼이 선비 얼굴·이름을 가리지 않는지 눈으로 본다.

- [ ] **Step 7: 키보드 검수 (Playwright)**

1440×900에서 새로고침 → `browser_press_key` Tab을 눌러 가며 `document.activeElement`가 `.mood[data-scene="si"]`→`seo`→`hwa` 순서로 오는지 본다(숨긴 메뉴·작품 보기를 거치지 않음).
`seo`에 포커스가 있을 때 Enter → `moodState().scene === 'seo'`. `hwa`에서 Space → `'hwa'`. 포커스 링이 보이는 캡처 1장.

- [ ] **Step 8: 관리자 검수**

`http://localhost:4178/admin` → 장면 목록에 "시 詩·서 書·화 畫" 3개 → "서 書"를 고르면 미리보기의 `document.documentElement.dataset.layerScene === 'seo'`, 큰 한자 "書", 분야 버튼 `aria-pressed` 서가 true.
레이어 "큰 한자" → 적용 범위 "이 장면" → 크기를 바꾸면 미리보기가 바뀐다 → 초안 저장 → 상태줄 "초안을 저장했습니다." → 되돌리기 → 초안 저장.
게시까지 확인했다면 `git status --short projects/hanbok-hero/dist`로 바뀐 생성물을 보고, 검수용 값이면 `git restore`로 커밋본에 되돌린다(이 작업이 만든 변경만).

- [ ] **Step 9: 커밋**

```bash
git add projects/hanbok-hero/dist/mood-switch.js projects/hanbok-hero/dist/app.js projects/hanbok-hero/dist/qa/browser-checks.js
git commit -F - <<'EOF'
선비 사이트: 분야 버튼으로 장면 전환, 배경 덮개 전환과 검수

버튼과 관리자가 같은 구독 경로로 화면을 맞춰야 상태가 어긋나지 않고, 배경을 못 불러오거나 저장이 막혀도 빈 화면 없이 분야가 바뀌게 하기 위해서다.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 4: 분야별 배경 그림 생성과 사용자 선택

**Files:**
- Create: `projects/hanbok-hero/dist/assets/mood-si.webp`, `mood-seo.webp`, `mood-hwa.webp`
- 후보 원본·합성 미리보기는 저장소 밖 임시 폴더(`<tmp>/moods/`)에 둔다

**Interfaces:**
- Consumes: `docs/참고/풍.jpg`(화풍 참조, 미추적), `projects/hanbok-hero/dist/assets/scholar-still.webp`(합성 미리보기용)
- Produces: 1920×1080 webp 3장(경로 위), 프롬프트 원문과 고른 후보·버린 이유 메모(Task 6 카드에 씀)

- [ ] **Step 1: Codex 이미지 생성 가능 확인**

```bash
mkdir -p "<tmp>/moods" && codex exec --skip-git-repo-check -s workspace-write -C "<tmp>/moods" "Use your built-in image generation tool to create one small plain grey test image and save it in the current directory as smoke.png. Reply only with the saved file path."
```

Expected: `<tmp>/moods/smoke.png`가 생긴다. 생기지 않으면 멈추고 사용자에게 알린다(대안: 프롬프트 카드를 사용자의 Codex 세션에 넘기기). fal로 넘어가지 않는다.

- [ ] **Step 2: 후보 생성 — 분야마다 3장**

공통 꼬리(`STYLE`):

```text
Painterly Korean concept art illustration with visible brush strokes, painted in the same style as the attached reference image (use the reference ONLY for painting style: brushwork, muted palette, soft texture; do not copy its subject, figure, lantern, text or seal). Wide landscape website hero background, dark and moody overall so light text stays readable. Composition: the left 45 percent of the frame is dark, calm and uncluttered for a title; the right-center area is quiet with no strong focal point because a character will stand there; the main landmark sits in the middle distance. Authentically Korean Joseon-era scenery, not Chinese, not Japanese. No people, no figures, no animals, no text, no calligraphy, no letters, no signboard, no hanging plaques, no nameplate, no red sun, no flags, no watermark, no signature, no seal stamp, no border or frame.
```

분야별 앞부분:

- `si`: `Moonlit night at Hyangwonjeong pavilion in Gyeongbokgung Palace, Seoul, Korea: the small hexagonal two-story Korean wooden pavilion with a grey giwa tile roof on a round islet in a still lotus pond, the arched wooden Chwihyanggyo bridge leading to it, a full moon low in a deep indigo sky, silver-blue moonlight on the water with soft reflections, willow and pine silhouettes, faint mist. Cool silver-blue palette.`
- `seo`: `Late night at a Korean hanok sarangchae, the scholar's study of a Joseon seowon Confucian academy, seen from the courtyard outside: low tiled roof with gently curved eaves, wooden maru veranda, hanji paper lattice doors glowing warm from a single oil lamp inside, stone steps, a plum tree with a few blossoms beside the earthen wall, ink-dark night with deep shadows. Palette of sumi ink blacks and warm vermilion-orange lamp glow.`
- `hwa`: `Dawn after rain at Inwangsan mountain in Seoul, Korea: pale granite rock peaks emerging from drifting clouds and mist, pine trees clinging to the rocks, layered ridges fading into fog, the mood of a Joseon true-view landscape painting, first light just touching the peaks. Palette of mineral malachite green, slate teal and soft grey.`

각 분야 `<id>`와 후보 번호 `<n>`(1~3)마다(백그라운드로 차례 실행):

```bash
codex exec --skip-git-repo-check -s workspace-write -C "<tmp>/moods" -i "C:/Users/ssool/개발/바이브코딩/interactive-web/docs/참고/풍.jpg" "Use your built-in image generation tool to create ONE landscape image (1536x1024). Prompt: <분야 앞부분> <STYLE> Save the image in the current directory as <id>-<n>.png and reply only with the saved file path."
```

Expected: `<tmp>/moods/{si,seo,hwa}-{1,2,3}.png` 9장. 실제로 넘긴 프롬프트 원문을 `<tmp>/moods/prompts.txt`에 그대로 남긴다(카드용).

- [ ] **Step 3: 거르기 — 수치와 합성 미리보기** — `<tmp>/moods/preview.py`

```python
import sys, glob, os
from PIL import Image, ImageDraw, ImageFont, ImageFilter
root = sys.argv[1]; still = Image.open(sys.argv[2]).convert('RGBA')
W, H = 1440, 900
font = ImageFont.truetype('C:/Windows/Fonts/malgun.ttf', 77)
def cover(im):
    s = max(W / im.width, H / im.height); im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    l, t = (im.width - W) // 2, (im.height - H) // 2; return im.crop((l, t, l + W, t + H))
def luma(im, box):
    g = im.convert('L').crop(box); return sum(g.getdata()) / (g.width * g.height)
for mood in ('si', 'seo', 'hwa'):
    tiles = []
    for path in sorted(glob.glob(os.path.join(root, f'{mood}-*.png'))):
        bg = cover(Image.open(path).convert('RGB'))
        title = luma(bg, (0, int(H * .45), int(W * .45), int(H * .85)))
        frame = bg.convert('RGBA'); size = round(W * .62)
        ch = still.resize((size, size), Image.LANCZOS); frame.alpha_composite(ch, (round(W * .64 - size / 2), round(H * .5 - size / 2)))
        d = ImageDraw.Draw(frame); d.text((round(W * .06), round(H * .60)), '소운 윤하담', font=font, fill=(243, 233, 216))
        d.text((20, 20), f'{os.path.basename(path)}  title-luma {title:.0f}', font=ImageFont.truetype('C:/Windows/Fonts/malgun.ttf', 28), fill=(255, 255, 0))
        tiles.append(frame.convert('RGB').resize((720, 450)))
        print(mood, os.path.basename(path), 'title-luma', round(title))
    sheet = Image.new('RGB', (720 * len(tiles), 450)); [sheet.paste(t, (720 * i, 0)) for i, t in enumerate(tiles)]
    sheet.save(os.path.join(root, f'sheet-{mood}.jpg'), quality=85)
```

Run: `python "<tmp>/moods/preview.py" "<tmp>/moods" projects/hanbok-hero/dist/assets/scholar-still.webp`
Expected: 후보마다 `title-luma` 숫자, `sheet-si.jpg`·`sheet-seo.jpg`·`sheet-hwa.jpg`.
후보 원본을 직접 보고 거른다. 버리는 조건은 아래 중 하나다.
- 일본·중국풍 단서(붉은 원, 붉은 기둥과 금색, 일본식 석등·토리이)
- 글자·현판·명패·낙관
- `title-luma`가 70보다 큼(이름 글자가 안 읽힘)
- 선비 머리 뒤에 강한 초점이 있음

버린 후보마다 이유를 `<tmp>/moods/notes.txt`에 한 줄씩 적는다. 분야마다 살아남은 후보가 0장이면 그 분야의 앞부분을 고쳐 Step 2를 다시 한다. 고친 내용과 이유도 notes에 적는다.

- [ ] **Step 4: 사용자에게 보여 주고 고르게 한다 (멈춤 지점)**

PowerShell: `Invoke-Item "<tmp>/moods/sheet-si.jpg"; Invoke-Item "<tmp>/moods/sheet-seo.jpg"; Invoke-Item "<tmp>/moods/sheet-hwa.jpg"`로 사용자 화면에 연다.
AskUserQuestion으로 분야마다 몇 번을 쓸지 묻는다(선택지: 살아남은 후보 번호들 + "다시 만들기"). "다시 만들기"면 사용자의 말을 프롬프트에 반영해 Step 2부터 그 분야만 다시 한다.

- [ ] **Step 5: 고른 그림을 webp로** — `<tmp>/moods/export.py`

```python
import sys, os
from PIL import Image
src, dst = sys.argv[1], sys.argv[2]
im = Image.open(src).convert('RGB')
w, h = im.size; th = round(w * 9 / 16); top = (h - th) // 2
im = im.crop((0, top, w, top + th)).resize((1920, 1080), Image.LANCZOS)
for q in (82, 76, 70, 64):
    im.save(dst, 'WEBP', quality=q, method=6)
    if os.path.getsize(dst) <= 200_000: break
print(dst, im.size, os.path.getsize(dst), 'q', q)
```

Run(분야마다): `python "<tmp>/moods/export.py" "<tmp>/moods/<id>-<n>.png" projects/hanbok-hero/dist/assets/mood-<id>.webp`
Expected: `(1920, 1080)`, 200000 바이트 이하. q64에서도 넘으면 크기를 그대로 적고 진행한다(카드에 기록).

- [ ] **Step 6: 커밋**

```bash
git add projects/hanbok-hero/dist/assets/mood-si.webp projects/hanbok-hero/dist/assets/mood-seo.webp projects/hanbok-hero/dist/assets/mood-hwa.webp
git commit -F - <<'EOF'
선비 사이트: 시·서·화 분야별 회화풍 배경 3장

분야를 바꿀 때 장소까지 달라져야 분위기 차이가 분명하다는 결정(안 B)에 따라 사용자가 고른 그림을 넣는다.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 5: 배경 적용과 분야별 값 다듬기

**Files:**
- Modify: `projects/hanbok-hero/dist/layers.manifest.js` (paper.image 기본값·장면 set, 필요하면 분야별 위치·색)
- Move: `projects/hanbok-hero/dist/assets/palace.webp` → `projects/hanbok-hero/art/superseded/palace.webp`
- Modify: `projects/hanbok-hero/scripts/moods.test.mjs`
- Generated: `dist/layers.css`, `dist/index.html`

**Interfaces:**
- Consumes: Task 4 webp 3장, Task 3 검수 함수
- Produces: 장면 `set.paper.image` = `./assets/mood-<id>.webp`

- [ ] **Step 1: 테스트를 새 기대값으로 바꾼다** — `moods.test.mjs`의 "지금은 세 분야 모두 같은 그림" 테스트를 교체

```js
test('분야별 배경 주소: 장면마다 다른 그림 3장', () => {
  assert.deepEqual(moodImages(manifest, published, []), ['./assets/mood-si.webp', './assets/mood-seo.webp', './assets/mood-hwa.webp']);
});
```

Run: `node --test projects/hanbok-hero/scripts/moods.test.mjs` → Expected: FAIL(`['./assets/palace.webp']`)

- [ ] **Step 2: 매니페스트에 배경 연결** — 임시 폴더에 `hanbok-moods-images.mjs`

```js
import { readFile, writeFile } from 'node:fs/promises';
const file = process.argv[2];
const m = JSON.parse((await readFile(file, 'utf8')).replace(/\r\n/g, '\n').replace(/^export default /, '').replace(/;\s*$/, ''));
m.layers.find(layer => layer.id === 'paper').params.image.default = './assets/mood-si.webp';
for (const id of ['si', 'seo', 'hwa']) (m.scenes[id].set.paper ||= {}).image = `./assets/mood-${id}.webp`;
await writeFile(file, 'export default ' + JSON.stringify(m, null, 2) + ';\n');
```

Run: `node <임시폴더>/hanbok-moods-images.mjs projects/hanbok-hero/dist/layers.manifest.js && git mv projects/hanbok-hero/dist/assets/palace.webp projects/hanbok-hero/art/superseded/palace.webp && pnpm --filter hanbok-hero build`
Run: `pnpm --filter hanbok-hero check` → Expected: 테스트 10 PASS, 엔트리 검사가 `mood-si.webp` 존재 확인, lint 오류 0.
`git grep -n "palace.webp" projects/hanbok-hero/dist` → Expected: 결과 없음.

- [ ] **Step 3: 분야별 값 다듬기**

서버를 켜고 1440×900, 1920×1080, 768×1024, 390×844에서 세 분야를 캡처한다(Playwright `browser_resize`·`browser_take_screenshot`, 12장).
다음을 보고 매니페스트 장면 `set`을 Edit로 고친다:
- 강조색이 배경 위에서 읽히는가 → `global.accent`
- 큰 한자가 배경의 밝은 곳과 겹쳐 지저분하지 않은가 → `glyph`의 `x`·`y`·`opacity`
- 선비가 배경 구도와 맞는가 → `character`의 `x`·`y`·`size`
- 이름이 읽히는가 → `paper.vignette`

예: `"seo": { "label": "서 書", "set": { …, "glyph": { "text": "書", "x": 24 } } }`.
고칠 때마다 `pnpm --filter hanbok-hero build` 후 다시 캡처한다. 바꾼 값과 이유를 `<tmp>/moods/notes.txt`에 적는다(Task 7 QA 기록용).

- [ ] **Step 4: 전체 검수 다시**

Task 3 Step 5(Aside: `runMoodChecks`·`runCrossfade`·`runMoodImageFailure`·`runMoodStorageBlocked`·`runChecks`·`runProbe`), Step 6(Playwright: 동작 줄이기·390·320), Step 7(키보드)을 다시 실행한다.
Expected: 모두 `failed: []`, probe 107/107.
`runMoodChecks` 결과에 `si/seo/hwa: 배경 ./assets/mood-<id>.webp`가 있어야 한다. `moods.preloaded`가 지금 분야를 뺀 두 그림이어야 한다.

- [ ] **Step 5: 사용자 확인 (멈춤 지점)**

1440×900 세 분야 캡처를 한 장으로 이어 붙여(`<tmp>/moods/final.jpg`) `Invoke-Item`으로 연다. AskUserQuestion으로 "이대로 / 고칠 점"을 묻는다. 고칠 점이 있으면 Step 3으로 돌아간다.

- [ ] **Step 6: 커밋**

```bash
git add projects/hanbok-hero/dist/layers.manifest.js projects/hanbok-hero/dist/layers.css projects/hanbok-hero/dist/index.html projects/hanbok-hero/scripts/moods.test.mjs projects/hanbok-hero/art/superseded/palace.webp projects/hanbok-hero/dist/assets/palace.webp
git commit -F - <<'EOF'
선비 사이트: 분야별 배경 적용과 강조색·위치 다듬기

새 배경 위에서 이름·큰 한자·강조색이 읽히도록 분야마다 값을 맞추고, 교체된 경회루 그림은 이력으로 옮긴다.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 6: 에셋 프롬프트 카드와 보관함

**Files:**
- Modify: `prompts/hanbok-hero.md` (카드 05·06·07 추가, 카드 03 교체 표시)
- Modify: `prompts/README.md` (표 한 줄)
- Generated: `prompts/gallery.html`, `prompts/catalog.json`

**Interfaces:**
- Consumes: `<tmp>/moods/prompts.txt`·`notes.txt`, Task 4·5 결과
- Produces: 최신 프롬프트 보관함(로컬·claude.ai)

- [ ] **Step 1: 양식 확인**

`prompts/README.md` 끝의 카드 양식과 `prompts/hanbok-hero.md` 카드 03(61~81행)을 읽는다.

- [ ] **Step 2: 카드 작성**

카드 03 제목을 `### 03 · 배경 — 경회루 야경 (palace) — 교체됨 2026-10-05`로 바꾼다. 이미지 경로와 파일 칸은 `../projects/hanbok-hero/art/superseded/palace.webp`로 바꾸고, "분야별 배경(05~07)으로 교체" 한 줄을 붙인다.
카드 05(시 `mood-si`)·06(서 `mood-seo`)·07(화 `mood-hwa`)을 카드 03 형식으로 추가한다. 각 카드에 들어갈 것:
- 썸네일 `<img src="../projects/hanbok-hero/dist/assets/mood-<id>.webp" width="360">`
- 파일·크기
- 쓰이는 곳: 레이어 `paper` 파라미터 `image`, 장면 `<id>`
- 도구·모드: Codex `image_gen`(`codex exec`), 날짜
- 참조 이미지: `docs/참고/풍.jpg`, 화풍만, 미추적 외부 작품
- 설정: 1536×1024 → 16:9 → 1920×1080 webp q값
- 한국어 요약
- **프롬프트 원문 그대로**(`prompts.txt`에서 복사)
- 생성 후 확인: title-luma 수치, 국적 단서·글자 검사 결과
- 버린 후보와 이유(`notes.txt`)

방향 전환도 적는다: "사진풍 경회루 → 회화풍 3장(사용자 결정 2026-10-05: 캐릭터·참조 화풍과 맞춤)".

- [ ] **Step 3: 표·보관함 갱신**

`prompts/README.md` 표의 hanbok-hero 행 설명에 "시·서·화 분야 배경 3장(회화풍, Codex)"을 넣는다.
Run: `pnpm prompts:build` → `pnpm check`
Expected: 생성물 최신성 검사 PASS.

- [ ] **Step 4: claude.ai 보관함 다시 게시 (기존 주소)**

Run: `node prompts/build.mjs --site "<tmp>/prompts-site"`
`Artifact` `action: read`, `url: https://claude.ai/artifact/HHxwUY317MGsbJkbDuwNPB`로 현재 게시본을 읽는다. 이어서 `Artifact` publish를 한다:
- `url`: 같은 주소
- `file_path`: `<tmp>/prompts-site/index.html`
- `files`: `<tmp>/prompts-site/media/` 아래 모든 파일을 `{"media/<이름>": "<tmp>/prompts-site/media/<이름>"}`으로

새 주소를 만들지 않는다. 게시가 거부되면 사용자에게 알리고 로컬 `prompts/gallery.html`만 갱신된 상태로 둔다.

- [ ] **Step 5: 커밋**

```bash
git add prompts/hanbok-hero.md prompts/README.md prompts/gallery.html prompts/catalog.json
git commit -F - <<'EOF'
프롬프트: 선비 분야별 배경 3장 카드와 경회루 교체 기록

다음에 배경을 다시 만들거나 다른 분야를 더할 때 같은 프롬프트·거르기 기준을 쓸 수 있게 원문과 버린 이유를 남기기 위해서다.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 7: 문서·검수 기록·레퍼런스 카드

**Files:**
- Modify: `projects/hanbok-hero/README.md`
- Modify: `projects/hanbok-hero/QA.md`
- Modify: `docs/10-인터랙티브-개발-참고원칙.md` (한복 히어로 절)
- Modify: `docs/11-레이어-설정-시스템-설계.md` (§9-5 선비 표)
- Modify: `references/motionsites.md` ("쓰인 작품")
- Generated: `references/gallery.html`, `references/catalog.json`
- Modify: `.claude/plans/2026-10-05-hanbok-moods.md` (끝에 "결과" 절)

- [ ] **Step 1: README**

제목·첫 문단을 "가상의 선비 소운 윤하담의 첫 화면. 시·서·화 분야를 고르면 배경·큰 한자·부제·강조색이 바뀌고, 선비는 포인터 쪽으로 고개를 돌린다"로 고친다.
"동작" 표에 행을 추가한다.
- 분야 버튼 클릭·탭·Enter·Space
- 다시 방문(저장 복구)
- 동작 줄이기에서 분야 전환

"레이어" 절을 고친다.
- 10레이어/107파라미터: `glyph`·`moods`·`credit`, `global.accent`·`moodFade`
- 장면 `si`·`seo`·`hwa`
- 분야별 값은 관리자 적용 범위 "이 장면"으로 바꾼다(장면 set이 공통 값보다 우선)
- `nav`·`cta`는 게시값으로 숨김(다음 단계 Work·About·Contact)

"에셋" 절에는 배경 3장과 카드 05~07 링크를 넣고, 경회루는 `art/superseded/`로 옮겼다고 적는다.

- [ ] **Step 2: QA.md 새 절**

`## 2026-10-05 시·서·화 분야 전환`을 기존 형식 표로 쓴다. 칸:
- `check`: 테스트 수, lint 10/107
- probe 107/107
- `runMoodChecks`·`runCrossfade`(일반·동작 줄이기)·`runMoodImageFailure`·`runMoodStorageBlocked`·`runChecks`
- 새로고침 복구·잘못된 저장값
- 390·320 `runNarrowChecks`
- 키보드
- 관리자
- 캡처 육안

각 칸에 실제 숫자를 적는다. "발견·해결"에는 Task 3~5 중 생긴 결함만 적는다.
"미검수"에 추가할 것:
- 실제 터치 기기
- 스크린리더 실제 낭독
- Safari
- 가로 휴대폰
- 느린 네트워크에서 미리 불러오기 전 전환

"알려진 한계"에 추가할 것:
- 장면 set 우선순위 때문에 공통 범위로 분야 값을 바꿔도 안 바뀜
- 배경을 못 불러온 분야는 이전 배경이 남음

- [ ] **Step 3: docs/10·docs/11**

docs/10 한복 히어로 절(100~115행 근처)에 새로 확인된 사실을 재사용 조건과 함께 적는다. 예:
- layer-kit 장면 전환은 `<img>` src를 즉시 바꾸므로, 겹침 전환은 바인딩 없는 덮개 이미지 + 디코딩 뒤 걷기로 한다
- 버튼과 관리자가 같은 `subscribe` 경로를 쓰게 한다
- 덮개를 보인 같은 프레임에 걷으면 전환이 안 일어난다(`offsetWidth`로 강제 계산)
- 실제로 겪은 결함이 있으면 그것도

docs/11 §9-5 표를 10레이어/107파라미터·장면 3개 기준으로 다시 쓴다(지금 표는 6/59로 낡았다).

- [ ] **Step 4: 레퍼런스 카드**

`references/motionsites.md`의 `| 쓰인 작품 | — |`을 `| 쓰인 작품 | hanbok-hero (분류 알약 → 시·서·화 분야 버튼, 2026-10-05) |`로 바꾼다.
Run: `pnpm references:build` → `pnpm check`. Expected: PASS.
`Artifact` read `https://claude.ai/artifact/4rBUtpL9VFToYxdkmjXoH1` → `node references/build.mjs --site "<tmp>/refs-site"` → 같은 주소로 publish(`file_path` index.html, `files` media 전부). 거부되면 사용자에게 알린다.

- [ ] **Step 5: 설계 문서 결과 절**

`.claude/plans/2026-10-05-hanbok-moods.md` 끝에 `## 결과 (2026-10-05)` 절을 붙인다. 넣을 것:
- lint·probe·검수 수치
- 고른 배경 후보 번호
- 다듬은 값
- 남은 일: 다음 단계 Work·About·Contact

- [ ] **Step 6: 커밋**

```bash
git add projects/hanbok-hero/README.md projects/hanbok-hero/QA.md "docs/10-인터랙티브-개발-참고원칙.md" "docs/11-레이어-설정-시스템-설계.md" references/motionsites.md references/gallery.html references/catalog.json .claude/plans/2026-10-05-hanbok-moods.md
git commit -F - <<'EOF'
문서: 선비 분야 전환의 검수 결과·교훈·레이어 표 기록

다음 세션이 분야 전환 구조와 덮개 전환의 함정, 검수 범위를 다시 읽고 Work·About·Contact 단계로 이어 갈 수 있게 하기 위해서다.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 8: JOOHO LAB 안 선비 체험 갱신, 전체 검사, 마무리

**Files:**
- Modify: `projects/jooho-lab/public/experiences/hanbok-hero/**` (`include:experience`가 다시 복사)
- Modify: `projects/jooho-lab/public/projects.js:79-85` (선비 항목)

- [ ] **Step 1: 체험 복사본 갱신**

Run: `pnpm --filter jooho-lab include:experience hanbok-hero`
Run: `git status --short projects/jooho-lab/public/experiences/hanbok-hero`
Expected: 새 `moods.js`·`mood-switch.js`·`assets/mood-*.webp`가 추가되고, `palace.webp`가 지워진다(복사 방식에 따라 다르면 그대로 보고).

- [ ] **Step 2: 작품 설명** — `projects/jooho-lab/public/projects.js` 선비 항목

```js
    id: 'hanbok-hero', liveUrl: './experiences/hanbok-hero/', title: '선비', subtitle: '시·서·화를 고르면 분위기가 바뀌는 선비의 첫 화면.',
    category: '인터랙티브', type: 'POINTER-REACTIVE HERO', number: '09', color: '#d9b25a',
    description: '가상의 선비 소운 윤하담의 첫 화면. 시(詩)·서(書)·화(畫) 분야를 고르면 회화풍 배경·큰 한자·문구·강조색이 바뀌고, 갓 쓴 선비는 포인터 쪽으로 고개를 돌립니다. 몸은 고정하고 얼굴만 26칸으로 나눠 끊김과 잔상 없이 따라옵니다.',
    details: ['시·서·화 분야별 배경과 분위기 전환', '포인터를 따라 사이 칸을 하나씩 지나는 고개 돌림', '레이어마다 바꿀 수 있는 설정과 관리자 화면'],
    tags: ['2.5D', '인터랙션', 'Kling', 'Codex'],
```

나머지 필드(`url`·`linkLabel`·`image`·`mark`)는 그대로 두고, `note`만 `'분야마다 다른 회화풍 배경 위의 캐릭터 히어로입니다.'`로 바꾼다. 썸네일은 바꾸지 않는다.

- [ ] **Step 3: 허브 검사·빌드**

Run: `pnpm --filter jooho-lab validate && pnpm --filter jooho-lab build`
Expected: PASS.
허브 개발 서버(`projects/jooho-lab/README.md`의 실행 명령)로 열어 확인한다:
1. 전시관에서 09 선비 → 체험 열기 → 분야 버튼 세 개 전환 → 복귀 버튼으로 전시관 복귀
2. 콘솔 오류 0(Aside)

- [ ] **Step 4: 전체 검사**

Run: `pnpm check` (루트)
Expected: 모든 앱 check, prompts·references 생성물 최신성 PASS. 기존에 있던 경고는 결과에 그대로 적는다.

- [ ] **Step 5: 커밋**

```bash
git add projects/jooho-lab/public/projects.js projects/jooho-lab/public/experiences/hanbok-hero
git commit -F - <<'EOF'
JOOHO LAB: 선비 체험을 시·서·화 분야 전환 버전으로 갱신

허브 안 선비 체험이 예전 한 장면 복사본으로 남아 있으면 작품 설명과 실제 화면이 어긋나기 때문이다.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

- [ ] **Step 6: 브랜치 전체 리뷰와 머지 제안**

새 리뷰어(가장 강한 모델)에게 `git diff main...hanbok-moods`와 두 계획 문서를 주고, 아래를 확인받는다.
- 레이어 계약(리터럴·fixed 이유)
- Review Focus 5개
- 접근성
- 실패 처리

지적을 반영한 뒤 사용자에게 보고하고, main 머지·푸시를 **제안만** 한다(승인 뒤 실행).
