# 공간 레이어 편집 검증

2026-10-05 · bkit Plan → Design → Do → Check. 설계/계획은 같은 feature 이름의 문서 참조.

## 구현과 근거

새 `spatial-layer-editor.js`가 gallery 설정 분기에 연결됐다. village 설정은 기존 경로다. 기존 manifest/values/key를 유지하고 초안과 명시적 저장을 분리했다. 우측 패널, 실제 투영 테두리, 뿌리 기준 바닥 드래그, 작품 평면 드래그, DOM translate, 방향키·좌표 입력, 복구·JSON, 장면/화면 범위를 구현했다. 새 이미지나 프롬프트는 없다.

읽기 전용 리뷰에서 발견한 세 결함을 수정했다: POTATO 편집 장면과 앱 선택 상태 불일치(showProject callback), 한 나무/그림자 숨김이 전체 캔버스를 숨기는 문제(visible attr는 renderer 소유), Ctrl+S 입력 미반영 및 scope 읽기/쓰기 차이(검증·blur·실제 범위 전환). 공유 layer-kit 변경은 호스트 단위 회귀 테스트로 확인한다.

모바일 실제 터치 검수에서 위쪽 손잡이의 ray가 바닥을 만나지 않는 경우를 확인했다. 손잡이/화면 입력의 상대 이동을 실제 뿌리 투영점에 더해 평면 교차를 구하도록 수정했다. 작은 화면은 36% 미리보기/64% 패널, 범위 접기 및 선택 레이어 중심으로 표시한다. 1024/1100px POTATO는 설명을 임시 숨겨 선택/끌기를 확보했다. 모드 종료 시 기존 표시·화각을 복원한다.

## 검증

- 실제 브라우저 입력 검수 **53/53 PASS**, 페이지 JS 오류 0. 1440px 드래그·실제 위치·카메라 고정·미저장 상태·Escape 취소·한 단계 undo·개별 나무 숨김·독립 뒤 나무·DOM 픽셀 이동·방향키·Ctrl+S·리로드·저장본 복구·장면 override·POTATO/그림자·숨김/투명 편집창 복구·저장 실패/JSON을 확인했다.
- 390×844/360×740 실제 CDP 터치 드래그, 건물 안전, 저장·재로딩, 패널/미리보기 분리, 저장 버튼 노출, 가로 overflow 0 PASS. 1024/1100px POTATO 선택과 설명 겹침 해소를 캡처했다.
- `layer-kit probe`: 외관/작품 장면을 각각 실행해 해당 요소가 보이는 장면의 결과를 합쳤다. **131/131 PASS**. 한 장면에서 숨기는 intro/detail과 project에서 고정 top을 쓰는 controls.bottom을 무조건 통과했다고 기록하지 않았다. 원본 결과는 `art/gallery-layer-editor/layer-probe.json`.
- `pnpm check` 전체 PASS, 공유 layer-kit 9/9 단위 테스트 PASS, app build PASS. 기존 공간 harness desktop 345/mobile 346 PASS, JS오류 0. 빈 검색·이동/복귀·키보드·context loss 포함. 12레이어/131파라미터 lint 오류 0, 110,110 route samples/GLB 예산 PASS. 모바일 패널너비 파라미터를 고정 100%로 덮는 문제는 viewport 상한과 40px 필드 여유를 쓰도록 수정했고 모바일 harness에서 효과를 검증했다. Node22.16/Chromium D3D11에서 검수했고 권장Node24·실제 휴대폰은 미검증이다.

## 재사용 조건과 제한

visible을 별도 renderer attr에 연결한 3D 하위 레이어는 공용 canvas DOM을 숨기지 않아야 한다. 바닥 drag는 선택 대상의 뿌리 투영점을 기준으로 계산하고, 손잡이 위치가 하늘이어도 시작점이 유효해야 한다. 편집 값은 선택한 scope에서 읽고 시각 조작은 실제 우선 scope에 쓴다. 복구 버튼은 표현 레이어 밖에 둔다.

Windows Chromium D3D11 검수다. 실제 iOS/Android 기기·원격 게시·브라우저 간 동기화는 미검증/미포함. Aside로 진입을 확인했으나 screenshot CDP timeout 안내 후 Playwright로 시각 검수했다. bkit 점검의 읽기 전용 gallery_review 결과를 반영했다.
