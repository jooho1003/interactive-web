const n=(label,value,min,max,step=.1,unit='')=>({label,type:'number',default:value,min,max,step,unit});
const color=(label,value)=>({label,type:'color',default:value});
const visibility=()=>({visible:{label:'보이기',type:'boolean',default:true,on:'visible',off:'hidden'},opacity:n('불투명도',1,0,1,.05)});
export default{
  work:'jooho-lab',version:1,initialScene:'exterior',
  breakpoints:[{id:'mobile',label:'모바일',media:'(max-width:1000px)'}],
  previewScreens:[{id:'base',label:'데스크톱',width:1440,matches:[]},{id:'mobile',label:'모바일',width:390,media:'(max-width:1000px)',matches:['mobile']}],
  scenes:{exterior:{label:'외관'},hall:{label:'작업실'},project:{label:'작품'}},
  layers:[
    {id:'stage',label:'3D 공간 · 카메라',el:'#scene',params:{...visibility(),fov:{...n('화각',48,35,70,1),attr:['#scene','data-fov']},speed:{...n('이동 속도 배율',1,.5,2,.1),attr:['#scene','data-speed']},approachSeconds:{...n('작품 접근 시간',4.2,2.5,7,.1),attr:['#scene','data-approach-seconds']},slideSeconds:{...n('작품 간 이동 시간',1.8,1,3,.1),attr:['#scene','data-slide-seconds']},parallax:{...n('포인터 반응',.16,0,.4,.02),attr:['#scene','data-parallax']},dragStrength:{...n('드래그 반응',1.2,.4,2,.1),attr:['#scene','data-drag-strength']},dragLimit:{...n('시점 회전 범위',.32,.1,.4,.02),attr:['#scene','data-drag-limit']},damping:{...n('카메라 따라오는 속도',9,4,16,1),attr:['#scene','data-damping']},exposure:{...n('노출 배율',1.15,.5,2,.05),attr:['#scene','data-exposure']}}},
    {id:'landscape',label:'먼 풍경',el:'#lab-landscape',params:{...visibility(),image:{label:'배경 이미지',type:'image',default:'./assets/lab-landscape.jpg',attr:['#lab-landscape','src']},height:n('배경 높이',77,40,100,1,'vh'),color:color('하늘색','#9cabb4')}},
    {id:'intro',label:'첫 인사',el:'.intro',params:{...visibility(),x:n('가로 위치',5,0,40,1,'vw'),y:{...n('세로 위치',36,12,65,1,'vh'),at:{mobile:24}},size:{...n('제목 크기',4.4,1.5,7,.1,'rem'),at:{mobile:2.7}},color:color('글자색','#f5f1e7')}},
    {id:'detail',label:'작품 설명',el:'.project-detail',params:{...visibility(),x:n('가로 위치',5,0,40,1,'vw'),y:{...n('세로 위치',31,15,60,1,'%'),at:{mobile:56}},width:n('설명 너비',340,240,550,10,'px'),color:color('글자색','#f5f1e7')}},
    {id:'rail',label:'작품 썸네일',el:'#gallery-pagination',params:{...visibility(),size:{...n('썸네일 너비',100,64,160,4,'px'),at:{mobile:80}},gap:n('간격',12,4,28,1,'px'),bottom:{...n('아래 여백',30,12,100,2,'px'),at:{mobile:22}}}},
    {id:'controls',label:'공간 이동 · 안내',el:'#spatial-controls,.gallery-footer,.world-arrow',params:{...visibility(),color:color('버튼색','#f5f1e7'),bottom:{...n('아래 여백',175,125,280,5,'px'),at:{mobile:205}},enterLabel:{label:'외관 입장 문구',type:'text',default:'작업실 들어가기 ↗',maxLength:50,attr:['#spatial-enter','data-label']}}},
    {id:'shell',label:'메뉴 · 목록',el:'.site-header .brand,.site-header nav>a,#about-open,.index-section,.site-footer,#about-dialog',params:{...visibility(),paper:color('목록 배경','#ece9e1'),ink:color('목록 글자색','#28352f')}},
  ],
  fixed:[
    'Physical wall, doorway, artwork and furniture dimensions are Blender meters; changing them requires regenerating GLB and validating route clearances.',
    'Manual orbit is bounded inside the physical pavilion, with a 24% artwork framing allowance. Vertical orbit uses half the horizontal limit to keep floor/ceiling clear.',
    'Camera path anchors, including a 2.4m artwork viewing aisle, are structural coordinates in spatial-route.js; shared content cameraSpeed and lighting remain authoritative multipliers.',
    'SUIT Variable is the shared display/body typeface. Artwork uses contain fitting and a protected camera frame; the movement toggle remains visible for immediate release.',
    'Minimum control hit areas, canvas inset, responsive layout constraints, z-index, borders and navigation state visibility are structural/accessibility rules.',
    'Registry text/images, owner content editor and existing preference controls retain their existing sources; no server migration.',
    'Settings opener and editing dialogs are always visible, independent of presentation layers, so users can recover from hidden/transparent layers.',
    'Render light positions/colors, shadow resolution, DPR limits and material definitions are the fixed initial art direction in Blender/runtime; exposure remains adjustable.',
  ],
};
