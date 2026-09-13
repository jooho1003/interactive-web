import { useCallback, useEffect, useRef } from "react";
import type { Node } from "../schema/story";
import type { Theme } from "../schema/theme";
import type { Preferences } from "../settings/preferences";

export function useAudio(node: Node, audioTheme: Theme["audio"], settings: Preferences, paused: boolean) {
  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const unlockedRef = useRef(false);
  const effectsRef = useRef(new Set<HTMLAudioElement>());
  const bgmEnabled = !settings.muted && !paused && settings.bgmVolume > 0 && node.audio?.bgm !== "off";

  useEffect(() => {
    const bgm = new Audio(audioTheme.bgm.src);
    bgmRef.current = bgm;
    bgm.loop = audioTheme.bgm.loop;
    bgm.preload = "auto";
    return () => { bgm.pause(); bgmRef.current = null; };
  }, [audioTheme.bgm.src, audioTheme.bgm.loop]);

  useEffect(() => {
    const bgm = bgmRef.current;
    if (!bgm) return;
    bgm.volume = audioTheme.bgm.volume * settings.bgmVolume / 100;
    if (bgmEnabled && unlockedRef.current) void bgm.play().catch(() => undefined);
    else bgm.pause();
  }, [audioTheme.bgm, settings.bgmVolume, bgmEnabled, node.id]);

  useEffect(() => {
    const unlock = () => {
      unlockedRef.current = true;
      if (bgmEnabled && bgmRef.current) void bgmRef.current.play().catch(() => undefined);
    };
    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, [bgmEnabled]);

  useEffect(() => {
    for (const sound of effectsRef.current) {
      sound.volume = audioTheme.sfx.volume * settings.sfxVolume / 100;
      if (settings.muted || paused) sound.pause();
    }
    if (settings.muted || paused) effectsRef.current.clear();
  }, [settings.muted, settings.sfxVolume, audioTheme.sfx.volume, paused]);

  useEffect(() => () => {
    for (const sound of effectsRef.current) sound.pause();
    effectsRef.current.clear();
  }, []);

  const playSfx = useCallback((src: string, enabled: boolean) => {
    if (settings.muted || paused || !enabled || settings.sfxVolume === 0) return;
    const sound = new Audio(src);
    effectsRef.current.add(sound);
    const release = () => effectsRef.current.delete(sound);
    sound.addEventListener("ended", release, { once: true });
    sound.addEventListener("error", release, { once: true });
    sound.volume = audioTheme.sfx.volume * settings.sfxVolume / 100;
    void sound.play().catch(release);
  }, [audioTheme.sfx.volume, settings.muted, settings.sfxVolume, paused]);

  const playHover = useCallback(() => playSfx(audioTheme.sfx.hover, audioTheme.sfx.hoverEnabled), [audioTheme.sfx.hover, audioTheme.sfx.hoverEnabled, playSfx]);
  const playClick = useCallback(() => playSfx(audioTheme.sfx.click, audioTheme.sfx.clickEnabled), [audioTheme.sfx.click, audioTheme.sfx.clickEnabled, playSfx]);
  return { playHover, playClick };
}
