import * as THREE from './assets/three.module.min.js';
import {GLTFLoader} from './assets/GLTFLoader.js';
import {exterior,exhibitPose,exhibitX,routeTo,sampleRoute,containArtwork,nextStop,cameraInputEnvelope} from './spatial-route.js';

export async function createGallery(container,projects,onSelect,onFailure,onOpen,onState=()=>{}){
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
  renderer.setClearColor(0x000000,0);renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  // Architecture and sun are static; reuse the shadow map during camera motion.
  renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=true;
  renderer.domElement.setAttribute('aria-hidden','true');container.append(renderer.domElement);
  const world=new THREE.Scene();world.fog=new THREE.Fog(0x9caeb7,32,95);
  const camera=new THREE.PerspectiveCamera(48,1,.08,140);
  world.add(new THREE.HemisphereLight(0xc9def0,0xc9a071,2.6));
  const sun=new THREE.DirectionalLight(0xffdcaa,3.5);sun.position.set(9,15,12);sun.castShadow=true;
  sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-22;sun.shadow.camera.right=22;sun.shadow.camera.top=20;sun.shadow.camera.bottom=-20;sun.shadow.bias=-.001;sun.shadow.normalBias=.05;world.add(sun);
  const fill=new THREE.PointLight(0xffd4a0,65,20,2);fill.position.set(0,3.5,-3);world.add(fill);
  const side=new THREE.PointLight(0xffc286,40,15,2);side.position.set(-5,3,1);world.add(side);
  const envScene=new THREE.Scene();envScene.background=new THREE.Color(0x92a6b1);
  for(const [x,y,z,sx,sy,sz,color,intensity] of [[0,8,0,18,1,12,0xffe1b2,3],[-10,2,0,1,8,16,0xb9d2e2,1.5],[8,2,0,1,8,16,0xffc18c,2]]){
    const m=new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz),new THREE.MeshBasicMaterial({color}));m.material.color.multiplyScalar(intensity);m.position.set(x,y,z);envScene.add(m);
  }
  const pmrem=new THREE.PMREMGenerator(renderer);const environment=pmrem.fromScene(envScene,.08);world.environment=environment.texture;
  envScene.traverse(o=>{o.geometry?.dispose();o.material?.dispose()});pmrem.dispose();
  let model;
  try{model=(await new GLTFLoader().loadAsync('./assets/lab-pavilion.glb')).scene;}
  catch(error){renderer.dispose();renderer.domElement.remove();environment.dispose();throw error;}
  model.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});world.add(model);
  const posterGroup=new THREE.Group();world.add(posterGroup);
  const textureLoader=new THREE.TextureLoader(),posters=new Map();
  await document.fonts.load('500 26px "SUIT"');
  function graphic(p){const canvas=document.createElement('canvas');canvas.width=512;canvas.height=652;const c=canvas.getContext('2d');c.fillStyle=p.color;c.fillRect(0,0,512,652);c.strokeStyle='#ffffff55';c.strokeRect(25,25,462,602);c.fillStyle='#fff4de';c.font='18px SUIT';c.fillText('JOOHO LAB / '+p.number,48,73);c.font='bold 94px SUIT';c.fillText(p.mark,48,310,415);c.font='26px SUIT';c.fillText(p.title,48,555,420);c.font='17px SUIT';c.fillText(p.category,48,590,420);const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;return texture;}
  projects.forEach((p,i)=>{
    const mesh=new THREE.Mesh(new THREE.PlaneGeometry(1.43,1.82),new THREE.MeshBasicMaterial({color:p.color}));
    mesh.position.set(exhibitX(i,projects.length),2.3,-6.585);mesh.userData.id=p.id;posterGroup.add(mesh);posters.set(p.id,{mesh,url:null,version:0});
  });
  let current={eye:[...exterior.eye],look:[...exterior.look]},selected=projects[0]?.id;
  let state='exterior',destination='exterior',transition=null,reduced=false,active=true,destroyed=false;
  let zoom=1,speed=1,lighting=1,raf=0,lastTime=performance.now(),visible=projects.map(p=>p.id),pointer={x:0,y:0},smoothPointer={x:0,y:0},down=null;
  let viewport={width:1,height:1},focusFrame={x:.5,y:.5,fov:48};
  let dragEnabled=false,drag=null;
  const orbit={x:0,y:0},smoothOrbit={x:0,y:0};
  const raycaster=new THREE.Raycaster();
  function announce(){container.dataset.stage=state;container.dataset.destination=destination;onState({state,destination,selected});}
  function travel(next,id=selected){
    selected=id;destination=next;
    const pose=exhibitPose(Math.max(0,projects.findIndex(p=>p.id===id)),projects.length);
    const points=routeTo(current,next,pose);
    const lateral=next==='project'&&current.eye[2]<2;
    const approach=Number(container.dataset.approachSeconds);
    transition={points,elapsed:0,duration:next==='exterior'?4.2:current.eye[2]>6?5.6+(next==='project'?approach-2.2:0):next==='project'?(lateral?Number(container.dataset.slideSeconds):approach):2.2};
    state='travel';pointer={x:0,y:0};orbit.x=0;orbit.y=0;announce();if(reduced){smoothOrbit.x=0;smoothOrbit.y=0;finish();}else wake();
  }
  function finish(){if(!transition)return;current=transition.points.at(-1);transition=null;state=destination;announce();render();}
  function resize(){const r=container.getBoundingClientRect();if(!r.width||!r.height)return;
    const mobile=r.width<650;renderer.setPixelRatio(Math.min(devicePixelRatio,mobile?1.25:1.75));renderer.setSize(r.width,r.height,false);
    viewport={width:r.width,height:r.height};camera.aspect=r.width/r.height;
    const compact=r.width<=1000;
    const left=compact?r.width*.08:Math.max(r.width*.47,r.width*.05+340+40),right=r.width*.92;
    const top=compact?r.height*.2:Math.max(175,r.height*.2),bottom=compact?r.height*.52:r.height-240;
    const height=Math.max(150,bottom-top),width=Math.max(170,right-left);
    // Fit the actual images, not their tall architectural backboards. One shared
    // frame keeps the magnification steady during lateral artwork changes.
    const artWidth=Math.max(...[...posters.values()].map(p=>1.43*p.mesh.scale.x));
    const artHeight=Math.max(...[...posters.values()].map(p=>1.82*p.mesh.scale.y));
    const span=Math.max(artHeight*r.height/height,artWidth*r.width/width/camera.aspect)*1.24;
    const pose=exhibitPose(0,projects.length),distance=pose.eye[2]-pose.look[2];
    focusFrame={x:(left+right)/2/r.width,y:(top+bottom)/2/r.height,fov:THREE.MathUtils.radToDeg(2*Math.atan(span/(2*distance)))};
    render();}
  function render(){
    if(destroyed)return;camera.position.fromArray(current.eye);
    const focus=current.focus||0;
    const baseFov=THREE.MathUtils.radToDeg(2*Math.atan(Math.tan(THREE.MathUtils.degToRad((Number(container.dataset.fov)||48)+(viewport.width<650?14:0))/2)/zoom));
    camera.fov=baseFov+(Math.max(focusFrame.fov,baseFov)-baseFov)*focus;camera.zoom=1;
    camera.setViewOffset(viewport.width,viewport.height,-viewport.width*(focusFrame.x-.5)*focus,-viewport.height*(focusFrame.y-.5)*focus,viewport.width,viewport.height);
    const envelope=cameraInputEnvelope(current.eye[2]);
    const target=new THREE.Vector3(...current.look),offset=new THREE.Vector3().subVectors(camera.position,target);
    const spherical=new THREE.Spherical().setFromVector3(offset);spherical.theta+=smoothOrbit.x*envelope;spherical.phi=THREE.MathUtils.clamp(spherical.phi+smoothOrbit.y*envelope,.15,Math.PI-.15);
    camera.position.copy(target).add(offset.setFromSpherical(spherical));
    if(current.eye[2]<5.55){camera.position.x=THREE.MathUtils.clamp(camera.position.x,-8.1,8.1);camera.position.y=THREE.MathUtils.clamp(camera.position.y,.65,4.1);}
    const strength=reduced?0:Number(container.dataset.parallax??.16)*envelope;
    camera.position.x+=smoothPointer.x*strength;camera.position.y+=smoothPointer.y*strength*.4;
    camera.lookAt(...current.look);renderer.render(world,camera);
    container.dataset.camera=camera.position.toArray().map(v=>v.toFixed(3)).join(',');container.dataset.drawCalls=String(renderer.info.render.calls);
  }
  function frame(time){raf=0;const dt=Math.max(0,(time-lastTime)/1000);lastTime=time;if(!active||destroyed)return;
    if(transition){transition.elapsed+=dt*speed*Number(container.dataset.speed||1);const t=Math.min(1,transition.elapsed/transition.duration);current=sampleRoute(transition.points,t*t*t*(t*(t*6-15)+10));if(t===1)finish();}
    const damping=1-Math.exp(-dt*Number(container.dataset.damping||9));smoothPointer.x+=(pointer.x-smoothPointer.x)*damping;smoothPointer.y+=(pointer.y-smoothPointer.y)*damping;
    smoothOrbit.x+=(orbit.x-smoothOrbit.x)*(reduced?1:damping);smoothOrbit.y+=(orbit.y-smoothOrbit.y)*(reduced?1:damping);
    render();if(transition||Math.abs(pointer.x-smoothPointer.x)+Math.abs(pointer.y-smoothPointer.y)+Math.abs(orbit.x-smoothOrbit.x)+Math.abs(orbit.y-smoothOrbit.y)>.0001)raf=requestAnimationFrame(frame);
  }
  function wake(){if(active&&!raf&&!destroyed){lastTime=performance.now();raf=requestAnimationFrame(frame);}}
  function refresh(){for(const p of projects){const item=posters.get(p.id);if(item.version&&item.url===p.image)continue;item.mesh.material.color.set('#ffffff');
    item.url=p.image;const version=++item.version;item.mesh.scale.set(1,1,1);item.mesh.material.map?.dispose();item.mesh.material.map=null;item.mesh.material.needsUpdate=true;
    if(!p.image){item.mesh.material.color.set('#ffffff');item.mesh.material.map=graphic(p);item.mesh.material.needsUpdate=true;}
    else textureLoader.load(p.image,tex=>{if(destroyed||version!==item.version){tex.dispose();return}tex.colorSpace=THREE.SRGBColorSpace;
      const [sx,sy]=containArtwork(tex.image.width,tex.image.height);item.mesh.scale.set(sx,sy,1);
      tex.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());item.mesh.material.map=tex;item.mesh.material.needsUpdate=true;resize();wake();},undefined,()=>{if(destroyed||version!==item.version)return;item.mesh.material.color.set(p.color);wake();});
  }wake();}
  function onPointerMove(e){const r=container.getBoundingClientRect();
    if(drag&&drag.id!==e.pointerId)return;
    if(drag&&drag.id===e.pointerId){
      const strength=Number(container.dataset.dragStrength??1.2),limit=Number(container.dataset.dragLimit??.32);
      orbit.x=THREE.MathUtils.clamp(drag.orbitX-(e.clientX-drag.x)/r.width*strength,-limit,limit);
      orbit.y=THREE.MathUtils.clamp(drag.orbitY-(e.clientY-drag.y)/r.height*strength,-limit*.5,limit*.5);
      drag.moved ||= Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>6;pointer={x:0,y:0};
    }else{pointer.x=(e.clientX-r.left)/r.width*2-1;pointer.y=-((e.clientY-r.top)/r.height*2-1);}
    wake();}
  function onPointerDown(e){if(e.button!==0||(drag&&drag.id!==e.pointerId)||(e.isTrusted&&!e.isPrimary))return;down={x:e.clientX,y:e.clientY};
    if(dragEnabled){drag={id:e.pointerId,x:e.clientX,y:e.clientY,orbitX:orbit.x,orbitY:orbit.y,moved:false};if(e.isTrusted)container.setPointerCapture(e.pointerId);container.classList.add('dragging');}}
  function endDrag(){const moved=drag?.moved;if(drag&&container.hasPointerCapture(drag.id))container.releasePointerCapture(drag.id);drag=null;container.classList.remove('dragging');return moved;}
  function onPointerUp(e){if(drag&&drag.id!==e.pointerId)return;const moved=endDrag();if(moved||!down||Math.hypot(e.clientX-down.x,e.clientY-down.y)>8){down=null;return}down=null;
    const r=container.getBoundingClientRect();raycaster.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),camera);
    const hit=raycaster.intersectObjects([model,...[...posters.values()].filter(p=>p.mesh.visible).map(p=>p.mesh)],true)[0];
    if(hit&&visible.includes(hit.object.userData.id))onSelect(hit.object.userData.id);
  }
  function onLeave(){if(drag)return;pointer={x:0,y:0};down=null;wake();}
  function onCancel(e){if(drag&&drag.id!==e.pointerId)return;endDrag();down=null;wake();}
  function onLost(e){e.preventDefault();onFailure();}
  container.addEventListener('pointermove',onPointerMove);container.addEventListener('pointerdown',onPointerDown);container.addEventListener('pointerup',onPointerUp);container.addEventListener('pointercancel',onCancel);container.addEventListener('pointerleave',onLeave);renderer.domElement.addEventListener('webglcontextlost',onLost);
  const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(container);
  const mutation=new MutationObserver(()=>{resize();renderer.toneMappingExposure=(Number(container.dataset.exposure)||1.15)*lighting;wake();});mutation.observe(container,{attributes:true,attributeFilter:['data-fov','data-parallax','data-speed','data-exposure','data-drag-strength','data-drag-limit','data-damping']});
  refresh();resize();announce();
  return{
    setDragEnabled(value){dragEnabled=value;endDrag();if(!value){orbit.x=0;orbit.y=0;}wake();},
    step(direction){
      const next=nextStop(destination,selected,visible,direction);
      if(next==='exterior'||next==='hall'){if(next===destination)return false;travel(next);}
      else{if(next===selected&&destination==='project')return false;onSelect(next);}
      return true;
    },
    select(id,move=true){if(!posters.has(id)||!visible.includes(id)||(move&&id===selected&&destination==='project'))return;selected=id;if(move)travel('project',id);else announce();},
    enter(){if(state==='exterior'||destination==='exterior')travel('hall');else if(visible.length)travel('project',selected);},
    back(){travel(state==='hall'||destination==='hall'?'exterior':'hall');},reset(){if(state!=='exterior')travel('exterior');},
    filter(ids){visible=ids;for(const [id,p]of posters)p.mesh.visible=ids.includes(id);if(!ids.length&&(state==='project'||destination==='project'))travel('hall');else announce();wake();},
    setReducedMotion(value){reduced=value;if(value){smoothOrbit.x=orbit.x;smoothOrbit.y=orbit.y;finish();}wake();},setZoom(value){zoom=value;resize();},
    setActive(value){active=value;if(!active&&raf){cancelAnimationFrame(raf);raf=0}else wake();},
    refreshContent(value){speed=value.cameraSpeed;lighting=value.lighting;renderer.toneMappingExposure=(Number(container.dataset.exposure)||1.15)*lighting;refresh();},refreshLinks(){},
    inspect(){const mesh=posters.get(selected)?.mesh;const corners=mesh?[-1,1].flatMap(x=>[-1,1].map(y=>new THREE.Vector3(x*1.43/2,y*1.82/2,0).applyMatrix4(mesh.matrixWorld).project(camera))).map(p=>({x:(p.x+1)*viewport.width/2,y:(1-p.y)*viewport.height/2})):[];return{state,destination,selected,camera:[...current.eye],renderCamera:camera.position.toArray(),orbit:{...smoothOrbit},dragging:Boolean(drag),artwork:{corners,repeat:mesh?.material.map?.repeat.toArray(),offset:mesh?.material.map?.offset.toArray()},drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,geometries:renderer.info.memory.geometries,posters:[...posters.values()].filter(p=>p.mesh.material.map).length};},
    destroy(){destroyed=true;cancelAnimationFrame(raf);resizeObserver.disconnect();mutation.disconnect();container.removeEventListener('pointermove',onPointerMove);container.removeEventListener('pointerdown',onPointerDown);container.removeEventListener('pointerup',onPointerUp);container.removeEventListener('pointerleave',onLeave);container.removeEventListener('pointercancel',onCancel);world.traverse(o=>{o.geometry?.dispose();if(o.material){o.material.map?.dispose();o.material.dispose();}});environment.dispose();renderer.dispose();renderer.domElement.remove();},
  };
}
