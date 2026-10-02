# 한복 캐릭터 시선 히어로 구현 플랜

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 포트폴리오 첫 화면 `projects/hanbok-hero` — 한복 입은 여성 캐릭터 그림이 포인터 쪽으로 고개·시선을 돌리는 정적 사이트와 로컬 관리자.

**Architecture:** 3×3 방향 프레임 시트 `<img>`를 두 겹 프레임 상자 안에서 CSS `translate`로 잘라 보여 주고, JS는 포인터→구역(히스테리시스)만 계산해 프레임 상자의 `--in-gaze-col/row`를 바꾼다. 모든 시각값은 `layers.manifest.js`의 레이어 파라미터이며 `@iw/layer-kit`이 CSS 변수·텍스트·이미지 속성으로 바인딩한다. 관리자는 Potato의 `studio-server.mjs`(초안·게시·버전) 위에 매니페스트만 읽는 작은 패널을 새로 쓴다.

**Tech Stack:** 정적 HTML/CSS/ES 모듈(의존성 없음), `packages/layer-kit`(lint·probe·runtime), Node 22 `node:test`, 브라우저 검수는 Playwright MCP 또는 Aside에서 `qa/browser-checks.js` 실행.

**Spec:** `.claude/plans/2026-10-02-hanbok-hero.md`

## Global Constraints

- 모든 시각 요소는 매니페스트 레이어에 속하고, 레이어마다 `visible`(boolean, on `visible` / off `hidden`)·`opacity`(0~1)가 있다. lint가 강제한다.
- 조정 가능한 수치·색·문구는 CSS·JS 리터럴 금지. 구조상 고정값은 `/* layer-fixed: 이유 */` 주석과 매니페스트 `fixed`에 적는다.
- 이미지 값은 `./assets/...png|jpg|webp` 경로만 유효(`validImage`). 빈 값 불가 → 배경 기본은 투명 1px `./assets/blank.png`.
- 포트 4178. 작품 id `hanbok-hero`, 매니페스트 version 1, 장면 `hero` 하나, 구간 `wide (min-width:1600px)` · `tablet (max-width:1000px)` · `mobile (max-width:650px)`.
- 터치·키보드·`prefers-reduced-motion: reduce`에서는 정면 그림이 기본. 터치는 탭 위치를 한 번 보고 `returnDelay` 뒤 정면.
- 레퍼런스 문구·이미지·브랜드·코드는 옮기지 않는다. 에셋 프롬프트 원문은 `prompts/hanbok-hero.md`에 기록한다.
- 커밋은 사용자가 요청할 때만 한다(저장소 git 규칙). 플랜의 각 Task는 커밋 단계 대신 "검사 통과"로 끝난다.
- 완료 조건: `pnpm --filter hanbok-hero check` 통과(lint 오류 0), 브라우저 probe `failed: []`, `qa/browser-checks.js` 전 항목 통과, 루트 `pnpm check` 통과.

## Review Focus

1. **시트 이미지 404** — 정면 그림만 남고 프레임이 앞에 나오지 않아야 한다. 콘솔 경고 1회. → Task 5 `runChecks` "시트 실패 시 정면 유지".
2. **cols·rows를 1로 바꾼 경우(관리자)** — 중앙 칸 index 0, 음수·범위 밖 index 없이 정면만 보여야 한다. → Task 3 `gaze.test.mjs` `cellIndex` 1×1 케이스.
3. **구역 경계에서 포인터가 미세하게 떨릴 때** — 칸이 깜빡이면 안 된다. → Task 3 히스테리시스 테스트, Task 5 "경계 안쪽(0.3)에서는 유지".
4. **포인터가 창 밖으로 나가거나 탭이 숨겨질 때** — `returnDelay` 뒤 정면으로 돌아와야 하고 타이머가 겹쳐 두 번 돌아가지 않아야 한다. → Task 4 `schedule()` 단일 타이머, Task 5 "멈춘 뒤 정면 복귀".
5. **관리자에서 값 저장 실패(409 충돌, 400 검증)** — 화면값을 지우지 않고 상태줄에 이유를 보여야 한다. → Task 6 studio `status()` 경로, Task 7 수동 검수 항목.

---

### Task 1: 프로젝트 뼈대와 자리표시 에셋

**Files:**
- Create: `projects/hanbok-hero/package.json`
- Create: `projects/hanbok-hero/dist/layers.values.json`
- Create: `projects/hanbok-hero/scripts/make-placeholders.mjs`
- Create: `projects/hanbok-hero/scripts/make-placeholders.test.mjs`
- Copy: `projects/potato-designer/scripts/build-layers.mjs` → `projects/hanbok-hero/scripts/build-layers.mjs` (수정 없음)
- Copy: `projects/potato-designer/scripts/layer-check.mjs` → `projects/hanbok-hero/scripts/layer-check.mjs` (수정 없음)
- Copy: `projects/potato-designer/scripts/studio-server.mjs` → `projects/hanbok-hero/scripts/studio-server.mjs` (수정 없음)
- Create: `projects/hanbok-hero/scripts/serve.mjs`

**Interfaces:**
- Produces: `dist/assets/blank.png`(1×1 투명), `dist/assets/hanbok-still.png`(256×256 자리표시), `dist/assets/hanbok-sheet.png`(768×768, 3×3 자리표시 — 칸마다 눈동자가 다른 방향). `png(width, height, pixel)` → Buffer.
- Produces: `pnpm --filter hanbok-hero dev` → http://localhost:4178 (관리자 /admin).

- [ ] **Step 1: package.json 작성**

```json
{
  "name": "hanbok-hero",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "node scripts/serve.mjs",
    "build": "node scripts/build-layers.mjs && node scripts/check.mjs",
    "check": "node --test scripts/*.test.mjs && node scripts/check.mjs && node scripts/layer-check.mjs",
    "layers:build": "node scripts/build-layers.mjs",
    "layers:lint": "node scripts/layer-check.mjs",
    "assets:placeholder": "node scripts/make-placeholders.mjs"
  }
}
```

- [ ] **Step 2: 빈 값 파일**

`dist/layers.values.json`:

```json
{
  "format": "iw-layers/1",
  "work": "hanbok-hero",
  "manifestVersion": 1,
  "base": {},
  "responsive": {},
  "scenes": {}
}
```

- [ ] **Step 3: 스크립트 3개 복사, serve 작성**

```bash
cd projects && mkdir -p hanbok-hero/scripts hanbok-hero/dist/assets hanbok-hero/admin hanbok-hero/qa
cp potato-designer/scripts/build-layers.mjs potato-designer/scripts/layer-check.mjs potato-designer/scripts/studio-server.mjs hanbok-hero/scripts/
```

`scripts/serve.mjs`:

```js
import { createStudioServer } from './studio-server.mjs';
import { buildLayers } from './build-layers.mjs';
await buildLayers();
const port = Number(process.env.PORT || 4178);
createStudioServer().listen(port, '127.0.0.1', () => console.log(`작품: http://localhost:${port}/\n로컬 관리자: http://localhost:${port}/admin`));
```

- [ ] **Step 4: 실패하는 테스트 — PNG 생성기**

`scripts/make-placeholders.test.mjs`:

```js
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
```

- [ ] **Step 5: 실패 확인**

Run: `cd projects/hanbok-hero && node --test scripts/make-placeholders.test.mjs`
Expected: FAIL — `Cannot find module './make-placeholders.mjs'`

- [ ] **Step 6: 생성기 구현**

`scripts/make-placeholders.mjs`:

```js
// 실제 그림이 오기 전까지 쓰는 자리표시 PNG. 의존성 없이 zlib로 쓴다.
import { deflateSync } from 'node:zlib';
import { writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

function crc32(buf) { let crc = ~0; for (const byte of buf) { crc ^= byte; for (let k = 0; k < 8; k++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1)); } return ~crc >>> 0; }
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}
export function png(width, height, pixel) {
  const stride = width * 4 + 1, raw = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const [r, g, b, a] = pixel(x, y), i = y * stride + 1 + x * 4;
    raw[i] = r; raw[i + 1] = g; raw[i + 2] = b; raw[i + 3] = a;
  }
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4); ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}
// 칸 하나: 베이지 원(얼굴) + 눈동자 두 개. look = {col,row} ∈ {-1,0,1}가 눈동자 위치를 옮긴다.
export function cell(size, look) {
  const c = size / 2, face = size * 0.36, eyeY = c - size * 0.05, eyeDX = size * 0.13, pupil = size * 0.035;
  const px = look.col * size * 0.04, py = look.row * size * 0.03;
  return (x, y) => {
    for (const ex of [c - eyeDX, c + eyeDX]) if (Math.hypot(x - ex - px, y - eyeY - py) < pupil) return [40, 30, 30, 255];
    if (Math.hypot(x - c, y - eyeY) < face) return [236, 214, 190, 255];
    if (Math.hypot(x - c, y - c - size * 0.3) < size * 0.42 && y > eyeY + face * 0.7) return [196, 60, 70, 255];
    return [0, 0, 0, 0];
  };
}
export function sheet(cellSize, cols, rows) {
  return png(cellSize * cols, cellSize * rows, (x, y) => {
    const col = Math.floor(x / cellSize), row = Math.floor(y / cellSize);
    return cell(cellSize, { col: col - Math.floor((cols - 1) / 2), row: row - Math.floor((rows - 1) / 2) })(x - col * cellSize, y - row * cellSize);
  });
}
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const dir = new URL('../dist/assets/', import.meta.url);
  await mkdir(dir, { recursive: true });
  await writeFile(new URL('blank.png', dir), png(1, 1, () => [0, 0, 0, 0]));
  await writeFile(new URL('hanbok-still.png', dir), png(256, 256, cell(256, { col: 0, row: 0 })));
  await writeFile(new URL('hanbok-sheet.png', dir), sheet(256, 3, 3));
  console.log('자리표시 에셋 3개를 dist/assets에 썼습니다.');
}
```

- [ ] **Step 7: 테스트 통과 확인과 에셋 생성**

Run: `cd projects/hanbok-hero && node --test scripts/make-placeholders.test.mjs && node scripts/make-placeholders.mjs && ls dist/assets`
Expected: `# pass 1`, 그리고 `blank.png hanbok-sheet.png hanbok-still.png`

