import manifest from '/layers.manifest.js';
import { clone, resolve, setValue, scopeMap, validateValues, validateValue } from '/vendor/layer-kit/index.js';

const $ = id => document.getElementById(id);
const equal = (a,b) => JSON.stringify(a) === JSON.stringify(b);
const el = (tag, text, className) => { const node=document.createElement(tag); if(text!==undefined)node.textContent=text; if(className)node.className=className; return node; };
let state, values, saved, selected='character', scene=manifest.initialScene, bridge, editing=true;
let history=[], future=[], saveTimer, saving=null, failed=false, gesture=null, playing=false, playFrame=0;
const screen = () => manifest.previewScreens.find(item=>item.id===$('viewport').value);
const scope = () => [$('scene-scope').value==='all'?'all':scene,$('screen-scope').value==='base'?'base':screen().id];
const resolved = () => resolve(manifest,values,scene,screen().matches);
function error(message){$('error').textContent=message;$('error').hidden=false;}
function clearError(){$('error').hidden=true;}
async function api(path,method='GET',body){
  const response=await fetch('/api/studio/'+path,{method,headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined});
  const result=await response.json();if(!response.ok)throw new Error(result.error||'요청을 완료하지 못했습니다.');return result;
}
function status(){
  const dirty=values&&!equal(values,saved);
  $('save-status').textContent=failed?'저장 실패 · 초안 보존됨':saving?'저장 중…':dirty?'저장 대기…':'초안 저장됨';
  $('undo').disabled=!history.length;$('redo').disabled=!future.length;
  $('publish').disabled=!state||failed||Boolean(saving)||equal(values,state.published);
}
function remember(before){if(equal(before,values))return;history.push(before);if(history.length>60)history.shift();future=[];}
function apply(){
  if(bridge){bridge.setValues($('show-published').checked?state.published:values);bridge.select(selected);}
  status();
}
function schedule(){clearTimeout(saveTimer);saveTimer=setTimeout(()=>save().catch(error=>{}),450);status();}
async function save(force=false){
  clearTimeout(saveTimer);
  if(saving){await saving;return save(force);}
  if(equal(values,saved)&&!(force&&state.conflict))return;
  if(failed)throw new Error('저장 충돌을 먼저 해결해주세요. 초안 내보내기로 수정 내용을 보존할 수 있습니다.');
  const snapshot=clone(values);
  saving=api('draft','PUT',{values:snapshot,revision:state.revision,draftRevision:state.draftRevision});status();
  try{state=await saving;saved=clone(snapshot);clearError();}
  catch(cause){failed=true;error(cause.message);throw cause;}
  finally{saving=null;status();}
  if(!equal(values,saved))return save();
}
function change(next,{record=true,render=true}={}){
  if($('show-published').checked){$('show-published').checked=false;}
  const before=clone(values);values=next;if(record)remember(before);apply();schedule();
  if(render){renderInspector();renderStory();}
}
function patch(key,value,record=true){const [s,v]=scope();change(setValue(values,s,v,selected,key,value),{record,render:false});}
function resetParam(key){patch(key,undefined);renderInspector();renderStory();}
function renderLayers(){
  const list=$('layer-list');list.replaceChildren();let group='';
  const matches=manifest.layers.filter(layer=>(layer.label+' '+layer.group).toLowerCase().includes($('layer-search').value.toLowerCase()));
  $('layer-count').textContent=manifest.layers.length;
  for(const layer of matches){if(group!==layer.group){group=layer.group;list.append(el('p',group,'layer-group'));}
    const row=el('button',undefined,'layer-row');row.dataset.layer=layer.id;row.setAttribute('aria-pressed',String(layer.id===selected));row.append(el('span',undefined,'dot'),el('span',layer.label));row.onclick=()=>select(layer.id);list.append(row);
  }
}
function select(id){selected=id;bridge?.select(id);renderLayers();renderInspector();}
function renderStory(){
  $('storyboard').replaceChildren();let index=0;
  for(const[id,definition]of Object.entries(manifest.scenes)){
    const result=resolve(manifest,$('show-published').checked?state.published:values,id,screen().matches);
    const card=el('button',undefined,'scene-card');card.dataset.scene=id;card.setAttribute('aria-pressed',String(id===scene));card.setAttribute('aria-label',definition.label+' 장면 선택');
    const visual=el('div',undefined,'scene-image');visual.style.setProperty('--scene-paper',result.paper.color);
    const image=el('img');image.src=result.character.src;image.alt='';image.style.transform=`rotate(${result.character.tilt}deg) scale(${result.character.zoom})`;
    visual.append(el('b',result.word.text),image);const caption=el('div',undefined,'scene-caption');caption.append(el('span',String(++index).padStart(2,'0')+' / '+definition.label),el('span',id===scene?'선택됨':'선택'));
    card.append(visual,caption);card.onclick=()=>{stop();scene=id;bridge?.setScene(id);bridge?.scrub(Number($('time').value));renderStory();renderInspector();captionUpdate();};$('storyboard').append(card);
  }
}
function captionUpdate(){$('preview-label').textContent=$('page').selectedOptions[0].textContent+' · '+manifest.scenes[scene].label;$('page-sequence').replaceChildren();[...$('page').options].forEach((option,index)=>{const button=el('button',String(index+1).padStart(2,'0')+' '+option.textContent);button.dataset.page=option.value;button.setAttribute('aria-current',String(option.selected));button.onclick=()=>{$('page').value=option.value;$('page').dispatchEvent(new Event('change'));};$('page-sequence').append(button);});}
function renderInspector(){
  if(!values)return;const layer=manifest.layers.find(item=>item.id===selected),current=resolved()[selected], [s,v]=scope();
  $('selected-name').textContent=layer.label;
  $('scope-label').textContent=`${s==='all'?'공통 설정 (장면별 값이 우선)':manifest.scenes[s].label} · ${v==='base'?'기본 화면값':screen().label}에 적용`;
  const map=scopeMap(clone(values),s,v)[selected]||{};
  const container=$('inspector');container.replaceChildren();
  const createControl=([key,param])=>{
    const row=el('div',undefined,'parameter');row.dataset.param=key;
    const head=el('div',undefined,'parameter-head'),label=el('label',param.label),id='param-'+selected+'-'+key.replaceAll('.','-');label.htmlFor=id;head.append(label);
    const reset=el('button',Object.hasOwn(map,key)?'초기화':'상속');reset.disabled=!Object.hasOwn(map,key);reset.title='이 범위의 수정값 제거';reset.onclick=()=>resetParam(key);head.append(reset);row.append(head);
    const controls=el('div',undefined,'parameter-controls');row.append(controls);
    let input;
    const commit=value=>{
      if(!validateValue(param,value,true)||param.property&&!CSS.supports(param.property,String(value)+(param.unit||''))){error('이 속성에 적용할 수 없는 값입니다.');return false;}
      clearError();patch(key,value);reset.disabled=false;reset.textContent='초기화';renderStory();return true;
    };
    if(param.type==='number'){
      const range=el('input');range.type='range';range.min=param.min;range.max=param.max;range.step=param.step||.1;range.value=current[key];range.setAttribute('aria-label',param.label+' 슬라이더');
      input=el('input');input.type='number';input.min=param.min;input.max=param.max;input.step=param.step||.1;input.value=current[key];
      let before;
      range.oninput=()=>{before||=clone(values);input.value=range.value;patch(key,Number(range.value),false);};
      range.onchange=()=>{if(before){remember(before);before=null;}reset.disabled=false;reset.textContent='초기화';renderStory();status();};
      input.onchange=()=>{if(commit(Number(input.value)))range.value=input.value;else input.value=resolved()[selected][key];};controls.append(range,input);
      if(param.unit)row.append(el('small',param.unit));
    }else if(param.type==='boolean'){
      input=el('input');input.type='checkbox';input.checked=current[key];input.onchange=()=>commit(input.checked);controls.append(input);
    }else if(param.type==='select'){
      input=el('select');for(const option of param.options){const node=el('option',option.label||option.value);node.value=option.value;input.append(node);}input.value=current[key];input.onchange=()=>commit(input.value);controls.append(input);
    }else if(param.type==='image'){
      const preview=el('img');preview.src=current[key];preview.alt='현재 이미지';row.append(preview);
      input=el('input');input.type='file';input.accept='image/png,image/jpeg,image/webp';input.onchange=async()=>{
        const file=input.files[0];if(!file)return;if(file.size>2000000||!['image/png','image/jpeg','image/webp'].includes(file.type)){error('2MB 이하의 PNG, JPG, WebP 이미지를 선택해주세요.');return;}
        try{const data=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(file);});const check=new Image();check.src=data;await check.decode();if(commit(data))preview.src=data;}catch{error('이미지를 읽을 수 없습니다.');}
      };row.append(input,el('small','PNG · JPG · WebP / 최대 2MB. 이미지 비율은 유지됩니다.'));
    }else{
      input=el(param.type==='text'?'textarea':'input');if(input.tagName==='INPUT')input.type='text';input.value=current[key];input.onchange=()=>{if(!commit(input.value))input.value=resolved()[selected][key];};controls.append(input);
      if(param.type==='color'){const picker=el('input');picker.type='color';picker.value=current[key].slice(0,7);picker.setAttribute('aria-label',param.label+' 색 선택');picker.onchange=()=>{input.value=picker.value;commit(picker.value);};controls.prepend(picker);}
    }
    input.id=id;
    if(Object.hasOwn(map,key)&&map[key]!==current[key])row.append(el('small','더 구체적인 장면·화면 설정이 이 값을 덮어쓰고 있습니다.'));
    return row;
  };
  const entries=Object.entries(layer.params);entries.filter(([,param])=>!param.advanced).forEach(entry=>container.append(createControl(entry)));
  const advanced=entries.filter(([,param])=>param.advanced);
  if(advanced.length){const details=el('details');details.append(el('summary',`세부 디자인 · ${advanced.length}개`));const filter=el('input');filter.type='search';filter.placeholder='속성 또는 요소 검색';filter.className='advanced-filter';filter.setAttribute('aria-label','세부 디자인 검색');const list=el('div');details.append(filter,list);const populate=()=>{list.replaceChildren(...advanced.filter(([,param])=>param.label.toLowerCase().includes(filter.value.toLowerCase())).map(createControl));};filter.oninput=populate;details.addEventListener('toggle',()=>{if(details.open&&!list.childElementCount)populate();});container.append(details);}
}
function resize(){const view=screen(),height=view.id==='mobile'?844:900;const width=Math.max(200,$('preview-canvas').clientWidth-(innerWidth<=650?18:38));const heightLimit=innerWidth>1100?Math.max(220,innerHeight-630):height;const scale=$('zoom').value==='actual'?1:$('zoom').value==='width'?Math.min(width/view.width,1):Math.min(width/view.width,heightLimit/height,1);$('preview').style.cssText=`width:${view.width}px;height:${height}px;transform:scale(${scale})`;$('frame-wrap').style.width=view.width*scale+'px';$('frame-wrap').style.height=height*scale+'px';$('preview-size').textContent=`${view.width} × ${height}`;}
function stop(){playing=false;cancelAnimationFrame(playFrame);$('play').textContent='▶ 재생';}
function scrub(ms){$('time').value=ms;$('time-label').textContent=(ms/1000).toFixed(2)+'초';bridge?.scrub(ms);}
function setMode(value){editing=value;bridge?.mode(value);$('edit-mode').setAttribute('aria-pressed',value);$('experience-mode').setAttribute('aria-pressed',!value);$('interaction-hint').textContent=value?'화면의 요소를 선택하고 끌어서 이동하세요. 목록에서도 레이어를 선택할 수 있습니다.':'작품의 버튼·검색·상세·메모 기능을 직접 사용할 수 있습니다.';if(!value){stop();bridge?.release();}else scrub(Number($('time').value));}
async function attach(){
  bridge=null;
  for(let i=0;i<100;i++){const candidate=$('preview').contentWindow?.potatoStudio;if(candidate){bridge=candidate;break;}await new Promise(resolve=>setTimeout(resolve,50));}
  if(!bridge){error('작품 미리보기를 불러오지 못했습니다. 다시 불러오기를 눌러주세요.');return;}
  bridge.callbacks(select,(id,x,y,phase)=>{
    if(phase==='start'){gesture={before:clone(values),x:resolved()[id]['offset.x'],y:resolved()[id]['offset.y']};stop();}
    else if(phase==='move'&&gesture&&gesture.x!==undefined){const[s,v]=scope();let next=setValue(values,s,v,id,'offset.x',Math.max(-600,Math.min(600,Math.round(gesture.x+x))));next=setValue(next,s,v,id,'offset.y',Math.max(-600,Math.min(600,Math.round(gesture.y+y))));change(next,{record:false,render:false});}
    else if(phase==='end'&&gesture){remember(gesture.before);gesture=null;renderInspector();status();}
  },id=>{if(!state||id===scene)return;scene=id;renderStory();renderInspector();captionUpdate();},page=>{if($('page').value===page)return;$('page').value=page;captionUpdate();});
  if(state){apply();bridge.setScene(scene);bridge.showPage($('page').value);setMode(editing);}
}
function flatten(input){const out={};function walk(value,path){for(const[key,item]of Object.entries(value||{})){if(item&&typeof item==='object')walk(item,[...path,key]);else out[[...path,key].join('/')]=item;}}walk(input,[]);return out;}
function diffs(before,after){const a=flatten(before),b=flatten(after);return [...new Set([...Object.keys(a),...Object.keys(b)])].filter(key=>a[key]!==b[key]).map(key=>({key,before:a[key],after:b[key]}));}
const display = value => value===undefined?'상속값':String(value).startsWith('data:image/')?'업로드 이미지':String(value).slice(0,180);
function confirm(title,description,before,after,actionLabel,action){
  $('confirm-title').textContent=title;$('confirm-description').textContent=description;$('change-list').replaceChildren();
  const changes=diffs(before,after);if(!changes.length)$('change-list').append(el('p','변경된 설정이 없습니다.'));
  for(const item of changes){const parts=item.key.split('/'),key=parts.pop(),layer=manifest.layers.find(layer=>layer.id===parts.at(-1));const row=el('div',(layer?.label||parts.at(-1))+' · '+(layer?.params[key]?.label||key),'change-row');row.append(el('span',parts.slice(0,-1).join(' / ')),el('span',display(item.before)+' → '+display(item.after)));$('change-list').append(row);}
  $('confirm-action').textContent=actionLabel;$('confirm-action').onclick=async()=>{const button=$('confirm-action');button.disabled=true;try{await action?.();$('confirm-dialog').close();}catch(cause){error(cause.message);}finally{button.disabled=false;}};$('confirm-dialog').showModal();
}
function acceptState(next){state=next;values=clone(next.values);saved=clone(next.values);failed=false;history=[];future=[];clearError();apply();renderLayers();renderInspector();renderStory();}
function guarded(callback){return async()=>{try{await callback();}catch(cause){error(cause.message);}};}
$('preview').addEventListener('load',()=>attach());
$('layer-search').oninput=renderLayers;
$('scene-scope').onchange=renderInspector;$('screen-scope').onchange=renderInspector;
$('zoom').onchange=resize;$('viewport').onchange=()=>{resize();renderInspector();renderStory();};new ResizeObserver(resize).observe($('preview-canvas'));
$('page').onchange=()=>{bridge?.showPage($('page').value);captionUpdate();scrub(Number($('time').value));};
$('edit-mode').onclick=()=>setMode(true);$('experience-mode').onclick=()=>setMode(false);
$('show-published').onchange=()=>{apply();renderStory();};
$('time').oninput=()=>{stop();scrub(Number($('time').value));};$('time-range').onchange=()=>{stop();$('time').max=$('time-range').value;scrub(Math.min(Number($('time').value),Number($('time').max)));};
$('restart').onclick=()=>{stop();bridge?.restart();scrub(0);};
$('play').onclick=()=>{if(playing){stop();return;}playing=true;$('play').textContent='Ⅱ 일시정지';const start=performance.now(),offset=Number($('time').value)>=Number($('time').max)?0:Number($('time').value);function tick(now){const ms=Math.min(offset+now-start,Number($('time').max));scrub(ms);if(ms>=Number($('time').max))stop();else playFrame=requestAnimationFrame(tick);}playFrame=requestAnimationFrame(tick);};
$('undo').onclick=()=>{if(!history.length)return;future.push(clone(values));change(history.pop(),{record:false});};
$('redo').onclick=()=>{if(!future.length)return;history.push(clone(values));change(future.pop(),{record:false});};
document.addEventListener('keydown',event=>{if(!(event.ctrlKey||event.metaKey)||/INPUT|TEXTAREA|SELECT/.test(event.target.tagName)||document.querySelector('dialog[open]'))return;if(event.key.toLowerCase()==='z'){event.preventDefault();$(event.shiftKey?'redo':'undo').click();}else if(event.key.toLowerCase()==='y'){event.preventDefault();$('redo').click();}});
window.addEventListener('beforeunload',event=>{if(values&&!equal(values,saved)){event.preventDefault();event.returnValue='';}});
$('close-confirm').onclick=$('cancel-confirm').onclick=()=>$('confirm-dialog').close();$('close-versions').onclick=()=>$('versions-dialog').close();
$('show-changes').onclick=()=>confirm('게시본과 변경 비교','현재 초안과 로컬 게시본의 차이입니다.',state.published,values,'닫기');
$('reset-layer').onclick=()=>{const[s,v]=scope(),next=clone(values);delete scopeMap(next,s,v)[selected];confirm('이 범위의 레이어 초기화','선택한 장면·화면 범위의 수정값을 제거합니다.',values,next,'초기화',()=>change(next));};
$('discard').onclick=()=>confirm('게시본으로 되돌리기','현재 초안을 게시본의 설정으로 바꿉니다.',values,state.published,'초안 바꾸기',()=>change(clone(state.published)));
$('publish').onclick=()=>confirm('로컬 게시','이 컴퓨터의 작품 파일을 갱신합니다. 현재 게시본은 이력에 보관됩니다.',state.published,values,'로컬 게시',async()=>{await save(true);acceptState(await api('publish','POST',{draftRevision:state.draftRevision}));$('preview').src='/index.html?studio=1&v='+Date.now();});
$('export').onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(values,null,2)],{type:'application/json'}));const anchor=el('a');anchor.href=url;anchor.download='potato-designer-draft.json';anchor.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
$('import').onclick=()=>$('import-file').click();
$('import-file').onchange=guarded(async()=>{const file=$('import-file').files[0];$('import-file').value='';if(!file)return;if(file.size>6500000)throw new Error('설정 파일은 6.5MB 이하만 가능합니다.');const checked=validateValues(manifest,JSON.parse(await file.text()),{allowData:true});if(checked.errors.length)throw new Error(checked.errors.join('\n'));confirm('설정 가져오기','작품과 버전을 확인했습니다. 아래 설정을 초안에 적용합니다.',values,checked.values,'초안에 적용',()=>change(checked.values));});
$('versions').onclick=guarded(async()=>{await save();const result=await api('versions');$('version-list').replaceChildren();if(!result.versions.length)$('version-list').append(el('p','아직 이전 게시본이 없습니다.'));for(const version of result.versions){const row=el('div',undefined,'version-row');row.append(el('span',new Date(Number(version.split('-')[0])).toLocaleString('ko-KR')));const button=el('button','초안으로 복구');button.onclick=guarded(async()=>{await save();acceptState(await api('restore','POST',{version,draftRevision:state.draftRevision}));$('versions-dialog').close();});row.append(button);$('version-list').append(row);}$('versions-dialog').showModal();});
$('reload').onclick=guarded(async()=>{if(values&&!equal(values,saved)){confirm('다시 불러오기','저장되지 않은 수정값을 버리고 서버의 초안을 불러옵니다.',values,saved,'다시 불러오기',async()=>{if(saving)await saving.catch(()=>{});clearTimeout(saveTimer);acceptState(await api('state'));$('preview').src='/index.html?studio=1&v='+Date.now();});}else{acceptState(await api('state'));$('preview').src='/index.html?studio=1&v='+Date.now();}});
try{acceptState(await api('state'));resize();captionUpdate();if(bridge){apply();bridge.setScene(scene);setMode(true);}else await attach();if(state.conflict)error('게시본이 외부에서 변경되었습니다. 변경을 확인하고 초안을 저장한 뒤 게시해주세요.');}catch(cause){error(cause.message);}
