import { run, download } from './fal.mjs';
const [src, dst, model = 'fal-ai/birefnet/v2'] = process.argv.slice(2);
const out = await run(model, { image_url: src, model: 'General Use (Heavy)', operating_resolution: '2048x2048', output_format: 'png', refine_foreground: true });
const img = out.image; console.log(model, img?.width, img?.height, img?.url); await download(img.url, dst);
