# AGENTS.md — Codex 작업 규약

프로젝트: `day-walk` (하루 산책 · Day Walk)
당신의 역할: `SPEC.md`를 받아 `app/` 구현 전부와 테스트를 담당한다.

## 먼저 읽을 것
1. `SPEC.md` — 계약이다. 여기 없는 기능을 추가하지 않는다.
2. `app/package.json` — 의존성은 이미 정해져 있다. 추가·변경하지 않는다.
3. 참고 구현(읽기만): `../dawn-store/app/` — tsconfig 구성, `playwright.config.ts`, `scripts/check-budget.ts` 형식을 따른다.

## 작업 범위
- 쓰기는 `projects/day-walk/app/` 안에서만. 그 밖의 파일(루트 `package.json`, `pnpm-lock.yaml`, 다른 프로젝트, `SPEC.md`, 이 파일)은 수정하지 않는다.
- **커밋하지 않는다.** 단계 검증 결과는 최종 보고에 적는다. 커밋은 리뷰어가 한다.
- 네트워크 설치(`pnpm add`, `npm install`) 금지. 이미 설치돼 있다.

## 단계
| 단계 | 내용 | 통과 조건 |
|---|---|---|
| 1 | 스캐폴딩: `index.html`, `vite.config.ts`(`base: './'`), tsconfig 3종, `src/main.tsx`, `theme/tokens.css` | `pnpm run build`의 `tsc -b && vite build` 부분이 통과 |
| 2 | `schema/` + `domain/time.ts` + `domain/tasks.ts` + `store/storage.ts` | 단위 테스트 통과 |
| 3 | `domain/advisor.ts` + `domain/notifications.ts` | 단위 테스트 통과 (SPEC §12 단위 범위 전부) |
| 4 | 스토어·시계, 헤더·보드·목록·추가·정렬 | 수동: 할 일 추가·완료·새로고침 유지 |
| 5 | 타임라인: 깃발·드래그·키보드·경계 핸들·빠른 추가 | 수용 기준 4·5·6 |
| 6 | 씬: 하늘 보간·길·일정 집·캐릭터·새·말풍선 | 수용 기준 1·9·10 |
| 7 | 연출·대화상자: 파티클·CLEAR·폭죽·루틴·설정·확인·토스트·알림·효과음 | 수용 기준 2·7·8·11·13·14 |
| 8 | 모바일 레이아웃, 접근성, Playwright 전체, 예산 | 수용 기준 16개 전부, `pnpm run check:all` 통과 |

지시받은 단계 범위까지만 한다. 앞 단계 검증이 실패한 채로 다음 단계로 넘어가지 않는다.

## 명령 (저장소 루트 또는 `projects/day-walk/app`에서)
```bash
pnpm --filter day-walk test        # 단위 테스트
pnpm --filter day-walk build       # 타입체크 + 빌드 + 예산
pnpm --filter day-walk test:e2e    # Playwright (포트 4176)
pnpm --filter day-walk check:all
```

## 규칙 요약 (SPEC §13)
1. 런타임 의존성·상태/UI/애니메이션/드래그 라이브러리 추가 금지
2. 시각 있는 일정에 구간 저장 금지 — `segmentOf(minute)`로 계산
3. 색·크기 리터럴은 `theme/tokens.css`에만
4. `window.alert/confirm/prompt` 금지
5. `innerHTML`/`dangerouslySetInnerHTML` 금지
6. 이미지·폰트·오디오 파일 금지 (favicon SVG 1개만)
7. 외부 네트워크 요청 0건
8. `domain/`에서 React·DOM import 금지
9. 파일 300줄 이하

## 보고 형식
마지막 메시지에: 완료한 단계, 실행한 검증 명령과 결과(통과/실패 수), SPEC과 다르게 해석한 곳(= README 구현 메모에 적은 것), 남은 문제.
