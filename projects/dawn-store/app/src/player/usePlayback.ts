import { useCallback, useEffect, useRef, useState } from "react";
import type { Node } from "../schema/story";

export function usePlayback(node: Node, onComplete: () => void, paused = false) {
  const [currentTime, setCurrentTime] = useState(0);
  const [ended, setEnded] = useState(false);
  const [cycles, setCycles] = useState(0);
  const [seekVersion, setSeekVersion] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const clock = useRef(0);
  const completeRef = useRef(onComplete);
  completeRef.current = onComplete;

  useEffect(() => {
    clock.current = 0;
    setCurrentTime(0);
    setEnded(false);
    setCycles(0);
    if (videoRef.current) videoRef.current.currentTime = 0;
  }, [node.id]);

  useEffect(() => {
    const video = videoRef.current;
    if (node.media.kind !== "video" || !video) return;
    if (paused) video.pause();
    else if (video.currentTime < node.media.duration) void video.play().catch(() => undefined);
    return () => video.pause();
  }, [node.id, node.media.kind, node.media.duration, paused, seekVersion]);

  useEffect(() => {
    if (node.media.kind !== "still" || paused) return;
    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      clock.current += (now - last) / 1000;
      last = now;
      if (clock.current >= node.media.duration) {
        if (node.loop) {
          const count = Math.floor(clock.current / node.media.duration);
          clock.current %= node.media.duration;
          setCycles((value) => value + count);
        } else {
          clock.current = node.media.duration;
          setCurrentTime(clock.current);
          setEnded(true);
          completeRef.current();
          return;
        }
      }
      setCurrentTime(clock.current);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [node.id, node.media.duration, node.media.kind, node.loop, paused, seekVersion]);

  const seek = useCallback((seconds: number) => {
    if (!Number.isFinite(seconds)) return;
    const next = Math.max(0, Math.min(node.media.duration, seconds));
    clock.current = next;
    if (node.media.kind === "video" && videoRef.current) videoRef.current.currentTime = next;
    setCurrentTime(next);
    setEnded(!node.loop && next >= node.media.duration);
    setSeekVersion((value) => value + 1);
  }, [node.media.duration, node.media.kind, node.loop]);

  const replay = useCallback(() => {
    clock.current = 0;
    if (videoRef.current) videoRef.current.currentTime = 0;
    setCurrentTime(0);
    setEnded(false);
    setCycles(0);
    setSeekVersion((value) => value + 1);
  }, []);

  const handleVideoTime = useCallback((time: number) => setCurrentTime(time), []);
  const handleVideoEnded = useCallback(() => {
    if (node.loop && videoRef.current) {
      videoRef.current.currentTime = 0;
      if (!paused) void videoRef.current.play().catch(() => undefined);
      setCycles((value) => value + 1);
      return;
    }
    setEnded(true);
    completeRef.current();
  }, [node.loop, paused]);

  return { currentTime, ended, cycles, seek, replay, videoRef, handleVideoTime, handleVideoEnded };
}