- [ ] **Step 8: 워크스페이스 등록**

Run: `pnpm install --offline` (루트). Expected: lockfile에 `projects/hanbok-hero` 추가, 오류 없음. 오프라인 실패 시 `pnpm install`.

---

### Task 2: 매니페스트·HTML·CSS (레이어 계약)

**Files:**
- Create: `projects/hanbok-hero/dist/layers.manifest.js`
- Create: `projects/hanbok-hero/dist/index.html`
- Create: `projects/hanbok-hero/dist/style.css`
- Create: `projects/hanbok-hero/scripts/check.mjs`

**Interfaces:**
- Produces: 레이어 id `global` `paper` `character` `title` `nav` `hint`. CSS 변수 `--L-<layer>-<key>`. 입력 변수 `--in-gaze-col` `--in-gaze-row`(프레임 상자 인라인 스타일, JS가 씀). 요소 클래스 `.character` `.gaze-range` `.character-still` `.sheet-frame.sheet-a` `.character-sheet` `.hint` `.nav a`.
- Consumes: Task 1의 자리표시 에셋 경로.

- [ ] **Step 1: 매니페스트 작성**

`dist/layers.manifest.js` (JSON 본문이어야 한다 — build-layers가 `export default`를 떼고 `JSON.parse`한다):

```js
export default {
  "work": "hanbok-hero",
  "version": 1,
  "initialScene": "hero",
  "breakpoints": [
    { "id": "wide", "label": "와이드", "media": "(min-width:1600px)" },
    { "id": "tablet", "label": "태블릿", "media": "(max-width:1000px)" },
    { "id": "mobile", "label": "모바일", "media": "(max-width:650px)" }
  ],
  "previewScreens": [
    { "id": "base", "label": "데스크톱", "width": 1440, "matches": [] },
    { "id": "wide", "label": "와이드", "width": 1920, "media": "(min-width:1600px)", "matches": ["wide"] },
    { "id": "tablet", "label": "태블릿", "width": 768, "media": "(max-width:1000px)", "matches": ["tablet"] },
    { "id": "mobile", "label": "모바일", "width": 390, "media": "(max-width:650px)", "matches": ["tablet", "mobile"] }
  ],
  "scenes": { "hero": { "label": "첫 화면", "set": {} } },
  "layers": [
    { "id": "global", "label": "전역 색·글꼴", "group": "전역", "el": ":root", "params": {
      "visible": { "label": "보이기", "type": "boolean", "default": true, "on": "visible", "off": "hidden" },
      "opacity": { "label": "불투명도", "type": "number", "default": 1, "min": 0, "max": 1, "step": 0.01, "unit": "" },
      "ink": { "label": "기본 글자 색", "type": "color", "default": "#2b2420", "css": "--ink" },
      "muted": { "label": "보조 글자 색", "type": "color", "default": "#7a6f66", "css": "--muted" },
      "fontScale": { "label": "글꼴 크기 배율", "type": "number", "default": 1, "min": 0.6, "max": 1.6, "step": 0.01, "unit": "" }
    } },
    { "id": "paper", "label": "배경", "group": "배경", "el": ".paper", "params": {
      "visible": { "label": "보이기", "type": "boolean", "default": true, "on": "visible", "off": "hidden" },
      "opacity": { "label": "불투명도", "type": "number", "default": 1, "min": 0, "max": 1, "step": 0.01, "unit": "" },
      "color": { "label": "배경색", "type": "color", "default": "#f3ede4" },
      "image": { "label": "배경 이미지", "type": "image", "default": "./assets/blank.png", "attr": ["img.paper-image", "src"] },
      "vignette": { "label": "비네트 세기", "type": "number", "default": 0.35, "min": 0, "max": 1, "step": 0.01, "unit": "" }
    } },
    { "id": "character", "label": "반응 캐릭터", "group": "무대", "el": ".character", "params": {
      "visible": { "label": "보이기", "type": "boolean", "default": true, "on": "visible", "off": "hidden" },
      "opacity": { "label": "불투명도", "type": "number", "default": 1, "min": 0, "max": 1, "step": 0.01, "unit": "" },
      "still": { "label": "정면 그림", "type": "image", "default": "./assets/hanbok-still.png", "attr": ["img.character-still", "src"] },
      "sheet": { "label": "방향 시트", "type": "image", "default": "./assets/hanbok-sheet.png", "attr": ["img.character-sheet", "src"] },
      "cols": { "label": "시트 가로 칸 수", "type": "number", "default": 3, "min": 1, "max": 5, "step": 1, "unit": "" },
      "rows": { "label": "시트 세로 칸 수", "type": "number", "default": 3, "min": 1, "max": 5, "step": 1, "unit": "" },
      "x": { "label": "가로 위치", "type": "number", "default": 62, "min": -50, "max": 150, "step": 0.1, "unit": "%", "at": { "mobile": 50 } },
      "y": { "label": "세로 위치", "type": "number", "default": 56, "min": -50, "max": 150, "step": 0.1, "unit": "%", "at": { "mobile": 46 } },
      "size": { "label": "크기", "type": "number", "default": 46, "min": 10, "max": 120, "step": 0.1, "unit": "vw", "at": { "wide": 40, "tablet": 60, "mobile": 92 } },
      "anchorY": { "label": "시선 기준점 높이", "type": "number", "default": 28, "min": 0, "max": 100, "step": 0.1, "unit": "%" },
      "range": { "label": "반응 범위", "type": "number", "default": 420, "min": 40, "max": 1200, "step": 1, "unit": "px" },
      "follow": { "label": "따라가는 지연", "type": "number", "default": 60, "min": 0, "max": 1000, "step": 10, "unit": "ms" },
      "fade": { "label": "크로스페이드", "type": "number", "default": 140, "min": 0, "max": 1000, "step": 10, "unit": "ms" },
      "returnDelay": { "label": "되돌아오는 시간", "type": "number", "default": 900, "min": 0, "max": 10000, "step": 50, "unit": "ms" },
      "react": { "label": "포인터 반응", "type": "boolean", "default": true, "on": "visible", "off": "hidden" }
    } },
    { "id": "title", "label": "이름·소개", "group": "글", "el": ".title", "params": {
      "visible": { "label": "보이기", "type": "boolean", "default": true, "on": "visible", "off": "hidden" },
      "opacity": { "label": "불투명도", "type": "number", "default": 1, "min": 0, "max": 1, "step": 0.01, "unit": "" },
      "name": { "label": "이름", "type": "text", "default": "이주호", "maxLength": 60, "text": "[data-layer-text=\"title/name\"]" },
      "tagline": { "label": "한 줄 소개", "type": "text", "default": "인터랙티브를 만드는 사람", "maxLength": 200, "text": "[data-layer-text=\"title/tagline\"]" },
      "color": { "label": "이름 색", "type": "color", "default": "#2b2420" },
      "size": { "label": "이름 크기", "type": "number", "default": 4.2, "min": 1, "max": 10, "step": 0.1, "unit": "rem", "at": { "mobile": 2.6 } },
      "x": { "label": "가로 위치", "type": "number", "default": 6, "min": -50, "max": 150, "step": 0.1, "unit": "%" },
      "y": { "label": "세로 위치", "type": "number", "default": 64, "min": -50, "max": 150, "step": 0.1, "unit": "%", "at": { "mobile": 72 } }
    } },
    { "id": "nav", "label": "메뉴", "group": "글", "el": ".nav", "params": {
      "visible": { "label": "보이기", "type": "boolean", "default": true, "on": "visible", "off": "hidden" },
      "opacity": { "label": "불투명도", "type": "number", "default": 1, "min": 0, "max": 1, "step": 0.01, "unit": "" },
      "item1": { "label": "메뉴 1", "type": "text", "default": "About", "maxLength": 30, "text": "[data-layer-text=\"nav/item1\"]" },
      "item2": { "label": "메뉴 2", "type": "text", "default": "Work", "maxLength": 30, "text": "[data-layer-text=\"nav/item2\"]" },
      "item3": { "label": "메뉴 3", "type": "text", "default": "Contact", "maxLength": 30, "text": "[data-layer-text=\"nav/item3\"]" },
      "color": { "label": "글자 색", "type": "color", "default": "#2b2420" },
      "size": { "label": "글자 크기", "type": "number", "default": 1, "min": 0.6, "max": 3, "step": 0.05, "unit": "rem" },
      "x": { "label": "가로 위치", "type": "number", "default": 6, "min": -50, "max": 150, "step": 0.1, "unit": "%" },
      "y": { "label": "세로 위치", "type": "number", "default": 5, "min": -50, "max": 150, "step": 0.1, "unit": "%" }
    } },
    { "id": "hint", "label": "안내 문구", "group": "글", "el": ".hint", "params": {
      "visible": { "label": "보이기", "type": "boolean", "default": true, "on": "visible", "off": "hidden" },
      "opacity": { "label": "불투명도", "type": "number", "default": 1, "min": 0, "max": 1, "step": 0.01, "unit": "" },
      "pointerText": { "label": "포인터 안내", "type": "text", "default": "마우스를 움직여 보세요", "maxLength": 80, "text": "[data-layer-text=\"hint/pointerText\"]" },
      "touchText": { "label": "터치 안내", "type": "text", "default": "화면을 눌러 보세요", "maxLength": 80, "text": "[data-layer-text=\"hint/touchText\"]" },
      "color": { "label": "글자 색", "type": "color", "default": "#7a6f66" },
      "size": { "label": "글자 크기", "type": "number", "default": 0.9, "min": 0.6, "max": 2, "step": 0.05, "unit": "rem" },
      "x": { "label": "오른쪽 끝 위치", "type": "number", "default": 94, "min": -50, "max": 150, "step": 0.1, "unit": "%" },
      "y": { "label": "세로 위치", "type": "number", "default": 90, "min": -50, "max": 150, "step": 0.1, "unit": "%" },
      "hideAfter": { "label": "자동으로 사라지는 시간", "type": "number", "default": 6000, "min": 0, "max": 30000, "step": 100, "unit": "ms" }
    } }
  ],
  "fixed": [
    { "reason": "레이아웃(absolute 무대, 정사각 캐릭터 상자, 두 겹 프레임 overflow)과 시트 칸 계산식(cols·rows에서 유도)은 구조다." },
    { "reason": "보이기 끔은 호스트가 data-layer-hidden 속성으로 표시하고 CSS가 display:none으로 받는다. 포커스 링 색·터치 타깃 크기는 접근성 대비를 위해 고정한다." },
    { "reason": "입력 방식(hover) 미디어 규칙으로 포인터/터치 안내를 고르고, prefers-reduced-motion에서 시트 프레임을 숨기는 것은 기능 구조다." }
  ]
};
```

