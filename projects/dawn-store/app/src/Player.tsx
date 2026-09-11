import { useEffect, useRef, useState } from "react";
import type { Story, Theme } from "./schema";
import { availableEdges, glowEdgeId, preloadEdges } from "./graph/engine";
import { useStoryState } from "./graph/useStoryState";
import { useAudio } from "./audio/useAudio";
import { MediaStage } from "./player/MediaStage";
import { usePlayback } from "./player/usePlayback";
import { Controls } from "./ui/Controls";
import { EndScreen } from "./ui/EndScreen";
import { Footer } from "./ui/Footer";
import { HiddenLink, SkipButton, Subtitle, Timeline } from "./ui/ReadingUi";
import { NavigationUi } from "./ui/NavigationUi";

type Props = { story: Story; theme: Theme; lang: "ko" | "en"; onLangChange: (lang: "ko" | "en") => void };

export function Player({ story, theme, lang, onLangChange }: Props) {
  const { currentNode, flags, nodeMap, navigate, replay } = useStoryState(story);
  const [previousNode, setPreviousNode] = useState<typeof currentNode | null>(null);
  const [activeNodeId, setActiveNodeId] = useState(currentNode.id);
  const audio = useAudio(currentNode, theme.audio);
  const frameRef = useRef<HTMLDivElement>(null);
  const [mediaBounds, setMediaBounds] = useState({ left: 0, top: 0, width: 0, height: 0 });
  const [mobile, setMobile] = useState(false);
  const goTo = (nodeId: string) => {
    setPreviousNode(currentNode);
    audio.playClick();
    navigate(nodeId);
  };
  const onComplete = () => undefined;
  const playback = usePlayback(currentNode, onComplete);
  const visibleEdges = availableEdges(currentNode, nodeMap);
  const glowId = glowEdgeId(currentNode, flags);
  const controlsVisible = currentNode.type !== "ending" && (currentNode.loop ? playback.cycles > 0 : playback.currentTime >= Math.max(0, currentNode.media.duration - currentNode.buttonShowBeforeEnd));
  const hiddenEdge = currentNode.edges.find((edge) => edge.kind === "hidden");

  useEffect(() => {
    if (activeNodeId === currentNode.id) return;
    setActiveNodeId(currentNode.id);
    const timer = window.setTimeout(() => setPreviousNode(null), 450);
    return () => window.clearTimeout(timer);
  }, [activeNodeId, currentNode.id]);

  useEffect(() => preloadEdges(currentNode, nodeMap), [currentNode, nodeMap]);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const update = () => {
      const { width, height } = frame.getBoundingClientRect();
      const mediaWidth = Math.max(width, height * 16 / 9);
      const mediaHeight = Math.max(height, width * 9 / 16);
      setMediaBounds({ left: (width - mediaWidth) / 2, top: (height - mediaHeight) / 2, width: mediaWidth, height: mediaHeight });
      setMobile(width <= theme.breakpoint.mobileMaxWidth);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(frame);
    return () => observer.disconnect();
  }, [theme.breakpoint.mobileMaxWidth]);

  const handleReplay = () => {
    setPreviousNode(currentNode);
    replay();
  };

  return (
    <main className="player-shell">
      <div ref={frameRef} className={`player-frame node-${currentNode.id}`}>
        <MediaStage
          node={currentNode}
          previousNode={previousNode}
          currentTime={playback.currentTime}
          videoRef={playback.videoRef}
          onVideoTime={playback.handleVideoTime}
          onVideoEnded={playback.handleVideoEnded}
        />
        <div className="transition-overlay" aria-hidden="true" />
        <Controls lang={lang} muted={audio.muted} onLangChange={onLangChange} onMute={audio.toggleMuted} />
        {controlsVisible && (
          <NavigationUi
            node={currentNode}
            edges={visibleEdges}
            glowId={glowId}
            lang={lang}
            onNavigate={goTo}
            onHover={audio.playHover}
            mediaBounds={mediaBounds}
          />
        )}
        <Subtitle node={currentNode} lang={lang} currentTime={playback.currentTime} />
        <Timeline node={currentNode} lang={lang} currentTime={playback.currentTime} onSeek={playback.seek} />
        {hiddenEdge?.kind === "hidden" && <HiddenLink edge={hiddenEdge} currentTime={playback.currentTime} onNavigate={goTo} mediaBounds={mediaBounds} mobile={mobile} />}
        <SkipButton node={currentNode} visible={controlsVisible} lang={lang} onSkip={() => playback.seek(currentNode.media.duration)} />
        <Footer story={story} lang={lang} showDisclosure={currentNode.id === story.start} />
        {playback.ended && currentNode.type === "ending" && <EndScreen story={story} lang={lang} onReplay={handleReplay} />}
      </div>
    </main>
  );
}
