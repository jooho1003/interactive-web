import {emptyValues,setValue,resolve,validateValue} from './vendor/layer-kit/index.js';

export function initSpatialLayerEditor({manifest,layerHost,persistence,getScene,showSpace,showProject}){
  const settings=document.querySelector('#settings-dialog');
  const launch=document.createElement('button');launch.type='button';launch.className='layer-launch';launch.textContent='공간 레이어 수정';settings.querySelector('h2').after(launch);
  const toggle=document.createElement('button');toggle.type='button';toggle.id='layer-edit-toggle';toggle.textContent='레이어 수정';toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-controls','spatial-layer-editor');document.querySelector('.gallery-toolbar').prepend(toggle);
  const panel=document.createElement('aside');panel.id='spatial-layer-editor';panel.hidden=true;panel.setAttribute('aria-labelledby','layer-editor-title');
  panel.innerHTML=`<header><div><small>SPACE EDITOR</small><h2 id="layer-editor-title">공간 레이어</h2></div><button type="button" id="layer-edit-close" aria-label="레이어 수정 모드 닫기">×</button></header>
    <p class="layer-edit-help">화면에서 선택하고 끌어 옮기세요. 위치는 아래 숫자로도 수정할 수 있습니다.</p>
    <details class="layer-scope-options"><summary>장면·화면 적용 범위</summary><div class="layer-scopes"><label>적용 장면<select id="layer-scene"><option value="all">모든 장면</option></select></label><label>적용 화면<select id="layer-screen"><option value="base">모든 화면</option><option value="mobile">모바일</option></select></label></div></details>
    <label class="layer-picker">편집할 레이어<select id="layer-pick"></select></label><p id="layer-drag-hint"></p><div id="layer-fields"></div>
    <footer><p id="layer-status" role="status"></p><div class="layer-edit-actions"><button type="button" id="layer-save">저장</button><button type="button" id="layer-undo">되돌리기</button><button type="button" id="layer-restore">저장본 복구</button><button type="button" id="layer-reset">초기화</button><button type="button" id="layer-export">JSON 내보내기</button><button type="button" id="layer-editor-recover">편집 창 복구</button></div></footer>`;
  const outline=document.createElement('div');outline.id='layer-selection';outline.hidden=true;outline.innerHTML='<button type="button" id="layer-drag-handle" aria-label="선택 레이어 이동">↔ 이동</button>';
  document.body.append(panel,outline);layerHost.refresh();
  panel.querySelector('.layer-scope-options').open=innerWidth>800;
  const sceneScope=panel.querySelector('#layer-scene'),screenScope=panel.querySelector('#layer-screen'),picker=panel.querySelector('#layer-pick'),fields=panel.querySelector('#layer-fields'),status=panel.querySelector('#layer-status'),hint=panel.querySelector('#layer-drag-hint'),handle=outline.querySelector('button');
  status.textContent=persistence.message;
  const saveButton=panel.querySelector('#layer-save');if(!persistence.canPublish)saveButton.textContent='브라우저 초안 저장';
  for(const [id,item]of Object.entries(manifest.scenes)){const option=new Option(item.label,id);sceneScope.append(option);}
  for(const layer of manifest.layers)picker.append(new Option(layer.label,layer.id));
  picker.value='courtyard-trees';
  let saved=persistence.canPublish?persistence.published:layerHost.values,opened=false,drag=null,animation=0,history=[],saving=false;
  const layer=()=>manifest.layers.find(l=>l.id===picker.value);
  const worldLayer=()=>['courtyard-trees','courtyard-tree-back','potato-card','potato-shadow'].includes(picker.value);
  const positionKeys=()=>picker.value.startsWith('courtyard-')?['x','z']:['positionX','positionY'];
  const scoped=()=>resolve(manifest,layerHost.values,sceneScope.value,screenScope.value==='mobile'?['mobile']:[])[picker.value];
  function positionScope(){
    const values=layerHost.values,current=layerHost.scene,mobile=matchMedia(manifest.breakpoints.find(b=>b.id==='mobile').media).matches,keys=positionKeys();
    const has=map=>keys.some(key=>Object.hasOwn(map?.[picker.value]||{},key));
    if(screenScope.value==='mobile'&&!mobile)screenScope.value='base';
    if(mobile&&has(values.scenes[current]?.responsive.mobile)){sceneScope.value=current;screenScope.value='mobile';}
    else if(has(values.scenes[current]?.base)){sceneScope.value=current;screenScope.value=mobile?'mobile':'base';}
    else if(mobile&&has(values.responsive.mobile))screenScope.value='mobile';
    draw();
  }
  const dirty=()=>JSON.stringify(saved)!==JSON.stringify(layerHost.values);
  const inputValue=input=>layer().params[input.dataset.param].type==='boolean'?input.checked:layer().params[input.dataset.param].type==='number'?Number(input.value):input.value;
  function valid(input){const p=layer().params[input.dataset.param];input.setCustomValidity('');if(!validateValue(p,inputValue(input))||p.type==='number'&&input.value==='')input.setCustomValidity('설정 범위에 맞는 값을 입력하세요.');if(!input.checkValidity()){status.textContent='입력값을 확인한 뒤 저장해 주세요.';input.reportValidity();return false;}return true;}
  function badge(){toggle.textContent=dirty()?'레이어 수정 · 미저장':'레이어 수정';panel.querySelector('#layer-undo').disabled=!history.length;}
  function remember(){history.push(layerHost.values);if(history.length>30)history.shift();badge();}
  function apply(values){try{layerHost.setValues(values);status.textContent=dirty()?'미저장 변경 · 저장을 누르면 유지됩니다.':'저장된 상태입니다.';badge();}catch(error){status.textContent=error.message;}}
  function setPosition(first,second){let values=layerHost.values;positionKeys().forEach((key,i)=>{const p=layer().params[key];const number=Math.round(Math.max(p.min,Math.min(p.max,i?second:first))*1000)/1000;values=setValue(values,sceneScope.value,screenScope.value,picker.value,key,number);});apply(values);syncInputs();}
  function syncInputs(){const values=scoped();for(const input of fields.querySelectorAll('[data-param]')){const param=layer().params[input.dataset.param],value=values[input.dataset.param];if(param.type==='boolean')input.checked=value;else input.value=value;}}
  function draw(){
    document.body.dataset.layerSelected=picker.value;
    fields.replaceChildren();const values=scoped(),keys=positionKeys();
    const entries=Object.entries(layer().params);entries.sort(([a],[b])=>Number(keys.includes(b))-Number(keys.includes(a)));
    for(const [name,param]of entries){const label=document.createElement('label');label.className='layer-edit-field';const text=document.createElement('span');text.textContent=(param.label||name)+(param.unit?` (${param.unit})`:'');
      const input=document.createElement('input');input.dataset.param=name;input.setAttribute('aria-label',`${layer().label} ${param.label||name}`);input.type=param.type==='boolean'?'checkbox':param.type==='number'?'number':param.type==='color'?'color':'text';
      if(param.type==='number'){input.min=param.min;input.max=param.max;input.step='any';}if(param.maxLength)input.maxLength=param.maxLength;
      if(param.type==='boolean')input.checked=values[name];else input.value=values[name];
      input.addEventListener('input',()=>input.setCustomValidity(''));
      input.addEventListener('change',()=>{if(!valid(input))return;remember();apply(setValue(layerHost.values,sceneScope.value,screenScope.value,picker.value,name,inputValue(input)));});
      label.append(text,input);fields.append(label);
    }
    hint.textContent=worldLayer()?(picker.value.startsWith('courtyard-')?'바닥에서 이동 · 건물 침범은 자동 제한됩니다.':'작품 평면에서 이동 · 단위는 m입니다.'):'화면 위치를 이동합니다 · 단위는 px입니다.';
    if(positionKeys().some(key=>values[key]!==layerHost.get(picker.value,key)))hint.textContent+=' 현재 화면의 개별 설정이 우선 적용됩니다. 드래그는 현재 범위로 전환됩니다.';
    if(picker.value==='editor')hint.textContent='편집 창의 모양을 조정합니다. 숨긴 경우 상단 버튼으로 복구하세요.';
    updateOutline();
  }
  function reveal(){const model=getScene();if(picker.value.startsWith('courtyard-')||picker.value==='intro')model?.reset();else if(picker.value.startsWith('potato-')||picker.value==='detail')showProject('potato-designer');model?.setEditing(true);if(sceneScope.value!=='all')sceneScope.value=layerHost.scene;}
  function choose(id){if(drag)cancelDrag();picker.value=id;reveal();draw();}
  function updateOutline(){
    if(!opened)return;let rect;
    if(worldLayer())rect=getScene()?.getLayerFrame(picker.value);
    else if(picker.value!=='editor'){
      const boxes=[...document.querySelectorAll(layer().el)].filter(el=>!el.hidden&&getComputedStyle(el).display!=='none'&&getComputedStyle(el).visibility!=='hidden'&&Number(getComputedStyle(el).opacity)>0).map(el=>el.getBoundingClientRect()).filter(r=>r.width&&r.height);
      if(boxes.length){const left=Math.min(...boxes.map(r=>r.left)),top=Math.min(...boxes.map(r=>r.top));rect={left,top,width:Math.max(...boxes.map(r=>r.right))-left,height:Math.max(...boxes.map(r=>r.bottom))-top};}
    }
    const available=innerWidth-(innerWidth>800?panel.getBoundingClientRect().width:0);
    outline.hidden=!rect||rect.left+rect.width<0||rect.left>available||rect.top+rect.height<0||rect.top>innerHeight;
    if(outline.hidden)return;
    Object.assign(outline.style,{left:`${rect.left}px`,top:`${rect.top}px`,width:`${rect.width}px`,height:`${rect.height}px`});
    handle.textContent=`↔ ${layer().label}`;
    handle.style.maxWidth=`${Math.min(260,available-16)}px`;
    const width=handle.getBoundingClientRect().width;
    handle.style.left=`${Math.max(8,Math.min(rect.left,available-width-8))-rect.left}px`;handle.style.top=`${Math.max(8,Math.min(rect.top-38,innerHeight-45))-rect.top}px`;
  }
  function follow(){updateOutline();animation=requestAnimationFrame(follow);}
  function recover(){if(layerHost.get('editor','visible')&&layerHost.get('editor','opacity')>0)return;let values=layerHost.values;for(const key of ['visible','opacity'])values=setValue(values,'all','base','editor',key,layerHost.manifest.layers.find(l=>l.id==='editor').params[key].default);for(const scene of Object.keys(manifest.scenes))for(const screen of ['base','mobile'])for(const key of ['visible','opacity'])values=setValue(values,scene,screen,'editor',key,undefined);for(const key of ['visible','opacity'])values=setValue(values,'all','mobile','editor',key,undefined);apply(values);}
  function open(){if(opened){recover();panel.querySelector('#layer-pick').focus();return;}settings.close();showSpace();scrollTo({top:0,behavior:'instant'});opened=true;document.body.dataset.layerEditing='true';panel.hidden=false;toggle.setAttribute('aria-expanded','true');recover();reveal();draw();follow();picker.focus();}
  function close(){if(drag)cancelDrag();opened=false;document.body.removeAttribute('data-layer-editing');document.body.removeAttribute('data-layer-selected');panel.hidden=true;outline.hidden=true;cancelAnimationFrame(animation);getScene()?.setEditing(false);toggle.setAttribute('aria-expanded','false');badge();toggle.focus();}
  async function save(){
    if(drag||saving)return;for(const input of fields.querySelectorAll('[data-param]'))if(!valid(input))return;if(fields.contains(document.activeElement))document.activeElement.blur();
    saving=true;saveButton.disabled=true;status.textContent='저장 중…';
    try{const result=await persistence.save(layerHost.values);saved=result.values;status.textContent=result.message+(dirty()?' 추가 변경은 미저장입니다.':'');}
    catch(error){status.textContent=`저장하지 못했습니다. ${error.message} 변경은 화면에 남아 있습니다. JSON으로 내보내 보관할 수 있습니다.`;}
    finally{saving=false;saveButton.disabled=false;badge();}
  }
  function startDrag(event){
    if(event.button!==0||drag||!opened||picker.value==='editor')return;
    positionScope();
    const anchor=worldLayer()?getScene()?.getLayerFrame(picker.value)?.anchor:null;
    const offset=anchor?{x:anchor.x-event.clientX,y:anchor.y-event.clientY}:{x:0,y:0};
    const point=worldLayer()?getScene()?.layerEditPoint(picker.value,event.clientX+offset.x,event.clientY+offset.y):{x:event.clientX,y:event.clientY};if(!point)return;
    const values=scoped(),keys=positionKeys();drag={pointer:event.pointerId,start:point,offset,first:values[keys[0]],second:values[keys[1]],values:layerHost.values};handle.setPointerCapture(event.pointerId);event.preventDefault();handle.focus({preventScroll:true});
  }
  function cancelDrag(){if(!drag)return;const previous=drag;drag=null;apply(previous.values);if(handle.hasPointerCapture(previous.pointer))handle.releasePointerCapture(previous.pointer);syncInputs();}
  handle.addEventListener('pointerdown',startDrag);
  document.addEventListener('pointerdown',event=>{
    if(!opened||drag||event.button!==0||panel.contains(event.target)||event.target===toggle||outline.contains(event.target)||event.target.closest('#settings-dialog'))return;
    let id;if(event.target.closest('#scene'))id=getScene()?.pickLayer(event.clientX,event.clientY)||'stage';
    else id=manifest.layers.find(l=>!['editor','courtyard-trees','courtyard-tree-back','potato-card','potato-shadow','stage'].includes(l.id)&&event.target.closest(l.el))?.id;
    if(!id)return;event.preventDefault();event.stopPropagation();choose(id);startDrag(event);
  },true);
  document.addEventListener('pointermove',event=>{if(!drag||drag.pointer!==event.pointerId)return;const point=worldLayer()?getScene()?.layerEditPoint(picker.value,event.clientX+drag.offset.x,event.clientY+drag.offset.y):{x:event.clientX,y:event.clientY};if(point)setPosition(drag.first+point.x-drag.start.x,drag.second+point.y-drag.start.y);},true);
  handle.addEventListener('pointerup',event=>{if(!drag||drag.pointer!==event.pointerId)return;const previous=drag;drag=null;if(JSON.stringify(previous.values)!==JSON.stringify(layerHost.values)){history.push(previous.values);if(history.length>30)history.shift();}if(handle.hasPointerCapture(event.pointerId))handle.releasePointerCapture(event.pointerId);badge();});
  for(const event of ['pointercancel','lostpointercapture'])handle.addEventListener(event,e=>{if(drag?.pointer===e.pointerId)cancelDrag();});
  document.addEventListener('click',event=>{if(opened&&!panel.contains(event.target)&&event.target!==toggle&&!event.target.closest('#settings-dialog')){event.preventDefault();event.stopPropagation();}},true);
  document.addEventListener('keydown',event=>{
    if(!opened)return;
    if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='s'){event.preventDefault();save();return;}
    if(event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();if(drag)cancelDrag();else close();return;}
    if(event.target===handle&&event.key.startsWith('Arrow')){event.preventDefault();positionScope();const values=scoped(),keys=positionKeys(),step=(worldLayer()? .05:1)*(event.shiftKey?10:1),vertical=picker.value.startsWith('potato-')?-1:1;remember();setPosition(values[keys[0]]+(event.key==='ArrowRight'?step:event.key==='ArrowLeft'?-step:0),values[keys[1]]+vertical*(event.key==='ArrowDown'?step:event.key==='ArrowUp'?-step:0));}
  },true);
  toggle.addEventListener('click',()=>opened?recover():open());launch.addEventListener('click',open);panel.querySelector('#layer-edit-close').addEventListener('click',close);
  picker.addEventListener('change',()=>choose(picker.value));for(const scope of [sceneScope,screenScope])scope.addEventListener('change',()=>{if(drag)cancelDrag();if(sceneScope.value==='exterior')getScene()?.reset();else if(sceneScope.value==='hall')getScene()?.showEditScene('hall');else if(sceneScope.value==='project')showProject('potato-designer');getScene()?.setEditing(true);draw();});
  panel.querySelector('#layer-save').addEventListener('click',save);
  panel.querySelector('#layer-undo').addEventListener('click',()=>{const values=history.pop();if(values){apply(values);draw();}});
  panel.querySelector('#layer-restore').addEventListener('click',()=>{remember();apply(saved);draw();});
  panel.querySelector('#layer-reset').addEventListener('click',()=>{remember();apply(emptyValues(manifest));draw();});
  panel.querySelector('#layer-editor-recover').addEventListener('click',()=>{remember();recover();draw();});
  panel.querySelector('#layer-export').addEventListener('click',()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(layerHost.values,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='jooho-lab-layers.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
  layerHost.subscribe(()=>{if(opened)updateOutline();});badge();
  window.addEventListener('spatial-scene-ready',()=>{if(opened){reveal();draw();}});
}