- [ ] **Step 2: HTML 작성**

`dist/index.html`:

```html
<!doctype html>
<html lang="ko" data-layer-scene="hero">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#f3ede4">
  <meta name="description" content="한복을 입은 캐릭터가 시선으로 맞이하는 포트폴리오 첫 화면.">
  <title>JOOHO LAB — 한복 히어로</title>
  <link rel="stylesheet" href="./layers.css">
  <link rel="stylesheet" href="./style.css">
  <script type="module" src="./app.js"></script>
</head>
<body>
  <main class="stage" id="main">
    <div class="paper" aria-hidden="true"><img class="paper-image" data-layer-image="paper/image" src="./assets/blank.png" alt="" draggable="false"></div>
    <nav class="nav" aria-label="메뉴">
      <a href="#about" data-layer-text="nav/item1">About</a>
      <a href="#work" data-layer-text="nav/item2">Work</a>
      <a href="#contact" data-layer-text="nav/item3">Contact</a>
    </nav>
    <div class="character">
      <div class="gaze-range" aria-hidden="true"></div>
      <img class="character-still" data-layer-image="character/still" src="./assets/hanbok-still.png" alt="한복을 입은 여성 캐릭터가 정면을 바라본다" width="1024" height="1024" fetchpriority="high" draggable="false">
      <div class="sheet-frame sheet-a" aria-hidden="true"><img class="character-sheet" data-layer-image="character/sheet" src="./assets/hanbok-sheet.png" alt="" draggable="false"></div>
    </div>
    <h1 class="title"><span class="title-name" data-layer-text="title/name">이주호</span><span class="title-tagline" data-layer-text="title/tagline">인터랙티브를 만드는 사람</span></h1>
    <p class="hint"><span class="hint-pointer" data-layer-text="hint/pointerText">마우스를 움직여 보세요</span><span class="hint-touch" data-layer-text="hint/touchText">화면을 눌러 보세요</span></p>
  </main>
</body>
</html>
```

- [ ] **Step 3: CSS 작성**

`dist/style.css` (모든 조정값은 `var(--L-…)`; 고정값은 주석):

```css
/* layer-fixed: 레이아웃·숨김 속성·포커스 링·입력 방식/동작 줄이기 미디어 규칙은 구조이며 매니페스트 fixed에 이유를 적었다 */
* { box-sizing: border-box; }
html { font-size: calc(100% * var(--L-global-fontScale)); color: var(--ink); font-family: "Pretendard", "Noto Sans KR", system-ui, sans-serif; visibility: var(--L-global-visible); }
body { margin: 0; min-height: 100vh; overflow: hidden; opacity: var(--L-global-opacity); }
[data-layer-hidden] { display: none !important; } /* layer-fixed: 보이기 끔은 호스트 속성 */
.stage { position: relative; width: 100vw; height: 100vh; height: 100dvh; overflow: hidden; }

.paper { position: absolute; inset: 0; background: var(--L-paper-color); visibility: var(--L-paper-visible); opacity: var(--L-paper-opacity); }
.paper-image { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.paper::after { content: ""; position: absolute; inset: 0; pointer-events: none; opacity: var(--L-paper-vignette); background: radial-gradient(ellipse at center, transparent 45%, rgba(0, 0, 0, .55) 100%); }

.character { position: absolute; left: var(--L-character-x); top: var(--L-character-y); width: var(--L-character-size); aspect-ratio: 1; translate: -50% -50%; visibility: var(--L-character-visible); opacity: var(--L-character-opacity); }
/* JS가 읽는 값의 정본: 반응 범위(크기), 시선 기준점(top), 되돌아오는 시간(transition-delay) */
.gaze-range { position: absolute; left: 50%; top: var(--L-character-anchorY); width: calc(var(--L-character-range) * 2); height: calc(var(--L-character-range) * 2); translate: -50% -50%; border-radius: 50%; pointer-events: none; visibility: hidden; transition-delay: var(--L-character-returnDelay); }
.character-still { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; user-select: none; -webkit-user-drag: none; }
.sheet-frame { position: absolute; inset: 0; overflow: hidden; opacity: 0; --in-gaze-col: 1; --in-gaze-row: 1; visibility: var(--L-character-react); transition: opacity var(--L-character-fade) ease var(--L-character-follow); }
.sheet-frame.is-front { opacity: 1; }
/* layer-fixed: 시트 칸 계산식 — 이미지를 cols×rows 배로 키우고 한 칸만큼 밀어 보여 준다 */
.character-sheet { position: absolute; left: 0; top: 0; width: calc(var(--L-character-cols) * 100%); height: calc(var(--L-character-rows) * 100%); translate: calc(var(--in-gaze-col) * -100% / var(--L-character-cols)) calc(var(--in-gaze-row) * -100% / var(--L-character-rows)); user-select: none; -webkit-user-drag: none; }

.title { position: absolute; left: var(--L-title-x); top: var(--L-title-y); margin: 0; color: var(--L-title-color); visibility: var(--L-title-visible); opacity: var(--L-title-opacity); }
.title-name { display: block; font-size: var(--L-title-size); font-weight: 700; letter-spacing: -.02em; line-height: 1.05; }
.title-tagline { display: block; margin-top: .6em; font-size: calc(var(--L-title-size) * .3); font-weight: 400; color: var(--muted); }

.nav { position: absolute; left: var(--L-nav-x); top: var(--L-nav-y); display: flex; gap: 1.5em; font-size: var(--L-nav-size); color: var(--L-nav-color); visibility: var(--L-nav-visible); opacity: var(--L-nav-opacity); }
.nav a { color: inherit; text-decoration: none; padding: .4em .2em; min-height: 44px; display: inline-flex; align-items: center; } /* layer-fixed: 터치 타깃 */
.nav a:focus-visible { outline: 2px solid #1357ad; outline-offset: 3px; } /* layer-fixed: 포커스 링 대비 */

.hint { position: absolute; left: var(--L-hint-x); top: var(--L-hint-y); translate: -100% 0; margin: 0; font-size: var(--L-hint-size); color: var(--L-hint-color); visibility: var(--L-hint-visible); opacity: var(--L-hint-opacity); animation: hint-out 400ms ease var(--L-hint-hideAfter) both; }
.hint.is-done { animation: none; opacity: 0; visibility: hidden; transition: opacity .4s; } /* layer-fixed: 첫 반응 뒤 숨김 */
@keyframes hint-out { to { opacity: 0; visibility: hidden; } }

@media (hover: none) { .hint-pointer { display: none; } } /* layer-fixed: 입력 방식별 안내 */
@media (hover: hover) { .hint-touch { display: none; } }
@media (prefers-reduced-motion: reduce) { .sheet-frame { visibility: hidden; transition: none; } .hint { animation: none; } } /* layer-fixed: 동작 줄이기 */
```

- [ ] **Step 4: check.mjs 작성**

`scripts/check.mjs`:

```js
import { readFile, access, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
const root = new URL('../dist/', import.meta.url);
const html = await readFile(new URL('index.html', root), 'utf8');
const refs = [...html.matchAll(/(?:src|href)="\.\/([^"#]+)"/g)].map(match => match[1]);
for (const file of new Set(refs)) await access(new URL(file, root));
for (const file of (await readdir(root)).filter(name => name.endsWith('.js'))) {
  const syntax = spawnSync(process.execPath, ['--check', fileURLToPath(new URL(file, root))], { encoding: 'utf8' });
  if (syntax.status !== 0) throw new Error(syntax.stderr);
}
for (const file of ['studio.js', 'bridge.js']) {
  const syntax = spawnSync(process.execPath, ['--check', fileURLToPath(new URL('../admin/' + file, import.meta.url))], { encoding: 'utf8' });
  if (syntax.status !== 0) throw new Error(syntax.stderr);
}
for (const marker of ['class="gaze-range"', 'class="character-still"', 'sheet-frame sheet-a', 'class="character-sheet"', 'class="hint-pointer"', 'class="hint-touch"']) {
  if (!html.includes(marker)) throw new Error('Missing element: ' + marker);
}
console.log(`PASS: entrypoint, ${new Set(refs).size} local assets, syntax, required elements.`);
```

- [ ] **Step 5: 빌드·lint 실행 (app.js·admin이 아직 없어 check는 실패해야 정상)**

Run: `cd projects/hanbok-hero && node scripts/build-layers.mjs && node scripts/layer-check.mjs`
Expected: `Layer assets are current.` 뒤에 `PASS layer-kit lint: 6 layers, 51 parameters; generated CSS/runtime/HTML current.` lint 오류가 나오면 변수 이름(`--L-레이어-키`)이 CSS에 `var(...)`로 빠진 것이니 그 줄을 고친다. `dist/layers.css`·`dist/layers.values.js`·`dist/vendor/layer-kit/`가 생긴다.

---

### Task 3: 구역 계산 순수 함수 (`gaze.js`)

