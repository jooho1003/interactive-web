# 상세페이지 — 상세페이지 시안 포트폴리오

shortform-automation 저장소의 상세페이지 작업실에서 만든 쇼핑몰 상세페이지 시안을 모아 보는 정적 페이지입니다. 페이지마다 **전체 길이 캡처를 세로로 긴 카드**로 가로로 늘어놓아 한눈에 훑고, 카드를 누르면 실제 페이지를 **데스크톱·모바일 폭**으로 크게 봅니다. JOOHO LAB 전시관의 11번 작품과 작업 동네의 상세페이지 집에서 연결됩니다(`/experiences/detail-pages/`).

지금 실린 시안: **LUMEN DEW 세럼 리디자인**(그림 5장), **온기 아이보리 머그 샘플**(그림 1장). 모든 브랜드·제품은 가상이고 가격·성분·효능 같은 판매 정보는 없습니다.

```powershell
pnpm --filter detail-pages dev     # http://localhost:4188 · 관리자 /admin
pnpm --filter detail-pages check   # 엔트리·스냅숏 검사 · layer-kit lint · 생성물 최신성
python projects/detail-pages/scripts/qa.py --studio   # 헤드리스 브라우저 검수 + probe (결과 art/qa/)
```

계획과 참고 자료: [`.claude/plans/2026-10-07-detail-pages.md`](../../.claude/plans/2026-10-07-detail-pages.md). 레퍼런스 `motionsites`(타일 → 큰 미리보기 덮개, 주소로 열고 닫기)·`julesesick`(라이트박스 키보드·포커스 복귀)를 우리 레이어로 다시 설계했습니다.

## 상세페이지 가져오기·추가하기

게시할 목록과 순서의 정본은 [`pages.config.json`](pages.config.json)입니다. 원본은 shortform-automation의 `상세페이지/<프로젝트 id>/` 폴더(`프로젝트.json` + 독립 HTML)입니다.

```powershell
# 저장소 옆에 shortform-automation이 있으면 그대로, 아니면 --source로 폴더 지정
python projects/detail-pages/scripts/sync-pages.py [--source <shortform-automation/상세페이지>]
pnpm --filter jooho-lab include:experience detail-pages   # 허브 스냅숏과 전시 표지 갱신
```

`sync-pages.py`가 하는 일: 독립 HTML의 base64 그림을 `dist/pages/<slug>/media/NN.webp`로 꺼내고(같은 그림은 파일 하나, 22MB → 약 1.3MB), 로컬 편집 콘솔(`localhost:3123`)로 가는 링크를 지운 뒤 스냅숏을 씁니다. 1440·390px 전체 길이 캡처로 카드 미리보기(`preview.webp`)와 전시 표지(`assets/cover.webp`)를 만들고, `프로젝트.json`에서 제목·고객·핵심 문구·섹션 수·만든 날을 읽어 `dist/pages.js`를 씁니다. 원본 HTML은 고치지 않습니다. `check`는 `pages.js`가 설정과 같은지, 스냅숏에 `localhost`·내장 그림·스크립트가 남지 않았는지 검사합니다.

## 동작

| 입력 | 바뀌는 상태 | 보이는 피드백 | 되돌리기 |
|---|---|---|---|
| 카드 클릭·Enter | 덮개 열림, 주소에 `#<slug>`(기록 하나), 장면 `viewer` | 실제 페이지를 iframe으로, 막대에 순서·이름, 불러오는 동안 안내 문구 | 목록으로 버튼 · Escape · 뒤로 가기 — 닫으면 연 카드로 포커스 |
| ‹ › 버튼 · ←/→ 키 | 이전·다음 상세페이지(주소만 바꾸고 기록은 쌓지 않음) | 이름·순서·새 창 링크 갱신, 처음·끝에서 버튼 비활성 | 반대 방향 |
| 데스크톱·모바일 버튼 | 무대 폭 1440(무대보다 넓으면 축소) ↔ 390 | 기기 틀 모양, 누른 버튼 `aria-pressed` | 다른 버튼. 이번 방문 동안 고른 폭을 기억 |
| 주소 `#<slug>`로 진입 | 그 상세페이지로 덮개를 바로 엶 | — | 닫으면 해시만 지움 |
| 새 창으로 열기 | 상세페이지 단독 화면 | — | 브라우저 |
| 좁은 화면(≤650px) | 처음 여는 폭이 모바일, 덮개 막대 두 줄 | 화면 전체가 모바일 폭 | — |
| 동작 줄이기 | 카드 떠오름·덮개 전환 없음 | 즉시 전환 | OS 설정 |

