# 한복 히어로(선비) — 시·서·화를 고르는 선비의 첫 화면

가상의 선비 **소운(小雲) 윤하담**의 첫 화면입니다. 시(詩)·서(書)·화(畫) 분야를 고르면 배경 그림·큰 한자·부제·강조색이 바뀌고(Potato의 분야 전환과 같은 역할), 갓 쓴 선비는 포인터 쪽으로 고개를 돌립니다. 몸은 한 장으로 고정하고 얼굴 칸(13×2)만 바꾸므로 칸이 바뀌어도 몸·갓이 튀지 않고, 두 얼굴이 겹치는 순간(잔상)이 없습니다. 레퍼런스 `references/instagram-reposts.md#lovart-interactive-assets`(패턴 `pointer-reactive`)의 "정지 그림을 방향 프레임으로" 방식을 우리 레이어로 다시 설계했습니다. 설계: `.claude/plans/2026-10-02-hanbok-hero.md`, 분야 전환 `.claude/plans/2026-10-05-hanbok-moods.md`(계획 `-plan.md`).

```powershell
pnpm --filter hanbok-hero dev      # http://localhost:4178 · 관리자 /admin
pnpm --filter hanbok-hero check    # node 테스트 · 엔트리 검사 · layer-kit lint · 생성물 최신성
```

## 동작

| 입력 | 바뀌는 상태 | 보이는 피드백 | 되돌리기 |
|---|---|---|---|
| 포인터 이동 | 시선 기준점에서 포인터까지를 연속 칸 좌표로(가로 13칸 = 고개 방향, 세로 2행 = 얼굴보다 위·아래) | 목표 칸까지 `follow` 시간 상수로 다가가며 **사이 칸을 하나씩** 지나 얼굴 칸만 즉시 교체(경계 히스테리시스 0.15칸) | 포인터가 멈춰도 계속 바라봄. 창을 떠나거나 창이 포커스를 잃으면 `returnDelay` 뒤 정면 |
| 터치 탭 | 탭 방향을 한 번 봄 | 같은 전환 | `returnDelay` 뒤 정면 |
| 분야 버튼(시·서·화) 클릭·탭 | 장면 `si`·`seo`·`hwa`, 브라우저에 `hanbok-hero:mood:v1` 저장 | 이전 배경 위로 새 배경이 `moodFade`(600ms) 동안 겹쳐 바뀌고 큰 한자·부제가 서서히 나타남, 고른 버튼에 강조색 테두리(`aria-pressed`) | 다른 분야 버튼 |
| 키보드 | Tab으로 분야 버튼, Enter·Space로 고름(메뉴는 숨김) | 시선은 정면 고정, 분야 전환은 클릭과 같음 | 다른 분야 |
| 다시 방문 | 저장된 분야로 시작 — 장면 id가 아니거나 저장소가 막히면 시 | — | — |
| 동작 줄이기 | 몸·얼굴 칸 숨김, 반응 중단, 분야 전환 시간 0 | 정면 그림 고정, 분야는 즉시 바뀜 | OS 설정 해제 |

몸 그림이나 얼굴 시트가 없거나 실패하면 정면 그림(`still`)만 보입니다. 쉬는 칸(아래 행 가운데) + 몸 그림은 정면 그림과 픽셀이 같아서(`restMatchesStill` 평균 차이 0.4/255) 반응이 켜지는 순간이 보이지 않습니다. 영상 원본의 한계로 고개를 돌려도 눈은 대체로 관람자를 봅니다.

분야 배경을 불러오지 못하면 이전 배경을 덮개로 남기고 글자·색만 바뀝니다. 덮개는 이전 그림이 실제로 그려진 적이 있을 때만 씁니다(저장된 분야로 다시 방문할 때 아직 받지 못한 첫 장면 그림이 먼저 보이지 않게). 다른 두 분야 배경은 첫 화면을 그린 뒤 미리 불러 둡니다. 저장소가 막혀도 분야는 바뀌고 이번 방문 동안만 기억합니다. 메뉴(About·Work·Contact)와 "작품 보기"는 다음 단계(시트)까지 게시값(`layers.values.json` base `visible: false`)으로 숨겼습니다.