**Files:**
- Create: `projects/hanbok-hero/dist/gaze.js`
- Test: `projects/hanbok-hero/scripts/gaze.test.mjs`

**Interfaces:**
- Produces: `gazeZone({ dx, dy, range, prev }) → { col: -1|0|1, row: -1|0|1 }`, `cellIndex(zone, cols, rows) → { col, row }`(0부터, 범위 안), `ENTER = 0.38`, `LEAVE = 0.28`.

- [ ] **Step 1: 실패하는 테스트**

`scripts/gaze.test.mjs`:

```js
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
```

- [ ] **Step 2: 실패 확인**

Run: `cd projects/hanbok-hero && node --test scripts/gaze.test.mjs`
Expected: FAIL — `Cannot find module '../dist/gaze.js'`

- [ ] **Step 3: 구현**

`dist/gaze.js`:

```js
// 포인터 → 시선 구역. DOM 없음. 축마다 ENTER를 넘어야 옆 칸, LEAVE 아래로 내려와야 정면(히스테리시스).
export const ENTER = 0.38;
export const LEAVE = 0.28;
export function axisZone(n, prev = 0, enter = ENTER, leave = LEAVE) {
  if (prev > 0) return n > leave ? 1 : n < -enter ? -1 : 0;
  if (prev < 0) return n < -leave ? -1 : n > enter ? 1 : 0;
  return n > enter ? 1 : n < -enter ? -1 : 0;
}
export function gazeZone({ dx, dy, range, prev = { col: 0, row: 0 } }) {
  const clamp = value => Math.max(-1, Math.min(1, value / range));
  return { col: axisZone(clamp(dx), prev.col), row: axisZone(clamp(dy), prev.row) };
}
export function cellIndex(zone, cols, rows) {
  const centerCol = Math.floor((cols - 1) / 2), centerRow = Math.floor((rows - 1) / 2);
  return {
    col: Math.max(0, Math.min(cols - 1, centerCol + zone.col)),
    row: Math.max(0, Math.min(rows - 1, centerRow + zone.row))
  };
}
```

- [ ] **Step 4: 통과 확인**

Run: `cd projects/hanbok-hero && node --test scripts/gaze.test.mjs`
Expected: `# pass 3`

---

### Task 4: 런타임 `app.js`

**Files:**
- Create: `projects/hanbok-hero/dist/app.js`

**Interfaces:**
- Consumes: `createLayerHost`(vendor), `gazeZone`·`cellIndex`(Task 3), DOM 클래스(Task 2).
- Produces: `export const layerHost`, `export const gaze = { state() → { zone, ready, front }, show(zone), reset(), ready: Promise }`. `?studio=1`이면 `/admin/bridge.js`를 불러온다.

- [ ] **Step 1: app.js 작성**

```js
import manifest from './layers.manifest.js';
import published from './layers.values.js';
import { createLayerHost } from './vendor/layer-kit/index.js';
import { gazeZone, cellIndex } from './gaze.js';

export const layerHost = createLayerHost({ manifest, published });

const character = document.querySelector('.character');
const rangeEl = character.querySelector('.gaze-range');
const sheetImg = character.querySelector('.character-sheet');
const hint = document.querySelector('.hint');
const frameA = character.querySelector('.sheet-a');
const frameB = frameA.cloneNode(true);
frameB.classList.replace('sheet-a', 'sheet-b');
frameB.querySelector('img').removeAttribute('data-layer-image');
frameA.after(frameB);
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

let zone = { col: 0, row: 0 }, front = null, ready = false, timer = 0;

const sheetReady = new Promise(resolve => {
  const done = ok => { ready = ok; if (!ok) console.warn('방향 시트를 불러오지 못해 정면 그림만 보여 줍니다.'); resolve(ok); };
  if (sheetImg.complete) done(sheetImg.naturalWidth > 0);
  else { sheetImg.addEventListener('load', () => done(true), { once: true }); sheetImg.addEventListener('error', () => done(false), { once: true }); }
});

function reactive() { return ready && layerHost.get('character', 'react') !== false && !reducedMotion.matches; }
function readMs(property) { return (parseFloat(getComputedStyle(rangeEl)[property]) || 0) * 1000; }
function anchor() { const rect = rangeEl.getBoundingClientRect(); return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, range: rect.width / 2 }; }

function paint(frame, nextZone) {
  const cell = cellIndex(nextZone, layerHost.get('character', 'cols'), layerHost.get('character', 'rows'));
  frame.style.setProperty('--in-gaze-col', cell.col);
  frame.style.setProperty('--in-gaze-row', cell.row);
}
function show(nextZone, force = false) {
  if (!ready) return;
  if (!force && nextZone.col === zone.col && nextZone.row === zone.row) return;
  zone = { ...nextZone };
  const back = front === frameA ? frameB : frameA;
  paint(back, zone);
  front?.classList.remove('is-front');
  back.classList.add('is-front');
  front = back;
}
function reset() { clearTimeout(timer); timer = 0; show({ col: 0, row: 0 }); }
function schedule() { clearTimeout(timer); timer = setTimeout(reset, readMs('transitionDelay')); }
function look(x, y) {
  if (!reactive()) return;
  const { x: ax, y: ay, range } = anchor();
  const next = gazeZone({ dx: x - ax, dy: y - ay, range, prev: zone });
  if (next.col !== zone.col || next.row !== zone.row) { show(next); hint.classList.add('is-done'); }
  schedule();
}

document.addEventListener('pointermove', event => { if (event.pointerType !== 'touch') look(event.clientX, event.clientY); });
document.addEventListener('pointerdown', event => { if (event.pointerType === 'touch') look(event.clientX, event.clientY); });
document.documentElement.addEventListener('mouseleave', schedule);
window.addEventListener('blur', schedule);
document.addEventListener('visibilitychange', () => { if (document.hidden) reset(); });
reducedMotion.addEventListener('change', reset);

sheetReady.then(ok => { if (ok) show({ col: 0, row: 0 }, true); });
layerHost.subscribe(() => { if (!reactive()) reset(); else show(zone, true); });

export const gaze = { ready: sheetReady, show, reset, state: () => ({ zone: { ...zone }, ready, front: front?.classList.contains('sheet-a') ? 'a' : front ? 'b' : null }) };

if (new URLSearchParams(location.search).get('studio') === '1') import('/admin/bridge.js').catch(() => {});
```

- [ ] **Step 2: 수동 확인 (서버 실행)**

Run: `cd projects/hanbok-hero && node scripts/build-layers.mjs && PORT=4178 node scripts/serve.mjs` (PowerShell은 `$env:PORT=4178; node scripts/serve.mjs`). 브라우저(Aside)에서 http://localhost:4178 열기.
Expected: 베이지 배경, 오른쪽에 자리표시 얼굴, 마우스를 움직이면 눈동자 방향이 9칸으로 바뀌고 멈추면 0.9초 뒤 정면. 콘솔 오류 0.

- [ ] **Step 3: check 통과 (admin은 Task 6 전까지 실패하므로 syntax 검사 줄만 임시 확인)**

Run: `cd projects/hanbok-hero && node --test scripts/*.test.mjs && node scripts/layer-check.mjs`
Expected: `# pass 4`, lint PASS.

---

### Task 5: 브라우저 검수 함수 `qa/browser-checks.js`

**Files:**
- Create: `projects/hanbok-hero/qa/browser-checks.js`
- Modify: `projects/hanbok-hero/scripts/studio-server.mjs` — 없음. `/qa/*`는 dist 밖이라 서빙되지 않으므로 검사 파일은 `dist/qa/browser-checks.js`에 둔다 (아래 경로로 생성). `check.mjs`의 JS 문법 검사는 dist 바로 아래 파일만 보므로 영향 없음.

**Interfaces:**
- Produces: `runChecks() → { passed: string[], failed: string[] }`, `runProbe() → probe 결과`, `alphaReport(src) → { corners: number[], checkerboard: boolean }`, `runReducedMotionChecks()`, `runNarrowChecks()`.

- [ ] **Step 1: 파일 작성**

`dist/qa/browser-checks.js`:

