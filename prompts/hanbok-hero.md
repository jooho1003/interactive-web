# 한복 히어로 — 에셋 프롬프트

포트폴리오 첫 화면 `projects/hanbok-hero`. 레퍼런스 카드 `references/instagram-reposts.md#lovart-interactive-assets`의 "정지 그림을 방향별 프레임으로" 방식을 조선 중전 캐릭터로 다시 만든다. 레퍼런스의 사무라이 외형·문구는 가져오지 않고, 회화풍 스플래시 아트 느낌(붓 터치·림 라이트·큰 인물)만 참고했다.

모든 에셋은 **fal.ai 경로**로 만들었다: 정면 컷(flux-pro ultra) → 배경 제거(birefnet) → 머리를 돌리는 영상(Kling i2v) → ffmpeg로 프레임 9장 추출·배경 제거 → 3×3 시트 조립. 사용자가 "2.5D라 fal.ai 영상으로 품질을 높여도 된다"고 허용했다. 재현 스크립트는 [`projects/hanbok-hero/scripts/assets/`](../projects/hanbok-hero/scripts/assets/README.md)(키는 환경 변수 `FAL_KEY`).

**2026-10-02 방향 수정 이력** — 처음엔 흰 저고리·붉은 치마의 사진풍 인물(flux-pro, 밝은 배경)이었다. 사용자 피드백: ① 잔상(크로스페이드) ② 레퍼런스보다 작고 웹사이트 느낌이 없음 ③ 글꼴 ④ "중전 느낌". 중전 1차(적의·금관, 금병풍 궁 실내)는 **일본·중국풍으로 읽혔다**(노란 병풍 위 붉은 해 = 일장기, 붉은 기둥·금색 = 중국, 쌍계 머리). 2차에서 배경을 경회루 야경으로, 인물을 당의·쪽머리 회화풍으로 바꿨다. 버린 후보와 이유는 각 카드에 적었다.

### 01 · 정면 기준 컷 (hanbok-still) ✅

<img src="../projects/hanbok-hero/dist/assets/hanbok-still.webp" width="240">

| 항목 | 내용 |
|---|---|
| 파일 | `projects/hanbok-hero/dist/assets/hanbok-still.webp` · 2048×2048 · 260KB · 알파 있음(모서리 알파 0) |
| 쓰이는 곳 | 레이어 `character` 파라미터 `still`. 시트 로딩 전·동작 줄이기·`react` 끔·시트 실패 시 보이는 정면 그림. 시트가 반응 중이면 숨는다 |
| 도구·모드 | fal.ai `fal-ai/flux-pro/v1.1-ultra` 텍스트→이미지 → `fal-ai/birefnet/v2` 배경 제거 · 2026-10-02 |
| 참조 이미지 | 없음 |
| 설정 | `aspect_ratio: 1:1` · `seed: 71` · `raw: false` · `output_format: png` · birefnet `General Use (Heavy)`, `2048x2048`, `refine_foreground: true` · webp q90 |

**한국어 요약** — 게임 스플래시 아트 같은 세미리얼 애니 일러스트, 붓 터치와 극적인 림 라이트. 조선 중전: 금박 무늬 옥색 당의, 붉은 고름, 붉은 치마. **한국식 머리만**(가운데 가르마, 낮은 쪽머리, 비녀, 첩지 — 높은 쌍계·관·중국식 고리 금지). 단정하고 조금 신비로운 표정, 입 다물고 정면 응시, 손은 소매 안에서 허리 앞에 모음. 머리 위에서 허리까지, 가운데 배치, 연회색 단색 배경(배경 제거용).

**프롬프트 원문**

```text
Game splash art, semi-realistic anime illustration, painterly digital painting with visible brush strokes and dramatic rim lighting, highly detailed concept art of a young Joseon dynasty queen of KOREA, as seen in Korean historical dramas. Authentic Korean hanbok court dress, strictly not Chinese hanfu and not Japanese kimono: a jade-green dangui jacket with intricate gold geumbak patterns, a red goreum ribbon, and a wide crimson chima skirt. Korean hairstyle only: hair parted in the middle and pulled back smoothly into a low jjok-meori chignon at the nape, a long jade binyeo hairpin through it, a small gilt cheopji ornament at the center parting — NO tall buns, NO double buns, NO crown, NO hanfu hair loops. Elegant, composed, slightly mysterious expression, lips closed, eyes looking straight at the viewer, shoulders square, hands folded at the waist inside the sleeves, a few strands of hair catching the light, rich silk texture, cinematic contrast, masterpiece quality.
Framed from the top of the hair to the waist, centered, generous margin, in front of a perfectly plain flat uniform light gray backdrop (#d9d9d9), no scenery, no text, no UI, no floor line, no cast shadow.
```

**버린 후보** — flux-pro v1.1 "3D collectible figure" 계열(흰 저고리, 적의·금관, 당의 1차)은 매끈한 인형 느낌이라 레퍼런스보다 조잡했다. flux ultra seed 14는 배경에 한자 글귀가 생겼다. recraft-v3 `digital_illustration`은 어여머리가 잘 나왔지만 옆을 보고 있어 정면 칸으로 못 쓴다(참고용으로만 기록: 프롬프트는 같되 1000자 이내로 줄인 판). 머리는 어떤 모델도 어여머리를 정확히 그리지 못해 쪽머리로 지정했다.

**생성 후 확인** — `alphaReport('/assets/hanbok-still.webp')` → `cornerAlpha [0,0,0,0]`, `checkerboard false`. 알파 경계 박스 x 305~1680, y 7~2047(머리 장식이 위 가장자리에 거의 닿음 → 캐릭터 상자를 화면 높이에 맞춰 바닥 정렬).

