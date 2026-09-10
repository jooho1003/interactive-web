# 이미지 생성 프롬프트 — GPT Image 2.5

컷 8장(제작 7장 + 보류 1장). 전부 16:9, 사람 없음, 단일 광원.

## 순서가 중요하다

1. **`hub`를 먼저 만든다.** 4장 생성해 하나를 고른다. 이것이 공간과 룩의 기준이 된다
2. 나머지 컷은 `hub` 이미지를 **참조로 첨부하고** "같은 편의점, 다른 앵글"로 생성한다
3. `reflection`은 마지막이다. `dawn`을 참조로 넣고 **반사 부분만** 바꾼다
4. 전부 나오면 WebP로 변환하고 `story.json`의 핫스팟 좌표를 실제 사물 위치에 맞춘다

`hub`를 건너뛰고 컷마다 따로 생성하면 매장 구조가 컷마다 달라진다. 이 작품에서 그게 유일한 기술적 실패 지점이다.

## 공통 스타일 블록

모든 프롬프트 앞에 붙인다.

```
Cinematic still frame, 16:9, photographic realism.
A small Korean convenience store at 3 AM. Absolutely no people in frame.
Single light source: cool white ceiling fluorescent tubes, around 5000K.
Beyond the windows: deep navy night, no visible streetlights or signage.
Palette: cyan-white highlights, desaturated mid-tones, dark teal shadows. Low overall saturation.
Mood: quiet, still, faintly melancholic. Not horror. Nothing threatening.
Fine film grain. Shallow depth of field.
No text, no captions, no watermarks, no brand logos.
```

---

## 01 · hub — 계산대 (스타일 프레임, 가장 먼저)

```
Wide interior shot taken from just inside the entrance, at standing eye level.
On the right: an empty checkout counter, no clerk, register screen dark.
On the left: a hot-drink warmer cabinet holding canned coffee, its interior glowing faint amber.
Middle distance: a magazine rack against the wall.
Far right by the window: a narrow standing counter with a folded umbrella leaning against its leg.
The glass entrance door is at the far right edge of frame.
All four of these are visible in this single frame and clearly separated from each other.
Ceiling fluorescents reflect in long streaks on the polished floor.
```

생성 후 확인할 것: 온장고, 잡지 매대, 우산, 출입구 네 지점이 서로 겹치지 않고 화면 안에서 분리되어 있는가. 겹쳐 있으면 핫스팟을 못 만든다.

## 02 · intro — 유리문

`hub` 참조 첨부.

```
Exterior night shot, looking at the same convenience store from across an empty street.
The store windows glow bright white against a completely dark street; the store is the only lit thing in frame.
A faint silhouette of one person is reflected in the glass door, seen from behind, barely readable.
Damp asphalt in the foreground catching the store's light.
Camera at eye level, very slightly low angle.
```

## 03 · coffee — 식은 커피

`hub` 참조 첨부.

```
Close-up of the top of the hot-drink warmer cabinet.
A single can of coffee sits on top of the cabinet, outside the warmer. No steam.
Beside it, a small crumpled paper receipt.
Focus on the can; the warmer's amber interior glows out of focus behind it.
```

## 04 · back — 통로

`hub` 참조 첨부.

```
Point of view walking down a narrow aisle between two shelving units of snacks and instant noodles.
The aisle leads back toward the checkout counter, visible small at the far end.
Ceiling fluorescents receding in one-point perspective.
Very slight motion blur at the frame edges.
```

## 05 · magazine — 오래된 잡지

`hub` 참조 첨부.

```
Close-up of the magazine rack.
One magazine is pulled slightly forward, out of alignment with the neat row beside it.
Its cover is sun-faded and washed out; the spine is visibly creased from being opened many times.
Focus on the misaligned one, the rest falling out of focus.
```

## 06 · dawn — 창밖 (엔딩)

`hub` 참조 첨부. **다음 컷의 기준이 되므로 구도를 잘 잡는다.**

```
Looking toward the glass entrance door from inside the store.
Through the glass the sky has shifted from navy to a pale blue-grey: the first light before sunrise.
The interior fluorescent light now reads weaker by comparison.
On the right side of frame stands a glass-door refrigerator cabinet.
Its glass clearly reflects part of the empty checkout counter behind the camera.
The reflection is legible, and no one is in it.
```

생성 후 확인할 것: 냉장고 유리의 반사가 또렷하게 읽히는가. 여기가 히든 링크 자리다. 반사가 흐리면 다시 뽑는다.

## 07 · reflection — 반사 (히든 엔딩)

**`dawn` 이미지를 참조로 첨부하고 편집 모드로 생성한다.**

```
Use the attached image. Keep the composition, framing, lens, and lighting IDENTICAL.
Change exactly one thing: in the reflection on the refrigerator's glass door, a person now stands
at the checkout counter, seen from behind, out of focus and indistinct.
Everything else in the frame must remain pixel-identical.
```

이 컷의 성패는 앞 컷과 얼마나 같은가에 달려 있다. 두 이미지를 겹쳐 보고 구도가 어긋나면 다시 만든다.

## 08 · umbrella — 창가의 우산 (보류)

이번 단계에서는 **만들지 않는다.** `story.json`에 `available: false`로 정의만 되어 있고, 미완성 노드를 어떻게 방어하는지 검증하는 용도다. 다음 단계에서 필요해지면 아래로 만든다.

```
Close-up of a folded umbrella leaning against the leg of the narrow standing counter by the window.
The umbrella is completely dry. Through the window, the night street is dry as well. No rain anywhere.
```

---

## 변환

```bash
ffmpeg -i in.png -vf "scale=1920:-2" -c:v libwebp -quality 80 -compression_level 6 out.webp
```

컷당 400KB, 전체 3MB가 한도다. 넘으면 quality를 70으로, 그래도 넘으면 긴 변을 1600으로 줄인다.

파일명은 노드 ID를 그대로 쓴다. `intro.webp`, `hub.webp`, `coffee.webp`, `back.webp`, `magazine.webp`, `dawn.webp`, `reflection.webp`.

## 생성 후 할 일

`seed/story.json`의 `hotspot` 좌표는 지금 추정치다. `hub.webp`가 나오면 실제 사물 위치를 재서 네 개의 값을 고친다. 단위는 이미지 기준 퍼센트다.

| 엣지 | 대상 |
|---|---|
| `e-coffee` | 온장고 위 커피 |
| `e-magazine` | 잡지 매대 |
| `e-umbrella` | 창가 우산 |
| `e-exit` | 출입구 |

`dawn.webp`가 나오면 `e-hidden-reflection`의 `box` 값을 냉장고 유리 반사 위치에 맞춘다.
