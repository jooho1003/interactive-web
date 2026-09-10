# 인터랙티브 웹 양산 모노레포 — 실행 플랜 (2026-09-10, 2026-09-11 개정)

요청: `docs/03-모노레포-설계.md` §8 순서대로 모노레포를 구축한다. 베이스 A(포탈 스페이스)·B(분기형 비디오) 2개 앱과 복제 제너레이터, 에셋 파이프라인, 첫 배포까지.
저장소: `D:/바이브코딩/interactive-web` (github `jooho1003/interactive-web`)
2026-09-11 개정: **편집 툴바**(`inline-editor`, 03 §3-3) 3노드 추가 — N16·N17·N18. 게이트 재통과.
기계 판독본: [`interactive-web-monorepo-2026-09-10.plan.json`](interactive-web-monorepo-2026-09-10.plan.json)

## 범위 밖 (후속 플랜)
flow-editor(Connect Idea형 에디터) · integrations(Notion·GCal·이메일·YouTube·지갑) · apps/world-game · apps/platform-site · apps/visual-routine · 가우시안 스플랫 렌더러

## 핵심 설계 (03 문서에서 확정된 것)
- **설정은 전부 JSON, UI는 JSON을 편집하는 폼.** 스키마(zod)가 관리자 폼·API 검증·문서의 단일 원천.
- **앱은 조립만.** 3D/비디오 로직은 `three-kit`/`video-kit`. 앱 디렉터리에 로직 금지.
- **desktop/mobile 두 벌 기본.** `responsive()` 없는 UI 설정은 반려.
- **폴백 없는 입력 금지.** 카메라 → 마우스, 영상 없음(`available:false`) → 그래프는 동작.
- **어드민은 클라이언트와의 소통 레이어.** 납품용은 `ADMIN_MODE=auth` 강제. **인앱 편집 툴바도 같은 게이트** — 게이트가 둘이면 하나는 열린 채로 남는다(DYW 사례).
- **고치는 순서는 툴바 → 관리자 폼 → 프롬프트.** 화면에 보이는 값은 툴바로 잡고, 안 보이는 값만 폼으로 간다 (04 §4-3).
- **툴바에는 화면에 보이는 것만.** 전체 설정을 툴바에 넣으면 `core-admin`과 같아지고 존재 이유(탐색 비용 0)가 사라진다. 툴바는 기능 부족이 아니라 **귀찮음** 때문에 생긴 물건이다 (전사 02:279).
- **수치는 슬라이더가 기본.** 시안 맞추기는 값을 아는 게 아니라 보면서 맞추는 일이다 (전사 03:40).
- **클라이언트 최소 집합은 멘트·글씨 크기·대략적 디자인 셋** (전사 03:22). 툴바 MVP 범위.
- **오버라이드는 빚이다.** 스키마 밖 수정은 임시 허용. 반복되면 스키마로 승격하고, 고아가 생기면 빌드를 세운다.
- **툴 완성 기준**: 앱 안에서 에셋 업로드·분기 편집까지 되어 바이브 코딩 없이 다음 작품이 나오는가.

## 모듈
| 모듈 | 노드 | 내용 |
|---|---|---|
| M0 기반 | N1–N5, N15–N18 | 아키텍처·뼈대 · 스키마 · API 서버+스토리지+동기화 · 관리자 셸 · UI · 인증 가드 · **편집 툴바** |
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
| N15 | 관리자·툴바 인증 가드 + 편집 입력 새니타이즈 | security | 1 | 1 | 1 | 2 | 5 | **powerful** (floor) | bkit:security-architect | opus | gpt-5.6-sol |
| N16 | inline-editor 코어 (선택·바인딩·자동치유) | frontend | 1 | 1 | 1 | 1 | 4 | balanced | bkit:frontend-architect | sonnet | gpt-5.6-terra |
| N17 | inline-editor 툴바 UI (텍스트·폰트·색·이미지·핫스팟) | frontend | 0 | 1 | 0 | 1 | 2 | balanced | bkit:frontend-architect | sonnet | gpt-5.6-terra |
| N18 | 오버라이드 거버넌스 (목록·고아·승격) | frontend | 1 | 1 | 1 | 1 | 4 | balanced | bkit:frontend-architect | sonnet | gpt-5.6-terra |

