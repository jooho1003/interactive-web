import type { Theme } from "../schema/theme";

const unitless = new Set(["opacity", "fontWeight", "lineHeight", "scale", "strokeWidth", "mobileMaxWidth"]);

function kebab(value: string) {
  return value.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

function cssValue(key: string, value: string | number): string {
  if (typeof value === "string") return value;
  if (key.toLowerCase().includes("opacity")) return String(value > 1 ? value / 100 : value);
  if (unitless.has(key)) return String(value);
  if (key.endsWith("Percent") || key === "widthPercent" || key === "bottomPercent" || key === "maxWidthPercent") {
    return `${value}%`;
  }
  if (key.endsWith("Ms")) return `${value}ms`;
  if (key.endsWith("Sec")) return `${value}s`;
  return `${value}px`;
}

function visit(value: unknown, path: string[], set: (name: string, value: string) => void) {
  if (!value || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value)) {
    if (key.startsWith("_")) continue;
    const nextPath = [...path, key];
    if (typeof child === "string" || typeof child === "number") {
      set(`--${nextPath.map(kebab).join("-")}`, cssValue(key, child));
    } else {
      visit(child, nextPath, set);
    }
  }
}

export function applyTheme(theme: Theme) {
  visit(theme, [], (name, value) => document.documentElement.style.setProperty(name, value));
  document.documentElement.style.setProperty("--font-family", theme.font.stack);
  document.documentElement.style.setProperty("--c-accent", theme.colors.accent);
  document.documentElement.style.setProperty("--c-glow", theme.colors.glow);
  document.documentElement.style.setProperty("--c-hotspot", theme.colors.hotspot);
  document.documentElement.style.setProperty("--c-text", theme.colors.text);
  document.documentElement.style.setProperty("--c-text-muted", theme.colors.textMuted);
  document.documentElement.style.setProperty("--c-surface", theme.colors.surface);
  document.documentElement.style.setProperty("--c-border", theme.colors.border);
}
