# 에셋 파이프라인 (fal.ai → ffmpeg)

2026-10-02에 `dist/assets/hanbok-still.webp`·`hanbok-sheet.webp`를 만든 스크립트 원본이다. 프롬프트와 선택 이유는 [`prompts/hanbok-hero.md`](../../../../prompts/hanbok-hero.md). 빌드·검사에는 쓰지 않는다. `FAL_KEY` 환경 변수가 필요하고 키는 저장소에 넣지 않는다. ffmpeg·ffprobe가 PATH에 있어야 한다. 작업 폴더는 아무 임시 폴더나 된다(스크립트가 상대 경로로 파일을 쓴다).

| 파일 | 역할 |
|---|---|
| `fal.mjs` | fal 동기 호출(`run`), 큐 호출(`queue`), 파일 업로드·다운로드 |
| `gen-queen.mjs` | 회화풍 중전 정면 컷 후보 (`fal-ai/flux-pro/v1.1-ultra`, seed 14·71 — 71 채택) |
| `gen-background.mjs` | 배경 후보 3장: 근정전 마당·경회루·일월오봉도 실내 (`flux-pro/v1.1-ultra` 16:9, seed 12 — 경회루 채택) |
| `rmbg.mjs` | 한 장 배경 제거 (`fal-ai/birefnet/v2`) — `node rmbg.mjs <이미지 URL> <저장 경로>` |
| `gen-video.mjs` | 정면 컷 URL로 머리 돌리는 영상 (`fal-ai/kling-video/v2.1/standard/image-to-video`, 10초) — `node gen-video.mjs <원본 PNG의 fal URL>` |
| `frames.mjs` | 영상에서 프레임 추출 + 번호 격자 — `node frames.mjs head-turn.mp4 fr 3` |
| `rmbg-batch.mjs` | 고른 프레임 번호들을 업로드 → 배경 제거(동시 5개씩, fal 동시 요청 한도 10) — `node rmbg-batch.mjs fr alpha 20 23 10 …` |
| `build-heads.py` | **2026-10-03 현재 화면에 쓰는 세 장**을 만든다: 영상 프레임 + rembg 알파 → 몸 흔들림 정렬(위상 상관) → 목 아래 띠에서 광학 흐름으로 깃을 맞추며 기준 몸(프레임 110)과 섞기 → 머리 영역만 13×2 시트. `python build-heads.py <프레임 폴더> <알파 폴더> <출력 폴더> [--preview]` — 칸 배치·영역·띠는 파일 위 상수 |
| `assemble.mjs` | 프레임을 칸 크기로 맞춰 `xstack`으로 시트 조립(칸마다 4px 투명 여백) — `node assemble.mjs out.png 1024 3 3 <9개 파일>` |

순서: `gen-queen` → 고르기 → `rmbg`(정면) → `gen-video` → `frames` → 얼굴 격자 보고 번호 고르기 → `rmbg-batch` → `assemble` → `ffmpeg -c:v libwebp -quality 88 -pix_fmt yuva420p`로 webp. 배경은 `gen-background` → 고르기 → `ffmpeg -vf scale=1920:-2 -c:v libwebp -quality 82`.

2026-10-03 얼굴 시트: `ffmpeg -i scholar-seq10.mp4 -start_number 0 full/f%03d.png` → 고른 프레임만 `rembg-local.py`와 같은 설정으로 알파 → `build-heads.py` → PIL WebP(정면·몸 q88, 시트 q86). 원본 영상(`scholar-seq10.mp4`, 1440² 24fps 10초)은 저장소에 넣지 않는다(`.gitignore`의 `*.mp4`).
