# Village houses and movement · Plan

작성: 2026-10-05 · JOOHO LAB · 작은 bkit PDCA

## Executive Summary
| 관점 | 내용 |
|---|---|
| Problem | 선비가 종말의 탑과 좌표를 공유해 실제 집은 8채이고, 드래그 거리와 무관하게 한 작품만 이동한다. |
| Solution | 선비 한옥 패널을 추가하고 드래그 종료 위치를 유지한다. |
| Function/UX Effect | 9개 목적지에 독립 집이 생기고 여러 집을 한 번에 지나갈 수 있다. |
| Core Value | 보이는 건물과 작품이 일치하고 손의 이동이 화면 이동으로 이어진다. |

## Context Anchor
| 키 | 값 |
|---|---|
| WHY | 사용자가 보고한 집 부족·짧은 이동을 실제 입력으로 확인하고 해결 |
| WHO | 작업 동네 방문자 |
| RISK | 그림 접합·레이어 저장 호환·클릭과 드래그 충돌 |
| SUCCESS | 9개 서로 다른 집 좌표, 긴/짧은 드래그 거리 반영, 입장/취소/초기화 및 모바일·동작 줄이기 확인 |
| SCOPE | 마을 그림 확장, 집 매니페스트, 카메라 제스처, 검증·프롬프트 기록 |

## 1. Overview · 참고 자료와 원칙
docs/00·10·14, 앱 README·QA-village, prompts/jooho-lab 카드22, references/patterns와 notefolio-portfolios의 bruno-simon·clarakirkpatrick를 참고한다. 기존 파노라마 좌표계와 DOM 접근성 링크를 유지하고 한옥도 이미지로 구현한다(docs/14의 파노라마 예외). 실제 3D 모델·운전 물리·분기 서사는 이번 요구에 필요 없다.

참고 레퍼런스: bruno-simon의 이동→발견·초기화·목록 대체를 가져오고 운전/멀티플레이는 적용하지 않는다(기존 stage·controls·shell). clarakirkpatrick의 그림 속 오브젝트별 링크와 DOM 문구를 가져오고 브랜드·원작 그림은 쓰지 않는다(house-hanbok-hero, seonbi-extension의 이미지·위치·폭·높이·블렌드).

## 2. Scope / Requirements
선비의 독립 집을 아홉 번째로 추가한다. 작업 동네는 컬렉션의 자기 링크이며 별도 자기 건물을 만들지 않는다. 드래그는 수평 입력 거리만큼 이동하고 종료 후 그 위치를 유지하며 가장 가까운 작품을 선택한다. 번호·방향키는 기존 작품 안내를 유지한다. 세로 터치는 페이지 스크롤을 유지한다.

## 3. Success Criteria / 순서
1. 원인 재현 → 선비/탑 좌표 중복과 pointerup 한 칸 제한 확인.
2. 그림/입력 수정 → 집9개 분리, 긴 드래그가 짧은 드래그보다 멀리 이동, 연속 드래그·끝 경계·초기화·입장 취소 확인.
3. check/build·브라우저 → 데스크톱/모바일/동작 줄이기 및 변경 레이어 probe, 실제 검증·한계 QA 기록.

## 4. Risks
새 그림은 기존 확장 그림의 하늘·문 높이·재질을 참조하고 블렌드로 접합한다. 기존 레이어 id/값은 유지한다. 드래그 시작 카메라 위치를 기준으로 하며 종료 후 클릭을 억제한다. 새 생성 프롬프트는 prompts 정본에 남기고 보관함을 빌드한다.

## 레이어 계약
house-hanbok-hero의 x/top/bottom/width 기본값을 독립 집에 맞춘다. seonbi-extension에 visible/opacity/src/x/y/width/height/brightness/leftBlend를 추가한다. 검수에서 확인한 이름표 클릭 방해를 해결하도록 공용 controls.footerBottom(70px/모바일220px)을 추가한다. 두 확장 패널의 카메라 투영·좌표 경계와 제스처 임계값은 기존 구조값을 재사용한다. 드래그 감도는 기존 월드폭/화면폭 환산이며 새 조절 리터럴을 넣지 않는다. lint 오류0, 공용43/43+집108/108 probe 데스크톱·모바일 통과. 실제 근거는 QA-village에 기록한다.
