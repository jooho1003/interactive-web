# Spatial LAB — Plan · 2026-10-01

## Executive Summary
| Perspective | Decision |
|---|---|
| Problem | Cover crossfades do not reproduce travel through connected architecture. |
| Solution | Blender-authored pavilion, Three.js perspective camera, fixed routes and HTML navigation. |
| Function/UX Effect | Enter the building, select an exhibit, return to the hall/exterior. |
| Core Value | Work is discoverable through a coherent place with direct links always available. |

## Context Anchor
| WHY | WHO | RISK | SUCCESS | SCOPE |
|---|---|---|---|---|
| Continuous spatial movement | Portfolio visitors | Visual quality / mobile GPU / crossing walls | Real geometry, reversible routes, working project links | One pavilion, all existing projects as exhibits |

## 1. Overview / references
User approved the proposed Blender + Three.js hybrid on 2026-10-01. This approval covers Plan, Design and Do; no repeat approval is required.
Read docs/00, docs/10, docs/04 and docs/11 §9-4; preserve content/editor data and separate visual controls. Reference: user's Instagram Ddb6_ISh8pA, observed in Aside (implementation technology unverified). Adopt continuous exterior/interior travel and fixed UI; do not copy brand, imagery or text. Reference catalog patterns have no exact fixed-route architectural match; drive-to-explore informs reset and direct-list access only, not driving physics.

## 2. Scope
Blender source and GLB, fal-generated distant landscape, seven project exhibits, exterior/hall/focus camera states, reduced motion, low-cost mobile rendering, editable scene/UI layers. No Tripo account setup, paid subscription or production deployment.

## 3. Requirements
FR1 actual 3D geometry and doorway; FR2 cancellable/reversible movement; FR3 thumbnail and keyboard selection; FR4 existing direct project URLs and content editor; FR5 explicit loading/error/list fallback; FR6 settings by scene and viewport.

## 4. Success Criteria
Build/validate pass; Aside screenshots exterior/interior; test interrupted travel, return, empty search, keyboard, reduced motion, mobile viewport, WebGL/load failure. Performance measurements are local, not claims about physical mobile devices.

## 5. Risks
GLB does not preserve Cycles lighting: browser lighting authored separately. API failure: keep procedural sky and document failure. No whole-building image-to-3D generation. Keep entry/exit inside the doorway corridor; slide between exhibits along the clear gallery wall.

## 6. Impact / consumers
Scene API consumed by app.js; index/spatial.css provide UI. Content schema, server authentication and project registry preserved. New camera controls replace the old delayed link navigation; project links open directly.

## 7. Architecture / layer contract
Use existing ES modules and vendored Three r180. Add GLTFLoader matching r180. Layer kit consumed through a vendored copy, no edits to the shared package. New stage, atmosphere, copy, navigation and exhibit layers have visibility/opacity and relevant layout/color/motion parameters. Shared content lighting/cameraSpeed remain authoritative multipliers; no R2 schema migration. Fixed physical geometry, collision clearances and accessible hit areas are documented in manifest. Lint + DOM probe + renderer assertions cover bindings.

## Follow-up acceptance (user request, 2026-10-01)
1. Movement toggle controls wheel and vertical drag; sequential forward/reverse, native scrolling off, Escape and endpoint release.
2. Lateral project changes preserve depth, round entrance turns, smooth pointer response.
3. Original image aspect/UV preserved; all artwork corners visible without description overlap on desktop, mobile and short mobile.
4. SUIT across hub and project pages; local font/license, existing content settings and URLs preserved.
5. Verify pure routes, Aside input/layout/font checks and production build.

## User correction acceptance
- Default wheel keeps cinematic camera movement; drag mode provides continuous orbit while held and native wheel scrolling.
- Verify rendered camera changes before pointerup, both directions, release/cancel, unchanged selected artwork and full framing.
- Visit all seven actual project pages; replace generic covers and text-only placeholders with representative screenshots, preserving provenance.
- Existing scene/layer/content/URL contracts remain; new camera input settings are exposed and probed.

## Continuation — references and layer contract
Read docs/00, docs/04, docs/10, docs/11, the app README/QA, and reference cards. Reuse the existing camera, content editor and screenshot captures. Apply reversible input → camera state → visible feedback, complete artwork fitting, and direct project access.

| Reference | Adopt | Exclude | Layer parameters |
|---|---|---|---|
| everest | Distinct guided tour and manual camera modes; visible project shortcuts | Autoplay, free flight, a huge scroll container | stage.dragStrength, stage.dragLimit, stage.damping; existing stage.speed |
| bruno-simon | Reset and accessible direct-list alternatives to spatial exploration | Driving physics, networking, canvas-only navigation | Existing controls visibility/opacity and rail size/gap |

Archify was read but not applied: graph relationships and route editing do not match this gallery. Screenshots are project content, not new visual layers. Bind seven work-*.webp files through projects.js so the scene, list, rail and project pages share them. Keep original captures and provenance in prompts/jooho-lab.md. Fixed physical camera clearance, bounded orbit and framing allowance are documented in layers.manifest.js. Check 7 layers / 40 parameters with lint and browser bindings; verify held drag, release/cancel, both orbit limits, 390×844 and 390×600 framing, and build.

Result: lint 0 errors; concrete bindings 40/40 on desktop and both mobile layouts. Browser assertions 103/104/104 passed, real mouse held/reversed/released verified, app build and root check passed. Capture provenance and reference usage recorded. Remote archive republication remains unavailable; prepared same-address upload packages and limits are recorded in QA.

## Focused approach refinement — user request
Move slowly toward the selected artwork, then retain that close viewing depth while moving sideways. Reuse the existing everest/bruno-simon reference decisions, route and contain-image principles (docs/00, 04, 10, 11 and existing QA); no new pattern or asset is needed. Change only the viewing aisle and framing, and expose approachSeconds (4.2s) / slideSeconds (1.8s) on stage. The 2.4m viewing aisle is a physical route anchor; shared content speed remains its multiplier. Frame all loaded artwork using one common bound to avoid zoom changes between works. Verify approach duration, larger projected artwork, constant lateral depth and size, reversal, full-image/copy clearance and all 42 layer bindings on desktop/mobile.
