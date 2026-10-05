# 전시관 레이어 배포 저장 설계

2026-10-05 · bkit Design · Plan: gallery-layer-publish.plan.md

## Context Anchor

WHY: 배포 배치 보존 / WHO: 제작자·방문자 / RISK: 초안 유실·검수 덮어쓰기 / SUCCESS: 새 브라우저에 같은 값 / SCOPE: 전시관 저장.

## 1. Overview 및 설계 선택

| 안 | 복잡도 | 효과 | 판단 |
|---|---|---|---|
| A 내보내기 후 수동 파일 복사 | 낮음 | 매번 복사 필요 | 저장 버튼 기대에 부족 |
| B 원격 R2 게시 관리 | 높음 | 서버 게시 가능 | Git에 포함되는 요구와 별도 |
| C 정적 값 파일 + 로컬 저장 API | 중간 | 저장 버튼이 배포 원본 갱신 | 기존 미리보기 재사용, 선택 |

사용자의 배포 보존 요청을 구현 승인으로 적용한다. 재승인 없이 C로 진행한다.

## 2. Architecture / Data Model

- public/layers.values.json: 기존 iw-layers/1 정본. build-museum의 public 복사로 dist/client에 포함.
- browser layer-persistence: 파일 fetch/검증. loopback에서만 API capability 확인. 로컬은 기존 브라우저 값도 읽어 이전 수정 보존. 배포 초안은 게시본과 같은 base 식별값일 때만 적용.
- scripts/layer-persistence: 매니페스트 검증과 원자적 JSON 쓰기. 고정 경로 사용.
- editor: 비동기 저장, 요청 중 중복 저장 제한. 요청 시점 값이 저장본이며 요청 중 다른 편집은 미저장 유지. 파일 실패를 브라우저 성공으로 표시하지 않는다.

## 3. API Specification

로컬 preview만 `/api/layers` 제공. GET → {canEdit:true,revision,values}. PUT {revision,values} → 갱신된 동일 응답. 400 잘못된 값/JSON, 403 Host/Origin, 409 다른 탭 변경, 413 256KB 초과, 500 파일 쓰기 실패. GET/PUT revision은 파일 내용 SHA256. 쓰기를 직렬화하여 동일 revision 동시 요청은 한 건만 성공. 배포 Worker는 변경하지 않는다.

## 4. UI / Error Handling

로컬: ‘프로젝트 파일에 저장됩니다. 커밋·배포하면 반영됩니다.’ 성공 시 해당 설명. 정적 환경: ‘브라우저 초안 저장’, 배포 반영은 로컬 파일 저장 필요 안내. 파일 읽기/검증 실패 시 저장 차단 및 상태 표시. 실패·충돌 시 화면 초안 유지, JSON 내보내기와 새로고침 안내. localStorage 제한이어도 파일 저장 성공은 유지.

## 5. Test Plan / Layer Contract

임시 파일 API 통합 검수: 실제 파일 재읽기, 잘못된 값/작품/Origin/oversize, revision 충돌/동시 요청. Playwright QA의 로컬 API는 메모리로 격리하고 async 완료를 기다린다. 배포 검수는 build 결과를 별도 정적 서버에서 열고 로컬 키 없이 값 일치/이전 초안 무시/게시본 변경 시 초안 만료를 확인한다. 기존 12/131 lint와 실제 probe, 전체 check/build 수행.

## 6. Implementation Guide

1. 정본 초기화·로컬 API·Node 통합 테스트.
2. 브라우저 파일 로드·저장 어댑터·editor 연결.
3. 검수 격리·배포 브라우저 검수·README/QA/Analysis 기록.

한 세션에서 수행하며 공용 패키지는 변경하지 않는다.
