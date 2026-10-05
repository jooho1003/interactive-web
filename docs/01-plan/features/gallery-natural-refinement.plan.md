# Gallery natural refinement · Plan

2026-10-05 · bkit PDCA · 사용자 승인 범위: 비교 검토1번·2번

## Executive Summary
| 관점 | 내용 |
|---|---|
| Problem | 추가 페이지에서 그림이 즉시 바뀌고 긴 이동도 인접 이동과 시간이 같다. 목재판·두꺼운 받침이 작품보다 강조된다. |
| Solution | 거리 기반 이동·페이지 감춤/등장, 얇은 밝은 액자·종이·선반 및 조명/AO 재베이크 |
| Function/UX Effect | 선택 변화가 예측 가능하고 작품을 중심으로 공간이 가볍게 보인다. |
| Core Value | 기존 실제3D 동선·작품 원본과 링크를 보존하며 자연스러운 관람을 만든다. |

## Context Anchor
WHY: 승인된 개선1/2 구현. WHO: 전시관 방문자/편집자. RISK: 전환 중 재입력·모델 재빌드/조명·좌표 정렬. SUCCESS: 중단/역전 포함 전환과 사진 비교·레이어 검사 통과. SCOPE: 이동/전환·전시 구조/재질/검수, 캐릭터 반응3번 제외.

## 1. Overview · 참고/원칙
docs/00·10·14, POTATO README/QA/그림자·포인터 분리, LAB README/QA-spatial, 직전 jooholab-potato-visual-review, docs/04·11과 기존 Blender/route/renderer를 읽는다. POTATO의 좋은 비주얼·역할 분리·작은 움직임을 조명과 페이지 전환에 적용한다. 실제 외부→문→내부 동선이 있으므로 docs/14 예외에 따라 기존 실제3D를 유지한다. 새 캐릭터·운전 물리·10칸 확장·공용 추출은 이번 요구에 없다.

참고 레퍼런스: bruno-simon의 공간 발견/복귀·DOM 대체를 재사용한다(기존 controls/shell). annamills의 이미지 중심 전시/텍스트 선택을 재사용한다(rail/detail). 원작 그림/브랜드·운전·무드보드 편집은 가져오지 않는다. 두 카드의 기존 사용 기록과 이번 기록을 연결한다.

## 2. Scope / Requirements
FR1: 같은 페이지의 작품 간 이동을 거리 비례로 계산하되 최소/최대 시간을 둔다. FR2: 페이지가 바뀌면 이전 그림을 감춘 뒤 화면을 가린 동안 목적지/새 페이지로 전환하고 나타낸다. 재입력/취소/동작 줄이기는 최신 목적지를 유지한다. FR3: 큰 목재판 제거·얇은 액자/종이·작은 선반, 실제 좌표/그림 비율 보존. FR4: 재질/조명/노출 설정, 현재 콘텐츠/소유자 저장/입장·복귀 유지.

## 3. Success / 순서
1. 이동 함수 경계/거리 단위 검사, 브라우저 페이지 전환 도중 즉시 그림 교체 없음·중단/역전/복귀 확인.
2. 모델과 재질 재생성 → 원본 GLB/Blender 백업, 그림 정렬·AO/조명·예산 검사.
3. 데스크톱/390/320px 입력·실제 그림/입장/검색·빈 결과·동작 줄이기·모션·레이어probe 확인.
4. 앱check/build와 프롬프트/레퍼런스 보관함 최신성·QA 기록.

## 4. Risks
그림/종이/프레임의 z좌표를 한 정본에 맞춘다. 기존 조명/AO와 새 구조를 혼합하지 않고 새 atlas를 만든다. 그림의 원색은 유지하되 밝기를 조절한다. 오래된 저장 레이어는 새 기본값을 상속하며 기존 사용자 값을 강제로 지우지 않는다. 이전 GLB와 비교 캡처를 보관한다.

## 레이어 계약
stage에 slideMinSeconds/slideMaxSeconds/pageSeconds/pageTint와 frameTint/frameRoughness/paperTint/paperRoughness/artBrightness를 추가한다. 기존 slideSeconds는 인접2.15m 이동 기준 시간으로 유지한다. 페이지 베일은 stage에 속하며 보이기/불투명도와 pageTint/시간을 사용한다. 기존7레이어57파라미터→66파라미터 예상. 전시 판/종이/프레임/선반은 stage이며 새 치수/그림z는 물리 설치 고정값으로fixed에 재빌드 이유를 기록한다. 소스/실제렌더를 대조한 lint/probe 결과를 QA에 남긴다.