```js
// 페이지 안에서 실행하는 검수. Playwright MCP의 browser_evaluate나 Aside repl에서
// (await import('/qa/browser-checks.js')).runChecks() 로 부른다. 새로 고친 직후에 실행한다.
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const pointer = (type, x, y, pointerType = 'mouse') => document.dispatchEvent(new PointerEvent(type, { clientX: x, clientY: y, pointerType, bubbles: true }));
function collector() { const passed = [], failed = []; return { passed, failed, check: (ok, name) => (ok ? passed : failed).push(name) }; }
function anchor() { const r = document.querySelector('.gaze-range').getBoundingClientRect(); return { cx: r.left + r.width / 2, cy: r.top + r.height / 2, r: r.width / 2 }; }

export async function runProbe() {
  const { layerHost } = await import('/app.js');
  const { probe } = await import('/vendor/layer-kit/probe.js');
  return probe(layerHost);
}

export async function runChecks() {
  const { layerHost, gaze } = await import('/app.js');
  const { setValue } = await import('/vendor/layer-kit/index.js');
  const { check, passed, failed } = collector();
  await gaze.ready;
  const still = document.querySelector('.character-still');
  check(still.complete && still.naturalWidth > 0, '정면 그림 로딩');
  check(gaze.state().ready && gaze.state().front === 'a', '시트 로딩 후 정면 칸이 앞 프레임');
  const { cx, cy, r } = anchor();
  pointer('pointermove', cx, cy); await wait(30);
  check(gaze.state().zone.col === 0 && gaze.state().zone.row === 0, '중앙에서는 정면');
  pointer('pointermove', cx + r, cy); await wait(30);
  check(gaze.state().zone.col === 1 && gaze.state().zone.row === 0, '오른쪽을 본다');
  check(document.querySelector('.hint').classList.contains('is-done'), '첫 반응 뒤 안내 숨김');
  const front = document.querySelector('.sheet-frame.is-front');
  check(front && front.style.getPropertyValue('--in-gaze-col') === '2', '앞 프레임이 오른쪽 칸(index 2)');
  pointer('pointermove', cx + r * 0.3, cy); await wait(30);
  check(gaze.state().zone.col === 1, '경계 안쪽(0.3)에서는 유지 — 히스테리시스');
  pointer('pointermove', cx + r * 0.2, cy); await wait(30);
  check(gaze.state().zone.col === 0, '0.2에서는 정면 복귀');
  pointer('pointermove', cx, cy - r * 3); await wait(30);
  check(gaze.state().zone.row === -1, '범위 밖 위쪽은 가장 바깥 칸');
  const delay = (parseFloat(getComputedStyle(document.querySelector('.gaze-range')).transitionDelay) || 0) * 1000;
  await wait(delay + 250);
  check(gaze.state().zone.col === 0 && gaze.state().zone.row === 0, '멈춘 뒤 returnDelay 지나면 정면');
  pointer('pointerdown', cx - r, cy, 'touch'); await wait(30);
  check(gaze.state().zone.col === -1, '터치 탭으로 한 번 본다');
  gaze.reset(); await wait(30);
  pointer('pointermove', cx + r, cy, 'touch'); await wait(30);
  check(gaze.state().zone.col === 0, '터치 이동은 무시');
  check([...document.querySelectorAll('.nav a')].length === 3 && [...document.querySelectorAll('.nav a')].every(a => a.tabIndex >= 0), '메뉴 3개 키보드 도달');
  const original = layerHost.values;
  layerHost.setValues(setValue(original, 'hero', 'base', 'character', 'react', false)); await wait(30);
  check(getComputedStyle(document.querySelector('.sheet-frame')).visibility === 'hidden', 'react 끄면 시트 숨김');
  pointer('pointermove', cx + r, cy); await wait(30);
  check(gaze.state().zone.col === 0, 'react 꺼진 동안 반응 없음');
  layerHost.setValues(setValue(original, 'hero', 'base', 'character', 'cols', 1)); await wait(30);
  pointer('pointermove', cx + r, cy); await wait(30);
  check(document.querySelector('.sheet-frame.is-front').style.getPropertyValue('--in-gaze-col') === '0', 'cols 1이면 index 0 고정');
  layerHost.setValues(original); gaze.reset();
  check(document.documentElement.scrollWidth <= window.innerWidth, '가로 스크롤 없음');
  return { passed, failed };
}

export async function runSheetFailure() {
  // 시트 경로를 깨뜨린 새 페이지에서 호출한다: 정면만 남아야 한다.
  const { gaze } = await import('/app.js');
  const { check, passed, failed } = collector();
  await gaze.ready;
  check(gaze.state().ready === false, '시트 실패를 인지');
  check(!document.querySelector('.sheet-frame.is-front'), '앞 프레임 없음 — 정면 그림만');
  const { cx, cy, r } = anchor();
  pointer('pointermove', cx + r, cy); await wait(30);
  check(gaze.state().zone.col === 0, '시트 없이는 반응하지 않음');
  return { passed, failed };
}

export async function runReducedMotionChecks() {
  const { gaze } = await import('/app.js');
  const { check, passed, failed } = collector();
  await gaze.ready;
  check(matchMedia('(prefers-reduced-motion: reduce)').matches, '동작 줄이기 에뮬레이션 켜짐');
  check(getComputedStyle(document.querySelector('.sheet-frame')).visibility === 'hidden', '시트 프레임 숨김');
  const { cx, cy, r } = anchor();
  pointer('pointermove', cx + r, cy); await wait(30);
  check(gaze.state().zone.col === 0, '반응 없음');
  return { passed, failed };
}

export function runNarrowChecks() {
  const { check, passed, failed } = collector();
  const inView = el => { const r = el.getBoundingClientRect(); return r.left >= 0 && r.right <= window.innerWidth && r.top >= 0 && r.bottom <= window.innerHeight; };
  check(window.innerWidth <= 650, '390px 뷰포트');
  check(document.documentElement.scrollWidth <= window.innerWidth, '가로 스크롤 없음');
  check(inView(document.querySelector('.title')), '이름이 화면 안');
  check(inView(document.querySelector('.nav')), '메뉴가 화면 안');
  check(inView(document.querySelector('.character')), '캐릭터가 화면 안');
  return { passed, failed };
}

export async function alphaReport(src) {
  const img = new Image(); img.src = src; await img.decode();
  const canvas = document.createElement('canvas'); canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0);
  const at = (x, y) => [...ctx.getImageData(x, y, 1, 1).data];
  const corners = [at(2, 2), at(canvas.width - 3, 2), at(2, canvas.height - 3), at(canvas.width - 3, canvas.height - 3)];
  const gray = p => Math.abs(p[0] - p[1]) < 12 && Math.abs(p[1] - p[2]) < 12 && p[3] === 255 && p[0] > 150;
  const steps = [at(2, 2), at(18, 2), at(34, 2), at(50, 2)];
  return { size: [canvas.width, canvas.height], cornerAlpha: corners.map(p => p[3]), checkerboard: steps.every(gray) && new Set(steps.map(p => p[0] >> 4)).size > 1 };
}
```

- [ ] **Step 2: 서버 띄우고 Playwright MCP로 실행**

서버: `cd projects/hanbok-hero && node scripts/serve.mjs` (백그라운드).
MCP 순서:
1. `browser_resize` 1440×900 → `browser_navigate` http://localhost:4178/ → `browser_evaluate` `async () => (await import('/qa/browser-checks.js')).runProbe()` → Expected: `failed: []`, `total: 51`.
2. `browser_navigate` 같은 주소(새로 고침) → `browser_evaluate` `async () => (await import('/qa/browser-checks.js')).runChecks()` → Expected: `failed: []`.
3. `browser_emulate_media` reducedMotion `reduce` → navigate → `runReducedMotionChecks()` → `failed: []`. 다시 `no-preference`.
4. `browser_resize` 390×844 → navigate → `runNarrowChecks()` → `failed: []`.
5. 시트 실패: `browser_navigate` 후 `browser_evaluate`로 `document.querySelector('.character-sheet').src='/assets/missing.png'` 는 이미 로드된 뒤라 의미가 없다. 대신 `dist/layers.values.json`의 `base.character.sheet`를 `"./assets/missing.png"`로 잠시 바꾸고 `node scripts/build-layers.mjs` → 새로 고침 → `runSheetFailure()` → `failed: []`. 끝나면 값 파일을 되돌리고 다시 빌드한다.
6. `browser_console_messages` → 오류 0 (시트 실패 단계의 경고 1개는 예상).

Expected: 위 모두 통과. 실패하면 해당 Task의 코드로 돌아가 고치고 다시 실행한다.

---

### Task 6: 로컬 관리자 (Scene Studio 축소판)

**Files:**
- Create: `projects/hanbok-hero/admin/index.html`
- Create: `projects/hanbok-hero/admin/studio.css`
- Create: `projects/hanbok-hero/admin/studio.js`
- Create: `projects/hanbok-hero/admin/bridge.js`

**Interfaces:**
- Consumes: `studio-server.mjs` API — `GET /api/studio/state` → `{published, values, revision, draftRevision, baseRevision, conflict}`, `PUT /api/studio/draft` `{values, revision, draftRevision}`, `POST /api/studio/publish` `{draftRevision}`, `GET /api/studio/versions` → `{versions:[]}`, `POST /api/studio/restore` `{version, draftRevision}`. 오류는 `{error}` + 4xx.
- Consumes: 미리보기 iframe `/?studio=1` 안의 `window.hanbokStudio = { host, setValues(values), setScene(id), select(id), callbacks(onSelect) }` (bridge).

- [ ] **Step 1: bridge.js**

```js
import { layerHost } from '/app.js';
let selected = null, onSelect = () => {};
const style = document.createElement('style');
style.textContent = '.studio-selected{outline:2px dashed #dc593c!important;outline-offset:3px!important}html.studio-inspect .hint{animation-play-state:paused!important}';
document.head.append(style);
const elements = id => { const layer = layerHost.manifest.layers.find(item => item.id === id); return layer ? [...document.querySelectorAll(layer.el)] : []; };
function highlight() { document.querySelectorAll('.studio-selected').forEach(el => el.classList.remove('studio-selected')); if (selected) elements(selected).forEach(el => el.classList.add('studio-selected')); }
function pick(x, y) {
  const hits = [];
  for (const layer of layerHost.manifest.layers) {
    if (layer.id === 'global') continue;
    for (const el of elements(layer.id)) {
      const rect = el.getBoundingClientRect();
      if (getComputedStyle(el).visibility === 'hidden' || !rect.width || !rect.height) continue;
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) hits.push({ id: layer.id, area: rect.width * rect.height });
    }
  }
  return hits.sort((a, b) => a.area - b.area)[0]?.id;
}
document.addEventListener('pointerdown', event => { if (event.button !== 0) return; const id = pick(event.clientX, event.clientY); if (!id) return; event.preventDefault(); event.stopImmediatePropagation(); selected = id; highlight(); onSelect(id); }, true);
document.addEventListener('click', event => { event.preventDefault(); event.stopImmediatePropagation(); }, true);
window.hanbokStudio = {
  host: layerHost,
  setValues(values) { layerHost.setValues(JSON.parse(JSON.stringify(values))); highlight(); },
  setScene(id) { layerHost.setScene(id); highlight(); },
  select(id) { selected = id; highlight(); },
  callbacks(select) { onSelect = select; }
};
document.documentElement.classList.add('studio-inspect');
```

- [ ] **Step 2: index.html**

