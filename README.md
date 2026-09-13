# 인터랙티브 웹 양산 프로젝트

AI World 2026 김그륜 세션(본편 영상 + Q&A 녹취)과 레퍼런스 사이트 5곳 분석을 바탕으로, 인터랙티브 웹을 **복제 → 확장 → 배포**로 양산하기 위한 모노레포 설계와 제작 가이드.

문서 인덱스: [docs/00-README.md](docs/00-README.md) · 모노레포 구조와 앱 역할(작품·허브): [docs/03 §0](docs/03-모노레포-설계.md)

## 워크스페이스

pnpm 워크스페이스다 (Node 24, `pnpm@9.13.2`). 루트에서 `pnpm install` 한 번.

| 명령 | 하는 일 |
|---|---|
| `pnpm check` | 전 패키지 `check` (dawn-store 검증·테스트, juho-lab 정적 검증) |
| `pnpm dev:dawn` | dawn-store 개발 서버 |
| `pnpm build:hub` | dawn-store 빌드 → 허브에 스냅샷 복사 → 허브 검증 → 허브 빌드 |

| 폴더 | 역할 | 패키지 |
|---|---|---|
| `projects/dawn-store/app` | 작품 | `dawn-store` |
| `projects/juho-lab` | 허브 | `juho-lab` |
| `packages/` | 공용 코드 (두 번째 소비자가 생길 때 추출) | — |

원본 영상·사진(HEIC)·음성 파일은 용량 문제로 저장소에 포함하지 않는다. 전사 텍스트는 `docs/transcripts/`에 있다.

## 첫 작품

[`projects/dawn-store/`](projects/dawn-store/) — 「새벽 세 시 · Still Open」. 패밀리 B(분기형) 미니 버전 7컷. 기획·와이어프레임은 Claude, 구현·이미지는 Codex가 맡는다. 설계는 [SPEC.md](projects/dawn-store/SPEC.md).

관람 설정 프리셋·자동 저장·설정 파일 가져오기/내보내기 및 개발·자동 검증 명령은 [앱 사용 안내](projects/dawn-store/app/README.md)를 참고한다.

## 포트폴리오

[`projects/juho-lab/`](projects/juho-lab/) — 「JUHO LAB」. 바이브 코딩 프로젝트 6개를 둘러보는 3D 포트폴리오. 공간·목록 보기, 분야 필터와 검색, 프로젝트 소개 및 코드 바로가기를 제공한다. 실행과 콘텐츠 수정 방법은 [사용 안내](projects/juho-lab/README.md)에 있다.
