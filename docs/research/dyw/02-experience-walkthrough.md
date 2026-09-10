# Design Your World — 경험 워크스루 (실플레이 기반)

대상: https://design-your-world.replit.app/ (김그륜, "AI Interactive Presentation", INSIGHT OUT 전시용 빌드)
방법: `/api/video-flow`, `/api/app-settings` 전수 조사 + Playwright로 데스크톱(1440×900)·모바일(390×844) 실플레이, DOM/네트워크/콘솔 계측.
스크린샷: `./shots/` (24장, 상대경로)

---

## 1. 플레이 경로 요약

그래프는 사실상 **두 개의 독립된 트랙**으로 이루어져 있다.

- **트랙 A "3편의 단편영화" (video1~5, -R/-L/-IN 변형)**: 문 선택 → 책상 위 사물(모니터/트로피/연습장) 조사 → 각 사물이 짧은 단편영화(AI Evolution / A-Eye / AI Story)로 연결되는 구조. 공식 엔딩(`isEnding:true`)인 `video5-IN`, `video6-HIDDEN`은 **현재 라이브 빌드의 메뉴 라우팅에서 도달 불가능**하다(아래 9절 참조). `video3-L/-IN`, `video4-L/-IN`, `video5-L/-IN`은 `available:false`로 에셋 자체가 없다.
- **트랙 B "하루 일과" (video6~45)**: 연습장 스탠드를 켜는 순간 진입, 만화 스타일 회상 → 학교/입시 → 첫 회사 생활 → AI 툴 도입 → Skyfall/Doom Patrol 등 실제 완성작 임베드 → 메이킹 스텝(IMAGE/EDIT/VIDEO/VIBE) → `video45`에서 "처음으로 돌아간다"로 `video1` 루프. 이 트랙에는 공식 엔딩 플래그가 없고, **`video45`→`video1` 루프가 사실상 유일하게 도달 가능한 결말**이다.

**실제 방문 순서** (대표 경로, 총 47개 고유 노드 / Quick Jump에 노출된 62개 중):
`video_intro_loop → video1(파란문) → video2 → video3(모니터) → video3-R(쇼릴 버튼 오조작으로 재도달) → video4(트로피) → video4-R → video5(연습장) → video6 → video7 → video8 → video9 → video10 → video11 → video12 → video13(3지선다) → video14 → video15 → video16 → video17 → video18(디스크 색) → video19 → video20 → video20_IN → video21 → video22 → video22_IN → video22_IN_END → video24 → video25(Skyfall, 191초) → video26 → video27 → video28 → video29 → video30 → video31 → video32 → video33(Doom Patrol, 72초) → video34 → video35 → video36 → video37 → video38 → video39 → video40 → video41 → video42 → video43 → video43-1 → video43-2(→ 외부 도메인 gryun-aimovie.com로 이탈) → [Quick Jump로 복귀] → video45(엔딩, video1로 루프)`

**도달한 엔딩**: 1개 — `video45`의 "Return to the beginning." (검은 화면 + 버튼, video1로 순환). 공식 엔딩 2종(`video5-IN`, `video6-HIDDEN`)은 도달 실패(아래 9절).

---

## 2. 노드별 기록

### 핵심 분기 노드 (스크린샷 있음)

