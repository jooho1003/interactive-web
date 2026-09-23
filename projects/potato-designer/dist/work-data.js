// Study content is separate from UI behavior so the next portfolio can reuse it.
export const works = [
  {
    id: 'brand', title: 'A little bold', category: '브랜드 디자인', discipline: 'Brand identity',
    summary: '작은 기호 하나에서 시작하는, 단단하고 유쾌한 브랜드.',
    challenge: '평범한 이름도 기억에 남는 인상을 가질 수 있을까? POTATO의 작은 기호와 강한 타이포그래피를 하나의 언어로 묶는 스터디입니다.',
    approach: 'p. 심벌, 절제한 바탕색, 붉은 포인트를 반복합니다. 포스터와 웹에서도 같은 대비와 여백 규칙을 사용합니다.',
    deliverables: ['심벌과 워드마크', '컬러·타이포그래피 규칙', '키 비주얼 포스터'],
    tags: ['브랜드', '로고', '타이포그래피', 'brand', 'identity'],
    poster: '<span>p.</span><strong>ORDINARY?<br>NEVER.</strong><small>POTATO® BRAND STUDY / 01</small>'
  },
  {
    id: 'digital', title: 'In motion', category: '디지털 경험', discipline: 'Digital experience',
    summary: '움직임이 탐색을 돕고, 선택이 다음 행동으로 이어지는 화면.',
    challenge: '보기 좋은 첫 장면에서 멈추지 않고 작업 탐색과 메모 작성까지 이어지는 포트폴리오를 설계합니다.',
    approach: '장식적인 모션과 실제 선택 상태를 분리합니다. 검색, 상세 보기, 관심 저장, 메모 연결을 하나의 짧은 흐름으로 만듭니다.',
    deliverables: ['반응형 화면', '검색·필터와 상세 패널', '키보드·동작 줄이기 대응'],
    tags: ['웹', '인터랙션', '디지털', '모션', 'digital', 'web'],
    poster: '<span class="digital-orbit" aria-hidden="true"></span><strong>MAKE<br>IT MOVE<span>®</span></strong><small>DIGITAL PLAYGROUND / 02</small>'
  },
  {
    id: 'character', title: 'Meet Potato', category: '캐릭터 디자인', discipline: 'Character design',
    summary: '선글라스와 줄무늬 셔츠, 화면 밖으로 튀어나오는 개성.',
    challenge: '브랜드의 성격을 긴 설명 없이 보여주는 캐릭터를 만듭니다. 실제 고객 프로젝트가 아닌 이 페이지의 시각 실험입니다.',
    approach: '새로 생성한 투명 이미지를 원근·이동·회전 레이어로 나눠 표현합니다. 관절이 움직이는 3D 모델이 아닌 2.5D 방식입니다.',
    deliverables: ['투명 캐릭터 이미지', '포인터 반응과 등장 모션', '모바일·정지 상태의 구성'],
    tags: ['캐릭터', '일러스트', '2.5d', 'character', 'potato'],
    poster: '<img src="./assets/character.png" width="1254" height="1254" alt="검정 선글라스를 쓴 캐릭터" loading="lazy"><small>A CHARACTER OF ITS OWN / 03</small>'
  }
];

export const findWork = id => works.find(work => work.id === id);
export const validFavorites = value => Array.isArray(value) ? [...new Set(value.filter(id => findWork(id)))] : [];
export function filterWorks({ query = '', category = 'all', savedOnly = false, favorites = [] } = {}) {
  const words = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return works.filter(work => {
    const text = [work.title, work.category, work.summary, ...work.tags].join(' ').toLocaleLowerCase();
    return (category === 'all' || category === work.id) && (!savedOnly || favorites.includes(work.id)) && words.every(word => text.includes(word));
  });
}
