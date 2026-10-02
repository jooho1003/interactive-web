# 다시 쓸 수 있는 프롬프트 틀

[← 전체 목록](README.md)

새 에셋을 만들 때 복사해서 `[대괄호]`만 채워 쓰는 틀입니다. 출처는 두 가지입니다.

- **검증됨** — 이 저장소 작품에서 실제로 써서 결과가 나온 프롬프트를 일반화한 것
- **강연** — AI World 2026 강연에서 나온 방법(`docs/01`·`04`·`06`). 이 저장소에서는 아직 안 써 봄

도구 이름(Nano Banana, GPT Image, Kling, Seedance, Tripo 등)은 2026-09 강연 기준이라, 쓰기 전에 지금도 맞는지 확인하세요.

| # | 틀 | 언제 | 출처 |
|---|---|---|---|
| 1 | [스타일 프레임 먼저](#1-스타일-프레임-기준-컷-먼저) | 여러 컷이 같은 공간·분위기여야 할 때 | 검증됨 (새벽 세 시) |
| 2 | [캐릭터 단독, 투명 배경](#2-캐릭터-단독-투명-배경) | 무대 위에 올릴 주인공 | 검증됨 (POTATO) |
| 3 | [프랍 시트 · UI 킷](#3-프랍-시트--ui-킷-한-장에-여러-개) | 소품·버튼·아이콘을 한 스타일로 여러 개 | 강연 |
| 4 | [조명·시간대만 바꾸기](#4-조명시간대만-바꾸기-같은-구도) | 같은 장소의 낮·오후·밤을 겹쳐 바꿀 때 | 검증됨 (하루 산책) |
| 5 | [한 곳만 바꾸기](#5-한-곳만-바꾸기-편집) | 숨은 장면, 전·후 비교 | 검증됨 (새벽 세 시) |
| 6 | [스프라이트 시트](#6-스프라이트-시트-투명-배경) | 날갯짓·걷기처럼 프레임을 번갈아 보여 줄 때 | 검증됨 (하루 산책) |
| 7 | [3D로 바꾸기](#7-3d로-바꾸기) | 3D 공간·오브젝트 | 강연 |
| 8 | [영상 체인](#8-영상-스타트엔드-프레임-체인) | 컷을 이어지는 영상으로 | 강연 |
| 9 | [베리에이션 대량 생산](#9-베리에이션-대량-생산) | 같은 장면의 경우의 수 여러 개 | 강연 |
| 10 | [공통 규칙](#10-공통-규칙) | 항상 | 검증됨 + 강연 |

---

## 1. 스타일 프레임 (기준 컷) 먼저

**순서**: 기준 컷을 먼저 4장 뽑아 하나를 고른다 → 나머지 컷은 전부 그 그림을 **참조로 붙여서** 만든다. 따로따로 만들면 공간 구조가 컷마다 달라진다.

**① 공통 스타일 블록** — 모든 컷 프롬프트 앞에 붙인다.

```text
Cinematic still frame, [16:9], [photographic realism | premium stylized 3D animated-film rendering].
[장소, 시간]. [Absolutely no people in frame. | 등장인물 조건]
Single light source: [광원], around [색온도]K.
Beyond the windows: [창밖 조건].
Palette: [하이라이트 색] highlights, [중간 톤], [그림자 색] shadows. [채도].
Mood: [분위기]. Not [피할 분위기].
[질감, 예: Fine film grain]. [심도, 예: Shallow depth of field].
No text, no captions, no watermarks, no brand logos.
```

**② 기준 컷** — 누를 수 있는 물건(핫스팟)은 전부 한 화면에, 서로 떨어져 보이게.

```text
Wide [interior | exterior] shot taken from [카메라 위치], at [눈높이].
On the right: [물건 A].
On the left: [물건 B].
Middle distance: [물건 C].
[위치]: [물건 D].
All [N] of these are visible in this single frame and clearly separated from each other.
[바닥·반사 같은 공간감 한 줄].
```

**③ 나머지 컷** — 기준 컷을 참조로 붙이고:

```text
[Close-up of | Point of view walking … | Looking toward …] [같은 장소의 다른 부분].
[이 컷의 이야기 단서 1~2줄 — 예: No steam. (식었다) / completely dry (비가 안 왔다)].
Focus on [주인공 물건]; [배경] falls out of focus.
```

**확인** — 물건끼리 겹치지 않는가(겹치면 핫스팟을 못 만든다). 실제 예: [dawn-store.md](dawn-store.md).

---

## 2. 캐릭터 단독, 투명 배경

주인공은 그리드나 배경에 섞지 않고 **단독 한 장**으로 만든다(`docs/04` §2-1).

```text
Premium stylized 3D collectible [나이·성별·인물 설명], [머리], [얼굴 소품], [상의], [하의], [신발].
[자세 — 원근을 과감하게: 예 Extremely foreshortened … toward camera with huge … in lower-right foreground], [손 위치].
Full figure within square frame, genuine transparent background, soft neutral studio lighting, detailed cloth, no text, no UI, no floor.
```

**확인** — 결과의 **알파 채널이 진짜인지**(체커보드 무늬를 그린 게 아닌지) 먼저 본다. 가짜면 §6의 초록 배경 방식으로. 실제 예: [potato-designer.md](potato-designer.md).

**캐릭터 → 배경 순서** (강연): 캐릭터를 먼저 만들고 → "이 캐릭터에 어울리는 배경 만들어줘" → "캐릭터 빼줘" → 바닥/왼쪽/뒷면으로 나눈다. 배경을 먼저 만들면 캐릭터가 안 붙는다.

---

## 3. 프랍 시트 · UI 킷 (한 장에 여러 개)

한 장에 여러 개를 뽑아야 스타일이 통일된다. 뽑은 뒤 칸대로 잘라 쓴다.

**프랍 시트** (강연 원문, `docs/04` §2-2)

```text
[스타일 프레임 첨부]
이 이미지에 있는 사람을 제외한 오브젝트들을 4×4 그리드 안에 하나씩 나눠서 넣어줘.
각 칸은 오브젝트 하나, 배경은 단색, 같은 조명과 같은 재질 스타일로.
```

**UI 킷** (강연 원문, `docs/04` §2-2-2) — 상태 3단을 한 세트로

```text
게임 UI를 하나씩 만들지 말고 UI 킷으로 한 장에 만들어줘.
윗줄: 기본 상태 / 둘째 줄: 하이라이트 상태 / 아랫줄: 비활성 상태.
같은 스타일로 STAGE 1~5, SINGLE PLAY, VS PLAY, GAME OVER, READY, START 텍스트 킷도.
```

- 아이콘 묶음: `"FULL WEAPON & ABILITY UI SHEET (EXPANDED, ISOLATED)"` 한 장 → 자르기.
- 인트로 화면: "이 배경과 캐릭터로 게임 인트로 만들어줘" → 마음에 드는 것에서 **버튼만 떼서 메뉴로, 배경은 영상으로**.
- ⚠️ 이 저장소 규칙상 **글자는 이미지에 굽지 않는다**(§10). UI 킷의 글자 부분은 시안 확인용으로만 쓰고, 실제 문구는 레이어 텍스트 파라미터로 둔다.

---

## 4. 조명·시간대만 바꾸기 (같은 구도)

겹쳐 바꾸기(크로스페이드)를 하려면 건물·창문 위치가 **픽셀 단위로 같아야** 한다. 앞부분에서 그걸 길게 못 박는 게 핵심이다.

**앞부분** (검증됨 — 하루 산책)

```text
Use case: lighting-weather. Edit target: the attached [장면] background. This is one frame for a web-app lighting crossfade: preserve the exact original [가로x세로] aspect ratio and pixel-aligned framing, every [이 그림에 있는 요소들: roof outline, building, window, fence, tree, power line, road, …] at exactly the same positions and shapes. Do not repaint, crop, zoom, add/remove architecture or add text/UI. Only relight existing materials and sky. [렌더링 스타일].
```

**뒷부분** (시간대별로 바꿈)

```text
Make the ENTIRE [scene] a natural [시간대] version. [하늘 색], [건물·창문 상태], [그림자]. [피할 것: 예 NOT a dark night and NOT an indigo or black overlay / no saturated orange filter or sepia wash]. [남기거나 없앨 것: 예 Remove the sun disc, keep faint crescent]. Preserve [구름·나무] shapes. Output a single landscape image, no collage.
```

**확인**
- 결과를 원본과 겹쳐서 어긋난 곳이 없는지 본다.
- "어둡게 하지 말 것"을 명시해야 한다. 안 그러면 밤 장면이 검은 덮개처럼 나온다.
- 편집 대상은 **가장 비슷한 그림**으로 고른다. 예: 오후 노을은 원본(노을+밤)이 아니라 맑은 낮 그림을 편집했다.

실제 예: [day-walk.md](day-walk.md).

---

## 5. 한 곳만 바꾸기 (편집)

원본을 참조로 붙이고 **편집 모드**로 만든다.

```text
Use the attached image. Keep the composition, framing, lens, and lighting IDENTICAL.
Change exactly one thing: [바꿀 한 곳과 바뀐 모습].
Everything else in the frame must remain pixel-identical.
```

**확인** — 두 그림을 겹쳐 보고 구도가 어긋나면 다시 만든다. 실제 예: [dawn-store.md 07](dawn-store.md#07--reflection--반사-히든-엔딩).

---

## 6. 스프라이트 시트 (투명 배경)

**① 디자인** (검증됨 — 하루 산책 새)

```text
Use case: stylized-concept. Asset type: transparent [N]-frame horizontal sprite strip for [무엇] in [작품 스타일] web app. The attached [참조들] are STYLE references only; DO NOT include [참조 속 다른 것들], text or UI in the output. Create [대상 묘사: 색·재질·크기감]. [피할 것: not flat vector, not emoji, not a plastic toy, no white sticker outline]. True transparent RGBA background, no checkerboard drawn, no floor or cast ground shadow. Output a [N]:1 horizontal sprite sheet consisting of [N] equal square cells side by side, no borders or labels. All cells show the SAME [대상] in [방향·각도]. Body position and scale exactly identical relative to each cell. Cell 1: [동작 1]. Cell 2: [동작 2]. Frame subject centered with generous transparent padding; fully visible within own cell, no overlaps. [대상] occupies about [비율] percent of each cell width.
```

**② 배경을 초록으로** — 도구가 투명 대신 체커보드를 그려 오면

```text
Use case: precise-object-edit. Edit target: this exact [N]-frame sprite strip. Replace ONLY the entire checkerboard background with perfectly solid flat chroma-key GREEN RGB(0,255,0), hex #00FF00, including every gap between [가장자리 부분들]. It must be a single uniform green without any checkers, patterns, gradients, glow, texture, shadows, or floor. Preserve ALL [대상] exactly in their cells: identical positions, scale, colors and lighting. No green tint or spill. Preserve exact [가로x세로] canvas, no crop. This is a production chroma-key sprite sheet; the app will remove the solid green at rendering time. No text.
```

**화면에서 초록 빼기** — SVG 필터 `feColorMatrix` 값 `1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  6 -6 6 0 0` (하루 산책 `Bird.tsx`). 대상에 초록색이 있으면 그 부분도 빠지므로, 디자인 단계에서 초록을 피한다.

---

## 7. 3D로 바꾸기

(강연, `docs/01` §2·`docs/04` §2-3 — 이 저장소에서는 아직 3D 모델을 만든 적 없음)

1. 스타일 프레임 → §3 프랍 시트로 16개를 뽑아 자른다.
2. **Tripo**(또는 Meshy)에 16장을 한꺼번에 올려 변환한다. **로우폴리** 우선, TV처럼 중간 크기 물건은 "스마트 메시"(폴리곤은 적고 텍스처는 디테일하게).
3. 배경 전체를 한 번에 3D로 넘기면 깨진다. **바닥 / 벽 / 중요한 물건 / 캐릭터 / 소품**으로 나누고, 그래도 안 되면 3등분 → 더 잘게.
4. 파일 이름은 `<오브젝트> 3d model.glb`. 업로드 전 압축: `gltfpack -i in.glb -o out.glb -cc -tc` (물건당 2MB, 캐릭터 5MB 이하).

**가우시안 스플랫** (실사풍 공간): AI 이미지 1장 → 영상 생성 프롬프트 `"너는 드론이고 한 바퀴 돌아봐"` → 프레임으로 나눔 → 스플랫 생성. AI 영상은 한 바퀴 돌면 모양이 달라지는 문제가 있다.

---

## 8. 영상: 스타트·엔드 프레임 체인

(강연, `docs/04` §3-2)

- **이전 컷의 마지막 프레임 = 다음 컷의 첫 프레임.** 끊김 없이 이어진다. 스타트/엔드 지정은 Kling.
- 캐릭터 시트와 공간을 주고 "알아서 해줘"는 Seedance. 저작권 캐릭터는 막히므로 그때는 Kling.
- 한 프롬프트에 Kling 2개 + Seedance 2개를 돌려 고른다. 100개 만들고 하나 고르는 게 정상이다.
- 캐릭터가 컷마다 달라지면 3D 턴테이블이나 스플랫 영상을 입력으로 **video-to-video**.

**스테이지 전환** (강연 원문) — 현재 장면 그림을 Start, 다음 장면 그림을 End로 붙이고:

```text
1스테이지에서 2스테이지로 걸어가
```

**인코딩** — 무음 영상 + 언어별 소리를 따로 둔다(더빙만 바꿔 다국어).

```bash
ffmpeg -i in.mov -c:v libx264 -crf 23 -preset slow -vf scale=1920:-2 -movflags +faststart -an cut.mp4
ffmpeg -i in.mov -vn -c:a libmp3lame -q:a 4 cut.mp3
ffmpeg -ss 00:00:00.5 -i cut.mp4 -frames:v 1 cut_poster.png
```

---

## 9. 베리에이션 대량 생산

(강연, `docs/04` §1-2)

1. "이 장면의 경우의 수 10가지를 프롬프트로 만들어줘" (예: 방 안 / 귀신 등장 / 아무 일 없음 …)
2. 줄바꿈으로 10개로 쪼갠다.
3. 배치 노드로 묶어 이미지 10장 × 프롬프트 10개 = **100개** 자동 생성.

이미지 모델 조합(강연): 한 프롬프트에 Nano Banana 2장 + GPT Image 2장을 뽑아 고른다. GPT 결과가 너무 날카로우면 Nano Banana에 한 번 더 통과시킨다.

---

## 10. 공통 규칙

| 규칙 | 이유 |
|---|---|
| **이미지 안에 글자를 넣지 않는다** (`No text, no captions, no watermarks`) | 고칠 수 없다. 오타 하나에 그림을 다시 만들게 된다. 문구는 레이어 텍스트로 |
| **자막을 영상에 굽지 않는다** | 웹 인코딩에서 뭉개진다. 자막 기능으로 |
| 레퍼런스는 "**참고만 해**, 따라 하라는 게 아니라 이런 느낌" | 그대로 베끼는 것을 막는다 |
| 편집할 때는 "그대로 둘 것"을 길고 구체적으로 | 짧으면 모델이 다시 그려 버린다 (§4·§5) |
| 결과를 원본과 **겹쳐서** 확인 | 겹쳐 바꾸기·전후 비교는 1픽셀 어긋남도 보인다 |
| 한 번에 여러 장 뽑아 고른다 | 한 장에 만족하려 하면 오래 걸린다 |
| **원문 그대로 기록한다** — [README 카드 양식](README.md#새-에셋을-만들면) | 기록이 없으면 같은 것을 다시 만들 수 없다. 이미 그런 에셋이 여럿이다([README 빠진 기록](README.md#빠진-기록--다시-만들-수-없는-것)) |

## 11. 영상에서 방향 프레임 뽑기 (2.5D 시선·회전 시트)

**검증됨 — 한복 히어로 3×3 시트.** 한 장을 여러 방향으로 따로 그리면 인물이 흔들린다. 대신 정면 한 장으로 **짧은 영상**을 만들고 프레임을 고르면 모든 칸이 같은 인물·같은 조명이다.

1. 정면 컷은 **단색 배경**으로 뽑는다(투명 요청 대신). 배경 제거는 뒤에서 `fal-ai/birefnet/v2`로.
2. image-to-video(`fal-ai/kling-video/v2.1/standard/image-to-video`, 10초, `cfg_scale 0.5`)에 아래 틀로 요청한다.

```text
Static camera, plain light gray studio backdrop, [인물] keeps [his/her] body, shoulders and hands perfectly still. Only [his/her] head and eyes move, slowly and smoothly, like [he/she] is following something near the viewer. No zoom, no camera motion, no other people, consistent lighting. Sequence: [looks to the left, returns to center, looks to the right, returns to center, then looks up, returns to center, then looks down, and returns to center].
```

3. `ffmpeg -vf fps=3`로 프레임을 뽑고 얼굴만 잘라 번호 격자(contact sheet)로 본 뒤 방향별로 고른다. 눈 깜빡임 프레임은 뺀다. 모델이 "자기 왼쪽"을 보는 순서라 화면 기준 좌우가 뒤집힌다.
4. 고른 프레임을 배경 제거 → `ffmpeg xstack`으로 칸 크기에 맞춰 조립. **칸마다 4px 투명 여백**을 두지 않으면 소수점 픽셀에서 이웃 칸이 1px 비친다. webp(q88, 알파)로 2MB 아래.

스크립트: `projects/hanbok-hero/scripts/assets/`(`gen-video.mjs`, `frames.mjs`, `assemble.mjs`). 키는 `FAL_KEY` 환경 변수, 저장소에 넣지 않는다.
