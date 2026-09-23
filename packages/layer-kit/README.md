# @iw/layer-kit · v0.1

첫 소비자: `projects/potato-designer`. 프레임워크 의존성 없는 레이어 값·CSS·렌더러 계약이다. [관리자 설계](../../docs/12-Scene-Studio-관리자-설계.md)를 함께 읽는다.

- `emptyValues`, `setValue`, `scopeMap`: `iw-layers/1` 범위별 수정값.
- `validateValues`, `validateValue`, `validImage`: 버전·키·타입·범위 검사. 오류가 있으면 부분 적용하지 않는다.
- `resolve`, `compileCSS`: 같은 우선순위로 런타임/정적 CSS 생성.
- `createLayerHost`: CSS 변수·텍스트·이미지 바인딩, 장면·화면 크기 변경, 구독.
- `lint(manifest, css)`: 레이어/변수 중복, 잘못된 기본값, 보이기/불투명도, 미사용 변수, 고정 구조 기록 검사.
- `probe(host)`: 실제 DOM 계산 스타일/텍스트/이미지 속성/키프레임 변화 검사. 원래 CSS의 미디어·hover 조건을 잠시 활성화하므로 전용 QA 페이지에서 실행한다.

```powershell
pnpm --filter @iw/layer-kit check
node packages/layer-kit/bin/layer-kit.mjs lint projects/potato-designer/dist
pnpm --filter potato-designer layers:build
```

```js
// Dedicated browser QA page after loading Potato Designer:
const { layerHost } = await import('/app.js');
const { probe } = await import('/vendor/layer-kit/probe.js');
const result = await probe(layerHost);
if (result.failed.length) throw new Error(JSON.stringify(result.failed));
```

매니페스트 정본은 앱의 `dist/layers.manifest.js`, 게시값 정본은 `layers.values.json`이다. 앱 빌더가 `layers.css`, `layers.values.js`, vendor 런타임, HTML의 `data-layer-text`/`data-layer-image` 표시를 생성한다. vendor 사본을 직접 수정하지 않는다.

DSL/React 어댑터/작품 생성기와 다른 세 앱 이관은 후속 범위다. 관리자 UI와 로컬 게시 서버는 현재 Potato Designer 어댑터가 소유한다.
