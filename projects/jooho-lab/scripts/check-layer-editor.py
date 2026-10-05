"""Real pointer QA. Start preview-spatial.mjs, then run this with Playwright installed."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright

URL='http://127.0.0.1:8879/'
OUTPUT=Path(__file__).resolve().parents[1]/'art/gallery-layer-editor'
OUTPUT.mkdir(parents=True,exist_ok=True)
KEY='jooho-lab-spatial-layers-v1'
results=[]

# File-saving QA is isolated from the author's real publish file.
def mock_publishing(context):
    state={'canEdit':True,'revision':'0','values':{'format':'iw-layers/1','work':'jooho-lab','manifestVersion':1,'base':{},'responsive':{},'scenes':{}},'fail':False}
    def route_api(route):
        if route.request.method=='PUT':
            if state['fail']:
                route.fulfill(status=500,json={'error':'프로젝트 파일 저장 실패'});return
            body=route.request.post_data_json
            state['values']=body['values'];state['revision']=str(int(state['revision'])+1)
        route.fulfill(json={k:state[k] for k in ['canEdit','revision','values']})
    context.route('**/api/layers',route_api)
    context.route('**/layers.values.json',lambda route:route.fulfill(json=state['values']))
    return state

def saved_status(page):
    page.wait_for_function("!document.querySelector('#layer-save').disabled && document.querySelector('#layer-status').textContent.includes('저장했습니다')")

def check(name,passed,detail=None):
    results.append({'name':name,'pass':bool(passed),'detail':detail})
    assert passed,f'{name}: {detail}'

def inspect(page):
    return page.evaluate("async()=>{const a=await import('/app.js');return {scene:a.inspectScene(),values:a.layerHost.values};}")

def ready(page):
    page.wait_for_function("document.querySelector('#scene-status').hidden",timeout=90000)
    check('3D ready',not page.locator('#space-view').is_disabled())

def pick(page,id):
    page.locator('#layer-pick').select_option(id)
    page.wait_for_timeout(200)

def drag_handle(page,dx,dy,cancel=False):
    box=page.locator('#layer-drag-handle').bounding_box()
    assert box
    x=box['x']+min(box['width']/2,50);y=box['y']+box['height']/2
    page.mouse.move(x,y);page.mouse.down();page.mouse.move(x+dx,y+dy,steps=8)
    if cancel: page.keyboard.press('Escape')
    page.mouse.up();page.wait_for_timeout(150)

def field(page,key,value):
    node=page.locator(f'#layer-fields [data-param="{key}"]')
    node.fill(str(value));node.press('Tab');page.wait_for_timeout(100)

with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,args=['--enable-gpu','--use-angle=d3d11'])
    context=browser.new_context(viewport={'width':1440,'height':900},device_scale_factor=1)
    publishing=mock_publishing(context)
    page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    try:
        page.goto(URL);ready(page);before=inspect(page)
        page.locator('#layer-edit-toggle').click();page.wait_for_timeout(250)
        check('explicit save is visible',page.locator('#layer-save').is_visible() and page.locator('#layer-save').bounding_box()['y']<900)
        check('opening is clean',inspect(page)['values']==before['values'])
        page.screenshot(path=str(OUTPUT/'desktop-editor.png'))
        start=inspect(page);camera=start['scene']['renderCamera'];storage=page.evaluate(f"localStorage.getItem('{KEY}')")
        drag_handle(page,28,-8)
        moved=inspect(page)
        check('tree actual position changed',moved['scene']['trees']['x']!=start['scene']['trees']['x'],moved['scene']['trees'])
        check('camera remains fixed',moved['scene']['renderCamera']==camera)
        check('draft does not persist',page.evaluate(f"localStorage.getItem('{KEY}')")==storage)
        check('tree safety preserved',moved['scene']['trees']['clearsBuilding'])
        page.locator('#layer-undo').click();check('one drag is one undo',inspect(page)['values']==start['values'])
        page.locator('#layer-fields [data-param="visible"]').uncheck();hidden=inspect(page)['scene']['trees']['items']
        check('hiding one tree keeps canvas and other tree',not hidden[0]['visible'] and hidden[1]['visible'] and page.locator('#scene').is_visible())
        page.locator('#layer-fields [data-param="visible"]').check()
        page.locator('#layer-restore').click()
        drag_handle(page,20,0,cancel=True);check('Escape cancels drag only',inspect(page)['values']==start['values'] and page.locator('#spatial-layer-editor').is_visible())
        rect=page.locator('#layer-selection').bounding_box();start=inspect(page)
        x=rect['x']+rect['width']*.4;y=rect['y']+rect['height']*.75
        page.mouse.move(x,y);page.mouse.down();page.mouse.move(x+15,y,steps=6);page.mouse.up();page.wait_for_timeout(100)
        picked=page.locator('#layer-pick').input_value();index=0 if picked=='courtyard-trees' else 1
        check('direct screen tree drag',picked in ['courtyard-trees','courtyard-tree-back'] and inspect(page)['scene']['trees']['items'][index]['x']!=start['scene']['trees']['items'][index]['x'],{'picked':picked})
        page.locator('#layer-undo').click()
        pick(page,'courtyard-tree-back');start=inspect(page);drag_handle(page,22,0)
        check('back tree moves independently',inspect(page)['scene']['trees']['items'][1]['x']!=start['scene']['trees']['items'][1]['x'] and inspect(page)['scene']['trees']['items'][0]['x']==start['scene']['trees']['items'][0]['x'])
        page.locator('#layer-undo').click()
        pick(page,'intro');start=page.locator('.intro').bounding_box();drag_handle(page,30,16);after=page.locator('.intro').bounding_box()
        check('DOM exact screen drag',abs(after['x']-start['x']-30)<1 and abs(after['y']-start['y']-16)<1,{'before':start,'after':after})
        page.locator('#layer-drag-handle').focus();page.keyboard.press('Shift+ArrowRight')
        check('keyboard position adjustment',inspect(page)['values']['base']['intro']['positionX']==40)
        page.locator('#layer-fields [data-param="positionX"]').fill('55');page.keyboard.press('Control+s');saved_status(page);saved=inspect(page)['values']
        check('shortcut commits focused input',saved['base']['intro']['positionX']==55)
        check('save publishes current draft',publishing['values']==saved and '프로젝트 파일' in page.locator('#layer-status').inner_text())
        page.keyboard.press('Escape');check('Escape closes mode',not page.locator('#spatial-layer-editor').is_visible())
        page.reload();ready(page);check('reload retains positions',inspect(page)['values']==saved)
        page.locator('#layer-edit-toggle').click();pick(page,'intro');field(page,'positionX',60)
        page.locator('#layer-restore').click();check('restore returns to saved',inspect(page)['values']==saved)
        page.locator('#layer-scene').select_option('exterior');field(page,'positionX',30)
        page.locator('#layer-scene').select_option('all')
        check('global fields read global value',page.locator('#layer-fields [data-param="positionX"]').input_value()=='55')
        drag_handle(page,20,0);scoped=inspect(page)['values']
        check('visual drag edits effective scene override',page.locator('#layer-scene').input_value()=='exterior' and scoped['scenes']['exterior']['base']['intro']['positionX']==50 and scoped['base']['intro']['positionX']==55)
        page.locator('#layer-restore').click();page.locator('#layer-scene').select_option('all')
        pick(page,'courtyard-trees');field(page,'x',10)
        check('numeric boundary keeps building clear',inspect(page)['scene']['trees']['clearsBuilding'])
        page.locator('#layer-restore').click()
        pick(page,'potato-card');start=inspect(page)
        check('POTATO renderer and DOM selection agree',start['scene']['selected']=='potato-designer' and page.locator('#detail-title').inner_text()=='POTATO')
        check('POTATO drag handle available',page.locator('#layer-drag-handle').is_visible())
        drag_handle(page,10,3);after=inspect(page)
        check('POTATO actual plane position changes',after['scene']['potato']['position']!=start['scene']['potato']['position'])
        page.locator('#layer-undo').click();pick(page,'potato-shadow');start=inspect(page);drag_handle(page,8,0)
        check('shadow independent of character',inspect(page)['scene']['potato']['shadow']['position']!=start['scene']['potato']['shadow']['position'] and inspect(page)['scene']['potato']['position']==start['scene']['potato']['position'])
        page.locator('#layer-restore').click();pick(page,'editor');page.locator('#layer-fields [data-param="visible"]').uncheck()
        page.locator('#layer-edit-toggle').click();check('hidden editor recovers',page.locator('#spatial-layer-editor').is_visible())
        field(page,'opacity',0);page.locator('#layer-edit-toggle').click();check('transparent editor recovers',page.locator('#spatial-layer-editor').evaluate("e=>getComputedStyle(e).opacity")=='1')
        page.locator('#layer-restore').click();pick(page,'intro');field(page,'positionX',80)
        page.evaluate("()=>{Storage.prototype.setItem=function(){throw new DOMException('Quota','QuotaExceededError')};}")
        page.locator('#layer-save').click();saved_status(page)
        check('file save survives blocked browser storage',publishing['values']['base']['intro']['positionX']==80)
        field(page,'positionX',85);publishing['fail']=True
        page.locator('#layer-save').click();page.wait_for_function("document.querySelector('#layer-status').textContent.includes('저장하지 못했습니다')")
        check('file failure is honest', '미저장' in page.locator('#layer-edit-toggle').inner_text() and publishing['values']['base']['intro']['positionX']==80)
        with page.expect_download() as download:page.locator('#layer-export').click()
        exported=json.loads(Path(download.value.path()).read_text(encoding='utf-8'))
        check('failed-save draft can export',exported['base']['intro']['positionX']==85)
        page.locator('#layer-restore').click();page.keyboard.press('Escape')
        # Generic layer-kit probe uses the actual CSS declarations and attributes.
        page.locator('#layer-edit-toggle').click();pick(page,'courtyard-trees')
        exterior_probe=page.evaluate("async()=>{const {layerHost}=await import('/app.js');const {probe}=await import('/vendor/layer-kit/probe.js');return await probe(layerHost);}")
        pick(page,'detail')
        project_probe=page.evaluate("async()=>{const {layerHost}=await import('/app.js');const {probe}=await import('/vendor/layer-kit/probe.js');return await probe(layerHost);}")
        failures={(f['layer'],f['key']) for f in exterior_probe['failed']} & {(f['layer'],f['key']) for f in project_probe['failed']}
        probe={'total':exterior_probe['total'],'passed':exterior_probe['total']-len(failures),'failed':list(failures),'scenes':{'exterior':exterior_probe,'project':project_probe}}
        check('all layer parameters probe',probe['passed']==probe['total'],probe)
        (OUTPUT/'layer-probe.json').write_text(json.dumps(probe,indent=2,ensure_ascii=False),encoding='utf-8')
        check('no runtime errors',not errors,errors)
        context.close()
        for width in [1024,1100]:
            context=browser.new_context(viewport={'width':width,'height':900},device_scale_factor=1)
            mock_publishing(context)
            page=context.new_page();page.goto(URL);ready(page);page.locator('#layer-edit-toggle').click();pick(page,'potato-card')
            check(f'{width} POTATO preview clears copy',page.locator('#layer-drag-handle').is_visible() and not page.locator('#project-detail').is_visible())
            page.screenshot(path=str(OUTPUT/f'desktop-{width}-potato.png'))
            context.close()
        for width,height in [(390,844),(360,740)]:
            context=browser.new_context(viewport={'width':width,'height':height},device_scale_factor=1,is_mobile=True,has_touch=True,reduced_motion='reduce')
            mock_publishing(context)
            page=context.new_page();page.goto(URL);ready(page);page.locator('#layer-edit-toggle').click();page.wait_for_timeout(250)
            panel=page.locator('#spatial-layer-editor').bounding_box();canvas=page.locator('#scene').bounding_box();save=page.locator('#layer-save').bounding_box()
            check(f'{width} preview and dock do not overlap',canvas['y']+canvas['height']<=panel['y']+1,{'panel':panel,'canvas':canvas})
            check(f'{width} save reachable',0<=save['y'] and save['y']+save['height']<=height+1,save)
            check(f'{width} no horizontal overflow',page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
            check(f'{width} both tree controls available',page.locator('#layer-pick option').count()==12)
            box=page.locator('#layer-drag-handle').bounding_box();x=box['x']+box['width']/2;y=box['y']+box['height']/2;before=inspect(page)
            cdp=context.new_cdp_session(page)
            cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':x,'y':y}]})
            cdp.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':x+16,'y':y}]})
            cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]});page.wait_for_timeout(150)
            check(f'{width} real touch drag',inspect(page)['values']!=before['values'] and inspect(page)['scene']['trees']['clearsBuilding'])
            page.locator('#layer-restore').click()
            field(page,'x',14);page.locator('#layer-save').click();saved_status(page);page.reload();ready(page)
            check(f'{width} mobile save persists',inspect(page)['values']['base']['courtyard-trees']['x']==14)
            page.locator('#layer-edit-toggle').click();page.screenshot(path=str(OUTPUT/f'mobile-{width}-editor.png'))
            context.close()
        browser.close()
    finally:
        (OUTPUT/'editor-qa.json').write_text(json.dumps({'results':results,'errors':errors},indent=2,ensure_ascii=False),encoding='utf-8')
        print(json.dumps({'passed':sum(r['pass'] for r in results),'total':len(results),'last':results[-1] if results else None},ensure_ascii=True))
