# Morning, golden afternoon and matching bird · 2026-09-15

Mode: built-in `image_gen` (no CLI/API fallback).

## Final application assets

- Morning: `public/media/day-walk-daylight-v3.webp`, reused clear-day background.
- Afternoon: `public/media/day-walk-afternoon-v4.webp`, generated lighting variant, encoded WebP quality 90 without color filters.
- Evening: `public/media/day-walk-evening-v3.webp`, retained luminous early evening.
- Bird: `public/media/day-walk-bird-v3.webp`, generated two-frame sprite strip, encoded losslessly. The tool produced RGB, so the final green matte is removed at rendering time by a local SVG alpha matrix; no external service is used.
- Archived original backdrop: `.claude/asset-history/day-walk-neighborhood-v2.webp`.

## Afternoon prompt

Use case: lighting-weather. Edit target: attached neighborhood daylight background. This is a pixel-aligned lighting variant for a web app crossfade. Preserve the EXACT 1672x941 landscape framing, every roof, facade, fence, bicycle, tree, cloud shape, road, wire and window at the same positions. Do not crop, zoom, shift perspective, repaint architecture or add objects/text/UI. Change ONLY lighting and sky colors across the ENTIRE scene. Make it a beautiful late-afternoon golden-hour neighborhood, sun gradually setting: luminous peach and soft apricot sky near the horizon, pale warm blue higher up, soft amber edges on clouds and treetops, long gentle shadows, warm sunlit facades, readable natural green foliage. Calm and inviting, softly glowing, not dark or purple, no saturated orange filter or sepia wash, no visible sun disc. Windows mostly daylight reflections, subtle warmth inside at most. Same premium stylized 3D animated-film rendering. Output one landscape background.

## Bird design prompt

Use case: stylized-concept. Asset type: transparent two-frame horizontal sprite strip for a small bird companion in a polished 3D animated-film neighborhood web app. The attached neighborhood and girl are STYLE references only; DO NOT include girl, buildings, scenery, green background, text or UI in the output. Create one charming believable small songbird with soft slate-blue back and wings, warm ivory breast, tiny muted amber beak, dark glossy SMALL eyes, detailed soft layered feathers, warm sunlight on top and neutral soft fill. Rounded but proportionate, same high quality dimensional animated-film rendering as the references, not flat vector, not emoji, not a plastic toy, no white sticker outline. True transparent RGBA background, no checkerboard drawn, no floor or cast ground shadow. Output a 2:1 horizontal sprite sheet consisting of TWO equal square cells side by side, no borders or labels. Both cells show the SAME bird in right-facing three-quarter side view, tail left beak right, body level and flying, tiny feet tucked. Body, eye, beak and tail position and scale exactly identical relative to each cell. Cell 1: wings lifted upward in an elegant half-open upstroke. Cell 2: wings angled down in a gentle downstroke. Frame subject centered with generous transparent padding; wings and tail fully visible within own cell, no overlaps. Bird body occupies about 45 percent of each cell width, total bird silhouette about 78 percent. This sheet will animate as two frames at small size.

## Final bird matte prompt

Use case: precise-object-edit. Edit target: this exact two-frame bird sprite strip. Replace ONLY the entire checkerboard background with perfectly solid flat chroma-key GREEN RGB(0,255,0), hex #00FF00, including every gap between feather tips, tail and feet. It must be a single uniform green without any checkers, patterns, gradients, glow, texture, shadows, or floor. Preserve BOTH birds exactly in their two cells: identical positions, scale, feathers, colors and lighting. No green tint or spill on birds. Preserve exact 1774x887 canvas, no crop. This is a production chroma-key sprite sheet; the app will remove the solid green at rendering time. Two birds only, each fully within its original half, no text.

The initial transparency request and a background-extraction retry returned painted checkerboards in RGB. Those unselected variants remain in the default generated-images directory, and are not used in the app.

