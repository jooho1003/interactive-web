import { useEffect, useState } from "react";
import { defaults, readPreferences, savePreferences, type Preferences } from "./preferences";

export function usePreferences(defaultLang: Preferences["lang"], initial: Partial<Preferences> = {}) {
  const [settings, setSettings] = useState<Preferences>(() => {
    try { return { ...readPreferences(window.localStorage, defaultLang), ...initial }; }
    catch { return { ...defaults, lang: defaultLang, ...initial }; }
  });
  const [saved, setSaved] = useState(true);
  useEffect(() => {
    try { setSaved(savePreferences(window.localStorage, settings)); }
    catch { setSaved(false); }
    document.documentElement.lang = settings.lang;
  }, [settings]);
  const update = (patch: Partial<Preferences>) => setSettings((value) => ({ ...value, ...patch }));
  return { settings, update, saved };
}