### 02 · 3×3 방향 시트 (hanbok-sheet) ✅

<img src="../projects/hanbok-hero/dist/assets/hanbok-sheet.webp" width="360">

| 항목 | 내용 |
|---|---|
| 파일 | `projects/hanbok-hero/dist/assets/hanbok-sheet.webp` · 3072×3072(칸 1024, 칸마다 4px 투명 여백) · 669KB · 알파 있음 |
| 쓰이는 곳 | 레이어 `character` 파라미터 `sheet`. 포인터 방향에 따라 칸을 **즉시 교체**한다(`fade`·`follow` 0 — 크로스페이드는 두 머리가 겹쳐 잔상처럼 보여 껐다). 행: 좌상·상·우상 / 좌·정면·우 / 좌하·하·우하 |
| 도구·모드 | fal.ai `fal-ai/kling-video/v2.1/standard/image-to-video` (01의 배경 제거 전 원본 PNG 입력) → `ffmpeg fps=3` 프레임 추출 → `fal-ai/birefnet/v2` 프레임별 배경 제거 → `ffmpeg xstack` 조립 · 2026-10-02 |
| 참조 이미지 | 01 원본(flux ultra 출력) |
| 설정 | `duration: "10"` · `cfg_scale: 0.5` · `negative_prompt: "blur, distortion, extra people, camera movement, zoom, text, watermark, hands moving"` · 출력 1440×1440 24fps · 프레임 3fps 30장 · webp q88 |

**한국어 요약** — 카메라 고정, 몸·어깨·손·머리장식은 그대로. 머리와 눈만 천천히: 자기 왼쪽 → 정면 → 오른쪽 → 정면 → 위 → 정면 → 아래 → 정면.

**프롬프트 원문**

```text
Static camera, plain backdrop, the painted Korean Joseon queen in green dangui keeps her body, shoulders, hands and headdress perfectly still. Only her head and eyes move, slowly and smoothly, like she is following something near the viewer. No zoom, no camera motion, no other people, consistent lighting. Sequence: she turns her head and eyes to look to her left, returns to center, turns to look to her right, returns to center, then looks up, returns to center, then looks down, and returns to center.
```

**고른 프레임** (3fps 번호, 보는 사람 기준) — 좌상 f20 · 상 f23 · 우상 f10 / 좌 f18 · 정면 f1 · 우 f7 / 좌하 f15 · 하 f3 · 우하 f13. 영상은 "위·아래"를 거의 눈으로만 표현해 상·하 칸은 시선 변화가 작다. 눈 깜빡임 프레임(f4·f11·f14·f26)은 제외.

**생성 후 확인** — `alphaReport('/assets/hanbok-sheet.webp')` → 모서리 알파 0. 칸 경계 1px 비침 방지로 4px 투명 여백. `runChecks` 21/21(즉시 교체 검사 포함), probe 70/70.

### 03 · 배경 — 경회루 야경 (palace) ✅

<img src="../projects/hanbok-hero/dist/assets/palace.webp" width="360">

| 항목 | 내용 |
|---|---|
| 파일 | `projects/hanbok-hero/dist/assets/palace.webp` · 1920×1072 · 127KB |
| 쓰이는 곳 | 레이어 `paper` 파라미터 `image`(cover). 위에 `vignette` 0.5 |
| 도구·모드 | fal.ai `fal-ai/flux-pro/v1.1-ultra` 텍스트→이미지 · 2026-10-02 |
| 참조 이미지 | 없음 |
| 설정 | `aspect_ratio: 16:9` · `seed: 23` · `raw: false` · 출력 2752×1536 → 1920 폭 webp q82 |

**한국어 요약** — 경복궁 경회루, 해 질 녘 블루아워. 연못 위 돌기둥·곡선 기와지붕 누각, 물에 비친 반영, 버드나무·소나무, 뒤에 인왕산, 얇은 달, 등불. "한국 조선 건축, 중국·일본 아님, 붉은 해·깃발·사람·글자·현판·처마 밑 명패 없음".

**프롬프트 원문**

```text
Photographic cinematic wide shot of Gyeonghoeru pavilion at Gyeongbokgung Palace, Seoul, KOREA at dusk, for a website hero background: the large Korean wooden pavilion with a curved grey giwa roof and tall stone pillars standing in a still lotus pond, reflections on the water, willow and pine trees, Inwangsan mountain behind, soft indigo blue-hour sky with a thin moon, warm lantern glow, slight haze. Authentically Korean Joseon architecture, not Chinese, not Japanese, no red sun, no flags, no people, no text, no signboard, no nameplate, no hanging plaques under the eaves, bare wooden eaves only.
```

**버린 후보** — ⓪ 같은 프롬프트 seed 12(현판 금지 문구 없음): 구도는 좋았지만 처마 밑 명패에 가짜 로마자 글씨가 생겨 모바일에서 보였다. ① 궁 실내 + 일월오봉도 1차: 노란 병풍 위 붉은 해가 일장기처럼, 붉은 기둥·금색이 중국풍으로 읽혔고 현판 글씨가 계속 생겼다(인페인팅 `flux-pro/v1/fill`도 현판을 다시 그림). ② 근정전 마당(박석·품계석) 사진풍: 한국적이지만 밝아서 글자 대비가 약함. ③ 남색 하늘 일월오봉도 실내: 한국적이나 붉은 나무가 어색. 가장 오해 없이 한국이고 어두워 글자가 잘 읽히는 경회루를 골랐다.
