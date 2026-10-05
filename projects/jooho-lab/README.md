# JOOHO LAB — hub

Role: the studio hub of this monorepo (see `docs/03-모노레포-설계.md` §0). Package `jooho-lab`. The public brand is `JOOHO LAB`; code/folder/package names remain `jooho-lab`. Browser storage keys remain `jooho-village-*` and R2 keys remain `museum/*` for saved-data compatibility.

Deploy target: OpenAI Sites (Cloudflare Worker + R2 binding `MEDIA`, `.openai/hosting.json`). Build: `pnpm --filter jooho-lab build` → `dist/client`, `dist/server`.

## Configuration map
One source per layer; full table in docs/03 §0-5.
- Identity and project registry: `public/projects.js` (`profile`, `projects`). Project `id` is the key for every other layer — add, don't rename.
- Editable content schema/defaults/validation: `public/content-schema.js`. `projectIds` is derived from the registry.
- Editable content values: R2 `museum/content.json`, owner-only via Settings. Uploads: R2 `media/`.
- Viewer preferences: `public/preferences.js` → localStorage.
- Owner allowlist: `server/index.js` `ownerEmail`.
- HTML metadata: `public/index.html`, `public/project.html`.
- Embedded works: `scripts/include-experience.mjs <id>` → `public/experiences/<id>/` (committed snapshot; refresh Day Walk with root `pnpm build:hub`, or Dawn with `pnpm build:hub:dawn`).

Project link precedence is currently spread over three places (registry `url`/`liveUrl`, saved content `projects[id].link`, viewer preference `links`) — see docs/03 §0-5 open issues.

## Portfolio gallery

The home page loads an actual Blender-authored pavilion (`assets/lab-pavilion.glb`) with a perspective Three.js camera. Enter the building, choose any work, return to the studio or exterior. All ten works use the same selection and camera flow; registry-order pages reuse the seven baked bays. The thumbnail rail selects camera destinations; project links open their existing destinations directly. Projects without images get generated typographic exhibit posters. The list view, owner editor, shared R2 content, and uploads remain available.

## Spatial scene (2026-10-01)

