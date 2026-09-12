
import * as THREE from './assets/three.module.min.js';
import { relativeSlot } from './gallery-layout.js';

export function createGallery(container, projects, onSelect, onFailure, onOpen, getHref) {
  const renderer = new THREE.WebGLRenderer({antialias:true, alpha:true, powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0,0);
  renderer.domElement.setAttribute('aria-hidden','true');
  container.append(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38,1,.1,100);
  camera.position.set(0,1,12);
  const raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2();
  scene.add(new THREE.HemisphereLight(0xffe8c2,0x243448,2.2));
  const warm = new THREE.DirectionalLight(0xffd6a0,4); warm.position.set(-3,7,5); scene.add(warm);
  const cool = new THREE.DirectionalLight(0x96bfff,2); cool.position.set(6,2,3); scene.add(cool);
  const cards = [];
  let ids=projects.map(p=>p.id), selected='dawn-store', active=true, reduced=false, frame=0;
  let down=null, drag=0, targetX=0, targetY=0, dirty=true, last=0;
  function requestRender(){if(active&&!frame)frame=requestAnimationFrame(draw)}
  function textureFor(project) {
    const canvas=document.createElement('canvas'); canvas.width=1400;canvas.height=900;
    const ctx=canvas.getContext('2d');
    const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
    texture.anisotropy=Math.min(renderer.capabilities.getMaxAnisotropy(),4);
    function paint(image){
      ctx.fillStyle='#172122';ctx.fillRect(0,0,1400,900);
      if(image){
        const scale=Math.max(1400/image.width,900/image.height);
        ctx.drawImage(image,(1400-image.width*scale)/2,(900-image.height*scale)/2,image.width*scale,image.height*scale);
      }else{
        const gradient=ctx.createLinearGradient(0,0,1400,900);
        gradient.addColorStop(0,project.color);gradient.addColorStop(1,'#101a20');
        ctx.globalAlpha=.32;ctx.fillStyle=gradient;ctx.fillRect(0,0,1400,900);ctx.globalAlpha=1;
        ctx.font='230px Georgia, serif';ctx.fillStyle=project.color;ctx.textAlign='center';
        ctx.fillText(project.mark,700,460);ctx.textAlign='left';
      }
      const shade=ctx.createLinearGradient(0,330,0,900);
      shade.addColorStop(0,'#060d1300');shade.addColorStop(1,'#060d13ed');
      ctx.fillStyle=shade;ctx.fillRect(0,0,1400,900);
      ctx.fillStyle='#e2c59c';ctx.font='22px Consolas, monospace';ctx.fillText(project.type,65,708);
      ctx.fillStyle='#fff4e3';ctx.font='500 66px Segoe UI, Malgun Gothic, sans-serif';ctx.fillText(project.title,60,797);
      ctx.font='23px Consolas, monospace';ctx.fillStyle='#ddd0ba';ctx.textAlign='right';ctx.fillText(project.number+' / 06',1335,800);ctx.textAlign='left';
      texture.needsUpdate=true;dirty=true;requestRender();
    }
    paint();
    if(project.image){const image=new Image();image.onload=()=>paint(image);image.src=project.image}
    return texture;
  }
  const fadeCanvas=document.createElement('canvas');fadeCanvas.width=4;fadeCanvas.height=256;
  const fadeContext=fadeCanvas.getContext('2d'),fade=fadeContext.createLinearGradient(0,0,0,256);
  fade.addColorStop(0,'#000');fade.addColorStop(.5,'#050505');fade.addColorStop(1,'#8a8a8a');
  fadeContext.fillStyle=fade;fadeContext.fillRect(0,0,4,256);
  const alphaMap=new THREE.CanvasTexture(fadeCanvas);
  projects.forEach((project)=>{
    const group=new THREE.Group();group.position.set(0,0,-15);
    const frameMaterial=new THREE.MeshStandardMaterial({color:0x8a8272,metalness:.8,roughness:.28});
    const body=new THREE.Mesh(new THREE.BoxGeometry(5.65,3.68,.14),frameMaterial);
    const map=textureFor(project);
    const material=new THREE.MeshBasicMaterial({map});
    const panel=new THREE.Mesh(new THREE.PlaneGeometry(5.5,3.535),material);panel.position.z=.081;panel.userData.id=project.id;
    const reflection=new THREE.Mesh(new THREE.PlaneGeometry(5.5,3.535),new THREE.MeshBasicMaterial({map,alphaMap,transparent:true,opacity:.26,depthWrite:false,side:THREE.DoubleSide}));
    reflection.scale.y=-.72;reflection.position.set(0,-3.25,-.03);
    group.add(body,panel,reflection);scene.add(group);
    const label=document.createElement('a');label.className='scene-label';label.href=getHref(project);label.textContent=project.title;
    label.setAttribute('aria-label',project.title+' 페이지로 입장');label.addEventListener('click',event=>{if(!event.ctrlKey&&!event.metaKey&&!event.shiftKey&&!event.altKey){event.preventDefault();onOpen(project.id)}});container.append(label);
    cards.push({id:project.id,group,panel,material,frameMaterial,reflection,label,slot:99});
  });
  function resize(){
    const w=container.clientWidth,h=container.clientHeight;if(!w||!h)return;
    camera.aspect=w/h;camera.fov=w<500?45:38;camera.updateProjectionMatrix();
    camera.position.z=w<500?15.3:12;
    renderer.setSize(w,h,false);dirty=true;requestRender();
  }
  function draw(now){
    frame=0;if(!active)return;
    const dt=Math.min((now-last)/1000||.016,.05);last=now;
    const blend=reduced?1:1-Math.exp(-dt*8);
    let moving=false;
    camera.position.x+=(targetX-camera.position.x)*blend;
    camera.position.y+=(.7+targetY-camera.position.y)*blend;
    camera.lookAt(0,-.35,0);camera.updateMatrixWorld();
    for(const card of cards){
      const index=ids.indexOf(card.id);
      const slot=index<0?99:relativeSlot(index,Math.max(0,ids.indexOf(selected)),ids.length);
      const visible=Math.abs(slot)<=1;
      const x=slot*4.7+drag,z=slot===0?1.2:-2.1,y=slot===0?.25:.08;
      if(visible&&!card.group.visible){card.group.position.set(x,y,z-1)}
      card.group.visible=visible;card.label.hidden=!visible;
      if(!visible)continue;
      const scale=slot===0?1:.76;
      const rotation=-Math.sign(slot)*.38;
      for(const [key,target] of [['x',x],['y',y],['z',z]]){
        const d=target-card.group.position[key];moving ||= Math.abs(d)>.001;
        card.group.position[key]+=d*blend;
      }
      moving ||= Math.abs(card.group.rotation.y-rotation)>.001||Math.abs(card.group.scale.x-scale)>.001;
      card.group.rotation.y+=(rotation-card.group.rotation.y)*blend;
      card.group.scale.setScalar(card.group.scale.x+(scale-card.group.scale.x)*blend);
      card.material.color.setScalar(slot===0?1:.52);
      card.frameMaterial.emissive.set(slot===0?0x362817:0);
      card.reflection.material.opacity=slot===0?.26:.1;
      card.group.updateMatrixWorld(true);
      const p=card.group.localToWorld(new THREE.Vector3(0,-2.03,.1)).project(camera);
      card.label.style.left=((p.x*.5+.5)*container.clientWidth)+'px';
      card.label.style.top=((-p.y*.5+.5)*container.clientHeight)+'px';
      card.label.classList.toggle('selected',slot===0);
      card.label.setAttribute('aria-current',String(slot===0));
    }
    if(dirty||moving||Math.abs(targetX-camera.position.x)>.001||Math.abs(.7+targetY-camera.position.y)>.001){
      renderer.render(scene,camera);dirty=false;requestRender();
    }
  }
  function hit(event){
    const b=container.getBoundingClientRect();pointer.set((event.clientX-b.left)/b.width*2-1,-(event.clientY-b.top)/b.height*2+1);
    raycaster.setFromCamera(pointer,camera);
    return raycaster.intersectObjects(cards.filter(c=>c.group.visible).map(c=>c.panel))[0]?.object.userData.id;
  }
  const surface=container.parentElement;
  surface.addEventListener('pointerdown',event=>{
    if(event.button!==0||event.target.closest('button,a'))return;
    down={x:event.clientX,y:event.clientY,distance:0};surface.setPointerCapture(event.pointerId);surface.classList.add('dragging');
  });
  surface.addEventListener('pointermove',event=>{
    if(down){
      const dx=event.clientX-down.x,dy=event.clientY-down.y;
      down.distance=Math.max(down.distance,Math.hypot(dx,dy));drag=reduced?0:THREE.MathUtils.clamp(dx*.005,-.65,.65);
    }else if(!reduced&&event.pointerType==='mouse'){
      const b=surface.getBoundingClientRect();targetX=((event.clientX-b.left)/b.width-.5)*.35;
      targetY=-((event.clientY-b.top)/b.height-.5)*.14;surface.style.cursor=hit(event)?'pointer':'grab';
    }
    dirty=true;requestRender();
  });
  surface.addEventListener('pointerup',event=>{
    if(!down)return;
    const dx=event.clientX-down.x,dy=event.clientY-down.y;
    if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)&&ids.length>1){
      const index=ids.indexOf(selected);onSelect(ids[(index+(dx<0?1:-1)+ids.length)%ids.length]);
    }else if(down.distance<7){const id=hit(event);if(id)onOpen(id)}
    down=null;drag=0;surface.classList.remove('dragging');if(surface.hasPointerCapture(event.pointerId))surface.releasePointerCapture(event.pointerId);
    dirty=true;requestRender();
  });
  let wheelDistance=0, lastWheel=0;
  surface.addEventListener('wheel',event=>{
    if(event.ctrlKey || Math.abs(event.deltaX)<=Math.abs(event.deltaY) || ids.length<2)return;
    event.preventDefault();
    const now=performance.now();if(now-lastWheel<450)return;
    wheelDistance+=event.deltaX*(event.deltaMode===1?16:1);
    if(Math.abs(wheelDistance)>45){const index=ids.indexOf(selected);onSelect(ids[(index+(wheelDistance>0?1:-1)+ids.length)%ids.length]);wheelDistance=0;lastWheel=now;}
  },{passive:false});
  function resetPointer(){down=null;drag=0;targetX=0;targetY=0;surface.classList.remove('dragging');dirty=true;requestRender()}
  surface.addEventListener('pointercancel',resetPointer);surface.addEventListener('pointerleave',()=>{if(!down)resetPointer()});
  renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();active=false;cancelAnimationFrame(frame);frame=0;onFailure()});
  new ResizeObserver(resize).observe(container);resize();requestRender();
  return {
    select(id){selected=id;dirty=true;requestRender()},
    filter(next){ids=next;dirty=true;requestRender()},
    reset:resetPointer,
    setReducedMotion(value){reduced=value;resetPointer()},
    setActive(value){active=value;if(value){last=0;resize();requestRender()}else{cancelAnimationFrame(frame);frame=0}}
  };
}
