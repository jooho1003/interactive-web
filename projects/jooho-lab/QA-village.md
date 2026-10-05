# 작업 동네 별도 페이지 검수 · 2026-10-03

bkit Plan → Design → Do → Check → Act. 계획/설계: `docs/01-plan/features/village-page.plan.md`, `docs/02-design/features/village-page.design.md`.

## 구현 결과
- `village.html`에 초기 동네 디자인 복원. 메인 메뉴의 작업 동네 ↔ 동네 메뉴의 전시관 링크. 원본 파노라마/로봇/입장 애니메이션 재사용, 새 에셋 생성 없음. 작품 registry/운영 주소/목록/공유 편집기는 기존 구현을 공유한다.
- 기존 여섯 집은 현재 작품 01~06에 대응한다. Day Walk는 같은 그림 앞 산책길의 일곱 번째 정류장. 원작 장식은 그대로이며 이름/링크는 DOM이다. 탑과 산책길은 같은 카메라 구역을 사용하고 선택한 이름표만 표시해 겹침을 피한다.
- 동네는 **8레이어/42파라미터**, walking/entering 및 모바일 override. 레이어 값/방문 복원은 각각 독립 키를 사용한다. 공유 작품/관람 설정은 두 페이지에 적용한다. 설정과 초기화/내보내기 복구 경로는 숨길 수 없는 UI로 유지한다.

## 확인한 것
- Aside에서 실제 동네 화면/현재 작품 이름/운영 href/메뉴를 확인하고 초기 데스크톱 구도를 캡처했다. 자동 반복 검사 중 탭이 background(`document.hidden=true`)가 되면 렌더러가 정지했다. 이것은 원래 의도한 pause이며 무시하지 않았다. 실패 증거는 `art/village-page/aside-desktop-first-qa.json`. 사용자에게 알린 뒤 안정적인 자동 검수는 headless Playwright로 수행했다.
- 최종 동네 **desktop 1440×900 62 PASS / mobile 390×844 62 PASS / short-mobile 390×600 62 PASS**, 각각 **42/42 layer-kit probe** 및 pageErrors 0. 원본 파노라마/전시관 모델 미로드, 7개 선택/운영 href/이름 있는 DOM 링크, 모든 이름표와 안내·번호 버튼 경계, 키보드/초기화, 입장/머무르기/Escape 취소·포커스 복구, 목록 전환 취소, 빈 검색/복구, 실제 카메라 확대/보행자 크기, 설정 복구, WebGL 손실 대체를 검사했다. `art/village-page/*-qa.json`.
- 실제 포인터 입력으로 건물 이름표 클릭→입장 피드백→머무르기 취소, 전시관↔동네 왕복을 세 화면에서 확인했다. 최종 원래 구도와 Day Walk 선택 화면을 직접 열어 검수했다. `art/village-page/{desktop,mobile,short-mobile}.png`, `*-day-walk.png`.
- 최종 페이지를 Aside에서도 다시 열어 원래 SASU 중심 구도와 메인 복귀 링크/현재 이름표를 직접 확인했다. `art/village-page/aside-desktop-final.png`는 실제 마지막 Aside 화면이며 탭을 미리보기로 남겼다.
- 실제 설정 UI에서 제목 변경→새로고침 보존, entering 장면 override→취소 시 walking 값 복구, 전시관 제목/동네 제목 분리 PASS. 저장소 setItem 실패 시 값이 화면에 남고 복구 안내/JSON 다운로드가 동작함을 390px에서 확인했다. 실제 **동네 Day Walk 링크 클릭→지정 운영 URL/페이지 제목/iframe 진입 PASS**. `art/village-page/settings-and-navigation-qa.json`.
- 기존 전시관 회귀 **desktop 141 PASS / mobile 142 PASS / short-mobile 142 PASS**, pageErrors 0 및 기존 **57/57 probe**. 첫 입장 **7.392초 / 5.975초 / 6.117초**, 기존 8.5초 기준 유지. 실제 마우스 드래그·해제/작업실 입장/외관 복귀도 PASS. `art/village-regression-*-qa.json`.
- 앱 `check`/`build`: 동네 lint 오류 0, 전시관 lint 오류 0, 77,077 경로 샘플, 기존 GLB 4,701,148B 예산 유지. 프롬프트/레퍼런스 보관함은 기존 카드 사용 이력을 갱신하고 재생성한다.
- 최종 앱 check/build, prompts:check, references:check 통과. 로컬 보관함과 `.bkit/runtime/prompt-gallery-site`/`reference-gallery-site` 재게시용 패키지를 갱신했다. 현재 저장소 프롬프트 보관함은 43카드다.

