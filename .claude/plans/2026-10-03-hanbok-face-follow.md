# 한복 히어로 — 선비 얼굴이 마우스를 따라가게 (2026-10-03)

요청: "선비 얼굴이 마우스를 따라가게 해줘. 버벅거림이나 잔상은 없애주고. 그러고 커밋 머지해. jooho lab에 해당 페이지 연결해두고."

## 이번에 참고한 자료

- `projects/hanbok-hero/README.md`·`QA.md`·`HANDOFF-codex.md` — 9칸 즉시 교체, 크로스페이드 0, `returnDelay` 900ms로 멈추면 정면 복귀.
- `docs/10` "한복 히어로에서 확인한 것" — `.gaze-range` 계산된 스타일을 JS 수치의 정본으로 쓰는 방식, 히스테리시스, 두 겹 프레임 크로스페이드의 잔상.
- `prompts/hanbok-hero.md` 02 — Kling 영상 원본(241프레임)과 고른 9프레임.
- 외부 레퍼런스 `references/instagram-reposts.md#lovart-interactive-assets`(패턴 `pointer-reactive`).

## 원인

1. 3×3 칸이 몸 전체가 다른 영상 프레임 → 칸이 바뀔 때 몸(±20px)·갓이 통째로 튐 = 버벅거림.
2. 9칸이라 한 번에 크게 바뀜.
3. 마우스가 멈추면 0.9초 뒤 정면 → "따라간다"가 끊김.
4. 정면 그림(Kontext 업스케일본) ≠ 시트 가운데 칸 → 반응이 켜질 때 한 번 바뀜.

## 적용할 원칙 / 적용하지 않는 것

- 적용: 레이어 계약(모든 수치 파라미터, JS 수치는 `.gaze-range`), 히스테리시스, 동작 줄이기에서 정지, 포인터가 떠나면 원위치(패턴 카드 검수할 점).
- 적용 안 함: 크로스페이드(두 얼굴이 겹치면 잔상) — 파라미터 `fade` 삭제. 새 이미지·영상 생성(fal 잔액 0, 같은 영상에서 다시 뽑아 해결 가능).

## 참고 레퍼런스

| 카드 | 가져올 것 | 안 가져올 것 | 레이어 계약에 반영할 파라미터 |
|---|---|---|---|
| `lovart-interactive-assets` | 정지 그림을 방향 프레임으로 바꿔 포인터를 따라가게 | 사무라이 외형·문구 | `cols`·`rows`(방향 칸 수), `range`(반응 범위), `follow`(따라가는 시간), `returnDelay`(되돌아오는 시간) |

## 레이어 계약

| 레이어 | 추가·변경 |
|---|---|
| `character` | 추가 `body`(얼굴 자리를 비운 몸 그림), `headX`·`headY`·`headW`·`headH`(얼굴 칸 창, %) · 변경 `still`·`sheet` 기본값(scholar-*), `cols` 13·`rows` 2(최대 25·5), `follow` = 따라가는 시간 상수(110ms, `.gaze-range` transition-duration), `returnDelay` = 창을 떠난 뒤 정면까지 · 삭제 `fade` |

고정값과 이유: 칸 경계 히스테리시스 0.15칸(`gaze.js`, 입력 안정성), 감쇠 곡선은 지수(시간 상수만 열림), 얼굴 창 하나 구조·시트 칸 계산식(매니페스트 `fixed`).

결과: lint 7 layers / 74 parameters 오류 0, probe 74/74, `runChecks` 24/24, 동작 줄이기 4/4, 390px 7/7, 시트 실패·회복 5/5.

## JOOHO LAB 연결

`include-experience.mjs`에 `hanbok-hero`(원본 `../hanbok-hero/dist`)를 더해 `public/experiences/hanbok-hero/`로 스냅숏을 넣고, `projects.js`에 08번 작품(인터랙티브)으로 등록한다. 다른 세션이 JOOHO LAB 전시 작업을 진행 중이라 작품 항목 추가만 하고 나머지는 건드리지 않는다.
