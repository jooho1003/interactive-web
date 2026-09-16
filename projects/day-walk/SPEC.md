# 하루 산책 · Day Walk — 설계 스펙

패밀리 E(`visual-routine`) 첫 작품. 작성 2026-09-14.

## 역할 분담
| 누가 | 무엇을 |
|---|---|
| Claude | 이 스펙, `AGENTS.md`, 최종 리뷰 |
| Codex | 구현 전부 (`app/`), 테스트, 성능 예산 통과 |

**이 문서가 계약이다.** 여기 없는 기능은 만들지 않는다. 모호하면 멈추지 말고 가장 단순한 해석을 택하고, 그 선택을 `app/README.md` "구현 메모"에 한 줄로 남긴다.

---

## 1. 무엇을 만드는가

하루를 **아침까지 / 점심까지 / 저녁까지** 세 마감으로 나눈 투두 앱이다. 할 일은 동네 길가의 집이 되고, 지붕에 깃발이 꽂힌다. 캐릭터는 현재 시각을 따라 왼쪽에서 오른쪽으로 걷고, 따라다니는 새가 "아침까지 뭐 해야 돼"라고 말을 건다.

근거 — 강연 2편 15:55~18:31 (`docs/transcripts/02-게임-영화-툴-시연.txt:363-419`, `docs/06-강연-영상-분석.md` §1-4·§4-5, `docs/05-템플릿-카탈로그.md` §E):

> "투두리스트를 오늘 해야 될 일을 막 10개 이렇게 쓰면은 사실 3개, 4개 하기도 쉽지 않잖아요. 그래서 저는 데드라인을 좀 하루로 3등분을 나눠요."
> "왼쪽에서 오른쪽으로 걸어가는 느낌으로 만들었고 (…) 아침은 왼쪽, 점심은 중간, 그리고 저녁은 오른쪽"
> "타임라인 위에다가 깃발 꽂으면서 바로 일정을 쓸 수도 있고 드래그해서 이제 시간 변경도 되고요."
> "다 되면 체크하면 이제 깃발 이렇게 딱 꺼지고 (…) 다 되면 폭죽. Congratulation."
> "어떤 사람은 밤이 길고 (…) 이 가운데 슬라이더로 조절할 수 있게 했어요."
> "디자인만 바꾼 게 아니라 스토리를 넣으니까 새로운 프로젝트가 됐죠."

마지막 인용이 이 작품의 기준이다. **평범한 투두 목록 위에 산책하는 동네를 얹는 것**이 핵심이고, 목록 기능은 평범해도 된다.

### 레퍼런스와 다르게 가는 것
| 레퍼런스 | 이 작품 | 이유 |
|---|---|---|
| 3D 주택가 씬 | **SVG 2.5D 동네** (레이어 패럴랙스) | 에셋 생성 없이 코드로 완결. 번들·성능 예산 안에서 모바일까지. 3D는 패밀리 A 패키지가 생긴 뒤 교체 가능하도록 씬을 한 컴포넌트 경계 안에 가둔다 |
| 새 조언 = AI(LLM) | **규칙 기반 조언 엔진** + 교체 가능한 인터페이스 | 백엔드·API 키 없이 정적 배포. 조언 문장이 결정적이라 테스트 가능 |
| Google Calendar 연동 알람 | **브라우저 알림** (권한 거부 시 화면 안 토스트) | OAuth·서버 필요. 범위 밖(§14) |
| 계정·서버 저장 | **localStorage** + JSON 내보내기/가져오기 | 1인용 앱. 정적 호스팅 |

---

## 2. 화면 구성

### 데스크톱 (≥ 960px)
```
┌──────────────────────────────────────────────────────────────┐
│ Day Walk   ‹ 9월 14일 (일) · 오늘 ›     ▓▓▓▓░░░ 57%  [루틴] [⚙] │ 헤더 56px
├──────────────────────────────────────────────────────────────┤
│  하늘(시간대 그라데이션) · 해/달                                  │
│      🏠⚑        🏠⚑   🏠⚑           🏠⚑                          │ 씬 44vh
│  ── 길 ──🚶🐦──────────────────────────────────────────        │ (320~460px)
│      💬 "점심 마감까지 45분, 남은 일 2개. ★Email부터."           │
├──────────────────────────────────────────────────────────────┤
│ 07:00  ⚑    ⚑  |12:00   ⚑        |18:00        ⚑   23:00     │ 타임라인 72px
│        아침      ◆        오후       ◆       저녁                │ ◆ = 경계 핸들
├───────────────────┬────────────────────┬─────────────────────┤
│ 아침까지 ~12:00   │ 점심까지 ~18:00  ●지금 │ 저녁까지 ~23:00      │
│ 남은 2 · 완료 1   │ 남은 3 · 45분 남음   │ 남은 1              │ 보드
│ ☐ ★ Email         │ ☐ 14:00 Meeting    │ ☐ 기록              │ 3컬럼
│ ☑ 07:30 Workout   │ …                  │                     │
│ [+ 할 일 추가]     │ [+ 할 일 추가]      │ [+ 할 일 추가]       │
└───────────────────┴────────────────────┴─────────────────────┘
```
- 씬·타임라인·보드는 **같은 가로 좌표계**를 쓴다. 타임라인의 12:00 위치 = 씬에서 아침/오후 경계 = 보드 첫 컬럼의 오른쪽 끝(시각적 정렬은 근사로 충분, 컬럼은 등폭).
- 현재 구간 컬럼에 `●지금` 배지와 강조 테두리.