```html
<!doctype html>
<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Scene Studio · 한복 히어로</title><link rel="stylesheet" href="/admin/studio.css"><script type="module" src="/admin/studio.js"></script></head>
<body>
  <aside class="panel">
    <h1>Scene Studio <small>한복 히어로</small></h1>
    <div class="row"><label>장면 <select id="scene"></select></label><label>화면 <select id="screen"></select></label><label>적용 범위 <select id="scope"><option value="scene">이 장면</option><option value="all">공통</option></select></label></div>
    <nav id="layers" aria-label="레이어"></nav>
    <section id="inspector" aria-live="polite"></section>
    <div class="row actions">
      <button id="save">초안 저장</button><button id="publish">게시</button>
      <select id="versions" aria-label="게시 이력"></select><button id="restore">이 버전 불러오기</button>
      <button id="export">내보내기</button><label class="file">불러오기 <input id="import" type="file" accept="application/json"></label>
    </div>
    <p id="status" role="status"></p>
  </aside>
  <section class="preview" aria-label="실제 작품 미리보기"><div class="frame"><iframe id="preview" src="/?studio=1" title="작품 미리보기"></iframe></div></section>
</body></html>
```

- [ ] **Step 3: studio.css**

```css
* { box-sizing: border-box; }
body { margin: 0; display: grid; grid-template-columns: 380px 1fr; height: 100vh; font: 13px/1.5 system-ui, sans-serif; color: #222; background: #e9e6e1; }
.panel { overflow: auto; padding: 14px; background: #fff; border-right: 1px solid #ddd; }
.panel h1 { font-size: 16px; margin: 0 0 10px; } .panel h1 small { font-weight: 400; color: #777; margin-left: 6px; }
.row { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 10px; } .row label { display: flex; flex-direction: column; gap: 2px; font-size: 12px; color: #555; }
#layers { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
#layers button { padding: 6px 10px; border: 1px solid #ccc; border-radius: 999px; background: #fafafa; cursor: pointer; }
#layers button[aria-pressed="true"] { background: #222; color: #fff; border-color: #222; }
.param { display: grid; grid-template-columns: 110px 1fr auto; gap: 6px; align-items: center; padding: 6px 0; border-bottom: 1px solid #eee; }
.param .label { color: #444; } .param .label.set::after { content: " ●"; color: #dc593c; }
.param input[type="number"], .param textarea, .param select { width: 100%; } .param input[type="range"] { width: 100%; }
.param .num { display: flex; gap: 6px; } .param .num input[type="number"] { width: 84px; }
.param button { padding: 2px 6px; font-size: 11px; }
.actions button, .actions .file { padding: 6px 10px; border: 1px solid #bbb; border-radius: 6px; background: #f6f6f6; cursor: pointer; }
.actions .file input { display: none; }
#status { min-height: 1.5em; color: #b4321f; white-space: pre-wrap; } #status.ok { color: #2a7a3b; }
.preview { display: grid; place-items: center; overflow: auto; padding: 16px; }
.frame { background: #fff; box-shadow: 0 10px 40px rgba(0, 0, 0, .18); }
#preview { display: block; border: 0; width: 1440px; height: 900px; max-width: 100%; }
```

- [ ] **Step 4: studio.js**

```js
import manifest from '/layers.manifest.js';
import { setValue, resolve, scopeMap, validateValues } from '/vendor/layer-kit/index.js';
const $ = id => document.getElementById(id);
const el = (tag, text, cls) => { const node = document.createElement(tag); if (text !== undefined) node.textContent = text; if (cls) node.className = cls; return node; };
let state, values, bridge, scene = manifest.initialScene, selected = manifest.layers.find(layer => layer.id !== 'global').id;
const screen = () => manifest.previewScreens.find(item => item.id === $('screen').value) || manifest.previewScreens[0];
const scope = () => [$('scope').value === 'all' ? 'all' : scene, screen().id === 'base' ? 'base' : screen().id];
const resolved = () => resolve(manifest, values, scene, screen().matches);
function status(message, ok = false) { $('status').textContent = message; $('status').className = ok ? 'ok' : ''; }
async function api(path, options) {
  const response = await fetch('/api/studio/' + path, { headers: { 'Content-Type': 'application/json' }, ...options });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `${response.status} 요청 실패`);
  return data;
}
function push() { bridge?.setValues(values); }
function accept(next) { state = next; values = next.values; render(); push(); if (next.conflict) status('게시본이 바뀌었습니다. 내보내기로 초안을 보관한 뒤 다시 불러오세요.'); }
function update(layer, key, value) { const [s, v] = scope(); values = setValue(values, s, v, layer, key, value); push(); renderInspector(); }
function renderLayers() {
  $('layers').replaceChildren(...manifest.layers.map(layer => { const button = el('button', layer.label); button.setAttribute('aria-pressed', String(layer.id === selected)); button.onclick = () => { selected = layer.id; bridge?.select(layer.id); renderLayers(); renderInspector(); }; return button; }));
}
function control(layer, key, param, value) {
  const wrap = el('div', undefined, 'param');
  const [s, v] = scope(); const overridden = scopeMap(JSON.parse(JSON.stringify(values)), s, v)[layer.id]?.[key] !== undefined;
  wrap.append(el('span', param.label, 'label' + (overridden ? ' set' : '')));
  let input;
  if (param.type === 'number') {
    input = el('div', undefined, 'num'); const range = el('input'), number = el('input');
    for (const field of [range, number]) { field.min = param.min; field.max = param.max; field.step = param.step || 1; field.value = value; }
    range.type = 'range'; number.type = 'number';
    const commit = raw => { const n = Number(raw); if (!Number.isFinite(n) || n < param.min || n > param.max) return status(`${param.label}: ${param.min}~${param.max} 사이여야 합니다.`); range.value = number.value = n; update(layer.id, key, n); status(''); };
    range.oninput = () => commit(range.value); number.onchange = () => commit(number.value);
    input.append(range, number);
  } else if (param.type === 'boolean') { input = el('input'); input.type = 'checkbox'; input.checked = value; input.onchange = () => update(layer.id, key, input.checked); }
  else if (param.type === 'color') { input = el('input'); input.type = 'color'; input.value = value.slice(0, 7); input.oninput = () => update(layer.id, key, input.value); }
  else if (param.type === 'text') { input = el('textarea'); input.rows = 2; input.value = value; input.maxLength = param.maxLength || 3000; input.oninput = () => update(layer.id, key, input.value); }
  else if (param.type === 'select') { input = el('select'); for (const option of param.options) { const o = el('option', option.label); o.value = option.value; o.selected = option.value === value; input.append(o); } input.onchange = () => update(layer.id, key, input.value); }
  else if (param.type === 'image') {
    input = el('label', value.length > 60 ? '(업로드한 이미지)' : value); const file = el('input'); file.type = 'file'; file.accept = 'image/png,image/jpeg,image/webp'; file.style.display = 'block';
    file.onchange = () => { const picked = file.files[0]; if (!picked) return; if (picked.size > 2000000) return status('이미지는 2MB 이하만 올릴 수 있습니다.'); const reader = new FileReader(); reader.onload = () => update(layer.id, key, reader.result); reader.readAsDataURL(picked); };
    input.append(file);
  }
  const reset = el('button', '되돌리기'); reset.disabled = !overridden; reset.onclick = () => update(layer.id, key, undefined);
  wrap.append(input, reset);
  return wrap;
}
function renderInspector() {
  const layer = manifest.layers.find(item => item.id === selected), current = resolved()[layer.id];
  const [s, v] = scope();
  $('inspector').replaceChildren(el('h2', `${layer.label} · ${s === 'all' ? '공통' : manifest.scenes[s].label} · ${v === 'base' ? '기본 화면' : screen().label}`), ...Object.entries(layer.params).map(([key, param]) => control(layer, key, param, current[key])));
}
function renderVersions(list) { $('versions').replaceChildren(...list.map(name => { const o = el('option', name); o.value = name; return o; })); $('restore').disabled = !list.length; }
function render() { renderLayers(); renderInspector(); $('preview').style.width = screen().width + 'px'; }
function body(extra) { return { method: 'PUT', body: JSON.stringify({ values, revision: state.revision, draftRevision: state.draftRevision, ...extra }) }; }
$('save').onclick = async () => { try { accept(await api('draft', body())); status('초안을 저장했습니다.', true); } catch (error) { status(error.message); } };
$('publish').onclick = async () => { try { accept(await api('draft', body())); accept(await api('publish', { method: 'POST', body: JSON.stringify({ draftRevision: state.draftRevision }) })); renderVersions((await api('versions')).versions); status('게시했습니다. dist/layers.values.json과 layers.css가 갱신되었습니다.', true); } catch (error) { status(error.message); } };
$('restore').onclick = async () => { try { accept(await api('restore', { method: 'POST', body: JSON.stringify({ version: $('versions').value, draftRevision: state.draftRevision }) })); status('이전 게시본을 초안으로 불러왔습니다. 확인 후 게시하세요.', true); } catch (error) { status(error.message); } };
$('export').onclick = () => { const url = URL.createObjectURL(new Blob([JSON.stringify(values, null, 2)], { type: 'application/json' })); const a = el('a'); a.href = url; a.download = 'hanbok-hero-draft.json'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); };
$('import').onchange = async () => { const file = $('import').files[0]; if (!file) return; try { const checked = validateValues(manifest, JSON.parse(await file.text()), { allowData: true }); if (checked.errors.length) throw new Error(checked.errors.join('\n')); values = checked.values; push(); render(); status('불러왔습니다. 초안 저장을 눌러야 서버에 남습니다.', true); } catch (error) { status('불러오기 실패: ' + error.message); } };
$('scene').onchange = () => { scene = $('scene').value; bridge?.setScene(scene); render(); };
$('screen').onchange = render; $('scope').onchange = renderInspector;
$('scene').replaceChildren(...Object.entries(manifest.scenes).map(([id, def]) => { const o = el('option', def.label); o.value = id; return o; }));
$('screen').replaceChildren(...manifest.previewScreens.map(item => { const o = el('option', `${item.label} ${item.width}`); o.value = item.id; return o; }));
async function attach() {
  for (let i = 0; i < 100; i++) { const candidate = $('preview').contentWindow?.hanbokStudio; if (candidate) { bridge = candidate; break; } await new Promise(resolve => setTimeout(resolve, 50)); }
  if (!bridge) return status('미리보기와 연결하지 못했습니다. 새로 고침해 주세요.');
  bridge.callbacks(id => { selected = id; renderLayers(); renderInspector(); });
  bridge.setScene(scene); bridge.select(selected); push();
}
$('preview').addEventListener('load', attach);
try { accept(await api('state')); renderVersions((await api('versions')).versions); } catch (error) { status(error.message); }
```

