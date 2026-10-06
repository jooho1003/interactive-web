# Spatial LAB QA — 2026-10-01

## Blender architectural realism refinement — 2026-10-02

User asked for a more cinematic, realistic building and authorized refining it. Used bkit Plan/Design amendments → Do → browser/static Check → visual correction → result/provenance records. Read docs/00, 04, 10, 11, existing app README/QA and full Plan/Design; re-read everest/bruno-simon cards for interaction continuity and recovery. No copied reference visuals, paid generation, engine migration or production publication.

Implemented beveled limestone cladding with narrow recessed joints, roof metal coping and shadow reveal, deeper bronze facade profiles, side glazing outside the open entry, finer floor joints and lance-shaped foliage. Existing building footprint, safe camera routes and all seven exhibit positions are unchanged. Procedural stone/wood/linen now bake diffuse color/lighting at 3072px and tangent normals/roughness at 2048px (Cycles CPU 32 samples). GLB uses PBR with a small baked emission contribution instead of emission-only architecture. Actual GLB is 3,764,564 bytes (previous 3,194,504), below existing 6MB budget.

Desktop pool reflects actual architecture using matching Three r180 Reflector, 512px / no MSAA / roughness blur. Initial visual check found the water volume obscured the mirrored scene; hiding its material during the reflected pass fixed the output, confirmed in `art/realism-after-exterior.png`. ≤650px skips this extra pass and retains environment-lit water. Gravel uses deterministic Canvas tiling (seed 42); no new external image. Added stage ambient/sunlight/reflections/surfaceTint/surfaceRelief/surfaceRoughness/glassOpacity/waterRoughness and landscape shade. Fixed physical dimensions, source patterns, light placement and resolution budgets are documented in manifest. Renderer observation avoids resizing on unchanged attributes. Frame counters include both reflection and main render: initial desktop exterior 34 calls / 114,674 triangles; mobile exterior 15 calls / 57,344 triangles; focused gallery 11 calls / 57,268 triangles. These are structural rendering counts, not physical-device FPS claims.

