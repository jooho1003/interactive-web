"""Stable browser QA after Aside background-tab visibility interrupted its renderer."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright

OUT=Path(__file__).resolve().parents[1]/'art'/'village-page'
OUT.mkdir(parents=True,exist_ok=True)
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    try:
        for name,width,height in [('desktop',1440,900),('mobile',390,844),('short-mobile',390,600)]:
            context=browser.new_context(viewport={'width':width,'height':height},device_scale_factor=1)
            page=context.new_page()
            errors=[]
            page.on('pageerror',lambda error:errors.append(str(error)))
            page.goto('http://127.0.0.1:8879/village.html?qa=1',wait_until='networkidle')
            page.wait_for_function("document.querySelector('#village-qa-report')?.textContent.includes('status')",timeout=60000)
            report=json.loads(page.locator('#village-qa-report').inner_text())
            report['pageErrors']=errors
            report['browser']='Headless Playwright Chromium'
            (OUT/f'{name}-qa.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
            print(name,report['status'],report.get('count'),report.get('error',''),flush=True)
            assert report['status']=='PASS' and not errors,report
            context.close()
        # UI pointer actions and stable screenshots use a fresh page without context-loss QA.
        for name,width,height in [('desktop',1440,900),('mobile',390,844),('short-mobile',390,600)]:
            context=browser.new_context(viewport={'width':width,'height':height},device_scale_factor=1)
            page=context.new_page()
            page.goto('http://127.0.0.1:8879/village.html',wait_until='networkidle')
            page.wait_for_selector('[data-world-project="sasu"]:not([hidden])')
            page.screenshot(path=str(OUT/f'{name}.png'))
            page.locator('#gallery-pagination [data-id="day-walk"]').click()
            page.wait_for_selector('[data-world-project="day-walk"]:not([hidden])')
            page.wait_for_timeout(900)
            assert page.locator('[data-world-project="day-walk"]').get_attribute('href')=='https://interactive-web-app-three.vercel.app/experiences/day-walk/'
            page.screenshot(path=str(OUT/f'{name}-day-walk.png'))
            page.locator('#reset-camera').click()
            page.locator('#motion-toggle').click()
            if page.locator('#motion-toggle').get_attribute('aria-pressed')!='false':page.locator('#motion-toggle').click()
            page.wait_for_selector('[data-world-project="sasu"]:not([hidden])')
            page.wait_for_timeout(800)
            page.locator('[data-world-project="sasu"] .world-label').click()
            assert page.locator('.entry-veil').is_visible()
            page.locator('.entry-veil button').click()
            assert not page.locator('.entry-veil').is_visible()
            page.locator('.village-return').click()
            page.wait_for_url('http://127.0.0.1:8879/')
            page.locator('a[href="./village.html"]').click()
            page.wait_for_url('**/village.html*')
            print(name,'real entry/cancel and round-trip links PASS',flush=True)
            context.close()
    finally:
        browser.close()
