# Spatial LAB — Report

Date: 2026-10-01. Status: first connected demo implemented and verified.

Plan/Design: approved Blender + Three.js architectural path; preserve registry, content, links and editor. Do: Blender .blend/GLB, baked/denoised lighting, fal landscape, camera runtime, controls, layer settings. Check: Aside desktop/mobile, route sampling, layer lint and binding probes, existing validator/build. Act: fixed frame-rate-dependent travel, noisy bake, poster initialization, editor self-hiding, fallback reentry and empty-state control synchronization.

See [QA](../../QA-spatial.md) for exact evidence and limitations. Preview: http://127.0.0.1:8879/. No deployment or Tripo provisioning. Blender source and generation scripts are retained; fal credential remains environment-only.

## Follow-up: scroll interaction and camera refinement
Applied the user's requested wheel/drag sequence, direct lateral exhibit travel, full image fitting and typography replacement. Used bkit Plan/Design amendments ? implementation ? deterministic and Aside Check ? report. Review caught Escape moving the camera while releasing controls and a vh/container mismatch on short screens; both corrected. Font is local SUIT Variable with its OFL license. No deployment in this follow-up; preview/build updated.

## Correction completed: continuous drag and real project screenshots

Default wheel follows the ordered tour; drag mode continuously orbits while held and restores native wheel scrolling. Seven representative screenshots replace the old default covers and text posters. Added drag cancellation, bounded-orbit framing and image coverage assertions. Aside: desktop 103, mobile 104, short mobile 104 assertions passed; real mouse capture/reversal/release also verified. All 40 layer bindings and 77,077 route samples passed. App build and root check passed after restoring locked dependencies. Local prompt/reference archives and same-address upload packages are current; remote archive file replacement is unavailable in this session. See QA for environment and screenshot limitations.

## Slower focused approach

Moved the artwork viewing aisle to 2.4m and extended the approach to 4.2s. Artwork switches slide laterally in 1.8s without changing depth or magnification. Actual image bounds replace backboard bounds when fitting the focused frame. Approach/slide duration are editable stage parameters. Verification: Aside 108/109/109 assertions, 42 layer bindings, route sampling, app validation and build passed; details in QA. No new assets or deployment.