캡처를 못 불러오면 카드 크기를 유지한 자리표시와 이름을 보입니다. 목록이 비면 안내 문구가 나옵니다. 덮개 레이어를 끄면 카드는 상세페이지로 바로 이동하는 링크가 됩니다. 덮개 안 iframe은 첫 페이지만 `src`로, 이후는 `location.replace`로 바꿔 기록이 쌓이지 않게 합니다(닫을 때의 뒤로 가기가 목록으로 돌아가도록).

## 레이어

[`dist/layers.manifest.js`](dist/layers.manifest.js)가 정본입니다 — **7레이어 / 59파라미터**. `global` 배경·글자·보조·강조색, 본문·제목 글꼴, 글꼴 배율 · `header` 머리말·제목·소개 문구, 제목 크기, 정렬, 위 여백, 문구 최대 폭 · `strip` 카드 그림 높이(vh), 간격, 좌우 여백, 줄 정렬, 카드 단위 멈춤, 빈 목록 문구 · `card` 여백 띠 두께·색, 모서리, 그림자, 떠오름 거리·시간 · `caption` 설명 위치(오른쪽/아래), 폭, 간격, 이름·정보 글자 크기 · `viewer` 덮개 배경, 막대 배경·글자 색, 데스크톱·모바일 미리보기 폭, 처음 여는 폭, 열림 전환 시간, 버튼·안내 문구 5개 · `note` 아래 안내 문구·크기. 모든 레이어에 보이기·불투명도.

장면은 `browse`(목록)·`viewer`(크게 보기, 머리글·카드 줄 불투명도 0.35)이고 화면은 기본 1440 · `tablet` ≤1000 · `mobile` ≤650입니다. 값은 `dist/layers.values.json`(관리자에서 게시)에 쌓입니다. 상세페이지 목록·캡처·카드 문구는 레이어가 아닌 콘텐츠(`pages.config.json` → `pages.js`)입니다. 고정값(캡처 원본 비율, 덮개 구조와 축소 배율 계산, 동작 줄이기, 접근성 치수)은 매니페스트 `fixed`에 이유와 함께 적었습니다.

## 관리자

`/admin`은 한복 히어로의 Scene Studio를 복사해 쓴 패널입니다(장면·화면·적용 범위, 레이어별 파라미터, 초안 저장·게시·버전 복구·내보내기·불러오기). 장면을 **크게 보기**로 바꾸면 미리보기의 덮개가 실제로 열리고 **목록**으로 바꾸면 닫힙니다. `ADMIN_PASSWORD`를 두면 로그인 화면이 나옵니다. 이 패널은 이제 세 앱(Potato·한복·상세페이지)이 쓰므로 `@iw/layer-kit`으로 올릴 후보입니다 — 이번에는 검수된 두 앱의 관리자를 함께 바꾸지 않으려고 복사로 두었습니다.

## 검수

[QA.md](QA.md). 페이지 안 검사는 `dist/qa/browser-checks.js`(probe는 데스크톱·모바일 무대 상태 각각에서 재고 합칩니다).

## 에셋

그림의 프롬프트 원문과 이력은 [`prompts/detail-pages.md`](../../prompts/detail-pages.md), 전시 표지와 작업 동네의 집 그림은 [`prompts/jooho-lab.md`](../../prompts/jooho-lab.md) 카드 29·30. 글꼴은 Google Fonts Noto Serif KR(제목)과 시스템 고딕입니다.
