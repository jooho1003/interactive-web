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
