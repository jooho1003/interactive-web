import { useEffect, useMemo, useState } from "react";
import { applyTheme } from "./theme/applyTheme";
import { loadStoryAndTheme } from "./schema/load";
import type { Lang, Story, Theme } from "./schema";
import { Player } from "./Player";
import { applyCustomization, defaultCustomization, mergeCustomization, readCustomization, saveCustomization, type DawnCustomization, type DawnCustomizationPatch } from "./settings/customization";
import { CinematicPrelude } from "./ui/CinematicPrelude";

export function App() {
  const [baseData, setBaseData] = useState<{ story: Story; theme: Theme } | null>(null);
  const [customization, setCustomization] = useState<DawnCustomization>(() => {
    try { return readCustomization(window.localStorage); }
    catch { return readCustomization({ getItem: () => null }); }
  });
  const [preludeChoice, setPreludeChoice] = useState<{ lang: Lang; muted?: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const data = useMemo(() => baseData ? applyCustomization(baseData.story, baseData.theme, customization) : null, [baseData, customization]);

  useEffect(() => {
    let cancelled = false;
    let cleanup = () => {};
    loadStoryAndTheme().then((loaded) => {
      if (cancelled) return;
      setBaseData(loaded);
      const updateViewport = () => {
        document.documentElement.dataset.viewport = window.innerWidth <= loaded.theme.breakpoint.mobileMaxWidth ? "mobile" : "desktop";
      };
      updateViewport();
      window.addEventListener("resize", updateViewport);
      cleanup = () => window.removeEventListener("resize", updateViewport);
    }).catch((reason: unknown) => { if (!cancelled) setError(reason instanceof Error ? reason.message : "작품을 불러오지 못했습니다."); });
    return () => { cancelled = true; cleanup(); };
  }, []);

  useEffect(() => {
    if (data) applyTheme(data.theme);
  }, [data]);

  const updateCustomization = (patch: DawnCustomizationPatch) => {
    setCustomization((current) => {
      const next = mergeCustomization(current, patch);
      try { saveCustomization(window.localStorage, next); } catch { /* The current visit still uses the draft. */ }
      return next;
    });
  };
  const resetCustomization = () => {
    const next = structuredClone(defaultCustomization);
    try { saveCustomization(window.localStorage, next); } catch { /* The current visit still uses the reset draft. */ }
    setCustomization(next);
  };

  if (error) return <main className="app-shell error-shell"><p>{error}</p></main>;
  if (!data) return <main className="app-shell"><p className="loading-copy">새벽 세 시 · Still Open</p></main>;
  if (!preludeChoice) {
    return <CinematicPrelude story={data.story} onEnter={(lang, muted) => setPreludeChoice({ lang, muted })} />;
  }
  return <Player story={data.story} theme={data.theme} customization={customization} initialLang={preludeChoice.lang} initialMuted={preludeChoice.muted} onCustomizationChange={updateCustomization} onCustomizationReset={resetCustomization} />;
}
