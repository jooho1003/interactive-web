# Spatial LAB — Plan · 2026-10-01

## Architectural realism pass — 2026-10-02

User authorized refining the existing Blender building toward a cinematic, realistic look. Assumption: retain the limestone/oak/bronze pavilion, seven exhibits and current interactive routes. Extend the approved Blender/Three architecture; no engine migration is needed. bkit Plan → Design → Do → Check → result record, proportional to this visual refinement.

1. Add physical stone joints, roof coping/recess, glazing/frame depth and finer foliage; verify unchanged entry corridor and exhibit positions.
2. Bake material color/lighting, tangent normals and roughness; restore PBR highlights in the browser and inspect exterior plus interior at the same camera poses.
3. Verify real input/return, desktop/mobile artwork framing, reduced motion, list fallback, app check/build and archive provenance.

References: docs/00, 04, 10, 11, existing README/QA and full spatial Plan/Design. Re-read everest (`scroll-journey-3d`, guided/manual camera separation and viewport budget) and bruno-simon (`drive-to-explore`, reset/direct DOM list). Retain their existing stage/controls contracts; exclude flight, vehicle physics and copied imagery. These references guide interaction, not proof of photoreal materials. No matching architectural material-quality card: 해당 없음.

Layer contract: extend `stage` with ambient, sunlight, reflections, surfaceTint, surfaceRelief, surfaceRoughness, glassOpacity and waterRoughness, plus configurable presentation shade on landscape. Bind every parameter into the renderer/CSS and check all parameters, including renderer values rather than attributes alone. Physical joints, UV density, source material patterns, glazing thickness and light positions remain fixed art-direction/build coordinates, with reasons in manifest; no new content data. Preserve settings recovery and shared brightness multiplier. Acceptance: visibly finer facade/roof and surface response in real browser captures, GLB below the existing 6MB budget, lint zero errors, parameter probe and existing route/UI regressions passing. Do not claim offline path-traced video quality or physical-device performance.

Result: GLB 3,764,564B; lint zero errors, 7 layers / 51 parameters; all concrete bindings and eight renderer surface/light bindings verified. Aside desktop 126/126, 390×844 and 390×600 127/127; 77,077 pure route samples, app validation/build and workspace check passed. Same-pose external comparison and real mouse drag/entry/return recorded in QA; remaining photorealism/device/publication limits are explicit there.

## Tripo Studio Smart Mesh quality pass — 2026-10-02

User correction: building first, not furniture. Supersedes the chair/sculpture candidate scope below. Use the remaining verified zero-credit P2.0 trial for one complete single-storey JOOHO LAB pavilion: warm limestone shell, timber soffit, bronze framing, open central entry, hollow hall and seven blank exhibit bays. A whole-building result is a quality candidate, not proof of a navigable interior; inspect exterior and openings with actual browser rotation. docs/04 warns that whole-scene generation can fail, so record any sealed/opening/geometry defects explicitly. Existing export gate remains a known integration limitation. No new runtime layer is implemented unless normal export and geometry checks pass. References and layer recovery contracts below remain applicable. Resume bkit Plan/Design → generation → visual/export Check → result record.

Building generation succeeded at zero credits. To improve the grey candidate under the user's free-credit quality request, clicked Studio's visible Texture 20 action; it starts immediately and consumed 20 of the existing free 200 Studio credits. No cash charge, subscription or API credit was used. Record this separately from the free Smart Mesh trial cost.

User explicitly requested browser-operated free Smart Mesh generation. Aside verified Studio P2.0 trial ×2 and a zero-credit generation button. Resume bkit Plan/Design/Do/Check proportionally; use these trials, inspect results and attempt the normal GLB export before any integration. No paid subscription or API top-up is authorized.

References read: docs/00, docs/04 (separate object generation and web optimization), docs/10, docs/11, existing app README/QA/Plan/Design; `drive-to-explore` and `scroll-journey-3d`, cards bruno-simon and everest. Reuse protected routes, direct-list recovery and guided/manual camera separation; do not introduce driving physics, autoplay or free flight. These existing controls keep their stage/controls/rail parameters. No third-party visual asset is copied.

First candidate: one smoked-oak/ivory-linen lounge chair, replacing coarse furniture only if the generated asset is visibly better and normally exportable. Second trial may produce a complementary sculpture after inspecting the first result. Keep raw assets/provenance in art and exact prompts in prompts/jooho-lab.md. Optimize a usable prop to ≤2MB before serving it locally.

Layer contract: if integration succeeds, declare each new prop's visibility/opacity, position, rotation, scale and tint in layers.manifest.js and connect them to the existing scene/viewport settings. Physical entrance and artwork clearances remain fixed structural constraints. Check lint, every new binding, input→camera→feedback→return, mobile and reduced motion using Aside, then app check/build. If normal export is subscription-gated, record the generated candidate and the exact restriction; do not claim integration or bypass export access.

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

### 2026-10-02 · 촬영 재질 추가 정교화
같은 3D를 유지하며 공유 CC0 원본 16개, HDRI, 6개 재질별 Detail UV1/그림자 UV0를 적용했다. 단일 아틀라스의 근접 흐림과 JPEG 원본 8.4MB 문제를 발견해 수정했다. 최종 GLB 5,299,628B. stage에 groundTint/occlusion을 더해 7층 53파라미터, lint 통과. 촬영 원본·웹 인코딩·Blender 원본·제작 기록을 보관한다. 상세 계획/설계는 루트 `docs/01-plan/features/blender-realism-2026-10-02.plan.md`, 결과는 QA-spatial과 프롬프트 카드 17.
