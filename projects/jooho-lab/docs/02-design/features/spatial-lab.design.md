# Spatial LAB — Design · 2026-10-01

## Architectural realism refinement — 2026-10-02

Reuse the selected Blender GLB + vanilla Three architecture. Add beveled limestone cladding with recessed joints, layered roof coping/shadow reveal, deeper bronze glazing details, glass outside the central opening and lance-shaped olive leaves. Keep the route coordinates, clear entrance and all seven mounting planes unchanged. Refine procedural stone/wood/linen using physically scaled color, bump and roughness; bake diffuse lighting/color (3072 square), tangent normal and roughness (2048 square) into shared UVs. Export a standard PBR architectural material with a small baked-light emission contribution to retain indirect illumination, rather than emission-only surfaces. Glass uses inexpensive environment reflection without screen-space transmission or an extra scene render. Static sun shadows stay cached; no continuous animation/postprocessing pipeline.

Expose stage ambient/sunlight/reflections/surfaceTint/surfaceRelief/surfaceRoughness/glassOpacity/waterRoughness through the existing attribute bridge, including scene/mobile overrides and shared exposure multiplier. Landscape shade controls the existing CSS presentation gradient. Record fixed art-direction/build constraints in manifest. Inspect exposes actual light/material values for meaningful binding checks. Same-pose before/after captures plus desktop/mobile input and all-parameter verification are required. Generated source, exact natural-language brief, map sizes, transfer size and observed limitations belong in prompts/jooho-lab.md and QA-spatial.md.

Visual-check refinement: the pool benefits from reflecting the actual pavilion instead of generic environment highlights. Vendor Three r180 Reflector (MIT, same runtime version); use a bounded 512px plane pass outside only, no multisampling, slight roughness blur and stage.reflections intensity. Disable this extra pass on narrow screens (≤650px), where water retains PBR environment highlights. Hide the opaque water material during the mirrored render to avoid its underside obscuring the reflection. Dispose its render target with the gallery. Add seeded 512px gravel tiling on the existing courtyard; no external artwork or paid generation. These surface dimensions, tiling density and resolution budgets are fixed build/performance constraints.

## Studio Smart Mesh continuation — 2026-10-02

User correction supersedes the furniture-first implementation: generate the building first with the remaining free trial. Prompt for a complete isolated rectangular pavilion (18m wide / 16m deep / 5m high), real wall thickness, open central doorway and empty hollow interior. Preserve limestone/timber/bronze art direction and blank exhibit bays. Inspect all visible sides and doorway rather than inferring internal topology from a front render. The candidate remains in Studio if normal export is gated; replacing the physical pavilion requires actual exported geometry plus route validation, layer contract updates and app/browser checks.

User chose browser generation with the free P2.0 trial. Generate isolated props through the visible Studio controls, then inspect the actual model and normal export dialog. The trial provides two zero-credit generations; export entitlement must be verified independently. Selected minimal architecture: keep the pavilion and existing Three runtime, load a locally exported GLB as a separate prop only if normal export succeeds. A whole-building replacement or scene-framework rewrite would risk the already verified routes and artwork framing without helping this object quality pass.

Candidate 1 is a single oak/linen armchair. Candidate 2 can be a complementary bronze sculpture if the first result warrants continuing. Raw exported GLB and preview belong to art/tripo; web-optimized GLB belongs to public/assets. No runtime generation/API key. Each integrated prop uses manifest parameters for visibility/opacity, x/y/z, yaw, scale and tint through the renderer attribute bridge; preserve scene/mobile overrides and recovery controls. Fixed model normalization and camera corridor constraints must be documented. Existing layer probe and spatial browser harness cover integration, mobile, reduced motion and return navigation. Without export, only candidate/provenance records are delivered and implementation remains unverified.

## Context Anchor
Continuous architectural exploration for portfolio visitors. One real connected pavilion, existing project data, direct links, reduced motion and list fallback. See Plan for acceptance criteria.

