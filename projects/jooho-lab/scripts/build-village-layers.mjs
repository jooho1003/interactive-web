import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {compileCSS,validateValues} from '../../../packages/layer-kit/src/index.js';
import {lint} from '../../../packages/layer-kit/src/lint.js';
import manifest from '../public/layers.manifest.js';
const root=new URL('../public/',import.meta.url),check=process.argv.includes('--check');
const values=JSON.parse(await readFile(new URL('layers.values.json',root),'utf8'));
const valid=validateValues(manifest,values);if(valid.errors.length)throw Error(valid.errors.join('\n'));
let style='/* layer-fixed: absolute projection boxes and pointer routing belong to the camera renderer. */\n[data-layer-hidden]{display:none!important}\n.village-extension{position:absolute;pointer-events:none;display:var(--L-village-extension-visible);opacity:var(--L-village-extension-opacity);mask-image:linear-gradient(to right,transparent,black var(--L-village-extension-leftBlend));filter:brightness(calc(var(--scene-brightness,1) * var(--L-village-extension-brightness)))}\n';
for(const layer of manifest.layers.filter(layer=>layer.id.startsWith('house-'))){
  const id=layer.id.slice('house-'.length),v=key=>`var(--L-${layer.id}-${key})`,house=`[data-world-project="${id}"]`;
  style+=`${house}{display:${v('visible')};opacity:${v('opacity')}}\n#scene ${house} .world-label{font-size:${v('labelSize')};color:${v('labelColor')};background:${v('labelBackground')}}\n[data-world-light="${id}"]{display:${v('visible')};--light:${v('lightColor')};opacity:calc(var(--ambient-opacity,0) * ${v('opacity')})}\n`;
}
const result=lint(manifest,style);if(result.errors.length)throw Error(result.errors.join('\n'));
const outputs={'village-style.css':style,'layers.css':compileCSS(manifest,values),'layers.values.js':`export default ${JSON.stringify(values)};\n`};
for(const name of ['index.js','probe.js'])outputs['vendor/layer-kit/'+name]=await readFile(new URL('../../../packages/layer-kit/src/'+name,import.meta.url),'utf8');
for(const[name,text]of Object.entries(outputs)){
  const file=new URL(name,root);
  if(check){const existing=await readFile(file,'utf8');if(existing.replace(/\r\n/g,'\n')!==text.replace(/\r\n/g,'\n'))throw Error('레이어 생성물 갱신 필요: '+name);}
  else{await mkdir(new URL('./',file),{recursive:true});await writeFile(file,text);}
}
console.log(`PASS village layer-kit lint: ${result.layers} layers, ${result.parameters} parameters; generated assets ${check?'current':'built'}.`);
