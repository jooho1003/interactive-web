# 전시관 건물 외관 시범 · Plan

2026-10-05 · bkit Plan → Design → Do → Check → Act

## 목적과 범위
사용자가 원한 시범 대상은 건물/인테리어였다. 이전 POTATO 캐릭터 시범은 요청 대상과 달랐다. 이번에는 국립중앙박물관 외관에서 긴 석재 매스와 중앙의 큰 빈 공간을 참고해 **건물 외관만** 작게 변경한다. 실물에 가까운 석재 마감으로 시작하고 내부 전시 구성은 유지한다.

## 참고와 적용 원칙
docs/00·10·11·14, LAB README/QA와 기존 Blender 제작/재질 export를 확인했다. docs/14의 공간 내부 이동 예외에 따라 기존 실제3D를 유지한다. 한 장의 건물 이미지를 걷는 공간 대신 쓰면 시점 이동에 맞는 면이 없으므로 이번에는 적용하지 않는다. 공용 패키지/새 조작/실내 재배치는 필요 없다.

공식 건축 설명: https://www.museum.go.kr/MUSEUM/contents/M0804010000.do (2026-10-05 확인). 열린마당·수평 석재 형태만 참고하며 건물 규모/원작 사진/브랜드는 복제하지 않는다.

참고 레퍼런스: `drive-to-explore`의 bruno-simon(복귀/DOM 목록 유지 → stage/controls), `moodboard-canvas`의 annamills(원본 비율/작품 중심 소개 유지 → stage/rail). 운전·무드보드 편집·원작 시각물은 가져오지 않는다. 두 카드는 기존 기록을 재사용한다.

## 순서와 완료 기준
1. 양쪽 석재 매스·높은 연결 보·중앙 입구 구현 → 전후 외관 캡처로 형태 확인.
2. 초기 외부 카메라 프레이밍 조정 → 진입/복귀 경로가 석재와 충돌하지 않는지 검사.
3. GLB/조명/AO 재생성 → 모델6MB 이하, 7개 전시조명/분리UV 유지, 실제 브라우저 1440/390/320px 입력·상태·복귀/키보드/동작 줄이기·전체 probe와 앱 check/build 확인.

## 레이어 계약
변경 레이어는 기존 `stage` 건축 모델이다. 새 레이어/파라미터 없이 visible/opacity·surfaceTint/Relief/Roughness·occlusion·조명/반사·exposure·카메라 값을 재사용한다. 물리 석재 치수/창 분할·열린 입구 폭6m·외부 카메라 좌표는 재베이크/동선 검사가 필요한 구조값으로 manifest fixed에 이유를 적는다. 최종 lint/probe 결과는 분석/QA에 기록한다.

완료 결과: lint0, 세 화면 각각81/81 probe PASS. 브라우저228/229/229 PASS, 앱 check/build 및 root check PASS. [분석/완료 기록](../../03-analysis/gallery-museum-exterior.analysis.md).
