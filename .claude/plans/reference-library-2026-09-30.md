# 인터랙티브 레퍼런스 보관소 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 노션에 모은 외부 사이트 7곳(MotionSites AI, 노트폴리오 포트폴리오 6곳)을 직접 확인한 카드와 패턴 색인으로 `references/`에 정리하고, 에이전트는 계획 단계에서, 사용자는 웹 보관함에서 참고하게 한다.

**Architecture:** `prompts/`와 같은 방식이다. 원본은 `references/*.md`이고, `references/build.mjs`가 규칙을 검사한 뒤 `catalog.json`(에이전트용)과 `gallery.html`(사람용)을 만든다. 마크다운 해석은 `prompts/build.mjs`에서 `tools/md-blocks.mjs`로 떼어 두 빌더가 함께 쓴다. 사이트 확인은 Aside 브라우저로 한다.

**Tech Stack:** Node(ESM `.mjs`, 의존성 없음), `node:test`, ffmpeg(webp·webm 변환), Aside MCP(브라우저), claude.ai Artifact(비공개 보관함), 노션 커넥터(가져오기)

**Spec:** [`docs/13-인터랙티브-레퍼런스-보관소-설계.md`](../../docs/13-인터랙티브-레퍼런스-보관소-설계.md)

## 참고 · 적용 · 적용하지 않은 것 (AGENTS.md 3단계)

명세 §"참고와 적용"을 그대로 따른다. 요약: `prompts/` 빌드·게시 방식 재사용, 01 §4-1·§5(참고만·시작 전 리뷰), 04 §4-0(기술 검증 뒤 레퍼런스), 10(억지로 끼우지 않기·시점 의존 정보 단정 금지). 02·08식 역추적은 하지 않는다(포트폴리오 7곳에는 과함).

## 레이어 계약 (AGENTS.md 5항)

- **대상 아님.** 보관함은 작품·정적 스터디·허브가 아니라 문서 보기 도구다. 기존 프롬프트 보관함과 같다(사용자 확인 2026-09-30, 명세 §참고와 적용).
- 추가·변경한 레이어: 없음. `layer-kit lint`·`probe`: 해당 없음.
- 카드의 "우리 레이어로 옮기면"은 나중 작품을 위한 설계 메모이지 레이어 선언이 아니다.

## Global Constraints

- 원본은 `references/*.md`. `references/gallery.html`·`references/catalog.json`은 생성물이며 직접 고치지 않는다.
- 사이트 id: `^[a-z0-9-]+$`. 카드 제목 `id · 이름 — 한 줄 성격`, 패턴 제목 `` `id` — 이름 ``.
- 확인 표기: `✅ 날짜` 직접 확인 · `⏸` 미확인 · `⚠️ 날짜` 접속 불가 (U+FE0F 유무 무관). 날짜 `YYYY-MM-DD`.
- 패밀리: `A` / `A'` / `B` / `D` / `E` / `새 패턴`.
- 노션 id는 여러 카드에 같이 적을 수 있다(한 행 → 여러 사이트). 중복 검사는 사이트 id와 주소(`www.`·끝 `/` 무시)로 한다.
- 캡처: 긴 변 1280px webp, 사이트당 2장 이하. 녹화: 10초 이하·무음 webm 1개(선택). 사이트당 합계 2MB(2,097,152바이트) 이하.
- MotionSites: 공개 페이지만. 계정 가입·로그인·MCP 연결 금지, 유료 프롬프트 본문 저장 금지.
- 노션에 되쓰지 않는다.
- 브라우저는 **Aside**. Aside 도구가 없으면 멈추고 사용자에게 알린다. 다른 브라우저로 조용히 바꾸지 않는다.
- 레퍼런스의 문구·이미지·브랜드·코드를 그대로 옮기지 않는다.
- `prompts/` 생성물(`gallery.html`, `catalog.json`, `--site` 결과)은 바이트 단위로 바뀌지 않아야 한다.
- 커밋·푸시는 사용자가 요청할 때만. 각 작업 끝의 체크포인트는 `git status` 확인까지다.
- 로컬 Node는 v22.16.0(`package.json` engines는 >=24). Node 24 전용 API를 쓰지 않는다.
- 문서·화면 문구는 한국어.
- `S`: 현재 세션의 scratchpad 경로(시스템 프롬프트의 "Scratchpad directory"). 예: `S="C:/Users/ssool/AppData/Local/Temp/claude/<프로젝트>/<세션>/scratchpad"`.

## Review Focus

1. **한 노션 행에서 사이트 여러 곳** — 포트폴리오 6장이 같은 노션 id를 적어도 빌드가 통과해야 한다. → Task 2 `validate` 테스트
2. **백틱 없이 적은 패턴 id**(`| 패턴 | desktop-os |`) — 조용히 무시하지 말고 "패턴이 없음 (`id` 형식)"으로 실패해야 한다. → Task 2 테스트
3. **Windows CRLF로 저장된 카드** — 제목·표가 깨지지 않아야 한다. → Task 2 테스트(파서가 직접 정규화)
4. **변형 선택자 없는 `⚠`** — 키보드로 친 `⚠ 2026-10-02`도 접속 불가로 읽어야 한다. → Task 2 테스트
5. **클립보드가 막힌 환경**(claude.ai iframe, 권한 거부) — "플랜용 요약 복사"가 요약을 펼치고 선택 상태로 바꿔야 한다. → Task 5 브라우저 검수

---

### Task 1: 공용 마크다운 해석기 추출

**Files:**
- Create: `tools/md-blocks.mjs`
- Create: `tools/md-blocks.test.mjs`
- Modify: `prompts/build.mjs:6-8` (import), `:29-31`, `:34` (유틸 제거), `:36-95` (블록 해석 제거), `:119-137` (인라인 교체), `:158-164` (표 렌더 교체)

**Interfaces:**
- Consumes: 없음
- Produces (`tools/md-blocks.mjs`):
  - `esc(s): string`, `slug(s): string`, `plain(s): string`, `posix(p): string`
  - `parseBlocks(md): Block[]` — `Block` = `{type:'code', lang, attrs, text}` | `{type:'heading', level, text}` | `{type:'table', head: string[], rows: string[][]}` | `{type:'quote', text}` | `{type:'list', ordered, items: string[]}` | `{type:'para', text}`
  - `splitDoc(md): { title: string, intro: Block[], parts: { kind: 'section'|'card', title: string, blocks: Block[] }[] }` (`##` = section, `###` = card)
  - `makeInline({ link, media }): (s, ctx) => string` — `link(url, ctx)` → `{ href, external? }` 또는 `{ text }`, `media(rel, ctx)` → 경로 문자열
  - `table(b, inline, ctx): string`, `metaList(rows, inline, ctx): string`

- [ ] **Step 1: 기준 생성물 저장 (고치기 전)**

```bash
cd "C:/Users/ssool/개발/바이브코딩/interactive-web"
node prompts/build.mjs --check --site "$S/prompts-site-before"
```
Expected: `prompts: 생성물 최신`, `site: …/prompts-site-before (N개 미디어)`. `--check`와 함께 쓰면 `gallery.html`·`catalog.json`을 쓰지 않는다.

- [ ] **Step 2: 실패하는 테스트 작성** — `tools/md-blocks.test.mjs`

```js
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
```

- [ ] **Step 3: 실패 확인**

Run: `node --test tools/md-blocks.test.mjs`
Expected: FAIL — `Cannot find module …/tools/md-blocks.mjs`

- [ ] **Step 4: `tools/md-blocks.mjs` 작성** — `prompts/build.mjs`의 코드를 **글자 그대로** 옮긴다. `inline`만 훅을 받는 팩토리로 감싼다.

```js
// 마크다운 해석 — prompts/build.mjs와 references/build.mjs가 함께 쓴다.
// 블록·절·카드 구조와 인라인 변환만 맡는다. 링크·미디어 경로를 어디로 보낼지는 호출하는 쪽이 정한다.
import path from 'node:path';

export const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
export const slug = (s) => s.trim().toLowerCase().replace(/[^\p{L}\p{N}\p{M} _-]/gu, '').replace(/ /g, '-');
export const plain = (s) => s.replace(/`([^`]+)`/g, '$1').replace(/\*\*(.+?)\*\*/g, '$1').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/<[^>]+>/g, '').trim();
export const posix = (p) => p.split(path.sep).join('/');

// ── 블록 ─────────────────────────────────────────────────────
const BLOCK_START = /^(`{3,}|#{1,6} |---+\s*$|\||>|([-*]|\d+\.) )/;
export function parseBlocks(md) {
  const lines = md.split('\n');
  const blocks = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    let m;
    if (!line.trim()) { i++; continue; }
    if ((m = line.match(/^(`{3,})(.*)$/))) {
      const fence = m[1];
      const [lang = '', ...rest] = m[2].trim().split(/\s+/);
      const body = [];
      i++;
      while (i < lines.length && !(lines[i].startsWith(fence) && !lines[i].slice(fence.length).trim())) body.push(lines[i++]);
      i++;
      const attrs = Object.fromEntries(rest.map((p) => p.split('=')).filter((p) => p.length === 2));
      blocks.push({ type: 'code', lang, attrs, text: body.join('\n') });
    } else if ((m = line.match(/^(#{1,6}) (.+)$/))) {
      blocks.push({ type: 'heading', level: m[1].length, text: m[2].trim() });
      i++;
    } else if (/^---+\s*$/.test(line)) {
      i++;
    } else if (line.startsWith('|')) {
      const rows = [];
      while (i < lines.length && lines[i].startsWith('|')) rows.push(lines[i++]);
      const cells = rows.filter((_, k) => k !== 1).map((r) => r.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim()));
      blocks.push({ type: 'table', head: cells[0], rows: cells.slice(1) });
    } else if (line.startsWith('>')) {
      const body = [];
      while (i < lines.length && lines[i].startsWith('>')) body.push(lines[i++].replace(/^>\s?/, ''));
      blocks.push({ type: 'quote', text: body.join(' ') });
    } else if ((m = line.match(/^([-*]|\d+\.) /))) {
      const ordered = /\d/.test(m[1]);
      const items = [];
      while (i < lines.length && /^([-*]|\d+\.) /.test(lines[i])) items.push(lines[i++].replace(/^([-*]|\d+\.) /, ''));
      blocks.push({ type: 'list', ordered, items });
    } else {
      const body = [lines[i++]];
      while (i < lines.length && lines[i].trim() && !BLOCK_START.test(lines[i])) body.push(lines[i++]);
      blocks.push({ type: 'para', text: body.join('\n') });
    }
  }
  return blocks;
}

// 문서 = 제목 + 머리말 + (## 절 | ### 카드) 목록
export function splitDoc(md) {
  const doc = { title: '', intro: [], parts: [] };
  let cur = null;
  for (const b of parseBlocks(md)) {
    if (b.type === 'heading' && b.level === 1) doc.title = b.text;
    else if (b.type === 'heading' && (b.level === 2 || b.level === 3)) {
      cur = { kind: b.level === 3 ? 'card' : 'section', title: b.text, blocks: [] };
      doc.parts.push(cur);
    } else (cur ? cur.blocks : doc.intro).push(b);
  }
  return doc;
}

// ── 인라인 ───────────────────────────────────────────────────
// link(url, ctx) → { href, external } 또는 { text }(링크 대신 경로 글자로 표시)
// media(rel, ctx) → 페이지에서 쓸 미디어 경로
const INLINE = /`([^`]+)`|\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)|<img\s+src="([^"]+)"(?:\s+width="\d+")?\s*\/?>|~~(.+?)~~/g;
export function makeInline({ link, media }) {
  return function inline(s, ctx) {
    let out = '';
    let last = 0;
    for (const m of s.matchAll(INLINE)) {
      out += esc(s.slice(last, m.index));
      if (m[1] !== undefined) out += `<code>${esc(m[1])}</code>`;
      else if (m[2] !== undefined) out += `<strong>${inline(m[2], ctx)}</strong>`;
      else if (m[3] !== undefined) {
        const l = link(m[4], ctx);
        out += l.text
          ? `<span class="path" title="저장소 경로">${inline(m[3], ctx)}</span>`
          : `<a href="${esc(l.href)}"${l.external ? ' target="_blank" rel="noopener"' : ''}>${inline(m[3], ctx)}</a>`;
      } else if (m[5] !== undefined) out += `<img src="${esc(media(m[5], ctx))}" alt="" loading="lazy">`;
      else out += `<s>${inline(m[6], ctx)}</s>`;
      last = m.index + m[0].length;
    }
    return (out + esc(s.slice(last))).replace(/\n/g, ' ');
  };
}

// ── 표 ───────────────────────────────────────────────────────
export function table(b, inline, ctx) {
  const cells = (row, tag) => row.map((c) => `<${tag}>${inline(c, ctx)}</${tag}>`).join('');
  return `<div class="table-wrap"><table><thead><tr>${cells(b.head, 'th')}</tr></thead><tbody>${b.rows.map((r) => `<tr>${cells(r, 'td')}</tr>`).join('')}</tbody></table></div>`;
}
export function metaList(rows, inline, ctx) {
  return `<dl class="meta">${rows.map(([k, v]) => `<div><dt>${inline(k, ctx)}</dt><dd>${inline(v, ctx)}</dd></div>`).join('')}</dl>`;
}
```

