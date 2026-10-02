export default {
  "work": "hanbok-hero",
  "version": 1,
  "initialScene": "hero",
  "breakpoints": [
    { "id": "wide", "label": "와이드", "media": "(min-width:1600px)" },
    { "id": "tablet", "label": "태블릿", "media": "(max-width:1000px)" },
    { "id": "mobile", "label": "모바일", "media": "(max-width:650px)" }
  ],
  "previewScreens": [
    { "id": "base", "label": "데스크톱", "width": 1440, "matches": [] },
    { "id": "wide", "label": "와이드", "width": 1920, "media": "(min-width:1600px)", "matches": ["wide"] },
    { "id": "tablet", "label": "태블릿", "width": 768, "media": "(max-width:1000px)", "matches": ["tablet"] },
    { "id": "mobile", "label": "모바일", "width": 390, "media": "(max-width:650px)", "matches": ["tablet", "mobile"] }
  ],
  "scenes": { "hero": { "label": "첫 화면", "set": {} } },
  "layers": [
    { "id": "global", "label": "전역 색·글꼴", "group": "전역", "el": ":root", "params": {
      "visible": { "label": "보이기", "type": "boolean", "default": true, "on": "visible", "off": "hidden" },
      "opacity": { "label": "불투명도", "type": "number", "default": 1, "min": 0, "max": 1, "step": 0.01, "unit": "" },
      "ink": { "label": "기본 글자 색", "type": "color", "default": "#2b2420", "css": "--ink" },
      "muted": { "label": "보조 글자 색", "type": "color", "default": "#7a6f66", "css": "--muted" },
      "fontScale": { "label": "글꼴 크기 배율", "type": "number", "default": 1, "min": 0.6, "max": 1.6, "step": 0.01, "unit": "" }
    } },
    { "id": "paper", "label": "배경", "group": "배경", "el": ".paper", "params": {
      "visible": { "label": "보이기", "type": "boolean", "default": true, "on": "visible", "off": "hidden" },
      "opacity": { "label": "불투명도", "type": "number", "default": 1, "min": 0, "max": 1, "step": 0.01, "unit": "" },
      "color": { "label": "배경색", "type": "color", "default": "#f3ede4" },
      "image": { "label": "배경 이미지", "type": "image", "default": "./assets/blank.png", "attr": ["img.paper-image", "src"] },
      "vignette": { "label": "비네트 세기", "type": "number", "default": 0.35, "min": 0, "max": 1, "step": 0.01, "unit": "" }
    } },
    { "id": "character", "label": "반응 캐릭터", "group": "무대", "el": ".character", "params": {
      "visible": { "label": "보이기", "type": "boolean", "default": true, "on": "visible", "off": "hidden" },
      "opacity": { "label": "불투명도", "type": "number", "default": 1, "min": 0, "max": 1, "step": 0.01, "unit": "" },
      "still": { "label": "정면 그림", "type": "image", "default": "./assets/hanbok-still.png", "attr": ["img.character-still", "src"] },
      "sheet": { "label": "방향 시트", "type": "image", "default": "./assets/hanbok-sheet.png", "attr": ["img.character-sheet", "src"] },
      "cols": { "label": "시트 가로 칸 수", "type": "number", "default": 3, "min": 1, "max": 5, "step": 1, "unit": "" },
      "rows": { "label": "시트 세로 칸 수", "type": "number", "default": 3, "min": 1, "max": 5, "step": 1, "unit": "" },
      "x": { "label": "가로 위치", "type": "number", "default": 62, "min": -50, "max": 150, "step": 0.1, "unit": "%", "at": { "mobile": 50 } },
      "y": { "label": "세로 위치", "type": "number", "default": 56, "min": -50, "max": 150, "step": 0.1, "unit": "%", "at": { "mobile": 46 } },
      "size": { "label": "크기", "type": "number", "default": 46, "min": 10, "max": 120, "step": 0.1, "unit": "vw", "at": { "wide": 40, "tablet": 60, "mobile": 92 } },
      "anchorY": { "label": "시선 기준점 높이", "type": "number", "default": 28, "min": 0, "max": 100, "step": 0.1, "unit": "%" },
      "range": { "label": "반응 범위", "type": "number", "default": 420, "min": 40, "max": 1200, "step": 1, "unit": "px" },
      "follow": { "label": "따라가는 지연", "type": "number", "default": 60, "min": 0, "max": 1000, "step": 10, "unit": "ms" },
      "fade": { "label": "크로스페이드", "type": "number", "default": 140, "min": 0, "max": 1000, "step": 10, "unit": "ms" },
      "returnDelay": { "label": "되돌아오는 시간", "type": "number", "default": 900, "min": 0, "max": 10000, "step": 50, "unit": "ms" },
      "react": { "label": "포인터 반응", "type": "boolean", "default": true, "on": "visible", "off": "hidden" }
    } },
    { "id": "title", "label": "이름·소개", "group": "글", "el": ".title", "params": {
      "visible": { "label": "보이기", "type": "boolean", "default": true, "on": "visible", "off": "hidden" },
      "opacity": { "label": "불투명도", "type": "number", "default": 1, "min": 0, "max": 1, "step": 0.01, "unit": "" },
      "name": { "label": "이름", "type": "text", "default": "이주호", "maxLength": 60, "text": "[data-layer-text=\"title/name\"]" },
      "tagline": { "label": "한 줄 소개", "type": "text", "default": "인터랙티브를 만드는 사람", "maxLength": 200, "text": "[data-layer-text=\"title/tagline\"]" },
      "color": { "label": "이름 색", "type": "color", "default": "#2b2420" },
      "size": { "label": "이름 크기", "type": "number", "default": 4.2, "min": 1, "max": 10, "step": 0.1, "unit": "rem", "at": { "mobile": 2.6 } },
      "x": { "label": "가로 위치", "type": "number", "default": 6, "min": -50, "max": 150, "step": 0.1, "unit": "%" },
      "y": { "label": "세로 위치", "type": "number", "default": 64, "min": -50, "max": 150, "step": 0.1, "unit": "%", "at": { "mobile": 72 } }
    } },
    { "id": "nav", "label": "메뉴", "group": "글", "el": ".nav", "params": {
      "visible": { "label": "보이기", "type": "boolean", "default": true, "on": "visible", "off": "hidden" },
      "opacity": { "label": "불투명도", "type": "number", "default": 1, "min": 0, "max": 1, "step": 0.01, "unit": "" },
      "item1": { "label": "메뉴 1", "type": "text", "default": "About", "maxLength": 30, "text": "[data-layer-text=\"nav/item1\"]" },
      "item2": { "label": "메뉴 2", "type": "text", "default": "Work", "maxLength": 30, "text": "[data-layer-text=\"nav/item2\"]" },
      "item3": { "label": "메뉴 3", "type": "text", "default": "Contact", "maxLength": 30, "text": "[data-layer-text=\"nav/item3\"]" },
      "color": { "label": "글자 색", "type": "color", "default": "#2b2420" },
      "size": { "label": "글자 크기", "type": "number", "default": 1, "min": 0.6, "max": 3, "step": 0.05, "unit": "rem" },
      "x": { "label": "가로 위치", "type": "number", "default": 6, "min": -50, "max": 150, "step": 0.1, "unit": "%" },
      "y": { "label": "세로 위치", "type": "number", "default": 5, "min": -50, "max": 150, "step": 0.1, "unit": "%" }
    } },
    { "id": "hint", "label": "안내 문구", "group": "글", "el": ".hint", "params": {
      "visible": { "label": "보이기", "type": "boolean", "default": true, "on": "visible", "off": "hidden" },
      "opacity": { "label": "불투명도", "type": "number", "default": 1, "min": 0, "max": 1, "step": 0.01, "unit": "" },
      "pointerText": { "label": "포인터 안내", "type": "text", "default": "마우스를 움직여 보세요", "maxLength": 80, "text": "[data-layer-text=\"hint/pointerText\"]" },
      "touchText": { "label": "터치 안내", "type": "text", "default": "화면을 눌러 보세요", "maxLength": 80, "text": "[data-layer-text=\"hint/touchText\"]" },
      "color": { "label": "글자 색", "type": "color", "default": "#7a6f66" },
      "size": { "label": "글자 크기", "type": "number", "default": 0.9, "min": 0.6, "max": 2, "step": 0.05, "unit": "rem" },
      "x": { "label": "오른쪽 끝 위치", "type": "number", "default": 94, "min": -50, "max": 150, "step": 0.1, "unit": "%" },
      "y": { "label": "세로 위치", "type": "number", "default": 90, "min": -50, "max": 150, "step": 0.1, "unit": "%" },
      "hideAfter": { "label": "자동으로 사라지는 시간", "type": "number", "default": 6000, "min": 0, "max": 30000, "step": 100, "unit": "ms" }
    } }
  ],
  "fixed": [
    { "reason": "레이아웃(absolute 무대, 정사각 캐릭터 상자, 두 겹 프레임 overflow)과 시트 칸 계산식(cols·rows에서 유도)은 구조다." },
    { "reason": "보이기 끔은 호스트가 data-layer-hidden 속성으로 표시하고 CSS가 display:none으로 받는다. 포커스 링 색·터치 타깃 크기는 접근성 대비를 위해 고정한다." },
    { "reason": "입력 방식(hover) 미디어 규칙으로 포인터/터치 안내를 고르고, prefers-reduced-motion에서 시트 프레임을 숨기는 것은 기능 구조다." }
  ]
};
