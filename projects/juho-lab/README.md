# JUHO Village

Restored original illustrated neighborhood with closer full-bleed framing, gentle horizontal camera travel and a delayed door-approach zoom/fade. The image-based 2.5D village replaces the rejected polygonal museum. Owner editor, shared R2 content and uploads remain available; saved custom text and images are preserved. Only exact former museum defaults migrate to village wording/colors when loaded.

## Source and build
`dist/` remains authored frontend source. `server/index.js` adds the Cloudflare Worker API. `node scripts/build-museum.mjs` writes `.build/dist/client` and `.build/dist/server/index.js`; `.build` is ignored. The dedicated Sites source checkout uses `public/` for these exact frontend files and builds into `dist/`. No new runtime dependencies.

## Editing
Settings opens Exhibition editing by default: words, works, character, space. Live preview is local until Exhibition Save writes shared content to R2. Uploads are PNG/JPG/WebP/GIF, <=5MB and <=25 megapixels. R2 stores the binary image and content JSON; images use immutable unique URLs. Browser preference controls remain local. Export/import includes content and uploaded image URLs for same-site restoration. Defaults preview and discard do not overwrite stored content until save. Text uses textContent, never user HTML. Project links allow only HTTP/HTTPS. Saved title/descriptions/art/links load into home and project detail views.

Writes require Sites-authenticated identity with the verified owner's email allowlist and same-origin Origin header. Anonymous and other-user writes are rejected on the server. The existing Site remains owner-private. Email allowlist should be updated if ownership changes. R2 ETag compare-and-set prevents silently overwriting another editor's changes. Backend failures preserve draft input and show errors. Images uploaded without saving can remain as unreferenced R2 objects.

## Verification
`node scripts/validate.mjs` validates frontend syntax/assets, links and preferences. `.site-publish/test-village-return.cjs` exercises the actual Worker with an in-memory R2 contract adapter: real browser edit, image upload, save/reload/new browser, draft revert, project destination, gallery/keyboard entry, cancel, reduced motion, mobile editor and navigation. It checks server owner/origin authorization, revision conflicts and SVG rejection. Hosted R2/auth integration is checked after publishing.

Existing Dawn interactive experience remains embedded at `/experiences/dawn-store/`; SASU opens its live service. Projects without confirmed live services open their introduction pages. Existing source code and links are preserved.

Village scene reads shared character image, visibility, scale/speed, camera speed and brightness. Project images remain on collection and detail pages. The panorama depicts the houses; changing a project thumbnail does not reconstruct its house. Reduced motion skips travel and entry animation. The canvas redraws on camera/content changes; DOM character motion does not force an idle WebGL redraw.
