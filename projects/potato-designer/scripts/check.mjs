import { readFile, access, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
const root = new URL('../dist/', import.meta.url);
const html = await readFile(new URL('index.html', root), 'utf8');
const refs = [...html.matchAll(/(?:src|href)="\.\/([^"#]+)"/g)].map(match => match[1]);
for (const file of new Set(refs)) await access(new URL(file, root));
for (const file of (await readdir(root)).filter(name => name.endsWith('.js'))) {
  const url = new URL(file, root);
  const syntax = spawnSync(process.execPath, ['--check', fileURLToPath(url)], { encoding: 'utf8' });
  if (syntax.status !== 0) throw new Error(syntax.stderr);
  const source = await readFile(url, 'utf8');
  for (const match of source.matchAll(/(?:from\s+['"]|src=")\.\/([^'"\s]+)['"]/g)) await access(new URL(match[1], url));
}
for (const id of ['work-dialog', 'about-dialog', 'contact-dialog']) {
  if (!html.includes(`id="${id}"`)) throw new Error(`Missing dialog: ${id}`);
}
for (const file of ['studio.js','bridge.js']) {
  const syntax=spawnSync(process.execPath,['--check',fileURLToPath(new URL('../admin/'+file,import.meta.url))],{encoding:'utf8'});
  if(syntax.status!==0)throw new Error(syntax.stderr);
}
console.log(`PASS: entrypoint, ${new Set(refs).size} local assets, interaction syntax and dialog targets.`);