| 노드 | 장면 | 길이(s) | 버튼표시(s) | UI | 글로우 | 스킵 | 스크린샷 |
|---|---|---|---|---|---|---|---|
| video_intro_loop | 안개 낀 들판, 행사 타이틀 "AI INTERACTIVE PRESENTATION / BY GRYUN KIM", 루프 | 15.0(루프) | — (전체화면 "Start" 히트존) | 풀스크린 클릭 | 없음 | 없음 | [00-load](./shots/00-load.png) |
| video1 | 안개 들판, 문 3개(적/청/녹) 고정 샷 | 12.05 | 1 | 텍스트 메뉴 3 + 문별 히트존 | 파랑(2번, 기본) | 있음 | [video1-mid](./shots/video1-mid.png) |
| video2 | 책상 위(모니터/트로피/연습장), 줌인 | 5.53 | 3 | 텍스트 메뉴 3 + 사물 히트존 | 없음 | 있음 | [video2-hotspots](./shots/video2-hotspots.png) |
| video3 | 모니터 화면 내부, Win98풍 바탕화면(쇼릴/휴지통/Starcraft 등) | 3.54 | 1 | 메뉴 2("쇼릴보기"/"뒤로가기") | 1(왼쪽), 조건부 3(visitedVideo3In) | 있음 | [video3-arrows](./shots/video3-arrows.png) |
| video3-R | video3와 동일 프레임(재방문용) | 3.5 | 1 | 사물 히트존 메뉴 3 | 없음 | 있음 | [video3-IN-after](./shots/video3-IN-after.png) |
| video4 | 유튜브 플레이버튼 플라크 + 에미상 트로피 클로즈업 | 3.96 | 1 | 메뉴 1("뒤로가기") | 2, 조건부3 | 있음 | [video4](./shots/video4.png) |
| video5 | 스케치북 클로즈업(연필/마카/콘셉트 드로잉) | — | 1 | 메뉴 1("스탠드를 켠다") | 1 | 있음 | [video5-notebook2](./shots/video5-notebook2.png) |
| video6 | 스탠드가 켜진 동일 프레임(연속성 컷), 오렌지 톤 | — | 1 | 메뉴 1("다음장으로 넘긴다") + 책 히트존 | 없음 | 없음 | [video6-comic](./shots/video6-comic.png) |
| video7 | 스케치북에서 만화 세계로 진입 직전 컷 | — | 1 | 메뉴 1("만화속으로 들어간다") + 히트존 | 없음 | 없음 | [video7-comicworld](./shots/video7-comicworld.png) |
| video8 | **연필 스케치 코믹 스타일**로 전환, 미술관 뒷모습(부모-아이), 말풍선 "화가가 될 거야" | — | 1 | 메뉴 2(둘 다 video9로 수렴 — 가짜 선택) | 없음 | 없음 | [video8-choice](./shots/video8-choice.png) |
| video13 | 코믹 스타일, 촬영 소품(삼각대/카메라) 앞 소년 | — | ? | 메뉴 3("Pen Spinning"/"Beatbox"/"Both") | **3번(Both)** | 없음 | [video13-3way](./shots/video13-3way.png) |
| video18 | 컴퓨터 본체 위 플로피디스크 2장("USA"/"KOREA") | — | 1 | 메뉴 2(Red/Blue) + 디스크 히트존 | 없음 | 없음 | [video18-disc](./shots/video18-disc.png) |
| video20 | 회의실, "이희복 감독 스타일프레임" 진입 | — | 1 | 메뉴 1(히트존만, 텍스트버튼 없음) | 없음 | 있음 | [video20-styleframe](./shots/video20-styleframe.png) |
| video25 | **"Skyfall" 풍 완성작 임베드**, 붉은 크리스탈 코스튬, 레터박스 | **191.3** | — (스킵만) | 하단 중앙 알약형 "Skip" | 없음 | **있음(중앙배치, 코너배치와 다름)** | [video25-skyfall](./shots/video25-skyfall.png) |
| video34 | 코믹→실사, "나디아에게 보낼 내용" 선택 | — | 1 | 메뉴 2 | 2 | 없음 | [video34-nadia](./shots/video34-nadia.png) |
| video43-1 | 메이킹 4단계 탭(IMAGE/EDIT/VIDEO/VIBE) 첫 화면 | 48.1 | 5 | 메뉴 1("IMAGE") | 없음 | 있음 | [video43-1-steps](./shots/video43-1-steps.png) |
| video43-2 | 메이킹 "EDIT" 단계 — **클릭 시 외부 도메인으로 이탈** | — | — | 메뉴 1("EDIT") → `https://gryun-aimovie.com/` | — | — | [external-aimovie](./shots/external-aimovie.png) |
| video45 | 완전 암전 화면 | 35.7 | 34.7(거의 끝) | 메뉴 1("Return to the beginning.") | 없음 | 없음 | [video45-ending](./shots/video45-ending.png) |

### 나머지 선형 노드 (요약, 스크린샷 생략)

