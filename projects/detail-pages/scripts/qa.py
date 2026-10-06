"""상세페이지 포트폴리오 브라우저 검수(헤드리스 Chromium).

사용: python projects/detail-pages/scripts/qa.py [--out <캡처 폴더>] [--studio]
- dist/를 임시 정적 서버로 열어 dist/qa/browser-checks.js(+ layer-kit probe)를 실행한다.
- 실제 키(Escape)·뒤로 가기·주소 직접 진입·390px·동작 줄이기를 브라우저 밖에서 확인한다.
- --studio: scripts/serve.mjs(관리자)를 띄워 장면 선택이 미리보기 덮개를 여닫는지 확인한다.
"""
import argparse
import functools
import http.server
import json
import os
import subprocess
import sys
import threading
import time
import urllib.request
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
results = []


def check(name, ok, detail=''):
    results.append({'name': name, 'ok': bool(ok), 'detail': detail})
    print(('PASS ' if ok else 'FAIL ') + name + ('' if ok else f'  {detail}'))


def serve():
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *args):
            pass
    server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=str(ROOT / 'dist')))
    server.handle_error = lambda *args: None  # 페이지를 닫으며 끊긴 연결
    threading.Thread(target=server.serve_forever, daemon=True).start()
    return server, f'http://127.0.0.1:{server.server_port}/'


def closed(page):
    """덮개가 닫히고 해시가 지워질 때까지 기다린다(뒤로 가기로 지우는 경우는 비동기)."""
    try:
        page.wait_for_function("!document.querySelector('.viewer').open && !location.hash", timeout=5000)
    except Exception:
        pass


def in_page(page, probe=False):
    report = page.evaluate(f"import('/qa/browser-checks.js').then(m => m.run({{ probe: {str(probe).lower()} }}))")
    for item in report['results']:
        check(item['name'], item['ok'], item['detail'])


