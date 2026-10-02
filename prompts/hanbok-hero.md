# 한복 히어로 — 에셋 프롬프트

포트폴리오 첫 화면 `projects/hanbok-hero`. 레퍼런스 카드 `references/instagram-reposts.md#lovart-interactive-assets`의 "정지 그림을 방향별 프레임으로" 방식을 **갓 쓴 조선 선비** 캐릭터로 다시 만든다. 레퍼런스의 사무라이 외형·문구는 가져오지 않고, 회화풍 스플래시 아트 느낌(큰 인물·거친 결)만 참고했다.

**규칙(2026-10-03 사용자 정정)** — 정지 이미지는 **Codex `image_gen`**으로 만든다. fal.ai는 **영상(image-to-video)에만** 쓴다. 이번 라운드의 정면 컷은 그 정정 전에 fal Kontext로 만들었고 영상까지 끝난 상태라 그대로 썼다. 다음 수정부터는 정면 컷을 Codex로 만든다. fal 잔액은 2026-10-03에 소진됐다.

**방향 수정 이력** — ① 흰 저고리 사진풍 → ② 적의·금관 중전(일본·중국풍으로 읽힘, 인물 조잡) → ③ 당의 중전 회화풍 → ④ 사용자가 그림체 참조 1장(등불 든 소녀, 거친 붓 결·낮은 채도)과 디자인 참조 1장(갓 쓴 선비, 남색 선 도포·갈색 띠·붉은 술)을 주어 **그림체=참조 1, 디자인=참조 2**로 확정. 참조 이미지는 외부 작가의 작품이라 저장소에 넣지 않고 `docs/참고/`(미추적)에 둔다. 버린 후보와 이유는 각 카드에 적었다.

### 01 · 정면 기준 컷 (hanbok-still) ✅

<img src="../projects/hanbok-hero/dist/assets/hanbok-still.webp" width="240">

| 항목 | 내용 |
|---|---|
| 파일 | `projects/hanbok-hero/dist/assets/hanbok-still.webp` · 2048×2048 · 262KB · 알파 있음(모서리 알파 0) |
| 쓰이는 곳 | 레이어 `character` 파라미터 `still`. 시트 로딩 전·동작 줄이기·`react` 끔·시트 실패 시 보이는 정면 그림. 시트가 반응 중이면 숨는다 |
| 도구·모드 | fal.ai `fal-ai/flux-pro/kontext/max/multi` (참조 2장 + 텍스트) → `fal-ai/clarity-upscaler` 2× → 로컬 `rembg`(isnet-general-use, alpha matting) · 2026-10-03 |
| 참조 이미지 | 1) 화풍: 등불 든 소녀 콘셉트 아트(사용자 제공, `docs/참고/풍.jpg`, 미추적) 2) 디자인: 갓 쓴 선비 일러스트(사용자 제공, `docs/참고/디자인.jpg`, 미추적). 둘 다 외부 작가 작품 — 그대로 옮기지 않는다 |
| 설정 | `image_urls: [화풍, 디자인]` · `seed: 8` · `aspect_ratio: 1:1` · `guidance_scale: 3.5` · `safety_tolerance: 2` · 출력 1024² → clarity 2048² → webp q90 |

**한국어 요약** — 화풍은 첫 번째 그림 그대로(거친 드라이브러시, 캔버스 결, 번진 가장자리, 낮은 채도, 먼지 낀 따뜻한 빛, 큰 눈의 세미리얼 애니 얼굴). 디자인과 색은 두 번째 그림 그대로(검은 갓 — 높은 평평한 모정·넓은 둥근 챙·턱 아래 옥·호박 구슬 끈, 흰 도포에 짙은 남색 깃·소매·단, 황갈색 안옷, 파란 끈으로 묶은 복숭아빛 갈색 띠, 붉은 술, 옆구리의 책). 색은 흰·짙은 남색·황갈·검정·붉은 포인트. 정면, 갓에서 허리까지, 얼굴 크게, 갓을 뒤로 젖혀 얼굴 전부 보임, 정면 응시, 손은 허리 앞. 연회색 단색 배경, 글자·워터마크·서명 없음.