Verification:
- `pnpm check` passed for the workspace; app validation and production build passed. GLB tests confirm normal/roughness/color maps, transparent glass, runtime-compatible reflector and transfer budget. Layer lint: 7 layers / 51 parameters, zero errors. Existing 77,077 route samples (entry, interrupted selection, reverse) passed.
- Aside desktop: **126/126** browser assertions; 390×844 and 390×600 iframe layouts: **127/127** each. All 51 concrete layer bindings tested; eight new stage controls also checked against actual renderer light/material values. Full-image framing, copy clearance, wheel/drag/cancel, close/lateral approach, keyboard, reduced motion, empty results, direct links, layer recovery and forced context-loss list fallback passed.
- Evidence: `art/realism-desktop-qa.json`, `art/realism-mobile-qa.json`, `art/realism-short-mobile-qa.json`; same-pose before/after exterior captures. Exact request/reproduction and asset maps: [prompt archive](../../prompts/jooho-lab.md#16--lab-pavilion-realism--건물-구조재질-정교화).
- Actual Aside mouse check: held drag changed exterior camera from `12.000,5.400,24.000` to `15.357,3.866,21.620` before pointerup; release/toggle restored guided mode. Clicked reduced motion and entry, reached hall `0.000,1.850,3.000`; inspected `art/realism-after-interior.png`. Returned to exterior and restored prior motion preference for the final preview.
- Two early desktop runs timed out on entry in the Aside environment; the entry eventually reached the hall. A mobile run was stopped during slow per-parameter RAF probing. None were counted as passes. Kept existing movement-time assertions; held browser execution during final runs and used timer/microtask observation for synchronous parameter bindings instead of one throttled RAF per field. Final full reruns passed. Mobile navigation readiness timed out despite the embedded harness continuing; its actual final report was subsequently read and saved.

Limits: procedural materials and approximate baked indirect light remain; this is a refined real-time web building, not a path-traced cinematic render or measured photorealism. Glass uses environment reflection rather than true transmission, desktop water adds one bounded render pass, mobile deliberately reduces that effect. Real mobile hardware/GPU FPS, live hosting/R2/auth and remote prompt-gallery publication were not tested. Settings save-failure handling is unchanged and was not re-injected in this visual pass.

Reusable: exporting a diffuse bake as emission alone removes view-dependent material relief/highlights. Preserve tangent normals and roughness alongside the bake, inspect the actual browser output, count offscreen reflection work in performance budgets, and exclude an opaque water volume from the mirrored camera. Keep physical doorway changes separate from cosmetic surface refinement.

## Building-first correction — 2026-10-02

User corrected scope to building before furniture. bkit Plan/Design amended, then used remaining zero-credit P2.0 trial for one complete pavilion. Studio workspace: https://studio.tripo3d.ai/ko/workspace/generate/24252813-eff2-4d98-b581-b7bf4c63f29b . Object `fafaa7fa_f11f_4f15_8e4d_a800525d1dad`; Quad faces 4,095 / vertices 3,596. Free Smart Mesh trials are now exhausted. Mesh generation preserved the 200-credit balance. Actual front/side mouse inspection shows a flat roof, walls, foundation and open front hall; seven exhibit panels and exact entry/camera clearances are not verified. An unintended platform/furniture-like shape appears inside. Evidence: art/tripo/lab-pavilion-front.png, art/tripo/lab-pavilion-angle.webp. Requested dimensions are prompt targets, not measured output dimensions.

Clicked visible Texture 20 to improve materials under the original free-credit quality request. It starts generation immediately without an options dialog or separate prompt; existing free Studio balance became 180. No monetary payment or API usage. Texture completed: cream walls/dark side wall and frames, with little visible timber-soffit detail. Front view shows three rear panels rather than seven, and unwanted interior geometry/irregular edges remain. The textured candidate is not accepted as a quality improvement over the authored pavilion. Evidence: art/tripo/lab-pavilion-preview.webp and lab-pavilion-textured-front.webp.

Normal GLB export with `4k Current` texture opened a Pro/Max subscription gate. No file downloaded, no app building replaced and no runtime layers changed; therefore physical dimensions, route clearance and layer/app regression tests are unverified for this candidate. Export evidence: art/tripo/lab-pavilion-export-gate.png. Exact prompt/result is archived in prompts/jooho-lab.md, card 15; local gallery generation/currentness checked. bkit Plan/Design → Do (mesh/texture generation) → Check (real mouse views/export) → result/limits record; requested integrated quality improvement is still incomplete.

Reusable: whole-building text-to-mesh can create a visible open shell, but exact exhibit count, clean architecture and camera-safe interior are not guaranteed. Do not equate a textured Studio preview with verified exportable architecture.

## Tripo Studio free Smart Mesh — 2026-10-02

User explicitly requested the free Smart Mesh browser workflow. bkit Plan/Design amendments → Do (Studio generation) → Check (actual model rotation/export) → recorded limitation. Aside verified P2.0 trial ×2 and zero-credit generation, then generated one lounge chair. Workspace: https://studio.tripo3d.ai/ko/workspace/generate/bcb900f9-2dea-4906-9110-a0f220fe9c23 . Quad faces 6,374 / vertices 5,567; credits stayed 200 and one trial remains. Real mouse rotation verified three-dimensional armrests, cushions and frame. The cushion looks faceted and this is an untextured mesh, so the requested PBR prompt did not establish a finished material result.

GLB was selected in the normal export dialog. Two export attempts both opened Pro/Max subscription prompts; no file downloaded. Evidence: art/tripo/lounge-chair-preview.webp and art/tripo/lounge-chair-export-gate.png. Exact prompt and result: ../../prompts/jooho-lab.md, card 14. No subscription/top-up, texture charge, second trial, app runtime changes or deployment. Asset optimization and app integration remain blocked by export entitlement. No new layers were implemented, so no new layer lint/probe or app/browser regression pass is claimed. Prompt archive build/currentness is checked separately.

Reusable: free P2.0 generation and normal GLB export are separate entitlements. Check normal export before spending a second trial or adding texture to a candidate. A text prompt requesting PBR does not itself enable texture generation.

## Tripo credit preflight — 2026-10-02

User requested a Tripo quality pass using 14-day free credits. bkit Plan preflight: read docs/00, docs/04, docs/10, docs/11, existing spatial Plan/Design, README/QA and reference pattern records; inspected the signed-in account with Aside. No generation or implementation has started.

- Official legacy API pricing still advertises 300 free credits for two weeks: https://docs.tripo3d.ai/get-started/pricing.html . This verifies the offer wording, not this account's grant or expiry.
- Signed-in developer billing shows available 0 / frozen 0. The repository's existing API key independently returned HTTP 200, code 0, balance 0 / frozen 0 from `GET https://openapi.tripo3d.ai/v3/account/balance`. No key was exposed.
- Studio is Free with 200 credits. Its billing is separate from API billing; these credits cannot fund API generation. The inspected Free plan limits exports to H2.5 and labels models noncommercial. No high-quality export entitlement was verified.
- API checkout offers a custom whole-dollar amount, minimum $1; pricing shows 100 credits = $1. No payment, subscription, automatic recharge or account change was made.
- Credit grant/expiry reason remains unverified. Need available API credits or a usable trial grant before generating and integrating assets. No visual-quality improvement, layer lint/probe or browser regression result is claimed for this request.

Reusable: verify the intended API key's actual balance before generating; Studio balance and a documented trial offer do not establish usable API credits.

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

## 2026-10-02 · 촬영 PBR/HDRI 추가 정교화

- 공유 CC0 촬영 소스 16파일 MD5/URL/license 확인. 1K HDRI를 실제 renderer에 PMREM으로 적용, 실패 시 기존 목록 복귀 계약 유지.
- 건물 6재질은 1K Detail UV1을 미터 단위 반복, AO/작은 간접광 기여는 UV0. GLB standard baseColorFactor를 명시해서 Blender MixRGB의 tint 누락을 해결했다. 단일 atlas의 가까운 흐림과 8.4MB 원본 JPEG 후보를 탈락시킨 뒤 해상도 유지 인코딩으로 최종 **5,299,628B < 6MB**.
- stage groundTint/occlusion 추가. **7층 53파라미터 lint 오류 0**, 실제 파라미터 probe 및 renderer 값 검사 통과. 기본 요철 .2, 접촉 그림자 .35. 동일 시선·안전 동선·7작품·목록 유지.
- Aside CDP Runtime.evaluate/callFunctionOn/Page.enable 연결 오류 반복 → 사용자에게 알린 후 Playwright headless 전환. 브라우저에선 HDRI/사진 자갈/6사진 재질/AO 실제 지도 로딩을 확인했다. 첫 내부 이동 중 GPU 준비 지연을 발견해 loading 동안 compile/내부 buffer 준비 후 외관 복원; 기존 이동 시간 검사를 낮추지 않았다.
- **최종 desktop 133 / mobile 134 / short-mobile 134 checks PASS**, pageErrors 0. 실제 마우스 held drag → release, 작업실 입장, 외관 복귀도 별도 확인. 기록 `art/photo-*-qa.json`, 실제 캡처 `art/photo-after-exterior.png`, `art/photo-after-interior.png`(1440×900).
- desktop: 133 checks, 15 calls / 55952 triangles
- mobile: 134 checks, 14 calls / 55950 triangles
- short-mobile: 134 checks, 14 calls / 55950 triangles
- `pnpm --filter jooho-lab check`: syntax/assets/layers/77,077 route samples/UV channels/tint/GLB budget 통과. `.blend` 이미지 10개 pack. 제작 정본 `prompts/jooho-lab.md` 카드 17.
- 한계: 머티리얼/반사 기반 개선이며 실사 스캔 건물·나무·가구 및 영화 렌더가 아니다. 실제 기기 FPS와 모바일 GPU 기종별 측정은 미실행. headless 첫 GPU 준비에서 시간 검사 실패가 있었고 최종 준비 수정 후 위 3화면이 통과했다. 상용 서비스/원격 배포는 미실행. 기존 claude.ai artifact 보관함 재게시 도구는 제공되지 않아 로컬 보관함과 재게시용 패키지를 준비한다.

## 2026-10-02 · 사용자 피드백: 건물 얼룩 제거

- bkit Plan/Design 수정 → Do → Check → Act. 카드 17의 풍화 석고/돌바닥을 사용자 요청에 따라 깨끗한 석재로 교체. 시드 42의 512² 색·거칠기·노멀·높이 지도, 기존 tint/53개 설정 재사용. 목재·자갈·HDRI·줄눈·반사 유지.
- 초기 교체 후 실내 근접 화면에서 AO의 잔얼룩을 추가 발견. 옛 석재 색 베이크의 emission을 제외하고 AO를 거리 0.8m/64샘플/오프라인 denoise로 수정. `.blend`와 전체 모델/재질 갱신 스크립트를 일치시켰다. **GLB 4,357,584B < 6MB**.
- Aside 외관/실내 시각 검수 및 버튼 입장 확인. Aside 자동 이동 검사는 timeout, 이후 페이지 navigation readiness timeout도 발생하여 공지 후 headless Playwright로 전환했다.
- 최종 headless 모바일 390×844 **134 PASS**, 짧은 모바일 390×600 **134 PASS**. 두 화면의 **53/53 파라미터 probe**, 입력·이동·되돌림·키보드·빈 검색·동작 줄이기·목록 대체 통과. 기록 `art/clean-mobile-qa.json`, `art/clean-short-mobile-qa.json`.
- **데스크톱 전체 회귀는 PASS가 아님**: 1440×900에서 첫 입장은 도달했지만 이동 시간 9.740초, 다른 3D 탭을 닫고 재검사한 9.253초가 기존 8.5초 기준을 넘었다. `art/clean-desktop-first-qa.json`, `art/clean-desktop-qa.json`; pageErrors 0. 시간 기준을 완화하거나 런타임 이동 코드를 변경하지 않았다. 실제 기기 성능 검증은 미실행.
- `pnpm --filter jooho-lab check` / `build` 통과: 7층 53파라미터 lint 오류 0, 77,077 경로 샘플, 6재질·UV·tint·GLB 예산. `pnpm prompts:build` / `prompts:check` 통과, 39카드. 기존 카드 16/17 캡처는 보존하고 카드 18에 수정 방향과 제작 원문을 남겼다. 로컬 보관함/재게시 패키지만 갱신, 원격 claude.ai 보관함과 서비스 배포는 미실행.
- 재사용 조건: 깨끗한 현대 건축에서는 촬영 원본의 풍화·얼룩을 품질로 오인하지 않는다. diffuse, 예전 간접광 색 베이크, AO 노이즈를 따로 확인하고 실내 근접/외관을 모두 검수한다.
- 최종 1440×900 캡처 `art/clean-after-exterior.png` / `art/clean-after-interior.png`를 직접 검수했다. 큰 명암 얼룩과 실내 AO 잔얼룩이 사라지고 줄눈·목재·반사가 남았다. 실제 마우스 드래그→해제, 입장→외관 복귀 별도 검사 PASS. 데스크톱 전체 시간 검사 실패와는 구분한다.

## 2026-10-02 · 밝은 풍경과 실내 완성도

- bkit Plan/Design 보완 → Do → Check → Act. 승인된 깨끗한 석재를 유지하면서 풍경 밝기 1.18/음영 .4, 밝은 마당, 외관·실내에 맞는 메뉴 대비를 적용했다. 실내는 종이색 작품 마운트·가는 금속 프레임, 직물 짜임·쿠션, 키캡/노트/서랍/컵, smooth 조형물과 실제 고정 핀으로 개선했다.
- **7층 57개 파라미터**. 추가 landscape.brightness, stage.interiorLight/galleryLight/interiorTint. 실제 CSS filter·광원 값·조명 지도 uniform을 probe한다. 기존 장면/모바일 override·초기화·이동·목록·전시 좌표 유지.
- 실시간 전시 spot 7개 후보는 desktop 첫 입장 **12.273초**로 8.5초 기준 미달 → Blender 2048²·32샘플 조명 베이크/denoise와 UV0 지도 조절로 변경. AO는 별도 2048²·64샘플/.8m. 광원은 등기구의 금속 캡보다 12cm 앞에서 방출해 스스로 빛을 가리지 않게 했다. 옛 얼룩진 색 atlas는 재사용하지 않는다.
- 이동 완료 시 finish와 frame이 동일 화면을 두 번 그리는 중복을 제거. 최초 수정 검사 **8.593초**는 미통과로 보존, 다른 작업을 병행하지 않은 최종 desktop **7.710초** 통과. 시간 기준을 완화하지 않았다.
- 기존 전체 browser harness: **desktop 1440×900 141 PASS / mobile 390×844 142 PASS / short-mobile 390×600 142 PASS**, pageErrors 모두 0. 각각 **57/57 layer probe** 통과. 모바일 입장 6.004초/6.012초. 기록 `art/interior-*-qa.json`; 미통과 후보는 `interior-live-lights-desktop-qa.json`, `interior-baked-first-desktop-qa.json`로 구분.
- 실제 마우스 held drag→해제, 입장→외관 복귀 별도 PASS. Aside에서 외관/입장까지 확인했으나 실내 캡처 CDP timeout으로 공지 후 headless 검수 전환. 실제 기기별 GPU/FPS 측정은 미실행.
- 앱 check/build 통과: lint 오류 0, 77,077 경로 샘플, 6재질의 UV0 조명/AO·UV1 표면 및 7개 fixture 메타데이터 검수. 전송 한도 6MB 유지. 제작 정본은 prompts 카드 19. 이전 clean 캡처는 보존한다. 외부 서비스 배포/기존 claude.ai 보관함 재게시는 미실행, 로컬 보관함과 재게시 패키지만 갱신한다.
- 재사용: 고정 전시 조명은 물리 fixture에서 새 UV atlas에 굽고 runtime uniform으로 세기/색을 조절하면 매 프레임 추가 조명 비용을 피할 수 있다. 베이크가 존재한다는 검사만으로 충분하지 않으며 빛이 등기구에 막히는지 실제 지도와 최종 화면을 함께 확인한다.
- 최종 광원 방출점 보정/조명 기본값 20 조정 후 GLB **4,701,148B**, app check/build 및 1440×900 외관/실내 재캡처·실제 드래그/입장/복귀 통과. 전체 141/142 검사는 동일한 기하/런타임의 직전 조명 설정에서 실행했고, 마지막 지도/기본 밝기 변경은 이 시각·입력 검수로 확인했다. 카드 19/로컬 보관함 갱신.

## 2026-10-03 · 선비(hanbok-hero) 작품 연결

- 8번째 작품 `hanbok-hero`를 `include:experience`로 `public/experiences/hanbok-hero/`에 넣고 `projects.js`·`validate.mjs`에 등록했다. 전시관은 칸을 7개만 구웠으므로(`exhibitBays`) 3D 벽에는 앞 7작품만 걸고, 선비는 레일·목록·작업 소개·체험 페이지로 연다. 처음에 8개를 모두 벽에 넘기자 `exhibitX(i, 8)` 때문에 기존 7작품까지 구운 액자에서 1.075m씩 밀려 되돌렸다.
- 벽에 없는 작품을 고르면 카메라는 그대로, 정보 패널만 바뀐다(`scene.select`가 모르는 id를 무시). 작업실 안에서 Enter는 그 작품을 바로 열고, 바깥에서는 원래대로 작업실에 들어간다. 장면 필터에는 벽 작품만 넘긴다.
- `spatial-browser-qa.js`의 "작품 = 7" 단정 6곳을 "벽 = 7칸, 레일·목록 = 전체 작품 수"로 나눴다. Playwright Chromium 1440×900 **143/143 PASS**, `/__qa/mobile` 390px **144/144 PASS**, `validate` PASS(8 projects). 체험 페이지 iframe 안에서 왼쪽 끝 → 얼굴 칸 0, 오른쪽 끝 → 12 확인.
- 미확인: Aside 실제 창(가려져 있어 렌더링이 초당 2프레임), 실제 터치 기기.

## 2026-10-03 · 운영 작품의 전시 이미지

- bkit Plan → Design → Do → Check → Act. 계획/설계는 `docs/01-plan/features/exhibition-art.plan.md`, `docs/02-design/features/exhibition-art.design.md`. 운영 주소가 없는 숏폼 자동화/Market Front는 사용자 정정에 따라 **그날의 먹거리**와 **한술툰**으로 교체했다. 총 7작품을 유지한다.
- Aside에서 실제 운영 7사이트를 열어 확인했다. Day Walk는 사용자 지정 `https://interactive-web-app-three.vercel.app/experiences/day-walk/`, ChemiForge는 리다이렉트된 `https://chemiforge.com/`을 사용한다. localhost는 바뀐 LAB의 표시/동작 검수에만 사용했고 생성 참조로 쓰지 않았다. 공개 화면/원본 출처는 `art/exhibition-20261003/sources.json`.
- 별도 전시 키 비주얼 **6개 생성**, 한술툰은 **공개 1편 표지 원작 1개 재사용**. 무크롭·원본 비율 유지 WebP 7개 총 **1,354,226B**. 모든 최종 이미지와 Day Walk 데스크톱/모바일 전시 캡처를 직접 검수했다. ChemiForge 가로 원본 직접 사용 후보는 세로 액자에서 작게 보여 원본의 구성을 참조한 세로 생성본으로 교체했다. 이전 캡처/공개 다운로드/생성 원본과 실제 프롬프트는 보존한다. 정본은 prompts 카드 20.
- **7층/57파라미터 유지**, 새 레이어/고정값 없음. 이미지·제목·링크는 목록 콘텐츠이며 기존 소유자 override를 유지한다. GLB **4,701,148B**, 카메라·전시 좌표·이동 시간·경로 코드는 이번 작업에서 바꾸지 않았다.
- 최종 headless browser harness: **desktop 1440×900 141 PASS / mobile 390×844 142 PASS / short-mobile 390×600 142 PASS**, 각 **57/57 파라미터 probe**, pageErrors 0. 첫 입장 각각 **7.308초 / 5.932초 / 6.073초**. 전체 그림 표시, 설명 패널 분리, 선택/되돌리기, 드래그, 키보드, 동작 줄이기, 빈 검색과 WebGL 대체 화면 통과. `art/exhibition-*-qa.json`.
- 첫 후보는 가로 폭만 검사하던 확대 QA가 세로 작품을 반영하지 못해 실패했다. 가로 또는 세로 표시 크기를 검사하도록 수정했고 전체 이미지/설명 충돌/동선/이동 시간 기준은 유지했다. 수정 후 첫 desktop 재검사의 입장 **9.306초**는 기존 8.5초 기준 미달로 보존했다. 최종 재검사가 위 7.308초이며 성능 기준을 낮추지 않았다. 실패 기록: `exhibition-first-desktop-qa.json`, `exhibition-second-desktop-qa.json`.
- 실제 마우스 held drag→해제, 입장→외관 복귀도 PASS. 추가 desktop/mobile 검사에서 7개 이미지 decode, 7개 실제 운영 href, Escape→작업실/초기화→외관, 블로그·한술툰 상세 이미지/링크와 중복 소스 코드 링크 제거를 확인했다. **Day Walk 버튼을 클릭해 실제 운영 페이지와 Day Walk iframe까지 진입 PASS**. 기록: `art/exhibition-20261003/link-and-artwork-qa.json`; 캡처: 같은 폴더의 `gallery-day-walk-desktop.png`, `gallery-day-walk-mobile.png`.
- Aside에서 운영 참조와 LAB 미리보기를 확인했으나 선택 화면 캡처가 timeout되어 사용자에게 알리고 headless Playwright로 전환했다. 실제 기기 GPU/FPS 측정은 미실행.
- root `pnpm check` 통과. 마지막 ChemiForge 이미지/세로 QA 조정 후 앱 `check`/`build`, `prompts:check`, `references:check` 통과: layer lint 오류 0, 77,077 경로 샘플, 이미지/GLB 예산 정상. 프롬프트 보관함 42카드로 재생성. 운영 LAB 배포와 원격 claude.ai 보관함 재게시는 미실행.
- 로컬 보관함과 `.bkit/runtime/prompt-gallery-site`/`reference-gallery-site` 재게시 패키지를 갱신했다. 검증 환경은 Node 22.16.0/pnpm 9.13.2이며 저장소가 지정한 Node 24 검증은 미실행.
- 재사용 조건: 웹 UI 전체 캡처를 전시 표지로 강제하지 않는다. 실제 운영 화면을 근거로 주제를 그리되 원작 만화의 캐릭터/글자를 보존한다. 세로 그림은 높이까지 포함해 확대를 검수하며 그림 전체와 설명 패널의 경계를 함께 확인한다.

## 2026-10-05 · POTATO·선비·작업 동네 전체 공간 연결

- bkit Plan → Design → Do → Check → Act. [계획](../../docs/01-plan/features/gallery-all-works.plan.md), [설계](../../docs/02-design/features/gallery-all-works.design.md), [검사 대조](../../docs/03-analysis/gallery-all-works.analysis.md). docs/00·10·04·11, 앱 README/기존 QA, 레퍼런스 bruno-simon·annamills를 읽고 기존 공간 복귀·DOM 목록·필름 스트립·텍스트 선택을 재사용했다. 새 에셋·Blender 재빌드·분기 이야기·공용 모듈 추출은 필요 없다.
- 이전에는 첫 7개 작품만 scene에 전달되어 POTATO·선비를 눌러도 그림과 카메라는 바뀌지 않았다. 이제 전체 10개를 전시하며 `index % exhibitBays`/`floor(index / exhibitBays)`로 기존 7개 칸을 페이지로 재사용한다. 선택/필터 시 현재 페이지와 검색 결과의 교집합만 보인다. 기존 7개 액자 좌표·베이크 조명·GLB는 보존한다.
- 작업 동네는 stable ID `village`, 작품 10, 기존 `project-village.webp` 표지와 `./village.html` 체험 링크로 등록했다. 카드·검색·소개·링크/콘텐츠 편집은 기존 registry 경로다. 동네 자체는 건물/집 장면 목록에서 제외해 물리 목적지 9개와 기존 house 파라미터를 유지한다.
- 레이어 계약: **7레이어/57파라미터 유지**, 기존 stage·rail·detail·controls·shell 재사용. 페이지/슬롯은 구조 fixed에 기록, 문구/이미지는 콘텐츠 편집기가 담당한다. 앱 lint 오류 0, 동네 공통 8레이어/42파라미터 및 개별 10레이어/99파라미터 lint/생성물 최신성 유지. 모든 작품의 안전 동선 **110,110샘플** 통과, GLB 4,701,148B 유지.
- Aside에서 전체 컬렉션 10, 세 작품 선택과 POTATO의 실제 그림 앞으로 이동한 화면을 확인했다. RGBA 표지의 투명 픽셀이 불투명 재질에서 검게 나타난 문제를 발견해 전시 재질의 alpha를 보존했다. 수정 후 Aside 화면에서 흰 전시판 위 캐릭터를 직접 확인했다. 새 이미지 생성/교체 없음.
- 실제 클릭 smoke는 **desktop 1440×900 / mobile 390×844 / narrow 320×700 모두 PASS**, JavaScript 오류 0. 새 3작품과 07↔08 페이지 전환, 선택/실제 카메라 좌표/현재 페이지 그림 목록/전체 그림 경계, 좌우키·Escape·Home, 검색·빈 결과 복구, POTATO·선비 실제 iframe 체험 진입→전시관 복귀와 선택 복원, 작업 동네 진입→물리 9목적지→전시관 복귀·선택 복원을 확인했다. `art/gallery-all-works-{desktop,mobile,narrow}-smoke.json`과 `*-village.png`.
- 레이어 설정은 desktop/mobile 각각 **57/57 PASS**. 기존 QA의 CSS/속성 probe 및 실제 renderer uniform 대조를 그대로 실행했다. 비화면 상태에서 렌더를 정지해 검사하며 값 적용은 계속 관찰한다. `art/gallery-all-works-*-probe.json`. 테스트 스크립트는 Git 제외 `.site-publish/gallery-all-works-{smoke,probe}.py`에 있다.
- 앱 `check`/`build`, prompts:check, references:check 및 diff whitespace 검사 통과. 레퍼런스 사용 이력을 기록하고 보관함을 재생성했다. Node 22.16.0/pnpm 9.13.2에서 실행했다.
- 실패 이력: Aside 전체 회귀는 18항목 후 12초 hall 대기 시간 초과(`*-aside-first-qa.json`). 첫 headless 전체 회귀는 실패 항목/페이지 오류 없이 127항목 통과 후 실행기 120초 제한으로 TIMEOUT(`*-desktop-qa.json`). 첫 smoke의 마지막 동네→전시관 재로딩도 실행기 30초 제한으로 중단됐으며, 페이지 초기화 대기 90초로 검사한 최종 smoke는 위 결과다. 앱의 이동/성능 기준을 낮추지 않았다. 전체 모션 회귀 PASS를 주장하지 않는다.
- 재사용 조건: 전시 칸 개수를 전체 작품 수로 재계산하지 않는다. 칸은 구조, 작품은 콘텐츠이며 페이지별 가시성을 반드시 함께 갱신한다. 같은 공간을 작품으로 등록할 때 그 공간 자체를 물리 집으로 추가하지 않는다. 투명 PNG는 기존 전시판 위에서 실제 픽셀을 확인한다.
- 미검수: 실제 휴대폰 GPU/FPS, 전체 모션 회귀 완료, Node 24, 운영 배포/R2 인증·쓰기, 원격 claude.ai 보관함 재게시. 기존 저장 실패 처리를 바꾸지 않았으며 이번 작업에서 별도로 재검사하지 않았다.

## 2026-10-05 · 이동·페이지 전환 및 얇은 전시 마감

- 승인된 검토1·2를 bkit Plan → Design → Do → Analyze → Act로 진행했다. [계획](../../docs/01-plan/features/gallery-natural-refinement.plan.md), [설계](../../docs/02-design/features/gallery-natural-refinement.design.md), [대조](../../docs/03-analysis/gallery-natural-refinement.analysis.md). docs/00·10·04·11·14, POTATO 제작/QA·직전 비교 기록, bruno-simon·annamills를 참고했다. 실제3D 문 통과 경로가 있어 이미지/CSS 공간으로 바꾸지 않았으며 캐릭터 반응3은 범위 밖이다.
- 같은 페이지에서 이동 시간은 실제 카메라 거리/2.15m×인접 기준1.8초, 최소.6초/최대4.8초다. 다른 페이지는 기본.85초 가림→그림 교체→등장이다. 선택과 실제 표시 페이지를 분리했고, 재입력은 현재 가림막 alpha에서 새 목적지로 이어간다. 작업실/외관의 페이지 변경도 가리고, 다시 보인 뒤 기존 접근 경로를 이동한다.
- 큰1.75×2.65m 목재판을 제거하고 종이1.51×1.91m·18mm 샴페인색 액자·선반1.62×.055×.26m로 바꿨다. 종이 앞면보다 그림을15mm 앞으로 배치하고 camera look과 artworkZ=-6.75를 공유한다. 새 종이를 포함해 PBR7그룹, 실제7spot 조명32samples/AO64samples·.8m·denoise를 재생성했다. GLB4,631,904B(<6MB); 이전 GLB/Blender는 같은 검수 폴더에 보존한다.
- 레이어 계약: **7레이어/66파라미터**. stage에 이동 최소/최대 시간·페이지 시간/색·액자색/거칠기·종이색/거칠기·작품 밝기9개를 추가했다. 베일은 stage 하위라 보이기/불투명도를 상속한다. 물리 치수/베이크 좌표는 fixed 이유를 기록했다. lint 오류0, **desktop/mobile/narrow 각각66/66 probe PASS**, 실제 재질 값과 시간 변경도 확인했다.
- Headless Playwright Chromium/Intel Arc D3D11 전체 회귀: **1440×900 204 PASS / 390×844 205 PASS / 320×700 205 PASS**, JavaScript 오류 모두0. 외관→작업실 시간은5.617/5.634/5.656초로 기존8.5초 기준을 통과했다. 전체 모션·그림 경계/비율·투명 alpha·설명 패널 분리·포인터/키보드·목록 대체·빈 결과/복구·컨텍스트 손실 대체·설정/되돌리기를 검사했다. 이번 최종 회귀는 이전 전체 모션 회귀 미완료 기록을 보완한다. 보고서는 `art/gallery-natural-refinement/{desktop,mobile,narrow}-qa.json`.
- 신규 상태 검사: 그림/카메라는 가림 전까지 유지, 가려진 중간에 교체, 끝에는 alpha0. 빠른07→08→09 재선택, fade-out/fade-in에서 이전 페이지·Escape/Home·결과 있는 검색, 빈 검색, reduce로 즉시 완료, 목록에서 진행 정지/복구, 작업실 페이지 변경 뒤 기존 접근, 실제 slideMin/slideMax duration 및 pageSeconds 경과 시간 모두PASS.
- 실제 캡처를 열어 이전 목재판/넓은 선반 대비 새 액자·받침이 작품을 덜 가리는 것을 확인했다. 세 화면 크기의 외관/작업실/하루 산책/POTATO/선비 캡처와 이전 비교3장이 같은 폴더에 있다. 새 AI 이미지 생성은 없고 Blender 절차·원본·명령은 [프롬프트 카드24](../../prompts/jooho-lab.md#24--lab-light-gallery--가벼운-액자와-전시-마감)에 기록했다.
- 실패/해결 이력: Aside 외관 화면을 확인했으나 전체 회귀18항목 뒤 hall 대기가 timeout(`aside-qa.json`), 후속 캡처도 CDP timeout. 기본 headless의 SwiftShader가 느려 짧은 fade-in 관찰과 입장 시간 측정(9.197초)이 불안정했다. GPU 진단 후 실제 Intel GPU로 검사하고 단계 대기를 rAF로 바꿨으며 앱 시간/검사 기준은 완화하지 않았다. 새 검사가 project 상태로 끝나 기존 controls.bottom probe를 방해한 것은 기존 외관 준비 상태로 복구해 해결했다. 읽기 전용 설계 대조에서 나온 작업실 페이지 변경/fade-in 검증 갭을 위 구현·검사로 해결했다.
- root `pnpm check`, app `check`/`build`, 프롬프트47항목/레퍼런스 보관함 재생성·최신성 및 diff whitespace 검사PASS. Node22.16.0/pnpm9.13.2/Blender4.5 환경이다. 로컬 보관함과 재게시 패키지만 갱신하며 운영 전시관·원격 claude.ai 게시·Node24·실제 휴대폰 GPU/FPS·R2 쓰기는 미실행. 저장 실패 코드는 이번에 바꾸거나 별도로 검사하지 않았다.
- 재사용 조건: 작품 목록/현재 선택과 실제 표시 페이지를 분리한다. 구운 전시물 구조를 바꾸면 같은 광원·UV로 조명/AO도 다시 만든다. 카메라/그림 앞면 좌표는 정본을 공유한다. headless Windows의 시간 검증은 renderer를 확인하고 SwiftShader 결과를 실제 GPU 성능으로 해석하지 않는다.

## 2026-10-05 · POTATO만 2.5D 시범 적용

- bkit Plan/Design/Do/Analyze/Act, 범위는 POTATO 한 작품의 작은 깊이 반응이다. docs/00·10·14·11, POTATO README/QA·입력/그림자 구현, LAB README/QA와 references bruno-simon/loonamessal을 읽었다. 그림과 그림자를 분리하는 원칙을 가져오며 실제3D 문 통과/카메라·그림 콘텐츠·다른 작품을 유지한다. 새 이미지/모델·반복 떠다님·공용 모듈 추출 없음.
- 기존 투명 texture/contain 비율에 depth=.12m·scale=.94·shift=.025/.018m·tilt=4°를 합성한다. 종이와 충돌하지 않도록 모서리 후퇴량으로 실제 각도를 제한한다. 별도 unit shader plane의 radial alpha로 타원 그림자를 만들고 너비/높이/위치/색/농도/반응을 조절한다. image는 기존 콘텐츠 편집기가 맡으며 새 파일 에셋/생성 프롬프트는 없다.
- POTATO 앞에서만 반응하며 다른 작품/이동에서 원래 좌표/비율로 복구한다. leave에서 중앙으로 돌아오고 터치·reduced·manual drag는 정적인 깊이를 유지한다. 기존 포인터 damping/rAF를 재사용해 반복 애니메이션 루프를 추가하지 않았다. Shader는 기존 compileAsync/dispose 경로에 포함되고 raycaster 대상에서 제외되어 클릭을 가리지 않는다.
- 레이어 계약: **9레이어81파라미터**, 새 `potato-card`8개/`potato-shadow`7개. visible/opacity와 입력·깊이·크기·그림자 시각값은 attr로 실제 renderer에 연결하고 MutationObserver에 등록했다. 단위 plane/gradient 수식·물리 전시 좌표와 종이 여유·touch/reduced 조건은 fixed 이유로 기록했다. lint0, **1440/390/320px 각각81/81 probe PASS**. 새15개는 활성 POTATO의 실제 mesh 변환/가시성/불투명도와 shader uniform/크기로 별도 검증했다(`renderer-probe.json`,15PASS, page/console 오류0).
- 최종 전체 회귀 **desktop228 / mobile229 / narrow229 PASS**, JavaScript 오류0. 포인터에 따른 캐릭터/그림자 반대 방향 반응·작은 각도·leave 복귀·touch move/tap·reduced 정적 깊이·enabled off의 원래 평면·다른 작품 복구와 기존 페이지 전환/검색/키보드/원본 비율/컨텍스트 손실 대체를 확인했다. `art/gallery-potato-depth/{desktop,mobile,narrow}-qa.json`. 효과 on/off 및 세 화면의 캡처를 열어 그림자·이미지 비율·잘림 없음을 확인했다.
- 읽기 전용 설계 대조에서 mouse hover 뒤 이동 없는 touch tap이 이전 기울기를 남기는 문제를 찾았다. headless 재현에서 rotation±.01914로 실패한 뒤 pointerdown에서 touch 종류/포인터 중앙을 갱신하고 wake했다. 수정 후 rotation0 및 추가 전체 회귀 항목PASS. 첫 manifest camelCase layer ID가 lint 규칙과 맞지 않아 kebab-case로 바로잡았다. Aside 실제 선택/상태는 확인했으나 CDP screenshot timeout으로 캡처는 Intel Arc D3D11 headless에서 수행했다.
- root `pnpm check`, 앱 `check`/`build`, references 보관함 재생성/최신성·diff whitespace 검사PASS. Node22.16/pnpm9.13.2 환경. 실제 휴대폰/Safari/Firefox/FPS·운영 배포·원격 보관함 게시·Node24·저장소 차단 재검사는 미실행. 새 설정의 저장/되돌리기는 기존 layer-kit 경로를 재사용한다.
- 다음 재사용 조건: 이미지의 baked 원근은 재생성하지 않고 작은 plane 변환으로 보강한다. plane 비율을 fit에 보관해 설정/상태가 반복되어도 배율이 누적되지 않게 한다. touch move뿐 아니라 mouse→touch down 전환도 검사한다. 공간에서 큰 회전/뒷면이 필요하면 이 방법의 검증 범위를 넘는다.

## 2026-10-05 · 박물관 외관 시안 (gallery-museum-exterior)

- 사용자 의도 정정: 작은 시범의 대상은 POTATO 캐릭터가 아니라 **건물/인테리어 자체의 표현**이다. 이전 캐릭터 시범 기록은 별도 이력으로 남기고 이번에는 외관부터 적용했다. 국립중앙박물관 공식 건축 개요의 수평 석재 매스·중앙 열린마당을 참고했다. 원작 건물/사진/브랜드를 복제하지 않았다.
- 변경: 양쪽 높이6.9m 석재 매스, 중앙6m 빈 통로, 높이6.625m 위 연결 보, 낮은 수평창/줄눈. 얇은 기존 지붕의 전면 돌출을 줄였고 외부 eye[12,7,28]/look[-3.7,2.4,0]으로 넓혔다. 안쪽 문/실내 전시7칸/가구/관람 경로는 유지했다. Blender4.5 재베이크/GLB5,174,556B, PBR7종/조명7개/UV0 조명·AO/UV1 재질 및6MB 예산 PASS. 이전 모델/packed 원본·외관을 `art/gallery-museum-exterior/*-before.*`에 보존했다.
- 레이어 계약: 변경은 기존 `stage` 내부 모델, **9레이어81파라미터 유지**. 보이기/불투명도·표면색/거칠기/요철·조명/반사/노출을 기존 설정으로 조절한다. 새 외벽/창 분할/보·카메라 좌표는 재베이크와 동선 검사가 필요한 물리 구조값으로 fixed에 이유를 적었다. lint0, 1440/390/320px 각각 **81/81 probe PASS**.
- 앱 검사에서 중단/역방향 포함 **110,110 route samples PASS**. 새 석재 외벽/보에 카메라 여유.2m 검사 추가. 읽기 전용 bkit 설계 대조도 수동 orbit 상한을 포함해 외벽 본체 충돌0을 확인했다(리뷰의 별도 수치에는 클래딩/parallax/near plane가 포함되지 않는다).
- 최종 브라우저 **desktop228 / mobile229 / narrow229 PASS**, JavaScript 오류0. 기존 키보드/포인터/터치/검색·빈 결과/전환 취소/입장·복귀/동작 줄이기/설정 probe 회귀를 통과했다. 첫 회귀 실패는 외부 z=24를 고정한 QA 기대값이었다. 실제 새 pose로 복귀함을 확인한 뒤 canonical `exterior.eye`의 세 좌표와 비교하도록 수정했고 최종 회귀를 다시 통과했다.
- 세 화면 외관·홀·하루 산책/POTATO/선비 캡처를 저장했고 데스크톱 전후 및 모바일 외관/실내 캡처를 열어 확인했다. 세로 화면은 기존 중앙 입구 중심 근경을 유지하므로 양쪽 건물 끝은 화면 밖에 있다. Aside에서 로컬 입장/복귀를 확인했지만 screenshot CDP timeout으로 캡처는 Intel Arc D3D11 Playwright fallback을 사용했다. 결과/캡처: `art/gallery-museum-exterior`.
- root `pnpm check`, 앱 check/build, prompts/references 재생성·최신성 검사 PASS. 제작 요청/원본/도구·설정은 중앙 prompts 카드25에 기록했고 로컬 보관함 게시용 폴더도 재생성했다. 운영 배포/원격 보관함 게시·실제 휴대폰/Safari/Firefox/FPS·Node24 검증은 하지 않았다(Node22.16/pnpm9.13.2). 새 저장 경로는 없으며 저장 실패 검사는 이번에 재실행하지 않았다.
- 다음 재사용 조건: “2.5D를 일부 적용”이라는 표현만으로 전시 작품 효과를 선택하지 않는다. 사용자가 바꾸려는 대상(건물/인테리어/작품)과 원하는 인상을 먼저 구분한다. 실제 내부 이동을 유지하면서 건축 인상을 바꿀 때는 이미지 한 장보다 기존 모델의 외관 형태/재질을 수정하고 문·천장·중단 경로를 함께 검사한다.


## 2026-10-05 · 사진 참고 분홍 꽃나무 (gallery-plum-trees)

- bkit Plan → Design → Do → 읽기 전용 설계 대조 Check → Act. 사용자 사진의 검은 굽은 줄기/비대칭 가지/잔분홍 꽃을 참고한 투명 PNG1개(1086×1448 RGBA,2,796,507B)를 제작했다. 외부4개 식재 위치만2.5D 카드로 바꾸고 실내 녹색 나무/건물/관람 경로를 유지했다. Blender4.5 재베이크 모델4,247,256B,7PBR/7조명/UV0 조명·AO/UV1 재질 및6MB 예산 PASS. 이전 모델/외관은 art/gallery-plum-trees/*-before.*에 보존했다.
- 새 courtyard-trees10파라미터 포함 **10레이어91파라미터**, layer-kit lint0.1440/390/320px 각각 **91/91 probe PASS** 및 새 파라미터 실제 renderer 반응 PASS. 높이/가지 폭/뿌리 가로·하단 기준/밝기/색/방향/이미지/보이기/opacity를 조절한다. 식재 좌표/원래 높이 비율/화단 높이/정적 방향/alpha 기준/외벽 바깥 clipping은 manifest fixed에 이유를 기록했다.
- Check에서 낮은 opacity의 그림자 외곽과 초기 이미지 전체 실패를 발견해 수정했다. RGBA depth shader는 실제 opacity uniform을 alphaTest 앞에서 곱한다. 교체 실패는 이전 map 유지, 최초/기본 PNG 모두 실패는 투명 DataTexture로 나무만 숨기고 전시관을 열며 이후 정상 이미지 변경으로 복구한다. abort→정상 입장→이미지 복구 targeted **PASS**, pageErrors0.
- 실내 캡처에서 외부 카드의 가지가 벽 안으로 뻗는 분홍 줄무늬를 발견했다. x=±9.12m 바깥 clipping을 색상/그림자에 적용하고 좌/우 custom depth material도 분리했다. 반대 clipping plane 캐시 재사용을 방지하며 양쪽 map/opacity/alpha/shader hook/dispose를 동기화한다. 최종 실내 캡처에서 줄무늬 제거를 확인했다.
- 최종 브라우저 **desktop1440×900 255 / mobile390×844 256 / narrow320×700 256 PASS**, JavaScript 오류0. 입장/복귀/중단·역방향/키보드/터치 입력/검색 빈 결과/동작 줄이기/기존 POTATO 효과/전 설정 probe를 확인했다. 앱 check: **110,110 route samples**, GLB/레이어 검사 PASS. 앱 build와 root pnpm check PASS. 결과/15캡처는 art/gallery-plum-trees, 최초 실패 결과는 initial-image-failure.json. 외관 전후/세 화면/홀 캡처를 직접 열어 검수했다.
- Aside에서 로컬 입장/복귀를 확인했고 최종 외관 탭을 열어뒀다. screenshot CDP timeout을 안내한 뒤 Intel Arc D3D11 Playwright fallback으로 캡처/회귀를 실행했다. 한 장의 나무 이미지이므로 측면에서 평면이 드러날 수 있고, 기존 모바일 입구 중심 구도에서는 나무가 화면 밖이다. 자유 회전 가능한 나무 모델/사진 수준 건물 구현 완료라고 표현하지 않는다.
- 프롬프트 원문/사용자 참조/생성본/알파 범위/접지 기준은 중앙 prompts 카드26. prompts:build와 로컬 보관함 게시용 폴더 재생성을 완료했다. 운영/원격 보관함 게시·실제 휴대폰·Safari/Firefox·FPS·Node24 검증은 하지 않았다(Node22.16/pnpm9.13.2). 새 저장 경로는 없고 기존 저장 실패 테스트는 이번에 재실행하지 않았다.
- 재사용 조건: 2.5D 외부 장식은 바닥 접지·알파 가장자리뿐 아니라 실내 관통을 확인한다. depth shader에 CPU opacity가 실제 반영되는지 확인하고 clipping이 다르면 depth material도 분리한다. 계획/설계/분석은 docs의 gallery-plum-trees 기록을 따른다.


## 2026-10-05 · 두 나무 형태·위치와 건물 관통 수정 (gallery-tree-pair)

- 사용자 확인: 이전 clip-plane 시안도 건물을 뚫어 보이며 두 그루가 같은 형태였다. 이전 검수의 "실내 줄무늬 제거"는 기본 홀 한 구도 결과에 한정돼 실제 나무 카드 전체가 외벽/지붕 밖에 있다는 증거가 아니었다. 이번에는 반복4그루를 서로 다른 두 에셋과 두 식재 위치로 변경했다. 앞은 굽은 단일 줄기/넓은 수관(12.3,0),높이4.7m; 뒤는 가는 줄기/세로 수관(12.5,-7.8),높이6.1m. 실내 작은 나무/건물/동선/카메라는 그대로다.
- 외부4개 고정 화단을 Blender에서 제거해 재베이크했다. GLB4,219,684B,7PBR/7조명/UV0 조명·AO/UV1 재질 및6MB 예산 PASS. 새 화단은 각각 실제 나무 뿌리 좌표를 따라간다. 이전 모델/외관은 art/gallery-tree-pair/*-before.*에 보존했다.
- 가지를 벽에서 자르는 shader clipping 의존을 제거했다. 모든 설정/이미지 변경마다 실제4정점의 회전/크기/뿌리 기준을 적용한 minX를 계산해 **나무 면 전체와 화단 전체를 x≥10.2m**에 유지한다. 가장 넓은 지붕/보 x=9.8m보다.4m 바깥이다. 기본 실제 minX:앞10.712489m,뒤10.667639m. 설정한 x가 안전 위치보다 안쪽이면 실제 뿌리를 바깥으로 보정한다.
- Check에서 geometry.boundingBox 캐시가 오래된 root 기준을 쓰는 결함을 발견했다. 정점 변경 후 boundingBox/Sphere를 갱신하고 안전보정/inspect 모두 setFromObject(mesh,true)로 실제 정점을 계산한다. 두 나무 각각 baseX0/1 ×yaw±25 ×maxheight8/spread1.3/minx10의8조합도 PASS. 화단은 처음부터 transparent:true이며 opacity0에서 visible/castShadow를 끈다. 나무 그림자 shader도 opacity를 반영하고 depth material은 그루마다 분리한다.
- 레이어:앞 courtyard-trees/뒤 courtyard-tree-back 각각13파라미터, 전체 **11레이어107파라미터**, lint0. 보이기/opacity/이미지/높이/폭/뿌리 가로·하단 기준/밝기/색/방향/x/z/화단 색을 조절한다. y접지·화단 치수·최대 건물 경계+안전 간격·alpha 기준·초기 시점 방향은 fixed에 이유를 기록했다. 세 화면 **107/107 probe**와 두 나무 모든 파라미터 실제 renderer·안전 위치·화단 좌표 검사 PASS.
- 최종 브라우저 **desktop1440×900 321 / mobile390×844 322 / narrow320×700 322 PASS**, JS 오류0. 입장/복귀/전환 취소/키보드·터치 입력/빈 검색/동작 줄이기/기존 POTATO 반응을 포함한다. 두 기본PNG 전체 abort→나무만 숨기고 전시관 입장→앞 나무를 다른 이미지로 복구 targeted PASS. 앱 check(110,110 route samples)/build와 root pnpm check PASS. 결과/15캡처:art/gallery-tree-pair. 외관과 데스크톱/320px 실내 캡처에서 관통한 꽃가지 없음 확인.
- bkit Plan/Design→Do→읽기 전용 설계 대조 Check→캐시/화단 결함 수정 Act를 사용했다. 사용자 사진 참고 built-in image_gen 독립2개 PNG는 중앙 prompts 카드27/28, 정확한 프롬프트·생성 경로·알파를 기록했다. prompts:build와 로컬 보관함 게시용 폴더 재생성 PASS. 외부 레퍼런스 패턴은 해당 없음.
- Aside 로컬 탭을 최종 외관으로 새로 열었다. screenshot CDP timeout을 안내한 뒤 Intel Arc D3D11 Playwright fallback으로 검수했다. 모바일의 기존 입구 중심 구도에서 나무는 화면 밖이며, 한 장의 이미지라 측면에서는 평면이 드러날 수 있다. 운영/원격 보관함 게시·실제 휴대폰/Safari/Firefox·FPS·Node24는 미검증(Node22.16/pnpm9.13.2). 기존 저장 실패 검사는 새 저장 경로가 없어 재실행하지 않았다.
- 재사용 조건: 나무가 건물을 관통하지 않는다는 요구는 실제 변환된 geometry 전체와 지붕까지 포함하는 안전 공간으로 검증한다. 기본 사진 한 장/벽 clipping/오래된 Box3 캐시를 충분한 증거로 삼지 않는다.


## 2026-10-05 · 두 나무 동시 노출 위치 조정

- 사용자가 두 그루가 동시에 보이도록 위치만 살짝 다르게 요청했다. 기존 Plan/Design/QA를 참고해 bkit 소규모 Plan/Design→Do→Check를 수행했다. 새 에셋/카메라/건물/이동 코드는 바꾸지 않았다. 외부 레퍼런스는 해당 없음.
- 기존 레이어의 x/z 기본값4개만 조정:굽은 나무(12.3,0)→**(11.8,-2)**,곧은 나무(12.5,-7.8)→**(13,0)**. 같은 외관 구도에서 두 줄기와 두 화단을 동시에 구분할 수 있게 했다. 레이어 계약은11레이어107파라미터/fixed 안전 경계 그대로다. 화단도 뿌리 위치를 따른다.
- desktop QA **321PASS**,107/107probe 및 실제 renderer/안전 검사PASS,JS오류0. 세 화면1440/390/320px의 기본 위치/건물 안전 간격/입장·복귀를 확인하고 외관/홀6캡처를 저장했다. 기본 두 나무 실제minX=[10.212433, 11.168627]m≥10.2m. 앱check(110,110route samples/lint0/GLB예산)/buildPASS. 결과는 art/gallery-tree-position. 모바일 전체 harness는 이전321/322검수 이후 재실행하지 않았으며, 이번에는 위치/입장·복귀를 확인했다.
- Aside로 최종 위치 attr값과 로컬 외관 재로딩을 확인했다. 캡처CDP timeout 안내 후 Playwright D3D11 fallback을 사용했다. 데스크톱 외관/홀 캡처를 직접 열어 두 줄기·화단 노출과 실내 관통 없음 확인. 기존 모바일 입구 중심 구도와 측면 평면 노출 한계는 유지된다. 배포/실제 휴대폰 검증은 하지 않았다.

## 2026-10-05 · 공간 레이어 수정 모드

- bkit Plan/Design→Do→Check 및 읽기 전용 리뷰 적용. `bychudy`의 선택/텍스트 창, `annamills`의 직접 끌기만 참고하고 원작 외형·이미지는 가져오지 않았다. 자료와 레이어 계약은 `docs/01-plan/features/gallery-layer-editor.plan.md`, 설계·분석은 같은 feature 문서에 기록했다. 참고 카드 쓰인 작품/로컬 보관함 갱신. 원격 보관함은 게시하지 않았다.
- 상단 레이어 수정/설정 진입, 우측 패널(모바일 하단), 선택 테두리·이동 손잡이·화면 pick, 바닥/작품 평면/DOM 위치, 숫자·방향키, 명시 저장, 초안 표시, undo/복구/초기화/JSON 구현. 저장은 기존 브라우저 키이며 원격 저장/게시가 아니다. 전체12레이어131파라미터, lint오류0, probe131/131PASS(외관/작품의 적용 장면 결과 합산).
- `python scripts/check-layer-editor.py`: **53/53PASS**, JS오류0. 데스크톱 실제 드래그·독립 두 나무·DOM 정확 이동·포인터/카메라 입력 분리·Escape 취소·Ctrl+S 입력 반영·저장/재로딩·장면 override·POTATO/그림자·편집창 숨김/투명 복구·저장 실패/JSON을 확인했다. 390/360px 실제 CDP 터치 드래그와 저장 유지, 미리보기/패널 분리·저장버튼 접근·overflow0, 1024/1100px POTATO 설명 겹침 해소를 확인했다. `art/gallery-layer-editor`의5캡처를 직접 확인했다.
- 기존 공간 harness 데스크톱 **345PASS**, 모바일 **346PASS**. 새 131파라미터 attr/CSS 바인딩 포함. 전시 이동/복귀·키보드/페이지 전환·작품 비율·빈 검색·목록 대체·context loss PASS. `pnpm check` 전체PASS, 공유layer-kit9테스트PASS, 앱buildPASS. Node22.16에서 검수했으며 저장소권장Node24는 별도 미검증이다. 기존 dawn-store의 unavailable umbrella 경고1개는 유지된다.
- 수정한 실제 결함: 개별3D visible attr가 공용canvas DOM을 숨기지 않게 함(공유host 회귀테스트), 선택renderer/앱 설명 동기화, 입력 중 단축키 저장, 범위 읽기/쓰기 일치. 모바일 손잡이가 하늘에 있을 때 바닥 ray가 실패하므로 실제 뿌리 투영점 기준 상대 drag를 쓴다. 좁은 편집미리보기에서는 선택하지 않은 안내/썸네일을 숨기고 POTATO 편집 시 설명을 잠시 숨긴다. 패널너비는 모바일40px 보정·viewport상한을 적용하며 설정은 여전히 반영된다.
- 건물의 실제 mesh/UV/카메라 경로를 이동·재구성하지 않는다. stage는 렌더 화면 위치이며 나무는 기존 실제 정점 전체 안전보정을 유지한다. 모드 종료 후 화각/표시는 돌아오고 미저장 초안은 남는다. 실제 iOS/Android기기·브라우저 간 동기화·운영 배포는 하지 않았다.
# 2026-10-05 — 레이어 배포용 저장

bkit Plan → Design → Do → Check. [계획](../../docs/01-plan/features/gallery-layer-publish.plan.md)·[설계](../../docs/02-design/features/gallery-layer-publish.design.md)·[분석](../../docs/03-analysis/gallery-layer-publish.analysis.md).

- 로컬 저장은 `public/layers.values.json`을 갱신하며 정적 빌드가 해당 파일을 배포 기본값으로 읽는다. 기존 Chrome localStorage 형식은 로컬에서만 이관하고 파일과 다르면 미저장 표시한다. 배포에서는 이전 게시본 초안이 새 기본값을 가리지 않는다.
- Node 임시 파일 API 통합 검사 PASS: 실제 디스크 저장·새 읽기, 잘못된 작품/범위/JSON, Origin/Host, 256KB, revision 충돌, 동시 PUT [200,409], 파일 실패. 로컬 전용 loopback·고정 경로·직렬화·원자적 rename.
- 실제 Aside 탭에서 새 안내와 저장 성공 확인. 당시 탭 값은 빈 override, localStorage는 null. 사용자가 편집한 Chrome 프로필은 디버깅 연결이 없어 직접 읽지 못했다. 기존 Chrome에서 저장→새로고침→파일 저장이 필요한 상태이며, 사용자 배치를 이미 이관했다고 주장하지 않는다.
- `check-layer-editor.py` **54/54 PASS**, 실제 pointer/touch·모바일/Ctrl+S·저장 실패/JSON 내보내기, layer probe **131/131 PASS**. 파일 저장 테스트는 API 격리로 실제 값 파일을 덮지 않는다.
- `check-layer-publish.py` **19/19 PASS**: 빌드 파일 일치, 별도 정적 서버의 빈 브라우저에 비어 있지 않은 게시값 적용, 렌더러 x좌표, 모바일·작품 범위, 동일 게시본 초안 복원/새 게시본 초안 만료, 이전 localStorage 무시, 브라우저 저장 실패, API GET 500/403/잘못된 JSON·값 차단, legacy 로컬 이관, 지연 저장 중 추가 편집과 저장본 복구.
- 리뷰에서 발견한 API 읽기 오류를 브라우저 초안 성공으로 처리하는 문제를 수정했다. 404만 정적 미지원으로 처리하고 실제 읽기 오류는 저장을 차단한다.
- 루트 `pnpm check`, 앱 `pnpm build` PASS. 12레이어/131파라미터 유지, lint 오류 0. 새 에셋·프롬프트 없음. 기존 Node>=24 안내와 Dawn umbrella 경고는 이번 변경의 실패가 아니다.
- 결과: `art/gallery-layer-publish/publish-qa.json`, `art/gallery-layer-editor/editor-qa.json`·`layer-probe.json`. 원격 배포/커밋/push, 사용자의 Chrome 원본 배치 이관, 실제 iOS/Safari/Firefox는 이번에 검증하지 않았다.

# 2026-10-07 — 11번 상세페이지

- 등록부 11개: 전시 벽 7칸을 넘는 작품은 기존 `exhibitBays` 재사용으로 2쪽째에 걸린다. 표지는 캡처 합성 `work-detail-pages.webp`(1800×1125).
- 공간 harness(`check-natural-gallery.py --prefix gallery-detail-pages`, 임시 8889 서버): 데스크톱 **349 PASS**, 모바일 **350 PASS**. 320px는 `layer editor.panelWidth: 320px -> 320px`에서 멈췄다 — 편집 창 폭이 `min(panelWidth, 100vw)`라 화면 폭 320px에서는 값을 바꿔도 보이지 않는 **기존 검수 스크립트의 한계**다(레이어 편집 커밋 50e7a70의 회귀 기록도 데스크톱·모바일만 있다). 같은 바인딩을 main 체크아웃과 이 브랜치에서 직접 바꿔 보니 둘 다 360px → 300px로 같았다. 스크립트는 고치지 않았다.
- 그 대신 320·390·1440에서 11번만 따로 확인: 썸네일 있음·선택·가로 넘침 없음·포트폴리오 링크·목록 보기 넘침 없음·페이지 오류 없음, 감싸개 안 덮개 열기·Escape·"전시실로 돌아가기" **22/22 PASS**. 캡처는 남기지 않았다(검수용 임시 폴더).