## 레이어

`dist/layers.manifest.js`가 정본입니다(10레이어 / 109파라미터). `global` 전역 색·글꼴·분야 강조색(`accent`)·전환 시간(`moodFade`) · `paper` 배경(분야별 `image`) · `glyph` 큰 한자 · `character` 반응 캐릭터(still 정면 그림, body 얼굴 자리를 비운 몸 그림, sheet 얼굴 시트, cols·rows, headX·headY·headW·headH 얼굴 칸 창, x·y·size, anchorY, range, follow, returnDelay, react) · `title` 이름·소개 · `moods` 분야 버튼(한글·한자 3쌍, 한자 비율 `hanjaScale`, 받침 `plate`, 방향) · `nav` 메뉴 · `cta` 버튼 · `hint` 안내 · `credit` 제작 표시. 장면은 `si`·`seo`·`hwa`(분야 = 장면)이고 장면 `set`이 배경·큰 한자·부제·강조색을 바꿉니다. 구간은 wide·tablet·mobile이고 값은 `dist/layers.values.json`(관리자에서 게시)에 쌓입니다. JS가 읽는 수치(`range`·`anchorY`·`follow`·`returnDelay`)는 `.gaze-range` 요소의 계산된 스타일(크기·top·transition-duration·transition-delay)에서 읽어 CSS 변수가 유일한 정본입니다. 얼굴 칸 창(`head*`)은 시트를 만든 영역(`scripts/assets/build-heads.py`의 `RECT`)과 같아야 합니다.

## 관리자

`/admin`은 매니페스트만 읽는 작은 Scene Studio입니다(장면·화면·적용 범위 선택, 레이어별 파라미터, 초안 저장·게시·버전 복구·내보내기·불러오기). 서버는 Potato Designer의 `studio-server.mjs`를 그대로 복사했습니다. `ADMIN_PASSWORD`를 두면 로그인 화면이 나옵니다. 분야별 값(부제·강조색·큰 한자·배경)은 적용 범위 **"이 장면"**으로 바꿉니다 — 장면 `set`이 공통 값보다 우선이라 "공통"으로 바꾸면 화면이 그대로입니다.

## 검수

`dist/qa/browser-checks.js`를 페이지 안에서 실행합니다. 절차와 결과는 [QA.md](QA.md).

## 에셋

프롬프트와 확인 절차는 [`prompts/hanbok-hero.md`](../../prompts/hanbok-hero.md). 정면 컷은 fal Kontext(사용자 참조 2장), 고개 돌리는 영상은 fal Kling이고, 화면에 쓰는 세 장(`scholar-still`·`scholar-body`·`scholar-heads`)은 그 영상 프레임에서 로컬로 만들었습니다(새 생성 없음) — [`scripts/assets/build-heads.py`](scripts/assets/build-heads.py): 프레임 배경 제거(rembg) → 깃·가슴으로 몸 흔들림 정렬 → 목 아래 띠에서 광학 흐름으로 깃을 맞추며 기준 몸과 섞기 → 머리 영역만 잘라 13×2 시트. 이전의 정면 컷·3×3 시트는 [`art/superseded/`](art/superseded/)에 이력으로 남겼습니다. 배경은 분야마다 Codex `image_gen`으로 만든 회화풍 그림 한 장씩(`mood-si` 향원정 달밤 · `mood-seo` 사랑채 등불 · `mood-hwa` 비 갠 인왕산 새벽, 카드 05~07)이고, 이전 경회루 야경은 `art/superseded/palace.webp`로 옮겼습니다. 글꼴은 Google Fonts(Noto Serif KR·Song Myung·Nanum Myeongjo)를 `index.html`에서 불러오며 매니페스트 `global.font`·`title.font`로 고릅니다.
