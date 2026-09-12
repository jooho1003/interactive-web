import { readFile, stat, readdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../dist');
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
for (const match of html.matchAll(/(?:src|href)="(\.\/[^"#]+)"/g)) assert.ok((await stat(resolve(root, match[1]))).isFile(), match[1]);
const hosting = JSON.parse(await readFile(resolve(root, '../.openai/hosting.json'), 'utf8'));
assert.equal(hosting.static.directory, 'dist');
const { relativeSlot } = await import(pathToFileURL(resolve(root, 'gallery-layout.js')));
assert.equal(relativeSlot(0, 0, 0), 99);
for (const count of [1, 2, 3, 4, 5, 6]) {
  for (let selected = 0; selected < count; selected++) {
    const slots = Array.from({length: count}, (_, index) => relativeSlot(index, selected, count));
    assert.equal(slots[selected], 0, 'selected work is centered');
    assert.equal(new Set(slots).size, count, 'filtered works cannot overlap');
    assert.equal(slots.filter(slot => Math.abs(slot) <= 1).length, Math.min(3, count));
  }
}
const css = await readFile(resolve(root, 'style.css'), 'utf8');
for (const match of css.matchAll(/url\(['"]?(\.\/[^)'"\s]+)['"]?\)/g)) assert.ok((await stat(resolve(root, match[1]))).isFile(), match[1]);
assert.equal([...html.matchAll(/id="([^"]+)"/g)].length, new Set([...html.matchAll(/id="([^"]+)"/g)].map(m => m[1])).size, 'unique element IDs');
console.log(`PASS: ${projects.length} projects, source syntax, imports, local assets, CSS assets, gallery wrapping/filter layout, unique IDs, and static hosting manifest.`);
