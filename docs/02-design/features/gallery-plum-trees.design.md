# 사진 참고 꽃나무 시안 · Design

2026-10-05 · [Plan](../../01-plan/features/gallery-plum-trees.plan.md)

## 표현/배치
Photorealistic 단독 꽃나무 투명 에셋. 가벼운 새 꽃·검은 굽은 굵은 줄기·가는 비대칭 가지·빈 공간이 보이는 수관을 요청한다. 전면4개 기존 tree(-10,4,4.8),(10,3,5.2),(-12,-5,6),(12,-5,5.6)를 이미지 카드로 바꾼다. 실내(-7.8,-1.8,2.7)는 기존 작은 녹색 나무를 유지한다.

## 코드/자산
기존 tree() 생성 호출에서 외부4개만 제거해 Blender/GLB/조명·AO를 재생성한다. spatial-scene.js에서 좌/우 색상·깊이 material과4개 카드 mesh를 생성한다. 사진의 조명/잎을 유지하는 BasicMaterial, alphaTest·실제 silhouette 그림자, 초기 외부 시점 방향 고정으로 보인다. x=±9.12m 바깥 clipping으로 카드/그림자가 벽 안으로 뻗지 않게 한다. 깊이 shader도 opacity uniform을 alpha에 곱하고 좌/우 material ID를 분리해 clipping cache를 공유하지 않는다. map 교체는 완료/실패·버전 순서를 검사하고 성공한 후 이전 map을 dispose한다. 최초 이미지/기본 이미지 모두 실패하면 투명 DataTexture로 나무만 숨기고 전시관은 열린다. world 전체 dispose 경로를 재사용하고 두 custom depth material은 따로 dispose한다. 새 카드가 전시 클릭을 막지 않도록 클릭 대상에는 추가하지 않는다.

## 설정/검증
manifest10개 파라미터와 MutationObserver를 연결한다. 생성 결과의 뿌리 가로 위치376/1086과 하단 여백40/1448를 baseX/baseY 설정으로 두고, unit plane UV→geometry 변환에 적용한다. inspect().trees에 개수/실제 visible/opacity/height/spread/baseX/baseY/material color/yaw/texture 상태를 노출해 DOM 값뿐 아니라 실제 renderer 변화도 확인한다. shared shadow cache를 나무 transform/visibility/map 변경 시 무효화한다. alphaTest도 opacity와 함께 줄여 낮은 opacity에서 나무 전체가 갑자기 사라지지 않게 한다. 브라우저 전체 회귀/설정 probe·새 renderer 반응·실패 교체 유지/복귀·모바일·reduced 및 외관 캡처를 검사한다. 순수 비주얼 교체이므로 새 저장 API는 없다.
