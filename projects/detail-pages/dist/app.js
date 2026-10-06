import manifest from './layers.manifest.js';
import published from './layers.values.js';
import pages from './pages.js';
import { createLayerHost } from './vendor/layer-kit/index.js';

export const layerHost = createLayerHost({ manifest, published });

const $ = selector => document.querySelector(selector);
const strip = $('.strip'), viewer = $('.viewer'), stage = $('.viewer-stage'), frame = stage.querySelector('iframe');
const loading = $('.viewer-loading'), title = $('#viewer-title'), counter = $('.viewer-index');
const prev = $('.viewer-prev'), next = $('.viewer-next'), openLink = $('.viewer-open');
const devices = [...viewer.querySelectorAll('[data-device]')];

// current = 덮개에 연 상세페이지 번호, pushed = 덮개를 열며 기록에 해시를 쌓았는지(닫을 때 뒤로 가기로 되돌림)
let current = -1, pushed = false, chosenDevice = null;

function node(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function card(page, index) {
  const link = node('a', 'card');
  link.href = page.href;
  link.dataset.slug = page.slug;
  const holder = node('span', 'card-frame');
  holder.style.aspectRatio = `${page.width} / ${page.height}`;
  const shot = node('img', 'card-shot');
  Object.assign(shot, { src: page.preview, width: page.width, height: page.height, alt: `${page.name} 전체 화면 미리보기`, loading: index < 3 ? 'eager' : 'lazy', decoding: 'async' });
  shot.addEventListener('error', () => holder.classList.add('is-missing'), { once: true });
  holder.append(shot, node('span', 'card-missing', `${page.name}\n미리보기를 불러오지 못했습니다`));
  const caption = node('span', 'caption');
  const top = node('span', 'caption-top');
  top.append(node('span', 'caption-number', page.number));
  if (page.label) top.append(node('span', 'caption-label', page.label));
  caption.append(top, node('strong', 'caption-name', page.name), node('span', 'caption-message', page.message),
    node('span', 'caption-meta', `${page.client} · ${page.date}`), node('span', 'caption-meta', `섹션 ${page.sections} · 그림 ${page.images}`));
  link.append(holder, caption);
  const item = node('li');
  item.append(link);
  return item;
}

strip.replaceChildren(...pages.map(card));
$('.strip-empty').hidden = pages.length > 0;

const indexOf = slug => pages.findIndex(page => page.slug === slug);
const hashIndex = () => indexOf(decodeURIComponent(location.hash.slice(1)));

// 데스크톱 폭 미리보기는 무대보다 넓으면 무대 폭에 맞춰 줄인다.
function fit() {
  if (stage.dataset.device !== 'desktop') return stage.style.removeProperty('--stage-scale');
  stage.style.setProperty('--stage-scale', String(Math.min(1, stage.clientWidth / frame.offsetWidth)));
}
new ResizeObserver(fit).observe(stage);

function setDevice(device) {
  stage.dataset.device = device;
  for (const button of devices) button.setAttribute('aria-pressed', String(button.dataset.device === device));
  fit();
}

function open(index, { record = true } = {}) {
  const page = pages[index];
  if (!page) return;
  current = index;
  title.textContent = page.name;
  counter.textContent = `${index + 1} / ${pages.length}`;
  openLink.href = page.href;
  prev.disabled = index === 0;
  next.disabled = index === pages.length - 1;
  if (frame.dataset.page !== page.slug) {
    loading.hidden = false;
    frame.dataset.page = page.slug;
    // iframe 이동은 브라우저 기록을 쌓는다. 첫 이동(빈 iframe)만 src로, 이후는 replace로 바꿔
    // 덮개를 닫을 때의 뒤로 가기가 iframe 안이 아니라 목록 주소로 돌아가게 한다.
    if (frame.getAttribute('src')) frame.contentWindow.location.replace(new URL(page.href, location.href));
    else frame.src = page.href;
  }
  if (!viewer.open) {
    viewer.showModal();
    document.documentElement.classList.add('is-viewing');
    setDevice(chosenDevice || viewer.dataset.defaultDevice);
  }
  if (layerHost.scene !== 'viewer') layerHost.setScene('viewer');
  const hash = '#' + page.slug;
  if (location.hash === hash) return;
  if (record && !pushed) { history.pushState({ viewer: true }, '', hash); pushed = true; }
  else history.replaceState(history.state, '', hash);
}

frame.addEventListener('load', () => { loading.hidden = true; fit(); });

viewer.addEventListener('close', () => {
  document.documentElement.classList.remove('is-viewing');
  if (layerHost.scene !== 'browse') layerHost.setScene('browse');
  const clearHash = () => history.replaceState(history.state, '', location.pathname + location.search);
  if (location.hash) {
    if (pushed) {
      pushed = false;
      const left = location.hash;
      history.back();
      // 일부 브라우저(Aside)는 iframe 안 pushState가 기록을 쌓지 않아 back이 아무 일도 하지 않는다.
      // 구조값: 뒤로 가기가 끝날 시간을 준 뒤에도 같은 해시면 직접 지운다.
      setTimeout(() => { if (!viewer.open && location.hash === left) clearHash(); }, 400);
    } else clearHash();
  }
  strip.querySelector(`[data-slug="${pages[current]?.slug}"]`)?.focus();
  current = -1;
});

strip.addEventListener('click', event => {
  const link = event.target.closest('.card');
  if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  if (layerHost.get('viewer', 'visible') === false) return; // 덮개 레이어를 끄면 카드가 페이지로 바로 이동한다
  event.preventDefault();
  open(indexOf(link.dataset.slug));
});

$('.viewer-close').addEventListener('click', () => viewer.close());
prev.addEventListener('click', () => open(current - 1));
next.addEventListener('click', () => open(current + 1));
for (const button of devices) button.addEventListener('click', () => { chosenDevice = button.dataset.device; setDevice(chosenDevice); });
viewer.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft' && current > 0) { event.preventDefault(); open(current - 1); }
  if (event.key === 'ArrowRight' && current < pages.length - 1) { event.preventDefault(); open(current + 1); }
});

// 뒤로·앞으로 가기와 주소 해시가 덮개 상태의 정본이다.
addEventListener('popstate', () => {
  const index = hashIndex();
  pushed = index >= 0 && Boolean(history.state?.viewer);
  if (index >= 0) open(index, { record: false });
  else if (viewer.open) viewer.close();
});

// 관리자에서 장면을 바꾸면 덮개도 같이 열고 닫는다(버튼 경로와 같은 open/close를 쓴다).
// 값만 바뀐 apply에는 반응하지 않는다 — probe가 열어 둔 덮개를 닫지 않게.
let lastScene = layerHost.scene;
layerHost.subscribe(({ scene }) => {
  if (scene === lastScene) return;
  lastScene = scene;
  if (scene === 'viewer' && !viewer.open && pages.length) open(Math.max(0, current), { record: false });
  else if (scene === 'browse' && viewer.open) viewer.close();
});

if (hashIndex() >= 0) open(hashIndex(), { record: false });

if (new URLSearchParams(location.search).get('studio') === '1') import('/admin/bridge.js').catch(() => {});