Architectural refinement (2026-10-02): authored Blender building now has recessed limestone joints, layered roof coping/reveal, deeper bronze frames, side-bay glass and lance-shaped foliage. Architecture exports PBR color/lighting, tangent normals and roughness (GLB 3.76MB). Desktop pool reflects the actual pavilion with a bounded 512px Reflector pass; ≤650px retains environment-lit water. Seeded gravel replaces the flat courtyard surface. Stage exposes eight material/light settings; landscape adds presentation shade (7 layers / 53 parameters). [Exact request, settings and comparison](../../prompts/jooho-lab.md#16--lab-pavilion-realism--건물-구조재질-정교화). Verification and limits: [QA](QA-spatial.md).

Tripo Studio P2.0 follow-up (2026-10-02): user corrected scope to building first. A complete pavilion candidate was generated with the remaining free trial and textured using 20 existing free Studio credits. Visual inspection found incorrect exhibit count and unwanted interior geometry; normal GLB export opens a subscription gate. This candidate is not integrated. [Building prompt and preview](../../prompts/jooho-lab.md#15--lab-pavilion-tripo--전시관-건물-전체-후보); earlier chair attempt and all limits are recorded in [QA](QA-spatial.md).

- Runtime: `public/spatial-scene.js`; doorway-safe routes: `public/spatial-route.js`.
- Blender master: `art/lab-pavilion.blend`; rebuild with Blender 4.5 `--background --python scripts/build-spatial-lab.py`. Architectural lighting/color is baked and denoised offline, with baked tangent normals/roughness and browser PBR response. Intermediate maps live in `art/`; the GLB embeds its textures.
- Distant landscape: fal.ai FLUX.1 schnell. No API key or generation call in the browser. Exact prompt: [archive](../../prompts/jooho-lab.md) and `docs/landscape-generation.json`. `node scripts/prepare-spatial-assets.mjs --generate` skips an existing image; otherwise makes one billable request.
- Three.js addons vendored from r180 match the existing runtime (MIT license). No new runtime package dependencies.
- Settings → 공간 레이어 조정: 7 layers, 51 parameters, including material/light response, presentation shade, artwork approach/slide duration, drag strength, orbit range and damping; scene/mobile overrides, local persistence and JSON export. Existing shared content brightness/cameraSpeed remain multipliers. Settings/recovery controls cannot be hidden by presentation layers.
- Reduced motion moves instantly. Offscreen/hidden/list scenes stop rendering. Model/WebGL failure exposes the list and cannot be overridden by preferences.
- Keyboard on space: Enter enters/focuses, arrows select, Escape returns, Home exterior. Direct project links and skip link remain available.
- Preview: `node scripts/preview-spatial.mjs` → http://127.0.0.1:8879/. Local development server only; `/api/content` uses read-only preview data and editor saves local drafts.
- Verification: `node scripts/verify-spatial.mjs`; browser tests at `/?qa=1` and `/__qa/mobile` on the preview server only. [QA](QA-spatial.md).

## Source and build
`public/` is the authored frontend source (same layout as the Sites source checkout, so files copy across 1:1). `server/index.js` adds the Cloudflare Worker API. `node scripts/build-museum.mjs` writes `dist/client` and `dist/server/` (Worker plus `content-schema.js` and `projects.js`); `dist/` is ignored. No runtime dependencies.

## Editing
Settings opens Exhibition editing by default: words, works, character, space. Live preview is local until Exhibition Save writes shared content to R2. Uploads are PNG/JPG/WebP/GIF, <=5MB and <=25 megapixels. R2 stores the binary image and content JSON; images use immutable unique URLs. Browser preference controls remain local. Export/import includes content and uploaded image URLs for same-site restoration. Defaults preview and discard do not overwrite stored content until save. Text uses textContent, never user HTML. Project links allow only HTTP/HTTPS. Saved title/descriptions/art/links load into home and project detail views.

Writes require Sites-authenticated identity with the verified owner's email allowlist and same-origin Origin header. Anonymous and other-user writes are rejected on the server. The existing Site remains owner-private. Email allowlist should be updated if ownership changes. R2 ETag compare-and-set prevents silently overwriting another editor's changes. Backend failures preserve draft input and show errors. Images uploaded without saving can remain as unreferenced R2 objects.

## Verification
`node scripts/validate.mjs` validates frontend syntax/assets, links and preferences. `.site-publish/test-village-return.cjs` exercises the actual Worker with an in-memory R2 contract adapter: real browser edit, image upload, save/reload/new browser, draft revert, project destination, gallery/keyboard entry, cancel, reduced motion, mobile editor and navigation. It checks server owner/origin authorization, revision conflicts and SVG rejection. Hosted R2/auth integration is checked after publishing.

Existing Dawn interactive experience remains embedded at `/experiences/dawn-store/`; SASU opens its live service. Projects without confirmed live services open their introduction pages. Existing source code and links are preserved.

The gallery reads project images and brightness from shared content. Reduced motion bypasses camera travel. The previous village is separately available at `village.html`; its assets are loaded only on that page.

### Illustrated village page (2026-10-03)
`village.html` restores the original six-building panorama, backpack robot and entrance/cancel choreography. The main gallery links to **작업 동네**, which links back to **전시관**. Both pages share the current eight-project registry, operating destinations, list/search and owner content editor. Six buildings carry works 01–06; Day Walk is the seventh foreground walking-path stop. Its nameplate and the tower's are shown separately to avoid overlap. The eighth work, 선비, remains available through the numbered selector, list and detail links; selecting it preserves the camera, and Enter opens its experience.

The village has **8 layers / 42 parameters**, walking/entering scene overrides and mobile settings in `village.layers.manifest.js`. Settings uses the existing layer panel with its own `jooho-lab-village-layers-v1` key; visit restoration uses `jooho-lab-village-visit-v1`. Gallery settings/visit history are preserved. Shared visitor preferences and published content still apply to both views. Original asset provenance is in prompts cards 01/02; no new artwork was generated. [Village QA](QA-village.md).

### Wheel navigation update
- Default wheel navigation follows exterior → studio → each visible work, and reverses on wheel up. Enable **드래그 모드** for continuous, damped perspective-camera orbit; wheel then scrolls the page normally. Escape releases drag mode. Releasing a drag never advances the project.
- Artwork-to-artwork movement now slides directly along the wall. Entrance turns are rounded, pointer response is damped, and static shadows are cached.
- Artwork and thumbnails preserve the complete source image. Focus framing reserves space for copy; compact screens put copy below the image.
- Artwork approach uses a closer 2.4m viewing aisle and takes 4.2 seconds by default. Neighbors slide laterally in 1.8 seconds at the same distance and magnification. Shared framing uses the actual image sizes, so landscape screenshots fill the available area instead of inheriting the tall backboard's margins. Approach/slide duration can be changed in the stage layer settings.
- Hub and project pages use locally hosted [SUIT Variable](https://github.com/sun-typeface/SUIT), distributed under OFL-1.1; license at `public/assets/SUIT-LICENSE.txt`. Embedded standalone experiences keep their own art direction.
- Viewport-fit framing sets the minimum field of view while inspecting work, so camera preferences cannot crop the image. Movement release and settings controls remain available independently of presentation layers.
- Seven curated exhibition artworks in `public/assets/exhibit-*.webp` (1,354,226 bytes total) are shared by the scene, rail, list and detail pages. Six reference-guided image_gen key visuals plus one public Instagram cover replace full-interface screenshots. References come from actual production sites; Day Walk opens the user-specified Vercel URL. Blog and Hansul Toon replace the two projects without production URLs. [Sources and exact prompts](../../prompts/jooho-lab.md#20--exhibition-art--운영-작품의-전시-키-비주얼); source art: `art/exhibition-20261003/`. Owner image/link overrides retain priority.
- 2026-10-03: **선비 (hanbok-hero)** is included as a standalone experience (`public/experiences/hanbok-hero/`, `include:experience hanbok-hero`) with `work-hanbok-hero.webp`. Since 2026-10-05, POTATO·선비·작업 동네 also hang on the 3D wall: later registry pages reuse the seven baked bays (`exhibitBays` in `spatial-route.js`), keeping original frames, lights and safe camera coordinates. Only the current page and matching search results are visible. Work 10 **작업 동네** opens `village.html` and uses the original panorama as its cover; the village itself keeps nine physical destinations. All three use the existing rail/list/detail/editor controls. Transparent cover images retain their alpha on the exhibit backboard. [QA](QA-spatial.md).

### Photographic surface refinement (2026-10-02)
CC0 photo material sources and a 1K HDRI are documented in `../../art/materials/sources.json`. Six architectural PBR materials keep meter-scale texture detail on UV1; a separate UV0 atlas carries contact occlusion and a small indirect emission contribution. Ground uses photographic color/normal/roughness. Stage exposes ground tint and contact shadow strength (7 layers, 53 parameters). This remains real interactive 3D, not a rendered film.

Run `python scripts/prepare-photo-textures.py` before `blender -b --python scripts/build-spatial-lab.py`. For material-only refresh from the existing packed master and light bake, use `blender -b art/lab-pavilion.blend --python scripts/export-photo-surfaces.py`. 1K web derivatives preserve image resolution; the GLB stays below the existing 6MB budget.

`python scripts/check-photo-browser.py` runs the existing browser QA harness in headless Playwright only when Aside is unavailable; it writes desktop/mobile reports and actual pointer/entry/reset captures. No new runtime package is required.

### Clean stone correction (2026-10-02)
The weathered plaster/cobblestone photos were rejected as too mottled. Walls, steps and floor now use seeded 512² fine-grain stone maps; oak, HDRI and gravel retain their photographed sources. These generated maps retain the legacy `_1k` filename suffix for loader compatibility; their actual resolution is 512². Stone does not reuse the old stained color bake. Contact occlusion is limited to 0.8m, baked at 64 samples and denoised offline. The same preparation/export commands update the packed Blender master and web GLB. Existing stage controls still adjust all six materials. See [card 18](../../prompts/jooho-lab.md#18--lab-clean-stone--얼룩-없는-건물-표면) and `art/clean-after-*.png`; earlier comparison captures are preserved. Use `--prefix clean` for separate fallback QA reports.

### Brighter landscape and interior (2026-10-02)
Landscape brightness is adjustable independently of the model, with lighter ground and less presentation shade. The header uses dark text outside and light text against the interior ceiling. Stage settings now expose interior fill, gallery light and light color: **7 layers / 57 parameters**.

The Blender master adds paper mounts/thin bronze frames, woven upholstery and cushions, desk details and a smooth supported sculpture. Seven physical spot fixtures are baked into a fresh 2048² illumination atlas (32 samples + denoise) alongside the 64-sample contact atlas; both use UV0 while surfaces use UV1. The web adjusts the light map's color/intensity instead of running seven extra real-time lights. The old whole-building color/normal/roughness bakes are historical files, not inputs to the current exporter. Run `python scripts/prepare-photo-textures.py` then `blender -b --threads 4 --python scripts/build-spatial-lab.py`; material/light refresh uses `blender -b art/lab-pavilion.blend --threads 4 --python scripts/export-photo-surfaces.py`. Source details and review captures: [card 19](../../prompts/jooho-lab.md#19--lab-bright-interior--밝은-풍경과-정교한-실내).

## Potato와 작업 동네 통합 (2026-10-04)

원격의 전시관 기본 홈, 7개 전시 칸, 운영 링크·전시 이미지와 선비 작품을 보존했다. 작품 번호는 07 하루 산책, 08 POTATO, 09 선비이며 stable ID는 유지한다. 전시관의 추가 작품은 썸네일·목록·설명·Enter로 열고, `village.html`에서는 9개 목적지를 모두 선언한다. 선비는 기존 탑 앞 산책길 정류장으로 표시한다.

하루 산책과 POTATO 집을 기존 마을 오른쪽에 `assets/village-extension-v1.png`로 연결했다. 건물 위치·클릭 영역·라벨·불빛과 확장 그림은 `village-houses.manifest.js`의 10개 레이어 / 99개 파라미터로 조정한다. 공용 동네 연출은 `village.layers.manifest.js`의 8개 레이어 / 42개 파라미터, 전시관은 `layers.manifest.js`의 7개 레이어 / 57개 파라미터를 유지한다. 동네의 설정 → 전시 편집 → 마을 레이어에서 조정·되돌리기·브라우저 저장·내보내기를 제공한다. 저장 실패 시 적용 중인 값은 유지된다.

`pnpm build:hub:potato`는 Potato 빌드, 체험 스냅샷/표지 복사, 허브 검사/빌드를 실행한다. Potato/선비 체험의 복귀 버튼은 이전에 연 전시관 또는 동네로 돌아간다. 생성 프롬프트는 [카드 22](../../prompts/jooho-lab.md#22--하루-산책potato-건물-확장-village-extension-v1), 통합 검수는 [QA-village.md](QA-village.md)에 기록한다.

## 작업 동네 집·이동 보완 (2026-10-05)

선비를 탑 앞길에서 분리해 `assets/village-seonbi-v1.png`의 독립 한옥으로 연결했다. 이제 자기 링크인 작업 동네를 제외한 작품9개에 서로 다른 집이 있다. 집·확장 그림은 11레이어/108파라미터, 공용 동네는 8레이어/43파라미터다. 새 그림의 이미지·위치·크기·밝기·연결부 블렌드와 안내 버튼 아래 여백(`controls.footerBottom`)을 설정에서 조절한다. 생성 원문은 [카드23](../../prompts/jooho-lab.md#23--선비-독립-한옥--village-seonbi-v1).

드래그는 실제 시작 카메라에서 입력 거리만큼 이동하며 손을 놓은 위치를 유지한다. 가장 가까운 작품을 선택하고 번호·방향키는 기존 작품 안내를 사용한다. 첫/마지막 집을 지나 빈 공간만 보이지 않도록 경계를 제한한다. 모바일에서는 이름표와 움직임 버튼을 분리해 실제 입장을 막지 않는다.

로컬 미리보기 서버(8879)를 실행한 뒤 저장소 루트에서 `python projects/jooho-lab/scripts/check-village-movement.py`로 거리·연속 드래그·입장/복귀를, `python projects/jooho-lab/scripts/check-village-touch.py`로 실제 CDP 터치·세로 스크롤 및 기존 마을 QA를 확인한다. Aside가 응답하지 않을 때 사용하는 헤드리스 검수 스크립트다. 결과·제약은 [QA-village.md](QA-village.md).

2026-10-05 전시관 시각 개선 검토: [POTATO 제작 방식과 비교한 기록](../../docs/03-analysis/jooholab-potato-visual-review.md). 현재 코드의 즉시 페이지 그림 교체와 거리와 무관한 이동 시간을 확인했고, 실제 화면에서 액자/받침의 시각적 무게를 관찰했다. 3D 동선을 유지하면서 전환·조명/액자·선택된 캐릭터의 작은 깊이 반응을 순서대로 개선하는 제안이다. 구현/품질 검증은 아직 수행하지 않았다.

## 전시관 이동·전시 마감 개선 (2026-10-05)

검토1·2를 구현했다. 같은 페이지 이동은 실제 거리에 비례하고 최소/최대 시간을 둔다. 페이지가 바뀌면 설정된 색의 가림막 안에서 그림을 교체한 뒤 나타낸다. 작업실/외관의 페이지 선택은 기존 문 통과·접근 경로를 이어가며, 재선택·뒤로 가기·초기화·동작 줄이기와 목록 전환을 처리한다.

큰 목재판을 없애고 종이 받침·18mm 액자·얇은 선반으로 바꿨다. 새 종이는 일곱 번째 건물 재질이며 조명·접촉 그림자를 다시 구웠다. 설정은 **7레이어/66파라미터**: 이동 최소/최대 시간, 페이지 전환 시간/색, 액자·종이 색/거칠기, 작품 밝기를 추가했다. 치수와 조명 배치는 모델 재빌드 값으로 기록한다. 캐릭터 반응(검토3)은 이번 범위에 포함하지 않는다.

절차/원본은 [에셋 카드24](../../prompts/jooho-lab.md#24--lab-light-gallery--가벼운-액자와-전시-마감), 검증은 [QA-spatial](QA-spatial.md). Aside 검사가 지연될 때 로컬8879 미리보기에서 `python scripts/check-natural-gallery.py`로 같은 QA를 실행하고 `art/gallery-natural-refinement`에 결과와 세 화면 크기 캡처를 저장한다.