## 발견·해결과 재사용 조건
- 이전 scene.js는 여섯 집까지만 slice해 Day Walk를 공간에서 제외했다. 집 원본을 수정하지 않고 일곱 번째 산책길 정류장을 추가했다. 숫자 선택과 키보드/목록에서 모두 접근한다.
- 산책길 핫스팟의 낮은 top 때문에 이름표가 번호 버튼 위에 겹쳤다. 이름표 아래에 안내/복구/번호 영역을 확보하고 top/bottom을 함께 제한했다. 작은 화면과 모든 7작품의 실제 경계 검사로 확인한다.
- 이동 직후 키보드로 입장·취소하면 원래 이름표가 아직 화면 밖일 수 있다. 취소 시 보이는 이름표, 아니면 공간 컨테이너로 포커스를 복구한다.
- 입장 배경색 probe는 진행률 0에서 완전 투명이어서 색 변화를 볼 수 없었다(41/42). 타이머 없이 veil과 실제 진행률 1을 활성화해 조건부 상태를 검수했다. 실패 기록 `desktop-layer-first-qa.json`을 보존한다.
- 파노라마 교체는 비동기 로딩 순번을 확인해 늦은 이전 이미지가 새 설정을 덮지 않도록 한다. 원본 복원까지 실제 probe한다.
- 전시관 첫 회귀의 입장 **8.781초**는 미통과로 `village-regression-desktop-first-qa.json`에 보존했다. 이어진 검사의 대기 timeout도 통과로 간주하지 않았으며, 최종 전체 재검사는 위 수치로 통과했다. 시간/렌더 예산을 낮추거나 전시관 이동 코드를 바꾸지 않았다.

## 미검수·한계
실제 휴대폰 GPU/FPS, 운영 LAB 배포, 운영 R2 쓰기/인증 재검사, 기존 원격 claude.ai 보관함 재게시 미실행. 원본 파노라마는 집 여섯 채가 그려진 단일 이미지라 집 구조/조각을 개별 편집하지 않는다. 원본 생성 프롬프트는 기존 카드 01/02의 미확인 상태를 유지한다. Node 22.16.0/pnpm 9.13.2에서 검사했으며 저장소의 Node 24 요구 환경은 미검수다.

## main 통합 재검수 · 2026-10-03
- main의 8번째 선비 작품과 7개 고정 전시 칸을 유지했다. 동네도 원래 7정류장만 그리며 선비는 번호 선택·목록·소개 링크·Enter로 연다. 선비 선택 시 유한한 카메라 좌표와 정상 체험 링크를 추가로 검사했다.
- 통합 트리에서 동네 3화면 각각 **64/64 PASS**, **42/42 probe**, pageErrors 0. `art/village-page/*-qa.json`은 이 통합 결과로 갱신했다. 실제 입장/취소·전시관 왕복, 설정 저장/장면 override/페이지 독립·저장 실패 내보내기·Day Walk 운영 진입도 재통과했다.
- 전시관 회귀 **143/144/144 PASS**, pageErrors 0, **57개 레이어 파라미터** 검수. 첫 입장 **7.807초/5.948초/5.837초**, 기존 8.5초 기준 유지. 실제 드래그/입장/외관 복귀 PASS. `art/integration-*-qa.json`, `integration-after-*.png`.
- 통합 트리 전체 `pnpm check`, LAB `check`/`build`, 프롬프트·레퍼런스 최신성 통과. 프롬프트 카드 20과 main의 카드 21을 함께 보존해 보관함은 **44카드**다. 루트 TypeScript/ESLint 설정이 없는 저장소이므로 각 앱의 선언된 check(해당 TS 앱의 tsc 포함)로 검증했다.