- [ ] **Step 5: 테스트 통과 확인**

Run: `node --test tools/md-blocks.test.mjs`
Expected: PASS — 4 tests

- [ ] **Step 6: `prompts/build.mjs`가 공용 해석기를 쓰게 바꾸기**

(a) `import { fileURLToPath } from 'node:url';` 다음 줄에 추가:
```js
import { esc, slug, plain, posix, splitDoc, makeInline, table as renderTable, metaList as renderMetaList } from '../tools/md-blocks.mjs';
```
(b) `const esc = …`, `const slug = …`, `const plain = …`(29–31행), `const posix = …`(34행)을 지운다. `read`, `keyOf`, `anchor`는 남긴다.
(c) `// ── 마크다운 블록 ───` 줄부터 `splitDoc` 함수의 닫는 `}`까지(36–95행)를 지운다.
(d) `const INLINE = …`부터 `inline` 함수의 닫는 `}`까지(119–137행)를 아래 한 줄로 바꾼다:
```js
const inline = makeInline({ link, media });
```
(e) `function table(b, ctx) {…}`와 `function metaList(rows, ctx) {…}`(158–164행)를 아래로 바꾼다:
```js
const table = (b, ctx) => renderTable(b, inline, ctx);
const metaList = (rows, ctx) => renderMetaList(rows, inline, ctx);
```

- [ ] **Step 7: 생성물이 한 글자도 안 바뀌었는지 확인**

```bash
node prompts/build.mjs --check --site "$S/prompts-site-after"
diff -r "$S/prompts-site-before" "$S/prompts-site-after" && echo SAME
```
Expected: `prompts: 생성물 최신`, 그리고 `SAME`(diff 출력 없음). 하나라도 다르면 Step 6에서 옮긴 코드를 원본과 비교해 고친다.

- [ ] **Step 8: 체크포인트** — `git status --short`로 바뀐 파일이 `tools/md-blocks.mjs`, `tools/md-blocks.test.mjs`, `prompts/build.mjs`뿐인지 확인한다(커밋은 사용자 요청 시).

---

### Task 2: 카드·패턴 모델과 규칙 검사

**Files:**
- Create: `references/model.mjs`
- Create: `references/build.test.mjs`

**Interfaces:**
- Consumes: `splitDoc`, `plain` (Task 1)
- Produces (`references/model.mjs`):
  - `STATUS = { ok: '직접 확인', pending: '미확인', down: '접속 불가' }`, `MARK = { ok: '✅', pending: '⏸', down: '⚠️' }`
  - `families(raw): string[]`, `urlKey(url): string`
  - `parseSiteDoc(file, md): { doc, sites: Site[], errors: string[] }`
  - `parsePatterns(file, md): { doc, patterns: Pattern[], errors: string[] }`
  - `validate(sites, patterns, exists: (rel) => boolean): string[]`
  - `summary(site): string`
  - `toCatalog(sites, patterns, files: string[]): object`
  - `Site` = `{ id, name, tagline, file, anchor:'site-<id>', url, via, importedAt, notion: string[], check: { status:'ok'|'pending'|'down', date }, patterns: string[], families: string[], tech: string[], usedIn: string[], image, video, take, avoid, part }`
  - `Pattern` = `{ id, name, anchor:'pattern-<id>', families: string[], part }`

- [ ] **Step 1: 실패하는 테스트 작성** — `references/build.test.mjs`

````js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseSiteDoc, parsePatterns, validate, toCatalog, summary } from './model.mjs';

const card = ({ id = 'alpha', url = 'https://www.alpha.test/', check = '✅ 2026-10-01 · 1440px, 390px · Aside', pattern = '`desktop-os`', image = true } = {}) => `### ${id} · Alpha Studio — 창처럼 여는 포트폴리오

${image ? `<img src="media/${id}/desk.webp" width="360">\n\n` : ''}| 항목 | 내용 |
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
    patterns: ['desktop-os'], families: ['D', "A'"], tech: ['(추정) WebGL', 'GSAP'], usedIn: [],
    image: 'media/alpha/desk.webp', video: 'media/alpha/walk.webm',
    take: '익숙한 창 조작으로\n탐색하기', avoid: '모바일에서도 창을 겹치는 배치',
  });
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
````

- [ ] **Step 2: 실패 확인**

Run: `node --test references/build.test.mjs`
Expected: FAIL — `Cannot find module …/references/model.mjs`

- [ ] **Step 3: `references/model.mjs` 작성**

```js
// references/*.md → 사이트·패턴 모델, 규칙 검사, catalog.json
// 파일을 읽고 쓰는 일은 build.mjs가 한다. 여기는 테스트할 수 있는 순수 함수만 둔다.
import { splitDoc, plain } from '../tools/md-blocks.mjs';

export const STATUS = { ok: '직접 확인', pending: '미확인', down: '접속 불가' };
export const MARK = { ok: '✅', pending: '⏸', down: '⚠️' };

const ID = /^[a-z0-9-]+$/;
const DATE = /\d{4}-\d{2}-\d{2}/;
const URL_RE = /https?:\/\/[^\s)|<>]+/;
const NOTION_ID = /[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}/gi;
const FAMILY = /(?<![A-Za-z])(A'|[ABDE])(?![A-Za-z0-9'])|새 패턴/g;
const EMPTY = /^(—|-|없음)?$/;

const lf = (md) => md.replace(/\r\n/g, '\n');
const unique = (xs) => [...new Set(xs)];
const list = (s) => (EMPTY.test(s.trim()) ? [] : s.split(/\s*,\s*/).filter(Boolean));
const dashed = (hex) => {
  const h = hex.replace(/-/g, '').toLowerCase();
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
};
export const families = (raw) => unique([...raw.matchAll(FAMILY)].map((m) => m[1] ?? m[0]));
export const urlKey = (url) => {
  const u = new URL(url);
  return `${u.host.replace(/^www\./, '')}${u.pathname.replace(/\/+$/, '')}`.toLowerCase();
};

function metaTable(part) {
  const t = part.blocks.find((b) => b.type === 'table' && b.head[0] === '항목' && b.head[1] === '내용');
  return Object.fromEntries((t?.rows ?? []).map(([k, v = '']) => [plain(k), v]));
}
function keyedParas(part) {
  const out = {};
  for (const b of part.blocks) {
    const m = b.type === 'para' && b.text.trim().match(/^\*\*([^*]+)\*\*\s*—\s*([\s\S]*)$/);
    if (m) out[m[1].trim()] = m[2].trim();
  }
  return out;
}

export function parseSiteDoc(file, md) {
  const doc = splitDoc(lf(md));
  const errors = [];
  const sites = doc.parts.filter((p) => p.kind === 'card').map((part) => {
    const fail = (msg) => errors.push(`${file} "${part.title}": ${msg}`);
    const head = part.title.match(/^(\S+) · (.+?)(?: — (.+))?$/);
    const id = head?.[1] ?? '';
    if (!head || !ID.test(id)) fail('제목은 "id · 이름 — 한 줄 성격", id는 영문 소문자·숫자·하이픈');
    const meta = metaTable(part);
    const text = (k) => plain(meta[k] ?? '');
    const body = keyedParas(part);

    const url = (meta['주소'] ?? '').match(URL_RE)?.[0] ?? '';
    if (!url) fail('주소가 없거나 http(s) 주소가 아님');
    const source = text('출처');
    if (!source) fail('출처가 비어 있음');
    const checkRaw = text('확인');
    const status = /^✅/.test(checkRaw) ? 'ok' : /^⏸/.test(checkRaw) ? 'pending' : /^⚠/.test(checkRaw) ? 'down' : null;
    const date = checkRaw.match(DATE)?.[0] ?? null;
    if (!status) fail('확인은 "✅ 날짜", "⏸", "⚠️ 날짜" 중 하나로 시작');
    else if (status !== 'pending' && !date) fail(`확인 ${MARK[status]}에는 날짜가 필요함`);
    const patterns = unique([...(meta['패턴'] ?? '').matchAll(/`([a-z0-9-]+)`/g)].map((m) => m[1]));
    if (!patterns.length) fail('패턴이 없음 (`id` 형식)');
    const fams = families(meta['패밀리'] ?? '');
    if (!fams.length) fail("패밀리는 A / A' / B / D / E / 새 패턴 중 하나 이상");
    const take = body['가져올 것'] ?? '';
    const avoid = body['안 가져올 것'] ?? '';
    if (!take) fail('"**가져올 것** — …" 문단이 비어 있음');
    if (!avoid) fail('"**안 가져올 것** — …" 문단이 비어 있음');

    const image = part.blocks.find((b) => b.type === 'para' && /^<img\s/.test(b.text.trim()))?.text.match(/src="([^"]+)"/)?.[1] ?? null;
    const video = JSON.stringify(part.blocks).match(/\]\((media\/[^)\s]+\.(?:webm|mp4))\)/)?.[1] ?? null;
    if (status === 'ok' && !image) fail('✅ 카드에는 캡처(<img src="media/…">)가 있어야 함');

    return {
      id, name: head?.[2] ?? part.title, tagline: head?.[3] ?? '', file, anchor: `site-${id}`,
      url, via: source.split(' · ')[0], importedAt: source.match(DATE)?.[0] ?? null,
      notion: unique([...(meta['노션'] ?? '').matchAll(NOTION_ID)].map((m) => dashed(m[0]))),
      check: { status: status ?? 'pending', date },
      patterns, families: fams, tech: list(text('기술 흔적')), usedIn: list(text('쓰인 작품')),
      image, video, take, avoid, part,
    };
  });
  return { doc, sites, errors };
}

export function parsePatterns(file, md) {
  const doc = splitDoc(lf(md));
  const errors = [];
  const patterns = doc.parts.filter((p) => p.kind === 'card').map((part) => {
    const m = part.title.match(/^`([a-z0-9-]+)`\s*—\s*(.+)$/);
    if (!m) errors.push(`${file} "${part.title}": 제목은 "\`id\` — 이름" 형식`);
    const id = m?.[1] ?? '';
    return { id, name: m?.[2] ?? part.title, anchor: `pattern-${id}`, families: families(metaTable(part)['패밀리'] ?? ''), part };
  });
  return { doc, patterns, errors };
}

export function validate(sites, patterns, exists) {
  const errors = [];
  const seen = (map, key, label, who) => {
    if (map.has(key)) errors.push(`${who}: ${label} 중복 — ${map.get(key)}와 같음`);
    else map.set(key, who);
  };
  const pids = new Map(), ids = new Map(), urls = new Map();
  for (const p of patterns) seen(pids, p.id, '패턴 id', `patterns.md \`${p.id}\``);
  for (const s of sites) {
    const who = `${s.file} ${s.id}`;
    seen(ids, s.id, '사이트 id', who);
    if (s.url) {
      try { seen(urls, urlKey(s.url), '주소', who); } catch { errors.push(`${who}: 주소를 해석할 수 없음 ${s.url}`); }
    }
    for (const p of s.patterns) if (!pids.has(p)) errors.push(`${who}: patterns.md에 없는 패턴 \`${p}\``);
    for (const m of [s.image, s.video]) if (m && !exists(m)) errors.push(`${who}: 미디어 파일 없음 ${m}`);
  }
  for (const p of patterns) if (!sites.some((s) => s.patterns.includes(p.id))) errors.push(`patterns.md \`${p.id}\`: 이 패턴을 쓰는 사이트 카드가 없음`);
  return errors;
}

const oneLine = (s) => plain(s).replace(/\s*\n\s*/g, ' ');
export function summary(s) {
  const when = s.check.date ? ` ${s.check.date}` : '';
  return `[레퍼런스] ${s.id} — ${s.name} (${s.url}) · 패턴 ${s.patterns.join(', ')} · ${MARK[s.check.status]}${when}\n가져올 것: ${oneLine(s.take)}\n안 가져올 것: ${oneLine(s.avoid)}`;
}

