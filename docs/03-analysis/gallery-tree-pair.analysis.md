# 꽃나무 두 그루 · Check/Act

2026-10-05 · [Plan/Design](../01-plan/features/gallery-tree-pair.plan.md)

사용자가 확인한 관통과 반복 형태를 수정했다. 두 개의 독립 PNG/두 나무/두 동적 화단을 적용했다. 앞은 낮고 넓은 굽은 줄기, 뒤는 좁고 긴 줄기이며 건물/카메라/동선은 유지한다.

shader clipping만으로 가지를 자르던 방식은 실제 카드가 건물과 겹치는 문제를 남겼다. 이번에는 회전/크기/뿌리/이미지 비율이 적용된 실제4정점의 전체 minX와 화단 가장자리를 x10.2m 바깥으로 보정한다. 경계는 지붕/보까지 포함한9.8m+.4m 안전 간격이다. 기본 앞/뒤 minX10.712489/10.667639m. Box3의 오래된 geometry.boundingBox 캐시 결함은 bbox갱신+정밀 실제 정점 계산으로 수정했다.

레이어 계약:앞/뒤13파라미터씩, 전체11레이어107파라미터. lint0, 세 화면107/107probe 및 실제 renderer·안전 보정·화단 위치 검사 PASS. 양쪽 극단 뿌리/최대 크기·폭/최대 회전/안쪽 x 조합8개 PASS. 화단 opacity0에서 본체/그림자도 숨긴다.

bkit Plan→Design→Do→읽기 전용 Check→Act 사용. 최종 desktop321/mobile322/narrow322PASS, JS오류0. 최초 두 이미지 전체 실패/입장/복구 targetedPASS, 앱check/build/rootcheckPASS. Blender4.5 모델4,219,684B, route110,110samples. 실제 외관/데스크톱과320px 홀 캡처를 열어 확인했다. 자세한 결과/미검증 범위는 [QA-spatial](../../projects/jooho-lab/QA-spatial.md), 캡처/JSON은 art/gallery-tree-pair다.

프롬프트 원문/참조/생성 원본은 중앙 prompts 카드27/28에 기록했다. 외부 패턴 카드는 해당 없음. 원격 게시/운영 배포는 하지 않았다. 2.5D 이미지이므로 자유 회전 모델은 아니며 모바일 기존 구도는 입구 중심이다.

재사용: 물체 관통 금지는 실제 geometry/지붕 포함 경계를 사용해 검증한다. root 기준을 변경하면 boundingBox를 갱신하고 inspect가 실제 정점을 측정하게 한다. 기본 한 구도의 캡처만으로 모든 설정이 안전하다고 단정하지 않는다.


후속 동시 노출 조정:현재 굽은 나무(11.8,-2),곧은 나무(13,0). x/z 네 기본값만 수정해 데스크톱 외관에서 두 줄기·두 화단을 동시에 확인했다. 실제minX=[10.212433, 11.168627]m. desktop321PASS/107probe,세 화면 안전·입장/복귀 및 앱check/buildPASS. 새 에셋/카메라 변경 없음. 자세한 범위는 QA의 후속 항목을 따른다.