### 모바일 (< 720px, 기준 390×844)
- 헤더: 날짜 이동 + 진행률(숫자) + [⚙]. [루틴]은 ⚙ 옆 아이콘 버튼.
- 씬 36svh, 타임라인 64px (가로 스크롤 없음, 시간 라벨은 경계 4개만).
- 보드는 **탭 3개**(아침/오후/저녁)로 바뀌고, 현재 구간 탭이 기본 선택.
- 720~959px은 데스크톱 레이아웃에 씬 높이만 36vh.

---

## 3. 시간 모델

모든 시각은 **논리적 날짜의 자정부터 흐른 분(min)** 정수로 다룬다. 로컬 시간대 기준.

### 3-1. 하루 설정 `DayBounds`
| 필드 | 뜻 | 기본값 | 허용 범위 |
|---|---|---|---|
| `dayStart` | 하루 시작 | 420 (07:00) | 240~720 |
| `morningEnd` | 아침 마감 | 720 (12:00) | `dayStart+60` ~ `afternoonEnd-60` |
| `afternoonEnd` | 점심 마감 | 1080 (18:00) | `morningEnd+60` ~ `dayEnd-60` |
| `dayEnd` | 저녁 마감 | 1380 (23:00) | 1260~1680 (21:00 ~ 다음날 04:00) |

- 모든 값은 15분 단위로 스냅.
- `dayEnd`가 1440을 넘으면 표기는 `24:30`이 아니라 `00:30`(다음날 표시 `+1`)로 한다.
- 제약을 깨는 입력은 **가장 가까운 유효값으로 클램프**한다. 에러로 막지 않는다.

### 3-2. 논리적 날짜
밤이 긴 사람을 위해, 새벽은 전날의 연장일 수 있다.
```
now = 로컬 현재 시각, t = now의 자정 이후 분
if t < dayStart and t + 1440 <= dayEnd:  logicalDate = 어제, minute = t + 1440
else:                                     logicalDate = 오늘, minute = t
```

### 3-3. 구간 판정 (마감 포함)
```
segmentOf(m) = m <= morningEnd ? 'morning' : m <= afternoonEnd ? 'afternoon' : 'evening'
```
12:00 정각 일정은 "아침까지" 할 일이다 — 마감 시각은 그 구간에 속한다.

### 3-4. 위치
`x(m) = clamp((m - dayStart) / (dayEnd - dayStart), 0, 1)`. 씬·타임라인이 이 함수 하나를 쓴다.

### 3-5. 상태
| 상태 | 조건 | 캐릭터 | 새 |
|---|---|---|---|
| `before` | 논리 minute < dayStart | 왼쪽 끝 집 앞에서 잠 (z 표시) | 옆에서 잠 |
| `during` | dayStart ≤ minute ≤ dayEnd | `x(minute)` 위치에서 걷기 | 따라다님 |
| `after` | minute > dayEnd | 오른쪽 끝 집 앞에서 잠 | 옆에서 잠 |
| 다른 날짜 보기 | 선택 날짜 ≠ 논리적 날짜 | 숨김 | 숨김, 조언 대신 날짜 안내 |

### 3-6. 시계
- 30초마다 갱신. `document.visibilitychange`로 복귀 시 즉시 갱신.
- **테스트·데모용 주입**: URL `?now=2026-09-14T11:20` 이 있으면 페이지 로드 시각을 그 값으로 두고 이후 실제 경과만큼 흐른다. 잘못된 값이면 무시.

---

## 4. 데이터 모델

`app/src/schema/`에 zod로 정의하고 타입은 `z.infer`로만 뽑는다.

