"""Run gallery QA when Aside rendering is throttled or unavailable (preview :8879)."""
import json,sys
from pathlib import Path
from playwright.sync_api import sync_playwright

prefix=sys.argv[sys.argv.index('--prefix')+1] if '--prefix' in sys.argv else 'gallery-natural-refinement'
OUT=Path(__file__).resolve().parents[1]/'art'/prefix
OUT.mkdir(exist_ok=True)
with sync_playwright() as p:
    # Windows fallback uses the installed GPU, avoiding SwiftShader timing noise.
    browser=p.chromium.launch(headless=True,args=['--enable-gpu','--use-angle=d3d11'])
    try:
        for name,width,height in [('desktop',1440,900),('mobile',390,844),('narrow',320,700)]:
            page=browser.new_page(viewport={'width':width,'height':height},device_scale_factor=1)
            errors=[]
            page.on('pageerror',lambda error:errors.append(str(error)))
            page.goto('http://127.0.0.1:8879/?qa='+('1' if name=='desktop' else 'mobile'),wait_until='networkidle',timeout=90000)
            gpu=page.evaluate("()=>{const gl=document.createElement('canvas').getContext('webgl2');const e=gl.getExtension('WEBGL_debug_renderer_info');return e&&gl.getParameter(e.UNMASKED_RENDERER_WEBGL)}")
            page.wait_for_function("()=>{const el=document.querySelector('#qa-report');return el?.textContent&&['PASS','FAIL'].includes(JSON.parse(el.textContent).status)}",timeout=300000)
            report=json.loads(page.locator('#qa-report').inner_text());report['pageErrors']=errors
            report['renderer']=gpu
            (OUT/f'{name}-qa.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
            print(name,report['status'],report.get('count'),report.get('error',''),flush=True)
            assert report['status']=='PASS' and not errors,report.get('error') or errors
            page.close()
        for name,width,height in [('desktop',1440,900),('mobile',390,844),('narrow',320,700)]:
            page=browser.new_page(viewport={'width':width,'height':height},reduced_motion='reduce')
            page.goto('http://127.0.0.1:8879/',wait_until='networkidle',timeout=90000)
            page.wait_for_function("document.querySelector('#scene-status').hidden",timeout=90000)
            page.screenshot(path=str(OUT/f'{name}-exterior.png'))
            page.locator('#spatial-enter').click()
            page.screenshot(path=str(OUT/f'{name}-hall.png'))
            for work in ['day-walk','potato-designer','hanbok-hero']:
                page.locator(f'#gallery-pagination button[data-id="{work}"]').click()
                page.screenshot(path=str(OUT/f'{name}-{work}.png'))
            page.close()
        print('visual captures complete',flush=True)
    finally:
        browser.close()
