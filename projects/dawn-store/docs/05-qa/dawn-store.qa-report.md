# Dawn Store 최종 QA 리포트

- 검수일: 2026-09-11
- 대상: `projects/dawn-store/app`
- 범위: 브랜치 플레이어 수용 기준, 1440×810 데스크톱, 390×844 모바일, 오디오 에셋
- 결과: PASS

## 수용 기준

| 항목 | 결과 | 확인 내용 |
|---|---|---|
| 7컷 재생·전환 | PASS | intro → hub → coffee → back → magazine → hub → dawn → reflection 흐름 확인 |
| 허브 UI | PASS | 1440×810에서 방향 화살표 2개, 메뉴 3개, `umbrella` DOM 제외 |
| 글로우 전환 | PASS | coffee·magazine 방문 후 글로우가 출입구로 이동 |
| 잡지 타임라인 | PASS | 챕터 점프가 4초·16초·30초에 대응 |
| 히든 링크 | PASS | dawn 00:11–00:16에만 DOM 마운트, 클릭 후 reflection 이동 |
| 엔딩·리플레이 | PASS | reflection 엔딩에서 다시 보기 → intro 확인 |
| KO/EN | PASS | 메뉴·질문·자막·버튼 라벨 전환 확인 |
| 그래프 린트 | PASS | `npm run lint:graph` 통과, 의도된 umbrella unavailable 경고 1건 |
| 모바일 토큰 | PASS | 390×844에서 `mobile`, 화살표 40px, 메뉴 343px/48px, 자막 17px 적용 |
| 성능 예산 | PASS | JS 87.61 KB gzip, CSS 2.79 KB gzip, 이미지 827 KB/최대 151 KB |
| 겹침·overflow | PASS | 데스크톱·모바일에서 메뉴/자막/스킵 분리, 모바일 가로 overflow 없음 |

## 오디오

- `audio/bgm.mp3`: 60초, MP3 128 kbps, 심리스 앰비언스 루프
- `audio/hover.wav`: 60ms
- `audio/click.wav`: 120ms
- `theme.json`의 오디오 토큰을 런타임 훅에 연결하고, 첫 사용자 입력 이후 BGM을 시작하도록 처리
- 음소거 토글과 localStorage 상태 보존 확인
- 세 파일 모두 로컬 서버에서 HTTP 200 및 올바른 MIME 타입 확인

## 자동·브라우저 검증

- `npm run lint:graph`: 통과
- `npm run build`: 통과
- 브라우저 콘솔: 최종 네비게이션 기준 오류 0, 경고 0
- 1440×810: 허브, 히든 링크, reflection, 엔딩, 리플레이 확인
- 390×844: 모바일 토큰, 메뉴 폭, 자막·스킵 배치, 가로 overflow 확인

## 참고

bkit 사전 릴리스 스캐너의 `config-audit`는 앱 루트에 `bkit.config.json`이 없다는 CRITICAL을 보고한다. 이 프로젝트는 `AGENTS.md`와 Vite 설정을 사용하는 독립 정적 앱이며 해당 파일은 제품 규약에 포함되지 않아 제품 결함으로 보지 않았다. 나머지 스캐너(dead-code, completeness, shell-escape, wiring)는 이슈가 없었다.

제작자 이름과 링크는 원본 스토리 데이터의 열린 항목으로 남겨 두었다.

## 2026-10-02 · Blender 렌더 시험

- 실제 CLI 렌더: 계산대 1920×1080/256샘플 약 14분38초, 커피 같은 해상도/128샘플 약 7분24초. 파일은 `../../art/blender-study/`.
- 두 PNG를 열어 컵·유리·금속 반사·심도 확인. Blender 원본에 이미지 3개 pack, 재현 스크립트 2개와 실제 설정 JSON 기록.
- 비교 판정: 상품/소품의 규칙성이 남아 기존 v2 사진 스타일보다 사실적이라는 합격 판정은 하지 않았다. 후보를 보관하고 기본 story/media는 교체하지 않았다.
- `pnpm --filter dawn-store check`: 설정 테스트 5개, 그래프 8노드, 에셋·빌드·이미지 예산 통과. 본 작업은 플레이어 코드를 변경하지 않았다. Dawn layer-kit 미이관 문제는 이번에 해결한 것으로 표시하지 않는다.
- 미확인: 렌더 영상/7컷 공간 일관성/실사 스캔 제품. 두 카메라만 같은 공간에서 검수했다. 원문 제작 요청/출처는 `prompts/dawn-store.md` 카드 12.