```ts
Segment   = z.enum(['morning', 'afternoon', 'evening'])
Slot      = z.discriminatedUnion('kind', [
              z.object({ kind: z.literal('time'),    minute: z.number().int() }),   // 깃발이 있는 일정
              z.object({ kind: z.literal('segment'), segment: Segment }),          // 시각 없는 할 일
            ])
Task      = z.object({
              id: z.string().min(1),
              title: z.string().trim().min(1).max(80),
              slot: Slot,
              starred: z.boolean(),
              done: z.boolean(),
              createdAt: z.number().int(),   // epoch ms
              doneAt: z.number().int().nullable(),
            })
DayBounds = z.object({ dayStart, morningEnd, afternoonEnd, dayEnd })   // §3-1, int
Settings  = z.object({
              bounds: DayBounds,
              showCharacter: z.boolean(),        // 기본 true
              showAdvisor: z.boolean(),          // 기본 true
              sound: z.boolean(),                // 기본 false
              motion: z.enum(['system', 'reduce', 'full']),   // 기본 'system'
              notifications: z.boolean(),        // 기본 false
            })
RoutineTask = Task.pick({ title: true, slot: true, starred: true })
Routine   = z.object({ id, name: z.string().trim().min(1).max(40), tasks: z.array(RoutineTask).max(50) })
AppData   = z.object({
              schemaVersion: z.literal(1),
              settings: Settings,
              days: z.record(z.string().regex(/^\d{4}-\d{2}-\d{2}$/), z.array(Task).max(100)),
              routines: z.array(Routine).max(20),
              celebrated: z.array(z.string()),   // 축하를 이미 띄운 날짜
            })
```

**규칙**
- 시각 있는 일정의 구간은 **저장하지 않고** `segmentOf(slot.minute)`로 매번 계산한다. 경계를 옮기면 일정이 다른 컬럼으로 넘어가는 것이 정상 동작이다.
- 일정 minute이 `[dayStart, dayEnd]` 밖이 되면(경계 변경 때문에) 데이터는 그대로 두고 가장 가까운 끝에 붙여 그리며 `구간 밖` 배지를 단다.
- 새로 만드는 일정 minute은 `[dayStart, dayEnd]`로 클램프.

### 4-1. 저장
- 키 `day-walk:v1`, 값 `AppData` JSON 하나.
- 변경 후 300ms 디바운스로 쓴다. `pagehide`에서 즉시 flush.
- 로드 시 zod 파싱 실패 → 원본을 `day-walk:v1:corrupt-<epoch>` 키로 옮겨 두고 기본값으로 시작, 토스트 "저장된 데이터를 읽지 못해 새로 시작했어요".
- 로드 시 논리적 오늘 기준 **90일보다 오래된 날짜**는 버린다.
- localStorage 접근이 예외를 던지면 메모리로만 동작하고 헤더 아래 배너 "이 브라우저에서는 저장되지 않아요"를 띄운다.
- 다른 탭의 `storage` 이벤트는 반영하지 않는다 (범위 밖).

### 4-2. 기본 데이터
첫 실행 시 `days`는 비어 있고 `routines`에 아래 하나가 들어 있다.
```json
{ "id": "default", "name": "기본 루틴", "tasks": [
  { "title": "Workout", "slot": { "kind": "time", "minute": 450 }, "starred": false },
  { "title": "Email 정리", "slot": { "kind": "segment", "segment": "morning" }, "starred": true },
  { "title": "Meeting", "slot": { "kind": "time", "minute": 840 }, "starred": false },
  { "title": "산책", "slot": { "kind": "segment", "segment": "afternoon" }, "starred": false },
  { "title": "하루 기록", "slot": { "kind": "time", "minute": 1290 }, "starred": false }
] }
```

### 4-3. 내보내기 / 가져오기
- 내보내기: `{ "format": "day-walk-v1", "data": AppData }`를 `day-walk-YYYY-MM-DD.json`으로 다운로드.
- 가져오기: 1MB 초과 거부, `format` 불일치 거부, zod 실패 시 거부. 성공 시 **전체 교체** 전에 앱 내 확인 대화상자("현재 데이터를 모두 바꿉니다").
- `window.alert/confirm/prompt` 금지. 전부 앱 내 대화상자.

---

## 5. 상호작용

