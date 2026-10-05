# Gallery natural refinement · Design

2026-10-05 · [Plan](../../01-plan/features/gallery-natural-refinement.plan.md)

## Context Anchor
WHY: 승인된 이동/전시물 자연화. WHO: 관람자. RISK: 전환 재입력·재베이크·좌표. SUCCESS: 전환/시각/레이어검증. SCOPE: 개선1/2만.

## 1. Architecture choices
A: 현7칸·동선을 유지하고 이동/페이지 상태와 전시 구조만 수정(선택). B: 실제10칸 새 모델은 이번 범위보다 큼. C: CSS 이미지 공간으로 교체하면 문 통과/여러 각도 동선을 잃음. 기존 renderer/route·레이어·Blender 재질 공정을 재사용한다.

## 2. Movement
distanceSlideSeconds(from,to,base,min,max): 실제 eye 거리/2.15×기존 slideSeconds, clamp. 같은 페이지에서 퀸틱 보간 유지. 다른 페이지는 pageSeconds 동안 베일 감춤→불투명 중간에 페이지와 목적지 교체→등장. 현재 표시 페이지를 따로 보관하고 재입력은 현재 베일 투명도에서 다시 감춘다. back/reset은 페이지 전환을 취소하고 베일을 복구한다. reduced-motion은 즉시 최신 목적지/페이지로 간다. offscreen은 진행을 정지한다.

## 3. Exhibition geometry and light
작업실·외관에서 페이지를 바꿀 때도 가림막을 사용한다. 이 경우 중간에는 그림만 교체하고 카메라는 유지하며, 가림막이 열린 뒤 기존 문 통과/접근 경로를 이어간다. 작품 앞에서는 가려진 동안 목적지 카메라까지 교체한다. fade-in 중 재선택/복귀/필터도 최신 목표로 끝나야 한다.

큰1.75×2.65m 목재판을 제거하고1.51×1.91m 종이 받침과 얇은 샴페인색 프레임을 둔다. 선반은1.62×.055×.26m로 줄이고 작품 아래에 배치한다. 종이는벽에 가까이, 그림은종이 앞쪽에 둔다(artworkZ=-6.75). camera look도같은정본 좌표. 새로운 Gallery paper를 건물 PBR/조명·AO atlas에 포함한다. frameTint/frameRoughness/paperTint/paperRoughness는 실제재질, artBrightness는 그림원색의 배율로만 적용한다.

## 4. Validation / layer contract
이동시간 단위 검사에 거리/최소최대/0거리/중단 사례를 포함한다. 페이지 전환중그림/카메라 교체시각, 빠른07→08→09→07, Escape/Home·리스트/검색·동작 줄이기를 브라우저에서 확인한다. 같은뷰 외관/실내/세로·가로·투명 작품을 비교한다. 새 GLB의 종이 PBR·7조명·UV 분리·<6MB와 lint0/probe66전부를 확인한다. static 치수와 runtime 매개변수를 분리한다. 새생성 AI이미지는 없으며 Blender 에셋 변경 원본·명령/설정은 prompts에 기록한다.
