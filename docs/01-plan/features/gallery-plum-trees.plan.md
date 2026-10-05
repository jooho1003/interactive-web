# 사진 참고 꽃나무 시안 · Plan

2026-10-05 · JOOHO LAB · bkit Plan/Design/Do/Check/Act

## Executive Summary / Context
문제: 외부 나무가 단순한 줄기/초록 잎으로 보여 사용자 사진의 검은 굽은 줄기·분홍 잔꽃 분위기와 다르다. 해결: 사용자 사진을 형태/재질 참고로 새 투명 꽃나무 에셋을 만들고 외부4개 위치에2.5D 카드로 배치한다. WHO: 관람자/사용자. RISK: 투명 가장자리·평면 노출·하단 접지·그림자·실패한 이미지 교체. SUCCESS: 실제 외관 전후/입장·복귀/세 화면·레이어와 renderer 설정 검증. SCOPE: 외부 나무4개만; 건물/수면/실내 식물/동선 유지.

## 참고/적용
docs/00·10·11·14, LAB README/QA, 기존 나무·GLB·그림자/renderer·레이어 패널을 확인했다. 사진 `docs/참고/images.jpg`는 줄기/가지/꽃 참고로 사용한다. 담장·안내판·난간·원작 구도를 새 에셋에 넣지 않는다. docs/14의 이미지 중심 기본 방식을 외부 장식 나무에 적용하고 걷는 건물은 기존3D를 유지한다. 한 장의 나무를 자유 회전 가능한 모델이라고 표현하지 않는다.

외부 레퍼런스 패턴 색인 확인: 해당 없음(이번 변경은 새 상호작용 없이 사용자 사진을 바탕으로 한 나무 비주얼 교체). 이전 공간/복귀 구현은 재사용하며 새 공용 패키지는 필요 없다.

## 순서/검증
1. 투명 에셋 제작 → 이미지 직접 열어 검은 굽은 줄기·분홍 꽃/여백·바닥/담장/문구 없음 확인.
2. 기존 외부 olive만 Blender에서 제거·재베이크; 같은 위치에 새 카드 추가 → 외관 전후와 접지/입장/복귀 확인.
3. 설정/교체/실패 경로 연결 → 전체 lint/probe·새 설정 renderer 확인·세 화면 QA·모델 예산/앱 check/build. 최종 결과는 분석/QA에 기록한다.

## 레이어 계약
새 `courtyard-trees` 레이어10개: visible/opacity/image/height/spread/baseX/baseY/brightness/tint/yaw. DOM attr를 실제 카드의 material/map/geometry/transform에 연결한다. 이미지 실패 시 이전 정상 map을 유지한다. 외부4개 식재 좌표/높이 비율·화단 위 y=.255m·초기 외관을 향한 고정 yaw·alphaTest는 접지/카메라/그림자 성능을 위한 fixed로 선언한다. 뿌리의 이미지 가로 위치/하단 alpha 여백은 설정으로 보정한다. stage와 같은 scene 아래 카드가 있어 공간 전체 보이기/opacity도 적용된다. 이미지/그림자에는 별도 반복 모션 없음. 프롬프트 원문/참고/결과를 중앙 prompts 카드로 기록한다.

외벽 바깥 x=±9.12m clipping도 fixed에 추가한다. 색상/깊이 재질을 좌/우로 분리하며, 처음부터 에셋이 없는 경우에도 전시관이 열리도록 한다. lint0·91개 파라미터 probe와 실제 renderer 반응 검증 결과는 [분석](../../03-analysis/gallery-plum-trees.analysis.md)과 앱 QA에 기록한다.