### 5-1. 할 일 추가
| 입구 | 동작 |
|---|---|
| 컬럼 하단 `+ 할 일 추가` | 인라인 입력 → Enter로 추가 (`slot.kind='segment'`, 그 컬럼 구간). Esc 취소. 추가 후 입력은 열린 채 비워진다 (연속 입력) |
| 타임라인 빈 곳 클릭/탭 | 그 위치 시각(15분 스냅)에 **깃발 미리보기** + 작은 입력 팝오버 → Enter로 `slot.kind='time'` 일정 생성. 바깥 클릭·Esc 취소 |
| 타임라인 키보드 | 타임라인에 포커스 후 Enter → 현재 시각(또는 before면 dayStart)에 팝오버 |

제목은 trim 후 1~80자. 빈 제목 Enter는 무시.

### 5-2. 깃발
- 시각 있는 일정마다 타임라인 위에 깃발 1개, 씬 길가에 집 1채(지붕에 깃발).
- **드래그**(포인터 이벤트, 마우스·터치 공통)로 시각 변경. 이동 중 말풍선에 시각 표시, 15분 스냅, `[dayStart, dayEnd]` 클램프. 놓으면 저장. 드래그 중 구간이 바뀌면 해당 컬럼 헤더를 잠깐 강조.
- 4px 미만 이동은 클릭으로 간주 → 해당 할 일 항목으로 스크롤·포커스(모바일은 해당 탭 전환).
- 키보드: 깃발은 `role="slider"`, `aria-valuetext="14:00 Meeting"`. ←/→ 15분, Shift+←/→ 60분, Delete 없음(삭제는 목록에서만).
- 같은 시각 깃발이 겹치면 세로로 6px씩 엇갈려 쌓는다.
- 완료된 일정의 깃발은 **내려간다**(깃대 아래로 400ms, 회색). 다시 미완료로 바꾸면 올라간다.

### 5-3. 경계 핸들 ("가운데 슬라이더")
- 타임라인의 `morningEnd`, `afternoonEnd` 위치에 ◆ 핸들 2개. 드래그로 조절(§3-1 제약·스냅). 놓는 즉시 설정 저장, 씬 하늘 구간·컬럼 헤더 시각·일정 컬럼 배치가 함께 바뀐다.
- `dayStart`/`dayEnd`는 설정 대화상자에서만 바꾼다 (타임라인 양 끝을 드래그하면 좌표계가 같이 움직여 조작이 불안정하다).
- 키보드: `role="slider"`, ←/→ 15분.

### 5-4. 목록 항목
```
[☐] [★] 14:00  Meeting             [⋯]
```
- 체크박스: 완료 토글. 완료 시 제목에 취소선, `doneAt` 기록. 해당 깃발 내려감 + 체크박스 위치에 작은 파티클 버스트(12개, 600ms).
- 별: 우선순위 토글.
- 시각 칩(시각 있는 일정만): 표시만.
- 제목 더블클릭(모바일: 길게 누르기 대신 ⋯ 메뉴의 "이름 바꾸기") → 인라인 편집.
- ⋯ 메뉴: 이름 바꾸기 / 시각 지정(time input, 15분 스냅) / 시각 없애기(현재 계산된 구간의 segment 할 일로) / 구간 옮기기(시각 없는 할 일만: 아침·오후·저녁) / 삭제.
- 삭제는 즉시 반영하고 토스트 "삭제했어요 [되돌리기]" 5초.

**정렬** (컬럼 안): ① 미완료 먼저 ② 별 먼저 ③ 시각 있는 일정 시각 오름차순, 시각 없는 할 일은 그 뒤 ④ `createdAt` 오름차순.

### 5-5. 컬럼 헤더
`아침까지 ~12:00` / `남은 N · 완료 M`. 현재 구간이면 `●지금` + "45분 남음"(60분 이상이면 "2시간 10분 남음"). 지난 구간에 미완료가 있으면 헤더에 `지남` 배지, 미완료 항목에도 `지남` 태그.

### 5-6. 완료 연출
| 조건 | 연출 |
|---|---|
| 항목 하나 완료 | 깃발 내려감 + 체크박스 파티클 버스트 |
| 한 구간의 할 일이 1개 이상이고 전부 완료 | 컬럼 헤더에 `CLEAR` 도장 (스케일 인 300ms), 새가 한 번 날갯짓 |
| 하루 할 일이 1개 이상이고 전부 완료, 그리고 `celebrated`에 오늘 날짜가 없음 | 전체 화면 **폭죽**(canvas, 2.5초) + 가운데 "Congratulations!" + "오늘 할 일을 다 끝냈어요" + [닫기]. 날짜를 `celebrated`에 추가. 클릭·Esc로 즉시 닫힘 |

`motion`이 reduce(또는 system + OS 설정 reduce)면 파티클·폭죽·걷기 애니메이션·깃발 이동 애니메이션을 끄고 즉시 상태만 바꾼다. 축하 문구 오버레이는 그대로 보인다.

