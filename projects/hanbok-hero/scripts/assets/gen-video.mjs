import { queue, download } from './fal.mjs';
import { writeFile } from 'node:fs/promises';
const image_url = 'https://v3b.fal.media/files/b/0aacc5b1/srpnZIwp3Rdtukz79T5uJ_c1199255edd242bab8a09c12a7254a4e.png';
const base = 'Static camera, plain light gray studio backdrop, the woman in hanbok keeps her body, shoulders and hands perfectly still. Only her head and eyes move, slowly and smoothly, like she is following something near the viewer. No zoom, no camera motion, no other people, consistent lighting.';
const jobs = {
  seq10: { model: 'fal-ai/kling-video/v2.1/standard/image-to-video', input: { image_url, prompt: base + ' Sequence: she turns her head and eyes to look to her left, returns to center, turns to look to her right, returns to center, then looks up, returns to center, then looks down, and returns to center.', duration: '10', negative_prompt: 'blur, distortion, extra people, camera movement, zoom, text, watermark', cfg_scale: 0.5 } },
  lr5: { model: 'fal-ai/kling-video/v2.1/standard/image-to-video', input: { image_url, prompt: base + ' She slowly turns her head and eyes from looking to her left, through center, to looking to her right.', duration: '5', negative_prompt: 'blur, distortion, extra people, camera movement, zoom, text, watermark', cfg_scale: 0.5 } },
};
const results = await Promise.allSettled(Object.entries(jobs).map(async ([name, j]) => {
  const out = await queue(j.model, j.input, { every: 8000, max: 900000 });
  const url = out.video?.url; await download(url, `${name}.mp4`); return { name, url, out };
}));
for (const r of results) console.log(r.status, r.status === 'fulfilled' ? r.value.name + ' ' + r.value.url : String(r.reason).slice(0, 400));
await writeFile('video-jobs.json', JSON.stringify({ jobs, results: results.map(r => r.status === 'fulfilled' ? r.value : String(r.reason)) }, null, 2));
