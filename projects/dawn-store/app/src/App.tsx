import { useEffect, useState } from "react";
import { applyTheme } from "./theme/applyTheme";
import { loadStoryAndTheme } from "./schema/load";
import type { Story, Theme } from "./schema";
import { Player } from "./Player";

export function App() {
  const [data, setData] = useState<{ story: Story; theme: Theme } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let cleanup = () => {};
    loadStoryAndTheme().then((loaded) => {
      if (cancelled) return;
      applyTheme(loaded.theme);
      setData(loaded);
      const updateViewport = () => {
        document.documentElement.dataset.viewport = window.innerWidth <= loaded.theme.breakpoint.mobileMaxWidth ? "mobile" : "desktop";
      };
      updateViewport();
      window.addEventListener("resize", updateViewport);
      cleanup = () => window.removeEventListener("resize", updateViewport);
    }).catch((reason: unknown) => { if (!cancelled) setError(reason instanceof Error ? reason.message : "작품을 불러오지 못했습니다."); });
    return () => { cancelled = true; cleanup(); };
  }, []);

  if (error) return <main className="app-shell error-shell"><p>{error}</p></main>;
  if (!data) return <main className="app-shell"><p className="loading-copy">새벽 세 시 · Still Open</p></main>;
  return <Player story={data.story} theme={data.theme} />;
}
