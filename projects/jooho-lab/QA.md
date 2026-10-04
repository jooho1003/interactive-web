# JOOHO LAB 검수 기록

## 2026-10-04 — 상단 마을 7·8번 건물 표시

앞선 작품 등록은 실제 상단 건물 표시를 완성하지 못했다. `sceneProjects`의 6개 제한을 제거하고, 안정된 작품 ID에 연결된 매니페스트 좌표로 8개 건물을 투영한다. 원본 6채의 그림·좌표는 유지하고 오른쪽에 새 그림 패널을 덧붙였다. 파랑새/시계 집은 하루 산책, 감자/연필 아틀리에는 POTATO다. 연결부는 겹침과 레이어 블렌드로 완화했다. 원본 재생성·3D 모델 도입은 하지 않았다.

| 범위 | 결과 |
|---|---|
| 실제 상단 렌더링 | 라벨 8개 존재; 7·8번 선택 후 화면 안 실제 건물·라벨과 선택 상태 확인 |
| 입장/복구 | 7·8번 건물 클릭→입장 모션→각 체험→전시실 복귀; 입장 취소·라벨 포커스 복귀 통과 |
| 모바일/키보드 | 320×740에서 POTATO 표시·가로 넘침 없음; 동작 줄이기·방향키 8→7 이동·Enter 입장 통과 |
| 검색 | 빈 결과에서는 모든 상단 라벨 숨김; Potato 검색으로 표시 복구 통과 |
| 레이어 조정 | 클릭 영역 폭을 바꿨을 때 실제 DOM 사각형도 작아짐; 되돌리기·위치 저장·새로고침 복구·기본값 복구 통과 |
| 저장 실패 | localStorage.setItem 차단 시 저장 실패 안내와 현재 위치값 유지 확인 |
| 레이어 lint/probe | 집 8개+확장 그림 1개, 89개 파라미터. lint 오류 0, 브라우저 probe 89/89, 실패 0 |
| Potato 회귀 | 기존 허브→Potato 검수 재실행, 내장 Potato probe 619/619 통과 |
| 자산/런타임 | 주 검수 페이지의 로컬 HTTP 실패 0, 미처리 JavaScript 오류 0 |
| 워크스페이스 | 전체 `pnpm check` 통과; 기존 Dawn `umbrella` 경고 1건 |

시각 확인: `.site-publish/village-day-walk-desktop.png`, `village-potato-designer-desktop.png`, `village-potato-mobile.png`. 브라우저 검수 소스는 `.site-publish/check-eight.cjs`이며 이 폴더는 Git에서 제외하는 로컬 작업 기록이다. [프롬프트 카드](../../prompts/jooho-lab.md)에 내장 image_gen 원문·참조·실제 크기·접합 조정을 기록했고 로컬 웹 보관함을 재생성했다.

검수 중 클릭/키 입력 직후 DOM 모델 값은 먼저 바뀌고 투영 라벨은 다음 rAF에서 갱신됨을 확인했다. 자동 검사는 실제 aria-current/hidden·사각형이 갱신될 때까지 기다린다. 시간 초과·직전 프레임 값을 성공으로 처리하지 않는다.

레이어 설정은 이 브라우저에 저장하며 원격 R2 콘텐츠를 바꾸지 않는다. 좌표 attribute probe는 속성 변화 검사이고, 실제 투영은 별도 사각형 검사로 보완했다. 허브 원본 캔버스·카메라·캐릭터·나머지 UI의 전체 계약 이관은 미완료다. 실제 iOS/Android, Safari/Firefox, 스크린 리더, 공유 R2/호스팅 동작, claude.ai 보관함 재게시는 확인하지 않았다. 기존 Sites 연결 오류로 이번 변경도 온라인 게시하지 않았다.

## 2026-10-04 — POTATO 작품 등록

정본 `public/projects.js`에 안정된 ID `potato-designer`와 작품 번호 08을 추가했다. 기존 목록·검색·분야·소개·콘텐츠 편집기 구조를 사용한다. `public/experiences/potato-designer/`는 Potato 정적 작품과 layer-kit의 스냅샷이며 관리자 서버 파일은 포함하지 않는다. `pnpm build:hub:potato`는 스냅샷과 캐릭터 표지를 함께 갱신하고 허브를 검사·빌드한다. 표지는 기존 캐릭터를 그대로 재사용했다([프롬프트 카드](../../prompts/potato-designer.md)).

| 범위 | 결과 |
|---|---|
| `pnpm build:hub:potato` | 8개 작품 registry, 링크·자산 검사, 허브 빌드 통과 |
| `pnpm check` | 전체 워크스페이스 통과. 기존 Dawn의 `umbrella` 목적지 경고 1건 |
| 실제 Chromium 브라우저 | 작품 수 08, Potato 검색·인터랙티브 필터, 빈 결과·검색 복구, 소개 URL의 내용·체험 버튼, 장면 전환, 작업 검색·초기화·Escape 닫기 통과 |
| 입장·복귀 | 소개 페이지→내장 체험→전시실, 검색/선택 복구, 08번 선택→공간에 포커스→Enter 입장, 목록 보기의 카드 입장 통과 |
| 모바일·동작 줄이기 | 320×740 Chromium에서 허브·체험 가로 넘침 없음, OS 동작 줄이기에서 Potato 모션 버튼 비활성 확인 |
| 레이어 계약 | 원본 Potato lint 오류 0; 내장 체험에서 probe 619/619, 실패 0, 조건부 스타일 148개 |
| 런타임·자산 | 주 검수 페이지 미처리 JavaScript 오류 0, 로컬 HTTP 실패 0. 외부 Google Fonts를 차단해 시스템 폰트로 검수 |
| 프롬프트 보관함 | 기존 생성 프롬프트 카드에 표지 재사용 위치를 기록하고 `pnpm prompts:build`로 로컬 gallery/catalog 갱신 |
| 온라인 반영 | 기존 `.openai/hosting.json`의 project_id에 get_site·소스 자격증명 발급 모두 `NOT_FOUND`; 현재 연결 계정의 list_sites 결과 0개. 게시하지 못함 |

새로 확인한 결함: 마을은 `scene.js`의 6개 건물 위치만 표시하고, registry의 7번째 이후 항목은 선택되어도 `scene.enter`가 아무 동작을 하지 않았다. 건물 없는 유효한 작품은 기존 `onOpen`으로 바로 열도록 수정했다. 기존 건물 입장 모션은 유지한다. 목록 추가가 새 건물을 생성하는 기능은 아니다.

기존 디자인에서 `project-detail`은 CSS로 숨겨져 있으므로 소개 링크의 클릭을 통과했다고 기록하지 않는다. 소개 페이지는 registry에 대응하는 URL로 직접 열어 검수했고, 실제 입장은 컬렉션 카드·목록 보기·Enter로 검수했다.

이번 변경은 콘텐츠 등록이며 새 시각 레이어/파라미터/고정값을 도입하지 않았다. 허브의 전체 레이어 이관은 docs/11의 기존 미구현 범위다. probe의 조건부 활성화 검사를 실제 모든 hover/모달/기기 상황 검수와 동일하게 해석하지 않는다.

로컬 검수 스크립트/캡처는 Git에서 제외하는 `.site-publish/check-potato.cjs`, `potato-hub-desktop.png`, `potato-embedded-desktop.png`, `potato-embedded-mobile.png`에 남겼다. 실제 iOS/Android, Safari/Firefox, 스크린 리더, 호스팅 R2/인증·저장 실패, claude.ai 보관함 재게시와 프로덕션 동작은 이번에 확인하지 않았다. 새 저장 코드는 추가하지 않았다.
