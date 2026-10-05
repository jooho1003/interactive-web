# Gallery POTATO depth · Plan

2026-10-05 · bkit · 사용자 요청: 일부만 간단히 적용해 확인

## Executive Summary
| 관점 | 내용 |
|---|---|
| Problem | 전시관에서 2.5D가 어울리는지 작은 실제 예시가 필요하다 |
| Solution | POTATO 하나에 이미지 전진/작은 포인터 기울기와 별도 타원 그림자 적용 |
| Function/UX Effect | 액자 앞에 캐릭터가 떠 있는 느낌을 기존 관람 흐름에서 확인 |
| Core Value | 기존 이미지/공간 재사용, 설정으로 켜고 끄며 비교 가능 |

## Context Anchor
WHY: 부분 시범. WHO: 관람자/사용자. RISK: 평면 노출·프레임 충돌·터치/동작 줄이기. SUCCESS: 포인터 변화/복귀·다른 작품 보존·레이어 검증. SCOPE: POTATO 이미지와 그림자만.

## 1. 참고/원칙
docs/00·10·14·11, POTATO README/QA와 포인터/그림자 구현, LAB README/QA를 읽었다. 투명 이미지의 원근을 활용하고 반응/그림자를 분리한다. 실제 걷는 공간은 docs/14 예외에 따라 유지한다. 새 에셋·Blender·반복 떠다님·새 공용 패키지는 필요 없다.

외부 참고: bruno-simon `drive-to-explore`의 공간/복귀·DOM 대체 유지(stage/controls), loonamessal `illustration-hero`의 그림 층별 깊이만 가져온다(potato-card/potato-shadow). 원작 이미지/브랜드·운전·멈출 수 없는 반복 모션·그림 메뉴는 가져오지 않는다.

## 2. 요구/검증
선택된 POTATO 앞에서만 이미지가 최대4° 기울고 작게 이동하며 그림자는 다른 강도로 반응한다. 포인터가 나가면 중앙으로 복귀한다. 터치/동작 줄이기/드래그 모드는 정적인 깊이로 보여 준다. 다른 작품/전환/입장/복귀를 보존한다. 실제 브라우저에서 켜기/끄기·각도/거리·프레임 경계와 390/320px, 레이어 전체 probe·app check/build를 확인한다.

## 레이어 계약
potato-card: visible/opacity/enabled/depth/scale/shiftX/shiftY/tilt. potato-shadow: visible/opacity/color/width/height/y/shift. 2레이어15파라미터 추가로9레이어81파라미터. image는 기존 작품 콘텐츠를 재사용한다. 좌표 정본·그림자 gradient 수식/단위 plane는 구조 fixed; 시각 크기/색/반응은 설정값이다. 새 파일 에셋이 없으므로 새 생성 프롬프트 없음.
