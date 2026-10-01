# JOOHO LAB (허브) — 에셋 프롬프트

[← 전체 목록](README.md)

작품을 모아 보여 주는 3D 공간 갤러리입니다. 현재는 Blender 파빌리온과 Three.js 카메라를 사용합니다. 아래 기존 마을 기록은 이전 버전의 이력입니다.

**기존 마을 에셋에는 프롬프트 기록이 없습니다.** 플랜에는 "에셋 전용 에이전트 1명이 생성"이라고만 적혀 있습니다(2026-09-12). 2026-10-01 공간 데모의 신규 생성 프롬프트와 Blender 제작 절차는 아래 05·06에 기록했습니다.

---

### 01 · 마을 파노라마 (project-village)

<img src="../projects/jooho-lab/public/assets/project-village.webp" width="640">

| 항목 | 내용 |
|---|---|
| 파일 | `public/assets/project-village.webp` · 2164×727 · 410KB |
| 쓰이는 곳 | 3D 마을 배경(`scene.js`) — 레이어 `panorama`·`houses`(docs/11 §9-4) |
| 도구 | ❌ 기록 없음 (2026-09-12 월드 설정 플랜의 에셋 에이전트) |

**그림 내용** — 광장을 따라 늘어선 작품 집 6채. 왼쪽부터 플라스크 지붕 집, 초록 사무실, 필름 릴 극장, 달 간판 가게, 벽돌 홀, 탑. 파란 하늘, 둥근 나무, 미니어처 느낌.

