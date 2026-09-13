import {cleanContent} from '../public/content-schema.js';
const ownerEmail='heyagent1003@gmail.com';
const json=(value,status=200)=>Response.json(value,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const isOwner=request=>!!request.headers.get('oai-authenticated-user-id')&&request.headers.get('oai-authenticated-user-email')?.toLowerCase()===ownerEmail;
export default {async fetch(request,env){
  const url=new URL(request.url),path=url.pathname;
  try {
    if(!path.startsWith('/api/'))return env.ASSETS.fetch(request);
    if(!env.MEDIA)return json({error:'저장 공간에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.'},503);
    if(path==='/api/content'&&request.method==='GET'){const saved=await env.MEDIA.get('museum/content.json');return json({content:saved?await saved.json():null,revision:saved?.etag||null,canEdit:isOwner(request)})}
    if(path.startsWith('/api/media/')&&request.method==='GET'){
      if(!/^\/api\/media\/[a-f0-9-]+\.(png|jpg|gif|webp)$/.test(path))return json({error:'이미지가 없습니다.'},404);
      const object=await env.MEDIA.get(path.slice(5));if(!object)return json({error:'이미지가 없습니다.'},404);
      const headers=new Headers({'Cache-Control':'public, max-age=31536000, immutable','X-Content-Type-Options':'nosniff'});object.writeHttpMetadata(headers);return new Response(object.body,{headers});
    }
    if(!isOwner(request))return json({error:'사이트 소유자만 전시를 수정할 수 있습니다.'},403);
    if(request.headers.get('Origin')!==url.origin)return json({error:'현재 사이트에서 다시 시도해 주세요.'},403);
    if(path==='/api/content'&&request.method==='PUT'){
      const raw=await request.text();if(raw.length>50000)return json({error:'설정이 너무 큽니다.'},413);
      const input=JSON.parse(raw),content=cleanContent(input.content);
      const current=await env.MEDIA.head('museum/content.json');if((current?.etag||null)!==(input.revision||null))return json({error:'다른 화면에서 변경되었습니다. 내 설정을 내보낸 뒤 새로고침해 주세요.'},409);
      const result=await env.MEDIA.put('museum/content.json',JSON.stringify(content),{onlyIf:current?{etagMatches:current.etag}:{etagDoesNotMatch:'*'},httpMetadata:{contentType:'application/json'}});
      if(!result)return json({error:'동시에 변경되었습니다. 새로고침 후 다시 저장해 주세요.'},409);
      return json({content,revision:result.etag,canEdit:true});
    }
    if(path==='/api/upload'&&request.method==='POST'){
      if(Number(request.headers.get('Content-Length')||0)>5*1024*1024)return json({error:'이미지는 5MB 이하로 올려 주세요.'},413);
      const reader=request.body?.getReader();if(!reader)return json({error:'이미지를 선택해 주세요.'},400);const chunks=[];let size=0;while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>5*1024*1024){await reader.cancel();return json({error:'이미지는 5MB 이하로 올려 주세요.'},413)}chunks.push(value)}
      const bytes=new Uint8Array(size);let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.length}
      const start=String.fromCharCode(...bytes.slice(0,12));let ext,type;
      if(bytes[0]===137&&start.slice(1,4)==='PNG'){ext='png';type='image/png'}else if(bytes[0]===255&&bytes[1]===216&&bytes[2]===255){ext='jpg';type='image/jpeg'}else if(start.startsWith('GIF8')){ext='gif';type='image/gif'}else if(start.startsWith('RIFF')&&start.slice(8,12)==='WEBP'){ext='webp';type='image/webp'}else return json({error:'PNG, JPG, WebP, GIF 이미지가 필요합니다.'},415);
      const key='media/'+crypto.randomUUID()+'.'+ext;await env.MEDIA.put(key,bytes,{httpMetadata:{contentType:type}});return json({url:'/api/'+key});
    }
    return json({error:'요청을 찾을 수 없습니다.'},404);
  }catch(error){console.error('museum-api',error.message);return json({error: error instanceof SyntaxError?'설정 파일을 읽을 수 없습니다.': '저장하지 못했습니다. 입력 내용은 유지됩니다. 다시 시도해 주세요.'},500)}
}};
