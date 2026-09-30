export default {
  "work": "potato-designer",
  "version": 1,
  "initialScene": "brand",
  "breakpoints": [
    {
      "id": "wide",
      "label": "와이드",
      "media": "(min-width:1600px)"
    },
    {
      "id": "tablet",
      "label": "태블릿",
      "media": "(max-width:1000px)"
    },
    {
      "id": "mobile",
      "label": "모바일",
      "media": "(max-width:650px)"
    }
  ],
  "previewScreens": [
    {
      "id": "base",
      "label": "데스크톱",
      "width": 1440,
      "matches": []
    },
    {
      "id": "wide",
      "label": "와이드",
      "width": 1920,
      "media": "(min-width:1600px)",
      "matches": [
        "wide"
      ]
    },
    {
      "id": "tablet",
      "label": "태블릿",
      "width": 768,
      "media": "(max-width:1000px)",
      "matches": [
        "tablet"
      ]
    },
    {
      "id": "mobile",
      "label": "모바일",
      "width": 390,
      "media": "(max-width:650px)",
      "matches": [
        "tablet",
        "mobile"
      ]
    }
  ],
  "scenes": {
    "brand": {
      "label": "Brand Design",
      "set": {
        "paper": {
          "color": "#e9ebe8"
        },
        "global": {
          "accent": "#cb443c"
        },
        "character": {
          "tilt": -5,
          "zoom": 1
        },
        "word": {
          "text": "PLAY"
        }
      }
    },
    "digital": {
      "label": "Digital Experience",
      "set": {
        "paper": {
          "color": "#e0e6e9"
        },
        "global": {
          "accent": "#4365b4"
        },
        "character": {
          "tilt": 3,
          "zoom": 0.94
        },
        "word": {
          "text": "MOVE"
        }
      }
    },
    "character": {
      "label": "Character Design",
      "set": {
        "paper": {
          "color": "#e8e9db"
        },
        "global": {
          "accent": "#7b833c"
        },
        "character": {
          "tilt": -10,
          "zoom": 1.05
        },
        "word": {
          "text": "HEY!"
        }
      }
    }
  },
  "layers": [
    {
      "id": "global",
      "label": "전역 색·글꼴",
      "group": "전역",
      "el": ":root",
      "params": {
        "accent": {
          "label": "포인트 색",
          "type": "color",
          "default": "#cb443c",
          "css": "--accent"
        },
        "ink": {
          "label": "기본 글자 색",
          "type": "color",
          "default": "#202722",
          "css": "--ink"
        },
        "muted": {
          "label": "보조 글자 색",
          "type": "color",
          "default": "#777e77",
          "css": "--muted"
        },
        "line": {
          "label": "구분선 색",
          "type": "color",
          "default": "#c8cdc6",
          "css": "--line"
        },
        "style.26": {
          "label": "margin-bottom · #back-to-works",
          "type": "number",
          "default": 28,
          "advanced": true,
          "selector": "#back-to-works",
          "property": "margin-bottom",
          "min": -600,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.50": {
          "label": "font-family · :root",
          "type": "select",
          "default": "'DM Sans','Arial',sans-serif",
          "advanced": true,
          "selector": ":root",
          "property": "font-family",
          "options": [
            {
              "value": "'DM Sans','Arial',sans-serif",
              "label": "기본 디자인"
            },
            {
              "value": "system-ui,sans-serif",
              "label": "대안 A"
            },
            {
              "value": "Georgia,serif",
              "label": "대안 B"
            }
          ]
        },
        "style.51": {
          "label": "margin · body",
          "type": "number",
          "default": 0,
          "advanced": true,
          "selector": "body",
          "property": "margin",
          "min": -600,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.53": {
          "label": "color · ::selection",
          "type": "color",
          "default": "#ffffff",
          "advanced": true,
          "selector": "::selection",
          "property": "color"
        },
        "style.294": {
          "label": "border · .digital-orbit",
          "type": "select",
          "default": "1px solid #ddec7b",
          "advanced": true,
          "selector": ".digital-orbit",
          "property": "border",
          "options": [
            {
              "value": "1px solid #ddec7b",
              "label": "기본 디자인"
            },
            {
              "value": "2px solid #202722",
              "label": "대안 A"
            },
            {
              "value": "1px dashed #777e77",
              "label": "대안 B"
            }
          ]
        },
        "style.295": {
          "label": "width · .digital-orbit",
          "type": "number",
          "default": 110,
          "advanced": true,
          "selector": ".digital-orbit",
          "property": "width",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "%"
        },
        "style.296": {
          "label": "height · .digital-orbit",
          "type": "number",
          "default": 55,
          "advanced": true,
          "selector": ".digital-orbit",
          "property": "height",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "%"
        },
        "style.297": {
          "label": "border-radius · .digital-orbit",
          "type": "number",
          "default": 50,
          "advanced": true,
          "selector": ".digital-orbit",
          "property": "border-radius",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "%"
        },
        "style.298": {
          "label": "top · .digital-orbit",
          "type": "number",
          "default": 7,
          "advanced": true,
          "selector": ".digital-orbit",
          "property": "top",
          "min": -600,
          "max": 2400,
          "step": 0.1,
          "unit": "%"
        },
        "style.299": {
          "label": "left · .digital-orbit",
          "type": "number",
          "default": -7,
          "advanced": true,
          "selector": ".digital-orbit",
          "property": "left",
          "min": -600,
          "max": 2400,
          "step": 0.1,
          "unit": "%"
        },
        "style.300": {
          "label": "transform · .digital-orbit",
          "type": "select",
          "default": "rotate(-32deg)",
          "advanced": true,
          "selector": ".digital-orbit",
          "property": "transform",
          "options": [
            {
              "value": "rotate(-32deg)",
              "label": "기본 디자인"
            },
            {
              "value": "translate(0,0) scale(1) rotate(0deg)",
              "label": "대안 A"
            },
            {
              "value": "translateY(-12px) scale(1.05)",
              "label": "대안 B"
            }
          ]
        },
        "style.301": {
          "label": "inset · .digital-orbit::after",
          "type": "number",
          "default": 14,
          "advanced": true,
          "selector": ".digital-orbit::after",
          "property": "inset",
          "min": -600,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.302": {
          "label": "border · .digital-orbit::after",
          "type": "select",
          "default": "1px solid #ddec7b",
          "advanced": true,
          "selector": ".digital-orbit::after",
          "property": "border",
          "options": [
            {
              "value": "1px solid #ddec7b",
              "label": "기본 디자인"
            },
            {
              "value": "2px solid #202722",
              "label": "대안 A"
            },
            {
              "value": "1px dashed #777e77",
              "label": "대안 B"
            }
          ]
        },
        "style.303": {
          "label": "border-radius · .digital-orbit::after",
          "type": "number",
          "default": 50,
          "advanced": true,
          "selector": ".digital-orbit::after",
          "property": "border-radius",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "%"
        },
        "visible": {
          "label": "표시 여부",
          "type": "boolean",
          "default": true,
          "on": "visible",
          "off": "hidden"
        },
        "opacity": {
          "label": "불투명도",
          "type": "number",
          "default": 1,
          "min": 0,
          "max": 1,
          "unit": "",
          "step": 0.01
        }
      }
    },
    {
      "id": "paper",
      "label": "배경 종이",
      "group": "배경",
      "el": ".site-shell",
      "params": {
        "visible": {
          "label": "보이기",
          "type": "boolean",
          "default": true,
          "on": "visible",
          "off": "hidden"
        },
        "offset.x": {
          "label": "좌우 이동",
          "type": "number",
          "default": 0,
          "min": -600,
          "max": 600,
          "step": 0.1,
          "unit": "px"
        },
        "offset.y": {
          "label": "상하 이동",
          "type": "number",
          "default": 0,
          "min": -600,
          "max": 600,
          "step": 0.1,
          "unit": "px"
        },
        "scale": {
          "label": "크기 배율",
          "type": "number",
          "default": 1,
          "min": 0.2,
          "max": 3,
          "step": 0.01,
          "unit": ""
        },
        "rotation": {
          "label": "회전",
          "type": "number",
          "default": 0,
          "min": -180,
          "max": 180,
          "step": 1,
          "unit": "deg"
        },
        "color": {
          "label": "배경색",
          "type": "color",
          "default": "#e9ebe8",
          "css": "--paper"
        },
        "style.54": {
          "label": "max-width · .site-shell",
          "type": "number",
          "default": 2200,
          "advanced": true,
          "selector": ".site-shell",
          "property": "max-width",
          "min": 0,
          "max": 6600,
          "step": 0.1,
          "unit": "px"
        },
        "style.55": {
          "label": "transition · .site-shell",
          "type": "select",
          "default": "background .7s",
          "advanced": true,
          "selector": ".site-shell",
          "property": "transition",
          "options": [
            {
              "value": "background .7s",
              "label": "기본 디자인"
            },
            {
              "value": "none",
              "label": "대안 A"
            },
            {
              "value": "all .4s ease",
              "label": "대안 B"
            }
          ]
        },
        "opacity": {
          "label": "불투명도",
          "type": "number",
          "default": 1,
          "min": 0,
          "max": 1,
          "step": 0.01,
          "unit": ""
        }
      }
    },
    {
      "id": "word",
      "label": "배경 큰 글자",
      "group": "배경",
      "el": ".stage-word",
      "params": {
        "visible": {
          "label": "보이기",
          "type": "boolean",
          "default": true,
          "on": "visible",
          "off": "hidden"
        },
        "offset.x": {
          "label": "좌우 이동",
          "type": "number",
          "default": 0,
          "min": -600,
          "max": 600,
          "step": 0.1,
          "unit": "px"
        },
        "offset.y": {
          "label": "상하 이동",
          "type": "number",
          "default": 0,
          "min": -600,
          "max": 600,
          "step": 0.1,
          "unit": "px"
        },
        "scale": {
          "label": "크기 배율",
          "type": "number",
          "default": 1,
          "min": 0.2,
          "max": 3,
          "step": 0.01,
          "unit": ""
        },
        "rotation": {
          "label": "회전",
          "type": "number",
          "default": 0,
          "min": -180,
          "max": 180,
          "step": 1,
          "unit": "deg"
        },
        "text": {
          "label": "배경 단어",
          "type": "text",
          "default": "PLAY",
          "text": ".stage-word"
        },
        "style.131": {
          "label": "font-family · .stage-word",
          "type": "select",
          "default": "'Barlow Condensed',Impact,sans-serif",
          "advanced": true,
          "selector": ".stage-word",
          "property": "font-family",
          "options": [
            {
              "value": "'Barlow Condensed',Impact,sans-serif",
              "label": "기본 디자인"
            },
            {
              "value": "system-ui,sans-serif",
              "label": "대안 A"
            },
            {
              "value": "Georgia,serif",
              "label": "대안 B"
            }
          ]
        },
        "style.132": {
          "label": "font-size · .stage-word",
          "type": "select",
          "default": "clamp(200px,34vw,620px)",
          "advanced": true,
          "selector": ".stage-word",
          "property": "font-size",
          "options": [
            {
              "value": "clamp(200px,34vw,620px)",
              "label": "기본 디자인"
            },
            {
              "value": "clamp(160px,27vw,496px)",
              "label": "대안 A"
            },
            {
              "value": "clamp(240px,41vw,744px)",
              "label": "대안 B"
            }
          ]
        },
        "style.133": {
          "label": "font-weight · .stage-word",
          "type": "number",
          "default": 600,
          "advanced": true,
          "selector": ".stage-word",
          "property": "font-weight",
          "min": 100,
          "max": 900,
          "step": 100,
          "unit": ""
        },
        "style.134": {
          "label": "letter-spacing · .stage-word",
          "type": "number",
          "default": -0.03,
          "advanced": true,
          "selector": ".stage-word",
          "property": "letter-spacing",
          "min": -0.2,
          "max": 0.5,
          "unit": "em",
          "step": 0.005
        },
        "style.135": {
          "label": "top · .stage-word",
          "type": "number",
          "default": 7,
          "advanced": true,
          "selector": ".stage-word",
          "property": "top",
          "min": -600,
          "max": 2400,
          "step": 0.1,
          "unit": "%"
        },
        "style.136": {
          "label": "left · .stage-word",
          "type": "number",
          "default": 13,
          "advanced": true,
          "selector": ".stage-word",
          "property": "left",
          "min": -600,
          "max": 2400,
          "step": 0.1,
          "unit": "%"
        },
        "style.138": {
          "label": "line-height · .stage-word",
          "type": "number",
          "default": 1,
          "advanced": true,
          "selector": ".stage-word",
          "property": "line-height",
          "min": 0.1,
          "max": 5,
          "step": 0.05,
          "unit": ""
        },
        "style.407": {
          "label": "font-size · .stage-word",
          "type": "number",
          "default": 290,
          "advanced": true,
          "selector": ".stage-word",
          "property": "font-size",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.408": {
          "label": "left · .stage-word",
          "type": "number",
          "default": 15,
          "advanced": true,
          "selector": ".stage-word",
          "property": "left",
          "min": -600,
          "max": 2400,
          "step": 0.1,
          "unit": "%"
        },
        "style.409": {
          "label": "top · .stage-word",
          "type": "number",
          "default": 14,
          "advanced": true,
          "selector": ".stage-word",
          "property": "top",
          "min": -600,
          "max": 2400,
          "step": 0.1,
          "unit": "%"
        },
        "opacity": {
          "label": "불투명도",
          "type": "number",
          "default": 0.028,
          "min": 0,
          "max": 1,
          "unit": "",
          "step": 0.01
        }
      }
    },
    {
      "id": "crosshairs",
      "label": "십자 표시",
      "group": "배경",
      "el": ".crosshair",
      "params": {
        "visible": {
          "label": "보이기",
          "type": "boolean",
          "default": true,
          "on": "visible",
          "off": "hidden"
        },
        "offset.x": {
          "label": "좌우 이동",
          "type": "number",
          "default": 0,
          "min": -600,
          "max": 600,
          "step": 0.1,
          "unit": "px"
        },
        "offset.y": {
          "label": "상하 이동",
          "type": "number",
          "default": 0,
          "min": -600,
          "max": 600,
          "step": 0.1,
          "unit": "px"
        },
        "scale": {
          "label": "크기 배율",
          "type": "number",
          "default": 1,
          "min": 0.2,
          "max": 3,
          "step": 0.01,
          "unit": ""
        },
        "rotation": {
          "label": "회전",
          "type": "number",
          "default": 0,
          "min": -180,
          "max": 180,
          "step": 1,
          "unit": "deg"
        },
        "style.163": {
          "label": "font-weight · .crosshair",
          "type": "number",
          "default": 400,
          "advanced": true,
          "selector": ".crosshair",
          "property": "font-weight",
          "min": 100,
          "max": 900,
          "step": 100,
          "unit": ""
        },
        "style.164": {
          "label": "color · .crosshair",
          "type": "color",
          "default": "#8f9889",
          "advanced": true,
          "selector": ".crosshair",
          "property": "color"
        },
        "style.165": {
          "label": "font-size · .crosshair",
          "type": "number",
          "default": 21,
          "advanced": true,
          "selector": ".crosshair",
          "property": "font-size",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.166": {
          "label": "line-height · .crosshair",
          "type": "number",
          "default": 1,
          "advanced": true,
          "selector": ".crosshair",
          "property": "line-height",
          "min": 0.1,
          "max": 5,
          "step": 0.05,
          "unit": ""
        },
        "style.167": {
          "label": "top · .crosshair-one",
          "type": "number",
          "default": 11,
          "advanced": true,
          "selector": ".crosshair-one",
          "property": "top",
          "min": -600,
          "max": 2400,
          "step": 0.1,
          "unit": "%"
        },
        "style.168": {
          "label": "left · .crosshair-one",
          "type": "number",
          "default": 25,
          "advanced": true,
          "selector": ".crosshair-one",
          "property": "left",
          "min": -600,
          "max": 2400,
          "step": 0.1,
          "unit": "%"
        },
        "style.169": {
          "label": "bottom · .crosshair-two",
          "type": "number",
          "default": 11,
          "advanced": true,
          "selector": ".crosshair-two",
          "property": "bottom",
          "min": -600,
          "max": 2400,
          "step": 0.1,
          "unit": "%"
        },
        "style.170": {
          "label": "right · .crosshair-two",
          "type": "number",
          "default": 18,
          "advanced": true,
          "selector": ".crosshair-two",
          "property": "right",
          "min": -600,
          "max": 2400,
          "step": 0.1,
          "unit": "%"
        },
        "style.417": {
          "label": "top · .crosshair-one",
          "type": "number",
          "default": 16,
          "advanced": true,
          "selector": ".crosshair-one",
          "property": "top",
          "min": -600,
          "max": 2400,
          "step": 0.1,
          "unit": "%"
        },
        "style.418": {
          "label": "left · .crosshair-one",
          "type": "number",
          "default": 22,
          "advanced": true,
          "selector": ".crosshair-one",
          "property": "left",
          "min": -600,
          "max": 2400,
          "step": 0.1,
          "unit": "%"
        },
        "style.419": {
          "label": "bottom · .crosshair-two",
          "type": "number",
          "default": 8,
          "advanced": true,
          "selector": ".crosshair-two",
          "property": "bottom",
          "min": -600,
          "max": 2400,
          "step": 0.1,
          "unit": "%"
        },
        "style.420": {
          "label": "right · .crosshair-two",
          "type": "number",
          "default": 19,
          "advanced": true,
          "selector": ".crosshair-two",
          "property": "right",
          "min": -600,
          "max": 2400,
          "step": 0.1,
          "unit": "%"
        },
        "opacity": {
          "label": "불투명도",
          "type": "number",
          "default": 1,
          "min": 0,
          "max": 1,
          "step": 0.01,
          "unit": ""
        }
      }
    },
    {
      "id": "years",
      "label": "연도 표기",
      "group": "배경",
      "el": ".year",
      "params": {
        "visible": {
          "label": "보이기",
          "type": "boolean",
          "default": true,
          "on": "visible",
          "off": "hidden"
        },
        "offset.x": {
          "label": "좌우 이동",
          "type": "number",
          "default": 0,
          "min": -600,
          "max": 600,
          "step": 0.1,
          "unit": "px"
        },
        "offset.y": {
          "label": "상하 이동",
          "type": "number",
          "default": 0,
          "min": -600,
          "max": 600,
          "step": 0.1,
          "unit": "px"
        },
        "scale": {
          "label": "크기 배율",
          "type": "number",
          "default": 1,
          "min": 0.2,
          "max": 3,
          "step": 0.01,
          "unit": ""
        },
        "rotation": {
          "label": "회전",
          "type": "number",
          "default": 0,
          "min": -180,
          "max": 180,
          "step": 1,
          "unit": "deg"
        },
        "style.86": {
          "label": "font-family · .year",
          "type": "select",
          "default": "'Barlow Condensed','Arial Narrow',sans-serif",
          "advanced": true,
          "selector": ".year",
          "property": "font-family",
          "options": [
            {
              "value": "'Barlow Condensed','Arial Narrow',sans-serif",
              "label": "기본 디자인"
            },
            {
              "value": "system-ui,sans-serif",
              "label": "대안 A"
            },
            {
              "value": "Georgia,serif",
              "label": "대안 B"
            }
          ]
        },
        "style.87": {
          "label": "font-size · .year",
          "type": "number",
          "default": 31,
          "advanced": true,
          "selector": ".year",
          "property": "font-size",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.88": {
          "label": "color · .year",
          "type": "color",
          "default": "#939b91",
          "advanced": true,
          "selector": ".year",
          "property": "color"
        },
        "style.89": {
          "label": "font-weight · .year",
          "type": "number",
          "default": 500,
          "advanced": true,
          "selector": ".year",
          "property": "font-weight",
          "min": 100,
          "max": 900,
          "step": 100,
          "unit": ""
        },
        "style.90": {
          "label": "gap · .year",
          "type": "number",
          "default": 20,
          "advanced": true,
          "selector": ".year",
          "property": "gap",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.91": {
          "label": "font-family · .year span",
          "type": "select",
          "default": "'DM Sans',sans-serif",
          "advanced": true,
          "selector": ".year span",
          "property": "font-family",
          "options": [
            {
              "value": "'DM Sans',sans-serif",
              "label": "기본 디자인"
            },
            {
              "value": "system-ui,sans-serif",
              "label": "대안 A"
            },
            {
              "value": "Georgia,serif",
              "label": "대안 B"
            }
          ]
        },
        "style.92": {
          "label": "font-size · .year span",
          "type": "number",
          "default": 12,
          "advanced": true,
          "selector": ".year span",
          "property": "font-size",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.93": {
          "label": "color · .year span",
          "type": "color",
          "default": "#939b91",
          "advanced": true,
          "selector": ".year span",
          "property": "color"
        },
        "style.94": {
          "label": "top · .year-start",
          "type": "number",
          "default": 8,
          "advanced": true,
          "selector": ".year-start",
          "property": "top",
          "min": -600,
          "max": 2400,
          "step": 0.1,
          "unit": "%"
        },
        "style.95": {
          "label": "left · .year-start",
          "type": "number",
          "default": 0,
          "advanced": true,
          "selector": ".year-start",
          "property": "left",
          "min": -600,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.96": {
          "label": "z-index · .year-start",
          "type": "number",
          "default": 2,
          "advanced": true,
          "selector": ".year-start",
          "property": "z-index",
          "min": 0,
          "max": 20,
          "step": 1,
          "unit": ""
        },
        "style.403": {
          "label": "top · .year-start",
          "type": "number",
          "default": 23,
          "advanced": true,
          "selector": ".year-start",
          "property": "top",
          "min": -600,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.404": {
          "label": "font-size · .year-start",
          "type": "number",
          "default": 25,
          "advanced": true,
          "selector": ".year-start",
          "property": "font-size",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.452": {
          "label": "font-size · .hero-bottom .year",
          "type": "number",
          "default": 25,
          "advanced": true,
          "selector": ".hero-bottom .year",
          "property": "font-size",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "opacity": {
          "label": "불투명도",
          "type": "number",
          "default": 1,
          "min": 0,
          "max": 1,
          "step": 0.01,
          "unit": ""
        }
      }
    },
    {
      "id": "stage",
      "label": "무대",
      "group": "무대",
      "el": ".stage",
      "params": {
        "visible": {
          "label": "보이기",
          "type": "boolean",
          "default": true,
          "on": "visible",
          "off": "hidden"
        },
        "offset.x": {
          "label": "좌우 이동",
          "type": "number",
          "default": 0,
          "min": -600,
          "max": 600,
          "step": 0.1,
          "unit": "px"
        },
        "offset.y": {
          "label": "상하 이동",
          "type": "number",
          "default": 0,
          "min": -600,
          "max": 600,
          "step": 0.1,
          "unit": "px"
        },
        "scale": {
          "label": "크기 배율",
          "type": "number",
          "default": 1,
          "min": 0.2,
          "max": 3,
          "step": 0.01,
          "unit": ""
        },
        "rotation": {
          "label": "회전",
          "type": "number",
          "default": 0,
          "min": -180,
          "max": 180,
          "step": 1,
          "unit": "deg"
        },
        "style.128": {
          "label": "inset · .stage",
          "type": "select",
          "default": "0 -2% 0 19%",
          "advanced": true,
          "selector": ".stage",
          "property": "inset",
          "options": [
            {
              "value": "0 -2% 0 19%",
              "label": "기본 디자인"
            },
            {
              "value": "0 0 0 0",
              "label": "대안 A"
            },
            {
              "value": "10% 5% 0 5%",
              "label": "대안 B"
            }
          ]
        },
        "style.129": {
          "label": "z-index · .stage",
          "type": "number",
          "default": 1,
          "advanced": true,
          "selector": ".stage",
          "property": "z-index",
          "min": 0,
          "max": 20,
          "step": 1,
          "unit": ""
        },
        "style.130": {
          "label": "perspective · .stage",
          "type": "number",
          "default": 1200,
          "advanced": true,
          "selector": ".stage",
          "property": "perspective",
          "min": 0,
          "max": 3600,
          "step": 0.1,
          "unit": "px"
        },
        "style.377": {
          "label": "inset · .stage",
          "type": "select",
          "default": "0 -16% 0 17%",
          "advanced": true,
          "selector": ".stage",
          "property": "inset",
          "options": [
            {
              "value": "0 -16% 0 17%",
              "label": "기본 디자인"
            },
            {
              "value": "0 0 0 0",
              "label": "대안 A"
            },
            {
              "value": "10% 5% 0 5%",
              "label": "대안 B"
            }
          ]
        },
        "style.405": {
          "label": "inset · .stage",
          "type": "select",
          "default": "0 -20% auto -20%",
          "advanced": true,
          "selector": ".stage",
          "property": "inset",
          "options": [
            {
              "value": "0 -20% auto -20%",
              "label": "기본 디자인"
            },
            {
              "value": "0 0 0 0",
              "label": "대안 A"
            },
            {
              "value": "10% 5% 0 5%",
              "label": "대안 B"
            }
          ]
        },
        "style.406": {
          "label": "height · .stage",
          "type": "number",
          "default": 410,
          "advanced": true,
          "selector": ".stage",
          "property": "height",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "opacity": {
          "label": "불투명도",
          "type": "number",
          "default": 1,
          "min": 0,
          "max": 1,
          "step": 0.01,
          "unit": ""
        }
      }
    },
    {
      "id": "shadow",
      "label": "바닥 그림자",
      "group": "무대",
      "el": ".ground-shadow",
      "params": {
        "visible": {
          "label": "보이기",
          "type": "boolean",
          "default": true,
          "on": "visible",
          "off": "hidden"
        },
        "offset.x": {
          "label": "좌우 이동",
          "type": "number",
          "default": 0,
          "min": -600,
          "max": 600,
          "step": 0.1,
          "unit": "px"
        },
        "offset.y": {
          "label": "상하 이동",
          "type": "number",
          "default": 0,
          "min": -600,
          "max": 600,
          "step": 0.1,
          "unit": "px"
        },
        "scale": {
          "label": "크기 배율",
          "type": "number",
          "default": 1,
          "min": 0.2,
          "max": 3,
          "step": 0.01,
          "unit": ""
        },
        "rotation": {
          "label": "회전",
          "type": "number",
          "default": 0,
          "min": -180,
          "max": 180,
          "step": 1,
          "unit": "deg"
        },
        "style.154": {
          "label": "bottom · .ground-shadow",
          "type": "number",
          "default": 7,
          "advanced": true,
          "selector": ".ground-shadow",
          "property": "bottom",
          "min": -600,
          "max": 2400,
          "step": 0.1,
          "unit": "%"
        },
        "style.155": {
          "label": "left · .ground-shadow",
          "type": "number",
          "default": 29,
          "advanced": true,
          "selector": ".ground-shadow",
          "property": "left",
          "min": -600,
          "max": 2400,
          "step": 0.1,
          "unit": "%"
        },
        "style.156": {
          "label": "width · .ground-shadow",
          "type": "number",
          "default": 52,
          "advanced": true,
          "selector": ".ground-shadow",
          "property": "width",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "%"
        },
        "style.157": {
          "label": "height · .ground-shadow",
          "type": "number",
          "default": 8,
          "advanced": true,
          "selector": ".ground-shadow",
          "property": "height",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "%"
        },
        "style.158": {
          "label": "border-radius · .ground-shadow",
          "type": "number",
          "default": 50,
          "advanced": true,
          "selector": ".ground-shadow",
          "property": "border-radius",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "%"
        },
        "style.159": {
          "label": "background · .ground-shadow",
          "type": "color",
          "default": "#303b2c23",
          "advanced": true,
          "selector": ".ground-shadow",
          "property": "background"
        },
        "style.160": {
          "label": "filter · .ground-shadow",
          "type": "select",
          "default": "blur(19px)",
          "advanced": true,
          "selector": ".ground-shadow",
          "property": "filter",
          "options": [
            {
              "value": "blur(19px)",
              "label": "기본 디자인"
            },
            {
              "value": "none",
              "label": "대안 A"
            },
            {
              "value": "blur(4px)",
              "label": "대안 B"
            }
          ]
        },
        "style.351": {
          "label": "opacity · 0%,100%",
          "type": "number",
          "default": 0.85,
          "advanced": true,
          "selector": "0%,100%",
          "property": "opacity",
          "min": 0,
          "max": 1,
          "step": 0.01,
          "unit": ""
        },
        "style.352": {
          "label": "transform · 0%,100%",
          "type": "select",
          "default": "scale(1) rotate(-8deg)",
          "advanced": true,
          "selector": "0%,100%",
          "property": "transform",
          "options": [
            {
              "value": "scale(1) rotate(-8deg)",
              "label": "기본 디자인"
            },
            {
              "value": "translate(0,0) scale(1) rotate(0deg)",
              "label": "대안 A"
            },
            {
              "value": "translateY(-12px) scale(1.05)",
              "label": "대안 B"
            }
          ]
        },
        "style.353": {
          "label": "opacity · 50%",
          "type": "number",
          "default": 0.5,
          "advanced": true,
          "selector": "50%",
          "property": "opacity",
          "min": 0,
          "max": 1,
          "step": 0.01,
          "unit": ""
        },
        "style.354": {
          "label": "transform · 50%",
          "type": "select",
          "default": "scale(.88) rotate(-8deg)",
          "advanced": true,
          "selector": "50%",
          "property": "transform",
          "options": [
            {
              "value": "scale(.88) rotate(-8deg)",
              "label": "기본 디자인"
            },
            {
              "value": "translate(0,0) scale(1) rotate(0deg)",
              "label": "대안 A"
            },
            {
              "value": "translateY(-12px) scale(1.05)",
              "label": "대안 B"
            }
          ]
        },
        "style.414": {
          "label": "bottom · .ground-shadow",
          "type": "number",
          "default": 3,
          "advanced": true,
          "selector": ".ground-shadow",
          "property": "bottom",
          "min": -600,
          "max": 2400,
          "step": 0.1,
          "unit": "%"
        },
        "style.415": {
          "label": "left · .ground-shadow",
          "type": "number",
          "default": 26,
          "advanced": true,
          "selector": ".ground-shadow",
          "property": "left",
          "min": -600,
          "max": 2400,
          "step": 0.1,
          "unit": "%"
        },
        "style.416": {
          "label": "width · .ground-shadow",
          "type": "number",
          "default": 57,
          "advanced": true,
          "selector": ".ground-shadow",
          "property": "width",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "%"
        },
        "motion.shadow-breathe.ms": {
          "label": "그림자 주기",
          "type": "number",
          "default": 7000,
          "min": 100,
          "max": 60000,
          "step": 100,
          "unit": "ms",
          "motion": true
        },
        "opacity": {
          "label": "불투명도",
          "type": "number",
          "default": 1,
          "min": 0,
          "max": 1,
          "unit": "",
          "step": 0.01
        },
        "motion.shadow-breathe.delay": {
          "label": "shadow-breathe · 시작 지연",
          "type": "number",
          "default": 0,
          "min": 0,
          "max": 5000,
          "unit": "ms",
          "step": 10
        },
        "motion.shadow-breathe.ease": {
          "label": "shadow-breathe · 속도 변화",
          "type": "select",
          "default": "ease-in-out",
          "options": [
            {
              "value": "ease-in-out",
              "label": "부드럽게 시작·끝"
            },
            {
              "value": "linear",
              "label": "일정한 속도"
            },
            {
              "value": "ease-out",
              "label": "부드럽게 끝"
            }
          ]
        }
      }
    },
    {
      "id": "character",
      "label": "캐릭터",
      "group": "무대",
      "el": ".character-motion",
      "params": {
        "visible": {
          "label": "보이기",
          "type": "boolean",
          "default": true,
          "on": "visible",
          "off": "hidden"
        },
        "offset.x": {
          "label": "좌우 이동",
          "type": "number",
          "default": 0,
          "min": -600,
          "max": 600,
          "step": 0.1,
          "unit": "px"
        },
        "offset.y": {
          "label": "상하 이동",
          "type": "number",
          "default": 0,
          "min": -600,
          "max": 600,
          "step": 0.1,
          "unit": "px"
        },
        "scale": {
          "label": "크기 배율",
          "type": "number",
          "default": 1,
          "min": 0.2,
          "max": 3,
          "step": 0.01,
          "unit": ""
        },
        "rotation": {
          "label": "회전",
          "type": "number",
          "default": 0,
          "min": -180,
          "max": 180,
          "step": 1,
          "unit": "deg"
        },
        "src": {
          "label": "캐릭터 이미지",
          "type": "image",
          "default": "./assets/character.png",
          "attr": [
            "img.character",
            "src"
          ]
        },
        "tilt": {
          "label": "기울기",
          "type": "number",
          "default": -5,
          "min": -30,
          "max": 30,
          "step": 1,
          "unit": "deg",
          "css": "--rz"
        },
        "zoom": {
          "label": "장면 배율",
          "type": "number",
          "default": 1,
          "min": 0.4,
          "max": 2,
          "step": 0.01,
          "unit": "",
          "css": "--zoom"
        },
        "pointer.x": {
          "label": "좌우 반응",
          "type": "number",
          "default": 22,
          "min": 0,
          "max": 80,
          "step": 0.1,
          "unit": "px"
        },
        "pointer.y": {
          "label": "상하 반응",
          "type": "number",
          "default": 13,
          "min": 0,
          "max": 80,
          "step": 0.1,
          "unit": "px"
        },
        "pointer.tilt-x": {
          "label": "상하 기울임",
          "type": "number",
          "default": 6,
          "min": 0,
          "max": 80,
          "step": 1,
          "unit": "deg"
        },
        "pointer.tilt-y": {
          "label": "좌우 기울임",
          "type": "number",
          "default": 9,
          "min": 0,
          "max": 80,
          "step": 1,
          "unit": "deg"
        },
        "style.139": {
          "label": "width · .character-motion",
          "type": "select",
          "default": "min(77vw,1100px)",
          "advanced": true,
          "selector": ".character-motion",
          "property": "width",
          "options": [
            {
              "value": "min(77vw,1100px)",
              "label": "기본 디자인"
            },
            {
              "value": "90%",
              "label": "대안 A"
            },
            {
              "value": "600px",
              "label": "대안 B"
            }
          ]
        },
        "style.140": {
          "label": "height · .character-motion",
          "type": "number",
          "default": 112,
          "advanced": true,
          "selector": ".character-motion",
          "property": "height",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "%"
        },
        "style.141": {
          "label": "left · .character-motion",
          "type": "number",
          "default": -8,
          "advanced": true,
          "selector": ".character-motion",
          "property": "left",
          "min": -600,
          "max": 2400,
          "step": 0.1,
          "unit": "%"
        },
        "style.142": {
          "label": "top · .character-motion",
          "type": "number",
          "default": -5,
          "advanced": true,
          "selector": ".character-motion",
          "property": "top",
          "min": -600,
          "max": 2400,
          "step": 0.1,
          "unit": "%"
        },
        "style.143": {
          "label": "transform-origin · .character-motion",
          "type": "select",
          "default": "60% 60%",
          "advanced": true,
          "selector": ".character-motion",
          "property": "transform-origin",
          "options": [
            {
              "value": "60% 60%",
              "label": "기본 디자인"
            },
            {
              "value": "50% 50%",
              "label": "대안 A"
            },
            {
              "value": "25% 75%",
              "label": "대안 B"
            }
          ]
        },
        "style.145": {
          "label": "width · .character-parallax",
          "type": "number",
          "default": 100,
          "advanced": true,
          "selector": ".character-parallax",
          "property": "width",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "%"
        },
        "style.146": {
          "label": "height · .character-parallax",
          "type": "number",
          "default": 100,
          "advanced": true,
          "selector": ".character-parallax",
          "property": "height",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "%"
        },
        "style.147": {
          "label": "min-width · .character-parallax",
          "type": "number",
          "default": 0,
          "advanced": true,
          "selector": ".character-parallax",
          "property": "min-width",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.148": {
          "label": "min-height · .character-parallax",
          "type": "number",
          "default": 0,
          "advanced": true,
          "selector": ".character-parallax",
          "property": "min-height",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.149": {
          "label": "transition · .character-parallax",
          "type": "select",
          "default": "transform .12s linear",
          "advanced": true,
          "selector": ".character-parallax",
          "property": "transition",
          "options": [
            {
              "value": "transform .12s linear",
              "label": "기본 디자인"
            },
            {
              "value": "none",
              "label": "대안 A"
            },
            {
              "value": "all .4s ease",
              "label": "대안 B"
            }
          ]
        },
        "style.150": {
          "label": "width · .character",
          "type": "number",
          "default": 100,
          "advanced": true,
          "selector": ".character",
          "property": "width",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "%"
        },
        "style.151": {
          "label": "height · .character",
          "type": "number",
          "default": 100,
          "advanced": true,
          "selector": ".character",
          "property": "height",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "%"
        },
        "style.152": {
          "label": "filter · .character",
          "type": "select",
          "default": "drop-shadow(8px 15px 12px #26312912)",
          "advanced": true,
          "selector": ".character",
          "property": "filter",
          "options": [
            {
              "value": "drop-shadow(8px 15px 12px #26312912)",
              "label": "기본 디자인"
            },
            {
              "value": "none",
              "label": "대안 A"
            },
            {
              "value": "blur(4px)",
              "label": "대안 B"
            }
          ]
        },
        "style.304": {
          "label": "background · .poster-character",
          "type": "color",
          "default": "#ccd5d8",
          "advanced": true,
          "selector": ".poster-character",
          "property": "background"
        },
        "style.305": {
          "label": "width · .poster-character img",
          "type": "number",
          "default": 145,
          "advanced": true,
          "selector": ".poster-character img",
          "property": "width",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "%"
        },
        "style.306": {
          "label": "height · .poster-character img",
          "type": "number",
          "default": 100,
          "advanced": true,
          "selector": ".poster-character img",
          "property": "height",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "%"
        },
        "style.307": {
          "label": "left · .poster-character img",
          "type": "number",
          "default": -24,
          "advanced": true,
          "selector": ".poster-character img",
          "property": "left",
          "min": -600,
          "max": 2400,
          "step": 0.1,
          "unit": "%"
        },
        "style.308": {
          "label": "top · .poster-character img",
          "type": "number",
          "default": 0,
          "advanced": true,
          "selector": ".poster-character img",
          "property": "top",
          "min": -600,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.309": {
          "label": "transform · .poster-character img",
          "type": "select",
          "default": "rotate(-12deg)",
          "advanced": true,
          "selector": ".poster-character img",
          "property": "transform",
          "options": [
            {
              "value": "rotate(-12deg)",
              "label": "기본 디자인"
            },
            {
              "value": "translate(0,0) scale(1) rotate(0deg)",
              "label": "대안 A"
            },
            {
              "value": "translateY(-12px) scale(1.05)",
              "label": "대안 B"
            }
          ]
        },
        "style.349": {
          "label": "transform · 0%,100%",
          "type": "select",
          "default": "translateY(0) rotate(0)",
          "advanced": true,
          "selector": "0%,100%",
          "property": "transform",
          "options": [
            {
              "value": "translateY(0) rotate(0)",
              "label": "기본 디자인"
            },
            {
              "value": "translate(0,0) scale(1) rotate(0deg)",
              "label": "대안 A"
            },
            {
              "value": "translateY(-12px) scale(1.05)",
              "label": "대안 B"
            }
          ]
        },
        "style.350": {
          "label": "transform · 50%",
          "type": "select",
          "default": "translateY(-18px) rotate(2deg)",
          "advanced": true,
          "selector": "50%",
          "property": "transform",
          "options": [
            {
              "value": "translateY(-18px) rotate(2deg)",
              "label": "기본 디자인"
            },
            {
              "value": "translate(0,0) scale(1) rotate(0deg)",
              "label": "대안 A"
            },
            {
              "value": "translateY(-12px) scale(1.05)",
              "label": "대안 B"
            }
          ]
        },
        "style.355": {
          "label": "transform · 0%",
          "type": "select",
          "default": "translate(15%,-16%) scale(.48) rotate(15deg)",
          "advanced": true,
          "selector": "0%",
          "property": "transform",
          "options": [
            {
              "value": "translate(15%,-16%) scale(.48) rotate(15deg)",
              "label": "기본 디자인"
            },
            {
              "value": "translate(0,0) scale(1) rotate(0deg)",
              "label": "대안 A"
            },
            {
              "value": "translateY(-12px) scale(1.05)",
              "label": "대안 B"
            }
          ]
        },
        "style.356": {
          "label": "opacity · 0%",
          "type": "number",
          "default": 0,
          "advanced": true,
          "selector": "0%",
          "property": "opacity",
          "min": 0,
          "max": 1,
          "step": 0.01,
          "unit": ""
        },
        "style.357": {
          "label": "opacity · 15%",
          "type": "number",
          "default": 1,
          "advanced": true,
          "selector": "15%",
          "property": "opacity",
          "min": 0,
          "max": 1,
          "step": 0.01,
          "unit": ""
        },
        "style.358": {
          "label": "transform · 70%",
          "type": "select",
          "default": "translate(-1%,1%) scale(1.04) rotate(-1deg)",
          "advanced": true,
          "selector": "70%",
          "property": "transform",
          "options": [
            {
              "value": "translate(-1%,1%) scale(1.04) rotate(-1deg)",
              "label": "기본 디자인"
            },
            {
              "value": "translate(0,0) scale(1) rotate(0deg)",
              "label": "대안 A"
            },
            {
              "value": "translateY(-12px) scale(1.05)",
              "label": "대안 B"
            }
          ]
        },
        "style.359": {
          "label": "transform · 100%",
          "type": "select",
          "default": "translate(0,0) scale(1) rotate(0)",
          "advanced": true,
          "selector": "100%",
          "property": "transform",
          "options": [
            {
              "value": "translate(0,0) scale(1) rotate(0)",
              "label": "기본 디자인"
            },
            {
              "value": "translate(0,0) scale(1) rotate(0deg)",
              "label": "대안 A"
            },
            {
              "value": "translateY(-12px) scale(1.05)",
              "label": "대안 B"
            }
          ]
        },
        "style.378": {
          "label": "width · .character-motion",
          "type": "number",
          "default": 90,
          "advanced": true,
          "selector": ".character-motion",
          "property": "width",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "vw"
        },
        "style.379": {
          "label": "top · .character-motion",
          "type": "number",
          "default": -3,
          "advanced": true,
          "selector": ".character-motion",
          "property": "top",
          "min": -600,
          "max": 2400,
          "step": 0.1,
          "unit": "%"
        },
        "style.380": {
          "label": "left · .character-motion",
          "type": "number",
          "default": -8,
          "advanced": true,
          "selector": ".character-motion",
          "property": "left",
          "min": -600,
          "max": 2400,
          "step": 0.1,
          "unit": "%"
        },
        "style.410": {
          "label": "top · .character-motion",
          "type": "number",
          "default": 0,
          "advanced": true,
          "selector": ".character-motion",
          "property": "top",
          "min": -600,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.411": {
          "label": "left · .character-motion",
          "type": "number",
          "default": 0,
          "advanced": true,
          "selector": ".character-motion",
          "property": "left",
          "min": -600,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.412": {
          "label": "width · .character-motion",
          "type": "number",
          "default": 100,
          "advanced": true,
          "selector": ".character-motion",
          "property": "width",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "%"
        },
        "style.413": {
          "label": "height · .character-motion",
          "type": "number",
          "default": 100,
          "advanced": true,
          "selector": ".character-motion",
          "property": "height",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "%"
        },
        "style.471": {
          "label": "width · .poster-character img",
          "type": "number",
          "default": 110,
          "advanced": true,
          "selector": ".poster-character img",
          "property": "width",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "%"
        },
        "style.472": {
          "label": "left · .poster-character img",
          "type": "number",
          "default": -4,
          "advanced": true,
          "selector": ".poster-character img",
          "property": "left",
          "min": -600,
          "max": 2400,
          "step": 0.1,
          "unit": "%"
        },
        "motion.arrival.ms": {
          "label": "등장 시간",
          "type": "number",
          "default": 1700,
          "min": 100,
          "max": 60000,
          "step": 100,
          "unit": "ms",
          "motion": true
        },
        "motion.float.ms": {
          "label": "떠다님 주기",
          "type": "number",
          "default": 7000,
          "min": 100,
          "max": 60000,
          "step": 100,
          "unit": "ms",
          "motion": true
        },
        "opacity": {
          "label": "불투명도",
          "type": "number",
          "default": 1,
          "min": 0,
          "max": 1,
          "unit": "",
          "step": 0.01
        },
        "motion.arrival.delay": {
          "label": "arrival · 시작 지연",
          "type": "number",
          "default": 0,
          "min": 0,
          "max": 5000,
          "unit": "ms",
          "step": 10
        },
        "motion.arrival.ease": {
          "label": "arrival · 속도 변화",
          "type": "select",
          "default": "cubic-bezier(.17,.7,.27,1)",
          "options": [
            {
              "value": "cubic-bezier(.17,.7,.27,1)",
              "label": "기본 곡선"
            },
            {
              "value": "linear",
              "label": "일정한 속도"
            },
            {
              "value": "ease-in-out",
              "label": "부드럽게 시작·끝"
            },
            {
              "value": "ease-out",
              "label": "부드럽게 끝"
            }
          ]
        },
        "motion.float.delay": {
          "label": "float · 시작 지연",
          "type": "number",
          "default": 0,
          "min": 0,
          "max": 5000,
          "unit": "ms",
          "step": 10
        },
        "motion.float.ease": {
          "label": "float · 속도 변화",
          "type": "select",
          "default": "ease-in-out",
          "options": [
            {
              "value": "ease-in-out",
              "label": "부드럽게 시작·끝"
            },
            {
              "value": "linear",
              "label": "일정한 속도"
            },
            {
              "value": "ease-out",
              "label": "부드럽게 끝"
            }
          ]
        }
      }
    },
    {
      "id": "header",
      "label": "머리글",
      "group": "문구·버튼",
      "el": ".header",
      "params": {
        "visible": {
          "label": "보이기",
          "type": "boolean",
          "default": true,
          "on": "visible",
          "off": "hidden"
        },
        "offset.x": {
          "label": "좌우 이동",
          "type": "number",
          "default": 0,
          "min": -600,
          "max": 600,
          "step": 0.1,
          "unit": "px"
        },
        "offset.y": {
          "label": "상하 이동",
          "type": "number",
          "default": 0,
          "min": -600,
          "max": 600,
          "step": 0.1,
          "unit": "px"
        },
        "scale": {
          "label": "크기 배율",
          "type": "number",
          "default": 1,
          "min": 0.2,
          "max": 3,
          "step": 0.01,
          "unit": ""
        },
        "rotation": {
          "label": "회전",
          "type": "number",
          "default": 0,
          "min": -180,
          "max": 180,
          "step": 1,
          "unit": "deg"
        },
        "brand": {
          "label": "브랜드 이름",
          "type": "text",
          "default": "POTATO®",
          "text": ".brand-name"
        },
        "style.56": {
          "label": "height · .header",
          "type": "number",
          "default": 106,
          "advanced": true,
          "selector": ".header",
          "property": "height",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.57": {
          "label": "margin · .header",
          "type": "select",
          "default": "0 5.1%",
          "advanced": true,
          "selector": ".header",
          "property": "margin",
          "options": [
            {
              "value": "0 5.1%",
              "label": "기본 디자인"
            },
            {
              "value": "8px 0",
              "label": "대안 A"
            },
            {
              "value": "24px 12px",
              "label": "대안 B"
            }
          ]
        },
        "style.58": {
          "label": "z-index · .header",
          "type": "number",
          "default": 3,
          "advanced": true,
          "selector": ".header",
          "property": "z-index",
          "min": 0,
          "max": 20,
          "step": 1,
          "unit": ""
        },
        "style.59": {
          "label": "gap · .wordmark",
          "type": "number",
          "default": 13,
          "advanced": true,
          "selector": ".wordmark",
          "property": "gap",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.60": {
          "label": "border-radius · .potato-mark",
          "type": "number",
          "default": 50,
          "advanced": true,
          "selector": ".potato-mark",
          "property": "border-radius",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "%"
        },
        "style.61": {
          "label": "padding · .potato-mark",
          "type": "select",
          "default": "0 9px 4px",
          "advanced": true,
          "selector": ".potato-mark",
          "property": "padding",
          "options": [
            {
              "value": "0 9px 4px",
              "label": "기본 디자인"
            },
            {
              "value": "8px 12px",
              "label": "대안 A"
            },
            {
              "value": "20px 24px",
              "label": "대안 B"
            }
          ]
        },
        "style.62": {
          "label": "font-size · .potato-mark",
          "type": "number",
          "default": 23,
          "advanced": true,
          "selector": ".potato-mark",
          "property": "font-size",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.63": {
          "label": "font-weight · .potato-mark",
          "type": "number",
          "default": 700,
          "advanced": true,
          "selector": ".potato-mark",
          "property": "font-weight",
          "min": 100,
          "max": 900,
          "step": 100,
          "unit": ""
        },
        "style.64": {
          "label": "letter-spacing · .potato-mark",
          "type": "number",
          "default": -3,
          "advanced": true,
          "selector": ".potato-mark",
          "property": "letter-spacing",
          "min": -600,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.65": {
          "label": "line-height · .potato-mark",
          "type": "number",
          "default": 25,
          "advanced": true,
          "selector": ".potato-mark",
          "property": "line-height",
          "min": 0.1,
          "max": 120,
          "step": 0.05,
          "unit": "px"
        },
        "style.66": {
          "label": "width · .barcode",
          "type": "number",
          "default": 50,
          "advanced": true,
          "selector": ".barcode",
          "property": "width",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.67": {
          "label": "height · .barcode",
          "type": "number",
          "default": 25,
          "advanced": true,
          "selector": ".barcode",
          "property": "height",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.68": {
          "label": "font-size · .brand-name",
          "type": "number",
          "default": 12,
          "advanced": true,
          "selector": ".brand-name",
          "property": "font-size",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.69": {
          "label": "font-weight · .brand-name",
          "type": "number",
          "default": 700,
          "advanced": true,
          "selector": ".brand-name",
          "property": "font-weight",
          "min": 100,
          "max": 900,
          "step": 100,
          "unit": ""
        },
        "style.70": {
          "label": "letter-spacing · .brand-name",
          "type": "number",
          "default": 0.06,
          "advanced": true,
          "selector": ".brand-name",
          "property": "letter-spacing",
          "min": -0.2,
          "max": 0.5,
          "unit": "em",
          "step": 0.005
        },
        "style.71": {
          "label": "font-size · .header-note",
          "type": "number",
          "default": 10,
          "advanced": true,
          "selector": ".header-note",
          "property": "font-size",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.72": {
          "label": "line-height · .header-note",
          "type": "number",
          "default": 1.5,
          "advanced": true,
          "selector": ".header-note",
          "property": "line-height",
          "min": 0.1,
          "max": 5,
          "step": 0.05,
          "unit": ""
        },
        "style.73": {
          "label": "letter-spacing · .header-note",
          "type": "number",
          "default": 0.1,
          "advanced": true,
          "selector": ".header-note",
          "property": "letter-spacing",
          "min": -0.2,
          "max": 0.5,
          "unit": "em",
          "step": 0.005
        },
        "style.74": {
          "label": "margin-right · .header-note",
          "type": "number",
          "default": 12,
          "advanced": true,
          "selector": ".header-note",
          "property": "margin-right",
          "min": -600,
          "max": 2400,
          "step": 0.1,
          "unit": "%"
        },
        "style.75": {
          "label": "gap · .header nav",
          "type": "number",
          "default": 32,
          "advanced": true,
          "selector": ".header nav",
          "property": "gap",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.76": {
          "label": "font-size · .header nav",
          "type": "number",
          "default": 13,
          "advanced": true,
          "selector": ".header nav",
          "property": "font-size",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.77": {
          "label": "padding · .header nav button",
          "type": "select",
          "default": "12px 0",
          "advanced": true,
          "selector": ".header nav button",
          "property": "padding",
          "options": [
            {
              "value": "12px 0",
              "label": "기본 디자인"
            },
            {
              "value": "8px 12px",
              "label": "대안 A"
            },
            {
              "value": "20px 24px",
              "label": "대안 B"
            }
          ]
        },
        "style.78": {
          "label": "font-size · .header nav button>span",
          "type": "number",
          "default": 10,
          "advanced": true,
          "selector": ".header nav button>span",
          "property": "font-size",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.79": {
          "label": "margin-left · .header nav button>span",
          "type": "number",
          "default": 5,
          "advanced": true,
          "selector": ".header nav button>span",
          "property": "margin-left",
          "min": -600,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.80": {
          "label": "font-size · .header nav .contact-link span",
          "type": "number",
          "default": 18,
          "advanced": true,
          "selector": ".header nav .contact-link span",
          "property": "font-size",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.81": {
          "label": "margin-left · .header nav .contact-link span",
          "type": "number",
          "default": 14,
          "advanced": true,
          "selector": ".header nav .contact-link span",
          "property": "margin-left",
          "min": -600,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.370": {
          "label": "font-size · .header nav",
          "type": "number",
          "default": 15,
          "advanced": true,
          "selector": ".header nav",
          "property": "font-size",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.371": {
          "label": "height · .header",
          "type": "number",
          "default": 88,
          "advanced": true,
          "selector": ".header",
          "property": "height",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.390": {
          "label": "gap · .header nav",
          "type": "number",
          "default": 24,
          "advanced": true,
          "selector": ".header nav",
          "property": "gap",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.391": {
          "label": "height · .header",
          "type": "number",
          "default": 78,
          "advanced": true,
          "selector": ".header",
          "property": "height",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.392": {
          "label": "margin · .header",
          "type": "select",
          "default": "0 6%",
          "advanced": true,
          "selector": ".header",
          "property": "margin",
          "options": [
            {
              "value": "0 6%",
              "label": "기본 디자인"
            },
            {
              "value": "8px 0",
              "label": "대안 A"
            },
            {
              "value": "24px 12px",
              "label": "대안 B"
            }
          ]
        },
        "style.393": {
          "label": "gap · .header nav",
          "type": "number",
          "default": 20,
          "advanced": true,
          "selector": ".header nav",
          "property": "gap",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.394": {
          "label": "font-size · .header nav",
          "type": "number",
          "default": 12,
          "advanced": true,
          "selector": ".header nav",
          "property": "font-size",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.395": {
          "label": "font-size · .header nav .contact-link span",
          "type": "number",
          "default": 14,
          "advanced": true,
          "selector": ".header nav .contact-link span",
          "property": "font-size",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.396": {
          "label": "margin-left · .header nav .contact-link span",
          "type": "number",
          "default": 4,
          "advanced": true,
          "selector": ".header nav .contact-link span",
          "property": "margin-left",
          "min": -600,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.397": {
          "label": "gap · .wordmark",
          "type": "number",
          "default": 8,
          "advanced": true,
          "selector": ".wordmark",
          "property": "gap",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.398": {
          "label": "width · .barcode",
          "type": "number",
          "default": 32,
          "advanced": true,
          "selector": ".barcode",
          "property": "width",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.399": {
          "label": "height · .barcode",
          "type": "number",
          "default": 23,
          "advanced": true,
          "selector": ".barcode",
          "property": "height",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.400": {
          "label": "font-size · .potato-mark",
          "type": "number",
          "default": 21,
          "advanced": true,
          "selector": ".potato-mark",
          "property": "font-size",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "opacity": {
          "label": "불투명도",
          "type": "number",
          "default": 1,
          "min": 0,
          "max": 1,
          "step": 0.01,
          "unit": ""
        }
      }
    },
    {
      "id": "copy",
      "label": "소개 문구",
      "group": "문구·버튼",
      "el": ".hero-copy",
      "params": {
        "visible": {
          "label": "보이기",
          "type": "boolean",
          "default": true,
          "on": "visible",
          "off": "hidden"
        },
        "offset.x": {
          "label": "좌우 이동",
          "type": "number",
          "default": 0,
          "min": -600,
          "max": 600,
          "step": 0.1,
          "unit": "px"
        },
        "offset.y": {
          "label": "상하 이동",
          "type": "number",
          "default": 0,
          "min": -600,
          "max": 600,
          "step": 0.1,
          "unit": "px"
        },
        "scale": {
          "label": "크기 배율",
          "type": "number",
          "default": 1,
          "min": 0.2,
          "max": 3,
          "step": 0.01,
          "unit": ""
        },
        "rotation": {
          "label": "회전",
          "type": "number",
          "default": 0,
          "min": -180,
          "max": 180,
          "step": 1,
          "unit": "deg"
        },
        "title": {
          "label": "제목",
          "type": "text",
          "default": "POTATO\nDESIGNER",
          "text": "#hero-heading-text"
        },
        "intro": {
          "label": "소개 문구",
          "type": "text",
          "default": "A little playful. A little unexpected.\n브랜드부터 디지털 경험까지,\n평범한 아이디어에 새로운 움직임을 만듭니다.",
          "text": ".intro"
        },
        "style.21": {
          "label": "font-size · .text-button",
          "type": "number",
          "default": 13,
          "advanced": true,
          "selector": ".text-button",
          "property": "font-size",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.22": {
          "label": "min-height · .text-button",
          "type": "number",
          "default": 44,
          "advanced": true,
          "selector": ".text-button",
          "property": "min-height",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.23": {
          "label": "padding · .text-button",
          "type": "select",
          "default": "12px 0",
          "advanced": true,
          "selector": ".text-button",
          "property": "padding",
          "options": [
            {
              "value": "12px 0",
              "label": "기본 디자인"
            },
            {
              "value": "8px 12px",
              "label": "대안 A"
            },
            {
              "value": "20px 24px",
              "label": "대안 B"
            }
          ]
        },
        "style.24": {
          "label": "text-decoration · .text-button",
          "type": "select",
          "default": "underline",
          "advanced": true,
          "selector": ".text-button",
          "property": "text-decoration",
          "options": [
            {
              "value": "underline",
              "label": "기본 디자인"
            },
            {
              "value": "none",
              "label": "대안 A"
            }
          ]
        },
        "style.25": {
          "label": "text-underline-offset · .text-button",
          "type": "number",
          "default": 4,
          "advanced": true,
          "selector": ".text-button",
          "property": "text-underline-offset",
          "min": -600,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.52": {
          "label": "border · button",
          "type": "select",
          "default": "0",
          "advanced": true,
          "selector": "button",
          "property": "border",
          "min": -600,
          "max": 2400,
          "step": 0.1,
          "options": [
            {
              "value": "0",
              "label": "없음"
            },
            {
              "value": "1px solid #777e77",
              "label": "가는 선"
            }
          ]
        },
        "style.82": {
          "label": "min-height · .hero",
          "type": "number",
          "default": 630,
          "advanced": true,
          "selector": ".hero",
          "property": "min-height",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.83": {
          "label": "height · .hero",
          "type": "select",
          "default": "calc(100svh - 204px)",
          "advanced": true,
          "selector": ".hero",
          "property": "height",
          "options": [
            {
              "value": "calc(100svh - 204px)",
              "label": "기본 디자인"
            },
            {
              "value": "80svh",
              "label": "대안 A"
            },
            {
              "value": "720px",
              "label": "대안 B"
            }
          ]
        },
        "style.84": {
          "label": "max-height · .hero",
          "type": "number",
          "default": 1000,
          "advanced": true,
          "selector": ".hero",
          "property": "max-height",
          "min": 0,
          "max": 3000,
          "step": 0.1,
          "unit": "px"
        },
        "style.85": {
          "label": "margin · .hero",
          "type": "select",
          "default": "0 5.1%",
          "advanced": true,
          "selector": ".hero",
          "property": "margin",
          "options": [
            {
              "value": "0 5.1%",
              "label": "기본 디자인"
            },
            {
              "value": "8px 0",
              "label": "대안 A"
            },
            {
              "value": "24px 12px",
              "label": "대안 B"
            }
          ]
        },
        "style.97": {
          "label": "z-index · .hero-copy",
          "type": "number",
          "default": 2,
          "advanced": true,
          "selector": ".hero-copy",
          "property": "z-index",
          "min": 0,
          "max": 20,
          "step": 1,
          "unit": ""
        },
        "style.98": {
          "label": "padding-top · .hero-copy",
          "type": "select",
          "default": "clamp(150px,22vh,245px)",
          "advanced": true,
          "selector": ".hero-copy",
          "property": "padding-top",
          "options": [
            {
              "value": "clamp(150px,22vh,245px)",
              "label": "기본 디자인"
            },
            {
              "value": "120px",
              "label": "대안 A"
            },
            {
              "value": "200px",
              "label": "대안 B"
            }
          ]
        },
        "style.99": {
          "label": "width · .hero-copy",
          "type": "number",
          "default": 44,
          "advanced": true,
          "selector": ".hero-copy",
          "property": "width",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "%"
        },
        "style.100": {
          "label": "gap · .eyebrow",
          "type": "number",
          "default": 8,
          "advanced": true,
          "selector": ".eyebrow",
          "property": "gap",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.101": {
          "label": "font-size · .eyebrow",
          "type": "number",
          "default": 13,
          "advanced": true,
          "selector": ".eyebrow",
          "property": "font-size",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.102": {
          "label": "font-weight · .eyebrow",
          "type": "number",
          "default": 600,
          "advanced": true,
          "selector": ".eyebrow",
          "property": "font-weight",
          "min": 100,
          "max": 900,
          "step": 100,
          "unit": ""
        },
        "style.103": {
          "label": "margin · .eyebrow",
          "type": "select",
          "default": "0 0 22px",
          "advanced": true,
          "selector": ".eyebrow",
          "property": "margin",
          "options": [
            {
              "value": "0 0 22px",
              "label": "기본 디자인"
            },
            {
              "value": "8px 0",
              "label": "대안 A"
            },
            {
              "value": "24px 12px",
              "label": "대안 B"
            }
          ]
        },
        "style.104": {
          "label": "height · .eyebrow-line",
          "type": "number",
          "default": 1,
          "advanced": true,
          "selector": ".eyebrow-line",
          "property": "height",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.105": {
          "label": "width · .eyebrow-line",
          "type": "number",
          "default": 18,
          "advanced": true,
          "selector": ".eyebrow-line",
          "property": "width",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.106": {
          "label": "font-family · h1",
          "type": "select",
          "default": "'Barlow Condensed',Impact,'Arial Narrow',sans-serif",
          "advanced": true,
          "selector": "h1",
          "property": "font-family",
          "options": [
            {
              "value": "'Barlow Condensed',Impact,'Arial Narrow',sans-serif",
              "label": "기본 디자인"
            },
            {
              "value": "system-ui,sans-serif",
              "label": "대안 A"
            },
            {
              "value": "Georgia,serif",
              "label": "대안 B"
            }
          ]
        },
        "style.107": {
          "label": "font-size · h1",
          "type": "select",
          "default": "clamp(64px,6.6vw,120px)",
          "advanced": true,
          "selector": "h1",
          "property": "font-size",
          "options": [
            {
              "value": "clamp(64px,6.6vw,120px)",
              "label": "기본 디자인"
            },
            {
              "value": "clamp(51px,5vw,96px)",
              "label": "대안 A"
            },
            {
              "value": "clamp(77px,8vw,144px)",
              "label": "대안 B"
            }
          ]
        },
        "style.108": {
          "label": "line-height · h1",
          "type": "number",
          "default": 0.91,
          "advanced": true,
          "selector": "h1",
          "property": "line-height",
          "min": 0.1,
          "max": 5,
          "step": 0.05,
          "unit": ""
        },
        "style.109": {
          "label": "letter-spacing · h1",
          "type": "number",
          "default": -0.025,
          "advanced": true,
          "selector": "h1",
          "property": "letter-spacing",
          "min": -0.2,
          "max": 0.5,
          "unit": "em",
          "step": 0.005
        },
        "style.110": {
          "label": "font-weight · h1",
          "type": "number",
          "default": 600,
          "advanced": true,
          "selector": "h1",
          "property": "font-weight",
          "min": 100,
          "max": 900,
          "step": 100,
          "unit": ""
        },
        "style.111": {
          "label": "margin · h1",
          "type": "select",
          "default": "0 0 26px",
          "advanced": true,
          "selector": "h1",
          "property": "margin",
          "options": [
            {
              "value": "0 0 26px",
              "label": "기본 디자인"
            },
            {
              "value": "8px 0",
              "label": "대안 A"
            },
            {
              "value": "24px 12px",
              "label": "대안 B"
            }
          ]
        },
        "style.112": {
          "label": "font-size · .intro",
          "type": "number",
          "default": 14,
          "advanced": true,
          "selector": ".intro",
          "property": "font-size",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.113": {
          "label": "line-height · .intro",
          "type": "number",
          "default": 1.8,
          "advanced": true,
          "selector": ".intro",
          "property": "line-height",
          "min": 0.1,
          "max": 5,
          "step": 0.05,
          "unit": ""
        },
        "style.114": {
          "label": "color · .intro",
          "type": "color",
          "default": "#697269",
          "advanced": true,
          "selector": ".intro",
          "property": "color"
        },
        "style.115": {
          "label": "margin · .intro",
          "type": "select",
          "default": "0 0 25px",
          "advanced": true,
          "selector": ".intro",
          "property": "margin",
          "options": [
            {
              "value": "0 0 25px",
              "label": "기본 디자인"
            },
            {
              "value": "8px 0",
              "label": "대안 A"
            },
            {
              "value": "24px 12px",
              "label": "대안 B"
            }
          ]
        },
        "style.116": {
          "label": "gap · .hero-actions",
          "type": "number",
          "default": 10,
          "advanced": true,
          "selector": ".hero-actions",
          "property": "gap",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.117": {
          "label": "font-size · .button",
          "type": "number",
          "default": 10,
          "advanced": true,
          "selector": ".button",
          "property": "font-size",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.118": {
          "label": "min-height · .button",
          "type": "number",
          "default": 44,
          "advanced": true,
          "selector": ".button",
          "property": "min-height",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.119": {
          "label": "padding · .button",
          "type": "select",
          "default": "14px 17px",
          "advanced": true,
          "selector": ".button",
          "property": "padding",
          "options": [
            {
              "value": "14px 17px",
              "label": "기본 디자인"
            },
            {
              "value": "8px 12px",
              "label": "대안 A"
            },
            {
              "value": "20px 24px",
              "label": "대안 B"
            }
          ]
        },
        "style.120": {
          "label": "font-weight · .button",
          "type": "number",
          "default": 600,
          "advanced": true,
          "selector": ".button",
          "property": "font-weight",
          "min": 100,
          "max": 900,
          "step": 100,
          "unit": ""
        },
        "style.121": {
          "label": "letter-spacing · .button",
          "type": "number",
          "default": 0.02,
          "advanced": true,
          "selector": ".button",
          "property": "letter-spacing",
          "min": -0.2,
          "max": 0.5,
          "unit": "em",
          "step": 0.005
        },
        "style.122": {
          "label": "gap · .button",
          "type": "number",
          "default": 20,
          "advanced": true,
          "selector": ".button",
          "property": "gap",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.123": {
          "label": "transition · .button",
          "type": "select",
          "default": "background .2s,color .2s,transform .2s",
          "advanced": true,
          "selector": ".button",
          "property": "transition",
          "options": [
            {
              "value": "background .2s,color .2s,transform .2s",
              "label": "기본 디자인"
            },
            {
              "value": "none",
              "label": "대안 A"
            },
            {
              "value": "all .4s ease",
              "label": "대안 B"
            }
          ]
        },
        "style.124": {
          "label": "color · .button-dark:hover",
          "type": "color",
          "default": "#ffffff",
          "advanced": true,
          "selector": ".button-dark:hover",
          "property": "color"
        },
        "style.125": {
          "label": "transform · .button-dark:hover",
          "type": "select",
          "default": "translateY(-2px)",
          "advanced": true,
          "selector": ".button-dark:hover",
          "property": "transform",
          "options": [
            {
              "value": "translateY(-2px)",
              "label": "기본 디자인"
            },
            {
              "value": "translate(0,0) scale(1) rotate(0deg)",
              "label": "대안 A"
            },
            {
              "value": "translateY(-12px) scale(1.05)",
              "label": "대안 B"
            }
          ]
        },
        "style.126": {
          "label": "border · .button-outline",
          "type": "select",
          "default": "1px solid #aeb7ad",
          "advanced": true,
          "selector": ".button-outline",
          "property": "border",
          "options": [
            {
              "value": "1px solid #aeb7ad",
              "label": "기본 디자인"
            },
            {
              "value": "2px solid #202722",
              "label": "대안 A"
            },
            {
              "value": "1px dashed #777e77",
              "label": "대안 B"
            }
          ]
        },
        "style.127": {
          "label": "transform · .button-outline:hover",
          "type": "select",
          "default": "translateY(-2px)",
          "advanced": true,
          "selector": ".button-outline:hover",
          "property": "transform",
          "options": [
            {
              "value": "translateY(-2px)",
              "label": "기본 디자인"
            },
            {
              "value": "translate(0,0) scale(1) rotate(0deg)",
              "label": "대안 A"
            },
            {
              "value": "translateY(-12px) scale(1.05)",
              "label": "대안 B"
            }
          ]
        },
        "style.340": {
          "label": "opacity · button:disabled",
          "type": "number",
          "default": 0.65,
          "advanced": true,
          "selector": "button:disabled",
          "property": "opacity",
          "min": 0,
          "max": 1,
          "step": 0.01,
          "unit": ""
        },
        "style.365": {
          "label": "padding-top · .hero-copy",
          "type": "number",
          "default": 23,
          "advanced": true,
          "selector": ".hero-copy",
          "property": "padding-top",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "vh"
        },
        "style.366": {
          "label": "font-size · .intro",
          "type": "number",
          "default": 16,
          "advanced": true,
          "selector": ".intro",
          "property": "font-size",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.367": {
          "label": "font-size · .eyebrow",
          "type": "number",
          "default": 15,
          "advanced": true,
          "selector": ".eyebrow",
          "property": "font-size",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.368": {
          "label": "font-size · .button",
          "type": "number",
          "default": 12,
          "advanced": true,
          "selector": ".button",
          "property": "font-size",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.372": {
          "label": "height · .hero",
          "type": "select",
          "default": "calc(100svh - 182px)",
          "advanced": true,
          "selector": ".hero",
          "property": "height",
          "options": [
            {
              "value": "calc(100svh - 182px)",
              "label": "기본 디자인"
            },
            {
              "value": "80svh",
              "label": "대안 A"
            },
            {
              "value": "720px",
              "label": "대안 B"
            }
          ]
        },
        "style.373": {
          "label": "min-height · .hero",
          "type": "number",
          "default": 660,
          "advanced": true,
          "selector": ".hero",
          "property": "min-height",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.374": {
          "label": "width · .hero-copy",
          "type": "number",
          "default": 51,
          "advanced": true,
          "selector": ".hero-copy",
          "property": "width",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "%"
        },
        "style.375": {
          "label": "padding-top · .hero-copy",
          "type": "number",
          "default": 185,
          "advanced": true,
          "selector": ".hero-copy",
          "property": "padding-top",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.376": {
          "label": "font-size · h1",
          "type": "number",
          "default": 78,
          "advanced": true,
          "selector": "h1",
          "property": "font-size",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.388": {
          "label": "max-width · .intro",
          "type": "number",
          "default": 300,
          "advanced": true,
          "selector": ".intro",
          "property": "max-width",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.389": {
          "label": "max-width · .hero-actions",
          "type": "number",
          "default": 350,
          "advanced": true,
          "selector": ".hero-actions",
          "property": "max-width",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.401": {
          "label": "margin · .hero",
          "type": "select",
          "default": "0 6%",
          "advanced": true,
          "selector": ".hero",
          "property": "margin",
          "options": [
            {
              "value": "0 6%",
              "label": "기본 디자인"
            },
            {
              "value": "8px 0",
              "label": "대안 A"
            },
            {
              "value": "24px 12px",
              "label": "대안 B"
            }
          ]
        },
        "style.402": {
          "label": "min-height · .hero",
          "type": "number",
          "default": 850,
          "advanced": true,
          "selector": ".hero",
          "property": "min-height",
          "min": 0,
          "max": 2550,
          "step": 0.1,
          "unit": "px"
        },
        "style.427": {
          "label": "padding-top · .hero-copy",
          "type": "number",
          "default": 455,
          "advanced": true,
          "selector": ".hero-copy",
          "property": "padding-top",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.428": {
          "label": "width · .hero-copy",
          "type": "number",
          "default": 100,
          "advanced": true,
          "selector": ".hero-copy",
          "property": "width",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "%"
        },
        "style.429": {
          "label": "font-size · .eyebrow",
          "type": "number",
          "default": 11,
          "advanced": true,
          "selector": ".eyebrow",
          "property": "font-size",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.430": {
          "label": "margin-bottom · .eyebrow",
          "type": "number",
          "default": 16,
          "advanced": true,
          "selector": ".eyebrow",
          "property": "margin-bottom",
          "min": -600,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.431": {
          "label": "font-size · h1",
          "type": "select",
          "default": "clamp(67px,18vw,99px)",
          "advanced": true,
          "selector": "h1",
          "property": "font-size",
          "options": [
            {
              "value": "clamp(67px,18vw,99px)",
              "label": "기본 디자인"
            },
            {
              "value": "clamp(54px,14vw,79px)",
              "label": "대안 A"
            },
            {
              "value": "clamp(80px,22vw,119px)",
              "label": "대안 B"
            }
          ]
        },
        "style.432": {
          "label": "margin-bottom · h1",
          "type": "number",
          "default": 20,
          "advanced": true,
          "selector": "h1",
          "property": "margin-bottom",
          "min": -600,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.433": {
          "label": "font-size · .intro",
          "type": "number",
          "default": 13,
          "advanced": true,
          "selector": ".intro",
          "property": "font-size",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.434": {
          "label": "line-height · .intro",
          "type": "number",
          "default": 1.75,
          "advanced": true,
          "selector": ".intro",
          "property": "line-height",
          "min": 0.1,
          "max": 5,
          "step": 0.05,
          "unit": ""
        },
        "style.435": {
          "label": "max-width · .intro",
          "type": "number",
          "default": 100,
          "advanced": true,
          "selector": ".intro",
          "property": "max-width",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "%"
        },
        "style.436": {
          "label": "margin-bottom · .intro",
          "type": "number",
          "default": 22,
          "advanced": true,
          "selector": ".intro",
          "property": "margin-bottom",
          "min": -600,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.437": {
          "label": "gap · .hero-actions",
          "type": "number",
          "default": 8,
          "advanced": true,
          "selector": ".hero-actions",
          "property": "gap",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.438": {
          "label": "font-size · .button",
          "type": "number",
          "default": 9,
          "advanced": true,
          "selector": ".button",
          "property": "font-size",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.439": {
          "label": "padding · .button",
          "type": "number",
          "default": 13,
          "advanced": true,
          "selector": ".button",
          "property": "padding",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.440": {
          "label": "gap · .button",
          "type": "number",
          "default": 13,
          "advanced": true,
          "selector": ".button",
          "property": "gap",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "opacity": {
          "label": "불투명도",
          "type": "number",
          "default": 1,
          "min": 0,
          "max": 1,
          "unit": "",
          "step": 0.01
        }
      }
    },
    {
      "id": "stamp",
      "label": "재생 도장",
      "group": "문구·버튼",
      "el": ".play-stamp",
      "params": {
        "visible": {
          "label": "보이기",
          "type": "boolean",
          "default": true,
          "on": "visible",
          "off": "hidden"
        },
        "offset.x": {
          "label": "좌우 이동",
          "type": "number",
          "default": 0,
          "min": -600,
          "max": 600,
          "step": 0.1,
          "unit": "px"
        },
        "offset.y": {
          "label": "상하 이동",
          "type": "number",
          "default": 0,
          "min": -600,
          "max": 600,
          "step": 0.1,
          "unit": "px"
        },
        "scale": {
          "label": "크기 배율",
          "type": "number",
          "default": 1,
          "min": 0.2,
          "max": 3,
          "step": 0.01,
          "unit": ""
        },
        "rotation": {
          "label": "회전",
          "type": "number",
          "default": 0,
          "min": -180,
          "max": 180,
          "step": 1,
          "unit": "deg"
        },
        "style.171": {
          "label": "right · .play-stamp",
          "type": "number",
          "default": 9,
          "advanced": true,
          "selector": ".play-stamp",
          "property": "right",
          "min": -600,
          "max": 2400,
          "step": 0.1,
          "unit": "%"
        },
        "style.172": {
          "label": "top · .play-stamp",
          "type": "number",
          "default": 14,
          "advanced": true,
          "selector": ".play-stamp",
          "property": "top",
          "min": -600,
          "max": 2400,
          "step": 0.1,
          "unit": "%"
        },
        "style.173": {
          "label": "z-index · .play-stamp",
          "type": "number",
          "default": 2,
          "advanced": true,
          "selector": ".play-stamp",
          "property": "z-index",
          "min": 0,
          "max": 20,
          "step": 1,
          "unit": ""
        },
        "style.174": {
          "label": "border-radius · .play-stamp",
          "type": "number",
          "default": 50,
          "advanced": true,
          "selector": ".play-stamp",
          "property": "border-radius",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "%"
        },
        "style.175": {
          "label": "width · .play-stamp",
          "type": "number",
          "default": 100,
          "advanced": true,
          "selector": ".play-stamp",
          "property": "width",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.176": {
          "label": "height · .play-stamp",
          "type": "number",
          "default": 100,
          "advanced": true,
          "selector": ".play-stamp",
          "property": "height",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.177": {
          "label": "gap · .play-stamp",
          "type": "number",
          "default": 3,
          "advanced": true,
          "selector": ".play-stamp",
          "property": "gap",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.178": {
          "label": "transform · .play-stamp",
          "type": "select",
          "default": "rotate(13deg)",
          "advanced": true,
          "selector": ".play-stamp",
          "property": "transform",
          "options": [
            {
              "value": "rotate(13deg)",
              "label": "기본 디자인"
            },
            {
              "value": "translate(0,0) scale(1) rotate(0deg)",
              "label": "대안 A"
            },
            {
              "value": "translateY(-12px) scale(1.05)",
              "label": "대안 B"
            }
          ]
        },
        "style.179": {
          "label": "transition · .play-stamp",
          "type": "select",
          "default": "transform .3s,background .3s",
          "advanced": true,
          "selector": ".play-stamp",
          "property": "transition",
          "options": [
            {
              "value": "transform .3s,background .3s",
              "label": "기본 디자인"
            },
            {
              "value": "none",
              "label": "대안 A"
            },
            {
              "value": "all .4s ease",
              "label": "대안 B"
            }
          ]
        },
        "style.180": {
          "label": "font-size · .play-stamp span",
          "type": "number",
          "default": 9,
          "advanced": true,
          "selector": ".play-stamp span",
          "property": "font-size",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.181": {
          "label": "letter-spacing · .play-stamp span",
          "type": "number",
          "default": 0.08,
          "advanced": true,
          "selector": ".play-stamp span",
          "property": "letter-spacing",
          "min": -0.2,
          "max": 0.5,
          "unit": "em",
          "step": 0.005
        },
        "style.182": {
          "label": "font-weight · .play-stamp span",
          "type": "number",
          "default": 600,
          "advanced": true,
          "selector": ".play-stamp span",
          "property": "font-weight",
          "min": 100,
          "max": 900,
          "step": 100,
          "unit": ""
        },
        "style.183": {
          "label": "font-size · .play-stamp b",
          "type": "number",
          "default": 38,
          "advanced": true,
          "selector": ".play-stamp b",
          "property": "font-size",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.184": {
          "label": "line-height · .play-stamp b",
          "type": "number",
          "default": 1,
          "advanced": true,
          "selector": ".play-stamp b",
          "property": "line-height",
          "min": 0.1,
          "max": 5,
          "step": 0.05,
          "unit": ""
        },
        "style.185": {
          "label": "font-weight · .play-stamp b",
          "type": "number",
          "default": 400,
          "advanced": true,
          "selector": ".play-stamp b",
          "property": "font-weight",
          "min": 100,
          "max": 900,
          "step": 100,
          "unit": ""
        },
        "style.186": {
          "label": "transform · .play-stamp:hover",
          "type": "select",
          "default": "rotate(0) scale(1.07)",
          "advanced": true,
          "selector": ".play-stamp:hover",
          "property": "transform",
          "options": [
            {
              "value": "rotate(0) scale(1.07)",
              "label": "기본 디자인"
            },
            {
              "value": "translate(0,0) scale(1) rotate(0deg)",
              "label": "대안 A"
            },
            {
              "value": "translateY(-12px) scale(1.05)",
              "label": "대안 B"
            }
          ]
        },
        "style.341": {
          "label": "transform · .play-stamp:disabled:hover",
          "type": "select",
          "default": "rotate(13deg)",
          "advanced": true,
          "selector": ".play-stamp:disabled:hover",
          "property": "transform",
          "options": [
            {
              "value": "rotate(13deg)",
              "label": "기본 디자인"
            },
            {
              "value": "translate(0,0) scale(1) rotate(0deg)",
              "label": "대안 A"
            },
            {
              "value": "translateY(-12px) scale(1.05)",
              "label": "대안 B"
            }
          ]
        },
        "style.381": {
          "label": "right · .play-stamp",
          "type": "number",
          "default": 6,
          "advanced": true,
          "selector": ".play-stamp",
          "property": "right",
          "min": -600,
          "max": 2400,
          "step": 0.1,
          "unit": "%"
        },
        "style.382": {
          "label": "top · .play-stamp",
          "type": "number",
          "default": 9,
          "advanced": true,
          "selector": ".play-stamp",
          "property": "top",
          "min": -600,
          "max": 2400,
          "step": 0.1,
          "unit": "%"
        },
        "style.383": {
          "label": "width · .play-stamp",
          "type": "number",
          "default": 85,
          "advanced": true,
          "selector": ".play-stamp",
          "property": "width",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.384": {
          "label": "height · .play-stamp",
          "type": "number",
          "default": 85,
          "advanced": true,
          "selector": ".play-stamp",
          "property": "height",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.385": {
          "label": "font-size · .play-stamp span",
          "type": "number",
          "default": 8,
          "advanced": true,
          "selector": ".play-stamp span",
          "property": "font-size",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.421": {
          "label": "width · .play-stamp",
          "type": "number",
          "default": 75,
          "advanced": true,
          "selector": ".play-stamp",
          "property": "width",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.422": {
          "label": "height · .play-stamp",
          "type": "number",
          "default": 75,
          "advanced": true,
          "selector": ".play-stamp",
          "property": "height",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.423": {
          "label": "right · .play-stamp",
          "type": "number",
          "default": 0,
          "advanced": true,
          "selector": ".play-stamp",
          "property": "right",
          "min": -600,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.424": {
          "label": "top · .play-stamp",
          "type": "number",
          "default": 32,
          "advanced": true,
          "selector": ".play-stamp",
          "property": "top",
          "min": -600,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.425": {
          "label": "font-size · .play-stamp span",
          "type": "number",
          "default": 7,
          "advanced": true,
          "selector": ".play-stamp span",
          "property": "font-size",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.426": {
          "label": "font-size · .play-stamp b",
          "type": "number",
          "default": 29,
          "advanced": true,
          "selector": ".play-stamp b",
          "property": "font-size",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "opacity": {
          "label": "불투명도",
          "type": "number",
          "default": 1,
          "min": 0,
          "max": 1,
          "step": 0.01,
          "unit": ""
        }
      }
    },
    {
      "id": "disciplines",
      "label": "분야 선택",
      "group": "문구·버튼",
      "el": ".disciplines",
      "params": {
        "visible": {
          "label": "보이기",
          "type": "boolean",
          "default": true,
          "on": "visible",
          "off": "hidden"
        },
        "offset.x": {
          "label": "좌우 이동",
          "type": "number",
          "default": 0,
          "min": -600,
          "max": 600,
          "step": 0.1,
          "unit": "px"
        },
        "offset.y": {
          "label": "상하 이동",
          "type": "number",
          "default": 0,
          "min": -600,
          "max": 600,
          "step": 0.1,
          "unit": "px"
        },
        "scale": {
          "label": "크기 배율",
          "type": "number",
          "default": 1,
          "min": 0.2,
          "max": 3,
          "step": 0.01,
          "unit": ""
        },
        "rotation": {
          "label": "회전",
          "type": "number",
          "default": 0,
          "min": -180,
          "max": 180,
          "step": 1,
          "unit": "deg"
        },
        "style.187": {
          "label": "z-index · .disciplines",
          "type": "number",
          "default": 2,
          "advanced": true,
          "selector": ".disciplines",
          "property": "z-index",
          "min": 0,
          "max": 20,
          "step": 1,
          "unit": ""
        },
        "style.188": {
          "label": "right · .disciplines",
          "type": "number",
          "default": 0,
          "advanced": true,
          "selector": ".disciplines",
          "property": "right",
          "min": -600,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.189": {
          "label": "bottom · .disciplines",
          "type": "number",
          "default": 18,
          "advanced": true,
          "selector": ".disciplines",
          "property": "bottom",
          "min": -600,
          "max": 2400,
          "step": 0.1,
          "unit": "%"
        },
        "style.190": {
          "label": "gap · .disciplines",
          "type": "number",
          "default": 13,
          "advanced": true,
          "selector": ".disciplines",
          "property": "gap",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.191": {
          "label": "font-size · .side-label,.side-foot",
          "type": "number",
          "default": 9,
          "advanced": true,
          "selector": ".side-label,.side-foot",
          "property": "font-size",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.192": {
          "label": "letter-spacing · .side-label,.side-foot",
          "type": "number",
          "default": 0.12,
          "advanced": true,
          "selector": ".side-label,.side-foot",
          "property": "letter-spacing",
          "min": -0.2,
          "max": 0.5,
          "unit": "em",
          "step": 0.005
        },
        "style.193": {
          "label": "margin-bottom · .side-label",
          "type": "number",
          "default": 7,
          "advanced": true,
          "selector": ".side-label",
          "property": "margin-bottom",
          "min": -600,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.194": {
          "label": "font-size · .side-foot",
          "type": "number",
          "default": 8,
          "advanced": true,
          "selector": ".side-foot",
          "property": "font-size",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.195": {
          "label": "margin-top · .side-foot",
          "type": "number",
          "default": 7,
          "advanced": true,
          "selector": ".side-foot",
          "property": "margin-top",
          "min": -600,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.196": {
          "label": "font-size · .disciplines button",
          "type": "number",
          "default": 11,
          "advanced": true,
          "selector": ".disciplines button",
          "property": "font-size",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.197": {
          "label": "color · .disciplines button",
          "type": "color",
          "default": "#899085",
          "advanced": true,
          "selector": ".disciplines button",
          "property": "color"
        },
        "style.198": {
          "label": "padding · .disciplines button",
          "type": "select",
          "default": "5px 0",
          "advanced": true,
          "selector": ".disciplines button",
          "property": "padding",
          "options": [
            {
              "value": "5px 0",
              "label": "기본 디자인"
            },
            {
              "value": "8px 12px",
              "label": "대안 A"
            },
            {
              "value": "20px 24px",
              "label": "대안 B"
            }
          ]
        },
        "style.199": {
          "label": "gap · .disciplines button",
          "type": "number",
          "default": 12,
          "advanced": true,
          "selector": ".disciplines button",
          "property": "gap",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.200": {
          "label": "font-size · .disciplines button span",
          "type": "number",
          "default": 9,
          "advanced": true,
          "selector": ".disciplines button span",
          "property": "font-size",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.201": {
          "label": "width · .disciplines button.active::before",
          "type": "number",
          "default": 5,
          "advanced": true,
          "selector": ".disciplines button.active::before",
          "property": "width",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.202": {
          "label": "height · .disciplines button.active::before",
          "type": "number",
          "default": 5,
          "advanced": true,
          "selector": ".disciplines button.active::before",
          "property": "height",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.203": {
          "label": "border-radius · .disciplines button.active::before",
          "type": "number",
          "default": 50,
          "advanced": true,
          "selector": ".disciplines button.active::before",
          "property": "border-radius",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "%"
        },
        "style.369": {
          "label": "font-size · .disciplines button",
          "type": "number",
          "default": 14,
          "advanced": true,
          "selector": ".disciplines button",
          "property": "font-size",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.386": {
          "label": "bottom · .disciplines",
          "type": "number",
          "default": 15,
          "advanced": true,
          "selector": ".disciplines",
          "property": "bottom",
          "min": -600,
          "max": 2400,
          "step": 0.1,
          "unit": "%"
        },
        "style.441": {
          "label": "right · .disciplines",
          "type": "number",
          "default": 0,
          "advanced": true,
          "selector": ".disciplines",
          "property": "right",
          "min": -600,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.442": {
          "label": "left · .disciplines",
          "type": "number",
          "default": 0,
          "advanced": true,
          "selector": ".disciplines",
          "property": "left",
          "min": -600,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.443": {
          "label": "top · .disciplines",
          "type": "number",
          "default": 405,
          "advanced": true,
          "selector": ".disciplines",
          "property": "top",
          "min": -600,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.444": {
          "label": "gap · .disciplines",
          "type": "number",
          "default": 8,
          "advanced": true,
          "selector": ".disciplines",
          "property": "gap",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.445": {
          "label": "font-size · .disciplines button",
          "type": "number",
          "default": 9,
          "advanced": true,
          "selector": ".disciplines button",
          "property": "font-size",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.446": {
          "label": "gap · .disciplines button",
          "type": "number",
          "default": 5,
          "advanced": true,
          "selector": ".disciplines button",
          "property": "gap",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.447": {
          "label": "padding · .disciplines button",
          "type": "select",
          "default": "4px 0",
          "advanced": true,
          "selector": ".disciplines button",
          "property": "padding",
          "options": [
            {
              "value": "4px 0",
              "label": "기본 디자인"
            },
            {
              "value": "8px 12px",
              "label": "대안 A"
            },
            {
              "value": "20px 24px",
              "label": "대안 B"
            }
          ]
        },
        "style.448": {
          "label": "min-height · .disciplines button",
          "type": "number",
          "default": 44,
          "advanced": true,
          "selector": ".disciplines button",
          "property": "min-height",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.449": {
          "label": "font-size · .disciplines button span",
          "type": "number",
          "default": 8,
          "advanced": true,
          "selector": ".disciplines button span",
          "property": "font-size",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "opacity": {
          "label": "불투명도",
          "type": "number",
          "default": 1,
          "min": 0,
          "max": 1,
          "step": 0.01,
          "unit": ""
        }
      }
    },
    {
      "id": "bottom",
      "label": "하단 안내",
      "group": "문구·버튼",
      "el": ".hero-bottom",
      "params": {
        "visible": {
          "label": "보이기",
          "type": "boolean",
          "default": true,
          "on": "visible",
          "off": "hidden"
        },
        "offset.x": {
          "label": "좌우 이동",
          "type": "number",
          "default": 0,
          "min": -600,
          "max": 600,
          "step": 0.1,
          "unit": "px"
        },
        "offset.y": {
          "label": "상하 이동",
          "type": "number",
          "default": 0,
          "min": -600,
          "max": 600,
          "step": 0.1,
          "unit": "px"
        },
        "scale": {
          "label": "크기 배율",
          "type": "number",
          "default": 1,
          "min": 0.2,
          "max": 3,
          "step": 0.01,
          "unit": ""
        },
        "rotation": {
          "label": "회전",
          "type": "number",
          "default": 0,
          "min": -180,
          "max": 180,
          "step": 1,
          "unit": "deg"
        },
        "style.204": {
          "label": "bottom · .hero-bottom",
          "type": "number",
          "default": 25,
          "advanced": true,
          "selector": ".hero-bottom",
          "property": "bottom",
          "min": -600,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.205": {
          "label": "left · .hero-bottom",
          "type": "number",
          "default": 0,
          "advanced": true,
          "selector": ".hero-bottom",
          "property": "left",
          "min": -600,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.206": {
          "label": "right · .hero-bottom",
          "type": "number",
          "default": 0,
          "advanced": true,
          "selector": ".hero-bottom",
          "property": "right",
          "min": -600,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.207": {
          "label": "z-index · .hero-bottom",
          "type": "number",
          "default": 2,
          "advanced": true,
          "selector": ".hero-bottom",
          "property": "z-index",
          "min": 0,
          "max": 20,
          "step": 1,
          "unit": ""
        },
        "style.208": {
          "label": "font-size · .interaction-hint",
          "type": "number",
          "default": 9,
          "advanced": true,
          "selector": ".interaction-hint",
          "property": "font-size",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.209": {
          "label": "letter-spacing · .interaction-hint",
          "type": "number",
          "default": 0.11,
          "advanced": true,
          "selector": ".interaction-hint",
          "property": "letter-spacing",
          "min": -0.2,
          "max": 0.5,
          "unit": "em",
          "step": 0.005
        },
        "style.210": {
          "label": "gap · .interaction-hint",
          "type": "number",
          "default": 12,
          "advanced": true,
          "selector": ".interaction-hint",
          "property": "gap",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.211": {
          "label": "margin-left · .interaction-hint",
          "type": "number",
          "default": 5,
          "advanced": true,
          "selector": ".interaction-hint",
          "property": "margin-left",
          "min": -600,
          "max": 2400,
          "step": 0.1,
          "unit": "%"
        },
        "style.212": {
          "label": "width · .hint-line",
          "type": "number",
          "default": 36,
          "advanced": true,
          "selector": ".hint-line",
          "property": "width",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.213": {
          "label": "height · .hint-line",
          "type": "number",
          "default": 1,
          "advanced": true,
          "selector": ".hint-line",
          "property": "height",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.214": {
          "label": "background · .hint-line",
          "type": "color",
          "default": "#a8afa5",
          "advanced": true,
          "selector": ".hint-line",
          "property": "background"
        },
        "style.215": {
          "label": "gap · .motion-toggle",
          "type": "number",
          "default": 9,
          "advanced": true,
          "selector": ".motion-toggle",
          "property": "gap",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.216": {
          "label": "font-size · .motion-toggle",
          "type": "number",
          "default": 9,
          "advanced": true,
          "selector": ".motion-toggle",
          "property": "font-size",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.217": {
          "label": "letter-spacing · .motion-toggle",
          "type": "number",
          "default": 0.04,
          "advanced": true,
          "selector": ".motion-toggle",
          "property": "letter-spacing",
          "min": -0.2,
          "max": 0.5,
          "unit": "em",
          "step": 0.005
        },
        "style.218": {
          "label": "padding · .motion-toggle",
          "type": "select",
          "default": "12px 0 12px 12px",
          "advanced": true,
          "selector": ".motion-toggle",
          "property": "padding",
          "options": [
            {
              "value": "12px 0 12px 12px",
              "label": "기본 디자인"
            },
            {
              "value": "8px 12px",
              "label": "대안 A"
            },
            {
              "value": "20px 24px",
              "label": "대안 B"
            }
          ]
        },
        "style.219": {
          "label": "font-size · .motion-icon",
          "type": "number",
          "default": 12,
          "advanced": true,
          "selector": ".motion-icon",
          "property": "font-size",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.220": {
          "label": "border · .motion-icon",
          "type": "select",
          "default": "1px solid #aeb7ad",
          "advanced": true,
          "selector": ".motion-icon",
          "property": "border",
          "options": [
            {
              "value": "1px solid #aeb7ad",
              "label": "기본 디자인"
            },
            {
              "value": "2px solid #202722",
              "label": "대안 A"
            },
            {
              "value": "1px dashed #777e77",
              "label": "대안 B"
            }
          ]
        },
        "style.221": {
          "label": "width · .motion-icon",
          "type": "number",
          "default": 23,
          "advanced": true,
          "selector": ".motion-icon",
          "property": "width",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.222": {
          "label": "height · .motion-icon",
          "type": "number",
          "default": 23,
          "advanced": true,
          "selector": ".motion-icon",
          "property": "height",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.223": {
          "label": "border-radius · .motion-icon",
          "type": "number",
          "default": 50,
          "advanced": true,
          "selector": ".motion-icon",
          "property": "border-radius",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "%"
        },
        "style.387": {
          "label": "font-size · .interaction-hint",
          "type": "number",
          "default": 8,
          "advanced": true,
          "selector": ".interaction-hint",
          "property": "font-size",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.450": {
          "label": "margin-top · .hero-bottom",
          "type": "number",
          "default": 32,
          "advanced": true,
          "selector": ".hero-bottom",
          "property": "margin-top",
          "min": -600,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.451": {
          "label": "margin-bottom · .hero-bottom",
          "type": "number",
          "default": 22,
          "advanced": true,
          "selector": ".hero-bottom",
          "property": "margin-bottom",
          "min": -600,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.453": {
          "label": "font-size · .motion-toggle",
          "type": "number",
          "default": 8,
          "advanced": true,
          "selector": ".motion-toggle",
          "property": "font-size",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "opacity": {
          "label": "불투명도",
          "type": "number",
          "default": 1,
          "min": 0,
          "max": 1,
          "step": 0.01,
          "unit": ""
        }
      }
    },
    {
      "id": "ticker",
      "label": "흐르는 띠",
      "group": "문구·버튼",
      "el": ".ticker",
      "params": {
        "visible": {
          "label": "보이기",
          "type": "boolean",
          "default": true,
          "on": "visible",
          "off": "hidden"
        },
        "offset.x": {
          "label": "좌우 이동",
          "type": "number",
          "default": 0,
          "min": -600,
          "max": 600,
          "step": 0.1,
          "unit": "px"
        },
        "offset.y": {
          "label": "상하 이동",
          "type": "number",
          "default": 0,
          "min": -600,
          "max": 600,
          "step": 0.1,
          "unit": "px"
        },
        "scale": {
          "label": "크기 배율",
          "type": "number",
          "default": 1,
          "min": 0.2,
          "max": 3,
          "step": 0.01,
          "unit": ""
        },
        "rotation": {
          "label": "회전",
          "type": "number",
          "default": 0,
          "min": -180,
          "max": 180,
          "step": 1,
          "unit": "deg"
        },
        "style.224": {
          "label": "height · .ticker",
          "type": "number",
          "default": 47,
          "advanced": true,
          "selector": ".ticker",
          "property": "height",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.225": {
          "label": "z-index · .ticker",
          "type": "number",
          "default": 3,
          "advanced": true,
          "selector": ".ticker",
          "property": "z-index",
          "min": 0,
          "max": 20,
          "step": 1,
          "unit": ""
        },
        "style.226": {
          "label": "width · .ticker-track",
          "type": "select",
          "default": "max-content",
          "advanced": true,
          "selector": ".ticker-track",
          "property": "width",
          "options": [
            {
              "value": "max-content",
              "label": "기본 디자인"
            },
            {
              "value": "90%",
              "label": "대안 A"
            },
            {
              "value": "600px",
              "label": "대안 B"
            }
          ]
        },
        "style.228": {
          "label": "font-family · .ticker-track>span",
          "type": "select",
          "default": "'Barlow Condensed',sans-serif",
          "advanced": true,
          "selector": ".ticker-track>span",
          "property": "font-family",
          "options": [
            {
              "value": "'Barlow Condensed',sans-serif",
              "label": "기본 디자인"
            },
            {
              "value": "system-ui,sans-serif",
              "label": "대안 A"
            },
            {
              "value": "Georgia,serif",
              "label": "대안 B"
            }
          ]
        },
        "style.229": {
          "label": "font-weight · .ticker-track>span",
          "type": "number",
          "default": 500,
          "advanced": true,
          "selector": ".ticker-track>span",
          "property": "font-weight",
          "min": 100,
          "max": 900,
          "step": 100,
          "unit": ""
        },
        "style.230": {
          "label": "font-size · .ticker-track>span",
          "type": "number",
          "default": 22,
          "advanced": true,
          "selector": ".ticker-track>span",
          "property": "font-size",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.231": {
          "label": "letter-spacing · .ticker-track>span",
          "type": "number",
          "default": 0.025,
          "advanced": true,
          "selector": ".ticker-track>span",
          "property": "letter-spacing",
          "min": -0.2,
          "max": 0.5,
          "unit": "em",
          "step": 0.005
        },
        "style.232": {
          "label": "font-style · .ticker i",
          "type": "select",
          "default": "normal",
          "advanced": true,
          "selector": ".ticker i",
          "property": "font-style",
          "options": [
            {
              "value": "normal",
              "label": "기본 디자인"
            },
            {
              "value": "italic",
              "label": "대안 A"
            }
          ]
        },
        "style.233": {
          "label": "font-size · .ticker i",
          "type": "number",
          "default": 21,
          "advanced": true,
          "selector": ".ticker i",
          "property": "font-size",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.234": {
          "label": "margin · .ticker i",
          "type": "select",
          "default": "0 27px",
          "advanced": true,
          "selector": ".ticker i",
          "property": "margin",
          "options": [
            {
              "value": "0 27px",
              "label": "기본 디자인"
            },
            {
              "value": "8px 0",
              "label": "대안 A"
            },
            {
              "value": "24px 12px",
              "label": "대안 B"
            }
          ]
        },
        "style.235": {
          "label": "font-style · .ticker em",
          "type": "select",
          "default": "normal",
          "advanced": true,
          "selector": ".ticker em",
          "property": "font-style",
          "options": [
            {
              "value": "normal",
              "label": "기본 디자인"
            },
            {
              "value": "italic",
              "label": "대안 A"
            }
          ]
        },
        "style.236": {
          "label": "color · .ticker em",
          "type": "color",
          "default": "#e27369",
          "advanced": true,
          "selector": ".ticker em",
          "property": "color"
        },
        "style.360": {
          "label": "transform · to",
          "type": "select",
          "default": "translateX(-50%)",
          "advanced": true,
          "selector": "to",
          "property": "transform",
          "options": [
            {
              "value": "translateX(-50%)",
              "label": "기본 디자인"
            },
            {
              "value": "translate(0,0) scale(1) rotate(0deg)",
              "label": "대안 A"
            },
            {
              "value": "translateY(-12px) scale(1.05)",
              "label": "대안 B"
            }
          ]
        },
        "style.454": {
          "label": "height · .ticker",
          "type": "number",
          "default": 42,
          "advanced": true,
          "selector": ".ticker",
          "property": "height",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.455": {
          "label": "font-size · .ticker-track>span",
          "type": "number",
          "default": 20,
          "advanced": true,
          "selector": ".ticker-track>span",
          "property": "font-size",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.456": {
          "label": "margin · .ticker i",
          "type": "select",
          "default": "0 18px",
          "advanced": true,
          "selector": ".ticker i",
          "property": "margin",
          "options": [
            {
              "value": "0 18px",
              "label": "기본 디자인"
            },
            {
              "value": "8px 0",
              "label": "대안 A"
            },
            {
              "value": "24px 12px",
              "label": "대안 B"
            }
          ]
        },
        "opacity": {
          "label": "불투명도",
          "type": "number",
          "default": 1,
          "min": 0,
          "max": 1,
          "step": 0.01,
          "unit": ""
        },
        "motion.ticker.ms": {
          "label": "띠 이동 주기",
          "type": "number",
          "default": 38000,
          "min": 100,
          "max": 60000,
          "step": 100,
          "unit": "ms",
          "motion": true
        },
        "motion.ticker.delay": {
          "label": "ticker · 시작 지연",
          "type": "number",
          "default": 0,
          "min": 0,
          "max": 5000,
          "unit": "ms",
          "step": 10
        },
        "motion.ticker.ease": {
          "label": "ticker · 속도 변화",
          "type": "select",
          "default": "linear",
          "options": [
            {
              "value": "linear",
              "label": "일정한 속도"
            },
            {
              "value": "ease-in-out",
              "label": "부드럽게 시작·끝"
            },
            {
              "value": "ease-out",
              "label": "부드럽게 끝"
            }
          ]
        }
      }
    },
    {
      "id": "footer",
      "label": "바닥글",
      "group": "문구·버튼",
      "el": ".footer",
      "params": {
        "visible": {
          "label": "보이기",
          "type": "boolean",
          "default": true,
          "on": "visible",
          "off": "hidden"
        },
        "offset.x": {
          "label": "좌우 이동",
          "type": "number",
          "default": 0,
          "min": -600,
          "max": 600,
          "step": 0.1,
          "unit": "px"
        },
        "offset.y": {
          "label": "상하 이동",
          "type": "number",
          "default": 0,
          "min": -600,
          "max": 600,
          "step": 0.1,
          "unit": "px"
        },
        "scale": {
          "label": "크기 배율",
          "type": "number",
          "default": 1,
          "min": 0.2,
          "max": 3,
          "step": 0.01,
          "unit": ""
        },
        "rotation": {
          "label": "회전",
          "type": "number",
          "default": 0,
          "min": -180,
          "max": 180,
          "step": 1,
          "unit": "deg"
        },
        "motto": {
          "label": "바닥글",
          "type": "text",
          "default": "GOOD DESIGN HAS A PERSONALITY.",
          "text": ".footer>span:first-child"
        },
        "style.237": {
          "label": "min-height · .footer",
          "type": "number",
          "default": 51,
          "advanced": true,
          "selector": ".footer",
          "property": "min-height",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.238": {
          "label": "gap · .footer",
          "type": "number",
          "default": 15,
          "advanced": true,
          "selector": ".footer",
          "property": "gap",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.239": {
          "label": "padding · .footer",
          "type": "select",
          "default": "13px 5.1%",
          "advanced": true,
          "selector": ".footer",
          "property": "padding",
          "options": [
            {
              "value": "13px 5.1%",
              "label": "기본 디자인"
            },
            {
              "value": "8px 12px",
              "label": "대안 A"
            },
            {
              "value": "20px 24px",
              "label": "대안 B"
            }
          ]
        },
        "style.240": {
          "label": "font-size · .footer",
          "type": "number",
          "default": 9,
          "advanced": true,
          "selector": ".footer",
          "property": "font-size",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.241": {
          "label": "letter-spacing · .footer",
          "type": "number",
          "default": 0.08,
          "advanced": true,
          "selector": ".footer",
          "property": "letter-spacing",
          "min": -0.2,
          "max": 0.5,
          "unit": "em",
          "step": 0.005
        },
        "style.242": {
          "label": "gap · .footer>span:nth-child(2)",
          "type": "number",
          "default": 12,
          "advanced": true,
          "selector": ".footer>span:nth-child(2)",
          "property": "gap",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.243": {
          "label": "font-size · .footer-star",
          "type": "number",
          "default": 22,
          "advanced": true,
          "selector": ".footer-star",
          "property": "font-size",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.244": {
          "label": "font-size · .footer button",
          "type": "number",
          "default": 10,
          "advanced": true,
          "selector": ".footer button",
          "property": "font-size",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.245": {
          "label": "padding · .footer button",
          "type": "select",
          "default": "5px 0",
          "advanced": true,
          "selector": ".footer button",
          "property": "padding",
          "options": [
            {
              "value": "5px 0",
              "label": "기본 디자인"
            },
            {
              "value": "8px 12px",
              "label": "대안 A"
            },
            {
              "value": "20px 24px",
              "label": "대안 B"
            }
          ]
        },
        "style.246": {
          "label": "margin-left · .footer button span",
          "type": "number",
          "default": 20,
          "advanced": true,
          "selector": ".footer button span",
          "property": "margin-left",
          "min": -600,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.457": {
          "label": "padding · .footer",
          "type": "select",
          "default": "13px 6%",
          "advanced": true,
          "selector": ".footer",
          "property": "padding",
          "options": [
            {
              "value": "13px 6%",
              "label": "기본 디자인"
            },
            {
              "value": "8px 12px",
              "label": "대안 A"
            },
            {
              "value": "20px 24px",
              "label": "대안 B"
            }
          ]
        },
        "style.458": {
          "label": "font-size · .footer",
          "type": "number",
          "default": 8,
          "advanced": true,
          "selector": ".footer",
          "property": "font-size",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.459": {
          "label": "gap · .footer",
          "type": "number",
          "default": 8,
          "advanced": true,
          "selector": ".footer",
          "property": "gap",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.460": {
          "label": "font-size · .footer button",
          "type": "number",
          "default": 9,
          "advanced": true,
          "selector": ".footer button",
          "property": "font-size",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "opacity": {
          "label": "불투명도",
          "type": "number",
          "default": 1,
          "min": 0,
          "max": 1,
          "step": 0.01,
          "unit": ""
        }
      }
    },
    {
      "id": "sheet",
      "label": "패널 공통",
      "group": "패널",
      "el": ".sheet",
      "params": {
        "visible": {
          "label": "보이기",
          "type": "boolean",
          "default": true,
          "on": "visible",
          "off": "hidden"
        },
        "offset.x": {
          "label": "좌우 이동",
          "type": "number",
          "default": 0,
          "min": -600,
          "max": 600,
          "step": 0.1,
          "unit": "px"
        },
        "offset.y": {
          "label": "상하 이동",
          "type": "number",
          "default": 0,
          "min": -600,
          "max": 600,
          "step": 0.1,
          "unit": "px"
        },
        "scale": {
          "label": "크기 배율",
          "type": "number",
          "default": 1,
          "min": 0.2,
          "max": 3,
          "step": 0.01,
          "unit": ""
        },
        "rotation": {
          "label": "회전",
          "type": "number",
          "default": 0,
          "min": -180,
          "max": 180,
          "step": 1,
          "unit": "deg"
        },
        "style.247": {
          "label": "padding · .sheet",
          "type": "select",
          "default": "32px 40px 40px",
          "advanced": true,
          "selector": ".sheet",
          "property": "padding",
          "options": [
            {
              "value": "32px 40px 40px",
              "label": "기본 디자인"
            },
            {
              "value": "8px 12px",
              "label": "대안 A"
            },
            {
              "value": "20px 24px",
              "label": "대안 B"
            }
          ]
        },
        "style.248": {
          "label": "width · .sheet",
          "type": "select",
          "default": "min(1080px,calc(100% - 40px))",
          "advanced": true,
          "selector": ".sheet",
          "property": "width",
          "options": [
            {
              "value": "min(1080px,calc(100% - 40px))",
              "label": "기본 디자인"
            },
            {
              "value": "90%",
              "label": "대안 A"
            },
            {
              "value": "600px",
              "label": "대안 B"
            }
          ]
        },
        "style.249": {
          "label": "max-height · .sheet",
          "type": "select",
          "default": "calc(100svh - 40px)",
          "advanced": true,
          "selector": ".sheet",
          "property": "max-height",
          "options": [
            {
              "value": "calc(100svh - 40px)",
              "label": "기본 디자인"
            },
            {
              "value": "80svh",
              "label": "대안 A"
            },
            {
              "value": "650px",
              "label": "대안 B"
            }
          ]
        },
        "style.250": {
          "label": "box-shadow · .sheet",
          "type": "select",
          "default": "0 35px 150px #1018103b",
          "advanced": true,
          "selector": ".sheet",
          "property": "box-shadow",
          "options": [
            {
              "value": "0 35px 150px #1018103b",
              "label": "기본 디자인"
            },
            {
              "value": "none",
              "label": "대안 A"
            },
            {
              "value": "0 12px 32px #10181055",
              "label": "대안 B"
            }
          ]
        },
        "style.251": {
          "label": "background · .sheet::backdrop",
          "type": "color",
          "default": "#15211585",
          "advanced": true,
          "selector": ".sheet::backdrop",
          "property": "background"
        },
        "style.252": {
          "label": "backdrop-filter · .sheet::backdrop",
          "type": "select",
          "default": "blur(9px)",
          "advanced": true,
          "selector": ".sheet::backdrop",
          "property": "backdrop-filter",
          "options": [
            {
              "value": "blur(9px)",
              "label": "기본 디자인"
            },
            {
              "value": "none",
              "label": "대안 A"
            },
            {
              "value": "blur(4px)",
              "label": "대안 B"
            }
          ]
        },
        "style.254": {
          "label": "margin-bottom · .sheet-top",
          "type": "number",
          "default": 45,
          "advanced": true,
          "selector": ".sheet-top",
          "property": "margin-bottom",
          "min": -600,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.255": {
          "label": "font-size · .sheet-top",
          "type": "number",
          "default": 10,
          "advanced": true,
          "selector": ".sheet-top",
          "property": "font-size",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.256": {
          "label": "letter-spacing · .sheet-top",
          "type": "number",
          "default": 0.1,
          "advanced": true,
          "selector": ".sheet-top",
          "property": "letter-spacing",
          "min": -0.2,
          "max": 0.5,
          "unit": "em",
          "step": 0.005
        },
        "style.257": {
          "label": "width · .close-button",
          "type": "number",
          "default": 40,
          "advanced": true,
          "selector": ".close-button",
          "property": "width",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.258": {
          "label": "height · .close-button",
          "type": "number",
          "default": 40,
          "advanced": true,
          "selector": ".close-button",
          "property": "height",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.259": {
          "label": "font-size · .close-button",
          "type": "number",
          "default": 29,
          "advanced": true,
          "selector": ".close-button",
          "property": "font-size",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.260": {
          "label": "line-height · .close-button",
          "type": "number",
          "default": 1,
          "advanced": true,
          "selector": ".close-button",
          "property": "line-height",
          "min": 0.1,
          "max": 5,
          "step": 0.05,
          "unit": ""
        },
        "style.261": {
          "label": "font-family · .sheet h2",
          "type": "select",
          "default": "'Barlow Condensed',Impact,sans-serif",
          "advanced": true,
          "selector": ".sheet h2",
          "property": "font-family",
          "options": [
            {
              "value": "'Barlow Condensed',Impact,sans-serif",
              "label": "기본 디자인"
            },
            {
              "value": "system-ui,sans-serif",
              "label": "대안 A"
            },
            {
              "value": "Georgia,serif",
              "label": "대안 B"
            }
          ]
        },
        "style.262": {
          "label": "font-size · .sheet h2",
          "type": "select",
          "default": "clamp(40px,5vw,72px)",
          "advanced": true,
          "selector": ".sheet h2",
          "property": "font-size",
          "options": [
            {
              "value": "clamp(40px,5vw,72px)",
              "label": "기본 디자인"
            },
            {
              "value": "clamp(32px,4vw,58px)",
              "label": "대안 A"
            },
            {
              "value": "clamp(48px,6vw,86px)",
              "label": "대안 B"
            }
          ]
        },
        "style.263": {
          "label": "line-height · .sheet h2",
          "type": "number",
          "default": 0.97,
          "advanced": true,
          "selector": ".sheet h2",
          "property": "line-height",
          "min": 0.1,
          "max": 5,
          "step": 0.05,
          "unit": ""
        },
        "style.264": {
          "label": "font-weight · .sheet h2",
          "type": "number",
          "default": 600,
          "advanced": true,
          "selector": ".sheet h2",
          "property": "font-weight",
          "min": 100,
          "max": 900,
          "step": 100,
          "unit": ""
        },
        "style.265": {
          "label": "letter-spacing · .sheet h2",
          "type": "number",
          "default": -0.025,
          "advanced": true,
          "selector": ".sheet h2",
          "property": "letter-spacing",
          "min": -0.2,
          "max": 0.5,
          "unit": "em",
          "step": 0.005
        },
        "style.266": {
          "label": "margin · .sheet h2",
          "type": "select",
          "default": "0 0 20px",
          "advanced": true,
          "selector": ".sheet h2",
          "property": "margin",
          "options": [
            {
              "value": "0 0 20px",
              "label": "기본 디자인"
            },
            {
              "value": "8px 0",
              "label": "대안 A"
            },
            {
              "value": "24px 12px",
              "label": "대안 B"
            }
          ]
        },
        "style.267": {
          "label": "font-size · .sheet-intro",
          "type": "number",
          "default": 14,
          "advanced": true,
          "selector": ".sheet-intro",
          "property": "font-size",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.268": {
          "label": "color · .sheet-intro",
          "type": "color",
          "default": "#687164",
          "advanced": true,
          "selector": ".sheet-intro",
          "property": "color"
        },
        "style.269": {
          "label": "line-height · .sheet-intro",
          "type": "number",
          "default": 1.7,
          "advanced": true,
          "selector": ".sheet-intro",
          "property": "line-height",
          "min": 0.1,
          "max": 5,
          "step": 0.05,
          "unit": ""
        },
        "style.361": {
          "label": "opacity · from",
          "type": "number",
          "default": 0,
          "advanced": true,
          "selector": "from",
          "property": "opacity",
          "min": 0,
          "max": 1,
          "step": 0.01,
          "unit": ""
        },
        "style.362": {
          "label": "transform · from",
          "type": "select",
          "default": "translateY(22px)",
          "advanced": true,
          "selector": "from",
          "property": "transform",
          "options": [
            {
              "value": "translateY(22px)",
              "label": "기본 디자인"
            },
            {
              "value": "translate(0,0) scale(1) rotate(0deg)",
              "label": "대안 A"
            },
            {
              "value": "translateY(-12px) scale(1.05)",
              "label": "대안 B"
            }
          ]
        },
        "style.363": {
          "label": "opacity · to",
          "type": "number",
          "default": 1,
          "advanced": true,
          "selector": "to",
          "property": "opacity",
          "min": 0,
          "max": 1,
          "step": 0.01,
          "unit": ""
        },
        "style.364": {
          "label": "transform · to",
          "type": "select",
          "default": "translateY(0)",
          "advanced": true,
          "selector": "to",
          "property": "transform",
          "options": [
            {
              "value": "translateY(0)",
              "label": "기본 디자인"
            },
            {
              "value": "translate(0,0) scale(1) rotate(0deg)",
              "label": "대안 A"
            },
            {
              "value": "translateY(-12px) scale(1.05)",
              "label": "대안 B"
            }
          ]
        },
        "style.461": {
          "label": "padding · .sheet",
          "type": "number",
          "default": 20,
          "advanced": true,
          "selector": ".sheet",
          "property": "padding",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.462": {
          "label": "width · .sheet",
          "type": "select",
          "default": "calc(100% - 22px)",
          "advanced": true,
          "selector": ".sheet",
          "property": "width",
          "options": [
            {
              "value": "calc(100% - 22px)",
              "label": "기본 디자인"
            },
            {
              "value": "90%",
              "label": "대안 A"
            },
            {
              "value": "600px",
              "label": "대안 B"
            }
          ]
        },
        "style.463": {
          "label": "max-height · .sheet",
          "type": "select",
          "default": "calc(100svh - 22px)",
          "advanced": true,
          "selector": ".sheet",
          "property": "max-height",
          "options": [
            {
              "value": "calc(100svh - 22px)",
              "label": "기본 디자인"
            },
            {
              "value": "80svh",
              "label": "대안 A"
            },
            {
              "value": "650px",
              "label": "대안 B"
            }
          ]
        },
        "style.464": {
          "label": "font-size · .sheet-top",
          "type": "number",
          "default": 8,
          "advanced": true,
          "selector": ".sheet-top",
          "property": "font-size",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.465": {
          "label": "margin-bottom · .sheet-top",
          "type": "number",
          "default": 25,
          "advanced": true,
          "selector": ".sheet-top",
          "property": "margin-bottom",
          "min": -600,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.466": {
          "label": "font-size · .sheet h2",
          "type": "number",
          "default": 45,
          "advanced": true,
          "selector": ".sheet h2",
          "property": "font-size",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.467": {
          "label": "font-size · .sheet-intro",
          "type": "number",
          "default": 13,
          "advanced": true,
          "selector": ".sheet-intro",
          "property": "font-size",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "motion.sheet-in.ms": {
          "label": "패널 등장 시간",
          "type": "number",
          "default": 300,
          "min": 100,
          "max": 60000,
          "step": 100,
          "unit": "ms",
          "motion": true
        },
        "opacity": {
          "label": "불투명도",
          "type": "number",
          "default": 1,
          "min": 0,
          "max": 1,
          "unit": "",
          "step": 0.01
        },
        "motion.sheet-in.delay": {
          "label": "sheet-in · 시작 지연",
          "type": "number",
          "default": 0,
          "min": 0,
          "max": 5000,
          "unit": "ms",
          "step": 10
        },
        "motion.sheet-in.ease": {
          "label": "sheet-in · 속도 변화",
          "type": "select",
          "default": "ease-out",
          "options": [
            {
              "value": "ease-out",
              "label": "부드럽게 끝"
            },
            {
              "value": "linear",
              "label": "일정한 속도"
            },
            {
              "value": "ease-in-out",
              "label": "부드럽게 시작·끝"
            }
          ]
        }
      }
    },
    {
      "id": "about",
      "label": "소개 패널",
      "group": "패널",
      "el": "#about-dialog",
      "params": {
        "visible": {
          "label": "보이기",
          "type": "boolean",
          "default": true,
          "on": "visible",
          "off": "hidden"
        },
        "offset.x": {
          "label": "좌우 이동",
          "type": "number",
          "default": 0,
          "min": -600,
          "max": 600,
          "step": 0.1,
          "unit": "px"
        },
        "offset.y": {
          "label": "상하 이동",
          "type": "number",
          "default": 0,
          "min": -600,
          "max": 600,
          "step": 0.1,
          "unit": "px"
        },
        "scale": {
          "label": "크기 배율",
          "type": "number",
          "default": 1,
          "min": 0.2,
          "max": 3,
          "step": 0.01,
          "unit": ""
        },
        "rotation": {
          "label": "회전",
          "type": "number",
          "default": 0,
          "min": -180,
          "max": 180,
          "step": 1,
          "unit": "deg"
        },
        "title": {
          "label": "소개 제목",
          "type": "text",
          "default": "SERIOUS ABOUT DESIGN.\nPLAYFUL ABOUT LIFE.",
          "text": "#about-title"
        },
        "body": {
          "label": "소개 본문",
          "type": "text",
          "default": "좋은 디자인은 자기만의 표정이 있다고 믿습니다.\n브랜드의 작은 기호부터 화면을 가득 채우는 캐릭터까지.\n조금 다르게 보고, 자유롭게 실험하고, 오래 기억될 경험을 만듭니다.",
          "text": ".about-copy"
        },
        "style.314": {
          "label": "max-width · .about-sheet,.contact-sheet",
          "type": "number",
          "default": 760,
          "advanced": true,
          "selector": ".about-sheet,.contact-sheet",
          "property": "max-width",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.315": {
          "label": "font-size · .about-copy",
          "type": "number",
          "default": 16,
          "advanced": true,
          "selector": ".about-copy",
          "property": "font-size",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.316": {
          "label": "line-height · .about-copy",
          "type": "number",
          "default": 2,
          "advanced": true,
          "selector": ".about-copy",
          "property": "line-height",
          "min": 0.1,
          "max": 5,
          "step": 0.05,
          "unit": ""
        },
        "style.317": {
          "label": "margin · .about-copy",
          "type": "select",
          "default": "30px 0",
          "advanced": true,
          "selector": ".about-copy",
          "property": "margin",
          "options": [
            {
              "value": "30px 0",
              "label": "기본 디자인"
            },
            {
              "value": "8px 0",
              "label": "대안 A"
            },
            {
              "value": "24px 12px",
              "label": "대안 B"
            }
          ]
        },
        "style.318": {
          "label": "gap · .about-meta",
          "type": "number",
          "default": 17,
          "advanced": true,
          "selector": ".about-meta",
          "property": "gap",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.319": {
          "label": "padding-top · .about-meta",
          "type": "number",
          "default": 23,
          "advanced": true,
          "selector": ".about-meta",
          "property": "padding-top",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.320": {
          "label": "font-size · .about-meta",
          "type": "number",
          "default": 10,
          "advanced": true,
          "selector": ".about-meta",
          "property": "font-size",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.321": {
          "label": "font-size · .reference-note",
          "type": "number",
          "default": 12,
          "advanced": true,
          "selector": ".reference-note",
          "property": "font-size",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.322": {
          "label": "line-height · .reference-note",
          "type": "number",
          "default": 1.8,
          "advanced": true,
          "selector": ".reference-note",
          "property": "line-height",
          "min": 0.1,
          "max": 5,
          "step": 0.05,
          "unit": ""
        },
        "style.323": {
          "label": "margin-top · .reference-note",
          "type": "number",
          "default": 40,
          "advanced": true,
          "selector": ".reference-note",
          "property": "margin-top",
          "min": -600,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.324": {
          "label": "font-size · .reference-link",
          "type": "number",
          "default": 12,
          "advanced": true,
          "selector": ".reference-link",
          "property": "font-size",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.325": {
          "label": "text-decoration · .reference-link",
          "type": "select",
          "default": "underline",
          "advanced": true,
          "selector": ".reference-link",
          "property": "text-decoration",
          "options": [
            {
              "value": "underline",
              "label": "기본 디자인"
            },
            {
              "value": "none",
              "label": "대안 A"
            }
          ]
        },
        "style.326": {
          "label": "text-underline-offset · .reference-link",
          "type": "number",
          "default": 4,
          "advanced": true,
          "selector": ".reference-link",
          "property": "text-underline-offset",
          "min": -600,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.474": {
          "label": "font-size · .about-copy",
          "type": "number",
          "default": 14,
          "advanced": true,
          "selector": ".about-copy",
          "property": "font-size",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.475": {
          "label": "font-size · .about-meta",
          "type": "number",
          "default": 9,
          "advanced": true,
          "selector": ".about-meta",
          "property": "font-size",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "opacity": {
          "label": "불투명도",
          "type": "number",
          "default": 1,
          "min": 0,
          "max": 1,
          "step": 0.01,
          "unit": ""
        }
      }
    },
    {
      "id": "cards",
      "label": "작업 카드",
      "group": "패널",
      "el": ".work-grid",
      "params": {
        "visible": {
          "label": "보이기",
          "type": "boolean",
          "default": true,
          "on": "visible",
          "off": "hidden"
        },
        "offset.x": {
          "label": "좌우 이동",
          "type": "number",
          "default": 0,
          "min": -600,
          "max": 600,
          "step": 0.1,
          "unit": "px"
        },
        "offset.y": {
          "label": "상하 이동",
          "type": "number",
          "default": 0,
          "min": -600,
          "max": 600,
          "step": 0.1,
          "unit": "px"
        },
        "scale": {
          "label": "크기 배율",
          "type": "number",
          "default": 1,
          "min": 0.2,
          "max": 3,
          "step": 0.01,
          "unit": ""
        },
        "rotation": {
          "label": "회전",
          "type": "number",
          "default": 0,
          "min": -180,
          "max": 180,
          "step": 1,
          "unit": "deg"
        },
        "style.13": {
          "label": "min-width · .work-entry",
          "type": "number",
          "default": 0,
          "advanced": true,
          "selector": ".work-entry",
          "property": "min-width",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.14": {
          "label": "width · .work-entry>.work-card",
          "type": "number",
          "default": 100,
          "advanced": true,
          "selector": ".work-entry>.work-card",
          "property": "width",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "%"
        },
        "style.15": {
          "label": "gap · .card-actions",
          "type": "number",
          "default": 6,
          "advanced": true,
          "selector": ".card-actions",
          "property": "gap",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.16": {
          "label": "margin-top · .card-actions",
          "type": "number",
          "default": 16,
          "advanced": true,
          "selector": ".card-actions",
          "property": "margin-top",
          "min": -600,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.17": {
          "label": "font-size · .card-actions button",
          "type": "number",
          "default": 11,
          "advanced": true,
          "selector": ".card-actions button",
          "property": "font-size",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.18": {
          "label": "padding · .card-actions button",
          "type": "select",
          "default": "12px 0",
          "advanced": true,
          "selector": ".card-actions button",
          "property": "padding",
          "options": [
            {
              "value": "12px 0",
              "label": "기본 디자인"
            },
            {
              "value": "8px 12px",
              "label": "대안 A"
            },
            {
              "value": "20px 24px",
              "label": "대안 B"
            }
          ]
        },
        "style.19": {
          "label": "min-height · .card-actions button",
          "type": "number",
          "default": 44,
          "advanced": true,
          "selector": ".card-actions button",
          "property": "min-height",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.270": {
          "label": "gap · .work-grid",
          "type": "number",
          "default": 20,
          "advanced": true,
          "selector": ".work-grid",
          "property": "gap",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.271": {
          "label": "margin-top · .work-grid",
          "type": "number",
          "default": 30,
          "advanced": true,
          "selector": ".work-grid",
          "property": "margin-top",
          "min": -600,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.272": {
          "label": "padding · .work-card",
          "type": "number",
          "default": 0,
          "advanced": true,
          "selector": ".work-card",
          "property": "padding",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.273": {
          "label": "aspect-ratio · .poster",
          "type": "select",
          "default": "4/5",
          "advanced": true,
          "selector": ".poster",
          "property": "aspect-ratio",
          "options": [
            {
              "value": "4/5",
              "label": "기본 디자인"
            },
            {
              "value": "1/1",
              "label": "대안 A"
            },
            {
              "value": "3/4",
              "label": "대안 B"
            }
          ]
        },
        "style.274": {
          "label": "padding · .poster",
          "type": "number",
          "default": 23,
          "advanced": true,
          "selector": ".poster",
          "property": "padding",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.275": {
          "label": "transition · .poster",
          "type": "select",
          "default": "transform .3s",
          "advanced": true,
          "selector": ".poster",
          "property": "transition",
          "options": [
            {
              "value": "transform .3s",
              "label": "기본 디자인"
            },
            {
              "value": "none",
              "label": "대안 A"
            },
            {
              "value": "all .4s ease",
              "label": "대안 B"
            }
          ]
        },
        "style.276": {
          "label": "transform · .work-card:hover .poster",
          "type": "select",
          "default": "translateY(-6px)",
          "advanced": true,
          "selector": ".work-card:hover .poster",
          "property": "transform",
          "options": [
            {
              "value": "translateY(-6px)",
              "label": "기본 디자인"
            },
            {
              "value": "translate(0,0) scale(1) rotate(0deg)",
              "label": "대안 A"
            },
            {
              "value": "translateY(-12px) scale(1.05)",
              "label": "대안 B"
            }
          ]
        },
        "style.277": {
          "label": "font-family · .poster strong",
          "type": "select",
          "default": "'Barlow Condensed',Impact,sans-serif",
          "advanced": true,
          "selector": ".poster strong",
          "property": "font-family",
          "options": [
            {
              "value": "'Barlow Condensed',Impact,sans-serif",
              "label": "기본 디자인"
            },
            {
              "value": "system-ui,sans-serif",
              "label": "대안 A"
            },
            {
              "value": "Georgia,serif",
              "label": "대안 B"
            }
          ]
        },
        "style.278": {
          "label": "font-size · .poster strong",
          "type": "select",
          "default": "clamp(30px,4.5vw,61px)",
          "advanced": true,
          "selector": ".poster strong",
          "property": "font-size",
          "options": [
            {
              "value": "clamp(30px,4.5vw,61px)",
              "label": "기본 디자인"
            },
            {
              "value": "clamp(24px,4vw,49px)",
              "label": "대안 A"
            },
            {
              "value": "clamp(36px,5vw,73px)",
              "label": "대안 B"
            }
          ]
        },
        "style.279": {
          "label": "line-height · .poster strong",
          "type": "number",
          "default": 0.95,
          "advanced": true,
          "selector": ".poster strong",
          "property": "line-height",
          "min": 0.1,
          "max": 5,
          "step": 0.05,
          "unit": ""
        },
        "style.280": {
          "label": "font-weight · .poster strong",
          "type": "number",
          "default": 600,
          "advanced": true,
          "selector": ".poster strong",
          "property": "font-weight",
          "min": 100,
          "max": 900,
          "step": 100,
          "unit": ""
        },
        "style.281": {
          "label": "font-size · .poster small",
          "type": "number",
          "default": 8,
          "advanced": true,
          "selector": ".poster small",
          "property": "font-size",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.282": {
          "label": "letter-spacing · .poster small",
          "type": "number",
          "default": 0.05,
          "advanced": true,
          "selector": ".poster small",
          "property": "letter-spacing",
          "min": -0.2,
          "max": 0.5,
          "unit": "em",
          "step": 0.005
        },
        "style.283": {
          "label": "z-index · .poster small",
          "type": "number",
          "default": 1,
          "advanced": true,
          "selector": ".poster small",
          "property": "z-index",
          "min": 0,
          "max": 20,
          "step": 1,
          "unit": ""
        },
        "style.284": {
          "label": "background · .poster-brand",
          "type": "color",
          "default": "#ce483a",
          "advanced": true,
          "selector": ".poster-brand",
          "property": "background"
        },
        "style.285": {
          "label": "color · .poster-brand",
          "type": "color",
          "default": "#ece6d6",
          "advanced": true,
          "selector": ".poster-brand",
          "property": "color"
        },
        "style.286": {
          "label": "font-size · .poster-brand>span",
          "type": "number",
          "default": 54,
          "advanced": true,
          "selector": ".poster-brand>span",
          "property": "font-size",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.287": {
          "label": "font-weight · .poster-brand>span",
          "type": "number",
          "default": 700,
          "advanced": true,
          "selector": ".poster-brand>span",
          "property": "font-weight",
          "min": 100,
          "max": 900,
          "step": 100,
          "unit": ""
        },
        "style.288": {
          "label": "letter-spacing · .poster-brand>span",
          "type": "number",
          "default": -5,
          "advanced": true,
          "selector": ".poster-brand>span",
          "property": "letter-spacing",
          "min": -600,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.289": {
          "label": "background · .poster-digital",
          "type": "color",
          "default": "#222c24",
          "advanced": true,
          "selector": ".poster-digital",
          "property": "background"
        },
        "style.290": {
          "label": "color · .poster-digital",
          "type": "color",
          "default": "#ddec7b",
          "advanced": true,
          "selector": ".poster-digital",
          "property": "color"
        },
        "style.291": {
          "label": "gap · .poster-digital",
          "type": "number",
          "default": 26,
          "advanced": true,
          "selector": ".poster-digital",
          "property": "gap",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.292": {
          "label": "z-index · .poster-digital strong",
          "type": "number",
          "default": 1,
          "advanced": true,
          "selector": ".poster-digital strong",
          "property": "z-index",
          "min": 0,
          "max": 20,
          "step": 1,
          "unit": ""
        },
        "style.293": {
          "label": "font-size · .poster-digital strong span",
          "type": "number",
          "default": 26,
          "advanced": true,
          "selector": ".poster-digital strong span",
          "property": "font-size",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.310": {
          "label": "gap · .card-caption",
          "type": "number",
          "default": 8,
          "advanced": true,
          "selector": ".card-caption",
          "property": "gap",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.311": {
          "label": "margin-top · .card-caption",
          "type": "number",
          "default": 17,
          "advanced": true,
          "selector": ".card-caption",
          "property": "margin-top",
          "min": -600,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.312": {
          "label": "font-size · .card-caption",
          "type": "number",
          "default": 13,
          "advanced": true,
          "selector": ".card-caption",
          "property": "font-size",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.313": {
          "label": "font-size · .card-caption>span",
          "type": "number",
          "default": 11,
          "advanced": true,
          "selector": ".card-caption>span",
          "property": "font-size",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.468": {
          "label": "gap · .work-grid",
          "type": "number",
          "default": 30,
          "advanced": true,
          "selector": ".work-grid",
          "property": "gap",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.469": {
          "label": "aspect-ratio · .poster",
          "type": "number",
          "default": 1.2,
          "advanced": true,
          "selector": ".poster",
          "property": "aspect-ratio",
          "min": 0.1,
          "max": 5,
          "step": 0.05,
          "unit": ""
        },
        "style.470": {
          "label": "font-size · .poster strong",
          "type": "select",
          "default": "clamp(40px,11vw,68px)",
          "advanced": true,
          "selector": ".poster strong",
          "property": "font-size",
          "options": [
            {
              "value": "clamp(40px,11vw,68px)",
              "label": "기본 디자인"
            },
            {
              "value": "clamp(32px,9vw,54px)",
              "label": "대안 A"
            },
            {
              "value": "clamp(48px,13vw,82px)",
              "label": "대안 B"
            }
          ]
        },
        "style.473": {
          "label": "margin-top · .card-caption",
          "type": "number",
          "default": 12,
          "advanced": true,
          "selector": ".card-caption",
          "property": "margin-top",
          "min": -600,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "opacity": {
          "label": "불투명도",
          "type": "number",
          "default": 1,
          "min": 0,
          "max": 1,
          "step": 0.01,
          "unit": ""
        }
      }
    },
    {
      "id": "work",
      "label": "작업 탐색·상세",
      "group": "패널",
      "el": "#work-dialog",
      "params": {
        "visible": {
          "label": "보이기",
          "type": "boolean",
          "default": true,
          "on": "visible",
          "off": "hidden"
        },
        "offset.x": {
          "label": "좌우 이동",
          "type": "number",
          "default": 0,
          "min": -600,
          "max": 600,
          "step": 0.1,
          "unit": "px"
        },
        "offset.y": {
          "label": "상하 이동",
          "type": "number",
          "default": 0,
          "min": -600,
          "max": 600,
          "step": 0.1,
          "unit": "px"
        },
        "scale": {
          "label": "크기 배율",
          "type": "number",
          "default": 1,
          "min": 0.2,
          "max": 3,
          "step": 0.01,
          "unit": ""
        },
        "rotation": {
          "label": "회전",
          "type": "number",
          "default": 0,
          "min": -180,
          "max": 180,
          "step": 1,
          "unit": "deg"
        },
        "title": {
          "label": "작업 모음 제목",
          "type": "text",
          "default": "A SMALL SELECTION.\nA LOT OF PERSONALITY.",
          "text": "#work-title"
        },
        "style.1": {
          "label": "gap · .work-tools",
          "type": "number",
          "default": 14,
          "advanced": true,
          "selector": ".work-tools",
          "property": "gap",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.2": {
          "label": "margin-top · .work-tools",
          "type": "number",
          "default": 26,
          "advanced": true,
          "selector": ".work-tools",
          "property": "margin-top",
          "min": -600,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.3": {
          "label": "font-size · .work-tools label",
          "type": "number",
          "default": 12,
          "advanced": true,
          "selector": ".work-tools label",
          "property": "font-size",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.4": {
          "label": "margin-bottom · .work-tools label",
          "type": "number",
          "default": 8,
          "advanced": true,
          "selector": ".work-tools label",
          "property": "margin-bottom",
          "min": -600,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.5": {
          "label": "width · .work-tools input,.work-tools select",
          "type": "number",
          "default": 100,
          "advanced": true,
          "selector": ".work-tools input,.work-tools select",
          "property": "width",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "%"
        },
        "style.6": {
          "label": "min-width · .work-tools input,.work-tools select",
          "type": "number",
          "default": 0,
          "advanced": true,
          "selector": ".work-tools input,.work-tools select",
          "property": "min-width",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.7": {
          "label": "min-height · .work-tools input,.work-tools select",
          "type": "number",
          "default": 44,
          "advanced": true,
          "selector": ".work-tools input,.work-tools select",
          "property": "min-height",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.8": {
          "label": "padding · .work-tools input,.work-tools select",
          "type": "number",
          "default": 10,
          "advanced": true,
          "selector": ".work-tools input,.work-tools select",
          "property": "padding",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.9": {
          "label": "font-size · .work-tools input,.work-tools select",
          "type": "number",
          "default": 14,
          "advanced": true,
          "selector": ".work-tools input,.work-tools select",
          "property": "font-size",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.10": {
          "label": "font-size · .work-status",
          "type": "number",
          "default": 12,
          "advanced": true,
          "selector": ".work-status",
          "property": "font-size",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.11": {
          "label": "line-height · .work-status",
          "type": "number",
          "default": 1.7,
          "advanced": true,
          "selector": ".work-status",
          "property": "line-height",
          "min": 0.1,
          "max": 5,
          "step": 0.05,
          "unit": ""
        },
        "style.12": {
          "label": "min-height · .work-status",
          "type": "number",
          "default": 20,
          "advanced": true,
          "selector": ".work-status",
          "property": "min-height",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.20": {
          "label": "padding · .work-empty",
          "type": "select",
          "default": "30px 0",
          "advanced": true,
          "selector": ".work-empty",
          "property": "padding",
          "options": [
            {
              "value": "30px 0",
              "label": "기본 디자인"
            },
            {
              "value": "8px 12px",
              "label": "대안 A"
            },
            {
              "value": "20px 24px",
              "label": "대안 B"
            }
          ]
        },
        "style.27": {
          "label": "font-size · .detail-summary",
          "type": "number",
          "default": 19,
          "advanced": true,
          "selector": ".detail-summary",
          "property": "font-size",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.28": {
          "label": "line-height · .detail-summary",
          "type": "number",
          "default": 1.8,
          "advanced": true,
          "selector": ".detail-summary",
          "property": "line-height",
          "min": 0.1,
          "max": 5,
          "step": 0.05,
          "unit": ""
        },
        "style.29": {
          "label": "max-width · .detail-summary",
          "type": "number",
          "default": 650,
          "advanced": true,
          "selector": ".detail-summary",
          "property": "max-width",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.30": {
          "label": "gap · .detail-columns",
          "type": "number",
          "default": 36,
          "advanced": true,
          "selector": ".detail-columns",
          "property": "gap",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.31": {
          "label": "padding · .detail-columns",
          "type": "select",
          "default": "16px 0 30px",
          "advanced": true,
          "selector": ".detail-columns",
          "property": "padding",
          "options": [
            {
              "value": "16px 0 30px",
              "label": "기본 디자인"
            },
            {
              "value": "8px 12px",
              "label": "대안 A"
            },
            {
              "value": "20px 24px",
              "label": "대안 B"
            }
          ]
        },
        "style.32": {
          "label": "font-size · .detail-columns h3",
          "type": "number",
          "default": 14,
          "advanced": true,
          "selector": ".detail-columns h3",
          "property": "font-size",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.33": {
          "label": "margin · .detail-columns h3",
          "type": "select",
          "default": "22px 0 10px",
          "advanced": true,
          "selector": ".detail-columns h3",
          "property": "margin",
          "options": [
            {
              "value": "22px 0 10px",
              "label": "기본 디자인"
            },
            {
              "value": "8px 0",
              "label": "대안 A"
            },
            {
              "value": "24px 12px",
              "label": "대안 B"
            }
          ]
        },
        "style.34": {
          "label": "font-size · .detail-columns p,.detail-columns li",
          "type": "number",
          "default": 14,
          "advanced": true,
          "selector": ".detail-columns p,.detail-columns li",
          "property": "font-size",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.35": {
          "label": "line-height · .detail-columns p,.detail-columns li",
          "type": "number",
          "default": 1.9,
          "advanced": true,
          "selector": ".detail-columns p,.detail-columns li",
          "property": "line-height",
          "min": 0.1,
          "max": 5,
          "step": 0.05,
          "unit": ""
        },
        "style.36": {
          "label": "padding-left · .detail-columns ul",
          "type": "number",
          "default": 20,
          "advanced": true,
          "selector": ".detail-columns ul",
          "property": "padding-left",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.37": {
          "label": "font-size · .detail-columns .study-note",
          "type": "number",
          "default": 12,
          "advanced": true,
          "selector": ".detail-columns .study-note",
          "property": "font-size",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.38": {
          "label": "gap · .detail-actions",
          "type": "number",
          "default": 14,
          "advanced": true,
          "selector": ".detail-actions",
          "property": "gap",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.39": {
          "label": "padding-top · .detail-actions",
          "type": "number",
          "default": 24,
          "advanced": true,
          "selector": ".detail-actions",
          "property": "padding-top",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.47": {
          "label": "font-size · .work-tools input,.work-tools select",
          "type": "number",
          "default": 16,
          "advanced": true,
          "selector": ".work-tools input,.work-tools select",
          "property": "font-size",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.48": {
          "label": "gap · .detail-columns",
          "type": "number",
          "default": 0,
          "advanced": true,
          "selector": ".detail-columns",
          "property": "gap",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.49": {
          "label": "font-size · .detail-summary",
          "type": "number",
          "default": 16,
          "advanced": true,
          "selector": ".detail-summary",
          "property": "font-size",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "opacity": {
          "label": "불투명도",
          "type": "number",
          "default": 1,
          "min": 0,
          "max": 1,
          "step": 0.01,
          "unit": ""
        }
      }
    },
    {
      "id": "contact",
      "label": "프로젝트 메모",
      "group": "패널",
      "el": "#contact-dialog",
      "params": {
        "visible": {
          "label": "보이기",
          "type": "boolean",
          "default": true,
          "on": "visible",
          "off": "hidden"
        },
        "offset.x": {
          "label": "좌우 이동",
          "type": "number",
          "default": 0,
          "min": -600,
          "max": 600,
          "step": 0.1,
          "unit": "px"
        },
        "offset.y": {
          "label": "상하 이동",
          "type": "number",
          "default": 0,
          "min": -600,
          "max": 600,
          "step": 0.1,
          "unit": "px"
        },
        "scale": {
          "label": "크기 배율",
          "type": "number",
          "default": 1,
          "min": 0.2,
          "max": 3,
          "step": 0.01,
          "unit": ""
        },
        "rotation": {
          "label": "회전",
          "type": "number",
          "default": 0,
          "min": -180,
          "max": 180,
          "step": 1,
          "unit": "deg"
        },
        "title": {
          "label": "프로젝트 메모 제목",
          "type": "text",
          "default": "WHAT'S ON\nYOUR MIND?",
          "text": "#contact-title"
        },
        "style.40": {
          "label": "gap · .brief-reference",
          "type": "number",
          "default": 10,
          "advanced": true,
          "selector": ".brief-reference",
          "property": "gap",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.41": {
          "label": "padding · .brief-reference",
          "type": "number",
          "default": 12,
          "advanced": true,
          "selector": ".brief-reference",
          "property": "padding",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.42": {
          "label": "font-size · .brief-reference",
          "type": "number",
          "default": 12,
          "advanced": true,
          "selector": ".brief-reference",
          "property": "font-size",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.43": {
          "label": "font-size · .brief-reference button",
          "type": "number",
          "default": 12,
          "advanced": true,
          "selector": ".brief-reference button",
          "property": "font-size",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.44": {
          "label": "min-height · .brief-reference button",
          "type": "number",
          "default": 44,
          "advanced": true,
          "selector": ".brief-reference button",
          "property": "min-height",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.45": {
          "label": "text-decoration · .brief-reference button",
          "type": "select",
          "default": "underline",
          "advanced": true,
          "selector": ".brief-reference button",
          "property": "text-decoration",
          "options": [
            {
              "value": "underline",
              "label": "기본 디자인"
            },
            {
              "value": "none",
              "label": "대안 A"
            }
          ]
        },
        "style.46": {
          "label": "text-underline-offset · .brief-reference button",
          "type": "number",
          "default": 3,
          "advanced": true,
          "selector": ".brief-reference button",
          "property": "text-underline-offset",
          "min": -600,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.327": {
          "label": "margin-top · form",
          "type": "number",
          "default": 30,
          "advanced": true,
          "selector": "form",
          "property": "margin-top",
          "min": -600,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.328": {
          "label": "font-size · form label",
          "type": "number",
          "default": 14,
          "advanced": true,
          "selector": "form label",
          "property": "font-size",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.329": {
          "label": "margin · form label",
          "type": "select",
          "default": "20px 0 10px",
          "advanced": true,
          "selector": "form label",
          "property": "margin",
          "options": [
            {
              "value": "20px 0 10px",
              "label": "기본 디자인"
            },
            {
              "value": "8px 0",
              "label": "대안 A"
            },
            {
              "value": "24px 12px",
              "label": "대안 B"
            }
          ]
        },
        "style.330": {
          "label": "width · form select,form textarea",
          "type": "number",
          "default": 100,
          "advanced": true,
          "selector": "form select,form textarea",
          "property": "width",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "%"
        },
        "style.331": {
          "label": "border · form select,form textarea",
          "type": "select",
          "default": "1px solid #a5afa1",
          "advanced": true,
          "selector": "form select,form textarea",
          "property": "border",
          "options": [
            {
              "value": "1px solid #a5afa1",
              "label": "기본 디자인"
            },
            {
              "value": "2px solid #202722",
              "label": "대안 A"
            },
            {
              "value": "1px dashed #777e77",
              "label": "대안 B"
            }
          ]
        },
        "style.332": {
          "label": "border-radius · form select,form textarea",
          "type": "number",
          "default": 0,
          "advanced": true,
          "selector": "form select,form textarea",
          "property": "border-radius",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.333": {
          "label": "padding · form select,form textarea",
          "type": "number",
          "default": 13,
          "advanced": true,
          "selector": "form select,form textarea",
          "property": "padding",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.334": {
          "label": "font-size · form select,form textarea",
          "type": "number",
          "default": 16,
          "advanced": true,
          "selector": "form select,form textarea",
          "property": "font-size",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.335": {
          "label": "min-height · form textarea",
          "type": "number",
          "default": 100,
          "advanced": true,
          "selector": "form textarea",
          "property": "min-height",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.336": {
          "label": "font-size · .form-note,#form-status",
          "type": "number",
          "default": 12,
          "advanced": true,
          "selector": ".form-note,#form-status",
          "property": "font-size",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.337": {
          "label": "line-height · .form-note,#form-status",
          "type": "number",
          "default": 1.7,
          "advanced": true,
          "selector": ".form-note,#form-status",
          "property": "line-height",
          "min": 0.1,
          "max": 5,
          "step": 0.05,
          "unit": ""
        },
        "style.338": {
          "label": "margin-bottom · #form-status",
          "type": "number",
          "default": 0,
          "advanced": true,
          "selector": "#form-status",
          "property": "margin-bottom",
          "min": -600,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.342": {
          "label": "gap · .draft-actions",
          "type": "number",
          "default": 16,
          "advanced": true,
          "selector": ".draft-actions",
          "property": "gap",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.343": {
          "label": "font-size · .clear-draft",
          "type": "number",
          "default": 12,
          "advanced": true,
          "selector": ".clear-draft",
          "property": "font-size",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.344": {
          "label": "text-decoration · .clear-draft",
          "type": "select",
          "default": "underline",
          "advanced": true,
          "selector": ".clear-draft",
          "property": "text-decoration",
          "options": [
            {
              "value": "underline",
              "label": "기본 디자인"
            },
            {
              "value": "none",
              "label": "대안 A"
            }
          ]
        },
        "style.345": {
          "label": "text-underline-offset · .clear-draft",
          "type": "number",
          "default": 4,
          "advanced": true,
          "selector": ".clear-draft",
          "property": "text-underline-offset",
          "min": -600,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.346": {
          "label": "padding · .clear-draft",
          "type": "select",
          "default": "12px 4px",
          "advanced": true,
          "selector": ".clear-draft",
          "property": "padding",
          "options": [
            {
              "value": "12px 4px",
              "label": "기본 디자인"
            },
            {
              "value": "8px 12px",
              "label": "대안 A"
            },
            {
              "value": "20px 24px",
              "label": "대안 B"
            }
          ]
        },
        "style.347": {
          "label": "font-size · #draft-status",
          "type": "number",
          "default": 12,
          "advanced": true,
          "selector": "#draft-status",
          "property": "font-size",
          "min": 0,
          "max": 2400,
          "step": 0.1,
          "unit": "px"
        },
        "style.348": {
          "label": "line-height · #draft-status",
          "type": "number",
          "default": 1.7,
          "advanced": true,
          "selector": "#draft-status",
          "property": "line-height",
          "min": 0.1,
          "max": 5,
          "step": 0.05,
          "unit": ""
        },
        "opacity": {
          "label": "불투명도",
          "type": "number",
          "default": 1,
          "min": 0,
          "max": 1,
          "step": 0.01,
          "unit": ""
        }
      }
    }
  ],
  "fixed": [
    {
      "reason": "Grid/flex, semantic hidden states, clipping, stacking contexts, focus indicators and touch targets are structural; responsive CSS conditions preserve layout."
    },
    {
      "reason": "Pause state, reduced-motion overrides, focus rings, layout display/position and list content are functional structure, not visual overrides."
    }
  ],
  "refined": true
};
