// Supplemental pointer, file, timeline and failure UX checks on disposable QA server.
export default async function verifyStudioFiles(page,baseURL='http://localhost:4178'){
  if(!baseURL.endsWith(':4178'))throw new Error('Use disposable QA server.');
  const checks=[];const check=(value,label)=>{if(!value)throw new Error(label);checks.push(label);};
  await page.setViewportSize({width:1440,height:1000});await page.emulateMedia({reducedMotion:'no-preference'});await page.goto(baseURL+'/admin');
  const child=()=>page.frames().find(frame=>frame.url().includes('studio=1'));
  await page.waitForFunction(()=>document.querySelectorAll('.layer-row').length===20&&document.querySelector('iframe').contentWindow.potatoStudio);
  const storyboard=await page.locator('#storyboard').boundingBox(),footer=await page.locator('.studio-footer').boundingBox();check(storyboard.y+storyboard.height<=footer.y,'Fit zoom keeps scene cards visible with the preview');
  const fitted=await page.locator('#frame-wrap').boundingBox();await page.locator('#zoom').selectOption('width');check((await page.locator('#frame-wrap').boundingBox()).width>fitted.width,'Width zoom enlarges the preview');await page.locator('#zoom').selectOption('actual');check((await page.locator('#frame-wrap').boundingBox()).width===1440,'100% zoom preserves actual canvas pixels');await page.locator('#zoom').selectOption('fit');
  const setFile=(selector,file)=>page.locator(selector).evaluate((input,file)=>{const bytes=file.base64?Uint8Array.from(atob(file.content),char=>char.charCodeAt(0)):file.content;const transfer=new DataTransfer();transfer.items.add(new File([bytes],file.name,{type:file.mimeType}));input.files=transfer.files;input.dispatchEvent(new Event('change',{bubbles:true}));},file);
  const get=(layer,key)=>child().evaluate(([layer,key])=>window.potatoStudio.host.get(layer,key),[layer,key]);
  await page.locator('#time').fill('2000');
  const start=await get('character','offset.x'),box=await child().locator('.character-motion').boundingBox();
  await page.mouse.move(box.x+box.width*.65,box.y+box.height*.5);await page.mouse.down();await page.mouse.move(box.x+box.width*.65+25,box.y+box.height*.5+10,{steps:4});await page.mouse.up();
  check(await page.locator('.layer-row[data-layer=character]').getAttribute('aria-pressed')==='true','Paint-order picking selects the foreground character');
  check(await get('character','offset.x')>start+10,'Real pointer drag updates position');await page.locator('#undo').click();check(await get('character','offset.x')===start,'One undo reverses the entire drag gesture');
  const imageFile={name:'pixel.png',mimeType:'image/png',content:'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jS1kAAAAASUVORK5CYII=',base64:true};
  await setFile('.parameter[data-param=src] input[type=file]',imageFile);await child().waitForFunction(()=>document.querySelector('img.character').src.startsWith('data:image/png'));
  check((await get('character','src')).startsWith('data:image/png'),'Image upload reaches the live renderer');await child().waitForFunction(()=>document.querySelector('img.character').naturalWidth===1);check(await child().locator('img.character').evaluate(el=>el.complete),'Uploaded image actually decodes');await page.locator('#undo').click();
  await page.locator('#time').fill('700');check(await child().evaluate(()=>document.querySelector('.character').getAnimations().some(animation=>Math.abs(animation.currentTime-700)<1)),'Scrubber seeks the real CSS animation');
  await page.locator('#play').click();await page.waitForFunction(()=>Number(document.querySelector('#time').value)>800);await page.locator('#play').click();check(await page.locator('#play').textContent()==='▶ 재생','Timeline playback can pause');
  const state=await page.evaluate(async()=>await(await fetch('/api/studio/state')).json());const titleBefore=await get('copy','title');const imported=JSON.parse(JSON.stringify(state.values));(imported.base.copy||={}).title='가져온 제목';
  const importFile=values=>({name:'settings.json',mimeType:'application/json',content:JSON.stringify(values)});
  await setFile('#import-file',importFile({format:'wrong'}));await page.locator('#error').waitFor({state:'visible'});check(await get('copy','title')===titleBefore,'Invalid import leaves current values intact');
  await setFile('#import-file',importFile(imported));await page.locator('#confirm-dialog').waitFor({state:'visible'});check(await page.locator('#change-list .change-row').count()>0,'Import previews a real diff');await page.locator('#cancel-confirm').click();check(await get('copy','title')===titleBefore,'Canceling import preserves the draft');
  await setFile('#import-file',importFile(imported));await page.locator('#confirm-dialog').waitFor({state:'visible'});await page.locator('#confirm-action').click();await child().waitForFunction(()=>window.potatoStudio.host.get('copy','title')==='가져온 제목');check(await get('copy','title')==='가져온 제목','Validated import updates the preview');
  await page.waitForFunction(()=>document.querySelector('#save-status').textContent==='초안 저장됨');
  await page.route('**/api/studio/draft',route=>route.fulfill({status:409,contentType:'application/json',body:JSON.stringify({error:'QA: 다른 창에서 변경되었습니다.'})}));
  await page.locator('[data-layer=copy]').click();await page.locator('.parameter[data-param=title] textarea').fill('저장 실패에도 보존');await page.locator('.parameter[data-param=title] textarea').press('Tab');await page.waitForFunction(()=>document.querySelector('#save-status').textContent.includes('저장 실패'));
  check(await get('copy','title')==='저장 실패에도 보존','Conflict preserves unsaved preview state');check(await page.locator('#publish').isDisabled(),'Conflict prevents accidental publishing');
  const downloaded=page.waitForEvent('download');await page.locator('#export').click();const download=await downloaded,stream=await download.createReadStream(),chunks=[];for await(const chunk of stream)chunks.push(chunk);const exported=await page.evaluate(bytes=>JSON.parse(new TextDecoder().decode(new Uint8Array(bytes))),chunks.flatMap(chunk=>Array.from(chunk)));check(exported.scenes.brand.base.copy.title==='저장 실패에도 보존','Export retains the unsaved conflicting edit');
  await page.unroute('**/api/studio/draft');await page.locator('#reload').click();await page.locator('#confirm-dialog').waitFor({state:'visible'});check(await page.locator('#confirm-description').textContent()==='저장되지 않은 수정값을 버리고 서버의 초안을 불러옵니다.','Reload explains pending edit loss');await page.locator('#confirm-action').click();await page.waitForFunction(()=>!document.querySelector('#confirm-dialog').open&&document.querySelector('#save-status').textContent==='초안 저장됨');
  return{passed:checks.length,checks};
}
