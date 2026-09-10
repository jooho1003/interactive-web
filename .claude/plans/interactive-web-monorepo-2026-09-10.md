# 인터랙티브 웹 양산 모노레포 — 실행 플랜 (2026-09-10)

요청: `docs/03-모노레포-설계.md` §8 순서대로 모노레포를 구축한다. 베이스 A(포탈 스페이스)·B(분기형 비디오) 2개 앱과 복제 제너레이터, 에셋 파이프라인, 첫 배포까지.
저장소: `D:/바이브코딩/인터렉티브 웹` (github `jooho1003/interactive-web`)
기계 판독본: [`interactive-web-monorepo-2026-09-10.plan.json`](interactive-web-monorepo-2026-09-10.plan.json)

## 범위 밖 (후속 플랜)
flow-editor(Connect Idea형 에디터) · integrations(Notion·GCal·이메일·YouTube·지갑) · apps/world-game · apps/platform-site · apps/visual-routine · 가우시안 스플랫 렌더러

## 핵심 설계 (03 문서에서 확정된 것)
- **설정은 전부 JSON, UI는 JSON을 편집하는 폼.** 스키마(zod)가 관리자 폼·API 검증·문서의 단일 원천.
- **앱은 조립만.** 3D/비디오 로직은 `three-kit`/`video-kit`. 앱 디렉터리에 로직 금지.
- **desktop/mobile 두 벌 기본.** `responsive()` 없는 UI 설정은 반려.
- **폴백 없는 입력 금지.** 카메라 → 마우스, 영상 없음(`available:false`) → 그래프는 동작.
- **어드민은 클라이언트와의 소통 레이어.** 납품용은 `ADMIN_MODE=auth` 강제.
- **툴 완성 기준**: 앱 안에서 에셋 업로드·분기 편집까지 되어 바이브 코딩 없이 다음 작품이 나오는가.

## 모듈
| 모듈 | 노드 | 내용 |
|---|---|---|
| M0 기반 | N1–N5, N15 | 아키텍처·뼈대 · 스키마 · API 서버+스토리지+동기화 · 관리자 셸 · UI · 인증 가드 |
| M1 패밀리 A | N6–N8 | three-kit · tracking · portal-space 앱 |
| M2 패밀리 B | N9–N10 | video-kit · branching-movie 앱 |
| M3 양산 도구 | N11–N12 | new-app 제너레이터+템플릿 · 에셋 파이프라인 |
| M4 배포 | N13 | Replit 배포 스크립트 + 첫 배포 |
| M5 검증 | N14 | 통합 구동 · 성능 예산 · 문서 갱신 · 최종 리뷰 |

## 노드 배정
| id | 작업 | domain | D1 | D2 | D3 | D4 | 합 | tier | agent | claude | codex |
|---|---|---|---|---|---|---|---|---|---|---|---|
| N1 | 아키텍처 확정 + 모노레포 뼈대 | frontend | 2 | 2 | 1 | 2 | 7 | **powerful** | self | opus | gpt-5.6-sol |
| N2 | config-schema (API 응답 → zod) | general | 0 | 1 | 1 | 1 | 3 | balanced | worker | sonnet | gpt-5.6-terra |
| N3 | api-server + storage(local) + sync | general | 1 | 1 | 1 | 1 | 4 | balanced | worker | sonnet | gpt-5.6-terra |
| N4 | core-admin 스키마→폼 + 셸 + Design Check | frontend | 1 | 1 | 0 | 1 | 3 | balanced | bkit:frontend-architect | sonnet | gpt-5.6-terra |
| N5 | ui (shadcn 래핑·사운드·테마) | frontend | 0 | 1 | 0 | 1 | 2 | balanced (floor) | worker | sonnet | gpt-5.6-terra |
| N6 | three-kit | frontend | 1 | 1 | 0 | 1 | 3 | balanced | bkit:frontend-architect | sonnet | gpt-5.6-terra |
| N7 | tracking (페이스·오프-액시스·폴백) | frontend | 1 | 1 | 0 | 1 | 3 | balanced | bkit:frontend-architect | sonnet | gpt-5.6-terra |
| N8 | apps/portal-space 조립 | frontend | 0 | 2 | 1 | 1 | 4 | balanced | bkit:frontend-architect | sonnet | gpt-5.6-terra |
| N9 | video-kit | frontend | 1 | 1 | 0 | 1 | 3 | balanced | bkit:frontend-architect | sonnet | gpt-5.6-terra |
| N10 | apps/branching-movie 조립 | frontend | 0 | 2 | 1 | 1 | 4 | balanced | bkit:frontend-architect | sonnet | gpt-5.6-terra |
| N11 | tools/new-app + templates/ | general | 0 | 2 | 0 | 1 | 3 | balanced | worker | sonnet | gpt-5.6-terra |
| N12 | tools/asset-pipeline | mechanical | 0 | 1 | 0 | 1 | 2 | balanced | worker | sonnet | gpt-5.6-terra |
| N13 | Replit 배포 스크립트 + 첫 배포 | infra | 1 | 2 | 2 | 1 | 6 | **powerful** · 승인 필요 | bkit:infra-architect | opus | gpt-5.6-sol |
| N14 | 통합 검증 + 성능 예산 + 최종 리뷰 | review | 1 | 2 | 1 | 2 | 6 | **powerful** | self | opus | gpt-5.6-sol |
| N15 | 관리자 인증 가드 (ADMIN_MODE=auth) | security | 1 | 1 | 1 | 2 | 5 | **powerful** (floor) | bkit:security-architect | opus | gpt-5.6-sol |

