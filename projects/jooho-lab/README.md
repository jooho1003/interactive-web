# JOOHO LAB — hub

Role: the studio hub of this monorepo (see `docs/03-모노레포-설계.md` §0). Package `jooho-lab`. Naming: studio `JOOHO LAB`, the explorable space `JOOHO's village`, code/folder/package `jooho-lab`. The 2026-09 naming update changed browser storage keys to `jooho-village-*` without migrating earlier saved data; R2 keeps `museum/*`.

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

## Village

Restored original illustrated neighborhood with closer full-bleed framing, gentle horizontal camera travel and a delayed door-approach zoom/fade. The image-based 2.5D village replaces the rejected polygonal museum. Owner editor, shared R2 content and uploads remain available; saved custom text and images are preserved. Only exact former museum defaults migrate to village wording/colors when loaded.

## Source and build
`public/` is the authored frontend source (same layout as the Sites source checkout, so files copy across 1:1). `server/index.js` adds the Cloudflare Worker API. `node scripts/build-museum.mjs` writes `dist/client` and `dist/server/` (Worker plus `content-schema.js` and `projects.js`); `dist/` is ignored. No runtime dependencies.

## Editing
Settings opens Exhibition editing by default: words, works, character, space. Live preview is local until Exhibition Save writes shared content to R2. Uploads are PNG/JPG/WebP/GIF, <=5MB and <=25 megapixels. R2 stores the binary image and content JSON; images use immutable unique URLs. Browser preference controls remain local. Export/import includes content and uploaded image URLs for same-site restoration. Defaults preview and discard do not overwrite stored content until save. Text uses textContent, never user HTML. Project links allow only HTTP/HTTPS. Saved title/descriptions/art/links load into home and project detail views.

Writes require Sites-authenticated identity with the verified owner's email allowlist and same-origin Origin header. Anonymous and other-user writes are rejected on the server. The existing Site remains owner-private. Email allowlist should be updated if ownership changes. R2 ETag compare-and-set prevents silently overwriting another editor's changes. Backend failures preserve draft input and show errors. Images uploaded without saving can remain as unreferenced R2 objects.

## Verification
`node scripts/validate.mjs` validates frontend syntax/assets, links and preferences. `.site-publish/test-village-return.cjs` exercises the actual Worker with an in-memory R2 contract adapter: real browser edit, image upload, save/reload/new browser, draft revert, project destination, gallery/keyboard entry, cancel, reduced motion, mobile editor and navigation. It checks server owner/origin authorization, revision conflicts and SVG rejection. Hosted R2/auth integration is checked after publishing.

Existing Dawn interactive experience remains embedded at `/experiences/dawn-store/`; SASU opens its live service. Projects without confirmed live services open their introduction pages. Existing source code and links are preserved.

POTATO is registered as work 08, with search/category filtering, collection cards, owner content editing and a detail page. Its embedded portfolio opens at `/experiences/potato-designer/`; the existing experience header returns to the exhibition. Refresh its snapshot and reused character cover with root `pnpm build:hub:potato`. Asset provenance: [Potato prompt card](../../prompts/potato-designer.md). Browser verification and publication limits: [QA.md](QA.md).

The original panorama retains its six houses. A separate illustrated panel extends the street with Day Walk (07) and POTATO (08); all eight destinations have house labels, camera travel, lights, walking character and click/Enter entrance. New registry entries also need a house declaration, which `validate` now checks to prevent silent omission.

Settings → Exhibition editing → 마을 레이어 edits eight house overlays and the new image panel (9 layers, 89 parameters). Positions, click areas, label size/colors, lights, panel position/size/image/brightness/blend, visibility and opacity support common, project-scene and mobile values. Undo, restore, browser-local save and JSON export are provided; save failure keeps the current view. These values are separate from shared R2 content and are not published to other visitors. Authored defaults are in `public/layers.manifest.js`/`layers.values.json`; build emits CSS/runtime/vendor copies. The original canvas, camera, character and remaining hub UI still need the full docs/11 migration.

Extension image: `public/assets/village-extension-v1.png`; [generation prompt and inspection](../../prompts/jooho-lab.md). The shared probe supports the manifest's stylesheet list so parameters in `village-style.css` are observed. Attribute coordinate bindings are also checked against actual projected DOM sizes in browser QA.

Village scene reads shared character image, visibility, scale/speed, camera speed and brightness. Project images remain on collection and detail pages. The panorama depicts the houses; changing a project thumbnail does not reconstruct its house. Reduced motion skips travel and entry animation. The canvas redraws on camera/content changes; DOM character motion does not force an idle WebGL redraw.
