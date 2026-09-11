import { useCallback, useEffect, useRef, useState } from "react";
import type { Node } from "../schema/story";

type CompleteHandler = () => void;

export function usePlayback(node: Node, onComplete: CompleteHandler) {
  const [currentTime, setCurrentTime] = useState(0);
  const [ended, setEnded] = useState(false);
  const [cycles, setCycles] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const clock = useRef({ startedAt: performance.now(), offset: 0 });
  const completeRef = useRef(onComplete);
  completeRef.current = onComplete;

  useEffect(() => {
    setCurrentTime(0);
    setEnded(false);
    setCycles(0);
    clock.current = { startedAt: performance.now(), offset: 0 };
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => undefined);
    }
  }, [node.id]);

  useEffect(() => {
    if (node.media.kind !== "still") return;
    let frame = 0;
    const tick = (now: number) => {
      const elapsed = clock.current.offset + (now - clock.current.startedAt) / 1000;
      if (elapsed >= node.media.duration) {
        if (node.loop) {
          const remainder = elapsed % node.media.duration;
          clock.current = { startedAt: now, offset: remainder };
          setCycles((value) => value + 1);
          setCurrentTime(remainder);
          frame = requestAnimationFrame(tick);
          return;
        }
        setCurrentTime(node.media.duration);
        setEnded(true);
        completeRef.current();
        return;
      }
      setCurrentTime(elapsed);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [node.id, node.media.duration, node.media.kind, node.loop]);

  const seek = useCallback((seconds: number) => {
    const next = Math.max(0, Math.min(node.media.duration, seconds));
    if (node.media.kind === "video" && videoRef.current) {
      videoRef.current.currentTime = next;
      setCurrentTime(next);
      setEnded(false);
      return;
    }
    clock.current = { startedAt: performance.now(), offset: next };
    setCurrentTime(next);
    setEnded(false);
  }, [node.media.duration, node.media.kind]);

  const handleVideoTime = useCallback((time: number) => setCurrentTime(time), []);
  const handleVideoEnded = useCallback(() => {
    if (node.loop && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => undefined);
      setCycles((value) => value + 1);
      return;
    }
    setEnded(true);
    completeRef.current();
  }, [node.loop]);

  return {
    currentTime,
    ended,
    cycles,
    seek,
    videoRef,
    handleVideoTime,
    handleVideoEnded,
  };
}

