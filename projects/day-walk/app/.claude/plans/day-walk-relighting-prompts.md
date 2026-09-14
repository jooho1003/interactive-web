# Day Walk relighting — built-in image_gen

Source / edit target: `public/media/day-walk-neighborhood-v2.webp`.
Output paths: `public/media/day-walk-daylight-v3.webp`, `public/media/day-walk-evening-v3.webp`.
Generated PNG files were encoded to WebP with FFmpeg quality 90, with no resizing or color filters.

## Shared prompt prefix

Use case: lighting-weather. Edit target: the attached neighborhood background. This is one frame for a web-app lighting crossfade: preserve the exact original 1672x941 aspect ratio and pixel-aligned framing, every roof outline, building, window, fence, tree, power line, road, bicycle and horizon at exactly the same positions and shapes. Do not repaint, crop, zoom, add/remove architecture or add text/UI. Only relight existing materials and sky. Premium stylized 3D animated-film rendering.

## Day suffix

Make the ENTIRE street from left to right a natural clear early-afternoon daylight version. Soft pale blue sky, bright readable buildings with gentle warm sunlight and natural shadows. No visible moon or stars, no dark blue right side. Indoor windows naturally reflect daylight. Preserve the original tree and cloud shapes. Output a single landscape image, no collage.

## Evening suffix

Make the ENTIRE street a natural luminous early-evening blue-hour version. Soft lavender-blue sky after sunset, warm glowing windows and street lamps, readable colorful facades, detailed softly lit foliage and road. Light cinematic exposure, gentle ambient skylight, NOT a dark night and NOT an indigo or black overlay. Remove the glaring left sun disc, keep faint crescent on the right. Preserve cloud silhouettes. Output a single landscape image, no collage.