대부분 1초 내 버튼 표시, 텍스트 메뉴 1~2개(대부분 "다음 행동을 선택하세요"류 가짜 분기), 스킵 버튼 없음. 실측 길이(초): video9 ~2.5 · video10 ~2.5 · video11 ~3.5 · video12 ~3 · video14~17 각 ~3 · video19 짧음(히트존만) · video20_IN ~2 · video21 ~2.5 · video22 ~2 · **video22_IN 56.8**(테스트 영상 감상) · video22_IN_END 10.7 · video24 13.7 · video26 5.5 · video27 17.7 · video28 8.6 · video29 12.7 · video30 11.8 · video31 41.2 · video32 19.8 · **video33 72.0**(Doom Patrol 완성작 임베드) · video35 34.1 · video36 70.3 · video37 15.0 · video38 12.3 · video39 17.0 · video40 19.9 · video41 10.1 · video42 9.8 · video43 12.1 · video44/video43-3~5 미실측(도달만 계획, 외부 이탈로 순서 일부 우회).

---

## 3. 공통 UI·핫스팟·오디오

**Quick Jump**: 62개 항목 노출(`1. video_intro_loop` ~ `62. video45`). `available:false` 변형(-L, dash-IN)과 두 공식 엔딩(`video5-IN`, `video6-HIDDEN`)은 목록에서 **의도적으로 제외**됨. [quickjump-list](./shots/quickjump-list.png)

**언어 토글**: 상단우측 pill, "EN →KR" 형태로 클릭 시 전환 예고 표시. 실측 스타일은 4절 참조. 이번 세션은 EN 모드로 대부분 진행.

**설정 패널(톱니 아이콘)**: **로그인 없이 완전히 열림** — 탭 5개(General/Design/Routing/Subtitles/Intro) + "Hidden Tabs Info" 버튼(alert: "Currently hidden tabs: Timeline, Hidden — Unhide them by uncommenting in the code."로 2개 탭이 코드상 비활성화되어 있음을 자백). General 탭에는 Subtitle/Quick Edit/Instant Arrow/Auto Button 토글, Reset State(방문 이력 초기화), Created-by 링크 편집, Visit State Control(video3-IN/4-IN 방문 플래그 수동 토글, "Current Video" 표시), BGM 섹션별 on/off·볼륨·전환시간, Sound Effects(Hover/Click, **둘 다 기본 OFF**), Show Copyright 토글이 모두 들어있고 "Update" 버튼은 값 변경 전까지 비활성 상태. [settings-panel](./shots/settings-panel.png)

**`/admin`**: Replit OAuth 로그인 벽 확인, 로그인 시도하지 않음. [admin-route](./shots/admin-route.png)

**히든 링크(이스터에그)**: `app-settings.hiddenLinks`에 정확히 1개 정의 — `video5-IN`의 01:20~01:33 구간, 화면 좌표(77%,79%)~400×200px 박스, 목표 `video6-HIDDEN`, `previewEnabled:false`(평상시 완전히 안 보임). 그러나 **호스트 영상 `video5-IN` 자체가 어떤 메뉴에서도 연결되지 않아** 이 이스터에그는 현재 실행 경로상 도달이 불가능한 상태로 확인됨(비밀번호 추측 등은 시도하지 않음).

