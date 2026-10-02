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

프롬프트와 확인 절차는 [`prompts/hanbok-hero.md`](../../prompts/hanbok-hero.md). 실제 그림은 fal.ai(flux-pro ultra 회화풍 정면 컷 → birefnet 배경 제거 → Kling 영상 → 프레임 9장 → 3×3 시트, 배경은 경회루 야경)로 만들었고 재현 스크립트는 [`scripts/assets/`](scripts/assets/README.md)에 있다. 글꼴은 Google Fonts(Noto Serif KR·Song Myung·Nanum Myeongjo)를 `index.html`에서 불러오며 매니페스트 `global.font`·`title.font`로 고른다. `assets:placeholder`는 PNG 자리표시를 만들 뿐이며 매니페스트 기본값은 webp를 가리키므로, 자리표시로 돌리려면 관리자에서 이미지를 바꾼다.
