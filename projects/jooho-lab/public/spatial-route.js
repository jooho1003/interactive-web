// One clear aisle connects the exterior, hall and all exhibits.
export const exterior={eye:[12,7,28],look:[-3.7,2.4,0]};
export const hall={eye:[0,1.85,3],look:[2.4,1.65,-1.4]};
export const entrance=[{eye:[5,3.3,14],look:[0,2,2]},{eye:[0,2.1,8.3],look:[0,2,-3]},{eye:[0,1.85,3.7],look:[0,2,-6.5]},hall];
export const exhibitX=(index,count)=>(index-(count-1)/2)*2.15;
// lab-pavilion.glb에 구운 전시 칸 수. 추가 작품은 같은 칸을 다음 페이지에서 사용한다.
export const exhibitBays=7;
export const exhibitSlot=index=>index%exhibitBays;
export const exhibitPage=index=>Math.floor(index/exhibitBays);
export const artworkZ=-6.75;
export function slideDuration(from,to,base,min,max){
  const distance=Math.hypot(...to.eye.map((v,i)=>v-from.eye[i]));
  return Math.max(min,Math.min(max,base*distance/2.15));
}
// Fade manual offsets out while passing through the narrow architectural doorway.
export const cameraInputEnvelope=z=>Math.min(1,Math.max(0,(Math.abs(z-6)-1)/3));
export function exhibitPose(index,count,distance=2.4){const x=exhibitX(index,count);return{eye:[x,2.3,artworkZ+distance],look:[x,2.3,artworkZ],focus:1};}
export function containArtwork(width,height){const scale=Math.min(1.43/width,1.82/height);return[width*scale/1.43,height*scale/1.82];}
export function nextStop(stage,id,ids,direction){
  const stops=['exterior','hall',...ids];
  const index=stage==='project'?Math.max(2,stops.indexOf(id)):stops.indexOf(stage);
  return stops[Math.max(0,Math.min(stops.length-1,index+direction))];
}
export function routeTo(current,destination,pose){
  const path=[current];
  // Adjacent exhibits share one plane: never retreat to the hall between works.
  if(destination==='project'&&current.eye[2]<2)return[current,pose];
  if(destination==='exterior'){
    if(current.eye[2]<3.7)path.push(hall,entrance[2]);
    path.push(entrance[1],entrance[0],exterior);
  }else{
    if(current.eye[2]>6)path.push(entrance[1],entrance[2],hall);
    else if(current.eye[2]>2||Math.abs(current.eye[0])>.3||current.eye[2]<0)path.push(hall);
    if(destination==='project')path.push(pose);
    else if(path.length===1)path.push(hall);
  }
  return path.filter((p,i)=>!i||p.eye.some((v,j)=>Math.abs(v-path[i-1].eye[j])>.001));
}
export function sampleRoute(points,progress){
  if(progress<=0)return points[0];
  if(progress>=1)return points.at(-1);
  if(points.length===1)return points[0];
  const lengths=points.slice(1).map((p,i)=>Math.hypot(...p.eye.map((v,j)=>v-points[i].eye[j])));
  let distance=Math.min(1,Math.max(0,progress))*lengths.reduce((a,b)=>a+b,0);
  const mix=(a,b,t)=>({eye:a.eye.map((v,j)=>v+(b.eye[j]-v)*t),look:a.look.map((v,j)=>v+(b.look[j]-v)*t),focus:(a.focus||0)+((b.focus||0)-(a.focus||0))*t});
  // Round corners inside the waypoint triangle. Unlike an overshooting spline,
  // this stays within the doorway corridor and preserves velocity at the joins.
  let knot=0;
  for(let i=1;i<points.length-1;i++){
    knot+=lengths[i-1];const radius=Math.min(.45,lengths[i-1]*.25,lengths[i]*.25);
    if(radius&&Math.abs(distance-knot)<radius){
      const a=mix(points[i-1],points[i],1-radius/lengths[i-1]);
      const b=mix(points[i],points[i+1],radius/lengths[i]);const t=(distance-knot+radius)/(2*radius);
      return mix(mix(a,points[i],t),mix(points[i],b,t),t);
    }
  }
  for(let i=0;i<lengths.length;i++){
    if(distance<=lengths[i]||i===lengths.length-1){const t=lengths[i]?distance/lengths[i]:1;return mix(points[i],points[i+1],t);}
    distance-=lengths[i];
  }
}
