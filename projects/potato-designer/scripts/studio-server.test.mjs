import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,cp,readFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {request as httpRequest} from 'node:http';
import {createStudioServer} from './studio-server.mjs';
import {setValue} from '../../../packages/layer-kit/src/index.js';

test('local admin auth, revisions, publish, asset validation and draft restoration',async t=>{
  const dir=await mkdtemp(join(tmpdir(),'potato-studio-test-'));
  const project=fileURLToPath(new URL('../',import.meta.url));
  await cp(join(project,'dist'),join(dir,'dist'),{recursive:true});await cp(join(project,'admin'),join(dir,'admin'),{recursive:true});
  const server=createStudioServer({projectDir:dir,password:'qa-password'});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const origin='http://127.0.0.1:'+server.address().port;let cookie='';
  const request=(path,method='GET',body,headers={})=>fetch(origin+path,{method,headers:{cookie,origin,...(body?{'content-type':'application/json'}:{}),...headers},body:body?JSON.stringify(body):undefined,redirect:'manual'});
  const getState=async()=>{const res=await request('/api/studio/state');assert.equal(res.status,200);return res.json();};
  try{
    await t.test('public reader receives no write session; protected files/API reject anonymous access',async()=>{
      const publicPage=await request('/');assert.equal(publicPage.status,200);assert.equal(publicPage.headers.get('set-cookie'),null);
      assert.equal((await request('/api/studio/state')).status,401);assert.equal((await request('/admin/bridge.js')).status,401);
      const rejected=await new Promise((resolve,reject)=>{const req=httpRequest(origin+'/api/studio/state',{headers:{host:'evil.example'}},res=>{res.resume();resolve(res.statusCode);});req.on('error',reject);req.end();});assert.equal(rejected,403);
      assert.match(await (await request('/admin')).text(),/type="password"/);
    });
    await t.test('login validates password and same-origin, cookie is HttpOnly and Strict',async()=>{
      const login=password=>fetch(origin+'/api/studio/login',{method:'POST',headers:{origin,'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({password}),redirect:'manual'});
      assert.equal((await login('wrong')).status,401);const res=await login('qa-password');assert.equal(res.status,303);const value=res.headers.get('set-cookie');assert.match(value,/HttpOnly; SameSite=Strict/);cookie=value.split(';')[0];
      assert.equal((await request('/api/studio/publish','POST',{}, {origin:'https://evil.example'})).status,403);
    });
    let original=await getState(),current=original;
    await t.test('draft saves independently, rejects stale editors and invalid CSS',async()=>{
      let values=setValue(current.values,'brand','base','copy','title','LOCAL <script> text');values=setValue(values,'brand','base','copy','intro','./assets/not-an-image-text.png');
      const res=await request('/api/studio/draft','PUT',{...current,values});assert.equal(res.status,200);current=await res.json();assert.equal(current.published.scenes.brand,undefined);
      assert.equal((await request('/api/studio/draft','PUT',{...original,values})).status,409);
      const invalid=setValue(values,'brand','base','character','src','data:image/svg+xml;base64,abcd');assert.equal((await request('/api/studio/draft','PUT',{...current,values:invalid})).status,400);
    });
    await t.test('publish bakes safe text, runtime and CSS; preserves a restorable version',async()=>{
      const res=await request('/api/studio/publish','POST',{draftRevision:current.draftRevision});assert.equal(res.status,200);current=await res.json();assert.equal(current.published.scenes.brand.base.copy.title,'LOCAL <script> text');
      const html=await readFile(join(dir,'dist/index.html'),'utf8');assert.ok(html.includes('LOCAL &lt;script&gt; text'));assert.ok(!html.includes('LOCAL <script> text'));
      assert.match(await readFile(join(dir,'dist/layers.values.js'),'utf8'),/LOCAL <script> text/);
      const versions=await(await request('/api/studio/versions')).json();assert.equal(versions.versions.length,1);
      const restored=await request('/api/studio/restore','POST',{draftRevision:current.draftRevision,version:versions.versions[0]});assert.equal(restored.status,200);current=await restored.json();assert.deepEqual(current.values,original.values);assert.notDeepEqual(current.published,original.published);
    });
    await t.test('invalid image contents cannot replace the published file',async()=>{
      const before=await readFile(join(dir,'dist/layers.values.json'),'utf8');let values=setValue(current.values,'brand','base','character','src','data:image/png;base64,aGVsbG8=');let res=await request('/api/studio/draft','PUT',{...current,values});current=await res.json();res=await request('/api/studio/publish','POST',{draftRevision:current.draftRevision});assert.equal(res.status,400);assert.equal(await readFile(join(dir,'dist/layers.values.json'),'utf8'),before);
    });
    await t.test('valid PNG upload is copied to a content-addressed local asset',async()=>{
      const png='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jS1kAAAAASUVORK5CYII=';
      const values=setValue(current.values,'brand','base','character','src',png);current=await(await request('/api/studio/draft','PUT',{...current,values})).json();const res=await request('/api/studio/publish','POST',{draftRevision:current.draftRevision});assert.equal(res.status,200);current=await res.json();const path=current.published.scenes.brand.base.character.src;assert.match(path,/^\.\/assets\/studio\/[a-f0-9]{24}\.png$/);assert.equal((await request('/'+path.slice(2))).status,200);
    });
    await t.test('external publication changes are detected before overwrite',async()=>{
      await writeFile(join(dir,'dist/layers.values.json'),JSON.stringify(original.published));const changed=await getState();assert.equal(changed.conflict,true);assert.equal((await request('/api/studio/publish','POST',{draftRevision:changed.draftRevision})).status,409);
    });
  }finally{
    await new Promise(resolve=>server.close(resolve));server.closeAllConnections();
    const target=resolve(dir);assert.ok(target.startsWith(resolve(tmpdir())+sep)&&target.includes('potato-studio-test-'));await rm(target,{recursive:true,force:true});
  }
});
