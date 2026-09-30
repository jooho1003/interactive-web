# Scene Studio implementation

Scope: finalize the Choreographic-inspired editor UX and implement the first complete consumer, Potato Designer, backed by reusable @iw/layer-kit. Existing uncommitted work is preserved. Other apps remain migration consumers of docs/11, not silently changed.

References: docs/09 story/media separation; docs/11 layers, scope precedence, runtime/build agreement; docs/research/choreographic-admin-reference.md storyboard + real-renderer preview; docs/10 prior motion, overflow, storage, and focus regressions.

Decisions: separate admin workspace with same-origin iframe of actual app; scene variants and modal pages are separate; per-scene/per-viewport layer editing; preset motion scrubbing (no arbitrary keyframe editor); local loopback server owns drafts/revisions/assets and publishing to local distribution. Admin assets live outside dist. Localhost is a trusted single-user development boundary; public static deployment has no editor or writing API. Remote authenticated deployment is an adapter requirement, not an unprotected hidden URL.

Layer contract: cover global, paper, word, crosshairs, years, stage, shadow, character, header, copy, stamp, disciplines, bottom, ticker, footer, sheet, about, cards plus work/contact/detail surfaces. Manifest declares visibility/opacity, image/text, position/scale/rotation, color/typography, motion/inputs as applicable. Responsive and scene defaults move out of app logic. Remaining layout scaffolding (grid/flex, clipping, a11y minimums) is explicitly fixed. Add manifest lint, generated asset freshness, runtime parameter probes and existing 92 browser regressions.

G1 PASS: scope, layer contract, outputs and nodes recorded. G2 PASS: design/security/final review stay primary. G3 PASS: frontend/security/review domains. G4 PASS: powerful exception is required for cross-layer architecture, admin boundary and final review. G5 PASS: reversible local work; no external deployment.

## Complete

Final design: docs/12-Scene-Studio-관리자-설계.md. First consumer and reusable runtime delivered. 20 layers / 619 parameters; lint 0 errors, renderer probe 619/619 (148 conditional). Browser QA 140 passed (92 portfolio + 48 editor). pnpm check passed with existing unrelated dawn-store umbrella graph warning. Editor auth, stale revisions, safe publishing, HTML baking and version restoration verified in disposable fixtures. Desktop/mobile screenshots and limitations in Potato QA.md. Local editor runs on 4176/admin. No external deployment or other-app migration performed.