### 5-7. 루틴
- [루틴] 버튼 → 대화상자.
  - 목록: 루틴 이름, 할 일 개수, [오늘에 불러오기] [삭제].
  - 하단: [현재 날짜의 할 일을 루틴으로 저장] → 이름 입력 → 저장. 완료 여부는 버린다.
- 불러오기: 선택 날짜에 루틴 할 일을 **추가**한다(`done=false`). 같은 `title` + 같은 slot인 할 일이 이미 있으면 건너뛴다. 결과 토스트 "4개 추가, 1개는 이미 있어요".
- `default` 루틴도 삭제 가능하다.

### 5-8. 날짜 이동
헤더의 ‹ › 로 하루씩 이동, 가운데 날짜 텍스트를 누르면 논리적 오늘로 복귀. 과거·미래 날짜도 편집 가능. 날짜 표기 `9월 14일 (일)`, 오늘이면 `· 오늘`.

### 5-9. 진행률
헤더 막대 + 퍼센트. `완료 / 전체`(선택 날짜), 전체 0이면 막대 비움 + "0%"가 아니라 "—".

---

## 6. 조언 새

`app/src/domain/advisor.ts` — 순수 함수.
```ts
interface Advice { id: string; text: string; action?: { label: string; kind: 'move-overdue' | 'open-routines' } }
interface Advisor { advise(input: { tasks: Task[]; bounds: DayBounds; minute: number; phase: 'before'|'during'|'after' }): Advice[] }
```
`advise`는 해당하는 조언을 **우선순위 순서의 배열**로 반환한다. 말풍선은 첫 번째를 보여 주고, 새를 클릭/탭(또는 Enter)하면 다음 것으로 순환한다. 시계가 갱신돼 배열이 바뀌면 첫 번째로 돌아간다.

| 순위 | id | 조건 | 문장 (예) | 액션 |
|---|---|---|---|---|
| 1 | `before` | phase before | "아직 하루 시작 전이야. 첫 마감은 12:00." | — |
| 2 | `after` | phase after | "오늘 산책은 여기까지. 푹 쉬어." | — |
| 3 | `empty` | 할 일 0개 | "오늘은 비어 있어. 루틴을 불러오거나 타임라인을 눌러 깃발을 꽂아 봐." | 루틴 열기 |
| 4 | `all-done` | 전부 완료 | "오늘 할 일 끝! 멋지다." | — |
| 5 | `overdue` | 지난 구간에 미완료 ≥1 | "아침 마감이 지났는데 2개 남았어: Email 정리, 산책." (제목 최대 2개 + "외 N개") | 시각 없는 것이 있으면 "지금 칸으로 옮기기" |
| 6 | `soon` | 미완료 일정 중 `0 < slot.minute - minute ≤ 30` | "14:00 Meeting까지 20분." (가장 가까운 것 하나) | — |
| 7 | `deadline` | 현재 구간 미완료 ≥1, 마감까지 ≤60분 | "점심 마감까지 45분, 남은 일 2개. ★Email부터." (별 있으면 별 붙은 첫 항목, 없으면 정렬 첫 항목) | — |
| 8 | `focus` | 현재 구간 미완료 ≥1 | "점심까지 3개. 먼저 Meeting." | — |
| 9 | `next` | 현재 구간 미완료 0, 이후 구간 미완료 ≥1 | "이 칸은 끝! 다음 저녁 칸엔 1개." | — |

- 구간 이름: morning "아침", afternoon "점심", evening "저녁". (헤더는 "아침까지/점심까지/저녁까지", 탭 라벨은 "아침/오후/저녁" — 레퍼런스 표기를 따른다.)
- 문장은 반말, 한 문장~두 문장, 60자 이내. 이모지 금지.
- "지금 칸으로 옮기기": 지난 구간의 **미완료·시각 없는** 할 일을 현재 구간으로 옮긴다. 시각 있는 일정은 건드리지 않는다.
- LLM 조언은 범위 밖. 나중에 같은 `Advisor` 인터페이스를 구현한 비동기 어댑터로 교체한다 — 지금 그 어댑터를 만들지 않는다.

---

## 7. 알림

설정 `notifications`가 켜져 있고 **선택 날짜 = 논리적 오늘**일 때만 동작한다.

| 트리거 | 문구 |
|---|---|
| 미완료 일정의 시각 도달 (`minute >= slot.minute`, 도달 후 5분 이내에 감지된 경우만) | "14:00 · Meeting" |
| 현재 구간 마감 30분 전, 그 구간 미완료 ≥1 | "점심 마감 30분 전 · 남은 일 2개" |

