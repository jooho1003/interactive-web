# Spatial LAB QA — 2026-10-01

## Scope / workflow
First connected architectural demo approved by user. bkit Plan → Design → Do → Check → Act, followed by an independent read-only review and final verification. This is an actual Blender mesh scene, not a sequence of enlarged photographs.

## Verified

| Check | Result |
|---|---|
| Existing source/assets/project URLs/preferences validator | PASS, 7 projects |
| Layer-kit lint / vendored runtime integrity | PASS, 7 layers, 37 parameters, zero lint errors |
| Scene/mobile override semantics | PASS |
| Doorway, ceiling and side-wall route checks | PASS, 77,077 samples, including interruption and reversal |
| GLB header/length and <6MB transfer budget | PASS, 3,194,504 bytes |
| Aside desktop integration | PASS, 62 assertions |
| Aside 390×844 iframe integration | PASS, 63 assertions (real responsive iframe, not a physical phone) |
| Layer DOM/attribute probe | All 37 parameters change their concrete bindings, desktop and mobile |
| Project graphics | Seven posters have image textures or generated registry-based graphics |
| Runtime loss | Real WEBGL_lose_context exposes list; subsequent preference changes cannot reopen failed space |
| Production build | PASS, dist/client + dist/server |
| Prompt gallery generation | PASS, generated archive current |

Browser tests: `scripts/spatial-browser-qa.js`, served only by `scripts/preview-spatial.mjs`. Tests restore saved preferences/layer values. Scene state, direct URLs, interrupted selection, reverse, Enter/Escape/Home, reduced motion, empty-search recovery, panel opening and recovery after hiding menu layers were exercised. Snapshot-reported draw calls were 9–10 and approximately 67k triangles in the focused view; these are not FPS claims.

## Visual evidence
Aside full-page screenshots captured the initial exterior and interior. Final denoised interior was inspected from the actual Aside WebGL canvas; whole-page CDP screenshots subsequently timed out even though snapshots and input continued to work. Use `art/preview-interior.png` for the final canvas evidence. The live demo is left in Aside at http://127.0.0.1:8879/.

## Defects found and fixed
1. Frame delta clamping made travel slower on low frame rates. Use elapsed time; resume resets timing after inactive periods.
2. First diffuse bake was noisy. Add offline compositor denoising; reduce leaf geometry to stay within budget.
3. Null cover sentinel skipped generated posters. Use initialized version tracking; prevent stale image errors from tinting replacement textures.
4. Hideable shell included its own editing UI. Keep settings opener and editing dialogs outside presentation visibility/opacity bindings.
5. Failure fallback could be overridden by preferences. Normalize all requested views to list after failure.
6. Empty search in hall left an enabled destination button. Filter changes now synchronize stage controls.
7. Raycasts could select art behind walls. Include the building when resolving the nearest hit.

## Limits
No physical mobile GPU/FPS benchmark, production R2/auth retest or deployment in this change. Tripo was not configured or used. This demo provides connected spatial interaction and a first art pass; it does not claim the Instagram reel's photoreal fidelity or implementation technology. Shared content schema/auth remain unchanged. Layer-kit currently has a DOM-oriented probe tied to style.css; this app's browser harness additionally probes spatial.css and the renderer attribute bridge without modifying the shared package. External claude.ai prompt-gallery publication was not performed; local archive files are current.

## Reusable lessons
Maintain one physical coordinate system from Blender to glTF/Three. Keep the doorway corridor clear and test interruptions at multiple points. Static light baking reduces runtime work but needs denoising and UV-aware export. Editor recovery controls must never inherit the visibility of the content they edit. Generated assets and their exact prompts belong to the archive.

## Wheel / camera / typography follow-up ? 2026-10-01
- Aside desktop: **90 PASS**; 390?844 mobile: **91 PASS**; short 390?600 mobile: **91 PASS**.
- Checked opt-in/off wheel behavior, native pinch/horizontal scroll, no skipped stops from one gesture, forward/reverse order, constant-depth neighboring transitions, vertical drag, Escape release without camera movement, all 7 artworks' complete UVs and screen bounds, and no overlap with description panels.
- SUIT loaded in the browser. Existing URL, layer, empty-filter, reduced-motion, keyboard, context-loss and list-recovery checks passed.
- Node validator passed; 77,077 doorway/interruption route samples plus constant-depth routes, image ratios and ordered stop tests passed. Production build passed; final spatial-scene.js and SUIT font SHA256 match source/dist.
- Review fixes: release-only Escape handling and container-relative description placement on short screens. Fixed the QA harness to explicitly open space after a prior list-view visit and wrap diagnostic text to avoid test-created overflow.
- Static architecture shadows are cached. This is a rendering-work reduction, not a measured FPS claim.

