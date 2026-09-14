# Day Walk 릴리스 (2026-09-14)

기계 판독본: [`day-walk-release-2026-09-14.plan.json`](day-walk-release-2026-09-14.plan.json)

| id | 작업 | domain | D1 | D2 | D3 | D4 | 합 | tier | agent | claude | codex |
|---|---|---|---|---|---|---|---|---|---|---|---|
| R1 | 허브 등록 | general | 0 | 2 | 1 | 1 | 4 | balanced | codex | sonnet | gpt-5.6-terra |
| R2 | 리뷰 + main 머지 | review | 0 | 1 | 1 | 2 | 4 | **powerful** | main | opus | gpt-5.6-sol |
| R3 | 허브 비공개 재배포 | infra | 1 | 2 | 2 | 1 | 6 | **powerful** · 승인 필요 | codex | opus | gpt-5.6-sol |

## 게이트
- G1 PASS · G2 PASS(R2 최종 리뷰 powerful) · G3 PASS(infra floor balanced 충족) · G4 PASS — powerful 2/3: R2 하드 오버라이드, R3 배포(D3=2, 점수 6)라 강등 불가 · G5 PASS — R3 `requires_approval: true`, 사용자 "진행해줘"로 승인
## 결정
- 동네 파노라마는 집 6채가 그림에 박혀 있다. 7번째 작품은 목록 보기·상세 페이지에 나오고, 공간 보기는 그림에 집이 있는 작품만 둔다. 집 그림 추가는 범위 밖.
- 배포는 메인 작업 트리가 아니라 커밋된 main에서 만든다 — 메인 트리에 다른 세션의 미완성 dawn-store 변경이 있다.

## 실행 결과
- R1·R2: 허브 등록 커밋 후 main 머지 `d2ff418` (메인 트리의 다른 세션 미커밋 파일과 겹침 없음 확인).
- R3: 커밋된 main 스냅샷으로 OpenAI Sites 비공개(owner-only) 재배포 성공. 첫 실행이 push 중 10분 제한에 걸려 같은 Codex 세션을 재개해 완료. 임시 credential 파일 삭제 확인.
