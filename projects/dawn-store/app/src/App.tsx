import { useEffect, useState } from "react";
import { applyTheme } from "./theme/applyTheme";
import { loadStoryAndTheme } from "./schema/load";
import type { Story, Theme } from "./schema";
import { Player } from "./Player";

const LANG_KEY = "dawn-store-lang";

export function App() {
  const [data, setData] = useState<{ story: Story; theme: Theme } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState<"ko" | "en">(() => (localStorage.getItem(LANG_KEY) as "ko" | "en") || "ko");

  useEffect(() => {
    loadStoryAndTheme().then((loaded) => {
      applyTheme(loaded.theme);
      setData(loaded);
      setLang((current) => current || loaded.story.meta.defaultLang);
      const updateViewport = () => {
        document.documentElement.dataset.viewport = window.innerWidth <= loaded.theme.breakpoint.mobileMaxWidth ? "mobile" : "desktop";
      };
      updateViewport();
      window.addEventListener("resize", updateViewport);
      return () => window.removeEventListener("resize", updateViewport);
    }).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "작품을 불러오지 못했습니다."));
  }, []);

  const changeLang = (next: "ko" | "en") => {
    setLang(next);
    localStorage.setItem(LANG_KEY, next);
  };

  if (error) return <main className="app-shell error-shell"><p>{error}</p></main>;
  if (!data) return <main className="app-shell"><p className="loading-copy">새벽 세 시 · Still Open</p></main>;
  return <Player story={data.story} theme={data.theme} lang={lang} onLangChange={changeLang} />;
}