Final Aside viewport screenshot: art/preview-wheel-focus.png (full UI, SUIT typography, uncropped dawn-store artwork and separate description). Preview remains open at http://127.0.0.1:8879/.

## Continuous drag and representative artwork — continuation, 2026-10-01

- bkit: resumed approved Plan/Design → completed Do → Check → Report. Seven existing real-page captures were visually inspected, converted without cropping and connected through projects.js. The actual seven project pages were revisited in Aside; capture source URLs and scenes are recorded in the prompt archive.
- Aside desktop **103 PASS**, 390×844 iframe **104 PASS**, 390×600 iframe **104 PASS**. Includes held-pointer rendered camera changes, reversal, secondary-pointer isolation, release without project change, pointer cancellation, wheel behavior, both bounded orbit directions, uncropped images/copy clearance, reduced motion, keyboard, empty filters and WebGL context loss.
- Additional real mouse check: at the spire exhibit, camera x changed **4.300 → 3.803** while the mouse was held, then **4.565** when dragging back. Release removed the dragging state and kept spire selected. This supplements synthetic pointer-event assertions with actual pointer capture.
- Layer lint: **0 errors**, 7 layers / **40 parameters**. Concrete binding probes: **40/40** at all three tested layouts. Route checks: **77,077 samples** including interruption/reversal; GLB integrity/budget passed.
- `pnpm --filter jooho-lab check` and production build passed. Root `pnpm check` initially found missing tsx dependencies; `pnpm install --frozen-lockfile` restored them without changing the lockfile, and the full check passed. Environment: Node 22.16.0, pnpm 9.13.2; the repository requests Node >=24, so this does not establish Node 24 verification.
- Prompt/reference galleries rebuilt. New screenshot entries explicitly say “생성 에셋 아님”. The existing claude.ai archive was reachable, but its inspected controls provided no file replacement/publish action and no matching artifact update tool was available. Prepared upload directories: `.bkit/runtime/prompt-gallery-site` and `.bkit/runtime/reference-gallery-site`. Remote galleries remain unchanged.
- Latest full-viewport screenshot attempt timed out in Aside CDP; browser input and DOM checks still worked. Earlier `preview-wheel-focus.png` predates these representative screenshots. No physical phone/FPS measurement or production hub deployment was performed.
- The actual rendered WebGL canvas was captured and visually inspected as `art/preview-drag-screenshots.png`; it shows the new project screenshots in the pavilion and excludes the HTML interface. Registry, camera runtime, manifest and all seven WebP files match the production build byte for byte.

Reusable: validate camera movement before pointerup, because a release-only gesture can pass endpoint tests while failing the intended interaction. Record real screenshots separately from generated artwork and preserve local-only source URLs as provenance, never as public project destinations.

## Slower focused approach — 2026-10-01

User requested a slower approach, larger selected artwork, then sideways movement at that magnification. Changed viewing depth from 3.5m to 2.4m, approach from 2.2s to 4.2s, lateral slide from 1.15s to 1.8s. Direct exterior-to-artwork travel includes the additional approach time (7.6s default). Shared framing now fits actual loaded artwork dimensions rather than the tall backboard, preventing zoom changes when switching selection. No new assets or other visual treatments.

bkit Plan/Design amendment → Do → Check → Report. Aside desktop **108 PASS**, mobile 390×844 **109 PASS**, short mobile 390×600 **109 PASS**. New assertions verify slow approach, closer depth, larger projected width, and equal magnification after sliding; existing full-image/copy clearance, drag, cancellation, keyboard, reduced motion and fallback checks passed. Layer lint 0 errors, **42/42** bindings on each layout, **77,077** doorway/interrupt/reverse samples and constant focused framing on lateral routes passed. App validation and production build passed. Physical device/FPS limits remain as recorded above.

Reusable: fitting a landscape image against its portrait mounting board leaves unnecessary empty space. Fit the actual image dimensions and share the same bounds across the gallery to keep lateral movement at a constant scale.

Final Aside visual check: selected spire directly from the exterior with full motion, observed travel then project state at camera `4.300,2.300,-4.185`. Captured and inspected `art/preview-focused-approach.png` (WebGL canvas only). The full artwork remains visible at the larger shared scale. Preview left open at `http://127.0.0.1:8879/`.
