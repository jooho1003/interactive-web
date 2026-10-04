# 전시 대표 이미지 설계 · 2026-10-03

Plan: ../../01-plan/features/exhibition-art.plan.md

## Context Anchor
운영 사이트에서 관찰한 정체성을 7개 그림에 담는다. 가짜 UI를 만들지 않으며 작품 콘텐츠를 projects.js에서 교체한다.

## 선택한 방식
최소 교체(A): 기존 UI 캡처만 다시 찍기 — 전시에서 작은 글자·빈 상태 문제 지속.
새 갤러리(B): 레이아웃/프레임까지 새 제작 — 이번 이미지 요청에 불필요.
균형(C, 채택): 기존 전시 동작 유지, 공개 원본 아트 + 별도 키 비주얼, 운영 링크 수정.

| 작품 | 이미지 방향 | 참조 |
|---|---|---|
| ChemiForge | 파란 근거선·투명 처방 시료·문서: 운영 hero를 참조한 세로 생성본 | chemiforge.com으로 리다이렉트 확인 |
| 사수 | 흩어진 대화·종이가 한 개의 결정으로 이어지는 녹색 에디토리얼 정물 | sasu-alpha.vercel.app |
| 그날의 먹거리 | 동네 식당의 한 끼·수첩, 담백한 푸드 사진 | blog.naver.com/chip109 |
| 새벽 세 시 | 비에 젖은 유리·불 켜진 편의점·커피, 조용한 밤의 영화 스틸 | 운영 experiences/dawn-store |
| 한술툰 | 공개 1편 표지: 보리 캐릭터·원작 그림과 텍스트 유지 | instagram.com/hansul_toon |
| 종말의 탑 | 붉은 균열의 거대한 탑, 입구로 향하는 계단·안개 | tower-50.vercel.app |
| 하루 산책 | 아침·노을·밤으로 이어지는 주택가와 걷는 캐릭터 | 사용자 지정 운영 experiences/day-walk |

## 연결
public/assets/exhibit-<id>.webp에 최종본. art/exhibition-20261003에 운영 참조와 생성 원본·출처. 그림 리터럴은 작품 데이터의 image; 기존 owner override 우선순위 유지. liveUrl은 확인한 운영 주소로 설정. 새 콘텐츠 두 건의 상세 보조 링크는 linkLabel을 표시해 블로그·인스타그램 링크를 소스 코드라고 부르지 않는다.

## 레이어 계약·검증
Plan의 기존 7층/57파라미터 유지. full artwork contain과 정보 패널의 분리를 재사용한다. pnpm check/build, 7이미지 decode/실주소 검사, 실제 선택→상태→이미지→복귀 및 모바일 probe. 변경 없는 저장 동작은 기존 QA 범위를 유지하며 새 저장 실패 검증을 주장하지 않는다.

## 검수에서 조정한 것
ChemiForge 가로 원본은 세로 패널에서 작게 보여 원본 구성을 참조한 세로 키 비주얼로 대체했다. 기존 확대 QA는 가로 폭만 보아 세로 작품의 높이를 반영하지 못했다. 가로 또는 세로 표시 크기를 검사하도록 조정하며 그림 전체 표시/설명 충돌/카메라 안전 경로/이동 시간 기준은 유지한다.

## 검증 결과
최종 7개 WebP 총 1,354,226B. 기존 레이어 7개/57파라미터 모두 검수 통과. 전체 desktop/mobile/short-mobile QA 141/142/142 PASS, 실제 운영 Day Walk 링크 진입 PASS. 블로그/한술툰 상세 링크와 그림 로딩도 두 화면에서 PASS. 자세한 기록은 `../../../QA-spatial.md`와 `../../../art/exhibition-20261003/link-and-artwork-qa.json`을 따른다.
