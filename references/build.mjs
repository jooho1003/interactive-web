// references/*.md → catalog.json + gallery.html
// 원본은 마크다운이다. 이 스크립트가 만든 두 파일은 직접 고치지 않는다.
//   node references/build.mjs            생성
//   node references/build.mjs --check    카드 규칙과 생성물 최신 여부 확인 (아니면 exit 1)
//   node references/build.mjs --site DIR claude.ai 게시용 index.html과 media/ 복사본을 DIR에 만든다
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { splitDoc } from '../tools/md-blocks.mjs';
import { parseSiteDoc, parsePatterns, validate, toCatalog } from './model.mjs';
import { renderPage, HEAD, STYLE } from './gallery.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '..');
const argv = process.argv.slice(2);
const checkOnly = argv.includes('--check');
const siteAt = argv.indexOf('--site');
const siteDir = siteAt >= 0 ? path.resolve(argv[siteAt + 1] ?? '') : null;
if (siteAt >= 0 && (!argv[siteAt + 1] || argv[siteAt + 1].startsWith('--'))) { console.error('references: --site 뒤에 출력 폴더를 적으세요.'); process.exit(1); }

const read = (file) => fs.readFileSync(path.join(HERE, file), 'utf8');
const siteFiles = fs.readdirSync(HERE).filter((f) => f.endsWith('.md') && f !== 'README.md' && f !== 'patterns.md').sort();

const pat = parsePatterns('patterns.md', read('patterns.md'));
const docs = siteFiles.map((file) => ({ file, ...parseSiteDoc(file, read(file)) }));
const sites = docs.flatMap((d) => d.sites);
const errors = [
  ...pat.errors,
  ...docs.flatMap((d) => d.errors),
  ...validate(sites, pat.patterns, (rel) => fs.existsSync(path.join(HERE, ...rel.split('/')))),
];
if (errors.length) {
  console.error(`references: 카드 규칙 오류 ${errors.length}개\n${errors.map((e) => `  - ${e}`).join('\n')}`);
  process.exit(1);
}

const model = { readme: splitDoc(read('README.md').replace(/\r\n/g, '\n')), patternDoc: pat.doc, docs, sites, patterns: pat.patterns };
const catalog = toCatalog(sites, pat.patterns, [...siteFiles, 'patterns.md']);
const local = renderPage(model, { mode: 'local', root: HERE });
const html = `<!doctype html>\n<html lang="ko">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n${HEAD}\n${STYLE}\n</head>\n<body>\n${local.body}\n</body>\n</html>\n`;
const json = `${JSON.stringify(catalog, null, 2)}\n`;
const outputs = [[path.join(HERE, 'gallery.html'), html], [path.join(HERE, 'catalog.json'), json]];

if (checkOnly) {
  const stale = outputs.filter(([file, text]) => !fs.existsSync(file) || fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n') !== text.replace(/\r\n/g, '\n'));
  if (stale.length) {
    console.error(`references: 생성물이 오래됐습니다 — ${stale.map(([f]) => path.relative(REPO, f)).join(', ')}\n  pnpm references:build 로 다시 만드세요.`);
    process.exit(1);
  }
  console.log('references: 카드 규칙 통과, 생성물 최신');
} else {
  for (const [file, text] of outputs) fs.writeFileSync(file, text);
  console.log(`references: 사이트 ${sites.length}곳 · 패턴 ${pat.patterns.length}개 → gallery.html, catalog.json`);
}

if (siteDir) {
  const site = renderPage(model, { mode: 'site', root: HERE });
  fs.mkdirSync(siteDir, { recursive: true });
  fs.writeFileSync(path.join(siteDir, 'index.html'), `${HEAD}\n${STYLE}\n${site.body}\n`);
  for (const [published, abs] of site.files) {
    const dest = path.join(siteDir, ...published.split('/'));
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(abs, dest);
  }
  fs.writeFileSync(path.join(siteDir, 'files.json'), JSON.stringify([...site.files.keys()], null, 2));
  console.log(`site: ${siteDir} (${site.files.size}개 미디어)`);
}
