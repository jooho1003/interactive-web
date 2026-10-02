import { run, download, upload } from './fal.mjs';
const list = process.argv.slice(2);
await Promise.all(list.map(async n => {
  const src = `fr-seq10/f-${String(n).padStart(3,'0')}.png`, dst = `alpha/f-${String(n).padStart(3,'0')}.png`;
  const url = await upload(src);
  const out = await run('fal-ai/birefnet/v2', { image_url: url, model: 'General Use (Heavy)', operating_resolution: '2048x2048', output_format: 'png', refine_foreground: true });
  await download(out.image.url, dst); console.log('ok', n, out.image.width, out.image.height);
}));
