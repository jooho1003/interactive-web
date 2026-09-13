import { z } from "zod";

export const preferencesSchema = z.object({
  version: z.literal(1),
  lang: z.enum(["ko", "en"]),
  muted: z.boolean(),
  bgmVolume: z.number().min(0).max(100),
  sfxVolume: z.number().min(0).max(100),
  subtitles: z.boolean(),
  subtitleSize: z.enum(["normal", "large"]),
  motion: z.enum(["system", "reduce", "full"]),
}).strict();

export type Preferences = z.infer<typeof preferencesSchema>;
export const SETTINGS_KEY = "dawn-store-preferences-v1";
export const MAX_SETTINGS_BYTES = 8192;
export const defaults: Preferences = {
  version: 1, lang: "ko", muted: false, bgmVolume: 100, sfxVolume: 100,
  subtitles: true, subtitleSize: "normal", motion: "system",
};
export const presets = {
  standard: { ...defaults },
  reading: { ...defaults, subtitleSize: "large", motion: "reduce", bgmVolume: 40 },
  quiet: { ...defaults, muted: true, motion: "reduce" },
} satisfies Record<string, Preferences>;
export type Preset = keyof typeof presets;

export function parsePreferences(text: string): Preferences {
  if (new TextEncoder().encode(text).length > MAX_SETTINGS_BYTES) throw new Error("Settings file is too large");
  return preferencesSchema.parse(JSON.parse(text));
}

type StorageReader = Pick<Storage, "getItem">;
export function readPreferences(storage: StorageReader, lang: Preferences["lang"]): Preferences {
  const fallback = { ...defaults, lang };
  try {
    const saved = storage.getItem(SETTINGS_KEY);
    if (saved) {
      try { return parsePreferences(saved); } catch { /* Recover legacy choices below. */ }
    }
    const oldLang = storage.getItem("dawn-store-lang");
    return { ...fallback, lang: oldLang === "ko" || oldLang === "en" ? oldLang : lang,
      muted: storage.getItem("dawn-store-muted") === "true" };
  } catch { return fallback; }
}

export function savePreferences(storage: Pick<Storage, "setItem">, settings: Preferences): boolean {
  try { storage.setItem(SETTINGS_KEY, JSON.stringify(preferencesSchema.parse(settings))); return true; }
  catch { return false; }
}
