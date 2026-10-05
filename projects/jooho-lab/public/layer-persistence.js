import {emptyValues,validateValues} from './vendor/layer-kit/index.js';

// Design Ref: gallery-layer-publish §2 — committed values are the deployed default.
export async function loadLayerPersistence(manifest,storageKey){
  let published=emptyValues(manifest),revision,canPublish=false,loadError='';
  const checked=value=>{const result=validateValues(manifest,value);if(result.errors.length)throw new Error('저장된 레이어 설정을 확인해 주세요.');return result.values;};
  try{
    const response=await fetch(new URL('./layers.values.json',import.meta.url),{cache:'no-store'});
    if(!response.ok)throw new Error('레이어 설정 파일을 읽지 못했습니다.');
    published=checked(await response.json());
  }catch(error){loadError=error.message;}
  if(!loadError&&['localhost','127.0.0.1'].includes(location.hostname)){
    try{
      const response=await fetch('/api/layers',{cache:'no-store'});
      if(response.status!==404){
        if(!response.ok)throw new Error('로컬 프로젝트 저장 연결을 확인해 주세요.');
        const data=await response.json();
        if(data.canEdit!==true||typeof data.revision!=='string')throw new Error('로컬 프로젝트 저장 응답을 확인해 주세요.');
        published=checked(data.values);revision=data.revision;canPublish=true;
      }
    }catch(error){loadError=error.message;}
  }
  let base=JSON.stringify(published),draft=published;
  try{
    const stored=JSON.parse(localStorage.getItem(storageKey));
    if(stored?.base===base)draft=checked(stored.values);
    else if(canPublish&&stored?.format==='iw-layers/1')draft=checked(stored); // Preserve legacy local edits for the first file save.
  }catch{}
  return {
    published,draft,canPublish,
    message:loadError|| (canPublish?'프로젝트 파일에 저장됩니다. 커밋·배포하면 반영됩니다.':'브라우저 초안으로 저장됩니다. 배포 반영은 로컬 전시관에서 저장해 주세요.'),
    async save(values){
      if(loadError)throw new Error(loadError+' 새로고침하거나 JSON으로 보관해 주세요.');
      const snapshot=checked(values);
      if(canPublish){
        const response=await fetch('/api/layers',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({revision,values:snapshot})});
        const data=await response.json();
        if(!response.ok)throw new Error(data.error||'프로젝트 파일을 저장하지 못했습니다.');
        const written=checked(data.values);revision=data.revision;base=JSON.stringify(written);
        try{localStorage.removeItem(storageKey);}catch{}
        return {values:written,message:'프로젝트 파일에 저장했습니다. 이 변경을 커밋·배포하면 모든 방문자에게 반영됩니다.'};
      }
      localStorage.setItem(storageKey,JSON.stringify({base,values:snapshot}));
      return {values:snapshot,message:'이 브라우저에 초안을 저장했습니다. 배포 반영은 로컬 전시관에서 저장해 주세요.'};
    }
  };
}
