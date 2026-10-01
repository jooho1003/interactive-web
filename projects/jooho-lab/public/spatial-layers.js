import manifest from './layers.manifest.js';
import {emptyValues,createLayerHost,setValue,validateValues,resolve} from './vendor/layer-kit/index.js';
const key='jooho-lab-spatial-layers-v1';
let published=emptyValues(manifest);
try{const saved=JSON.parse(localStorage.getItem(key));const checked=validateValues(manifest,saved);if(!checked.errors.length)published=checked.values;}catch{}
export const layerHost=createLayerHost({manifest,published});
export function initLayerSettings(){
  const settings=document.querySelector('#settings-dialog');
  const launch=document.createElement('button');launch.type='button';launch.className='layer-launch';launch.textContent='공간 레이어 조정';settings.querySelector('h2').after(launch);
  const dialog=document.createElement('dialog');dialog.className='layers-dialog';dialog.setAttribute('aria-labelledby','layers-title');
  dialog.innerHTML='<button type="button" class="dialog-close" aria-label="레이어 설정 닫기">×</button><h2 id="layers-title">공간 레이어</h2><p>이 브라우저에 저장됩니다. 작품 문구와 이미지는 기존 전시 편집에서 변경하세요.</p><div class="layer-scopes"><label>적용 장면<select id="layer-scene"><option value="all">모든 장면</option></select></label><label>적용 화면<select id="layer-screen"><option value="base">모든 화면</option><option value="mobile">모바일</option></select></label></div><div id="layer-fields"></div><p id="layer-status" role="status"></p><div class="settings-actions"><button type="button" id="layer-reset">레이어 초기화</button><button type="button" id="layer-export">설정 내보내기</button></div>';
  document.body.append(dialog);layerHost.refresh();
  const scene=dialog.querySelector('#layer-scene'),screen=dialog.querySelector('#layer-screen'),fields=dialog.querySelector('#layer-fields'),status=dialog.querySelector('#layer-status');
  for(const [id,item]of Object.entries(manifest.scenes)){const option=document.createElement('option');option.value=id;option.textContent=item.label;scene.append(option);}
  function save(values){try{layerHost.setValues(values);try{localStorage.setItem(key,JSON.stringify(values));status.textContent='이 브라우저에 저장했습니다.'}catch{status.textContent='화면에 적용했습니다. 저장이 차단되어 내보내기를 이용해 주세요.'}}catch(e){status.textContent=e.message}}
  function draw(){const scoped=resolve(manifest,layerHost.values,scene.value==='all'?layerHost.scene:scene.value,screen.value==='mobile'?['mobile']:[]);fields.replaceChildren();for(const layer of manifest.layers){const group=document.createElement('details');const title=document.createElement('summary');title.textContent=layer.label;group.append(title);
    for(const [name,param]of Object.entries(layer.params)){const label=document.createElement('label');label.className='layer-field';const text=document.createElement('span');text.textContent=param.label||name;
      const input=document.createElement('input');input.setAttribute('aria-label',`${layer.label} ${text.textContent}`);const value=scoped[layer.id][name];
      const output=document.createElement('output');input.type=param.type==='boolean'?'checkbox':param.type==='number'?'range':param.type==='color'?'color':'text';
      if(param.type==='number'){input.min=param.min;input.max=param.max;input.step=param.step;}
      if(param.type==='boolean')input.checked=value;else input.value=value;output.textContent=param.type==='number'?String(value):'';
      input.addEventListener(param.type==='text'||param.type==='image'?'change':'input',()=>{const next=param.type==='boolean'?input.checked:param.type==='number'?Number(input.value):input.value;save(setValue(layerHost.values,scene.value,screen.value,layer.id,name,next));if(param.type==='number')output.textContent=String(next);});label.append(text,input,output);group.append(label);
    }fields.append(group);}}
  launch.addEventListener('click',()=>{settings.close();draw();dialog.showModal();});
  scene.addEventListener('change',draw);screen.addEventListener('change',draw);
  dialog.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>document.querySelector('#settings-open').focus());
  dialog.querySelector('#layer-reset').addEventListener('click',()=>{save(emptyValues(manifest));draw();});
  dialog.querySelector('#layer-export').addEventListener('click',()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(layerHost.values,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='jooho-lab-layers.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
}
