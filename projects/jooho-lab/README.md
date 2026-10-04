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

The home page loads an actual Blender-authored pavilion (`assets/lab-pavilion.glb`) with a perspective Three.js camera. Enter the building, choose one of seven exhibits, return to the studio or exterior. The thumbnail rail selects camera destinations; project links open their existing destinations directly. Projects without images get generated typographic exhibit posters. The list view, owner editor, shared R2 content, and uploads remain available.

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
- 2026-10-03: an eighth work, **선비 (hanbok-hero)**, is included as a standalone experience (`public/experiences/hanbok-hero/`, `include:experience hanbok-hero`) with `work-hanbok-hero.webp`. The pavilion bakes exactly seven bays (`exhibitBays` in `spatial-route.js`), so only the first seven works hang on the 3D wall; later works appear in the rail, list and detail pages, and selecting them updates the panel without moving the camera (Enter opens the work).

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
