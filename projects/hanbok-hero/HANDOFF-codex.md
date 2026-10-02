# 한복 히어로 — Codex 인수인계 (2026-10-02)

브랜치 `hanbok-hero`(main `0003760`에서 분기). 코드·관리자·검수·문서가 끝났고, **실제 그림도 넣었다** — 2026-10-03 확정: 갓 쓴 조선 선비(사용자 참조 2장 — 화풍 `docs/참고/풍.jpg`, 디자인 `docs/참고/디자인.jpg`, 둘 다 미추적 외부 작품)를 Kontext multi로 만든 `hanbok-still.webp`·Kling 영상에서 뽑은 `hanbok-sheet.webp`, 경회루 야경 `palace.webp`. 카드는 ✅, 재검수는 QA.md 마지막 절. **규칙: 정지 이미지는 Codex `image_gen`(또는 `codex exec`)으로, fal은 영상에만.** fal 잔액은 2026-10-03 소진 — 영상이 더 필요하면 충전 뒤 진행. 배경 제거는 `scripts/assets/rembg-local.py`(Python `rembg`)로 로컬 처리한다. 사용자 피드백으로 바뀐 점: 크로스페이드 대신 즉시 교체, 화면 높이만큼 큰 인물, 명조 웹폰트, 버튼 레이어, 어두운 팔레트. **국적 단서 주의**: 노란 병풍+붉은 원은 일장기로, 붉은 기둥+금색은 중국풍으로 읽힌다 — 경회루·박석·뇌록 단청·쪽머리처럼 한국 고유 명사를 프롬프트에 박고 "not Chinese, not Japanese"를 넣는다. 아래 §1은 다시 만들거나 다른 캐릭터로 바꿀 때의 절차다. 재현 스크립트는 `scripts/assets/`. 작업 규칙은 `AGENTS.md`(레이어 계약, 에셋 프롬프트 기록)를 따른다.

## 현재 상태

| 항목 | 상태 |
|---|---|
| 실행 | `pnpm --filter hanbok-hero dev` → http://localhost:4178 (관리자 `/admin`) |
| 검사 | `pnpm --filter hanbok-hero check` 통과 — 테스트 5, lint 6 layers / 59 parameters, 오류 0 |
| 브라우저 검수 | `dist/qa/browser-checks.js` — probe 59/59, `runChecks` 22, 동작 줄이기 4, 390px 6, 시트 실패·회복 5 (Playwright MCP Chromium, 자리표시 에셋 기준). 절차·결과는 [QA.md](QA.md) |
| 설계·플랜 | `.claude/plans/2026-10-02-hanbok-hero.md`, `.claude/plans/2026-10-02-hanbok-hero-plan.md` |
| 프롬프트 카드 | [`prompts/hanbok-hero.md`](../../prompts/hanbok-hero.md) — 01 정면 컷, 02 3×3 시트, 둘 다 ⏸ |

## 1. 에셋 만들기 (남은 작업의 본체)

두 경로 중 하나를 고른다. 어느 쪽이든 **도구·모델·프롬프트 원문·설정·결과 확인**을 카드에 그대로 적고 `pnpm prompts:build`를 돌린다.

### 경로 A — `image_gen`으로 정면 컷 → 3×3 시트 (기본)

1. 카드 01 프롬프트로 정면 컷 생성 → `dist/assets/hanbok-still.png` (1024² 이상, 진짜 알파).
2. 카드 02 프롬프트에 01 결과를 참조로 첨부해 시트 생성 → `dist/assets/hanbok-sheet.png`. **2048² 이상**(1024²면 칸이 341px라 화면에서 흐려진다).
3. 칸 사이 인물이 흔들리면: 가운데 칸 기준으로 재요청하거나, 5방향으로 줄인다(좌상·우상 칸 ← '위' 칸 복사, 좌하·우하 칸 ← '아래' 칸 복사). 결정 이유를 카드에 적는다.

### 경로 B — fal.ai 영상 → 프레임 추출 (품질 우선, 사용자가 허용함)