## Potato・동네 건물・원격 main 통합 · 2026-10-04

원격 `3640fe3`의 전시관 기본 홈·별도 작업 동네·운영 주소·전시 이미지·선비를 보존했다. 번호는 하루 산책 07, POTATO 08, 선비 09이며 작품 ID는 유지한다. 3D 전시관은 7개 고정 칸만 사용하고 추가 작품은 썸네일/목록/설명/Enter로 연다. 동네에서는 각 9개 목적지 좌표를 선언하며 선비는 탑 앞 산책길 정류장을 사용한다.

별도 `village-houses.manifest.js`로 건물/확장 그림 10레이어·99파라미터를 선언했다. 원격의 공통 동네 8레이어·42파라미터와 전시관 7레이어·57파라미터를 함께 유지한다. 두 호스트가 같은 DOM의 숨김 상태를 지울 수 있었던 결함은 호스트별 숨김 소유권으로 해결했다. 집 장면의 root를 `#scene`으로 분리해 공통 walking/entering 장면과 충돌하지 않는다. 공통 라벨 크기·불투명도는 개별 집 값과 합성한다. 두 호스트의 숨김/복원/장면 독립 단위 테스트 통과.

통합 Chromium: 전시관 57/57, 공통 동네 42/42 파라미터 실제 CSS/속성 변화, 전시관 입장/외관 복원, 선비 Enter→체험→동네 복귀 통과. Potato 소개→체험·분야 변경·작업 검색/빈 결과/초기화·Escape·전시관 복귀 상태 복구·Enter/목록 입장·320px/동작 줄이기와 내장 probe 619/619 통과. 미처리 JavaScript 오류 및 로컬 HTTP 실패 0. 3D 페이지의 테스트는 OS 동작 줄이기로 안정화하고, 입장 후 Enter로 추가 작품을 연다는 기존 계약을 따른다.

전체 `pnpm check`, 허브 build, lint 오류 0, 경로 77,077샘플/GLB 4,701,148B 예산, 프롬프트·레퍼런스 최신성 통과. 새 집 프롬프트는 원격 카드와 겹치지 않는 카드 22로 옮기고 보관함 45카드를 재생성했다. 새 자산 원문은 그대로 보존했다.

Day Walk 운영 주소 클릭은 테스트에서 로컬 스냅샷으로 응답을 대체해 주소·동작을 확인했다. 해당 검수는 운영 서버의 가용성 검사가 아니다. 실제 모바일 GPU, 운영 R2/인증, 온라인 배포와 claude.ai 보관함 재게시 미실행. 기존 새벽 앱의 unavailable umbrella 분기 경고 1개는 남아 있다. 이전 검수 결과/실패 이력은 위 기록대로 보존한다.

최종 재검수: 동네 9목적지, 7·8번 실제 건물 클릭→입장/취소/포커스 복구/복귀, 320px·동작 줄이기·좌우키/Enter, 집 너비 실투영 변화·되돌리기·저장/새로고침·저장 실패 시 값 유지·빈 검색/복원 PASS. 최종 house probe **99/99**, 오류 0. 로컬 검수/캡처는 Git 제외 `.site-publish/check-merged-village.cjs`, `check-merged-potato.cjs`, `check-merged-contracts.cjs`에 보존한다.

## 2026-10-05 · 독립 집9채와 거리 기반 드래그

bkit Plan→Design→Do→Check→Act→QA→Report. 계획/설계/분석/보고는 `docs/*/village-houses-movement.*.md`. 실제 참고: docs/00·10·14, 이 앱 README/QA, 기존 확장 프롬프트 카드22, references의 bruno-simon·clarakirkpatrick. 기존 파노라마/DOM 링크/키보드·목록 대체를 재사용하고 실제 건물 모델이나 운전 물리는 적용하지 않았다.

**확인된 원인과 해결**

