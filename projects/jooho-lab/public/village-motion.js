import {getContent} from './content.js';
// Camera choreography and ambient life use one clock, paused with the scene.
export function createVillageMotion(container, projects, onSelect, onOpen, projectX) {
  const projectIds=new Set(projects.map(project=>project.id));
  let settings=getContent();
  let reduced=false, trip=null, entry=null, timer=0, scale=1, lift=0, bank=0, elapsed=0, walkerX=projectX('dawn-store')+1.9, selected='dawn-store',step=0;
  const walker=document.createElement('img');walker.src=settings.character;walker.alt='';walker.className='village-walker';walker.setAttribute('aria-hidden','true');walker.draggable=false;container.append(walker);
  const lights=projects.map((p,i)=>{const el=document.createElement('span');el.className='building-light';el.dataset.worldLight=p.id;el.setAttribute('aria-hidden','true');container.append(el);return el});
  const veil=document.createElement('div');veil.className='entry-veil';veil.hidden=true;
  const title=document.createElement('strong'),cancel=document.createElement('button');cancel.type='button';cancel.textContent='머무르기 · Esc';veil.append(title,cancel);container.parentElement.append(veil);
  function cancelEntry(restoreFocus=false){if(!entry)return;const id=entry.id;clearTimeout(timer);timer=0;entry=null;veil.hidden=true;container.parentElement.classList.remove('entering');if(restoreFocus)container.querySelector(`[data-world-project="${id}"]`)?.focus({preventScroll:true})}
  cancel.addEventListener('click',()=>cancelEntry(true));
  window.addEventListener('keydown',e=>{if(e.key==='Escape'&&entry){e.preventDefault();cancelEntry(true)}});
  window.addEventListener('pageshow',()=>{cancelEntry();trip=null;scale=1;lift=0;bank=0});
  return {
    get entering(){return !!entry},
    configure(value){settings=value;if(walker.getAttribute('src')!==value.character)walker.src=value.character;},
    select(id){if(!projectIds.has(id))return;if(entry&&entry.id!==id)cancelEntry();if(selected!==id&&!reduced)trip={start:performance.now(),direction:Math.sign(projectX(id)-projectX(selected))};selected=id},
    enter(id){if(entry)return;if(!projectIds.has(id)){onOpen(id);return}if(reduced){onOpen(id);return}onSelect(id);trip=null;entry={id,start:performance.now(),scale,duration:1450/settings.cameraSpeed};veil.style.setProperty('--entry-progress',0);veil.hidden=false;title.textContent=projects.find(p=>p.id===id).title+'에 들어가는 중';container.parentElement.classList.add('entering');cancel.focus({preventScroll:true});timer=setTimeout(()=>{timer=0;onOpen(id)},entry.duration)},
    pause(){cancelEntry()},
    reduce(value){reduced=value;if(value){cancelEntry();trip=null;scale=1;lift=0;bank=0}},
    update(now,dt,camera){
      step=dt;if(!reduced)elapsed+=dt;
      let targetScale=1,targetLift=0,targetBank=0;
      if(trip&&!reduced){const t=Math.min(1,(now-trip.start)/(1100/settings.cameraSpeed)),arc=Math.sin(t*Math.PI);targetScale=1-.045*arc;targetLift=.12*arc;targetBank=trip.direction*.002*arc;if(t===1)trip=null}
      if(entry){const t=Math.min(1,(now-entry.start)/entry.duration),q=Math.max(0,(t-.2)/.8),ease=q*q*(3-2*q);targetScale=entry.scale+(1.72-entry.scale)*ease;targetLift=-1.15*ease;veil.style.setProperty('--entry-progress',Math.max(0,(t-.72)/.28))}
      const before=[scale,lift,bank];
      const blend=reduced?1:1-Math.exp(-dt*7*settings.cameraSpeed);
      scale+=(targetScale-scale)*blend;lift+=(targetLift-lift)*blend;bank+=(targetBank-bank)*blend;
      camera.zoom=scale;camera.position.y+=lift;camera.rotation.z=bank;camera.updateProjectionMatrix();
      return Math.abs(scale-before[0])+Math.abs(lift-before[1])+Math.abs(bank-before[2])>.00001;
    },
    decorate(project,ids,containerHeight,viewHeight){
      projects.forEach((p,i)=>{const [x,y]=project(projectX(p.id),-2.5),el=lights[i];el.style.transform=`translate(${x}px,${Math.min(y,containerHeight-96)}px) translate(-50%,-50%) scale(${scale})`;el.style.setProperty('--ambient-opacity',ids.includes(p.id)&&!reduced?String((p.id===selected?.45:.13)*(.75+.25*Math.sin(elapsed*(1.2+i*.18)+i))):'0')});
      const home=projectX(selected),target=home+1.9+Math.sin(elapsed*.35*settings.characterSpeed)*.6,direction=target-walkerX;
      walkerX+=reduced?home+1.9-walkerX:Math.sign(direction)*Math.min(Math.abs(direction),1.5*step*settings.characterSpeed);
      const [x,y]=project(walkerX,-4.55+(reduced?0:Math.abs(Math.sin(elapsed*9*settings.characterSpeed))*.07));
      walker.hidden=!settings.characterVisible||!settings.character||!ids.includes(selected)||!!entry;walker.style.width=(containerHeight/viewHeight*1.2*scale*settings.characterSize)+'px';
      walker.style.transform=`translate(${x}px,${Math.min(y,containerHeight-96)}px) translate(-50%,-100%) scaleX(${direction<0?-1:1}) rotate(${reduced?0:Math.sin(elapsed*9*settings.characterSpeed)*2}deg)`;
    }
  };
}
