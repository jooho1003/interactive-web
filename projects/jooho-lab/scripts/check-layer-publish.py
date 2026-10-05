"""Build first. Tests static deployment defaults and local save failures without changing publish files."""
import json
import tempfile
import threading
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from playwright.sync_api import sync_playwright

APP=Path(__file__).resolve().parents[1]
BUILD=APP/'dist/client'
OUTPUT=APP/'art/gallery-layer-publish'
OUTPUT.mkdir(parents=True,exist_ok=True)
KEY='jooho-lab-spatial-layers-v1'
published={'format':'iw-layers/1','work':'jooho-lab','manifestVersion':1,'base':{'courtyard-trees':{'x':14,'z':-3},'courtyard-tree-back':{'x':15},'intro':{'positionX':24}},'responsive':{'mobile':{'intro':{'positionX':12}}},'scenes':{'project':{'base':{'potato-card':{'positionX':.04}},'responsive':{'mobile':{'potato-card':{'positionY':-.02}}}}}}
results=[]

def check(name,passed):
    results.append({'name':name,'pass':bool(passed)})
    assert passed,name

def ready(page):
    page.wait_for_function("document.querySelector('#scene-status').hidden",timeout=90000)

def values(page):
    return page.evaluate("async()=>(await import('/app.js')).layerHost.values")

def edit(page,x):
    page.locator('#layer-pick').select_option('intro')
    field=page.locator('#layer-fields [data-param="positionX"]')
    field.fill(str(x));field.press('Tab')

class StaticBuild(SimpleHTTPRequestHandler):
    def log_message(self,*args):pass
    def do_GET(self):
        if self.path.split('?')[0]=='/layers.values.json':
            body=fixture.read_bytes();self.send_response(200);self.send_header('Content-Type','application/json');self.send_header('Cache-Control','no-store');self.end_headers();self.wfile.write(body)
        else:super().do_GET()

with tempfile.TemporaryDirectory(prefix='gallery-publish-') as directory:
    fixture=Path(directory)/'layers.values.json';fixture.write_text(json.dumps(published),encoding='utf-8')
    server=ThreadingHTTPServer(('127.0.0.1',0),partial(StaticBuild,directory=str(BUILD)))
    threading.Thread(target=server.serve_forever,daemon=True).start()
    url=f'http://127.0.0.1:{server.server_port}/'
    try:
        check('build includes exact committed values',(BUILD/'layers.values.json').read_bytes()==(APP/'public/layers.values.json').read_bytes())
        with sync_playwright() as p:
            browser=p.chromium.launch(headless=True,args=['--enable-gpu','--use-angle=d3d11'])
            context=browser.new_context(viewport={'width':1440,'height':900},reduced_motion='reduce')
            page=context.new_page();errors=[];page.on('pageerror',lambda error:errors.append(str(error)))
            page.goto(url);ready(page)
            check('fresh visitor loads published file',values(page)==published)
            check('published tree position reaches renderer',page.locator('#scene').get_attribute('data-tree-x')=='14')
            page.locator('#layer-edit-toggle').click();check('static save labeled as browser draft',page.locator('#layer-save').inner_text()=='브라우저 초안 저장')
            edit(page,45);page.locator('#layer-save').click()
            page.wait_for_function("document.querySelector('#layer-status').textContent.includes('초안을 저장했습니다')")
            page.reload();ready(page);check('static browser draft retains on same published version',values(page)['base']['intro']['positionX']==45)
            updated=json.loads(json.dumps(published));updated['base']['intro']['positionX']=30
            fixture.write_text(json.dumps(updated),encoding='utf-8');page.reload();ready(page)
            check('new deployment replaces obsolete browser draft',values(page)==updated)
            page.evaluate('(args)=>localStorage.setItem(args.key,JSON.stringify(args.values))',{'key':KEY,'values':published})
            page.reload();ready(page);check('old local-only storage never masks deployed defaults',values(page)==updated)
            page.locator('#layer-edit-toggle').click();edit(page,50)
            page.evaluate("()=>{Storage.prototype.setItem=()=>{throw new Error('storage blocked')}}")
            page.locator('#layer-save').click();page.wait_for_function("document.querySelector('#layer-status').textContent.includes('저장하지 못했습니다')")
            check('static storage failure keeps draft dirty','미저장' in page.locator('#layer-edit-toggle').inner_text())
            check('no static runtime errors',not errors);context.close()
            context=browser.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True,reduced_motion='reduce')
            page=context.new_page();page.goto(url);ready(page)
            check('mobile published responsive scope applied',page.locator('html').evaluate("e=>e.style.getPropertyValue('--L-intro-positionX')").strip()=='12px')
            page.locator('#layer-edit-toggle').click();page.locator('#layer-pick').select_option('potato-card')
            check('published project mobile scope applied',page.locator('#scene').get_attribute('data-potato-position-y')=='-0.02')
            context.close()
            # API failure is distinct from an unsupported static deployment API.
            for failure in [500,403,'bad-values','bad-json']:
                context=browser.new_context(viewport={'width':1440,'height':900})
                def fail_api(route):
                    if failure=='bad-values':route.fulfill(json={'canEdit':True,'revision':'1','values':{}})
                    elif failure=='bad-json':route.fulfill(status=200,body='{broken',content_type='application/json')
                    else:route.fulfill(status=failure,json={'error':'failed'})
                context.route('**/api/layers',fail_api)
                page=context.new_page();page.goto(url);ready(page);page.locator('#layer-edit-toggle').click();edit(page,60);page.locator('#layer-save').click()
                page.wait_for_function("document.querySelector('#layer-status').textContent.includes('저장하지 못했습니다')")
                check(f'API {failure} cannot claim browser save success','미저장' in page.locator('#layer-edit-toggle').inner_text() and page.evaluate(f"localStorage.getItem('{KEY}')")==None)
                context.close()
            context=browser.new_context(viewport={'width':1440,'height':900})
            legacy=json.loads(json.dumps(updated));legacy['base']['intro']['positionX']=65
            context.add_init_script(f"localStorage.setItem('{KEY}',{json.dumps(json.dumps(legacy))})")
            pending=[]
            def local_api(route):
                if route.request.method=='PUT':pending.append(route)
                else:route.fulfill(json={'canEdit':True,'revision':'1','values':updated})
            context.route('**/api/layers',local_api)
            page=context.new_page();page.goto(url);ready(page)
            check('legacy local edits preserved and marked unpublished',values(page)==legacy and '미저장' in page.locator('#layer-edit-toggle').inner_text())
            page.locator('#layer-edit-toggle').click();edit(page,70);page.locator('#layer-save').click()
            page.wait_for_function("document.querySelector('#layer-save').disabled")
            check('duplicate save blocked while request is pending',page.locator('#layer-save').is_disabled())
            edit(page,75);request=pending[0].request.post_data_json
            pending[0].fulfill(json={'canEdit':True,'revision':'2','values':request['values']})
            page.wait_for_function("!document.querySelector('#layer-save').disabled")
            check('edit during save remains an unsaved draft',request['values']['base']['intro']['positionX']==70 and values(page)['base']['intro']['positionX']==75 and '미저장' in page.locator('#layer-edit-toggle').inner_text())
            page.locator('#layer-restore').click();check('restore uses actual saved request snapshot',values(page)['base']['intro']['positionX']==70)
            context.close();browser.close()
    finally:
        server.shutdown();server.server_close()
        (OUTPUT/'publish-qa.json').write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf-8')
        print(json.dumps({'passed':sum(r['pass'] for r in results),'total':len(results)},ensure_ascii=True))
