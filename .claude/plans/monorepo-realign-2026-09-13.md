# 모노레포 현실 정렬 + jooho-lab 설정 정리 (2026-09-13)

요청: jooho-lab 설정 구성 점검, 양산용 모노레포 설계 검토·수정.
기계 판독본: [`monorepo-realign-2026-09-13.plan.json`](monorepo-realign-2026-09-13.plan.json)

## 진단
- `docs/03`의 pnpm/turbo·`apps/`·`packages/` 12개는 하나도 만들어지지 않았다. 실제는 독립 npm 프로젝트 2개(`projects/dawn-store/app`, `projects/jooho-lab`).
- 배포는 문서의 Replit이 아니라 OpenAI Sites(Worker + R2)로 나갔다.
- jooho-lab은 "작품"이 아니라 작품을 모아 보여주는 **허브**인데, 설계에 허브 역할이 없다. 그래서 작품→허브 연결이 파일 복사 스크립트로 즉흥 처리됐다.
- jooho-lab은 `dist/`를 원본으로 쓰고 `.gitignore` 예외로 살려 두었다. Sites 체크아웃은 `public/`을 쓴다 — 두 벌 구조.
- 작품 id가 `projects.js`와 `content-schema.js` 두 곳에 있다. 한쪽만 고치면 저장된 편집이 조용히 버려진다.
- 이름 drift: 폴더 `jooho-lab` / 패키지 `jooho-museum` / README `JOOHO Village`.

## 노드
| id | 작업 | domain | D1 | D2 | D3 | D4 | 합 | tier | agent | claude | codex |
|---|---|---|---|---|---|---|---|---|---|---|---|
| N1 | 설계 개정 | general | 1 | 2 | 0 | 2 | 5 | **powerful** | main | opus | gpt-5.6-sol |
| N2 | pnpm 워크스페이스 + 락 이관 + CI | general | 0 | 2 | 1 | 1 | 4 | balanced | worker | sonnet | gpt-5.6-terra |
| N3 | jooho-lab dist→public, 경로·이름 | mechanical | 0 | 1 | 1 | 0 | 2 | balanced | worker | sonnet | gpt-5.6-terra |
| N4 | 작품 레지스트리 단일 원천 | general | 0 | 1 | 1 | 1 | 3 | balanced | worker | sonnet | gpt-5.6-terra |
| N5 | 잡파일 정리 | mechanical | 0 | 0 | 0 | 0 | 0 | fast | worker | haiku | gpt-5.6-luna |
| N6 | 통합 검증 + 최종 리뷰 | review | 0 | 2 | 0 | 2 | 4 | **powerful** | main | opus | gpt-5.6-sol |

의존: N1 → N2, N1 → N3 → N4; N2·N4·N5 → N6

## 게이트
- G1 완전성: PASS — 전 노드 필드 채움
- G2 오버라이드: PASS — 아키텍처(N1)·최종 리뷰(N6) powerful, 직접 수행
- G3 클램프: PASS — mechanical 노드 ceiling(balanced) 이내
- G4 비용: PASS — powerful 2/6(33%). 근거: N1 아키텍처, N6 최종 리뷰 — 둘 다 하드 오버라이드
- G5 안전: PASS — D3=2 노드 없음. 배포·보안 변경은 범위 밖

## 실행 결과 (N6)
- HEAD 소스를 새 워크스페이스로 깨끗한 워크트리에서 검증: `pnpm install --frozen-lockfile` 성공, `pnpm check` — dawn-store 테스트 fail 0·그래프·에셋·빌드·예산 PASS, jooho-lab validate PASS.
- 작업 트리의 dawn-store `src/` 미커밋 변경(`customization.ts` 등)은 이 플랜 밖 동시 작업이며 TS18046으로 빌드가 깨진 상태.

## 범위 밖
- 서버 소유자 이메일 allowlist 환경변수화 (보안 노드 — 호스팅 env 지원 확인 후)
- turbo 도입 (첫 공용 패키지가 생길 때)
- 배포