Codex 선택 근거: balanced 노드는 전부 D2≥1(다중 파일 쓰기)이라 `terra`.

## 의존 관계
```
N1 ─┬─ N2 ─┬─ N3 ──┬─ N16 ─┬─ N17 ──────┐
    │      │       │       ├─ N18 ──────┤
    │      │       │       └─ N15 ──────┤
    │      ├─ N4 ──┼─ N8 ── N13 ────────┼─ N14
    ├─ N5 ─┘       │   ▲                │
    ├─ N6 ─────────┘   │                │
    ├─ N7 ─────────────┘                │
    ├─ N9 ──────── N10 ── N11 ──────────┤
    └─ N12 ─────────────────────────────┘
```
- 크리티컬 패스: N1 → N2 → N3/N4(+N5) → N6/N7 → N8 → N13 → N14 (툴바 레인은 크리티컬 패스 밖)
- 병렬 레인: N6·N7·N9·N12는 N1·N2 직후 동시 진행. N10은 N8과 병렬.
- **툴바 레인**: N16(N3·N4·N5 후) → N17·N18·N15 3갈래 병렬. M1/M2 앱 작업과 동시 진행 가능 — 툴바는 폼과 같은 저장 경로를 쓰므로 앱이 늘어난 뒤 붙여도 데이터가 어긋나지 않는다.
- N11은 N8·N10 완성본에서 템플릿을 뽑으므로 두 앱 뒤.

## 산출물 (요약)
| 노드 | 경로 |
|---|---|
| N1 | `package.json` `pnpm-workspace.yaml` `turbo.json` `tsconfig.base.json` `packages/*/package.json` |
| N2 | `packages/config-schema/src/*` + 02 문서 실응답 fixture 스냅샷 테스트 |
| N3 | `packages/api-server` `packages/storage` `packages/sync` |
| N4 | `packages/core-admin` (`SchemaForm` `DesignCheck` `PreviewFrame` `AppInfoSection` `defineApp`) — QuickEdit는 N16·N17로 이관 |
| N5 | `packages/ui` |
| N6 | `packages/three-kit` |
| N7 | `packages/tracking` |
| N8 | `apps/portal-space` + 시드(SPACE 1~3, 샘플 GLB 3개) |
| N9 | `packages/video-kit` + 그래프 엔진 테스트 |
| N10 | `apps/branching-movie` + 시드(5노드, 플레이스홀더 영상, 2개 국어 자막) |
| N11 | `tools/new-app` `templates/{portal-space,branching-movie}` |
| N12 | `tools/asset-pipeline/{heic2jpg,slice_grid,glb_pack,video_prep}.py` |
| N13 | `tools/deploy` `.replit` `packages/storage/src/replit.ts` `docs/07-배포-절차.md` |
| N14 | `tools/ci/budget-check.ts` `tools/ci/overrides-check.ts` `tools/ci/editable-coverage.test.ts` `docs/08-검증-결과.md` + 03·04·05 갱신 |
| N15 | `packages/api-server/src/auth/*` `packages/core-admin/src/AuthGate.tsx` `packages/inline-editor/src/{guard,sanitize}.ts` |
| N16 | `packages/inline-editor/src/{EditableRoot,Editable,resolveTarget,fingerprint,heal,saveQueue}` + `test/heal.spec.ts` |
| N17 | `packages/inline-editor/src/toolbar/*` (`Toolbar` `SourceBadge` `TextPanel` `ColorPanel` `FontPanel` `ImagePanel` `HotspotPanel` `BoxPanel` `ViewportToggle` `uiKit`) |
| N18 | `packages/core-admin/src/overrides/*` (`OverridesTab` `OrphanBanner` `PromoteDialog` `suggestFieldPath` `emitSnippet`) |

