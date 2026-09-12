import { projects } from './projects.js';
import { detailHref, projectAction, projectHref } from './navigation.js';
const host = document.querySelector('#project-page');
const id = new URL(location.href).searchParams.get('id');
const project = projects.find(p => p.id === id);
function el(tag, cls, text) { const node = document.createElement(tag); if(cls) node.className=cls; if(text) node.textContent=text; return node; }
function link(text, href, cls) { const node=el('a', cls, text);node.href=href;return node; }
host.replaceChildren();
if (!project) {
  document.title='작품을 찾을 수 없습니다 — JUHO LAB';
  const empty=el('section','page-empty');
  empty.append(el('p','eyebrow','WORK NOT FOUND'),el('h1','','작품을 찾을 수 없습니다.'),el('p','','주소를 확인하거나 전시실에서 작품을 골라 주세요.'),link('전시실로 돌아가기','./','primary-link'));
  host.append(empty);
} else {
  document.title=project.title+' — JUHO LAB';
  document.querySelector('meta[name="description"]').content=project.description;
  host.style.setProperty('--project-color',project.color);
  const hero=el('section','project-hero');
  if(project.image) {const image=el('img','project-cover');image.src=project.image;image.alt=project.title+' 프로젝트 대표 이미지';hero.append(image);}
  else hero.append(el('div','project-monogram',project.mark));
  const title=el('div','project-title');
  title.append(el('p','eyebrow','WORK '+project.number+' / '+project.type),el('h1','',project.title),el('p','',project.subtitle));hero.append(title);
  const body=el('section','project-body');
  const description=el('div','project-story');
  description.append(el('p','eyebrow','ABOUT THIS WORK'),el('h2','','어떤 작업인가요?'),el('p','project-lead',project.description),el('h2','','작업 노트'));
  const features=el('ul','project-features');project.details.forEach(item=>features.append(el('li','',item)));description.append(features,el('p','project-context',project.note));
  const info=el('aside','project-info');info.append(el('p','eyebrow',project.category));
  const tags=el('div','tags');project.tags.forEach(tag=>tags.append(el('span','',tag)));info.append(tags);
  const hasDestination=projectHref(project)!==detailHref(project);
  if(hasDestination) info.append(link(projectAction(project)+' ↗',projectHref(project),'primary-link'));
  else info.append(el('p','availability','현재는 작업 소개와 소스 코드를 볼 수 있습니다.'));
  const code=link('소스 코드 보기 ↗',project.url,hasDestination?'code-link':'primary-link');code.target='_blank';code.rel='noopener noreferrer';info.append(code);
  info.append(link('← 전시실로 돌아가기','./','detail-more'));
  body.append(description,info);
  const next=projects[(projects.indexOf(project)+1)%projects.length];
  const nextLink=link('',detailHref(next),'next-work');nextLink.append(el('span','','다음 작업'),el('strong','',next.title),el('span','','→'));
  host.append(hero,body,nextLink);
}
