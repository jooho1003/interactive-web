# 08. 레퍼런스 심층분석 — AI Movie · Design Your World (패밀리 B 재현 스펙)

분석일: 2026-09-11
대상: [gryun-aimovie.com](https://gryun-aimovie.com/) (AI Movie, 2025 발표작) · [design-your-world.replit.app](https://design-your-world.replit.app/) (DYW, 2026-02 INSIGHT OUT 발표용)
방법: 두 사이트 각각 (1) API·에셋 전수 덤프(curl HEAD, ffprobe 원격 스트림 메타, 번들 문자열 grep. 역컴파일·미디어 다운로드 없음) + (2) Playwright로 데스크톱 1440×900 / 모바일 390×844 실제 전 분기 플레이. 원본 보고서 4편과 JSON·스크린샷은 [`research/aimovie/`](research/aimovie/), [`research/dyw/`](research/dyw/).
이 문서의 목적: **"같은 퀄리티의 인터랙티브 웹"을 만들기 위한 재현 스펙.** 02·05 문서의 패밀리 B 정의를 이 문서가 대체한다.

---

## 0. 한눈에

| | AI Movie | Design Your World |
|---|---|---|
| 용도 | 관객이 탐험하는 분기형 AI 영화 | 발표자가 진행하는 인터랙티브 프레젠테이션 |
| 노드 | 15 (mp4 실존 13) | 69 (mp4 실존 63) |
| 총 재생 시간 | 9.7분 | 23.4분 |
| 실존 에셋 | 37개, **92 MB** | 153개, **435 MB** |
| 인터랙션 모델 | 좌/상/우 화살표 + 시간창 히든 링크 | 화살표 + **좌표 핫스팟 메뉴** + 히든 링크 + 문 선택 인트로 + Quick Jump |
| 엔딩 | 2 (메인 `video5-IN`, 히든 `video6-HIDDEN`), 둘 다 도달 가능 | 2개 정의됐으나 **현재 라우팅에서 도달 불가**. 실제 결말은 `video45`→`video1` 루프 |
| 오디오 | `<video muted>` + 노드별 KO/EN 더빙 mp3 + BGM | mp4 내장 오디오 + BGM (mp3 경로는 코드에만 남고 파일 없음) |
| 자막 | 9노드, KO 106 / EN 102 큐 | aimovie 것을 그대로 상속, 신규 45+노드엔 자막 0. 기본 OFF |
| 영상 규격 | 전량 1920×1080 · 24fps · 평균 1.39 Mbps · 컷당 평균 4.8 MB | 대부분 1928×1076 · 24fps · 평균 5.67 Mbps · 컷당 평균 7.1 MB |
| app-settings 키 | 16 | 31 |
| 관리자 | `/admin` Replit OIDC 로그인 벽 | `/admin`은 잠겼으나 **인앱 톱니 설정 패널은 무인증으로 열림** |
| 콘솔 에러 | 0 (401 1건은 정상) | 0 (401 1건은 정상) |

**핵심 결론 3개**
1. **DYW는 aimovie를 그대로 포크한 것이다.** 폰트 빌드 산출물 해시가 바이트 단위로 같고, 디자인 토큰 스키마(`design.desktop` 서브키)는 diff 0, 자막 큐 수까지 동일하다. 강연자의 "복제 → 확장"이 여기서도 증명된다.
2. **퀄리티는 플레이어 코드가 아니라 4가지 연출 규칙에서 나온다.** 엔드 프레임 = 다음 스타트 프레임, 버튼은 "끝나기 N초 전"에만, 글로우는 안 가본 길 하나만, 몰입 구간은 스킵 금지. 이 규칙들은 전부 JSON 설정값으로 표현되어 있다(§2).
3. **두 사이트 모두 "확장하면서 생긴 결함"이 같은 패턴이다.** 끊긴 엔딩, 고아 노드, 같은 키에 다른 스키마(`videoRouting`), 죽은 에셋 요청, 모바일 토큰 미적용. 재현 시 **그래프 린트와 스키마 단일화**를 처음부터 넣어야 하는 이유다(§6).

---

## 1. 계보 — 무엇이 물려졌고 무엇이 늘었나

```
aimovie (2025)                         DYW (2026-02)
├ video-flow: 15노드, 화살표 navigation ──→ 69노드. 확장 노드 51개는 navigation:{} (끊김)
├ app-settings 16키 ──────────────────→ 31키 (+15)
│  ├ design/skip/replay/langToggle ───→ 동일 (diff 0)
│  ├ intro: 언어 선택 ─────────────────→ + mode:"doors" (빨강/파랑/초록 문, 셋 다 video1행)
│  ├ videoRouting: {left,up,right} ────→ {question, menus[{text, targetVideoId, hotspot{x,y,w,h}}]}  ← 같은 키, 다른 스키마
│  ├ hiddenLinks: video5-IN 01:20~01:33 → 동일 1건 그대로 (확장 없음)
│  ├ timeline: 3-IN, 4-IN ─────────────→ + 5-IN
│  ├ subtitles: 9노드 ─────────────────→ 동일 9노드 (신규 노드 자막 없음)
│  └ bgm: 섹션별 on/off ───────────────→ 동일
├ 신규 관리 계층 ──────────────────────→ videoOrder, videoGroups, dynamicVideos, deletedVideos,
│                                        topJumpMenu(Quick Jump), menuDesign, masterColor/savedColors/
│                                        colorMasterRefs, individualHighlights, qOverlayDelay,
│                                        showCopyright, soundEffects, z-index(15레이어)
├ 신규 API ────────────────────────────→ /api/z-index, /api/thumbnails, /api/available-videos, /api/admin/users
├ 에셋: mp4 + KO/EN mp3 + BGM ─────────→ mp4(오디오 내장) + 썸네일 68 + _m1 포스터 18 + BGM. mp3 제거
└ 폰트: Noto Sans KR 풀팩 1,056파일 ────→ 동일 파일 (해시 일치)
```

읽는 법: **강연자는 15컷짜리 영화 플레이어를 발표용 45컷 콘텐츠 관리 시스템으로 키우면서, 인터랙션 모델(핫스팟)과 관리 메타데이터(정렬·그룹·색상 마스터·소프트 삭제)를 얹었고, 대신 더빙·자막 파이프라인은 버렸다.** 발표는 본인이 말하므로 더빙·자막이 필요 없었다. 이것이 "패밀리 B = 플레이어 + 콘텐츠 관리"의 실체다.

---

## 2. 퀄리티를 만드는 연출 규칙 (전부 설정값)

| # | 규칙 | 실측 | 설정 키 | 재현 필수 |
|---|---|---|---|---|
| 1 | **엔드 프레임 = 다음 스타트 프레임** | aimovie `video5-IN` 마지막 프레임(월터 포스터 + 쓰레기통)이 `video6-HIDDEN` 첫 프레임과 완전 동일. DYW `video5`(스케치북) → `video6`(스탠드 켜짐)은 같은 구도에서 조명만 바뀜 | (에셋 제작 규칙) | ◎ |
| 2 | **버튼은 끝나기 N초 전에만** | `arrowInstantVisible:false`. 기본 8초, 다큐는 1초, 3~7초 연결샷은 3초 | `videoTiming[node]` | ◎ |
| 3 | **글로우는 단일 지시등** | 기본 방향(glow1) 하나만 빨강 펄스. 방문 플래그가 서면 안 가본 방향(glow2)으로 갈아탐. 동시에 둘이 빛나지 않음 | `videoGlow`, `setsFlag`, `glowCondition` | ◎ |
| 4 | **몰입 구간은 스킵 금지** | 본편·연결샷은 스킵 가능, 다큐(-IN)·엔딩·히든은 `videoSkip:false` | `videoSkip[node]` | ◎ |
| 5 | **연결샷으로 공간 연속성** | `-L/-R` 3~7초 도보 이동 컷(대사·자막 없음)이 포스터 사이를 잇는다. "공간을 걸어다닌다"는 감각의 원천 | 노드 명명 규칙 | ◎ |
| 6 | **긴 구간엔 타임라인** | 2~2.5분 다큐 상단에 진행 바 + 4~6개 챕터 포인트. 클릭 시 정확한 초로 점프(실측 01:45) | `timeline[node].points[]` | ○ |
| 7 | **히든 엔딩은 소품에 숨긴다** | 특정 노드의 13초 시간창에만 DOM에 나타나는 투명 히트박스(77%,79%, 400×200). 비밀번호 입력 없음. 쓰러진 쓰레기통이라는 소품이 단서 | `hiddenLinks[]` | ○ |
| 8 | **후킹 인트로** | 20세기폭스 패러디 로고(서치라이트·금속 질감), DYW는 안개 들판 + 행사 타이틀 루프 + 문 3개 | `intro`, `video-INTRO.mp4` | ◎ |
| 9 | **스타일 전환은 서사와 동기화** | DYW `video8`부터 실사 → 연필 스케치 코믹. "어린 시절 회상" 전환점과 정확히 일치해 이질감이 의도로 읽힘 | (에셋 제작 규칙) | ○ |
| 10 | **완성작은 시네마 모드로** | DYW `video25`(191초 Skyfall풍), `video33`(72초)은 레터박스 + 하단 중앙 큰 스킵 버튼으로 "영화관"임을 UI로 구분 | (노드 타입 필요, 현재 미문서화) | ○ |
| 11 | **절제된 상시 UI** | 화살표 52px 회색 80%, 스킵 85×42 검정 알약, 푸터 "Created by" 링크. 중앙을 침범하지 않음 | `design`, `skip` | ◎ |
| 12 | **사운드 3트랙** | `<video muted>` + 노드별 더빙 mp3 + BGM(섹션별 on/off, 다큐 끝나는 시점에 재개 `startAtEndSections`, 2초 크로스페이드) + hover/click wav | `bgm`, mp3 경로 규칙 | ○ |
| 13 | **미완성은 노출하지 않는다** | 목적지가 `available:false`면 화살표 DOM 자체를 렌더링하지 않음 | `available` | ◎ |
| 14 | **핫스팟은 실루엣을 따른다** | 사각형 히트존이지만 호버 시 amber `#FFAE00` 아웃라인이 사물 형태를 따라 표시. 커서 pointer | `menus[].hotspot` | ○ (DYW형) |

◎ = M1(aimovie 동등)에 필요, ○ = M2(DYW 동등) 또는 선택.

---

## 3. 데이터 모델 — 통합 스키마 설계 결정

두 사이트에서 배운 가장 중요한 함정: **`videoRouting`이라는 같은 키가 aimovie에선 `{left,up,right}`, DYW에선 `{question, menus[]}`다.** 그리고 aimovie의 `videoRouting`은 `navigation`의 중복 사본이었다. 재현 시에는 **분기 자료구조를 하나의 판별 유니온으로 통합**하고 `navigation`/`videoRouting`/`hiddenLinks` 3중 구조를 없앤다.

```typescript
// packages/config-schema/src/video-flow.ts — 03 문서 §3-1을 이 정의로 교체
const Edge = z.discriminatedUnion('kind', [
  // aimovie형: 좌/상/우 화살표
  z.object({ kind: z.literal('arrow'), dir: z.enum(['left','up','right']), to: NodeId }),
  // DYW형: 질문 + 텍스트 메뉴 + (선택) 좌표 핫스팟
  z.object({ kind: z.literal('menu'), id: z.string(), text: I18n, to: NodeId.nullable(),
             hotspot: z.object({ x: pct, y: pct, w: pct, h: pct, enabled: z.boolean() }).optional() }),
  // 시간창 히든 링크 (이스터에그)
  z.object({ kind: z.literal('hidden'), id: z.string(), from: Timecode, until: Timecode, to: NodeId,
             box: responsive(z.object({ x: pct, y: pct, w: z.number(), h: z.number() })),
             previewEnabled: z.boolean().default(false) }),
]);

const VideoNode = z.object({
  id: NodeId, file: z.string(), available: z.boolean(),
  type: z.enum(['scene','link','feature','ending','hidden','intro']),   // 연결샷·다큐·엔딩 구분 → 시네마 모드·스킵 기본값 유도
  question: I18n.optional(),
  edges: z.array(Edge),
  buttonShowBeforeEnd: z.number().default(8),   // videoTiming: "끝나기 N초 전"
  skippable: z.boolean().default(true),         // videoSkip
  setsFlag: z.string().optional(),
  glow: z.object({ primary: EdgeRef.nullable(), secondary: EdgeRef.nullable(), switchWhen: z.string().nullable() }), // videoGlow
  timeline: TimelineSpec.optional(),
  subtitles: z.record(Lang, z.array(SubtitleCue)).optional(),
  audio: z.object({ dubbing: z.record(Lang, z.string()).optional(), bgm: z.enum(['on','off','resumeAtEnd']) }),
  poster: z.string().optional(), thumbnail: z.string().optional(),
  group: z.string().optional(), order: z.number().optional(), deleted: z.boolean().default(false),  // DYW 관리 계층
});
```

디자인 토큰(`design`, `skip`, `replay`, `langToggle`, `menuDesign`, `subtitles.style`, `masterColor/savedColors`)과 `intro`, `bgm` 전역 설정은 두 사이트 모두 `desktop/mobile` 두 벌이며 03 문서 `responsive()` 원칙 그대로다. 실제 값은 [`research/aimovie/api/app-settings.json`](research/aimovie/api/app-settings.json), [`research/dyw/api/app-settings.json`](research/dyw/api/app-settings.json)을 시드로 쓴다.

**실측 디자인 값 (기본 시드로 채택)**

| 요소 | 값 |
|---|---|
| 화살표 | 원 52px(모바일 40), 화살표 20px, 선 1px, `#c7c7c7` on `#474747`@80%. hover 200ms scale 1.05 흰색 + `on.wav` |
| 글로우 | `#ef4444`, 원 50%, `opacity` keyframe 0/100%=0.15 · 50%=0.45, 1.5s infinite. hover 80% |
| 메뉴 버튼(DYW) | Noto Sans KR 24px/400, 검정 80%, radius 22px, 368×53. 권장 경로: `border 0.67px` + `box-shadow 0 0 15px 8px rgba(color,.74)`. hover 텍스트 `#FFAE00` |
| 질문 헤딩(DYW) | 26px/500 흰색, text-shadow blur 4 |
| 스킵 | 85×42(모바일 85×32), 14px/600 `#b8b8b8`→흰색, 검정 80%, 테두리 `#363636` |
| 자막 | Noto Sans KR 600 35px, letter-spacing -0.5, 하단 85%, `#f3c614`, shadow(1,1,2,65%), fade 1s |
| 언어 토글 | 활성 `#f3c614` / 비활성 흰색, 알약 |
| 인트로 버튼 | 140×50 알약 |
| 폰트 | Noto Sans KR 400/500/600 단일 패밀리 |

금색 `#f3c614`(자막·토글 활성·리플레이 hover)와 빨강 `#ef4444`(글로우)가 유일한 강조색이다. 회색 스케일 + 강조색 2개. DYW는 여기에 `masterColor`(default/point/grey) 3색 마스터와 저장색 4개를 두고 `colorMasterRefs`로 다른 설정에 주입한다. 45편 규모에서 배색 일관성을 지키기 위한 장치다.

---

## 4. 플레이어 런타임 — 구현 요구사항

03 문서 `video-kit` 패키지의 요구사항을 실측으로 확정한다.

1. **듀얼 `<video>` 크로스페이드.** `video-player`(활성, z 1) + `video-player-inactive`(이전 프레임 유지, z 0). 하드컷에 가깝게 전환되고 암전이 관찰되지 않았다. hls.js 불필요, mp4 progressive로 충분(컷당 ≤ 27 MB에서도 문제 없음).
2. **프리로드.** 현재 노드 도달 즉시 다음 후보 1~2개의 mp4(+mp3, 포스터, 썸네일)를 요청. aimovie는 `video3-IN` 재생 중 `video4.mp4`, `video4` 중 `video4-L`·`video5`가 잡힌다. DYW는 노드 전환당 6~8 요청.
3. **버튼 타이밍.** `duration - buttonShowBeforeEnd` 시점에 페이드 인. 영상 시작 기준이 아니다.
4. **글로우 상태기계.** `primary` 빛남 → `switchWhen` 플래그가 세션에 있으면 `secondary`만 빛남. 플래그는 `setsFlag` 노드 재생 시 기록. 관리자에 "Visit State Control"(플래그 수동 토글, Reset State)이 있다.
5. **`available:false` 방어.** 목적지가 미배포면 해당 엣지의 버튼을 DOM에서 제외.
6. **오디오 3트랙.** `<video muted>` + `<audio>` 더빙(노드별, 언어별 경로 `/videos/{id}.mp3`, `/videos/EN/{id}.mp3`) + `<audio data-testid="audio-bgm">`. BGM은 `enabledSections`로 노드별 on/off, `startAtEndSections`면 해당 노드가 끝나는 순간 재개, 전환 2초 크로스페이드. 효과음 hover/click은 전역 스위치(`soundEffects`) 뒤에.
7. **자막 엔진.** `mm:ss(.s)` 큐, fadeIn/out, desktop/mobile 스타일 두 벌. **큐 종료 시각이 영상 길이를 넘지 않는지 검증**(DYW `video1` 자막이 00:20~00:37인데 영상은 12초 — 구버전 잔재).
8. **타임라인.** 진행 바 + 포인트 배열(시각, 제목 KO/EN, 첫 포인트만 hover preview). 클릭 → `currentTime` 즉시 세팅.
9. **히든 링크.** `from~until` 구간에만 마운트되는 `position:fixed` 투명 히트박스. 퍼센트 좌표 + px 크기, desktop/mobile 별도. `previewEnabled`면 테두리 표시(관리자 디버그용).
10. **엔딩.** `type:'ending'` 노드 종료 시 검은 화면 + "다시보기"(140×50) + 저작자 링크만. `type:'hidden'`도 동일.
11. **Quick Jump(DYW).** `available && type!=='ending'` 노드를 `order` 순으로 드롭다운. 발표자용 치트키. 관객용 앱(aimovie형)에서는 끈다.
12. **시네마 모드.** `type:'feature'`(60초 이상 완성작 임베드)는 레터박스 + 하단 중앙 대형 스킵 버튼. DYW에서 관찰되지만 설정에 없는 유일한 동작 — 우리는 노드 타입으로 명시한다.
13. **인트로 모드.** `language`(언어 선택 2버튼, 배경 `video-INTRO.mp4` 루프) 또는 `doors`(N개 선택지, 각각 `startVideoId`). DYW는 문 3개가 전부 `video1`로 가서 색만 다르다 — 선택지가 실제 분기하도록 만들면 더 낫다.
14. **행사 오버레이(DYW).** 인트로 위에 행사명·일시·장소·후원 로고를 얹는 선택적 레이어. 발표용 스킨.
15. **관리자 게이트.** 인앱 설정 패널과 `/admin`의 보호 수준을 **하나로** 통일(03 §3-2 `ADMIN_MODE`). DYW는 톱니 패널이 무인증으로 열려 있어 라이브 콘텐츠 상태를 누구나 바꿀 수 있다.

---

## 5. 에셋 스펙 — 무엇을 얼마나 만들어야 하나

### 5-1. 컷 구성 (aimovie 15컷 기준, "한 편"의 최소 단위)

| 타입 | 개수 | 길이 | 내용 |
|---|---|---|---|
| intro | 1 | 15~37s | 패러디 로고 + 감독 등장, 자기소개 더빙 |
| scene(포스터 앞) | 3 | 14~22s | 각 영화 포스터 앞에 서는 컷. 위=진입, 좌우=이동 |
| link(-L/-R) | 6 | 3~7s | 도보 이동 연결샷. 대사 없음 |
| feature(-IN) | 3 | 2:00~2:29 | 포스터 속 다큐/단편. 타임라인 4~6 챕터 |
| ending | 1 | 1:56 | 후기 내레이션 + 히든 히트박스 |
| hidden | 1 | 1:02 | 엔딩 마지막 프레임에서 이어지는 에필로그 |
| 합계 | 15 | 9.7분 | mp4 63 MB + mp3 25 MB + BGM 3 MB |

DYW는 여기에 발표 스토리 45컷(대부분 2~20초, 완성작 임베드 2개 72·191초)을 얹어 23분·435 MB가 됐다.

### 5-2. 인코딩 규격 (권고 = aimovie 원본 방식)

| 항목 | aimovie(원본) | DYW(확장분) | **권고** |
|---|---|---|---|
| 해상도 | 1920×1080 정규화 | 1928×1076 등 AI 툴 출력 그대로 | **1920×1080으로 정규화**(`scale=1920:-2` 후 crop/pad) |
| fps | 24 | 24 (일부 23.976·29.97 혼재) | 24 고정 |
| 비트레이트 | 평균 1.39 Mbps | 평균 5.67 Mbps, 최대 18.6 | CRF 23, ≤ 6 Mbps. 컷당 ≤ 15 MB |
| 오디오 | mp4 무음 + 언어별 mp3 | mp4 내장 | 다국어면 분리, 단일 언어면 내장 |
| 캐시 | `private, max-age=0` (매번 재요청) | 동일 | `immutable` + `?v=` (04 §6) |
| 호스팅 | Express 정적 (GAE 프론트) | 동일 | R2 + CDN (07 §2-5) |
| 포스터 | 없음 | `_q.png` 1건, `_m1` 18건 | 노드당 포스터 1장 자동 추출 |

aimovie가 DYW보다 **4배 낮은 비트레이트로 같은 체감 품질**을 냈다. 확장분은 후반 정규화 없이 생성 원본을 넣은 결과다. `tools/asset-pipeline/video_prep`이 이 차이를 자동으로 없앤다.

### 5-3. 폰트

두 사이트 모두 `@fontsource/noto-sans-kr` 풀팩을 번들해 **1,056개 파일**(약 16 MB 추정)을 배포한다. 실제 쓰는 굵기는 400/500/600, 스크립트는 한글+라틴뿐이다. 서브셋 지정으로 20개 내외로 줄인다.

### 5-4. 제작 비용 감

aimovie 한 편 = 컷 15개(후보 4배 생성 시 60클립) + 더빙 2개 언어 × 9노드 + BGM 1 + 효과음 2. 07 문서 §2-2 단가로 **약 $20~110**. 시간은 강연자 본인 기준 "1년간 예제 8개"였으므로 편당 수 주.

---

## 6. 두 사이트의 결함에서 배우는 것 (재현 시 반드시 피할 목록)

| # | 결함 | 어디서 | 우리 대책 |
|---|---|---|---|
| 1 | 공식 엔딩 2개가 라우팅에서 끊겨 도달 불가. 고아 노드 `video23` | DYW | **그래프 린트**: 시작에서 모든 `available` 노드 도달 가능, 모든 엔딩 도달 가능, 고아 0. CI에서 실패 |
| 2 | 같은 키 `videoRouting`에 사이트마다 다른 스키마. `navigation`과 중복 | 둘 다 | §3 판별 유니온 `edges` 하나로 |
| 3 | 자막 큐가 영상 길이를 초과(구버전 잔재) | DYW | 큐 검증: `end ≤ duration` |
| 4 | 긴 자막이 스킵 버튼과 겹침(데스크톱), 모바일에서 화면 밖으로 잘림 | 둘 다 | 자막 `maxWidthPercent` + 스킵 버튼 위치를 자막 영역 밖으로. 모바일 값 실제 적용 검증 |
| 5 | 모바일에서 화살표 52px·자막 35px 등 데스크톱 값이 적용되는 정황 | 둘 다 (미확인, 리사이즈만 테스트) | Playwright 모바일 에뮬레이션(UA+터치)으로 `mobile` 토큰 적용 테스트 |
| 6 | 16:9 소스를 `object-fit:cover`로 세로에 씌워 인트로 타이포·문 3개가 잘림 | 둘 다 | 인트로·분기 선택 장면은 세로 크롭본 또는 letterbox. 관리자에 `mobileFit: cover|contain` |
| 7 | 인앱 설정 패널 무인증(`/admin`만 잠김) | DYW | `ADMIN_MODE` 단일 게이트 |
| 8 | mp3 경로를 코드가 요청하지만 파일이 없어 SPA 폴백 HTML을 받음. `ERR_ABORTED` 후 재요청 패턴 | DYW(mp3), aimovie(중복 fetch) | 에셋 존재 여부를 `available-videos`처럼 서버가 알려주고 없는 트랙은 요청하지 않음 |
| 9 | `video3-L/-R` 미완성 분기가 데이터에 남음 | aimovie | `available:false` 방어는 유지하되, 린트에서 "미배포 노드 n개" 경고 |
| 10 | 포스터 오타 "ALGORTHHMS" | aimovie | 이미지 안 텍스트는 관리자 텍스트 필드로 빼거나(오버레이), 납품 전 검수 항목 |
| 11 | `Cache-Control: private, max-age=0`으로 435 MB를 매번 재요청 | 둘 다 | `immutable` + `?v=` |
| 12 | 폰트 1,056파일 | 둘 다 | 서브셋 |
| 13 | 문 3개 선택이 전부 같은 노드로 감(가짜 분기), DYW 메뉴 2개가 같은 노드로 수렴하는 경우 다수 | DYW | 가짜 분기는 연출로 허용하되 린트에서 "동일 타깃 메뉴" 표시 |
| 14 | 사운드 이펙트·자막 기본 OFF라 설계된 피드백이 체감되지 않음 | DYW | 템플릿 기본값 ON |
| 15 | `availableFilesCount:14`인데 실제 13 | aimovie | 카운트는 서버가 파일 존재로 계산 |

---

## 7. 제작 과정 역추정

1. **그래프를 먼저 쓴다.** `available:false` 노드가 데이터에 남아 있고 UI가 이를 방어한다 = 영상이 없어도 그래프가 먼저 존재했다. 04 §3-1과 일치.
2. **컷 타입별 길이가 정형화되어 있다.** 연결샷 3~7초, 포스터 컷 15~22초, 다큐 2분대. 프롬프트 템플릿이 타입별로 있었을 것이다.
3. **스타트/엔드 프레임 체인.** `video5-IN` 끝 = `video6-HIDDEN` 시작이 픽셀 단위로 같다. 마지막 프레임을 추출해 다음 컷의 스타트 이미지로 넣는 Kling 방식(01 §3-2).
4. **원본은 후반 정규화, 확장분은 생성 원본.** 해상도·비트레이트 분포가 증명. 15컷은 정성껏, 45컷은 속도 우선.
5. **더빙·자막은 영화에만.** 발표용 포크에서는 제거. 용도가 파이프라인을 결정한다.
6. **관리 계층은 콘텐츠가 늘어난 뒤에 생겼다.** `dynamicVideos`(38개), `deletedVideos`(11개), `videoGroups`, `videoOrder`가 전부 DYW에만 있다. 15편일 땐 필요 없던 것이 45편에서 필요해졌다. 우리 템플릿은 처음부터 넣는다.

---

## 8. 기존 문서 반영 **[문서 반영]**

| 문서 | 변경 |
|---|---|
| 02 §B·C | "aimovie는 화살표만, DYW는 핫스팟 추가"로 정정(02 초안이 맞았고, 07 리서치 r-dyw의 "aimovie도 핫스팟 보유"는 오류). z-index·thumbnails·available-videos는 DYW 전용 API |
| 03 §3-1 `video-flow` 스키마 | `navigation`/`videoRouting`/`hiddenLinks` → `edges` 판별 유니온으로 교체. 노드 `type` 추가 |
| 03 §3-7 `video-kit` | §4의 15개 요구사항으로 확정. hls.js 제외, 듀얼 video + mp4 |
| 03 §3-2 `core-admin` | Visit State Control, Reset State, 섹션별 BGM, 색상 마스터/저장색 항목 추가. 인앱 패널과 `/admin` 단일 게이트 |
| 03 §3-3 `inline-editor` | Quick Edit를 편집 툴바로 승격. 톱니 패널 재현 + `masterColor`/`savedColors`/`colorMasterRefs` 팔레트 차용 |
| 04 §3-3 인코딩 | 1080p 24fps CRF 23 ≤ 6 Mbps, 컷당 ≤ 15 MB로 상향 조정(기존 ≤ 8 Mbps·40 MB보다 엄격) |
| 04 §5 성능 예산 | 폰트 서브셋 ≤ 20파일, 초기 로드에 인트로 mp4 1 + 첫 노드 mp4 1만 |
| 05 B 카탈로그 | 기본 기능에 타임라인·히든 링크·BGM 섹션·3트랙 오디오·`available` 방어 추가. 확장 슬롯에 핫스팟 메뉴·문 선택 인트로·Quick Jump·시네마 모드·행사 오버레이·색상 마스터·그룹/정렬/소프트삭제. 에셋 요구를 §5-1 컷 구성표로 |
| 실행 플랜 N9/N10 | "aimovie 동등"의 정의 = §2 ◎ 항목 + §4 1~10 + §6 린트. N10 시드는 `research/aimovie/api/` JSON을 `edges`로 변환한 것 |
| 실행 플랜 N14 | 그래프 린트·자막 큐 검증·모바일 토큰 적용 테스트를 검증 항목에 추가 |

---

## 9. 재현 로드맵 (패밀리 B)

| 마일스톤 | 완료 기준 | 검증 |
|---|---|---|
| **M1 aimovie 동등** | §2의 ◎ 규칙 8개 + §4 1~10 구현. `research/aimovie/api/` JSON을 `edges` 스키마로 변환한 시드로 플레이스홀더 영상 15컷 재생. 화살표·글로우 전환·타임라인 점프·히든 히트박스·엔딩·리플레이 동작 | Playwright: 13개 노드 전 경로 + 히든 엔딩 도달. 그래프 린트 통과. 성능 예산 |
| **M2 DYW 동등** | 핫스팟 메뉴 + 질문 헤딩 + 실루엣 호버, 문 선택 인트로, Quick Jump, 시네마 모드, 행사 오버레이, 색상 마스터, 그룹/정렬/소프트삭제 | DYW 시드(69노드)로 47노드 경로 재생. 끊긴 엔딩이 린트에서 잡히는지 |
| **M3 툴 완성** | 앱 안에서 영상 업로드·엣지 편집·핫스팟 좌표 드래그·자막 편집·시간창 히든 링크 편집. flow-editor(React Flow)에서 그래프를 그리면 `edges`가 나온다 | "바이브 코딩 없이 다음 작품" — 새 15컷을 관리자만으로 등록해 재생 |

M1이 끝나면 **영상 15컷 + 더빙 + BGM만 준비하면 aimovie와 같은 구조의 작품이 나온다.** 그 15컷을 만드는 방법이 04 가이드 §3과 07 §2-2다.

---

## 10. 정정 로그 · 미확인

**두 리서치 간 모순 해결**
- "aimovie도 핫스팟이 있다"(dyw/01 §5.5) → **틀림**. aimovie 번들과 설정에 `hotspot`·`menus` 문자열 0건(aimovie/01 §3.2). 핫스팟은 DYW 신규. 02 문서 초안이 맞았다.
- "DYW 플레이 중 gryun-aimovie.com 탭이 자동으로 반복해서 열린다"(dyw/02 §9) → **사이트 결함 아님**. 두 분석 에이전트가 같은 Playwright 브라우저를 공유해 생긴 충돌(aimovie/02 환경 노트). 단, DYW `video43-2` "EDIT" 버튼이 확인 없이 외부 도메인으로 이동하는 것은 실제 동작.
- "DYW는 mp3를 별도 audio로 재생"(dyw/02 §3) vs "mp3 파일 0개"(dyw/01 §4) → 둘 다 맞다. 코드는 요청하지만 파일이 없어 SPA 폴백을 받는다. 오디오는 mp4 내장. §6-8의 근거.
- "히든 엔딩은 비밀번호 → 히든"(01 §4-3-1, 강연) vs "쓰레기통 클릭 → 즉시 히든, 입력 없음"(aimovie/02 §3.3) → 현재 배포에는 입력 단계가 없다. 강연의 "비밀번호가 다음 작품의 암호"는 **히든 엔딩 영상 안에서 보여주는 코드**를 다음 작품에서 쓴다는 뜻일 가능성이 크다(추정). 04 §4-3-1의 `secretCode`는 "노출되는 코드"로 해석해 유지.

**미확인 (재검증 필요)**
1. 모바일 실기기에서 `mobile` 디자인 토큰이 적용되는지(뷰포트 리사이즈만으로는 데스크톱 값 관찰)
2. aimovie 언어 토글 시 더빙 mp3가 `/videos/EN/`으로 실제 교체되는지
3. DYW `video3_IN`("쇼릴 보기") 실제 콘텐츠, `video2-G/R`(초록·빨강 문) 경로, `video6_NO` 분기
4. DYW 톱니 패널의 Design/Routing/Subtitles/Intro 탭 내부 UI (General 탭만 기록)
5. 정확한 초기 로드 바이트·첫 재생까지 ms (정성 관찰만)
6. `video-INTRO.mp4`(aimovie 실존)를 참조하는 설정 필드
7. 폰트 1,056파일 총 용량(표본 추정 ~16 MB)

**보고서·원본**: [aimovie API·에셋](research/aimovie/01-api-and-assets.md) · [aimovie 플레이](research/aimovie/02-experience-walkthrough.md) · [DYW API·에셋](research/dyw/01-api-and-assets.md) · [DYW 플레이](research/dyw/02-experience-walkthrough.md). 스크린샷은 분석용으로 축소 보관(`research/*/shots/`), 상대 사이트의 JS/CSS 번들 사본은 저작물이라 저장소에 남기지 않았다.