1. 정면 컷(경로 A의 1단계)을 fal.ai image-to-video에 넣어 "고개를 왼쪽→정면→오른쪽으로 천천히 돌린다(몸은 고정, 시선도 같이)" 영상 1편. 위·아래 시선 행이 필요하면 "위를 보며 좌→우", "아래를 보며 좌→우" 각 1편.
2. `ffmpeg`로 각도별 프레임 추출(행마다 3장 또는 5장) → 배경 제거(투명) → 같은 크기 칸으로 시트 조립. 런타임은 `cols`·`rows` 최대 5까지 받는다(관리자에서 바꾼다).
3. 장점: 모든 칸이 같은 인물·같은 조명. 주의: 시트 총 용량은 webp로 2MB 안쪽, fal 키는 저장소에 넣지 않는다(루트 `.env`에는 Tripo 키만 있다). 모델 id·프롬프트·시드를 카드에 적는다.

### 생성 뒤 확인 (둘 다 공통)

1. 서버를 켜고 작품 페이지에서 콘솔 실행:
   ```js
   const q = await import('/qa/browser-checks.js');
   await q.alphaReport('/assets/hanbok-still.png');   // cornerAlpha 모두 0, checkerboard false
   await q.alphaReport('/assets/hanbok-sheet.png');
   await q.runProbe();                                // failed: []
   await q.runChecks();                               // failed: []
   ```
   체커보드가 그려져 왔으면 `prompts/templates.md` §6 초록 배경 방식으로 다시 받는다.
2. 마우스를 돌려 9칸이 같은 인물·같은 위치인지, 시트가 앞에 나올 때 **정면 외곽선이 비치지 않는지**(이중 외곽선) 본다.
3. `dist/index.html`의 `<img class="character-still" width height alt>`를 실제 크기·설명에 맞춘다(alt는 레이어로 못 묶는다 — 매니페스트 `fixed` 참고).
4. 카드 01·02를 ⏸→✅로 바꾸고(본문의 "⏸ 아직 실제 그림이 없다" 줄 삭제), 파일 크기·용량·날짜를 적고, `prompts/README.md` 표의 ⏸도 ✅로. `pnpm prompts:build` → 루트 `pnpm check`.
5. QA.md에 "실제 에셋으로 재검수" 결과를 추가하고 "자리표시 기준" 문구를 갱신한다.

## 2. 남은 작은 결함 (최종 리뷰에서 Minor로 남긴 것, 순서 = 우선순위)

1. `dist/qa/browser-checks.js` 390px 터치 검사가 `range` 모바일 값(200)을 가려내지 못한다 — `cx - 100`에서 탭하거나 `r === 200`을 단정하도록 바꾼다.
2. `admin/studio.js` `push()`의 catch가 상태줄에 쓴 오류를 숫자 입력 경로의 `status('')`와 저장 성공 메시지가 바로 지운다 — catch에 `console.error`를 넣거나 지우지 않게 한다.
3. 기본 글꼴이 `system-ui`로 바뀌었고 `Noto Sans KR` 옵션은 설치된 기기에서만 보인다(웹폰트 링크 없음). 웹폰트를 쓰려면 `@font-face`를 넣고 `layer-fixed` 사유를 적는다.
4. 실제 3072² 시트는 `load` 직후 디코딩이 덜 끝나 한 프레임 비어 보일 수 있다 — `app.js` `onSheet(true)` 전에 `await sheetImg.decode()`를 검토한다.
5. 동작 줄이기 규칙의 `.sheet-frame{transition:none}`이 `.is-front` 명시도에 진다(프레임이 숨겨져 화면 영향 없음).
6. 첫 반응 뒤 안내가 span만 숨어 Scene Studio에서 보이지 않는 안내 영역을 고를 수 있다.
7. `docs/10` "studio.js 87줄" → 지금 90줄.

알려진 한계(QA.md에 기록됨): 빠른 A→B→C 전환은 B 위에 C가 즉시 뜸, 가로로 든 휴대폰(844×390) 미확인, 실제 터치 기기·Safari·스크린리더 미확인, 게시 시 `layers.values.json`에 빈 `scenes.hero` 골격이 남음.

## 3. 병합 전제

브랜치 커밋만으로는 루트 `pnpm check`가 실패한다(`prompts/catalog.json`·`gallery.html`에 hanbok 항목이 없고, `references/instagram-reposts.md`가 미추적). 사용자의 미커밋 파일을 함께 커밋해야 한다: `prompts/README.md`·`catalog.json`·`gallery.html`, `references/instagram-reposts.md`와 references 생성물, `docs/10`의 "한복 히어로에서 확인한 것" 절. 그 뒤 main 병합 → 사용자 승인 뒤 푸시.
