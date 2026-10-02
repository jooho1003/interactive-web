# 에셋 파이프라인 (fal.ai → ffmpeg)

2026-10-02에 `dist/assets/hanbok-still.webp`·`hanbok-sheet.webp`를 만든 스크립트 원본이다. 프롬프트와 선택 이유는 [`prompts/hanbok-hero.md`](../../../../prompts/hanbok-hero.md). 빌드·검사에는 쓰지 않는다. `FAL_KEY` 환경 변수가 필요하고 키는 저장소에 넣지 않는다. ffmpeg·ffprobe가 PATH에 있어야 한다. 작업 폴더는 아무 임시 폴더나 된다(스크립트가 상대 경로로 파일을 쓴다).

| 파일 | 역할 |
|---|---|
| `fal.mjs` | fal 동기 호출(`run`), 큐 호출(`queue`), 파일 업로드·다운로드 |
| `gen-still.mjs` | 정면 컷 후보 2장 (`fal-ai/flux-pro/v1.1`, seed 11·22) |
| `rmbg.mjs` | 한 장 배경 제거 (`fal-ai/birefnet/v2`) — `node rmbg.mjs <이미지 URL> <저장 경로>` |
| `gen-video.mjs` | 정면 컷 URL로 머리 돌리는 영상 2편 (`fal-ai/kling-video/v2.1/standard/image-to-video`) |
| `frames.mjs` | 영상에서 프레임 추출 + 번호 격자 — `node frames.mjs seq10.mp4 fr-seq10 3` |
| `rmbg-batch.mjs` | 고른 프레임 번호들을 업로드 → 배경 제거 → `alpha/` |
| `assemble.mjs` | 프레임을 칸 크기로 맞춰 `xstack`으로 시트 조립(칸마다 4px 투명 여백) — `node assemble.mjs out.png 1024 3 3 <9개 파일>` |

순서: `gen-still` → 고르기 → `rmbg`(정면) → `gen-video` → `frames` → 격자 보고 번호 고르기 → `rmbg-batch` → `assemble` → `ffmpeg -c:v libwebp -quality 88 -pix_fmt yuva420p`로 webp.
