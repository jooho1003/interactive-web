"""Check independent page settings, storage failure recovery and the real Day Walk link."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright

OUT=Path(__file__).resolve().parents[1]/'art'/'village-page'
def open_layers(page):
    page.locator('#settings-open').click()
    page.locator('.layer-launch').click()
    page.locator('#layer-fields details').nth(1).locator('summary').click()
def set_title(page,text):
    page.get_by_label('첫 인사 제목',exact=True).fill(text)
    page.get_by_label('첫 인사 제목',exact=True).press('Tab')
def close_layers(page):
    page.locator('.layers-dialog .dialog-close').click()

results=[]
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    try:
        context=browser.new_context(viewport={'width':1440,'height':900})
        page=context.new_page()
        page.goto('http://127.0.0.1:8879/village.html',wait_until='networkidle')
        open_layers(page);set_title(page,'기록으로 남는 동네');close_layers(page)
        page.reload(wait_until='networkidle')
        assert page.locator('#page-title').inner_text()=='기록으로 남는 동네'
        open_layers(page)
        page.locator('#layer-scene').select_option('entering')
        page.locator('#layer-fields details').nth(1).locator('summary').click()
        set_title(page,'작품에 들어가요');close_layers(page)
        assert page.locator('#page-title').inner_text()=='기록으로 남는 동네'
        page.locator('[data-world-project="sasu"] .world-label').click()
        assert page.locator('#page-title').inner_text()=='작품에 들어가요'
        page.locator('.entry-veil button').click()
        assert page.locator('#page-title').inner_text()=='기록으로 남는 동네'
        page.locator('.village-return').click();page.wait_for_url('http://127.0.0.1:8879/')
        assert page.locator('#page-title').inner_text()=='아이디어를 실제로.'
        page.locator('a[href="./village.html"]').click();page.wait_for_url('**/village.html*')
        assert page.locator('#page-title').inner_text()=='기록으로 남는 동네'
        results.append({'check':'persistence, entering/walking override and page isolation','status':'PASS'})
        context.close()
        context=browser.new_context(viewport={'width':390,'height':844})
        context.add_init_script("Storage.prototype.setItem=function(){throw Error('storage blocked by QA')}")
        page=context.new_page();page.goto('http://127.0.0.1:8879/village.html',wait_until='networkidle')
        open_layers(page);set_title(page,'저장 없이도 적용')
        assert page.locator('#page-title').inner_text()=='저장 없이도 적용'
        assert '저장이 차단' in page.locator('#layer-status').inner_text()
        with page.expect_download() as event:page.locator('#layer-export').click()
        exported=json.loads(Path(event.value.path()).read_text(encoding='utf8'))
        assert exported['work']=='jooho-lab-village' and exported['base']['intro']['title']=='저장 없이도 적용'
        results.append({'check':'blocked storage keeps live values and exports recovery JSON','status':'PASS'})
        context.close()
        context=browser.new_context(viewport={'width':390,'height':844})
        page=context.new_page();page.goto('http://127.0.0.1:8879/village.html',wait_until='networkidle')
        page.locator('#motion-toggle').click()
        page.locator('#gallery-pagination [data-id="day-walk"]').click()
        page.locator('[data-world-project="day-walk"] .world-label').click()
        page.wait_for_url('https://interactive-web-app-three.vercel.app/experiences/day-walk/**')
        page.wait_for_selector('iframe')
        assert page.title()=='하루 산책 · Day Walk'
        page.frame_locator('iframe').locator('main').wait_for()
        assert page.frame_locator('iframe').locator('main').get_attribute('aria-label')=='Day Walk'
        results.append({'check':'actual Day Walk production navigation','url':page.url,'status':'PASS'})
        context.close()
    finally:
        browser.close()
(OUT/'settings-and-navigation-qa.json').write_text(json.dumps(results,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
for result in results:print(result['check'],'PASS',flush=True)
