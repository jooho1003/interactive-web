// Pass a Playwright Page. Start studio-qa-server.mjs first: this test publishes
// ONLY to that disposable fixture. Never run against the working server.
export default async function verifyStudio(page,baseURL='http://localhost:4178'){
  if(!baseURL.endsWith(':4178'))throw new Error('Use the isolated QA fixture on port 4178.');
  const checks=[],errors=[];const check=(value,label)=>{if(!value)throw new Error(label);checks.push(label);};
  const onError=error=>errors.push(error.message);page.on('pageerror',onError);
  const ready=()=>page.waitForFunction(()=>document.querySelectorAll('.layer-row').length===20&&document.querySelector('iframe').contentWindow.potatoStudio&&document.querySelector('#save-status').textContent==='초안 저장됨');
  const frame=()=>page.frames().find(frame=>frame.url().includes('studio=1'));
  const parameter=key=>page.locator(`.parameter[data-param="${key}"]`);
  const number=async(key,value)=>{const input=parameter(key).locator('input[type=number]');await input.fill(String(value));await input.press('Tab');};
  const text=async(key,value)=>{const input=parameter(key).locator('textarea, input[type=text]');await input.fill(value);await input.press('Tab');};
  const value=(layer,key)=>frame().evaluate(([layer,key])=>window.potatoStudio.host.get(layer,key),[layer,key]);
  const saved=()=>page.waitForFunction(()=>document.querySelector('#save-status').textContent==='초안 저장됨');
  try{
    await page.emulateMedia({reducedMotion:'no-preference'});await page.setViewportSize({width:1440,height:1000});await page.goto(baseURL+'/admin');await ready();
    await page.evaluate(async()=>{const state=await(await fetch('/api/studio/state')).json();const response=await fetch('/api/studio/draft',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({...state,values:state.published})});if(!response.ok)throw new Error('Cannot reset QA draft');});await page.reload();await ready();
    check(await page.locator('.scene-card').count()===3,'Three scene cards render');check(await page.locator('#page-sequence button').count()===5,'Five ordered page controls render');
    check(await frame().locator('.character-motion').evaluate(el=>Number(getComputedStyle(el).opacity)>.9),'Initial editing frame shows the settled character');
    await number('offset.x',42);check(await value('character','offset.x')===42,'Layer position updates the real renderer');
    await page.locator('.scene-card[data-scene=digital]').click();check(await value('character','offset.x')===0,'Scene-specific edit does not leak to another scene');
    await page.locator('.scene-card[data-scene=brand]').click();check(await value('character','offset.x')===42,'Returning to a scene restores its edit');
    await page.locator('#viewport').selectOption('mobile');await number('offset.x',77);check(await value('character','offset.x')===77,'Mobile override applies at actual mobile viewport');
    await page.locator('#undo').click();check(await value('character','offset.x')===42,'Undo reveals inherited desktop value');await page.locator('#redo').click();check(await value('character','offset.x')===77,'Redo restores mobile override');
    await page.locator('#viewport').selectOption('base');await frame().waitForFunction(()=>window.potatoStudio.host.get('character','offset.x')===42);check(await value('character','offset.x')===42,'Desktop edit remains independent');await page.locator('#viewport').selectOption('mobile');await frame().waitForFunction(()=>window.potatoStudio.host.get('character','offset.x')===77);
    await parameter('visible').locator('input').uncheck();check(await frame().locator('.character-motion').evaluate(el=>getComputedStyle(el).display==='none'),'Visibility hides actual layer');await page.locator('#undo').click();
    await page.locator('[data-layer=paper]').click();await text('color','#112233');check(await frame().locator('html').evaluate(el=>getComputedStyle(el).backgroundColor==='rgb(17, 34, 51)'),'Color control affects the actual page');
    await page.locator('#show-published').check();check(await value('paper','color')==='#e9ebe8','Published comparison excludes draft edits');await page.locator('#show-published').uncheck();
    await page.locator('[data-layer=copy]').click();await text('title','<b>EDITOR</b>\nTEST');check(await frame().locator('#hero-heading-text').textContent()==='<b>EDITOR</b>\nTEST','Text edits preserve literal markup and newlines');check(await frame().locator('#hero-heading-text b').count()===0,'Text input cannot insert HTML elements');
    await page.locator('[data-page=about]').click();check(await frame().locator('#about-dialog').evaluate(el=>el.open),'Ordered page controls open the real about panel');
    await page.locator('[data-page=home]').click();await page.locator('#experience-mode').click();await frame().locator('button[data-scene=digital]').click();check(await page.locator('.scene-card[data-scene=digital]').getAttribute('aria-pressed')==='true','Direct experience synchronizes scene selection back to the editor');
    await frame().locator('.header [data-dialog=work-dialog]').click();await page.waitForFunction(()=>document.querySelector('#page').value==='work');check(await page.locator('#page').inputValue()==='work','Direct experience synchronizes page state');
    await page.locator('[data-page=home]').click();await page.locator('.scene-card[data-scene=brand]').click();await page.locator('#edit-mode').click();await saved();
    await page.reload();await ready();await page.locator('#viewport').selectOption('mobile');check(await value('copy','title')==='<b>EDITOR</b>\nTEST','Draft survives full admin reload');
    await page.locator('#publish').click();check(await page.locator('#change-list .change-row').count()>=3,'Publish confirmation lists actual scoped changes');await page.locator('#confirm-action').click();await page.waitForFunction(()=>!document.querySelector('#confirm-dialog').open);await ready();
    const published=await page.context().newPage();await published.setViewportSize({width:390,height:844});await published.goto(baseURL);await published.waitForSelector('#hero-heading-text');check(await published.locator('#hero-heading-text').textContent()==='<b>EDITOR</b>\nTEST','Published public page renders scoped saved text');check(await published.locator('html').evaluate(el=>getComputedStyle(el).backgroundColor==='rgb(17, 34, 51)'),'Published CSS and runtime agree');await published.close();await page.bringToFront();
    await page.locator('#versions').click();await page.locator('.version-row').waitFor();check(await page.locator('.version-row').count()===1,'Publishing retains the previous version');await page.locator('.version-row button').click();await page.waitForFunction(()=>!document.querySelector('#versions-dialog').open);await saved();check(await value('copy','title')==='POTATO\nDESIGNER','Version restoration changes the draft');
    const state=await page.evaluate(async()=>await(await fetch('/api/studio/state')).json());check(state.published.scenes.brand.responsive.mobile.copy.title==='<b>EDITOR</b>\nTEST','Restoring draft does not silently republish');
    for(const width of [390,768,1440]){await page.setViewportSize({width,height:900});check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${width}px: admin has no horizontal page overflow`);}
    await page.emulateMedia({reducedMotion:'reduce'});check(await frame().locator('#replay').isDisabled(),'Reduced motion remains enforced inside preview');
    check(errors.length===0,'No uncaught editor errors: '+errors.join('; '));return{passed:checks.length,checks};
  }finally{page.off('pageerror',onError);}
}
