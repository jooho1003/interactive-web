import { createServer } from 'node:http';
import { readFile, writeFile, mkdir, rename, readdir } from 'node:fs/promises';
import { randomBytes, createHash, timingSafeEqual } from 'node:crypto';
import { resolve, extname, sep, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { validateValues, clone } from '../../../packages/layer-kit/src/index.js';
import { buildLayers } from './build-layers.mjs';

const hash = value => createHash('sha256').update(value).digest('hex');
const mime = { '.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml' };
const login = '<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>관리자 로그인</title><body style="font-family:system-ui;max-width:380px;margin:12vh auto;padding:24px"><h1>Scene Studio</h1><form method="post" action="/api/studio/login"><label>관리자 비밀번호 <input type="password" name="password" required autocomplete="current-password"></label><button>로그인</button></form></body></html>';
export function createStudioServer({ projectDir = fileURLToPath(new URL('../', import.meta.url)), password = process.env.ADMIN_PASSWORD || '' } = {}) {
  const dist=resolve(projectDir,'dist'),admin=resolve(projectDir,'admin'),stateDir=resolve(projectDir,'.studio');
  const publishedPath=resolve(dist,'layers.values.json'),draftPath=resolve(stateDir,'draft.json');
  const sessions=new Map();let queue=Promise.resolve();
  const serial=task=>{const result=queue.then(task);queue=result.catch(()=>{});return result;};
  async function manifest(){return JSON.parse((await readFile(resolve(dist,'layers.manifest.js'),'utf8')).replace(/^export default /,'').replace(/;\s*$/,''));}
  async function state(){
    const published=JSON.parse(await readFile(publishedPath,'utf8')),revision=hash(JSON.stringify(published));let saved;
    try{saved=JSON.parse(await readFile(draftPath,'utf8'));}catch(error){if(error.code!=='ENOENT')throw new Error('초안 파일을 읽을 수 없습니다. 원본을 보존했습니다.');}
    const values=saved?.values||published;
    return {published,values,revision,draftRevision:hash(JSON.stringify(saved||{values,baseRevision:revision})),baseRevision:saved?.baseRevision||revision,conflict:Boolean(saved&&saved.baseRevision!==revision)};
  }
  async function atomic(path,content){await mkdir(dirname(path),{recursive:true});const temp=path+'.'+randomBytes(5).toString('hex')+'.tmp';await writeFile(temp,content);await rename(temp,path);}
  async function body(req,limit=6500000){
    if(Number(req.headers['content-length']||0)>limit)throw Object.assign(new Error('파일이 너무 큽니다.'),{status:413});
    const chunks=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>limit)throw Object.assign(new Error('파일이 너무 큽니다.'),{status:413});chunks.push(chunk);}return Buffer.concat(chunks).toString('utf8');
  }
  const json=(res,value,status=200)=>{res.writeHead(status,{'Content-Type':mime['.json']});res.end(JSON.stringify(value));};
  const issue=res=>{const token=randomBytes(32).toString('hex');sessions.set(token,Date.now()+8*3600000);res.setHeader('Set-Cookie',`studio_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800`);};
  const authorized=req=>{const token=/(?:^|;\s*)studio_session=([a-f0-9]{64})(?:;|$)/.exec(req.headers.cookie||'')?.[1];return(sessions.get(token)||0)>Date.now();};
  async function file(res,base,path,method){const target=resolve(base,'.'+path);if(!target.startsWith(base+sep))return json(res,{error:'허용되지 않은 경로입니다.'},403);const bytes=await readFile(target);res.writeHead(200,{'Content-Type':mime[extname(target)]||'application/octet-stream'});res.end(method==='HEAD'?undefined:bytes);}
  const server=createServer(async(req,res)=>{
    res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Content-Security-Policy',"frame-ancestors 'self'; object-src 'none'; base-uri 'self'");res.setHeader('Referrer-Policy','same-origin');
    try{
      const port=server.address().port;
      if(![`localhost:${port}`,`127.0.0.1:${port}`].includes(req.headers.host))return json(res,{error:'로컬 주소로 접속해주세요.'},403);
      const origin=`http://${req.headers.host}`,path=decodeURIComponent(new URL(req.url,origin).pathname),safeMethod=['GET','HEAD'].includes(req.method);
      if(path.includes('\\')||path.includes('\0'))return json(res,{error:'잘못된 경로입니다.'},400);
      if(!safeMethod&&req.headers.origin!==origin)return json(res,{error:'현재 관리자 화면에서 다시 시도해주세요.'},403);
      if(path==='/api/studio/login'&&req.method==='POST'){
        const input=new URLSearchParams(await body(req,4096)).get('password')||'';
        if(password&&!timingSafeEqual(Buffer.from(hash(input)),Buffer.from(hash(password))))return json(res,{error:'비밀번호가 맞지 않습니다.'},401);
        issue(res);res.writeHead(303,{Location:'/admin'});return res.end();
      }
      if(path==='/admin'||path==='/admin/'){
        if(!safeMethod)return json(res,{error:'허용되지 않은 요청입니다.'},405);
        if(password&&!authorized(req)){res.writeHead(200,{'Content-Type':mime['.html']});return res.end(login);}
        if(!authorized(req))issue(res);return await file(res,admin,'/index.html',req.method);
      }
      if(path.startsWith('/admin/')||path.startsWith('/api/studio/')){
        if(!authorized(req))return json(res,{error:'관리자 세션이 필요합니다.'},401);
        if(path.startsWith('/admin/'))return safeMethod?await file(res,admin,path.slice(6),req.method):json(res,{error:'허용되지 않은 요청입니다.'},405);
        if(path==='/api/studio/state'&&req.method==='GET')return json(res,await state());
        if(path==='/api/studio/versions'&&req.method==='GET')return json(res,{versions:(await readdir(resolve(stateDir,'versions')).catch(()=>[])).filter(name=>/^\d+-[a-f0-9]+\.json$/.test(name)).sort().reverse().slice(0,10)});
        if(path==='/api/studio/draft'&&req.method==='PUT'){
          const input=JSON.parse(await body(req));return await serial(async()=>{
            const current=await state();if(input.draftRevision!==current.draftRevision||input.revision!==current.revision)return json(res,{error:'다른 창에서 변경되었습니다. 내 초안을 내보낸 뒤 다시 불러와주세요.'},409);
            const checked=validateValues(await manifest(),input.values,{allowData:true});if(checked.errors.length)return json(res,{error:checked.errors.join('\n')},400);
            await atomic(draftPath,JSON.stringify({values:checked.values,baseRevision:current.revision}));return json(res,await state());
          });
        }
        if(path==='/api/studio/publish'&&req.method==='POST'){
          const input=JSON.parse(await body(req,4096));return await serial(async()=>{
            const current=await state();if(input.draftRevision!==current.draftRevision||current.conflict)return json(res,{error:'초안 또는 게시본이 바뀌었습니다. 다시 불러와 확인해주세요.'},409);
            const schema=await manifest(),checked=validateValues(schema,current.values,{allowData:true});if(checked.errors.length)return json(res,{error:checked.errors.join('\n')},400);
            const next=clone(checked.values);
            async function assets(node,parent=''){for(const[key,value]of Object.entries(node)){
              if(value&&typeof value==='object'){await assets(value,key);continue;}
              if(schema.layers.find(layer=>layer.id===parent)?.params[key]?.type!=='image')continue;
              if(typeof value==='string'&&value.startsWith('data:image/')){
                const match=/^data:image\/(png|jpeg|webp);base64,(.+)$/.exec(value);if(!match)throw Object.assign(new Error('지원하지 않는 이미지입니다.'),{status:400});
                const bytes=Buffer.from(match[2],'base64');const valid=match[1]==='png'?bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])):match[1]==='jpeg'?bytes[0]===255&&bytes[1]===216&&bytes[2]===255:bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP';
                if(!valid)throw Object.assign(new Error('이미지 파일 형식이 맞지 않습니다.'),{status:400});
                const name=hash(bytes).slice(0,24)+'.'+(match[1]==='jpeg'?'jpg':match[1]);await atomic(resolve(dist,'assets/studio',name),bytes);node[key]='./assets/studio/'+name;
              }else if(typeof value==='string'&&value.startsWith('./assets/'))await readFile(resolve(dist,value));
            }}
            await assets(next);await atomic(resolve(stateDir,'versions',Date.now()+'-'+current.revision.slice(0,10)+'.json'),JSON.stringify(current.published,null,2));await atomic(publishedPath,JSON.stringify(next,null,2));
            try{await buildLayers({dir:pathToFileURL(dist+sep)});}catch(error){await atomic(publishedPath,JSON.stringify(current.published,null,2));await buildLayers({dir:pathToFileURL(dist+sep)});throw error;}
            await atomic(draftPath,JSON.stringify({values:next,baseRevision:hash(JSON.stringify(next))}));return json(res,await state());
          });
        }
        if(path==='/api/studio/restore'&&req.method==='POST'){
          const input=JSON.parse(await body(req,4096));return await serial(async()=>{
            const current=await state();if(input.draftRevision!==current.draftRevision)return json(res,{error:'초안이 바뀌었습니다.'},409);
            if(!/^\d+-[a-f0-9]+\.json$/.test(input.version||''))return json(res,{error:'올바른 버전을 선택해주세요.'},400);
            const restored=JSON.parse(await readFile(resolve(stateDir,'versions',input.version),'utf8')),checked=validateValues(await manifest(),restored);
            if(checked.errors.length)return json(res,{error:checked.errors.join('\n')},400);
            await atomic(draftPath,JSON.stringify({values:checked.values,baseRevision:current.revision}));return json(res,await state());
          });
        }
        return json(res,{error:'요청을 찾을 수 없습니다.'},404);
      }
      if(!safeMethod)return json(res,{error:'허용되지 않은 요청입니다.'},405);
      return await file(res,dist,path==='/'?'/index.html':path,req.method);
    }catch(error){json(res,{error:error.code==='ENOENT'?'파일을 찾을 수 없습니다.':error instanceof SyntaxError?'JSON 형식이 올바르지 않습니다.':error.message},error.status||(error.code==='ENOENT'?404:400));}
  });return server;
}
