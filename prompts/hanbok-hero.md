# 한복 히어로 — 에셋 프롬프트

포트폴리오 첫 화면 `projects/hanbok-hero`. 레퍼런스 카드 `references/instagram-reposts.md#lovart-interactive-assets`의 "정지 그림을 방향별 프레임으로" 방식을 한복 캐릭터로 다시 만든다. 레퍼런스의 사무라이 외형은 가져오지 않는다.

### 01 · 정면 기준 컷 (hanbok-still) ⏸

⏸ **아직 실제 그림이 없다.** 지금 파일은 `scripts/make-placeholders.mjs`가 만든 자리표시 그림이다. 아래 프롬프트로 만들면 ✅로 바꾼다.

| 항목 | 내용 |
|---|---|
| 파일 | `projects/hanbok-hero/dist/assets/hanbok-still.png` · 목표 1024×1024 투명 PNG |
| 쓰이는 곳 | 레이어 `character` 파라미터 `still`. 시트 로딩 전·동작 줄이기·시트 실패 시 보이는 정면 그림 |
| 도구·모드 | ChatGPT 이미지 도구(gpt-image) · 텍스트→이미지 |
| 참조 이미지 | 없음 |
| 설정 | 1:1 · 투명 배경 요청 |

**한국어 요약** — 20대 한국 여성, 흰 저고리에 붉은 치마 한복, 머리는 낮게 땋아 댕기. 정면을 보고 살짝 미소. 상반신에서 무릎까지. 고급 수집용 3D 피규어 느낌, 부드러운 스튜디오 조명. 글자·UI·바닥 없음, 진짜 투명 배경.

**프롬프트 원문**

```text
Premium stylized 3D collectible figure of a young Korean woman in her twenties wearing a traditional hanbok: ivory-white jeogori jacket with a deep red goreum ribbon, full crimson chima skirt, hair in a low braid with a red daenggi ribbon, soft natural makeup, gentle closed-mouth smile.
She faces the camera directly, eyes looking straight at the viewer, shoulders square, hands folded in front at the waist. Framed from the top of the head to just below the knees.
Full figure within a square frame, genuine transparent background (real alpha channel, not a drawn checkerboard), soft neutral studio lighting, detailed fabric folds, no text, no UI, no floor, no cast shadow on the ground. Avoid any green color in the outfit.
```

**생성 후 확인** — 알파 채널이 진짜인지: 작품 페이지에서 `(await import('/qa/browser-checks.js')).alphaReport('/assets/hanbok-still.png')` → `cornerAlpha`가 모두 0이어야 한다. `checkerboard: true`면 §6 초록 배경 방식으로 다시 요청한다.

### 02 · 3×3 방향 시트 (hanbok-sheet) ⏸

⏸ **아직 실제 그림이 없다.** 지금 파일은 `scripts/make-placeholders.mjs`가 만든 자리표시 그림이다. 아래 프롬프트로 만들면 ✅로 바꾼다.

| 항목 | 내용 |
|---|---|
| 파일 | `projects/hanbok-hero/dist/assets/hanbok-sheet.png` · 목표 3072×3072(칸 1024) 투명 PNG, 2MB 이하로 webp 변환 가능 |
| 쓰이는 곳 | 레이어 `character` 파라미터 `sheet`. 포인터 방향에 따라 칸을 바꾼다(cols 3 · rows 3) |
| 도구·모드 | ChatGPT 이미지 도구 · 01 결과를 참조 이미지로 첨부 |
| 참조 이미지 | `hanbok-still.png` (같은 인물·의상·크기 유지용) |
| 설정 | 1:1 · 투명 배경 |

**한국어 요약** — 01과 같은 인물을 3×3 칸에 9번 그린다. 칸마다 고개와 시선 방향만 다르다(왼쪽 위·위·오른쪽 위 / 왼쪽·정면·오른쪽 / 왼쪽 아래·아래·오른쪽 아래). 몸 자세·크기·위치는 모든 칸에서 똑같다.

**프롬프트 원문**

```text
Use case: stylized-concept. Asset type: transparent 3x3 sprite sheet of the attached character for a web hero. The attached image is the SAME character and must be reproduced identically in every cell: same hanbok (ivory jeogori, red goreum, crimson chima), same braid and daenggi, same lighting, same scale and position.
Output one square sheet made of 9 equal square cells in a 3x3 grid, no borders, gaps, labels or text. In every cell the body pose is identical (facing camera, hands folded at the waist); ONLY the head turn and the eye direction change, as if she is looking at something near the viewer's screen:
Row 1: looking up-left, looking up, looking up-right. Row 2: looking left, looking straight at the viewer (identical to the attached image), looking right. Row 3: looking down-left, looking down, looking down-right.
Head turns are subtle (about 15 degrees), eyes clearly follow the same direction. Character centered in each cell with the same generous transparent padding, fully visible, no overlaps. True transparent RGBA background, no checkerboard drawn, no floor, no shadow. Avoid green.
```

**생성 후 확인** — `alphaReport('/assets/hanbok-sheet.png')` 모서리 알파 0. 작품 페이지에서 마우스를 돌려 9칸이 같은 인물·같은 위치인지 본다. 칸 사이에서 몸이 튀면 ① 가운데 칸을 기준으로 다시 요청하거나 ② 5방향(정면·좌·우·상·하)으로 줄인다. 줄이면 매니페스트 `cols`·`rows`가 아니라 시트 칸 자체를 3×3로 유지하되 대각선 칸에 가장 가까운 직교 칸을 복사해 넣는다(코드 변경 없음). 이 결정과 이유를 이 카드에 적는다.

## 03 · 배경 (paper) — 없음

첫 버전은 단색 배경(`paper.color`)이다. 배경 그림을 넣게 되면 여기에 카드를 추가한다.
