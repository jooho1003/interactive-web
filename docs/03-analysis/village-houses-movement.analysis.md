# Village houses and movement · Check

2026-10-05 · [Plan](../01-plan/features/village-houses-movement.plan.md) · [Design](../02-design/features/village-houses-movement.design.md)

| 요구 | 구현·근거 | 결과 |
|---|---|---|
| 작품별 독립 집9채 | 집 x값 중복 회귀 검사, 선비 x33·지붕 .14, 새 한옥 패널 | PASS |
| 드래그 거리 반영·종료 위치 유지 | 시작 카메라 x 기준 환산, 최종 좌표 유지·가까운 작품 선택 | 데스크톱31 / 모바일30 / 320px30항목 PASS |
| 끝 경계·입장/복귀 | 마지막 집 중심과 그림 끝 중 안쪽으로 제한, 선비 실제 체험·뒤로·Escape | PASS |
| 터치·세로 스크롤 | 390px 모바일 CDP touchStart/Move/End, full motion | PASS |
| 레이어 lint/probe | 공용8/43, 집11/108; 데스크톱/모바일151개씩 probe | PASS |
| check/build·에셋 기록 | 앱 check/build, 프롬프트 카드23, 보관함 생성 | PASS |

반복 검수에서 수정한 결함: 모바일 움직임 버튼이 선비 이름표를 덮어 실제 클릭을 막음 → controls.footerBottom 파라미터로 분리. 끝까지 드래그하면 한옥을 지나 정원만 보임 → 이동 경계를 마지막 집 중심으로도 제한. 생성 문 중심35%를 반영해 집 x33으로 보정했다.

Aside에서 초기 마을·POTATO와 새 한옥 DOM 링크를 확인했다. 갱신된 화면 캡처는 CDP 시간 초과로 실패하여 Playwright 헤드리스에서 실제 이미지/포인터/터치를 검수했다. 실기기 터치는 미확인. 상세 결과와 QA 리포트는 앱 QA-village에 연결한다.
