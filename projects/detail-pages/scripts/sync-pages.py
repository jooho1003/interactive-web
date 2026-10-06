"""shortform-automation 상세페이지 결과 → dist/pages/<slug>/ 스냅숏 · 미리보기 캡처 · dist/pages.js · 전시 표지.

사용: python projects/detail-pages/scripts/sync-pages.py [--source <shortform-automation/상세페이지 폴더>]
게시할 목록과 순서의 정본은 pages.config.json이다. 원본 HTML은 고치지 않는다.
"""
import argparse
import base64
import hashlib
import io
import json
import re
import shutil
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
REPO = ROOT.parents[1]
DIST = ROOT / 'dist'
DATA_URI = re.compile(r'data:image/(png|jpeg|webp);base64,([A-Za-z0-9+/=]+)')
# 로컬 편집 콘솔(localhost:3123)로 돌아가는 링크는 공개 페이지에서 동작하지 않는다.
LOCAL_LINK = re.compile(r'<a\b[^>]*href="https?://(?:localhost|127\.0\.0\.1)[^"]*"[^>]*>.*?</a>', re.S)
TAG = re.compile(r'^\[([^\]]+)\]\s*')
PREVIEW_WIDTH = 720
COVER = (1800, 1125)


def snapshot(html, folder):
    media = folder / 'media'
    media.mkdir(parents=True)
    names = {}

    def extract(match):
        raw = base64.b64decode(match.group(2))
        key = hashlib.sha256(raw).hexdigest()
        if key not in names:
            name = f'{len(names) + 1:02d}.webp'
            image = Image.open(io.BytesIO(raw))
            image = image.convert('RGBA' if 'A' in image.getbands() else 'RGB')
            image.save(media / name, 'WEBP', quality=86, method=6)
            names[key] = name
        return './media/' + names[key]

    html = DATA_URI.sub(extract, html)
    html = LOCAL_LINK.sub('', html)
    for banned in ('localhost', 'data:image', '<script'):
        if banned in html:
            raise SystemExit(f'{folder.name}: 공개 스냅숏에 {banned!r}가 남았습니다.')
    return html, len(names)


def capture(page, path, width):
    page.set_viewport_size({'width': width, 'height': 900})
    page.goto(path.as_uri())
    page.wait_for_load_state('networkidle')
    page.evaluate('document.fonts.ready')
    return Image.open(io.BytesIO(page.screenshot(full_page=True))).convert('RGB')


def shadowed(board, image, x, y):
    shadow = Image.new('L', (image.width + 80, image.height + 80), 0)
    ImageDraw.Draw(shadow).rectangle((40, 48, image.width + 40, image.height + 40), fill=70)
    board.paste((48, 44, 36), (x - 40, y - 40), shadow.filter(ImageFilter.GaussianBlur(18)))
    board.paste(image, (x, y))


def cover(strips):
    """전시 표지: 상세페이지마다 데스크톱·모바일 전체 길이 캡처를 나란히 둔 보드(생성 그림 아님)."""
    board = Image.new('RGB', COVER, (236, 230, 218))
    height = COVER[1] - 170
    scaled = [[strip.resize((round(strip.width * height / strip.height), height), Image.LANCZOS) for strip in pair] for pair in strips]
    inner, outer = 34, 120
    total = sum(sum(s.width for s in pair) + inner for pair in scaled) + outer * (len(scaled) - 1)
    x, y = (COVER[0] - total) // 2, 85
    for pair in scaled:
        for strip in pair:
            shadowed(board, strip, x, y)
            x += strip.width + inner
        x += outer - inner
    return board


def main():
    sys.stdout.reconfigure(encoding='utf-8')
    parser = argparse.ArgumentParser()
    parser.add_argument('--source', help='shortform-automation/상세페이지 폴더 (기본: pages.config.json의 source, 저장소 루트 기준)')
    args = parser.parse_args()
    config = json.loads((ROOT / 'pages.config.json').read_text(encoding='utf-8'))
    source = Path(args.source) if args.source else (REPO / config['source']).resolve()
    if not source.is_dir():
        raise SystemExit(f'원본 폴더가 없습니다: {source} (--source로 지정)')

    shutil.rmtree(DIST / 'pages', ignore_errors=True)
    entries, strips = [], []
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()
        page = browser.new_page()
        for index, item in enumerate(config['pages'], 1):
            origin = source / item['folder']
            project = json.loads((origin / '프로젝트.json').read_text(encoding='utf-8'))
            html, images = snapshot((origin / item['html']).read_text(encoding='utf-8'), DIST / 'pages' / item['slug'])
            note = f"<!-- 원본: shortform-automation/상세페이지/{item['folder']}/{item['html']} · sync-pages.py가 그림을 media/로 분리하고 로컬 편집기 링크를 지웠다 -->\n"
            target = DIST / 'pages' / item['slug'] / 'index.html'
            target.write_text(note + html, encoding='utf-8')

            desktop, mobile = capture(page, target, 1440), capture(page, target, 390)
            preview = desktop.resize((PREVIEW_WIDTH, round(desktop.height * PREVIEW_WIDTH / desktop.width)), Image.LANCZOS)
            preview.save(target.parent / 'preview.webp', 'WEBP', quality=82, method=6)
            strips.append((desktop, mobile))

            title = project['title']
            label = TAG.match(title)
            entries.append({
                'slug': item['slug'], 'number': f'{index:02d}',
                'label': label.group(1) if label else '', 'name': TAG.sub('', title),
                'client': project['client'], 'product': project['product'],
                'message': project['keyMessage'], 'objective': project['objective'],
                'sections': len(project['sections']), 'images': images,
                'date': project['createdAt'][:10],
                'href': f"./pages/{item['slug']}/", 'preview': f"./pages/{item['slug']}/preview.webp",
                'width': preview.width, 'height': preview.height,
            })
            print(f"{item['slug']}: 그림 {images}장, 데스크톱 {desktop.height}px, 모바일 {mobile.height}px")
        browser.close()

    (DIST / 'pages.js').write_text('export default ' + json.dumps(entries, ensure_ascii=False, indent=2) + ';\n', encoding='utf-8')
    (DIST / 'assets').mkdir(exist_ok=True)
    cover(strips).save(DIST / 'assets' / 'cover.webp', 'WEBP', quality=88, method=6)
    print(f'pages.js {len(entries)}개, assets/cover.webp {COVER[0]}×{COVER[1]}')


if __name__ == '__main__':
    main()
