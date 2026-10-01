import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {exterior,hall,exhibitPose,routeTo,sampleRoute,containArtwork,nextStop,cameraInputEnvelope} from '../public/spatial-route.js';
import manifest from '../public/layers.manifest.js';
import {lint} from '../../../packages/layer-kit/src/lint.js';
import {emptyValues,setValue,resolve,validateValues} from '../../../packages/layer-kit/src/index.js';
const css=await readFile(new URL('../public/spatial.css',import.meta.url),'utf8');
const result=lint(manifest,css);assert.deepEqual(result.errors,[]);
assert.equal(await readFile(new URL('../public/vendor/layer-kit/index.js',import.meta.url),'utf8'),await readFile(new URL('../../../packages/layer-kit/src/index.js',import.meta.url),'utf8'),'layer-kit vendor matches source');
let samples=0;
function checkRoute(start,destination,end){
  const points=routeTo(start,destination,end);assert.deepEqual(sampleRoute(points,0),start);assert.deepEqual(sampleRoute(points,1),points.at(-1));
  for(let i=0;i<=1000;i++){const p=sampleRoute(points,i/1000);assert.ok(p.eye.every(Number.isFinite));
    if(p.eye[2]>5.55&&p.eye[2]<6.25){assert.ok(Math.abs(p.eye[0])<1.6,'camera crosses real doorway');assert.equal(cameraInputEnvelope(p.eye[2]),0,'manual orbit and parallax cannot enter doorway jambs');}
    if(p.eye[2]<5.55){assert.ok(p.eye[1]<4.4,'camera below ceiling');assert.ok(Math.abs(p.eye[0])<8.5,'camera inside side walls');}
    samples++;
  }return points;
}
for(let i=0;i<7;i++){
  const pose=exhibitPose(i,7);const points=checkRoute(exterior,'project',pose);checkRoute(pose,'exterior');checkRoute(pose,'hall');
  for(const progress of [.2,.45,.65,.8]){const interrupted=sampleRoute(points,progress);checkRoute(interrupted,'project',exhibitPose(6-i,7));checkRoute(interrupted,'exterior');}
}
for(let i=0;i<6;i++)for(const direction of [-1,1]){
  const a=exhibitPose(direction===1?i:i+1,7),b=exhibitPose(direction===1?i+1:i,7),path=routeTo(a,'project',b);
  assert.equal(path.length,2,'neighboring works never visit hall');
  for(let t=0;t<=100;t++){const pose=sampleRoute(path,t/100);assert.equal(pose.eye[2],a.eye[2],'lateral route keeps depth');assert.equal(pose.eye[1],a.eye[1]);assert.equal(pose.focus,1,'lateral route keeps focused framing');}
}
for(const [w,h]of [[1920,1080],[800,1600],[100,100],[512,652]]){
  const [x,y]=containArtwork(w,h);assert.ok(x<=1&&y<=1);assert.ok(Math.abs((1.43*x)/(1.82*y)-w/h)<1e-10,'uncropped original ratio');
}
assert.equal(nextStop('exterior','a',['a','b'],1),'hall');assert.equal(nextStop('hall','b',['a','b'],1),'a');
assert.equal(nextStop('project','a',['a','b'],1),'b');assert.equal(nextStop('project','a',['a','b'],-1),'hall');
assert.equal(nextStop('exterior','a',['a','b'],-1),'exterior');assert.equal(nextStop('project','b',['a','b'],1),'b');
assert.equal(nextStop('hall','a',[],1),'hall');
const scoped=setValue(setValue(emptyValues(manifest),'all','base','stage','fov',45),'project','mobile','stage','fov',60);
assert.deepEqual(validateValues(manifest,scoped).errors,[]);assert.equal(resolve(manifest,scoped,'hall',['mobile']).stage.fov,45);assert.equal(resolve(manifest,scoped,'project',['mobile']).stage.fov,60);
const glb=await readFile(new URL('../public/assets/lab-pavilion.glb',import.meta.url));assert.equal(glb.subarray(0,4).toString(),'glTF');assert.equal(glb.readUInt32LE(8),glb.length);assert.ok(glb.length<6_000_000,'scene transfer budget');
console.log(`PASS: layer-kit lint ${result.layers} layers / ${result.parameters} params, vendor integrity, scene/mobile overrides, ${samples} route samples including interruption/reversal, GLB integrity/budget (${glb.length} bytes).`);
