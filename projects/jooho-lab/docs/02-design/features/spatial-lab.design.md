# Spatial LAB — Design · 2026-10-01

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
