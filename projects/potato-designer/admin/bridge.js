import { layerHost, studioAdapter } from '/app.js';
let editing=true,selected='character',onSelect=()=>{},onMove=()=>{},onScene=()=>{},onPage=()=>{};
const style=document.createElement('style');
style.textContent='.studio-selected{outline:2px dashed #dc593c!important;outline-offset:3px!important}html.studio-inspect *{transition:none!important}'+layerHost.manifest.layers.filter(layer=>layer.id!=='global').map(layer=>'html.studio-inspect '+layer.el).join(',')+'{pointer-events:auto!important}';document.head.append(style);
function elements(id){const layer=layerHost.manifest.layers.find(item=>item.id===id);return layer?[...document.querySelectorAll(layer.el)]:[];}
function highlight(){document.querySelectorAll('.studio-selected').forEach(el=>el.classList.remove('studio-selected'));if(editing)elements(selected).forEach(el=>el.classList.add('studio-selected'));}
function pick(x,y){
  for(const hit of document.elementsFromPoint(x,y)){for(let element=hit;element;element=element.parentElement){const layer=layerHost.manifest.layers.find(layer=>!['global','paper','stage','sheet'].includes(layer.id)&&element.matches(layer.el));if(layer)return layer.id;}}
  const dialog=document.querySelector('dialog[open]');let hits=[];
  for(const layer of layerHost.manifest.layers){if(['global','paper','stage'].includes(layer.id))continue;
    for(const el of elements(layer.id)){if(dialog&&el!==dialog&&!dialog.contains(el))continue;const rect=el.getBoundingClientRect();if(getComputedStyle(el).visibility==='hidden'||!rect.width||!rect.height)continue;
      if(x>=rect.left&&x<=rect.right&&y>=rect.top&&y<=rect.bottom)hits.push({id:layer.id,area:rect.width*rect.height});}
  }return hits.sort((a,b)=>a.area-b.area)[0]?.id;
}
let drag=null;
document.addEventListener('pointerdown',event=>{
  if(!editing||event.button!==0)return;const id=pick(event.clientX,event.clientY);if(!id)return;
  event.preventDefault();event.stopImmediatePropagation();selected=id;highlight();onSelect(id);
  drag={x:event.clientX,y:event.clientY,id,pointerId:event.pointerId};document.documentElement.setPointerCapture(event.pointerId);onMove(id,0,0,'start');
},true);
document.addEventListener('pointermove',event=>{if(!drag)return;event.preventDefault();onMove(drag.id,event.clientX-drag.x,event.clientY-drag.y,'move');},true);
function endDrag(){if(!drag)return;if(document.documentElement.hasPointerCapture(drag.pointerId))document.documentElement.releasePointerCapture(drag.pointerId);onMove(drag.id,0,0,'end');drag=null;}
document.addEventListener('pointerup',endDrag,true);
document.addEventListener('pointercancel',endDrag,true);
window.addEventListener('blur',endDrag);
document.addEventListener('click',event=>{if(editing){event.preventDefault();event.stopImmediatePropagation();}},true);
const animations=()=>document.getAnimations().filter(animation=>animation.effect?.target&&!animation.effect.target.closest('.studio-ignore'));
window.potatoStudio={
  host:layerHost,
  setValues(values){layerHost.setValues(JSON.parse(JSON.stringify(values)));highlight();},
  setScene(id){studioAdapter.setScene(id);highlight();},
  showPage(page){studioAdapter.showPage(page);highlight();},
  select(id){selected=id;highlight();},
  mode(value){editing=value;document.documentElement.classList.toggle('studio-inspect',value);highlight();},
  callbacks(select,move,scene,page){onSelect=select;onMove=move;onScene=scene||(()=>{});onPage=page||(()=>{});},
  scrub(ms){for(const animation of animations()){animation.pause();animation.currentTime=ms;}},
  restart(){studioAdapter.pause(false);studioAdapter.replay();},
  release(){for(const animation of animations())animation.play();},
  bounds(id){return elements(id).map(el=>el.getBoundingClientRect().toJSON());}
};
window.potatoStudio.mode(true);
layerHost.subscribe(({scene})=>onScene(scene));
new MutationObserver(()=>{const dialog=document.querySelector('dialog[open]');const page=dialog?.id==='work-dialog'?(document.querySelector('#work-detail').hidden?'work':'detail'):dialog?.id==='about-dialog'?'about':dialog?.id==='contact-dialog'?'contact':'home';onPage(page);}).observe(document.body,{subtree:true,attributes:true,attributeFilter:['open','hidden']});
