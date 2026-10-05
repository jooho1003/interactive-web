# Gallery natural refinement · Check

2026-10-05 · [Plan](../01-plan/features/gallery-natural-refinement.plan.md) · [Design](../02-design/features/gallery-natural-refinement.design.md)

| 요구 | 구현/검증 |
|---|---|
| 거리 비례 이동 | 실제 eye 거리/2.15×slideSeconds, 최소/최대 clamp. 0거리·역방향·중단·인접/복수 칸 단위 검사 통과 |
| 안전한 페이지 전환 | paintedPage와 선택을 분리하고 가림막 중앙에서 그림 교체. 작품 앞에서는 카메라도 교체, 작업실/외관에서는 기존 접근 경로 유지 |
| 중단/복구 | fade-out/fade-in 재선택·Escape/Home·결과 있는 검색/빈 검색·동작 줄이기·목록 전환 정지/재개 검사 |
| 가벼운 전시 구조 | 큰 목재판 제거, 종이·18mm 액자·얇은 선반, 그림z와 camera look 정본 공유 |
| 실제 조명/재질 | 종이 PBR 추가(총7), 7spot 조명/AO 재베이크, UV0/UV1 분리. GLB4,631,904B(<6MB) |
| 설정 계약 | 7레이어/66파라미터. 9개 신규 값은 속성/실제 재질 또는 시간에 연결. 물리 치수는 fixed 이유 기록 |

bkit analyze의 읽기 전용 설계 대조에서 작업실/입장 중 페이지 교체와 fade-in 중단 증거 부족을 찾았다. 첫 갭은 모든 페이지 변경을 가림막에 포함하되 기존 접근 경로를 이어가도록 수정했고, 둘째는 재선택·Escape/Home·결과가 남는 필터 검사를 추가했다. 시간 매개변수도 실제 transition duration/경과 시간으로 확인한다.

검증 결과 정본은 [QA-spatial](../../projects/jooho-lab/QA-spatial.md)과 `art/gallery-natural-refinement/*-qa.json`이다. 데스크톱204/모바일205/320px205항목 모두PASS, 세 화면66/66파라미터와 JavaScript 오류0. root check/app build/보관함 최신성 통과. 같은 뷰의 이전 목재판과 새 마감, 세 화면의 세로·가로·투명 작품 캡처를 직접 비교했다. 설계 대조의 두 갭은 구현/실행 증거로 해소했다.

검사 환경: Aside 실제 외관 화면 확인, 이후 렌더 지연으로 headless Playwright 전환. 기본 headless는 SwiftShader라 시간/짧은 fade-in 관찰이 불안정했고 설치된 Intel Arc D3D11로 다시 검사했다. 기존8.5초 입장 시간 기준을 낮추지 않았다. 짧은 단계 관찰은 rAF로 대기하며, 레이어 probe는 기존처럼 외관 상태에서 수행한다. 실제 휴대폰 GPU/FPS·운영 배포·원격 보관함 게시는 범위 밖/미검수다.