**프롬프트 원문**

```text
Paint a NEW portrait. Painting style: copy the FIRST image exactly — rough dry-brush strokes, scratchy canvas grain, soft smudged edges, muted desaturated palette, dusty warm light, semi-realistic anime face with large calm eyes. Character design and colors: copy the SECOND image's outfit faithfully — a Korean Joseon scholar wearing a black gat hat (tall flat-topped crown, wide round brim, a string of jade and amber beads hanging under the chin), a white dopo overcoat with wide deep-navy-blue borders on the collar, sleeve ends and hem, a tan-peach inner robe, a long peach-brown sash tied at the waist with a blue cord, red tassel ornaments, and books bound with cord at his side. Keep these exact colors: white, deep navy blue, tan peach-brown, black, small red accents. Pose: front-facing, framed from the top of the gat to the waist so the face is large, the gat tilted back so his whole face is visible, eyes looking straight at the viewer, shoulders square, hands folded at the waist. Centered with generous margin on a perfectly plain flat uniform light gray backdrop. No scroll, no leaves, no text, no calligraphy, no watermark, no signature, no logo, no floor line.
```

**버린 후보** — 텍스트만 쓴 flux ultra 후보(T17 등)는 그림체가 매끈하고 디자인이 매번 흔들렸다. 참조를 넣은 1차(K5·K29)는 그림체가 정확했지만 전신이라 얼굴이 작고 디자인 참조의 워터마크 글씨가 따라왔다. 2차(R8·R61·R90)는 상반신이 됐지만 사용자가 "화풍은 K5, 디자인·색은 참조를 더"라고 해서 3차에서 색 지정을 강화했다. 3차 네 장 중 S61·D61은 글자가 생겼고 D8은 갓 챙이 없어 **S8(seed 8, 화풍 먼저·디자인 둘째 순서)**를 골랐다. 업스케일은 `aura-sr`가 잔액 잠금(403)으로 실패해 `clarity-upscaler`(2×, creativity 0.2)를 썼다.

**생성 후 확인** — `alphaReport('/assets/hanbok-still.webp')` → `cornerAlpha [0,0,0,0]`, `checkerboard false`. 로컬 rembg 결과는 fal birefnet과 눈으로 구분되지 않았다(갓 챙 가장자리·술까지 깨끗).

### 02 · 3×3 방향 시트 (hanbok-sheet) ✅

<img src="../projects/hanbok-hero/dist/assets/hanbok-sheet.webp" width="360">

| 항목 | 내용 |
|---|---|
| 파일 | `projects/hanbok-hero/dist/assets/hanbok-sheet.webp` · 3072×3072(칸 1024, 칸마다 4px 투명 여백) · 607KB · 알파 있음 |
| 쓰이는 곳 | 레이어 `character` 파라미터 `sheet`. 포인터 방향에 따라 칸을 **즉시 교체**(`fade`·`follow` 0 — 크로스페이드는 두 머리가 겹쳐 잔상처럼 보여 껐다). 행: 좌상·상·우상 / 좌·정면·우 / 좌하·하·우하 |
| 도구·모드 | fal.ai `fal-ai/kling-video/v2.1/standard/image-to-video` (01의 1024² 원본 입력) → `ffmpeg fps=3` 30프레임 → 로컬 `rembg` 9장 → `ffmpeg xstack` 조립 · 2026-10-03 |
| 참조 이미지 | 01 원본(Kontext 출력, 배경 제거 전) |
| 설정 | `duration: "10"` · `cfg_scale: 0.5` · `negative_prompt: "blur, distortion, extra people, camera movement, zoom, text, watermark, hands moving"` · 출력 1440×1440 24fps · webp q88 |

