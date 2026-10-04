import manifest from './village-houses.manifest.js';
import published from './village-houses.values.js';
import {createLayerHost,resolve,setValue} from './vendor/layer-kit/index.js';
export const layerHost=createLayerHost({manifest,published,root:document.querySelector('#scene')});
const storageKey='jooho-village-layers-v1';
let saved=layerHost.values,storageError=false;
try{const raw=localStorage.getItem(storageKey);if(raw){layerHost.setValues(JSON.parse(raw));saved=layerHost.values;}}catch{storageError=true;}

export function initVillageLayerEditor(container){
  const panel=document.createElement('section');panel.className='village-layer-editor';
  const intro=document.createElement('p');intro.textContent='마을 건물의 위치·라벨·불빛과 7·8번 그림을 조정합니다. 모바일 값은 모바일 화면에서 적용되며, 저장은 이 브라우저에만 적용됩니다.';
  panel.append(intro);
  const select=(label,entries)=>{const wrap=document.createElement('label');wrap.className='editor-field';const text=document.createElement('span');text.textContent=label;const input=document.createElement('select');for(const[value,title]of entries){const option=document.createElement('option');option.value=value;option.textContent=title;input.append(option);}wrap.append(text,input);panel.append(wrap);return input;};
  const layer=select('레이어',manifest.layers.map(l=>[l.id,l.label]));layer.value='house-day-walk';
  const scene=select('적용 장면',[['all','모든 작품'],...Object.entries(manifest.scenes).map(([id,s])=>[id,s.label])]);
  const screen=select('적용 화면',[['base','모든 화면'],['mobile','모바일']]);
  const fields=document.createElement('div'),status=document.createElement('p');status.setAttribute('role','status');panel.append(fields,status);
  const history=[];
  const say=text=>status.textContent=text;
  function render(){
    fields.replaceChildren();const definition=manifest.layers.find(l=>l.id===layer.value);
    const current=resolve(manifest,layerHost.values,scene.value==='all'?layerHost.scene:scene.value,screen.value==='mobile'?['mobile']:[])[layer.value];
    for(const[key,param]of Object.entries(definition.params)){
      const wrap=document.createElement('label');wrap.className='editor-field';const label=document.createElement('span');label.textContent=param.label;
      const input=document.createElement('input');input.dataset.villageParam=key;input.dataset.villageLayer=layer.value;
      input.type=param.type==='boolean'?'checkbox':param.type==='number'?'number':param.type==='color'?'color':'text';
      if(param.type==='boolean')input.checked=current[key];else input.value=current[key];
      if(param.type==='number')Object.assign(input,{min:param.min,max:param.max,step:param.step});
      if(param.type==='color'&&current[key].length===9)input.value=current[key].slice(0,7);
      input.addEventListener('input',()=>{
        const value=param.type==='boolean'?input.checked:param.type==='number'?Number(input.value):input.value;
        try{const before=layerHost.values;layerHost.setValues(setValue(before,scene.value,screen.value,layer.value,key,value));history.push(before);say('화면에 적용했습니다. 저장 전에는 임시 변경입니다.');}catch(error){say(error.message);}
      });wrap.append(label,input);fields.append(wrap);
    }
  }
  layer.addEventListener('change',render);screen.addEventListener('change',render);
  scene.addEventListener('change',()=>{if(scene.value!=='all')document.querySelector(`#gallery-pagination button[data-id="${scene.value}"]`)?.click();render();});
  const actions=document.createElement('div');actions.className='settings-actions';panel.append(actions);
  const button=(text,action)=>{const el=document.createElement('button');el.type='button';el.textContent=text;el.addEventListener('click',action);actions.append(el);};
  button('마지막 변경 되돌리기',()=>{if(history.length){layerHost.setValues(history.pop());render();say('마지막 변경을 되돌렸습니다.');}});
  button('저장된 레이어로 복구',()=>{layerHost.setValues(saved);history.length=0;render();say('저장된 레이어로 돌아왔습니다.');});
  button('레이어 기본값',()=>{history.push(layerHost.values);layerHost.setValues(published);render();say('기본값 미리보기입니다. 저장 전에는 기존 저장값이 유지됩니다.');});
  button('레이어 저장',()=>{try{const next=layerHost.values;localStorage.setItem(storageKey,JSON.stringify(next));saved=next;say('레이어를 이 브라우저에 저장했습니다.');}catch{say('저장하지 못했습니다. 현재 화면값을 유지합니다. 설정 내보내기로 보관할 수 있습니다.');}});
  button('레이어 설정 내보내기',()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(layerHost.values,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='jooho-village-layers.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
  container.append(panel);render();if(storageError)say('저장된 레이어를 읽지 못해 기본값으로 열었습니다. 현재 화면에서 계속 조정할 수 있습니다.');
}
