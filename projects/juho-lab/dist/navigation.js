export function detailHref(project) { return './project.html?id=' + encodeURIComponent(project.id); }
export function projectHref(project) { return project.liveUrl || detailHref(project); }
export function projectAction(project) { return project.id === 'dawn-store' ? '작품 체험하기' : project.liveUrl ? '서비스 열기' : '프로젝트 들어가기'; }
export const sessionKey = 'juho-atelier-navigation-v1';
export function readVisit(projects) {
  try {
    const value = JSON.parse(sessionStorage.getItem(sessionKey));
    if (!value || !projects.some(p => p.id === value.selected)) return null;
    return { selected: value.selected, category: ['전체', ...projects.map(p => p.category)].includes(value.category) ? value.category : '전체', query: typeof value.query === 'string' ? value.query.slice(0,200) : '', view: value.view === 'list' ? 'list' : 'space', scrollY: Number.isFinite(value.scrollY) ? Math.max(0,value.scrollY) : 0 };
  } catch { return null; }
}
