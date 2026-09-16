import { readPreferences } from './preferences.js';
export function detailHref(project) { return './project.html?id=' + encodeURIComponent(project.id); }
export function projectHref(project) { return readPreferences().links[project.id] || project.liveUrl || detailHref(project); }
export function projectAction(project) { return readPreferences().links[project.id] ? '프로젝트 열기' : project.category === '인터랙티브' && project.liveUrl ? '작품 체험하기' : project.liveUrl ? '서비스 열기' : '프로젝트 들어가기'; }
export const sessionKey = 'jooho-village-navigation-v2';
export function readVisit(projects) {
  try {
    const value = JSON.parse(sessionStorage.getItem(sessionKey));
    if (!value || !projects.some(p => p.id === value.selected)) return null;
    return { selected: value.selected, category: ['전체', ...projects.map(p => p.category)].includes(value.category) ? value.category : '전체', query: typeof value.query === 'string' ? value.query.slice(0,200) : '', view: value.view === 'list' ? 'list' : 'space', scrollY: Number.isFinite(value.scrollY) ? Math.max(0,value.scrollY) : 0 };
  } catch { return null; }
}
