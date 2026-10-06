import { readFile, access, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
const root = new URL('../dist/', import.meta.url);
const html = await readFile(new URL('index.html', root), 'utf8');
const refs = [...html.matchAll(/(?:src|href)="\.\/([^"#]+)"/g)].map(match => match[1]);
for (const file of new Set(refs)) await access(new URL(file, root));
const scripts = [...(await readdir(root)).filter(name => name.endsWith('.js')).map(name => new URL(name, root)), ...['studio.js', 'bridge.js'].map(name => new URL('../admin/' + name, import.meta.url))];
for (const file of scripts) {
  const syntax = spawnSync(process.execPath, ['--check', fileURLToPath(file)], { encoding: 'utf8' });
  if (syntax.status !== 0) throw new Error(syntax.stderr);
}
for (const marker of ['class="intro"', 'class="strip"', 'class="strip-empty"', 'class="note"', 'class="viewer"', 'class="viewer-stage"', 'data-device="desktop"', 'data-device="mobile"']) {
  if (!html.includes(marker)) throw new Error('Missing element: ' + marker);
}
// 상세페이지 목록(콘텐츠)과 공개 스냅숏: 캡처·그림 파일이 있고, 로컬 편집기 링크·내장 그림·스크립트가 없어야 한다.
const { default: pages } = await import(new URL('pages.js', root));
const config = JSON.parse(await readFile(new URL('../pages.config.json', import.meta.url), 'utf8'));
if (pages.map(page => page.slug).join() !== config.pages.map(page => page.slug).join()) throw new Error('pages.js가 pages.config.json과 다릅니다. scripts/sync-pages.py를 다시 실행하세요.');
for (const page of pages) {
  await access(new URL(page.preview, root));
  const snapshot = await readFile(new URL(page.href + 'index.html', root), 'utf8');
  for (const banned of ['localhost', 'data:image', '<script']) if (snapshot.includes(banned)) throw new Error(`${page.slug}: 공개 스냅숏에 ${banned}`);
  for (const media of snapshot.matchAll(/src="\.\/(media\/[^"]+)"/g)) await access(new URL(page.href + media[1], root));
}
await access(new URL('assets/cover.webp', root));
console.log(`PASS: entrypoint, ${new Set(refs).size} local assets, syntax, required elements, ${pages.length} detail page snapshots.`);
