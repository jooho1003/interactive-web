# 한복 히어로 — 얼굴이 따라오는 포트폴리오 첫 화면

갓 쓴 조선 선비 그림이 포인터 쪽으로 고개를 돌립니다. 몸은 한 장으로 고정하고 얼굴 칸(13×2)만 바꾸므로 칸이 바뀌어도 몸·갓이 튀지 않고, 두 얼굴이 겹치는 순간(잔상)이 없습니다. 레퍼런스 `references/instagram-reposts.md#lovart-interactive-assets`(패턴 `pointer-reactive`)의 "정지 그림을 방향 프레임으로" 방식을 우리 레이어로 다시 설계했습니다. 설계: `.claude/plans/2026-10-02-hanbok-hero.md`.

```powershell
pnpm --filter hanbok-hero dev      # http://localhost:4178 · 관리자 /admin
pnpm --filter hanbok-hero check    # node 테스트 · 엔트리 검사 · layer-kit lint · 생성물 최신성
```

## 동작

| 입력 | 바뀌는 상태 | 보이는 피드백 | 되돌리기 |
|---|---|---|---|
| 포인터 이동 | 시선 기준점에서 포인터까지를 연속 칸 좌표로(가로 13칸 = 고개 방향, 세로 2행 = 얼굴보다 위·아래) | 목표 칸까지 `follow` 시간 상수로 다가가며 **사이 칸을 하나씩** 지나 얼굴 칸만 즉시 교체(경계 히스테리시스 0.15칸) | 포인터가 멈춰도 계속 바라봄. 창을 떠나거나 창이 포커스를 잃으면 `returnDelay` 뒤 정면 |
| 터치 탭 | 탭 방향을 한 번 봄 | 같은 전환 | `returnDelay` 뒤 정면 |
| 키보드 | 메뉴 Tab 이동만 | 정면 고정 | — |
| 동작 줄이기 | 몸·얼굴 칸 숨김, 반응 중단 | 정면 그림 고정 | OS 설정 해제 |

몸 그림이나 얼굴 시트가 없거나 실패하면 정면 그림(`still`)만 보입니다. 쉬는 칸(아래 행 가운데) + 몸 그림은 정면 그림과 픽셀이 같아서(`restMatchesStill` 평균 차이 0.4/255) 반응이 켜지는 순간이 보이지 않습니다. 영상 원본의 한계로 고개를 돌려도 눈은 대체로 관람자를 봅니다.

## 레이어

`dist/layers.manifest.js`가 정본입니다. `global` 전역 색·글꼴 · `paper` 배경 · `character` 반응 캐릭터(still 정면 그림, body 얼굴 자리를 비운 몸 그림, sheet 얼굴 시트, cols·rows, headX·headY·headW·headH 얼굴 칸 창, x·y·size, anchorY, range, follow, returnDelay, react) · `title` 이름·소개 · `nav` 메뉴 · `cta` 버튼 · `hint` 안내. 구간은 wide·tablet·mobile이고 값은 `dist/layers.values.json`(관리자에서 게시)에 쌓입니다. JS가 읽는 수치(`range`·`anchorY`·`follow`·`returnDelay`)는 `.gaze-range` 요소의 계산된 스타일(크기·top·transition-duration·transition-delay)에서 읽어 CSS 변수가 유일한 정본입니다. 얼굴 칸 창(`head*`)은 시트를 만든 영역(`scripts/assets/build-heads.py`의 `RECT`)과 같아야 합니다.

## 관리자

`/admin`은 매니페스트만 읽는 작은 Scene Studio입니다(장면·화면·적용 범위 선택, 레이어별 파라미터, 초안 저장·게시·버전 복구·내보내기·불러오기). 서버는 Potato Designer의 `studio-server.mjs`를 그대로 복사했습니다. `ADMIN_PASSWORD`를 두면 로그인 화면이 나옵니다.

## 검수

`dist/qa/browser-checks.js`를 페이지 안에서 실행합니다. 절차와 결과는 [QA.md](QA.md).

## 에셋

프롬프트와 확인 절차는 [`prompts/hanbok-hero.md`](../../prompts/hanbok-hero.md). 정면 컷은 fal Kontext(사용자 참조 2장), 고개 돌리는 영상은 fal Kling이고, 화면에 쓰는 세 장(`scholar-still`·`scholar-body`·`scholar-heads`)은 그 영상 프레임에서 로컬로 만들었습니다(새 생성 없음) — [`scripts/assets/build-heads.py`](scripts/assets/build-heads.py): 프레임 배경 제거(rembg) → 깃·가슴으로 몸 흔들림 정렬 → 목 아래 띠에서 광학 흐름으로 깃을 맞추며 기준 몸과 섞기 → 머리 영역만 잘라 13×2 시트. 이전의 정면 컷·3×3 시트는 [`art/superseded/`](art/superseded/)에 이력으로 남겼습니다. 배경은 경회루 야경(`palace.webp`). 글꼴은 Google Fonts(Noto Serif KR·Song Myung·Nanum Myeongjo)를 `index.html`에서 불러오며 매니페스트 `global.font`·`title.font`로 고릅니다.
