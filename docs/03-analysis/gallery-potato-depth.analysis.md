# Gallery POTATO depth · Check / Report

2026-10-05 · bkit Plan → Design → Do → Analyze → Act · 일부 시범 완료

[Plan](../01-plan/features/gallery-potato-depth.plan.md)과 [Design](../02-design/features/gallery-potato-depth.design.md)에 따라 POTATO 하나에 기존 이미지 plane의 작은 변환과 별도 타원 그림자를 적용했다. 다른 작품/공간은 유지하고 enabled off로 원래 평면과 비교한다. 최대 각도/그림자/깊이는 설정에 있으며 contain 비율과 물리 좌표를 보존한다.

읽기 전용 대조에서 mouse→touch tap의 기울기 잔류를 발견해 실제 실패를 재현하고 pointerdown 초기화로 해결했다. 나머지 transform 복구/각도 제한/매니페스트 바인딩/compile/dispose 갭은 확인하지 않았다.

최종 실제 회귀228/229/229PASS, 세 화면81/81 설정 probe, 새15개 actual renderer probe, JavaScript 오류0. root check/app build와 references 최신성PASS. on/off·모바일 캡처를 직접 비교했다. 새 에셋이 없어 프롬프트 추가는 없다. [QA 상세와 한계](../../projects/jooho-lab/QA-spatial.md), `art/gallery-potato-depth`에 결과/캡처 보존. 운영 배포·실제 모바일GPU/FPS는 수행하지 않았다.
