# Gallery all works · Plan

작성: 2026-10-05 · JOOHO LAB · 사용자 요청 범위의 작은 PDCA

## Executive Summary
| 관점 | 내용 |
|---|---|
| Problem | POTATO·선비는 선택해도 벽 그림/카메라가 없고 작업 동네는 컬렉션에 없다. |
| Solution | 기존 전시 칸을 페이지로 재사용하고 작업 동네를 작품 10으로 등록한다. |
| Function/UX Effect | 10개 작품 모두 공간 선택·검색·소개·체험 링크를 같은 경로로 쓴다. |
| Core Value | 작품 수가 전시 칸 수를 넘어도 탐색에서 제외하지 않는다. |

## Context Anchor
| 키 | 값 |
|---|---|
| WHY | 추가 작품의 공간 탐색 누락 해결 |
| WHO | 포트폴리오 방문자·편집자 |
| RISK | 첫 7칸 좌표 이동, 중복 그림 겹침, 동네가 자기 건물이 됨 |
| SUCCESS | 10개 카메라 목적지·그림·링크, 기존 복귀와 레이어 검증 통과 |
| SCOPE | registry, gallery selection/renderer, 해당 검증과 기록 |

## 1. Overview · 참고 자료와 원칙
docs/00, docs/10, docs/04, docs/11, 앱 README·QA-spatial·QA-village 및 기존 spatial-route/scene을 읽었다. 기존 입력→선택→이동→설명→열기→복귀를 재사용한다. 새 비주얼/실제 3D 모델 제작·분기 이야기·공용 추출은 필요 없으므로 적용하지 않는다. “작업실”은 작업 동네를 뜻한다고 가정하며 기존 입장 버튼의 작업실은 hall 상태로 유지한다.

참고 레퍼런스: references/patterns의 drive-to-explore 및 notefolio-portfolios의 bruno-simon·annamills. bruno-simon에서 초기화/DOM 목록 대체를 가져오고 운전/물리/온라인 기능은 가져오지 않는다(기존 controls·shell). annamills에서 필름 스트립과 텍스트 메뉴를 가져오고 브랜드/원작 이미지/움직이는 격자는 가져오지 않는다(기존 rail size/gap, shell). 새 파라미터는 필요 없다.

## 2. Scope
POTATO·선비·작업 동네를 같은 공간 선택 흐름으로 연결한다. 동네 자체의 건물은 추가하지 않는다. 배포·새 에셋 생성·Blender 재빌드는 범위 밖이다.

## 3. Requirements
FR-01 모든 작품의 실제 그림과 안전한 카메라 목적지. FR-02 동네 카드·검색·소개·체험. FR-03 기존 필터/키보드/되돌리기/저장 설정 유지. FR-04 기존 전시 7칸 좌표 보존, 페이지 내 중복 그림 없음.

## 4. Success Criteria / 검증 순서
1. 등록·연결 → 전체 10개 및 예상 href, 7번째↔8번째 순차 선택 확인.
2. 브라우저 → 클릭·키보드·검색/빈 결과·복귀·동작 줄이기, 모바일 해당 범위 확인.
3. 앱 check/build → lint 오류 0, 기존 probe 모든 파라미터, QA에 실제 결과와 한계 기록.

## 5. Risks and Mitigation
전시 수로 칸 좌표를 재계산하면 구운 액자에서 벗어난다. 항상 exhibitBays=7 좌표와 index % 7을 사용한다. 같은 칸에 있는 다른 페이지 그림은 숨긴다. village 레코드는 동네의 물리 건물 목록에서 제외한다.

## 레이어 계약
기존 stage·rail·detail·controls·shell을 재사용한다(7레이어/57파라미터). 문구·이미지·주소는 목록 콘텐츠로 기존 편집기가 담당한다. 새로운 조절 수치·색 리터럴 없음. 고정 전시 칸/페이지의 구조 규칙은 layers.manifest.js fixed에 기록한다. lint/probe 결과는 QA-spatial의 이번 기록을 따른다.