❌ **프롬프트 기록 없음.**
⚠️ 집 6채가 그림 안에 그려져 있어서 작품이 7번째부터는 마을에 안 나온다(Day Walk는 목록 보기에만 있음). "Day Walk 집을 그려 넣기"가 계획돼 있지만 프롬프트는 없다. 새로 만들 때는 [templates §4](templates.md#4-조명시간대만-바꾸기-같은-구도)처럼 **원본 구도를 유지하는 편집**으로 집 하나만 추가해야 기존 집 좌표가 안 깨진다.

---

### 02 · 배낭 로봇 산책자 (village-walker)

<img src="../projects/jooho-lab/public/assets/village-walker.png" width="260">

| 항목 | 내용 |
|---|---|
| 파일 | `public/assets/village-walker.png` · 1254×1254, 투명 PNG · 1.1MB |
| 쓰이는 곳 | 마을을 걸어 다니는 기본 마스코트 — 레이어 `walker` |
| 도구 | 파일 메타데이터(C2PA): **gpt-image 2.0**, OpenAI 서명, 2026-09-12 |

**그림 내용** — 크림색 둥근 몸에 까만 점 눈, 초록 등산 배낭(돌돌 만 매트)을 멘 작은 로봇. 점토 피규어 느낌, 오른쪽으로 걷는 자세.

❌ **프롬프트 기록 없음.**

---

### 03 · 어두운 전시실 (atelier, 지금 안 씀)

<img src="../projects/jooho-lab/public/assets/atelier.webp" width="480">

| 항목 | 내용 |
|---|---|
| 파일 | `public/assets/atelier.webp` · 1536×1024 · 158KB |
| 쓰이는 곳 | 2026-09-12 "시네마틱 3D 아틀리에" 개편 배경. **지금 코드에서는 안 씀** |
| 도구 | ❌ 기록 없음 (개편 플랜: "야간 개인 전시실, 실제 재질의 건축 배경") |

**그림 내용** — 노출 콘크리트 벽의 어두운 전시 홀, 천장 가장자리 따뜻한 간접조명, 반사되는 바닥.

❌ **프롬프트 기록 없음.**

---

### 04 · 작품 표지

| 파일 | 크기 | 내용 | 출처 |
|---|---|---|---|
| `public/assets/dawn.webp` | 1920×1080 · 122KB | 새벽 세 시 `hub` 컷과 **같은 파일** | [dawn-store.md 01](dawn-store.md#01--hub--계산대) |
| `public/assets/chemiforge.webp` | 1400×933 · 66KB | 서류와 약병을 위에서 찍은 사진풍 | 이 저장소에 생성 기록 없음 — 케미포지 프로젝트 자료로 보임 |
| `public/assets/spire.webp` | 1400×788 · 290KB | 픽셀아트 키아트 "TOWER OF THE END" | 이 저장소에 생성 기록 없음 — 해당 게임 프로젝트 자료로 보임 |
| `public/assets/sasu.webp` | 1280×720 · 39KB | SASU 화면 캡처(생성 이미지 아님) | — |

`public/experiences/dawn-store/` 안의 그림·소리는 새벽 세 시 작품 파일을 그대로 복사한 것이다.

---

### 05 · lab-landscape — 작업실 뒤 먼 풍경

<img src="../projects/jooho-lab/public/assets/lab-landscape.jpg" width="640">

| 항목 | 내용 |
|---|---|
| 파일 | `public/assets/lab-landscape.jpg` · 1536×768 · 493,610 bytes |
| 쓰이는 곳 | 외관과 창밖의 먼 배경 · `landscape` 레이어 |
| 도구 | fal.ai `fal-ai/flux/schnell` · text-to-image · 2026-10-01 |
| 참조 이미지 | 없음 |
| 설정 | 1장, 4 steps, seed 10012026, JPEG. `scripts/prepare-spatial-assets.mjs --generate` |

**무엇을 그리나** — 건물 없는 저녁 해안과 산, 넓은 하늘. 건축은 Blender의 실제 입체 모델로 따로 만든다.

```text
Photographic panoramic landscape at blue hour, distant layered coastal mountains and calm water, a very low horizon in the bottom quarter, expansive pale desaturated blue sky with delicate peach clouds and a faint warm sunset on the right, refined atmospheric architectural photography background, natural subtle film grain, realistic, tranquil, no buildings, no people, no text, no borders. Wide landscape photograph.
```

**생성 후 확인** — fal 호출 성공, Aside 외관에서 배경 확인. 1개 후보 사용. 이 이미지는 입체 건물이나 실내를 대체하지 않는다.

### 06 · lab-pavilion — 연결된 3D 작업실

| 항목 | 내용 |
|---|---|
| 파일 | `public/assets/lab-pavilion.glb`, 원본 `art/lab-pavilion.blend` |
| 쓰이는 곳 | 외관 → 실제 입구 → 작업실 → 7개 전시물 · `stage` 레이어 |
| 도구 | Blender 4.5.12 LTS Python 모델링, Cycles diffuse bake, compositor denoise, glTF export · 2026-10-01 |
| 참조 이미지 | 사용자 Instagram Ddb6_ISh8pA의 연속 공간 이동 개념. 원본 브랜드·이미지 복제 없음 |
| 설정 | `scripts/build-spatial-lab.py`가 정본. 2048² lightmap, 16 samples, seed 42, JPEG embedded GLB |

**무엇을 만드나** — 석재 파빌리온, 나무 천장, 라운지와 작업 데스크, 프로젝트별 전시 벽. 건물 입구는 비어 있고 카메라가 실제로 통과한다.

**생성 원문** — 모델 API 프롬프트는 없음. 모델링 명세와 좌표·재질·조명·노이즈 제거 과정 전체가 위 Python 스크립트에 기록되어 있다. Tripo는 사용하지 않았다.

**생성 후 확인** — 처음 단색 재질 버전은 모형처럼 보여 채택하지 않음. 첫 조명 bake는 노이즈가 심해 denoise를 추가. 잎사귀 메시를 줄여 파일 크기를 낮춤. 소개 문구·작품명·실행 링크는 HTML로 유지하고 이미지 없는 작품은 레지스트리에서 포스터를 생성한다.

### 07 · 실제 작품 화면 — 갤러리 대표 이미지 7장

<img src="../projects/jooho-lab/public/assets/work-chemiforge.webp" width="360">

| 항목 | 내용 |
|---|---|
| 파일 | `projects/jooho-lab/public/assets/work-*.webp` · 아래 개별 크기 참고 |
| 쓰이는 곳 | `stage` 전시물, `rail` 썸네일, `shell` 작품 목록과 작품 상세. 내용은 projects.js에서 관리 |
| 도구 | Aside 실제 브라우저 캡처 · 2026-10-01. 생성 에셋 아님 |
| 참조 이미지 | `projects/jooho-lab/art/captures/<id>.png` 원본 7장 |
| 설정 | 원본 해상도·비율 유지, Pillow WebP quality=88, method=6. 재생성·합성·크롭 없음 |
| 프롬프트 | 해당 없음 — 실제 프로젝트 화면 캡처 |

**무엇을 보여 주나** — 서비스를 실제로 열어 고른 화면이다. 기존 장식 표지와 글자 포스터를 교체했다. ChemiForge는 공개 첫 화면, MARKET FRONT는 현재 프로토타입의 국가 운영 화면이며 완성된 게임 그래픽으로 꾸미지 않았다.

| 작품 / 파일 | 출처와 선택한 화면 | 크기 · 용량 |
|---|---|---|
| ChemiForge · `work-chemiforge.webp` | https://chemi-forge.vercel.app/ · 공개 첫 화면 | 1800×1125 · 74,976B |
| SASU · `work-sasu.webp` | https://sasu-alpha.vercel.app/demo/d/bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb/cards/10000000-0000-4000-8000-000000000121 · 가상 회사의 외주 견적 결정 카드 | 1725×1125 · 83,752B |
| 숏폼 · `work-shortform.webp` | http://localhost:3123/ep/B/2026-09-11/01?tab=preview · 건강검진 결과 나온 날의 요정식탁, 미리보기·타임라인 | 1800×1125 · 80,494B |
| 새벽 세 시 · `work-dawn-store.webp` | http://127.0.0.1:8879/experiences/dawn-store/play.html · 계산대의 커피·잡지·출입구 선택 | 1800×1125 · 120,550B |
| MARKET FRONT · `work-market-front.webp` | http://127.0.0.1:8891/ · 1일차 국가 운영·부지·전략산업 선택 | 1800×1125 · 60,566B |
| 종말의 탑 · `work-spire.webp` | https://tower-50.vercel.app/ · 에른의 시작 무기 선택 | 1800×1125 · 100,400B |
| 하루 산책 · `work-day-walk.webp` | http://127.0.0.1:8879/experiences/day-walk/play.html · 저녁 동네와 세 마감 목록 | 1800×1125 · 57,422B |

**캡처 후 확인** — 원본 7장을 직접 열어 내용·비율을 확인했다. 일부 오른쪽 위의 원형 표시는 Aside 브라우저 버튼이며 작품 UI가 아니다. SASU는 데모 데이터이고, 로컬 주소는 공개 서비스 주소로 등록하지 않는다. 기존 작품 링크는 유지한다. 총 WebP 578,160B. 생성 프롬프트는 없으며 기존 생성 에셋 프롬프트와 구분한다.

### 08 · SASU — 실제 화면 캡처

<img src="../projects/jooho-lab/public/assets/work-sasu.webp" width="360">

| 항목 | 내용 |
|---|---|
| 파일 | `projects/jooho-lab/public/assets/work-sasu.webp` · 1725×1125 · 83,752B |
| 쓰이는 곳 | stage 전시물 · rail 썸네일 · shell 목록 · 작품 상세 |
| 도구 | Aside 실제 브라우저 캡처 · 2026-10-01. 생성 에셋 아님 |
| 참조 이미지 | `projects/jooho-lab/art/captures/sasu.png` |
| 설정 | 원본 비율·해상도 유지, Pillow WebP quality=88, method=6 |
| 출처 | https://sasu-alpha.vercel.app/demo/d/bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb/cards/10000000-0000-4000-8000-000000000121 |
| 프롬프트 | 해당 없음 — 실제 프로젝트 화면 캡처 |

**무엇을 보여 주나** — 가상 회사의 외주 견적 결정 카드.

**캡처 후 확인** — 원본 이미지와 갤러리의 전체 비율을 확인했다. 선택 배경·브라우저 표시·공통 한계는 07 카드에 기록했다.

### 09 · 숏폼 자동화 — 실제 화면 캡처

<img src="../projects/jooho-lab/public/assets/work-shortform.webp" width="360">

| 항목 | 내용 |
|---|---|
| 파일 | `projects/jooho-lab/public/assets/work-shortform.webp` · 1800×1125 · 80,494B |
| 쓰이는 곳 | stage 전시물 · rail 썸네일 · shell 목록 · 작품 상세 |
| 도구 | Aside 실제 브라우저 캡처 · 2026-10-01. 생성 에셋 아님 |
| 참조 이미지 | `projects/jooho-lab/art/captures/shortform.png` |
| 설정 | 원본 비율·해상도 유지, Pillow WebP quality=88, method=6 |
| 출처 | http://localhost:3123/ep/B/2026-09-11/01?tab=preview |
| 프롬프트 | 해당 없음 — 실제 프로젝트 화면 캡처 |

**무엇을 보여 주나** — 회차의 영상 미리보기와 타임라인.

**캡처 후 확인** — 원본 이미지와 갤러리의 전체 비율을 확인했다. 선택 배경·브라우저 표시·공통 한계는 07 카드에 기록했다.

### 10 · 새벽 세 시 — 실제 화면 캡처

<img src="../projects/jooho-lab/public/assets/work-dawn-store.webp" width="360">

| 항목 | 내용 |
|---|---|
| 파일 | `projects/jooho-lab/public/assets/work-dawn-store.webp` · 1800×1125 · 120,550B |
| 쓰이는 곳 | stage 전시물 · rail 썸네일 · shell 목록 · 작품 상세 |
| 도구 | Aside 실제 브라우저 캡처 · 2026-10-01. 생성 에셋 아님 |
| 참조 이미지 | `projects/jooho-lab/art/captures/dawn-store.png` |
| 설정 | 원본 비율·해상도 유지, Pillow WebP quality=88, method=6 |
| 출처 | http://127.0.0.1:8879/experiences/dawn-store/play.html |
| 프롬프트 | 해당 없음 — 실제 프로젝트 화면 캡처 |

**무엇을 보여 주나** — 계산대의 커피·잡지·출입구 선택.

**캡처 후 확인** — 원본 이미지와 갤러리의 전체 비율을 확인했다. 선택 배경·브라우저 표시·공통 한계는 07 카드에 기록했다.

### 11 · MARKET FRONT — 실제 화면 캡처

<img src="../projects/jooho-lab/public/assets/work-market-front.webp" width="360">

| 항목 | 내용 |
|---|---|
| 파일 | `projects/jooho-lab/public/assets/work-market-front.webp` · 1800×1125 · 60,566B |
| 쓰이는 곳 | stage 전시물 · rail 썸네일 · shell 목록 · 작품 상세 |
| 도구 | Aside 실제 브라우저 캡처 · 2026-10-01. 생성 에셋 아님 |
| 참조 이미지 | `projects/jooho-lab/art/captures/market-front.png` |
| 설정 | 원본 비율·해상도 유지, Pillow WebP quality=88, method=6 |
| 출처 | http://127.0.0.1:8891/ |
| 프롬프트 | 해당 없음 — 실제 프로젝트 화면 캡처 |

**무엇을 보여 주나** — 1일차 국가 운영 프로토타입.

**캡처 후 확인** — 원본 이미지와 갤러리의 전체 비율을 확인했다. 선택 배경·브라우저 표시·공통 한계는 07 카드에 기록했다.

### 12 · 종말의 탑 — 실제 화면 캡처

<img src="../projects/jooho-lab/public/assets/work-spire.webp" width="360">

| 항목 | 내용 |
|---|---|
| 파일 | `projects/jooho-lab/public/assets/work-spire.webp` · 1800×1125 · 100,400B |
| 쓰이는 곳 | stage 전시물 · rail 썸네일 · shell 목록 · 작품 상세 |
| 도구 | Aside 실제 브라우저 캡처 · 2026-10-01. 생성 에셋 아님 |
| 참조 이미지 | `projects/jooho-lab/art/captures/spire.png` |
| 설정 | 원본 비율·해상도 유지, Pillow WebP quality=88, method=6 |
| 출처 | https://tower-50.vercel.app/ |
| 프롬프트 | 해당 없음 — 실제 프로젝트 화면 캡처 |

**무엇을 보여 주나** — 에른의 시작 무기 선택.

**캡처 후 확인** — 원본 이미지와 갤러리의 전체 비율을 확인했다. 선택 배경·브라우저 표시·공통 한계는 07 카드에 기록했다.

### 13 · 하루 산책 — 실제 화면 캡처

<img src="../projects/jooho-lab/public/assets/work-day-walk.webp" width="360">

| 항목 | 내용 |
|---|---|
| 파일 | `projects/jooho-lab/public/assets/work-day-walk.webp` · 1800×1125 · 57,422B |
| 쓰이는 곳 | stage 전시물 · rail 썸네일 · shell 목록 · 작품 상세 |
| 도구 | Aside 실제 브라우저 캡처 · 2026-10-01. 생성 에셋 아님 |
| 참조 이미지 | `projects/jooho-lab/art/captures/day-walk.png` |
| 설정 | 원본 비율·해상도 유지, Pillow WebP quality=88, method=6 |
| 출처 | http://127.0.0.1:8879/experiences/day-walk/play.html |
| 프롬프트 | 해당 없음 — 실제 프로젝트 화면 캡처 |

**무엇을 보여 주나** — 저녁 동네와 아침·점심·저녁 마감 목록.

**캡처 후 확인** — 원본 이미지와 갤러리의 전체 비율을 확인했다. 선택 배경·브라우저 표시·공통 한계는 07 카드에 기록했다.
