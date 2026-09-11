import { useCallback, useEffect, useState } from "react";
import type { Node } from "../schema/story";

const MUTE_KEY = "dawn-store-muted";

export function useAudio(node: Node) {
  const [muted, setMuted] = useState(() => localStorage.getItem(MUTE_KEY) === "true");

  useEffect(() => {
    localStorage.setItem(MUTE_KEY, String(muted));
  }, [muted]);

  const toggleMuted = useCallback(() => setMuted((value) => !value), []);

  const playHover = useCallback(() => {
    if (muted) return;
    // Audio files are intentionally optional in this first static cut.
  }, [muted]);

  const playClick = useCallback(() => {
    if (muted) return;
    // Audio files are intentionally optional in this first static cut.
  }, [muted]);

  return { muted, toggleMuted, playHover, playClick, bgmOn: !muted && node.audio?.bgm !== "off" };
}

