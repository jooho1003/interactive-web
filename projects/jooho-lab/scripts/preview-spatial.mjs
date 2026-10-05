import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {layerPersistence} from './layer-persistence.mjs';
const root=resolve('public');
const layers=layerPersistence(resolve(root,'layers.values.json'));
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.css':'text/css','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp','.woff2':'font/woff2','.glb':'model/gltf-binary','.svg':'image/svg+xml'};
createServer(async(req,res)=>{try{
  const url=new URL(req.url,'http://localhost');
  if(url.pathname==='/api/layers'){await layers(req,res);return;}
  if(url.pathname==='/__qa/mobile'){res.setHeader('Content-Type','text/html');res.end('<html><body style="margin:0;background:#222"><iframe title="390px mobile QA" src="/?qa=mobile" style="width:390px;height:844px;border:0"></iframe></body></html>');return;}
  if(url.pathname==='/__qa/run.js'){res.setHeader('Content-Type','text/javascript');res.end(await readFile('scripts/spatial-browser-qa.js'));return;}
  if(url.pathname==='/__qa/village-run.js'){res.setHeader('Content-Type','text/javascript');res.end(await readFile('scripts/village-browser-qa.js'));return;}
  if(url.pathname==='/__qa/layer-probe.js'){res.setHeader('Content-Type','text/javascript');res.end((await readFile('../../packages/layer-kit/src/probe.js','utf8')).replace("'./index.js'","'/vendor/layer-kit/index.js'").replace("sheet.href?.endsWith('/style.css')","sheet.href?.endsWith('/village.css')"));return;}
  if(url.pathname==='/__qa/village-mobile'){res.setHeader('Content-Type','text/html');const height=url.searchParams.get('short')==='1'?600:844;res.end(`<html><body style="margin:0;background:#222"><iframe title="390px village QA" src="/village.html?qa=mobile" style="width:390px;height:${height}px;border:0"></iframe></body></html>`);return;}
  if(url.pathname==='/api/content'){res.setHeader('Content-Type','application/json');res.end(JSON.stringify({canEdit:false,content:{},revision:null}));return;}
  let file=resolve(root,'.'+decodeURIComponent(url.pathname));if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end();return;}
  if((await stat(file)).isDirectory())file=resolve(file,'index.html');
  let body=await readFile(file);if(file===resolve(root,'index.html')&&url.searchParams.has('qa'))body=Buffer.from(body.toString().replace('</body>','<script type="module" src="/__qa/run.js"></script></body>'));
  if(file===resolve(root,'village.html')&&url.searchParams.has('qa'))body=Buffer.from(body.toString().replace('</body>','<script type="module" src="/__qa/village-run.js"></script></body>'));
  res.setHeader('Content-Type',mime[extname(file)]||'application/octet-stream');res.setHeader('Cache-Control','no-store');res.end(body);
}catch{res.writeHead(404);res.end('Not found');}}).listen(8879,'127.0.0.1',()=>console.log('JOOHO LAB preview: http://127.0.0.1:8879/ (local-only QA: /?qa=1 and /__qa/mobile)'));