- 같은 트리거는 하루 한 번 (`sessionStorage` 키 `day-walk:notified:<date>`에 트리거 id 집합).
- 설정에서 켤 때 `Notification.requestPermission()`. `granted`면 시스템 알림, 그 외(거부·미지원)는 **화면 안 토스트**로 폴백하고 설정 옆에 "브라우저 알림이 꺼져 있어 화면 안에 표시해요" 안내.
- 탭이 열려 있을 때만 동작한다. 서비스 워커·푸시 없음.
- 판정 로직은 순수 함수 `dueNotifications(tasks, bounds, minute, alreadyNotified) → {id, text}[]`.

---

## 8. 설정 대화상자

⚙ → 모달(`<dialog>`), 초점 가두기, Esc 닫기, 닫으면 여는 버튼으로 초점 복귀.

| 섹션 | 컨트롤 |
|---|---|
| 하루 구간 | 시작 · 아침 마감 · 점심 마감 · 저녁 마감 — `input type=time step=900` 4개 (저녁 마감은 다음날 04:00까지 허용, 1440 이상은 "+1" 표시), [기본값으로] |
| 동네 | 캐릭터 표시, 새 조언 표시, 효과음, 움직임(시스템 / 줄이기 / 전부) |
| 알림 | 알림 켜기 + 폴백 안내 |
| 데이터 | 내보내기 / 가져오기 / 모든 데이터 지우기(앱 내 확인) |

효과음(기본 꺼짐): WebAudio 오실레이터로 합성. 완료 "딩"(880Hz 120ms), 깃발 꽂기 "톡"(440Hz 60ms), 축하 3음 아르페지오. 오디오 파일 없음.

---

## 9. 비주얼

### 9-1. 토큰
색·크기·간격·반경·그림자·지속시간은 전부 `app/src/theme/tokens.css`의 CSS 변수. 컴포넌트 CSS·TSX에 16진수 색·px 리터럴을 직접 쓰지 않는다 (SVG `viewBox` 좌표는 예외).

필수 토큰 (값은 구현자가 정하되 아래 방향을 지킨다):
- 하늘: `--sky-morning-top/bottom`(연한 복숭아→하늘색), `--sky-afternoon-top/bottom`(맑은 파랑), `--sky-evening-top/bottom`(주황→보라), `--sky-night-top/bottom`(남색). 씬은 현재 minute에 따라 인접 두 팔레트를 보간한다 (before/after = night).
- 구간 강조색: `--seg-morning`, `--seg-afternoon`, `--seg-evening` — 컬럼 헤더·타임라인 구간 띠·깃발 천에 공통.
- 표면: `--surface`, `--surface-raised`, `--ink`, `--ink-muted`, `--line`, `--focus`.
- 텍스트 대비 WCAG AA (본문 4.5:1).

### 9-2. 씬 (SVG, `viewBox="0 0 1600 500"`, `preserveAspectRatio="xMidYMax slice"`)
레이어(뒤→앞): 하늘 사각형 → 해/달(x는 minute 따라 호를 그림) → 먼 언덕(패럴랙스 0.2) → 뒷줄 집 실루엣 장식(고정 8채) → **길**(y≈400) → **일정 집**(x = `x(minute)`×1600, 길 위쪽, 지붕 깃발) → 캐릭터·새 → 말풍선(HTML 오버레이, SVG 밖).
- 일정 집: 폭 70, 높이 70~90(제목 해시로 결정), 벽색은 제목 해시로 토큰 팔레트 5색 중 하나. 지붕 깃대 + 깃발 천(`--seg-*`). 미완료=깃발 올라감·펄럭(CSS keyframe), 완료=내려감·회색·창문 불 켜짐.
- 가까운 집끼리 겹치면(간격 < 60) 뒤 것을 y로 -18 올려 두 줄로.
- 캐릭터: 단순 SVG(머리·몸·팔다리) 걷기 사이클 4프레임 CSS 애니메이션, 높이 ≈ 90. 위치 전환 `transition: transform 1s linear`.
- 새: 캐릭터 머리 위 뒤쪽 60px에서 사인파로 떠다님. 날갯짓 2프레임.
- 말풍선: 새 위치 기준 위쪽, 최대 폭 280px, 화면 밖으로 나가지 않게 x 클램프. `aria-live="polite"`.
- 씬 전체에 `role="img"`, `aria-label="하루 산책 동네. 현재 14:20, 오후 구간, 남은 일 3개"` (갱신).

