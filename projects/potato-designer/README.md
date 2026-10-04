# POTATO — Designer in Motion

[영상 레퍼런스](https://www.instagram.com/reels/DasmbuiBvvv/)의 모니터 화면을 참고한 인터랙티브 포트폴리오 스터디입니다. 기존 앱과 독립적인 정적 사이트로, 별도 설치 없이 실행할 수 있습니다.

```powershell
pnpm --filter potato-designer dev
# http://localhost:4176
# 관리자: http://localhost:4176/admin
pnpm --filter potato-designer check
```

- 마우스 위치에 반응하는 캐릭터 깊이감, 등장 모션, 모션 재생/정지
- 세 가지 분야별 색상 및 캐릭터 각도 전환
- 작업 선택, 소개, 프로젝트 메모 저장 패널
- 모바일 레이아웃, 키보드 포커스 및 Escape 닫기, 동작 줄이기 설정 지원
- 프로젝트 메모는 로컬 텍스트 파일로만 내려받으며 서버에 전송하지 않음
- 메모 초안과 분야를 현재 브라우저에 자동 저장·복구하고, `초안 지우기`로 삭제
- 모션을 멈춰도 선택한 분야와 자세를 유지하며, 패널이나 다른 탭을 보는 동안 배경 모션 정지
- 작업명·태그 검색, 분야 필터, 관심 작업만 보기, 브라우저 관심 저장
- 작업 상세의 출발점·디자인 방식·구성 요소 확인
- 상세에서 프로젝트 메모로 이동하면 참고 작업과 분야 연결; 기존 메모 본문 유지

`dist`는 정적 작품 원본입니다. `style.css`, `app.js`와 레이어 매니페스트를 수정합니다. `layers.css`, `layers.values.js`, `vendor/layer-kit/`와 HTML의 `data-layer-*` 바인딩 내용은 `pnpm --filter potato-designer build`가 생성하므로 직접 수정하지 않습니다. `check`는 데이터·관리자 API·레이어 계약·생성물 최신성·구문·자산 연결을 검사합니다. Google Fonts를 사용할 수 없으면 시스템 글꼴로 표시합니다.

초안은 현재 브라우저·사이트 주소에만 저장됩니다. 저장소가 차단되어도 메모 작성과 파일 다운로드는 사용할 수 있습니다. 기기의 동작 줄이기가 켜져 있으면 재생 버튼에 `REDUCED MOTION`이 표시됩니다.

Work에서 카드 본문을 누르면 상세를 볼 수 있습니다. `분위기 적용`은 메인 장면을 바꾸고, `관심 저장`은 작업을 이 브라우저에 보관합니다. 상세의 `이 작업으로 메모 시작`은 선택한 분야와 참고 작업을 메모에 연결합니다. 참고 작업은 새로고침 후에도 복구되며 다운로드 파일에도 포함됩니다. `연결 해제`는 메모 본문을 유지합니다. 관심 저장이 차단되면 이번 방문 동안만 사용할 수 있다는 안내가 표시됩니다.

작업 제목·태그·기획·구성 요소는 `dist/work-data.js`에서 수정합니다. 관심·초안의 연결에 사용하는 `id`는 안정적으로 유지하세요. 현재 메인 장면은 세 분야이므로 새로운 분야를 추가할 때는 `app.js`의 장면과 분야 선택 옵션도 함께 확장해야 합니다.

브라우저 회귀 검수는 `scripts/browser-qa.mjs`의 기본 내보내기 함수에 Playwright `Page`를 전달해 실행합니다. 검수용 브라우저에서 앱의 초안을 지우므로 개인 작성 내용이 없는 별도 세션을 사용하세요. 검수 기록은 [QA.md](QA.md)에 정리합니다.

신규 탐색→메모 흐름은 `scripts/work-browser-qa.mjs`로 검수합니다. 검색 결합 조건과 저장 데이터 정규화는 `pnpm check`에 포함된 Node 테스트로 확인합니다. 개발 시 다시 참고할 기존 원칙과 이번 구현의 교훈은 [인터랙티브 개발 참고 원칙](../../docs/10-인터랙티브-개발-참고원칙.md)에 기록합니다.

원본의 3D 모델과 애니메이션 소스는 제공되지 않았으므로 생성한 2D 캐릭터 이미지에 CSS 원근/이동/회전을 적용했습니다. 모델의 관절이 움직이는 실제 3D 애니메이션은 아닙니다. 작업 카드들은 실제 고객 사례가 아닌 이 페이지용 디자인 스터디입니다.

2026-10-04: 이 캐릭터 제작 방식이 인터랙티브 웹의 기본 비주얼 방식이 되었습니다. 프롬프트 문구의 역할, 합격 기준, 무대 구조, 시작값, 다른 앱으로 가져가는 법은 [14번 문서](../../docs/14-2.5D-이미지-제작-방식.md)에 정리했습니다.

2026-09-23 후속 설계: [Meshy → Blender → Three.js 공통 제작 파이프라인](../../docs/13-3D-공통-제작-파이프라인-설계.md). POTATO 캐릭터 하나를 같은 원본에서 숏폼과 실제 3D 웹으로 출력하는 첫 검증을 제안합니다. 자산 생성·3D 런타임·레이어 확장은 아직 구현하지 않았습니다.

## 캐릭터 자산

- 파일: `dist/assets/character.png` (1254 × 1254, 투명 PNG)
- 도구: built-in image_gen
- 프롬프트: Premium stylized 3D collectible youthful adult East Asian male designer, black side-parted hair, black oval sunglasses, black/ivory striped long sleeve shirt, oversized charcoal cargo pants, chunky black sneakers. Extremely foreshortened flying kick toward camera with huge sole in lower-right foreground, one hand reaching left, other near glasses. Full figure within square frame, genuine transparent background, soft neutral studio lighting, detailed cloth, no text, no UI, no floor.

배포는 Sites 소유자 전용으로 구성되어 있습니다.

## Scene Studio 관리자

`pnpm --filter potato-designer dev` 실행 후 [로컬 관리자](http://localhost:4176/admin)를 엽니다. 홈/작업 목록/상세/소개/메모를 순서대로 보고, Brand/Digital/Character 장면을 선택해 실제 작품 화면을 편집합니다. 화면에서 클릭·드래그하거나 20개 레이어의 인스펙터를 사용합니다. 장면별·데스크톱/와이드/태블릿/모바일별로 위치, 크기, 색, 문구, 이미지, 모션·포인터 반응을 조절할 수 있습니다. 세부 디자인까지 총 619개 파라미터를 선언했습니다.

요소 편집/직접 체험을 전환하고, 실제 모션의 재생 시점을 이동할 수 있습니다. 전체 맞춤에서는 장면 카드가 함께 보이며, 너비 맞춤/100%로 확대해 확인할 수 있습니다. 초안 자동 저장, 되돌리기/다시 하기, 게시본 비교, JSON 가져오기/내보내기, 이전 게시본의 초안 복구를 제공합니다.

**로컬 게시는 이 컴퓨터의 작품 파일을 갱신하는 기능**입니다. 외부 배포는 수행하지 않습니다. 초안과 이전 게시값은 `.studio/`에 저장하며 Git에 포함하지 않습니다. 관리자 파일은 `admin/`에 따로 두어 정적 `dist` 배포에 포함되지 않습니다. 기본 모드는 단일 사용자 로컬 컴퓨터를 신뢰하며 127.0.0.1에만 바인딩합니다. 추가 로그인은 서버 시작 전에 PowerShell의 `$env:ADMIN_PASSWORD`에 비밀번호를 지정하면 활성화됩니다. 원격 서비스 운영에는 별도의 서버 측 소유자 인증 어댑터가 필요합니다.

설계 정본: [Scene Studio 관리자 설계](../../docs/12-Scene-Studio-관리자-설계.md). 공용 코어: [@iw/layer-kit](../../packages/layer-kit/README.md). 기존 작품 검사 92개와 관리자 검사 48개, 전체 파라미터 probe 결과는 [QA.md](QA.md)에 있습니다.
