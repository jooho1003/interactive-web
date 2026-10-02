import { queue, download } from './fal.mjs';
import { writeFile } from 'node:fs/promises';
const image_url = process.argv[2]; // 정면 컷(배경 제거 전 원본)의 fal URL
const prompt = 'Static camera, plain backdrop, the painted Korean Joseon queen in green dangui keeps her body, shoulders, hands and headdress perfectly still. Only her head and eyes move, slowly and smoothly, like she is following something near the viewer. No zoom, no camera motion, no other people, consistent lighting. Sequence: she turns her head and eyes to look to her left, returns to center, turns to look to her right, returns to center, then looks up, returns to center, then looks down, and returns to center.';
const input = { image_url, prompt, duration: '10', negative_prompt: 'blur, distortion, extra people, camera movement, zoom, text, watermark, hands moving', cfg_scale: 0.5 };
const out = await queue('fal-ai/kling-video/v2.1/standard/image-to-video', input, { every: 8000, max: 900000 });
await download(out.video.url, 'head-turn.mp4');
await writeFile('video-job.json', JSON.stringify({ model: 'fal-ai/kling-video/v2.1/standard/image-to-video', input, url: out.video.url }, null, 2));
console.log('fulfilled', out.video.url);
