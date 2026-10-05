// Usage: node scripts/include-experience.mjs <id>
import { cp, readFile, writeFile, readdir, mkdir, stat } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const experiences = {
  'potato-designer': {source:'../potato-designer/dist',title:'POTATO · Designer in Motion',frameLabel:'POTATO 인터랙티브 디자인 포트폴리오',cover:'assets/character.png',coverTarget:'potato.png'},
  'dawn-store': {
    source: '../dawn-store/app/dist',
    title: '새벽 세 시 · Still Open',
    frameLabel: '새벽 세 시 인터랙티브 작품',
  },
  'day-walk': {
    source: '../day-walk/app/dist',
    title: '하루 산책 · Day Walk',
    frameLabel: '하루 산책 루틴 앱',
  },
  'hanbok-hero': {
    source: '../hanbok-hero/dist',
    title: '선비 · 한복 히어로',
    frameLabel: '시·서·화를 고르면 분위기가 바뀌는 선비 첫 화면',
  },
};
const id = process.argv[2];
const experience = experiences[id];
if (!experience) {
  console.error(`Unknown experience id: ${id || '(missing)'}. Available: ${Object.keys(experiences).join(', ')}`);
  process.exit(1);
}
const source = resolve(root, experience.source);
try {
  if (!(await stat(source)).isDirectory()) throw new Error('not a directory');
} catch {
  console.error(`Experience source is missing: ${source}`);
  process.exit(1);
}
const target = resolve(root, `public/experiences/${id}`);
await mkdir(target, { recursive: true });
await cp(source, target, { recursive: true });
if(experience.cover)await cp(resolve(source,experience.cover),resolve(root,'public/assets',experience.coverTarget));
const prefix = `/experiences/${id}`;
async function rewrite(folder) {
  for (const file of await readdir(folder, { withFileTypes: true })) {
    const path = resolve(folder, file.name);
    if (file.isDirectory()) { await rewrite(path); continue; }
    if (!/\.(html|json|js|css)$/.test(file.name)) continue;
    let content = await readFile(path, 'utf8');
    content = content.replace(/(["'`])\/(assets\/|media\/|audio\/|story\.json|theme\.json|favicon\.svg)/g, (_, quote, part) => quote + prefix + '/' + part);
    await writeFile(path, content);
  }
}
await rewrite(target);
const htmlPath = resolve(target, 'index.html');
const html = await readFile(htmlPath, 'utf8');
await writeFile(resolve(target, 'play.html'), html);
await writeFile(htmlPath, `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${experience.title}</title><style>*{box-sizing:border-box}body{margin:0;background:#0d1011;color:#ddc9a9;font:14px system-ui}.experience-return{height:44px;display:flex;align-items:center;justify-content:space-between;padding:0 16px}.experience-return a{color:inherit;text-decoration:none}.experience-return a:focus-visible{outline:2px solid #edca94;outline-offset:4px}.experience-return span{font-size:12px}iframe{display:block;width:100%;height:calc(100svh - 44px);border:0}</style></head><body><header class="experience-return"><a href="../../">← 전시실로 돌아가기</a><span>${experience.title}</span></header><script>try{if(sessionStorage.getItem('jooho-lab-return-page-v1')==='village.html'){const link=document.querySelector('.experience-return a');link.href='../../village.html';link.textContent='← 작업 동네로 돌아가기'}}catch{}</script><iframe title="${experience.frameLabel}" src="./play.html" allow="autoplay; fullscreen"></iframe></body></html>`);
console.log(`Included ${id} snapshot and scoped asset URLs.`);
