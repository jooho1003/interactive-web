# Gallery natural refinement · Report

2026-10-05 · 사용자 승인1·2 완료 · bkit Plan/Design/Do/Analyze/Act

실제 거리 비례 이동과 가림막을 이용한 페이지 전환을 적용했다. 작업실/외관에서는 문 통과·접근 경로를 유지하고, 재선택/뒤로/초기화/동작 줄이기는 최신 상태로 복구한다. 큰 목재판과 넓은 선반을 얇은 액자·종이·작은 선반으로 바꾸고 조명/AO를 다시 구웠다. 새 설정9개를 포함해7레이어/66파라미터다.

데스크톱204/390px205/320px205 전체 회귀PASS, 각66/66 설정probe·JavaScript 오류0. GLB4,631,904B·110,110 안전 경로 샘플·root check/app build/보관함 최신성 통과. 세 화면의 실제 캡처와 이전 모델을 보존했다. [검증/제약 상세](../../projects/jooho-lab/QA-spatial.md), [설계 대조](../03-analysis/gallery-natural-refinement.analysis.md).

학습 기록: 화면 선택과 실제 전시 페이지를 분리하고, 구조 변경과 baked 조명을 함께 재생성한다. 검수에서 작업실 페이지 변경·fade-in 중단 경로를 추가했고, Windows headless가 SwiftShader를 쓸 때는 시간 기준을 바꾸지 않고 실제 GPU 환경을 확인한다. 생성 절차는 prompts 카드24, 외부 참고 사용 이력은 references에 반영했다. 캐릭터 반응3/운영 배포/원격 보관함 게시/실제 휴대폰 FPS는 수행하지 않았다.
