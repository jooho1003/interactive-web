// Run the dawn-store build first. This copies its validated snapshot without changing its source.
import { cp, readFile, writeFile, readdir, mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = resolve(root, '../dawn-store/app/dist');
const target = resolve(root, 'public/experiences/dawn-store');
await mkdir(target, {recursive:true});
await cp(source, target, {recursive:true});
const prefix='/experiences/dawn-store';
async function rewrite(folder) {
  for (const file of await readdir(folder,{withFileTypes:true})) {
    const path=resolve(folder,file.name);
    if(file.isDirectory()) {await rewrite(path);continue;}
    if(!/\.(html|json|js|css)$/.test(file.name)) continue;
    let content=await readFile(path,'utf8');
    content=content.replace(/(["'`])\/(assets\/|media\/|audio\/|story\.json|theme\.json|favicon\.svg)/g,(_,quote,part)=>quote+prefix+'/'+part);
    await writeFile(path,content);
  }
}
await rewrite(target);
const htmlPath=resolve(target,'index.html');
const html=await readFile(htmlPath,'utf8');
await writeFile(resolve(target,'play.html'),html);
await writeFile(htmlPath, `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>새벽 세 시 · Still Open</title><style>*{box-sizing:border-box}body{margin:0;background:#0d1011;color:#ddc9a9;font:14px system-ui}.experience-return{height:44px;display:flex;align-items:center;justify-content:space-between;padding:0 16px}.experience-return a{color:inherit;text-decoration:none}.experience-return a:focus-visible{outline:2px solid #edca94;outline-offset:4px}.experience-return span{font-size:12px}iframe{display:block;width:100%;height:calc(100svh - 44px);border:0}</style></head><body><header class="experience-return"><a href="../../">← 전시실로 돌아가기</a><span>새벽 세 시 · Still Open</span></header><iframe title="새벽 세 시 인터랙티브 작품" src="./play.html" allow="autoplay; fullscreen"></iframe></body></html>`);
console.log('Included validated dawn-store snapshot and scoped asset URLs.');