Codex 선택 근거: balanced 노드는 전부 D2≥1(다중 파일 쓰기)이라 `terra`.

## 의존 관계
```
N1 ─┬─ N2 ─┬─ N3 ──┬─ N15 ──────────────┐
    │      │       │                    │
    │      ├─ N4 ──┼─ N8 ── N13 ────────┼─ N14
    ├─ N5 ─┘       │   ▲                │
    ├─ N6 ─────────┘   │                │
    ├─ N7 ─────────────┘                │
    ├─ N9 ──────── N10 ── N11 ──────────┤
    └─ N12 ─────────────────────────────┘
```
- 크리티컬 패스: N1 → N2 → N3/N4(+N5) → N6/N7 → N8 → N13 → N14
- 병렬 레인: N6·N7·N9·N12는 N1·N2 직후 동시 진행. N10은 N8과 병렬. N15는 N3·N4 후 N8과 병렬.
- N11은 N8·N10 완성본에서 템플릿을 뽑으므로 두 앱 뒤.

## 산출물 (요약)
| 노드 | 경로 |
|---|---|
| N1 | `package.json` `pnpm-workspace.yaml` `turbo.json` `tsconfig.base.json` `packages/*/package.json` |
| N2 | `packages/config-schema/src/*` + 02 문서 실응답 fixture 스냅샷 테스트 |
| N3 | `packages/api-server` `packages/storage` `packages/sync` |
| N4 | `packages/core-admin` (`SchemaForm` `DesignCheck` `PreviewFrame` `QuickEdit` `AppInfoSection` `defineApp`) |
| N5 | `packages/ui` |
| N6 | `packages/three-kit` |
| N7 | `packages/tracking` |
| N8 | `apps/portal-space` + 시드(SPACE 1~3, 샘플 GLB 3개) |
| N9 | `packages/video-kit` + 그래프 엔진 테스트 |
| N10 | `apps/branching-movie` + 시드(5노드, 플레이스홀더 영상, 2개 국어 자막) |
| N11 | `tools/new-app` `templates/{portal-space,branching-movie}` |
| N12 | `tools/asset-pipeline/{heic2jpg,slice_grid,glb_pack,video_prep}.py` |
| N13 | `tools/deploy` `.replit` `packages/storage/src/replit.ts` `docs/07-배포-절차.md` |
| N14 | `tools/ci/budget-check.ts` `docs/08-검증-결과.md` + 03·04·05 갱신 |
| N15 | `packages/api-server/src/auth/*` `packages/core-admin/src/AuthGate.tsx` |

## 게이트 판정
- **G1 완전성: PASS** — 15개 노드 전부 domain·4축·tier·agent·claude·codex 채움.
- **G2 오버라이드: PASS** — 아키텍처(N1)·최종 리뷰(N14)는 self/powerful. 인증 설계(N15)는 powerful. 배포(N13)는 D3=2로 승인 부착.
- **G3 클램프: PASS** — frontend floor(balanced): N5가 2점이나 balanced로 클램프. mechanical ceiling(balanced): N12=2 OK. security floor(powerful): N15 OK. infra: N13 powerful ≤ ceiling.
- **G4 비용: PASS** — powerful 4/15 = **26.7%** ≤ 30%. 근거: N1 아키텍처 / N13 외부 배포 D3=2 / N14 최종 리뷰 / N15 security floor.
- **G5 안전: PASS** — D3=2는 N13 하나. `requires_approval: true`. Replit 계정·DB·스토리지 생성과 push 전 사용자 확인, 자동 연쇄 금지.

## 재배정 이력
1. 1차에서 관리자 인증을 N3·N4 안에 넣었음 → 보안·인증 설계가 balanced에 들어가 **G2 위반** → **N15로 분리**, security/powerful. N3·N4에는 auth 슬롯 인터페이스만 남김.
2. 1차 N11(제너레이터)을 5점 powerful로 산정 → README 기준("git으로 되돌리면 D3=0")으로 재채점 **0/2/0/1 = 3 balanced**. D2는 apps·templates·tools 경계를 실제로 넘으므로 2 유지.

## 실행 전 확인 사항 (N1에서 처리)
- `pnpm` 설치 여부 미확인 (node v24.18.0은 있음). 없으면 `corepack enable`.
- 샘플 GLB는 공개 도메인 로우폴리로. 레퍼런스 사이트의 GLB를 내려받지 않는다.
- Replit CLI·계정 상태는 N13 착수 시 확인. 미설정이면 N13은 스크립트 작성까지만 하고 배포는 보류.
- 이 플랜은 설계 문서(03)를 계약으로 삼는다. 구현 중 03과 다른 결정이 필요하면 **문서를 먼저 고치고** 노드를 재채점한다.
