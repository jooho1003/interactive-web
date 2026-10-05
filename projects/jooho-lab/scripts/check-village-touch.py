import json
from pathlib import Path
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    try:
        context=browser.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True)
        page=context.new_page()
        page.goto('http://127.0.0.1:8879/village.html',wait_until='networkidle')
        page.wait_for_function("document.querySelector('#scene-status').hidden")
        page.locator('#gallery-pagination [data-id="blog"]').click()
        page.wait_for_timeout(1400)
        state="async()=>(await import('/app.js')).inspectScene()"
        before=page.evaluate(state)
        cdp=context.new_cdp_session(page)
        def swipe(x1,y1,x2,y2):
            cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':x1,'y':y1}]})
            for i in range(1,13):
                cdp.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':x1+(x2-x1)*i/12,'y':y1+(y2-y1)*i/12}]})
                page.wait_for_timeout(16)
            cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
            page.wait_for_timeout(1600)
        swipe(350,280,45,280)
        after=page.evaluate(state)
        assert after['x']>before['x']+3,(before,after)
        assert after['state']=='walking'
        saved=after['x'];page.wait_for_timeout(600)
        assert abs(page.evaluate(state)['x']-saved)<.03
        swipe(300,450,300,190)
        assert page.evaluate('scrollY')>50
        report={'status':'PASS','fullMotionTouchDrag':{'before':before,'after':after},'verticalScrollY':page.evaluate('scrollY')}
        Path('projects/jooho-lab/art/village-houses-touch-qa.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
        print('PASS full motion touch distance, position retained, vertical scroll',flush=True)
        page.close();context.close()
        for name,w,h in [('desktop',1440,900),('mobile',390,844),('narrow',320,700)]:
            page=browser.new_page(viewport={'width':w,'height':h})
            page.goto('http://127.0.0.1:8879/village.html?qa=movement',wait_until='networkidle')
            page.wait_for_function("document.querySelector('#village-qa-report')?.textContent.includes('status')",timeout=60000)
            report=page.evaluate("JSON.parse(document.querySelector('#village-qa-report').textContent)")
            Path(f'projects/jooho-lab/art/village-houses-{name}-full-qa.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
            print(name,'existing harness',report['status'],len(report.get('results',[])),report.get('error',''),flush=True)
            assert report['status']=='PASS'
            page.close()
    finally: browser.close()
