# 박물관 외관 시안 · Check / Act / Report

2026-10-05 · [Plan](../01-plan/features/gallery-museum-exterior.plan.md) · [Design](../02-design/features/gallery-museum-exterior.design.md)

## 결과
외관만 작은 시범으로 변경했다. 높이6.9m의 양쪽 석재 매스·중앙6m 통로·상부 연결 보·수평창/줄눈으로 박물관의 건축 인상을 표현한다. 내부 전시 구성과 걷는 카메라는 유지한다. 국립중앙박물관의 실측 복제/사진 재사용은 하지 않았다.

## 설계 대조와 검증
읽기 전용 bkit Check 리뷰에서 새 외벽/보와 수동 orbit을 포함한 경로 충돌·레이어 계약 결함을 찾지 못했다. 새 GLB/UV/조명·예산은 앱 check가 검사했고110,110개 route sample에 외벽/보 여유 검사를 추가했다. 모델5,174,556B, PBR7종/7개 전시조명/분리UV PASS.

9레이어81파라미터 유지, lint0. 브라우저1440/390/320px 각각81/81 probe·desktop228/mobile229/narrow229 PASS, JavaScript 오류0. 앱 check/build, root pnpm check 및 보관함 최신성 PASS. 증거는 [QA-spatial](../../projects/jooho-lab/QA-spatial.md)와 `projects/jooho-lab/art/gallery-museum-exterior`에 있다.

## Act
처음 회귀의 외부 z=24 기대값은 이전 프레이밍을 고정한 테스트였고 새 카메라로 정상 복귀한 상태였다. canonical exterior.eye의 세 좌표를 비교하도록 고친 뒤 전체 회귀 PASS. Aside 캡처가 CDP timeout이어서 사전 고지 후 Intel Arc D3D11 Playwright로 캡처했다. 데스크톱 전후/모바일 외관/실내를 직접 열어 확인했다.

## 범위/재사용
이번은 외관 시안이며 인테리어 전체 스타일 변경은 하지 않았다. 세로 화면은 기존 중앙 입구 근경으로 양쪽 끝이 잘린다. 실제 휴대폰/다른 브라우저/FPS/Node24·저장 실패 재검사·배포/원격 게시 미실행. 제작 원문/재현은 prompts 카드25에 기록했고 이전 packed 원본/GLB와 캡처를 보존했다. 사용자가 원한 대상이 건물/인테리어였다는 교훈을 프로젝트 QA/README에 남겼다.