export function toCatalog(sites, patterns, files) {
  return {
    note: '생성물 — references/build.mjs가 references/*.md에서 만든다. 직접 고치지 않는다.',
    generatedFrom: files,
    patterns: patterns.map((p) => ({ id: p.id, name: p.name, families: p.families, sites: sites.filter((s) => s.patterns.includes(p.id)).map((s) => s.id) })),
    sites: sites.map((s) => ({
      id: s.id, name: s.name, url: s.url, file: s.file, anchor: s.anchor,
      notion: s.notion, via: s.via, importedAt: s.importedAt, check: s.check,
      patterns: s.patterns, families: s.families, tech: s.tech, usedIn: s.usedIn,
      summary: summary(s),
    })),
  };
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `node --test references/build.test.mjs`
Expected: PASS — 8 tests

- [ ] **Step 5: 체크포인트** — `git status --short`(커밋은 사용자 요청 시).

---

### Task 3: 보관함 렌더러 · 빌드 CLI · 첫 카드(미확인)

**Files:**
- Create: `references/gallery.mjs`, `references/build.mjs`
- Create: `references/README.md`, `references/patterns.md`, `references/motionsites.md`, `references/notefolio-portfolios.md`
- Create (생성물): `references/gallery.html`, `references/catalog.json`
- Modify: `references/build.test.mjs` (렌더 테스트 추가), `package.json` (scripts)

**Interfaces:**
- Consumes: Task 1 전부, Task 2 `parseSiteDoc`·`parsePatterns`·`validate`·`toCatalog`·`summary`·`STATUS`·`MARK`
- Produces:
  - `renderPage(model, { mode: 'local'|'site', root }): { body: string, files: Map<string, string> }` — `model = { readme, patternDoc, docs: [{ file, doc, sites }], sites, patterns }`, `files`는 site 모드에서 `게시 경로 → 절대 경로`
  - `HEAD`, `STYLE` (문자열)
  - CLI: `node references/build.mjs [--check] [--site DIR]`
  - scripts: `references:build`, `references:check`, `references:test`

- [ ] **Step 1: 실패하는 렌더 테스트 추가** — `references/build.test.mjs` 끝에 추가

```js
import { renderPage } from './gallery.mjs';
import { splitDoc } from '../tools/md-blocks.mjs';

test('renderPage: 카드 필터 속성·요약, site 모드는 미디어를 모은다', () => {
  const pat = parsePatterns('patterns.md', PATTERNS);
  const parsed = parseSiteDoc('alpha.md', doc(card()));
  const model = { readme: splitDoc('# 안내\n\n## 가져오는 법\n\n1. 태그를 붙인다\n'), patternDoc: pat.doc, docs: [{ file: 'alpha.md', ...parsed }], sites: parsed.sites, patterns: pat.patterns };
  const local = renderPage(model, { mode: 'local', root: '/repo/references' });
  assert.ok(local.body.includes('<article class="card" id="site-alpha" data-status="ok" data-patterns="desktop-os" data-families="D|A&#39;">'));
  assert.ok(local.body.includes('id="pattern-desktop-os"'));
  assert.ok(local.body.includes('[레퍼런스] alpha — Alpha Studio (https://www.alpha.test/)'));
  assert.ok(local.body.includes('id="guide-가져오는-법"'));
  assert.equal(local.files.size, 0);
  const site = renderPage(model, { mode: 'site', root: '/repo/references' });
  assert.deepEqual([...site.files.keys()].sort(), ['media/alpha/desk.webp', 'media/alpha/walk.webm']);
});
```

import 두 줄은 파일 맨 위 import 묶음으로 옮긴다.

- [ ] **Step 2: 실패 확인**

Run: `node --test references/build.test.mjs`
Expected: FAIL — `Cannot find module …/references/gallery.mjs`

- [ ] **Step 3: `references/gallery.mjs` 작성**

````js
// 레퍼런스 보관함 페이지. build.mjs가 넘긴 모델로 본문 HTML을 만든다.
// local: references/gallery.html(미디어는 상대 경로) · site: claude.ai 게시본(미디어를 files에 모은다)
import path from 'node:path';
import { esc, slug, makeInline, table as renderTable, metaList as renderMetaList } from '../tools/md-blocks.mjs';
import { STATUS, MARK, summary } from './model.mjs';

const MEDIA_EXT = /\.(webp|png|jpe?g|gif|webm|mp4)$/i;
const isMeta = (b) => b.type === 'table' && b.head[0] === '항목' && b.head[1] === '내용';
const isImage = (b) => b.type === 'para' && /^<img\s/.test(b.text.trim());

export function renderPage(model, { mode, root }) {
  const ctx = { mode };
  const files = new Map();
  const media = (rel) => {
    if (mode === 'site') files.set(rel, path.join(root, ...rel.split('/')));
    return rel;
  };
  const link = (url) => {
    if (/^https?:/.test(url)) return { href: url, external: true };
    const [p, frag = ''] = url.split('#');
    if (!p) return { href: `#${frag}` };
    if (p === 'patterns.md') return { href: frag ? `#pattern-${frag}` : '#patterns' };
    if (MEDIA_EXT.test(p)) return { href: media(p), external: true };
    return mode === 'site' ? { text: p } : { href: url, external: true };
  };
  const inline = makeInline({ link, media });

  const blocks = (list) => list.map((b) => {
    if (b.type === 'para') {
      const t = b.text.trim();
      const k = t.match(/^\*\*([^*]+)\*\*\s*—\s*([\s\S]+)$/);
      return k
        ? `<p class="keyed" data-key="${esc(k[1])}"><span class="k">${esc(k[1])}</span>${inline(k[2], ctx)}</p>`
        : `<p>${inline(t, ctx)}</p>`;
    }
    if (b.type === 'table') return isMeta(b) ? renderMetaList(b.rows, inline, ctx) : renderTable(b, inline, ctx);
    if (b.type === 'list') {
      const tag = b.ordered ? 'ol' : 'ul';
      return `<${tag}>${b.items.map((it) => `<li>${inline(it, ctx)}</li>`).join('')}</${tag}>`;
    }
    if (b.type === 'quote') return `<blockquote>${inline(b.text, ctx)}</blockquote>`;
    if (b.type === 'code') return `<pre class="code"><code>${esc(b.text)}</code></pre>`;
    if (b.type === 'heading') return `<h4>${inline(b.text, ctx)}</h4>`;
    return '';
  }).join('');

  const siteCard = (s) => {
    const meta = s.part.blocks.find(isMeta);
    const body = s.part.blocks.filter((b) => !isMeta(b) && !isImage(b));
    const date = s.check.date ? ` ${esc(s.check.date)}` : '';
    const shot = s.image
      ? `<button type="button" class="zoom" data-src="${esc(media(s.image))}"${s.video ? ` data-video="${esc(media(s.video))}"` : ''} aria-label="${esc(s.name)} ${s.video ? '녹화' : '캡처'} 크게 보기"><img src="${esc(media(s.image))}" alt="${esc(s.name)} 화면" loading="lazy"></button><figcaption>${s.video ? '▶ 녹화 보기' : '크게 보기'}</figcaption>`
      : `<div class="empty-shot">${s.check.status === 'pending' ? '아직 직접 확인 전' : '캡처 없음'}</div>`;
    return `<article class="card" id="${esc(s.anchor)}" data-status="${s.check.status}" data-patterns="${esc(s.patterns.join(' '))}" data-families="${esc(s.families.join('|'))}">
<figure class="shot">${shot}</figure><div class="card-body"><header><span class="num">${esc(s.id)}</span><h3>${esc(s.name)}</h3><span class="status" data-status="${s.check.status}">${MARK[s.check.status]} ${STATUS[s.check.status]}${date}</span></header>
<p class="tagline">${esc(s.tagline)} <a href="${esc(s.url)}" target="_blank" rel="noopener">사이트 열기 ↗</a></p>
<p class="tags">${s.patterns.map((p) => `<a href="#pattern-${esc(p)}"><code>${esc(p)}</code></a>`).join(' ')}</p>
${meta ? renderMetaList(meta.rows, inline, ctx) : ''}${blocks(body)}
<div class="plan"><button type="button" class="copy">플랜용 요약 복사</button><details><summary>요약 보기</summary><pre>${esc(summary(s))}</pre></details></div>
</div></article>`;
  };

  const patternCard = (p) => {
    const users = model.sites.filter((s) => s.patterns.includes(p.id));
    return `<article class="pattern" id="${esc(p.anchor)}"><header><code>${esc(p.id)}</code><h3>${esc(p.name)}</h3></header>${blocks(p.part.blocks)}<p class="users"><span class="k">사례</span>${users.map((s) => `<a href="#${esc(s.anchor)}">${esc(s.name)}</a>`).join(' · ')}</p></article>`;
  };

  const chips = (key, items) => [['all', '전체'], ...items]
    .map(([v, t], k) => `<button type="button" data-f-${key}="${esc(v)}" aria-pressed="${k === 0}">${esc(t)}</button>`).join('');
  const fams = [...new Set(model.sites.flatMap((s) => s.families))].sort();
  const count = (st) => model.sites.filter((s) => s.check.status === st).length;
  const sources = model.docs.map((d) => `<section class="source" id="source-${esc(slug(d.file.replace(/\.md$/, '')))}"><header class="source-head"><p class="eyebrow">${esc(d.file)}</p><h2>${inline(d.doc.title, ctx)}</h2>${blocks(d.doc.intro)}</header><div class="cards">${d.sites.map(siteCard).join('\n')}</div></section>`).join('\n');
  const guide = `${blocks(model.readme.intro)}${model.readme.parts.map((p) => `<section class="doc-section" id="guide-${esc(slug(p.title))}"><h2>${inline(p.title, ctx)}</h2>${blocks(p.blocks)}</section>`).join('')}`;

  const body = `<div class="page" lang="ko">
<header class="masthead">
  <p class="eyebrow">interactive-web · references</p>
  <h1>인터랙티브 레퍼런스 보관함</h1>
  <p class="lead">인터랙티브를 만들 때 참고할 외부 사이트를 직접 열어 보고 정리했습니다. 따라 만들 대상이 아니라 참고용입니다. 카드마다 가져올 것과 안 가져올 것이 있고, 플랜에 붙일 요약을 복사할 수 있습니다.</p>
  <p class="tally"><span><b>${model.sites.length}</b> 사이트</span><span><b>${model.patterns.length}</b> 패턴</span><span data-status="ok"><b>${count('ok')}</b> ${STATUS.ok}</span><span data-status="pending"><b>${count('pending')}</b> ${STATUS.pending}</span><span data-status="down"><b>${count('down')}</b> ${STATUS.down}</span></p>
</header>
<div class="bar">
  <nav class="tabs" role="tablist" aria-label="보기">
    <button type="button" role="tab" id="tab-sites" aria-controls="sites" aria-selected="true">사이트</button>
    <button type="button" role="tab" id="tab-patterns" aria-controls="patterns" aria-selected="false">패턴</button>
    <button type="button" role="tab" id="tab-guide" aria-controls="guide" aria-selected="false">쓰는 법</button>
  </nav>
  <div class="filters" id="filters">
    <div class="chips" role="group" aria-label="패턴">${chips('pattern', model.patterns.map((p) => [p.id, p.name]))}</div>
    <div class="chips" role="group" aria-label="패밀리">${chips('family', fams.map((f) => [f, f]))}</div>
    <div class="chips" role="group" aria-label="확인 상태">${chips('status', ['ok', 'pending', 'down'].map((st) => [st, `${MARK[st]} ${STATUS[st]}`]))}</div>
    <label class="search" for="q"><span class="sr">검색</span><input id="q" type="search" placeholder="사이트·패턴·설명 검색" autocomplete="off"></label>
  </div>
</div>
<main>
<section id="sites" role="tabpanel" aria-labelledby="tab-sites">
${sources}
<p class="empty" id="empty" hidden>조건에 맞는 사이트가 없습니다. <button type="button" id="reset">필터를 전체로 되돌리기</button></p>
</section>
<section id="patterns" role="tabpanel" aria-labelledby="tab-patterns" hidden><div class="doc">${blocks(model.patternDoc.intro)}</div><div class="cards">${model.patterns.map(patternCard).join('\n')}</div></section>
<section id="guide" role="tabpanel" aria-labelledby="tab-guide" hidden><div class="doc">${guide}</div></section>
</main>
<footer class="foot">원본은 <code>references/*.md</code>입니다. 이 페이지는 <code>pnpm references:build</code>로 생성합니다.</footer>
<dialog id="viewer" aria-label="크게 보기"><button type="button" class="close" id="viewer-close" aria-label="닫기">×</button><img id="viewer-img" alt=""><video id="viewer-video" controls playsinline hidden></video></dialog>
<p class="sr" id="live" aria-live="polite"></p>
</div>
<script>${SCRIPT}</script>`;
  return { body, files };
}

export const HEAD = `<title>레퍼런스 보관함</title>
<!-- 생성물: references/build.mjs가 references/*.md에서 만든다. 직접 고치지 말고 마크다운을 고친 뒤 pnpm references:build -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans+KR:wght@400;500;700&display=swap">`;

const DARK = `--ground:#0F1211;--surface:#161A18;--sunk:#1C211F;--ink:#E5E9E6;--muted:#9AA39E;--line:#29302C;--line-strong:#3D4641;
  --accent:#93A6FF;--accent-soft:#1E264A;
  --ok:#63C891;--ok-soft:#15301F;--down:#FF8B7E;--down-soft:#3A1B18;--wait:#E2B458;--wait-soft:#33290F;
  --code:#121513;--shadow:0 1px 2px rgba(0,0,0,.4)`;
export const STYLE = `<style>
:root{
  --ground:#EDEFEC;--surface:#FAFBF9;--sunk:#E4E8E4;--ink:#161A18;--muted:#56605B;--line:#D1D7D2;--line-strong:#A9B3AD;
  --accent:#2B4ED0;--accent-soft:#DFE5FA;
  --ok:#1B7043;--ok-soft:#DAEEE1;--down:#AE2A1F;--down-soft:#F7E0DC;--wait:#855700;--wait-soft:#F4E7C6;
  --code:#F3F5F2;--shadow:0 1px 2px rgba(22,26,24,.06),0 8px 24px rgba(22,26,24,.06);
  --sans:'IBM Plex Sans KR','Apple SD Gothic Neo','Malgun Gothic',system-ui,sans-serif;
  --mono:'IBM Plex Mono',ui-monospace,SFMono-Regular,Consolas,'Malgun Gothic',monospace;
}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){color-scheme:dark;${DARK}}}
:root[data-theme="dark"]{color-scheme:dark;${DARK}}
*{box-sizing:border-box}
[hidden]{display:none!important}
body{margin:0;background:var(--ground);color:var(--ink);font:15px/1.7 var(--sans);-webkit-font-smoothing:antialiased;word-break:keep-all;overflow-wrap:anywhere}
.page{max-width:1240px;margin:0 auto;padding:32px 16px 72px}
a{color:var(--accent);text-underline-offset:3px}
code{font:.88em var(--mono);background:var(--sunk);padding:1px 5px;border-radius:4px}
button{font:inherit;color:inherit;cursor:pointer}
:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.eyebrow{margin:0;font:500 11px/1.4 var(--mono);letter-spacing:.14em;text-transform:uppercase;color:var(--muted)}
h1,h2,h3{text-wrap:balance;letter-spacing:-.02em;line-height:1.25}
.masthead{display:grid;gap:10px;padding-bottom:22px}
.masthead h1{margin:0;font-size:clamp(30px,4.2vw,46px);font-weight:700}
.lead{margin:0;max-width:62ch;color:var(--muted);font-size:16px}
.tally{display:flex;flex-wrap:wrap;gap:6px 18px;margin:6px 0 0;font:13px var(--mono);color:var(--muted);font-variant-numeric:tabular-nums}
.tally b{font-weight:500;color:var(--ink);margin-right:4px}
.tally [data-status="ok"]{color:var(--ok)}.tally [data-status="pending"]{color:var(--wait)}.tally [data-status="down"]{color:var(--down)}
.bar{position:sticky;top:0;z-index:5;background:var(--ground);border-bottom:1px solid var(--line);padding-block:8px 10px;display:grid;gap:8px;grid-template-columns:minmax(0,1fr)}
.tabs{display:flex;gap:4px;overflow-x:auto}
.tabs button{border:0;background:none;padding:8px 12px;border-radius:6px;font-weight:500;color:var(--muted);white-space:nowrap}
.tabs button[aria-selected="true"]{background:var(--ink);color:var(--ground)}
.filters{display:grid;gap:8px;grid-template-columns:minmax(0,1fr)}
.chips{display:flex;gap:4px;overflow-x:auto;max-width:100%}
.chips button{border:1px solid var(--line);background:var(--surface);padding:3px 10px;border-radius:999px;font-size:13px;white-space:nowrap}
.chips button[aria-pressed="true"]{border-color:var(--accent);background:var(--accent-soft);color:var(--accent)}
.search{display:flex;min-width:0}
.search input{width:100%;min-width:0;font:14px var(--sans);color:var(--ink);background:var(--surface);border:1px solid var(--line);border-radius:6px;padding:6px 10px}
main{padding-top:22px}
.source{display:grid;gap:14px;margin-bottom:48px;grid-template-columns:minmax(0,1fr)}
.source-head{display:grid;gap:6px;max-width:880px}
.source-head>*{margin:0}
.source-head h2{font-size:clamp(22px,3vw,30px)}
.source-head p{color:var(--muted)}
.cards{display:grid;gap:18px;grid-template-columns:minmax(0,1fr)}
.card,.pattern{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:18px;box-shadow:var(--shadow);scroll-margin-top:170px}
.card{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:24px}
.shot{margin:0;align-self:start;position:sticky;top:170px;display:grid;gap:6px}
.zoom{display:block;width:100%;padding:0;border:1px solid var(--line);border-radius:8px;overflow:hidden;background:var(--sunk)}
.zoom img{display:block;width:100%;height:auto}
.zoom:hover{border-color:var(--accent)}
.shot figcaption{font:12px var(--mono);color:var(--muted)}
.empty-shot{display:grid;place-items:center;min-height:160px;border:1px dashed var(--line-strong);border-radius:8px;color:var(--muted);font:13px var(--mono)}
.card-body,.pattern{display:grid;gap:12px;align-content:start;min-width:0;grid-template-columns:minmax(0,1fr)}
.card-body>*,.pattern>*{margin:0}
.card-body header,.pattern header{display:flex;flex-wrap:wrap;align-items:baseline;gap:6px 10px}
.num{font:500 13px var(--mono);color:var(--muted)}
.card-body h3,.pattern h3{margin:0;font-size:20px;flex:1 1 auto}
.status{font:500 12px var(--mono);padding:2px 9px;border-radius:999px;white-space:nowrap}
.status[data-status="ok"]{background:var(--ok-soft);color:var(--ok)}
.status[data-status="pending"]{background:var(--wait-soft);color:var(--wait)}
.status[data-status="down"]{background:var(--down-soft);color:var(--down)}
.tagline{color:var(--muted)}
.tags{display:flex;flex-wrap:wrap;gap:6px}.tags a{text-decoration:none}
.meta{display:grid;gap:4px;margin:0;font-size:14px;border-block:1px solid var(--line);padding-block:10px}
.meta div{display:grid;grid-template-columns:7.5em minmax(0,1fr);gap:12px}
.meta dt{color:var(--muted)}.meta dd{margin:0}
.k{display:block;font:500 11px var(--mono);letter-spacing:.1em;color:var(--muted);margin-bottom:2px}
.keyed[data-key="가져올 것"]{padding-left:10px;border-left:3px solid var(--ok)}
.keyed[data-key="안 가져올 것"]{padding-left:10px;border-left:3px solid var(--down)}
.plan{display:flex;flex-wrap:wrap;gap:8px;align-items:start;padding-top:4px}
.plan details{flex:1 1 240px;min-width:0}
.plan summary{cursor:pointer;color:var(--muted);font-size:14px;padding-block:3px}
.plan pre,.code{margin:6px 0 0;padding:12px 14px;background:var(--code);border:1px solid var(--line);border-radius:8px;font:13px/1.65 var(--mono)}
.plan pre{white-space:pre-wrap;overflow-wrap:anywhere}
.code{white-space:pre;overflow-x:auto}
.code code{background:none;padding:0;font:inherit}
.copy{border:1px solid var(--line-strong);background:var(--surface);border-radius:6px;padding:3px 10px;font-size:13px}
.copy:hover{border-color:var(--accent);color:var(--accent)}
.copy[data-done]{background:var(--ok-soft);border-color:var(--ok);color:var(--ok)}
.table-wrap{overflow-x:auto}
table{border-collapse:collapse;width:100%;font-size:14px}
th,td{text-align:left;vertical-align:top;padding:7px 10px;border-bottom:1px solid var(--line)}
th{font-weight:500;color:var(--muted);white-space:nowrap}
.path{font:.88em var(--mono);color:var(--muted)}
ul,ol{margin:0;padding-left:1.3em;display:grid;gap:4px}
blockquote{margin:0;padding:2px 0 2px 14px;border-left:3px solid var(--line-strong);color:var(--muted)}
.empty{padding:28px;text-align:center;color:var(--muted)}
.empty button{border:0;background:none;color:var(--accent);text-decoration:underline;padding:0}
.doc{display:grid;gap:14px;max-width:860px;min-width:0;grid-template-columns:minmax(0,1fr);margin-bottom:18px}
.doc>*,.doc-section>*{margin:0}
.doc-section{display:grid;gap:12px;padding-top:26px;border-top:1px solid var(--line);grid-template-columns:minmax(0,1fr)}
.doc-section h2{font-size:22px}
.foot{margin-top:40px;padding-top:16px;border-top:1px solid var(--line);font-size:13px;color:var(--muted)}
dialog{border:0;padding:0;background:transparent;max-width:min(96vw,1600px);max-height:94vh}
dialog::backdrop{background:rgba(8,10,9,.86)}
dialog img,dialog video{display:block;max-width:min(96vw,1600px);max-height:90vh;margin:auto;border-radius:6px}
dialog .close{position:fixed;top:calc(env(safe-area-inset-top,0px) + 12px);right:16px;width:44px;height:44px;border-radius:50%;border:0;background:#fff;color:#111;font-size:26px;line-height:1}
@media (max-width:860px){
  .card{grid-template-columns:minmax(0,1fr);gap:16px;padding:14px}
  .pattern{padding:14px}
  .shot{position:static}
  .meta div{grid-template-columns:minmax(0,1fr);gap:0}
  .bar{position:static}
  .card,.pattern{scroll-margin-top:12px}
}
@media (prefers-reduced-motion:no-preference){.copy,.chips button,.zoom{transition:background-color .15s,color .15s,border-color .15s}}
</style>`;

const SCRIPT = String.raw`
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const TABS = ['sites', 'patterns', 'guide'];
const live = $('#live');
function showTab(name) {
  for (const t of TABS) {
    $('#' + t).hidden = t !== name;
    $('#tab-' + t).setAttribute('aria-selected', String(t === name));
  }
  $('#filters').hidden = name !== 'sites';
}
$$('[role="tab"]').forEach((b) => b.addEventListener('click', () => { showTab(b.getAttribute('aria-controls')); scrollTo({ top: 0 }); }));

const f = { pattern: 'all', family: 'all', status: 'all' };
const q = $('#q');
function apply() {
  const words = q.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
  let shown = 0;
  $$('#sites .card').forEach((c) => {
    const text = c.textContent.toLowerCase();
    const ok = (f.pattern === 'all' || c.dataset.patterns.split(' ').includes(f.pattern))
      && (f.family === 'all' || c.dataset.families.split('|').includes(f.family))
      && (f.status === 'all' || c.dataset.status === f.status)
      && words.every((w) => text.includes(w));
    c.hidden = !ok;
    if (ok) shown++;
  });
  $$('#sites .source').forEach((s) => { s.hidden = !s.querySelector('.card:not([hidden])'); });
  $('#empty').hidden = shown > 0;
  live.textContent = shown ? shown + '곳 표시' : '조건에 맞는 사이트 없음';
}
function press(key, value) {
  f[key] = value;
  $$('[data-f-' + key + ']').forEach((x) => x.setAttribute('aria-pressed', String(x.getAttribute('data-f-' + key) === value)));
}
for (const key of Object.keys(f)) {
  $$('[data-f-' + key + ']').forEach((b) => b.addEventListener('click', () => { press(key, b.getAttribute('data-f-' + key)); apply(); }));
}
q.addEventListener('input', apply);
function resetFilters() { for (const key of Object.keys(f)) press(key, 'all'); q.value = ''; apply(); }
$('#reset').addEventListener('click', resetFilters);

function go(hash, smooth) {
  const id = decodeURIComponent(hash.replace(/^#/, ''));
  if (!id) return;
  if (TABS.includes(id)) { showTab(id); scrollTo({ top: 0 }); return; }
  const el = document.getElementById(id);
  if (!el) return;
  const panel = el.closest('[role="tabpanel"]');
  if (panel) showTab(panel.id);
  if (el.closest('[hidden]')) resetFilters();
  el.scrollIntoView({ behavior: smooth && !matchMedia('(prefers-reduced-motion: reduce)').matches ? 'smooth' : 'auto', block: 'start' });
}
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  e.preventDefault();
  go(a.getAttribute('href'), true);
  try { history.replaceState(null, '', a.getAttribute('href')); } catch {}
});
window.addEventListener('hashchange', () => go(location.hash, true));

async function copySummary(btn) {
  const box = btn.closest('.plan');
  const pre = $('pre', box);
  const label = btn.textContent;
  const done = (msg) => { btn.textContent = msg; btn.setAttribute('data-done', ''); live.textContent = msg; setTimeout(() => { btn.textContent = label; btn.removeAttribute('data-done'); }, 1600); };
  try { await navigator.clipboard.writeText(pre.textContent); done('복사됨'); return; } catch {}
  $('details', box).open = true;
  const r = document.createRange(); r.selectNodeContents(pre);
  getSelection().removeAllRanges(); getSelection().addRange(r);
  done('선택됨 · Ctrl+C');
}
document.addEventListener('click', (e) => { const b = e.target.closest('button.copy'); if (b) copySummary(b); });

const viewer = $('#viewer'), vImg = $('#viewer-img'), vVideo = $('#viewer-video');
document.addEventListener('click', (e) => {
  const z = e.target.closest('button.zoom');
  if (!z) return;
  const video = z.dataset.video;
  vVideo.hidden = !video; vImg.hidden = Boolean(video);
  if (video) { vVideo.poster = z.dataset.src; vVideo.src = video; } else { vImg.src = z.dataset.src; vImg.alt = z.getAttribute('aria-label'); }
  viewer.showModal();
});
$('#viewer-close').addEventListener('click', () => viewer.close());
viewer.addEventListener('click', (e) => { if (e.target === viewer) viewer.close(); });
viewer.addEventListener('close', () => { vVideo.pause(); vVideo.removeAttribute('src'); vVideo.load(); });

showTab('sites');
if (location.hash) go(location.hash, false);
`;
````

녹화는 자동 재생하지 않는다(`autoplay` 없음). 동작 줄이기 설정에서도 사용자가 누를 때만 재생된다.

- [ ] **Step 4: 렌더 테스트 통과 확인**

Run: `node --test references/build.test.mjs`
Expected: PASS — 9 tests

- [ ] **Step 5: `references/build.mjs` 작성**

```js
// references/*.md → catalog.json + gallery.html
// 원본은 마크다운이다. 이 스크립트가 만든 두 파일은 직접 고치지 않는다.
//   node references/build.mjs            생성
//   node references/build.mjs --check    카드 규칙과 생성물 최신 여부 확인 (아니면 exit 1)
//   node references/build.mjs --site DIR claude.ai 게시용 index.html과 media/ 복사본을 DIR에 만든다
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { splitDoc } from '../tools/md-blocks.mjs';
import { parseSiteDoc, parsePatterns, validate, toCatalog } from './model.mjs';
import { renderPage, HEAD, STYLE } from './gallery.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '..');
const argv = process.argv.slice(2);
const checkOnly = argv.includes('--check');
const siteAt = argv.indexOf('--site');
const siteDir = siteAt >= 0 ? path.resolve(argv[siteAt + 1] ?? '') : null;

const read = (file) => fs.readFileSync(path.join(HERE, file), 'utf8');
const siteFiles = fs.readdirSync(HERE).filter((f) => f.endsWith('.md') && f !== 'README.md' && f !== 'patterns.md').sort();

const pat = parsePatterns('patterns.md', read('patterns.md'));
const docs = siteFiles.map((file) => ({ file, ...parseSiteDoc(file, read(file)) }));
const sites = docs.flatMap((d) => d.sites);
const errors = [
  ...pat.errors,
  ...docs.flatMap((d) => d.errors),
  ...validate(sites, pat.patterns, (rel) => fs.existsSync(path.join(HERE, ...rel.split('/')))),
];
if (errors.length) {
  console.error(`references: 카드 규칙 오류 ${errors.length}개\n${errors.map((e) => `  - ${e}`).join('\n')}`);
  process.exit(1);
}

const model = { readme: splitDoc(read('README.md').replace(/\r\n/g, '\n')), patternDoc: pat.doc, docs, sites, patterns: pat.patterns };
const catalog = toCatalog(sites, pat.patterns, [...siteFiles, 'patterns.md']);
const local = renderPage(model, { mode: 'local', root: HERE });
const html = `<!doctype html>\n<html lang="ko">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n${HEAD}\n${STYLE}\n</head>\n<body>\n${local.body}\n</body>\n</html>\n`;
const json = `${JSON.stringify(catalog, null, 2)}\n`;
const outputs = [[path.join(HERE, 'gallery.html'), html], [path.join(HERE, 'catalog.json'), json]];

if (checkOnly) {
  const stale = outputs.filter(([file, text]) => !fs.existsSync(file) || fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n') !== text.replace(/\r\n/g, '\n'));
  if (stale.length) {
    console.error(`references: 생성물이 오래됐습니다 — ${stale.map(([f]) => path.relative(REPO, f)).join(', ')}\n  pnpm references:build 로 다시 만드세요.`);
    process.exit(1);
  }
  console.log('references: 카드 규칙 통과, 생성물 최신');
} else {
  for (const [file, text] of outputs) fs.writeFileSync(file, text);
  console.log(`references: 사이트 ${sites.length}곳 · 패턴 ${pat.patterns.length}개 → gallery.html, catalog.json`);
}

if (siteDir) {
  const site = renderPage(model, { mode: 'site', root: HERE });
  fs.mkdirSync(siteDir, { recursive: true });
  fs.writeFileSync(path.join(siteDir, 'index.html'), `${HEAD}\n${STYLE}\n${site.body}\n`);
  for (const [published, abs] of site.files) {
    const dest = path.join(siteDir, ...published.split('/'));
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(abs, dest);
  }
  fs.writeFileSync(path.join(siteDir, 'files.json'), JSON.stringify([...site.files.keys()], null, 2));
  console.log(`site: ${siteDir} (${site.files.size}개 미디어)`);
}
```

- [ ] **Step 6: 원본 마크다운 4개 작성** (모든 카드는 아직 `⏸`. 내용은 노션 카드에서 온 것이며 Task 4에서 직접 확인한 내용으로 바꾼다)

`references/README.md`:

`````markdown
# 인터랙티브 레퍼런스

인터랙티브를 만들 때 참고할 **외부 사이트**를 직접 열어 보고 정리했습니다. 따라 만들 대상이 아니라 참고용입니다. 설계는 [docs/13](../docs/13-인터랙티브-레퍼런스-보관소-설계.md)에 있습니다.

## 보는 법

| 어디서 | 방법 |
|---|---|
| **웹 보관함** (추천) | [`gallery.html`](gallery.html)을 브라우저로 연다. 패턴·패밀리·확인 상태 필터, 검색, 캡처 크게 보기, **플랜용 요약 복사** |
| 어느 기기에서나 | claude.ai 보관함 페이지(비공개) — 첫 게시 후 주소를 여기에 적는다 |
| 에이전트 | [`patterns.md`](patterns.md)에서 패턴으로 찾고, [`catalog.json`](catalog.json)의 `summary`를 플랜에 붙인다 |

**원본은 마크다운**이고 `gallery.html`·`catalog.json`은 [`build.mjs`](build.mjs)가 만든 생성물이다. `.md`를 고친 뒤 `pnpm references:build`를 실행한다. 루트 `pnpm check`가 카드 규칙과 생성물 최신 여부를 검사한다. 사이트 목록은 보관함과 `catalog.json`이 보여 주므로 여기에 따로 적지 않는다.

| 파일 | 내용 |
|---|---|
| [patterns.md](patterns.md) | 패턴 색인 — 만들려는 상호작용으로 찾는다 |
| [motionsites.md](motionsites.md) | MotionSites AI — AI 웹 디자인 프롬프트·움직이는 배경 모음(공개 페이지만) |
| [notefolio-portfolios.md](notefolio-portfolios.md) | 노트폴리오가 모은 인터랙티브 포트폴리오 6곳 |

표시: ✅ 직접 확인 · ⏸ 미확인 · ⚠️ 접속 불가

## 쓰는 규칙

- 레퍼런스의 문구·이미지·브랜드·코드는 그대로 옮기지 않는다. 상호작용 방식을 우리 레이어와 데이터로 다시 설계한다.
- ⏸ 미확인 카드는 근거로 단정하지 않는다. ⚠️ 카드나 확인한 지 90일이 넘은 카드는 쓰기 직전에 사이트가 살아 있는지 다시 본다.
- 유료 프롬프트·계정이 필요한 자료의 본문은 저장소에 옮기지 않는다.
- 캡처·녹화는 내부 참고용이다. 공개 배포하는 작품·허브에 넣지 않는다.
- 실제로 참고했으면 카드의 **쓰인 작품**에 작품 이름을 적는다.

## 노션에서 가져오는 법

노션 **Instagram 리서치** DB(`collection://02db5062-22f7-41cb-9741-3b4b712b732c`)가 수집함이고, 이 폴더가 정리본이다.

1. 사용자가 행의 Tags에 `인터랙티브 참고`를 붙인다.
2. "레퍼런스 가져와"라고 하면 에이전트가 노션 커넥터로 태그가 붙은 행을 조회한다(rows 모드 `Tags` `enum_contains` 필터). 막히면 뷰 전체를 읽고 걸러 낸다.
3. `catalog.json`의 `notion`·`url`과 비교해 새 행과 새 사이트만 고른다. 같은 자료가 DM과 Message Request로 두 번 들어온 행이 있으니 중복 행 id도 카드에 함께 적는다.
4. 행 본문에서 사이트 주소를 뽑는다. 한 행에 여러 사이트가 있을 수 있고, 그때는 카드마다 같은 노션 id를 적는다. 주소가 없는 행은 건너뛰고 보고한다.
5. 사이트마다 Aside로 직접 연다: 1440px·390px, 입력 → 바뀌는 상태 → 피드백 → 되돌리기, 키보드·터치·동작 줄이기·로딩 시간, 네트워크·DOM에서 보이는 기술 흔적.
6. 카드를 쓰고, 새 패턴이면 `patterns.md`에 추가한다. 캡처는 `media/<사이트id>/`에 긴 변 1280px webp 2장 이하, 녹화는 10초 이하 무음 webm 1개, 사이트당 합계 2MB 이하.
7. `pnpm references:build` → `pnpm check` → 보관함을 같은 주소로 다시 게시한다. 노션에는 되쓰지 않는다.

노션 커넥터가 없는 세션(Codex 등)은 가져오기를 하지 않고 읽기만 한다. 커넥터가 끊겼으면 멈추고 `/mcp` 재연결을 안내한다.

미디어 변환:

```bash
ffmpeg -y -i shot.png -vf "scale='min(1280,iw)':'min(1280,ih)':force_original_aspect_ratio=decrease" -quality 80 media/<id>/<이름>.webp
ffmpeg -y -i rec.mp4 -t 10 -an -vf "scale='min(1280,iw)':-2" -c:v libvpx-vp9 -b:v 0 -crf 40 media/<id>/walk.webm
du -cb media/<id> | tail -1   # 2097152 이하
```

## 카드 양식

````markdown
### <id> · <이름> — <한 줄 성격>

<img src="media/<id>/<캡처>.webp" width="360">

| 항목 | 내용 |
|---|---|
| 주소 | https://… |
| 출처 | <소개한 계정·문서> · 가져온 날 YYYY-MM-DD |
| 노션 | `<행 id>`, `<중복 행 id>` |
| 확인 | ✅ YYYY-MM-DD · 1440px, 390px · Aside |
| 패턴 | `<패턴 id>` |
| 패밀리 | A / A' / B / D / E / 새 패턴 |
| 기술 흔적 | (추정) … |
| 쓰인 작품 | — |

**무엇이 다른가** — 한두 줄

| 입력 | 바뀌는 상태 | 보이는 피드백 | 되돌리기 |
|---|---|---|---|
| … | … | … | … |

**대체 경로** — 키보드 · 터치/모바일 · 동작 줄이기 · 로딩 시간

**가져올 것** — …

**안 가져올 것** — …

**우리 레이어로 옮기면** — 레이어 id 후보와 파라미터(docs/11 용어), 고정값이 필요하면 이유

**확인 한계** — 보지 못한 화면, 추정한 부분

[녹화](media/<id>/walk.webm)
````

필수: 주소·출처·확인·패턴·패밀리, "가져올 것"·"안 가져올 것" 문단. ✅ 카드는 캡처가 있어야 한다. 규칙에 어긋나면 빌드가 실패한다.

## 패턴 양식

````markdown
### `<패턴 id>` — <이름>

한두 줄 설명

| 항목 | 내용 |
|---|---|
| 맞는 의뢰 | … |
| 패밀리 | … |
| 레이어 대응 | 레이어 후보 — 파라미터 |
| 검수할 점 | … |
````

사례 사이트 목록은 적지 않는다. 빌드가 카드의 패턴 칸에서 모은다. 쓰는 카드가 없는 패턴은 빌드가 실패한다.
`````

`references/patterns.md`:

```markdown
# 패턴 색인

만들려는 **상호작용**으로 찾는다. 사례 사이트는 카드의 패턴 칸에서 빌드가 모은다. 레이어 대응은 [docs/11](../docs/11-레이어-설정-시스템-설계.md) 용어로 적는다. 첫 목록은 노션 큐레이션 기준이며, 사이트를 직접 확인한 뒤 고친다.

### `desktop-os` — 데스크톱 OS 은유

작업물·정보를 창·아이콘·폴더로 연다. 방문자가 이미 아는 조작(아이콘 열기, 창 닫기·끌기)을 탐색으로 쓴다.

| 항목 | 내용 |
|---|---|
| 맞는 의뢰 | 작업물이 많은 개인 포트폴리오, 레트로·장난스러운 콘셉트 |
| 패밀리 | 새 패턴 |
| 레이어 대응 | 배경화면 · 아이콘 그리드 · 창 프레임 · 창 내용 · 작업 표시줄 — 창 크기·처음 위치·열림 모션·아이콘 간격 |
| 검수할 점 | 창 포커스 순서, Escape로 닫기, 창이 겹칠 때 읽기 순서, 모바일에서는 창 대신 전체 화면 |

### `drive-to-explore` — 게임형 공간 탐색

방문자가 캐릭터·탈것을 움직여 공간을 돌아다니며 작업물을 발견한다.

| 항목 | 내용 |
|---|---|
| 맞는 의뢰 | 기억에 남아야 하는 개인·스튜디오 소개, 게임 감각이 브랜드인 곳 |
| 패밀리 | A' |
| 레이어 대응 | 월드(지형·오브젝트) · 플레이어 · 안내 표지 · HUD · 목록 대체 화면 — 이동 속도·카메라 거리·표지 문구 |
| 검수할 점 | 키보드·터치 조작, 조작 없이 작업 목록으로 바로 가는 경로, 느린 기기의 로딩과 프레임 |

### `moodboard-canvas` — 자유 배치 무드보드

작업 이미지를 격자 대신 자유롭게 흩어 놓고, 끌거나 훑으며 본다.

| 항목 | 내용 |
|---|---|
| 맞는 의뢰 | 이미지 중심 작업(일러스트·사진·브랜딩) |
| 패밀리 | 새 패턴 |
| 레이어 대응 | 캔버스 배경 · 작업 카드(위치·회전·크기) · 상세 오버레이 — 흩어짐 정도·카드 크기·끌기 관성 |
| 검수할 점 | 카드가 겹칠 때 읽기 순서와 포커스, 390px에서 목록형 대체, 끌지 않고도 모든 작업에 닿는지 |

### `hand-drawn` — 손그림 표현

글자·선·버튼을 손으로 그린 질감으로 표현해 작가의 손맛을 첫인상으로 쓴다.

| 항목 | 내용 |
|---|---|
| 맞는 의뢰 | 일러스트레이터·작가 포트폴리오 |
| 패밀리 | 새 패턴 |
| 레이어 대응 | 손그림 장식 · 손글씨 제목 · 종이 질감 배경 — 장식 이미지 교체·흔들림 모션·질감 불투명도 |
| 검수할 점 | 문구를 손글씨 이미지에 굽지 않기(문구는 레이어 파라미터), 대비, 대체 텍스트 |

### `illustration-hero` — 일러스트 히어로 모션

첫 화면을 큰 일러스트와 그 일러스트의 움직임으로 채운다.

| 항목 | 내용 |
|---|---|
| 맞는 의뢰 | 일러스트·애니메이션 작가, 캐릭터 IP |
| 패밀리 | 새 패턴 |
| 레이어 대응 | 히어로 일러스트(부위별 분리) · 배경 · 제목 · 스크롤 안내 — 부위별 모션 강도·반복 속도·포인터 반응 |
| 검수할 점 | 동작 줄이기에서 정지 프레임, 첫 화면 로딩 용량, 텍스트 겹침 대비 |

### `expand-gallery` — 클릭하면 펼쳐지는 갤러리

작은 사진을 누르면 그 자리에서 크게 펼쳐지거나 이어진 사진이 드러난다.

| 항목 | 내용 |
|---|---|
| 맞는 의뢰 | 사진·공간·제품 작업 |
| 패밀리 | 새 패턴 |
| 레이어 대응 | 썸네일 격자 · 펼침 무대 · 캡션 · 닫기 버튼 — 펼침 크기·전환 길이·곡선·캡션 위치 |
| 검수할 점 | Escape·뒤로 가기로 닫기, 포커스 복귀, 동작 줄이기에서 즉시 전환, 큰 이미지 지연 로드 |

### `motion-bg-hero` — 움직이는 배경 히어로

영상·셰이더·생성 배경이 계속 움직이는 첫 화면 위에 큰 제목과 행동 버튼을 둔다.

| 항목 | 내용 |
|---|---|
| 맞는 의뢰 | 브랜드·제품 랜딩, SaaS 소개 |
| 패밀리 | D |
| 레이어 대응 | 배경(영상·캔버스) · 어둡게 덮는 층 · 제목·부제 · 행동 버튼 — 배경 속도·밝기·덮는 층 불투명도·문구 |
| 검수할 점 | 동작 줄이기에서 정지 이미지, 영상 용량·포스터, 글자 대비, 배경 없이도 읽히는지 |
```

`references/motionsites.md`:

```markdown
# MotionSites AI — AI 웹 디자인 프롬프트 모음

@viktoroddy가 인스타그램 DM으로 알려 준 [motionsites.ai](https://motionsites.ai/). 히어로·랜딩·SaaS·포트폴리오·3D 화면용 웹 디자인 프롬프트와 움직이는 배경을 판다. **공개 페이지만 본다.** 계정·MCP는 연결하지 않고, 유료 프롬프트 본문은 가져오지 않는다(사용자 결정 2026-09-30).

### motionsites · MotionSites AI — 움직이는 배경 히어로 프롬프트 모음

| 항목 | 내용 |
|---|---|
| 주소 | https://motionsites.ai/ |
| 출처 | @viktoroddy DM · 가져온 날 2026-09-30 |
| 노션 | `3e9d12f2-3255-8115-b9a1-c0346ef28372`, `3e9d12f2-3255-811e-b650-c87820f02b71` |
| 확인 | ⏸ |
| 패턴 | `motion-bg-hero` |
| 패밀리 | D |
| 기술 흔적 | — |
| 쓰인 작품 | — |

**무엇이 다른가** — 노션 카드 기준: 카테고리(Hero·Landing Page·SaaS·Portfolio·3D)별 웹 디자인 프롬프트와 움직이는 AI 배경. Claude Code·Cursor·Codex용 MCP가 있고 로그인이 필요하다. 조사 당시 안내는 무료 계정 3개, 유료 500개 이상(쓸 때 다시 확인).

**가져올 것** — 공개 미리보기에서 보이는 첫 화면 구성·배경 모션·타이포 조합을 우리 요구로 다시 적는 방식

**안 가져올 것** — 유료 프롬프트 본문, 데모 외형 그대로의 복제

**확인 한계** — 아직 공개 페이지를 직접 열어 보지 않았다. 프롬프트 본문은 유료라 가져오지 않는다.
```

`references/notefolio-portfolios.md`:

```markdown
# 노트폴리오 — 인터랙티브 포트폴리오 6곳

노트폴리오(@notefolio)가 인스타그램 DM으로 보내 준 큐레이션 "포트폴리오 사이트 아이디어, 싹 다 모아왔어요"(stunningkr.notion.site)에서 가져왔다. 큐레이션은 사이트마다 한 줄 소개뿐이라 동작은 직접 열어 보고 적는다.

### bychudy · Chudy Miłosz — 데스크톱 OS 형식 포트폴리오

| 항목 | 내용 |
|---|---|
| 주소 | https://www.bychudy.com/ |
| 출처 | @notefolio 큐레이션 · 가져온 날 2026-09-30 |
| 노션 | `3ead12f2-3255-81b6-99ab-daa10d99e0a4`, `3ead12f2-3255-8141-848c-c93822c5554a` |
| 확인 | ⏸ |
| 패턴 | `desktop-os` |
| 패밀리 | 새 패턴 |
| 기술 흔적 | — |
| 쓰인 작품 | — |

**무엇이 다른가** — 큐레이션 소개: macOS 같은 데스크톱 인터페이스로 작업물을 묶는다.

**가져올 것** — 작업물을 창·아이콘으로 여는 익숙한 조작

**안 가져올 것** — 데스크톱 화면을 그대로 흉내 낸 외형, 모바일에서도 창을 겹치는 배치

**확인 한계** — 아직 직접 열어 보지 않았다.

### bruno-simon · Bruno Simon — 운전 게임으로 둘러보는 포트폴리오

| 항목 | 내용 |
|---|---|
| 주소 | https://bruno-simon.com/ |
| 출처 | @notefolio 큐레이션 · 가져온 날 2026-09-30 |
| 노션 | `3ead12f2-3255-81b6-99ab-daa10d99e0a4`, `3ead12f2-3255-8141-848c-c93822c5554a` |
| 확인 | ⏸ |
| 패턴 | `drive-to-explore` |
| 패밀리 | A' |
| 기술 흔적 | — |
| 쓰인 작품 | — |

**무엇이 다른가** — 큐레이션 소개: 자동차를 운전하는 게임 방식으로 포트폴리오를 탐색한다.

**가져올 것** — 공간을 돌아다니며 작업을 발견하는 탐색

**안 가져올 것** — 운전 조작만 있는 탐색(키보드·터치 대체와 작업 목록으로 바로 가는 경로 없이)

**확인 한계** — 아직 직접 열어 보지 않았다.

### annamills · Annamills — 무드보드처럼 배치한 작업물

| 항목 | 내용 |
|---|---|
| 주소 | https://annamills.xyz/ |
| 출처 | @notefolio 큐레이션 · 가져온 날 2026-09-30 |
| 노션 | `3ead12f2-3255-81b6-99ab-daa10d99e0a4`, `3ead12f2-3255-8141-848c-c93822c5554a` |
| 확인 | ⏸ |
| 패턴 | `moodboard-canvas` |
| 패밀리 | 새 패턴 |
| 기술 흔적 | — |
| 쓰인 작품 | — |

**무엇이 다른가** — 큐레이션 소개: 작업물을 무드보드처럼 배치한다.

**가져올 것** — 격자 대신 흩어 놓은 이미지 배치

**안 가져올 것** — 작업 제목·설명을 찾기 어려운 배치

**확인 한계** — 아직 직접 열어 보지 않았다.

### clarakirkpatrick · Clara Kirkpatrick — 낙서풍 일러스트 포트폴리오

| 항목 | 내용 |
|---|---|
| 주소 | https://clarakirkpatrick.com/ |
| 출처 | @notefolio 큐레이션 · 가져온 날 2026-09-30 |
| 노션 | `3ead12f2-3255-81b6-99ab-daa10d99e0a4`, `3ead12f2-3255-8141-848c-c93822c5554a` |
| 확인 | ⏸ |
| 패턴 | `hand-drawn` |
| 패밀리 | 새 패턴 |
| 기술 흔적 | — |
| 쓰인 작품 | — |

**무엇이 다른가** — 큐레이션 소개: 낙서풍 일러스트로 사이트를 표현한다.

**가져올 것** — 손그림 질감으로 작가의 손맛을 첫인상으로 쓰는 방식

**안 가져올 것** — 문구를 손글씨 이미지에 굽는 것(우리 규칙: 문구는 레이어 파라미터)

**확인 한계** — 아직 직접 열어 보지 않았다.

### loonamessal · Loona Messal — 큰 애니메이션 일러스트 포트폴리오

| 항목 | 내용 |
|---|---|
| 주소 | https://loonamessal-art.com/ |
| 출처 | @notefolio 큐레이션 · 가져온 날 2026-09-30 |
| 노션 | `3ead12f2-3255-81b6-99ab-daa10d99e0a4`, `3ead12f2-3255-8141-848c-c93822c5554a` |
| 확인 | ⏸ |
| 패턴 | `illustration-hero` |
| 패밀리 | 새 패턴 |
| 기술 흔적 | — |
| 쓰인 작품 | — |

**무엇이 다른가** — 큐레이션 소개: 큰 일러스트와 애니메이션으로 인상을 남긴다.

**가져올 것** — 첫 화면을 큰 일러스트와 움직임으로 채우는 인상

**안 가져올 것** — 멈출 수 없는 첫 화면 움직임(동작 줄이기 대응 없이)

**확인 한계** — 아직 직접 열어 보지 않았다.

### julesesick · Jules Esick — 클릭하면 사진이 펼쳐지는 포트폴리오

| 항목 | 내용 |
|---|---|
| 주소 | https://www.julesesick.com/ |
| 출처 | @notefolio 큐레이션 · 가져온 날 2026-09-30 |
| 노션 | `3ead12f2-3255-81b6-99ab-daa10d99e0a4`, `3ead12f2-3255-8141-848c-c93822c5554a` |
| 확인 | ⏸ |
| 패턴 | `expand-gallery` |
| 패밀리 | 새 패턴 |
| 기술 흔적 | — |
| 쓰인 작품 | — |

**무엇이 다른가** — 큐레이션 소개: 클릭하면 사진이 펼쳐지는 구성이다.

**가져올 것** — 누르면 그 자리에서 사진이 펼쳐지는 전환

**안 가져올 것** — 닫는 방법이 전환 애니메이션에만 기대는 구성

**확인 한계** — 아직 직접 열어 보지 않았다.
```

- [ ] **Step 7: `package.json` scripts 수정**

`"check"`를 아래로 바꾸고 세 줄을 추가한다:
```json
    "check": "node prompts/build.mjs --check && node references/build.mjs --check && node --test tools/md-blocks.test.mjs references/build.test.mjs && pnpm -r --if-present check",
    "references:build": "node references/build.mjs",
    "references:check": "node references/build.mjs --check",
    "references:test": "node --test tools/md-blocks.test.mjs references/build.test.mjs",
```

- [ ] **Step 8: 생성과 검사**

```bash
node references/build.mjs
node references/build.mjs --check
node --test tools/md-blocks.test.mjs references/build.test.mjs
node prompts/build.mjs --check
```
Expected: `references: 사이트 7곳 · 패턴 7개 → gallery.html, catalog.json`, `references: 카드 규칙 통과, 생성물 최신`, 테스트 13개 PASS, `prompts: 생성물 최신`.

- [ ] **Step 9: 규칙 위반을 일부러 넣어 실패 확인 후 되돌리기**

`references/notefolio-portfolios.md`의 bychudy 패턴을 `` `desktop-osx` ``로 바꾸고 `node references/build.mjs --check` 실행.
Expected: exit 1, `notefolio-portfolios.md bychudy: patterns.md에 없는 패턴 \`desktop-osx\``와 `patterns.md \`desktop-os\`: 이 패턴을 쓰는 사이트 카드가 없음`. 원래대로 되돌리고 다시 `--check`가 통과하는지 확인한다.

- [ ] **Step 10: 체크포인트** — `git status --short`(커밋은 사용자 요청 시).

---

### Task 4: 사이트 7곳 직접 확인 (Aside)

**Files:**
- Modify: `references/motionsites.md`, `references/notefolio-portfolios.md`, `references/patterns.md`
- Create: `references/media/<사이트id>/*.webp`, `references/media/<사이트id>/walk.webm`(녹화한 경우)
- Regenerate: `references/gallery.html`, `references/catalog.json`

**Interfaces:**
- Consumes: Task 3의 카드 양식·빌드
- Produces: ✅/⚠️ 카드 7장, 확정된 `patterns.md`

- [ ] **Step 1: 전제 확인** — Aside 도구가 로드됐는지 확인한다(ToolSearch `aside`). 없으면 **멈추고** 사용자에게 알린다. 원인 후보: Aside가 기본 프로필(`~/.claude.json`)에만 등록되고 이 세션 프로필(`CLAUDE_CONFIG_DIR=~/.claude-team`)에는 없음 → `claude mcp add --scope user aside -- "C:\Users\ssool\AppData\Local\Aside\CLI\current\aside.exe" mcp` 후 세션 재시작. `ffmpeg -version`이 되는지도 확인한다.

- [ ] **Step 2: 사이트마다 같은 절차** — 순서: `motionsites`, `bychudy`, `bruno-simon`, `annamills`, `clarakirkpatrick`, `loonamessal`, `julesesick`. 사이트마다 볼 핵심 조작:

| id | 볼 조작 |
|---|---|
| motionsites | 첫 화면, 카테고리 목록, 공개 미리보기 1~2개, 배경 페이지. **로그인·가입·Copy Prompt·MCP 연결을 누르지 않는다** |
| bychudy | 아이콘 열기, 창 닫기·끌기·겹치기 |
| bruno-simon | 로딩 화면, 키보드(방향키·WASD) 운전, 터치 대체, 작업 목록으로 가는 경로 |
| annamills | 무드보드 훑기·끌기, 작업 하나 열기·닫기 |
| clarakirkpatrick | 손그림 요소의 hover·클릭 반응, 문구가 텍스트인지 이미지인지(DOM 확인) |
| loonamessal | 첫 화면 애니메이션, 스크롤 반응 |
| julesesick | 사진 클릭 → 펼침 → 닫기, Escape·뒤로 가기 |

절차:
1. 1440×900으로 열고 첫 내용이 보일 때까지 걸린 대략의 시간과 로딩 화면 여부를 적는다.
2. 첫 화면 캡처 → `$S/raw/<id>-desktop.png`. 캡처가 실패하면(무거운 WebGL 등) 로딩이 끝난 뒤 한 번 더 시도한다. 그래도 안 되면 390px 화면으로 시도하고, 모두 실패하면 카드를 `⏸`로 두고 이유를 "확인 한계"에 적는다(✅는 캡처가 있어야 한다).
3. 핵심 조작을 2~3번 해 보고 입력 → 바뀌는 상태 → 보이는 피드백 → 되돌리기를 적는다. 가장 잘 보여 주는 상태를 캡처 → `$S/raw/<id>-state.png`(캡처는 모두 2장 이하).
4. Aside로 녹화할 수 있으면 조작 10초 이하 → `$S/raw/<id>-rec.mp4`. 못 하면 녹화 없이 진행하고 "확인 한계"에 적는다.
5. 키보드: 처음 포커스 10개를 Tab으로 지나가며 핵심 조작을 키보드로 할 수 있는지, Escape로 닫히는지 본다.
6. 390×844로 바꿔 배치와 터치 대체를 본다(캡처는 2장 한도 안에서만).
7. 동작 줄이기(`prefers-reduced-motion: reduce`)를 흉내 낼 수 있으면 다시 불러와 차이를 본다. 못 하면 "확인 못 함"으로 적는다.
8. 기술 흔적: `<canvas>`·WebGL 컨텍스트, 스크립트 이름(three, gsap, lottie, framer, webflow 등)을 DOM·네트워크에서 본다. 확신이 없으면 `(추정)`.
9. 미디어 변환(README "미디어 변환" 명령) → `references/media/<id>/desktop.webp`, `state.webp`, `walk.webm`. `du -cb references/media/<id> | tail -1`이 2097152 이하인지 확인한다. 넘으면 webp `-quality 70`, webm `-crf 45`로 다시 만든다.
10. 카드 갱신:
    - `확인`을 `✅ <오늘> · 1440px, 390px · Aside`로 바꾸고 `<img src="media/<id>/desktop.webp" width="360">`를 제목 아래에 넣는다.
    - 녹화가 있으면 `[녹화](media/<id>/walk.webm)`를 넣는다.
    - `무엇이 다른가`를 직접 본 내용으로 바꾸고, 상호작용 표·`대체 경로`·`우리 레이어로 옮기면`을 채운다. `가져올 것`·`안 가져올 것`·`기술 흔적`·`패밀리`를 고친다.
    - `확인 한계`에 보지 못한 것을 적는다.
    - 이름이 틀렸으면(예: `Annamills`) 제목의 이름만 고친다. id는 바꾸지 않는다.
11. 사이트가 안 열리면 `확인`을 `⚠️ <오늘>`로 바꾸고 이유를 `확인 한계`에 적는다(캡처 없이도 됨).
12. 사이트 하나가 끝날 때마다 `node references/build.mjs && node references/build.mjs --check`를 돌린다.

- [ ] **Step 3: 패턴 확정** — 직접 본 조작에 맞게 `patterns.md`의 설명·레이어 대응·검수할 점을 고친다. 한 사이트가 두 패턴에 걸치면 카드 패턴 칸에 둘 다 적는다. 어느 패턴에도 맞지 않는 조작이 나오면 새 패턴을 추가한다. 쓰는 카드가 없어진 패턴은 지운다(빌드가 검사).

- [ ] **Step 4: 검사**

```bash
node references/build.mjs && node references/build.mjs --check
node --test tools/md-blocks.test.mjs references/build.test.mjs
du -cb references/media | tail -1
grep -c "| 확인 | ⏸" references/*.md
```
Expected: 통과, 13 PASS, media 합계 약 14MB 이하(7×2MB), `⏸` 0개(모두 ✅ 또는 ⚠️).

- [ ] **Step 5: 체크포인트** — `git status --short`(커밋은 사용자 요청 시).

---

### Task 5: 보관함 브라우저 검수와 claude.ai 게시

**Files:**
- Modify: `references/README.md` (보관함 주소)
- Regenerate: `references/gallery.html`, `references/catalog.json`

**Interfaces:**
- Consumes: Task 4까지의 생성물
- Produces: claude.ai 비공개 보관함 주소(README에 기록)

- [ ] **Step 1: 로컬 보관함 열기** — Aside로 `file:///C:/Users/ssool/개발/바이브코딩/interactive-web/references/gallery.html`을 연다. `file://`이 막히면 `$S/serve.mjs`를 만들어 `node "$S/serve.mjs" references 4173`로 띄우고 `http://localhost:4173/gallery.html`을 연다:

```js
// $S/serve.mjs — node serve.mjs <dir> <port>
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const [dir = '.', port = 4173] = process.argv.slice(2);
const root = path.resolve(dir);
const types = { '.html': 'text/html; charset=utf-8', '.json': 'application/json', '.webp': 'image/webp', '.webm': 'video/webm', '.png': 'image/png' };
http.createServer((req, res) => {
  const p = path.join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!p.startsWith(root) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': types[path.extname(p)] ?? 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
}).listen(Number(port), () => console.log(`http://localhost:${port}/`));
```

- [ ] **Step 2: 검수 항목** — 하나씩 확인하고 결과를 이 플랜 끝 "검토 기록"에 적는다.
  1. 1440px, 390px에서 세 탭(사이트·패턴·쓰는 법) 모두 `document.documentElement.scrollWidth - innerWidth === 0`.
  2. 패턴 칩 `expand-gallery` → julesesick 카드만 보임. 상태 칩 `⚠️ 접속 불가` → 해당 카드만 보이거나, 없으면 빈 상태 문구 + "필터를 전체로 되돌리기"로 전부 복귀.
  3. 검색 `zzzz` → 빈 상태 문구, 되돌리기 버튼으로 복귀.
  4. 필터로 숨긴 카드를 가리키는 링크(패턴 탭의 "사례" 링크)를 누르면 필터가 풀리고 그 카드로 이동.
  5. 키보드: Tab으로 캡처 버튼 → Enter로 크게 보기 → Escape로 닫힘 → 포커스가 캡처 버튼으로 돌아옴.
  6. 동작 줄이기 흉내 → 재생 중인 `video`가 없음(`[...document.querySelectorAll('video')].every(v => v.paused)`).
  7. "플랜용 요약 복사" → "복사됨". 이어서 `navigator.clipboard.writeText = () => Promise.reject(new Error('blocked'))`를 실행하고 다시 누르면 요약이 펼쳐지고 선택된 텍스트(`getSelection().toString()`)가 카드의 `summary`와 같음, 버튼 문구 "선택됨 · Ctrl+C". **(Review Focus 5)**
  8. 콘솔 오류 0.
  문제가 나오면 `references/gallery.mjs`를 고치고 `node references/build.mjs` 후 다시 확인한다.

- [ ] **Step 3: 첫 게시** — `artifact-design` 스킬을 먼저 불러 페이지 계약(제목 2~4단어, `:root` 색 토큰과 다크 모드, `body` 배경, 390px 16px 여백, 가로 스크롤 없음)을 확인한다. 이어서:

```bash
rm -rf "$S/references-site"
node references/build.mjs --check --site "$S/references-site"
cat "$S/references-site/files.json"
```
Artifact 도구로 게시: `file_path` = `$S/references-site/index.html`, `files` = `files.json`의 경로마다 `{ "media/…": "$S/references-site/media/…" }`, `icon` = `bookmark`, `description` = "인터랙티브를 만들 때 참고할 외부 사이트 카드와 패턴 색인". 결과로 받은 주소를 적어 둔다.

- [ ] **Step 4: 주소 기록과 재게시** — `references/README.md`의 "어느 기기에서나" 행을 `[claude.ai 보관함 페이지](<받은 주소>) (비공개 — 본인만 열림, 공유는 페이지의 Share 메뉴)`로 바꾼다. 그다음 `node references/build.mjs` → `node references/build.mjs --check --site "$S/references-site"` → Artifact를 **같은 주소(`url`)로** 다시 게시한다(`icon` 생략).

- [ ] **Step 5: 게시본 확인** — Aside로 claude.ai 주소를 열 수 있으면 캡처와 복사 버튼이 동작하는지 본다. 열 수 없으면 "사용자 확인 필요"로 검토 기록에 적는다.

- [ ] **Step 6: 체크포인트** — `git status --short`(커밋은 사용자 요청 시).

---

### Task 6: 작업 규칙·문서 연결과 모의 점검

**Files:**
- Modify: `AGENTS.md`, `docs/00-README.md`, `docs/10-인터랙티브-개발-참고원칙.md`, `docs/13-인터랙티브-레퍼런스-보관소-설계.md`(상태 줄), 이 플랜(검토 기록)

**Interfaces:**
- Consumes: Task 1~5 결과
- Produces: 다음 세션 에이전트가 따르는 규칙

- [ ] **Step 1: `AGENTS.md` "매 작업의 순서" 고치기**

2단계 문장 끝 `모든 프로젝트에 모든 패턴을 강제로 넣지 않는다.` 뒤에 이어 붙인다:
```
 외부 사이트 레퍼런스는 `references/patterns.md`에서 이번 상호작용에 맞는 패턴을 찾아 카드 2~3개를 읽는다. 맞는 패턴이 없으면 "해당 없음"이라고 적는다.
```
3단계 `**이번에 참고한 자료, 적용할 원칙, 적용하지 않는 이유**를 짧게 적는다.` 뒤에 이어 붙인다:
```
 외부 레퍼런스를 참고했으면 **참고 레퍼런스**(카드 id · 가져올 것 · 안 가져올 것 · 레이어 계약에 반영할 파라미터)도 적는다.
```
5단계 문장 끝에 이어 붙인다:
```
 실제로 참고한 레퍼런스 카드의 "쓰인 작품"에 작품을 적는다.
```

- [ ] **Step 2: `AGENTS.md`에 새 절 추가** — "에셋 프롬프트 기록 — 필수" 절 뒤에:

```markdown
## 외부 레퍼런스 — 참고만

사용자 요구(2026-09-30): 노션에 모은 외부 사이트를 인터랙티브를 만들 때 참고한다. 설계는 [`docs/13`](docs/13-인터랙티브-레퍼런스-보관소-설계.md)에 있다.

- 정본은 [`references/`](references/README.md)다. 노션 Instagram 리서치 DB는 수집함이고, 가져오는 절차는 `references/README.md`에 있다.
- 레퍼런스의 문구·이미지·브랜드·코드는 그대로 옮기지 않는다. 상호작용 방식을 우리 레이어와 데이터로 다시 설계한다.
- ⏸ 미확인 카드는 근거로 단정하지 않는다. ⚠️ 카드나 확인한 지 90일이 넘은 카드는 쓰기 직전에 사이트가 살아 있는지 다시 본다.
- 유료 프롬프트·계정이 필요한 자료의 본문은 저장소에 옮기지 않는다.
- 카드를 고치면 `pnpm references:build`로 `gallery.html`·`catalog.json`을 다시 만든다(루트 `pnpm check`가 검사). claude.ai 페이지는 `node references/build.mjs --site <임시폴더>`로 만든 `index.html`과 `media/`를 `references/README.md`의 주소로 다시 게시한다. 새 주소를 만들지 않는다.
```

- [ ] **Step 3: `docs/00-README.md` 문서 표** — `12-Scene-Studio…` 행 뒤와 `../prompts/` 행 뒤에 각각 추가:

```markdown
| [13-인터랙티브-레퍼런스-보관소-설계.md](13-인터랙티브-레퍼런스-보관소-설계.md) | 노션에 모은 외부 사이트를 직접 확인한 카드·패턴 색인으로 정리하고, 에이전트가 계획 단계에서 참고하는 규칙 | 개발 에이전트·개발자 |
```
```markdown
| [../references/](../references/README.md) | **인터랙티브 레퍼런스**: 외부 사이트 카드(캡처·상호작용·가져올 것/안 가져올 것)와 패턴 색인. 웹 보관함 [`gallery.html`](../references/gallery.html)에서 필터·요약 복사 | 개발 에이전트·제작 전원 |
```

- [ ] **Step 4: `docs/10` 원칙 표와 확인한 것** — "기존 자료에서 가져올 원칙" 표 마지막 행 뒤에 추가:

```markdown
| [13 레퍼런스 보관소](13-인터랙티브-레퍼런스-보관소-설계.md), [references/](../references/README.md) | 만들려는 상호작용을 패턴 색인에서 찾아 카드 2~3개를 읽고, 가져올 것·안 가져올 것·레이어 파라미터를 플랜에 적는다 | 외부 사이트를 참고할 때. 맞는 패턴이 없으면 "해당 없음". 그대로 복제하지 않기 |
```
문서 끝에 `## 레퍼런스 보관소에서 확인한 것 (2026-09-30)` 절을 만들고, Task 4·5에서 **직접 확인한 사실**만 3~6줄로 적는다. 예: 키보드 대체가 없던 사이트와 그 영향, 동작 줄이기에 반응한 사이트, 캡처·녹화 용량을 맞춘 설정, 공용 해석기 추출 때 생성물 불변을 확인한 방법. 확인하지 못한 것은 "미확인"으로 구분한다.

- [ ] **Step 5: 모의 점검** — 가상의 의뢰 "사진 작가 포트폴리오"로 바뀐 AGENTS.md 2·3단계를 그대로 따른다. `references/patterns.md`에서 맞는 패턴을 고르고, `catalog.json`의 `summary`로 플랜의 **참고 레퍼런스** 항목 초안을 이 플랜 "검토 기록"에 붙인다. 예상: `expand-gallery`(julesesick), `moodboard-canvas`(annamills). 다른 패턴이 골라지면 이유를 적는다.

- [ ] **Step 6: 명세 상태 줄** — `docs/13` 첫 문단 끝에 `구현: 2026-MM-DD, 검토 기록은 [플랜](../.claude/plans/reference-library-2026-09-30.md).`을 넣는다.

- [ ] **Step 7: 최종 검사**

```bash
node prompts/build.mjs --check
node references/build.mjs --check
node --test tools/md-blocks.test.mjs references/build.test.mjs
pnpm check
git status --short
```
Expected: 모두 통과. 바뀐 파일이 이 플랜의 Files 목록과 일치(관계없는 `projects/jooho-lab/reference-preview.jpg`는 이 작업 전부터 있던 미추적 파일이라 건드리지 않는다).

---

## 검토 기록

실행: 서브에이전트 주도 개발, main 트리에서 커밋 없이 진행(git tree 스냅샷으로 Task별 diff 리뷰). 마지막 갱신 2026-09-30.

### Task별 요약
- **Task 1 공용 해석기**: `tools/md-blocks.mjs` 추출, 테스트 4개. `prompts/build.mjs --check` 최신, 추출 전후 사이트 출력 동일. 수정 라운드 0.
- **Task 2 모델·검사**: `references/model.mjs`, 테스트 8개. 리뷰가 패밀리 정규식 결함을 찾았다(`3D`→D, `B2B`→B, 굽은 따옴표 `A’`). 판정: lookbehind에 숫자 추가·`A’`→`A'` 정규화·테스트 1개 추가(수정 1회, 이후 합계 14개). 그러나 이때 굽은 따옴표 수정은 코드에 실제로 들어가지 않았다(FAMILY가 ASCII 따옴표 두 개로 저장됨). 최종 리뷰가 발견해 U+2019를 정규식에 실제로 넣어 고쳤고(`model.mjs`에서 U+2019 3개 확인), 테스트는 `\u2019` 이스케이프로 써서 인코딩에 흔들리지 않게 했다.
- **Task 3 렌더러·빌드**: `gallery.mjs`, `build.mjs`, 첫 카드(미확인). 리뷰 통과. `prompts/build.mjs`와 색 토큰·CSS 중복은 유지로 판정(해석기만 공용화, 페이지 둘뿐). 게시 전 고칠 3개(복사 버튼 문구 고정, 잘못된 해시, `--site` 인자 검사)를 Task 5로 넘김.
- **Task 4 사이트 7곳 직접 확인(Aside)**: 카드 7장 모두 ✅ 2026-09-30, ⏸ 0개, media 합계 1,009,006 B(사이트당 2장, 최대 203,394 B). 패턴 확정 7개: desktop-os, drive-to-explore, moodboard-canvas, hand-drawn, illustration-hero, expand-gallery, video-tile-catalog. 플랜이 바뀐 점: `motion-bg-hero`를 `video-tile-catalog`(패밀리 D)로 교체. motionsites는 배경 히어로가 아니라 루프 영상 타일 카탈로그였다. annamills의 무드보드는 작업 전시가 아니라 스티커로 포스터를 만드는 참여형이라 패턴 설명을 바로잡았다(이름도 Anna Mills로 수정). 리뷰 Critical/Important 없음, 게시될 문구 3건은 Task 5에서 수정.
- **Task 5 브라우저 검수·게시**: 8항목 + 연속 클릭·잘못된 해시 통과(1440px Aside 실측, 390px는 같은 오리진 390px iframe, 클립보드 차단은 `writeText` 거부로 흉내). 검수 중 발견해 게시 전에 고친 것: 두 번째 캡처가 어디에도 안 보이던 결함(파서 첫 이미지만, 렌더러 이미지 문단 제외 → `images` 배열, 검사·렌더 확장, 테스트 1개 추가), `<title>` "인터랙티브 레퍼런스 보관함", `.bar` 안전 영역 top, 필터 되돌린 뒤 검색창 포커스. 테스트 합계 15개. 게시: https://claude.ai/artifact/4rBUtpL9VFToYxdkmjXoH1 (비공개, v2). 게시본 안 이미지 14개(사이트당 2장).
- **Task 6 연결·점검**: AGENTS.md 2·3·5단계 문장과 "외부 레퍼런스 — 참고만" 절, docs/00 표 2행, docs/10 표 1행과 확인한 것 절, docs/13 상태 줄과 확정 목록 한 줄 추가.

### 게시본 Aside 확인
Aside로 https://claude.ai/artifact/4rBUtpL9VFToYxdkmjXoH1 을 열었으나 로그인하지 않은 상태라 "로그인 – Claude" 화면이 나왔고 페이지 본문·카드·이미지·콘솔은 확인하지 못했다. **사용자 확인 필요**: 로그인한 브라우저에서 카드 7장·이미지 14장이 뜨는지, 탭 전환, 복사 버튼. 클릭·복사 등 상태를 바꾸는 조작은 하지 않았고 탭은 닫았다.

### 모의 점검 (의뢰 "사진 작가 포트폴리오", AGENTS.md 2·3단계 그대로)
- 패턴 선택: `references/patterns.md`의 "맞는 의뢰"에서 사진 작업에 맞는 것은 `expand-gallery`(사진·공간·제품 작업)와 `moodboard-canvas`(이미지 중심 작업). `illustration-hero`·`hand-drawn`은 일러스트 작가용, `desktop-os`·`drive-to-explore`는 콘셉트 우선이라 제외. 카드가 확인된 지금도 예상과 같다. 단 `moodboard-canvas`는 카드 확인 결과 작업 전시용이 아니라 참여형 포스터 놀이라서 사진 작가에게는 "보조로만, 목록형 대체 필수"라고 적는다.
- `catalog.json`의 `summary`에서 만든 **참고 레퍼런스** 초안:
  - `julesesick` (expand-gallery, ✅ 2026-09-30) — 가져올 것: 사진을 누르면 그 자리에서 여러 장으로 갈라지는 펼침, 호버 때만 나오는 크게 보기 버튼, 라이트박스 ←·→·Escape와 닫은 뒤 포커스 복귀, 클릭한 사진 색으로 흐린 배경. 안 가져올 것: 갈라진 사진을 되돌릴 방법이 없는 것, 주소가 안 바뀌어 뒤로 가기가 이탈이 되는 구조, 같은 이름의 버튼 둘, alt 없는 사진, 터치에서 닿지 않는 호버 전용 버튼. 레이어 파라미터: 썸네일 격자(마스크 모양·간격), 갈라지기(장수·최대 깊이·접기 버튼), 호버 버튼, 라이트박스(배경 흐림·버튼 위치·키), 펼침 크기·전환 길이·곡선·캡션 위치.
  - `annamills` (moodboard-canvas, ✅ 2026-09-30) — 가져올 것: 흩어 놓은 조각을 끌어 빈 판에 올리는 조작과 한 줄 안내, 글자만으로 세운 간결한 메뉴, 스크롤에 따라 변하는 로고 글자. 안 가져올 것: 키보드·스크린리더로 닿지 않고 alt 없는 구조, 초기화·저장 없는 끌기, 끌 수 없는 사람을 위한 목록형 대체 경로가 없는 것. 레이어 파라미터: 캔버스 배경(판 크기·색), 조각 풀(위치·회전·크기), 끌기 동작(드롭 범위·겹침 순서), 안내 문구, 흩어짐 정도·카드 크기·끌기 관성.
- 적용하지 않는 패턴: 나머지 5개(이유는 위). 모의 점검에서 불편했던 점: 카드 본문 `tech` 항목이 쉼표·마침표로 잘려 문장 조각으로 나온다(`catalog.json`의 julesesick `tech` 3개 중 두 개가 문장 중간에서 끊김). 플랜 초안에는 영향이 없어 이번엔 고치지 않고 기록만 한다. → 최종 리뷰 수정에서 해결: `tech`는 나누지 않고 한 요소로 내며, 백틱 속 태그(`<canvas>` 등)도 남긴다.

### 최종 검사 (2026-09-30)
- `node prompts/build.mjs --check` 통과(생성물 최신, 바이트 불변). `node references/build.mjs --check` 통과. `node --test tools/md-blocks.test.mjs references/build.test.mjs` 15/15(최종 리뷰 수정 후 18/18).
- 루트 `pnpm check` 실패(종료 코드 1). 원인: `projects/dawn-store/app`과 `projects/day-walk/app`에 `node_modules`가 없어 `tsx`를 못 찾음(`'tsx'은(는) 내부 또는 외부 명령...`). 이 작업·jooho-lab 변경과 무관한 설치 상태 문제다. 앞쪽 단계(prompts·references·테스트 15개), `packages/layer-kit` check, potato-designer check(`layer-kit lint` 20 layers·619 parameters 통과)는 통과했고 `projects/jooho-lab`을 따로 돌린 `pnpm run check`(validate.mjs)도 PASS. dawn-store·day-walk는 `pnpm install` 후 다시 확인해야 한다.

### 미확인 범위
- 녹화(짧은 영상)는 만들지 않았다 — Aside에 녹화 API가 없어 선택으로 판정. 캡처 2장으로 대체했다.
- 390px 실측(Aside 창 크기 고정 불가), 동작 줄이기 실제 전환(CSS·스크립트 조사로 추정), claude.ai iframe 안의 클립보드 권한, 게시본의 로그인 후 화면, 터치 입력. 7개 카드의 사이트별 미확인 조작은 각 카드의 "확인 한계"에 있다.
- 공개된 `gallery.html`·게시본의 색 토큰·CSS가 `prompts/build.mjs`와 중복(유지 판정). 리뷰에서 미뤄 둔 Minor들은 `.superpowers/sdd/reference-library-2026-09-30/progress.md`에 있다.
