import type { Story } from "../schema/story";
import type { Theme } from "../schema/theme";

export const CUSTOMIZATION_KEY = "dawn-store-customization-v1";

export type DawnCustomization = {
  version: 1;
  meta: {
    titleKo: string;
    titleEn: string;
    subtitleKo: string;
    subtitleEn: string;
  };
  images: Record<string, string>;
  colors: {
    accent: string;
    glow: string;
    hotspot: string;
    text: string;
    textMuted: string;
    endingBackground: string;
    menuText: string;
    subtitle: string;
  };
  font: { stack: string };
  layout: {
    controlsTop: number;
    controlsLeft: number;
    menuBottom: number;
    subtitleBottom: number;
    timelineTop: number;
    skipTop: number;
    skipRight: number;
    footerBottom: number;
  };
  audio: { bgmSrc: string; loop: boolean };
};
export type DawnCustomizationPatch = {
  version?: 1;
  meta?: Partial<DawnCustomization["meta"]>;
  images?: Record<string, string>;
  colors?: Partial<DawnCustomization["colors"]>;
  font?: Partial<DawnCustomization["font"]>;
  layout?: Partial<DawnCustomization["layout"]>;
  audio?: Partial<DawnCustomization["audio"]>;
};

export const defaultCustomization: DawnCustomization = {
  version: 1,
  meta: { titleKo: "", titleEn: "", subtitleKo: "", subtitleEn: "" },
  images: {},
  colors: {
    accent: "#f3c614",
    glow: "#ef4444",
    hotspot: "#ffae00",
    text: "#ffffff",
    textMuted: "#b8b8b8",
    endingBackground: "#000000",
    menuText: "#ffffff",
    subtitle: "#f3c614",
  },
  font: { stack: "'Noto Sans KR', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
  layout: { controlsTop: 24, controlsLeft: 24, menuBottom: 30, subtitleBottom: 15, timelineTop: 32, skipTop: 24, skipRight: 24, footerBottom: 16 },
  audio: { bgmSrc: "", loop: false },
};

const hex = (value: unknown, fallback: string) => typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value) ? value : fallback;
const number = (value: unknown, fallback: number, min: number, max: number) => typeof value === "number" && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;
const text = (value: unknown, fallback: string, max: number) => typeof value === "string" ? value.slice(0, max) : fallback;
const media = (value: unknown) => {
  if (typeof value !== "string" || value.length > 4_000_000) return "";
  if (/^data:image\/(?:png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(value)) return value;
  if (/^data:audio\/(?:mpeg|mp3|wav|ogg|mp4|aac|webm);base64,[A-Za-z0-9+/=]+$/.test(value)) return value;
  return "";
};
const fontStack = (value: unknown) => {
  if (typeof value !== "string" || !value.trim() || value.length > 240) return defaultCustomization.font.stack;
  return /^[\w\s,'".-]+$/.test(value) ? value : defaultCustomization.font.stack;
};

export function cleanCustomization(value: unknown): DawnCustomization {
  const input = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const meta = input.meta && typeof input.meta === "object" ? input.meta as Record<string, unknown> : {};
  const colors = input.colors && typeof input.colors === "object" ? input.colors as Record<string, unknown> : {};
  const layout = input.layout && typeof input.layout === "object" ? input.layout as Record<string, unknown> : {};
  const audio = input.audio && typeof input.audio === "object" ? input.audio as Record<string, unknown> : {};
  const images: Record<string, string> = {};
  if (input.images && typeof input.images === "object") {
    for (const [id, value] of Object.entries(input.images)) {
      const next = media(value);
      if (next) images[id] = next;
    }
  }
  return {
    version: 1,
    meta: {
      titleKo: text(meta.titleKo, "", 80), titleEn: text(meta.titleEn, "", 80),
      subtitleKo: text(meta.subtitleKo, "", 120), subtitleEn: text(meta.subtitleEn, "", 120),
    },
    images,
    colors: {
      accent: hex(colors.accent, defaultCustomization.colors.accent), glow: hex(colors.glow, defaultCustomization.colors.glow),
      hotspot: hex(colors.hotspot, defaultCustomization.colors.hotspot), text: hex(colors.text, defaultCustomization.colors.text),
      textMuted: hex(colors.textMuted, defaultCustomization.colors.textMuted), endingBackground: hex(colors.endingBackground, defaultCustomization.colors.endingBackground),
      menuText: hex(colors.menuText, defaultCustomization.colors.menuText), subtitle: hex(colors.subtitle, defaultCustomization.colors.subtitle),
    },
    font: { stack: fontStack((input.font as Record<string, unknown> | undefined)?.stack) },
    layout: {
      controlsTop: number(layout.controlsTop, 24, 0, 160), controlsLeft: number(layout.controlsLeft, 24, 0, 240),
      menuBottom: number(layout.menuBottom, 30, 8, 70), subtitleBottom: number(layout.subtitleBottom, 15, 5, 45),
      timelineTop: number(layout.timelineTop, 32, 0, 180), skipTop: number(layout.skipTop, 24, 0, 180),
      skipRight: number(layout.skipRight, 24, 0, 240), footerBottom: number(layout.footerBottom, 16, 0, 120),
    },
    audio: { bgmSrc: media(audio.bgmSrc), loop: audio.loop === true },
  };
}

export function readCustomization(storage: Pick<Storage, "getItem">): DawnCustomization {
  try {
    const raw = storage.getItem(CUSTOMIZATION_KEY);
    return raw ? cleanCustomization(JSON.parse(raw)) : cleanCustomization(defaultCustomization);
  } catch {
    return cleanCustomization(defaultCustomization);
  }
}

export function saveCustomization(storage: Pick<Storage, "setItem">, value: DawnCustomization): boolean {
  try { storage.setItem(CUSTOMIZATION_KEY, JSON.stringify(cleanCustomization(value))); return true; }
  catch { return false; }
}

function setResponsive(theme: Theme, section: "menu" | "subtitle" | "timeline" | "footer", key: string, value: number) {
  theme[section].desktop[key] = value;
  theme[section].mobile[key] = value;
}
function setPosition(theme: Theme, section: "langToggle" | "timeline" | "skip", mode: "desktop" | "mobile", key: string, value: number) {
  const target = theme[section] as unknown as { desktop: { position: Record<string, unknown> }; mobile: { position: Record<string, unknown> } };
  target[mode].position[key] = value;
}

export function applyCustomization(story: Story, theme: Theme, customization: DawnCustomization) {
  const nextStory = structuredClone(story);
  const nextTheme = structuredClone(theme);
  const c = cleanCustomization(customization);
  if (c.meta.titleKo) nextStory.meta.title.ko = c.meta.titleKo;
  if (c.meta.titleEn) nextStory.meta.title.en = c.meta.titleEn;
  if (c.meta.subtitleKo) nextStory.meta.subtitle.ko = c.meta.subtitleKo;
  if (c.meta.subtitleEn) nextStory.meta.subtitle.en = c.meta.subtitleEn;
  for (const node of nextStory.nodes) {
    const image = c.images[node.id];
    if (image && node.media.kind === "still") node.media.src = image;
  }
  Object.assign(nextTheme.colors, {
    accent: c.colors.accent, glow: c.colors.glow, hotspot: c.colors.hotspot,
    text: c.colors.text, textMuted: c.colors.textMuted, endingBackground: c.colors.endingBackground,
  });
  nextTheme.font.stack = c.font.stack;
  nextTheme.font.family = c.font.stack.split(",")[0].replace(/[\s'\"]/g, "").trim() || nextTheme.font.family;
  nextTheme.menu.desktop.color = c.colors.menuText; nextTheme.menu.mobile.color = c.colors.menuText;
  nextTheme.subtitle.desktop.color = c.colors.subtitle; nextTheme.subtitle.mobile.color = c.colors.subtitle;
  setPosition(nextTheme, "langToggle", "desktop", "top", c.layout.controlsTop); setPosition(nextTheme, "langToggle", "mobile", "top", Math.round(c.layout.controlsTop * .7));
  setPosition(nextTheme, "langToggle", "desktop", "left", c.layout.controlsLeft); setPosition(nextTheme, "langToggle", "mobile", "left", Math.round(c.layout.controlsLeft * .7));
  setResponsive(nextTheme, "menu", "bottomPercent", c.layout.menuBottom);
  setResponsive(nextTheme, "subtitle", "bottomPercent", c.layout.subtitleBottom);
  setPosition(nextTheme, "timeline", "desktop", "top", c.layout.timelineTop); setPosition(nextTheme, "timeline", "mobile", "top", Math.round(c.layout.timelineTop * 1.7));
  setPosition(nextTheme, "skip", "desktop", "top", c.layout.skipTop); setPosition(nextTheme, "skip", "mobile", "top", Math.round(c.layout.skipTop * .7));
  setPosition(nextTheme, "skip", "desktop", "right", c.layout.skipRight); setPosition(nextTheme, "skip", "mobile", "right", Math.round(c.layout.skipRight * .7));
  nextTheme.footer.desktop.bottom = c.layout.footerBottom; nextTheme.footer.mobile.bottom = Math.max(8, Math.round(c.layout.footerBottom * .75));
  if (c.audio.bgmSrc) nextTheme.audio.bgm.src = c.audio.bgmSrc;
  nextTheme.audio.bgm.loop = c.audio.loop;
  return { story: nextStory, theme: nextTheme };
}

export function mergeCustomization(current: DawnCustomization, patch: DawnCustomizationPatch): DawnCustomization {
  return cleanCustomization({ ...current, ...patch,
    meta: { ...current.meta, ...patch.meta }, images: { ...current.images, ...patch.images },
    colors: { ...current.colors, ...patch.colors }, font: { ...current.font, ...patch.font },
    layout: { ...current.layout, ...patch.layout }, audio: { ...current.audio, ...patch.audio },
  });
}