def main():
    sys.stdout.reconfigure(encoding='utf-8')
    parser = argparse.ArgumentParser()
    parser.add_argument('--out', default=str(ROOT / 'art' / 'qa'))
    parser.add_argument('--studio', action='store_true')
    args = parser.parse_args()
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    server, base = serve()
    pages = json.loads((ROOT / 'dist' / 'pages.js').read_text(encoding='utf-8').removeprefix('export default ').rstrip().rstrip(';'))
    errors = []
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()

        # 데스크톱 1440: 페이지 안 검수 + probe
        page = browser.new_page(viewport={'width': 1440, 'height': 900})
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.goto(base)
        page.wait_for_load_state('networkidle')
        page.screenshot(path=str(out / 'desktop-list.jpg'), quality=80)
        in_page(page, probe=True)

        # 실제 키 입력: Enter로 열고 Escape로 닫기, 포커스 복귀
        page.goto(base)
        page.wait_for_load_state('networkidle')
        page.keyboard.press('Tab')
        focused = page.evaluate("document.activeElement.className")
        check('Tab 첫 이동이 카드', focused == 'card', focused)
        page.keyboard.press('Enter')
        page.wait_for_function("document.querySelector('.viewer').open && document.querySelector('.viewer-loading').hidden")
        check('Enter → 덮개 열림', page.evaluate("location.hash") == '#' + pages[0]['slug'])
        page.wait_for_timeout(400)
        page.screenshot(path=str(out / 'desktop-viewer.jpg'), quality=80)
        page.keyboard.press('ArrowRight')
        check('→ 키 → 다음 상세페이지', page.evaluate("location.hash") == '#' + pages[1]['slug'])
        page.keyboard.press('Escape')
        closed(page)
        check('Escape → 닫힘·해시 제거', page.evaluate("location.hash") == '', page.url)
        check('Escape 뒤 포커스가 연 카드로(첫 카드에서 연 뒤 다음으로 옮겨도 마지막 페이지 카드)', page.evaluate("document.activeElement.dataset.slug") == pages[1]['slug'])

        # 뒤로 가기로 닫기, 앞으로 가기로 다시 열기
        page.goto(base)
        page.wait_for_load_state('networkidle')
        page.locator('.card').first.click()
        page.wait_for_function("document.querySelector('.viewer').open")
        page.go_back()
        closed(page)
        check('뒤로 가기 → 덮개 닫힘, 페이지는 그대로', page.url == base, page.url)
        page.go_forward()
        page.wait_for_function("document.querySelector('.viewer').open")
        check('앞으로 가기 → 같은 상세페이지 다시 열림', page.evaluate("location.hash") == '#' + pages[0]['slug'])
        page.locator('.viewer-close').click()
        closed(page)
        check('앞으로 가기 뒤 닫기 → 목록 주소', page.url == base, page.url)

        # 주소로 바로 열기
        page.goto(base + '#' + pages[-1]['slug'])
        page.wait_for_function("document.querySelector('.viewer').open")
        check('해시 주소로 바로 열기', page.evaluate("document.querySelector('#viewer-title').textContent") == pages[-1]['name'])
        page.keyboard.press('Escape')
        closed(page)
        check('직접 진입 후 닫기 → 해시만 지움(이전 기록 유지)', page.url == base, page.url)
        page.close()

        # 모바일 390
        page = browser.new_page(viewport={'width': 390, 'height': 844}, device_scale_factor=2, has_touch=True)
        page.goto(base)
        page.wait_for_load_state('networkidle')
        page.screenshot(path=str(out / 'mobile-list.jpg'), quality=80)
        width = page.evaluate("[document.documentElement.scrollWidth, innerWidth]")
        check('390px 가로 넘침 없음', width[0] <= width[1], width)
        page.locator('.card').first.tap()
        page.wait_for_function("document.querySelector('.viewer').open && document.querySelector('.viewer-loading').hidden")
        state = page.evaluate("({device: document.querySelector('.viewer-stage').dataset.device, frame: document.querySelector('.viewer-stage iframe').getBoundingClientRect().width, bar: document.querySelector('.viewer-bar').scrollWidth <= innerWidth})")
        check('390px: 모바일 폭으로 열림(화면 전체)', state['device'] == 'mobile' and abs(state['frame'] - 390) < 1, state)
        check('390px: 덮개 막대가 화면 안', state['bar'], state)
        page.wait_for_timeout(300)
        page.screenshot(path=str(out / 'mobile-viewer.jpg'), quality=80)
        page.locator('[data-device="desktop"]').tap()
        scale = page.evaluate("getComputedStyle(document.querySelector('.viewer-stage')).getPropertyValue('--stage-scale')")
        check('390px: 데스크톱 폭은 축소해 보여 줌', 0 < float(scale) < 0.3, scale)
        page.close()

        # 동작 줄이기
        page = browser.new_page(viewport={'width': 1440, 'height': 900}, reduced_motion='reduce')
        page.goto(base)
        page.wait_for_load_state('networkidle')
        page.locator('.card').first.hover()
        page.wait_for_timeout(50)
        reduced = page.evaluate("({lift: getComputedStyle(document.querySelector('.card-frame')).transform, transition: getComputedStyle(document.querySelector('.card-frame')).transitionDuration})")
        check('동작 줄이기: 카드 떠오름·전환 없음', reduced['lift'] == 'none' and reduced['transition'] == '0s', reduced)
        page.locator('.card').first.click()
        anim = page.evaluate("getComputedStyle(document.querySelector('.viewer')).animationName")
        check('동작 줄이기: 덮개 전환 없음', anim == 'none', anim)
        page.close()

        # 캡처 실패 시 자리표시
        page = browser.new_page(viewport={'width': 1440, 'height': 900})
        page.route('**/preview.webp', lambda route: route.abort())
        page.goto(base)
        page.wait_for_timeout(500)
        missing = page.evaluate("[...document.querySelectorAll('.card-frame')].map(el => el.classList.contains('is-missing') && el.getBoundingClientRect().height > 100)")
        check('캡처를 못 불러오면 자리표시(크기 유지)', all(missing) and missing, missing)
        page.close()

        if args.studio:
            env = {**os.environ, 'PORT': '4189'}
            proc = subprocess.Popen(['node', str(ROOT / 'scripts' / 'serve.mjs')], env=env, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
            try:
                for _ in range(50):
                    try:
                        urllib.request.urlopen('http://127.0.0.1:4189/', timeout=1)
                        break
                    except Exception:
                        time.sleep(0.2)
                page = browser.new_page(viewport={'width': 1600, 'height': 1000})
                page.goto('http://127.0.0.1:4189/admin')
                page.wait_for_function("document.querySelectorAll('#layers button').length > 0")
                check('관리자: 레이어 목록', page.locator('#layers button').count() == 7, page.locator('#layers button').count())
                page.select_option('#scene', 'viewer')
                preview = page.frame_locator('#preview')
                page.wait_for_timeout(500)
                check('관리자: 장면 "크게 보기" → 미리보기 덮개 열림', preview.locator('.viewer').evaluate('el => el.open'))
                page.select_option('#scene', 'browse')
                page.wait_for_timeout(300)
                check('관리자: 장면 "목록" → 덮개 닫힘', not preview.locator('.viewer').evaluate('el => el.open'))
                page.screenshot(path=str(out / 'studio.jpg'), quality=80)
                page.close()
            finally:
                proc.terminate()
        browser.close()
    server.shutdown()
    check('페이지 오류 없음', not errors, errors)
    failed = [item for item in results if not item['ok']]
    (out / 'qa.json').write_text(json.dumps({'passed': len(results) - len(failed), 'total': len(results), 'results': results}, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f'\n{len(results) - len(failed)}/{len(results)} 통과')
    sys.exit(1 if failed else 0)


if __name__ == '__main__':
    main()
