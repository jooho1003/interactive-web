# 하루 산책 · Day Walk — 에셋 프롬프트

[← 전체 목록](README.md)

하루를 아침·오후·저녁으로 나누는 산책 일정표입니다. **같은 주택가 그림 하나**를 조명만 바꿔 세 장으로 만들고, 시간이 흐르면 세 장이 겹쳐 바뀝니다(크로스페이드). 그래서 세 장은 건물·창문·전선 위치가 픽셀 단위로 같아야 합니다.

| 항목 | 내용 |
|---|---|
| 도구 | 내장 **`image_gen`** (ChatGPT/Codex 이미지 도구). 배경은 **편집 모드**(원본 그림을 붙이고 조명만 바꿈) |
| 후처리 | PNG → WebP, FFmpeg quality 90, 크기·색 보정 없음 |
| 만든 날 | 2026-09-15 |
| 버전 | 원본 v2 → 아침·저녁 v3 → 오후 v4. 고르지 않은 후보는 저장소 밖(생성 이미지 기본 폴더)에 있음 |
| 원본 기록 | [`relighting-prompts.md`](../projects/day-walk/app/.claude/plans/day-walk-relighting-prompts.md), [`morning-bird-prompts.md`](../projects/day-walk/app/.claude/plans/day-walk-morning-bird-prompts.md) |
| 레이어 (docs/11 §9-2) | `frame-morning` · `frame-afternoon` · `frame-evening` · `advisor` · `walker` |

## 조명 변형 공통 앞부분 — 아침·저녁 프롬프트 **앞에** 붙인다

> 붙인 주택가 그림을 편집. 웹앱 크로스페이드용이라 1672×941 비율과 지붕·건물·창문·울타리·나무·전선·도로·자전거·지평선 위치를 전부 그대로. 다시 그리기·자르기·확대·건물 추가/삭제·글자 금지. 재질과 하늘의 조명만 바꾼다. 고급 3D 애니메이션 영화 렌더링.

```text id=relight-prefix
Use case: lighting-weather. Edit target: the attached neighborhood background. This is one frame for a web-app lighting crossfade: preserve the exact original 1672x941 aspect ratio and pixel-aligned framing, every roof outline, building, window, fence, tree, power line, road, bicycle and horizon at exactly the same positions and shapes. Do not repaint, crop, zoom, add/remove architecture or add text/UI. Only relight existing materials and sky. Premium stylized 3D animated-film rendering.
```

---

### 01 · 주택가 원본 v2

<img src="../projects/day-walk/app/.claude/asset-history/day-walk-neighborhood-v2.webp" width="480">

| 항목 | 내용 |
|---|---|
| 파일 | `app/.claude/asset-history/day-walk-neighborhood-v2.webp` · 1672×941 · 305KB (보관용, 앱에서 안 씀) |
| 쓰이는 곳 | 아침·저녁 조명 변형의 **원본(편집 대상)** |
| 도구 | ❌ 기록 없음. 사용자가 준 이미지일 가능성 있음 |

**그림 내용** — 왼쪽은 해 지는 노을, 오른쪽은 초승달이 뜬 밤으로 이어지는 3D 애니메이션풍 주택가.

❌ **프롬프트 기록 없음.**

---

### 02 · 아침 (맑은 낮, daylight-v3)

<img src="../projects/day-walk/app/public/media/day-walk-daylight-v3.webp" width="480">

| 항목 | 내용 |
|---|---|
| 파일 | `app/public/media/day-walk-daylight-v3.webp` · 1672×941 · 447KB |
| 쓰이는 곳 | 아침 구간 배경(맨 아래 층). 처음엔 "이른 오후"용으로 만들었다가 아침으로 재사용 |
| 참조 이미지 | 주택가 원본 v2 (편집 대상) |

**무엇을 그리나** — 거리 전체를 맑은 이른 오후로. 옅은 파란 하늘, 밝은 건물, 따뜻한 햇살과 자연스러운 그림자. 달·별 없음, 오른쪽 어두운 파랑 없앰.

**보낸 글 = 공통 앞부분 + 아래**

