# 레이어 설정 시스템 (2026-09-23)

설계: [`docs/11-레이어-설정-시스템-설계.md`](../../docs/11-레이어-설정-시스템-설계.md) · 기계 판독본: [`layer-system-2026-09-23.plan.json`](layer-system-2026-09-23.plan.json)
상태: **설계 완료, 실행 대기.** L4(potato)는 다른 세션의 potato-designer 미커밋 작업이 커밋된 뒤 시작.

요청: 모든 인터랙티브를 레이어로 나누고 레이어마다 설정으로 전부 바꿀 수 있게. 장면·진행 포함. potato-designer에 이 기능이 빠진 것이 계기.

## 참고 자료 · 적용 원칙 · 적용하지 않은 것 (AGENTS.md 3항)

| 참고 | 가져온 것 | 적용하지 않은 것과 이유 |
|---|---|---|
| docs/03 §3-1~3-3, §7 규칙 7 | 스키마가 곧 편집 폼, 슬라이더 우선, 출처 배지, 조용한 소실 금지, 글꼴은 킷 목록에서만 | zod `config-schema`: 정적 앱 둘이 빌드가 없어 무의존 JS로 대체(D2). 셀렉터 오버라이드·지문 자동 치유: 레이어를 코드가 선언하므로 불필요 |
| docs/03 §0-4 추출 트리거 | 두 번째 소비자 규칙 → 네 앱이 소비자라 추출 충족 | — |
| docs/09 D4·D5·D6·§5-2 | 편집기 동적 import, 초안/게시 분리, 로컬 어댑터, 오버레이 셸 | 허브 R2 어댑터는 L8b로 미룸(보안·승인) |
| docs/10 potato 교훈 | 정지 ≠ 장면 초기화(host.pause 통일), localStorage 예외 처리, ID 기반 연결 | — |
| dawn-store theme.json | 요소별 섹션 + desktop/mobile = 레이어 모델의 원형 | — |
| jooho-lab content-schema | clean 함수로 경계값 보정, 소유자 전용 ETag 저장 | 문구·작품 목록은 레이어가 아님(D1) — 기존 편집기에 남김 |

## 노드

| id | 작업 | domain | D1 | D2 | D3 | D4 | 합 | tier | agent | claude | codex |
|---|---|---|---|---|---|---|---|---|---|---|---|
| N0 | 설계 ✅ | general | 2 | 2 | 0 | 2 | 6 | **powerful** | main | opus | gpt-5.6-sol |
| L1 | layer-kit 코어 | frontend | 1 | 1 | 1 | 1 | 4 | balanced | codex | sonnet | gpt-5.6-terra |
| L2 | Node 도구 (build·apply·lint·vendor·init) | general | 1 | 1 | 1 | 1 | 4 | balanced | codex | sonnet | gpt-5.6-terra |
| L3 | 설정 패널 | frontend | 1 | 1 | 0 | 2 | 4 | balanced | codex | sonnet | gpt-5.6-terra |
| L4 | potato 레이어화 | frontend | 1 | 1 | 1 | 1 | 4 | balanced | codex | sonnet | gpt-5.6-terra |
| L5 | layer-probe + check·CI | qa | 1 | 1 | 1 | 1 | 4 | balanced | bkit:qa-lead | sonnet | gpt-5.6-terra |
| L6 | day-walk 레이어화 | frontend | 1 | 1 | 1 | 1 | 4 | balanced | codex | sonnet | gpt-5.6-terra |
| L7 | dawn-store 레이어화 + 이관 | frontend | 1 | 2 | 1 | 2 | 6 | **powerful** | codex | opus | gpt-5.6-sol |
| L8a | jooho-lab 레이어화 | frontend | 1 | 1 | 1 | 1 | 4 | balanced | codex | sonnet | gpt-5.6-terra |
| L8b | 허브 게시 API + R2 이관 | security | 1 | 2 | 2 | 2 | 7 | **powerful** · 승인 필요 | codex | opus | gpt-5.6-sol |
| L9 | 통합 검증·최종 리뷰 | review | 1 | 2 | 0 | 2 | 5 | **powerful** | main | opus | gpt-5.6-sol |

의존: N0 → L1 → (L2, L3) → L4 → (L5, L6, L7, L8a); L8a → L8b; (L5, L6, L7, L8b) → L9

## 게이트
- G1 완전성 **PASS**
- G2 오버라이드 **PASS**: 아키텍처(N0), 데이터 마이그레이션(L7), 보안(L8b), 최종 리뷰(L9)가 모두 powerful이다.
- G3 클램프 **PASS**: security floor(powerful) 충족, frontend·qa·review floor(balanced) 충족, ceiling 위반 없음.
- G4 비용 **PASS**: powerful 4/11(36%). 네 노드 모두 하드 오버라이드라 강등할 수 있는 노드가 없다.
- G5 안전 **PASS**: L8b(D3=2, 운영 R2)에 `requires_approval: true`를 붙였다. 배포 노드는 없다.

## 레이어 계약 (이 플랜 자체)
설계 단계라 레이어 추가는 없다. L4 이후 노드는 각자 docs/11 §8-3의 "레이어 계약" 항목을 결과 기록에 남긴다. 기록할 것은 추가·변경한 레이어와 파라미터, 고정값과 이유, lint·probe 결과다.