### 9-3. 폭죽
단일 `<canvas>` 전체 화면 오버레이, 입자 160개, 중력·감쇠, 2.5초 후 제거. `requestAnimationFrame`. 라이브러리 금지.

### 9-4. 글꼴
시스템 글꼴 스택만 (`system-ui, -apple-system, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif`). 웹폰트 없음.

---

## 10. 기술 스택과 구조

- Vite 7 + React 19 + TypeScript(strict) + zod 3. **이 외 런타임 의존성 금지.**
- 개발: `@playwright/test`, `tsx`, 타입 패키지. 이미 `app/package.json`에 들어 있다. 의존성 추가 금지.
- 상태: `useReducer` + Context. 상태 라이브러리 금지.
- `vite.config.ts`에 `base: './'` — 허브(`/experiences/day-walk/`) 하위 경로에서도 그대로 돈다.
- pnpm 워크스페이스 멤버. 설치는 저장소 루트 `pnpm install`.

```
projects/day-walk/
├── SPEC.md, AGENTS.md
└── app/
    ├── index.html, package.json, vite.config.ts, playwright.config.ts
    ├── tsconfig.json, tsconfig.app.json, tsconfig.node.json
    ├── README.md                    # 실행·검증 명령, 구현 메모
    ├── scripts/
    │   ├── domain.test.ts           # node:test — 시간·정렬·조언·알림·스키마·저장
    │   └── check-budget.ts          # §11
    ├── tests/
    │   └── day-walk.spec.ts         # Playwright — §12 수용 기준
    └── src/
        ├── main.tsx, App.tsx
        ├── schema/index.ts          # §4
        ├── domain/
        │   ├── time.ts              # logicalNow, segmentOf, xOf, snap, clampBounds, format
        │   ├── tasks.ts             # reducer + 액션, 정렬, 루틴 적용
        │   ├── advisor.ts           # §6
        │   └── notifications.ts     # §7 dueNotifications
        ├── store/
        │   ├── AppStore.tsx         # Context + useReducer + 저장 연결
        │   ├── storage.ts           # §4-1
        │   └── useClock.ts          # §3-6
        ├── scene/ Scene.tsx, Sky.tsx, Street.tsx, TaskHouse.tsx, Walker.tsx, Bird.tsx, SpeechBubble.tsx
        ├── timeline/ Timeline.tsx, Flag.tsx, BoundaryHandle.tsx, QuickAdd.tsx
        ├── board/ Board.tsx, Column.tsx, TaskItem.tsx, AddTask.tsx
        ├── ui/ Header.tsx, ProgressBar.tsx, SettingsDialog.tsx, RoutineDialog.tsx, ConfirmDialog.tsx, Celebration.tsx, Toast.tsx
        ├── audio/sfx.ts
        └── theme/ tokens.css, app.css
```
- `domain/`은 React·DOM을 import하지 않는다 (`tsx --test`로 돈다).
- 파일 하나 300줄 이하. 넘으면 나눈다.

### 스크립트 (`app/package.json`)
| 명령 | 내용 |
|---|---|
| `dev` | `vite` |
| `test` | `tsx --test scripts/domain.test.ts` |
| `build` | `tsc -b && vite build && pnpm run check:budget` |
| `check` | `pnpm test && pnpm run build` |
| `test:e2e` | `playwright test` |
| `check:all` | `pnpm run check && pnpm run test:e2e` |

---

## 11. 성능 예산
| 항목 | 한도 |
|---|---|
| JS gzip 합계 | 120 KB |
| CSS gzip | 15 KB |
| 이미지·폰트·오디오 파일 | 0개 (favicon SVG 1개만 허용) |
| 유휴 시 리렌더 | 시계 갱신(30초) 외 0회 — 애니메이션은 CSS로 |

`scripts/check-budget.ts`가 `dist/`를 검사하고 초과 시 exit 1.

---

## 12. 수용 기준

전부 Playwright(`desktop` 1440×900, `mobile` iPhone 13 390×844)로 자동 검증한다. 시각 의존 테스트는 `?now=`를 쓴다.

