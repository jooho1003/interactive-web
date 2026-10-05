# 전시관 공간 레이어 편집 모드

2026-10-05 · 사용자 승인 범위: 우측 패널, 화면 선택·드래그, 명시적 저장.

## 참고 및 적용

- docs/00, docs/10, docs/11, docs/14, JOOHO LAB README·QA: 기존 layerHost와 브라우저 저장 형식 재사용. 실제 3D 카메라 공간이므로 Three.js ray/평면 교차로 나무 위치를 계산한다. 새 에셋·공용 패키지·서버 게시 기능은 추가하지 않는다.
- `bychudy`: 선택 후 텍스트 패널을 여는 조작만 참고. OS 외형과 마우스 전용 닫기는 제외. editor의 panelWidth/색과 Escape 닫기로 반영.
- `annamills`: 직접 끌어 위치를 바꾸는 피드백만 참고. 원작 이미지·브랜드·키보드 없는 조작은 제외. 레이어 positionX/Y 및 나무 x/z, 선택 테두리·좌표 입력·방향키로 반영.

## 순서와 성공 조건

1. 기존 설정에 우측 편집 패널과 드래프트/저장/되돌리기를 연결 → 저장 전 localStorage 불변, 저장 후 새로고침 유지.
2. 선택과 위치 드래그 연결 → 나무는 바닥 평면, POTATO는 작품 평면, DOM은 화면 픽셀. 카메라·탐색과 충돌하지 않고 Escape/pointercancel이 끌기 취소.
3. 데스크톱·모바일 실측 및 lint/probe → 건물 침범 방지, 저장 실패 안내, 숨긴 레이어 복구, 기존 전시 이동 확인. QA와 README에 검증/미확인 구분.

## 레이어 계약

- 앞/뒤 꽃나무: 기존 x/z 재사용, 안전 경계 유지.
- POTATO 캐릭터/그림자: positionX/Y(m), 기존 포인터 반응 수치와 분리.
- stage/landscape/intro/detail/rail/controls/shell: positionX/Y(px). CSS translate로 기존 앵커/transform 보존.
- editor: 보이기·불투명도·패널 너비·배경색·글자색·선택색. 편집 열기·복구 버튼은 고정 접근성 장치로 명시.
- 목록과 선택 상태는 콘텐츠/편집 상태이며 시각 레이어가 아님. 카메라 입력 잠금·편집 임시 화각·이동 평면·최소 클릭 영역·z-index는 구조 고정값으로 이유 기록.
- lint/probe 실제 결과는 Analysis에 기록한다.