```text with=relight-prefix
Make the ENTIRE street from left to right a natural clear early-afternoon daylight version. Soft pale blue sky, bright readable buildings with gentle warm sunlight and natural shadows. No visible moon or stars, no dark blue right side. Indoor windows naturally reflect daylight. Preserve the original tree and cloud shapes. Output a single landscape image, no collage.
```

---

### 03 · 오후 노을 (afternoon-v4)

<img src="../projects/day-walk/app/public/media/day-walk-afternoon-v4.webp" width="480">

| 항목 | 내용 |
|---|---|
| 파일 | `app/public/media/day-walk-afternoon-v4.webp` · 1672×941 · 414KB |
| 쓰이는 곳 | 오후 구간 배경 |
| 참조 이미지 | **아침 배경(daylight-v3)** — 원본 v2가 아니라 아침 그림을 편집 |

**무엇을 그리나** — 해가 천천히 지는 늦은 오후의 황금빛. 지평선 근처 복숭아·살구색 하늘, 위쪽은 옅은 따뜻한 파랑, 구름·나무 끝에 호박색 테두리, 긴 그림자. 어둡거나 보라색이면 안 됨, 주황 필터나 세피아 금지, 해 원반 없음.

이 프롬프트는 공통 앞부분이 **안에 들어 있는 단독 글**이다(따로 붙이지 않음).

```text
Use case: lighting-weather. Edit target: attached neighborhood daylight background. This is a pixel-aligned lighting variant for a web app crossfade. Preserve the EXACT 1672x941 landscape framing, every roof, facade, fence, bicycle, tree, cloud shape, road, wire and window at the same positions. Do not crop, zoom, shift perspective, repaint architecture or add objects/text/UI. Change ONLY lighting and sky colors across the ENTIRE scene. Make it a beautiful late-afternoon golden-hour neighborhood, sun gradually setting: luminous peach and soft apricot sky near the horizon, pale warm blue higher up, soft amber edges on clouds and treetops, long gentle shadows, warm sunlit facades, readable natural green foliage. Calm and inviting, softly glowing, not dark or purple, no saturated orange filter or sepia wash, no visible sun disc. Windows mostly daylight reflections, subtle warmth inside at most. Same premium stylized 3D animated-film rendering. Output one landscape background.
```

---

### 04 · 저녁 (초저녁, evening-v3)

<img src="../projects/day-walk/app/public/media/day-walk-evening-v3.webp" width="480">

| 항목 | 내용 |
|---|---|
| 파일 | `app/public/media/day-walk-evening-v3.webp` · 1671×941 · 332KB |
| 쓰이는 곳 | 저녁 구간 배경 |
| 참조 이미지 | 주택가 원본 v2 (편집 대상) |

**무엇을 그리나** — 해 진 직후의 밝은 블루아워. 라벤더빛 파란 하늘, 따뜻하게 켜진 창문과 가로등, 색이 읽히는 건물. **캄캄한 밤이나 남색·검정 덮개처럼 보이면 안 됨.** 왼쪽 눈부신 해는 없애고 오른쪽 초승달은 희미하게 남김.

**보낸 글 = 공통 앞부분 + 아래**

```text with=relight-prefix
Make the ENTIRE street a natural luminous early-evening blue-hour version. Soft lavender-blue sky after sunset, warm glowing windows and street lamps, readable colorful facades, detailed softly lit foliage and road. Light cinematic exposure, gentle ambient skylight, NOT a dark night and NOT an indigo or black overlay. Remove the glaring left sun disc, keep faint crescent on the right. Preserve cloud silhouettes. Output a single landscape image, no collage.
```

---

### 05 · 안내 새 2프레임 (bird-v3)

<img src="../projects/day-walk/app/public/media/day-walk-bird-v3.webp" width="480">

| 항목 | 내용 |
|---|---|
| 파일 | `app/public/media/day-walk-bird-v3.webp` · 1774×887(2:1) · 985KB, 무손실 |
| 쓰이는 곳 | 산책 캐릭터 위 안내 새, 할 일 완료 시 새 5마리 연출. 두 칸을 번갈아 보여 날갯짓 |
| 참조 이미지 | 주택가 그림 + 걷는 캐릭터 — **스타일 참고용일 뿐, 결과에 넣지 않음** |
| 두 단계 | ① 새 디자인 → ② 배경을 순수 초록으로 바꾸는 편집 |

