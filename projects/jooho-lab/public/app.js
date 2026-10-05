import {loadContent,applyContent,getContent} from './content.js';
import {initEditor} from './editor.js';
import { initSettings, readPreferences, effectiveMotion } from './preferences.js';
import { projectHref, detailHref, projectAction, readVisit, sessionKey } from './navigation.js';
import { projects, profile } from './projects.js';
import { registerPortfolioTools } from './webmcp.js';
import {layerHost, initLayerSettings} from './spatial-layers.js';

await loadContent();
const $ = (selector) => document.querySelector(selector);
const village = document.body.dataset.portfolio === 'village';
const visitKey = village ? 'jooho-lab-village-visit-v1' : sessionKey;
const list = $('#project-list');
const grid = $('#project-grid');
const detail = $('#project-detail');
const filters = $('#filters');
const arrivalHash = location.hash;
// 전시관은 모든 작품을 기존 칸에 페이지로 전시한다. 동네 자체는 동네 건물이 아니다.
const wallProjects = village ? projects.filter(p => p.id !== 'village') : projects;
const onWall = (id) => wallProjects.some((p) => p.id === id);
const visit = readVisit(projects, visitKey);
let selected = visit?.selected || (village ? 'sasu' : 'dawn-store');
let category = visit?.category || '전체';
let query = visit?.query || '';
$('#search').value = query;
let scene;
let sceneFailed = false;
let view = 'space';
let sceneVisible = true;
let movementControl=false,wheelTotal=0,wheelTime=0,wheelDirection=0,wheelGestureUsed=false;
function movementHint(){
  $('#space-hint').textContent=view==='list'?'작품을 누르면 해당 페이지로 이동합니다.':village?'좌우로 관람 · 건물을 눌러 입장':movementControl?'드래그해서 시점 이동 · 휠은 페이지 스크롤 · Esc로 순차 모드':'휠 위·아래로 작품을 따라 이동 · 드래그 모드에서 자유롭게 둘러보기';
}
function setMovementControl(enabled){
  movementControl=enabled;wheelTotal=0;wheelDirection=0;wheelGestureUsed=false;scene?.setDragEnabled?.(enabled);
  $('#movement-toggle').setAttribute('aria-pressed',String(enabled));
  $('#movement-toggle').textContent=enabled?'드래그 모드 켜짐':'드래그 모드';
  $('#space').dataset.control=String(enabled);movementHint();
}
$('#movement-toggle').addEventListener('click',()=>setMovementControl(!movementControl));
$('.exhibition').addEventListener('wheel',event=>{
  if(document.body.dataset.layerEditing==='true')return;
  if(village||movementControl||view!=='space'||!scene||event.ctrlKey||document.querySelector('dialog[open]')||event.target.closest('input,textarea,select,.project-detail,#gallery-pagination'))return;
  if(Math.abs(event.deltaX)>Math.abs(event.deltaY)||!event.deltaY)return;
  const direction=Math.sign(event.deltaY),now=performance.now();
  if(now-wheelTime>180||direction!==wheelDirection){wheelTotal=0;wheelGestureUsed=false;}
  wheelTime=now;
  const moving=scene.inspect().state==='travel';
  if((moving&&direction===wheelDirection)||wheelGestureUsed){event.preventDefault();return;}
  const destination=scene.inspect().destination;
  const ids=visibleProjects().map(p=>p.id);
  if(!moving&&((direction<0&&destination==='exterior')||(direction>0&&((destination==='project'&&selected===ids.at(-1))||(!ids.length&&destination==='hall')))))return;
  event.preventDefault();wheelDirection=direction;
  wheelTotal+=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?innerHeight:1);
  if(Math.abs(wheelTotal)>=50){wheelTotal=0;wheelGestureUsed=scene.step(direction);}
},{passive:false});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&movementControl){setMovementControl(false);}});
const syncSceneActivity=()=>scene?.setActive(view==='space' && !document.hidden && sceneVisible);
new IntersectionObserver(([entry])=>{sceneVisible=entry.isIntersecting;syncSceneActivity()},{threshold:0}).observe($('#space').parentElement);
let motion = effectiveMotion();
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
function changeSelection(id, updateHash = true, moveCamera = true) {
  if (!projects.some((p) => p.id === id)) return;
  selected = id;
  const project = projects.find((p) => p.id === id);
  const focusedLabel = detail.contains(document.activeElement) ? document.activeElement.getAttribute('aria-label') : null;
  detail.style.setProperty('--project-color', project.color);
  detail.replaceChildren();
  const top = element('div', 'detail-top');
  top.append(element('span', '', `WORK ${project.number} / ${String(projects.length).padStart(2, "0")}`));
  const controls = element('div', 'detail-navigation');
  for (const [label, text, direction] of [['이전 프로젝트', '←', -1], ['다음 프로젝트', '→', 1]]) {
    const button = element('button', '', text); button.type = 'button'; button.setAttribute('aria-label', label);
    button.addEventListener('click', () => moveSelection(direction)); controls.append(button);
  }
  top.append(controls);
  const title = element('h2', '', project.title); title.id = 'detail-title';
  const features = element('ul', 'detail-features');
  project.details.forEach((item) => features.append(element('li', '', item)));
  const notes = element('details', 'project-notes'); notes.append(element('summary', '', '작업 노트'), features);
  const tags = element('div', 'tags'); project.tags.forEach((tag) => tags.append(element('span', '', tag)));
  const link = element('a', 'primary-link', projectAction(project));
  link.href = projectHref(project); link.append(element('span', '', '↗'));
  detail.append(top, element('p', 'detail-tag', project.type), title, element('p', 'detail-subtitle', project.subtitle),
    element('p', 'detail-description', project.description), notes, tags, link, element('p', 'detail-note', project.note));
  if (project.liveUrl) { const more = element('a', 'detail-more', '작업 소개 보기 →'); more.href = detailHref(project); detail.append(more); }
  document.querySelectorAll('#gallery-pagination button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.id === id)));
  const selectedCard = document.querySelector(`#gallery-pagination button[data-id="${id}"]`);
  if (selectedCard) {
    const rail = $('#gallery-pagination');
    rail.scrollTo({left: selectedCard.offsetLeft - rail.offsetLeft - (rail.clientWidth - selectedCard.clientWidth) / 2, behavior: motion ? 'instant' : 'smooth'});
  }
  if (focusedLabel) Array.from(controls.children).find((button) => button.getAttribute('aria-label') === focusedLabel)?.focus();
  document.querySelectorAll('[data-project]').forEach((button) => button.setAttribute('aria-current', String(button.dataset.project === id)));
  scene?.select(id, moveCamera);
  $('#result-status').textContent = `${project.title} 선택됨. ${project.subtitle}`;
  const available = visibleProjects(); const currentIndex = available.findIndex(p => p.id === selected);
  $('#world-prev').disabled = currentIndex <= 0; $('#world-next').disabled = currentIndex >= available.length - 1;
  if (updateHash) history.replaceState(null, '', `#project=${encodeURIComponent(id)}`);
}
function moveSelection(direction) {
  const available = visibleProjects(); if (!available.length) return;
  const index = available.findIndex((p) => p.id === selected);
  changeSelection(available[Math.max(0, Math.min(available.length-1, index + direction))].id);
}
function projectButton(project, mode) {
  const button = element('a', mode === 'list' ? 'index-card' : 'grid-card');
  button.href = projectHref(project); button.dataset.project = project.id;
  button.style.setProperty('--project-color', project.color);
  button.setAttribute('aria-current', String(project.id === selected));
  button.setAttribute('aria-label', `${project.title} — ${projectAction(project)}`);
  if (mode === 'list') {
    const meta = element('span', 'index-card-meta');
    meta.append(element('span', '', project.number), element('span', '', project.category));
    const art = element('span', 'index-art');
    art.dataset.kind = project.id;
    if (project.image) { const img = element('img'); img.src = project.image; img.alt = ''; img.loading = 'lazy'; art.append(img); }
    else { art.append(element('span', 'poster-type', project.type), element('span', 'poster-mark', project.mark), element('span', 'poster-title', project.title)); }
    const heading = element('span', 'index-card-heading');
    heading.append(element('span', 'index-card-name', project.title), element('span', 'index-arrow', '→'));
    button.append(art, meta, heading, element('span', 'index-card-subtitle', project.subtitle));
  } else {
    const art = element('span', 'grid-art');
    if (project.image) { const img = element('img'); img.src = project.image; img.alt = ''; img.loading = 'lazy'; art.append(img); }
    else art.textContent = project.mark;
    const copy = element('span', 'grid-copy'); copy.append(element('strong', '', project.title), element('small', '', project.category));
    button.append(art, copy);
  }
  button.addEventListener('click', event => { if (!event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) changeSelection(project.id); });
  return button;
}
function renderIndex() {
  const available = visibleProjects();
  list.replaceChildren(...available.map((p) => projectButton(p, 'list')));
  grid.replaceChildren(...available.map((p) => projectButton(p, 'grid')));
  $('#project-count').textContent = String(available.length).padStart(2, '0');
  $('#empty-state').hidden = available.length !== 0;
  $('#result-status').textContent = `${available.length}개 프로젝트`;
  scene?.filter(available.map((p) => p.id).filter(onWall));
  $('#gallery-pagination').replaceChildren(...available.map(project => {
    const b = element('button', 'film-card'); b.type = 'button'; b.dataset.id = project.id;
    b.style.setProperty('--card-color', project.color);
    b.setAttribute('aria-label', `${project.title} 선택`);
    b.setAttribute('aria-pressed', String(project.id === selected));
    const art = element('span', 'film-card-art');
    if (project.image) { const img = element('img'); img.src = project.image; img.alt = ''; img.loading = 'lazy'; art.append(img); }
    else art.append(element('span', 'film-card-mark', project.mark));
    if (village) b.textContent = project.number;
    else b.append(art, element('span', 'film-card-name', project.title));
    b.addEventListener('click', () => changeSelection(project.id));
    return b;
  }));
  if (available.length && !available.some((p) => p.id === selected)) changeSelection(available[0].id);
  if (!available.length) {
    $('#world-prev').disabled = true; $('#world-next').disabled = true;
    detail.replaceChildren(element('p', 'detail-description', '일치하는 프로젝트가 없습니다.'), element('p', 'detail-note', '검색어를 지우거나 다른 분야를 선택해 주세요.'));
  } else if (!$('#detail-title')) changeSelection(selected, false);
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
  view = sceneFailed ? 'list' : next;
  $('#space').hidden = view !== 'space'; grid.hidden = view !== 'list';
  $('.exhibition').dataset.view = view;
  $('#spatial-controls').hidden = view !== 'space';
  $('#space-view').setAttribute('aria-pressed', String(view === 'space'));
  $('#list-view').setAttribute('aria-pressed', String(view === 'list'));
  $('#world-prev').hidden = view === 'list'; $('#world-next').hidden = view === 'list'; $('#gallery-pagination').hidden = view === 'list'; $('#reset-camera').hidden = view === 'list'; $('#motion-toggle').hidden = view === 'list';
  $('#space-hint').textContent = view === 'space' ? '작업을 선택하면 그 공간으로 안내합니다' : '작품을 누르면 해당 페이지로 이동합니다';
  syncSceneActivity();
  $('#movement-toggle').hidden=village||view!=='space';if(view!=='space')setMovementControl(false);movementHint();
}
$('#space-view').addEventListener('click', () => setView('space'));
$('#list-view').addEventListener('click', () => setView('list'));
$('#reset-camera').addEventListener('click', () => scene?.reset());
function setMotion(reduce) { motion = reduce; document.documentElement.dataset.motion = reduce ? 'reduce' : 'full'; $('#motion-toggle').setAttribute('aria-pressed', String(reduce)); scene?.setReducedMotion(reduce); }
$('#motion-toggle').addEventListener('click', () => setMotion(!motion));
motionQuery.addEventListener('change', () => { if(readPreferences().motion === 'system') setMotion(effectiveMotion()); });
$('#space').addEventListener('keydown', (event) => {
  if (document.body.dataset.layerEditing==='true'||event.target !== $('#space')) return;
  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); moveSelection(event.key === 'ArrowRight' ? 1 : -1); }
  if (event.key === 'Enter') { event.preventDefault(); if (visibleProjects().length) { if(scene && (onWall(selected) || scene.inspect().state === 'exterior')) scene.enter(selected); else openProject(selected); } }
  if (event.key === 'Home') { event.preventDefault(); scene?.reset(); }
  if (event.key === 'Escape') { event.preventDefault(); if(movementControl){setMovementControl(false);event.stopPropagation();}else scene?.back(); }
});
document.addEventListener('visibilitychange', syncSceneActivity);
const dialog = $('#about-dialog');
$('#about-copy').textContent = profile.introduction;
$('#about-open').addEventListener('click', () => dialog.showModal());
$('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => { if (event.target === dialog) {
  const rect = dialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
} });
dialog.addEventListener('close', () => $('#about-open').focus());
function applyHash(hash = location.hash) {
  if (hash.startsWith('#project=')) { try {
    const id = decodeURIComponent(hash.slice(9));
    const target = projects.find((p) => p.id === id);
    if (target) {
      category = '전체'; query = ''; $('#search').value = '';
      filters.querySelectorAll('button').forEach((el) => el.setAttribute('aria-pressed', String(el.textContent === category)));
      renderIndex(); changeSelection(id, false);
    }
  } catch { /* Leave unknown hashes as normal anchors. */ } }
}
window.addEventListener('hashchange', () => applyHash());
renderIndex(); changeSelection(selected, false); applyHash(arrivalHash); setMotion(motion);
setView(visit?.view || readPreferences().view);
if (visit) { setView(visit.view); requestAnimationFrame(() => requestAnimationFrame(() => scrollTo(0, visit.scrollY))); }
window.addEventListener('pagehide', () => { try { sessionStorage.setItem('jooho-lab-return-page-v1',village?'village.html':''); sessionStorage.setItem(visitKey, JSON.stringify({selected, category, query, view, scrollY})); } catch {} });
function openProject(id) { const project = projects.find(p => p.id === id); if (project) { changeSelection(id); location.assign(projectHref(project)); } }
registerPortfolioTools(projects, (id) => {
  category = '전체'; query = ''; $('#search').value = '';
  filters.querySelectorAll('button').forEach((el) => el.setAttribute('aria-pressed', String(el.textContent === category)));
  renderIndex(); changeSelection(id);
});
function fallback() {
  sceneFailed = true;
  scene?.setActive(false);
  setView('list'); $('#space-view').disabled = true;
  $('#space-hint').textContent = '이 기기에서는 목록으로 작업물을 둘러볼 수 있습니다.';
  $('#scene-status').hidden = true;
  $('#spatial-status').textContent = '공간을 불러오지 못했습니다. 목록에서 모든 작업을 열 수 있습니다.';
}
function spatialState({state, destination}) {
  $('.exhibition').dataset.stage = state;
  const names={exterior:'01 / THE ARRIVAL',hall:'02 / THE STUDIO',project:'03 / THE WORK',travel:'공간을 이동하고 있습니다'};
  $('#spatial-status').textContent = names[state];
  $('#spatial-enter').textContent = state === 'exterior' ? $('#spatial-enter').dataset.label || '작업실 들어가기 ↗' : '선택한 작업으로 →';
  $('#spatial-enter').hidden = state === 'project' || state === 'travel';
  $('#spatial-enter').disabled = state === 'hall' && !visibleProjects().length;
  $('#spatial-back').hidden = state === 'exterior';
  $('#spatial-back').textContent = state === 'hall' || destination === 'hall' ? '← 건물 밖으로' : '← 작업실로';
  layerHost.setScene(state === 'travel' ? destination : state);
}
$('#spatial-enter').addEventListener('click', () => scene?.enter());
$('#spatial-back').addEventListener('click', () => scene?.back());
layerHost.subscribe(()=>{if($('.exhibition').dataset.stage==='exterior')$('#spatial-enter').textContent=$('#spatial-enter').dataset.label;});
import(village ? './scene.js' : './spatial-scene.js').then(async ({ createGallery }) => {
  scene = await createGallery($('#scene'), wallProjects, changeSelection, fallback, openProject, village ? projectHref : spatialState);
  scene.select(selected, false); scene.filter(visibleProjects().map((p) => p.id).filter(onWall));
  scene.setZoom(readPreferences().zoom);scene.refreshContent?.(getContent());
  scene.setReducedMotion(motion); scene.setDragEnabled?.(movementControl); syncSceneActivity();
  if (village) layerHost.refresh();
  $('#scene-status').hidden = true;
  $('#spatial-enter').disabled = false;
  if(!village)window.dispatchEvent(new Event('spatial-scene-ready'));
}).catch(fallback);