- 작품 목적지는9개지만 실제 집은8채였다. 선비가 종말의 탑 x15.12를 공유하고 두 이름표를 번갈아 숨겼다. 새 한옥 패널 `seonbi-extension`과 독립 `house-hanbok-hero`(x33/top.14/bottom.76/width4.2)로9채를 만들고 이름표 교대 조건을 제거했다.
- pointerup은 드래그 길이와 무관하게 다음/이전 작품 하나만 선택했다. 실제 시작 카메라 x에서 화면 이동을 월드 거리로 환산하고 최종 위치를 유지한다. 번호/설명은 가장 가까운 작품에 맞춘다. 반복·역방향 드래그도 이어진다.
- 끝까지 끌면 모바일에서 한옥을 지나 정원만 보였다. 그림 끝과 마지막 집 중심 중 안쪽으로 카메라 끝 경계를 제한해 목적지를 계속 볼 수 있게 했다.
- 모바일의 움직임 버튼이 이름표를 가려 실제 클릭을 막았다. 공용 `controls.footerBottom`(데스크톱70px/모바일220px)을 추가해 둘을 분리했다. 오래된 QA의 선비 제외/7개 목적지/Day Walk 산책길 가정을 현재9채와 안전한 주소 비교로 갱신했다.

**실제 검증**

| 검사 | 결과·근거 |
|---|---|
| Aside | 기존 마을/POTATO 실제 화면 및 새 선비 링크 확인. 최종 로컬 탭 `village.html#project=hanbok-hero` 갱신 |
| 거리 이동·입장/복귀 | 1440×900 31항목, 390×844 30항목, 320×700 30항목 PASS. 짧은/긴 드래그·여러 집 이동·종료 위치 유지·연속/역방향·오른쪽 끝·초기화·방향키/Home·실제 선비 체험과 뒤로 복귀·입장/Escape·오버플로/JS 오류 없음 |
| full motion 터치 | CDP의 실제 touchStart/Move/End: 390px 수평 드래그 거리·종료 위치 유지·세로 페이지 스크롤 PASS (`art/village-houses-touch-qa.json`) |
| 기존 동네 QA | 데스크톱/390px/320px 각각75항목 PASS. 작품9개 실제 선택/링크/DOM 이름표/컨트롤 비겹침, 빈 결과/복구, 동작 줄이기, 레이어 설정/포커스, WebGL 손실 후 목록 대체 포함 (`art/village-houses-*-full-qa.json`) |
| layer-kit | 공용8레이어/43파라미터, 집·확장11레이어/108파라미터. lint 오류0. 데스크톱·모바일 모두43/43+108/108 probe PASS (`art/village-houses-*-probe.json`) |
| 빌드·보관함 | 앱 check/build PASS. prompts:build·references:build 완료. 새 원문·설정·후보 선택은 prompts/jooho-lab 카드23 |

검수 스크립트: `scripts/check-village-movement.py`, `scripts/check-village-touch.py`(저장소 루트에서 실행, 로컬8879 서버 필요). 스크린샷 `art/village-houses-{desktop,mobile,narrow}.png`는 실제 브라우저 캡처다.

**재사용 조건·확인 한계** — 작품 링크 수만 검사하면 실제 집 누락을 놓친다. 기본 집 좌표의 중복 회귀 검사와 실제 이름표 클릭을 함께 확인한다. 제스처는 선택 인덱스보다 실제 카메라에서 시작해야 멈춘 위치가 유지된다. 에셋 경계의 장식 여백은 마지막 목적지를 지나게 할 수 있으므로 집 중심도 고려한다. 공용 매니페스트 probe에는 실제 CSS 파일을 stylesheets로 선언한다. Aside의 갱신 캡처는 CDP 시간 초과로 실패해 사전 안내 후 헤드리스 Playwright를 사용했다. 실제 휴대폰 하드웨어와 수정 후 운영 사이트는 미확인. Node22.16.0에서 앱 check/build는 통과했으며 저장소 요구 Node>=24 경고는 남아 있다. 기존 저장 레이어의 사용자 지정 좌표는 강제로 초기화하지 않았다. 프롬프트/레퍼런스 웹 보관함은 로컬 생성물을 갱신했다.
