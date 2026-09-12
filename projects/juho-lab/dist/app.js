import { projects, profile } from './projects.js';
import { registerPortfolioTools } from './webmcp.js';

const $ = (selector) => document.querySelector(selector);
const list = $('#project-list');
const grid = $('#project-grid');
const detail = $('#project-detail');
const filters = $('#filters');
let selected = projects[0].id;
let category = '전체';
let query = '';
let scene;
let view = 'space';
let motion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');

function element(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined) el.textContent = text;
  return el;
}
function visibleProjects() {
  return projects.filter((p) => (category === '전체' || p.category === category) &&
    `${p.title} ${p.subtitle} ${p.category} ${p.tags.join(' ')}`.toLocaleLowerCase().includes(query));
}
function changeSelection(id, updateHash = true) {
  if (!projects.some((p) => p.id === id)) return;
  selected = id;
  const project = projects.find((p) => p.id === id);
  const focusedLabel = detail.contains(document.activeElement) ? document.activeElement.getAttribute('aria-label') : null;
  detail.style.setProperty('--project-color', project.color);
  detail.replaceChildren();
  const top = element('div', 'detail-top');
  top.append(element('span', '', `SELECTED PROJECT / ${project.number}`));
  const controls = element('div', 'detail-navigation');
  for (const [label, text, direction] of [['이전 프로젝트', '←', -1], ['다음 프로젝트', '→', 1]]) {
    const button = element('button', '', text); button.type = 'button'; button.setAttribute('aria-label', label);
    button.addEventListener('click', () => moveSelection(direction)); controls.append(button);
  }
  top.append(controls);
  const title = element('h2', '', project.title); title.id = 'detail-title';
  const features = element('ul', 'detail-features');
  project.details.forEach((item) => features.append(element('li', '', item)));
  const tags = element('div', 'tags'); project.tags.forEach((tag) => tags.append(element('span', '', tag)));
  const link = element('a', 'primary-link', project.linkLabel);
  link.href = project.url; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.append(element('span', '', '↗'));
  detail.append(top, element('p', 'detail-tag', project.type), title, element('p', 'detail-subtitle', project.subtitle),
    element('p', 'detail-description', project.description), features, tags, link, element('p', 'detail-note', project.note));
  if (focusedLabel) Array.from(controls.children).find((button) => button.getAttribute('aria-label') === focusedLabel)?.focus();
  document.querySelectorAll('[data-project]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.project === id)));
  scene?.select(id);
  $('#result-status').textContent = `${project.title} 선택됨. ${project.subtitle}`;
  if (updateHash) history.replaceState(null, '', `#project=${encodeURIComponent(id)}`);
}
function moveSelection(direction) {
  const available = visibleProjects(); if (!available.length) return;
  const index = available.findIndex((p) => p.id === selected);
  changeSelection(available[(index + direction + available.length) % available.length].id);
}
function projectButton(project, mode) {
  const button = element('button', mode === 'list' ? 'index-card' : 'grid-card');
  button.type = 'button'; button.dataset.project = project.id;
  button.style.setProperty('--project-color', project.color);
  button.setAttribute('aria-pressed', String(project.id === selected));
  button.setAttribute('aria-label', `${project.title} — ${project.category}`);
  if (mode === 'list') {
    const meta = element('span', 'index-card-meta');
    meta.append(element('span', '', project.number), element('span', '', project.category));
    button.append(meta, element('span', 'index-card-name', project.title), element('span', 'index-card-line'));
  } else {
    const art = element('span', 'grid-art');
    if (project.image) { const img = element('img'); img.src = project.image; img.alt = ''; img.loading = 'lazy'; art.append(img); }
    else art.textContent = project.mark;
    const copy = element('span', 'grid-copy'); copy.append(element('strong', '', project.title), element('small', '', project.category));
    button.append(art, copy);
  }
  button.addEventListener('click', () => changeSelection(project.id));
  return button;
}
function renderIndex() {
  const available = visibleProjects();
  list.replaceChildren(...available.map((p) => projectButton(p, 'list')));
  grid.replaceChildren(...available.map((p) => projectButton(p, 'grid')));
  $('#project-count').textContent = String(available.length).padStart(2, '0');
  $('#empty-state').hidden = available.length !== 0;
  $('#result-status').textContent = `${available.length}개 프로젝트`;
  scene?.filter(available.map((p) => p.id));
  if (available.length && !available.some((p) => p.id === selected)) changeSelection(available[0].id);
  if (!available.length) {
    detail.replaceChildren(element('p', 'detail-description', '일치하는 프로젝트가 없습니다.'), element('p', 'detail-note', '검색어를 지우거나 다른 분야를 선택해 주세요.'));
  } else if (!$('#detail-title')) changeSelection(selected);
}
for (const name of ['전체', ...new Set(projects.map((p) => p.category))]) {
  const button = element('button', '', name); button.type = 'button'; button.setAttribute('aria-pressed', String(name === category));
  button.addEventListener('click', () => {
    category = name;
    filters.querySelectorAll('button').forEach((el) => el.setAttribute('aria-pressed', String(el === button)));
    renderIndex();
  });
  filters.append(button);
}
$('#search').addEventListener('input', (event) => { query = event.target.value.trim().toLocaleLowerCase(); renderIndex(); });
function setView(next) {
  view = next;
  $('#space').hidden = view !== 'space'; grid.hidden = view !== 'list';
  $('#space-view').setAttribute('aria-pressed', String(view === 'space'));
  $('#list-view').setAttribute('aria-pressed', String(view === 'list'));
  $('#reset-camera').hidden = view === 'list'; $('#motion-toggle').hidden = view === 'list';
  $('#space-hint').textContent = view === 'space' ? '↔ 드래그해서 둘러보기 · 패널을 눌러 선택' : '프로젝트를 선택해 자세히 보기';
  scene?.setActive(view === 'space' && !document.hidden);
}
$('#space-view').addEventListener('click', () => setView('space'));
$('#list-view').addEventListener('click', () => setView('list'));
$('#reset-camera').addEventListener('click', () => scene?.reset());
function setMotion(reduce) { motion = reduce; $('#motion-toggle').setAttribute('aria-pressed', String(reduce)); scene?.setReducedMotion(reduce); }
$('#motion-toggle').addEventListener('click', () => setMotion(!motion));
motionQuery.addEventListener('change', (event) => setMotion(event.matches));
$('#space').addEventListener('keydown', (event) => {
  if (event.target !== $('#space')) return;
  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); moveSelection(event.key === 'ArrowRight' ? 1 : -1); }
  if (event.key === 'Home') { event.preventDefault(); scene?.reset(); }
});
document.addEventListener('visibilitychange', () => scene?.setActive(!document.hidden && view === 'space'));
const dialog = $('#about-dialog');
$('#about-copy').textContent = profile.introduction;
$('#about-open').addEventListener('click', () => dialog.showModal());
$('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => { if (event.target === dialog) {
  const rect = dialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
} });
dialog.addEventListener('close', () => $('#about-open').focus());
function applyHash() {
  if (location.hash.startsWith('#project=')) { try {
    const id = decodeURIComponent(location.hash.slice(9));
    const target = projects.find((p) => p.id === id);
    if (target) {
      category = '전체'; query = ''; $('#search').value = '';
      filters.querySelectorAll('button').forEach((el) => el.setAttribute('aria-pressed', String(el.textContent === category)));
      renderIndex(); changeSelection(id, false);
    }
  } catch { /* Leave unknown hashes as normal anchors. */ } }
}
window.addEventListener('hashchange', applyHash);
renderIndex(); changeSelection(selected, false); applyHash(); setMotion(motion);
registerPortfolioTools(projects, (id) => {
  category = '전체'; query = ''; $('#search').value = '';
  filters.querySelectorAll('button').forEach((el) => el.setAttribute('aria-pressed', String(el.textContent === category)));
  renderIndex(); changeSelection(id);
});
function fallback() {
  setView('list'); $('#space-view').disabled = true;
  $('#space-hint').textContent = '이 기기에서는 목록으로 작업물을 둘러볼 수 있습니다.';
}
import('./scene.js').then(({ createGallery }) => {
  scene = createGallery($('#scene'), projects, changeSelection, fallback);
  scene.select(selected); scene.filter(visibleProjects().map((p) => p.id));
  scene.setReducedMotion(motion); scene.setActive(view === 'space' && !document.hidden);
  $('#scene-status').hidden = true;
}).catch(fallback);
