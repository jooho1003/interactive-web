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

- Runtime: `public/spatial-scene.js`; doorway-safe routes: `public/spatial-route.js`.
- Blender master: `art/lab-pavilion.blend`; rebuild with Blender 4.5 `--background --python scripts/build-spatial-lab.py`. Architectural lighting is baked and denoised offline; foliage, water and metal retain browser PBR materials. Intermediate lightmaps live in `art/`; the GLB embeds its texture.
- Distant landscape: fal.ai FLUX.1 schnell. No API key or generation call in the browser. Exact prompt: [archive](../../prompts/jooho-lab.md) and `docs/landscape-generation.json`. `node scripts/prepare-spatial-assets.mjs --generate` skips an existing image; otherwise makes one billable request.
- Three.js addons vendored from r180 match the existing runtime (MIT license). No new runtime package dependencies.
- Settings → 공간 레이어 조정: 7 layers, 42 parameters, including artwork approach/slide duration, drag strength, orbit range and damping; scene/mobile overrides, local persistence and JSON export. Existing shared content brightness/cameraSpeed remain multipliers. Settings/recovery controls cannot be hidden by presentation layers.
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

The gallery reads project images and brightness from shared content. Reduced motion bypasses camera travel. Previous village assets/code remain but are not loaded. This is the first connected architectural demo; Tripo props and photoreal art refinement are not represented as complete.

### Wheel navigation update
- Default wheel navigation follows exterior → studio → each visible work, and reverses on wheel up. Enable **드래그 모드** for continuous, damped perspective-camera orbit; wheel then scrolls the page normally. Escape releases drag mode. Releasing a drag never advances the project.
- Artwork-to-artwork movement now slides directly along the wall. Entrance turns are rounded, pointer response is damped, and static shadows are cached.
- Artwork and thumbnails preserve the complete source image. Focus framing reserves space for copy; compact screens put copy below the image.
- Artwork approach uses a closer 2.4m viewing aisle and takes 4.2 seconds by default. Neighbors slide laterally in 1.8 seconds at the same distance and magnification. Shared framing uses the actual image sizes, so landscape screenshots fill the available area instead of inheriting the tall backboard's margins. Approach/slide duration can be changed in the stage layer settings.
- Hub and project pages use locally hosted [SUIT Variable](https://github.com/sun-typeface/SUIT), distributed under OFL-1.1; license at `public/assets/SUIT-LICENSE.txt`. Embedded standalone experiences keep their own art direction.
- Viewport-fit framing sets the minimum field of view while inspecting work, so camera preferences cannot crop the image. Movement release and settings controls remain available independently of presentation layers.
- All seven default artworks now use actual project screenshots in `public/assets/work-*.webp` (578,160 bytes total), shared by the scene, rail, list and detail pages. Originals: `art/captures/`; source URLs, selected scenes and conversion settings: [capture archive](../../prompts/jooho-lab.md#07--실제-작품-화면--갤러리-대표-이미지-7장). Owner image overrides still take precedence.
