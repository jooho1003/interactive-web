import { readFile, stat, readdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../public');
const { projects, profile } = await import(pathToFileURL(resolve(root, 'projects.js')));
assert.ok(profile.name && profile.introduction);
assert.ok(projects.length > 0);
assert.equal(new Set(projects.map((p) => p.id)).size, projects.length);
for (const p of projects) {
  for (const field of ['id', 'title', 'subtitle', 'category', 'description', 'url', 'linkLabel']) assert.ok(typeof p[field] === 'string' && p[field].trim(), `${p.id}: ${field}`);
  assert.equal(new URL(p.url).protocol, 'https:');
  assert.match(p.color, /^#[0-9a-f]{6}$/i);
  assert.ok(p.details.length > 0 && p.tags.length > 0);
  if (p.image) assert.ok((await stat(resolve(root, p.image))).size > 0);
}
for (const file of await readdir(root)) {
  if (!file.endsWith('.js')) continue;
  const path = resolve(root, file);
  const result = spawnSync(process.execPath, ['--check', path], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  const text = await readFile(path, 'utf8');
  for (const match of text.matchAll(/(?:from\s+|import\()['"](\.\/[^'"]+)['"]/g)) assert.ok((await stat(resolve(root, match[1]))).isFile(), `${file}: ${match[1]}`);
}
const html = await readFile(resolve(root, 'index.html'), 'utf8');
const { projectHref, detailHref } = await import(pathToFileURL(resolve(root, 'navigation.js')));
for (const project of projects) {
  for (const href of [projectHref(project), detailHref(project)]) {
    if (href.startsWith('./')) {
      let path = resolve(root, href.split('?')[0]);
      if ((await stat(path)).isDirectory()) path = resolve(path, 'index.html');
      assert.ok((await stat(path)).isFile(), href);
    } else assert.equal(new URL(href).protocol, 'https:');
  }
}
for (const file of ['project.html']) {
  const markup = await readFile(resolve(root,file),'utf8');
  for (const match of markup.matchAll(/(?:src|href)="(\.\/[^"#]+)"/g)) { let p=resolve(root,match[1].split('?')[0]); if((await stat(p)).isDirectory())p=resolve(p,'index.html');assert.ok((await stat(p)).isFile(),match[1]); }
}
function assetPaths(value) {
  if (value && typeof value === 'object' && value.available === false) return [];
  if (typeof value === 'string') return value.startsWith('/experiences/') ? [value] : [];
  return value && typeof value === 'object' ? Object.values(value).flatMap(assetPaths) : [];
}
for (const file of ['story.json','theme.json']) {
  const data = JSON.parse(await readFile(resolve(root,'experiences/dawn-store',file),'utf8'));
  for (const asset of assetPaths(data)) assert.ok((await stat(resolve(root,'.'+asset))).isFile(),asset);
}
for (const match of html.matchAll(/(?:src|href)="(\.\/[^"#]+)"/g)) assert.ok((await stat(resolve(root, match[1]))).isFile(), match[1]);
const hosting = JSON.parse(await readFile(resolve(root, '../.openai/hosting.json'), 'utf8'));
assert.equal(hosting.r2, 'MEDIA');assert.equal(hosting.static,undefined);
const { cleanPreferences } = await import(pathToFileURL(resolve(root,'preferences.js')));
assert.equal(cleanPreferences({scale:99}).scale,1.2);
assert.equal(cleanPreferences({zoom:-1}).zoom,.85);
assert.equal(cleanPreferences({view:'bad'}).view,'space');
assert.throws(()=>cleanPreferences({links:{sasu:'javascript:alert(1)'}}));
assert.throws(()=>cleanPreferences({links:{sasu:'https://user:pass@example.com/'}}));
assert.equal(cleanPreferences({links:{sasu:'https://example.com/'}}).links.sasu,'https://example.com/');
assert.equal((await readFile(resolve(root,'assets/PretendardVariable.woff2'))).subarray(0,4).toString(),'wOF2');
const css = await readFile(resolve(root, 'style.css'), 'utf8');
for (const match of css.matchAll(/url\(['"]?(\.\/[^)'"\s]+)['"]?\)/g)) assert.ok((await stat(resolve(root, match[1]))).isFile(), match[1]);
assert.equal([...html.matchAll(/id="([^"]+)"/g)].length, new Set([...html.matchAll(/id="([^"]+)"/g)].map(m => m[1])).size, 'unique element IDs');
console.log(`PASS: ${projects.length} projects, source syntax, imports, local assets, CSS assets, preferences bounds/safe links/font file, unique IDs, and static hosting manifest.`);
