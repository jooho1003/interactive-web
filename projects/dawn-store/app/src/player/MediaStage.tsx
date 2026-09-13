import { useEffect, useState, type RefObject } from "react";
import type { Node } from "../schema/story";

type Props = {
  node: Node;
  previousNode: Node | null;
  currentTime: number;
  videoRef: RefObject<HTMLVideoElement | null>;
  onVideoTime: (time: number) => void;
  onVideoEnded: () => void;
};

function StillImage({ node, currentTime, previous = false }: { node: Node; currentTime: number; previous?: boolean }) {
  const [failed, setFailed] = useState(false);
  const media = node.media.kind === "still" ? node.media : null;
  const progress = media ? Math.min(1, currentTime / media.duration) : 0;
  const from = media?.kenBurns?.from ?? { scale: 1, x: 0, y: 0 };
  const to = media?.kenBurns?.to ?? from;
  const scale = from.scale + (to.scale - from.scale) * progress;
  const x = from.x + (to.x - from.x) * progress;
  const y = from.y + (to.y - from.y) * progress;

  return (
    <div className={`media-layer ${previous ? "media-layer-previous" : "media-layer-current"}`}>
      {failed ? (
        <div className="media-fallback" aria-label={node.title.en}>
          <span>{node.title.ko}</span>
        </div>
      ) : (
        <img
          data-eid="node-media"
          src={node.media.src}
          alt=""
          onError={() => setFailed(true)}
          style={{ transform: `translate(${x}%, ${y}%) scale(${scale})` }}
        />
      )}
    </div>
  );
}

function VideoImage({ node, videoRef, onVideoTime, onVideoEnded }: Omit<Props, "previousNode" | "currentTime">) {
  if (node.media.kind !== "video") return null;
  return (
    <div className="media-layer media-layer-current">
      <video
        ref={videoRef}
        data-eid="node-media"
        src={node.media.src}
        poster={node.media.poster}
        autoPlay
        muted
        playsInline
        onTimeUpdate={(event) => onVideoTime(event.currentTarget.currentTime)}
        onEnded={onVideoEnded}
      />
    </div>
  );
}

export function MediaStage(props: Props) {
  const { node, previousNode, currentTime, videoRef, onVideoTime, onVideoEnded } = props;
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    if (!previousNode) return;
    setTransitioning(false);
    const raf = requestAnimationFrame(() => setTransitioning(true));
    return () => cancelAnimationFrame(raf);
  }, [node.id, previousNode]);

  return (
    <div className={`media-stage ${transitioning ? "is-transitioning" : ""}`} aria-hidden="true">
      <div className="media-canvas">
        {previousNode?.media.kind === "still" && <StillImage node={previousNode} currentTime={previousNode.media.duration} previous />}
        {node.media.kind === "still" ? (
          <StillImage node={node} currentTime={currentTime} />
        ) : (
          <VideoImage node={node} videoRef={videoRef} onVideoTime={onVideoTime} onVideoEnded={onVideoEnded} />
        )}
      </div>
    </div>
  );
}
