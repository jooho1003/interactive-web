# 상세페이지 포트폴리오 · 전시관 11번 · 작업 동네 새 집 (2026-10-07)

사용자 요청: "shortform-automation 레포에서 상세페이지 만든 것도 별도의 포트폴리오 페이지를 만들어 주르륵 볼 수 있게 하고, 전시관에서 그 포트폴리오 페이지를 연결해줘."

사용자 결정(2026-10-07): 보기 방식 = 긴 미리보기 카드(전체 길이 캡처를 가로로 늘어놓고 누르면 실제 페이지를 크게) · 작업 동네에도 새 집을 그린다 · 상세페이지 2개(LUMEN DEW 세럼 리디자인, 온기 머그 샘플) 모두.

## 범위

1. `projects/detail-pages/` — 정적 포트폴리오 앱(바닐라 JS, layer-kit). shortform-automation `상세페이지/<id>/`의 독립 HTML을 동기화 스크립트로 가져와 base64 그림을 WebP 파일로 빼고, 로컬 편집기(`localhost:3123`) 링크를 지운다. 전체 길이 캡처로 카드 미리보기를 만든다.
2. 허브 — `include:experience detail-pages` → `/experiences/detail-pages/`, 등록부 11번, 전시 표지 `work-detail-pages.webp`(캡처 합성, 생성 아님).
3. 작업 동네 — Codex image_gen으로 새 집 패널 `village-detail-pages-v1.png`, 선비 한옥 오른쪽에 접합. 집 레이어 `house-detail-pages` + 그림 레이어 `detail-extension`.
4. 기록 — 앱 README·QA, 허브 README·QA, prompts 카드, references "쓰인 작품", docs/10·docs/11 §9.

## 참고한 자료 · 적용할 원칙

- docs/10: 데이터와 동작 분리(목록 = `pages.js` 콘텐츠, 모양 = 레이어), 모달 닫은 뒤 포커스 복귀, 저장소 실패 처리, 동작 줄이기, layer-kit probe 텍스트 maxLength ≥ 20, 장면 UI는 `setScene` → `subscribe` 한 곳에서 맞춤(한복 히어로).
- docs/11 §9-5 한복 히어로의 매니페스트·빌드·관리자 구조를 복제→확장한다(docs/01 §1 "복제→확장").
- docs/05 패밀리: 해당 패밀리 없음 — 정적 포트폴리오에 3D·영상 엔진을 넣지 않는다(docs/10 첫 표).
- docs/14 2.5D: 해당 없음(캐릭터·물건 비주얼 없음). 마을 집은 기존 파노라마 확장 방식(prompts 카드 22·23)을 따른다.
- 적용하지 않는 것: Scene Studio의 `@iw/layer-kit` 이관. 한복 히어로 README가 "세 번째 앱이 생기면 판단"이라 적었고 이번이 세 번째다. 이번에는 한복 패널을 그대로 복사한다 — 이관은 한복·Potato 두 앱의 검수된 관리자 동작을 함께 바꾸므로 이 요청 범위를 넘는다. 후속 과제로 기록한다.

## 참고 레퍼런스

| 카드 | 가져올 것 | 안 가져올 것 | 레이어 계약 파라미터 |
|---|---|---|---|
| `motionsites` (`video-tile-catalog`) | 결과물을 훑는 타일 벽 → 누르면 큰 미리보기 덮개, 주소(해시)로 열고 Escape·뒤로 가기로 닫기 | 타일 본체가 키보드로 안 열리는 구성, 영상 자동 재생 | `strip` 카드 높이·간격·정렬, `viewer` 배경·막대 색·전환 시간 |
| `julesesick` (`expand-gallery`) | 라이트박스의 ←·→·Escape, 닫은 뒤 포커스를 연 카드로 복귀, 원본 비율 유지 | 되돌릴 수 없는 상태, 같은 이름 버튼 둘, alt 없는 그림, 주소가 안 바뀌는 라이트박스 | `card` 모서리·그림자·떠오름, `viewer` 모바일 폭·기본 기기 |

## 레이어 계약

- 매니페스트 `projects/detail-pages/dist/layers.manifest.js`: `global` · `header` · `strip` · `card` · `caption` · `viewer` · `note` (구현 후 개수·파라미터 수를 README에 적는다).
- 장면: `browse`(목록) · `viewer`(크게 보기) — 덮개를 열고 닫을 때 `setScene`, 관리자에서 장면을 바꾸면 덮개도 열리고 닫힌다.
- 화면: 기본 1440 · `tablet` ≤1000 · `mobile` ≤650.
- 목록(상세페이지 수·제목·캡처)은 레이어가 아니다(AGENTS.md 레이어 계약 6). `pages.config.json`이 게시할 목록의 정본이다.
- 고정값: 카드 그림은 원본 비율 유지(높이만 파라미터), 덮개 iframe 구조, 동작 줄이기에서 전환 0 — 매니페스트 `fixed`에 이유를 적는다.
- 작업 동네: `village-houses.manifest.js`에 `house-detail-pages`(기존 집 파라미터와 같음) · `detail-extension`(그림 파일·위치·크기·밝기·연결부 블렌드).
- 완료 조건: `pnpm --filter detail-pages check`(lint 오류 0·생성물 최신), 브라우저 probe 전 파라미터 통과, jooho-lab `check` 통과.

## 검수

입력 → 상태 → 피드백 → 되돌리기: 카드 클릭·Enter → 덮개 + 해시 → Escape·닫기·뒤로 가기로 닫고 카드로 포커스 복귀 · ←/→ 이전·다음 · 데스크톱/모바일 폭 전환 · 해시 직접 진입 · 그림 실패 시 자리표시 · 목록이 비면 안내 · 동작 줄이기 · 390px. 허브: 전시관 11번 선택·입장, 작업 동네 새 집 선택·입장·복귀.
