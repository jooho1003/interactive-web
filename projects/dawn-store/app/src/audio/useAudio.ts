import { useCallback, useEffect, useRef, useState } from "react";
import type { Node } from "../schema/story";
import type { Theme } from "../schema/theme";

const MUTE_KEY = "dawn-store-muted";

export function useAudio(node: Node, audioTheme: Theme["audio"]) {
  const [muted, setMuted] = useState(() => localStorage.getItem(MUTE_KEY) === "true");
  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const unlockedRef = useRef(false);
  const bgmEnabled = !muted && node.audio?.bgm !== "off";

  useEffect(() => {
    localStorage.setItem(MUTE_KEY, String(muted));
  }, [muted]);

  useEffect(() => {
    const bgm = bgmRef.current ?? new Audio(audioTheme.bgm.src);
    bgmRef.current = bgm;
    bgm.loop = audioTheme.bgm.loop;
    bgm.preload = "auto";
    bgm.volume = audioTheme.bgm.volume;
    if (bgmEnabled && unlockedRef.current) {
      void bgm.play().catch(() => undefined);
    } else if (!bgmEnabled) {
      bgm.pause();
    }
  }, [audioTheme.bgm, bgmEnabled, node.id]);

  useEffect(() => () => {
    bgmRef.current?.pause();
    bgmRef.current = null;
  }, []);

  const unlock = useCallback(() => {
    unlockedRef.current = true;
    if (bgmEnabled && bgmRef.current) {
      void bgmRef.current.play().catch(() => undefined);
    }
  }, [bgmEnabled]);

  const playSfx = useCallback((src: string, enabled: boolean) => {
    if (muted || !enabled) return;
    unlock();
    const sound = new Audio(src);
    sound.volume = audioTheme.sfx.volume;
    void sound.play().catch(() => undefined);
  }, [audioTheme.sfx.volume, muted, unlock]);

  const toggleMuted = useCallback(() => setMuted((value) => !value), []);

  const playHover = useCallback(() => playSfx(audioTheme.sfx.hover, audioTheme.sfx.hoverEnabled), [audioTheme.sfx.hover, audioTheme.sfx.hoverEnabled, playSfx]);

  const playClick = useCallback(() => playSfx(audioTheme.sfx.click, audioTheme.sfx.clickEnabled), [audioTheme.sfx.click, audioTheme.sfx.clickEnabled, playSfx]);

  return { muted, toggleMuted, playHover, playClick, bgmOn: bgmEnabled };
}
