import { run, download, upload } from './fal.mjs';
const [dir, outdir, ...list] = process.argv.slice(2);
for (const chunk of [list.slice(0,5), list.slice(5)]) await Promise.all(chunk.map(async n => {
  const f = `f-${String(n).padStart(3,'0')}.png`;
  const url = await upload(`${dir}/${f}`);
  const out = await run('fal-ai/birefnet/v2', { image_url: url, model: 'General Use (Heavy)', operating_resolution: '2048x2048', output_format: 'png', refine_foreground: true });
  await download(out.image.url, `${outdir}/${f}`); console.log('ok', n);
})); console.log("chunk done");