## 1. Overview
Warm limestone pavilion, bronze framing, timber ceiling, blue-hour landscape, gallery wall and lounge. Restrained cream HTML typography above the WebGL canvas. No auto-play camera on arrival.

## 2. Architecture options
Image transforms (cheap, insufficient spatial depth); full scene/framework rewrite (unnecessary integration risk); selected: Blender GLB + existing vanilla Three runtime and existing app/editor.
Data: projects.js/content -> app -> scene selection -> camera route -> scene state -> HTML controls.

## 3. Data model
Stable project IDs map to gallery bays. Exterior -> doorway -> hall -> exhibit. Selecting another exhibit slides directly along the gallery wall at a constant depth; reverse uses the same doorway corridor. New selection replaces the pending destination without resetting the current camera pose. GLB and .blend generated reproducibly by scripts/build-spatial-lab.py.

## 4. API
No new public API. fal used only at build time; FAL_KEY never sent to the browser. Existing owner/content API unchanged.

## 5. UI / layer contract
HTML intro is visible outside, selected project details at an exhibit, travel status always available. Bottom film rail selects destinations, direct work link opens immediately. Enter enters hall/focuses selected work; Escape returns hall/exterior; Home exterior. Layers declared in layers.manifest.js; local overrides via layer kit, scene and responsive scopes, export/reset. Legacy shared content remains authoritative.

## 6. Error handling / security
Model or WebGL failure exposes list and status. Context loss falls back. API keys remain environment-only. Text uses textContent. Filters never leave a hidden selected object as a destination. No automatic external navigation after a camera tween.

## 7. Performance
Static opaque meshes merged by material in Blender; single shadow-casting sun, no real-time path tracing. DPR cap, no render while hidden/offscreen; landscape and scene are local files. Mobile effects lower by viewport. Texture loads refresh when content is edited and old textures disposed.

## 8. Verification
Route math deterministic tests (door crossing, replacement, reverse). Browser input/state/visual checks. Layer lint and scope roundtrips, DOM probe for CSS and renderer assertions for camera/lighting. Existing validator/build as regression gates.

## 9. Implementation guide
Generate assets -> scene runtime -> app controls and style -> layer panel -> Aside verification and refinement -> QA report. Preserve uncommitted existing edits and all registry/content data.

## Follow-up: wheel, camera, artwork and type
- Opt-in movement control: wheel down/up or vertical drag advances/reverses exterior ? hall ? visible works. Off restores native page scrolling. Ignore modal/forms, pinch zoom and horizontal film-rail gestures; release at endpoints and via Escape.
- Rounded doorway corners retain corridor clearance. Neighboring artwork routes remain lateral, with damped pointer motion outside focused work.
- Full original artwork UVs and contain-scaled planes. Camera framing reserves the description area; compact screens place copy below the artwork. No camera parallax while inspecting art.
- Locally hosted SUIT Variable for Korean/Latin interface and generated poster lettering (OFL license included).
- Verify actual wheel input in both modes, reverse/interrupt behavior, lateral depth, projected artwork bounds, mobile layout, font loading, existing layer controls and fallback.

## Correction: continuous camera response and real screenshots
Supersedes the previous opt-in wheel/step-on-drag behavior. Default wheel runs the ordered tour. The drag-mode toggle switches wheel back to native page scrolling and enables continuous pointer-captured orbit (yaw/pitch) during pointermove, with damped follow-through on release. Focused exhibits retain pointer parallax; bounded orbit and framing allowance keep full images visible. No detour to the hall between works.
Stage exposes dragStrength, dragLimit and damping in the existing layer settings. Click/keyboard paths and reduced-motion preferences remain valid. Representative artwork comes from actual rendered live or local project pages, chosen after visiting their real UI; record source URL, selected scene and capture date. Do not substitute marketing artwork or invent product screenshots.
Read docs/00, docs/10 and the scroll-journey-3d pattern (everest card): adopt separate guided/free camera modes, preserve visible project shortcuts; do not introduce a huge scroll container, autoplay or free-flight navigation. Screenshot sources are project evidence, not copied third-party design references.