- [ ] **Step 5: check 통과**

Run: `cd projects/hanbok-hero && pnpm check`
Expected: 테스트 `# pass 4`, `PASS: entrypoint, … required elements.`, `PASS layer-kit lint: 6 layers, 51 parameters; …`.

- [ ] **Step 6: 관리자 수동 검수 (Aside 또는 Playwright MCP, http://localhost:4178/admin)**

1. 미리보기가 1440 폭으로 뜨고, 캐릭터를 누르면 왼쪽 레이어 버튼이 `반응 캐릭터`로 바뀐다.
2. `크기` 슬라이더를 움직이면 미리보기 캐릭터가 즉시 커지고 라벨에 ● 표시, `되돌리기`가 켜진다.
3. 화면을 `모바일 390`으로 바꾸면 iframe이 390 폭이 되고 캐릭터가 가운데(x 50)로 간다. 이 상태에서 값을 바꾸면 모바일 구간 값만 바뀐다(데스크톱으로 돌아오면 원래 값).
4. `이름`을 바꾸면 미리보기 글자가 바뀐다. `초안 저장` → 상태줄 초록. 새로 고침 후 값이 남아 있다.
5. `게시` → `dist/layers.values.json`에 값이 들어가고 `dist/layers.css`가 바뀐다. 이력 select에 버전이 생긴다. `이 버전 불러오기` → 초안이 이전 값으로.
6. 범위 밖 숫자(예: 크기 999) 입력 → 상태줄에 범위 안내, 값은 바뀌지 않는다.
7. 다른 탭에서 같은 관리자를 열어 먼저 저장한 뒤 이 탭에서 저장 → 409 문구가 상태줄에 보이고 화면값은 유지된다.
Expected: 7개 모두 확인. 결과를 `QA.md`에 적는다(Task 8).
7단계 끝나면 `dist/layers.values.json`을 `git checkout` 대신 관리자에서 모든 값 되돌리기 → 게시로 비운다. 비어 있어야 다음 `pnpm check`의 생성물 최신성 검사가 깔끔하다(값이 남아도 검사는 통과한다).

---

### Task 7: 에셋 프롬프트 카드와 실제 그림 교체

**Files:**
- Create: `prompts/hanbok-hero.md`
- Modify: `prompts/README.md` — 파일 표에 한 줄, "한눈에 보기 › 이미지" 표에 두 줄
- Modify: `projects/hanbok-hero/dist/assets/hanbok-still.png`, `hanbok-sheet.png` (사용자가 생성한 결과로 교체)

**Interfaces:**
- Consumes: `prompts/README.md` 끝의 카드 양식, `prompts/templates.md` §2·§6 틀.
- Produces: 사용자가 ChatGPT 이미지 도구에 붙일 프롬프트 2개와 확인 절차.

- [ ] **Step 1: 카드 작성 (⏸ 상태로 시작)**

`prompts/hanbok-hero.md`:

```markdown
# 한복 히어로 — 에셋 프롬프트

포트폴리오 첫 화면 `projects/hanbok-hero`. 레퍼런스 카드 `references/instagram-reposts.md#lovart-interactive-assets`의 "정지 그림을 방향별 프레임으로" 방식을 한복 캐릭터로 다시 만든다. 레퍼런스의 사무라이 외형은 가져오지 않는다.

## 01 · 정면 기준 컷 (hanbok-still) ⏸

| 항목 | 내용 |
|---|---|
| 파일 | `projects/hanbok-hero/dist/assets/hanbok-still.png` · 목표 1024×1024 투명 PNG |
| 쓰이는 곳 | 레이어 `character` 파라미터 `still`. 시트 로딩 전·동작 줄이기·시트 실패 시 보이는 정면 그림 |
| 도구·모드 | ChatGPT 이미지 도구(gpt-image) · 텍스트→이미지 |
| 참조 이미지 | 없음 |
| 설정 | 1:1 · 투명 배경 요청 |

**한국어 요약** — 20대 한국 여성, 흰 저고리에 붉은 치마 한복, 머리는 낮게 땋아 댕기. 정면을 보고 살짝 미소. 상반신에서 무릎까지. 고급 수집용 3D 피규어 느낌, 부드러운 스튜디오 조명. 글자·UI·바닥 없음, 진짜 투명 배경.

**프롬프트 원문**

```text
Premium stylized 3D collectible figure of a young Korean woman in her twenties wearing a traditional hanbok: ivory-white jeogori jacket with a deep red goreum ribbon, full crimson chima skirt, hair in a low braid with a red daenggi ribbon, soft natural makeup, gentle closed-mouth smile.
She faces the camera directly, eyes looking straight at the viewer, shoulders square, hands folded in front at the waist. Framed from the top of the head to just below the knees.
Full figure within a square frame, genuine transparent background (real alpha channel, not a drawn checkerboard), soft neutral studio lighting, detailed fabric folds, no text, no UI, no floor, no cast shadow on the ground. Avoid any green color in the outfit.
```

**생성 후 확인** — 알파 채널이 진짜인지: 작품 페이지에서 `(await import('/qa/browser-checks.js')).alphaReport('/assets/hanbok-still.png')` → `cornerAlpha`가 모두 0이어야 한다. `checkerboard: true`면 §6 초록 배경 방식으로 다시 요청한다.

## 02 · 3×3 방향 시트 (hanbok-sheet) ⏸

| 항목 | 내용 |
|---|---|
| 파일 | `projects/hanbok-hero/dist/assets/hanbok-sheet.png` · 목표 3072×3072(칸 1024) 투명 PNG, 2MB 이하로 webp 변환 가능 |
| 쓰이는 곳 | 레이어 `character` 파라미터 `sheet`. 포인터 방향에 따라 칸을 바꾼다(cols 3 · rows 3) |
| 도구·모드 | ChatGPT 이미지 도구 · 01 결과를 참조 이미지로 첨부 |
| 참조 이미지 | `hanbok-still.png` (같은 인물·의상·크기 유지용) |
| 설정 | 1:1 · 투명 배경 |

**한국어 요약** — 01과 같은 인물을 3×3 칸에 9번 그린다. 칸마다 고개와 시선 방향만 다르다(왼쪽 위·위·오른쪽 위 / 왼쪽·정면·오른쪽 / 왼쪽 아래·아래·오른쪽 아래). 몸 자세·크기·위치는 모든 칸에서 똑같다.

**프롬프트 원문**

```text
Use case: stylized-concept. Asset type: transparent 3x3 sprite sheet of the attached character for a web hero. The attached image is the SAME character and must be reproduced identically in every cell: same hanbok (ivory jeogori, red goreum, crimson chima), same braid and daenggi, same lighting, same scale and position.
Output one square sheet made of 9 equal square cells in a 3x3 grid, no borders, gaps, labels or text. In every cell the body pose is identical (facing camera, hands folded at the waist); ONLY the head turn and the eye direction change, as if she is looking at something near the viewer's screen:
Row 1: looking up-left, looking up, looking up-right. Row 2: looking left, looking straight at the viewer (identical to the attached image), looking right. Row 3: looking down-left, looking down, looking down-right.
Head turns are subtle (about 15 degrees), eyes clearly follow the same direction. Character centered in each cell with the same generous transparent padding, fully visible, no overlaps. True transparent RGBA background, no checkerboard drawn, no floor, no shadow. Avoid green.
```

**생성 후 확인** — `alphaReport('/assets/hanbok-sheet.png')` 모서리 알파 0. 작품 페이지에서 마우스를 돌려 9칸이 같은 인물·같은 위치인지 본다. 칸 사이에서 몸이 튀면 ① 가운데 칸을 기준으로 다시 요청하거나 ② 5방향(정면·좌·우·상·하)으로 줄인다. 줄이면 매니페스트 `cols`·`rows`가 아니라 시트 칸 자체를 3×3로 유지하되 대각선 칸에 가장 가까운 직교 칸을 복사해 넣는다(코드 변경 없음). 이 결정과 이유를 이 카드에 적는다.

## 03 · 배경 (paper) — 없음

첫 버전은 단색 배경(`paper.color`)이다. 배경 그림을 넣게 되면 여기에 카드를 추가한다.
```

- [ ] **Step 2: README 표에 추가**

`prompts/README.md`의 파일 표(`| [templates.md]` 줄 위)에:

```markdown
| [hanbok-hero.md](hanbok-hero.md) | 한복 히어로 — 정면 기준 컷 + 3×3 방향 시트 |
```

"한눈에 보기 › 이미지" 표 끝에:

```markdown
| <img src="../projects/hanbok-hero/dist/assets/hanbok-still.png" width="120"> | 한복 히어로 | [정면 기준 컷 `hanbok-still`](hanbok-hero.md#01--정면-기준-컷-hanbok-still-) | ChatGPT 이미지 | ⏸ |
| <img src="../projects/hanbok-hero/dist/assets/hanbok-sheet.png" width="120"> | 한복 히어로 | [3×3 방향 시트 `hanbok-sheet`](hanbok-hero.md#02--33-방향-시트-hanbok-sheet-) | ChatGPT 이미지 | ⏸ |
```

- [ ] **Step 3: 보관함 빌드와 검사**

Run: `pnpm prompts:build && node prompts/build.mjs --check`
Expected: 오류 없음. 앵커 형식이 맞지 않으면 빌드가 알려 주는 규칙대로 제목 앵커를 고친다.

- [ ] **Step 4: 사용자에게 생성 요청**

사용자에게 01 프롬프트를 전달하고 결과 PNG를 받는다. 결과를 `dist/assets/hanbok-still.png`로 저장 → `alphaReport` 확인 → 02 프롬프트(01 결과 첨부)로 시트 생성 → `hanbok-sheet.png` 저장 → 작품 페이지에서 9칸 확인. 카드의 ⏸를 ✅로 바꾸고 "생성 후 확인"에 실제 결과(크기·용량·알파·일관성)를 적는다. 자리표시 에셋은 `scripts/make-placeholders.mjs`로 언제든 다시 만들 수 있으니 보관하지 않는다.
이 단계는 사용자 작업을 기다린다. 기다리는 동안 Task 8을 진행한다.

- [ ] **Step 5: 실제 에셋으로 재검수**

Run: Task 5의 1·2·4 단계를 다시 실행.
Expected: `failed: []`. HTML `<img width/height>`를 실제 크기로 맞춘다(정면 1024 기준).

---

### Task 8: 문서와 기록

**Files:**
- Create: `projects/hanbok-hero/README.md`
- Create: `projects/hanbok-hero/QA.md`
- Modify: `references/instagram-reposts.md` — lovart-interactive-assets 카드 `쓰인 작품` 칸
- Modify: `references/patterns.md` — `pointer-reactive` 항목에 쓰인 작품 줄(해당 패턴 표에 "쓰인 작품" 행이 없으면 추가하지 않고 카드만 고친다)
- Modify: `docs/10-인터랙티브-개발-참고원칙.md` — 새 절 추가
- Modify: `docs/11-레이어-설정-시스템-설계.md` §9 — 앱 레이어 표에 hanbok-hero 행(§9 구조를 먼저 읽고 같은 형식으로)

- [ ] **Step 1: README**

```markdown
# 한복 히어로 — 시선이 따라오는 포트폴리오 첫 화면

한복 입은 여성 캐릭터 그림이 포인터 쪽으로 고개·시선을 돌립니다. 레퍼런스 `references/instagram-reposts.md#lovart-interactive-assets`(패턴 `pointer-reactive`)의 "정지 그림을 방향 프레임으로" 방식을 우리 레이어로 다시 설계했습니다. 설계: `.claude/plans/2026-10-02-hanbok-hero.md`.

```powershell
pnpm --filter hanbok-hero dev      # http://localhost:4178 · 관리자 /admin
pnpm --filter hanbok-hero check    # node 테스트 · 엔트리 검사 · layer-kit lint · 생성물 최신성
pnpm --filter hanbok-hero assets:placeholder   # 실제 그림이 없을 때 자리표시 PNG 생성
```

## 동작

| 입력 | 바뀌는 상태 | 보이는 피드백 | 되돌리기 |
|---|---|---|---|
| 포인터 이동 | 시선 기준점 기준 9구역(히스테리시스 0.38/0.28) | 해당 칸으로 크로스페이드 | 멈추거나 떠난 뒤 `returnDelay` 지나면 정면 |
| 터치 탭 | 탭 방향을 한 번 봄 | 같은 전환 | `returnDelay` 뒤 정면 |
| 키보드 | 메뉴 Tab 이동만 | 정면 고정 | — |
| 동작 줄이기 | 시트 프레임 숨김, 반응 중단 | 정면 고정 | OS 설정 해제 |

시트가 없거나 실패하면 정면 그림(`still`)만 보입니다.

## 레이어

`dist/layers.manifest.js`가 정본입니다. `global` 전역 색·글꼴 · `paper` 배경 · `character` 반응 캐릭터(still, sheet, cols·rows, x·y·size, anchorY, range, follow, fade, returnDelay, react) · `title` 이름·소개 · `nav` 메뉴 · `hint` 안내. 구간은 wide·tablet·mobile이고 값은 `dist/layers.values.json`(관리자에서 게시)에 쌓입니다. JS가 읽는 수치(`range`·`anchorY`·`returnDelay`)는 `.gaze-range` 요소의 계산된 스타일에서 읽어 CSS 변수가 유일한 정본입니다.

## 관리자

`/admin`은 매니페스트만 읽는 작은 Scene Studio입니다(장면·화면·적용 범위 선택, 레이어별 파라미터, 초안 저장·게시·버전 복구·내보내기·불러오기). 서버는 Potato Designer의 `studio-server.mjs`를 그대로 복사했습니다. `ADMIN_PASSWORD`를 두면 로그인 화면이 나옵니다.

## 검수

`dist/qa/browser-checks.js`를 페이지 안에서 실행합니다. 절차와 결과는 [QA.md](QA.md).

## 에셋

프롬프트와 확인 절차는 [`prompts/hanbok-hero.md`](../../prompts/hanbok-hero.md).
```

- [ ] **Step 2: QA.md** — Task 5·6·7 결과를 아래 표로. "미검수"를 반드시 적는다.

```markdown
# 한복 히어로 검수 기록

## 2026-10-02 첫 구현

| 범위 | 결과 |
|---|---|
| Node 테스트 | `gaze.test.mjs` 3개, `make-placeholders.test.mjs` 1개 통과 |
| layer-kit lint | 6 layers / 51 parameters, 오류 0 |
| layer-kit probe | 51/51 통과 (1440px, 동작 줄이기 없음) |
| 작품 `runChecks` | N개 통과 / 실패 0 (여기에 실제 수치) |
| 동작 줄이기 `runReducedMotionChecks` | 3개 통과 |
| 390px `runNarrowChecks` | 5개 통과 |
| 시트 실패 `runSheetFailure` | 3개 통과 |
| 관리자 수동 7항목 | 통과 (실패했던 항목과 수정 내용) |

## 미검수

- 실제 터치 기기(에뮬레이션만 했다), 스크린리더, Safari.
- 자리표시 에셋으로 검수했다 / 실제 에셋으로 재검수했다 (해당하는 쪽을 남긴다).

## 발견한 결함과 해결

(검수 중 실제로 나온 것만 적는다. 없으면 "없음".)
```

- [ ] **Step 3: 레퍼런스 카드와 패턴 색인**

`references/instagram-reposts.md`의 lovart-interactive-assets 표에서 `| 쓰인 작품 | — |`를 `| 쓰인 작품 | 한복 히어로 (`projects/hanbok-hero`) — 방향 프레임 교체 방식만 가져옴 |`로 바꾼다.
Run: `pnpm references:build && node references/build.mjs --check`
Expected: 오류 없음.

- [ ] **Step 4: docs/10 절 추가** (파일 끝에)

```markdown
## 한복 히어로에서 확인한 것 (2026-10-02)

근거: [앱 README](../projects/hanbok-hero/README.md), [QA](../projects/hanbok-hero/QA.md), 레퍼런스 `lovart-interactive-assets`.

| 관찰 | 구현 방법 | 재사용 조건 |
|---|---|---|
| JS가 쓰는 수치(반응 범위·되돌아오는 시간)를 레이어 파라미터로 두면 probe가 CSS 변화를 못 본다 | 보이지 않는 기준 요소(`.gaze-range`)의 크기·top·transition-delay에 바인딩하고 JS는 계산된 스타일을 읽는다 | 포인터 반응·타이머 등 CSS가 직접 그리지 않는 값 전부 |
| 이산 프레임 전환은 0~1 세기가 의미 없다 | `react` boolean으로 시트 레이어 자체를 숨겨 정면만 남긴다 | 스프라이트·프레임 교체형 반응 |
| 구역 경계에서 포인터가 떨리면 칸이 깜빡인다 | 들어갈 때 0.38, 나올 때 0.28 히스테리시스(`gaze.js`) | 포인터를 구역으로 양자화하는 모든 반응 |
| 크로스페이드를 JS로 하면 타이머가 겹친다 | 프레임 상자 두 개와 CSS transition(`fade`=duration, `follow`=delay)로 두고 JS는 클래스만 바꾼다 | 두 상태를 겹쳐 바꾸는 전환 |
| Potato Scene Studio는 페이지·모달 개념이 깊어 두 번째 앱에 그대로 못 쓴다 | studio-server는 복사하고, 매니페스트만 읽는 패널을 새로 썼다(약 120줄) | 세 번째 앱이 생기면 이 패널을 `@iw/layer-kit`으로 올리는 것을 판단한다 |
| 실제 그림 없이도 검수하려면 | zlib로 쓰는 자리표시 PNG 생성기(`make-placeholders.mjs`) — 칸마다 눈동자 위치가 달라 시선 효과를 검사할 수 있다 | 에셋이 늦는 모든 스프라이트 작업 |

검수한 것과 미검수는 QA.md를 따른다.
```

- [ ] **Step 5: 루트 전체 검사**

Run: `pnpm check`
Expected: prompts·references 생성물 최신, 테스트 통과, `pnpm -r check`에 hanbok-hero 포함되어 PASS.

---

## Self-review

- 스펙 §2 범위: 첫 화면(Task 2·4), 관리자(Task 6), lint·probe·브라우저 검수(Task 2·5), 프롬프트 카드(Task 7) — 모두 Task가 있다. 작품 목록·배포·트레일은 범위 밖으로 유지.
- 스펙 §4 레이어 표의 파라미터 이름이 Task 2 매니페스트와 1:1(`strength`→`react` 변경은 스펙에 반영됨).
- 스펙 §5 동작 표: 포인터·터치·키보드·동작 줄이기 → Task 4 코드, Task 5 검사.
- 스펙 §6 에셋 순서와 5방향 축소 판단 → Task 7 카드.
- 스펙 §7 완료 조건 → Task 5·6·8.
- 타입 일관성: `gaze.state()`가 `{zone, ready, front}`를 돌려주고 Task 5가 그 세 필드만 쓴다. `window.hanbokStudio` 메서드 이름이 bridge(Task 6 Step 1)와 studio.js(Step 4)에서 같다. 레이어 id·클래스 이름이 매니페스트·HTML·CSS·app.js·검수 사이에서 같다.
- Review Focus 1~5 각각 Task 5(1·3·4), Task 3(2·3), Task 6(5)에 검사가 있다.
