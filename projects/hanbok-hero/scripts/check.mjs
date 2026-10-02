import { readFile, access, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
const root = new URL('../dist/', import.meta.url);
const html = await readFile(new URL('index.html', root), 'utf8');
const refs = [...html.matchAll(/(?:src|href)="\.\/([^"#]+)"/g)].map(match => match[1]);
for (const file of new Set(refs)) await access(new URL(file, root));
for (const file of (await readdir(root)).filter(name => name.endsWith('.js'))) {
  const syntax = spawnSync(process.execPath, ['--check', fileURLToPath(new URL(file, root))], { encoding: 'utf8' });
  if (syntax.status !== 0) throw new Error(syntax.stderr);
}
for (const file of ['studio.js', 'bridge.js']) {
  const syntax = spawnSync(process.execPath, ['--check', fileURLToPath(new URL('../admin/' + file, import.meta.url))], { encoding: 'utf8' });
  if (syntax.status !== 0) throw new Error(syntax.stderr);
}
for (const marker of ['class="gaze-range"', 'class="character-still"', 'sheet-frame sheet-a', 'class="character-sheet"', 'class="hint-pointer"', 'class="hint-touch"']) {
  if (!html.includes(marker)) throw new Error('Missing element: ' + marker);
}
console.log(`PASS: entrypoint, ${new Set(refs).size} local assets, syntax, required elements.`);
