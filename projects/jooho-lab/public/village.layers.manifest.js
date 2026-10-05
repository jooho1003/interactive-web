const n=(label,value,min,max,step=.1,unit='')=>({label,type:'number',default:value,min,max,step,unit});
const color=(label,value)=>({label,type:'color',default:value});
const visibility=()=>({visible:{label:'보이기',type:'boolean',default:true,on:'visible',off:'hidden'},opacity:n('불투명도',1,0,1,.05)});
const input=(label,value,min,max,name)=>({...n(label,value,min,max),attr:['#scene','data-'+name]});
export default{
  work:'jooho-lab-village',version:1,initialScene:'walking',
  stylesheets:['/style.css','/village.css'],
  breakpoints:[{id:'mobile',label:'모바일',media:'(max-width:620px)'}],
  previewScreens:[{id:'base',label:'데스크톱',width:1440,matches:[]},{id:'mobile',label:'모바일',width:390,media:'(max-width:620px)',matches:['mobile']}],
  scenes:{walking:{label:'동네 둘러보기'},entering:{label:'작품 입장'}},
  layers:[
    {id:'stage',label:'동네 · 카메라',el:'#scene canvas',params:{...visibility(),image:{label:'동네 파노라마',type:'image',default:'./assets/project-village.webp',attr:['#scene','data-panorama']},zoom:input('화면 확대',1,.8,1.3,'zoom'),speed:input('이동 속도',1,.5,2,'speed'),damping:input('따라오는 속도',6.5,2,12,'damping'),parallax:input('포인터 반응',.18,0,.4,'parallax')}},
    {id:'intro',label:'첫 인사',el:'.intro',params:{...visibility(),x:n('가로 위치',4.2,0,40,.1,'vw'),y:{...n('세로 위치',14,8,35,1,'vh'),at:{mobile:13}},size:{...n('제목 크기',2.5,1.5,4,.1,'rem'),at:{mobile:1.85}},color:color('글자색','#264a48'),title:{label:'제목',type:'text',default:'아이디어가 사는 곳.',text:'#page-title',maxLength:100},eyebrow:{label:'짧은 소개',type:'text',default:'이주호의 작업 동네',text:'.intro .eyebrow',maxLength:80},copy:{label:'안내',type:'text',default:'대화에서 시작해, 하나의 작품이 되기까지.',text:'.intro-copy',maxLength:250}}},
    {id:'labels',label:'건물 · 산책길 이름표',el:'.scene-label',params:{...visibility(),size:n('글자 크기',.9,.7,1.3,.05,'rem'),color:color('선택 색','#365b4d'),padding:n('이름표 여백',14,8,24,1,'px')}},
    {id:'character',label:'동네 보행자',el:'.village-walker',params:{...visibility(),size:input('캐릭터 크기',1,.4,2,'character-size'),speed:input('걷는 속도',1,0,2,'character-speed')}},
    {id:'ambient',label:'창문 불빛',el:'.building-light',params:{...visibility(),color:color('불빛 색','#ffda96'),size:{...n('불빛 크기',90,40,140,5,'px'),at:{mobile:55}}}},
    {id:'entry',label:'입장 피드백',el:'.entry-veil',params:{...visibility(),duration:input('입장 시간',1450,700,2500,'entry-ms'),color:color('입장 배경','#f7efdc')}},
    {id:'controls',label:'번호 · 이동 · 안내',el:'.gallery-pagination,.world-arrow,.gallery-footer,.collection-scroll,.gallery-toolbar',params:{...visibility(),size:n('번호 크기',32,30,44,2,'px'),bottom:{...n('번호 아래 여백',24,12,120,2,'px'),at:{mobile:78}},footerBottom:{...n('안내 아래 여백',70,40,300,2,'px'),at:{mobile:220}},color:color('선택 색','#365b4d')}},
    {id:'shell',label:'메뉴 · 목록',el:'.site-header .brand,.site-header nav>a,#about-open,.index-section,.site-footer,#about-dialog',params:{...visibility(),paper:color('바탕색','#f8faf4'),ink:color('글자색','#264a48')}},
  ],
  fixed:[
    'The original six-building panorama is unchanged. Image ratio and plane width are structural coordinates aligned to the authored artwork; house hitboxes and extension panels are adjustable in village-houses.manifest.js.',
    'Registry and owner content editor provide work labels/images/links and shared character image, visibility, size/speed; village layer size/speed are additional multipliers.',
    'Camera trip arcs, entrance scale/lift and render DPR cap are the preserved original choreography/performance constants; camera and entry speed are adjustable.',
    'Header/toolbar/pagination responsive layout, minimum accessible hit areas, stacking order and scene state visibility are structural constraints. Settings/recovery dialogs cannot be hidden by presentation layers.',
  ],
};