$('#world-prev').addEventListener('click', () => moveSelection(-1));
$('#world-next').addEventListener('click', () => moveSelection(1));
initSettings();
initLayerSettings({getScene:()=>scene,showSpace:()=>{setView('space');setMovementControl(false);},showProject:id=>changeSelection(id,false,true)});
initEditor(document.querySelector('#settings-dialog'));
applyContent();
if (village) layerHost.refresh();
window.addEventListener('museum-content',()=>{renderIndex();changeSelection(selected,false,false);scene?.refreshContent?.(getContent());if(village)layerHost.refresh()});
let lastSettings = readPreferences();
window.addEventListener('portfolio-settings', event => {
  const prefs = event.detail;
  setMotion(effectiveMotion(prefs)); scene?.setZoom(prefs.zoom); if (prefs.view !== lastSettings.view) setView(prefs.view); lastSettings = prefs;
  renderIndex(); if (visibleProjects().length) changeSelection(selected, false, false);
  scene?.refreshLinks();
});

window.addEventListener('scroll',()=>document.querySelector('.site-header').classList.toggle('scrolled',scrollY>40),{passive:true});
export {layerHost};
export const inspectScene=()=>{const state=scene?.inspect();return village&&state?{...state,visibility:{sceneVisible,view,hidden:document.hidden}}:state};
