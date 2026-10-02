# 한복 캐릭터 시선 히어로 — 설계 스펙 (2026-10-02)

포트폴리오 첫 화면. 한복 입은 여성 캐릭터 그림이 포인터 쪽으로 고개·시선을 돌린다. 레퍼런스 `lovart-interactive-assets`(패턴 `pointer-reactive`)를 우리 레이어와 에셋으로 다시 설계한다.

## 1. 참고한 자료와 적용 원칙

| 자료 | 적용 | 적용하지 않는 것·이유 |
|---|---|---|
| `references/instagram-reposts.md` lovart-interactive-assets, `references/patterns.md` pointer-reactive | 정지 그림을 방향별 프레임으로 늘려 포인터 위치로 바꾼다. 배경 제거는 에셋 단계에서 끝낸다. 터치·키보드·동작 줄이기에서 정지 프레임이 기본 | 사무라이 외형, 생성 도구가 만든 HTML, 포인터가 없으면 아무 일도 없는 화면 |
| `docs/10` Potato 구현 지식 | 이미지/포인터/등장 레이어 분리, 상태는 데이터로, 정지 의도와 OS 동작 줄이기 구분 | 검색·관심·메모 기능 — 첫 화면 범위 밖 |
| `docs/11`, `AGENTS.md` 레이어 계약 | 매니페스트·값 파일·lint·probe, Scene Studio 복사 | — |
| `prompts/templates.md` §2 캐릭터 단독 투명 배경, §6 스프라이트 시트, 초록 배경 대안 | 정면 기준 컷 → 시트 순서, 알파 확인 | §7 3D 변환 — 2D 그림으로 충분 |
| `projects/potato-designer` 구조 | dist/scripts/admin 구조와 build-layers·layer-check·studio-server 복사 | work-data·모달·검색 — 범위 밖 |

**참고 레퍼런스** — 카드 `lovart-interactive-assets` · 가져올 것: 방향 프레임 교체, 에셋 단계 배경 제거 · 안 가져올 것: 외형, 검토 없는 HTML, 포인터 전용 화면 · 레이어 파라미터: 방향 프레임 수, 반응 범위, 따라가는 지연, 되돌아오는 시간, 반응 세기(터치·동작 줄이기에서 0). 카드 "쓰인 작품"에 `hanbok-hero`를 적는다.

## 2. 범위

- 들어감: 첫 화면 1장면(배경, 반응 캐릭터, 이름·소개, 메뉴 글자, 안내), 화면 크기 3단, Scene Studio 로컬 관리자, lint·probe·브라우저 검수, 에셋 프롬프트 카드.
- 안 들어감: 작품 목록·상세·모달, 배포 설정, 트레일·360° 회전 효과.

## 3. 프로젝트 구조 — `projects/hanbok-hero`

```
dist/   index.html  style.css  app.js  gaze.js  layers.manifest.js  layers.values.json  assets/  (빌드 산출: layers.css layers.values.js vendor/)
scripts/ build-layers.mjs  check.mjs  layer-check.mjs  serve.mjs  studio-server.mjs  make-placeholders.mjs  gaze.test.mjs
admin/  index.html  studio.css  studio.js  bridge.js   (studio-server는 Potato 복사, 관리자 화면은 매니페스트만 읽는 작은 패널을 새로 씀 — Potato 관리자는 페이지·모달 개념이 깊어 복사 비용이 더 큼)
qa/     browser-checks.js  (페이지 안에서 실행하는 검수 함수 — Playwright MCP·Aside 어느 브라우저에서나 같은 검사)
README.md  QA.md  package.json (dev · build · check · layers:build · layers:lint)
```

포트 4178. 루트 `pnpm check`가 `pnpm -r check`로 이 앱 검사를 포함한다.

## 4. 레이어 계약

장면 `hero` 1개. 구간: `wide (min-width:1600px)` · `tablet (max-width:1000px)` · `mobile (max-width:650px)`. 미리보기 화면 1440·1920·768·390.

| 레이어 id | 요소 | 파라미터 (타입) |
|---|---|---|
| `global` | `:root` | muted 색, fontScale(글꼴 크기 배율), font(글꼴 선택: 시스템 · Noto Sans KR) |
| `paper` | `.paper` | color(색), image(이미지, 기본은 투명 1px `blank.png`라 색만 보임), vignette(0~1), vignetteInner(비네트 시작 위치 %). id는 layer-kit이 `paper.color`를 theme-color에 쓰므로 `paper`로 둔다 |
| `character` | `.character` | still(이미지, 정면 1장), sheet(이미지), cols(3), rows(3), x·y(%), size(vw), anchorY(%, 시선 기준점 높이), range(px, 반응 범위 — 태블릿 300 · 모바일 200), follow(ms, 따라가는 지연), fade(ms, 크로스페이드), returnDelay(ms, 되돌아오는 시간), react(boolean, 끄면 시트를 숨겨 정면 고정) |
| `title` | `.title` | name(text), tagline(text), color, size(rem), weight, lineHeight, letterSpacing(em), taglineScale(소개 글자 비율), taglineGap(em), x·y |
| `nav` | `.nav` | item1·item2·item3(text), color, size, gap(em), x·y |
| `hint` | `.hint` | pointerText(text), touchText(text), color, size, x·y, hideAfter(ms), fade(ms, 사라지는 시간) |

