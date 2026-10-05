# Gallery all works · Design
작성: 2026-10-05 · [Plan](../../01-plan/features/gallery-all-works.plan.md)

## Context Anchor
WHY 추가 작품 탐색 누락 / WHO 방문자·편집자 / RISK 액자 정렬·중복 그림 / SUCCESS 10개 목적지·그림·링크와 기존 레이어 통과 / SCOPE registry·gallery·검증.

## 1. Overview
기존 3D 전시관 7칸을 재사용한다. 작품 08~10은 다음 전시 페이지에서 같은 칸에 걸고 선택하면 기존 카메라 이동을 수행한다.

## 2. Architecture Options
| 안 | 변경·비용 | 판단 |
|---|---|---|
| A 기존 칸 페이지 재사용 | 작은 JS 수정, 원본 GLB·조명·동선 유지 | 채택 |
| B 새 전시관 제작 | Blender 구조·텍스처·베이크·동선 재검수 | 이번 요청에 과도 |
| C 슬롯마다 가상 새 액자 | 겹침/벽 범위 및 조명 계약 추가 | 불필요 |

## 3. Data / 4. API
projects에 village stable ID·번호 10·기존 project-village.webp·./village.html 추가. content schema는 registry에서 ID를 유도하므로 기존 편집/저장 재사용. 신규 API 없음.

## 5. UI / 6. Behavior
app.js는 전시관에 모든 작품을 전달하고 동네에는 자기 자신만 제외한다. renderer는 index % exhibitBays를 위치에, floor(index / exhibitBays)를 가시성에 사용한다. 선택·필터·이동마다 현재 페이지와 검색 결과의 교집합만 보인다. 모든 ID는 순차 휠·좌우키·썸네일·설명 링크에 참여한다. Escape는 hall, Home은 exterior로 복귀한다.

## 7. Layers
7레이어/57파라미터 유지. 액자 좌표·페이지 규칙은 구조 fixed, 내용은 registry/editor. 이미지/모션/카메라/설명은 기존 설정을 소비한다.

## 8. Test Plan
안전 동선 테스트를 전체 10개에 확대하고 07↔08 전환도 검사한다. 브라우저 실제 선택·그림 경계·카메라·href·검색 빈 결과 복구·키보드·동네 왕복을 확인한다. 기존 공간 QA와 probe를 재실행한다.

## 9. Error / 10. Scope
검색 결과 없음은 기존 hall 복귀와 안내, 설정 저장 실패와 WebGL 대체 화면은 기존 경로 유지. 배포·에셋 생성 없음.

## 11. Implementation Guide
registry → app 연결 → renderer 페이지/좌표 → 검증 확장 → QA·README 기록.
### 11.3 Session Guide
한 세션의 작은 수정. 별도 모듈 추출/병렬 작업 없이 기존 파일에 적용한다.