## Focused artwork approach
The viewing aisle is 2.4m from the artwork wall (previously 3.5m). A hall-to-artwork approach takes stage.approachSeconds (default 4.2s), while lateral travel takes stage.slideSeconds (1.8s). Fit the common maximum actual artwork dimensions, including contain scale, rather than the tall backboard. Recalculate this shared frame when textures load or viewport changes; never recompute a different zoom just because selection changes. Keep the existing 24% orbit allowance and description exclusion area.

Selecting an artwork directly from outside also receives the extra approach time (7.6s total by default), so the longer physical path does not rush its final approach. Hall-only entrance and return routes retain their existing timing.

### 2026-10-02 · PBR 사진 해상도와 그림자 분리
건물 전체 3072²에 사진까지 굽는 방식은 근접에서 흐리다. 기하의 월드 미터 좌표를 면별 UV1로 펴서 1K 촬영 지도(색·거칠기·탄젠트 노멀)를 반복하고 UV0에 2048² AO 및 작은 간접광 기여를 둔다. 6개 architectural material, 기준 tint는 표준 glTF baseColorFactor로 명시한다. runtime은 tint 배율/노멀 강도/거칠기/AO 강도를 6개 모두에 적용한다. HDRLoader는 Three r180 공식/MIT, 1K environment를 PMREM으로 변환한다. 512² 마당 3맵은 291KB. 첫 내부 이동 중 GPU 프로그램/버퍼 준비를 피하려고 loading 상태에서 내부를 미리 render하고 외관으로 복원한다. 표면 요철 기본 .2, 접촉 그림자 .35는 설정에서 바꿀 수 있다. 씬·모바일별 설정과 기존 안전 동선은 유지한다.

### 후속 · 얼룩 제거
사용자가 새 촬영 석재의 얼룩을 지적했다. 벽·바닥을 시드 42의 균일한 512² 미세 입자 지도로 교체하고, 노멀/거칠기/색과 실제 석재 이음새는 유지한다. 옛 색 베이크의 얼룩이 발광으로 돌아오지 않게 석재 emission을 제거한다. 16샘플 AO 자체의 잔얼룩도 발견하여 접촉 거리 0.8m·64샘플·오프라인 denoise로 정리한다. 기존 6재질/UV0·1/53파라미터 계약을 그대로 재사용하며 런타임 후처리는 추가하지 않는다.

### 후속 · 밝은 배경과 실내 마감
CSS 풍경 밝기를 landscape.brightness로 바인딩하고 shade를 .4로 낮춘다. 마당은 밝은 회베이지, 외관의 헤더는 shell.ink로 대비를 확보하고 실내에서는 밝은 controls.color를 쓴다. 기존 동선과 전시 위치는 유지한다. Blender의 전시 종이 마운트/가는 금속 테두리, 직물 짜임/느슨한 쿠션, 책상 키캡/노트/서랍/실제 림이 있는 컵, smooth 96×24 조형물로 근접 디테일을 높인다.
실제 7개 fixture의 빛을 Blender에서 2048²·32샘플로 새 UV0에 베이크하고 denoise한다. 웹에서는 기존 두 fill과 조명 지도 uniform을 interiorLight/galleryLight/interiorTint로 제어한다. 추가 실시간 광원/그림자 패스 없음. 지도 좌표가 바뀐 옛 GI를 재사용하지 않는다. `build-spatial-lab.py`와 `export-photo-surfaces.py`가 같은 조명/AO 내보내기를 쓴다. 7층 57파라미터·GLB 6MB·기존 그림자 패스/경로 예산 검수.
검수 중 실시간 spot 7개 버전은 desktop 첫 이동 12.273초로 비용이 커서 탈락했다. 정적 조명 베이크로 바꾸고 이동 완료 프레임에서 finish와 frame이 중복 render하던 부분을 한 번으로 줄인다. 같은 8.5초 기준으로 재검사하며 기준을 낮추지 않는다.
