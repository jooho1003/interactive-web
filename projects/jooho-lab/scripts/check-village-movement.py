import json
from pathlib import Path
from playwright.sync_api import sync_playwright

OUT=Path('projects/jooho-lab/art')
BASE='http://127.0.0.1:8879/'
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    try:
        for name,w,h in [('desktop',1440,900),('mobile',390,844),('narrow',320,700)]:
            page=browser.new_page(viewport={'width':w,'height':h},reduced_motion='reduce')
            page.set_default_timeout(60000)
            errors=[]
            page.on('pageerror',lambda e: errors.append(str(e)))
            results=[]
            def check(label,condition,detail=None):
                results.append({'name':label,'passed':condition,'detail':detail})
                assert condition,(label,detail)
            def state(): return page.evaluate("async()=>(await import('/app.js')).inspectScene()")
            def settle(): page.wait_for_function("async()=>{const s=(await import('/app.js')).inspectScene();return Math.abs(s.x-s.goal)<.01}")
            def choose(work):
                page.locator(f'#gallery-pagination [data-id="{work}"]').click()
                page.wait_for_function("async()=>{const s=(await import('/app.js')).inspectScene();return Math.abs(s.x-s.camera[0])<.01}")
                page.wait_for_timeout(200)
            def drag(fraction):
                # Sky has no house links; use real pointer input, including capture/up.
                a=w*.88; b=a-w*fraction; y=h*.30
                page.mouse.move(a,y); page.mouse.down(); page.mouse.move(b,y,steps=14); page.mouse.up()
                settle()
                return state()
            try:
                page.goto(BASE+'village.html',wait_until='networkidle')
                page.wait_for_function("document.querySelector('#scene-status').hidden")
                check('house links 10',page.locator('[data-world-project]').count()==10)
                xs=page.evaluate("async()=>{const {layerHost:h}=await import('/village-layers.js');return h.manifest.layers.filter(l=>l.id.startsWith('house-')).map(l=>h.get(l.id,'x'))}")
                check('distinct house coordinates',len(set(xs))==10,xs)
                for work in ['spire','day-walk','potato-designer','hanbok-hero','detail-pages']:
                    choose(work)
                    link=page.locator(f'[data-world-project="{work}"]')
                    check('visible '+work,link.is_visible())
                    check('selected '+work,state()['selected']==work)
                    check('nameplate clears number buttons '+work,link.locator('.world-label').bounding_box()['y']+link.locator('.world-label').bounding_box()['height']<page.locator('#gallery-pagination').bounding_box()['y'])
                page.screenshot(path=str(OUT/f'village-houses-{name}.png'))
                choose('blog'); before=state()['x']; short=drag(.12)
                check('short drag keeps distance',abs(short['x']-before)>0.2,short)
                # Re-select moves back to the authored house for comparable drags.
                choose('sasu');choose('blog'); before=state()['x']; long=drag(.72)
                check('long drag moves farther',abs(long['x']-before)>abs(short['x']-(-2.88))*3,{'before':before,'short':short,'long':long})
                if name=='desktop': check('long drag skips multiple houses',long['selected'] in ['instatoon','spire','day-walk','potato-designer','hanbok-hero','detail-pages'],long)
                retained=long['x'];page.wait_for_timeout(250)
                check('released position persists',abs(state()['x']-retained)<.01)
                second=drag(.35);check('continuous drag advances',second['x']>retained+.2,second)
                reverse=drag(-.08);check('reverse drag returns',reverse['x']<second['x']-.1,reverse)
                for _ in range(10): end=drag(.72)
                check('right edge reaches Detail Pages',end['selected']=='detail-pages',end)
                check('Detail Pages remains visible at edge',page.locator('[data-world-project="detail-pages"]').is_visible())
                page.locator('#reset-camera').click();page.wait_for_timeout(100)
                check('reset selection',state()['selected']=='sasu')
                page.locator('#space').focus();page.keyboard.press('ArrowRight');page.wait_for_timeout(100)
                check('keyboard next',state()['selected']=='blog')
                page.keyboard.press('Home');page.wait_for_timeout(100);check('Home returns',state()['selected']=='sasu')
                choose('hanbok-hero')
                # Reduced mode opens the actual included experience and return selection.
                page.locator('[data-world-project="hanbok-hero"] .world-label').click()
                page.wait_for_url('**/experiences/hanbok-hero/')
                check('Seonbi destination',page.url.endswith('/experiences/hanbok-hero/'))
                page.go_back(wait_until='networkidle');page.wait_for_function("document.querySelector('#scene-status').hidden")
                check('return selected Seonbi',state()['selected']=='hanbok-hero')
                choose('detail-pages')
                page.locator('[data-world-project="detail-pages"] .world-label').click()
                page.wait_for_url('**/experiences/detail-pages/')
                check('Detail Pages destination',page.url.endswith('/experiences/detail-pages/'))
                page.go_back(wait_until='networkidle');page.wait_for_function("document.querySelector('#scene-status').hidden")
                check('return selected Detail Pages',state()['selected']=='detail-pages')
                choose('hanbok-hero')
                page.evaluate("async()=>{const m=await import('/preferences.js');m.setPreferences({...m.readPreferences(),motion:'full'})}")
                page.locator('[data-world-project="hanbok-hero"] .world-label').click()
                check('animated entry',state()['state']=='entering')
                page.keyboard.press('Escape');check('Escape cancels entry',state()['state']=='walking')
                check('no overflow',page.evaluate('document.documentElement.scrollWidth<=innerWidth'))
                check('no JS errors',not errors,errors)
                report={'status':'PASS','checks':results,'errors':errors}
            except Exception as e:
                report={'status':'FAIL','error':str(e),'checks':results,'errors':errors}
                page.screenshot(path=str(OUT/f'village-houses-{name}-failure.png'))
            (OUT/f'village-houses-{name}-qa.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
            print(name,report['status'],len(results),report.get('error',''),flush=True)
            page.close()
            assert report['status']=='PASS',report.get('error')
    finally: browser.close()
