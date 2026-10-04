// Build-time only. Never expose FAL_KEY in a browser bundle.
import {mkdir, writeFile, readFile, access} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve, dirname} from 'node:path';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const assets=resolve(root,'public/assets');
await mkdir(assets,{recursive:true});
for(const [remote,local] of [['loaders/GLTFLoader.js','GLTFLoader.js'],['utils/BufferGeometryUtils.js','BufferGeometryUtils.js']]){
  try{await access(resolve(assets,local));continue}catch{}
  const res=await fetch(`https://raw.githubusercontent.com/mrdoob/three.js/r180/examples/jsm/${remote}`);
  if(!res.ok)throw Error(`Three download: ${res.status}`);
  const js=(await res.text()).replaceAll("from 'three'","from './three.module.min.js'").replaceAll("'../utils/BufferGeometryUtils.js'","'./BufferGeometryUtils.js'");
  await writeFile(resolve(assets,local),js);
  console.log(`Vendored Three r180 ${local}`);
}
if(!process.argv.includes('--generate'))process.exit(0);
try{await access(resolve(assets,'lab-landscape.jpg'));console.log('Landscape already generated; no new charge.');process.exit(0)}catch{}
if(!process.env.FAL_KEY)throw Error('FAL_KEY is not available');
const input={prompt:'Photographic panoramic landscape at blue hour, distant layered coastal mountains and calm water, a very low horizon in the bottom quarter, expansive pale desaturated blue sky with delicate peach clouds and a faint warm sunset on the right, refined atmospheric architectural photography background, natural subtle film grain, realistic, tranquil, no buildings, no people, no text, no borders. Wide landscape photograph.',image_size:{width:1536,height:768},num_images:1,num_inference_steps:4,seed:10012026,output_format:'jpeg'};
await writeFile(resolve(root,'docs/landscape-generation.json'),JSON.stringify({model:'fal-ai/flux/schnell',input},null,2));
const response=await fetch('https://fal.run/fal-ai/flux/schnell',{method:'POST',headers:{Authorization:`Key ${process.env.FAL_KEY}`,'Content-Type':'application/json'},body:JSON.stringify(input),signal:AbortSignal.timeout(180000)});
if(!response.ok)throw Error(`fal generation failed: HTTP ${response.status}`);
const result=await response.json();
const url=result.images?.[0]?.url;if(!url)throw Error('fal returned no image');
const image=await fetch(url);if(!image.ok)throw Error(`Image download: ${image.status}`);
await writeFile(resolve(assets,'lab-landscape.jpg'),Buffer.from(await image.arrayBuffer()));
console.log('Saved fal landscape: lab-landscape.jpg');
