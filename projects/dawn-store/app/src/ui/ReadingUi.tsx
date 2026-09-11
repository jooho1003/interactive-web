import type { CSSProperties } from "react";
import type { HiddenEdge, Lang, Node } from "../schema/story";
import { parseTimecode } from "../graph/time";

export function Subtitle({ node, lang, currentTime }: { node: Node; lang: Lang; currentTime: number }) {
  const cue = (node.subtitles?.[lang] ?? []).find((item) => currentTime >= parseTimecode(item.start) && currentTime < parseTimecode(item.end));
  if (!cue) return null;
  return <p className="subtitle" data-eid="subtitle">{cue.text}</p>;
}

type TimelineProps = { node: Node; lang: Lang; currentTime: number; onSeek: (seconds: number) => void };

export function Timeline({ node, lang, currentTime, onSeek }: TimelineProps) {
  if (!node.timeline) return null;
  return (
    <div className="timeline" aria-label="챕터 타임라인">
      <div className="timeline-track"><span style={{ width: `${(currentTime / node.media.duration) * 100}%` }} /></div>
      {node.timeline.chapters.map((chapter) => {
        const at = parseTimecode(chapter.at);
        const active = currentTime >= at;
        return (
          <button key={chapter.at} className={`timeline-point ${active ? "is-active" : ""}`} style={{ left: `${(at / node.media.duration) * 100}%` }} onClick={() => onSeek(at)} type="button">
            <span>{chapter.title[lang]}</span>
          </button>
        );
      })}
    </div>
  );
}

export function HiddenLink({ edge, currentTime, onNavigate, mediaBounds, mobile }: { edge: HiddenEdge; currentTime: number; onNavigate: (to: string) => void; mediaBounds: { left: number; top: number; width: number; height: number }; mobile: boolean }) {
  const active = currentTime >= parseTimecode(edge.from) && currentTime <= parseTimecode(edge.until);
  if (!active) return null;
  const box = mobile ? edge.box.mobile : edge.box.desktop;
  const style: CSSProperties = {
    left: mediaBounds.left + mediaBounds.width * box.x / 100,
    top: mediaBounds.top + mediaBounds.height * box.y / 100,
    width: mediaBounds.width * box.w / 100,
    height: mediaBounds.height * box.h / 100,
  };
  return (
    <button
      className={`hidden-link ${edge.previewEnabled ? "is-preview" : ""}`}
      style={style}
      onClick={() => onNavigate(edge.to)}
      type="button"
      aria-label="히든 링크"
    />
  );
}

export function SkipButton({ node, visible, lang, onSkip }: { node: Node; visible: boolean; lang: Lang; onSkip: () => void }) {
  if (!node.skippable || !visible) return null;
  return <button className="skip-button" onClick={onSkip} type="button">{lang === "ko" ? "건너뛰기" : "Skip"}</button>;
}