**한국어 요약** — 카메라 고정, 몸·어깨·손·갓은 그대로. 머리와 눈만 천천히: 자기 왼쪽 → 정면 → 오른쪽 → 정면 → 위 → 정면 → 아래 → 정면.

**프롬프트 원문**

```text
Static camera, plain backdrop, the painted Korean Joseon scholar in a black gat hat and white dopo keeps his body, shoulders, hands and hat perfectly still. Only his head and eyes move, slowly and smoothly, like he is following something near the viewer. No zoom, no camera motion, no other people, consistent lighting. Sequence: he turns his head and eyes to look to his left, returns to center, turns to look to his right, returns to center, then looks up, returns to center, then looks down, and returns to center.
```

**고른 프레임** (3fps 번호, 보는 사람 기준) — 좌상 f19 · 상 f21 · 우상 f8 / 좌 f18 · 정면 f1 · 우 f7 / 좌하 f27 · 하 f28 · 우하 f4. 눈 깜빡임 프레임(f2·f3·f9·f10·f16·f17·f23·f24)은 제외. 위·아래는 눈 위주라 변화가 작다.

**생성 후 확인** — `alphaReport('/assets/hanbok-sheet.webp')` → 모서리 알파 0. `runChecks` 21/21 ×2, probe 70/70, 390px 6/6.

### 03 · 배경 — 경회루 야경 (palace) ✅

<img src="../projects/hanbok-hero/dist/assets/palace.webp" width="360">

| 항목 | 내용 |
|---|---|
| 파일 | `projects/hanbok-hero/dist/assets/palace.webp` · 1920×1072 · 111KB |
| 쓰이는 곳 | 레이어 `paper` 파라미터 `image`(cover). 위에 `vignette` 0.5 |
| 도구·모드 | fal.ai `fal-ai/flux-pro/v1.1-ultra` 텍스트→이미지 · 2026-10-02 (정정 전 생성; 다음 교체 시 Codex) |
| 참조 이미지 | 없음 |
| 설정 | `aspect_ratio: 16:9` · `seed: 23` · `raw: false` · 출력 2752×1536 → 1920 폭 webp q82 |

**한국어 요약** — 경복궁 경회루, 해 질 녘 블루아워. 연못 위 돌기둥·곡선 기와지붕 누각, 물에 비친 반영, 버드나무·소나무, 뒤에 인왕산, 얇은 달, 등불. "한국 조선 건축, 중국·일본 아님, 붉은 해·깃발·사람·글자·현판·처마 밑 명패 없음".

**프롬프트 원문**

```text
Photographic cinematic wide shot of Gyeonghoeru pavilion at Gyeongbokgung Palace, Seoul, KOREA at dusk, for a website hero background: the large Korean wooden pavilion with a curved grey giwa roof and tall stone pillars standing in a still lotus pond, reflections on the water, willow and pine trees, Inwangsan mountain behind, soft indigo blue-hour sky with a thin moon, warm lantern glow, slight haze. Authentically Korean Joseon architecture, not Chinese, not Japanese, no red sun, no flags, no people, no text, no signboard, no nameplate, no hanging plaques under the eaves, bare wooden eaves only.
```

**버린 후보** — ⓪ 같은 프롬프트 seed 12: 처마 밑 명패에 가짜 로마자. ① 궁 실내 + 일월오봉도 1차: 노란 병풍 위 붉은 해가 일장기처럼, 붉은 기둥·금색이 중국풍으로 읽혔고 현판 글씨가 계속 생겼다(인페인팅도 현판을 다시 그림). ② 근정전 마당 사진풍: 밝아서 글자 대비 약함. ③ 남색 하늘 일월오봉도 실내: 붉은 나무가 어색. 가장 오해 없이 한국이고 어두워 글자가 잘 읽히는 경회루를 골랐다.