**핫스팟**: 클릭 영역은 대부분 사물의 실루엣을 정확히 감싸는 사각형(때로 회전/비정형)이며, 호버 시 amber(#FFAE00) 윤곽선 글로우가 사물 형태를 따라 표시되고 커서는 `pointer`로 변경됨(video2 트로피, video18 플로피디스크에서 확인). 예시 좌표(1440 기준): video1 문 3개 각 196.4×443.3px(x=252/642/1026, y=251) · video2 모니터 251×203@(851,369) · 트로피 287×203@(817,131) · 연습장 377×105@(1423,645).

**오디오**: BGM 루프(`/BGM/bgm.mp3`, 기본볼륨80%, 전환2초, 노드별 on/off 리스트로 섹션 관리) + 노드별 더빙 내레이션(`/videos/EN/<id>.mp3`, 한국어는 `/KO/` 경로로 추정, video와 별도 `<audio>` 엘리먼트로 동기 재생) + 효과음 파일(`/audio/on.wav` 호버, `/audio/click.wav` 클릭)이 전 UI에 배선되어 있으나 **Sound Effects 설정이 기본 꺼짐** → 실제 플레이에서는 호버/클릭 사운드가 들리지 않음.

---

## 4. 디자인 실측 값

**화살표 버튼**(desktop, app-settings.design): circleSize 52px, arrowSize 20px, strokeWidth 1, arrowColor #c7c7c7, circleColor #474747@80%. Hover: 200ms, scale1.05, 흰색, sound `on.wav`. **글로우(권장 경로)**: 빨강 #ef4444, circleOpacity 50%, `glowAnimation:true`(속도1.5, 15→45% 펄스), hover 시 진한 빨강 80%. Mobile: circleSize 40px(데스크톱 대비 -23%), 나머지 동일.

**메뉴/선택 버튼**(getComputedStyle 실측, video1 문 버튼): `font-family:"Noto Sans KR"`, `font-size:24px`, `font-weight:400`, `background:rgba(0,0,0,0.8)`, `border-radius:22px`, 폭 368×높이 53.3px 고정(뷰포트 무관). 글로우형(권장 경로): `border:0.67px solid <color>`, `box-shadow:0 0 15px 8px rgba(<color>,0.74)`. 질문 헤딩: Noto Sans KR 26px/weight500, 흰색, text-shadow(blur4, rgba(0,0,0,.5)). 메뉴 아이템 hover 텍스트색 `#FFAE00`.

**스킵 버튼**: desktop 85×42px, padding-x20, 14px/600, `#b8b8b8`→hover 흰색, 배경 검정80%, 테두리 `#363636`. Mobile 85×32px(높이만 축소). **예외**: video25(191초 장편 임베드)에서는 스킵 버튼이 하단 중앙에 더 크고 둥근 알약형으로 렌더링되어 다른 노드의 좌상단 미니 스킵과 스타일·위치가 다름(의도된 "시네마 모드" 처리로 추정, 문서화되어 있지 않음).

**자막**(desktop KO): Noto Sans KR, weight600, 35px, letter-spacing -0.5, 수직위치 85%(하단), 색상 `#f3c614`(golden yellow — 언어토글 active색·리플레이 hover색과 동일 계열), text-shadow(1,1,blur2,65%), fade 1s. **주의**: Settings의 "Subtitle Button" 토글이 기본 OFF라 실제 플레이 중 자막이 뜨지 않으며, video1의 KO 자막 타임스탬프(00:20~00:37)가 실제 video1.mp4 길이(12.05s)를 초과해 타이밍 자체가 깨져 있음(구버전 컷 잔재로 추정).

**인트로 타이포**: "AI INTERACTIVE PRESENTATION" 초대형 볼드 산세리프 올캡 + "BY GRYUN KIM" 서브헤딩. 행사 정보(2026.02.06 FRI 13:00-18:00, 섬유센터빌딩 Tex+Fa HALL)와 후원사 로고(+X Design, Fast campus, INSIGHT OUT)가 좌하단에 배치 — 이 빌드가 순수 포트폴리오가 아니라 **전시/행사용 커스텀 빌드**임을 시사.

**폰트**: 네트워크 로그상 `noto-sans-kr-latin-400-normal.woff2`, `-500-normal.woff2` 로드 확인. UI 전반(자막 포함) 단일 패밀리 "Noto Sans KR"만 사용, 굵기 400/500/600 구분.

---

## 5. 모바일 (390×844)

- **인트로**: 16:9 원본을 `object-fit:cover`로 세로 화면에 씌우는 방식이라 초대형 타이포가 좌우로 크롭되어 "RACTIVE / ATION"처럼 단어가 잘려 보임(전체 단어는 화면 밖). [mobile-intro](./shots/mobile-intro.png)
- **video1 문 선택**: 과도크롭으로 **파란 문 1개만 보이고 적/녹 문은 화면 밖으로 사라짐**. 로드 중간 프레임에서는 질문 텍스트가 "Whic|"처럼 잘려 보였다가(페이드 인 중 컨테이너 폭 재계산 지연으로 추정) 완전 로드 후에는 텍스트 완결·버튼 3개 모두 정상 노출됨. [mobile-video1-c](./shots/mobile-video1-c.png)
- **video2 히트존 화면**: 세로 구도 장면(책상 위 선반)은 크롭 손실이 적어 모니터·트로피 오브젝트와 글로우 윤곽선이 모두 온전히 보임 — 장면 구도에 따라 모바일 크롭 영향이 크게 갈림. [mobile-video2-hotspot](./shots/mobile-video2-hotspot.png)
- **터치 타깃**: 메뉴 버튼 실측 368×53px로 데스크톱과 **동일 px 값**(반응형 breakpoint별 축소 없음) — 390px 폭 기준 화면의 약 94%를 차지해 오히려 터치하기엔 넉넉함. 높이 53px는 44px 권장 기준 상회.
- **저해상도 에셋(`_m1` 등)**: 네트워크 로그에서 `_m1/_m2/_m3.png`는 desktop·mobile 공통으로 요청되는 "moment 썸네일"(재생용 mp4와 별개)로 확인, **모바일 전용 저해상도 mp4 변형은 발견되지 않음** — 모바일도 동일 해상도 mp4를 그대로 받는다.

---

## 6. 성능·에러

- **콘솔 에러**: design-your-world.replit.app 자체에서 발생한 JS 런타임 에러 없음. 유일한 에러는 `GET /api/auth/user → 401`(비로그인 상태의 관리자 세션 체크, 정상적인 기대 동작).
- **초기 로드 네트워크 패턴**: 첫 인터랙션(문 클릭) 이전에 이미 JS 번들, CSS, `video-flow`/`available-videos`/`z-index`/`thumbnails`/`app-settings` API 4~5건, `video_intro_loop.mp4`, `video1.mp4`(선반영 프리로드), `video2.mp4`(다음 다음 노드까지 프리로드), BGM mp3, 언어별 내레이션 mp3, 포스터/모먼트 PNG 여러 장이 요청됨 — 노드 전환 1회당 대략 mp4 1 + poster 1 + moment png 2~3 + 내레이션 mp3 1 = **6~8개 요청**이 붙는 구조. 정확한 총 바이트 수는 이번 계측 도구로는 얻지 못함(정성적으로만 보고).
- **전환 체감**: 이중 `<video>` 레이어(z-index 0/1) 크로스페이드 + 다음 노드 프리로드 조합 덕분에, 관찰한 전환들에서 암전 프레임이 눈에 띄지 않았다(정밀 프레임 단위 측정은 스크린샷 방식의 한계로 수행하지 못함).

---

## 7. 품질 요소 분석

**잘한 것**
- **컷 연결의 연속성**: video5→video6("스탠드를 켠다") 전환이 동일 프레임·동일 구도에서 조명 상태만 바뀌는 방식으로 처리되어, 사용자의 클릭이 "그 세계에 실제로 개입했다"는 인과감을 준다. 이 수준의 프레임 매칭이 여러 전환에서 반복된다.
- **톤/스타일 전환의 명확한 동기화**: 실사풍 AI 영상 → 연필 스케치 코믹 스타일(video8~)로의 전환이 "어린 시절 회상"이라는 내러티브 전환점과 정확히 맞물려 있어 이질감이 아니라 의도로 읽힌다.
- **임베드된 완성작의 밀도**: video25(191초, Skyfall풍)·video33(72초, Doom Patrol풍) 같은 풀프로덕션 단편을 인터랙티브 내러티브 속에 자연스럽게 끼워 넣어, 포트폴리오 쇼릴과 스토리텔링을 한 경험으로 묶었다. 레터박스·전용 스킵 버튼 배치 등 "이건 영화관 모드"라는 신호를 UI로 구분해 준 점도 세심하다.
- **절제된 UI**: 메뉴/화살표/스킵/퀵점프 등 상시 UI가 작고 반투명하며 화면 중앙 콘텐츠를 침범하지 않는다. 글로우(추천 경로) 표시가 과하지 않은 red pulse 애니메이션으로 은근하게 유도한다.
- **핫스팟 프리뷰의 디테일**: 사각형이 아니라 사물 실루엣을 따라가는 amber 아웃라인 호버가 "이 세계는 인터랙티브 오브젝트로 채워져 있다"는 신뢰를 준다.

**거친 것**
- 공식 엔딩 2종이 현재 라우팅에서 고아 노드가 되어 있고, 유일하게 도달되는 결말(video45)이 완전 암전+텍스트 버튼뿐이라 지금까지 쌓은 프로덕션 밀도에 비해 마무리가 급격히 떨어진다.
- 모바일 크롭이 장면별로 결과가 크게 갈린다(인트로/도어 장면은 파손 수준, 책상 장면은 무해) — 세로 프레임을 별도로 준비하지 않고 동일 16:9 소스에 `object-fit:cover`만 적용한 한계.
- 사운드 이펙트·자막 등 설계된 피드백 레이어가 기본값 OFF라 실제 체감 품질이 설정값보다 낮게 느껴진다.
- 관리자 패널이 로그인 없이 완전히 열려 있어(반면 `/admin` 라우트는 정상적으로 잠겨 있음), 문서화되지 않은 진입 경로로 실서비스 콘텐츠 상태를 바꿀 수 있는 구조적 리스크가 있다.
- "쇼릴 보기"(video3_IN) 등 버튼은 존재하나 실질 콘텐츠가 비어 있는 듯한 스텁 노드가 남아 있다.
- 테스트 중 반복적으로 별개 도메인(gryun-aimovie.com) 탭이 자동으로 열리는 현상을 다수 관찰했다(원인 미확정, 9절 참조) — 재현 시 사용자 경험을 크게 해칠 수 있는 항목.

---

## 8. 재현 체크리스트 (동일 퀄리티로 만들기 위한 구현 목록)

1. **분기 그래프 엔진**: 노드=영상, 엣지=메뉴/히트존/화살표 3종 내비게이션을 지원하는 JSON 기반 라우팅(`navigation`, `routing.menus[].targetVideoId`, `defaultGlow`, `glowCondition`, `setsFlag`) + 방문 플래그(예: `visitedVideo3In`)로 조건부 글로우/분기 전환.
2. **이중 버퍼 비디오 플레이어**: `<video>` 2장을 z-index 크로스페이드로 겹쳐 전환 시 암전 없이 넘기고, 남는 3장은 다음 후보 노드 prefetch용 풀로 사용.
3. **프리로드 파이프라인**: 현재 노드 도달 즉시 다음 1~2개 후보 mp4/포스터(`_q.png`)/모먼트 썸네일(`_m1~m3.png`)을 백그라운드 요청.
4. **메뉴 UI 컴포넌트**: 질문 헤딩 + N개 pill 버튼(색상별 글로우 variant, box-shadow pulse 애니메이션) + 매칭되는 비정형 히트존(오브젝트 실루엣 아웃라인 호버).
5. **화살표 내비게이션 컴포넌트**: 좌/상/우 원형 버튼, hover scale+색 전환+효과음, 추천 경로 red glow pulse.
6. **스킵/퀵점프/언어토글/리플레이/설정 공통 UI**: 각각 데스크톱/모바일 별도 치수 토큰(디자인 JSON으로 외부화), Quick Jump는 `available:true`이면서 엔딩이 아닌 노드만 자동 노출.
7. **오디오 레이어 3종**: BGM 루프(섹션별 on/off 리스트 + 전환시간), 언어별 더빙 mp3(비디오와 별도 동기 재생), 호버/클릭 SFX(기본 on 권장 — 이번 사이트는 꺼져 있어 손해를 봄).
8. **자막 시스템**: 언어별 타임코드 큐(자동 fade in/out), 반드시 실제 영상 길이와 큐를 일치시키는 검증 스텝 포함.
9. **히든링크(이스터에그) 시스템**: 특정 노드의 특정 구간(startTime~endTime)에만 활성화되는 비가시 히트존 + 어드민에서 좌표/시간/타깃을 편집하는 UI. 단, 호스트 노드가 그래프에서 끊기지 않도록 라우팅 정합성 검증이 필요(이번 사례의 실패 원인).
10. **관리자 패널**: 콘텐츠 편집(Routing/Design/Subtitles/BGM 섹션/Intro)과 진짜 인증(예: `/admin`처럼 OAuth) 사이에 **일관된 게이트**를 두어야 함 — 인앱 Settings 패널과 라우트 레벨 관리자 보호 수준을 통일.
11. **모바일 대응**: 최소한 세로 핵심 장면(인트로/분기 선택)은 별도 크롭/구도 또는 letterbox 처리로 요소 잘림 방지.
12. **완성작 임베드 모드**: 장편(1분 이상) 클립에는 레터박스 + 전용 스킵 버튼 등 "시네마 모드"임을 알리는 별도 UI 변주.
13. **행사/브랜드 오버레이**: 인트로에 이벤트명·일정·후원사 로고를 얹을 수 있는 선택적 레이어(재사용 가능한 프레젠테이션 스킨).

---

## 9. 미탐색·실패 항목

- **`video3_IN`("쇼릴보기") 실제 콘텐츠 미확인**: 버튼 클릭이 실제로는 인접한 "뒤로가기" 버튼(`video3-R`)으로 잘못 들어가 재현하지 못함(같은 화면에서 positional testid 순서를 오판). config상 `video3_IN`은 "뒤로가기"만 있는 스텁으로 보이나 100% 확증은 아님 — 재검증 필요.
- **공식 엔딩 `video5-IN`, `video6-HIDDEN` 미도달**: 현재 메뉴 라우팅에 진입 경로가 없어 Quick Jump·정상 플레이 모두로 접근 실패. 실제 2개 엔딩 영상의 비주얼/서브타이틀은 API 텍스트로만 확인(자막 데이터에 전문 존재).
- **히든링크 이스터에그**: 좌표·시간대는 확인했으나 호스트 영상이 끊겨 있어 실제 클릭 재현 불가(비밀번호 요소는 없음, 접근성 문제).
- **`video23`**: Quick Jump에는 존재하나 그래프 내 어떤 노드의 `navigation`/`routing`에서도 타깃으로 지정된 곳을 찾지 못함(고아 노드로 추정, 직접 Quick Jump로는 방문 안 함).
- **video2-G/video2-R(초록/빨강 문) 분기**: config상 video2와 라우팅·핫스팟이 동일함을 확인했지만, 실제 플레이로는 블루 문(`video2`) 경로만 진행함.
- **video6_NO 분기("연습장을 살핀다")**: video6("스탠드를 켠다")만 플레이, 대안 분기 미실행.
- **Design/Routing/Subtitles/Intro 설정 탭**: General 탭만 상세 기록. 나머지 탭은 열지 않음(값 변경 리스크 최소화 목적, API JSON으로 대부분 값은 이미 확보).
- **비활성화된 관리자 탭 2종(Timeline, Hidden)**: 코드 주석 처리 상태로 확인만 하고 실제 진입은 불가.
- **video25/video33 임베드 완성작 전체 관람**: 각각 1개 타임스탬프만 샘플링, 전체 재생 미실시.
- **자막 실제 렌더링 미확인**: 기본 OFF + video1 타이밍 불일치로 라이브 스크린샷을 얻지 못함(세팅값 임의 변경은 하지 않음).
- **Replay 버튼 미관측**: 디자인 토큰은 확보했으나 실제 등장 조건(완전 정지/루프 종료 등)을 재현하지 못함.
- **정확한 총 네트워크 바이트/로드 타임**: 도구 한계로 정성적 설명만 제공, 수치화된 성능 지표는 확보하지 못함.
- **반복적 외부 탭 자동 오픈 현상**: 세션 내내 `gryun-aimovie.com` 탭이 예측 불가한 시점에 반복적으로 열려 조사를 방해함. 특정 클릭과의 인과관계를 확정하지 못했고(EDIT 버튼 최초 클릭 이후 클릭과 무관하게 재발), 실제 사이트 결함인지 자동화 도구 특유의 아티팩트인지 이번 세션만으로는 판별 불가 — 실브라우저 재현 테스트 필요.

