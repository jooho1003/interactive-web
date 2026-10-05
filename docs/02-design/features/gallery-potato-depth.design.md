# Gallery POTATO depth · Design

2026-10-05 · [Plan](../../01-plan/features/gallery-potato-depth.plan.md)

## Context Anchor
WHY: 2.5D 부분 시범. WHO: 관람자. RISK: 평면 노출/프레임·터치. SUCCESS: 반응/복귀/설정 검증. SCOPE: POTATO만.

## Architecture / 구현
A: 기존 image plane 변환+별도 shader 타원(선택, 렌더러/좌표/레이캐스트 재사용). B: DOM 투영 overlay는 두 좌표계 동기화가 추가된다. C: 새3D 모델은 이 시범에 불필요하다.

POTATO texture의 contain 비율을 fit으로 보관하고 매 렌더에서 fit×scale과 depth를 합성한다. 선택/정지 project 상태의 POTATO만 반응하며, 나머지 상태에서는 원래 좌표/회전/배율로 복구한다. depth=.12m/scale=.94, shift=.025/.018m, tilt=4°. depth에 비해 각도가 크면 종이를 뚫지 않도록 실제 plane 모서리의 후퇴량으로 각도를 제한한다.

Shader plane은 source 이미지와 무관한 부드러운 타원이며 opacity/color/width/height/y/shift를 적용한다. 그림자 z는 종이와 캐릭터 사이에 둔다. 새 매니페스트 attr도 MutationObserver에 연결한다. reduced/touch/drag 입력에서는 기울기/이동을0으로 하고 정적인 깊이를 유지한다. 반복 모션/새 상시 rAF 없음.

## 검증/레이어 계약
inspect의 실제 mesh transform/visible/opacity와 그림자 uniform/scale을 관찰한다. mouse 이동/leave, reduced/touch, 다른 작품/페이지/복귀, 효과 off의 원래 평면, 15개 새 설정 바인딩과 기존66개를 검사한다. 9레이어81파라미터 lint0/probe 전부 통과가 완료 조건이며 검증/한계는 앱 QA에 남긴다.
