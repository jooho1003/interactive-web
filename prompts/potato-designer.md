# POTATO — Designer in Motion — 에셋 프롬프트

[← 전체 목록](README.md)

캐릭터 인터랙티브 포트폴리오입니다. 레퍼런스는 [인스타그램 릴스](https://www.instagram.com/reels/DasmbuiBvvv/)의 모니터 화면이고, 줄무늬 셔츠 3D 캐릭터가 카메라 쪽으로 튀어나오는 장면을 참고했습니다. 원본 3D 모델이 없어서 **2D 그림 한 장**을 만들고 CSS 원근·회전으로 깊이감을 줬습니다(관절이 움직이는 3D는 아님).

---

### 01 · 날아차기 캐릭터 (character.png)

<img src="../projects/potato-designer/dist/assets/character.png" width="420">

| 항목 | 내용 |
|---|---|
| 파일 | `dist/assets/character.png` · 1254×1254, **투명 PNG** · 1.6MB |
| 쓰이는 곳 | 메인 무대 캐릭터. 마우스 따라 기울기·등장 모션·떠다님 — 레이어 `character`(docs/11 §9-1, 파라미터 `src`). 2026-10-04: JOOHO LAB 작품 08 표지(`public/assets/potato.png`)와 내장 체험에도 같은 파일을 재사용; 새 생성 없음. 허브 카드 표지는 목록 콘텐츠이며 시각 레이어 이관은 docs/11의 기존 후속 범위 |
| 도구 | 내장 **`image_gen`**. 파일 메타데이터(C2PA)에도 ChatGPT / gpt-image, OpenAI 서명 |
| 만든 날 | 2026-09-22 |
| 참조 이미지 | 없음 (영상 레퍼런스는 글로만 참고) |
| 원본 기록 | [`projects/potato-designer/README.md`](../projects/potato-designer/README.md) §캐릭터 자산 |

**무엇을 그리나** — 고급 3D 수집용 피규어 느낌의 젊은 동아시아 남자 디자이너. 검은 옆가르마 머리, 검은 타원 선글라스, 검정·아이보리 줄무늬 긴팔, 헐렁한 차콜 카고 바지, 두툼한 검은 운동화. 카메라 쪽으로 날아차기를 해서 **오른쪽 아래에 운동화 밑창이 크게** 보이는 과감한 원근. 한 손은 왼쪽으로 뻗고 한 손은 선글라스 근처. 정사각형 안에 전신, 진짜 투명 배경, 바닥 없음.

```text
Premium stylized 3D collectible youthful adult East Asian male designer, black side-parted hair, black oval sunglasses, black/ivory striped long sleeve shirt, oversized charcoal cargo pants, chunky black sneakers. Extremely foreshortened flying kick toward camera with huge sole in lower-right foreground, one hand reaching left, other near glasses. Full figure within square frame, genuine transparent background, soft neutral studio lighting, detailed cloth, no text, no UI, no floor.
```

**참고** — 이 그림은 진짜 알파 채널이 있는 투명 PNG로 나왔다. 하루 산책의 새는 같은 요청에서 체커보드를 그려 버렸으니([day-walk.md](day-walk.md#05--안내-새-2프레임-bird-v3)), 투명 배경이 필요하면 결과의 알파 채널부터 확인한다.

---

## 에셋이 아닌 것
- 작업 카드 포스터(브랜드·디지털·캐릭터)는 이미지가 아니라 CSS로 그린 것이다. 캐릭터 카드만 위 `character.png`를 다시 쓴다.
- 파비콘 `favicon.svg`는 손으로 만든 SVG다.