모든 레이어에 보이기·불투명도. 구간별(`at`)로 `character` size·x·y·range, `title` size·y를 다르게 둔다.
스펙 변경(2026-10-02 플랜 작성 중): `strength(0~1)`는 `react(boolean)`로 바꾼다. 프레임이 이산적이라 0~1 세기는 의미가 없고, 끄면 시트 레이어를 숨겨 정면 그림만 남기는 편이 정직하다. `backdrop`은 `paper`로 이름을 바꾼다.
고정값(`layer-fixed`): 시트 칸 배치 계산식(cols·rows에서 유도), 크로스페이드용 두 겹 프레임 구조, 보이기 끔 속성(`data-layer-hidden`), 포커스 링 색, 입력 방식(hover)·동작 줄이기 미디어 규칙, 전환 이징(ease), 히스테리시스 문턱(`gaze.js`), 문서 메타(title·description)와 alt(build-layers가 src만 다시 쓴다).
스펙 변경(2026-10-02 최종 리뷰): 시각 리터럴을 파라미터로 열었다(title 5개, nav.gap, hint.fade, paper.vignetteInner, global.font). 화면 영향이 없던 `global.ink`는 지웠다. `range`에 화면별 값을 두었다. 관리자 적용 범위 기본값은 `공통`이다.

## 5. 동작

| 입력 | 바뀌는 상태 | 보이는 피드백 | 되돌리기 |
|---|---|---|---|
| 포인터 이동 | 캐릭터 중심 기준 방향 → 9구역 중 하나(히스테리시스(0.38 진입 / 0.28 복귀)) | 해당 칸으로 크로스페이드 | 포인터가 떠나거나 멈춘 뒤 `returnDelay` 지나면 정면 |
| 터치 탭(포인터 없는 기기) | 탭 위치 방향을 한 번 봄 | 같은 크로스페이드 | `returnDelay` 뒤 정면 |
| 키보드 | 아무 변화 없음(메뉴 Tab 이동만) | 정면 고정 | — |
| 동작 줄이기 | 시트 프레임 숨김(CSS 미디어 규칙), JS도 반응 중단 | 정면 고정, 안내 문구 숨김 | OS 설정 해제 시 복귀 |

- 구역 계산: 시선 기준점(`.gaze-range` 중심, `anchorY`)에서 포인터까지의 dx·dy를 `range`로 나눠 -1~1로 자른다. 축마다 ±0.38을 넘으면 옆 칸에 들어가고 ±0.28 아래로 내려와야 정면으로 돌아온다(히스테리시스). 범위 밖은 자동으로 ±1이라 가장 바깥 칸이다.
- `follow`는 구역이 바뀐 뒤 크로스페이드가 시작되기까지의 지연(CSS transition-delay)이고, `fade`는 크로스페이드 길이(transition-duration)다. 들어오는 프레임만 불투명한 나가는 프레임 위에서 페이드인하고, 나가는 프레임은 페이드가 끝난 뒤 내린다. 시트가 반응 중이면 정면 그림(`still`)을 숨긴다(두 프레임이 대칭으로 교차하면 중간에 정면 그림이 비쳐 외곽선이 두 겹이 된다). 값이 바뀌면 프레임을 뒤집지 않고 앞 프레임을 제자리에서 다시 그린다.
- JS가 읽는 수치(`returnDelay`, `range`, `anchorY`)는 `.gaze-range` 요소의 계산된 스타일(transition-delay, 크기, top)에서 읽는다. 값의 정본이 CSS 변수 하나가 되고 probe가 같은 경로를 검사한다.
- 로딩: `still`을 먼저 그리고 `sheet`가 받아지면 교체한다. 시트 실패 시 `still`만 유지하고 콘솔 경고. 시트 `src`가 바뀌면(관리자) 다시 받아 회복한다.
- 안내 문구는 첫 반응 또는 `hideAfter` 뒤에 사라진다. 포인터 기기와 터치 기기 문구를 나눈다.

## 6. 에셋

1. 정면 기준 컷: 한복 입은 젊은 여성, 상반신~무릎, 정면, 투명 PNG 정사각, `templates.md` §2 틀. 글자·UI·바닥 없음.
2. 3×3 시트: 기준 컷을 참조로, 칸마다 고개·시선 방향만(좌상·상·우상 / 좌·정면·우 / 좌하·하·우하) 다르고 몸·크기·위치 동일. §6 틀.
3. 알파 채널 확인. 가짜 체커보드면 초록 배경 요청 후 색 행렬 `1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  6 -6 6 0 0`로 제거. 한복 색에 초록 계열은 피한다.
4. 9칸 일관성이 안 나오면 5방향(정면·좌·우·상·하)으로 줄인다. 줄인 이유를 카드에 적는다.
5. 기록: `prompts/hanbok-hero.md`(카드 양식), `prompts/README.md` 표 한 줄, `pnpm prompts:build`.

생성은 사용자가 ChatGPT 이미지 도구로 한다. 에이전트는 프롬프트와 확인 절차를 쓰고, 결과를 `dist/assets/`에 받아 검사한다.

## 7. 검수와 완료 조건

- `layer-kit lint` 오류 0, `probe` 전 파라미터 통과.
- 브라우저(Aside): 포인터 이동 → 칸 변경 → 떠남 → 정면 복귀, 구역 경계에서 떨림 없음, 390px 배치, Tab으로 메뉴 이동, 동작 줄이기에서 정면 고정, 시트 로딩 실패 시 정면 유지.
- 기록: `projects/hanbok-hero/QA.md`(검수한 것·안 한 것), `docs/10`에 새로 확인한 사실, 레퍼런스 카드 "쓰인 작품", `references:build`.

## 8. 가정

- 캐릭터 외형·한복 색은 사용자가 결과를 보고 고른다. 첫 프롬프트는 흰 저고리·붉은 치마로 시작한다.
- 이름·소개·메뉴 문구는 임시값(JOOHO LAB 프로필에서 가져옴)이고 관리자에서 바꾼다.