1. 첫 실행(`?now=2026-09-14T10:00`): 보드 3컬럼(모바일은 탭 3개, "아침" 선택)이 보이고, 새 말풍선이 `empty` 조언을 보이며, 진행률은 "—".
2. 루틴 대화상자에서 "기본 루틴"을 불러오면 5개가 추가되고, 시각 있는 3개는 타임라인 깃발 3개·씬 집 3채로, Workout(07:30)은 아침, Meeting(14:00)은 점심 컬럼에 들어간다. 다시 불러오면 "0개 추가, 5개는 이미 있어요".
3. 컬럼 하단 입력으로 할 일을 추가하면 그 컬럼에 나타나고 입력은 열린 채 비워진다.
4. 타임라인 빈 곳을 눌러 제목을 입력하면 눌린 위치의 시각(15분 스냅)에 깃발 일정이 생긴다.
5. 깃발을 12:00 경계 너머로 드래그하면 일정이 아침 컬럼에서 점심 컬럼으로 옮겨지고, 새로고침 후에도 유지된다. 키보드 → 한 번에 15분 이동한다.
6. 경계 핸들(12:00)을 13:00으로 드래그하면 컬럼 헤더가 "아침까지 ~13:00"이 되고 12:30 일정이 아침 컬럼으로 옮겨진다.
7. 일정을 완료하면 해당 깃발이 완료 상태(`data-done="true"`)가 된다. 구간 전부 완료 시 헤더에 `CLEAR`.
8. 하루 전부 완료 시 "Congratulations!" 오버레이가 한 번 뜨고, 닫고 새로고침해도 다시 뜨지 않는다.
9. `?now=2026-09-14T11:20`에 미완료 아침 할 일이 있으면 조언이 `deadline`("아침 마감까지 40분")이다. 새를 누르면 다음 조언으로 바뀐다. `?now=2026-09-14T13:00`이면 `overdue`이고 "지금 칸으로 옮기기"가 시각 없는 할 일만 점심으로 옮긴다.
10. `dayEnd`를 01:00(1500)으로 설정하고 `?now=2026-09-15T00:30`으로 열면 선택 날짜는 9월 14일이고 캐릭터는 저녁 구간에 있다.
11. 내보내기 → 모든 데이터 지우기 → 가져오기로 원래 할 일이 복원된다. 형식이 틀린 파일은 거부 토스트.
12. 모바일에서 보드가 탭으로 바뀌고 가로 스크롤이 없다 (`document.documentElement.scrollWidth <= 390`). 깃발 드래그가 터치로 동작한다.
13. 움직임 줄이기 설정 시 축하 canvas가 생성되지 않고 오버레이 문구만 뜬다.
14. 알림 권한 거부 상태에서 일정 시각에 도달하면 화면 안 토스트가 뜬다 (`?now=`를 일정 1분 전으로 두고 Playwright 시계 조작 또는 로직 단위 테스트 + 토스트 렌더 테스트로 대체 가능).
15. 키보드만으로: 할 일 추가, 완료, 깃발 이동, 설정 열고 닫기(초점 복귀)가 된다.
16. `pnpm run check`(단위 테스트 + 빌드 + 예산)가 통과한다.

단위 테스트(`scripts/domain.test.ts`) 최소 범위: §3 전 함수(경계값 12:00 포함, 논리적 날짜 자정 넘김), `clampBounds` 제약, 정렬 규칙 4단, 루틴 중복 건너뛰기, `advise` 9개 규칙 각 1개 이상, `dueNotifications` 중복 방지, 스키마 거부 사례(빈 제목, 81자, 잘못된 날짜 키), 저장 로드 실패 시 corrupt 백업.

---

## 13. 하지 말 것
1. 런타임 의존성·상태/UI/애니메이션/드래그 라이브러리 추가
2. 시각 있는 일정에 구간을 저장 (§4 규칙)
3. 색·크기 리터럴을 컴포넌트에 직접 작성 (§9-1)
4. `window.alert/confirm/prompt`
5. 사용자 입력을 `innerHTML`/`dangerouslySetInnerHTML`로 렌더
6. 이미지·폰트·오디오 파일 추가 (§11)
7. 서버·네트워크 요청 (정적 앱. 외부 요청 0건)
8. `domain/`에서 React·DOM import
9. 여기 없는 기능 추가 (계정, 반복 일정, 하위 할 일, 태그, 다크모드 토글, 다국어)

## 14. 범위 밖 (다음 단계)
- Google Calendar 읽기/쓰기 (`packages/integrations/gcal` 추출 시)
- LLM 조언 어댑터
- 3D 씬 (패밀리 A `three-kit`이 생긴 뒤)
- 여러 탭 동기화, 서버 저장, 계정
- 반복 일정·어제 미완료 자동 이월
- 허브(jooho-lab) 등록 — 허브 작업 트리에 진행 중인 변경이 있어 별도로 한다. `base: './'`로 임베드 준비만 해 둔다.

## 15. 열린 항목
- 없음. 구현 중 생긴 해석은 `app/README.md` "구현 메모"에 기록한다.
