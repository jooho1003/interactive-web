import { createVillageMotion } from './village-motion.js';
import * as THREE from './assets/three.module.min.js';
import {layerHost as houseHost} from './village-layers.js';
import {layerHost} from './spatial-layers.js';

export function createGallery(container, projects, onSelect, onFailure, onOpen, getHref) {
  const renderer = new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.setClearColor(0,0);renderer.domElement.setAttribute('aria-hidden','true');container.append(renderer.domElement);
  const scene=new THREE.Scene(), camera=new THREE.OrthographicCamera(-10,10,7,-7,.1,80);
  camera.position.z=20;
  /* layer-fixed: authored original panorama coordinate system, 36 units and 2164/727 aspect. */
  const width=36, height=width/(2164/727);
  const sceneProjects=projects.filter(p=>houseHost.manifest.layers.some(l=>l.id==='house-'+p.id));
  const extension=container.querySelector('.village-extension');
  const houseValue=(id,key)=>houseHost.get('house-'+id,key);
  let selected='sasu',ids=sceneProjects.map(p=>p.id),frame=0,active=true,reduced=false,zoom=1.1,cameraSpeed=1,down=null,suppressClick=false,textureVersion=0;
  let x=houseValue('sasu','x'),goal=x,viewWidth=20,viewHeight=14,offset=0,parallax=0,last=0,dirty=true;
  let image=layerHost.get('stage','image');
  const tex=new THREE.TextureLoader().load(image,()=>{dirty=true;requestRender()},undefined,onFailure);tex.colorSpace=THREE.SRGBColorSpace;
  tex.anisotropy=Math.min(renderer.capabilities.getMaxAnisotropy(),4);
  const panorama=new THREE.Mesh(new THREE.PlaneGeometry(width,height),new THREE.MeshBasicMaterial({map:tex}));scene.add(panorama);
  const projectX=id=>houseValue(id,'x')??null;
  const motion=createVillageMotion(container,sceneProjects,onSelect,onOpen,projectX);
  const labels=sceneProjects.map((p,index)=>{
    const anchor=document.createElement('a');anchor.className='scene-label';anchor.href=getHref(p);anchor.dataset.worldProject=p.id;
    anchor.setAttribute('aria-label',p.title+' 건물로 들어가기');
    const text=document.createElement('span');text.className='world-label';text.textContent=p.title;
    const arrow=document.createElement('small');arrow.textContent='들어가기 ↗';text.append(arrow);anchor.append(text);
    anchor.addEventListener('click',event=>{
      if(suppressClick){event.preventDefault();return}
      if(!event.ctrlKey&&!event.metaKey&&!event.shiftKey&&!event.altKey){event.preventDefault();motion.enter(p.id)}
    });
    anchor.addEventListener('dragstart',e=>e.preventDefault());container.append(anchor);return {anchor,id:p.id,index};
  });
  function clamp(value){const half=viewWidth/camera.zoom/2,ext=houseHost.current['village-extension'];const right=Math.max(width/2,ext.x+ext.width/2);return THREE.MathUtils.clamp(value,-width/2+half,Math.max(-width/2+half,right-half))}
  function target(){const value=projectX(selected);if(value!==null)goal=value}
  function requestRender(){if(active&&!frame)frame=requestAnimationFrame(draw)}
  function resize(){const w=container.clientWidth,h=container.clientHeight;if(!w||!h)return;viewHeight=(w<620?12.4:11.6)/(zoom*layerHost.get('stage','zoom'));viewWidth=viewHeight*w/h;camera.left=-viewWidth/2;camera.right=viewWidth/2;camera.top=viewHeight/2;camera.bottom=-viewHeight/2;camera.position.y=w<620?-.25:0;camera.updateProjectionMatrix();renderer.setSize(w,h,false);target();dirty=true;requestRender()}
  function draw(now){frame=0;if(!active)return;const dt=Math.min((now-last)/1000||.016,.05);last=now;const blend=reduced?1:1-Math.exp(-dt*layerHost.get('stage','damping')*layerHost.get('stage','speed')*cameraSpeed);const aim=clamp(goal+offset+parallax);const moving=Math.abs(aim-x)>.001;x+=(aim-x)*blend;camera.position.x=x;camera.position.y=container.clientWidth<620?-.25:0;const cameraMoving=motion.update(now,dt,camera);camera.updateMatrixWorld();
    for(const {anchor,id,index} of labels){
      const cx=projectX(id),half=houseValue(id,'width')/2;
      const topY=(.5-houseValue(id,'top'))*height,bottomY=(.5-houseValue(id,'bottom'))*height;
      const a=new THREE.Vector3(cx-half,topY,.1).project(camera),b=new THREE.Vector3(cx+half,bottomY,.1).project(camera);
      const left=(a.x*.5+.5)*container.clientWidth,top=(-a.y*.5+.5)*container.clientHeight;
      anchor.style.left=left+'px';anchor.style.top=top+'px';anchor.style.width=((b.x-a.x)*.5*container.clientWidth)+'px';anchor.style.height=((a.y-b.y)*.5*container.clientHeight)+'px';
      anchor.hidden=!ids.includes(id)||b.x < -1||a.x > 1||(id==='hanbok-hero'&&selected!==id)||(id==='spire'&&selected==='hanbok-hero');anchor.classList.toggle('selected',id===selected);anchor.setAttribute('aria-current',String(id===selected));
    }
    const ext=houseHost.current['village-extension'];
    const ea=new THREE.Vector3(ext.x-ext.width/2,ext.y+ext.height/2,0).project(camera),eb=new THREE.Vector3(ext.x+ext.width/2,ext.y-ext.height/2,0).project(camera);
    extension.style.left=(ea.x*.5+.5)*container.clientWidth+'px';extension.style.top=(-ea.y*.5+.5)*container.clientHeight+'px';extension.style.width=(eb.x-ea.x)*.5*container.clientWidth+'px';extension.style.height=(ea.y-eb.y)*.5*container.clientHeight+'px';
    motion.decorate((wx,wy)=>{const v=new THREE.Vector3(wx,wy,.1).project(camera);return [(v.x*.5+.5)*container.clientWidth,(-v.y*.5+.5)*container.clientHeight]},ids,container.clientHeight,viewHeight);
    if(dirty||moving||cameraMoving){renderer.render(scene,camera);dirty=false}if(moving||cameraMoving||!reduced)requestRender();
  }
  const surface=container.parentElement;
  surface.addEventListener('pointerdown',e=>{if(motion.entering||e.button!==0||e.target.closest('button'))return;suppressClick=false,textureVersion=0;down={x:e.clientX,y:e.clientY,max:0};surface.classList.add('dragging')});
  surface.addEventListener('pointermove',e=>{
    if(motion.entering)return;
    if(down){const dx=e.clientX-down.x,dy=e.clientY-down.y;down.max=Math.max(down.max,Math.hypot(dx,dy));if(Math.abs(dx)>10&&Math.abs(dx)>Math.abs(dy)){surface.setPointerCapture(e.pointerId);offset=-dx/container.clientWidth*viewWidth}}
    else if(!reduced&&e.pointerType==='mouse'){const b=surface.getBoundingClientRect();parallax=((e.clientX-b.left)/b.width-.5)*layerHost.get('stage','parallax')}
    dirty=true;requestRender();
  });
  function reset(){down=null;offset=0;parallax=0;surface.classList.remove('dragging');dirty=true;requestRender()}
  surface.addEventListener('pointerup',e=>{
    if(!down)return;const dx=e.clientX-down.x,dy=e.clientY-down.y;suppressClick=down.max>8;
    if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy)&&ids.length>1){const i=ids.indexOf(selected);onSelect(ids[Math.max(0,Math.min(ids.length-1,i+(dx<0?1:-1)))]);}
    if(surface.hasPointerCapture(e.pointerId))surface.releasePointerCapture(e.pointerId);reset();setTimeout(()=>{suppressClick=false},0);
  });
  surface.addEventListener('pointercancel',()=>{suppressClick=true;reset()});surface.addEventListener('pointerleave',()=>{if(!down)reset()});
  let wheel=0,lastWheel=0;
  surface.addEventListener('wheel',e=>{if(motion.entering||e.ctrlKey||ids.length<2||Math.abs(e.deltaX)<=Math.abs(e.deltaY))return;e.preventDefault();const now=performance.now();if(now-lastWheel<450)return;wheel+=e.deltaX;if(Math.abs(wheel)>45){const i=ids.indexOf(selected);onSelect(ids[Math.max(0,Math.min(ids.length-1,i+(wheel>0?1:-1)))]);wheel=0;lastWheel=now}},{passive:false});
  renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();active=false;cancelAnimationFrame(frame);frame=0;onFailure()});
  extension.addEventListener('error',onFailure);
  houseHost.refresh();houseHost.subscribe(()=>{target();dirty=true;requestRender()});
  layerHost.subscribe(()=>{const next=layerHost.get('stage','image');if(next!==image){image=next;const version=++textureVersion;new THREE.TextureLoader().load(image,texture=>{if(version!==textureVersion){texture.dispose();return}texture.colorSpace=THREE.SRGBColorSpace;const previous=panorama.material.map;panorama.material.map=texture;previous.dispose();dirty=true;requestRender()},undefined,onFailure)}resize()});
  new ResizeObserver(resize).observe(container);resize();
  return {inspect(){return {active,selected,goal,x,frame,state:motion.entering?'entering':'walking',camera:[camera.position.x,camera.position.y,camera.zoom],viewHeight,drawCalls:renderer.info.render.calls,bindings:{zoom:layerHost.get('stage','zoom'),speed:layerHost.get('stage','speed'),damping:layerHost.get('stage','damping'),parallax:layerHost.get('stage','parallax')}}},back(){motion.pause()},refreshContent(value){cameraSpeed=value.cameraSpeed;motion.configure(value);const brightness=Math.min(1.15,.72+.28*value.lighting);panorama.material.color.setScalar(brightness);extension.style.setProperty('--scene-brightness',brightness);labels.forEach(({anchor,index})=>{const p=sceneProjects[index];anchor.href=getHref(p);anchor.setAttribute('aria-label',p.title+' 건물로 들어가기');const label=anchor.querySelector('.world-label');label.firstChild.textContent=p.title;});dirty=true;requestRender()},enter(id){if(ids.includes(id))motion.enter(id);else if(projects.some(p=>p.id===id)&&!sceneProjects.some(p=>p.id===id))onOpen(id)},select(id){if(!ids.includes(id))return;motion.select(id);selected=id;houseHost.setScene(id);target();dirty=true;requestRender()},filter(next){motion.pause();ids=next.filter(id=>sceneProjects.some(p=>p.id===id));dirty=true;requestRender()},reset(){motion.pause();onSelect('sasu');reset()},setReducedMotion(value){reduced=value;motion.reduce(value);reset()},setZoom(value){zoom=value;resize()},refreshLinks(){labels.forEach(({anchor,index})=>anchor.href=getHref(sceneProjects[index]))},setActive(value){if(!value)motion.pause();active=value;if(active){last=0;resize()}else{cancelAnimationFrame(frame);frame=0}}};
}
