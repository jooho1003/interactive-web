# Gallery all works · Check
작성: 2026-10-05 · 계획/설계: gallery-all-works

## 구현 대조
| 요구 | 근거 |
|---|---|
| 모든 작품의 실제 전시·카메라 | 모든 registry ID를 scene에 전달하고 slot/page로 7개 구운 칸 재사용 |
| 작업 동네 카드·검색·소개·열기 | village ID·번호 10, 기존 panorama와 ./village.html |
| 필터·키보드·복귀·원본 비율 | 기존 app/navigation, 추가 브라우저 목적지/페이지/그림 경계 검사 |
| 기존 동네 건물 유지 | 자기 자신은 scene/house scene 목록에서 제외, 물리 목적지 9개 유지 |
| 설정 계약 | 기존 7레이어/57파라미터, 구조 fixed 추가, 데스크톱/모바일 57/57 |

## 검사와 한계
app check/build, 레이어 lint 오류 0, 전체 작품 경로 110,110샘플 통과. Aside 전체 회귀는 18항목 뒤 hall 대기 시간 초과. 첫 headless 전체 회귀는 실패 항목/페이지 오류 없이 127항목 통과 후 실행기 120초 시간 제한. 실패를 PASS로 바꾸지 않는다. 레이어 검사는 offscreen 렌더 정지 상태에서도 CSS/속성·실제 renderer uniform을 각각 검사하여 데스크톱/모바일 57/57 통과했다.

최종 실제 클릭/왕복/작은 화면 결과는 앱 QA-spatial의 이번 날짜와 art/gallery-all-works-*-smoke.json을 따른다. 전체 모션 회귀 PASS·성능 수치를 주장하지 않는다. 범위 밖 배포와 실제 모바일 기기 GPU는 미검수.

## Act
POTATO RGBA 투명 배경이 불투명 전시 재질에서 검게 보인 문제를 발견했다. MeshBasicMaterial의 transparency를 켜 원본 alpha를 유지했다. 신규 에셋은 만들지 않았다. 동네 자체가 house scene 목록에 추가되어 생성물 최신성 검사가 실패한 문제는 물리 positions가 있는 작품만 scene으로 선언해 해결했다.