**무엇을 그리나** — 청회색 등과 날개, 상아색 가슴, 작은 호박색 부리, 작고 반짝이는 검은 눈의 작은 새. 오른쪽을 보고 나는 옆모습. 왼쪽 칸은 날개를 올린 모습, 오른쪽 칸은 내린 모습. 두 칸에서 몸 위치·크기는 완전히 같게.

**① 새 디자인**

```text
Use case: stylized-concept. Asset type: transparent two-frame horizontal sprite strip for a small bird companion in a polished 3D animated-film neighborhood web app. The attached neighborhood and girl are STYLE references only; DO NOT include girl, buildings, scenery, green background, text or UI in the output. Create one charming believable small songbird with soft slate-blue back and wings, warm ivory breast, tiny muted amber beak, dark glossy SMALL eyes, detailed soft layered feathers, warm sunlight on top and neutral soft fill. Rounded but proportionate, same high quality dimensional animated-film rendering as the references, not flat vector, not emoji, not a plastic toy, no white sticker outline. True transparent RGBA background, no checkerboard drawn, no floor or cast ground shadow. Output a 2:1 horizontal sprite sheet consisting of TWO equal square cells side by side, no borders or labels. Both cells show the SAME bird in right-facing three-quarter side view, tail left beak right, body level and flying, tiny feet tucked. Body, eye, beak and tail position and scale exactly identical relative to each cell. Cell 1: wings lifted upward in an elegant half-open upstroke. Cell 2: wings angled down in a gentle downstroke. Frame subject centered with generous transparent padding; wings and tail fully visible within own cell, no overlaps. Bird body occupies about 45 percent of each cell width, total bird silhouette about 78 percent. This sheet will animate as two frames at small size.
```

**② 배경을 초록으로 (최종)**

```text
Use case: precise-object-edit. Edit target: this exact two-frame bird sprite strip. Replace ONLY the entire checkerboard background with perfectly solid flat chroma-key GREEN RGB(0,255,0), hex #00FF00, including every gap between feather tips, tail and feet. It must be a single uniform green without any checkers, patterns, gradients, glow, texture, shadows, or floor. Preserve BOTH birds exactly in their two cells: identical positions, scale, feathers, colors and lighting. No green tint or spill on birds. Preserve exact 1774x887 canvas, no crop. This is a production chroma-key sprite sheet; the app will remove the solid green at rendering time. Two birds only, each fully within its original half, no text.
```

**생성 후 확인 · 교훈**
- "투명 배경"을 요청했는데 도구가 **체커보드 무늬를 그림으로 그려서** 돌려줬다. 배경만 따로 빼 달라고 다시 요청해도 같았다. 그래서 ②로 순수 초록 배경을 받았다.
- 초록은 화면에서 빼낸다. `Bird.tsx`의 SVG 색 행렬 `1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  6 -6 6 0 0`이 초록을 투명으로 만든다. 외부 서비스는 쓰지 않는다.

---

### 06 · 걷는 캐릭터 (walker-v2)

<img src="../projects/day-walk/app/public/media/day-walk-walker-v2.webp" width="200">

| 항목 | 내용 |
|---|---|
| 파일 | `app/public/media/day-walk-walker-v2.webp` · 1024×1536, 투명 · 77KB |
| 쓰이는 곳 | 현재 시각 위치를 걷는 캐릭터 — 레이어 `walker` |
| 도구 | ❌ 기록 없음. v1은 저장소에 없음 |

**그림 내용** — 3D 애니메이션풍 단발 여자아이. 보라색 후드티, 청바지, 연보라 운동화. 오른쪽으로 걷는 옆모습.

❌ **프롬프트 기록 없음.** 새 디자인 프롬프트에 스타일 참고("girl")로만 쓰였다.

---

## 소리

효과음은 파일이 아니라 코드로 합성한다(`app/src/audio/sfx.ts`, WebAudio). 프롬프트 없음.

## 계획만 있는 것
- JUHO LAB 마을 파노라마에 Day Walk 집 그려 넣기 — 프롬프트 없음([juho-lab.md](juho-lab.md#01--마을-파노라마-project-village)).
