import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,cp,readFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve,sep} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {buildLayers} from './build-layers.mjs';

test('fresh checkout accepts CRLF artifacts but still rejects changed content',async()=>{
  const dir=await mkdtemp(join(tmpdir(),'potato-newline-test-'));
  try{
    await cp(fileURLToPath(new URL('../dist/',import.meta.url)),dir,{recursive:true});
    const url=pathToFileURL(dir+sep);await buildLayers({dir:url});
    for(const name of ['index.html','layers.css','layers.manifest.js','layers.values.json','layers.values.js','vendor/layer-kit/index.js','vendor/layer-kit/probe.js']){
      const path=join(dir,name),text=await readFile(path,'utf8');await writeFile(path,text.replace(/\r\n/g,'\n').replace(/\n/g,'\r\n'));
    }
    await buildLayers({dir:url,check:true});
    const path=join(dir,'layers.css');await writeFile(path,(await readFile(path,'utf8'))+'\r\n/* stale content */\r\n');
    await assert.rejects(()=>buildLayers({dir:url,check:true}),/레이어 생성물 갱신 필요: layers.css/);
  }finally{
    const target=resolve(dir);assert.ok(target.startsWith(resolve(tmpdir())+sep)&&target.includes('potato-newline-test-'));await rm(target,{recursive:true,force:true});
  }
});
