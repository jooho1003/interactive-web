# 사진 참고 꽃나무 시안 · Check/Act

2026-10-05 · [Plan](../01-plan/features/gallery-plum-trees.plan.md) · [Design](../02-design/features/gallery-plum-trees.design.md)

## 결과/범위
사용자 사진의 검은 굽은 줄기·비대칭 가지·작은 분홍 꽃을 참고한 투명 이미지 `plum-tree-v1.png`를 제작했다. 외부 나무4개만 기존 식재 위치에 2.5D 카드로 교체했고, 기존 실내 나무·건물·입장/전시 경로는 유지했다. 데스크톱 외관에서 꽃과 가지가 구분됨을 전후 캡처로 확인했다. 한 장의 투명 이미지이므로 측면에서 평면이 드러날 수 있다. 기존 모바일 입구 중심 구도에서는 외부 꽃나무가 화면 밖에 있다.

## 레이어 계약
새 `courtyard-trees`10파라미터: 보이기/불투명도/이미지/높이/가지 폭/뿌리 가로 기준/하단 여백/밝기/색조/방향. 앱 전체10레이어91파라미터. 실제 renderer의 material/geometry/transform/map 값도 QA에서 대조한다. 네 식재 좌표·원래 높이 비율·화단 높이·초기 외관을 향한 정적 방향·silhouette alpha 기준·외벽 바깥 clipping은 물리 배치/접지/그림자 캐시를 위한 fixed이며 manifest에 이유를 기록했다.

## Check에서 발견하고 수정한 사항
- 낮은 opacity에서 RGBADepthPacking shader가 opacity를 alpha에 곱하지 않았다. custom depth shader에 uniform을 곱해 색상/그림자의 외곽 기준을 맞췄다. shader hook과 실제 uniform 값도 검사한다.
- 외부 카드의 가지가 벽 안으로 뻗어 홀에 분홍 줄무늬가 보였다. x=±9.12m 바깥으로 color/shadow clipping을 적용하고 실내 캡처에서 제거됐음을 확인했다. 좌/우의 depth material을 분리해 clipping cache가 반대쪽 평면을 재사용하지 않게 했다.
- 최초 나무 이미지와 기본 이미지가 모두 실패하면 전시관 초기화가 중단될 수 있었다. 투명 DataTexture로 나무만 숨긴 상태에서 전시관을 열고, 이후 정상 이미지 변경 시 복구한다. 교체 이미지가 실패하면 이전 정상 이미지를 유지하며 뒤늦게 끝난 요청은 버린다.

## 검증/기억
검증 정본은 [QA-spatial](../../projects/jooho-lab/QA-spatial.md), 캡처/JSON은 `projects/jooho-lab/art/gallery-plum-trees/`. Blender4.5 재베이크 모델4,247,256B, route110,110 samples, layer lint0. 전체 브라우저 QA는 세 화면에서 설정 probe/입장·복귀/키보드·터치 입력/빈 검색/전환 취소/동작 줄이기/기존 POTATO 반응을 검사한다. 최초 나무 PNG 전체 요청 abort → 전시관 입장 → 다른 이미지로 복구도 별도 PASS.

bkit Plan → Design → Do → 읽기 전용 설계 대조 Check → 발견한 세 결함 수정 Act를 사용했다. 프롬프트/참고 사진/생성본은 [중앙 카드26](../../prompts/jooho-lab.md#26--plum-tree-v1--사진-참고-분홍-꽃나무)에 기록했다. 외부 패턴 카드 적용은 해당 없음. 배포·원격 프롬프트 보관함 게시·실제 모바일/Safari/Firefox·Node24 검증은 범위 밖이다.

재사용 조건: 걷는 3D 건물 앞의 장식 이미지는 alpha와 그림자 기준뿐 아니라 카드가 건물 내부를 관통하는지도 실내 캡처로 확인한다. alpha cutout의 낮은 opacity는 CPU material 숫자만 보지 말고 실제 depth shader 경로를 대조한다. 좌/우 clipping이 다르면 custom depth material도 분리한다.