## 게이트 판정 (2026-09-11 재실행)
- **G1 완전성: PASS** — 18개 노드 전부 domain·4축·tier·agent·claude·codex 채움. 신규 N16·N17·N18 포함.
- **G2 오버라이드: PASS** — 아키텍처(N1)·최종 리뷰(N14)는 self/powerful. 인증 설계(N15)는 powerful. 배포(N13)는 D3=2로 승인 부착. **툴바의 보안 부분(편집 모드 가드·새니타이즈·CSS 화이트리스트)은 N16에서 떼어 N15로 흡수** — 재배정 이력 3 참조.
- **G3 클램프: PASS** — frontend floor(balanced): N5·N17이 2점이나 balanced로 클램프. mechanical ceiling(balanced): N12=2 OK. security floor(powerful): N15 OK. infra: N13 powerful ≤ ceiling. ceiling 위반 없음.
- **G4 비용: PASS** — powerful 4/18 = **22.2%** ≤ 30% (기존 26.7%에서 하락). 근거는 이전과 동일한 4개: N1 아키텍처 / N13 외부 배포 D3=2 / N14 최종 리뷰 / N15 security floor. 신규 3노드는 03 §3-3이 설계를 확정해 D1이 0~1이므로 전부 balanced.
- **G5 안전: PASS** — D3=2는 여전히 N13 하나. 신규 노드에 D3=2 없음(툴바 저장은 버전 append라 되돌릴 수 있다). `requires_approval: true`는 N13만.

**판정: PASS**

## 재배정 이력
1. 1차에서 관리자 인증을 N3·N4 안에 넣었음 → 보안·인증 설계가 balanced에 들어가 **G2 위반** → **N15로 분리**, security/powerful. N3·N4에는 auth 슬롯 인터페이스만 남김.
2. 1차 N11(제너레이터)을 5점 powerful로 산정 → README 기준("git으로 되돌리면 D3=0")으로 재채점 **0/2/0/1 = 3 balanced**. D2는 apps·templates·tools 경계를 실제로 넘으므로 2 유지.
3. **2026-09-11 툴바 1차**: N18(오버라이드 거버넌스)에 core-admin 탭 + inline-editor 데이터 + tools/ci 게이트를 다 넣어 D2=2 → **5점 powerful**로 산정. ceiling 위반은 아니지만 "한 노드는 한 도메인·한 티어" 원칙으로 재분해 — CI 임계 게이트를 N14로 넘기고 범위를 core-admin 패키지 내부로 좁혀 **1/1/1/1 = 4 balanced**.
4. **2026-09-11 툴바 2차**: 편집 모드 진입 가드·`contentEditable` 새니타이즈·오버라이드 CSS 속성 화이트리스트를 N16 안에 두었음 → 보안 설계가 balanced 노드에 들어가 **G2 위반**. 신규 노드를 만들지 않고 **N15 범위를 확장해 흡수**(N15는 이미 security/powerful), N15에 `N16` 의존 추가.

## 실행 전 확인 사항 (N1에서 처리)
- `pnpm` 설치 여부 미확인 (node v24.18.0은 있음). 없으면 `corepack enable`.
- 샘플 GLB는 공개 도메인 로우폴리로. 레퍼런스 사이트의 GLB를 내려받지 않는다.
- Replit CLI·계정 상태는 N13 착수 시 확인. 미설정이면 N13은 스크립트 작성까지만 하고 배포는 보류.
- 이 플랜은 설계 문서(03)를 계약으로 삼는다. 구현 중 03과 다른 결정이 필요하면 **문서를 먼저 고치고** 노드를 재채점한다.
- 첫 작품 `projects/dawn-store`는 SPEC이 1단계에서 관리자·툴바를 금지한다(`SPEC.md` §11-8). 이 플랜의 N16–N18은 **모노레포 패키지 층**이며 dawn-store 1단계에 들어가지 않는다. dawn-store에는 `data-eid` 안정 ID만 미리 붙여 2단계 툴바가 셀렉터에 의존하지 않게 한다.
- N16 착수 전에 03 §3-3-2의 두 저장 경로가 N3에 실제로 뚫려 있는지 확인한다(`GET/PUT /api/overrides`). 없으면 N16이 오버라이드를 로컬에만 쌓는다.
