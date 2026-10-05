import {readFile,writeFile,rename,unlink} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import manifest from '../public/layers.manifest.js';
import {validateValues} from '../public/vendor/layer-kit/index.js';

// Design Ref: gallery-layer-publish §3 — loopback preview writes only this value file.
export function layerPersistence(file){
  let pending=Promise.resolve();
  const checked=value=>{const result=validateValues(manifest,value);if(result.errors.length)throw Object.assign(new Error('레이어 설정 형식이나 범위를 확인해 주세요.'),{status:400});return result.values;};
  async function current(){const body=await readFile(file,'utf8');return {canEdit:true,revision:createHash('sha256').update(body).digest('hex'),values:checked(JSON.parse(body))};}
  return async(req,res)=>{
    const reply=(status,body)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(body));};
    try{
      const host=new URL(`http://${req.headers.host}`);
      if(!['127.0.0.1','localhost'].includes(host.hostname)||req.method==='PUT'&&req.headers.origin!==host.origin){reply(403,{error:'로컬 전시관에서만 저장할 수 있습니다.'});return;}
      if(req.method==='GET'){reply(200,await current());return;}
      if(req.method!=='PUT'){reply(405,{error:'지원하지 않는 요청입니다.'});return;}
      if(!req.headers['content-type']?.startsWith('application/json')){reply(400,{error:'JSON 설정이 필요합니다.'});return;}
      let size=0,chunks=[];for await(const chunk of req){size+=chunk.length;if(size>256*1024){reply(413,{error:'설정 파일은 256KB 이하만 저장할 수 있습니다.'});return;}chunks.push(chunk);}
      let body;try{body=JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{reply(400,{error:'JSON 설정을 확인해 주세요.'});return;}
      const values=checked(body?.values);
      const save=async()=>{
        const before=await current();
        if(body.revision!==before.revision){reply(409,{error:'다른 창에서 설정이 변경되었습니다. JSON을 내보내 보관한 뒤 새로고침해 주세요.'});return;}
        const temporary=`${file}.tmp`;
        try{await writeFile(temporary,JSON.stringify(values,null,2)+'\n');await rename(temporary,file);}finally{await unlink(temporary).catch(()=>{});}
        reply(200,await current());
      };
      const task=pending.then(save);pending=task.catch(()=>{});await task;
    }catch(error){reply(error.status||500,{error:error.status?error.message:'프로젝트 설정 파일을 저장하거나 읽지 못했습니다. 변경값을 JSON으로 보관해 주세요.'});}
  };
}
