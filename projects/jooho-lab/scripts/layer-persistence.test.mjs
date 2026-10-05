import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer,request} from 'node:http';
import {mkdtemp,readFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {layerPersistence} from './layer-persistence.mjs';
import manifest from '../public/layers.manifest.js';
import {emptyValues,setValue} from '../public/vendor/layer-kit/index.js';

test('local saves become validated publish files, with origin and conflict protection',async t=>{
  const directory=await mkdtemp(join(tmpdir(),'jooho-layers-')),file=join(directory,'layers.values.json');
  await writeFile(file,JSON.stringify(emptyValues(manifest)));
  const handler=layerPersistence(file),server=createServer(handler);
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  t.after(async()=>{await new Promise(resolve=>server.close(resolve));await rm(directory,{recursive:true,force:true});});
  const origin=`http://127.0.0.1:${server.address().port}`,url=origin+'/api/layers';
  const get=async()=>{const response=await fetch(url);assert.equal(response.status,200);return response.json();};
  const put=(body,headers={})=>fetch(url,{method:'PUT',headers:{Origin:origin,'Content-Type':'application/json',...headers},body:typeof body==='string'?body:JSON.stringify(body)});
  let initial=await get();
  const values=setValue(setValue(setValue(initial.values,'all','base','courtyard-trees','x',14),'project','mobile','intro','positionX',28),'all','base','courtyard-tree-back','z',3);
  let response=await put({revision:initial.revision,values});assert.equal(response.status,200);
  const written=await response.json();assert.notEqual(written.revision,initial.revision);assert.deepEqual(JSON.parse(await readFile(file,'utf8')),values);
  assert.deepEqual((await get()).values,values,'a new visitor reads the saved publish defaults');
  response=await put({revision:initial.revision,values});assert.equal(response.status,409);
  response=await put({revision:written.revision,values},{Origin:'https://other.example'});assert.equal(response.status,403);
  response=await put({revision:written.revision,values},{Origin:''});assert.equal(response.status,403);
  response=await put({revision:written.revision,values},{'Content-Type':'text/plain'});assert.equal(response.status,400);
  const hostStatus=await new Promise(resolve=>{const req=request(url,{headers:{Host:'other.example'}},res=>{res.resume();resolve(res.statusCode);});req.end();});assert.equal(hostStatus,403);
  response=await put('{broken');assert.equal(response.status,400);
  for(const invalid of [{...values,work:'another-work'},setValue(values,'all','base','courtyard-trees','x',999),{...values,base:{unknown:{x:1}}}]){
    response=await put({revision:written.revision,values:invalid});assert.equal(response.status,400);
  }
  response=await put(' '.repeat(256*1024+1));assert.equal(response.status,413);
  assert.deepEqual(JSON.parse(await readFile(file,'utf8')),values,'failed requests never change the saved file');
  const simultaneous=await Promise.all([put({revision:written.revision,values:setValue(values,'all','base','intro','positionX',10)}),put({revision:written.revision,values:setValue(values,'all','base','intro','positionX',20)})]);
  assert.deepEqual(simultaneous.map(r=>r.status).sort(),[200,409],'two windows cannot silently overwrite one another');
  const latest=await get();
  await rm(directory,{recursive:true,force:true});
  response=await put({revision:latest.revision,values});assert.equal(response.status,500,'file failure is reported');
});
