import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { compileCSS, validateValues, resolve } from '../../../packages/layer-kit/src/index.js';
const readText = async path => (await readFile(path, 'utf8')).replace(/\r\n/g, '\n');
export async function buildLayers({ dir = new URL('../dist/', import.meta.url), check = false } = {}) {
  const manifestSource = await readText(new URL('layers.manifest.js', dir));
  const manifest = JSON.parse(manifestSource.replace(/^export default /, '').replace(/;\s*$/, ''));
  const values = JSON.parse(await readText(new URL('layers.values.json', dir)));
  const validated = validateValues(manifest, values);
  if (validated.errors.length) throw new Error(validated.errors.join('\n'));
  const kit = await readText(new URL('../../../packages/layer-kit/src/index.js', import.meta.url));
  const outputs = { 'layers.css': compileCSS(manifest, values), 'layers.values.js': `export default ${JSON.stringify(values)};\n`, 'vendor/layer-kit/index.js': kit };
  outputs['vendor/layer-kit/probe.js'] = await readText(new URL('../../../packages/layer-kit/src/probe.js', import.meta.url));
  const initial = resolve(manifest, values, manifest.initialScene);
  const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
  let html = await readText(new URL('index.html', dir));
  html = html.replace(/<html([^>]*)>/, (_, attrs) => `<html${attrs.replace(/ data-layer-scene="[^"]*"/, '')} data-layer-scene="${manifest.initialScene}">`);
  for (const layer of manifest.layers) for (const [key, param] of Object.entries(layer.params)) {
    const marker = `${layer.id}/${key}`;
    if (param.text) {
      const pattern = new RegExp(`(<([a-z0-9]+)\\b[^>]*data-layer-text="${marker}"[^>]*>)[\\s\\S]*?(<\\/\\2>)`);
      if (!pattern.test(html)) throw new Error(`HTML text binding missing: ${marker}`);
      html = html.replace(pattern, (_, open, tag, close) => open + escape(initial[layer.id][key]) + close);
    } else if (param.attr && param.type === 'image') {
      const pattern = new RegExp(`<img\\b[^>]*data-layer-image="${marker}"[^>]*>`);
      if (!pattern.test(html)) throw new Error(`HTML image binding missing: ${marker}`);
      html = html.replace(pattern, tag => tag.replace(/src="[^"]*"/, `src="${escape(initial[layer.id][key])}"`));
    }
  }
  outputs['index.html'] = html;
  for (const [name, content] of Object.entries(outputs)) {
    const path = new URL(name, dir);
    if (check) { if (await readText(path).catch(() => '') !== content) throw new Error(`레이어 생성물 갱신 필요: ${name}`); }
    else { await mkdir(new URL('./', path), { recursive: true }); await writeFile(path, content); }
  }
  return { manifest, values, hash: createHash('sha256').update(manifestSource + JSON.stringify(values)).digest('hex') };
}
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  await buildLayers({ check: process.argv.includes('--check') });
  console.log('Layer assets are current.');
}
