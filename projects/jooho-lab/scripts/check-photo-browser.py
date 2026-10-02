"""Headless QA fallback when Aside CDP is unavailable; uses existing QA harness."""
import json, sys
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'art'
PREFIX=sys.argv[sys.argv.index('--prefix')+1] if '--prefix' in sys.argv else 'photo'
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    try:
        sizes=[('desktop',1440,900),('mobile',390,844),('short-mobile',390,600)]
        if '--mobile' in sys.argv:sizes=sizes[1:]
        for name,width,height in ([] if '--capture' in sys.argv else sizes):
            page=browser.new_page(viewport={'width':width,'height':height},device_scale_factor=1)
            errors=[]
            page.on('pageerror',lambda error:errors.append(str(error)))
            mode='1' if name=='desktop' else 'mobile'
            page.goto(f'http://127.0.0.1:8879/?qa={mode}',wait_until='networkidle',timeout=60000)
            page.wait_for_function("() => {const el=document.querySelector('#qa-report');if(!el?.textContent)return false;return ['PASS','FAIL'].includes(JSON.parse(el.textContent).status)}",timeout=120000)
            report=json.loads(page.locator('#qa-report').inner_text());report['browser']='Headless Playwright Chromium';report['pageErrors']=errors
            (OUT/f'{PREFIX}-{name}-qa.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf8')
            print(name,report['status'],report.get('count'),report.get('error',''),flush=True)
            assert report['status']=='PASS' and not errors,report
            page.close()
        page=browser.new_page(viewport={'width':1440,'height':900},device_scale_factor=1)
        page.goto('http://127.0.0.1:8879/',wait_until='networkidle')
        page.wait_for_function("document.querySelector('#scene')?.dataset.stage==='exterior'",timeout=60000)
        page.locator('#space-view').click()
        page.screenshot(path=str(OUT/f'{PREFIX}-after-exterior.png'))
        # Real browser events, then immediate reduced-motion entry for a stable review.
        page.locator('#movement-toggle').click()
        box=page.locator('#scene').bounding_box()
        x,y=box['x']+box['width']*.6,box['y']+box['height']*.5
        before=page.locator('#scene').get_attribute('data-camera')
        page.mouse.move(x,y);page.mouse.down();page.mouse.move(x+100,y-30,steps=8)
        page.wait_for_timeout(350);page.mouse.up();page.wait_for_timeout(300)
        after=page.locator('#scene').get_attribute('data-camera');assert before!=after
        page.locator('#movement-toggle').click()
        page.locator('#motion-toggle').click()
        page.locator('#spatial-enter').click()
        page.wait_for_function("document.querySelector('#scene').dataset.stage==='hall'")
        page.screenshot(path=str(OUT/f'{PREFIX}-after-interior.png'))
        page.locator('#reset-camera').click()
        page.wait_for_function("document.querySelector('#scene').dataset.stage==='exterior'")
        print('actual pointer drag / hall entry / exterior reset PASS',flush=True)
    finally:
        browser.close()
