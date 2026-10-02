import {layerHost,inspectScene} from '/app.js';
import {readPreferences,setPreferences} from '/preferences.js';
import {setValue} from '/vendor/layer-kit/index.js';
import {projects} from '/projects.js';
const $=s=>document.querySelector(s),results=[];
const mode=new URL(location.href).searchParams.get('qa');
const report=document.createElement('pre');report.id='qa-report';report.style.cssText='position:relative;z-index:100;background:#fff;color:#111;padding:20px;white-space:pre-wrap;overflow-wrap:anywhere';document.body.append(report);
const check=(name,pass,detail='')=>{results.push({name,pass,detail});report.textContent=JSON.stringify({status:'running',results},null,2);if(!pass)throw Error(name+': '+detail)};
const wait=async(test,ms=12000)=>{const start=performance.now();while(!test()){if(performance.now()-start>ms)throw Error('Timed out');await new Promise(r=>setTimeout(r,60));}};
const click=s=>$(s).click();
const wheel=(deltaY,extra={})=>{const event=new WheelEvent('wheel',{deltaY,bubbles:true,cancelable:true,...extra});$('#scene').dispatchEvent(event);return event.defaultPrevented;};
const savedPreferences=readPreferences(),savedLayers=layerHost.values;
try{
  await wait(()=>inspectScene());check('GLB loaded / exterior',inspectScene().state==='exterior');
  // A prior context-loss run may leave a saved list-view visit on reload.
  click('#space-view');await wait(()=>inspectScene().geometries>7);
  check('scene uses real meshes',inspectScene().geometries>7&&inspectScene().drawCalls>0,JSON.stringify(inspectScene()));check('one selector per project',$('#gallery-pagination').children.length===projects.length);
  await wait(()=>inspectScene().posters===Math.min(projects.length,7));check('posters fill the seven baked bays',inspectScene().posters===Math.min(projects.length,7));
  check('architecture exports real PBR normal and roughness maps',inspectScene().surfaces.normalMap&&inspectScene().surfaces.roughnessMap);
  check('photographed HDRI environment loaded',inspectScene().surfaces.environment==='HDRI');
  check('photographed gravel PBR maps loaded',inspectScene().surfaces.gravelMaps);
  check('six repeating architectural materials / separate AO',inspectScene().surfaces.detailMaterials===6&&inspectScene().surfaces.occlusionMap);
  check('baked gallery fixtures cover every wall artwork',inspectScene().surfaces.galleryLights===Math.min(projects.length,7)&&inspectScene().surfaces.galleryLightMap);
  await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
  check('seven curated wall artworks and all rail thumbnails',projects.slice(0,7).every(p=>p.image?.startsWith('./assets/exhibit-'))&&$('#gallery-pagination').querySelectorAll('img').length===projects.length);
  check('no horizontal overflow',document.documentElement.scrollWidth<=innerWidth+1);
  setPreferences({...savedPreferences,motion:'full'});
  if(mode==='mobile')check('mobile media queries active',matchMedia('(max-width:650px)').matches);
  check('SUIT font loaded',document.fonts.check('500 26px SUIT')&&getComputedStyle(document.body).fontFamily.includes('SUIT'));
  check('default mode is sequential camera tour',$('#movement-toggle').getAttribute('aria-pressed')==='false');
  click('#movement-toggle');check('drag mode preserves page wheel',!wheel(120)&&inspectScene().state==='exterior');click('#movement-toggle');
  check('pinch zoom preserved',!wheel(120,{ctrlKey:true}));check('horizontal scroll preserved',!wheel(4,{deltaX:100}));
  const t=performance.now();check('wheel advances into hall',wheel(120));wheel(120);check('same gesture cannot skip hall',inspectScene().destination==='hall');await wait(()=>inspectScene().state==='hall');check('real doorway / hall destination',Math.abs(inspectScene().camera[2]-3)<.01);check('travel is time based',performance.now()-t<8500,String(performance.now()-t));
  const approachStart=performance.now();wheel(120);await wait(()=>inspectScene().state==='project');const first=$('#gallery-pagination button').dataset.id;check('hall advances to first work',inspectScene().selected===first);
  check('slow approach to close viewing aisle',performance.now()-approachStart>=3000&&Math.abs(inspectScene().camera[2]+4.185)<.001);
  const imageWidth=()=>Math.max(...inspectScene().artwork.corners.map(p=>p.x))-Math.min(...inspectScene().artwork.corners.map(p=>p.x));
  const widthBeforeSlide=imageWidth(),artHeight=Math.max(...inspectScene().artwork.corners.map(p=>p.y))-Math.min(...inspectScene().artwork.corners.map(p=>p.y));
  // Portrait art fills the vertical viewing area; forcing landscape width would crop it.
  check('selected artwork fills its viewing area',widthBeforeSlide>$('#scene').clientWidth*(innerWidth<=1000?.6:.32)||artHeight>$('#scene').clientHeight*(innerWidth<=1000?.25:.32));
  const depth=inspectScene().camera[2];wheel(120);await new Promise(r=>setTimeout(r,350));check('wheel next slides laterally',Math.abs(inspectScene().camera[2]-depth)<.001);await wait(()=>inspectScene().state==='project');
  check('sideways movement preserves artwork magnification',Math.abs(imageWidth()-widthBeforeSlide)<1);
  wheel(-120);await wait(()=>inspectScene().state==='project');check('wheel up returns to previous work',inspectScene().selected===first);click('#movement-toggle');check('drag mode releases wheel',!wheel(120));
  click('#gallery-pagination button[data-id="chemiforge"]');await new Promise(r=>setTimeout(r,250));click('#gallery-pagination button[data-id="sasu"]');await wait(()=>inspectScene().state==='project');check('interrupted selection reaches latest project',inspectScene().selected==='sasu');
  check('project description visible',getComputedStyle($('#project-detail')).display!=='none');check('direct URL preserved',$('#project-detail .primary-link').href==='https://sasu-alpha.vercel.app/');
  const beforeDrag=inspectScene().renderCamera;
  $('#scene').dispatchEvent(new PointerEvent('pointerdown',{pointerId:91,button:0,clientX:200,clientY:200,bubbles:true}));
  $('#scene').dispatchEvent(new PointerEvent('pointermove',{pointerId:91,clientX:400,clientY:280,bubbles:true}));
  await wait(()=>Math.abs(inspectScene().renderCamera[0]-beforeDrag[0])>.1);
  check('camera moves while pointer is still held',inspectScene().dragging&&inspectScene().selected==='sasu');
  $('#scene').dispatchEvent(new PointerEvent('pointerdown',{pointerId:92,button:0,clientX:50,clientY:50,bubbles:true}));$('#scene').dispatchEvent(new PointerEvent('pointerup',{pointerId:92,button:0,clientX:50,clientY:50,bubbles:true}));check('second pointer cannot interrupt active drag',inspectScene().dragging);
  const orbitBefore=inspectScene().orbit.x;
  $('#scene').dispatchEvent(new PointerEvent('pointermove',{pointerId:91,clientX:100,clientY:150,bubbles:true}));await wait(()=>inspectScene().orbit.x>orbitBefore+.05);
  check('drag reverses camera continuously',inspectScene().dragging);
  $('#scene').dispatchEvent(new PointerEvent('pointerup',{pointerId:91,button:0,clientX:100,clientY:150,bubbles:true}));
  check('drag release does not select another work',!inspectScene().dragging&&inspectScene().selected==='sasu');
  $('#scene').dispatchEvent(new PointerEvent('pointerdown',{pointerId:93,button:0,clientX:200,clientY:200,bubbles:true}));
  $('#scene').dispatchEvent(new PointerEvent('pointercancel',{pointerId:93,bubbles:true}));
  check('pointer cancellation releases drag',!inspectScene().dragging&&inspectScene().selected==='sasu');
  click('#movement-toggle');await wait(()=>Math.abs(inspectScene().orbit.x)<.001);
  const hoverBefore=inspectScene().renderCamera[0];$('#scene').dispatchEvent(new PointerEvent('pointermove',{clientX:innerWidth,clientY:innerHeight/2,bubbles:true}));await wait(()=>Math.abs(inspectScene().renderCamera[0]-hoverBefore)>.03);check('focused artwork keeps pointer camera motion',inspectScene().state==='project');$('#scene').dispatchEvent(new PointerEvent('pointerleave'));
  click('#spatial-back');await wait(()=>inspectScene().state==='hall');click('#spatial-back');await wait(()=>inspectScene().state==='exterior');check('back through hall to exterior',inspectScene().camera[2]===24);
  setPreferences({...savedPreferences,motion:'reduce'});click('#gallery-pagination button[data-id="day-walk"]');check('reduced motion is immediate',inspectScene().state==='project');
  for(const button of $('#gallery-pagination').children){
    button.click();const art=inspectScene().artwork,rect=$('#project-detail').getBoundingClientRect(),stage=$('#scene').getBoundingClientRect();
    check(`full artwork ${button.dataset.id}`,art.repeat.every(v=>v===1)&&art.offset.every(v=>v===0)&&art.corners.every(p=>p.x>=0&&p.x<=stage.width&&p.y>=0&&p.y<=stage.height));
    const left=Math.min(...art.corners.map(p=>p.x)),right=Math.max(...art.corners.map(p=>p.x)),top=Math.min(...art.corners.map(p=>p.y)),bottom=Math.max(...art.corners.map(p=>p.y));
    check(`copy clears artwork ${button.dataset.id}`,right<=rect.left-stage.left||left>=rect.right-stage.left||bottom<=rect.top-stage.top||top>=rect.bottom-stage.top,JSON.stringify({left,right,top,bottom,copy:rect.toJSON()}));
  }
  click('#movement-toggle');
  for(const direction of [-1,1]){
    $('#scene').dispatchEvent(new PointerEvent('pointerdown',{pointerId:94,button:0,clientX:200,clientY:200,bubbles:true}));
    $('#scene').dispatchEvent(new PointerEvent('pointermove',{pointerId:94,clientX:200+direction*innerWidth,clientY:200+direction*innerHeight,bubbles:true}));
    await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
    const stage=$('#scene').getBoundingClientRect(),art=inspectScene().artwork,copy=$('#project-detail').getBoundingClientRect();
    check(`bounded orbit keeps full artwork ${direction}`,art.corners.every(p=>p.x>=0&&p.x<=stage.width&&p.y>=0&&p.y<=stage.height));
    check(`bounded orbit clears copy ${direction}`,Math.min(...art.corners.map(p=>p.x))>=copy.right-stage.left||Math.max(...art.corners.map(p=>p.y))<=copy.top-stage.top);
    $('#scene').dispatchEvent(new PointerEvent('pointerup',{pointerId:94,button:0,clientX:200+direction*innerWidth,clientY:200+direction*innerHeight,bubbles:true}));
  }
  click('#movement-toggle');
  check('last work releases downward wheel',!wheel(120));click('#movement-toggle');
  $('#space').focus();$('#space').dispatchEvent(new KeyboardEvent('keydown',{key:'Home',bubbles:true}));check('Home returns to exterior',inspectScene().state==='exterior');
  $('#space').dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}));check('Enter enters hall',inspectScene().state==='hall');$('#space').dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
  check('Escape only releases movement control',$('#movement-toggle').getAttribute('aria-pressed')==='false'&&inspectScene().state==='hall');
  $('#space').dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));check('second Escape exits hall',inspectScene().state==='exterior');
  // Probe each layer parameter against its concrete attribute or computed-style binding.
  const props={opacity:'opacity',visible:'visibility',x:'left',y:'top',size:'width',color:'color',height:'height',width:'width',gap:'gap',bottom:'bottom',paper:'background-color',ink:'color',shade:'opacity',brightness:'filter'};
  for(const layer of layerHost.manifest.layers)for(const [key,param]of Object.entries(layer.params)){
    const node=param.attr?$(param.attr[0]):$(layer.el.split(',')[0]);
    const property=layer.id==='intro'&&key==='size'?'font-size':layer.id==='landscape'&&key==='color'?'background-color':props[key];
    const target=key==='shade'?$('.space'):layer.id==='intro'&&key==='size'?$('.intro h1'):layer.id==='landscape'&&key==='color'?$('.exhibition'):layer.id==='rail'&&key==='size'?$('.film-card'):key==='paper'||key==='ink'?$('.index-section'):node;
    const computed=()=>getComputedStyle(target,key==='shade'?'::after':null).getPropertyValue(property);
    const before=param.attr?node.getAttribute(param.attr[1]):key==='visible'?node.hasAttribute('data-layer-hidden'):computed();
    const current=layerHost.get(layer.id,key);let value=param.type==='boolean'?!current:param.type==='number'?(current===param.min?param.max:param.min):param.type==='color'?'#193da9':param.type==='image'?'./assets/dawn.webp':'테스트 입장';
    // CSS/attribute bindings are synchronous; renderer uniforms update in the
    // MutationObserver microtask. A timer observes both without waiting for a
    // throttled background iframe animation frame for every parameter.
    layerHost.setValues(setValue(savedLayers,layerHost.scene,'base',layer.id,key,value));await new Promise(r=>setTimeout(r,40));
    const after=param.attr?node.getAttribute(param.attr[1]):key==='visible'?node.hasAttribute('data-layer-hidden'):computed();
    check(`layer ${layer.id}.${key}`,before!==after,`${before} -> ${after}`);
    if(layer.id==='stage'&&key in inspectScene().surfaces)check(`renderer ${key}`,inspectScene().surfaces[key]===value,JSON.stringify(inspectScene().surfaces));
    layerHost.setValues(savedLayers);
  }
  check('renderer survives layer changes',inspectScene().drawCalls>0);
  layerHost.setValues(setValue(savedLayers,'all','base','shell','visible',false));check('hidden shell preserves settings recovery',getComputedStyle($('#settings-open')).display!=='none'&&!$('#settings-open').closest('[data-layer-hidden]'));layerHost.setValues(savedLayers);
  $('#search').value='no-such-project-qa';$('#search').dispatchEvent(new Event('input',{bubbles:true}));check('empty search state',!$('#empty-state').hidden&&$('#gallery-pagination').children.length===0);
  click('#spatial-enter');check('empty hall disables destination button',$('#spatial-enter').disabled);
  $('#search').value='';$('#search').dispatchEvent(new Event('input',{bubbles:true}));check('search restore',$('#gallery-pagination').children.length===projects.length);
  click('#list-view');check('list fallback accessible',!$('#project-grid').hidden&&$('#project-grid').children.length===projects.length);click('#space-view');
  click('#settings-open');click('.layer-launch');check('layer settings opens',$('.layers-dialog').open);$('.layers-dialog').close();
  check('draw calls under budget',inspectScene().drawCalls<65,JSON.stringify(inspectScene()));
  const gl=$('#scene canvas').getContext('webgl2');gl.getExtension('WEBGL_lose_context').loseContext();await wait(()=>$('#space-view').disabled);check('context loss exposes list',!$('#project-grid').hidden);setPreferences({...readPreferences(),view:'list'});setPreferences({...readPreferences(),view:'space'});check('preferences cannot reenter failed space',!$('#project-grid').hidden&&$('#space').hidden);
  report.textContent=JSON.stringify({status:'PASS',mode,count:results.length,scene:inspectScene(),results},null,2);
}catch(error){report.textContent=JSON.stringify({status:'FAIL',mode,error:error.stack,results},null,2);}
finally{layerHost.setValues(savedLayers);setPreferences(savedPreferences);window.scrollTo(0,0);}
